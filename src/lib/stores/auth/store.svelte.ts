import type { Hex, PublicClient } from 'viem'
import { normalize } from 'viem/ens'
import { loading } from '../loading.svelte'

type EnsToAddressArgs = {
  client: PublicClient
  ens: string
}

export const ensToAddress = loading.loadsAfterTick<Hex | null, EnsToAddressArgs>(
  'ens',
  async ({ client, ens }: EnsToAddressArgs) => {
    if (!client.chain?.contracts?.ensRegistry) {
      return null
    }
    return client.getEnsAddress({
      name: normalize(ens),
    })
  },
)
