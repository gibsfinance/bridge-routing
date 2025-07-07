import type { Hex } from 'viem'
import { noop } from 'lodash'

import * as transactions from './transactions'
import { incrementForcedRefresh } from './input.svelte'
import { toaster } from './toast'

export const toasts = {
  submitted: (id: string) => {
    toaster.info({
      id,
      title: `Transaction submitted`,
      duration: 60_000,
    })
  },
  confirmed: (id: string) => {
    toaster.success({
      id,
      title: `Transaction confirmed`,
      duration: 60_000,
    })
  },
}

export const transactionButtonPress =
  ({
    steps,
    chainId,
    after = noop,
  }: {
    steps: (() => Promise<Hex | undefined | null>)[]
    chainId: number
    after?: () => void
  }) =>
    async () => {
      send({
        steps,
        after,
        wait: async (hash) => {
          const receipt = await transactions.wait(hash as Hex, chainId)
          console.log(receipt)
        },
      })
    }

export const send = async ({
  steps,
  after = noop,
  wait,
}: {
  steps: (() => Promise<string | undefined | null>)[]
  after?: () => void
  wait: (txHash: string) => Promise<void>
}) => {
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
      toasts.submitted(id)
      console.log('waiting for tx', txHash)
      await wait(txHash)
      console.log('confirmed', txHash)
      toasts.confirmed(id)
      incrementForcedRefresh()
    }
  } finally {
    // decrement()
  }
  after()
}
