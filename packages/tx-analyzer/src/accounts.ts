import { ponder } from 'ponder:registry'
import { getAddress, type Hex } from 'viem'
import { TrackedTransaction, NativeTransfer } from 'ponder:schema'

// ---------------------------------------------------------------------------
// Transaction handlers (top-level from / to)
//
// These capture gas costs and the native value attached to the top-level
// transaction. ERC-20 transfers are handled separately by the contract-level
// sources in src/erc20transfers.ts.
// ---------------------------------------------------------------------------

ponder.on('WalletTracker:transaction:from', async ({ event, context }) => {
  await indexTransaction({
    event,
    context,
    trackedAddress: getAddress(event.transaction.from),
  })
})

ponder.on('WalletTracker:transaction:to', async ({ event, context }) => {
  if (!event.transaction.to) return
  await indexTransaction({
    event,
    context,
    trackedAddress: getAddress(event.transaction.to),
  })
})

// ---------------------------------------------------------------------------
// Native transfer handlers (internal PLS value flows via EVM CALL traces)
//
// These fire for every sub-call that moves native value to or from a tracked
// address — including cases where the validator is neither the top-level
// sender nor the top-level recipient of the transaction.
// ---------------------------------------------------------------------------

ponder.on('WalletTracker:transfer:from', async ({ event, context }) => {
  await indexNativeTransfer({
    event,
    context,
    trackedAddress: getAddress(event.transfer.from),
  })
})

ponder.on('WalletTracker:transfer:to', async ({ event, context }) => {
  await indexNativeTransfer({
    event,
    context,
    trackedAddress: getAddress(event.transfer.to),
  })
})

// ---------------------------------------------------------------------------
// Core indexing helpers
// ---------------------------------------------------------------------------

async function indexTransaction({
  event,
  context,
  trackedAddress,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  event: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
  trackedAddress: Hex
}): Promise<void> {
  const { transaction: tx, transactionReceipt: receipt, block } = event
  const chainId = BigInt(context.chain.id)

  const gasPrice: bigint = receipt.effectiveGasPrice ?? tx.gasPrice ?? 0n
  const gasCostWei: bigint = receipt.gasUsed * gasPrice

  await context.db
    .insert(TrackedTransaction)
    .values({
      id: `${context.chain.id}-${tx.hash}-${trackedAddress.toLowerCase()}`,
      trackedAddress,
      chainId,
      txHash: tx.hash as Hex,
      blockNumber: block.number,
      blockTimestamp: block.timestamp,
      from: getAddress(tx.from),
      to: tx.to ? getAddress(tx.to) : null,
      status: receipt.status === 'success' ? 'success' : 'failed',
      gasUsed: receipt.gasUsed,
      gasPrice,
      gasCostWei,
      nativeValueWei: tx.value,
    })
    .onConflictDoNothing()
}

async function indexNativeTransfer({
  event,
  context,
  trackedAddress,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  event: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
  trackedAddress: Hex
}): Promise<void> {
  const { transfer, transaction: tx, block, trace } = event
  const chainId = BigInt(context.chain.id)

  await context.db
    .insert(NativeTransfer)
    .values({
      id: `${context.chain.id}-${trace.id}-${trackedAddress.toLowerCase()}`,
      trackedAddress,
      chainId,
      txHash: tx.hash as Hex,
      blockNumber: block.number,
      blockTimestamp: block.timestamp,
      from: getAddress(transfer.from),
      to: getAddress(transfer.to),
      value: transfer.value,
    })
    .onConflictDoNothing()
}
