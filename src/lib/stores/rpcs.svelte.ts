import { Chains, toChain } from '$lib/stores/auth/types'
import { chainsMetadata } from './auth/constants'
import { isProd } from '$lib/stores/config.svelte'
import _ from 'lodash'
import { SvelteMap } from 'svelte/reactivity'

type RPCEntry = [number, string[]]

type RPCData = SvelteMap<number, string[]>

const prodRpc = [
  [Number(Chains.PLS), [...chainsMetadata[Chains.PLS].rpcUrls.default.http]],
  [Number(Chains.ETH), [...chainsMetadata[Chains.ETH].rpcUrls.default.http]],
  [Number(Chains.BNB), [...chainsMetadata[Chains.BNB].rpcUrls.default.http]],
] as RPCEntry[]

const testnetRpc = [
  [Number(Chains.V4PLS), [...chainsMetadata[Chains.V4PLS].rpcUrls.default.http]],
  [Number(Chains.SEP), [...chainsMetadata[Chains.SEP].rpcUrls.default.http]],
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
  get(c: number) {
    return this.val.get(c) || null
  }
  set(c: number, l: string[]) {
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
      return [Number(chain), _.compact(list)] as const
    }) as [number, string[]][]
    return new Map([...this.value.entries()].concat(stored))
  }
  entries() {
    return [...this.value.entries()]
  }
}

export const store = new RpcsStore()

export const key = (c: number, l: string[]) => `${c},${(l as string[]).join(',')}`

export const update = (chain: number, i: number, rpc: string) => {
  const list = store.get(chain) as string[]
  if (list[i] === rpc) {
    return
  }
  const l = list.slice(0)
  l[i] = rpc
  store.set(chain, l)
}

export const remove = (chain: number, i: number) => {
  const list = store.get(chain) as string[]
  list.splice(i, 1)
  store.set(chain, list)
}

export const add = (chain: number, addition = (rpcs: string[]) => [''].concat(rpcs)) => {
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

export const hasDefault = (chain: number, list: string[]) => {
  const defaultRpc = chainsMetadata[toChain(chain)].rpcUrls.default.http[0] as string
  if (!defaultRpc) return false
  return list.includes(defaultRpc)
}

export const restoreDefault = (chain: number) => {
  add(chain, (l) => l.concat(chainsMetadata[toChain(chain)].rpcUrls.default.http))
}
