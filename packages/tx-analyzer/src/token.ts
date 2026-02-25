import { erc20Abi, erc20Abi_bytes32, hexToString, type Hex } from 'viem'
import { TokenMetadata } from 'ponder:schema'

export type TokenMeta = { symbol: string; name: string; decimals: number }

/**
 * In-process cache keyed by "${chainId}-${tokenAddress.toLowerCase()}".
 * Ponder event handlers run sequentially per chain so this is safe without locks.
 */
export const metadataCache = new Map<string, TokenMeta>()

// erc20Abi_bytes32 is viem's built-in fallback for pre-standard tokens (MKR, SAI, etc.)
// that return bytes32 instead of string for name() and symbol().

/**
 * Reads name() or symbol() from a token, retrying with a bytes32 ABI when the
 * standard string decode fails. Throws only if both attempts fail.
 */
async function readStringField(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any,
  tokenAddress: Hex,
  functionName: 'name' | 'symbol',
): Promise<string> {
  try {
    return (await context.client.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName,
    })) as string
  } catch {
    // Retry with bytes32 return type — MKR, SAI, and a few other pre-ERC-20
    // tokens use fixed bytes32 instead of a dynamic string.
    const raw = (await context.client.readContract({
      address: tokenAddress,
      abi: erc20Abi_bytes32,
      functionName,
    })) as `0x${string}`
    return hexToString(raw).replace(/\0+$/, '')
  }
}

/**
 * Returns cached ERC-20 metadata, fetching from chain and persisting to the
 * database on first encounter. Falls back to placeholder values when the
 * contract does not implement the standard metadata interface.
 */
export async function resolveTokenMetadata(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any,
  chainId: bigint,
  tokenAddress: Hex,
): Promise<TokenMeta> {
  const cacheKey = `${chainId}-${tokenAddress.toLowerCase()}`
  const cached = metadataCache.get(cacheKey)
  if (cached) return cached

  let meta: TokenMeta
  try {
    const [symbol, name, decimals] = await Promise.all([
      readStringField(context, tokenAddress, 'symbol'),
      readStringField(context, tokenAddress, 'name'),
      context.client.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'decimals',
      }) as Promise<number>,
    ])
    meta = { symbol, name, decimals }
  } catch {
    meta = { symbol: 'UNKNOWN', name: 'Unknown Token', decimals: 18 }
  }

  metadataCache.set(cacheKey, meta)

  await context.db
    .insert(TokenMetadata)
    .values({
      id: cacheKey,
      chainId,
      tokenAddress,
      symbol: meta.symbol,
      name: meta.name,
      decimals: meta.decimals,
    })
    .onConflictDoNothing()

  return meta
}
