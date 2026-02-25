import { describe, it, expect, vi, beforeEach } from 'vitest'
import { multicallRead } from './multicall'
import type { PublicClient, Chain, Hex } from 'viem'
import { erc20Abi } from 'viem'

// Mock viem functions
vi.mock('viem', async () => {
  const actual = await vi.importActual<typeof import('viem')>('viem')
  return {
    ...actual,
    getContract: vi.fn(() => ({
      read: {
        aggregate3: vi.fn(),
      },
    })),
    encodeFunctionData: vi.fn(() => '0xENCODED_DATA' as Hex),
    decodeFunctionResult: vi.fn((params: any) => {
      // Return different mock data based on function name
      if (params.functionName === 'name') return 'Test Token'
      if (params.functionName === 'symbol') return 'TST'
      if (params.functionName === 'decimals') return 18
      if (params.functionName === 'balanceOf') return 1000000000000000000n
      return 'MOCK_RESULT'
    }),
  }
})

describe('multicall', () => {
  let mockClient: PublicClient
  let mockChain: Chain

  beforeEach(() => {
    mockChain = {
      id: 1,
      name: 'Ethereum',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: {
        default: { http: ['https://eth.llamarpc.com'] },
      },
      contracts: {
        multicall3: {
          address: '0xcA11bde05977b3631167028862bE2a173976CA11',
        },
      },
    } as Chain

    mockClient = {
      chain: mockChain,
    } as PublicClient
  })

  describe('multicallRead', () => {
    it('should successfully read multiple calls', async () => {
      const mockAggregate3 = vi.fn().mockResolvedValue([
        { success: true, returnData: '0xRESULT1' as Hex },
        { success: true, returnData: '0xRESULT2' as Hex },
        { success: true, returnData: '0xRESULT3' as Hex },
      ])

      const { getContract } = await import('viem')
      ;(getContract as any).mockReturnValue({
        read: {
          aggregate3: mockAggregate3,
        },
      })

      const result = await multicallRead({
        chain: mockChain,
        client: mockClient,
        abi: erc20Abi,
        target: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as Hex,
        calls: [
          { functionName: 'name' },
          { functionName: 'symbol' },
          { functionName: 'decimals' },
        ],
      })

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(3)
    })

    it('should handle calls with arguments', async () => {
      const mockAggregate3 = vi.fn().mockResolvedValue([
        { success: true, returnData: '0xRESULT1' as Hex },
      ])

      const { getContract } = await import('viem')
      ;(getContract as any).mockReturnValue({
        read: {
          aggregate3: mockAggregate3,
        },
      })

      const result = await multicallRead({
        chain: mockChain,
        client: mockClient,
        abi: erc20Abi,
        target: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as Hex,
        calls: [
          {
            functionName: 'balanceOf',
            args: ['0x1111111111111111111111111111111111111111' as Hex],
          },
        ],
      })

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    it('should handle calls with allowFailure and failure', async () => {
      const mockAggregate3 = vi.fn().mockResolvedValue([
        { success: false, returnData: '0xERROR' as Hex },
        { success: true, returnData: '0xRESULT2' as Hex },
      ])

      const { getContract } = await import('viem')
      ;(getContract as any).mockReturnValue({
        read: {
          aggregate3: mockAggregate3,
        },
      })

      const result = await multicallRead({
        chain: mockChain,
        client: mockClient,
        abi: erc20Abi,
        target: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as Hex,
        calls: [
          { functionName: 'name', allowFailure: true },
          { functionName: 'symbol', allowFailure: false },
        ],
      })

      expect(result).toBeDefined()
      expect(result[0]).toBe('0xERROR') // Failed call returns returnData
      expect(result[1]).toBe('TST') // Successful call returns decoded result (symbol mock)
    })

    it('should handle calls with allowFailure and success', async () => {
      const mockAggregate3 = vi.fn().mockResolvedValue([
        { success: true, returnData: '0xRESULT1' as Hex },
        { success: true, returnData: '0xRESULT2' as Hex },
      ])

      const { getContract } = await import('viem')
      ;(getContract as any).mockReturnValue({
        read: {
          aggregate3: mockAggregate3,
        },
      })

      const result = await multicallRead({
        chain: mockChain,
        client: mockClient,
        abi: erc20Abi,
        target: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as Hex,
        calls: [
          { functionName: 'name', allowFailure: true }, // success=true, allowFailure=true -> decode
          { functionName: 'symbol', allowFailure: false },
        ],
      })

      expect(result).toBeDefined()
      expect(result[0]).toBe('Test Token') // Successful call with allowFailure=true returns decoded result
      expect(result[1]).toBe('TST') // Successful call returns decoded result
    })

    it('should handle calls with custom target addresses', async () => {
      const mockAggregate3 = vi.fn().mockResolvedValue([
        { success: true, returnData: '0xRESULT1' as Hex },
        { success: true, returnData: '0xRESULT2' as Hex },
      ])

      const { getContract } = await import('viem')
      ;(getContract as any).mockReturnValue({
        read: {
          aggregate3: mockAggregate3,
        },
      })

      const result = await multicallRead({
        chain: mockChain,
        client: mockClient,
        abi: erc20Abi,
        target: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as Hex,
        calls: [
          {
            functionName: 'name',
            target: '0x2222222222222222222222222222222222222222' as Hex,
          },
          { functionName: 'symbol' }, // Uses default target
        ],
      })

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    it('should handle calls with custom ABIs', async () => {
      const customAbi = [
        {
          name: 'customFunction',
          type: 'function',
          inputs: [],
          outputs: [{ type: 'string' }],
          stateMutability: 'view',
        },
      ] as const

      const mockAggregate3 = vi.fn().mockResolvedValue([
        { success: true, returnData: '0xRESULT1' as Hex },
      ])

      const { getContract } = await import('viem')
      ;(getContract as any).mockReturnValue({
        read: {
          aggregate3: mockAggregate3,
        },
      })

      const result = await multicallRead({
        chain: mockChain,
        client: mockClient,
        abi: erc20Abi,
        target: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as Hex,
        calls: [
          {
            functionName: 'customFunction',
            abi: customAbi as any,
          },
        ],
      })

      expect(result).toBeDefined()
    })

    it('should throw error and log when aggregate3 fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const mockError = new Error('Multicall failed')

      const mockAggregate3 = vi.fn().mockRejectedValue(mockError)

      const { getContract } = await import('viem')
      ;(getContract as any).mockReturnValue({
        read: {
          aggregate3: mockAggregate3,
        },
      })

      await expect(
        multicallRead({
          chain: mockChain,
          client: mockClient,
          abi: erc20Abi,
          target: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as Hex,
          calls: [{ functionName: 'name' }],
        }),
      ).rejects.toThrow('Multicall failed')

      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })
  })
})
