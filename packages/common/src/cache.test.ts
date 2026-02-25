import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { maxMemoize, ttlMemoizeSingle } from './cache'

describe('cache', () => {
  describe('maxMemoize', () => {
    it('should cache function results', () => {
      const fn = vi.fn((a: number, b: number) => a + b)
      const memoized = maxMemoize(fn)

      const result1 = memoized(1, 2)
      const result2 = memoized(1, 2)

      expect(result1).toBe(3)
      expect(result2).toBe(3)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should cache different argument combinations separately', () => {
      const fn = vi.fn((a: number, b: number) => a + b)
      const memoized = maxMemoize(fn)

      expect(memoized(1, 2)).toBe(3)
      expect(memoized(2, 3)).toBe(5)
      expect(memoized(1, 2)).toBe(3)

      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('should handle bigint arguments correctly', () => {
      const fn = vi.fn((a: bigint) => a * 2n)
      const memoized = maxMemoize(fn)

      const result1 = memoized(100n)
      const result2 = memoized(100n)

      expect(result1).toBe(200n)
      expect(result2).toBe(200n)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should respect max cache size', () => {
      const fn = vi.fn((n: number) => n * 2)
      const memoized = maxMemoize(fn, 3)

      // Fill cache with 3 entries
      memoized(1)
      memoized(2)
      memoized(3)

      // Add 4th entry - should evict oldest
      memoized(4)

      // Call first entry again - should recompute
      memoized(1)

      // Total calls: 5 (1, 2, 3, 4, 1 again)
      expect(fn).toHaveBeenCalledTimes(5)
    })

    it('should handle complex object arguments', () => {
      const fn = vi.fn((obj: { a: number; b: string }) => `${obj.a}-${obj.b}`)
      const memoized = maxMemoize(fn)

      const result1 = memoized({ a: 1, b: 'test' })
      const result2 = memoized({ a: 1, b: 'test' })

      expect(result1).toBe('1-test')
      expect(result2).toBe('1-test')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should return undefined for cached undefined results', () => {
      const fn = vi.fn(() => undefined)
      const memoized = maxMemoize(fn)

      const result1 = memoized()
      const result2 = memoized()

      expect(result1).toBe(undefined)
      expect(result2).toBe(undefined)
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('ttlMemoizeSingle', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should cache result within TTL', () => {
      const fn = vi.fn(() => Math.random())
      const memoized = ttlMemoizeSingle(fn, 1000)

      const result1 = memoized()
      vi.advanceTimersByTime(500)
      const result2 = memoized()

      expect(result1).toBe(result2)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should recompute after TTL expires', () => {
      const fn = vi.fn(() => Math.random())
      const memoized = ttlMemoizeSingle(fn, 1000)

      const result1 = memoized()
      vi.advanceTimersByTime(1001)
      const result2 = memoized()

      expect(result1).not.toBe(result2)
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('should use default TTL of 1 hour', () => {
      const fn = vi.fn(() => 'test')
      const memoized = ttlMemoizeSingle(fn)

      memoized()
      vi.advanceTimersByTime(1000 * 60 * 59) // 59 minutes
      memoized()

      expect(fn).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(1000 * 60 * 2) // 2 more minutes (total 61)
      memoized()

      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('should ignore arguments and always return same cached result', () => {
      const fn = vi.fn((n: number) => n * 2)
      const memoized = ttlMemoizeSingle(fn, 1000)

      const result1 = memoized(5)
      const result2 = memoized(10)

      // Second call should return cached result from first call
      expect(result1).toBe(10)
      expect(result2).toBe(10)
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith(5)
    })

    it('should handle bigint results', () => {
      const fn = vi.fn(() => 999999999999999999n)
      const memoized = ttlMemoizeSingle(fn, 1000)

      const result1 = memoized()
      const result2 = memoized()

      expect(result1).toBe(999999999999999999n)
      expect(result2).toBe(999999999999999999n)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should cache null and undefined results', () => {
      const fnNull = vi.fn(() => null)
      const memoizedNull = ttlMemoizeSingle(fnNull, 1000)

      expect(memoizedNull()).toBe(null)
      expect(memoizedNull()).toBe(null)
      expect(fnNull).toHaveBeenCalledTimes(1)

      const fnUndefined = vi.fn(() => undefined)
      const memoizedUndefined = ttlMemoizeSingle(fnUndefined, 1000)

      expect(memoizedUndefined()).toBe(undefined)
      expect(memoizedUndefined()).toBe(undefined)
      expect(fnUndefined).toHaveBeenCalledTimes(1)
    })
  })
})
