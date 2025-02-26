import { Chains } from '$lib/stores/auth/types'
import { chainsMetadata } from './auth/constants'
// import { get, writable } from 'svelte/store'
import { isProd } from '$lib/stores/config.svelte'
import _ from 'lodash'
import { SvelteMap } from 'svelte/reactivity'

type RPCEntry = [Chains, string[]]

type RPCData = SvelteMap<Chains, string[]>

const prodRpc = [
  [Chains.PLS, [...chainsMetadata[Chains.PLS].rpcUrls.default.http]],
  [Chains.ETH, [...chainsMetadata[Chains.ETH].rpcUrls.default.http]],
  [Chains.BNB, [...chainsMetadata[Chains.BNB].rpcUrls.default.http]],
] as RPCEntry[]

const testnetRpc = [
  [Chains.V4PLS, [...chainsMetadata[Chains.V4PLS].rpcUrls.default.http]],
  [Chains.SEP, [...chainsMetadata[Chains.SEP].rpcUrls.default.http]],
] as RPCEntry[]

const localStorageKey = 'rpcs'
class RpcsStore {
  private val = new SvelteMap([...prodRpc, ...(isProd ? [] : testnetRpc)])
  set value(v: RPCData) {
    this.val = v
    this.updateStorage()
  }
  get value() {
    return this.val
  }
  get(c: Chains) {
    return this.val.get(c) || null
  }
  set(c: Chains, l: string[]) {
    this.val.set(c, l)
    this.updateStorage()
  }
  updateStorage() {
    localStorage.setItem(localStorageKey, this.stringify())
  }
  stringify() {
    return [...this.value.entries()].map(([c, l]) => key(c, l)).join('\n')
  }
  parse(entry: string | null) {
    if (!entry) {
      return null
    }
    const stored = entry.split('\n').map((ro) => {
      const [chain, ...list] = ro.split(',')
      return [chain as Chains, _.compact(list)] as const
    }) as [Chains, string[]][]
    return new Map([...this.value.entries()].concat(stored))
  }
  entries() {
    return [...this.value.entries()]
  }
}

export const store = new RpcsStore()

export const key = (c: Chains, l: string[]) => `${c},${(l as string[]).join(',')}`

export const update = (chain: Chains, i: number, rpc: string) => {
  const list = store.get(chain) as string[]
  if (list[i] === rpc) {
    return
  }
  const l = list.slice(0)
  l[i] = rpc
  store.set(chain, l)
}

export const remove = (chain: Chains, i: number) => {
  const list = store.get(chain) as string[]
  list.splice(i, 1)
  store.set(chain, list)
}

export const add = (chain: Chains, addition = (rpcs: string[]) => [''].concat(rpcs)) => {
  const before = store.get(chain) as string[]
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
  store.set(chain, filteredList)
}

export const hasDefault = (chain: Chains, list: string[]) => {
  const defaultRpc = chainsMetadata[chain].rpcUrls.default.http[0] as string
  if (!defaultRpc) return false
  return list.includes(defaultRpc)
}

export const restoreDefault = (chain: Chains) => {
  add(chain, (l) => l.concat(chainsMetadata[chain].rpcUrls.default.http))
}
