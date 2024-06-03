import { get, type Writable } from "svelte/store"
import { normalize } from 'viem/ens'

import { writable } from "svelte/store"
import { getAddress, isAddress, zeroAddress, type Hex, type PublicClient } from "viem"
import { Chains } from "./auth/types"
import { clientFromChain } from "./auth/store"

export const ensToAddress = async (publicClient: PublicClient, ens: string) => {
  return publicClient.getEnsAddress({
    name: normalize(ens),
  })
}

export const isEns = (val: string) => {
  return val.toLowerCase().match(/\w+\.(pls|eth|bnb)/ig)
}

export const ensTld = (some: string) => {
  const split = some.split('.')
  return split[split.length - 1].toUpperCase() as ChainKey
}

type Entry = {
  address?: Hex | null
  ens?: string | null
  identifier?: number
}

type ChainKey = keyof typeof Chains

export const ens = (target: ChainKey): Writable<Entry> => {
  const input = writable<Entry>({
    address: zeroAddress,
    ens: null,
  })
  const trigger = async (identifier: number) => {
    i++
    const { address, ens } = get(input)
    if (ens) {
      const tld = ensTld(ens)
      const addr = await clientFromChain(Chains[tld])
        .getEnsAddress({
          name: ens,
        })
      const latest = get(input)
      if (latest.identifier !== identifier) {
        return
      }
      input.set({
        identifier,
        address: addr,
        ens,
      })
    } else {
      const addr = address as Hex
      const ens = await clientFromChain(Chains[target])
        .getEnsName({
          address: addr,
        })
      const latest = get(input)
      if (latest.identifier !== identifier) {
        return
      }
      input.set({
        identifier,
        address: addr,
        ens,
      })
    }
  }
  let i = 0
  const set = ({ address, ens }: Entry) => {
    if (address && isAddress(address)) {
      input.set({
        identifier: i,
        address: getAddress(address),
        ens: null,
      })
      trigger(i)
    } else if (ens && isEns(ens)) {
      input.set({
        identifier: i,
        address: null,
        ens: normalize(ens),
      })
      trigger(i)
    } else {
      throw new Error('invalid store value set')
    }
  }
  return {
    ...input,
    set,
  }
}
