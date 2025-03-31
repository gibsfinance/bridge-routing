import * as transactions from './transactions'
import type { Hex } from 'viem'
import { loading } from './loading.svelte'
import { incrementForcedRefresh } from './input.svelte'
import { noop } from 'lodash'
import type { ToastContext } from '@skeletonlabs/skeleton-svelte'

export const toasts = {
  submitted: (toast: ToastContext, id: string) => {
    toast.create({
      id,
      description: `Transaction submitted`,
      type: 'info',
      duration: 20_000,
    })
  },
  confirmed: (toast: ToastContext, id: string) => {
    toast.create({
      id,
      description: `Transaction confirmed`,
      type: 'success',
      duration: 20_000,
    })
  },
}

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
    send({
      toast,
      steps,
      after,
      wait: async (hash) => {
        await transactions.wait(hash as Hex, chainId)
      },
    })
  }

export const send = async ({
  toast,
  steps,
  after = noop,
  wait,
}: {
  toast: ToastContext
  steps: (() => Promise<string | undefined | null>)[]
  after?: () => void
  wait: (txHash: string) => Promise<void>
}) => {
  const decrement = loading.increment('user')
  try {
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
      toasts.submitted(toast, id)
      console.log('waiting for tx', txHash)
      const receipt = await wait(txHash)
      console.log('confirmed', txHash)
      toasts.confirmed(toast, id)
      incrementForcedRefresh()
      console.log(receipt)
    }
  } finally {
    decrement()
  }
  after()
}
