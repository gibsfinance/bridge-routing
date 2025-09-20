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
  return await context.db.insert(Block).values({
    chainId: BigInt(context.chain.id),
    hash: block.hash,
    number: block.number,
    timestamp: block.timestamp,
    baseFeePerGas: block.baseFeePerGas,
  }).onConflictDoNothing()
}

export const upsertTransaction = async (
  context: Context,
  block: PonderCore.Block,
  transaction: PonderCore.Transaction,
) => {
  return await context.db.insert(Transaction).values({
    chainId: BigInt(context.chain.id),
    hash: transaction.hash,
    blockChainId: BigInt(context.chain.id),
    blockHash: block.hash,
    index: transaction.transactionIndex.toString(),
    from: transaction.from.toLowerCase() as Hex,
    to: transaction.to!.toLowerCase() as Hex,
    value: transaction.value,
    maxFeePerGas: transaction.maxFeePerGas,
    maxPriorityFeePerGas: transaction.maxPriorityFeePerGas,
    gas: transaction.gas,
    gasPrice: transaction.gasPrice,
    nonce: BigInt(transaction.nonce),
    type: transaction.type,
  }).onConflictDoNothing()
}

export const upsertBridge = async (context: Context, address: Hex) => {
  const info = bridgeInfo(context.chain.id, address)
  return await context.db.insert(BridgeSide).values({
    chainId: BigInt(context.chain.id),
    address: info!.target.omni.toLowerCase() as Hex,
    provider: info!.provider,
    pair: info!.pair,
    side: info!.side,
  }).onConflictDoNothing()
}

type RequiredSigs = {
  orderId: bigint | null
  value: bigint
}

export const getLatestRequiredSignatures = async (
  context: Context,
  bridgeAddress: Hex,
): Promise<RequiredSigs> => {
  const latest = await context.db.find(LatestRequiredSignaturesChanged, {
    chainId: BigInt(context.chain.id),
    bridgeAddress: bridgeAddress.toLowerCase() as Hex,
  })

  if (!latest) {
    // console.log('no latest required signatures found for bridge chain_id=%o address=%o',
    //   context.chain.id, bridgeAddress)
    return {
      orderId: null,
      value: 0n,
    }
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
