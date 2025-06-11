import { get, type Writable } from 'svelte/store'
import { normalize } from 'viem/ens'

import { writable } from 'svelte/store'
import { getAddress, isAddress, zeroAddress, type Hex } from 'viem'
import { Chains, type ChainKey } from '@gibsfinance/bridge-sdk/config'
import { clientFromChain } from '../stores/input.svelte'

export const isEns = (val: string) => {
  return val.toLowerCase().match(/\w+\.(pls|eth|bnb)/gi)
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

export const ens = (target: ChainKey): Writable<Entry> => {
  const input = writable<Entry>({
    address: zeroAddress,
    ens: null,
  })
  let i = 0
  const trigger = async (identifier: number) => {
    i++
    const { address, ens } = get(input)
    if (ens) {
      const tld = ensTld(ens)
      const addr = await clientFromChain(Number(Chains[tld])).getEnsAddress({
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
      const ens = await clientFromChain(Number(Chains[target])).getEnsName({
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
