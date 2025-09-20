import { SvelteMap } from 'svelte/reactivity'
import { multicallErc20, erc20MetadataCalls } from '@gibs/common/erc20'
import { multicallRead } from '@gibs/common/multicall'
import type { Erc20Metadata, Call } from '@gibs/common/types'
import { clientFromChain } from './input.svelte'
import type { Hex, Chain } from 'viem'
import { zeroAddress, erc20Abi, erc20Abi_bytes32 } from 'viem'
import * as networks from 'viem/chains'
import { nativeTokenName, nativeTokenSymbol, Chains, toChain } from '@gibs/bridge-sdk/config'

export interface TokenMetadata {
  name: string
  symbol: string
  decimals: number
}

// In-memory cache for token metadata
const tokenMetadataCache = new SvelteMap<string, TokenMetadata>()

// Persistent storage key
const CACHE_STORAGE_KEY = 'token_metadata_cache'
const CACHE_VERSION = '1.0'
const CACHE_EXPIRY_MS = 60 * 60 * 1000 // 1 hour

interface CacheEntry {
  metadata: TokenMetadata
  timestamp: number
  version: string
}

interface CacheStorage {
  [key: string]: CacheEntry
}

// Load cache from localStorage on initialization
function loadCacheFromStorage(): void {
  try {
    const stored = localStorage.getItem(CACHE_STORAGE_KEY)
    if (!stored) return

    const cache: CacheStorage = JSON.parse(stored)
    const now = Date.now()

    Object.entries(cache).forEach(([key, entry]) => {
      // Check if entry is still valid (not expired and correct version)
      if (
        entry.version === CACHE_VERSION &&
        entry.timestamp &&
        now - entry.timestamp < CACHE_EXPIRY_MS
      ) {
        tokenMetadataCache.set(key, entry.metadata)
      }
    })
  } catch (error) {
    console.warn('Failed to load token metadata cache from localStorage:', error)
  }
}

// Save cache to localStorage
function saveCacheToStorage(): void {
  try {
    const cache: CacheStorage = {}
    const now = Date.now()

    tokenMetadataCache.forEach((metadata, key) => {
      cache[key] = {
        metadata,
        timestamp: now,
        version: CACHE_VERSION
      }
    })

    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cache))
  } catch (error) {
    console.warn('Failed to save token metadata cache to localStorage:', error)
  }
}

// Generate cache key
function getCacheKey(chainId: number, tokenAddress: string): string {
  return `${chainId}:${tokenAddress.toLowerCase()}`
}

// Get native token metadata
function getNativeTokenMetadata(chainId: number): TokenMetadata {
  const chain = Object.values(networks).find((c: Chain) => c.id === chainId)

  // Safely get native token info from SDK
  let name: string = chain?.nativeCurrency?.name || 'Native Token'
  let symbol: string = chain?.nativeCurrency?.symbol || 'ETH'
  const decimals = chain?.nativeCurrency?.decimals || 18

  // Try to get more specific info from SDK if available
  try {
    const chainKey = toChain(chainId)
    const sdkName = nativeTokenName[chainKey]
    const sdkSymbol = nativeTokenSymbol[chainKey]

    if (sdkName) {
      name = sdkName
    }
    if (sdkSymbol) {
      symbol = sdkSymbol as string
    }
  } catch {
    // Fallback to viem chain info
  }

  return { name, symbol, decimals }
}

