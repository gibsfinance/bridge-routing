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

export const destinationPublicClient = derived([input.bridgeKey, input.forcedRefresh], ([$bridgeKey]) =>
  $bridgeKey && input.clientFromChain($bridgeKey[2]),
)

export const block = derived<[Readable<PublicClient | null>], null | Block>(
  [destinationPublicClient],
  ([$destinationPublicClient], set) => {
    if (!$destinationPublicClient) {
      set(null)
      return
    }
    loading.increment('gas')
    return $destinationPublicClient.watchBlocks({
      emitOnBegin: true,
      onBlock: async (block: Block) => {
        set(block)
        loading.decrement('gas')
      },
      onError: (err: Error) => {
        console.log('err during block collection', err)
        loading.decrement('gas')
        set(null)
      },
    })
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

export const tokenBalance = derived(
  [walletAccount, input.fromPublicClient, input.assetIn, input.forcedRefresh],
  ([$walletAccount, $publicClient, $assetIn], set) => {
    let cancelled = false
    if (!$assetIn || !$walletAccount || $walletAccount === zeroAddress) {
      set(0n)
      return
    }
    const token = getContract({
      address: $assetIn.address,
      abi: erc20Abi,
      client: $publicClient,
    })
    const getBalance = async () => {
      const balance = await token.read.balanceOf([$walletAccount])
      if (cancelled) return
      // console.log('token balance', balance)
      set(balance)
    }
    const unwatch = $publicClient.watchContractEvent({
      abi: erc20Abi,
      eventName: 'Transfer',
      address: $assetIn.address,
      onLogs: (logs) => {
        if (logs.length) {
          getBalance()
        }
      },
    })
    getBalance()
    return () => {
      cancelled = true
      unwatch()
    }
  },
  0n,
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
        toForeign: {
          foreign: foreignTokenAddress,
          home: $assetIn.address,
        },
      }
    }
  } else if (nativeTokenAddress !== zeroAddress) {
    return {
      toHome: {
        foreign: nativeTokenAddress,
        home: $assetIn.address,
      },
    }
  }
  return {
    toForeign: {
      home: $assetIn.address,
    },
  }
  // fallback case
}

type TokenBridgeInfo = Awaited<ReturnType<typeof tokenBridgeInfo>>

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
  [walletAccount, input.bridgeKey, assetLink, input.fromPublicClient, input.forcedRefresh],
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
    let unwatch: WatchContractEventReturnType = () => { }
    if ($assetLink.toForeign) {
      const account = getAddress($walletAccount)
      const bridgeAddr = getAddress($bridgeAddress)
      unwatch = $publicClient.watchContractEvent({
        abi: erc20Abi,
        eventName: 'Approval',
        address: $assetLink.toForeign.home,
        onLogs: (logs) => {
          if (
            logs.find(
              (l) => getAddress(l.args.owner as Hex) === account || getAddress(l.args.spender as Hex) === bridgeAddr,
            )
          ) {
            getApproval()
          }
        },
      })
    }
    return () => {
      unwatch()
      cancelled = true
    }
  },
  0n,
)
