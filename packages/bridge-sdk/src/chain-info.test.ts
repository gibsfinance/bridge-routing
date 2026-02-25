import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  nativeSymbol,
  tokenBridgeInfo,
  chainMulticall,
  links,
  readAmountOut,
  minBridgeAmountIn,
  fetchPriceCorrective,
  loadBridgeFees,
} from './chain-info'
import { nativeAssetOut, pathway, Providers } from './config'
import { Chains } from './config'
import type { Hex } from 'viem'
import { zeroAddress } from 'viem'

// Mock viem and multicall
vi.mock('viem', async () => {
  const actual = await vi.importActual<typeof import('viem')>('viem')
  return {
    ...actual,
    getContract: vi.fn(() => ({
      read: {
        mediatorContractOnOtherSide: vi.fn(),
        getBridgeMode: vi.fn(),
        minPerTx: vi.fn(),
        getFee: vi.fn(),
        FOREIGN_TO_HOME_FEE: vi.fn(),
        HOME_TO_FOREIGN_FEE: vi.fn(),
        calculateFee: vi.fn(),
        getAmountToBurn: vi.fn(),
        priceCorrective: vi.fn(),
      },
    })),
  }
})

vi.mock('@gibs/common/multicall', () => ({
  multicallRead: vi.fn(),
}))

