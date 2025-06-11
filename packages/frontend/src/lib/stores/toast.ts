import { createToaster } from '@skeletonlabs/skeleton-svelte'
import { chainsMetadata } from '@gibsfinance/bridge-sdk/chains'
import { Chains } from '@gibsfinance/bridge-sdk/config'

import { evmChainsById } from './auth/AuthProvider.svelte'

export const toaster = createToaster()

export type Message = {
  message: string
  link: string
  label: string
  timeout?: number
}

// export class Toaster {
//   private messages = $state<Message[]>([])

//   addMessage(msg: Message) {
//     this.messages = [...this.messages, msg]
//     setTimeout(() => {
//       this.removeMessage(msg)
//     }, msg.timeout || 20_000)
//   }

//   removeMessage(msg: Message) {
//     this.messages = this.messages.filter((m) => m !== msg)
//   }
// }

// export const toaster = new Toaster()

export const uri = (chainId: Chains, type: 'tx' | 'address' = 'tx', suffix: string) => {
  const chain = chainsMetadata[chainId] ?? evmChainsById.get(Number(chainId))
  const url = chain.blockExplorers?.default?.url
  return `${url}/${chainId === Chains.V4PLS ? '#/' : ''}${type}/${suffix}`
}
