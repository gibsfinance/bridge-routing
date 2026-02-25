import { describe, it, expect, beforeEach } from 'vitest'
import { setImageRoot, getImageRoot, list, network, image, images } from './image-links'

describe('image-links', () => {
  beforeEach(() => {
    // Reset to default before each test
    setImageRoot('https://gib.show')
  })

  describe('setImageRoot and getImageRoot', () => {
    it('should have default image root', () => {
      expect(getImageRoot()).toBe('https://gib.show')
    })

    it('should update image root', () => {
      setImageRoot('https://custom.domain')
      expect(getImageRoot()).toBe('https://custom.domain')
    })

    it('should affect all subsequent URL generations', () => {
      setImageRoot('https://test.com')
      expect(list('/tokens')).toBe('https://test.com/list/tokens')
      expect(network(1)).toBe('https://test.com/image/1')
    })
  })

  describe('list', () => {
    it('should generate list URL with path', () => {
      expect(list('/pulsex')).toBe('https://gib.show/list/pulsex')
    })

    it('should handle paths without leading slash', () => {
      expect(list('tokens')).toBe('https://gib.show/listtokens')
    })

    it('should handle paths with query params', () => {
      expect(list('/pulsechain-bridge/foreign?extensions=bridgeInfo'))
        .toBe('https://gib.show/list/pulsechain-bridge/foreign?extensions=bridgeInfo')
    })

    it('should handle empty path', () => {
      expect(list('')).toBe('https://gib.show/list')
    })
  })

  describe('network', () => {
    it('should generate network image URL for Ethereum', () => {
      expect(network(1)).toBe('https://gib.show/image/1')
    })

    it('should generate network image URL for PulseChain', () => {
      expect(network(369)).toBe('https://gib.show/image/369')
    })

    it('should generate network image URL for BSC', () => {
      expect(network(56)).toBe('https://gib.show/image/56')
    })


    it('should convert string numbers to number', () => {
      expect(network('369' as any)).toBe('https://gib.show/image/369')
    })

    it('should handle zero chainId', () => {
      expect(network(0)).toBe('https://gib.show/image/0')
    })

    it('should handle falsy chainId', () => {
      expect(network(null as any)).toBe('https://gib.show/image/0')
      expect(network(undefined as any)).toBe('https://gib.show/image/NaN')
    })
  })

  describe('image', () => {
    it('should use logoURI if provided', () => {
      const token = {
        chainId: 1,
        address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        logoURI: 'https://custom.com/usdt.png',
      }
      expect(image(token)).toBe('https://custom.com/usdt.png')
    })

    it('should generate URL from chainId and address if no logoURI', () => {
      const token = {
        chainId: 1,
        address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      }
      expect(image(token)).toBe('https://gib.show/image/1/0xdAC17F958D2ee523a2206206994597C13D831ec7')
    })

    it('should checksum the address', () => {
      const token = {
        chainId: 1,
        address: '0xdac17f958d2ee523a2206206994597c13d831ec7', // lowercase
      }
      const result = image(token)
      // Address should be checksummed in the URL
      expect(result).toContain('0xdAC17F958D2ee523a2206206994597C13D831ec7')
    })

    it('should handle null logoURI', () => {
      const token = {
        chainId: 369,
        address: '0xa1077a294dde1b09bb078844df40758a5d0f9a27',
        logoURI: null,
      }
      expect(image(token)).toBe('https://gib.show/image/369/0xA1077a294dDE1B09bB078844df40758a5D0f9a27')
    })

    it('should handle different chain IDs', () => {
      const bscToken = {
        chainId: 56,
        address: '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82',
      }
      expect(image(bscToken)).toBe('https://gib.show/image/56/0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82')
    })
  })

  describe('images', () => {
    it('should generate multi-source image URL', () => {
      const sources = ['source1', 'source2', 'source3']
      expect(images(sources)).toBe('https://gib.show/image/?i=source1&i=source2&i=source3')
    })

    it('should handle single source', () => {
      expect(images(['single'])).toBe('https://gib.show/image/?i=single')
    })

    it('should handle empty array', () => {
      expect(images([])).toBe('https://gib.show/image/?')
    })

    it('should handle URL-encoded sources', () => {
      const sources = [
        'https://example.com/image1.png',
        'https://example.com/image2.png',
      ]
      expect(images(sources)).toBe('https://gib.show/image/?i=https://example.com/image1.png&i=https://example.com/image2.png')
    })
  })

  describe('integration', () => {
    it('should work with custom root across all functions', () => {
      setImageRoot('https://cdn.example.com')

      expect(list('/tokens')).toBe('https://cdn.example.com/list/tokens')
      expect(network(1)).toBe('https://cdn.example.com/image/1')
      expect(image({ chainId: 1, address: '0xdac17f958d2ee523a2206206994597c13d831ec7' }))
        .toBe('https://cdn.example.com/image/1/0xdAC17F958D2ee523a2206206994597C13D831ec7')
      expect(images(['a', 'b'])).toBe('https://cdn.example.com/image/?i=a&i=b')
    })
  })
})
