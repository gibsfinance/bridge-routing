import { createConfig } from 'ponder'
import { erc20Abi, type Hex } from 'viem'
import { chains, startBlocks } from '@gibs/bridge-sdk/config'
import { toTransport } from './src/utils.js'

// ---------------------------------------------------------------------------
// Chain definitions
// ---------------------------------------------------------------------------

const CHAIN_DEFS = {
  pulsechain: {
    id: chains.pulsechain,
    rpc: toTransport(chains.pulsechain),
    pollingInterval: 5_000,
    maxRequestsPerSecond: 1_000,
  },
  pulsechainV4: {
    id: chains.pulsechainV4,
    rpc: toTransport(chains.pulsechainV4),
    pollingInterval: 5_000,
    maxRequestsPerSecond: 500,
  },
  ethereum: {
    id: chains.ethereum,
    rpc: toTransport(chains.ethereum),
    pollingInterval: 5_000,
    maxRequestsPerSecond: 1_000,
  },
  bsc: {
    id: chains.bsc,
    rpc: toTransport(chains.bsc),
    pollingInterval: 5_000,
    maxRequestsPerSecond: 1_000,
  },
  sepolia: {
    id: chains.sepolia,
    rpc: toTransport(chains.sepolia),
    pollingInterval: 5_000,
    maxRequestsPerSecond: 500,
  },
} as const satisfies Record<keyof typeof chains, unknown>

/** All chains this analyzer can index — narrows to exactly keyof chains. */
type ChainKey = keyof typeof CHAIN_DEFS

/** Maps numeric chain IDs to their chain key, derived from the chains constant. */
const CHAIN_ID_TO_KEY = Object.fromEntries(
  (Object.keys(CHAIN_DEFS) as ChainKey[]).map((key) => [String(chains[key]), key]),
) as Record<string, ChainKey>

// ---------------------------------------------------------------------------
// Indexer address discovery
// ---------------------------------------------------------------------------

const INDEXER_URL =
  process.env.INDEXER_URL ?? 'https://staging.indexer.gibs.finance/graphql'

type AddressItem = { address: string; chainId: string }

type AddressPage = {
  items: AddressItem[]
  pageInfo: { hasNextPage: boolean; endCursor?: string | null }
}

type IndexerResponse = {
  data?: Record<string, AddressPage>
  errors?: Array<{ message: string }>
}

/**
 * Paginates through a Ponder GraphQL collection that returns `{ address, chainId }`
 * items and groups them by ChainKey. Both validators and rewardAddresses share
 * this shape, so one helper covers both.
 */
async function fetchPagedAddresses(
  query: string,
  dataKey: string,
): Promise<Partial<Record<ChainKey, Hex[]>>> {
  const all: AddressItem[] = []
  let cursor: string | undefined

  do {
    const response = await fetch(INDEXER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { after: cursor ?? null } }),
    })

    if (!response.ok) {
      throw new Error(
        `[tx-analyzer] Indexer request failed: ${response.status} ${response.statusText}`,
      )
    }

    const body = (await response.json()) as IndexerResponse

    if (body.errors?.length) {
      throw new Error(
        `[tx-analyzer] Indexer GraphQL errors: ${body.errors.map((e) => e.message).join(', ')}`,
      )
    }

    const page = body.data?.[dataKey]
    if (!page) throw new Error(`[tx-analyzer] No "${dataKey}" data in indexer response`)

    all.push(...page.items)
    cursor = page.pageInfo.hasNextPage ? (page.pageInfo.endCursor ?? undefined) : undefined
  } while (cursor)

  const byChain: Partial<Record<ChainKey, Set<Hex>>> = {}
  for (const item of all) {
    const key = CHAIN_ID_TO_KEY[item.chainId]
    if (!key) continue
    if (!byChain[key]) byChain[key] = new Set()
    byChain[key]!.add(item.address.toLowerCase() as Hex)
  }

  return Object.fromEntries(
    Object.entries(byChain).map(([k, set]) => [k, [...set!]]),
  ) as Partial<Record<ChainKey, Hex[]>>
}

const VALIDATORS_QUERY = `
  query Validators($after: String) {
    validators(limit: 1000, after: $after) {
      items { address chainId }
      pageInfo { hasNextPage endCursor }
    }
  }
`

/** Only active reward addresses — removed ones are excluded via the where filter. */
const REWARD_ADDRESSES_QUERY = `
  query RewardAddresses($after: String) {
    rewardAddresses(where: { active: true }, limit: 1000, after: $after) {
      items { address chainId }
      pageInfo { hasNextPage endCursor }
    }
  }
`

/** Merges two byChain maps into a single deduplicated result. */
function mergeByChain(
  ...sources: Partial<Record<ChainKey, Hex[]>>[]
): Partial<Record<ChainKey, Hex[]>> {
  const merged: Partial<Record<ChainKey, Set<Hex>>> = {}
  for (const source of sources) {
    for (const [key, addrs] of Object.entries(source) as [ChainKey, Hex[]][]) {
      if (!merged[key]) merged[key] = new Set()
      for (const addr of addrs) merged[key]!.add(addr)
    }
  }
  return Object.fromEntries(
    Object.entries(merged).map(([k, set]) => [k, [...set!]]),
  ) as Partial<Record<ChainKey, Hex[]>>
}

