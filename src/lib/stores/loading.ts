import { writable } from 'svelte/store'

const loadingCounter = writable({
  total: 0,
  categories: {} as Record<string, number>,
  get resolved() {
    return this.total === 0
  },
})

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
  // resolved: (key?: string) => {
  //   console.log(get(loadingCounter).categories, get(loadingCounter).total)
  //   return key ? !get(loadingCounter).categories[key] : !get(loadingCounter).total
  // },
}