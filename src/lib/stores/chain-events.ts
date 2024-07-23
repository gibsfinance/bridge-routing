import * as input from './input'
import { multicallRead } from '$lib/utils'
import * as abis from './abis'
import * as viem from 'viem'
import { derived, type Stores } from 'svelte/store'
import { loading } from './loading'
import { walletAccount } from './auth/store'
import { destinationChains } from './config'
import { Chains, type DestinationChains } from './auth/types'
import type { Token } from '$lib/types'
import { chainsMetadata } from './auth/constants'

export const destinationPublicClient = derived([input.bridgeKey], ([$bridgeKey]) => input.clientFromChain($bridgeKey))

export const block = derived<Stores, null | viem.Block>(
  [destinationPublicClient],
  ([$destinationPublicClient], set) => {
    loading.increment('gas')
    return $destinationPublicClient.watchBlocks({
      emitOnBegin: true,
      onBlock: async (block: viem.Block) => {
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
      const minGWei = 2_500_000_000n
      perGas = minGWei
      $destinationPublicClient.getGasPrice().then((result) => {
        if (cancelled) return
        if (result < minGWei) {
          result = minGWei
        }
        set(result)
      })
    }
    set(perGas)
    return () => {
      cancelled = true
    }
  },
  0n,
)

export const tokenBalance = derived(
  [walletAccount, input.publicClient, input.assetIn],
  ([$walletAccount, $publicClient, $assetIn], set) => {
    let cancelled = false
    if (!$assetIn || !$walletAccount || $walletAccount === viem.zeroAddress) {
      set(0n)
      return
    }
    const token = viem.getContract({
      address: $assetIn.address,
      abi: viem.erc20Abi,
      client: $publicClient,
    })
    const getBalance = async () => {
      const balance = await token.read.balanceOf([$walletAccount])
      if (cancelled) return
      set(balance)
    }
    const account = viem.getAddress($walletAccount)
    const unwatch = $publicClient.watchContractEvent({
      abi: viem.erc20Abi,
      eventName: 'Transfer',
      address: $assetIn.address,
      onLogs: (logs) => {
        if (
          logs.find(
            (l) =>
              viem.getAddress(l.args.from as viem.Hex) === account ||
              viem.getAddress(l.args.to as viem.Hex) === account,
          )
        ) {
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
  [input.bridgeKey, input.publicClient, input.assetIn],
  ([$bridgeKey, $publicClient, $assetIn], set) => {
    if (!$assetIn) {
      set(0n)
      return
    }
    let cancelled = false
    $publicClient
      .readContract({
        abi: abis.inputBridge,
        functionName: 'minPerTx',
        args: [$assetIn.address],
        address: destinationChains[$bridgeKey].homeBridge,
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

export const tokenBridgeInfo = async ([$bridgeKey, $assetIn]: [DestinationChains, Token | null]): Promise<null | {
  toForeign?: {
    home: viem.Hex
    foreign?: viem.Hex
  }
  toHome?: {
    home: viem.Hex
    foreign: viem.Hex
  }
}> => {
  if (!$assetIn) {
    return null
  }
  const args = [$assetIn.address]
  const mappings = await multicallRead<viem.Hex[]>({
    client: input.clientFromChain(Chains.PLS),
    chain: chainsMetadata[Chains.PLS],
    abi: abis.inputBridge,
    target: destinationChains[$bridgeKey].homeBridge,
    calls: [
      { functionName: 'bridgedTokenAddress', args },
      { functionName: 'nativeTokenAddress', args },
    ],
  })
  let [
    foreignTokenAddress, // bridgedTokenAddress
    nativeTokenAddress,
  ] = mappings

  if (foreignTokenAddress !== viem.zeroAddress) {
    // if we are here, then we know that we are dealing with a native
    // address, so we need to go to the foreign chain
    const mappings = await multicallRead<viem.Hex[]>({
      client: input.clientFromChain($bridgeKey),
      chain: chainsMetadata[$bridgeKey],
      abi: abis.inputBridge,
      target: destinationChains[$bridgeKey].foreignBridge,
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
  } else if (nativeTokenAddress !== viem.zeroAddress) {
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
  viem.Hex | undefined,
  viem.Hex,
  null | TokenBridgeInfo,
  viem.PublicClient,
]) => {
  if (!$walletAccount) {
    return 0n
  }
  if (!$assetLink || $assetLink.toHome) {
    return 0n // irrelevant
  }
  const token = viem.getContract({
    abi: viem.erc20Abi,
    address: $assetLink.toForeign!.home!,
    client: $publicClient,
  })
  const allowance = await token.read.allowance([$walletAccount, $bridgeAddress])
  return allowance
}

export const assetLink = derived<Stores, TokenBridgeInfo>(
  [input.bridgeKey, input.assetIn],
  ([$bridgeKey, $assetIn], set) => {
    if (!$assetIn) {
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
  [walletAccount, input.bridgeAddress, assetLink, input.publicClient],
  ([$walletAccount, $bridgeAddress, $assetLink, $publicClient], set) => {
    if (!$assetLink || !$walletAccount) {
      return
    }
    let cancelled = false
    const getApproval = () =>
      checkApproval([$walletAccount, $bridgeAddress, $assetLink, $publicClient]).then((approval) => {
        if (cancelled) return
        set(approval)
      })
    getApproval()
    let unwatch: viem.WatchContractEventReturnType = () => { }
    if ($assetLink.toForeign) {
      const account = viem.getAddress($walletAccount)
      const bridgeAddr = viem.getAddress($bridgeAddress)
      unwatch = $publicClient.watchContractEvent({
        abi: viem.erc20Abi,
        eventName: 'Approval',
        address: $assetLink.toForeign.home,
        onLogs: (logs) => {
          if (
            logs.find(
              (l) =>
                viem.getAddress(l.args.owner as viem.Hex) === account ||
                viem.getAddress(l.args.spender as viem.Hex) === bridgeAddr,
            )
          ) {
            getApproval()
          }
        },
      })
    }
    return () => {
      unwatch?.()
      cancelled = true
    }
  },
  0n,
)
