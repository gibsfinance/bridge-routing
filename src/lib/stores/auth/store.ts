import { derived, writable, type Readable } from 'svelte/store'
import {
  createPublicClient,
  type Address,
  type WalletClient,
  http,
  getContract,
  multicall3Abi,
  type PublicClient,
} from 'viem'
import { Chains } from './types'
import { chainsMetadata } from './constants'
import { normalize } from 'viem/ens'
import { destination } from '../bridge-settings'

export const activeChain = writable<Chains>(Chains.PLS)
export const walletClient = writable<WalletClient | undefined>()

export const walletAccount = derived<[Readable<WalletClient | undefined>], Address | undefined>(
  [walletClient],
  ([$walletClient], set) => {
    if (!$walletClient) {
      set(undefined)
      return undefined
    }

    $walletClient?.requestAddresses().then((accounts) => {
      const [account] = accounts

      set(account)
      destination.set(account)
    })
  },
)

export const clientFromChain = ($activeChain: Chains) => {
  return createPublicClient({
    chain: chainsMetadata[$activeChain],
    transport: http(),
  })
}

export const publicClient = derived(activeChain, clientFromChain)
export const multicall = derived([activeChain, publicClient], ([$activeChain, $publicClient]) => {
  const metadata = chainsMetadata[$activeChain]
  return getContract({
    abi: multicall3Abi,
    client: $publicClient,
    address: metadata.contracts!.multicall3!.address,
  })
})

export const accountENS = derived([walletAccount], ([$walletAccount], set) => {
  if (!$walletAccount) return undefined

  /** ENS resolver exists just on the mainnet  */
  const ethPublicClient = createPublicClient({
    chain: chainsMetadata[Chains.ETH],
    transport: http(),
  })

  ethPublicClient.getEnsName({ address: $walletAccount }).then((ens) => set(ens))
})

export const ensToAddress = async (publicClient: PublicClient, ens: string) => {
  return publicClient.getEnsAddress({
    name: normalize(ens),
  })
}
