import { clientFromChain } from './input.svelte'
import type { Hex, Chain } from 'viem'
import { zeroAddress, erc20Abi, erc20Abi_bytes32, hexToString } from 'viem'
import * as networks from 'viem/chains'
import { nativeTokenName, nativeTokenSymbol, toChain } from '@gibs/bridge-sdk/config'
import _ from 'lodash'
import type { TokenMetadata } from '@gibs/bridge-sdk/types'

export type ChainScopedAddress = `${number}:${Hex}`

const bytes32Whitelist = new Set<ChainScopedAddress>()

// In-memory store for token metadata (loaded once, no persistence)
const tokenMetadataStore = new Map<ChainScopedAddress, TokenMetadata>()

// Generate store key
export function getStoreKey(chainId: number, tokenAddress: string): ChainScopedAddress {
  return `${chainId}:${tokenAddress.toLowerCase()}` as ChainScopedAddress
}

// Parse a ChainScopedAddress into its components
export function parseChainScopedAddress(key: ChainScopedAddress): { chainId: number; address: Hex } {
  const [chainIdStr, address] = key.split(':')
  const chainId = parseInt(chainIdStr, 10)

  if (isNaN(chainId)) {
    throw new Error(`Invalid chain ID in ChainScopedAddress: ${chainIdStr}`)
  }

  if (!address || !address.startsWith('0x')) {
    throw new Error(`Invalid address in ChainScopedAddress: ${address}`)
  }

  return {
    chainId,
    address: address as Hex
  }
}

// Parse a string key (chainId:address format) into its components with proper types
export function parseTokenKey(key: string): { chainId: number; address: Hex } {
  const [chainIdStr, address] = key.split(':')
  const chainId = parseInt(chainIdStr, 10)

  if (isNaN(chainId)) {
    throw new Error(`Invalid chain ID in token key: ${chainIdStr}`)
  }

  if (!address) {
    throw new Error(`Invalid address in token key: ${address}`)
  }

  // Ensure address is properly formatted as Hex
  const hexAddress = address.startsWith('0x') ? address : `0x${address}`

  return {
    chainId,
    address: hexAddress as Hex
  }
}

