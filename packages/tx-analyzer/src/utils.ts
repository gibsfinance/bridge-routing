import { fallback, http, webSocket } from 'viem'
import { rateLimit } from 'ponder'
import type { ChainId } from '@gibs/bridge-sdk/config'

/**
 * Collects all RPC URLs for a given chain ID from environment variables,
 * following the same convention as the bridge indexer:
 *   PONDER_RPC_URL_{chainId}
 *   PONDER_RPC_URL_{chainId}_0
 *   PONDER_RPC_URL_{chainId}_1
 *   ...
 */
export const gatherTransportList = (chainId: ChainId): string[] => {
  const list: string[] = []
  if (process.env[`PONDER_RPC_URL_${chainId}`]) {
    list.push(process.env[`PONDER_RPC_URL_${chainId}`]!)
  }
  let index = 0
  while (process.env[`PONDER_RPC_URL_${chainId}_${index}`]) {
    list.push(process.env[`PONDER_RPC_URL_${chainId}_${index}`]!)
    index++
  }
  // Bare PONDER_RPC_URL is a convenience fallback for single-chain setups
  // where the caller doesn't want to care about chain-specific scoping.
  if (!list.length && process.env.PONDER_RPC_URL) {
    list.push(process.env.PONDER_RPC_URL)
  }
  return list
}

/**
 * Builds a viem transport (with rate-limiting and fallback) for the given
 * chain ID using RPC URLs read from environment variables.
 */
export const toTransport = (chainId: ChainId) => {
  const list = gatherTransportList(chainId)
  const rateLimitSettings = { browser: false, requestsPerSecond: 1_000 }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const identity = (a: any) => a

  return fallback(
    list.map((url) => {
      const wrap =
        url.includes('publicnode') || url.includes('pulsechain')
          ? rateLimit
          : identity
      return wrap(
        url.startsWith('http')
          ? http(url, { timeout: 4_000, retryCount: 10, retryDelay: 200 })
          : webSocket(url, {
              reconnect: true,
              keepAlive: true,
              timeout: 4_000,
              retryCount: 10,
              retryDelay: 100,
            }),
        rateLimitSettings,
      )
    }),
  )
}

/**
 * Converts a Unix timestamp (seconds) to a UTC date string (YYYY-MM-DD).
 * Used by the report scripts to bucket transactions into daily groups.
 */
export const toUtcDate = (timestampSeconds: bigint | number): string => {
  const ms = Number(timestampSeconds) * 1_000
  return new Date(ms).toISOString().slice(0, 10)
}

/**
 * Formats a raw bigint token amount into a human-readable decimal string.
 *
 * @example formatTokenAmount(1_500_000n, 6) // "1.500000"
 */
export const formatTokenAmount = (raw: bigint, decimals: number): string => {
  const divisor = 10n ** BigInt(decimals)
  const whole = raw / divisor
  const remainder = raw % divisor
  const fracStr = remainder.toString().padStart(decimals, '0')
  return `${whole}.${fracStr}`
}

/**
 * Multiplies a raw token amount by a USD price string and returns the USD
 * value formatted to 6 decimal places.
 *
 * Uses floating-point arithmetic intentionally — USD values at 6dp precision
 * have no meaningful rounding risk for financial reporting purposes.
 */
export const toUsdValue = (
  rawAmount: bigint,
  decimals: number,
  priceUsd: string,
): string => {
  const human = Number(formatTokenAmount(rawAmount, decimals))
  const usd = human * Number(priceUsd)
  return usd.toFixed(6)
}
