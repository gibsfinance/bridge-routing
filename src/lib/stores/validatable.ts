import { get, writable, type Writable } from "svelte/store"

export interface ValidatableWritable extends Writable<string> {
  rollback: () => void
}

export const create = ($val = '', validation = (v: string): any => v) => {
  let prev = $val
  const val = writable($val)
  const { subscribe, set, update } = val
  const doValidation = (v: string) => {
    try {
      return validation(v)
    } catch (err) { }
  }
  const rollback = () => {
    set(prev)
  }
  return {
    subscribe,
    set: (v: string) => {
      const nextVal = doValidation(v)
      if (typeof nextVal === 'string') {
        prev = get(val)
        return set(v)
      } else {
        console.log('invalid %o -> %o', get(val), v)
        return set(get(val))
      }
    },
    update: (fn: Parameters<typeof update>[0]) => {
      return val.update((v) => {
        prev = v
        const res = fn(v)
        const nextVal = doValidation(res)
        if (typeof nextVal === 'string') {
          prev = nextVal
          return nextVal
        } else {
          return v
        }
      })
    },
    rollback,
  } as ValidatableWritable
}
