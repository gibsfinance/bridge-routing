import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock viem functions
vi.mock('viem', async () => {
  const actual = await vi.importActual<typeof import('viem')>('viem')
  return {
    ...actual,
    encodeFunctionData: vi.fn(() => '0xMOCKED_FUNCTION_DATA' as any),
    encodeAbiParameters: vi.fn(() => '0xMOCKED_ABI_PARAMS' as any),
    concatHex: vi.fn((parts: any[]) => parts.join('') as any),
  }
})

import {
  amountAfterBridgeFee,
  basisPoints,
  oneEther,
  limit,
  oneTokenInt,
  interactingWithBridgeToken,
  assetOutKey,
  desiredCompensationRatio,
  amountToBridge,
  bridgeCost,
  networkSwitchAssetOutAddress,
  estimatedAmountOut,
  estimatedFee,
  assetOut,
  estimatedNativeNetworkCost,
  reasonablePercentOnGasLimit,
  reasonablePercentOnTopOfGasFee,
  estimatedTokenNetworkCost,
  desiredExcessCompensationBasisPoints,
  estimatedCost,
  reasonableFixedFee,
  reasonablePercentFee,
  availableCompensationMaximum,
  isUndercompensated,
  bridgePathway,
  destinationDataParam,
  feeDirectorStructEncoded,
  transactionInputs,
} from './settings'
import { Chains, nativeAssetOut, type Pathway } from './config'
import { FeeType } from './fee-type'
import { zeroAddress, getAddress, type Hex } from 'viem'
import type { Token, BridgeKey } from './types'