// Batch fetch token metadata for multiple tokens on the same chain
async function batchFetchTokenMetadata(
  chainId: number,
  tokenAddresses: string[]
): Promise<Map<string, TokenMetadata | null>> {
  const results = new Map<string, TokenMetadata | null>()

  if (tokenAddresses.length === 0) return results

  try {
    // Get the chain and client
    const chain = Object.values(networks).find((c: Chain) => c.id === chainId)
    if (!chain) {
      console.warn(`Chain not found for chainId: ${chainId}`)
      tokenAddresses.forEach(addr => results.set(addr.toLowerCase(), null))
      return results
    }

    const client = clientFromChain(chainId)

    // Separate native tokens from ERC20 tokens
    const nativeTokens: string[] = []
    const erc20Tokens: string[] = []

    tokenAddresses.forEach(address => {
      if (address === zeroAddress || address.toLowerCase() === zeroAddress.toLowerCase()) {
        nativeTokens.push(address)
      } else {
        erc20Tokens.push(address)
      }
    })

    // Handle native tokens
    const nativeMetadata = getNativeTokenMetadata(chainId)
    nativeTokens.forEach(address => {
      results.set(address.toLowerCase(), nativeMetadata)
    })

    // Handle ERC20 tokens with batch multicall
    if (erc20Tokens.length > 0) {
      // Create calls for all tokens (3 calls per token: name, symbol, decimals)
      const calls: Call[] = []

      erc20Tokens.forEach(tokenAddress => {
        erc20MetadataCalls.forEach(call => {
          calls.push({
            ...call,
            target: tokenAddress as Hex,
          })
        })
      })

      try {
        // Try with standard ERC20 ABI first
        const batchResults = await multicallRead<string[]>({
          chain,
          client,
          abi: erc20Abi,
          calls,
        })

        // Process results (groups of 3: name, symbol, decimals)
        erc20Tokens.forEach((tokenAddress, tokenIndex) => {
          const startIndex = tokenIndex * 3
          const name = batchResults[startIndex] as string
          const symbol = batchResults[startIndex + 1] as string
          const decimals = Number(batchResults[startIndex + 2])

          if (name && symbol && !isNaN(decimals)) {
            results.set(tokenAddress.toLowerCase(), { name, symbol, decimals })
          } else {
            results.set(tokenAddress.toLowerCase(), null)
          }
        })
      } catch (error) {
        console.warn('Standard ERC20 batch call failed, trying bytes32 version:', error)

        try {
          // Fallback to bytes32 ABI
          const batchResults = await multicallRead<string[]>({
            chain,
            client,
            abi: erc20Abi_bytes32,
            calls,
          })

          // Process results (groups of 3: name, symbol, decimals)
          erc20Tokens.forEach((tokenAddress, tokenIndex) => {
            const startIndex = tokenIndex * 3
            const name = batchResults[startIndex] as string
            const symbol = batchResults[startIndex + 1] as string
            const decimals = Number(batchResults[startIndex + 2])

            if (name && symbol && !isNaN(decimals)) {
              results.set(tokenAddress.toLowerCase(), { name, symbol, decimals })
            } else {
              results.set(tokenAddress.toLowerCase(), null)
            }
          })
        } catch (fallbackError) {
          console.error('Both ERC20 batch calls failed:', fallbackError)
          // Set all tokens to null
          erc20Tokens.forEach(tokenAddress => {
            results.set(tokenAddress.toLowerCase(), null)
          })
        }
      }
    }
  } catch (error) {
    console.error(`Failed to batch fetch token metadata for chain ${chainId}:`, error)
    tokenAddresses.forEach(addr => results.set(addr.toLowerCase(), null))
  }

  return results
}

// Fetch token metadata from blockchain
async function fetchTokenMetadata(chainId: number, tokenAddress: string): Promise<TokenMetadata | null> {
  try {
    // Handle native token (zero address)
    if (tokenAddress === zeroAddress || tokenAddress.toLowerCase() === zeroAddress.toLowerCase()) {
      return getNativeTokenMetadata(chainId)
    }

    // Get the chain and client
    const chain = Object.values(networks).find((c: Chain) => c.id === chainId)
    if (!chain) {
      console.warn(`Chain not found for chainId: ${chainId}`)
      return null
    }

    const client = clientFromChain(chainId)

    // Load token metadata using multicallErc20
    const result = await multicallErc20({
      client,
      target: tokenAddress as Hex,
      chain
    })

    if (result) {
      const [name, symbol, decimals] = result
      return { name, symbol, decimals }
    }

    return null
  } catch (error) {
    console.error(`Failed to fetch token metadata for ${chainId}:${tokenAddress}:`, error)
    return null
  }
}

// Get token metadata (from cache or fetch)
export async function getTokenMetadata(chainId: number, tokenAddress: string): Promise<TokenMetadata | null> {
  const cacheKey = getCacheKey(chainId, tokenAddress)

  // Check cache first
  const cached = tokenMetadataCache.get(cacheKey)
  if (cached) {
    return cached
  }

  // Use batch fetch for single token (more efficient than individual call)
  const results = await batchFetchTokenMetadata(chainId, [tokenAddress])
  const metadata = results.get(tokenAddress.toLowerCase()) ?? null

  if (metadata) {
    // Cache the result
    tokenMetadataCache.set(cacheKey, metadata)
    saveCacheToStorage()
  }

  return metadata
}

