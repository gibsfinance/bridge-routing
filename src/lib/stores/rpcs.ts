import { Chains } from '$lib/stores/auth/types'
import { chainsMetadata } from './auth/constants'
import { get, writable } from 'svelte/store'
import _ from 'lodash'

type RPCData = Map<Chains, string[]>

const defaultData = new Map([
  [Chains.PLS, [chainsMetadata[Chains.PLS].rpcUrls.default.http[0]]],
  [Chains.ETH, [chainsMetadata[Chains.ETH].rpcUrls.default.http[0]]],
  [Chains.BNB, [chainsMetadata[Chains.BNB].rpcUrls.default.http[0]]],
])

export const key = (c: Chains, l: string[]) => `${c},${(l as string[]).join(',')}`

const entries = new Map(defaultData.entries())
const serializer = {
  stringify(obj: RPCData) {
    return [...obj.entries()].map(([c, l]) => key(c, l)).join('\n')
  },
  parse(entry: string | null) {
    if (!entry) {
      return entries
    }
    return new Map(
      entry.split('\n').map((ro) => {
        const [chain, ...list] = ro.split(',')
        return [chain as Chains, _.compact(list)]
      }),
    )
  },
}
const localStorageKey = 'rpcs'
export const store = writable(serializer.parse(localStorage.getItem(localStorageKey)))
store.subscribe((val) => {
  localStorage.setItem(localStorageKey, serializer.stringify(val))
})

export const update = (chain: Chains, i: number, rpc: string) => {
  const $rpcs = get(store)
  const list = $rpcs.get(chain) as string[]
  if (list[i] === rpc) {
    return
  }
  list[i] = rpc
  $rpcs.set(chain, list)
  store.set($rpcs)
}

export const remove = (chain: Chains, i: number) => {
  const $rpcs = get(store)
  const list = $rpcs.get(chain) as string[]
  list.splice(i, 1)
  $rpcs.set(chain, list)
  store.set($rpcs)
}

export const add = (chain: Chains, addition = ($rpcs: string[]) => [''].concat($rpcs)) => {
  const $rpcs = get(store)
  const before = get(store).get(chain) as string[]
  const list = addition(before.slice(0))
  const filteredList = list.filter((val, i) => {
    // only the first item in the list may be empty
    if (!val && !i) {
      return true
    }
    return !!val
  })
  if (_.isEqual(before, filteredList)) {
    return
  }
  $rpcs.set(chain, filteredList)
  store.set($rpcs)
}

export const hasDefault = (chain: Chains, list: string[]) => {
  const defaultRpc = defaultData.get(chain)?.[0] as string
  if (!defaultRpc) return false
  return list.includes(defaultRpc)
}

export const restoreDefault = (chain: Chains) => {
  add(chain, (l) => l.concat(defaultData.get(chain) as string[]))
}