describe('settings', () => {
  describe('constants', () => {
    it('should have basisPoints as 10000', () => {
      expect(basisPoints).toBe(10_000n)
    })

    it('should have oneEther as 10^18', () => {
      expect(oneEther).toBe(1000000000000000000n)
      expect(oneEther).toBe(10n ** 18n)
    })
  })

  describe('limit', () => {
    it('should return 0 for null', () => {
      expect(limit(null)).toBe(0n)
    })

    it('should return 0 for falsy bigint', () => {
      expect(limit(0n)).toBe(0n)
    })

    it('should return the value for positive bigint', () => {
      expect(limit(1000n)).toBe(1000n)
      expect(limit(12345678901234567890n)).toBe(12345678901234567890n)
    })
  })

  describe('oneTokenInt', () => {
    it('should return 1n when assetIn is null', () => {
      expect(oneTokenInt({ assetIn: null })).toBe(1n)
    })

    it('should calculate 10^decimals for token', () => {
      const usdt = { decimals: 6, address: '0x123', chainId: 1, name: 'USDT', symbol: 'USDT' }
      expect(oneTokenInt({ assetIn: usdt })).toBe(1000000n) // 10^6
    })

    it('should handle 18 decimal tokens (standard ERC20)', () => {
      const dai = { decimals: 18, address: '0x456', chainId: 1, name: 'DAI', symbol: 'DAI' }
      expect(oneTokenInt({ assetIn: dai })).toBe(10n ** 18n)
    })

    it('should handle tokens with 0 decimals', () => {
      const token = { decimals: 0, address: '0x789', chainId: 1, name: 'TOKEN', symbol: 'TKN' }
      expect(oneTokenInt({ assetIn: token })).toBe(1n)
    })

    it('should handle tokens with large decimal values', () => {
      const token = { decimals: 24, address: '0xabc', chainId: 1, name: 'TOKEN', symbol: 'TKN' }
      expect(oneTokenInt({ assetIn: token })).toBe(10n ** 24n)
    })
  })

  describe('interactingWithBridgeToken', () => {
    const foreignAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    const homeAddress = '0xA1077a294dDE1B09bB078844df40758a5D0f9a27'

    it('should return false when assetInAddress is null', () => {
      const result = interactingWithBridgeToken({
        assetLink: null,
        assetInAddress: null,
      })
      expect(result).toBe(false)
    })

    it('should return false when assetLink is null', () => {
      const result = interactingWithBridgeToken({
        assetLink: null,
        assetInAddress: foreignAddress,
      })
      expect(result).toBe(false)
    })

    it('should return true when assetInAddress matches foreign address', () => {
      const assetLink = {
        toForeign: { foreign: foreignAddress },
        toHome: { home: homeAddress },
      }
      const result = interactingWithBridgeToken({
        assetLink: assetLink as any,
        assetInAddress: foreignAddress,
      })
      expect(result).toBe(true)
    })

    it('should return true when assetInAddress matches home address', () => {
      const assetLink = {
        toForeign: { foreign: foreignAddress },
        toHome: { home: homeAddress },
      }
      const result = interactingWithBridgeToken({
        assetLink: assetLink as any,
        assetInAddress: homeAddress,
      })
      expect(result).toBe(true)
    })

    it('should handle checksummed addresses correctly', () => {
      const assetLink = {
        toForeign: { foreign: foreignAddress.toLowerCase() },
        toHome: { home: homeAddress.toLowerCase() },
      }
      // Should match even with different casing due to getAddress checksumming
      const result = interactingWithBridgeToken({
        assetLink: assetLink as any,
        assetInAddress: foreignAddress, // checksummed
      })
      expect(result).toBe(true)
    })

    it('should return false when assetInAddress does not match either address', () => {
      const assetLink = {
        toForeign: { foreign: foreignAddress },
        toHome: { home: homeAddress },
      }
      const result = interactingWithBridgeToken({
        assetLink: assetLink as any,
        assetInAddress: '0x0000000000000000000000000000000000000000',
      })
      expect(result).toBe(false)
    })

    it('should return false when toForeign is missing', () => {
      const assetLink = {
        toHome: { home: homeAddress },
      }
      const result = interactingWithBridgeToken({
        assetLink: assetLink as any,
        assetInAddress: foreignAddress,
      })
      expect(result).toBe(false)
    })

    it('should return false when toHome is missing', () => {
      const assetLink = {
        toForeign: { foreign: foreignAddress },
      }
      const result = interactingWithBridgeToken({
        assetLink: assetLink as any,
        assetInAddress: homeAddress,
      })
      expect(result).toBe(false)
    })
  })

  describe('amountAfterBridgeFee', () => {
    it('should return null when bridgeCost is null', () => {
      const result = amountAfterBridgeFee({
        amountToBridge: 1000n,
        bridgeCost: null,
      })
      expect(result).toBeNull()
    })

    it('should calculate amount after fee correctly', () => {
      const result = amountAfterBridgeFee({
        amountToBridge: 1000n,
        bridgeCost: 100n,
      })
      expect(result).toBe(900n)
    })

    it('should return 0 when fee exceeds amount', () => {
      const result = amountAfterBridgeFee({
        amountToBridge: 100n,
        bridgeCost: 200n,
      })
      expect(result).toBe(0n)
    })

    it('should handle zero fee', () => {
      const result = amountAfterBridgeFee({
        amountToBridge: 1000n,
        bridgeCost: 0n,
      })
      expect(result).toBe(1000n)
    })

    it('should handle exact fee amount', () => {
      const result = amountAfterBridgeFee({
        amountToBridge: 1000n,
        bridgeCost: 1000n,
      })
      expect(result).toBe(0n)
    })

    it('should handle large amounts', () => {
      const largeAmount = 1000000000000000000n // 1 ETH in wei
      const largeFee = 10000000000000000n // 0.01 ETH
      const result = amountAfterBridgeFee({
        amountToBridge: largeAmount,
        bridgeCost: largeFee,
      })
      expect(result).toBe(largeAmount - largeFee)
    })

    it('should maintain precision with bigint', () => {
      const amount = 123456789012345678n
      const fee = 1n
      const result = amountAfterBridgeFee({
        amountToBridge: amount,
        bridgeCost: fee,
      })
      expect(result).toBe(123456789012345677n)
    })
  })

  describe('assetOutKey', () => {
    it('should return null when bridgeKeyPath is empty', () => {
      expect(assetOutKey({
        bridgeKeyPath: '',
        assetInAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        unwrap: false,
      })).toBeNull()
    })

    it('should return null when assetInAddress is null', () => {
      expect(assetOutKey({
        bridgeKeyPath: 'pulsechain/0x1/0x171',
        assetInAddress: null,
        unwrap: false,
      })).toBeNull()
    })

    it('should return null when assetInAddress is undefined', () => {
      expect(assetOutKey({
        bridgeKeyPath: 'pulsechain/0x1/0x171',
        assetInAddress: undefined,
        unwrap: false,
      })).toBeNull()
    })

    it('should create key for ERC20 asset', () => {
      const result = assetOutKey({
        bridgeKeyPath: 'pulsechain/0x1/0x171',
        assetInAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        unwrap: false,
      })
      expect(result).toBe('pulsechain/0x1/0x171/erc20/0xdac17f958d2ee523a2206206994597c13d831ec7')
    })

    it('should create key for native (unwrapped) asset', () => {
      const result = assetOutKey({
        bridgeKeyPath: 'pulsechain/0x1/0x171',
        assetInAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        unwrap: true,
      })
      expect(result).toBe('pulsechain/0x1/0x171/native/0xdac17f958d2ee523a2206206994597c13d831ec7')
    })

    it('should lowercase the address', () => {
      const result = assetOutKey({
        bridgeKeyPath: 'pulsechain/0x1/0x171',
        assetInAddress: '0xDAC17F958D2EE523A2206206994597C13D831EC7', // uppercase
        unwrap: false,
      })
      expect(result).toContain('0xdac17f958d2ee523a2206206994597c13d831ec7')
    })

    it('should handle different bridge paths', () => {
      const key1 = assetOutKey({
        bridgeKeyPath: 'pulsechain/0x1/0x171',
        assetInAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        unwrap: false,
      })
      const key2 = assetOutKey({
        bridgeKeyPath: 'tokensex/0x38/0x171',
        assetInAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        unwrap: false,
      })
      expect(key1).not.toBe(key2)
      expect(key1).toContain('pulsechain')
      expect(key2).toContain('tokensex')
    })

    it('should differentiate between native and erc20 for same asset', () => {
      const erc20Key = assetOutKey({
        bridgeKeyPath: 'pulsechain/0x1/0x171',
        assetInAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        unwrap: false,
      })
      const nativeKey = assetOutKey({
        bridgeKeyPath: 'pulsechain/0x1/0x171',
        assetInAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        unwrap: true,
      })
      expect(erc20Key).not.toBe(nativeKey)
      expect(erc20Key).toContain('/erc20/')
      expect(nativeKey).toContain('/native/')
    })
  })

  describe('desiredCompensationRatio', () => {
    it('should return oneEther when excess is 0', () => {
      const result = desiredCompensationRatio({
        desiredExcessCompensationBasisPoints: 0n,
      })
      expect(result).toBe(oneEther)
    })

    it('should calculate ratio for 10% excess (1000 basis points)', () => {
      const result = desiredCompensationRatio({
        desiredExcessCompensationBasisPoints: 1_000n,
      })
      // 1 ETH + (1000 * 1 ETH / 10000) = 1 ETH + 0.1 ETH = 1.1 ETH
      expect(result).toBe(oneEther + (1_000n * oneEther) / basisPoints)
      expect(result).toBe(1100000000000000000n) // 1.1 ETH
    })

    it('should calculate ratio for 50% excess (5000 basis points)', () => {
      const result = desiredCompensationRatio({
        desiredExcessCompensationBasisPoints: 5_000n,
      })
      // 1 ETH + (5000 * 1 ETH / 10000) = 1 ETH + 0.5 ETH = 1.5 ETH
      expect(result).toBe(1500000000000000000n) // 1.5 ETH
    })

    it('should calculate ratio for 100% excess (10000 basis points)', () => {
      const result = desiredCompensationRatio({
        desiredExcessCompensationBasisPoints: 10_000n,
      })
      // 1 ETH + (10000 * 1 ETH / 10000) = 1 ETH + 1 ETH = 2 ETH
      expect(result).toBe(2000000000000000000n) // 2 ETH
    })

    it('should handle small excess amounts (1 basis point)', () => {
      const result = desiredCompensationRatio({
        desiredExcessCompensationBasisPoints: 1n,
      })
      // 1 ETH + (1 * 1 ETH / 10000) = 1 ETH + 0.0001 ETH
      expect(result).toBe(1000100000000000000n)
    })

    it('should use correct formula with oneEther and basisPoints', () => {
      const excess = 2_500n // 25%
      const result = desiredCompensationRatio({
        desiredExcessCompensationBasisPoints: excess,
      })
      const expected = oneEther + (excess * oneEther) / basisPoints
      expect(result).toBe(expected)
    })

    it('should maintain precision with bigint arithmetic', () => {
      const excess = 3_333n // 33.33%
      const result = desiredCompensationRatio({
        desiredExcessCompensationBasisPoints: excess,
      })
      // Should not lose precision
      expect(result).toBe(oneEther + (3_333n * oneEther) / basisPoints)
    })
  })

  describe('amountToBridge', () => {
    const mockToken = {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      chainId: 1,
      name: 'USDT',
      symbol: 'USDT',
      decimals: 6,
    }

    it('should return amountIn when valid', () => {
      const result = amountToBridge({
        amountIn: 1000n,
        assetIn: mockToken,
      })
      expect(result).toBe(1000n)
    })

    it('should return 0n when amountIn is null', () => {
      const result = amountToBridge({
        amountIn: null,
        assetIn: mockToken,
      })
      expect(result).toBe(0n)
    })

    it('should return 0n when amountIn is 0n', () => {
      const result = amountToBridge({
        amountIn: 0n,
        assetIn: mockToken,
      })
      expect(result).toBe(0n)
    })

    it('should return 0n when assetIn is null', () => {
      const result = amountToBridge({
        amountIn: 1000n,
        assetIn: null,
      })
      expect(result).toBe(0n)
    })

    it('should return 0n when both are null', () => {
      const result = amountToBridge({
        amountIn: null,
        assetIn: null,
      })
      expect(result).toBe(0n)
    })

    it('should handle large amounts', () => {
      const largeAmount = 1000000000000000000n // 1 ETH in wei
      const result = amountToBridge({
        amountIn: largeAmount,
        assetIn: mockToken,
      })
      expect(result).toBe(largeAmount)
    })

    it('should validate both amountIn and assetIn together', () => {
      // Only returns the amount if BOTH are valid
      expect(amountToBridge({ amountIn: 100n, assetIn: mockToken })).toBe(100n)
      expect(amountToBridge({ amountIn: null, assetIn: mockToken })).toBe(0n)
      expect(amountToBridge({ amountIn: 100n, assetIn: null })).toBe(0n)
      expect(amountToBridge({ amountIn: 0n, assetIn: mockToken })).toBe(0n)
    })
  })

  describe('bridgeCost', () => {
    it('should return null when bridgeFee is null', () => {
      const result = bridgeCost({
        amountToBridge: 1000n,
        bridgeFee: null,
      })
      expect(result).toBeNull()
    })

    it('should calculate cost correctly with percentage fee', () => {
      const amount = oneEther // 1 ETH
      const fee = oneEther / 100n // 1% = 0.01 ETH
      const result = bridgeCost({
        amountToBridge: amount,
        bridgeFee: fee,
      })
      // (1 ETH * 0.01 ETH) / 1 ETH = 0.01 ETH
      expect(result).toBe(amount * fee / oneEther)
    })

    it('should handle zero fee', () => {
      const result = bridgeCost({
        amountToBridge: 1000n,
        bridgeFee: 0n,
      })
      expect(result).toBe(0n)
    })

    it('should calculate with small fee', () => {
      const amount = 1000000n // 1 USDT (6 decimals)
      const fee = oneEther / 1000n // 0.1% fee
      const result = bridgeCost({
        amountToBridge: amount,
        bridgeFee: fee,
      })
      expect(result).toBe((amount * fee) / oneEther)
    })

    it('should maintain precision with large numbers', () => {
      const amount = 123456789012345678n
      const fee = oneEther / 50n // 2% fee
      const result = bridgeCost({
        amountToBridge: amount,
        bridgeFee: fee,
      })
      const expected = (amount * fee) / oneEther
      expect(result).toBe(expected)
    })

    it('should use oneEther as divisor for percentage calculation', () => {
      const amount = 500n * oneEther // 500 ETH
      const fee = oneEther / 200n // 0.5% = 0.005 ETH per 1 ETH
      const result = bridgeCost({
        amountToBridge: amount,
        bridgeFee: fee,
      })
      // (500 ETH * 0.005) / 1 = 2.5 ETH
      expect(result).toBe((500n * oneEther * fee) / oneEther)
    })

    it('should handle fee equal to oneEther (100%)', () => {
      const amount = 1000n * oneEther
      const fee = oneEther // 100% fee
      const result = bridgeCost({
        amountToBridge: amount,
        bridgeFee: fee,
      })
      // (1000 ETH * 1 ETH) / 1 ETH = 1000 ETH (entire amount)
      expect(result).toBe(amount)
    })
  })

  describe('networkSwitchAssetOutAddress', () => {
    const mockToken = {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      chainId: 1,
      name: 'USDT',
      symbol: 'USDT',
      decimals: 6,
    }

    const wrappedPLS = {
      address: nativeAssetOut[Chains.PLS],
      chainId: 369,
      name: 'WPLS',
      symbol: 'WPLS',
      decimals: 18,
    }

    it('should return null when assetOut is null', () => {
      const result = networkSwitchAssetOutAddress({
        assetOut: null,
        unwrap: false,
        toChain: Chains.ETH,
      })
      expect(result).toBeNull()
    })

    it('should return assetOut address when not unwrapping', () => {
      const result = networkSwitchAssetOutAddress({
        assetOut: mockToken,
        unwrap: false,
        toChain: Chains.ETH,
      })
      expect(result).toBe(mockToken.address)
    })

    it('should return zeroAddress when unwrapping native asset', () => {
      const result = networkSwitchAssetOutAddress({
        assetOut: wrappedPLS,
        unwrap: true,
        toChain: Chains.PLS,
      })
      expect(result).toBe(zeroAddress)
    })

    it('should return assetOut address when unwrapping non-native asset', () => {
      const result = networkSwitchAssetOutAddress({
        assetOut: mockToken,
        unwrap: true,
        toChain: Chains.ETH,
      })
      expect(result).toBe(mockToken.address)
    })

    it('should check native asset out per chain', () => {
      const wrappedETH = {
        address: nativeAssetOut[Chains.ETH],
        chainId: 1,
        name: 'WETH',
        symbol: 'WETH',
        decimals: 18,
      }

      const result = networkSwitchAssetOutAddress({
        assetOut: wrappedETH,
        unwrap: true,
        toChain: Chains.ETH,
      })
      expect(result).toBe(zeroAddress)
    })

    it('should not unwrap if chain does not match', () => {
      // WPLS address but different chain
      const result = networkSwitchAssetOutAddress({
        assetOut: wrappedPLS,
        unwrap: true,
        toChain: Chains.ETH, // Different chain
      })
      // Should NOT unwrap because nativeAssetOut[ETH] !== WPLS address
      expect(result).toBe(wrappedPLS.address)
      expect(result).not.toBe(zeroAddress)
    })

    it('should handle all supported chains', () => {
      Object.entries(nativeAssetOut).forEach(([chain, wrappedAddress]) => {
        const token = {
          address: wrappedAddress,
          chainId: Number(chain),
          name: 'Wrapped',
          symbol: 'W',
          decimals: 18,
        }

        const result = networkSwitchAssetOutAddress({
          assetOut: token,
          unwrap: true,
          toChain: chain as Chains,
        })
        expect(result).toBe(zeroAddress)
      })
    })
  })

  describe('estimatedAmountOut', () => {
    it('should return null when fee is not a bigint', () => {
      expect(estimatedAmountOut({
        amountAfterBridgeFee: 1000n,
        fee: null,
      })).toBeNull()

      expect(estimatedAmountOut({
        amountAfterBridgeFee: 1000n,
        fee: undefined as any,
      })).toBeNull()
    })

    it('should return null when amountAfterBridgeFee is null', () => {
      expect(estimatedAmountOut({
        amountAfterBridgeFee: null,
        fee: 100n,
      })).toBeNull()
    })

    it('should return 0n when fee exceeds amount', () => {
      expect(estimatedAmountOut({
        amountAfterBridgeFee: 100n,
        fee: 200n,
      })).toBe(0n)

      expect(estimatedAmountOut({
        amountAfterBridgeFee: 50n,
        fee: 51n,
      })).toBe(0n)
    })

    it('should calculate amount out correctly', () => {
      expect(estimatedAmountOut({
        amountAfterBridgeFee: 1000n,
        fee: 100n,
      })).toBe(900n)

      expect(estimatedAmountOut({
        amountAfterBridgeFee: 500000n,
        fee: 2500n,
      })).toBe(497500n)
    })

    it('should handle zero fee', () => {
      expect(estimatedAmountOut({
        amountAfterBridgeFee: 1000n,
        fee: 0n,
      })).toBe(1000n)
    })

    it('should handle exact fee amount', () => {
      expect(estimatedAmountOut({
        amountAfterBridgeFee: 1000n,
        fee: 1000n,
      })).toBe(0n)
    })

    it('should handle large amounts', () => {
      const largeAmount = oneEther * 1000n // 1000 ETH
      const largeFee = oneEther // 1 ETH
      expect(estimatedAmountOut({
        amountAfterBridgeFee: largeAmount,
        fee: largeFee,
      })).toBe(largeAmount - largeFee)
    })

    it('should maintain precision with bigint', () => {
      const amount = 123456789012345678n
      const fee = 1n
      expect(estimatedAmountOut({
        amountAfterBridgeFee: amount,
        fee: fee,
      })).toBe(123456789012345677n)
    })
  })

  describe('estimatedFee', () => {
    const baseParams = {
      amountAfterBridgeFee: 1000n * oneEther,
      fee: 50n * oneEther,
      percentFee: oneEther / 100n, // 1%
      limit: 21000n,
    }

    it('should return 0n when not delivering', () => {
      expect(estimatedFee({
        ...baseParams,
        feeType: FeeType.FIXED,
        costsToDeliver: false,
      })).toBe(0n)

      expect(estimatedFee({
        ...baseParams,
        feeType: FeeType.PERCENT,
        costsToDeliver: false,
      })).toBe(0n)
    })

    it('should return fixed fee for FIXED type', () => {
      expect(estimatedFee({
        ...baseParams,
        feeType: FeeType.FIXED,
        costsToDeliver: true,
      })).toBe(50n * oneEther)
    })

    it('should calculate percent fee for PERCENT type', () => {
      const result = estimatedFee({
        ...baseParams,
        feeType: FeeType.PERCENT,
        costsToDeliver: true,
      })
      // 1000 ETH * 1% = 10 ETH
      const expected = (1000n * oneEther * (oneEther / 100n)) / oneEther
      expect(result).toBe(expected)
      expect(result).toBe(10n * oneEther)
    })

    it('should return limit for GAS_TIP type', () => {
      expect(estimatedFee({
        ...baseParams,
        feeType: FeeType.GAS_TIP,
        costsToDeliver: true,
      })).toBe(21000n)
    })

    it('should return null for PERCENT when amountAfterBridgeFee is null', () => {
      expect(estimatedFee({
        ...baseParams,
        amountAfterBridgeFee: null,
        feeType: FeeType.PERCENT,
        costsToDeliver: true,
      })).toBeNull()
    })

    it('should handle zero percent fee', () => {
      const result = estimatedFee({
        ...baseParams,
        percentFee: 0n,
        feeType: FeeType.PERCENT,
        costsToDeliver: true,
      })
      expect(result).toBe(0n)
    })

    it('should handle high percent fee', () => {
      const result = estimatedFee({
        ...baseParams,
        percentFee: oneEther / 10n, // 10%
        feeType: FeeType.PERCENT,
        costsToDeliver: true,
      })
      // 1000 ETH * 10% = 100 ETH
      expect(result).toBe(100n * oneEther)
    })

    it('should return null when amountAfterBridgeFee is null with fixedFee calculation', () => {
      const result = estimatedFee({
        ...baseParams,
        amountAfterBridgeFee: null,
        feeType: FeeType.PERCENT,
        costsToDeliver: true,
      })
      expect(result).toBeNull()
    })

    it('should handle all FeeType enum values', () => {
      // FIXED
      const fixed = estimatedFee({
        ...baseParams,
        feeType: FeeType.FIXED,
        costsToDeliver: true,
      })
      expect(fixed).toBe(baseParams.fee)

      // PERCENT
      const percent = estimatedFee({
        ...baseParams,
        feeType: FeeType.PERCENT,
        costsToDeliver: true,
      })
      expect(percent).toBeDefined()
      expect(typeof percent).toBe('bigint')

      // GAS_TIP
      const gasTip = estimatedFee({
        ...baseParams,
        feeType: FeeType.GAS_TIP,
        costsToDeliver: true,
      })
      expect(gasTip).toBe(baseParams.limit)
    })
  })

  describe('assetOut', () => {
    const mockToken1 = {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      chainId: 1,
      name: 'USDT',
      symbol: 'USDT',
      decimals: 6,
    }

    const mockToken2 = {
      address: '0xA1077a294dDE1B09bB078844df40758a5D0f9a27',
      chainId: 369,
      name: 'WPLS',
      symbol: 'WPLS',
      decimals: 18,
    }

    it('should return null when assetInAddress is null', () => {
      const assetsOut = new Map()
      expect(assetOut({
        assetInAddress: null,
        assetsOut,
        bridgeKeyPath: 'pulsechain/0x1/0x171',
        unwrap: false,
      })).toBeNull()
    })

    it('should return null when assetOutKey returns null', () => {
      const assetsOut = new Map()
      expect(assetOut({
        assetInAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        assetsOut,
        bridgeKeyPath: '', // Empty bridge path causes assetOutKey to return null
        unwrap: false,
      })).toBeNull()
    })

    it('should return token from map when key exists', () => {
      const assetsOut = new Map()
      const key = 'pulsechain/0x1/0x171/erc20/0xdac17f958d2ee523a2206206994597c13d831ec7'
      assetsOut.set(key, mockToken1)

      const result = assetOut({
        assetInAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        assetsOut,
        bridgeKeyPath: 'pulsechain/0x1/0x171',
        unwrap: false,
      })

      expect(result).toEqual(mockToken1)
    })

    it('should return null when key does not exist in map', () => {
      const assetsOut = new Map()

      const result = assetOut({
        assetInAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        assetsOut,
        bridgeKeyPath: 'pulsechain/0x1/0x171',
        unwrap: false,
      })

      expect(result).toBeNull()
    })

    it('should handle unwrap flag correctly', () => {
      const assetsOut = new Map()
      const erc20Key = 'pulsechain/0x1/0x171/erc20/0xdac17f958d2ee523a2206206994597c13d831ec7'
      const nativeKey = 'pulsechain/0x1/0x171/native/0xdac17f958d2ee523a2206206994597c13d831ec7'

      assetsOut.set(erc20Key, mockToken1)
      assetsOut.set(nativeKey, mockToken2)

      // Without unwrap - should look for erc20 key
      const erc20Result = assetOut({
        assetInAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        assetsOut,
        bridgeKeyPath: 'pulsechain/0x1/0x171',
        unwrap: false,
      })
      expect(erc20Result).toEqual(mockToken1)

      // With unwrap - should look for native key
      const nativeResult = assetOut({
        assetInAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        assetsOut,
        bridgeKeyPath: 'pulsechain/0x1/0x171',
        unwrap: true,
      })
      expect(nativeResult).toEqual(mockToken2)
    })

    it('should handle different bridge paths', () => {
      const assetsOut = new Map()
      const key1 = 'pulsechain/0x1/0x171/erc20/0xdac17f958d2ee523a2206206994597c13d831ec7'
      const key2 = 'tokensex/0x38/0x171/erc20/0xdac17f958d2ee523a2206206994597c13d831ec7'

      assetsOut.set(key1, mockToken1)
      assetsOut.set(key2, mockToken2)

      const result1 = assetOut({
        assetInAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        assetsOut,
        bridgeKeyPath: 'pulsechain/0x1/0x171',
        unwrap: false,
      })
      expect(result1).toEqual(mockToken1)

      const result2 = assetOut({
        assetInAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        assetsOut,
        bridgeKeyPath: 'tokensex/0x38/0x171',
        unwrap: false,
      })
      expect(result2).toEqual(mockToken2)
    })

    it('should handle case-insensitive address matching via assetOutKey', () => {
      const assetsOut = new Map()
      // Key is always lowercase due to assetOutKey
      const key = 'pulsechain/0x1/0x171/erc20/0xdac17f958d2ee523a2206206994597c13d831ec7'
      assetsOut.set(key, mockToken1)

      // Should work with uppercase address
      const result = assetOut({
        assetInAddress: '0xDAC17F958D2EE523A2206206994597C13D831EC7',
        assetsOut,
        bridgeKeyPath: 'pulsechain/0x1/0x171',
        unwrap: false,
      })

      expect(result).toEqual(mockToken1)
    })

    it('should return null when map has other keys but not the requested one', () => {
      const assetsOut = new Map()
      assetsOut.set('some/other/key', mockToken1)
      assetsOut.set('another/different/key', mockToken2)

      const result = assetOut({
        assetInAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        assetsOut,
        bridgeKeyPath: 'pulsechain/0x1/0x171',
        unwrap: false,
      })

      expect(result).toBeNull()
    })
  })

  describe('estimatedNativeNetworkCost', () => {
    it('should return null when estimatedGas is null', () => {
      expect(estimatedNativeNetworkCost({
        estimatedGas: null,
        latestBaseFeePerGas: 30n * 10n ** 9n, // 30 gwei
        requiresDelivery: true,
      })).toBeNull()
    })

    it('should return null when latestBaseFeePerGas is null', () => {
      expect(estimatedNativeNetworkCost({
        estimatedGas: 21000n,
        latestBaseFeePerGas: null,
        requiresDelivery: true,
      })).toBeNull()
    })

    it('should return null when requiresDelivery is false', () => {
      expect(estimatedNativeNetworkCost({
        estimatedGas: 21000n,
        latestBaseFeePerGas: 30n * 10n ** 9n,
        requiresDelivery: false,
      })).toBeNull()
    })

    it('should calculate cost correctly', () => {
      const gas = 21000n
      const baseFee = 30n * 10n ** 9n // 30 gwei
      const result = estimatedNativeNetworkCost({
        estimatedGas: gas,
        latestBaseFeePerGas: baseFee,
        requiresDelivery: true,
      })
      expect(result).toBe(gas * baseFee)
    })

    it('should handle high gas costs', () => {
      const gas = 500000n // Complex transaction
      const baseFee = 100n * 10n ** 9n // 100 gwei
      const result = estimatedNativeNetworkCost({
        estimatedGas: gas,
        latestBaseFeePerGas: baseFee,
        requiresDelivery: true,
      })
      expect(result).toBe(gas * baseFee)
      expect(result).toBe(50000000000000000n) // 0.05 ETH
    })

    it('should handle low gas costs', () => {
      const gas = 21000n
      const baseFee = 1n * 10n ** 9n // 1 gwei
      const result = estimatedNativeNetworkCost({
        estimatedGas: gas,
        latestBaseFeePerGas: baseFee,
        requiresDelivery: true,
      })
      expect(result).toBe(21000000000000n) // 0.000021 ETH
    })

    it('should return BigInt type', () => {
      const result = estimatedNativeNetworkCost({
        estimatedGas: 21000n,
        latestBaseFeePerGas: 30n * 10n ** 9n,
        requiresDelivery: true,
      })
      expect(typeof result).toBe('bigint')
    })

    it('should handle zero values gracefully', () => {
      // Zero gas should return null (falsy check)
      expect(estimatedNativeNetworkCost({
        estimatedGas: 0n,
        latestBaseFeePerGas: 30n * 10n ** 9n,
        requiresDelivery: true,
      })).toBeNull()

      // Zero base fee should return null (falsy check)
      expect(estimatedNativeNetworkCost({
        estimatedGas: 21000n,
        latestBaseFeePerGas: 0n,
        requiresDelivery: true,
      })).toBeNull()
    })

    it('should require all three parameters to be valid', () => {
      // All valid - should calculate
      expect(estimatedNativeNetworkCost({
        estimatedGas: 21000n,
        latestBaseFeePerGas: 30n * 10n ** 9n,
        requiresDelivery: true,
      })).not.toBeNull()

      // Any invalid - should return null
      expect(estimatedNativeNetworkCost({
        estimatedGas: null,
        latestBaseFeePerGas: 30n * 10n ** 9n,
        requiresDelivery: true,
      })).toBeNull()

      expect(estimatedNativeNetworkCost({
        estimatedGas: 21000n,
        latestBaseFeePerGas: null,
        requiresDelivery: true,
      })).toBeNull()

      expect(estimatedNativeNetworkCost({
        estimatedGas: 21000n,
        latestBaseFeePerGas: 30n * 10n ** 9n,
        requiresDelivery: false,
      })).toBeNull()
    })
  })

  describe('reasonablePercentOnGasLimit', () => {
    it('should calculate with both parameters provided', () => {
      const result = reasonablePercentOnGasLimit({
        gasTipFee: oneEther / 100n, // 1% tip
        estimatedTokenNetworkCost: 10n * oneEther, // 10 tokens
      })
      // Formula: (25000 * ((1 ETH + 0.01 ETH) * 10 ETH)) / (1 ETH * 10000)
      const expected = (25_000n * ((oneEther + oneEther / 100n) * 10n * oneEther)) / (oneEther * basisPoints)
      expect(result).toBe(expected)
    })

    it('should handle null gasTipFee (treats as 0)', () => {
      const result = reasonablePercentOnGasLimit({
        gasTipFee: null,
        estimatedTokenNetworkCost: 10n * oneEther,
      })
      // Formula with gasTipFee as 0: (25000 * ((1 ETH + 0) * 10 ETH)) / (1 ETH * 10000)
      const expected = (25_000n * ((oneEther + 0n) * 10n * oneEther)) / (oneEther * basisPoints)
      expect(result).toBe(expected)
    })

    it('should handle null estimatedTokenNetworkCost (treats as 0)', () => {
      const result = reasonablePercentOnGasLimit({
        gasTipFee: oneEther / 100n,
        estimatedTokenNetworkCost: null,
      })
      // Formula with cost as 0: (25000 * ((1.01 ETH) * 0)) / (1 ETH * 10000) = 0
      expect(result).toBe(0n)
    })

    it('should handle both parameters as null', () => {
      const result = reasonablePercentOnGasLimit({
        gasTipFee: null,
        estimatedTokenNetworkCost: null,
      })
      expect(result).toBe(0n)
    })

    it('should handle zero gasTipFee', () => {
      const result = reasonablePercentOnGasLimit({
        gasTipFee: 0n,
        estimatedTokenNetworkCost: 10n * oneEther,
      })
      const expected = (25_000n * oneEther * 10n * oneEther) / (oneEther * basisPoints)
      expect(result).toBe(expected)
    })

    it('should handle zero estimatedTokenNetworkCost', () => {
      const result = reasonablePercentOnGasLimit({
        gasTipFee: oneEther / 100n,
        estimatedTokenNetworkCost: 0n,
      })
      expect(result).toBe(0n)
    })

    it('should handle large values', () => {
      const largeTip = oneEther // 100% tip
      const largeCost = 1000n * oneEther // 1000 tokens
      const result = reasonablePercentOnGasLimit({
        gasTipFee: largeTip,
        estimatedTokenNetworkCost: largeCost,
      })
      const expected = (25_000n * ((oneEther + largeTip) * largeCost)) / (oneEther * basisPoints)
      expect(result).toBe(expected)
    })

    it('should use correct constants (25000 and basisPoints)', () => {
      const result = reasonablePercentOnGasLimit({
        gasTipFee: oneEther / 10n, // 10%
        estimatedTokenNetworkCost: 100n * oneEther,
      })
      // Verify formula uses 25000 and basisPoints
      const expected = (25_000n * ((oneEther + oneEther / 10n) * 100n * oneEther)) / (oneEther * basisPoints)
      expect(result).toBe(expected)
      expect(basisPoints).toBe(10_000n) // Verify constant
    })
  })

  describe('reasonablePercentOnTopOfGasFee', () => {
    it('should calculate percent from basis points', () => {
      const result = reasonablePercentOnTopOfGasFee({
        desiredExcessCompensationBasisPoints: 1000n, // 10%
      })
      // Formula: 1000 * (1 ETH / 10000) = 0.1 ETH
      expect(result).toBe(1000n * (oneEther / basisPoints))
      expect(result).toBe(oneEther / 10n)
    })

    it('should handle zero basis points', () => {
      const result = reasonablePercentOnTopOfGasFee({
        desiredExcessCompensationBasisPoints: 0n,
      })
      expect(result).toBe(0n)
    })

    it('should handle 100% (10000 basis points)', () => {
      const result = reasonablePercentOnTopOfGasFee({
        desiredExcessCompensationBasisPoints: 10_000n,
      })
      // 10000 * (1 ETH / 10000) = 1 ETH
      expect(result).toBe(oneEther)
    })

    it('should handle 50% (5000 basis points)', () => {
      const result = reasonablePercentOnTopOfGasFee({
        desiredExcessCompensationBasisPoints: 5_000n,
      })
      // 5000 * (1 ETH / 10000) = 0.5 ETH
      expect(result).toBe(oneEther / 2n)
    })

    it('should handle 1% (100 basis points)', () => {
      const result = reasonablePercentOnTopOfGasFee({
        desiredExcessCompensationBasisPoints: 100n,
      })
      // 100 * (1 ETH / 10000) = 0.01 ETH
      expect(result).toBe(oneEther / 100n)
    })

    it('should handle 0.01% (1 basis point)', () => {
      const result = reasonablePercentOnTopOfGasFee({
        desiredExcessCompensationBasisPoints: 1n,
      })
      // 1 * (1 ETH / 10000) = 0.0001 ETH
      expect(result).toBe(oneEther / 10_000n)
    })

    it('should maintain precision with bigint', () => {
      const result = reasonablePercentOnTopOfGasFee({
        desiredExcessCompensationBasisPoints: 3_333n, // 33.33%
      })
      const expected = 3_333n * (oneEther / basisPoints)
      expect(result).toBe(expected)
      // Should not lose precision
      expect(result).not.toBe(oneEther / 3n) // Not exactly 1/3 due to rounding
    })

    it('should use oneEther and basisPoints constants', () => {
      const testBps = 2_500n // 25%
      const result = reasonablePercentOnTopOfGasFee({
        desiredExcessCompensationBasisPoints: testBps,
      })
      expect(result).toBe(testBps * (oneEther / basisPoints))
      expect(oneEther).toBe(10n ** 18n)
      expect(basisPoints).toBe(10_000n)
    })
  })

  describe('estimatedTokenNetworkCost', () => {
    const baseParams = {
      estimatedNativeNetworkCost: 630000000000000n, // 0.00063 ETH
      priceCorrective: oneEther / 1000n, // Token worth 0.001 ETH
      decimals: 18,
      oneTokenInt: oneEther,
    }

    it('should return null when priceCorrective is null', () => {
      expect(estimatedTokenNetworkCost({
        ...baseParams,
        priceCorrective: null,
      })).toBeNull()
    })

    it('should return null when oneTokenInt is null', () => {
      expect(estimatedTokenNetworkCost({
        ...baseParams,
        oneTokenInt: null,
      })).toBeNull()
    })

    it('should return null when estimatedNativeNetworkCost is null', () => {
      expect(estimatedTokenNetworkCost({
        ...baseParams,
        estimatedNativeNetworkCost: null,
      })).toBeNull()
    })

    it('should return null when decimals is null', () => {
      expect(estimatedTokenNetworkCost({
        ...baseParams,
        decimals: null,
      })).toBeNull()
    })

    it('should calculate token cost correctly', () => {
      const result = estimatedTokenNetworkCost(baseParams)
      // (0.00063 ETH * 1 ETH) / 0.001 ETH = 0.63 tokens
      const expected = (baseParams.estimatedNativeNetworkCost * baseParams.oneTokenInt) / baseParams.priceCorrective
      expect(result).toBe(expected)
    })

    it('should handle expensive tokens (high price corrective)', () => {
      const result = estimatedTokenNetworkCost({
        estimatedNativeNetworkCost: oneEther / 100n, // 0.01 ETH
        priceCorrective: 100n * oneEther, // Token worth 100 ETH
        decimals: 18,
        oneTokenInt: oneEther,
      })
      // (0.01 ETH * 1 ETH) / 100 ETH = 0.0001 tokens
      const expected = ((oneEther / 100n) * oneEther) / (100n * oneEther)
      expect(result).toBe(expected)
    })

    it('should handle cheap tokens (low price corrective)', () => {
      const result = estimatedTokenNetworkCost({
        estimatedNativeNetworkCost: oneEther / 1000n, // 0.001 ETH
        priceCorrective: oneEther / 1000000n, // Token worth 0.000001 ETH
        decimals: 18,
        oneTokenInt: oneEther,
      })
      // (0.001 ETH * 1 ETH) / 0.000001 ETH = 1000 tokens
      const expected = ((oneEther / 1000n) * oneEther) / (oneEther / 1000000n)
      expect(result).toBe(expected)
    })

    it('should handle different token decimals', () => {
      // USDT with 6 decimals
      const usdtResult = estimatedTokenNetworkCost({
        estimatedNativeNetworkCost: oneEther / 100n,
        priceCorrective: oneEther / 3000n, // $3000 per ETH
        decimals: 6,
        oneTokenInt: 10n ** 6n, // 1 USDT
      })
      expect(usdtResult).toBeDefined()
      const expected = ((oneEther / 100n) * (10n ** 6n)) / (oneEther / 3000n)
      expect(usdtResult).toBe(expected)
    })

    it('should return null when priceCorrective is 0', () => {
      expect(estimatedTokenNetworkCost({
        ...baseParams,
        priceCorrective: 0n,
      })).toBeNull()
    })

    it('should return null when oneTokenInt is 0', () => {
      expect(estimatedTokenNetworkCost({
        ...baseParams,
        oneTokenInt: 0n,
      })).toBeNull()
    })

    it('should return null when estimatedNativeNetworkCost is 0', () => {
      expect(estimatedTokenNetworkCost({
        ...baseParams,
        estimatedNativeNetworkCost: 0n,
      })).toBeNull()
    })

    it('should require all four parameters to be valid', () => {
      // All valid - should calculate
      expect(estimatedTokenNetworkCost(baseParams)).not.toBeNull()

      // Any null - should return null
      expect(estimatedTokenNetworkCost({
        ...baseParams,
        priceCorrective: null,
      })).toBeNull()

      expect(estimatedTokenNetworkCost({
        ...baseParams,
        oneTokenInt: null,
      })).toBeNull()

      expect(estimatedTokenNetworkCost({
        ...baseParams,
        estimatedNativeNetworkCost: null,
      })).toBeNull()

      expect(estimatedTokenNetworkCost({
        ...baseParams,
        decimals: null,
      })).toBeNull()
    })

    it('should maintain bigint precision', () => {
      const result = estimatedTokenNetworkCost({
        estimatedNativeNetworkCost: 123456789012345n,
        priceCorrective: 987654321098765n,
        decimals: 18,
        oneTokenInt: oneEther,
      })
      const expected = (123456789012345n * oneEther) / 987654321098765n
      expect(result).toBe(expected)
    })

    it('should use formula: (nativeCost * oneToken) / priceCorrective', () => {
      const nativeCost = 5n * oneEther / 10n // 0.5 ETH
      const price = 2n * oneEther // 2 ETH per token
      const tokenInt = oneEther

      const result = estimatedTokenNetworkCost({
        estimatedNativeNetworkCost: nativeCost,
        priceCorrective: price,
        decimals: 18,
        oneTokenInt: tokenInt,
      })

      // Verify formula
      expect(result).toBe((nativeCost * tokenInt) / price)
      // 0.5 ETH / (2 ETH per token) = 0.25 tokens
      expect(result).toBe(oneEther / 4n)
    })
  })
})