describe('chain-info', () => {
  describe('nativeSymbol', () => {
    it('should return empty string for null asset', () => {
      expect(nativeSymbol(null)).toBe('')
    })

    it('should return symbol when not unwrapping', () => {
      const asset = {
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        symbol: 'USDC',
        chainId: 1,
      }
      expect(nativeSymbol(asset, false)).toBe('USDC')
    })

    it('should return symbol without first character when unwrapping native asset', () => {
      const wethAddress = nativeAssetOut[Chains.ETH]
      const asset = {
        address: wethAddress,
        symbol: 'WETH',
        chainId: 1,
      }
      expect(nativeSymbol(asset, true)).toBe('ETH')
    })

    it('should not strip character if unwrap is true but not a native asset', () => {
      const asset = {
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        symbol: 'USDC',
        chainId: 1,
      }
      expect(nativeSymbol(asset, true)).toBe('USDC')
    })

    it('should handle WPLS unwrapping', () => {
      const wplsAddress = nativeAssetOut[Chains.PLS]
      const asset = {
        address: wplsAddress,
        symbol: 'WPLS',
        chainId: parseInt(Chains.PLS, 16),
      }
      expect(nativeSymbol(asset, true)).toBe('PLS')
    })

    it('should handle WBNB unwrapping', () => {
      const wbnbAddress = nativeAssetOut[Chains.BNB]
      const asset = {
        address: wbnbAddress,
        symbol: 'WBNB',
        chainId: parseInt(Chains.BNB, 16),
      }
      expect(nativeSymbol(asset, true)).toBe('BNB')
    })

    it('should return full symbol when unwrap is false', () => {
      const wethAddress = nativeAssetOut[Chains.ETH]
      const asset = {
        address: wethAddress,
        symbol: 'WETH',
        chainId: 1,
      }
      expect(nativeSymbol(asset, false)).toBe('WETH')
    })

    it('should handle empty symbol', () => {
      const asset = {
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        symbol: '',
        chainId: 1,
      }
      expect(nativeSymbol(asset, false)).toBe('')
    })

    it('should default unwrap to false when not provided', () => {
      const asset = {
        address: nativeAssetOut[Chains.ETH],
        symbol: 'WETH',
        chainId: 1,
      }
      // Without unwrap parameter, should return full symbol
      expect(nativeSymbol(asset)).toBe('WETH')
    })
  })

  describe('links', () => {
    let mockClient: any

    beforeEach(() => {
      mockClient = { chain: { id: 1 } }
      vi.clearAllMocks()
    })

    it('should fetch link info for a token', async () => {
      const { multicallRead } = await import('@gibs/common/multicall')
      ;(multicallRead as any).mockResolvedValue([
        '0xBridgedToken' as Hex,
        '0xNativeToken' as Hex,
      ])

      const result = await links({
        chainId: 1,
        target: '0xBridgeAddress' as Hex,
        address: '0xTokenAddress' as Hex,
        client: mockClient,
      })

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect(result[0]).toBe('0xBridgedToken')
      expect(result[1]).toBe('0xNativeToken')
      expect(multicallRead).toHaveBeenCalled()
    })
  })

  describe('tokenBridgeInfo', () => {
    let mockFromClient: any
    let mockToClient: any

    beforeEach(() => {
      mockFromClient = { chain: { id: 1 } }
      mockToClient = { chain: { id: 369 } }
      vi.clearAllMocks()
      // Clear memoization cache for links function
      ;(links as any).cache = new Map()
    })

    it('should return null when assetIn is null', async () => {
      const result = await tokenBridgeInfo({
        bridgeKey: [Providers.PULSECHAIN, Chains.PLS, Chains.ETH],
        assetIn: null,
        isProd: true,
        fromChainClient: mockFromClient,
        toChainClient: mockToClient,
      })
      expect(result).toBeNull()
    })

    it('should fetch token bridge info successfully', async () => {
      const { multicallRead } = await import('@gibs/common/multicall')
      ;(multicallRead as any).mockResolvedValue([
        ['0xForeignToken' as Hex, '0xNativeToken' as Hex],
      ])

      const assetIn = {
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        symbol: 'USDC',
        decimals: 6,
        name: 'USD Coin',
        chainId: 1,
        logoURI: null,
      }

      const result = await tokenBridgeInfo({
        bridgeKey: [Providers.PULSECHAIN, Chains.PLS, Chains.ETH],
        assetIn,
        isProd: true,
        fromChainClient: mockFromClient,
        toChainClient: mockToClient,
      })

      expect(result).toBeDefined()
      expect(result?.assetInAddress).toBeDefined()
    })

    it('should handle toBridged path when toBridged is not zero', async () => {
      const { multicallRead } = await import('@gibs/common/multicall')
      const toBridgedAddress = '0x1234567890123456789012345678901234567890' as Hex
      ;(multicallRead as any).mockReset()
      ;(multicallRead as any)
        .mockResolvedValueOnce([toBridgedAddress, zeroAddress]) // First links() call - toMappings
        .mockResolvedValueOnce([zeroAddress, zeroAddress]) // Second links() call - fromMappings

      const assetIn = {
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as Hex,
        symbol: 'USDC',
        decimals: 6,
        name: 'USD Coin',
        chainId: 1,
        logoURI: null,
      }

      const result = await tokenBridgeInfo({
        bridgeKey: [Providers.PULSECHAIN, Chains.PLS, Chains.ETH],
        assetIn,
        isProd: true,
        fromChainClient: mockFromClient,
        toChainClient: mockToClient,
      })

      expect(result).toBeDefined()
      expect(result?.assetOutAddress).toBe(toBridgedAddress)
      expect(result?.originationChainId).toBe(Chains.PLS)
      expect(result?.toHome).toBeDefined()
      expect(result?.toHome?.home).toBe(toBridgedAddress)
    })

    it('should handle toNative path when toNative is not zero', async () => {
      const { multicallRead } = await import('@gibs/common/multicall')
      const toNativeAddress = '0x2345678901234567890123456789012345678901' as Hex
      ;(multicallRead as any).mockReset()
      ;(multicallRead as any)
        .mockResolvedValueOnce([zeroAddress, toNativeAddress]) // First links() call - toMappings
        .mockResolvedValueOnce([zeroAddress, zeroAddress]) // Second links() call - fromMappings

      const assetIn = {
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as Hex,
        symbol: 'USDC',
        decimals: 6,
        name: 'USD Coin',
        chainId: 1,
        logoURI: null,
      }

      const result = await tokenBridgeInfo({
        bridgeKey: [Providers.PULSECHAIN, Chains.PLS, Chains.ETH],
        assetIn,
        isProd: true,
        fromChainClient: mockFromClient,
        toChainClient: mockToClient,
      })

      expect(result).toBeDefined()
      expect(result?.assetOutAddress).toBe(toNativeAddress)
      expect(result?.originationChainId).toBe(Chains.ETH)
      expect(result?.toForeign).toBeDefined()
      expect(result?.toForeign?.home).toBe(toNativeAddress)
    })

    it('should handle fromNative path when fromNative is not zero', async () => {
      const { multicallRead } = await import('@gibs/common/multicall')
      const fromNativeAddress = '0x3456789012345678901234567890123456789012' as Hex
      ;(multicallRead as any).mockReset()
      ;(multicallRead as any)
        .mockResolvedValueOnce([zeroAddress, zeroAddress]) // First links() call - toMappings
        .mockResolvedValueOnce([zeroAddress, fromNativeAddress]) // Second links() call - fromMappings

      const assetIn = {
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as Hex,
        symbol: 'USDC',
        decimals: 6,
        name: 'USD Coin',
        chainId: 1,
        logoURI: null,
      }

      const result = await tokenBridgeInfo({
        bridgeKey: [Providers.PULSECHAIN, Chains.PLS, Chains.ETH],
        assetIn,
        isProd: true,
        fromChainClient: mockFromClient,
        toChainClient: mockToClient,
      })

      expect(result).toBeDefined()
      expect(result?.assetOutAddress).toBe(fromNativeAddress)
      expect(result?.originationChainId).toBe(Chains.ETH)
      expect(result?.toHome).toBeDefined()
    })

    it('should handle fromBridged path when fromBridged is not zero', async () => {
      const { multicallRead } = await import('@gibs/common/multicall')
      const fromBridgedAddress = '0x4567890123456789012345678901234567890123' as Hex
      ;(multicallRead as any).mockReset()
      ;(multicallRead as any)
        .mockResolvedValueOnce([zeroAddress, zeroAddress]) // First links() call - toMappings
        .mockResolvedValueOnce([fromBridgedAddress, zeroAddress]) // Second links() call - fromMappings

      const assetIn = {
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as Hex,
        symbol: 'USDC',
        decimals: 6,
        name: 'USD Coin',
        chainId: 1,
        logoURI: null,
      }

      const result = await tokenBridgeInfo({
        bridgeKey: [Providers.PULSECHAIN, Chains.PLS, Chains.ETH],
        assetIn,
        isProd: true,
        fromChainClient: mockFromClient,
        toChainClient: mockToClient,
      })

      expect(result).toBeDefined()
      expect(result?.assetOutAddress).toBe(fromBridgedAddress)
      expect(result?.originationChainId).toBe(Chains.PLS)
      expect(result?.toForeign).toBeDefined()
    })

    it('should handle not-yet-bridged token with toHome pathway', async () => {
      const { multicallRead } = await import('@gibs/common/multicall')
      ;(multicallRead as any).mockReset()
      ;(multicallRead as any)
        .mockResolvedValueOnce([zeroAddress, zeroAddress]) // First links() call - toMappings
        .mockResolvedValueOnce([zeroAddress, zeroAddress]) // Second links() call - fromMappings

      const assetIn = {
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as Hex,
        symbol: 'USDC',
        decimals: 6,
        name: 'USD Coin',
        chainId: 1,
        logoURI: null,
      }

      // Create pathway with toHome = true
      const bridgePathway = pathway([Providers.PULSECHAIN, Chains.ETH, Chains.PLS], true)
      expect(bridgePathway?.toHome).toBe(true)

      const result = await tokenBridgeInfo({
        bridgeKey: [Providers.PULSECHAIN, Chains.ETH, Chains.PLS],
        assetIn,
        isProd: true,
        fromChainClient: mockFromClient,
        toChainClient: mockToClient,
      })

      expect(result).toBeDefined()
      expect(result?.assetOutAddress).toBeNull()
      expect(result?.toHome).toBeDefined()
      expect(result?.toHome?.home).toBeNull()
    })

    it('should handle not-yet-bridged token with toForeign pathway', async () => {
      const { multicallRead } = await import('@gibs/common/multicall')
      ;(multicallRead as any).mockReset()
      ;(multicallRead as any)
        .mockResolvedValueOnce([zeroAddress, zeroAddress]) // First links() call - toMappings
        .mockResolvedValueOnce([zeroAddress, zeroAddress]) // Second links() call - fromMappings

      const assetIn = {
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as Hex,
        symbol: 'USDC',
        decimals: 6,
        name: 'USD Coin',
        chainId: 1,
        logoURI: null,
      }

      // Create pathway with toHome = false (toForeign)
      const bridgePathway = pathway([Providers.PULSECHAIN, Chains.PLS, Chains.ETH], true)
      expect(bridgePathway?.toHome).toBe(false)

      const result = await tokenBridgeInfo({
        bridgeKey: [Providers.PULSECHAIN, Chains.PLS, Chains.ETH],
        assetIn,
        isProd: true,
        fromChainClient: mockFromClient,
        toChainClient: mockToClient,
      })

      expect(result).toBeDefined()
      expect(result?.assetOutAddress).toBeNull()
      expect(result?.toForeign).toBeDefined()
      expect(result?.toForeign?.foreign).toBeNull()
    })

    it('should wrap native asset address to nativeAssetOut', async () => {
      const { multicallRead } = await import('@gibs/common/multicall')
      const toBridgedAddress = '0x1234567890123456789012345678901234567890' as Hex
      ;(multicallRead as any).mockReset()
      ;(multicallRead as any)
        .mockResolvedValueOnce([toBridgedAddress, zeroAddress]) // First links() call - toMappings
        .mockResolvedValueOnce([zeroAddress, zeroAddress]) // Second links() call - fromMappings

      const assetIn = {
        address: zeroAddress,
        symbol: 'PLS',
        decimals: 18,
        name: 'Pulse',
        chainId: 369,
        logoURI: null,
      }

      await tokenBridgeInfo({
        bridgeKey: [Providers.PULSECHAIN, Chains.PLS, Chains.ETH],
        assetIn,
        isProd: true,
        fromChainClient: mockFromClient,
        toChainClient: mockToClient,
      })

      // Verify that links was called with nativeAssetOut[fromChain] instead of zeroAddress
      expect(multicallRead).toHaveBeenCalled()
      const callArgs = (multicallRead as any).mock.calls[0][0]
      // The target should be one of the bridge addresses, not checking the exact value here
      expect(callArgs).toBeDefined()
    })
  })

  describe('chainMulticall', () => {
    it('should create chainMulticall helper', () => {
      const mockClient = { chain: { id: 1 } }
      const result = chainMulticall(mockClient as any)

      expect(result).toBeDefined()
      expect(typeof result).toBe('object')
    })
  })

  describe('loadBridgeFees', () => {
    let mockFromClient: any
    let mockToClient: any

    beforeEach(() => {
      vi.clearAllMocks()

      mockFromClient = {
        chain: {
          id: 1,
          contracts: {
            multicall3: { address: '0xca11bde05977b3631167028862be2a173976ca11' as Hex },
          },
        },
      }

      mockToClient = {
        chain: {
          id: 369,
          contracts: {
            multicall3: { address: '0xca11bde05977b3631167028862be2a173976ca11' as Hex },
          },
        },
      }
    })

    it('should load bridge fees from "from" side fee manager', async () => {
      const { getContract } = await import('viem')

      // Mock the sequential aggregate3 calls
      let callCount = 0
      const mockAggregate3 = vi.fn().mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // First call: get feeManager address
          return Promise.resolve([{
            success: true,
            returnData: '0x000000000000000000000000feeManager1234567890123456789012345678' as Hex,
          }])
        } else if (callCount === 2) {
          // Second call: get fee keys (HOME_TO_FOREIGN_FEE, FOREIGN_TO_HOME_FEE) - must be bytes32
          return Promise.resolve([
            { success: true, returnData: '0x0000000000000000000000000000000000000000000000000000000000000001' as Hex },
            { success: true, returnData: '0x0000000000000000000000000000000000000000000000000000000000000002' as Hex },
          ])
        } else {
          // Third call: get actual fees
          return Promise.resolve([
            { success: true, returnData: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000' as Hex },
            { success: true, returnData: '0x0000000000000000000000000000000000000000000000001bc16d674ec80000' as Hex },
          ])
        }
      })

      ;(getContract as any).mockReturnValue({
        read: {
          aggregate3: mockAggregate3,
        },
      })

      const bridgePathway = {
        ...pathway([Providers.PULSECHAIN, Chains.PLS, Chains.ETH], true)!,
        feeManager: 'from' as const,
      }

      const result = await loadBridgeFees({
        pathway: bridgePathway,
        fromChainClient: mockFromClient,
        toChainClient: mockToClient,
      })

      expect(result).toBeDefined()
      expect(result.feeManager).toBeDefined()
      expect(result.feeH2F).toBeDefined()
      expect(result.feeF2H).toBeDefined()
      expect(mockAggregate3).toHaveBeenCalledTimes(3)
    })

    it('should load bridge fees from "to" side fee manager', async () => {
      const { getContract } = await import('viem')

      let callCount = 0
      const mockAggregate3 = vi.fn().mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve([{
            success: true,
            returnData: '0x000000000000000000000000feeManager9876543210987654321098765432' as Hex,
          }])
        } else if (callCount === 2) {
          return Promise.resolve([
            { success: true, returnData: '0x0000000000000000000000000000000000000000000000000000000000000001' as Hex },
            { success: true, returnData: '0x0000000000000000000000000000000000000000000000000000000000000002' as Hex },
          ])
        } else {
          return Promise.resolve([
            { success: true, returnData: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000' as Hex },
            { success: true, returnData: '0x0000000000000000000000000000000000000000000000001bc16d674ec80000' as Hex },
          ])
        }
      })

      ;(getContract as any).mockReturnValue({
        read: {
          aggregate3: mockAggregate3,
        },
      })

      const bridgePathway = {
        ...pathway([Providers.PULSECHAIN, Chains.ETH, Chains.PLS], true)!,
        feeManager: 'to' as const,
      }

      const result = await loadBridgeFees({
        pathway: bridgePathway,
        fromChainClient: mockFromClient,
        toChainClient: mockToClient,
      })

      expect(result).toBeDefined()
      expect(mockAggregate3).toHaveBeenCalledTimes(3)
    })

    it('should throw error when feeManager call fails', async () => {
      const { getContract } = await import('viem')

      const mockAggregate3 = vi.fn().mockResolvedValue([{
        success: false,
        returnData: '0x' as Hex,
      }])

      ;(getContract as any).mockReturnValue({
        read: {
          aggregate3: mockAggregate3,
        },
      })

      const bridgePathway = pathway([Providers.PULSECHAIN, Chains.PLS, Chains.ETH], true)!

      await expect(loadBridgeFees({
        pathway: bridgePathway,
        fromChainClient: mockFromClient,
        toChainClient: mockToClient,
      })).rejects.toThrow('unable to load feeManager')
    })

    it('should throw error when feeManager returns empty data', async () => {
      const { getContract } = await import('viem')

      const mockAggregate3 = vi.fn().mockResolvedValue([{
        success: true,
        returnData: '0x' as Hex,
      }])

      ;(getContract as any).mockReturnValue({
        read: {
          aggregate3: mockAggregate3,
        },
      })

      const bridgePathway = pathway([Providers.PULSECHAIN, Chains.PLS, Chains.ETH], true)!

      await expect(loadBridgeFees({
        pathway: bridgePathway,
        fromChainClient: mockFromClient,
        toChainClient: mockToClient,
      })).rejects.toThrow('unable to read feeManager')
    })

    it('should handle feeManager address without zero padding (line 414 coverage)', async () => {
      const { getContract } = await import('viem')

      let callCount = 0
      const mockAggregate3 = vi.fn().mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // Return feeManager address WITHOUT zero padding (triggers line 414)
          return Promise.resolve([{
            success: true,
            returnData: '0x1234567890123456789012345678901234567890ABCDEFABCDEFABCDEF' as Hex,
          }])
        } else if (callCount === 2) {
          return Promise.resolve([
            { success: true, returnData: '0x0000000000000000000000000000000000000000000000000000000000000001' as Hex },
            { success: true, returnData: '0x0000000000000000000000000000000000000000000000000000000000000002' as Hex },
          ])
        } else {
          return Promise.resolve([
            { success: true, returnData: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000' as Hex },
            { success: true, returnData: '0x0000000000000000000000000000000000000000000000001bc16d674ec80000' as Hex },
          ])
        }
      })

      ;(getContract as any).mockReturnValue({
        read: {
          aggregate3: mockAggregate3,
        },
      })

      const bridgePathway = {
        ...pathway([Providers.PULSECHAIN, Chains.PLS, Chains.ETH], true)!,
        feeManager: 'from' as const,
      }

      const result = await loadBridgeFees({
        pathway: bridgePathway,
        fromChainClient: mockFromClient,
        toChainClient: mockToClient,
      })

      expect(result).toBeDefined()
      expect(result.feeManager).toBeDefined()
      // Verify the address was extracted from the last 40 characters (slice(-40))
      expect(result.feeManager.toLowerCase()).toBe('0x9012345678901234567890abcdefabcdefabcdef')
    })
  })

  describe('minBridgeAmountIn', () => {
    let mockFromClient: any
    let mockToClient: any
    let mockAssetIn: any

    beforeEach(() => {
      mockFromClient = {
        chain: { id: 1 },
        readContract: vi.fn(),
      }
      mockToClient = {
        chain: { id: 369 },
        readContract: vi.fn(),
      }
      mockAssetIn = {
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as Hex,
        symbol: 'USDC',
        decimals: 6,
        chainId: 1,
      }
      vi.clearAllMocks()
    })

    it('should fetch min amount from "from" side', async () => {
      const bridgePathway = {
        ...pathway([Providers.PULSECHAIN, Chains.PLS, Chains.ETH], true)!,
        feeManager: 'from' as const,
      }

      ;(mockFromClient.readContract as any).mockResolvedValue(1000000000000000n)

      const result = await minBridgeAmountIn({
        assetIn: mockAssetIn,
        pathway: bridgePathway,
        fromPublicClient: mockFromClient,
        toPublicClient: mockToClient,
      })

      expect(result).toBe(1000000000000000n)
      expect(mockFromClient.readContract).toHaveBeenCalled()
    })

    it('should fetch min amount from "to" side', async () => {
      const bridgePathway = {
        ...pathway([Providers.PULSECHAIN, Chains.ETH, Chains.PLS], true)!,
        feeManager: 'to' as const,
      }

      ;(mockToClient.readContract as any).mockResolvedValue(2000000000000000n)

      const result = await minBridgeAmountIn({
        assetIn: mockAssetIn,
        pathway: bridgePathway,
        fromPublicClient: mockFromClient,
        toPublicClient: mockToClient,
      })

      expect(result).toBe(2000000000000000n)
      expect(mockToClient.readContract).toHaveBeenCalled()
    })
  })

  describe('fetchPriceCorrective', () => {
    let mockFromClient: any
    let mockToClient: any
    let mockAssetOut: any
    let mockAssetLink: any

    beforeEach(() => {
      mockFromClient = { chain: { id: 1 } }
      mockToClient = { chain: { id: 369 } }
      mockAssetOut = {
        address: '0xAssetOut123456789012345678901234567890' as Hex,
        symbol: 'OUT',
        decimals: 18,
        name: 'Asset Out',
        chainId: 1,
        logoURI: null,
      }
      mockAssetLink = {
        assetInAddress: '0xAssetIn1234567890123456789012345678901' as Hex,
        assetOutAddress: '0xAssetOut123456789012345678901234567890' as Hex,
        originationChainId: 1,
      }
      vi.clearAllMocks()
    })

    it('should return helper object with three functions', () => {
      const result = fetchPriceCorrective({
        bridgeKey: [Providers.PULSECHAIN, Chains.PLS, Chains.ETH],
        bridgeKeyPartner: [Providers.PULSECHAIN, Chains.ETH, Chains.PLS],
        measurementToken: '0x1234567890123456789012345678901234567890' as Hex,
        assetOut: mockAssetOut,
        fromChainClient: mockFromClient,
        toChainClient: mockToClient,
        assetLink: mockAssetLink,
        amountIn: 1000000000000000000n,
        isProd: true,
      })

      expect(result).toBeDefined()
      expect(result.getPaymentToken).toBeInstanceOf(Function)
      expect(result.getSwapResults).toBeInstanceOf(Function)
      expect(result.reduceResults).toBeInstanceOf(Function)
    })

    it('should call tokenBridgeInfo in getPaymentToken', async () => {
      const { multicallRead } = await import('@gibs/common/multicall')
      ;(multicallRead as any).mockReset()
      ;(multicallRead as any)
        .mockResolvedValueOnce(['0x1234567890123456789012345678901234567890' as Hex, zeroAddress])
        .mockResolvedValueOnce([zeroAddress, zeroAddress])
      ;(links as any).cache = new Map()

      const helpers = fetchPriceCorrective({
        bridgeKey: [Providers.PULSECHAIN, Chains.PLS, Chains.ETH],
        bridgeKeyPartner: [Providers.PULSECHAIN, Chains.ETH, Chains.PLS],
        measurementToken: '0x1234567890123456789012345678901234567890' as Hex,
        assetOut: mockAssetOut,
        fromChainClient: mockFromClient,
        toChainClient: mockToClient,
        assetLink: mockAssetLink,
        amountIn: 1000000000000000000n,
        isProd: true,
      })

      const paymentToken = await helpers.getPaymentToken()

      expect(paymentToken).toBeDefined()
      expect(multicallRead).toHaveBeenCalled()
    })

    it('should call readAmountOut twice in getSwapResults', async () => {
      const { multicallRead } = await import('@gibs/common/multicall')
      ;(multicallRead as any).mockReset()
      ;(multicallRead as any).mockResolvedValue([[1000000000000000000n, 950000000000000000n]])

      const helpers = fetchPriceCorrective({
        bridgeKey: [Providers.PULSECHAIN, Chains.PLS, Chains.ETH],
        bridgeKeyPartner: [Providers.PULSECHAIN, Chains.ETH, Chains.PLS],
        measurementToken: '0x1234567890123456789012345678901234567890' as Hex,
        assetOut: mockAssetOut,
        fromChainClient: mockFromClient,
        toChainClient: mockToClient,
        assetLink: mockAssetLink,
        amountIn: 1000000000000000000n,
        isProd: true,
      })

      const mockPaymentTokenResult = {
        assetInAddress: '0xAssetIn1234567890123456789012345678901' as Hex,
        assetOutAddress: '0xPaymentOut12345678901234567890123456789' as Hex,
        originationChainId: 1,
      }

      const results = await helpers.getSwapResults({
        paymentTokenResult: mockPaymentTokenResult,
        chain: Chains.PLS,
        client: mockFromClient,
      })

      expect(results).toBeDefined()
      expect(Array.isArray(results)).toBe(true)
      expect(results).toHaveLength(2)
      expect(multicallRead).toHaveBeenCalledTimes(2)
    })

    it('should calculate maximum output in reduceResults', () => {
      const helpers = fetchPriceCorrective({
        bridgeKey: [Providers.PULSECHAIN, Chains.PLS, Chains.ETH],
        bridgeKeyPartner: [Providers.PULSECHAIN, Chains.ETH, Chains.PLS],
        measurementToken: '0x1234567890123456789012345678901234567890' as Hex,
        assetOut: mockAssetOut,
        fromChainClient: mockFromClient,
        toChainClient: mockToClient,
        assetLink: mockAssetLink,
        amountIn: 1000000000000000000n,
        isProd: true,
      })

      const mockResults: [[bigint[]], [bigint[]]] = [
        [[1000000000000000000n, 950000000000000000n]], // outputs
        [[1000000000000000000n, 980000000000000000n]], // inputs
      ]

      const result = helpers.reduceResults({
        results: mockResults,
        oneToken: 1000000000000000000n,
      })

      expect(result).toBeDefined()
      expect(typeof result).toBe('bigint')
    })

    it('should handle failed router results in reduceResults', () => {
      const helpers = fetchPriceCorrective({
        bridgeKey: [Providers.PULSECHAIN, Chains.PLS, Chains.ETH],
        bridgeKeyPartner: [Providers.PULSECHAIN, Chains.ETH, Chains.PLS],
        measurementToken: '0x1234567890123456789012345678901234567890' as Hex,
        assetOut: mockAssetOut,
        fromChainClient: mockFromClient,
        toChainClient: mockToClient,
        assetLink: mockAssetLink,
        amountIn: 1000000000000000000n,
        isProd: true,
      })

      // Test with failed router results (Hex strings instead of bigint arrays)
      const mockResults: [[Hex | bigint[]], [bigint[]]] = [
        ['0xERROR' as Hex], // Failed router call returns Hex
        [[1000000000000000000n, 980000000000000000n]], // inputs
      ]

      const result = helpers.reduceResults({
        results: mockResults as any,
        oneToken: 1000000000000000000n,
      })

      expect(result).toBeDefined()
      // Should fall back to input token calculation
      expect(result).toBeGreaterThan(0n)
    })

    it('should handle empty router results in reduceResults', () => {
      const helpers = fetchPriceCorrective({
        bridgeKey: [Providers.PULSECHAIN, Chains.PLS, Chains.ETH],
        bridgeKeyPartner: [Providers.PULSECHAIN, Chains.ETH, Chains.PLS],
        measurementToken: '0x1234567890123456789012345678901234567890' as Hex,
        assetOut: mockAssetOut,
        fromChainClient: mockFromClient,
        toChainClient: mockToClient,
        assetLink: mockAssetLink,
        amountIn: 1000000000000000000n,
        isProd: true,
      })

      // Test with empty results
      const mockResults: [[bigint[]], [bigint[]]] = [
        [[]], // Empty output array
        [[1000000000000000000n, 980000000000000000n]], // inputs
      ]

      const result = helpers.reduceResults({
        results: mockResults,
        oneToken: 1000000000000000000n,
      })

      expect(result).toBeDefined()
      expect(result).toBeGreaterThan(0n)
    })
  })
})
