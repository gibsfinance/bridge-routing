import { RequiredSignaturesChanged } from 'ponder:schema'
import { LatestRequiredSignaturesChanged } from 'ponder:schema'
import { Context } from 'ponder:registry'
import type { Hex } from 'viem'
import { bridgeInfo } from './utils'
import { Block, BridgeSide, Transaction } from 'ponder:schema'
import * as PonderCore from 'ponder'

export const upsertBlock = async (
  context: Context,
  block: PonderCore.Block,
) => {
  console.log('upserting block', block.timestamp, context.chain.id)
  return await context.db.insert(Block).values({
    chainId: context.chain.id.toString(),
    hash: block.hash,
    number: block.number,
    timestamp: block.timestamp,
    baseFeePerGas: block.baseFeePerGas,
  }).onConflictDoUpdate((row) => ({
    ...row,
    number: block.number,
    timestamp: block.timestamp,
    baseFeePerGas: block.baseFeePerGas,
  }))
}

export const upsertTransaction = async (
  context: Context,
  block: PonderCore.Block,
  transaction: PonderCore.Transaction,
) => {
  return await context.db.insert(Transaction).values({
    chainId: context.chain.id.toString(),
    hash: transaction.hash,
    blockChainId: context.chain.id.toString(),
    blockHash: block.hash,
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
  }).onConflictDoUpdate((row) => ({
    ...row,
    blockHash: block.hash,
  }))
}

export const upsertBridge = async (context: Context, address: Hex) => {
  const info = bridgeInfo(address)
  return await context.db.insert(BridgeSide).values({
    chainId: context.chain.id.toString(),
    address: info!.address,
    provider: info!.provider,
    side: info!.side,
  }).onConflictDoUpdate((row) => ({
    ...row,
    provider: info!.provider,
    side: info!.side,
  }))
}

type RequiredSigs = {
  orderId: bigint
  value: bigint
}

export const getLatestRequiredSignatures = async (
  context: Context,
  bridgeAddress: Hex,
): Promise<RequiredSigs> => {
  const latest = await context.db.find(LatestRequiredSignaturesChanged, {
    bridgeChainId: context.chain.id.toString(),
    bridgeAddress: bridgeAddress,
  })

  if (!latest) {
    throw new Error(`No latest required signatures found for bridge ${bridgeAddress} on chain ${context.chain.id}`)
  }

  const requiredSignatures = await context.db.find(RequiredSignaturesChanged, {
    orderId: latest.orderId,
  })

  if (!requiredSignatures) {
    throw new Error('Required signatures not found for order ID')
  }

  return {
    orderId: requiredSignatures.orderId,
    value: requiredSignatures.value,
  }
}