describe('desiredExcessCompensationBasisPoints', () => {
  const mockBridgeKey: BridgeKey = ['pulsechain', Chains.PLS, Chains.ETH]
  const mockToken: Token = {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    decimals: 6,
    name: 'USD Coin',
    symbol: 'USDC',
    chainId: parseInt(Chains.PLS, 16),
  }
  const mockPathway: Pathway = {
    from: '0xFrom' as Hex,
    requiresDelivery: true,
    feeManager: 'from',
    nativeRouter: '0xNative' as Hex,
    usesExtraParam: false,
  }

  it('should return 0n when path does not require delivery', () => {
    const result = desiredExcessCompensationBasisPoints({
      path: { ...mockPathway, requiresDelivery: false },
      assetIn: mockToken,
      assetOut: mockToken,
      bridgeKey: mockBridgeKey,
      feeType: FeeType.FIXED,
      list: new Set(),
      assetOutAddress: mockToken.address,
    })
    expect(result).toBe(0n)
  })

  it('should return 0n when assetIn is null', () => {
    const result = desiredExcessCompensationBasisPoints({
      path: mockPathway,
      assetIn: null,
      assetOut: mockToken,
      bridgeKey: mockBridgeKey,
      feeType: FeeType.FIXED,
      list: new Set(),
      assetOutAddress: mockToken.address,
    })
    expect(result).toBe(0n)
  })

  it('should return 1_000n for PERCENT fee type', () => {
    const result = desiredExcessCompensationBasisPoints({
      path: mockPathway,
      assetIn: mockToken,
      assetOut: mockToken,
      bridgeKey: mockBridgeKey,
      feeType: FeeType.PERCENT,
      list: new Set(),
      assetOutAddress: mockToken.address,
    })
    expect(result).toBe(1_000n)
  })

  it('should return 1_000n when assetIn is native', () => {
    const nativeToken = { ...mockToken, address: zeroAddress }
    const result = desiredExcessCompensationBasisPoints({
      path: mockPathway,
      assetIn: nativeToken,
      assetOut: mockToken,
      bridgeKey: mockBridgeKey,
      feeType: FeeType.FIXED,
      list: new Set(),
      assetOutAddress: mockToken.address,
    })
    expect(result).toBe(1_000n)
  })

  it('should return 1_000n when assetOut is native', () => {
    const nativeToken = { ...mockToken, address: zeroAddress }
    const result = desiredExcessCompensationBasisPoints({
      path: mockPathway,
      assetIn: mockToken,
      assetOut: nativeToken,
      bridgeKey: mockBridgeKey,
      feeType: FeeType.FIXED,
      list: new Set(),
      assetOutAddress: nativeToken.address,
    })
    expect(result).toBe(1_000n)
  })

  it('should return 5_000n when assetIn is in whitelist', () => {
    const list = new Set([getAddress(mockToken.address)])
    const result = desiredExcessCompensationBasisPoints({
      path: mockPathway,
      assetIn: mockToken,
      assetOut: mockToken,
      bridgeKey: mockBridgeKey,
      feeType: FeeType.FIXED,
      list,
      assetOutAddress: '0x0000000000000000000000000000000000000001',
    })
    expect(result).toBe(5_000n)
  })

  it('should return 5_000n when assetOutAddress is in whitelist', () => {
    const outAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
    const list = new Set([getAddress(outAddress)])
    const result = desiredExcessCompensationBasisPoints({
      path: mockPathway,
      assetIn: mockToken,
      assetOut: mockToken,
      bridgeKey: mockBridgeKey,
      feeType: FeeType.FIXED,
      list,
      assetOutAddress: outAddress,
    })
    expect(result).toBe(5_000n)
  })

  it('should return 10_000n for non-whitelisted tokens', () => {
    const result = desiredExcessCompensationBasisPoints({
      path: mockPathway,
      assetIn: mockToken,
      assetOut: mockToken,
      bridgeKey: mockBridgeKey,
      feeType: FeeType.FIXED,
      list: new Set(),
      assetOutAddress: '0x0000000000000000000000000000000000000001',
    })
    expect(result).toBe(10_000n)
  })

  it('should handle null path gracefully', () => {
    const result = desiredExcessCompensationBasisPoints({
      path: null,
      assetIn: mockToken,
      assetOut: mockToken,
      bridgeKey: mockBridgeKey,
      feeType: FeeType.FIXED,
      list: new Set(),
      assetOutAddress: mockToken.address,
    })
    expect(result).toBe(0n)
  })

  it('should handle null assetOutAddress', () => {
    const result = desiredExcessCompensationBasisPoints({
      path: mockPathway,
      assetIn: mockToken,
      assetOut: mockToken,
      bridgeKey: mockBridgeKey,
      feeType: FeeType.FIXED,
      list: new Set(),
      assetOutAddress: null,
    })
    expect(result).toBe(10_000n)
  })
})

