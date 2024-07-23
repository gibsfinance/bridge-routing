import * as input from './input'
import * as abis from './abis'
import * as viem from 'viem'
import { derived, type Stores } from 'svelte/store'
import { loading } from './loading'
import { asyncDerived } from '@square/svelte-store'
import { walletAccount } from './auth/store'
import { destinationChains } from './config'

export const destinationPublicClient = derived([input.bridgeKey], ([$bridgeKey]) => (
  input.clientFromChain($bridgeKey)
))

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
        set(null)
      },
    })
  }, null)

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
  }, 0n)

export const tokenBalance = derived(
  [walletAccount, input.publicClient, input.assetIn],
  ([$walletAccount, $publicClient, $assetIn], set) => {
    let cancelled = false
    if (!$walletAccount || $walletAccount === viem.zeroAddress) {
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
        if (logs.find((l) => (
          viem.getAddress(l.args.from as viem.Hex) === account ||
          viem.getAddress(l.args.to as viem.Hex) === account
        ))) {
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
    let cancelled = false
    $publicClient.readContract({
      abi: abis.inputBridge,
      functionName: 'minPerTx',
      args: [$assetIn.address],
      address: destinationChains[$bridgeKey].homeBridge,
    }).then((res) => {
      if (cancelled) return
      set(res)
    })
    return () => {
      cancelled = true
    }
  },
  0n,
)