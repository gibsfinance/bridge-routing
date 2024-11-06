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
  increment: (key?: string | null) => {
    return loadingCounter.update((l) => {
      if (key) {
        l.categories[key] = (l.categories[key] || 0) + 1
      }
      l.total += 1
      return l
    })
  },
  decrement: (key?: string | null) => {
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
  loadsAfterTick: (key: string | null, ...conditions: ((a: any, cleanup: () => void) => any)[]) => {
    loading.increment(key)
    let cancelled = false
    const cleanup = () => {
      if (cancelled) {
        return
      }
      cancelled = true
      loading.decrement(key)
    }
    let current = tick()
    for (const condition of conditions) {
      current = current.then((arg) => {
        if (cancelled) return
        return condition(arg, cleanup)
      })
    }
    current.catch(console.error).then(cleanup)
    return cleanup
  },
}
