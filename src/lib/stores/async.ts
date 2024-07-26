import { derived as d, type Stores, type StoresValues } from 'svelte/store'

export const derived = <S extends Stores, T>(
  stores: S,
  callback: (values: StoresValues<S>) => T | Promise<T>,
  initial_value: T,
) => {
  let guard!: T

  return d(
    stores,
    ($stores, set) => {
      const inner = (guard = {} as unknown as T)

      set(initial_value)
      Promise.resolve(callback($stores)).then((value: unknown) => {
        if (guard === inner) {
          set(value as T)
        }
      })
    },
    initial_value,
  )
}
