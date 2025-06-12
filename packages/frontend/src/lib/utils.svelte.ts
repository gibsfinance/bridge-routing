/** a store that holds a reactive value of one type only */
export class Proxy<T> {
  value = $state<T>(null as unknown as T)
  set(value: T) {
    this.value = value
  }
}
/** a store that holds a reactive value that can be one type or null */
export class NullableProxy<T> extends Proxy<T | null> {
  value = $state(null)
}

export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}