describe('estimatedCost', () => {
  const baseParams = {
    shouldDeliver: true,
    amountAfterBridgeFee: oneEther,
    percentFee: oneEther / 100n, // 1%
    estimatedTokenNetworkCost: oneEther / 10n, // 0.1 tokens
    reasonablePercentOnTopOfGasFee: oneEther / 10n, // 10%
    feeType: FeeType.PERCENT,
  }

  it('should return null when shouldDeliver is false', () => {
    const result = estimatedCost({
      ...baseParams,
      shouldDeliver: false,
    })
    expect(result).toBeNull()
  })

  it('should calculate cost correctly for PERCENT fee type', () => {
    const result = estimatedCost(baseParams)
    const expected = (baseParams.amountAfterBridgeFee * baseParams.percentFee) / oneEther
    expect(result).toBe(expected)
  })

  it('should return null for PERCENT when amountAfterBridgeFee is null', () => {
    const result = estimatedCost({
      ...baseParams,
      amountAfterBridgeFee: null,
    })
    expect(result).toBeNull()
  })

  it('should calculate cost correctly for GAS_TIP fee type', () => {
    const result = estimatedCost({
      ...baseParams,
      feeType: FeeType.GAS_TIP,
    })
    const expected =
      baseParams.estimatedTokenNetworkCost * (baseParams.reasonablePercentOnTopOfGasFee + oneEther)
    expect(result).toBe(expected)
  })

  it('should return null for GAS_TIP when estimatedTokenNetworkCost is null', () => {
    const result = estimatedCost({
      ...baseParams,
      feeType: FeeType.GAS_TIP,
      estimatedTokenNetworkCost: null,
    })
    expect(result).toBeNull()
  })

  it('should return null for GAS_TIP when reasonablePercentOnTopOfGasFee is null', () => {
    const result = estimatedCost({
      ...baseParams,
      feeType: FeeType.GAS_TIP,
      reasonablePercentOnTopOfGasFee: null,
    })
    expect(result).toBeNull()
  })

  it('should handle zero percentFee for PERCENT type', () => {
    const result = estimatedCost({
      ...baseParams,
      percentFee: 0n,
    })
    expect(result).toBe(0n)
  })

  it('should handle FIXED fee type (defaults to GAS_TIP calculation)', () => {
    const result = estimatedCost({
      ...baseParams,
      feeType: FeeType.FIXED,
    })
    // FIXED falls through to GAS_TIP calculation
    const expected =
      baseParams.estimatedTokenNetworkCost * (baseParams.reasonablePercentOnTopOfGasFee + oneEther)
    expect(result).toBe(expected)
  })

  it('should handle null percentFee for PERCENT type', () => {
    const result = estimatedCost({
      ...baseParams,
      percentFee: null,
    })
    expect(result).toBe(0n) // Uses 0n as default
  })
})

