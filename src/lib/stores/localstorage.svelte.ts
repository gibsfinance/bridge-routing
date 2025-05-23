import { ProxyStore } from '../types.svelte'
import _ from 'lodash'
import { untrack } from 'svelte'
import { jsonAnyParse, jsonAnyStringify } from '../utils.svelte'

export class LocalProxy<T extends object> extends ProxyStore<T> {
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

export class LocalProxyProp<T, B extends object, O extends object> {
  constructor(
    protected storage: LocalProxy<B>,
    protected key: string[],
    defaultValue: T,
    ignoredKeys: string[] = [],
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
  extend(current: O) {
    this.storage.update(this.key, { ...(this.value ?? {}), ...current })
  }
}
