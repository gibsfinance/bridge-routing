import * as input from './input.svelte'
import { multicallRead } from '$lib/utils.svelte'
import * as abis from './abis'
import { type PublicClient, type Block, getContract, erc20Abi, type Hex, zeroAddress } from 'viem'
import { loading, type Cleanup } from './loading.svelte'
import { Chains } from './auth/types'
import { NullableProxyStore, type Token } from '$lib/types.svelte'
import { chainsMetadata } from './auth/constants'
import { nativeAssetOut, pathway } from './config.svelte'
import { SvelteMap } from 'svelte/reactivity'
import * as rpcs from './rpcs.svelte'
import _ from 'lodash'
import { untrack } from 'svelte'

const watchFinalizedBlocksForSingleChain = (chainId: Chains, onBlock: (block: Block) => void) => {
  const client = input.clientFromChain(chainId)
  return client.watchBlocks({
    blockTag: 'finalized',
    emitOnBegin: true,
    onBlock,
  })
}

export const finalizedBlocks = new SvelteMap<Chains, bigint | null>()

export const watchFinalizedBlocks = () =>
  Object.keys(chainsMetadata)
    .filter((chain) => rpcs.store.get(chain as Chains))
    .map((chain) => {
      const chainId = chain as Chains
      return watchFinalizedBlocksForSingleChain(chainId, (v) => {
        finalizedBlocks.set(chainId, v.number)
      })
    })

export const unwatchFinalizedBlocks = (cleanups: Cleanup[]) => {
  cleanups.forEach((cleanup) => cleanup())
}

export class ChainState {
  private value: Block | null = $state(null)
  private bridgeKey: input.BridgeKey | null = $state(null)
  constructor(private index: 1 | 2) {}
  get publicClient() {
    return input.clientFromChain(this.bridgeKey![this.index])
  }
  set(block: Block | null) {
    this.value = block
  }
  get block() {
    return this.value
  }
  latestBaseFeePerGas = $derived.by(() => {
    const perGas = this.block?.baseFeePerGas
    if (!perGas) {
      // on bsc the numbers are fairly fixed
      return 3_000_000_000n
    } else {
      return perGas
    }
  })
  watch(bridgeKey: input.BridgeKey) {
    this.set(null)
    this.bridgeKey = bridgeKey
    untrack(() => loading.increment('gas'))
    let decremented = false
    const cleanup = this.publicClient.watchBlocks({
      emitOnBegin: true,
      onBlock: (block) => {
        if (!decremented) {
          decremented = true
          untrack(() => loading.decrement('gas'))
        }
        this.set(block)
      },
    })
    return () => {
      if (!decremented) {
        decremented = true
        untrack(() => loading.decrement('gas'))
      }
      cleanup()
    }
  }
}

export const origination = new ChainState(1)
export const destination = new ChainState(2)

export const getTokenBalance = ($chainId: Chains, asset: Token | null, walletAccount: Hex) => {
  if (!asset) return null
  const publicClient = input.clientFromChain($chainId)
  const getBalance =
    asset.address === zeroAddress
      ? () => publicClient.getBalance({ address: walletAccount })
      : () =>
          getContract({
            address: asset.address,
            abi: erc20Abi,
            client: publicClient,
          })
            .read.balanceOf([walletAccount])
            .catch(() => 0n)
  return loading.loadsAfterTick<bigint | null>(`balance-${$chainId}`, getBalance)()
}

// this is not the optimal way to do this, but these watchers
// should only be used for a heavily constrained set of cases
// the cases are being cleared on a regular interval
const balanceTTL = 1000 * 60 * 20
const balanceCache = new Map<string, { time: number; value: bigint | null }>()
export class TokenBalanceWatcher {
  private balanceCleanup: Cleanup | null = null
  private chainId: Chains | null = null
  private token: Token | null = null
  private walletAccount: Hex | null = null
  value = $state<bigint | null>(null)
  private clearLongtailBalances() {
    const now = Date.now()
    for (const [key, value] of balanceCache.entries()) {
      if (now - value.time > balanceTTL || balanceCache.size >= 100) {
        balanceCache.delete(key)
      }
    }
  }
  cleanup() {
    if (!this.balanceCleanup) return
    this.balanceCleanup?.()
    this.balanceCleanup = null
    this.chainId = null
    this.token = null
    this.walletAccount = null
    this.clearLongtailBalances()
  }