describe('reasonableFixedFee', () => {
  it('should calculate fee correctly', () => {
    const estimatedTokenNetworkCost = oneEther
    const desiredExcessCompensationBasisPoints = 1_000n
    const result = reasonableFixedFee({
      estimatedTokenNetworkCost,
      desiredExcessCompensationBasisPoints,
    })
    const expected = (estimatedTokenNetworkCost * (25_000n + desiredExcessCompensationBasisPoints)) / basisPoints
    expect(result).toBe(expected)
  })

  it('should return null when estimatedTokenNetworkCost is null', () => {
    const result = reasonableFixedFee({
      estimatedTokenNetworkCost: null,
      desiredExcessCompensationBasisPoints: 1_000n,
    })
    expect(result).toBeNull()
  })

  it('should handle zero estimatedTokenNetworkCost', () => {
    const result = reasonableFixedFee({
      estimatedTokenNetworkCost: 0n,
      desiredExcessCompensationBasisPoints: 1_000n,
    })
    expect(result).toBeNull()
  })

  it('should handle zero desiredExcessCompensationBasisPoints', () => {
    const estimatedTokenNetworkCost = oneEther
    const result = reasonableFixedFee({
      estimatedTokenNetworkCost,
      desiredExcessCompensationBasisPoints: 0n,
    })
    const expected = (estimatedTokenNetworkCost * 25_000n) / basisPoints
    expect(result).toBe(expected)
  })

  it('should handle large desiredExcessCompensationBasisPoints', () => {
    const estimatedTokenNetworkCost = oneEther
    const desiredExcessCompensationBasisPoints = 10_000n
    const result = reasonableFixedFee({
      estimatedTokenNetworkCost,
      desiredExcessCompensationBasisPoints,
    })
    const expected = (estimatedTokenNetworkCost * 35_000n) / basisPoints
    expect(result).toBe(expected)
  })

  it('should maintain precision with small values', () => {
    const estimatedTokenNetworkCost = 100n
    const desiredExcessCompensationBasisPoints = 500n
    const result = reasonableFixedFee({
      estimatedTokenNetworkCost,
      desiredExcessCompensationBasisPoints,
    })
    expect(result).toBe((100n * 25_500n) / basisPoints)
  })
})

