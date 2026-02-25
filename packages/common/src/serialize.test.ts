import { describe, it, expect } from 'vitest'
import { jsonAnyStringify, jsonAnyParse, isSerializedBigInt } from './serialize'

describe('serialize', () => {
  describe('jsonAnyStringify', () => {
    it('should serialize bigint values', () => {
      const result = jsonAnyStringify('test', 12345n)
      expect(result).toEqual({
        __type__: 'bigint',
        value: '12345',
      })
    })

    it('should serialize large bigint values', () => {
      const largeBigInt = BigInt('999999999999999999999999999999')
      const result = jsonAnyStringify('test', largeBigInt)
      expect(result).toEqual({
        __type__: 'bigint',
        value: '999999999999999999999999999999',
      })
    })

    it('should pass through non-bigint values unchanged', () => {
      expect(jsonAnyStringify('test', 'string')).toBe('string')
      expect(jsonAnyStringify('test', 123)).toBe(123)
      expect(jsonAnyStringify('test', true)).toBe(true)
      expect(jsonAnyStringify('test', null)).toBe(null)
      expect(jsonAnyStringify('test', undefined)).toBe(undefined)
    })

    it('should handle objects', () => {
      const obj = { foo: 'bar' }
      expect(jsonAnyStringify('test', obj)).toBe(obj)
    })

    it('should handle arrays', () => {
      const arr = [1, 2, 3]
      expect(jsonAnyStringify('test', arr)).toBe(arr)
    })
  })

  describe('isSerializedBigInt', () => {
    it('should identify serialized bigint objects', () => {
      const serialized = {
        __type__: 'bigint',
        value: '12345',
      }
      expect(isSerializedBigInt(serialized)).toBe(true)
    })

    it('should reject non-serialized bigint objects', () => {
      expect(isSerializedBigInt({})).toBe(false)
      expect(isSerializedBigInt({ __type__: 'string' })).toBe(false)
      expect(isSerializedBigInt({ value: '123' })).toBe(false)
      expect(isSerializedBigInt('string')).toBe(false)
      expect(isSerializedBigInt(123)).toBe(false)
      expect(isSerializedBigInt(null)).toBe(false)
      expect(isSerializedBigInt(undefined)).toBe(false)
    })
  })

  describe('jsonAnyParse', () => {
    it('should deserialize bigint values', () => {
      const serialized = {
        __type__: 'bigint',
        value: '12345',
      }
      const result = jsonAnyParse('test', serialized)
      expect(result).toBe(12345n)
      expect(typeof result).toBe('bigint')
    })

    it('should deserialize large bigint values', () => {
      const serialized = {
        __type__: 'bigint',
        value: '999999999999999999999999999999',
      }
      const result = jsonAnyParse('test', serialized)
      expect(result).toBe(BigInt('999999999999999999999999999999'))
    })

    it('should pass through non-serialized-bigint values unchanged', () => {
      expect(jsonAnyParse('test', 'string')).toBe('string')
      expect(jsonAnyParse('test', 123)).toBe(123)
      expect(jsonAnyParse('test', true)).toBe(true)
      expect(jsonAnyParse('test', null)).toBe(null)
      expect(jsonAnyParse('test', undefined)).toBe(undefined)
    })
  })

  describe('round-trip serialization', () => {
    it('should correctly round-trip bigint values through JSON', () => {
      const original = { amount: 12345n, balance: 999999999999999999n }
      const serialized = JSON.stringify(original, jsonAnyStringify)
      const deserialized = JSON.parse(serialized, jsonAnyParse)

      expect(deserialized.amount).toBe(12345n)
      expect(deserialized.balance).toBe(999999999999999999n)
    })

    it('should handle nested objects with bigints', () => {
      const original = {
        user: {
          address: '0x123',
          balance: 1000000000000000000n,
        },
        transaction: {
          value: 5000000000000000n,
          gasLimit: 21000n,
        },
      }
      const serialized = JSON.stringify(original, jsonAnyStringify)
      const deserialized = JSON.parse(serialized, jsonAnyParse)

      expect(deserialized.user.balance).toBe(1000000000000000000n)
      expect(deserialized.transaction.value).toBe(5000000000000000n)
      expect(deserialized.transaction.gasLimit).toBe(21000n)
    })

    it('should handle arrays with bigints', () => {
      const original = [1n, 2n, 3n, 999999999999999999n]
      const serialized = JSON.stringify(original, jsonAnyStringify)
      const deserialized = JSON.parse(serialized, jsonAnyParse)

      expect(deserialized).toEqual([1n, 2n, 3n, 999999999999999999n])
    })
  })
})
