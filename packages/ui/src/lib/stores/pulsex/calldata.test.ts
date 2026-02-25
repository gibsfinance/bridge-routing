import { describe, it, expect } from 'vitest'
import { toHex } from './calldata'

describe('calldata', () => {
  describe('toHex', () => {
    it('should convert zero to 0x00', () => {
      expect(toHex(0n)).toBe('0x00')
    })

    it('should convert small numbers', () => {
      expect(toHex(1n)).toBe('0x01')
      expect(toHex(15n)).toBe('0x0f')
      expect(toHex(16n)).toBe('0x10')
      expect(toHex(255n)).toBe('0xff')
    })

    it('should convert large numbers', () => {
      expect(toHex(256n)).toBe('0x0100')
      expect(toHex(65535n)).toBe('0xffff')
    })

    it('should convert 1 ether in wei', () => {
      const oneEther = 1000000000000000000n
      expect(toHex(oneEther)).toBe('0x0de0b6b3a7640000')
    })

    it('should pad odd-length hex to even length', () => {
      // 256 = 0x100, which is 3 chars, should be padded to 0x0100
      const result = toHex(256n)
      // Remove 0x prefix, check even length
      expect(result.slice(2).length % 2).toBe(0)
    })

    it('should accept string number input', () => {
      expect(toHex('100')).toBe('0x64')
    })

    it('should accept number input', () => {
      expect(toHex(100)).toBe('0x64')
    })
  })
})
