import { describe, it, expect } from 'vitest'
import { getAddress } from 'viem'

// Test the chainIdAddressBlacklist directly without importing reactive stores
describe('chainIdAddressBlacklist', () => {
  // Recreate the blacklist logic from config.svelte.ts
  const chainIdAddressBlacklist = new Set<string>([
    // PulseChain token incorrectly listed as Ethereum token
    `1/${getAddress('0xa1077a294dde1b09bb078844df40758a5d0f9a27').toLowerCase()}`,
  ])

  it('should be a Set', () => {
    expect(chainIdAddressBlacklist).toBeInstanceOf(Set)
  })

  it('should contain the problematic PulseChain token on Ethereum chain 1', () => {
    const problematicAddress = getAddress('0xa1077a294dde1b09bb078844df40758a5d0f9a27')
    const chainIdAddressKey = `1/${problematicAddress.toLowerCase()}`

    expect(chainIdAddressBlacklist.has(chainIdAddressKey)).toBe(true)
  })

  it('should NOT blacklist the same address on other chains', () => {
    const sameAddress = getAddress('0xa1077a294dde1b09bb078844df40758a5d0f9a27')

    // Should NOT be blacklisted on PulseChain (369)
    const pulsechainKey = `369/${sameAddress.toLowerCase()}`
    expect(chainIdAddressBlacklist.has(pulsechainKey)).toBe(false)

    // Should NOT be blacklisted on BSC (56)
    const bscKey = `56/${sameAddress.toLowerCase()}`
    expect(chainIdAddressBlacklist.has(bscKey)).toBe(false)
  })

  it('should use checksummed address but lowercase in key', () => {
    const address = '0xa1077a294dde1b09bb078844df40758a5d0f9a27'
    const checksummed = getAddress(address)

    // Checksummed version
    expect(checksummed).toBe('0xA1077a294dDE1B09bB078844df40758a5D0f9a27')

    // But in the blacklist key, it should be lowercase
    const key = `1/${checksummed.toLowerCase()}`
    expect(chainIdAddressBlacklist.has(key)).toBe(true)
  })

  it('should use lowercase addresses in keys for consistent matching', () => {
    chainIdAddressBlacklist.forEach((key) => {
      const [, address] = key.split('/')
      expect(address).toBe(address.toLowerCase())
      expect(address).toMatch(/^0x[a-f0-9]{40}$/)
    })
  })

  it('should have valid chainId/address format', () => {
    chainIdAddressBlacklist.forEach((key) => {
      const parts = key.split('/')
      expect(parts).toHaveLength(2)

      const [chainId, address] = parts
      expect(chainId).toMatch(/^\d+$/) // chainId should be numeric string
      expect(address).toMatch(/^0x[a-f0-9]{40}$/) // address should be lowercase hex
    })
  })

  describe('integration with token filtering', () => {
    it('should filter out tokens with blacklisted chainId/address combination', () => {
      // Simulate the filtering logic from input.svelte.ts
      const tokens = [
        {
          chainId: 1,
          address: '0xA1077a294dDE1B09bB078844df40758a5D0f9a27', // Checksummed
          symbol: 'BADTOKEN',
        },
        {
          chainId: 1,
          address: '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT - should NOT be filtered
          symbol: 'USDT',
        },
        {
          chainId: 369, // PulseChain
          address: '0xA1077a294dDE1B09bB078844df40758a5D0f9a27', // Same address but on PulseChain - should NOT be filtered
          symbol: 'OKTOKEN',
        },
      ]

      const filtered = tokens.filter((t) => {
        const checksummedAddress = getAddress(t.address)
        const chainIdAddressKey = `${t.chainId}/${checksummedAddress.toLowerCase()}`
        return !chainIdAddressBlacklist.has(chainIdAddressKey)
      })

      expect(filtered).toHaveLength(2)
      expect(filtered[0].symbol).toBe('USDT')
      expect(filtered[1].symbol).toBe('OKTOKEN')
      expect(filtered.find(t => t.symbol === 'BADTOKEN')).toBeUndefined()
    })
  })
})
