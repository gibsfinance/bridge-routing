export const nativeSymbol = (asset: { symbol: string } | null, unwrap = false) => {
  return asset ? (unwrap ? asset.symbol.slice(1) : asset.symbol) : ''
}

export class Proxy<T> {
  value = $state<T>(null as unknown as T)
  set(value: T) {
    this.value = value
  }
}

export class NullableProxy<T> extends Proxy<T | null> {
  value = $state(null)
}

export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}
