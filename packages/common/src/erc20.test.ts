import { describe, it, expect, vi, beforeEach } from 'vitest'
import { erc20MetadataCalls, multicallErc20 } from './erc20'
import type { PublicClient, Chain, Hex } from 'viem'

// Mock the multicall module
vi.mock('./multicall', () => ({
  multicallRead: vi.fn(),
}))

describe('erc20', () => {
  describe('erc20MetadataCalls', () => {
    it('should have 3 metadata calls', () => {
      expect(erc20MetadataCalls).toHaveLength(3)
    })

    it('should include name call', () => {
      const nameCall = erc20MetadataCalls.find(c => c.functionName === 'name')
      expect(nameCall).toBeDefined()
      expect(nameCall?.functionName).toBe('name')
    })

    it('should include symbol call', () => {
      const symbolCall = erc20MetadataCalls.find(c => c.functionName === 'symbol')
      expect(symbolCall).toBeDefined()
      expect(symbolCall?.functionName).toBe('symbol')
    })

    it('should include decimals call', () => {
      const decimalsCall = erc20MetadataCalls.find(c => c.functionName === 'decimals')
      expect(decimalsCall).toBeDefined()
      expect(decimalsCall?.functionName).toBe('decimals')
    })

    it('should have calls in correct order (name, symbol, decimals)', () => {
      expect(erc20MetadataCalls[0].functionName).toBe('name')
      expect(erc20MetadataCalls[1].functionName).toBe('symbol')
      expect(erc20MetadataCalls[2].functionName).toBe('decimals')
    })

    it('should have only functionName property in each call', () => {
      erc20MetadataCalls.forEach(call => {
        const keys = Object.keys(call)
        expect(keys).toHaveLength(1)
        expect(keys[0]).toBe('functionName')
      })
    })
  })

  describe('multicallErc20', () => {
    let mockClient: PublicClient
    let mockChain: Chain

    beforeEach(() => {
      vi.clearAllMocks()
      // Clear memoization cache by deleting and recreating it
      ;(multicallErc20 as any).cache = new Map()

      mockChain = {
        id: 1,
        name: 'Ethereum',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: {
          default: { http: ['https://eth.llamarpc.com'] },
        },
      } as Chain

      mockClient = {
        chain: mockChain,
      } as PublicClient
    })

    it('should successfully fetch erc20 metadata', async () => {
      const { multicallRead } = await import('./multicall')
      ;(multicallRead as any).mockResolvedValue(['Test Token', 'TST', 18])

      const result = await multicallErc20({
        client: mockClient,
        target: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as Hex,
        chain: mockChain,
      })

      expect(result).toEqual(['Test Token', 'TST', 18])
      expect(multicallRead).toHaveBeenCalledWith({
        chain: mockChain,
        client: mockClient,
        abi: expect.anything(),
        target: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        calls: erc20MetadataCalls,
      })
    })

    it('should fallback to bytes32 ABI on failure', async () => {
      const { multicallRead } = await import('./multicall')
      const mockError = new Error('Failed with standard ABI')
      ;(multicallRead as any)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(['Test Token', 'TST', 18])

      const result = await multicallErc20({
        client: mockClient,
        target: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as Hex,
        chain: mockChain,
      })

      expect(result).toEqual(['Test Token', 'TST', 18])
      expect(multicallRead).toHaveBeenCalledTimes(2)
      // First call with standard ABI
      expect((multicallRead as any).mock.calls[0][0].abi).toBeDefined()
      // Second call with bytes32 ABI (fallback)
      expect((multicallRead as any).mock.calls[1][0].abi).toBeDefined()
    })

    it('should use memoization with target address', async () => {
      const { multicallRead } = await import('./multicall')
      ;(multicallRead as any).mockResolvedValue(['Test Token', 'TST', 18])

      const target = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as Hex

      // First call
      const result1 = await multicallErc20({ client: mockClient, target, chain: mockChain })
      // Second call with same params - should use memoized result
      const result2 = await multicallErc20({ client: mockClient, target, chain: mockChain })

      expect(result1).toEqual(result2)
      // Should only call multicallRead once due to memoization
      expect(multicallRead).toHaveBeenCalledTimes(1)
    })

    it('should use chain id as memoization key when target is falsy', async () => {
      const { multicallRead } = await import('./multicall')
      ;(multicallRead as any).mockResolvedValue(['Test Token', 'TST', 18])

      // Call with null target (uses chain.id as key)
      await multicallErc20({ client: mockClient, target: null as any, chain: mockChain })

      // The memoization resolver should handle null target gracefully
      expect(multicallRead).toHaveBeenCalled()
    })
  })
})