  get key() {
    return `${this.chainId}-${this.walletAccount}-${this.token?.address}`.toLowerCase()
  }

  fetch(chainId: Chains, token: Token, walletAccount: Hex, ticker: Block) {
    this.cleanup()
    this.chainId = chainId
    this.token = token
    this.walletAccount = walletAccount
    // call this function whenever a new block is ticked over
    if (!ticker || !token) return
    const requestResult = getTokenBalance(chainId, token, walletAccount)
    if (!requestResult) {
      return
    }
    this.balanceCleanup = requestResult.cleanup
    requestResult.promise.then((v) => {
      if (requestResult.controller.signal.aborted) {
        this.value = null
        return
      }
      this.clearLongtailBalances()
      balanceCache.set(this.key, { time: Date.now(), value: v })
      this.value = v
    })
  }
}

export const fromTokenBalance = new TokenBalanceWatcher()
export const toTokenBalance = new TokenBalanceWatcher()
// export const watchTokenBalance = (
//   chainId: Chains,
//   tokenStore: Token | TokenOut | null,
//   ticker: unknown, // usually a block
//   isDestination = false,
// ) => {
//   let balanceCache = new Map<
//     string,
//     {
//       time: number
//       value: bigint | null
//     }
//   >()
//   const balanceTTL = 1000 * 60 * 20
//   setInterval(
//     () => {
//       balanceCache.forEach((v, k) => {
//         if (Date.now() - v.time > balanceTTL) {
//           balanceCache.delete(k)
//         }
//       })
//     },
//     1000 * 60 * 5,
//   )

//   return derived(
//     [walletAccount, chainId, tokenStore, ticker, input.unwrap, input.bridgeKey],
//     ([$walletAccount, $chainId, $asset, $ticker, $unwrap], set) => {
//       if (!$ticker || !$asset || !$walletAccount || $walletAccount === zeroAddress) {
//         set(null)
//         return () => {}
//       }
//       if (!$asset.address) {
//         set(null)
//         return () => {}
//       }
//       const $a = $asset as Token
//       const token =
//         isDestination && $asset.address === nativeAssetOut[$chainId] && $unwrap
//           ? {
//               ...$a,
//               address: zeroAddress,
//             }
//           : $a
//       const key = `${$chainId}-${$walletAccount}-${token.address}`
//       if (!balanceCache.has(key)) {
//         balanceCache = new Map()
//         set(null)
//       }
//       let cancelled = false
//       const unwatch = getTokenBalance($chainId, token, $walletAccount, (v) => {
//         if (cancelled) return
//         balanceCache.set(key, { time: Date.now(), value: v })
//         set(v)
//       })
//       return () => {
//         cancelled = true
//         unwatch()
//       }
//     },
//     null as bigint | null,
//   )
// }

export class MinBridgeAmount {
  private val: bigint | null = $state(null)
  get value() {
    return this.val
  }
  set value(v: bigint | null) {
    this.val = v
  }

  fetch(bridgeKey: input.BridgeKeyStore, assetIn: Token) {
    // these clients should already be created, so we should not be doing any harm by accessing them
    const pathway = bridgeKey.pathway
    if (!pathway || !assetIn) return
    this.value = null
    const result = loading.loadsAfterTick<bigint>('min-amount', () => {
      const fromPublicClient = input.clientFromChain(bridgeKey.fromChain)
      const toPublicClient = input.clientFromChain(bridgeKey.toChain)
      const publicClient = pathway?.feeManager === 'from' ? fromPublicClient : toPublicClient
      return publicClient.readContract({
        abi: abis.inputBridge,
        functionName: 'minPerTx',
        args: [assetIn.address],
        address: pathway[pathway.feeManager],
      })
    })()
    result.promise.then((v) => {
      if (result.controller.signal.aborted) return
      this.value = v
    })
    return result.cleanup
  }
}
export const minAmount = new MinBridgeAmount()

