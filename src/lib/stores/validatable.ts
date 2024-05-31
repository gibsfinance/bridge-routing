import { get, writable, type Writable } from 'svelte/store'

export interface ValidatableWritable extends Writable<string> {
  rollback: () => void
}

export const validatable = <T>($val: T, validation = (v: T): T | undefined => v) => {
  let prev = $val
  const val = writable($val)
  const { subscribe, set, update } = val
  const doValidation = (v: T) => {
    try {
      return validation(v)
    } catch (err) {
      return undefined
    }
  }
  const rollback = () => {
    set(prev)
  }
  return {
    subscribe,
    set: (v: T) => {
      const nextVal = doValidation(v)
      if (typeof nextVal === 'undefined') {
        return set(get(val))
      } else {
        prev = get(val)
        return set(v)
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
