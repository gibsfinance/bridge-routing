import { describe, it, expect } from 'vitest'
import { Multicall } from './multicall'

describe('Multicall', () => {
  describe('encodeMulticall', () => {
    it('should return single calldata unchanged', () => {
      const calldata = '0xabcdef12' as `0x${string}`
      const result = Multicall.encodeMulticall(calldata)
      expect(result).toBe(calldata)
    })

    it('should return single element array calldata unchanged', () => {
      const calldata = '0xabcdef12' as `0x${string}`
      const result = Multicall.encodeMulticall([calldata])
      expect(result).toBe(calldata)
    })

    it('should encode multiple calldatas into a multicall', () => {
      const calldatas = [
        '0xabcdef12' as `0x${string}`,
        '0x12345678' as `0x${string}`,
      ]
      const result = Multicall.encodeMulticall(calldatas)

      // Should be encoded as a multicall function call
      expect(result).toMatch(/^0x/)
      // Should be different from either individual calldata
      expect(result).not.toBe(calldatas[0])
      expect(result).not.toBe(calldatas[1])
      // Should be longer than individual calldatas (contains both + function selector + encoding)
      expect(result.length).toBeGreaterThan(calldatas[0].length + calldatas[1].length)
    })

    it('should have the ABI defined', () => {
      expect(Multicall.ABI).toBeDefined()
      expect(Multicall.ABI[0].name).toBe('multicall')
      expect(Multicall.ABI[0].type).toBe('function')
    })
  })
})
