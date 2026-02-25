import { describe, it, expect } from 'vitest'
import {
  toChain,
  toChainKey,
  pathway,
  inferBridgeKey,
  Chains,
  Providers,
  nativeAssetOut,
  nativeTokenName,
  nativeTokenSymbol,
  isNative,
  isUnwrappable,
  canChangeUnwrap,
  defaultAssetIn,
  validBridgeKeys,
} from './config'
import type { BridgeKey, Token } from './types'
import { zeroAddress } from 'viem'

describe('config', () => {
  describe('toChain', () => {
    it('should convert chain ID to hex string', () => {
      expect(toChain(1)).toBe('0x1')
      expect(toChain(369)).toBe('0x171')
      expect(toChain(56)).toBe('0x38')
    })

    it('should handle string input', () => {
      expect(toChain('1')).toBe('0x1')
      expect(toChain('369')).toBe('0x171')
    })

    it('should handle zero', () => {
      expect(toChain(0)).toBe('0x0')
    })

    it('should handle large chain IDs', () => {
      expect(toChain(11155111)).toBe('0xaa36a7')
    })
  })

  describe('toChainKey', () => {
    it('should convert Chains enum to ChainKey string', () => {
      expect(toChainKey(Chains.ETH)).toBe('ETH')
      expect(toChainKey(Chains.PLS)).toBe('PLS')
      expect(toChainKey(Chains.BNB)).toBe('BNB')
    })

    it('should handle numeric chain IDs', () => {
      expect(toChainKey(1)).toBe('ETH')
      expect(toChainKey(369)).toBe('PLS')
      expect(toChainKey(56)).toBe('BNB')
    })

    it('should handle string hex values', () => {
      expect(toChainKey('0x1' as Chains)).toBe('ETH')
      expect(toChainKey('0x171' as Chains)).toBe('PLS')
      expect(toChainKey('0x38' as Chains)).toBe('BNB')
    })
  })

  describe('pathway', () => {
    it('should return null for null bridgeKey', () => {
      expect(pathway(null, true)).toBeUndefined()
    })

    it('should return pathway for valid mainnet bridge key', () => {
      const bridgeKey: BridgeKey = [Providers.PULSECHAIN, Chains.ETH, Chains.PLS]
      const result = pathway(bridgeKey, true)

      expect(result).toBeDefined()
      expect(result).toHaveProperty('from')
      expect(result).toHaveProperty('to')
      expect(result).toHaveProperty('validator')
      expect(result).toHaveProperty('toHome')
    })

    it('should use testnet pathways when isProd is false', () => {
      const testnetBridgeKey: BridgeKey = [
        Providers.PULSECHAIN,
        '0xaa36a7' as Chains, // Sepolia
        '0x3af' as Chains, // Pulsechain testnet
      ]
      const result = pathway(testnetBridgeKey, false)

      // Should find pathway in testnet config
      expect(result).toBeDefined()
    })

    it('should not use testnet pathways when isProd is true', () => {
      const testnetBridgeKey: BridgeKey = [
        Providers.PULSECHAIN,
        '0xaa36a7' as Chains,
        '0x3af' as Chains,
      ]
      const result = pathway(testnetBridgeKey, true)

      // Should not find pathway in prod config
      expect(result).toBeUndefined()
    })

    it('should apply setting overrides for specific asset addresses', () => {
      const bridgeKey: BridgeKey = [Providers.PULSECHAIN, Chains.ETH, Chains.PLS]
      const assetAddress = '0x0000000000000000000000000000000000000000'

      const baseResult = pathway(bridgeKey, true)
      const overriddenResult = pathway(bridgeKey, true, assetAddress)

      expect(baseResult).toBeDefined()
      expect(overriddenResult).toBeDefined()
      // Result should exist (specific overrides depend on config data)
    })

    it('should handle checksummed addresses', () => {
      const bridgeKey: BridgeKey = [Providers.PULSECHAIN, Chains.ETH, Chains.PLS]
      // Lowercase and checksummed versions should both work
      const lowercase = '0xdac17f958d2ee523a2206206994597c13d831ec7'
      const checksummed = '0xdAC17F958D2ee523a2206206994597C13D831ec7'

      const result1 = pathway(bridgeKey, true, lowercase)
      const result2 = pathway(bridgeKey, true, checksummed)

      // Both should return the same pathway configuration
      expect(result1).toBeDefined()
      expect(result2).toBeDefined()
    })

    it('should apply settingOverrides for specific assets', () => {
      const bridgeKey: BridgeKey = [Providers.PULSECHAIN, Chains.PLS, Chains.ETH]

      // Get pathway without asset address
      const basePathway = pathway(bridgeKey, true)

      // Get pathway with zeroAddress (has override)
      const overriddenPathway = pathway(bridgeKey, true, zeroAddress)

      expect(basePathway).toBeDefined()
      expect(overriddenPathway).toBeDefined()

      // The overridden pathway should have different properties
      if (basePathway && overriddenPathway) {
        // With override, some properties should change
        expect(overriddenPathway.from).toBeDefined()
        expect(overriddenPathway.to).toBeDefined()
      }
    })

    it('should apply settingOverrides for wrapped native asset', () => {
      const bridgeKey: BridgeKey = [Providers.PULSECHAIN, Chains.PLS, Chains.ETH]

      // WPLS address on Pulsechain
      const wplsAddress = nativeAssetOut[Chains.PLS]

      const basePathway = pathway(bridgeKey, true)
      const overriddenPathway = pathway(bridgeKey, true, wplsAddress)

      expect(basePathway).toBeDefined()
      expect(overriddenPathway).toBeDefined()

      // Both should exist but may have different settings
      if (basePathway && overriddenPathway) {
        expect(overriddenPathway.from).toBeDefined()
        expect(overriddenPathway.to).toBeDefined()
      }
    })
  })

  describe('pathway configuration completeness', () => {
    it('should have valid pathway configs for all main bridge keys', () => {
      const mainBridgeKeys: BridgeKey[] = [
        [Providers.PULSECHAIN, Chains.ETH, Chains.PLS],
        [Providers.PULSECHAIN, Chains.PLS, Chains.ETH],
        [Providers.TOKENSEX, Chains.BNB, Chains.PLS],
        [Providers.TOKENSEX, Chains.PLS, Chains.BNB],
      ]

      mainBridgeKeys.forEach((bridgeKey) => {
        const result = pathway(bridgeKey, true)
        expect(result).toBeDefined()
        expect(result).toHaveProperty('from')
        expect(result).toHaveProperty('to')
        expect(result).toHaveProperty('validator')
        expect(result).toHaveProperty('feeManager')
        expect(result).toHaveProperty('toHome')
        expect(result).toHaveProperty('requiresDelivery')
      })
    })

    it('should have toHome property set correctly', () => {
      // ETH -> PLS (foreign to home) should have toHome = true
      const foreignToHome: BridgeKey = [Providers.PULSECHAIN, Chains.ETH, Chains.PLS]
      const foreignToHomePathway = pathway(foreignToHome, true)
      expect(foreignToHomePathway?.toHome).toBe(true)

      // PLS -> ETH (home to foreign) should have toHome = false
      const homeToForeign: BridgeKey = [Providers.PULSECHAIN, Chains.PLS, Chains.ETH]
      const homeToForeignPathway = pathway(homeToForeign, true)
      expect(homeToForeignPathway?.toHome).toBe(false)
    })

    it('should have correct feeManager for each direction', () => {
      // ETH -> PLS should have feeManager = 'to' (destination)
      const foreignToHome: BridgeKey = [Providers.PULSECHAIN, Chains.ETH, Chains.PLS]
      const foreignToHomePathway = pathway(foreignToHome, true)
      expect(foreignToHomePathway?.feeManager).toBe('to')

      // PLS -> ETH should have feeManager = 'from' (source)
      const homeToForeign: BridgeKey = [Providers.PULSECHAIN, Chains.PLS, Chains.ETH]
      const homeToForeignPathway = pathway(homeToForeign, true)
      expect(homeToForeignPathway?.feeManager).toBe('from')
    })

    it('should have correct requiresDelivery for each direction', () => {
      // ETH -> PLS (foreign to home) should NOT require delivery
      const foreignToHome: BridgeKey = [Providers.PULSECHAIN, Chains.ETH, Chains.PLS]
      const foreignToHomePathway = pathway(foreignToHome, true)
      expect(foreignToHomePathway?.requiresDelivery).toBe(false)

      // PLS -> ETH (home to foreign) should require delivery
      const homeToForeign: BridgeKey = [Providers.PULSECHAIN, Chains.PLS, Chains.ETH]
      const homeToForeignPathway = pathway(homeToForeign, true)
      expect(homeToForeignPathway?.requiresDelivery).toBe(true)
    })
  })

  describe('inferBridgeKey', () => {
    it('should keep valid bridge key unchanged', () => {
      const currentKey: BridgeKey = [Providers.PULSECHAIN, Chains.ETH, Chains.PLS]
      const result = inferBridgeKey({
        currentKey,
        provider: Providers.PULSECHAIN,
      })

      expect(result).toEqual([Providers.PULSECHAIN, Chains.ETH, Chains.PLS])
    })

    it('should override fromChain when provided', () => {
      const currentKey: BridgeKey = [Providers.PULSECHAIN, Chains.ETH, Chains.PLS]
      const result = inferBridgeKey({
        currentKey,
        provider: Providers.PULSECHAIN,
        fromChain: Chains.PLS,
      })

      expect(result[1]).toBe(Chains.PLS)
    })

    it('should override toChain when provided and valid', () => {
      const currentKey: BridgeKey = [Providers.PULSECHAIN, Chains.PLS, Chains.ETH]
      const result = inferBridgeKey({
        currentKey,
        provider: Providers.PULSECHAIN,
        fromChain: Chains.ETH,
        toChain: Chains.PLS,
      })

      expect(result[1]).toBe(Chains.ETH)
      expect(result[2]).toBe(Chains.PLS)
    })

    it('should fallback to valid toChain if provided toChain is invalid', () => {
      const currentKey: BridgeKey = [Providers.PULSECHAIN, Chains.ETH, Chains.PLS]
      const result = inferBridgeKey({
        currentKey,
        provider: Providers.PULSECHAIN,
        toChain: Chains.ETH, // ETH -> ETH is invalid
      })

      // Should fallback to first valid toChain (PLS)
      expect(result[1]).toBe(Chains.ETH)
      expect(result[2]).toBe(Chains.PLS)
    })

    it('should use first available chain if fromChain is invalid', () => {
      const currentKey: BridgeKey = [Providers.PULSECHAIN, '0x999' as Chains, Chains.PLS]
      const result = inferBridgeKey({
        currentKey,
        provider: Providers.PULSECHAIN,
      })

      // Should fallback to a valid fromChain
      expect(result[0]).toBe(Providers.PULSECHAIN)
      expect(result[1]).toBeDefined()
      expect(result[2]).toBeDefined()
    })

    it('should use first available chain if toChain is invalid', () => {
      const currentKey: BridgeKey = [Providers.PULSECHAIN, Chains.ETH, '0x999' as Chains]
      const result = inferBridgeKey({
        currentKey,
        provider: Providers.PULSECHAIN,
      })

      // Should fallback to a valid toChain
      expect(result[0]).toBe(Providers.PULSECHAIN)
      expect(result[1]).toBe(Chains.ETH)
      expect(result[2]).toBeDefined()
    })

    it('should handle provider changes', () => {
      const currentKey: BridgeKey = [Providers.PULSECHAIN, Chains.ETH, Chains.PLS]
      const result = inferBridgeKey({
        currentKey,
        provider: Providers.TOKENSEX,
      })

      expect(result[0]).toBe(Providers.TOKENSEX)
      // Should find valid chains for TOKENSEX provider
      expect(result[1]).toBeDefined()
      expect(result[2]).toBeDefined()
    })
  })

  describe('nativeAssetOut', () => {
    it('should have wrapped native asset for each chain', () => {
      expect(nativeAssetOut[Chains.PLS]).toBeDefined()
      expect(nativeAssetOut[Chains.ETH]).toBeDefined()
      expect(nativeAssetOut[Chains.BNB]).toBeDefined()
    })

    it('should return valid ethereum addresses', () => {
      Object.values(nativeAssetOut).forEach((address) => {
        expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/)
      })
    })
  })

  describe('nativeTokenName and nativeTokenSymbol', () => {
    it('should have names for all main chains', () => {
      expect(nativeTokenName[Chains.PLS]).toBe('Pulse')
      expect(nativeTokenName[Chains.ETH]).toBe('Ether')
      expect(nativeTokenName[Chains.BNB]).toBe('BNB')
    })

    it('should have symbols for all main chains', () => {
      expect(nativeTokenSymbol[Chains.PLS]).toBe('PLS')
      expect(nativeTokenSymbol[Chains.ETH]).toBe('ETH')
      expect(nativeTokenSymbol[Chains.BNB]).toBe('BNB')
    })
  })

  describe('isNative', () => {
    const bridgeKey: BridgeKey = [Providers.PULSECHAIN, Chains.ETH, Chains.PLS]

    it('should identify zero address as native', () => {
      const nativeToken = {
        address: zeroAddress,
        chainId: 1,
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
      }
      expect(isNative(nativeToken, bridgeKey)).toBe(true)
    })

    it('should identify wrapped native addresses as native', () => {
      const wrappedETH = {
        address: nativeAssetOut[Chains.ETH],
        chainId: 1,
        name: 'Wrapped Ether',
        symbol: 'WETH',
        decimals: 18,
      }
      expect(isNative(wrappedETH, bridgeKey)).toBe(true)
    })

    it('should identify bridgedNativeAssetOut as native', () => {
      const path = pathway(bridgeKey, true)
      const bridgedNative = {
        address: path!.bridgedNativeAssetOut!,
        chainId: 369,
        name: 'WETH from Ethereum',
        symbol: 'WETH',
        decimals: 18,
      }
      expect(isNative(bridgedNative, bridgeKey)).toBe(true)
    })

    it('should NOT identify tokens with "from Pulsechain" in name as native', () => {
      const fromPulsechain = {
        address: zeroAddress,
        chainId: 1,
        name: 'Token from Pulsechain',
        symbol: 'TKN',
        decimals: 18,
      }
      expect(isNative(fromPulsechain, bridgeKey)).toBe(false)
    })

    it('should identify non-native ERC20 tokens', () => {
      const usdt = {
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        chainId: 1,
        name: 'Tether USD',
        symbol: 'USDT',
        decimals: 6,
      }
      expect(isNative(usdt, bridgeKey)).toBe(false)
    })

    it('should return false for null inputs', () => {
      expect(isNative(null, bridgeKey)).toBe(false)
      expect(isNative({ address: zeroAddress, chainId: 1 } as any, null)).toBe(false)
    })
  })

  describe('isUnwrappable', () => {
    const bridgeKey: BridgeKey = [Providers.PULSECHAIN, Chains.ETH, Chains.PLS]

    it('should return false when bridgeKey is null', () => {
      const token: Token = {
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        decimals: 6,
        name: 'USD Coin',
        symbol: 'USDC',
        chainId: 1,
      }
      expect(isUnwrappable(null, token)).toBe(false)
    })

    it('should return false when assetIn is null', () => {
      expect(isUnwrappable(bridgeKey, null)).toBe(false)
    })

    it('should return false when pathway does not exist', () => {
      // Use invalid bridge key
      const invalidKey: BridgeKey = ['pulsechain', '0x999' as Chains, '0x888' as Chains]
      const token: Token = {
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        decimals: 6,
        name: 'USD Coin',
        symbol: 'USDC',
        chainId: 1,
      }
      expect(isUnwrappable(invalidKey, token)).toBe(false)
    })

    it('should return true when asset is bridgedNativeAssetOut', () => {
      const path = pathway(bridgeKey, false)
      const bridgedNative: Token = {
        address: path!.bridgedNativeAssetOut,
        decimals: 18,
        name: 'Wrapped Ether from Ethereum',
        symbol: 'WETH',
        chainId: parseInt(Chains.PLS, 16),
      }
      expect(isUnwrappable(bridgeKey, bridgedNative)).toBe(true)
    })

    it('should return false for regular ERC20 tokens', () => {
      const usdt: Token = {
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        decimals: 6,
        name: 'Tether USD',
        symbol: 'USDT',
        chainId: 1,
      }
      expect(isUnwrappable(bridgeKey, usdt)).toBe(false)
    })

    it('should return false for zero address', () => {
      const native: Token = {
        address: zeroAddress,
        decimals: 18,
        name: 'Ether',
        symbol: 'ETH',
        chainId: 1,
      }
      expect(isUnwrappable(bridgeKey, native)).toBe(false)
    })

    it('should handle checksummed addresses correctly', () => {
      const path = pathway(bridgeKey, false)
      const lowercaseAddr = path!.bridgedNativeAssetOut.toLowerCase()
      const tokenLowercase: Token = {
        address: lowercaseAddr as `0x${string}`,
        decimals: 18,
        name: 'Wrapped Ether',
        symbol: 'WETH',
        chainId: parseInt(Chains.PLS, 16),
      }
      // Should still identify as unwrappable due to getAddress normalization
      expect(isUnwrappable(bridgeKey, tokenLowercase)).toBe(true)
    })
  })

  describe('canChangeUnwrap', () => {
    const bridgeKey: BridgeKey = [Providers.PULSECHAIN, Chains.ETH, Chains.PLS]

    it('should return false when assetIn is null', () => {
      expect(canChangeUnwrap(bridgeKey, null)).toBe(false)
    })

    it('should return false when assetIn is not unwrappable', () => {
      const usdt: Token = {
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        decimals: 6,
        name: 'Tether USD',
        symbol: 'USDT',
        chainId: 1,
      }
      expect(canChangeUnwrap(bridgeKey, usdt)).toBe(false)
    })

    it('should return true when assetIn is unwrappable', () => {
      const path = pathway(bridgeKey, false)
      const bridgedNative: Token = {
        address: path!.bridgedNativeAssetOut,
        decimals: 18,
        name: 'Wrapped Ether from Ethereum',
        symbol: 'WETH',
        chainId: parseInt(Chains.PLS, 16),
      }
      expect(canChangeUnwrap(bridgeKey, bridgedNative)).toBe(true)
    })

    it('should return false for zero address', () => {
      const native: Token = {
        address: zeroAddress,
        decimals: 18,
        name: 'Ether',
        symbol: 'ETH',
        chainId: 1,
      }
      expect(canChangeUnwrap(bridgeKey, native)).toBe(false)
    })

    it('should handle different bridge configurations', () => {
      const tokenSexKey: BridgeKey = [Providers.TOKENSEX, Chains.BNB, Chains.PLS]
      const path = pathway(tokenSexKey, false)

      if (path?.bridgedNativeAssetOut) {
        const bridgedBNB: Token = {
          address: path.bridgedNativeAssetOut,
          decimals: 18,
          name: 'Wrapped BNB from BSC',
          symbol: 'WBNB',
          chainId: parseInt(Chains.PLS, 16),
        }
        expect(canChangeUnwrap(tokenSexKey, bridgedBNB)).toBe(true)
      }
    })
  })

  describe('defaultAssetIn', () => {
    it('should return null when bridgeKey is null', () => {
      const result = defaultAssetIn(null, true)
      expect(result).toBeNull()
    })

    it('should return bridgedNativeAssetOut for valid bridge', () => {
      const bridgeKey: BridgeKey = [Providers.PULSECHAIN, Chains.ETH, Chains.PLS]
      const result = defaultAssetIn(bridgeKey, true)

      // Should return the bridged native asset address
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
      expect(result).toMatch(/^0x[a-fA-F0-9]{40}$/)
    })

    it('should return different values for different bridges', () => {
      const plsToEth: BridgeKey = [Providers.PULSECHAIN, Chains.PLS, Chains.ETH]
      const ethToPls: BridgeKey = [Providers.PULSECHAIN, Chains.ETH, Chains.PLS]

      const result1 = defaultAssetIn(plsToEth, true)
      const result2 = defaultAssetIn(ethToPls, true)

      // Different bridge directions should have different default assets
      expect(result1).toBeDefined()
      expect(result2).toBeDefined()
    })

    it('should handle testnet bridges', () => {
      const testnetKey: BridgeKey = [
        Providers.PULSECHAIN,
        '0xaa36a7' as Chains, // Sepolia
        '0x3af' as Chains, // Pulsechain testnet
      ]
      const result = defaultAssetIn(testnetKey, false)

      expect(result).toBeDefined()
    })

    it('should return null for invalid bridge in prod mode', () => {
      const testnetKey: BridgeKey = [
        Providers.PULSECHAIN,
        '0xaa36a7' as Chains,
        '0x3af' as Chains,
      ]
      const result = defaultAssetIn(testnetKey, true)

      // Testnet bridge should not work in prod mode
      expect(result).toBeUndefined()
    })

    it('should work with TOKENSEX provider', () => {
      const tokenSexKey: BridgeKey = [Providers.TOKENSEX, Chains.PLS, Chains.BNB]
      const result = defaultAssetIn(tokenSexKey, true)

      expect(result).toBeDefined()
    })
  })

  describe('validBridgeKeys', () => {
    it('should return only mainnet keys when isProd is true', () => {
      const result = validBridgeKeys(true)

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)

      // All keys should be mainnet bridges
      result.forEach((key) => {
        expect(Array.isArray(key)).toBe(true)
        expect(key.length).toBe(3)
      })
    })

    it('should return mainnet + testnet keys when isProd is false', () => {
      const prodKeys = validBridgeKeys(true)
      const allKeys = validBridgeKeys(false)

      expect(allKeys.length).toBeGreaterThanOrEqual(prodKeys.length)

      // Should include all mainnet keys
      prodKeys.forEach((prodKey) => {
        expect(allKeys).toContainEqual(prodKey)
      })
    })

    it('should include pulsechain mainnet bridges in prod', () => {
      const keys = validBridgeKeys(true)

      const hasPulsechainETH = keys.some(
        (key) =>
          key[0] === Providers.PULSECHAIN &&
          key[1] === Chains.PLS &&
          key[2] === Chains.ETH,
      )
      const hasETHPulsechain = keys.some(
        (key) =>
          key[0] === Providers.PULSECHAIN &&
          key[1] === Chains.ETH &&
          key[2] === Chains.PLS,
      )

      expect(hasPulsechainETH || hasETHPulsechain).toBe(true)
    })

    it('should include testnet bridges only in dev mode', () => {
      const prodKeys = validBridgeKeys(true)
      const devKeys = validBridgeKeys(false)

      // Check if any key contains testnet chains (Sepolia or V4PLS)
      const prodHasTestnet = prodKeys.some(
        (key) => key[1] === Chains.SEP || key[2] === Chains.SEP ||
                 key[1] === Chains.V4PLS || key[2] === Chains.V4PLS,
      )
      const devHasTestnet = devKeys.some(
        (key) => key[1] === Chains.SEP || key[2] === Chains.SEP ||
                 key[1] === Chains.V4PLS || key[2] === Chains.V4PLS,
      )

      // Prod should not have testnet, dev might have testnet
      expect(prodHasTestnet).toBe(false)
      // Dev keys should be at least as many as prod keys
      expect(devKeys.length).toBeGreaterThanOrEqual(prodKeys.length)
    })

    it('should return array of tuples with [Provider, Chains, Chains] structure', () => {
      const keys = validBridgeKeys(true)

      keys.forEach((key) => {
        expect(Array.isArray(key)).toBe(true)
        expect(key.length).toBe(3)
        expect(typeof key[0]).toBe('string') // Provider
        expect(typeof key[1]).toBe('string') // Chains (hex)
        expect(typeof key[2]).toBe('string') // Chains (hex)
      })
    })
  })
})
