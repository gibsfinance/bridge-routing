import { describe, it, expect } from 'vitest'
import { FeeType, feeTypeValToKeyMap } from './fee-type'

describe('fee-type', () => {
  describe('FeeType enum', () => {
    it('should have PERCENT fee type', () => {
      expect(FeeType.PERCENT).toBe('%')
    })

    it('should have GAS_TIP fee type', () => {
      expect(FeeType.GAS_TIP).toBe('gas+%')
    })

    it('should have FIXED fee type', () => {
      expect(FeeType.FIXED).toBe('fixed')
    })

    it('should have exactly 3 fee types', () => {
      const keys = Object.keys(FeeType)
      expect(keys).toHaveLength(3)
    })
  })

  describe('feeTypeValToKeyMap', () => {
    it('should map PERCENT value to key', () => {
      expect(feeTypeValToKeyMap.get(FeeType.PERCENT)).toBe('PERCENT')
    })

    it('should map GAS_TIP value to key', () => {
      expect(feeTypeValToKeyMap.get(FeeType.GAS_TIP)).toBe('GAS_TIP')
    })

    it('should map FIXED value to key', () => {
      expect(feeTypeValToKeyMap.get(FeeType.FIXED)).toBe('FIXED')
    })

    it('should map all fee type values to keys', () => {
      expect(feeTypeValToKeyMap.size).toBe(3)
    })

    it('should return undefined for invalid fee type', () => {
      expect(feeTypeValToKeyMap.get('invalid' as FeeType)).toBeUndefined()
    })
  })
})