describe('reasonablePercentFee', () => {
  const basisFeeTruncator = 10n ** 14n
  const max = 1_000n * basisFeeTruncator
  const min = 5n * basisFeeTruncator

  it('should return null when reasonableFixedFee is null', () => {
    const result = reasonablePercentFee({
      reasonableFixedFee: null,
      amountAfterBridgeFee: oneEther,
    })
    expect(result).toBeNull()
  })

  it('should return null when amountAfterBridgeFee is null', () => {
    const result = reasonablePercentFee({
      reasonableFixedFee: oneEther,
      amountAfterBridgeFee: null,
    })
    expect(result).toBeNull()
  })

  it('should return max (10%) when highFee < reasonableFixedFee', () => {
    const amountAfterBridgeFee = oneEther
    const reasonableFixedFee = amountAfterBridgeFee / 10n + 1n
    const result = reasonablePercentFee({
      reasonableFixedFee,
      amountAfterBridgeFee,
    })
    expect(result).toBe(max)
  })

  it('should return min when calculated percent is below minimum', () => {
    const amountAfterBridgeFee = oneEther * 1000n
    const reasonableFixedFee = oneEther / 100n // Very small fee
    const result = reasonablePercentFee({
      reasonableFixedFee,
      amountAfterBridgeFee,
    })
    expect(result).toBe(min)
  })

  it('should return max when calculated percent exceeds maximum', () => {
    const amountAfterBridgeFee = oneEther
    const reasonableFixedFee = oneEther / 5n // 20%
    const result = reasonablePercentFee({
      reasonableFixedFee,
      amountAfterBridgeFee,
    })
    expect(result).toBe(max)
  })

  it('should return truncated percent when in valid range', () => {
    const amountAfterBridgeFee = oneEther
    const reasonableFixedFee = oneEther / 100n // 1%
    const result = reasonablePercentFee({
      reasonableFixedFee,
      amountAfterBridgeFee,
    })
    // 1% = 0.01 * 10^18 = 10^16
    // highResPercent = (10^16 * 10^18) / 10^18 = 10^16
    // basisPoint = 10^16 / 10^14 = 100
    // result = 100 * 10^14 = 10^16
    expect(result).toBe(100n * basisFeeTruncator)
  })

  it('should handle truncation correctly', () => {
    const amountAfterBridgeFee = oneEther
    const reasonableFixedFee = oneEther / 50n // 2%
    const result = reasonablePercentFee({
      reasonableFixedFee,
      amountAfterBridgeFee,
    })
    // 2% = 0.02 * 10^18 = 2 * 10^16
    // highResPercent = (2 * 10^16 * 10^18) / 10^18 = 2 * 10^16
    // basisPoint = 2 * 10^16 / 10^14 = 200
    // result = 200 * 10^14 = 2 * 10^16
    expect(result).toBe(200n * basisFeeTruncator)
  })

  it('should handle zero reasonableFixedFee', () => {
    const result = reasonablePercentFee({
      reasonableFixedFee: 0n,
      amountAfterBridgeFee: oneEther,
    })
    expect(result).toBeNull()
  })

  it('should handle edge case near minimum boundary', () => {
    const amountAfterBridgeFee = oneEther * 200n
    const reasonableFixedFee = oneEther // 0.5%
    const result = reasonablePercentFee({
      reasonableFixedFee,
      amountAfterBridgeFee,
    })
    // highResPercent = (10^18 * 10^18) / (200 * 10^18) = 5 * 10^15
    // basisPoint = 5 * 10^15 / 10^14 = 50
    // result = 50 * 10^14 = 5 * 10^15
    expect(result).toBe(50n * basisFeeTruncator)
  })
})

describe('availableCompensationMaximum', () => {
  const baseParams = {
    amountAfterBridgeFee: oneEther,
    percentFee: oneEther / 100n, // 1%
    feeType: FeeType.PERCENT,
    fixedFee: oneEther / 10n,
    limit: oneEther / 5n,
  }

  it('should calculate correctly for PERCENT fee type', () => {
    const result = availableCompensationMaximum(baseParams)
    const expected = (baseParams.amountAfterBridgeFee * baseParams.percentFee) / oneEther
    expect(result).toBe(expected)
  })

  it('should return null for PERCENT when amountAfterBridgeFee is null', () => {
    const result = availableCompensationMaximum({
      ...baseParams,
      amountAfterBridgeFee: null,
    })
    expect(result).toBeNull()
  })

  it('should return limit for GAS_TIP fee type', () => {
    const result = availableCompensationMaximum({
      ...baseParams,
      feeType: FeeType.GAS_TIP,
    })
    expect(result).toBe(baseParams.limit)
  })

  it('should return fixedFee for FIXED fee type', () => {
    const result = availableCompensationMaximum({
      ...baseParams,
      feeType: FeeType.FIXED,
    })
    expect(result).toBe(baseParams.fixedFee)
  })

  it('should return 0n for FIXED when fixedFee is null', () => {
    const result = availableCompensationMaximum({
      ...baseParams,
      feeType: FeeType.FIXED,
      fixedFee: null,
    })
    expect(result).toBe(0n)
  })

  it('should handle zero percentFee for PERCENT type', () => {
    const result = availableCompensationMaximum({
      ...baseParams,
      percentFee: 0n,
    })
    expect(result).toBe(0n)
  })

  it('should handle null percentFee for PERCENT type', () => {
    const result = availableCompensationMaximum({
      ...baseParams,
      percentFee: null,
    })
    expect(result).toBe(0n)
  })

  it('should handle zero limit for GAS_TIP type', () => {
    const result = availableCompensationMaximum({
      ...baseParams,
      feeType: FeeType.GAS_TIP,
      limit: 0n,
    })
    expect(result).toBe(0n)
  })
})

describe('isUndercompensated', () => {
  const baseParams = {
    estimatedTokenNetworkCost: oneEther / 10n, // 0.1 tokens
    feeType: FeeType.FIXED,
    limit: oneEther / 5n, // 0.2 tokens
    amountAfterBridgeFee: oneEther,
    desiredExcessCompensationBasisPoints: 1_000n, // 10%
  }

  it('should return false when amountAfterBridgeFee is null', () => {
    const result = isUndercompensated({
      ...baseParams,
      amountAfterBridgeFee: null,
    })
    expect(result).toBe(false)
  })

  it('should return false when amountAfterBridgeFee is 0', () => {
    const result = isUndercompensated({
      ...baseParams,
      amountAfterBridgeFee: 0n,
    })
    expect(result).toBe(false)
  })

  it('should return false for GAS_TIP fee type', () => {
    const result = isUndercompensated({
      ...baseParams,
      feeType: FeeType.GAS_TIP,
    })
    expect(result).toBe(false)
  })

  it('should return false when estimatedTokenNetworkCost is null', () => {
    const result = isUndercompensated({
      ...baseParams,
      estimatedTokenNetworkCost: null,
    })
    expect(result).toBe(false)
  })

  it('should return true when desired compensation exceeds limit', () => {
    // estimatedTokenNetworkCost = 0.1 ETH
    // desiredCompensationRatio = 1.0 + (1000 / 10000) = 1.1
    // desiredCompensationForNetworkCost = 0.1 * 1.1 = 0.11 ETH
    // limit = 0.2 ETH, so 0.11 < 0.2 = false
    const result = isUndercompensated({
      ...baseParams,
      limit: oneEther / 100n, // 0.01 tokens (very low limit)
    })
    // Now 0.11 > 0.01 = true (undercompensated)
    expect(result).toBe(true)
  })

  it('should return false when compensation is adequate', () => {
    const result = isUndercompensated(baseParams)
    // desiredCompensation = 0.1 * 1.1 = 0.11 ETH
    // limit = 0.2 ETH, so 0.11 < 0.2 = false (adequate)
    expect(result).toBe(false)
  })

  it('should handle zero desiredExcessCompensationBasisPoints', () => {
    const result = isUndercompensated({
      ...baseParams,
      desiredExcessCompensationBasisPoints: 0n,
    })
    // desiredCompensationRatio = 1.0
    // desiredCompensation = 0.1 * 1.0 = 0.1 ETH
    // limit = 0.2 ETH, so false (adequate)
    expect(result).toBe(false)
  })

  it('should handle large desiredExcessCompensationBasisPoints', () => {
    const result = isUndercompensated({
      ...baseParams,
      desiredExcessCompensationBasisPoints: 10_000n, // 100%
      limit: oneEther / 10n, // 0.1 tokens
    })
    // desiredCompensationRatio = 1.0 + 1.0 = 2.0
    // desiredCompensation = 0.1 * 2.0 = 0.2 ETH
    // limit = 0.1 ETH, so 0.2 > 0.1 = true (undercompensated)
    expect(result).toBe(true)
  })

  it('should handle edge case at exact limit', () => {
    // Set limit to exactly match desired compensation
    const estimatedTokenNetworkCost = oneEther / 10n
    const desiredExcessCompensationBasisPoints = 1_000n
    const desiredCompensationRatio = oneEther + (desiredExcessCompensationBasisPoints * oneEther) / basisPoints
    const limit = (estimatedTokenNetworkCost * desiredCompensationRatio) / oneEther

    const result = isUndercompensated({
      estimatedTokenNetworkCost,
      feeType: FeeType.FIXED,
      limit,
      amountAfterBridgeFee: oneEther,
      desiredExcessCompensationBasisPoints,
    })
    expect(result).toBe(false) // Exactly at limit, not under
  })

  it('should handle PERCENT fee type', () => {
    const result = isUndercompensated({
      ...baseParams,
      feeType: FeeType.PERCENT,
      limit: oneEther / 100n,
    })
    // PERCENT fee type still does the calculation
    expect(result).toBe(true)
  })
})

