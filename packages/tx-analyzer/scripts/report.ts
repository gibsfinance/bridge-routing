#!/usr/bin/env tsx
/**
 * Standalone CSV report generator.
 *
 * Reads indexed transaction data directly from the Ponder PostgreSQL database,
 * fetches historical token prices from the PulseX subgraph, then writes a
 * per-address CSV report showing daily P&L.
 *
 * Usage:
 *   DATABASE_URL=postgres://... yarn report [--from YYYY-MM-DD] [--to YYYY-MM-DD] [--output report.csv]
 *   # or via package script:
 *   yarn workspace @gibs/tx-analyzer report
 *
 * Environment variables:
 *   DATABASE_URL          Required. PostgreSQL connection string.
 *   DATABASE_SCHEMA       Optional. Postgres schema where Ponder tables live (default: public).
 *   PULSEX_SUBGRAPH_URL   Optional. Override PulseX subgraph endpoint.
 *
 * This script has NO dependency on the Ponder runtime — it connects directly
 * to PostgreSQL and reads from the tables Ponder has already populated.
 */

import { createWriteStream } from 'fs'
import { drizzle } from 'drizzle-orm/node-postgres'
import { type InferSelectModel, and, gte, lte, inArray, asc, sql } from 'drizzle-orm'
import { TrackedTransaction, Erc20Transfer, NativeTransfer, TokenMetadata } from '../ponder.schema.js'
import { fetchSubgraphPrices, resolvePrice, WPLS_ADDRESS } from './prices.js'
import { toUtcDate, formatTokenAmount, toUsdValue } from '../src/utils.js'

// ---------------------------------------------------------------------------
// Row types — derived directly from the ponder schema table definitions
// ---------------------------------------------------------------------------

type TxRow = InferSelectModel<typeof TrackedTransaction>
type NativeTransferRow = InferSelectModel<typeof NativeTransfer>
type TransferRow = InferSelectModel<typeof Erc20Transfer>
type TokenMetaRow = InferSelectModel<typeof TokenMetadata>

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

function parseArgs(): { fromDate: string | null; toDate: string | null; output: string } {
  const args = process.argv.slice(2)
  let fromDate: string | null = null
  let toDate: string | null = null
  let output = 'report.csv'

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--from' && args[i + 1]) { fromDate = args[++i]!; continue }
    if (arg === '--to' && args[i + 1]) { toDate = args[++i]!; continue }
    if (arg === '--output' && args[i + 1]) { output = args[++i]!; continue }
  }

  return { fromDate, toDate, output }
}

// ---------------------------------------------------------------------------
// Native token symbol lookup
// ---------------------------------------------------------------------------

const NATIVE_SYMBOL: Record<string, string> = {
  '369': 'PLS',
  '943': 'PLS',
}

const NATIVE_DECIMALS = 18

// ---------------------------------------------------------------------------
// CSV helpers
// ---------------------------------------------------------------------------

/** Wraps a value in quotes and escapes any embedded quotes. */
const csvField = (value: string | number | bigint | null | undefined): string => {
  const str = value == null ? '' : String(value)
  return str.includes(',') || str.includes('"') || str.includes('\n')
    ? `"${str.replace(/"/g, '""')}"`
    : str
}

const csvRow = (fields: Array<string | number | bigint | null | undefined>): string =>
  fields.map(csvField).join(',')

// ---------------------------------------------------------------------------
// Aggregation types
// ---------------------------------------------------------------------------

