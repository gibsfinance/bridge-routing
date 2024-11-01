import * as input from './input'
import { multicallRead } from '$lib/utils'
import * as abis from './abis'
import {
  type PublicClient,
  type Block,
  getContract,
  erc20Abi,
  type Hex,
  zeroAddress,
  type WatchContractEventReturnType,
  getAddress,
} from 'viem'
import { derived, type Readable } from 'svelte/store'
import { loading } from './loading'
import { walletAccount } from './auth/store'
import { Chains } from './auth/types'
import type { Token } from '$lib/types'
import { chainsMetadata } from './auth/constants'
import { pathway } from './config'
import { asyncDerived } from '@square/svelte-store'

export const destinationPublicClient = derived(
  [input.bridgeKey, input.forcedRefresh],
  ([$bridgeKey]) => $bridgeKey && input.clientFromChain($bridgeKey[2]),
)

export const block = derived<[Readable<PublicClient | null>], null | Block>(
  [destinationPublicClient],
  ([$destinationPublicClient], set) => {
    if (!$destinationPublicClient) {
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
    const cleanup = $destinationPublicClient.watchBlocks({
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

/** the block.baseFeePerGas on the latest block */
export const latestBaseFeePerGas = derived(
  [block, destinationPublicClient],
  ([$block, $destinationPublicClient], set) => {
    if (!$block) {
      set(0n)
      return
    }
    let perGas = $block.baseFeePerGas
    let cancelled = false
    if (!perGas) {
      const minWei = 3_000_000_000n
      perGas = minWei
      $destinationPublicClient
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
)

export const getTokenBalance = (
  $chainId: Chains,
  $asset: Token,
  $walletAccount: Hex,
  set: (v: bigint | null) => void,
) => {
  let cancelled = false
  const $publicClient = input.clientFromChain($chainId)
  loading.increment('balance')
  if ($asset.address === zeroAddress) {
    const getNativeBalance = async () => {
      const balance = await $publicClient.getBalance({
        address: $walletAccount,
      })
      if (cancelled) return
      loading.decrement('balance')
      set(balance)
    }
    getNativeBalance().catch(console.error)
    return () => {
      if (cancelled) return
      cancelled = true
      loading.decrement('balance')
    }
  }
  const token = getContract({
    address: $asset.address,
    abi: erc20Abi,
    client: $publicClient,
  })
  const getBalance = async () => {
    const balance = await token.read.balanceOf([$walletAccount])
    if (cancelled) return
    loading.decrement('balance')
    set(balance)
  }
  getBalance().catch(console.error)
  return () => {
    if (cancelled) return
    cancelled = true
    loading.decrement('balance')
  }
}

export const watchTokenBalance = (chainId: Readable<Chains>, tokenStore: Readable<Token | null>) =>
  derived(
    [walletAccount, chainId, tokenStore, input.unwrap, block],
    ([$walletAccount, $chainId, $asset, $unwrap, $block], set) => {
      set(null)
      if (!$block || !$asset || !$walletAccount || $walletAccount === zeroAddress) {
        return () => {}
      }
      const unwatch = getTokenBalance($chainId, $asset, $walletAccount, set)
      return () => {
        unwatch()
      }
    },
    null as bigint | null,
  )

export const minAmount = derived(
  [input.bridgePathway, input.fromPublicClient, input.assetIn],
  ([$bridgePathway, $publicClient, $assetIn], set) => {
    if (!$bridgePathway || !$assetIn) {
      set(0n)
      return
    }
    let cancelled = false
    // console.log($bridgePathway.from, $publicClient.chain!.id)
    $publicClient
      .readContract({
        abi: abis.inputBridge,
        functionName: 'minPerTx',
        args: [$assetIn.address],
        address: $bridgePathway.from,
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

export const tokenBridgeInfo = async ([$bridgeKey, $assetIn]: [input.BridgeKey, Token | null]): Promise<null | {
  originationChainId: Chains
  toForeign?: {
    home: Hex
    foreign?: Hex
  }
  toHome?: {
    home: Hex
    foreign: Hex
  }
}> => {
  const bridgePathway = pathway($bridgeKey)
  if (!$assetIn || !bridgePathway) {
    return null
  }
  const [, fromChain, toChain] = $bridgeKey
  const args = [$assetIn.address]
  const mappings = await multicallRead<Hex[]>({
    client: input.clientFromChain(fromChain),
    chain: chainsMetadata[fromChain],
    abi: abis.inputBridge,
    target: bridgePathway.from,
    calls: [
      { functionName: 'bridgedTokenAddress', args },
      { functionName: 'nativeTokenAddress', args },
    ],
  })
  let [
    foreignTokenAddress, // bridgedTokenAddress
    nativeTokenAddress,
  ] = mappings

  if (foreignTokenAddress !== zeroAddress) {
    // if we are here, then we know that we are dealing with a native
    // address, so we need to go to the foreign chain
    // console.log(bridgePathway)
    const mappings = await multicallRead<Hex[]>({
      client: input.clientFromChain(toChain),
      chain: chainsMetadata[toChain],
      abi: abis.inputBridge,
      target: bridgePathway.to,
      calls: [
        { functionName: 'bridgedTokenAddress', args },
        { functionName: 'nativeTokenAddress', args },
      ],
    })
    foreignTokenAddress = mappings[0]
    nativeTokenAddress = args[0]
    if (nativeTokenAddress === $assetIn.address) {
      return {
        originationChainId: fromChain,
        toForeign: {
          foreign: foreignTokenAddress,
          home: $assetIn.address,
        },
      }
    }
  } else if (nativeTokenAddress !== zeroAddress) {
    return {
      originationChainId: toChain,
      toHome: {
        foreign: nativeTokenAddress,
        home: $assetIn.address,
      },
    }
  }
  // we know that the token has not been bridged in the reverse direction. it has only gone from home -> foreign
  // in any case, let's verify it first
  const homeToForeignMappings = await multicallRead<Hex[]>({
    client: input.clientFromChain(toChain),
    chain: chainsMetadata[toChain],
    abi: abis.inputBridge,
    target: bridgePathway.to,
    calls: [
      { functionName: 'bridgedTokenAddress', args },
      { functionName: 'nativeTokenAddress', args },
    ],
  })

  foreignTokenAddress = homeToForeignMappings[0]
  nativeTokenAddress = homeToForeignMappings[1]

  if (foreignTokenAddress !== zeroAddress) {
    foreignTokenAddress = mappings[0]
    nativeTokenAddress = args[0]
    if (nativeTokenAddress === $assetIn.address) {
      return {
        originationChainId: fromChain,
        toForeign: {
          foreign: foreignTokenAddress,
          home: $assetIn.address,
        },
      }
    }
  } else if (nativeTokenAddress !== zeroAddress) {
    return {
      originationChainId: toChain,
      toHome: {
        foreign: nativeTokenAddress,
        home: $assetIn.address,
      },
    }
  }
  return null
}

type TokenBridgeInfo = Awaited<ReturnType<typeof tokenBridgeInfo>>

export const tokenBridgeTrace = asyncDerived([input.bridgeKey, input.assetIn], async ([$bridgeKey, $assetIn]) => {
  return loading.loads('token', () => tokenBridgeInfo([$bridgeKey, $assetIn]))
})

export const tokenOriginationChainId = asyncDerived(
  [input.bridgeKey, input.assetIn],
  async ([$bridgeKey, $assetIn]) => {
    const info = await tokenBridgeInfo([$bridgeKey, $assetIn])
    return info?.originationChainId
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

export const assetLink = derived<[Readable<input.BridgeKey | null>, Readable<Token | null>], TokenBridgeInfo>(
  [input.bridgeKey, input.assetIn],
  ([$bridgeKey, $assetIn], set) => {
    if (!$bridgeKey || !$assetIn) {
      set(null)
      return
    }
    let cancelled = false
    tokenBridgeInfo([$bridgeKey, $assetIn]).then((allowance) => {
      if (cancelled) return
      set(allowance)
    })
    return () => {
      cancelled = true
    }
  },
  null,
)

export const approval = derived(
  [walletAccount, input.bridgeKey, assetLink, input.fromPublicClient, input.forcedRefresh, block],
  ([$walletAccount, $bridgeKey, $assetLink, $publicClient], set) => {
    if (!$bridgeKey || !$assetLink || !$walletAccount) {
      return
    }
    const $bridgeAddress = pathway($bridgeKey)!.from
    let cancelled = false
    const getApproval = () =>
      checkApproval([$walletAccount, $bridgeAddress, $assetLink, $publicClient]).then((approval) => {
        if (cancelled) return
        set(approval)
      })
    getApproval()
    return () => {
      cancelled = true
    }
  },
  0n,
)