describe('bridgePathway', () => {
  it('should return pathway for valid bridge', () => {
    const result = bridgePathway({
      bridgeKey: ['pulsechain', Chains.PLS, Chains.ETH],
      isProd: true,
      assetIn: null,
    })
    // Should return a pathway (exact structure depends on config)
    expect(result).not.toBeNull()
    if (result) {
      expect(result).toHaveProperty('from')
      expect(result).toHaveProperty('to')
      expect(result).toHaveProperty('requiresDelivery')
    }
  })

  it('should return pathway for valid bridge with assetIn', () => {
    const token: Token = {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      decimals: 6,
      name: 'USD Coin',
      symbol: 'USDC',
      chainId: parseInt(Chains.PLS, 16),
    }
    const result = bridgePathway({
      bridgeKey: ['pulsechain', Chains.PLS, Chains.ETH],
      isProd: true,
      assetIn: token,
    })
    expect(result).not.toBeNull()
  })

  it('should respect isProd flag', () => {
    const resultProd = bridgePathway({
      bridgeKey: ['pulsechain', Chains.PLS, Chains.ETH],
      isProd: true,
      assetIn: null,
    })
    const resultDev = bridgePathway({
      bridgeKey: ['pulsechain', Chains.PLS, Chains.ETH],
      isProd: false,
      assetIn: null,
    })
    // Both should return pathways but they might differ
    expect(resultProd).not.toBeNull()
    expect(resultDev).not.toBeNull()
  })

  it('should handle tokensex provider', () => {
    const result = bridgePathway({
      bridgeKey: ['tokensex', Chains.PLS, Chains.BNB],
      isProd: true,
      assetIn: null,
    })
    expect(result).not.toBeNull()
    if (result) {
      expect(result).toHaveProperty('from')
      expect(result).toHaveProperty('feeManager')
    }
  })

  it('should pass assetIn address to pathway function', () => {
    const token: Token = {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      decimals: 6,
      name: 'Tether',
      symbol: 'USDT',
      chainId: parseInt(Chains.ETH, 16),
    }
    const result = bridgePathway({
      bridgeKey: ['pulsechain', Chains.PLS, Chains.ETH],
      isProd: true,
      assetIn: token,
    })
    expect(result).not.toBeNull()
  })
})

describe('destinationDataParam', () => {
  const baseParams = {
    recipient: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as Hex,
    bridgePathway: {
      from: '0x1' as Hex,
      to: '0x2' as Hex,
      requiresDelivery: false,
      feeManager: 'from' as const,
      nativeRouter: '0x3' as Hex,
      usesExtraParam: false,
    } as any,
    assetIn: {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      decimals: 6,
      name: 'USDC',
      symbol: 'USDC',
      chainId: 1,
    } as Token,
    destinationRouter: '0x4' as Hex,
    feeDirectorStructEncoded: null,
    assetLink: { toHome: '0x5', toForeign: '0x6' } as any,
    shouldDeliver: false,
    unwrap: false,
  }

  it('should return null when recipient is null', () => {
    const result = destinationDataParam({
      ...baseParams,
      recipient: null,
    })
    expect(result).toBeNull()
  })

  it('should return null when bridgePathway is null', () => {
    const result = destinationDataParam({
      ...baseParams,
      bridgePathway: null,
    })
    expect(result).toBeNull()
  })

  it('should return null when assetIn is null', () => {
    const result = destinationDataParam({
      ...baseParams,
      assetIn: null,
    })
    expect(result).toBeNull()
  })

  it('should return null when destinationRouter is null', () => {
    const result = destinationDataParam({
      ...baseParams,
      destinationRouter: null,
    })
    expect(result).toBeNull()
  })

  it('should return null when requiresDelivery but no feeDirectorStructEncoded', () => {
    const result = destinationDataParam({
      ...baseParams,
      bridgePathway: {
        ...baseParams.bridgePathway,
        requiresDelivery: true,
      },
      feeDirectorStructEncoded: null,
    })
    expect(result).toBeNull()
  })

  it('should return null when assetLink is null', () => {
    const result = destinationDataParam({
      ...baseParams,
      assetLink: null,
    })
    expect(result).toBeNull()
  })

  it('should return recipient when not requiring delivery', () => {
    const result = destinationDataParam(baseParams)
    expect(result).toBe(baseParams.recipient)
  })

  it('should return concatHex of destinationRouter and recipient when unwrap is true', () => {
    const result = destinationDataParam({
      ...baseParams,
      unwrap: true,
    })
    // concatHex mock joins the parts
    expect(result).toBe(`${baseParams.destinationRouter}${baseParams.recipient}`)
  })

  it('should return recipient when requiresDelivery but shouldDeliver is false', () => {
    const result = destinationDataParam({
      ...baseParams,
      bridgePathway: {
        ...baseParams.bridgePathway,
        requiresDelivery: true,
      } as any,
      feeDirectorStructEncoded: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' as Hex,
      shouldDeliver: false,
    })
    expect(result).toBe(baseParams.recipient)
  })

  it('should return concatHex when requiresDelivery and shouldDeliver with feeDirectorStructEncoded', () => {
    const feeStruct = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' as Hex
    const result = destinationDataParam({
      ...baseParams,
      bridgePathway: {
        ...baseParams.bridgePathway,
        requiresDelivery: true,
      } as any,
      feeDirectorStructEncoded: feeStruct,
      shouldDeliver: true,
    })
    // concatHex mock joins the parts
    expect(result).toBe(`${baseParams.destinationRouter}${feeStruct}`)
  })
})

describe('feeDirectorStructEncoded', () => {
  const baseParams = {
    recipient: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as Hex,
    feeType: FeeType.FIXED,
    priceCorrective: oneEther,
    gasTipFee: oneEther / 100n,
    percentFee: oneEther / 50n,
    feeTypeSettings: 1n,
    limit: oneEther,
    bridgePathway: {
      requiresDelivery: true,
      from: '0x1' as Hex,
    } as any,
    assetOut: {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      decimals: 6,
      name: 'USDC',
      symbol: 'USDC',
      chainId: 1,
    } as Token,
  }

  it('should return null when assetOut is null', () => {
    const result = feeDirectorStructEncoded({
      ...baseParams,
      assetOut: null,
    })
    expect(result).toBeNull()
  })

  it('should return null when bridgePathway is null', () => {
    const result = feeDirectorStructEncoded({
      ...baseParams,
      bridgePathway: null,
    })
    expect(result).toBeNull()
  })

  it('should return null when pathway does not require delivery', () => {
    const result = feeDirectorStructEncoded({
      ...baseParams,
      bridgePathway: {
        requiresDelivery: false,
      } as any,
    })
    expect(result).toBeNull()
  })

  it('should return null when priceCorrective is null', () => {
    const result = feeDirectorStructEncoded({
      ...baseParams,
      priceCorrective: null,
    })
    expect(result).toBeNull()
  })

  it('should return null when priceCorrective is zero for GAS_TIP', () => {
    const result = feeDirectorStructEncoded({
      ...baseParams,
      feeType: FeeType.GAS_TIP,
      priceCorrective: 0n,
    })
    expect(result).toBeNull()
  })

  it('should return null when recipient is null', () => {
    const result = feeDirectorStructEncoded({
      ...baseParams,
      recipient: null,
    })
    expect(result).toBeNull()
  })

  it('should return null when recipient is invalid address', () => {
    const result = feeDirectorStructEncoded({
      ...baseParams,
      recipient: '0xinvalid' as Hex,
    })
    expect(result).toBeNull()
  })
})

