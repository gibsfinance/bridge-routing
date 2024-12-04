import { addMessage, removeMessage } from './toast'
import { get, writable } from 'svelte/store'
import type { Hex } from 'viem'
import { loading } from './loading'
import { ellipsis } from './utils'
import { clientFromChain, fromChainId, incrementForcedRefresh } from './input'
import { uri } from './toast'
import _ from 'lodash'

export const disabledByTransaction = writable(false)

export const transactionButtonPress =
  (fn: () => Promise<Hex | undefined>, after: () => void = _.noop) =>
  async () => {
    disabledByTransaction.set(true)
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
        link: uri(get(fromChainId), 'tx', txHash),
        label: 'submit-tx',
      }
      addMessage(msg)
      const receipt = await clientFromChain(get(fromChainId)).waitForTransactionReceipt({
        hash: txHash,
      })
      removeMessage(msg)
      addMessage({
        message:
          'Confirmed: ' +
          ellipsis(txHash, {
            length: 4,
            prefixLength: 2,
          }),
        link: uri(get(fromChainId), 'tx', txHash),
        label: 'confirm-tx',
      })
      incrementForcedRefresh()
      console.log(receipt)
      after()
    } finally {
      loading.decrement('user')
      disabledByTransaction.set(false)
    }
  }
