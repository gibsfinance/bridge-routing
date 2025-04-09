import { chainsMetadata } from '../stores/auth/constants'
import { Chains } from '../stores/auth/types'
import { chainsById } from './auth/AuthProvider.svelte'

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
  const chain = chainsMetadata[chainId] ?? chainsById.get(Number(chainId))
  const url = chain.blockExplorers?.default?.url
  return `${url}/${chainId === Chains.V4PLS ? '#/' : ''}${type}/${suffix}`
}
