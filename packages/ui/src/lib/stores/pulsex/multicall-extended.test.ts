import { describe, it, expect } from 'vitest'
import { MulticallExtended } from './multicall-extended'

describe('MulticallExtended', () => {
  describe('encodeMulticall', () => {
    it('should fall back to basic multicall when no validation', () => {
      const calldata = '0xabcdef12' as `0x${string}`
      const result = MulticallExtended.encodeMulticall(calldata)
      // Single calldata with no validation returns the calldata unchanged
      expect(result).toBe(calldata)
    })

    it('should encode with deadline validation', () => {
      const calldatas = [
        '0xabcdef12' as `0x${string}`,
        '0x12345678' as `0x${string}`,
      ]
      const deadline = 1700000000n
      const result = MulticallExtended.encodeMulticall(calldatas, deadline)

      expect(result).toMatch(/^0x/)
      expect(result.length).toBeGreaterThan(10)
    })

    it('should encode with previousBlockhash validation', () => {
      const calldatas = ['0xabcdef12' as `0x${string}`]
      const blockHash = '0x' + 'ab'.repeat(32) // valid bytes32
      const result = MulticallExtended.encodeMulticall(calldatas, blockHash)

      expect(result).toMatch(/^0x/)
      expect(result.length).toBeGreaterThan(10)
    })

    it('should normalize single calldata to array when validation present', () => {
      const calldata = '0xabcdef12' as `0x${string}`
      const deadline = 1700000000n
      const result = MulticallExtended.encodeMulticall(calldata, deadline)

      expect(result).toMatch(/^0x/)
    })

    it('should throw for invalid bytes32 blockhash', () => {
      const calldatas = ['0xabcdef12' as `0x${string}`]
      const invalidHash = '0xshort'
      expect(() => MulticallExtended.encodeMulticall(calldatas, invalidHash)).toThrow(
        'is not valid bytes32',
      )
    })

    it('should accept string number as deadline', () => {
      const calldatas = ['0xabcdef12' as `0x${string}`]
      const deadline = '1700000000'
      const result = MulticallExtended.encodeMulticall(calldatas, deadline)
      expect(result).toMatch(/^0x/)
    })
  })
})