// Get native token metadata
function getNativeTokenMetadata(chainId: number): TokenMetadata {
  const chain = Object.values(networks).find((c: Chain) => c.id === chainId)

  // Safely get native token info from SDK
  let name: string = chain?.nativeCurrency?.name || 'Ether'
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
  tokenAddresses: Hex[]
): Promise<Map<Hex, TokenMetadata | null>> {
  const results = new Map<Hex, TokenMetadata | null>()

  if (tokenAddresses.length === 0) return results

  // Get the chain and client
  const chain = Object.values(networks).find((c: Chain) => c.id === chainId)
  if (!chain) {
    throw new Error(`Chain not found for chainId: ${chainId}`)
  }

  const client = clientFromChain(chainId)

  // Separate native tokens from ERC20 tokens
  const nativeTokens: Hex[] = []
  const erc20Tokens: Hex[] = []

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
    results.set(address.toLowerCase() as Hex, nativeMetadata)
  })

  // Handle ERC20 tokens with batch multicall
  if (erc20Tokens.length === 0) {
    // console.log(`No ERC20 tokens to process for chain ${chainId}`)
    return results
  }
  // console.log(`Processing ${erc20Tokens.length} ERC20 tokens for chain ${chainId}:`, erc20Tokens)
  const addressChunks = _.chunk(erc20Tokens, 100)

  const methods = ['symbol', 'name', 'decimals'] as const
  const addressChunksToCallChunks = (addressChunks: Hex[][], abi: (t: Hex) => typeof erc20Abi | typeof erc20Abi_bytes32) => (
    addressChunks.map((chunk) => (
      chunk.map((address) => methods.map((functionName) => ({
        functionName,
        address,
        abi: abi(address),
        allowFailure: true,
        args: [],
      })))
    ))
  )
  // Try with standard ERC20 ABI first
  const chunkedCalls = addressChunksToCallChunks(addressChunks, (address) =>
    bytes32Whitelist.has(getStoreKey(chainId, address)) ? erc20Abi_bytes32 : erc20Abi
  )
  const fallback: Hex[] = []
  for (const chunk of chunkedCalls) {
    // console.log(`Executing multicall for chain ${chainId} with ${_.flatten(chunk).length} contracts`)
    try {
      const batchResults = await client.multicall({
        allowFailure: true,
        contracts: _.flatten(chunk),
      })
      // console.log(`Multicall results for chain ${chainId}:`, batchResults.length, 'results')

      _.chunk(batchResults, 3).forEach((batch, index) => {
        const tokenAddress = erc20Tokens[index] as Hex
        const symbol = batch[0].result as string
        const name = batch[1].result as string
        const decimals = Number(batch[2].result)

        // console.log(`Token ${tokenAddress} results:`, { symbol, name, decimals, errors: [batch[0].error, batch[1].error, batch[2].error] })

        if (name && symbol && !isNaN(decimals)) {
          results.set(tokenAddress.toLowerCase() as Hex, { name, symbol, decimals })
        } else {
          console.log(`Adding ${tokenAddress} to fallback due to missing data`)
          fallback.push(tokenAddress)
        }
      })
    } catch (error) {
      console.error(`Multicall failed for chain ${chainId}:`, error)
      // Add all tokens to fallback if multicall fails completely
      fallback.push(...erc20Tokens)
    }
  }
  if (fallback.length === 0) {
    return results
  }

  console.log(`Processing ${fallback.length} tokens in fallback with bytes32 ABI for chain ${chainId}:`, fallback)
  const fallbackAddressChunks = _.chunk(fallback, 100)
  const fallbackChunkedCalls = addressChunksToCallChunks(fallbackAddressChunks, () => erc20Abi_bytes32)
  for (const chunk of fallbackChunkedCalls) {
    try {
      console.log(`Executing fallback multicall for chain ${chainId} with ${_.flatten(chunk).length} contracts`)
      const batchResults = await client.multicall({
        allowFailure: false,
        contracts: _.flatten(chunk),
      })
      console.log(`Fallback multicall results for chain ${chainId}:`, batchResults.length, 'results')

      _.chunk(batchResults, 3).forEach((batch, index) => {
        const tokenAddress = fallback[index] as Hex
        const symbol = batch[0] as Hex
        const name = batch[1] as Hex
        const decimals = Number(batch[2])
        const symbolString = hexToString(symbol)
        const nameString = hexToString(name)

        console.log(`Fallback token ${tokenAddress} results:`, { symbolString, nameString, decimals })

        results.set(tokenAddress.toLowerCase() as Hex, {
          name: nameString,
          symbol: symbolString,
          decimals,
        })

        // Add to bytes32 whitelist for future optimization
        bytes32Whitelist.add(getStoreKey(chainId, tokenAddress))
      })
    } catch (error) {
      console.error(`Fallback multicall failed for chain ${chainId}:`, error)
    }
  }
  return results
}


// Get token metadata synchronously (from store only)
export function getTokenMetadata(chainId: number, tokenAddress: string): TokenMetadata | null {
  const storeKey = getStoreKey(chainId, tokenAddress)
  return tokenMetadataStore.get(storeKey) || null
}

// Load token metadata for multiple tokens (called once on page load)
export async function loadTokenMetadata(tokens: Array<{ chainId: number; address: Hex }>): Promise<void> {
  // Group tokens by chain ID for batching
  const tokensByChain = new Map<number, Hex[]>()
  tokens.forEach(({ chainId, address }) => {
    if (!tokensByChain.has(chainId)) {
      tokensByChain.set(chainId, [])
    }
    tokensByChain.get(chainId)!.push(address)
  })

  // Batch fetch for each chain
  const batchPromises = Array.from(tokensByChain.entries()).map(async ([chainId, addresses]) => {
    try {
      // console.log(`Loading token metadata for chain ${chainId} (${addresses.length} tokens):`, addresses)
      const results = await batchFetchTokenMetadata(chainId, addresses)
      // console.log(`Loaded ${results.size} token metadata results for chain ${chainId}:`, Array.from(results.entries()))

      // Store the results
      results.forEach((metadata, address) => {
        if (metadata) {
          const storeKey = getStoreKey(chainId, address)
          tokenMetadataStore.set(storeKey, metadata)
          // console.log(`Stored metadata for ${storeKey}:`, metadata)
        } else {
          console.warn(`No metadata found for ${chainId}:${address}`)
        }
      })
    } catch (error) {
      console.error(`Failed to load tokens for chain ${chainId}:`, error)
    }
  })

  await Promise.allSettled(batchPromises)
}

// Get store size
export function getStoreSize(): number {
  return tokenMetadataStore.size
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

export function getBridgeTokenMetadata(bridge: any): TokenMetadata | null {
  const address = getTokenAddressFromBridge(bridge)
  const chainId = getTokenChainIdFromBridge(bridge)

  if (!address) return null

  return getTokenMetadata(chainId, address)
}