// export const minAmount = derived(
//   [input.bridgePathway, input.fromPublicClient, input.toPublicClient, input.assetIn],
//   ([$bridgePathway, $fromPublicClient, $toPublicClient, assetIn], set) => {
//     if (!$bridgePathway || !assetIn) {
//       set(0n)
//       return
//     }
//     let cancelled = false
//     const publicClient = $bridgePathway.feeManager === 'from' ? $fromPublicClient : $toPublicClient
//     publicClient
//       .readContract({
//         abi: abis.inputBridge,
//         functionName: 'minPerTx',
//         args: [assetIn.address],
//         address: $bridgePathway[$bridgePathway.feeManager],
//       })
//       .then((res) => {
//         if (cancelled) return
//         set(res)
//       })
//     return () => {
//       cancelled = true
//     }
//   },
//   0n,
// )

const links = _.memoize(
  async ({ chainId, target, address }: { chainId: Chains; target: Hex; address: Hex }) => {
    return multicallRead<Hex[]>({
      client: input.clientFromChain(chainId),
      chain: chainsMetadata[chainId],
      abi: abis.inputBridge,
      target,
      calls: [
        { functionName: 'bridgedTokenAddress', args: [address] },
        { functionName: 'nativeTokenAddress', args: [address] },
        // { functionName: 'homeTokenAddress', args: [address] },
        // { functionName: 'foreignTokenAddress', args: [address] },
      ],
    })
  },
  ({ chainId, target, address }) => `${chainId}-${target}-${address}`.toLowerCase(),
)

export const tokenLinks = _.memoize(
  async ({ chainId, target, address }: { chainId: Chains; target: Hex; address: Hex }) => {
    return multicallRead<[Hex, Hex]>({
      client: input.clientFromChain(chainId),
      chain: chainsMetadata[chainId],
      abi: abis.inputBridge,
      target,
      calls: [
        { functionName: 'homeTokenAddress', args: [address] },
        { functionName: 'foreignTokenAddress', args: [address] },
      ],
    })
  },
  ({ chainId, target, address }) => `${chainId}-${target}-${address}`.toLowerCase(),
)

export type TokenBridgeInfo = {
  originationChainId: Chains
  assetInAddress: Hex
  assetOutAddress: Hex | null
  toForeign?: {
    home: Hex
    foreign: Hex | null
  }
  toHome?: {
    home: Hex | null
    foreign: Hex
  }
}

export const tokenBridgeInfo = async (
  bridgeKey: input.BridgeKey,
  assetIn: Token | null,
): Promise<null | TokenBridgeInfo> => {
  const bridgePathway = pathway(bridgeKey)
  if (!assetIn || !bridgePathway) {
    return null
  }
  const [, fromChain, toChain] = bridgeKey
  const assetInAddress =
    assetIn.address === zeroAddress ? nativeAssetOut[fromChain] : assetIn.address
  // const args = bridgePathway.toHome
  //   ? {
  //       chainId: toChain,
  //       target: bridgePathway.to,
  //       address: assetInAddress,
  //     }
  //   : {
  //       chainId: fromChain,
  //       target: bridgePathway.from,
  //       address: assetInAddress,
  //   }
  // if (bridgePathway.toHome) {

  // } else {

  // }
  // const links = await tokenLinks(args)
  // console.log(links)
  const [toMappings, fromMappings] = await Promise.all([
    links({
      chainId: toChain,
      target: bridgePathway.to,
      address: assetInAddress,
    }),
    links({
      chainId: fromChain,
      target: bridgePathway.from,
      address: assetInAddress,
    }),
  ])
  const [toBridged, toNative] = toMappings
  // const notGas = !Object.values(nativeAssetOut).find(
  //   (v) => v.toLowerCase() === assetInAddress.toLowerCase(),
  // )
  if (toBridged !== zeroAddress) {
    // if (notGas) console.log('toBridged')
    return {
      originationChainId: fromChain,
      assetInAddress,
      assetOutAddress: toBridged,
      toForeign: {
        foreign: toBridged,
        home: assetInAddress,
      },
    }
  }
  if (toNative !== zeroAddress) {
    // if (notGas) console.log('toNative')
    return {
      originationChainId: toChain,
      assetInAddress,
      assetOutAddress: toNative,
      toHome: {
        home: toNative,
        foreign: assetInAddress,
      },
    }
  }
  const [fromBridged, fromNative] = fromMappings
  if (fromNative !== zeroAddress) {
    // if (notGas) console.log('fromNative')
    return {
      originationChainId: toChain,
      assetInAddress,
      assetOutAddress: fromNative,
      toHome: {
        home: assetInAddress,
        foreign: fromNative,
      },
    }
  }
  if (fromBridged !== zeroAddress) {
    // if (notGas) console.log('fromBridged')
    return {
      originationChainId: fromChain,
      assetInAddress,
      assetOutAddress: fromBridged,
      toForeign: {
        foreign: fromBridged,
        home: assetInAddress,
      },
    }
  }
  // the token has not been bridged yet
  return {
    originationChainId: toChain,
    assetInAddress,
    assetOutAddress: null,
    ...(bridgePathway.toHome
      ? {
          toHome: {
            foreign: assetInAddress,
            home: null,
          },
        }
      : {
          toForeign: {
            foreign: null,
            home: assetInAddress,
          },
        }),
  }
}

