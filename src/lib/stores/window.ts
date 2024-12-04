import { derived, get, readable, writable } from 'svelte/store'
import { isEqual } from 'lodash'

export const windowIsAvailable = typeof window !== 'undefined'

const w = readable(
  windowIsAvailable
    ? {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
      }
    : {
        innerHeight: 0,
        innerWidth: 0,
      },
  (set) => {
    const getCurrent = () => ({
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
    })
    const updateIfDifferent = () => {
      const $w = get(w)
      const current = getCurrent()
      if (isEqual(current, $w)) {
        return
      }
      set(current)
    }
    const handler = () => updateIfDifferent()
    if (!windowIsAvailable) {
      return () => {}
    }
    window.addEventListener('resize', handler)
    const unwind = () => {
      window.removeEventListener('resize', handler)
    }
    updateIfDifferent()
    return unwind
  },
)

export const firstMount = writable()

export const windowLoaded = derived(
  [firstMount],
  ([$firstMount], set) => {
    if ($firstMount) {
      set(true)
      return
    }
    let loaded = false
    const handler = (e: Event) => {
      console.log(e)
      if (!loaded) {
        loaded = true
        set(loaded)
      }
    }
    if (!windowIsAvailable) {
      return () => {}
    }
    window.addEventListener('load', handler)
    document.addEventListener('DOMContentLoaded', handler)
    return () => {
      window.removeEventListener('load', handler)
      document.removeEventListener('DOMContentLoadedd', handler)
    }
  },
  false,
)

export { w as windowStore }

const domainsStore = writable(new Map<string, string | null>())

export const domains = {
  ...domainsStore,
  add: (domain: string) => {
    const $domainsStore = get(domainsStore)
    const val = $domainsStore.get(domain)
    if (val) {
      return
    }
    if (val === null) {
      return
    }
    domainsStore.set($domainsStore.set(domain, null))
  },
}

export const directDomain = derived(
  [domainsStore],
  ([$domainStore], set) => {
    let cancelled = false
    Promise.all(
      [...$domainStore.entries()].map(async ([domain, direct]) => {
        if (direct) {
          return [domain, direct] as const
        }
        const d = domain.startsWith('http') ? domain : `https://${domain}`
        if (!d.includes('pulsechain')) {
          return [domain, ''] as const
        }
        return fetch(`${d}/version.json`)
          .then((res) => res.json())
          .then((j) => {
            return [domain, j.ipfs_gateways[0] as string] as const
          })
          .catch(() => [domain, ''] as const)
      }),
    ).then((entries) => {
      if (cancelled) return
      set(new Map(entries))
    })
    return () => {
      cancelled = true
    }
  },
  new Map<string, string>(),
)
