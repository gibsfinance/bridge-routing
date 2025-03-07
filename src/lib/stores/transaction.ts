import { addMessage, removeMessage } from './toast'
import * as transactions from './transactions'
import type { Hex } from 'viem'
import { loading } from './loading.svelte'
import { ellipsis } from './utils'
import { bridgeKey, incrementForcedRefresh } from './input.svelte'
import { uri } from './toast'
import { noop } from 'lodash'
import { ProxyStore } from '$lib/types.svelte'

export const disabledByTransaction = new ProxyStore<boolean>(false)

export const transactionButtonPress =
  (fn: () => Promise<Hex | undefined>, afterFn: () => void = noop) =>
  async () => {
    disabledByTransaction.value = true
    try {
      loading.increment('user')
      // const amountInBefore = get(input.amountIn)
      const txHash = await fn()
      if (!txHash) {
        return
      }
      const msg = {
        message:
          'Submitted: ' +
          ellipsis(txHash, {
            length: 4,
            prefixLength: 2,
          }),
        link: uri(bridgeKey.fromChain, 'tx', txHash),
        label: 'submit-tx',
      }
      addMessage(msg)
      const receipt = await transactions.wait(txHash)
      removeMessage(msg)
      addMessage({
        message:
          'Confirmed: ' +
          ellipsis(txHash, {
            length: 4,
            prefixLength: 2,
          }),
        link: uri(bridgeKey.fromChain, 'tx', txHash),
        label: 'confirm-tx',
      })
      incrementForcedRefresh()
      console.log(receipt)
      afterFn()
    } finally {
      loading.decrement('user')
      disabledByTransaction.value = false
    }
  }