/**
 * Loads all addresses to track — validators and active reward addresses.
 *
 * Priority:
 *   1. TRACKED_ADDRESSES + TRACKED_CHAIN_ID env vars — both must be set together.
 *      Only the specified chain is enabled; indexer lookup is skipped entirely.
 *   2. Live query to the Gibs Finance indexer (INDEXER_URL).
 *      Validators and active reward addresses are fetched in parallel and merged
 *      per chain. Only chains with at least one address are enabled.
 */
async function loadAddresses(): Promise<Partial<Record<ChainKey, Hex[]>>> {
  const trackedAddresses = process.env.TRACKED_ADDRESSES
    ?.split(',')
    .map((a) => a.trim())
    .filter(Boolean) as Hex[] | undefined
  const trackedChainId = process.env.TRACKED_CHAIN_ID?.trim()

  if (trackedAddresses?.length && trackedChainId) {
    const key = CHAIN_ID_TO_KEY[trackedChainId]
    if (!key) {
      throw new Error(
        `[tx-analyzer] TRACKED_CHAIN_ID "${trackedChainId}" is not supported. ` +
          `Valid chain IDs: ${Object.keys(CHAIN_ID_TO_KEY).join(', ')}`,
      )
    }
    console.log(
      `[tx-analyzer] Using ${trackedAddresses.length} address(es) from TRACKED_ADDRESSES on chain ${trackedChainId} (${key})`,
    )
    return { [key]: trackedAddresses }
  }

  if (trackedAddresses?.length || trackedChainId) {
    throw new Error(
      '[tx-analyzer] TRACKED_ADDRESSES and TRACKED_CHAIN_ID must both be set, or neither.',
    )
  }

  console.log(`[tx-analyzer] Fetching tracked addresses from ${INDEXER_URL}`)

  const [validators, rewardAddrs] = await Promise.all([
    fetchPagedAddresses(VALIDATORS_QUERY, 'validators'),
    fetchPagedAddresses(REWARD_ADDRESSES_QUERY, 'rewardAddresses'),
  ])

  const addresses = mergeByChain(validators, rewardAddrs)

  const vTotal = Object.values(validators).reduce((n, a) => n + (a?.length ?? 0), 0)
  const rTotal = Object.values(rewardAddrs).reduce((n, a) => n + (a?.length ?? 0), 0)
  const totals = Object.entries(addresses)
    .map(([k, v]) => `${k}: ${v?.length ?? 0}`)
    .join(', ')
  console.log(
    `[tx-analyzer] Discovered ${vTotal} validators + ${rTotal} reward addresses — ${totals}`,
  )

  return addresses
}

// ---------------------------------------------------------------------------
// Build config (top-level await — valid in ESM)
// ---------------------------------------------------------------------------

const addressesByChain = await loadAddresses()

const enabledKeys = (Object.keys(CHAIN_DEFS) as ChainKey[]).filter(
  (key) => (addressesByChain[key]?.length ?? 0) > 0,
)

if (!enabledKeys.length) {
  throw new Error(
    '[tx-analyzer] No tracked addresses found (validators or reward addresses). ' +
      'Set TRACKED_ADDRESSES + TRACKED_CHAIN_ID or ensure INDEXER_URL is reachable.',
  )
}

const allAddresses = [
  ...new Set(enabledKeys.flatMap((key) => addressesByChain[key]!)),
] as Hex[]

export default createConfig({
  database: {
    kind: 'postgres',
    connectionString: process.env.DATABASE_URL,
  },

  // omnichain ordering ensures cross-chain events are globally sortable by
  // timestamp — important when aggregating costs across chains per day.
  ordering: 'omnichain',

  // All chain configs are defined upfront so the type is fully known to Ponder.
  // Only chains with entries in contracts/accounts are actually synced at runtime.
  chains: CHAIN_DEFS,

  contracts: {
    /**
     * Catches ERC-20 Transfer events where a tracked address is the recipient.
     * No contract address is specified so this matches every token on-chain.
     * The indexed `to` filter means only logs relevant to our addresses are
     * fetched — the RPC node applies the topic filter, not us.
     */
    Erc20TransferTo: {
      abi: erc20Abi,
      chain: Object.fromEntries(
        enabledKeys.map((key) => [
          key,
          {
            startBlock: startBlocks[key],
            filter: {
              event: 'Transfer',
              args: { to: addressesByChain[key]! },
            },
          },
        ]),
      ),
    },

    /**
     * Catches ERC-20 Transfer events where a tracked address is the sender.
     */
    Erc20TransferFrom: {
      abi: erc20Abi,
      chain: Object.fromEntries(
        enabledKeys.map((key) => [
          key,
          {
            startBlock: startBlocks[key],
            filter: {
              event: 'Transfer',
              args: { from: addressesByChain[key]! },
            },
          },
        ]),
      ),
    },
  },

  accounts: {
    /**
     * WalletTracker fires two event types per transaction:
     *   - WalletTracker:transaction:from  → the tracked address sent this tx
     *   - WalletTracker:transaction:to    → the tracked address received this tx
     *
     * includeTransactionReceipts gives us gasUsed, effectiveGasPrice, status,
     * and the full logs array (for decoding ERC-20 Transfer events).
     */
    WalletTracker: {
      address: allAddresses,
      includeTransactionReceipts: true,
      chain: Object.fromEntries(
        enabledKeys.map((key) => [
          key,
          {
            address: addressesByChain[key]!,
            startBlock: startBlocks[key],
          },
        ]),
      ),
    },
  },
})
