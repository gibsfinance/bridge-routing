/**
 * PulseX price fetching utilities.
 *
 * Standalone module — no Ponder dependency. Uses the PulseX V2 subgraph for
 * historical daily token prices and the PulseX routing API for spot prices
 * when the subgraph has no data (e.g. newly listed tokens).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TokenDayPrice = {
  /** Token contract address (lowercase) */
  tokenAddress: string
  /** Token symbol */
  symbol: string
  /** UTC date string: YYYY-MM-DD */
  date: string
  /** USD price for 1 whole token on this day */
  priceUsd: string
}

/** map[tokenAddress][date] = priceUsd */
export type PriceMap = Map<string, Map<string, string>>

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * PulseX V2 subgraph on the PulseChain graph node.
 * Override via PULSEX_SUBGRAPH_URL env var if you run a private graph node.
 */
const DEFAULT_SUBGRAPH_URL =
  process.env.PULSEX_SUBGRAPH_URL ??
  'https://graph.pulsechain.com/subgraphs/name/pulsex/exchange-v2'

/**
 * PulseX routing API — used for spot price fallback.
 */
const ROUTING_URL =
  'https://routing-v3.a4056c9392ff6eb5fa7904d106b55a.workers.dev/quote'

/**
 * WPLS contract address on PulseChain.
 * Used as the intermediary when pricing non-PLS/non-stablecoin tokens.
 */
export const WPLS_ADDRESS = '0xa1077a294dde1b09bb078844df40758a5d0f9a27'

/**
 * DAI bridged from Ethereum on PulseChain — the primary USD reference.
 */
export const DAI_ADDRESS = '0xefd766ccb38eaf1dfd701853bfce31359239f305'

// ---------------------------------------------------------------------------
// Subgraph price fetching
// ---------------------------------------------------------------------------

type SubgraphTokenDayData = {
  date: number // Unix timestamp of midnight UTC for this day
  priceUSD: string
  token: {
    id: string
    symbol: string
    decimals: string
  }
}

type SubgraphResponse = {
  data?: {
    tokenDayDatas?: SubgraphTokenDayData[]
  }
  errors?: Array<{ message: string }>
}

/**
 * Fetches historical daily USD prices for a list of token addresses from the
 * PulseX V2 subgraph.
 *
 * @param tokenAddresses - Lowercase ERC-20 contract addresses to price
 * @param fromTimestamp  - Start of range as Unix seconds (inclusive)
 * @param toTimestamp    - End of range as Unix seconds (inclusive)
 * @param subgraphUrl    - Override the default subgraph URL
 * @returns PriceMap keyed by lowercase token address then YYYY-MM-DD date
 */
export async function fetchSubgraphPrices({
  tokenAddresses,
  fromTimestamp,
  toTimestamp,
  subgraphUrl = DEFAULT_SUBGRAPH_URL,
}: {
  tokenAddresses: string[]
  fromTimestamp: number
  toTimestamp: number
  subgraphUrl?: string
}): Promise<PriceMap> {
  const priceMap: PriceMap = new Map()

  if (!tokenAddresses.length) return priceMap

  // Subgraph stores date as Unix midnight seconds — align to day boundaries.
  const dayStart = Math.floor(fromTimestamp / 86_400) * 86_400
  const dayEnd = Math.floor(toTimestamp / 86_400) * 86_400

  // Subgraph pagination: fetch in 1 000-record pages to avoid truncation.
  const PAGE_SIZE = 1_000
  let skip = 0
  let hasMore = true

  while (hasMore) {
    const query = `
      query TokenDayDatas(
        $tokens: [String!]!
        $dateGte: Int!
        $dateLte: Int!
        $first: Int!
        $skip: Int!
      ) {
        tokenDayDatas(
          where: {
            token_in: $tokens
            date_gte: $dateGte
            date_lte: $dateLte
          }
          orderBy: date
          orderDirection: asc
          first: $first
          skip: $skip
        ) {
          date
          priceUSD
          token {
            id
            symbol
            decimals
          }
        }
      }
    `

    const response = await fetch(subgraphUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        variables: {
          tokens: tokenAddresses.map((a) => a.toLowerCase()),
          dateGte: dayStart,
          dateLte: dayEnd,
          first: PAGE_SIZE,
          skip,
        },
      }),
    })

    if (!response.ok) {
      console.warn(
        `[prices] Subgraph request failed: ${response.status} ${response.statusText}`,
      )
      break
    }

    const body = (await response.json()) as SubgraphResponse

    if (body.errors?.length) {
      console.warn('[prices] Subgraph errors:', body.errors.map((e) => e.message).join(', '))
      break
    }

    const records = body.data?.tokenDayDatas ?? []

    for (const record of records) {
      const addr = record.token.id.toLowerCase()
      const date = new Date(record.date * 1_000).toISOString().slice(0, 10)

      if (!priceMap.has(addr)) priceMap.set(addr, new Map())
      priceMap.get(addr)!.set(date, record.priceUSD)
    }

    hasMore = records.length === PAGE_SIZE
    skip += PAGE_SIZE
  }

  return priceMap
}

