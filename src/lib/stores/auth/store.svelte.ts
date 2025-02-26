import type { Hex, PublicClient } from 'viem'
import { Chains } from './types'
import { normalize } from 'viem/ens'
import * as input from '$lib/stores/input.svelte'

export const accountENS = async (address: Hex | null | undefined) => {
  if (!address) {
    return undefined
  }
  const ethPublicClient = input.clientFromChain(Chains.ETH)
  return ethPublicClient.getEnsName({ address }).then((ens) => ens)
}

export const ensToAddress = async (publicClient: PublicClient, ens: string) => {
  if (!publicClient.chain?.contracts?.ensRegistry) {
    return null
  }
  return publicClient.getEnsAddress({
    name: normalize(ens),
  })
}
