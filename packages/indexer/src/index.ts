import { Context, ponder } from 'ponder:registry'
import {
  AffirmationCompleted,
  FeeDirector,
  LatestRequiredSignaturesChanged,
  RelayMessage,
  RequiredSignaturesChanged,
  ReverseMessageHashBinding,
  SignedForAffirmation,
  SignedForUserRequest,
  UserRequestForAffirmation,
  UserRequestForSignature,
  ValidatorStatusUpdate,
  LatestValidatorStatusUpdate,
} from 'ponder:schema'
import type { Hex } from 'viem'
import { parseAMBMessage } from './message'
import { getBridgeAddressFromValidator, createOrderId } from './utils'
import {
  getLatestRequiredSignatures,
  upsertBridge,
  upsertBlock,
  upsertTransaction,
} from './cache'
import type { SignatureEvent } from './config'

ponder.on('ValidatorContract:ValidatorAdded', async ({ event, context }) => {
  console.log(
    'validator %o on %o added',
    event.args.validator,
    context.chain.id,
  )
  const bridgeAddress = await getBridgeAddressFromValidator(event.log.address)
  const orderId = createOrderId(context, event)
  await Promise.all([
    upsertBridge(context, bridgeAddress),
    upsertBlock(context, event.block),
    upsertTransaction(context, event.block, event.transaction),
    context.db
      .insert(LatestValidatorStatusUpdate)
      .values({
        bridgeChainId: context.chain.id.toString(),
        bridgeAddress,
        validatorAddress: event.args.validator,
        orderId,
      })
      .onConflictDoUpdate(() => ({
        orderId,
      })),
    context.db.insert(ValidatorStatusUpdate).values({
      orderId,
      bridgeChainId: context.chain.id.toString(),
      bridgeAddress,
      validatorAddress: event.args.validator,
      transactionChainId: context.chain.id.toString(),
      transactionHash: event.transaction.hash,
      value: true,
      logIndex: event.log.logIndex,
    }),
  ])
})

ponder.on('ValidatorContract:ValidatorRemoved', async ({ event, context }) => {
  console.log(
    'validator %o on %o removed',
    event.args.validator,
    context.chain.id,
  )
  const bridgeAddress = await getBridgeAddressFromValidator(event.log.address)
  const orderId = createOrderId(context, event)
  await Promise.all([
    upsertBridge(context, bridgeAddress),
    upsertBlock(context, event.block),
    upsertTransaction(context, event.block, event.transaction),
    context.db
      .insert(LatestValidatorStatusUpdate)
      .values({
        bridgeChainId: context.chain.id.toString(),
        bridgeAddress,
        validatorAddress: event.args.validator,
        orderId,
      })
      .onConflictDoUpdate(() => ({
        orderId,
      })),
    context.db.insert(ValidatorStatusUpdate).values({
      orderId,
      bridgeChainId: context.chain.id.toString(),
      bridgeAddress,
      validatorAddress: event.args.validator,
      transactionChainId: context.chain.id.toString(),
      transactionHash: event.transaction.hash,
      value: false,
      logIndex: event.log.logIndex,
    }),
  ])
})

ponder.on(
  'ValidatorContract:RequiredSignaturesChanged',
  async ({ event, context }) => {
    const bridgeAddress = await getBridgeAddressFromValidator(event.log.address)
    const orderId = createOrderId(context, event)
    console.log('required signatures changed address=%o required=%o',
      bridgeAddress, event.args.requiredSignatures)
    await Promise.all([
      upsertBridge(context, bridgeAddress),
      upsertBlock(context, event.block),
      upsertTransaction(context, event.block, event.transaction),
      context.db
        .insert(LatestRequiredSignaturesChanged)
        .values({
          bridgeChainId: context.chain.id.toString(),
          bridgeAddress,
          orderId,
        })
        .onConflictDoUpdate(() => ({
          orderId,
        })),
      context.db.insert(RequiredSignaturesChanged).values({
        orderId,
        bridgeChainId: context.chain.id.toString(),
        bridgeAddress,
        value: event.args.requiredSignatures,
        transactionChainId: context.chain.id.toString(),
        transactionHash: event.transaction.hash,
        logIndex: event.log.logIndex,
      }),
    ])
  },
)

