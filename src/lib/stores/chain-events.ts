import * as input from './input'
import { multicallRead } from '$lib/utils'
import * as abis from './abis'
import { type PublicClient, type Block, getContract, erc20Abi, type Hex, zeroAddress } from 'viem'
import { derived, type Readable, type Stores } from 'svelte/store'
import { loading } from './loading'
import { walletAccount } from './auth/store'
import { Chains } from './auth/types'
import type { Token, TokenOut } from '$lib/types'
import { chainsMetadata } from './auth/constants'
import { nativeAssetOut, pathway } from './config'
import _ from 'lodash'

export const destinationPublicClient = derived(
  [input.bridgeKey, input.forcedRefresh],
  ([$bridgeKey]) => $bridgeKey && input.clientFromChain($bridgeKey[2]),
)

type ChainState = {
  publicClient: Readable<PublicClient | null>
  block: Readable<null | Block>
  latestBaseFeePerGas: Readable<bigint>
}

const createChainState = (index: 1 | 2) => {
  const publicClient = derived(
    [input.bridgeKey, input.forcedRefresh],
    ([$bridgeKey]) => $bridgeKey && input.clientFromChain($bridgeKey[index]),
  )
  const block = derived<[Readable<PublicClient | null>], null | Block>(
    [publicClient],
    ([$publicClient], set) => {
      if (!$publicClient) {
        set(null)
        return
      }
      let decremented = false
      const decrement = () => {
        if (decremented) return
        decremented = true
        loading.decrement('gas')
      }
      loading.increment('gas')
      const cleanup = $publicClient.watchBlocks({
        emitOnBegin: true,
        onBlock: async (block: Block) => {
          set(block)
          decrement()
        },
        onError: (err: Error) => {
          console.log('err during block collection', err)
          decrement()
          set(null)
        },
      })
      return () => {
        cleanup()
        decrement()
      }
    },
    null,
  )
  return {
    publicClient,
    block,
    latestBaseFeePerGas: derived(
      [block, publicClient],
      ([$block, $publicClient], set) => {
        if (!$block) {
          set(0n)
          return
        }
        let perGas = $block.baseFeePerGas
        let cancelled = false
        if (!perGas) {
          const minWei = 3_000_000_000n
          perGas = minWei
          $publicClient
            .getGasPrice()
            .catch(() => 0n)
            .then((result) => {
              if (cancelled) {
                return
              }
              if (result < minWei) {
                result = minWei
              }
              set(result)
            })
        } else {
          set(perGas)
        }
        return () => {
          cancelled = true
        }
      },
      0n,
    ),
  } as ChainState
}

export const origination = createChainState(1)
export const destination = createChainState(2)

export const getTokenBalance = (
  $chainId: Chains,
  $asset: Token,
  $walletAccount: Hex,
  set: (v: bigint | null) => void,
) => {
  const $publicClient = input.clientFromChain($chainId)
  const getBalance =
    $asset.address === zeroAddress
      ? () => $publicClient.getBalance({ address: $walletAccount })
      : () =>
          getContract({
            address: $asset.address,
            abi: erc20Abi,
            client: $publicClient,
          }).read.balanceOf([$walletAccount])
  return loading.loadsAfterTick(`balance-${$chainId}`, getBalance, set)
}

export const watchTokenBalance = (
  chainId: Readable<Chains>,
  tokenStore: Readable<Token | TokenOut | null>,
  ticker: Readable<unknown>, // usually a block
  isDestination = false,
) => {
  let balanceCache = new Map<
    string,
    {
      time: number
      value: bigint | null
    }
  >()
  const balanceTTL = 1000 * 60 * 20
  setInterval(
    () => {
      balanceCache.forEach((v, k) => {
        if (Date.now() - v.time > balanceTTL) {
          balanceCache.delete(k)
        }
      })
    },
    1000 * 60 * 5,
  )

  return derived(
    [walletAccount, input.bridgeKey, chainId, tokenStore, ticker, input.unwrap],
    ([$walletAccount, $bridgeKey, $chainId, $asset, $ticker, $unwrap], set) => {
      if (!$ticker || !$asset || !$walletAccount || $walletAccount === zeroAddress) {
        set(null)
        return () => {}
      }
      if (!$asset.address) {
        set(null)
        return () => {}
      }
      const $a = $asset as Token
      const token =
        isDestination && $asset.address === nativeAssetOut[$chainId] && $unwrap
          ? {
              ...$a,
              address: zeroAddress,
            }
          : $a
      const key = `${$chainId}-${$walletAccount}-${token.address}`
      if (!balanceCache.has(key)) {
        balanceCache = new Map()
        set(null)
      }
      let cancelled = false
      const unwatch = getTokenBalance($chainId, token, $walletAccount, (v) => {
        if (cancelled) return
        balanceCache.set(key, { time: Date.now(), value: v })
        set(v)
      })
      return () => {
        cancelled = true
        unwatch()
      }
    },
    null as bigint | null,
  )
}