type DaySummary = {
  date: string
  address: string
  chainId: string
  txCount: number
  successCount: number
  failedCount: number
  totalGasWei: bigint
  totalGasUsd: string
  /** net native = received − sent − gas (wei) */
  nativeNetWei: bigint
  nativeNetUsd: string
  /** token address → { symbol, decimals, netAmount (signed bigint) } */
  tokenDeltas: Map<string, { symbol: string; decimals: number; net: bigint }>
  /** Computed USD values for each token delta */
  tokenUsd: Map<string, string>
  netPnlUsd: string
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const { fromDate, toDate, output } = parseArgs()

  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    console.error('DATABASE_URL environment variable is required.')
    process.exit(1)
  }

  const schema = process.env.DATABASE_SCHEMA ?? 'public'
  // Using the object form keeps $client typed as Pool (the default TClient),
  // avoiding the `TClient | string` ambiguity from the positional overload.
  const db = drizzle({ connection: dbUrl })

  try {
    // Set the search path so unqualified table names resolve to the correct schema.
    await db.execute(sql`SET search_path TO ${sql.identifier(schema)}`)

    console.log('[report] Querying database...')

    // Build date-range filter for block_timestamp
    const fromTs = fromDate ? BigInt(Math.floor(new Date(fromDate).getTime() / 1_000)) : 0n
    const toTs = toDate
      ? BigInt(Math.floor(new Date(toDate).getTime() / 1_000) + 86_399)
      : BigInt(Math.floor(Date.now() / 1_000))

    // ------------------------------------------------------------------
    // 1. Fetch all tracked transactions in range
    // ------------------------------------------------------------------
    const txRows: TxRow[] = await db
      .select()
      .from(TrackedTransaction)
      .where(
        and(
          gte(TrackedTransaction.blockTimestamp, fromTs),
          lte(TrackedTransaction.blockTimestamp, toTs),
        ),
      )
      .orderBy(asc(TrackedTransaction.blockTimestamp))

    if (!txRows.length) {
      console.log('[report] No transactions found for the given date range.')
      await (db.$client as unknown as { end(): Promise<void> }).end()
      return
    }

    console.log(`[report] Found ${txRows.length} transaction rows.`)

    const trackedAddresses = [...new Set(txRows.map((r) => r.trackedAddress))]

    // ------------------------------------------------------------------
    // 2. Fetch internal native transfers for all tracked addresses
    // ------------------------------------------------------------------
    const nativeTransferRows: NativeTransferRow[] =
      trackedAddresses.length > 0
        ? await db
            .select()
            .from(NativeTransfer)
            .where(
              and(
                inArray(NativeTransfer.trackedAddress, trackedAddresses),
                gte(NativeTransfer.blockTimestamp, fromTs),
                lte(NativeTransfer.blockTimestamp, toTs),
              ),
            )
            .orderBy(asc(NativeTransfer.blockTimestamp))
        : []

    // ------------------------------------------------------------------
    // 3. Fetch ERC-20 transfers for all tracked addresses
    // ------------------------------------------------------------------
    const transferRows: TransferRow[] =
      trackedAddresses.length > 0
        ? await db
            .select()
            .from(Erc20Transfer)
            .where(
              and(
                inArray(Erc20Transfer.trackedAddress, trackedAddresses),
                gte(Erc20Transfer.blockTimestamp, fromTs),
                lte(Erc20Transfer.blockTimestamp, toTs),
              ),
            )
            .orderBy(asc(Erc20Transfer.blockTimestamp), asc(Erc20Transfer.logIndex))
        : []

    // ------------------------------------------------------------------
    // 4. Fetch token metadata for price resolution
    // ------------------------------------------------------------------
    const tokenAddresses = [...new Set(transferRows.map((r) => r.tokenAddress))]
    const tokenMetaRows: TokenMetaRow[] =
      tokenAddresses.length > 0
        ? await db
            .select()
            .from(TokenMetadata)
            .where(inArray(TokenMetadata.tokenAddress, tokenAddresses))
        : []

    const tokenMeta = new Map(tokenMetaRows.map((r) => [r.tokenAddress.toLowerCase(), r]))

    // ------------------------------------------------------------------
    // 5. Fetch PulseX subgraph prices for the full date range
    // ------------------------------------------------------------------
    console.log('[report] Fetching PulseX subgraph prices...')

    // Include WPLS so we can price the native PLS gas costs
    const allTokensForPricing = [
      ...new Set([WPLS_ADDRESS, ...tokenAddresses.map((a) => a.toLowerCase())]),
    ]

    const priceMap = await fetchSubgraphPrices({
      tokenAddresses: allTokensForPricing,
      fromTimestamp: Number(fromTs),
      toTimestamp: Number(toTs),
    })

    console.log(`[report] Price data loaded for ${priceMap.size} token(s).`)

    // ------------------------------------------------------------------
    // 6. Aggregate by (address, chain, date)
    // ------------------------------------------------------------------
    // key = "${trackedAddress}-${chainId}-${date}"
    const summaryMap = new Map<string, DaySummary>()

    const getOrCreate = (addr: string, chainId: string, date: string): DaySummary => {
      const key = `${addr}-${chainId}-${date}`
      if (!summaryMap.has(key)) {
        summaryMap.set(key, {
          date,
          address: addr,
          chainId,
          txCount: 0,
          successCount: 0,
          failedCount: 0,
          totalGasWei: 0n,
          totalGasUsd: '0',
          nativeNetWei: 0n,
          nativeNetUsd: '0',
          tokenDeltas: new Map(),
          tokenUsd: new Map(),
          netPnlUsd: '0',
        })
      }
      return summaryMap.get(key)!
    }

    // Gas costs and top-level native value from tracked transactions
    for (const tx of txRows) {
      const date = toUtcDate(tx.blockTimestamp)
      const addr = tx.trackedAddress.toLowerCase()
      const chainId = String(tx.chainId)
      const summary = getOrCreate(addr, chainId, date)

      summary.txCount++
      if (tx.status === 'success') summary.successCount++
      else summary.failedCount++

      if (tx.from.toLowerCase() === addr) {
        summary.totalGasWei += tx.gasCostWei
        summary.nativeNetWei -= tx.nativeValueWei
        summary.nativeNetWei -= tx.gasCostWei
      }
      if (tx.to?.toLowerCase() === addr) {
        summary.nativeNetWei += tx.nativeValueWei
      }
    }

    // Internal native value flows (EVM sub-call traces)
    for (const nt of nativeTransferRows) {
      const date = toUtcDate(nt.blockTimestamp)
      const addr = nt.trackedAddress.toLowerCase()
      const chainId = String(nt.chainId)
      const summary = getOrCreate(addr, chainId, date)

      if (nt.to.toLowerCase() === addr) summary.nativeNetWei += nt.value
      if (nt.from.toLowerCase() === addr) summary.nativeNetWei -= nt.value
    }

    // ERC-20 token balance changes
    for (const t of transferRows) {
      const date = toUtcDate(t.blockTimestamp)
      const addr = t.trackedAddress.toLowerCase()
      const chainId = String(t.chainId)
      const summary = getOrCreate(addr, chainId, date)

      const ta = t.tokenAddress.toLowerCase()
      if (!summary.tokenDeltas.has(ta)) {
        summary.tokenDeltas.set(ta, {
          symbol: t.tokenSymbol,
          decimals: t.tokenDecimals,
          net: 0n,
        })
      }
      const delta = summary.tokenDeltas.get(ta)!
      if (t.to.toLowerCase() === addr) delta.net += t.amount
      if (t.from.toLowerCase() === addr) delta.net -= t.amount
    }

    // ------------------------------------------------------------------
    // 7. Apply USD prices
    // ------------------------------------------------------------------
    const nativeSymbolForChain = (chainId: string) =>
      NATIVE_SYMBOL[chainId] ?? 'NATIVE'

    for (const summary of summaryMap.values()) {
      const { date, chainId } = summary

      // Gas cost in USD (use WPLS price as PLS proxy)
      const plsPriceUsd = await resolvePrice({
        tokenAddress: WPLS_ADDRESS,
        date,
        priceMap,
        tokenDecimals: NATIVE_DECIMALS,
        tokenSymbol: 'WPLS',
      })
      summary.totalGasUsd = toUsdValue(summary.totalGasWei, NATIVE_DECIMALS, plsPriceUsd)

      // Native net in USD
      const absNative =
        summary.nativeNetWei < 0n ? -summary.nativeNetWei : summary.nativeNetWei
      const nativeUsdStr = toUsdValue(absNative, NATIVE_DECIMALS, plsPriceUsd)
      summary.nativeNetUsd =
        summary.nativeNetWei < 0n ? `-${nativeUsdStr}` : nativeUsdStr

      // ERC-20 token deltas in USD
      let tokenPnl = 0
      for (const [ta, delta] of summary.tokenDeltas) {
        const meta = tokenMeta.get(ta)
        const dec = meta?.decimals ?? delta.decimals
        const sym = meta?.symbol ?? delta.symbol

        const priceUsd = await resolvePrice({
          tokenAddress: ta,
          date,
          priceMap,
          tokenDecimals: dec,
          tokenSymbol: sym,
        })

        const absAmount = delta.net < 0n ? -delta.net : delta.net
        const usdStr = toUsdValue(absAmount, dec, priceUsd)
        const usdValue = parseFloat(usdStr) * (delta.net < 0n ? -1 : 1)
        summary.tokenUsd.set(ta, usdValue.toFixed(6))
        tokenPnl += usdValue
      }

      const nativePnl = parseFloat(summary.nativeNetUsd)
      summary.netPnlUsd = (nativePnl + tokenPnl).toFixed(6)
    }

    // ------------------------------------------------------------------
    // 8. Collect all unique token addresses across all summaries for headers
    // ------------------------------------------------------------------
    const allTokenAddresses = [
      ...new Set(
        [...summaryMap.values()].flatMap((s) => [...s.tokenDeltas.keys()]),
      ),
    ].sort()

    // Build human-readable column headers for each token
    const tokenHeaders = allTokenAddresses.flatMap((ta) => {
      const meta = tokenMeta.get(ta)
      const sym = meta?.symbol ?? ta.slice(0, 8)
      return [`${sym}_amount`, `${sym}_usd`]
    })

    // ------------------------------------------------------------------
    // 9. Write CSV
    // ------------------------------------------------------------------
    const stream = createWriteStream(output)

    // Header row
    const header = csvRow([
      'date',
      'address',
      'chain_id',
      'native_symbol',
      'tx_count',
      'success',
      'failed',
      'gas_cost_native',
      'gas_cost_usd',
      'native_net',
      'native_net_usd',
      ...tokenHeaders,
      'net_pnl_usd',
    ])
    stream.write(header + '\n')

    // Sort summaries by address, then chain, then date
    const sorted = [...summaryMap.values()].sort((a, b) => {
      const addrCmp = a.address.localeCompare(b.address)
      if (addrCmp !== 0) return addrCmp
      const chainCmp = a.chainId.localeCompare(b.chainId)
      if (chainCmp !== 0) return chainCmp
      return a.date.localeCompare(b.date)
    })

    let rowCount = 0
    for (const s of sorted) {
      const tokenCols = allTokenAddresses.flatMap((ta) => {
        const delta = s.tokenDeltas.get(ta)
        const usd = s.tokenUsd.get(ta)
        if (!delta) return ['0', '0']
        const meta = tokenMeta.get(ta)
        const dec = meta?.decimals ?? delta.decimals
        const absAmount = delta.net < 0n ? -delta.net : delta.net
        const sign = delta.net < 0n ? '-' : ''
        return [`${sign}${formatTokenAmount(absAmount, dec)}`, usd ?? '0']
      })

      const absGas = s.totalGasWei
      const absNative = s.nativeNetWei < 0n ? -s.nativeNetWei : s.nativeNetWei
      const nativeSign = s.nativeNetWei < 0n ? '-' : ''

      const row = csvRow([
        s.date,
        s.address,
        s.chainId,
        nativeSymbolForChain(s.chainId),
        s.txCount,
        s.successCount,
        s.failedCount,
        formatTokenAmount(absGas, NATIVE_DECIMALS),
        s.totalGasUsd,
        `${nativeSign}${formatTokenAmount(absNative, NATIVE_DECIMALS)}`,
        s.nativeNetUsd,
        ...tokenCols,
        s.netPnlUsd,
      ])

      stream.write(row + '\n')
      rowCount++
    }

    await new Promise<void>((resolve, reject) => {
      stream.end(() => resolve())
      stream.on('error', reject)
    })

    console.log(`[report] Wrote ${rowCount} rows to ${output}`)
    console.log(`[report] Addresses covered: ${trackedAddresses.join(', ')}`)
  } finally {
    await (db.$client as unknown as { end(): Promise<void> }).end()
  }
}

main().catch((err) => {
  console.error('[report] Fatal error:', err)
  process.exit(1)
})
