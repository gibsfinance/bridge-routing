import { ponder } from 'ponder:registry'
import { getAddress, type Hex } from 'viem'
import { Erc20Transfer } from 'ponder:schema'
import { resolveTokenMetadata } from './token.js'

// ---------------------------------------------------------------------------
// ERC-20 Transfer handlers
//
// These fire for every Transfer(from, to, value) log where the tracked address
// appears as the indexed `to` (Erc20TransferTo) or `from` (Erc20TransferFrom),
// across ALL token contracts on the chain. This captures token flows that
// occur in transactions the validator did not initiate.
// ---------------------------------------------------------------------------

ponder.on('Erc20TransferTo:Transfer', async ({ event, context }) => {
  await indexErc20Transfer({
    event,
    context,
    trackedAddress: getAddress(event.args.to),
  })
})

ponder.on('Erc20TransferFrom:Transfer', async ({ event, context }) => {
  await indexErc20Transfer({
    event,
    context,
    trackedAddress: getAddress(event.args.from),
  })
})

// ---------------------------------------------------------------------------
// Core indexing helper
// ---------------------------------------------------------------------------

async function indexErc20Transfer({
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
  const { log, transaction: tx, block } = event
  const chainId = BigInt(context.chain.id)
  const tokenAddress = getAddress(log.address) as Hex
  const meta = await resolveTokenMetadata(context, chainId, tokenAddress)

  await context.db
    .insert(Erc20Transfer)
    .values({
      id: `${context.chain.id}-${tx.hash}-${log.logIndex}-${trackedAddress.toLowerCase()}`,
      trackedAddress,
      chainId,
      txHash: tx.hash as Hex,
      blockNumber: block.number,
      blockTimestamp: block.timestamp,
      logIndex: log.logIndex,
      tokenAddress,
      tokenSymbol: meta.symbol,
      tokenName: meta.name,
      tokenDecimals: meta.decimals,
      from: getAddress(event.args.from),
      to: getAddress(event.args.to),
      amount: event.args.value,
    })
    .onConflictDoNothing()
}
