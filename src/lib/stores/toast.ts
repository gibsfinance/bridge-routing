import { chainsMetadata } from '../stores/auth/constants'
import { Chains } from '../stores/auth/types'
import { evmChainsById } from './auth/AuthProvider.svelte'

import { createToaster } from '@skeletonlabs/skeleton-svelte'

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
