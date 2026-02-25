import type { Token, BridgeKey } from '@gibs/bridge-sdk/types'
import { SvelteMap } from 'svelte/reactivity'

/**
 * Detects if a token is already bridged and being sent to a chain
 * where it will create a worthless double-wrapped token.
 *
 * Example: USDC on Ethereum (already bridged from native Circle USDC)
 * being bridged to BSC would create "Bridged USDC from Ethereum" on BSC.
 */
export function isAlreadyBridgedToken(
  token: Token | null,
  bridgeKey: BridgeKey,
): boolean {
  if (!token?.extensions?.bridgeInfo) return false

  const [, , toChain] = bridgeKey
  const destinationChainId = Number(toChain)
  const bridgeInfo = token.extensions.bridgeInfo

  // Check if token has origin info for chains OTHER than destination
  // If so, bridging will create a double-wrapped token
  const hasOtherOrigins = Object.keys(bridgeInfo).some(
    (chainId) => Number(chainId) !== destinationChainId,
  )

  return hasOtherOrigins
}

/**
 * Gets the native/recommended token to swap to before bridging.
 * For now, always recommends the native token of the source chain.
 */
export function getRecommendedSwapToken(bridgeKey: BridgeKey): {
  symbol: string
  name: string
  isNative: true
} {
  // Map chain to native token
  const nativeTokens: Record<number, { symbol: string; name: string }> = {
    1: { symbol: 'ETH', name: 'Ethereum' },
    56: { symbol: 'BNB', name: 'BNB' },
    369: { symbol: 'PLS', name: 'PulseChain' },
    943: { symbol: 'tPLS', name: 'Test PulseChain' },
    11155111: { symbol: 'ETH', name: 'Sepolia ETH' },
  }

  const [, fromChain] = bridgeKey
  const fromChainId = Number(fromChain)
  const native = nativeTokens[fromChainId] || { symbol: 'Native', name: 'Native Token' }

  return {
    ...native,
    isNative: true,
  }
}

/**
 * Store to track user's bypass preference.
 * Persisted to localStorage.
 */
class BridgedTokenBypassStore {
  private key = 'gibs:bypass-bridged-token-warning'
  bypassed = $state(false)

  constructor() {
    // Load from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.key)
      this.bypassed = stored === 'true'
    }
  }

  toggle() {
    this.bypassed = !this.bypassed
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.key, String(this.bypassed))
    }
  }

  reset() {
    this.bypassed = false
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.key)
    }
  }
}

export const bypassStore = new BridgedTokenBypassStore()

/**
 * Store to track completed swaps (in current session).
 * Map of token address → swap completion status
 */
export const completedSwaps = new SvelteMap<string, boolean>()

export function markSwapCompleted(tokenAddress: string) {
  completedSwaps.set(tokenAddress.toLowerCase(), true)
}

export function hasCompletedSwap(tokenAddress: string | undefined): boolean {
  if (!tokenAddress) return false
  return completedSwaps.get(tokenAddress.toLowerCase()) ?? false
}

export function clearSwapHistory() {
  completedSwaps.clear()
}
