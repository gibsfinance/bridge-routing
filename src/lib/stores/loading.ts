import { tick } from 'svelte'
import { get, writable } from 'svelte/store'

const loadingCounter = writable({
  total: 0,
  categories: {} as Record<string, number>,
  get resolved() {
    return this.total === 0
  },
  isResolved(key?: string | string[]) {
    if (!key) return this.resolved
    if (Array.isArray(key)) return key.reduce((total, k) => total + (this.categories[k] || 0), 0) === 0
    return !this.categories[key as string]
  },
})

setInterval(() => {
  const c = get(loadingCounter)
  if (!c.isResolved()) {
    console.log({ total: c.total, categories: { ...c.categories } })
  }
}, 4_000)

export const loading = {
  ...loadingCounter,
  increment: (key?: string) => {
    return loadingCounter.update((l) => {
      if (key) {
        l.categories[key] = (l.categories[key] || 0) + 1
      }
      l.total += 1
      return l
    })
  },
  decrement: (key?: string) => {
    return loadingCounter.update((l) => {
      if (key) {
        const current = l.categories[key] || 0
        if (!current) {
          return l
        }
        l.categories[key] = (l.categories[key] || 0) - 1
      }
      l.total -= 1
      return l
    })
  },
  loads: async <T>(key: string, fn: () => Promise<T>) => {
    loading.increment(key)
    try {
      const res = await fn()
      loading.decrement(key)
      return res
    } catch (err) {
      loading.decrement(key)
      throw err
    }
  },
  loadsAfterTick: (key: string, ...conditions: ((a: any) => any)[]) => {
    loading.increment(key)
    let cancelled = false
    const cleanup = () => {
      if (cancelled) {
        return
      }
      cancelled = true
      loading.decrement(key)
    }
    tick().then(async () => {
      if (cancelled) return
      let arg: any = null
      for (const condition of conditions) {
        if (cancelled) return
        arg = await condition(arg)
      }
      cleanup()
      return arg
    })
    return cleanup
  },
}
