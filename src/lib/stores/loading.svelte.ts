import { untrack } from 'svelte'

export class LoadingCounter {
  value = $state({
    total: 0,
    categories: {} as Record<string, number>,
  })
  get resolved() {
    return this.value.total === 0
  }
  isResolved(key?: string | string[] | null) {
    if (!key) return this.resolved
    if (Array.isArray(key))
      return key.reduce((total, k) => total + (this.value.categories[k] || 0), 0) === 0
    return !this.value.categories[key as string]
  }

  increment(key?: string | null) {
    if (key) {
      this.value.categories[key] = (this.value.categories[key] || 0) + 1
    }
    this.value.total += 1
  }
  decrement(key?: string | null) {
    if (key) {
      const current = this.value.categories[key] || 0
      if (!current) {
        return this
      }
      this.value.categories[key] = current - 1
    }
    if (this.value.total > 0) {
      this.value.total -= 1
    }
  }
  loadsAfterTick<Out, In = unknown>(
    key: string | null,
    ...conditions: Condition[]
  ): (arg?: In) => { promise: Promise<Out | null>; controller: AbortController; cleanup: Cleanup } {
    return (arg?: In) => {
      untrack(() => this.increment(key))
      let cancelled = false
      const abortController = new AbortController()
      const cleanup = () => {
        if (cancelled) return
        cancelled = true
        untrack(() => this.decrement(key))
        if (!abortController.signal.aborted) {
          abortController.abort()
        }
      }
      let current = Promise.resolve(arg) as Promise<unknown>
      for (const condition of conditions) {
        current = current.then((arg) => {
          if (cancelled || abortController.signal.aborted) return
          return condition(arg, abortController, cleanup)
        })
      }
      current.catch(console.error).then(cleanup)
      return {
        promise: current as unknown as Promise<Out>,
        controller: abortController,
        cleanup,
      }
    }
  }
}
export const loading = new LoadingCounter()

export const resolved = <T>(val: T) => {
  return {
    cleanup: () => {},
    promise: Promise.resolve(val),
    controller: new AbortController(),
  }
}

export type Cleanup = () => void
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Condition<T = any, R = any> =
  | ((a: T, abortController: AbortController) => void)
  | ((a: T, abortController: AbortController, cleanup: Cleanup) => R | Promise<R>)
