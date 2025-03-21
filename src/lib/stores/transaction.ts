import * as transactions from './transactions'
import type { Hex } from 'viem'
import { loading } from './loading.svelte'
import { incrementForcedRefresh } from './input.svelte'
import { noop } from 'lodash'
import { ProxyStore } from '$lib/types.svelte'
import type { ToastContext } from '@skeletonlabs/skeleton-svelte'

export const disabledByTransaction = new ProxyStore<boolean>(false)

export const transactionButtonPress =
  ({
    toast,
    steps,
    chainId,
    after = noop,
  }: {
    toast: ToastContext
    steps: (() => Promise<Hex | undefined | null>)[]
    chainId: number
    after?: () => void
  }) =>
  async () => {
    disabledByTransaction.value = true
    try {
      loading.increment('user')
      for (const step of steps) {
        const txHash = await step()
        if (txHash === undefined) {
          return
        }
        if (txHash === null) {
          continue
        }
        const id = `tx-${txHash}`
        console.log('txHash', txHash)
        toast.create({
          id,
          description: `Transaction submitted`,
          type: 'info',
          duration: 20_000,
        })
        console.log('waiting for tx', txHash)
        const receipt = await transactions.wait(txHash, chainId)
        console.log('confirmed', txHash)
        toast.create({
          id,
          description: `Transaction confirmed`,
          type: 'success',
          duration: 20_000,
        })
        incrementForcedRefresh()
        console.log(receipt)
      }
      after()
    } finally {
      loading.decrement('user')
      disabledByTransaction.value = false
    }
  }
