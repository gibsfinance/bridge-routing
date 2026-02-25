import { onchainEnum, onchainTable } from 'ponder'

/**
 * Whether a transaction succeeded (was mined and executed without revert)
 * or failed (was mined but the EVM execution reverted).
 * Both statuses incur gas costs, which is why failures are tracked too.
 */
export const TxStatus = onchainEnum('tx_status', ['success', 'failed'])

/**
 * One row per (transaction × tracked-address).
 *
 * Most transactions will produce exactly one row, keyed on the wallet that
 * sent or received value. A transaction where the same address is both sender
 * and recipient (self-transfer) will still produce one row because the
 * primary key includes the tracked address.
 */
export const TrackedTransaction = onchainTable('tracked_transaction', (t) => ({
  /** "${chainId}-${txHash}-${trackedAddress.toLowerCase()}" */
  id: t.text().primaryKey().notNull(),

  /** The wallet address being analysed */
  trackedAddress: t.hex().notNull(),

  chainId: t.bigint().notNull(),
  txHash: t.hex().notNull(),
  blockNumber: t.bigint().notNull(),

  /** Unix timestamp (seconds) of the block this transaction was mined in */
  blockTimestamp: t.bigint().notNull(),

  /** Transaction sender */
  from: t.hex().notNull(),

  /** Transaction recipient — null for contract deployments */
  to: t.hex(),

  status: TxStatus().notNull(),

  /** Actual gas units consumed (from the receipt) */
  gasUsed: t.bigint().notNull(),

  /** Effective gas price paid in wei (EIP-1559 or legacy) */
  gasPrice: t.bigint().notNull(),

  /**
   * Total native-token gas cost in the chain's smallest unit.
   * gasUsed × gasPrice
   */
  gasCostWei: t.bigint().notNull(),

  /**
   * Native token value attached to this transaction in wei.
   * For the sender this is a debit; for the recipient a credit.
   */
  nativeValueWei: t.bigint().notNull(),
}))

/**
 * One row per ERC-20 Transfer log emitted inside a tracked transaction.
 *
 * All Transfer events in a tracked transaction are stored here, not just
 * those involving the tracked address. This lets the reporting layer
 * compute the net balance change for any address without re-fetching.
 */
export const Erc20Transfer = onchainTable('erc20_transfer', (t) => ({
  /** "${chainId}-${txHash}-${logIndex}-${trackedAddress.toLowerCase()}" */
  id: t.text().primaryKey().notNull(),

  /** The validator address whose balance this transfer affects */
  trackedAddress: t.hex().notNull(),

  chainId: t.bigint().notNull(),
  txHash: t.hex().notNull(),
  blockNumber: t.bigint().notNull(),
  blockTimestamp: t.bigint().notNull(),

  /** Position of this log in the transaction receipt */
  logIndex: t.integer().notNull(),

  /** ERC-20 contract address */
  tokenAddress: t.hex().notNull(),

  /** Cached token symbol at index time (e.g. "USDC") */
  tokenSymbol: t.text().notNull(),

  /** Cached token name (e.g. "USD Coin") */
  tokenName: t.text().notNull(),

  /** Decimal places for this token (e.g. 6 for USDC, 18 for most others) */
  tokenDecimals: t.integer().notNull(),

  from: t.hex().notNull(),
  to: t.hex().notNull(),

  /** Raw transfer amount in the token's smallest unit */
  amount: t.bigint().notNull(),
}))

/**
 * Cached ERC-20 token metadata.
 *
 * Written once the first time a token is encountered. The report scripts
 * can join against this table to get human-readable names without extra
 * RPC calls.
 */
export const TokenMetadata = onchainTable('token_metadata', (t) => ({
  /** "${chainId}-${tokenAddress.toLowerCase()}" */
  id: t.text().primaryKey().notNull(),

  chainId: t.bigint().notNull(),
  tokenAddress: t.hex().notNull(),
  symbol: t.text().notNull(),
  name: t.text().notNull(),
  decimals: t.integer().notNull(),
}))

/**
 * One row per internal native-token transfer involving a tracked address.
 *
 * Ponder fires WalletTracker:transfer:from / :transfer:to for every EVM CALL
 * trace that moves native value (PLS) to or from a tracked address, including
 * sub-calls that never surface in the top-level transaction from/to fields.
 */
export const NativeTransfer = onchainTable('native_transfer', (t) => ({
  /** "${chainId}-${traceId}-${trackedAddress.toLowerCase()}" */
  id: t.text().primaryKey().notNull(),

  /** The validator address whose balance this transfer affects */
  trackedAddress: t.hex().notNull(),

  chainId: t.bigint().notNull(),
  txHash: t.hex().notNull(),
  blockNumber: t.bigint().notNull(),
  blockTimestamp: t.bigint().notNull(),

  from: t.hex().notNull(),
  to: t.hex().notNull(),

  /** Native value transferred in wei */
  value: t.bigint().notNull(),
}))
