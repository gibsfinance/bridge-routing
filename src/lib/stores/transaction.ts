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
    after = noop,
  }: {
    toast: ToastContext
    steps: (() => Promise<Hex | undefined | null>)[]
    after?: () => void
  }) =>
  async () => {
    disabledByTransaction.value = true
    try {
      loading.increment('user')
      for (const step of steps) {
        const txHash = await step()
        console.log('txHash', txHash)
        if (txHash === undefined) {
          return
        }
        if (txHash === null) {
          continue
        }
        const id = `tx-${txHash}`
        toast.create({
          id,
          description: `Transaction submitted`,
          type: 'info',
          duration: 20_000,
        })
        const receipt = await transactions.wait(txHash)
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
