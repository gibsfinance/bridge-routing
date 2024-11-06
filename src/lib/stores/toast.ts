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

export const removeMessage = (msg: Message) => {
  messages.update((msgs) => msgs.filter((m) => m !== msg))
}

export const addMessage = (msg: Message) => {
  messages.update((msgs) => [...msgs, msg])
  setTimeout(() => {
    removeMessage(msg)
  }, msg.timeout || 20_000)
}

export const uri = (chainId: Chains, type: 'tx' | 'address' = 'tx', suffix: string) => {
  const url = chainsMetadata[Chains.PLS].blockExplorers?.default.url
  return `${url}/${chainId === Chains.V4PLS ? '#/' : ''}${type}/${suffix}`
}
