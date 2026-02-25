import { describe, it, expect } from 'vitest'
import { strip0x, decodeAMBDataType, signatureToVRS, packSignatures } from './messages'

describe('messages', () => {
  describe('strip0x', () => {
    it('should remove 0x prefix', () => {
      expect(strip0x('0xabcdef')).toBe('abcdef')
    })

    it('should return unchanged string without 0x prefix', () => {
      expect(strip0x('abcdef')).toBe('abcdef')
    })

    it('should handle empty string', () => {
      expect(strip0x('')).toBe('')
    })

    it('should only strip the leading 0x', () => {
      expect(strip0x('0x0x1234')).toBe('0x1234')
    })
  })

  describe('decodeAMBDataType', () => {
    it('should detect manual lane when bit 7 is set', () => {
      // 128 = 0b10000000 (bit 7 set)
      expect(decodeAMBDataType(128)).toEqual({ manualLane: true })
    })

    it('should detect non-manual lane when bit 7 is not set', () => {
      expect(decodeAMBDataType(0)).toEqual({ manualLane: false })
    })

    it('should detect manual lane regardless of other bits', () => {
      // 255 = 0b11111111 (all bits set)
      expect(decodeAMBDataType(255)).toEqual({ manualLane: true })
      // 129 = 0b10000001
      expect(decodeAMBDataType(129)).toEqual({ manualLane: true })
    })

    it('should detect non-manual lane when only lower bits are set', () => {
      // 127 = 0b01111111 (all bits set except bit 7)
      expect(decodeAMBDataType(127)).toEqual({ manualLane: false })
      // 64 = 0b01000000
      expect(decodeAMBDataType(64)).toEqual({ manualLane: false })
    })
  })

  describe('signatureToVRS', () => {
    it('should split a signature into v, r, s components', () => {
      // A signature is: r (32 bytes / 64 hex chars) + s (32 bytes / 64 hex chars) + v (remaining)
      const r = 'a'.repeat(64)
      const s = 'b'.repeat(64)
      const v = '1b'
      const signature = `0x${r}${s}${v}`

      const result = signatureToVRS(signature)

      expect(result.r).toBe(r)
      expect(result.s).toBe(s)
      expect(result.v).toBe(v)
    })

    it('should handle signature without 0x prefix', () => {
      const r = '1'.repeat(64)
      const s = '2'.repeat(64)
      const v = '1c'
      const signature = `${r}${s}${v}`

      const result = signatureToVRS(signature)

      expect(result.r).toBe(r)
      expect(result.s).toBe(s)
      expect(result.v).toBe(v)
    })
  })

  describe('packSignatures', () => {
    it('should pack a single signature', () => {
      const vrs = {
        v: '1b',
        r: 'a'.repeat(64),
        s: 'b'.repeat(64),
      }

      const result = packSignatures([vrs])

      // Length should be 01 (1 signature)
      expect(result).toMatch(/^0x01/)
      expect(result).toContain(vrs.v)
      expect(result).toContain(vrs.r)
      expect(result).toContain(vrs.s)
    })

    it('should pack multiple signatures', () => {
      const vrs1 = {
        v: '1b',
        r: 'a'.repeat(64),
        s: 'b'.repeat(64),
      }
      const vrs2 = {
        v: '1c',
        r: 'c'.repeat(64),
        s: 'd'.repeat(64),
      }

      const result = packSignatures([vrs1, vrs2])

      // Length should be 02 (2 signatures)
      expect(result).toMatch(/^0x02/)
      // v values concatenated, then r values, then s values
      expect(result).toBe(`0x02${vrs1.v}${vrs2.v}${vrs1.r}${vrs2.r}${vrs1.s}${vrs2.s}`)
    })

    it('should handle empty array', () => {
      const result = packSignatures([])
      expect(result).toBe('0x00')
    })
  })
})