// Get token metadata synchronously (only returns cached data)
export function getTokenMetadataSync(chainId: number, tokenAddress: string): TokenMetadata | null {
  const cacheKey = getCacheKey(chainId, tokenAddress)
  return tokenMetadataCache.get(cacheKey) || null
}

// Preload token metadata for multiple tokens using batched multicalls
export async function preloadTokenMetadata(tokens: Array<{ chainId: number; address: string }>): Promise<void> {
  // Group tokens by chain ID for batching
  const tokensByChain = new Map<number, string[]>()

  tokens.forEach(({ chainId, address }) => {
    const cacheKey = getCacheKey(chainId, address)

    // Skip if already cached
    if (tokenMetadataCache.has(cacheKey)) {
      return
    }

    if (!tokensByChain.has(chainId)) {
      tokensByChain.set(chainId, [])
    }
    tokensByChain.get(chainId)!.push(address)
  })

  // Batch fetch for each chain
  const batchPromises = Array.from(tokensByChain.entries()).map(async ([chainId, addresses]) => {
    try {
      const results = await batchFetchTokenMetadata(chainId, addresses)

      // Cache the results
      results.forEach((metadata, address) => {
        if (metadata) {
          const cacheKey = getCacheKey(chainId, address)
          tokenMetadataCache.set(cacheKey, metadata)
        }
      })
    } catch (error) {
      console.error(`Failed to batch preload tokens for chain ${chainId}:`, error)
    }
  })

  await Promise.allSettled(batchPromises)

  // Save to localStorage after all batches complete
  saveCacheToStorage()
}

// Batch get token metadata for multiple tokens on the same chain
export async function getBatchTokenMetadata(
  chainId: number,
  tokenAddresses: string[]
): Promise<Map<string, TokenMetadata | null>> {
  const results = new Map<string, TokenMetadata | null>()
  const uncachedAddresses: string[] = []

  // Check cache first
  tokenAddresses.forEach(address => {
    const cacheKey = getCacheKey(chainId, address)
    const cached = tokenMetadataCache.get(cacheKey)

    if (cached) {
      results.set(address.toLowerCase(), cached)
    } else {
      uncachedAddresses.push(address)
    }
  })

  // Batch fetch uncached tokens
  if (uncachedAddresses.length > 0) {
    const batchResults = await batchFetchTokenMetadata(chainId, uncachedAddresses)

    // Cache and add to results
    batchResults.forEach((metadata, address) => {
      results.set(address, metadata)

      if (metadata) {
        const cacheKey = getCacheKey(chainId, address)
        tokenMetadataCache.set(cacheKey, metadata)
      }
    })

    // Save to localStorage
    saveCacheToStorage()
  }

  return results
}

// Clear cache
export function clearTokenMetadataCache(): void {
  tokenMetadataCache.clear()
  localStorage.removeItem(CACHE_STORAGE_KEY)
}

// Get cache size
export function getCacheSize(): number {
  return tokenMetadataCache.size
}

// Utility functions for bridge transactions
export function getTokenAddressFromBridge(bridge: any): string {
  return bridge.originationToken?.address ||
    bridge.destinationToken?.address ||
    bridge.originationTokenAddress ||
    bridge.destinationTokenAddress ||
    ''
}

export function getTokenChainIdFromBridge(bridge: any): number {
  return Number(
    bridge.originationToken?.chainId ||
    bridge.destinationToken?.chainId ||
    bridge.originationTokenChainId ||
    bridge.destinationTokenChainId ||
    1
  )
}

export async function getBridgeTokenMetadata(bridge: any): Promise<TokenMetadata | null> {
  const address = getTokenAddressFromBridge(bridge)
  const chainId = getTokenChainIdFromBridge(bridge)

  if (!address) return null

  return await getTokenMetadata(chainId, address)
}

export function getBridgeTokenMetadataSync(bridge: any): TokenMetadata | null {
  const address = getTokenAddressFromBridge(bridge)
  const chainId = getTokenChainIdFromBridge(bridge)

  if (!address) return null

  return getTokenMetadataSync(chainId, address)
}

// Initialize cache from storage
loadCacheFromStorage()