export const assetLink = new NullableProxyStore<TokenBridgeInfo>()
export const loadAssetLink = loading.loadsAfterTick<TokenBridgeInfo>(
  'token',
  ({ bridgeKey, assetIn }: { bridgeKey: input.BridgeKey; assetIn: Token | null }) =>
    tokenBridgeInfo(bridgeKey, assetIn),
)
// export const assetLink = derived<Stores, null | TokenBridgeInfo>(
//   [input.bridgeKey, input.assetIn],
//   ([bridgeKey, assetIn], set) => {
//     set(null)
//     if (!assetIn) {
//       return noop
//     }
//     return loading.loadsAfterTick('token', () => tokenBridgeInfo([bridgeKey, assetIn]), set)
//   },
// )

export const tokenOriginationChainId = (assetLink: TokenBridgeInfo | null) => {
  return assetLink?.originationChainId
}
//   derived<Stores, Chains | undefined>(
//   [assetLink],
//   ([$assetLink]) => {
//     return $assetLink?.originationChainId
//   },
// )

const checkApproval = async ([walletAccount, $bridgeAddress, address, publicClient]: [
  Hex | undefined,
  Hex,
  Hex,
  PublicClient,
]) => {
  if (!walletAccount) {
    return 0n
  }
  const token = getContract({
    abi: erc20Abi,
    address,
    client: publicClient,
  })
  const allowance = await token.read.allowance([walletAccount, $bridgeAddress])
  return allowance
}

export const loadApproval = loading.loadsAfterTick<bigint>(
  'approval',
  ({
    walletAccount,
    bridgeKey,
    assetLink,
    publicClient,
  }: {
    walletAccount: Hex | undefined
    bridgeKey: input.BridgeKey
    assetLink: TokenBridgeInfo | null
    publicClient: PublicClient
  }) => {
    if (!bridgeKey || !assetLink || !walletAccount) {
      return 0n
    }
    const bridgeAddress = pathway(bridgeKey)!.from
    return checkApproval([walletAccount, bridgeAddress, assetLink.assetInAddress, publicClient])
  },
)
// export const approval = derived(
//   [
//     walletAccount,
//     input.bridgeKey,
//     assetLink,
//     input.fromPublicClient,
//     input.forcedRefresh,
//     origination.block,
//   ],
//   ([$walletAccount, bridgeKey, $assetLink, publicClient], set) => {
//     if (!bridgeKey || !$assetLink || !$walletAccount) {
//       return
//     }
//     const $bridgeAddress = pathway(bridgeKey)!.from
//     return loading.loadsAfterTick(
//       'approval',
//       async () =>
//         checkApproval([$walletAccount, $bridgeAddress, $assetLink.assetInAddress, publicClient]),
//       set,
//     )
//   },
//   0n,
// )