const getOutstandingMessageIdByHash = async (
  context: Context,
  event: SignatureEvent,
): Promise<Hex | null> => {
  const messageHash = event.args.messageHash
  const binding = await context.db.find(ReverseMessageHashBinding, {
    messageHash,
  })
  if (!binding) {
    console.warn('reverse message hash binding not found', messageHash)
    return null
  }
  return binding!.messageId
}

ponder.on(
  'ForeignAMB:UserRequestForAffirmation',
  async ({ event, context }) => {
    const parsed = parseAMBMessage(
      event.transaction.from,
      event.args.encodedData,
    )
    const bridgeAddress = event.log.address
    const orderId = createOrderId(context, event)
    // console.log(parsed.messageHash, event.args.messageId)
    await Promise.all([
      upsertBlock(context, event.block),
      upsertTransaction(context, event.block, event.transaction),
      upsertBridge(context, bridgeAddress),
      context.db.insert(ReverseMessageHashBinding).values({
        messageHash: parsed.messageHash,
        messageId: event.args.messageId,
      }),
      getLatestRequiredSignatures(context, bridgeAddress).then(
        (requiredSignatures) =>
          context.db.insert(UserRequestForAffirmation).values({
            messageId: event.args.messageId,
            orderId,
            blockChainId: context.chain.id.toString(),
            blockHash: event.block.hash,
            transactionChainId: context.chain.id.toString(),
            transactionHash: event.transaction.hash,
            messageHash: parsed.messageHash,
            from: parsed.from,
            to: parsed.to,
            amount: parsed.nestedData.amount,
            encodedData: event.args.encodedData,
            logIndex: event.log.logIndex,
            bridgeChainId: context.chain.id.toString(),
            bridgeAddress,
            originationChainId: parsed.originationChainId,
            destinationChainId: parsed.destinationChainId,
            requiredSignatureOrderId: requiredSignatures.orderId,
            confirmedSignatures: 0n,
            finishedSigning: false,
            token: parsed.nestedData.token,
            handlingNative: parsed.handlingNative,
            deliveringNative: parsed.deliveringNative,
          }),
      ),
    ])
  },
)

ponder.on('HomeAMB:UserRequestForSignature', async ({ event, context }) => {
  const bridgeAddress = event.log.address
  const parsed = parseAMBMessage(event.transaction.from, event.args.encodedData)
  const orderId = createOrderId(context, event)
  // console.log(parsed.messageHash, event.args.messageId)
  await Promise.all([
    upsertBlock(context, event.block),
    upsertTransaction(context, event.block, event.transaction),
    upsertBridge(context, bridgeAddress),
    context.db.insert(ReverseMessageHashBinding).values({
      messageHash: parsed.messageHash,
      messageId: event.args.messageId,
    }),
    parsed.feeDirector
      ? context.db.insert(FeeDirector).values({
        messageId: event.args.messageId,
        recipient: parsed.feeDirector.recipient,
        settings: parsed.feeDirector.settings,
        limit: parsed.feeDirector.limit,
        multiplier: parsed.feeDirector.multiplier,
        feeType: parsed.feeDirector.feeType,
        unwrapped: parsed.feeDirector.unwrapped,
        excludePriority: parsed.feeDirector.excludePriority,
      })
      : null,
    getLatestRequiredSignatures(context, bridgeAddress).then(
      (requiredSignatures) =>
        context.db.insert(UserRequestForSignature).values({
          messageId: event.args.messageId,
          orderId,
          blockChainId: context.chain.id.toString(),
          blockHash: event.block.hash,
          transactionChainId: context.chain.id.toString(),
          transactionHash: event.transaction.hash,
          messageHash: parsed.messageHash,
          from: parsed.from,
          to: parsed.to,
          amount: parsed.nestedData.amount,
          encodedData: event.args.encodedData,
          logIndex: event.log.logIndex,
          bridgeChainId: context.chain.id.toString(),
          bridgeAddress,
          originationChainId: parsed.originationChainId,
          destinationChainId: parsed.destinationChainId,
          requiredSignatureOrderId: requiredSignatures.orderId,
          confirmedSignatures: 0n,
          finishedSigning: false,
          token: parsed.nestedData.token,
          handlingNative: parsed.handlingNative,
          deliveringNative: parsed.deliveringNative,
        }),
    ),
  ])
})

