import { describe, it, expect } from 'vitest'
import { chainsMetadata } from './chains'
import { Chains } from './config'

describe('chains', () => {
  describe('chainsMetadata', () => {
    it('should have metadata for all main chains', () => {
      expect(chainsMetadata[Chains.PLS]).toBeDefined()
      expect(chainsMetadata[Chains.ETH]).toBeDefined()
      expect(chainsMetadata[Chains.BNB]).toBeDefined()
    })

    it('should have metadata for testnet chains', () => {
      expect(chainsMetadata[Chains.SEP]).toBeDefined()
      expect(chainsMetadata[Chains.V4PLS]).toBeDefined()
    })

    it('should have required fields for each chain', () => {
      Object.entries(chainsMetadata).forEach(([chainKey, metadata]) => {
        expect(metadata).toHaveProperty('chainId')
        expect(metadata).toHaveProperty('name')
        expect(metadata).toHaveProperty('logoURI')
        expect(metadata).toHaveProperty('alt')
        expect(metadata).toHaveProperty('rpcUrls')
        expect(metadata.rpcUrls).toHaveProperty('default')
        expect(metadata.rpcUrls.default).toHaveProperty('http')
        expect(Array.isArray(metadata.rpcUrls.default.http)).toBe(true)
        expect(metadata.rpcUrls.default.http.length).toBeGreaterThan(0)
      })
    })

    it('should have valid RPC URLs for each chain', () => {
      Object.values(chainsMetadata).forEach((metadata) => {
        metadata.rpcUrls.default.http.forEach((url) => {
          expect(url).toMatch(/^https?:\/\//)
          expect(url).not.toContain(' ')
        })
      })
    })

    it('should have valid logoURIs', () => {
      Object.values(chainsMetadata).forEach((metadata) => {
        expect(metadata.logoURI).toMatch(/^https?:\/\//)
      })
    })

    it('should have alt text for accessibility', () => {
      Object.values(chainsMetadata).forEach((metadata) => {
        expect(typeof metadata.alt).toBe('string')
        expect(metadata.alt.length).toBeGreaterThan(0)
      })
    })

    it('should have matching chainId in metadata', () => {
      Object.entries(chainsMetadata).forEach(([chainKey, metadata]) => {
        expect(metadata.chainId).toBe(chainKey)
      })
    })

    it('should have ENS contracts for Pulsechain chains', () => {
      // Mainnet PLS should have ENS
      expect(chainsMetadata[Chains.PLS].contracts?.ensRegistry).toBeDefined()
      expect(chainsMetadata[Chains.PLS].contracts?.ensUniversalResolver).toBeDefined()
      expect(chainsMetadata[Chains.PLS].contracts?.ensRegistry?.address).toMatch(/^0x[a-fA-F0-9]{40}$/)
      expect(chainsMetadata[Chains.PLS].contracts?.ensUniversalResolver?.address).toMatch(/^0x[a-fA-F0-9]{40}$/)

      // Testnet V4PLS should have ENS
      expect(chainsMetadata[Chains.V4PLS].contracts?.ensRegistry).toBeDefined()
      expect(chainsMetadata[Chains.V4PLS].contracts?.ensUniversalResolver).toBeDefined()
    })

    it('should have multicall3 contracts for all chains', () => {
      Object.values(chainsMetadata).forEach((metadata) => {
        expect(metadata.contracts?.multicall3).toBeDefined()
        expect(metadata.contracts?.multicall3?.address).toMatch(/^0x[a-fA-F0-9]{40}$/)
      })
    })

    it('should have unique RPC URLs per chain', () => {
      const rpcUrls = Object.values(chainsMetadata).map(
        (m) => m.rpcUrls.default.http[0]
      )
      const uniqueUrls = new Set(rpcUrls)
      expect(uniqueUrls.size).toBe(rpcUrls.length)
    })

    describe('specific chain validation', () => {
      it('should have correct Pulsechain mainnet config', () => {
        const pls = chainsMetadata[Chains.PLS]
        expect(pls.name).toContain('Pulse')
        expect(pls.chainId).toBe(Chains.PLS)
        expect(pls.rpcUrls.default.http[0]).toContain('pulsechain')
      })

      it('should have correct Ethereum mainnet config', () => {
        const eth = chainsMetadata[Chains.ETH]
        expect(eth.name).toContain('Ethereum')
        expect(eth.chainId).toBe(Chains.ETH)
      })

      it('should have correct BSC config', () => {
        const bnb = chainsMetadata[Chains.BNB]
        expect(bnb.name).toContain('Binance')
        expect(bnb.chainId).toBe(Chains.BNB)
        expect(bnb.rpcUrls.default.http[0]).toContain('bsc')
      })

      it('should have correct Sepolia testnet config', () => {
        const sep = chainsMetadata[Chains.SEP]
        expect(sep.name).toBe('Sepolia')
        expect(sep.chainId).toBe(Chains.SEP)
      })

      it('should have correct Pulsechain V4 testnet config', () => {
        const v4pls = chainsMetadata[Chains.V4PLS]
        expect(v4pls.name).toContain('Pulsechain V4')
        expect(v4pls.chainId).toBe(Chains.V4PLS)
      })
    })
  })
})
