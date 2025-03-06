import { ProxyStore } from '$lib/types.svelte'
import _ from 'lodash'
import { untrack } from 'svelte'

const BIGINT_TYPE = 'bigint' as const
const jsonAnyStringify = (key: string, value: unknown) => {
  if (typeof value === BIGINT_TYPE) {
    return {
      __type__: BIGINT_TYPE,
      value: (value as bigint).toString(),
    }
  }
  return value
}
type SerializedBigInt = {
  __type__: typeof BIGINT_TYPE
  value: string
}
const isSerializedBigInt = (value: unknown): value is SerializedBigInt => {
  return (
    !!value && typeof value === 'object' && (value as SerializedBigInt).__type__ === BIGINT_TYPE
  )
}

const jsonAnyParse = (_key: string, value: unknown) => {
  if (isSerializedBigInt(value)) {
    return BigInt(value.value)
  }
  return value
}
export class LocalProxy<T> extends ProxyStore<T> {
  constructor(
    protected key: string,
    defaultValue: T,
  ) {
    const stored = localStorage.getItem(key)
    let value = defaultValue
    if (stored) {
      try {
        value = JSON.parse(stored, jsonAnyParse)
      } catch {
        console.log('failed to parse localstorage value for key=', key)
      }
    }
    super(value)
  }
  update(key: string[], value: unknown) {
    const updated = _.set(
      untrack(() => ({ ...this.value }) as object),
      key,
      value,
    )
    this.value = updated as T
    const stringified = JSON.stringify(updated, jsonAnyStringify)
    localStorage.setItem(this.key, stringified)
  }
  access<T>(key: string[]) {
    return _.get(this, ['value', ...key]) as T
  }
}

export class LocalProxyProp<T, LP> {
  constructor(
    protected storage: LocalProxy<LP>,
    protected key: string[],
    defaultValue: T,
  ) {
    if (!_.has(storage.value, key)) {
      this.value = defaultValue
    }
  }
  get value() {
    return this.storage.access<T>(this.key)
  }
  set value(v: T) {
    this.storage.update(this.key, v)
  }
}
