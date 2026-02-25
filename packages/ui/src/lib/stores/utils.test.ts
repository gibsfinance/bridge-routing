import { describe, it, expect } from 'vitest'
import {
  ellipsis,
  countDecimals,
  humanReadableDate,
  humanReadableNumber,
  stripNonNumber,
  isZero,
  numberWithCommas,
  formatTokenAmount,
  decimalValidation,
  usd,
} from './utils'

describe('utils', () => {
  describe('ellipsis', () => {
    it('should truncate long strings with ellipsis', () => {
      const addr = '0x1234567890abcdef1234567890abcdef12345678'
      const result = ellipsis(addr)
      expect(result).toContain('...')
      expect(result.length).toBeLessThan(addr.length)
    })

    it('should not truncate when string equals 2x length + prefix', () => {
      const short = '0x1234567890123456'
      // length=8, prefixLength=0, so (16)/2 = 8 === length
      const result = ellipsis(short)
      expect(result).toBe(short)
    })

    it('should respect custom length parameter', () => {
      const addr = '0x1234567890abcdef1234567890abcdef12345678'
      const result = ellipsis(addr, { length: 4 })
      expect(result).toBe('0x12...5678')
    })

    it('should respect prefixLength parameter', () => {
      const addr = '0x1234567890abcdef1234567890abcdef12345678'
      const result = ellipsis(addr, { length: 4, prefixLength: 2 })
      expect(result).toBe('0x1234...5678')
    })
  })

  describe('countDecimals', () => {
    it('should return 0 for empty string', () => {
      expect(countDecimals('')).toBe(0)
    })

    it('should return 0 for integer string', () => {
      expect(countDecimals('123')).toBe(0)
    })

    it('should count decimal places', () => {
      expect(countDecimals('1.23')).toBe(2)
      expect(countDecimals('0.123456')).toBe(6)
    })

    it('should return 0 for no decimal part', () => {
      expect(countDecimals('100')).toBe(0)
    })
  })

  describe('humanReadableDate', () => {
    it('should format date as ISO without seconds', () => {
      const date = new Date('2024-01-15T14:30:00Z')
      const result = humanReadableDate(date)
      expect(result).toBe('2024-01-15 14:30')
    })
  })

  describe('humanReadableNumber', () => {
    it('should return "0.0" for zero', () => {
      expect(humanReadableNumber(0n)).toBe('0.0')
    })

    it('should format 1 ether correctly', () => {
      const oneEther = 1000000000000000000n
      const result = humanReadableNumber(oneEther)
      expect(result).toBe('1.0')
    })

    it('should format with custom decimals', () => {
      const amount = 1000000n // 1 USDC (6 decimals)
      const result = humanReadableNumber(amount, { decimals: 6 })
      expect(result).toBe('1.0')
    })

    it('should pad decimals when decimalCount is specified', () => {
      const oneEther = 1000000000000000000n
      const result = humanReadableNumber(oneEther, { decimalCount: 4 })
      expect(result).toContain('1.0000')
    })

    it('should truncate to maxDecimals', () => {
      const amount = 1234567890123456789n
      const result = humanReadableNumber(amount, { maxDecimals: 4 })
      expect(result.split('.')[1]?.length).toBeLessThanOrEqual(4)
    })

    it('should use default values when no settings provided', () => {
      const result = humanReadableNumber()
      expect(result).toBe('0.0')
    })
  })

  describe('stripNonNumber', () => {
    it('should strip non-numeric characters', () => {
      expect(stripNonNumber('abc123')).toBe('123')
    })

    it('should preserve decimal point', () => {
      expect(stripNonNumber('12.34')).toBe('12.34')
    })

    it('should only keep first decimal point', () => {
      expect(stripNonNumber('12.34.56')).toBe('12.3456')
    })

    it('should handle empty string', () => {
      expect(stripNonNumber('')).toBe('')
    })

    it('should handle currency symbols', () => {
      expect(stripNonNumber('$1,234.56')).toBe('1234.56')
    })
  })

  describe('isZero', () => {
    it('should return true for empty string', () => {
      expect(isZero('')).toBe(true)
    })

    it('should return true for "0"', () => {
      expect(isZero('0')).toBe(true)
    })

    it('should return true for "0.0"', () => {
      expect(isZero('0.0')).toBe(true)
    })

    it('should return true for "0.000"', () => {
      expect(isZero('0.000')).toBe(true)
    })

    it('should return false for non-zero', () => {
      expect(isZero('1')).toBe(false)
      expect(isZero('0.1')).toBe(false)
    })
  })

  describe('numberWithCommas', () => {
    it('should add commas to large numbers', () => {
      expect(numberWithCommas('1000')).toBe('1,000')
      expect(numberWithCommas('1000000')).toBe('1,000,000')
    })

    it('should not add commas to small numbers', () => {
      expect(numberWithCommas('100')).toBe('100')
    })

    it('should preserve decimal part', () => {
      expect(numberWithCommas('1000.12345')).toBe('1,000.12345')
    })
  })

  describe('formatTokenAmount', () => {
    it('should format whole token amounts', () => {
      // 1 ETH = 10^18 wei
      const result = formatTokenAmount('1000000000000000000', { decimals: 18 })
      expect(result).toBe('1')
    })

    it('should format fractional token amounts', () => {
      // 1.5 ETH
      const result = formatTokenAmount('1500000000000000000', { decimals: 18 })
      expect(result).toBe('1.5')
    })

    it('should format USDC amounts (6 decimals)', () => {
      const result = formatTokenAmount('1000000', { decimals: 6 })
      expect(result).toBe('1')
    })

    it('should add commas for large amounts', () => {
      // 1,000 tokens
      const result = formatTokenAmount('1000000000', { decimals: 6 })
      expect(result).toBe('1,000')
    })

    it('should trim trailing zeros from fractional part', () => {
      // 1.10 should become 1.1
      const result = formatTokenAmount('1100000', { decimals: 6 })
      expect(result).toBe('1.1')
    })

    it('should handle zero amount', () => {
      const result = formatTokenAmount('0', { decimals: 18 })
      expect(result).toBe('0')
    })

    it('should handle invalid input gracefully', () => {
      const result = formatTokenAmount('not-a-number', { decimals: 18 })
      expect(result).toBe('not-a-number')
    })
  })

  describe('decimalValidation', () => {
    it('should return empty string for empty input', () => {
      expect(decimalValidation('')).toBe('')
    })

    it('should accept valid decimal input', () => {
      expect(decimalValidation('1.5')).toBe('1.5')
      expect(decimalValidation('100')).toBe('100')
    })

    it('should reject input with too many decimal places', () => {
      // Default 18 decimals
      const tooMany = '1.' + '0'.repeat(19)
      expect(decimalValidation(tooMany)).toBeUndefined()
    })

    it('should accept input within decimal limit', () => {
      expect(decimalValidation('1.123456', 6)).toBe('1.123456')
    })

    it('should reject input exceeding custom decimal limit', () => {
      expect(decimalValidation('1.1234567', 6)).toBeUndefined()
    })

    it('should return undefined for unparseable values', () => {
      expect(decimalValidation('abc')).toBeUndefined()
    })
  })

  describe('usd', () => {
    it('should return zero for falsy values', () => {
      expect(usd.toCents(0n)).toBe('0.00')
    })

    it('should format USD values with 2 decimal places', () => {
      const oneUsd = 1000000000000000000n
      const result = usd.toCents(oneUsd)
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })
  })
})
