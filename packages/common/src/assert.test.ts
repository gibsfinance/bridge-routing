import { describe, it, expect } from 'vitest'
import { ensureResult, assertDefined } from './assert'

describe('assert', () => {
  describe('ensureResult', () => {
    it('should return value when truthy', () => {
      expect(ensureResult('hello', 'test')).toBe('hello')
      expect(ensureResult(123, 'test')).toBe(123)
      expect(ensureResult(true, 'test')).toBe(true)
      expect(ensureResult({ foo: 'bar' }, 'test')).toEqual({ foo: 'bar' })
      expect(ensureResult([1, 2, 3], 'test')).toEqual([1, 2, 3])
    })

    it('should throw Error when value is null', () => {
      expect(() => ensureResult(null, 'TestContext'))
        .toThrow('TestContext: Expected result but got null')
    })

    it('should throw Error when value is undefined', () => {
      expect(() => ensureResult(undefined, 'TestContext'))
        .toThrow('TestContext: Expected result but got undefined')
    })

    it('should throw Error when value is false', () => {
      expect(() => ensureResult(false, 'TestContext'))
        .toThrow('TestContext: Expected result but got false')
    })

    it('should throw Error when value is 0', () => {
      expect(() => ensureResult(0, 'TestContext'))
        .toThrow('TestContext: Expected result but got 0')
    })

    it('should include context in error message', () => {
      expect(() => ensureResult(null, 'Multicall aggregate3'))
        .toThrow('Multicall aggregate3: Expected result but got null')

      expect(() => ensureResult(undefined, 'Database query'))
        .toThrow('Database query: Expected result but got undefined')
    })

    it('should handle BigInt values', () => {
      expect(ensureResult(123n, 'test')).toBe(123n)
      // 0n is falsy just like 0, so it should throw
      expect(() => ensureResult(0n, 'test')).toThrow('test: Expected result but got 0')
    })

    it('should handle empty string as falsy', () => {
      expect(() => ensureResult('', 'TestContext'))
        .toThrow('TestContext: Expected result but got ')
    })

    it('should handle empty array as truthy', () => {
      expect(ensureResult([], 'test')).toEqual([])
    })

    it('should throw Error, not the value itself', () => {
      try {
        ensureResult(null, 'test')
        expect.fail('Should have thrown')
      } catch (err) {
        expect(err).toBeInstanceOf(Error)
        expect(err).not.toBe(null)
      }
    })
  })

  describe('assertDefined', () => {
    it('should not throw when value is defined', () => {
      expect(() => assertDefined('hello', 'test')).not.toThrow()
      expect(() => assertDefined(123, 'test')).not.toThrow()
      expect(() => assertDefined(true, 'test')).not.toThrow()
      expect(() => assertDefined(false, 'test')).not.toThrow()
      expect(() => assertDefined(0, 'test')).not.toThrow()
      expect(() => assertDefined({}, 'test')).not.toThrow()
      expect(() => assertDefined([], 'test')).not.toThrow()
    })

    it('should throw when value is null', () => {
      expect(() => assertDefined(null, 'Value cannot be null'))
        .toThrow('Value cannot be null')
    })

    it('should throw when value is undefined', () => {
      expect(() => assertDefined(undefined, 'Value cannot be undefined'))
        .toThrow('Value cannot be undefined')
    })

    it('should not throw for falsy but defined values', () => {
      expect(() => assertDefined(false, 'test')).not.toThrow()
      expect(() => assertDefined(0, 'test')).not.toThrow()
      expect(() => assertDefined('', 'test')).not.toThrow()
      expect(() => assertDefined(0n, 'test')).not.toThrow()
    })

    it('should include message in error', () => {
      expect(() => assertDefined(null, 'Custom error message'))
        .toThrow('Custom error message')
    })

    it('should throw Error object', () => {
      try {
        assertDefined(null, 'test')
        expect.fail('Should have thrown')
      } catch (err) {
        expect(err).toBeInstanceOf(Error)
      }
    })

    it('should work with type narrowing', () => {
      const value: string | null = 'hello'
      assertDefined(value, 'test')
      // TypeScript should now know value is string
      const uppercased: string = value.toUpperCase()
      expect(uppercased).toBe('HELLO')
    })
  })

  describe('integration', () => {
    it('should allow chaining ensureResult', () => {
      const obj = { nested: { value: 42 } }
      const result = ensureResult(ensureResult(obj, 'obj').nested, 'nested').value
      expect(result).toBe(42)
    })

    it('should provide clear error messages in real-world scenarios', async () => {
      const mockApiCall = async (): Promise<any[] | null> => null

      await expect(async () => {
        const result = await mockApiCall()
        ensureResult(result, 'API call')
      }).rejects.toThrow('API call: Expected result but got null')
    })
  })
})