describe('transactionInputs', () => {
  const baseParams = {
    bridgePathway: {
      from: '0x1111111111111111111111111111111111111111' as Hex,
      to: '0x2222222222222222222222222222222222222222' as Hex,
      requiresDelivery: false,
      feeManager: 'from' as const,
      nativeRouter: '0x3333333333333333333333333333333333333333' as Hex,
      usesExtraParam: false,
    } as any,
    assetIn: {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      decimals: 6,
      name: 'USDC',
      symbol: 'USDC',
      chainId: 1,
    } as Token,
    recipient: '0x4444444444444444444444444444444444444444' as Hex,
    account: '0x5555555555555555555555555555555555555555' as Hex,
    assetLink: { toHome: '0x6666666666666666666666666666666666666666', toForeign: '0x7777777777777777777777777777777777777777' } as any,
    destinationDataParam: '0xDa7a' as Hex,
    amountToBridge: oneEther,
    feeDirectorStructEncoded: null,
    shouldDeliver: false,
  }

  it('should return null when bridgePathway is null', () => {
    const result = transactionInputs({
      ...baseParams,
      bridgePathway: null,
    })
    expect(result).toBeNull()
  })

  it('should return null when recipient is null', () => {
    const result = transactionInputs({
      ...baseParams,
      recipient: null,
    })
    expect(result).toBeNull()
  })

  it('should return null when recipient is not a valid address', () => {
    const result = transactionInputs({
      ...baseParams,
      recipient: '0xinvalid' as Hex,
    })
    expect(result).toBeNull()
  })

  it('should return null when recipient is zero address', () => {
    const result = transactionInputs({
      ...baseParams,
      recipient: zeroAddress,
    })
    expect(result).toBeNull()
  })

  it('should return null when account is null', () => {
    const result = transactionInputs({
      ...baseParams,
      account: null,
    })
    expect(result).toBeNull()
  })

  it('should return null when account is not a valid address', () => {
    const result = transactionInputs({
      ...baseParams,
      account: '0xinvalid' as Hex,
    })
    expect(result).toBeNull()
  })

  it('should return null when account is zero address', () => {
    const result = transactionInputs({
      ...baseParams,
      account: zeroAddress,
    })
    expect(result).toBeNull()
  })

  it('should return null when assetIn is null', () => {
    const result = transactionInputs({
      ...baseParams,
      assetIn: null,
    })
    expect(result).toBeNull()
  })

  it('should return null when assetLink is null', () => {
    const result = transactionInputs({
      ...baseParams,
      assetLink: null,
    })
    expect(result).toBeNull()
  })

  describe('bridged token (interactingWithBridgeToken = true)', () => {
    const bridgedTokenParams = {
      ...baseParams,
      assetIn: {
        address: '0x6666666666666666666666666666666666666666', // matches toHome from assetLink
        decimals: 18,
        name: 'Bridged Token',
        symbol: 'BTK',
        chainId: 1,
      } as Token,
      assetLink: {
        toHome: { home: '0x6666666666666666666666666666666666666666' as Hex, foreign: '0x9999999999999999999999999999999999999999' as Hex },
      } as any,
    }

    it('should return null when destinationDataParam is missing', () => {
      const result = transactionInputs({
        ...bridgedTokenParams,
        destinationDataParam: null,
      })
      expect(result).toBeNull()
    })

    it('should encode transferAndCall without extra param', () => {
      const result = transactionInputs({
        ...bridgedTokenParams,
        bridgePathway: {
          ...baseParams.bridgePathway,
          usesExtraParam: false,
        } as any,
      })
      expect(result).toBeDefined()
      expect(result?.to).toBe(bridgedTokenParams.assetIn.address)
      expect(result?.value).toBe(0n)
      expect(result?.data).toBe('0xMOCKED_FUNCTION_DATA')
    })

    it('should encode transferAndCall with extra param', () => {
      const result = transactionInputs({
        ...bridgedTokenParams,
        bridgePathway: {
          ...baseParams.bridgePathway,
          usesExtraParam: true,
        } as any,
      })
      expect(result).toBeDefined()
      expect(result?.to).toBe(bridgedTokenParams.assetIn.address)
      expect(result?.value).toBe(0n)
      expect(result?.data).toBe('0xMOCKED_FUNCTION_DATA')
    })
  })

  describe('native token input (assetIn.address === zeroAddress)', () => {
    const nativeTokenParams = {
      ...baseParams,
      assetIn: {
        address: zeroAddress,
        decimals: 18,
        name: 'Ether',
        symbol: 'ETH',
        chainId: 1,
      } as Token,
    }

    describe('with delivery (feeManager = from, shouldDeliver = true)', () => {
      const deliveryParams = {
        ...nativeTokenParams,
        shouldDeliver: true,
        feeDirectorStructEncoded: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as Hex,
        bridgePathway: {
          ...baseParams.bridgePathway,
          feeManager: 'from' as const,
          destinationRouter: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' as Hex,
        } as any,
      }

      it('should return null when feeDirectorStructEncoded is missing', () => {
        const result = transactionInputs({
          ...deliveryParams,
          feeDirectorStructEncoded: null,
        })
        expect(result).toBeNull()
      })

      it('should return null when destinationRouter is missing', () => {
        const result = transactionInputs({
          ...deliveryParams,
          bridgePathway: {
            ...deliveryParams.bridgePathway,
            destinationRouter: null,
          } as any,
        })
        expect(result).toBeNull()
      })

      it('should encode relayTokensAndCall without extra param', () => {
        const result = transactionInputs({
          ...deliveryParams,
          bridgePathway: {
            ...deliveryParams.bridgePathway,
            usesExtraParam: false,
          } as any,
        })
        expect(result).toBeDefined()
        expect(result?.to).toBe(baseParams.bridgePathway.nativeRouter)
        expect(result?.value).toBe(oneEther)
        expect(result?.data).toBe('0xMOCKED_FUNCTION_DATA')
      })

      it('should encode relayTokensAndCall with extra param', () => {
        const result = transactionInputs({
          ...deliveryParams,
          bridgePathway: {
            ...deliveryParams.bridgePathway,
            usesExtraParam: true,
          } as any,
        })
        expect(result).toBeDefined()
        expect(result?.to).toBe(baseParams.bridgePathway.nativeRouter)
        expect(result?.value).toBe(oneEther)
        expect(result?.data).toBe('0xMOCKED_FUNCTION_DATA')
      })
    })

    describe('without delivery (foreign to home or no delivery)', () => {
      const noDeliveryParams = {
        ...nativeTokenParams,
        shouldDeliver: false,
      }

      it('should encode wrapAndRelayTokens without extra param', () => {
        const result = transactionInputs({
          ...noDeliveryParams,
          bridgePathway: {
            ...baseParams.bridgePathway,
            usesExtraParam: false,
          } as any,
        })
        expect(result).toBeDefined()
        expect(result?.to).toBe(baseParams.bridgePathway.nativeRouter)
        expect(result?.value).toBe(oneEther)
        expect(result?.data).toBe('0xMOCKED_FUNCTION_DATA')
      })

      it('should encode wrapAndRelayTokens with extra param', () => {
        const result = transactionInputs({
          ...noDeliveryParams,
          bridgePathway: {
            ...baseParams.bridgePathway,
            usesExtraParam: true,
          } as any,
        })
        expect(result).toBeDefined()
        expect(result?.to).toBe(baseParams.bridgePathway.nativeRouter)
        expect(result?.value).toBe(oneEther)
        expect(result?.data).toBe('0xMOCKED_FUNCTION_DATA')
      })
    })
  })

  describe('ERC20 token input (tokens native to this side)', () => {
    const erc20Params = {
      ...baseParams,
      assetIn: {
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        decimals: 6,
        name: 'USDC',
        symbol: 'USDC',
        chainId: 1,
      } as Token,
      // assetLink with addresses that don't match assetIn.address so interactingWithBridgeToken returns false
      assetLink: {
        toForeign: { home: '0x7777777777777777777777777777777777777777' as Hex, foreign: null },
        toHome: { home: null, foreign: '0x8888888888888888888888888888888888888888' as Hex },
      } as any,
    }

    describe('with delivery (shouldDeliver = true, requiresDelivery = true)', () => {
      const deliveryParams = {
        ...erc20Params,
        shouldDeliver: true,
        feeDirectorStructEncoded: '0xcccccccccccccccccccccccccccccccccccccccc' as Hex,
        bridgePathway: {
          ...baseParams.bridgePathway,
          requiresDelivery: true,
          destinationRouter: '0xdddddddddddddddddddddddddddddddddddddddd' as Hex,
        } as any,
      }

      it('should return null when feeDirectorStructEncoded is missing', () => {
        const result = transactionInputs({
          ...deliveryParams,
          feeDirectorStructEncoded: null,
        })
        expect(result).toBeNull()
      })

      it('should return null when destinationRouter is missing', () => {
        const result = transactionInputs({
          ...deliveryParams,
          bridgePathway: {
            ...deliveryParams.bridgePathway,
            destinationRouter: null,
          } as any,
        })
        expect(result).toBeNull()
      })

      it('should encode relayTokensAndCall without extra param', () => {
        const result = transactionInputs({
          ...deliveryParams,
          bridgePathway: {
            ...deliveryParams.bridgePathway,
            usesExtraParam: false,
          } as any,
        })
        expect(result).toBeDefined()
        expect(result?.to).toBe(baseParams.bridgePathway.from)
        expect(result?.value).toBe(0n)
        expect(result?.data).toBe('0xMOCKED_FUNCTION_DATA')
      })

      it('should encode relayTokensAndCall with extra param', () => {
        const result = transactionInputs({
          ...deliveryParams,
          bridgePathway: {
            ...deliveryParams.bridgePathway,
            usesExtraParam: true,
          } as any,
        })
        expect(result).toBeDefined()
        expect(result?.to).toBe(baseParams.bridgePathway.from)
        expect(result?.value).toBe(0n)
        expect(result?.data).toBe('0xMOCKED_FUNCTION_DATA')
      })
    })

    describe('without delivery (shouldDeliver = false or requiresDelivery = false)', () => {
      const noDeliveryParams = {
        ...erc20Params,
        shouldDeliver: false,
        bridgePathway: {
          ...baseParams.bridgePathway,
          requiresDelivery: false,
        } as any,
      }

      it('should encode relayTokens without extra param', () => {
        const result = transactionInputs({
          ...noDeliveryParams,
          bridgePathway: {
            ...noDeliveryParams.bridgePathway,
            usesExtraParam: false,
          } as any,
        })
        expect(result).toBeDefined()
        expect(result?.to).toBe(baseParams.bridgePathway.from)
        expect(result?.value).toBe(0n)
        expect(result?.data).toBe('0xMOCKED_FUNCTION_DATA')
      })

      it('should encode relayTokens with extra param', () => {
        const result = transactionInputs({
          ...noDeliveryParams,
          bridgePathway: {
            ...noDeliveryParams.bridgePathway,
            usesExtraParam: true,
          } as any,
        })
        expect(result).toBeDefined()
        expect(result?.to).toBe(baseParams.bridgePathway.from)
        expect(result?.value).toBe(0n)
        expect(result?.data).toBe('0xMOCKED_FUNCTION_DATA')
      })

      it('should encode relayTokens when shouldDeliver is true but requiresDelivery is false', () => {
        const result = transactionInputs({
          ...noDeliveryParams,
          shouldDeliver: true, // Even with shouldDeliver true, requiresDelivery false takes precedence
        })
        expect(result).toBeDefined()
        expect(result?.to).toBe(baseParams.bridgePathway.from)
        expect(result?.value).toBe(0n)
        expect(result?.data).toBe('0xMOCKED_FUNCTION_DATA')
      })
    })
  })
})
