import { RequiredSignaturesChanged } from 'ponder:schema'
import { LatestRequiredSignaturesChanged } from 'ponder:schema'
import { Context } from 'ponder:registry'
import type { Hex } from 'viem'
import { bridgeInfo, ids, orderId, staticRequiredSignatures } from './utils'
import { Block, BridgeSide, Transaction } from 'ponder:schema'
import * as PonderCore from 'ponder'

export const upsertBlock = async (
  context: Context,
  block: PonderCore.Block,
) => {
  const blockId = ids.block(context, block.hash)
  const blockInfo = await context.db.find(Block, {
    blockId,
  })
  if (blockInfo) {
    return blockInfo
  }
  return await context.db.insert(Block).values({
    blockId,
    chainId: context.chain.id.toString(),
    hash: block.hash,
    number: block.number,
    timestamp: block.timestamp,
    baseFeePerGas: block.baseFeePerGas,
  })
}

export const upsertTransaction = async (
  context: Context,
  block: PonderCore.Block,
  transaction: PonderCore.Transaction,
) => {
  const transactionId = ids.transaction(context, transaction.hash)
  const transactionInfo = await context.db.find(Transaction, {
    transactionId,
  })
  if (transactionInfo) {
    return transactionInfo
  }
  const t = await context.db.insert(Transaction).values({
    transactionId: transactionId,
    blockId: ids.block(context, block.hash),
    hash: transaction.hash,
    index: transaction.transactionIndex.toString(),
    from: transaction.from,
    to: transaction.to!,
    value: transaction.value,
    maxFeePerGas: transaction.maxFeePerGas,
    maxPriorityFeePerGas: transaction.maxPriorityFeePerGas,
    gas: transaction.gas,
    gasPrice: transaction.gasPrice,
    nonce: BigInt(transaction.nonce),
    type: transaction.type,
  })
  return t
}

export const upsertBridge = async (context: Context, address: Hex) => {
  const bridgeId = ids.bridge(context, address)
  const bridgeSide = await context.db.find(BridgeSide, {
    bridgeId,
  })
  if (bridgeSide) {
    return bridgeSide
  }
  const info = bridgeInfo(address)
  const bridge = await context.db.insert(BridgeSide).values({
    bridgeId: ids.bridge(context, address),
    chainId: context.chain.id.toString(),
    address: info!.address,
    provider: info!.provider,
    side: info!.side,
  })
  return bridge
}

type RequiredSigs = {
  orderId: Hex
  value: bigint
}

export const getLatestRequiredSignatures = async (
  context: Context,
  bridgeId: Hex,
  event: any,
) => {
  let latest = await context.db.find(LatestRequiredSignaturesChanged, {
    bridgeId,
  })
  if (!latest) {
    console.log(
      'no latest required signatures found for %o on %o',
      bridgeId,
      context.chain.id,
    )
    const currentEventId = orderId(context, event)
    const value = staticRequiredSignatures(
      context.chain.id,
      event.log.address,
    )
    const [l] = await Promise.all([
      context.db
        .insert(LatestRequiredSignaturesChanged)
        .values({
          bridgeId,
          orderId: currentEventId,
        })
        .onConflictDoUpdate(() => ({
          orderId: currentEventId,
        })),
      context.db.insert(RequiredSignaturesChanged).values({
        orderId: currentEventId,
        bridgeId,
        value,
        transactionId: event.transaction.hash,
        logIndex: event.log.logIndex,
      }),
    ])
    latest = l
  }
  const requiredSignatures = await context.db.find(RequiredSignaturesChanged, {
    orderId: latest!.orderId!,
  })
  if (!requiredSignatures) {
    throw new Error('impossible state')
  }
  return requiredSignatures
}