// ---------------------------------------------------------------------------
// Spot price fallback via PulseX routing API
// ---------------------------------------------------------------------------

type PulsexQuoteBody = {
  poolTypes: number[]
  chainId: number
  amount: { currency: { address: string; decimals: number; symbol: string }; value: string }
  tradeType: 0 | 1
  currency: { address: string; decimals: number; symbol: string }
}

/**
 * Fetches the current spot price of a token in USD using the PulseX routing
 * API. This is a fallback for tokens not yet in the subgraph's day data.
 *
 * @param tokenAddress - ERC-20 contract address on PulseChain
 * @param tokenDecimals - Token decimal places
 * @param tokenSymbol   - Token symbol (for display / routing hint)
 * @returns USD price as a string, or null if the price cannot be determined
 */
export async function fetchSpotPrice({
  tokenAddress,
  tokenDecimals,
  tokenSymbol,
}: {
  tokenAddress: string
  tokenDecimals: number
  tokenSymbol: string
}): Promise<string | null> {
  // Quote: sell 1 whole token for DAI to get a USD price.
  const amountIn = (10n ** BigInt(tokenDecimals)).toString()

  const body: PulsexQuoteBody = {
    poolTypes: [0, 1, 2],
    chainId: 369,
    tradeType: 0,
    amount: {
      currency: {
        address: tokenAddress.toLowerCase(),
        decimals: tokenDecimals,
        symbol: tokenSymbol,
      },
      value: amountIn,
    },
    currency: {
      address: DAI_ADDRESS,
      decimals: 18,
      symbol: 'DAI',
    },
  }

  try {
    const response = await fetch(ROUTING_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!response.ok) return null

    // The routing API returns a serialised trade; the output amount in DAI
    // is approximately equal to the USD value of 1 whole input token.
    const trade = (await response.json()) as { outputAmount?: string }
    if (!trade.outputAmount) return null

    // outputAmount is in DAI's smallest unit (18 decimals).
    const daiAmount = BigInt(trade.outputAmount)
    const priceUsd = Number(daiAmount) / 1e18
    return priceUsd.toFixed(8)
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Convenience: resolve the best available price for a given token on a day
// ---------------------------------------------------------------------------

/**
 * Returns the best available USD price for a token on a given day.
 * Tries the pre-fetched subgraph price map first; falls back to the routing
 * API for the current spot price when no historical data is available.
 */
export async function resolvePrice({
  tokenAddress,
  date,
  priceMap,
  tokenDecimals,
  tokenSymbol,
}: {
  tokenAddress: string
  date: string
  priceMap: PriceMap
  tokenDecimals: number
  tokenSymbol: string
}): Promise<string> {
  const addr = tokenAddress.toLowerCase()
  const cached = priceMap.get(addr)?.get(date)
  if (cached) return cached

  // Try spot price as fallback.
  const spot = await fetchSpotPrice({ tokenAddress: addr, tokenDecimals, tokenSymbol })
  return spot ?? '0'
}
