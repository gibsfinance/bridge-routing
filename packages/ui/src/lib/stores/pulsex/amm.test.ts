import { describe, it, expect } from 'vitest'
import { getD, getY } from './amm'

describe('amm', () => {
  describe('getD', () => {
    it('should return 0 when all balances are zero', () => {
      const result = getD({ amplifier: 100n, balances: [0n, 0n] })
      expect(result).toBe(0n)
    })

    it('should calculate D for equal balances', () => {
      const result = getD({
        amplifier: 100n,
        balances: [1000000n, 1000000n],
      })
      // For equal balances, D should be approximately 2 * balance
      expect(result).toBe(2000000n)
    })

    it('should calculate D for unequal balances', () => {
      const result = getD({
        amplifier: 100n,
        balances: [1000000n, 2000000n],
      })
      // D should be between sum and 2*geometric_mean
      expect(result).toBeGreaterThan(0n)
      expect(result).toBeLessThanOrEqual(3000000n)
    })

    it('should handle large amplifier values', () => {
      const result = getD({
        amplifier: 10000n,
        balances: [1000000000000000000n, 1000000000000000000n],
      })
      expect(result).toBe(2000000000000000000n)
    })

    it('should throw for fewer than 2 coins', () => {
      expect(() => getD({ amplifier: 100n, balances: [1000000n] })).toThrow(
        'To get constant D, pool should have at least two coins',
      )
    })

    it('should handle three coins', () => {
      const result = getD({
        amplifier: 100n,
        balances: [1000000n, 1000000n, 1000000n],
      })
      expect(result).toBe(3000000n)
    })
  })

  describe('getY', () => {
    it('should calculate output amount for a swap', () => {
      const balances = [1000000n, 1000000n]
      const result = getY({
        amplifier: 100n,
        balances,
        i: 0,
        j: 1,
        x: 100000n,
      })
      // After depositing 100000 of token 0, token 1 output should be close to 100000
      // for a stableswap with high amplifier
      expect(result).toBeGreaterThan(0n)
      expect(result).toBeLessThan(1000000n)
    })

    it('should throw for fewer than 2 coins', () => {
      expect(() =>
        getY({
          amplifier: 100n,
          balances: [1000000n],
          i: 0,
          j: 1,
          x: 100000n,
        }),
      ).toThrow('To get y, pool should have at least two coins')
    })

    it('should throw when i equals j', () => {
      expect(() =>
        getY({
          amplifier: 100n,
          balances: [1000000n, 1000000n],
          i: 0,
          j: 0,
          x: 100000n,
        }),
      ).toThrow('Invalid i: 0 and j: 0')
    })

    it('should throw when indices are out of bounds', () => {
      expect(() =>
        getY({
          amplifier: 100n,
          balances: [1000000n, 1000000n],
          i: 0,
          j: 5,
          x: 100000n,
        }),
      ).toThrow()
    })

    it('should throw for negative indices', () => {
      expect(() =>
        getY({
          amplifier: 100n,
          balances: [1000000n, 1000000n],
          i: -1,
          j: 0,
          x: 100000n,
        }),
      ).toThrow()
    })

    it('should handle three-coin pool swaps', () => {
      const result = getY({
        amplifier: 100n,
        balances: [1000000n, 1000000n, 1000000n],
        i: 0,
        j: 2,
        x: 100000n,
      })
      expect(result).toBeGreaterThan(0n)
    })

    it('should give symmetric results for equal pool', () => {
      const balances = [1000000n, 1000000n]
      const amount = 50000n

      const y01 = getY({ amplifier: 100n, balances, i: 0, j: 1, x: amount })
      const y10 = getY({ amplifier: 100n, balances, i: 1, j: 0, x: amount })

      // For equal balances, swapping in either direction should give same result
      expect(y01).toBe(y10)
    })
  })
})
