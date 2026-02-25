import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Cache } from './cache'

describe('Cache', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should create cache with default TTL of 60 seconds', () => {
    const cache = new Cache()
    expect(cache.cache.size).toBe(0)
  })

  it('should create cache with custom TTL', () => {
    const cache = new Cache(5000)
    expect(cache.cache.size).toBe(0)
  })

  it('should store and retrieve values', () => {
    const cache = new Cache()
    cache.cache.set('key', { time: Date.now(), value: 'hello' })
    expect(cache.cache.get('key')?.value).toBe('hello')
  })

  it('should clear stale entries after TTL expires', () => {
    const cache = new Cache(1000) // 1 second TTL

    cache.cache.set('old', { time: Date.now(), value: 'old-value' })

    // Advance time past TTL
    vi.advanceTimersByTime(1500)

    cache.clearStale()

    expect(cache.cache.has('old')).toBe(false)
  })

  it('should keep fresh entries', () => {
    const cache = new Cache(1000)

    cache.cache.set('fresh', { time: Date.now(), value: 'fresh-value' })

    // Advance time but within TTL
    vi.advanceTimersByTime(500)

    cache.clearStale()

    expect(cache.cache.has('fresh')).toBe(true)
    expect(cache.cache.get('fresh')?.value).toBe('fresh-value')
  })

  it('should selectively remove only stale entries', () => {
    const cache = new Cache(1000)

    cache.cache.set('early', { time: Date.now(), value: 'early' })

    vi.advanceTimersByTime(800)

    cache.cache.set('late', { time: Date.now(), value: 'late' })

    vi.advanceTimersByTime(300)

    cache.clearStale()

    // 'early' was set 1100ms ago (> 1000 TTL), should be cleared
    expect(cache.cache.has('early')).toBe(false)
    // 'late' was set 300ms ago (< 1000 TTL), should remain
    expect(cache.cache.has('late')).toBe(true)
  })

  it('should return current timestamp from clearStale', () => {
    const cache = new Cache()
    const now = cache.clearStale()
    expect(typeof now).toBe('number')
    expect(now).toBeGreaterThan(0)
  })
})
