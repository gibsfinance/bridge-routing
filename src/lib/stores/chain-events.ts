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
import { tick } from 'svelte'

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

// export const block = derived<[Readable<PublicClient | null>], null | Block>(
//   [destinationPublicClient],
//   ([$destinationPublicClient], set) => {
//     if (!$destinationPublicClient) {
//       set(null)
//       return
//     }
//     let decremented = false
//     const decrement = () => {
//       if (decremented) return
//       decremented = true
//       loading.decrement('gas')
//     }
//     loading.increment('gas')
//     const cleanup = $destinationPublicClient.watchBlocks({
//       emitOnBegin: true,
//       onBlock: async (block: Block) => {
//         set(block)
//         decrement()
//       },
//       onError: (err: Error) => {
//         console.log('err during block collection', err)
//         decrement()
//         set(null)
//       },
//     })
//     return () => {
//       cleanup()
//       decrement()
//     }
//   },
//   null,
// )

// /** the block.baseFeePerGas on the latest block */
// export const latestBaseFeePerGas = derived(
//   [block, destinationPublicClient],
//   ([$block, $destinationPublicClient], set) => {
//     if (!$block) {
//       set(0n)
//       return
//     }
//     let perGas = $block.baseFeePerGas
//     let cancelled = false
//     if (!perGas) {
//       const minWei = 3_000_000_000n
//       perGas = minWei
//       $destinationPublicClient
//         .getGasPrice()
//         .catch(() => 0n)
//         .then((result) => {
//           if (cancelled) {
//             return
//           }
//           if (result < minWei) {
//             result = minWei
//           }
//           set(result)
//         })
//     } else {
//       set(perGas)
//     }
//     return () => {
//       cancelled = true
//     }
//   },
//   0n,
// )

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
  set(null)
  return loading.loadsAfterTick('balance', getBalance, set)
}

export const watchTokenBalance = (
  chainId: Readable<Chains>,
  tokenStore: Readable<Token | TokenOut | null>,
  ticker: Readable<unknown>, // usually a block
) =>
  derived(
    [walletAccount, chainId, tokenStore, ticker, input.unwrap],
    ([$walletAccount, $chainId, $asset, $ticker], set) => {
      if (!$ticker || !$asset || !$walletAccount || $walletAccount === zeroAddress) {
        set(null)
        return () => {}
      }
      if (!$asset.address) {
        set(null)
        return () => {}
      }
      const $a = $asset as Token
      const unwatch = getTokenBalance($chainId, $a, $walletAccount, set)
      return () => {
        unwatch()
      }
    },
    null as bigint | null,
  )

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
  const args = [assetInAddress]
  const mappings = await links({
    chainId: fromChain,
    target: bridgePathway.from,
    address: assetInAddress,
  })
  let [
    foreignTokenAddress, // bridgedTokenAddress
    nativeTokenAddress,
  ] = mappings

  if (foreignTokenAddress !== zeroAddress) {
    const mappings = await links({
      chainId: toChain,
      target: bridgePathway.to,
      address: assetInAddress,
    })
    foreignTokenAddress = mappings[0]
    nativeTokenAddress = args[0]
    if (nativeTokenAddress === assetInAddress) {
      return {
        originationChainId: fromChain,
        toForeign: {
          foreign: foreignTokenAddress,
          home: assetInAddress,
        },
      }
    }
  } else if (nativeTokenAddress !== zeroAddress) {
    return {
      originationChainId: toChain,
      toHome: {
        foreign: nativeTokenAddress,
        home: assetInAddress,
      },
    }
  }
  // we know that the token has not been bridged in the reverse direction. it has only gone from home -> foreign
  // in any case, let's verify it first
  const homeToForeignMappings = await links({
    chainId: toChain,
    target: bridgePathway.to,
    address: assetInAddress,
  })

  foreignTokenAddress = homeToForeignMappings[0]
  nativeTokenAddress = homeToForeignMappings[1]
  if (foreignTokenAddress !== zeroAddress) {
    return {
      originationChainId: fromChain,
      toForeign: {
        foreign: foreignTokenAddress,
        home: assetInAddress,
      },
    }
  } else if (nativeTokenAddress !== zeroAddress) {
    return {
      originationChainId: toChain,
      toHome: {
        foreign: nativeTokenAddress,
        home: assetInAddress,
      },
    }
  }
  // the token has not been bridged yet
  return {
    originationChainId: fromChain,
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

const checkApproval = async ([$walletAccount, $bridgeAddress, $assetLink, $publicClient]: [
  Hex | undefined,
  Hex,
  null | TokenBridgeInfo,
  PublicClient,
]) => {
  if (!$walletAccount) {
    return 0n
  }
  if (!$assetLink || $assetLink.toHome) {
    // irrelevant because bridge minted the tokens
    return 0n
  }
  const token = getContract({
    abi: erc20Abi,
    address: $assetLink.toForeign!.home!,
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
    let cancelled = false
    const cleanup = () => {
      cancelled = true
    }
    tick()
      .then(async () => {
        if (cancelled) return
        const approval = await checkApproval([
          $walletAccount,
          $bridgeAddress,
          $assetLink,
          $publicClient,
        ])
        if (cancelled) return
        set(approval)
      })
      .catch(console.error)
      .then(cleanup)
    return cleanup
  },
  0n,
)
