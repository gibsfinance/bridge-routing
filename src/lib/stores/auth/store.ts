import { derived, type Readable } from 'svelte/store'
import {
  createPublicClient,
  http,
  type Address,
  type WalletClient,
  type PublicClient,
} from 'viem'
import { Chains } from './types'
import { chainsMetadata } from './constants'
import { normalize } from 'viem/ens'
import * as input from '../input'

export const walletAccount = derived<[Readable<WalletClient | undefined>], Address | undefined>(
  [input.walletClient],
  ([$walletClient], set) => {
    if (!$walletClient) {
      set(undefined)
      return undefined
    }

    $walletClient?.requestAddresses().then(async (accounts) => {
      const [account] = accounts

      set(account)
      input.recipient.set(account)
    })
  },
)

export const accountENS = derived([walletAccount], ([$walletAccount], set) => {
  if (!$walletAccount) {
    return undefined
  }

  /** ENS resolver exists just on the mainnet  */
  const ethPublicClient = createPublicClient({
    chain: chainsMetadata[Chains.ETH],
    transport: http(),
  })

  ethPublicClient.getEnsName({ address: $walletAccount }).then((ens) => set(ens))
})

export const ensToAddress = async (publicClient: PublicClient, ens: string) => {
  if (!publicClient.chain?.contracts?.ensRegistry) {
    return null
  }
  return publicClient.getEnsAddress({
    name: normalize(ens),
  })
}
