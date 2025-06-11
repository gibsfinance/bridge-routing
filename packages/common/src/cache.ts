import { jsonAnyStringify } from "./serialize.js"

/**
 * Memoize a function result and return a single value
 * @param fn the function to memoize
 * @param max the maximum number of values to cache
 * @returns the memoized function
 */
export const maxMemoize = <A extends unknown[], B>(fn: (...a: A) => B, max = 1024) => {
  const cache = new Map<string, B>()
  return (...a: A) => {
    const key = JSON.stringify(a, jsonAnyStringify)
    const existing = cache.get(key)
    if (cache.has(key)) {
      return existing
    }
    for (const k of cache.keys()) {
      if (cache.size < max) break
      cache.delete(k)
    }
    const result = fn(...a)
    cache.set(key, result)
    return result
  }
}

const hour1 = 1000 * 60 * 60
/**
 * Memoize a function result and return a single value
 * @param fn the function to memoize
 * @param ttl the time to live for the cache
 * @returns the memoized function
 */
export const ttlMemoizeSingle = <A extends unknown[], B>(fn: (...a: A) => B, ttl = hour1) => {
  let cache: {
    timestamp: number
    result: B
  } | null = null
  return (...a: A) => {
    const now = Date.now()
    if (cache && cache.timestamp + ttl > now) {
      return cache.result
    }
    const result = fn(...a)
    cache = { timestamp: now, result }
    return result
  }
}
