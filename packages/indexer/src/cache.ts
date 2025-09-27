import { AMBBridge, Omnibridge, RequiredSignaturesChanged, ValidatorContract, Block, Transaction, Validator, LatestFeeUpdate, FeeUpdate, FeeManagerContract } from 'ponder:schema'
import { Context } from 'ponder:registry'
import { concatHex, keccak256, numberToHex, zeroAddress, type Hex } from 'viem'
import { getInfoBy, MinimalInfo, PathPairing } from './utils'
import * as PonderCore from 'ponder'
import { FOREIGN_TO_HOME_FEE, HOME_TO_FOREIGN_FEE} from '@gibs/bridge-sdk/config'

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
    to: (transaction.to?.toLowerCase() ?? null) as Hex | null,
    value: transaction.value,
    maxFeePerGas: transaction.maxFeePerGas,
    maxPriorityFeePerGas: transaction.maxPriorityFeePerGas,
    gas: transaction.gas,
    gasPrice: transaction.gasPrice,
    nonce: BigInt(transaction.nonce),
    type: transaction.type,
  }).onConflictDoNothing()
}

export const upsertOmniBridge = async (context: Context, address: Hex) => {
  const info = await getInfoBy({ key: 'omni', address: address, chainId: context.chain.id })
  const amb = await info!.target.amb
  return await context.db.insert(Omnibridge).values({
    chainId: BigInt(context.chain.id),
    address: info!.target.omni.toLowerCase() as Hex,
    ambAddress: amb.toLowerCase() as Hex,
  }).onConflictDoNothing()
}

export const upsertAmbBridge = async (context: Context, address: Hex | Promise<Hex>) => {
  const addr = await address
  const info = await getInfoBy({ key: 'amb', address: addr, chainId: context.chain.id })
  const validator = await info!.target.validator
  return await context.db.insert(AMBBridge).values({
    chainId: BigInt(context.chain.id),
    address: addr.toLowerCase() as Hex,
    provider: info!.provider,
    pair: info!.pair,
    side: info!.side,
    validatorAddress: validator.toLowerCase() as Hex,
  }).onConflictDoNothing()
}

export const upsertValidatorContract = async (context: Context, address: Hex, updates: Partial<typeof ValidatorContract.$inferInsert> = {}) => {
  return await context.db.insert(ValidatorContract).values({
    chainId: BigInt(context.chain.id),
    address: address.toLowerCase() as Hex,
    latestRequiredSignaturesOrderId: updates.latestRequiredSignaturesOrderId || 0n,
    ...updates,
  }).onConflictDoUpdate(() => updates)
}

export const toValidatorId = async ({ validator, amb, contract, chainId }: {
  validator: Hex
  amb: Hex | Promise<Hex>
  contract: Hex | Promise<Hex>
  chainId: number
}) => (
  keccak256(concatHex([
    validator.toLowerCase() as Hex,
    numberToHex(BigInt(chainId), { size: 32 }),
    (await contract).toLowerCase() as Hex,
    (await amb).toLowerCase() as Hex,
  ]))
)

export const upsertValidator = async (context: Context, validator: Hex, info: MinimalInfo) => {
  const amb = await info.target.amb
  const contract = await info.target.validator
  const validatorId = await toValidatorId({
    validator, amb,
    contract,
    chainId: context.chain.id,
  })
  return await context.db.insert(Validator).values({
    address: validator.toLowerCase() as Hex,
    chainId: BigInt(context.chain.id),
    validatorContractAddress: contract.toLowerCase() as Hex,
    ambAddress: amb.toLowerCase() as Hex,
    validatorId,
  }).onConflictDoNothing()
}

export const upsertFeeManagerContract = async (context: Context, pairing: PathPairing) => {
  const addr = await pairing.feeManager
  if (!addr) return
  const omnibridgeAddress = pairing.omni
  return await context.db.insert(FeeManagerContract).values({
    chainId: BigInt(context.chain.id),
    address: addr.toLowerCase() as Hex,
    omnibridgeAddress: omnibridgeAddress.toLowerCase() as Hex,
  }).onConflictDoNothing()
}


type RequiredSigs = {
  orderId: bigint | null
  value: bigint
}

const defaultLatest = {
  orderId: null,
  value: 0n,
}

export const getLatestRequiredSignatures = async (
  context: Context,
  ambAddress: Hex | Promise<Hex>,
): Promise<RequiredSigs> => {
  const ambAddr = await ambAddress
  const amb = await context.db.find(AMBBridge, {
    chainId: BigInt(context.chain.id),
    address: ambAddr.toLowerCase() as Hex,
  })
  const validatorContractAddress = amb!.validatorAddress
  // const info = await getInfoBy('amb', ambAddress)
  // const validatorContractAddress = await info!.target.validator
  const validatorContract = await context.db.find(ValidatorContract, {
    chainId: BigInt(context.chain.id),
    address: validatorContractAddress.toLowerCase() as Hex,
  })

  if (!validatorContract) return defaultLatest
  if (!validatorContract.latestRequiredSignaturesOrderId) {
    // console.log('no latest required signatures found for bridge chain_id=%o address=%o',
    //   context.chain.id, bridgeAddress)
    // this happens when a validator has not been inited / not set its minimum required signatures
    // so the bridge can be free / not require any signatures to work
    console.log('no latest required signatures found for bridge chain_id=%o address=%o',
      context.chain.id, ambAddr)
    return defaultLatest
  }

  const requiredSignatures = await context.db.find(RequiredSignaturesChanged, {
    orderId: validatorContract.latestRequiredSignaturesOrderId,
  })

  if (!requiredSignatures) {
    console.log(validatorContract)
    throw new Error('Required signatures not found for order ID')
  }

  return {
    orderId: requiredSignatures.orderId,
    value: requiredSignatures.value,
  }
}

export const getLatestFeeUpdate = async ({
  context,
  feeManagerContractAddress: feeManagerContractAddr,
  tokenAddress: tokenAddr,
  originationFromHome,
  omnibridgeAddress,
}: {
  context: Context,
  feeManagerContractAddress: Hex | Promise<Hex>,
  tokenAddress: Hex,
  omnibridgeAddress: Hex,
  originationFromHome: boolean,
}) => {
  const chainId = BigInt(context.chain.id)
  const feeManagerContractAddress = (await feeManagerContractAddr).toLowerCase() as Hex
  const tokenAddress = tokenAddr.toLowerCase() as Hex
  const feeType = originationFromHome ? HOME_TO_FOREIGN_FEE : FOREIGN_TO_HOME_FEE
  const latestFeeUpdate = await context.db.find(LatestFeeUpdate, {
    chainId,
    feeManagerContractAddress,
    tokenAddress,
    feeType,
    omnibridgeAddress,
  })
  if (latestFeeUpdate) {
    const feeUpdate = await context.db.find(FeeUpdate, {
      orderId: latestFeeUpdate.orderId,
    })
    if (feeUpdate && feeUpdate.fee !== 0n) {
      return feeUpdate
    }
  }
  const latestDefaultFeeUpdate = await context.db.find(LatestFeeUpdate, {
    chainId,
    feeManagerContractAddress,
    tokenAddress: zeroAddress,
    feeType,
    omnibridgeAddress,
  })
  if (latestDefaultFeeUpdate) {
    const feeUpdate = await context.db.find(FeeUpdate, {
      orderId: latestDefaultFeeUpdate.orderId,
    })
    if (feeUpdate) {
      return feeUpdate
    }
  }
  return {
    value: 0n,
    orderId: null,
    feeManagerContractAddress: null,
    chainId: null,
  }
}
