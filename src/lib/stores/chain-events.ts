import * as input from './input'
import * as viem from 'viem'
import { derived, type Stores } from 'svelte/store'
import { loading } from './loading'

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