export const minAmount = derived(
  [input.bridgePathway, input.fromPublicClient, input.toPublicClient, input.assetIn],
  ([$bridgePathway, $fromPublicClient, $toPublicClient, $assetIn], set) => {
    if (!$bridgePathway || !$assetIn) {
      set(0n)
      return
    }
    let cancelled = false
    const $publicClient = $bridgePathway.feeManager === 'from' ? $fromPublicClient : $toPublicClient
    $publicClient
      .readContract({
        abi: abis.inputBridge,
        functionName: 'minPerTx',
        args: [$assetIn.address],
        address: $bridgePathway[$bridgePathway.feeManager],
      })
      .then((res) => {
        if (cancelled) return
        set(res)
      })
    return () => {
      cancelled = true
    }
  },
  0n,
)

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
      ],
    })
  },
  ({ chainId, target, address }) => `${chainId}-${target}-${address}`.toLowerCase(),
)

export const tokenBridgeInfo = async ([$bridgeKey, $assetIn]: [
  input.BridgeKey,
  Token | null,
]): Promise<null | {
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
}> => {
  const bridgePathway = pathway($bridgeKey)
  if (!$assetIn || !bridgePathway) {
    return null
  }
  const [, fromChain, toChain] = $bridgeKey
  const assetInAddress =
    $assetIn.address === zeroAddress ? nativeAssetOut[fromChain] : $assetIn.address
  // const args = [assetInAddress]
  const fromMappings = await links({
    chainId: fromChain,
    target: bridgePathway.from,
    address: assetInAddress,
  })
  let [bridgedTokenAddress, nativeTokenAddress] = fromMappings

  if (bridgedTokenAddress !== zeroAddress) {
    return {
      originationChainId: fromChain,
      assetInAddress,
      assetOutAddress: bridgedTokenAddress,
      toForeign: {
        foreign: assetInAddress,
        home: bridgedTokenAddress,
      },
    }
  } else if (nativeTokenAddress !== zeroAddress) {
    return {
      originationChainId: toChain,
      assetInAddress,
      assetOutAddress: nativeTokenAddress,
      toHome: {
        foreign: nativeTokenAddress,
        home: assetInAddress,
      },
    }
  }
  // we know that the token has not been bridged in the reverse direction. it has only gone from home -> foreign
  // in any case, let's verify it first
  const toMappings = await links({
    chainId: toChain,
    target: bridgePathway.to,
    address: assetInAddress,
  })

  bridgedTokenAddress = toMappings[0]
  nativeTokenAddress = toMappings[1]
  if (bridgedTokenAddress !== zeroAddress) {
    return {
      originationChainId: fromChain,
      assetInAddress,
      assetOutAddress: bridgedTokenAddress,
      toHome: {
        foreign: assetInAddress,
        home: bridgedTokenAddress,
      },
    }
  } else if (nativeTokenAddress !== zeroAddress) {
    return {
      originationChainId: toChain,
      assetInAddress,
      assetOutAddress: nativeTokenAddress,
      toHome: {
        foreign: nativeTokenAddress,
        home: assetInAddress,
      },
    }
  }
  // the token has not been bridged yet
  return {
    originationChainId: toChain,
    assetInAddress,
    assetOutAddress: null,
    ...(fromChain === Chains.PLS || fromChain === Chains.V4PLS
      ? {
          toForeign: {
            foreign: null,
            home: assetInAddress,
          },
        }
      : {
          toHome: {
            foreign: assetInAddress,
            home: null,
          },
        }),
  }
}

export type TokenBridgeInfo = Awaited<ReturnType<typeof tokenBridgeInfo>>

export const assetLink = derived<Stores, null | TokenBridgeInfo>(
  [input.bridgeKey, input.assetIn],
  ([$bridgeKey, $assetIn], set) => {
    set(null)
    if (!$assetIn) {
      return _.noop
    }
    return loading.loadsAfterTick('token', () => tokenBridgeInfo([$bridgeKey, $assetIn]), set)
  },
)

export const tokenOriginationChainId = derived<Stores, Chains | undefined>(
  [assetLink],
  ([$assetLink]) => {
    return $assetLink?.originationChainId
  },
)

const checkApproval = async ([$walletAccount, $bridgeAddress, address, $publicClient]: [
  Hex | undefined,
  Hex,
  Hex,
  PublicClient,
]) => {
  if (!$walletAccount) {
    return 0n
  }
  const token = getContract({
    abi: erc20Abi,
    address,
    client: $publicClient,
  })
  const allowance = await token.read.allowance([$walletAccount, $bridgeAddress])
  return allowance
}

export const approval = derived(
  [
    walletAccount,
    input.bridgeKey,
    assetLink,
    input.fromPublicClient,
    input.forcedRefresh,
    origination.block,
  ],
  ([$walletAccount, $bridgeKey, $assetLink, $publicClient], set) => {
    if (!$bridgeKey || !$assetLink || !$walletAccount) {
      return
    }
    const $bridgeAddress = pathway($bridgeKey)!.from
    return loading.loadsAfterTick(
      'approval',
      async () =>
        checkApproval([$walletAccount, $bridgeAddress, $assetLink.assetInAddress, $publicClient]),
      set,
    )
  },
  0n,
)
