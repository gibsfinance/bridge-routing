import { SvelteMap } from 'svelte/reactivity'
import { innerHeight, innerWidth } from 'svelte/reactivity/window'

export const domains = new SvelteMap<string, string | null>()

export const addDomain = (domain: string) => {
  const val = domains.get(domain)
  if (val) {
    return
  }
  if (val === null) {
    return
  }
  domains.set(domain, null)
  checkDomain(domain)
}

const checkDomain = (domain: string) => {
  const direct = domains.get(domain)
  if (direct) {
    return
  }
  const d = domain.startsWith('http') ? domain : `https://${domain}`
  if (!d.includes('pulsechain')) {
    // domains.set(domain, null)
    return
  }
  return fetch(`${d}/version.json`)
    .then((res) => res.json())
    .then((j) => {
      return [domain, j.ipfs_gateways[0] as string] as const
    })
    .catch(() => [domain, ''] as const)
    .then(([domain, direct]) => {
      domains.set(domain, direct)
    })
}

export class WindowStore {
  large = $derived(
    innerHeight.current &&
      innerHeight.current >= 512 &&
      innerWidth.current &&
      innerWidth.current >= 512,
  )
}

export const windowStore = new WindowStore()
