import { writable } from 'svelte/store'
import { chainsMetadata } from '$lib/stores/auth/constants'
import { Chains } from '$lib/stores/auth/types'

export type Message = {
  message: string
  link: string
  label: string
  timeout?: number
}

export const messages = writable<Message[]>([])

export const addMessage = (msg: Message) => {
  console.log('addMessage', msg)
  messages.update((msgs) => [...msgs, msg])
  setTimeout(() => {
    messages.update((msgs) => {
      const index = msgs.findIndex((m) => m === msg)
      return msgs.slice(0).splice(index, 1)
    })
  }, msg.timeout || 20_000)
}

export const uri = (chainId: Chains, type: 'tx' | 'address' = 'tx', suffix: string) => {
  const url = chainsMetadata[Chains.PLS].blockExplorers?.default.url
  return `${url}/${chainId === Chains.V4PLS ? '#/' : ''}${type}/${suffix}`
}

// const loop = () => {
//   addMessage({
//     message: 'Hello',
//     link: 'https://google.com',
//     label: 'Hello',
//     timeout: 10_000 + 10_000 * Math.random(),
//   })
//   setTimeout(() => {
//     loop()
//   }, 10_000 + 10_000 * Math.random())
// }

// loop()

export const removeMessage = (msg: Message) => {
  messages.update((msgs) => msgs.filter((m) => m !== msg))
}
