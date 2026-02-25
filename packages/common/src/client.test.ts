import { describe, it, expect, vi, beforeEach } from 'vitest'
import { chainKey, defaultBatchConfig, clientFromChain } from './client'
import type { Chain } from 'viem'

// Mock viem functions
vi.mock('viem', async () => {
  const actual = await vi.importActual<typeof import('viem')>('viem')
  return {
    ...actual,
    createPublicClient: vi.fn((config: any) => ({
      ...config,
      mockClient: true,
    })),
    http: vi.fn((url?: string, config?: any) => ({
      type: 'http',
      url,
      config,
    })),
    webSocket: vi.fn((url: string, config?: any) => ({
      type: 'webSocket',
      url,
      config,
    })),
    fallback: vi.fn((transports: any[], config?: any) => ({
      type: 'fallback',
      transports,
      config,
    })),
  }
})

describe('client', () => {
  describe('defaultBatchConfig', () => {
    it('should have correct batch wait time', () => {
      expect(defaultBatchConfig.batch.wait).toBe(10)
    })

    it('should have correct batch size', () => {
      expect(defaultBatchConfig.batch.batchSize).toBe(32)
    })

    it('should have batch property', () => {
      expect(defaultBatchConfig).toHaveProperty('batch')
      expect(defaultBatchConfig.batch).toHaveProperty('wait')
      expect(defaultBatchConfig.batch).toHaveProperty('batchSize')
    })
  })

  describe('chainKey', () => {
    it('should create key from chainId and single URL', () => {
      const result = chainKey(1, ['https://eth.llamarpc.com'])
      expect(result).toBe('1,https://eth.llamarpc.com')
    })

    it('should create key from chainId and multiple URLs', () => {
      const result = chainKey(369, [
        'https://rpc.pulsechain.com',
        'https://rpc-pulsechain.g4mm4.io',
      ])
      expect(result).toBe('369,https://rpc.pulsechain.com,https://rpc-pulsechain.g4mm4.io')
    })

    it('should lowercase the result', () => {
      const result = chainKey(1, ['HTTPS://ETH.LLAMARPC.COM'])
      expect(result).toBe('1,https://eth.llamarpc.com')
    })

    it('should handle empty URL array', () => {
      const result = chainKey(1, [])
      expect(result).toBe('1,')
    })

    it('should handle WebSocket URLs', () => {
      const result = chainKey(1, ['wss://eth.llamarpc.com'])
      expect(result).toBe('1,wss://eth.llamarpc.com')
    })

    it('should create unique keys for different chainIds', () => {
      const key1 = chainKey(1, ['https://rpc.example.com'])
      const key2 = chainKey(369, ['https://rpc.example.com'])
      expect(key1).not.toBe(key2)
    })

    it('should create unique keys for different URL arrays', () => {
      const key1 = chainKey(1, ['https://rpc1.example.com'])
      const key2 = chainKey(1, ['https://rpc2.example.com'])
      expect(key1).not.toBe(key2)
    })

    it('should create same key for same inputs', () => {
      const key1 = chainKey(1, ['https://rpc.example.com', 'https://backup.example.com'])
      const key2 = chainKey(1, ['https://rpc.example.com', 'https://backup.example.com'])
      expect(key1).toBe(key2)
    })

    it('should handle URLs with query parameters', () => {
      const result = chainKey(1, ['https://rpc.example.com?apiKey=123'])
      expect(result).toBe('1,https://rpc.example.com?apikey=123')
    })

    it('should handle URLs with ports', () => {
      const result = chainKey(1, ['https://localhost:8545'])
      expect(result).toBe('1,https://localhost:8545')
    })

    it('should handle testnet chain IDs', () => {
      const sepolia = chainKey(11155111, ['https://sepolia.infura.io'])
      expect(sepolia).toBe('11155111,https://sepolia.infura.io')
    })

    it('should create different keys when URL order differs', () => {
      const key1 = chainKey(1, ['https://rpc1.example.com', 'https://rpc2.example.com'])
      const key2 = chainKey(1, ['https://rpc2.example.com', 'https://rpc1.example.com'])
      expect(key1).not.toBe(key2)
    })
  })

  describe('clientFromChain', () => {
    let mockChain: Chain

    beforeEach(() => {
      vi.clearAllMocks()
      mockChain = {
        id: 1,
        name: 'Ethereum',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: {
          default: { http: ['https://eth.llamarpc.com'] },
        },
      } as Chain
    })

    it('should create client with http transport when urls provided', () => {
      const urls = ['https://eth.llamarpc.com']
      const client = clientFromChain({ chain: mockChain, urls })

      expect(client).toBeDefined()
      expect((client as any).mockClient).toBe(true)
    })

    it('should create client with multiple http urls using fallback', () => {
      const urls = [
        'https://eth.llamarpc.com',
        'https://rpc.ankr.com/eth',
      ]
      const client = clientFromChain({ chain: mockChain, urls })

      expect(client).toBeDefined()
    })

    it('should create client with websocket transport', () => {
      const urls = ['wss://eth.llamarpc.com']
      const client = clientFromChain({ chain: mockChain, urls })

      expect(client).toBeDefined()
    })

    it('should create client with mixed http and websocket transports', () => {
      const urls = [
        'https://eth.llamarpc.com',
        'wss://eth.llamarpc.com',
      ]
      const client = clientFromChain({ chain: mockChain, urls })

      expect(client).toBeDefined()
    })

    it('should create client with empty urls array', () => {
      const urls: string[] = []
      const client = clientFromChain({ chain: mockChain, urls })

      expect(client).toBeDefined()
    })

    it('should use cache for same chain and urls', () => {
      const urls = ['https://eth.llamarpc.com']

      const client1 = clientFromChain({ chain: mockChain, urls })
      const client2 = clientFromChain({ chain: mockChain, urls })

      // Should return cached client
      expect(client1).toBe(client2)
    })

    it('should create new client for different urls', () => {
      const urls1 = ['https://eth.llamarpc.com']
      const urls2 = ['https://rpc.ankr.com/eth']

      const client1 = clientFromChain({ chain: mockChain, urls: urls1 })
      const client2 = clientFromChain({ chain: mockChain, urls: urls2 })

      // Should be different clients
      expect(client1).not.toBe(client2)
    })

    it('should create new client for different chain', () => {
      const urls = ['https://eth.llamarpc.com']
      const chain2: Chain = {
        ...mockChain,
        id: 369,
        name: 'PulseChain',
      }

      const client1 = clientFromChain({ chain: mockChain, urls })
      const client2 = clientFromChain({ chain: chain2, urls })

      // Should be different clients
      expect(client1).not.toBe(client2)
    })
  })
})