ponder.on('HomeAMB:SignedForAffirmation', async ({ event, context }) => {
  const messageHash = event.args.messageHash
  const bridgeAddress = event.log.address
  const validatorAddress = event.args.signer
  const orderId = createOrderId(context, event)
  await Promise.all([
    upsertBlock(context, event.block),
    upsertTransaction(context, event.block, event.transaction),
    upsertBridge(context, bridgeAddress),
    Promise.all([
      getLatestRequiredSignatures(context, bridgeAddress),
      getOutstandingMessageIdByHash(context, event),
    ]).then(([requiredSignatures, messageId]) =>
      messageId && Promise.all([
        context.db
          .update(UserRequestForAffirmation, {
            messageId,
          })
          .set((row) => ({
            confirmedSignatures: row.confirmedSignatures + 1n,
            finishedSigning:
              row.confirmedSignatures + 1n >= requiredSignatures.value,
          })),
        context.db.insert(SignedForAffirmation).values({
          messageHash,
          bridgeChainId: context.chain.id.toString(),
          bridgeAddress,
          validatorAddress,
          orderId,
          blockChainId: context.chain.id.toString(),
          blockHash: event.block.hash,
          transactionChainId: context.chain.id.toString(),
          transactionHash: event.transaction.hash,
          userRequestId: messageId,
          logIndex: event.log.logIndex,
        }),
      ]),
    ),
  ])
})

ponder.on('HomeAMB:SignedForUserRequest', async ({ event, context }) => {
  const messageHash = event.args.messageHash
  const bridgeAddress = event.log.address
  const validatorAddress = event.args.signer
  const orderId = createOrderId(context, event)
  await Promise.all([
    upsertBlock(context, event.block),
    upsertTransaction(context, event.block, event.transaction),
    upsertBridge(context, bridgeAddress),
    Promise.all([
      getLatestRequiredSignatures(context, bridgeAddress),
      getOutstandingMessageIdByHash(context, event),
    ]).then(([requiredSignatures, messageId]) =>
      messageId && Promise.all([
        context.db
          .update(UserRequestForSignature, {
            messageId,
          })
          .set((row) => ({
            confirmedSignatures: row.confirmedSignatures + 1n,
            finishedSigning:
              row.confirmedSignatures + 1n >= requiredSignatures.value,
          })),
        context.db.insert(SignedForUserRequest).values({
          messageHash,
          bridgeChainId: context.chain.id.toString(),
          bridgeAddress,
          validatorAddress,
          orderId,
          blockChainId: context.chain.id.toString(),
          blockHash: event.block.hash,
          transactionChainId: context.chain.id.toString(),
          transactionHash: event.transaction.hash,
          userRequestId: messageId,
          logIndex: event.log.logIndex,
        }),
      ]),
    ),
  ])
})

ponder.on('HomeAMB:AffirmationCompleted', async ({ event, context }) => {
  const orderId = createOrderId(context, event)
  await Promise.all([
    upsertTransaction(context, event.block, event.transaction),
    upsertBlock(context, event.block),
    context.db
      .find(UserRequestForAffirmation, {
        messageId: event.args.messageId,
      })
      .then((userRequestForAffirmation) => {
        if (!userRequestForAffirmation) {
          console.warn('user request for affirmation not found', event.args)
          return
        }
        return context.db.insert(AffirmationCompleted).values({
          messageHash: userRequestForAffirmation!.messageHash,
          orderId,
          transactionChainId: context.chain.id.toString(),
          transactionHash: event.transaction.hash,
          userRequestId: event.args.messageId,
          deliverer: event.transaction.from,
          logIndex: event.log.logIndex,
        })
      }),
  ])
})

ponder.on('ForeignAMB:RelayedMessage', async ({ event, context }) => {
  const orderId = createOrderId(context, event)
  await Promise.all([
    upsertBlock(context, event.block),
    upsertTransaction(context, event.block, event.transaction),
    context.db
      .find(UserRequestForSignature, {
        messageId: event.args.messageId,
      })
      .then((userRequestForSignature) => {
        return context.db.insert(RelayMessage).values({
          messageHash: userRequestForSignature!.messageHash,
          orderId,
          transactionChainId: context.chain.id.toString(),
          transactionHash: event.transaction.hash,
          userRequestId: event.args.messageId,
          deliverer: event.transaction.from,
          logIndex: event.log.logIndex,
        })
      }),
  ])
})
