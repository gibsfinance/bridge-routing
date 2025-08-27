// import { Context, ponder } from 'ponder:registry'
// import {
//   AffirmationCompleted,
//   FeeDirector,
//   LatestRequiredSignaturesChanged,
//   RelayMessage,
//   RequiredSignaturesChanged,
//   ReverseMessageHashBinding,
//   SignedForAffirmation,
//   SignedForUserRequest,
//   UserRequestForAffirmation,
//   UserRequestForSignature,
//   ValidatorStatusUpdate,
//   LatestValidatorStatusUpdate,
// } from 'ponder:schema'
// import type { Hex } from 'viem'
// import { parseAMBMessage } from './message'
// import { getBridgeAddressFromValidator, ids, orderId } from './utils'
// import {
//   getLatestRequiredSignatures,
//   upsertBridge,
//   upsertBlock,
//   upsertTransaction,
// } from './cache'
// import type { SignatureEvent } from './config'

// ponder.on('ValidatorContract:ValidatorAdded', async ({ event, context }) => {
//   console.log(
//     'validator %o on %o added',
//     event.args.validator,
//     context.chain.id,
//   )
//   const bridgeAddress = await getBridgeAddressFromValidator(event.log.address)
//   const bridgeId = ids.bridge(context, bridgeAddress)
//   const transactionId = ids.transaction(context, event.transaction.hash)
//   const validatorId = ids.validator(bridgeId, event.args.validator)
//   const eventOrderId = orderId(context, event)
//   await Promise.all([
//     upsertBridge(context, bridgeAddress),
//     upsertBlock(context, event.block),
//     upsertTransaction(context, event.block, event.transaction),
//     context.db
//       .insert(LatestValidatorStatusUpdate)
//       .values({
//         validatorId,
//         orderId: eventOrderId,
//       })
//       .onConflictDoUpdate(() => ({
//         orderId: eventOrderId,
//       })),
//     context.db.insert(ValidatorStatusUpdate).values({
//       validatorId,
//       orderId: eventOrderId,
//       bridgeId,
//       address: event.args.validator,
//       value: true,
//       transactionId,
//       logIndex: event.log.logIndex,
//     }),
//   ])
// })

// ponder.on('ValidatorContract:ValidatorRemoved', async ({ event, context }) => {
//   console.log(
//     'validator %o on %o removed',
//     event.args.validator,
//     context.chain.id,
//   )
//   const bridgeAddress = await getBridgeAddressFromValidator(event.log.address)
//   const bridgeId = ids.bridge(context, bridgeAddress)
//   const transactionId = ids.transaction(context, event.transaction.hash)
//   const validatorId = ids.validator(bridgeId, event.args.validator)
//   const eventOrderId = orderId(context, event)
//   await Promise.all([
//     upsertBridge(context, bridgeAddress),
//     upsertBlock(context, event.block),
//     upsertTransaction(context, event.block, event.transaction),
//     context.db
//       .insert(LatestValidatorStatusUpdate)
//       .values({
//         validatorId,
//         orderId: eventOrderId,
//       })
//       .onConflictDoUpdate(() => ({
//         orderId: eventOrderId,
//       })),
//     context.db.insert(ValidatorStatusUpdate).values({
//       validatorId,
//       orderId: eventOrderId,
//       bridgeId,
//       address: event.args.validator,
//       value: false,
//       transactionId,
//       logIndex: event.log.logIndex,
//     }),
//   ])
// })

// ponder.on(
//   'ValidatorContract:RequiredSignaturesChanged',
//   async ({ event, context }) => {
//     console.log('sig changed', event.args.requiredSignatures)
//     const bridgeAddress = await getBridgeAddressFromValidator(event.log.address)
//     const bridgeId = ids.bridge(context, bridgeAddress)
//     const transactionId = ids.transaction(context, event.transaction.hash)
//     const eventOrderId = orderId(context, event)
//     await Promise.all([
//       upsertBridge(context, bridgeAddress),
//       upsertBlock(context, event.block),
//       upsertTransaction(context, event.block, event.transaction),
//       context.db
//         .insert(LatestRequiredSignaturesChanged)
//         .values({
//           bridgeId,
//           orderId: eventOrderId, // pointers to required signatures change
//         })
//         .onConflictDoUpdate(() => ({
//           orderId: eventOrderId,
//         })),
//       context.db.insert(RequiredSignaturesChanged).values({
//         orderId: eventOrderId,
//         bridgeId,
//         value: event.args.requiredSignatures,
//         transactionId,
//         logIndex: event.log.logIndex,
//       }),
//     ])
//   },
// )

// const getOutstandingMessageIdByHash = async (
//   context: Context,
//   event: SignatureEvent,
// ): Promise<Hex | null> => {
//   const messageHash = event.args.messageHash
//   const binding = await context.db.find(ReverseMessageHashBinding, {
//     messageHash,
//   })
//   if (!binding) {
//     console.warn('reverse message hash binding not found', messageHash)
//     return null
//   }
//   return binding!.messageId
// }

// ponder.on(
//   'ForeignAMB:UserRequestForAffirmation',
//   async ({ event, context }) => {
//     const parsed = parseAMBMessage(
//       event.transaction.from,
//       event.args.encodedData,
//     )
//     const bridgeId = ids.bridge(context, event.log.address)
//     const blockId = ids.block(context, event.block.hash)
//     const transactionId = ids.transaction(context, event.transaction.hash)
//     const targetOrderId = orderId(context, event)
//     // console.log(parsed.messageHash, event.args.messageId)
//     await Promise.all([
//       upsertBlock(context, event.block),
//       upsertTransaction(context, event.block, event.transaction),
//       upsertBridge(context, event.log.address),
//       context.db.insert(ReverseMessageHashBinding).values({
//         messageHash: parsed.messageHash,
//         messageId: event.args.messageId,
//       }),
//       getLatestRequiredSignatures(context, bridgeId).then(
//         (requiredSignatures) =>
//           context.db.insert(UserRequestForAffirmation).values({
//             bridgeId,
//             blockId,
//             transactionId,
//             requiredSignatureId: requiredSignatures.orderId,
//             messageHash: parsed.messageHash,
//             from: parsed.from,
//             to: parsed.to,
//             amount: parsed.nestedData.amount,
//             messageId: event.args.messageId,
//             encodedData: event.args.encodedData,
//             logIndex: event.log.logIndex,
//             originationChainId: parsed.originationChainId,
//             destinationChainId: parsed.destinationChainId,
//             orderId: targetOrderId,
//             confirmedSignatures: 0n,
//             finishedSigning: false,
//             token: parsed.nestedData.token,
//             handlingNative: parsed.handlingNative,
//             deliveringNative: parsed.deliveringNative,
//           }),
//       ),
//     ])
//   },
// )

// ponder.on('HomeAMB:UserRequestForSignature', async ({ event, context }) => {
//   const bridgeId = ids.bridge(context, event.log.address)
//   const blockId = ids.block(context, event.block.hash)
//   const transactionId = ids.transaction(context, event.transaction.hash)
//   const parsed = parseAMBMessage(event.transaction.from, event.args.encodedData)
//   const targetOrderId = orderId(context, event)
//   // console.log(parsed.messageHash, event.args.messageId)
//   await Promise.all([
//     upsertBlock(context, event.block),
//     upsertTransaction(context, event.block, event.transaction),
//     upsertBridge(context, event.log.address),
//     context.db.insert(ReverseMessageHashBinding).values({
//       messageHash: parsed.messageHash,
//       messageId: event.args.messageId,
//     }),
//     parsed.feeDirector
//       ? context.db.insert(FeeDirector).values({
//         messageId: event.args.messageId,
//         recipient: parsed.feeDirector.recipient,
//         settings: parsed.feeDirector.settings,
//         limit: parsed.feeDirector.limit,
//         multiplier: parsed.feeDirector.multiplier,
//         feeType: parsed.feeDirector.feeType,
//         unwrapped: parsed.feeDirector.unwrapped,
//         excludePriority: parsed.feeDirector.excludePriority,
//       })
//       : null,
//     getLatestRequiredSignatures(context, bridgeId).then(
//       (requiredSignatures) =>
//         context.db.insert(UserRequestForSignature).values({
//           bridgeId,
//           blockId,
//           transactionId,
//           requiredSignatureId: requiredSignatures.orderId,
//           amount: parsed.nestedData.amount,
//           messageId: event.args.messageId,
//           from: parsed.from,
//           encodedData: event.args.encodedData,
//           messageHash: parsed.messageHash,
//           to: parsed.to,
//           logIndex: event.log.logIndex,
//           originationChainId: parsed.originationChainId,
//           destinationChainId: parsed.destinationChainId,
//           orderId: targetOrderId,
//           confirmedSignatures: 0n,
//           finishedSigning: false,
//           token: parsed.nestedData.token,
//           handlingNative: parsed.handlingNative,
//           deliveringNative: parsed.deliveringNative,
//         }),
//     ),
//   ])
// })

// ponder.on('HomeAMB:SignedForAffirmation', async ({ event, context }) => {
//   const messageHash = event.args.messageHash
//   const bridgeId = ids.bridge(context, event.log.address)
//   const validatorId = ids.validator(bridgeId, event.args.signer)
//   const blockId = ids.block(context, event.block.hash)
//   const transactionId = ids.transaction(context, event.transaction.hash)
//   await Promise.all([
//     upsertBlock(context, event.block),
//     upsertTransaction(context, event.block, event.transaction),
//     upsertBridge(context, event.log.address),
//     Promise.all([
//       getLatestRequiredSignatures(context, bridgeId),
//       getOutstandingMessageIdByHash(context, event),
//     ]).then(([requiredSignatures, messageId]) =>
//       messageId && Promise.all([
//         context.db
//           .update(UserRequestForAffirmation, {
//             messageId,
//           })
//           .set((row) => ({
//             confirmedSignatures: row.confirmedSignatures + 1n,
//             finishedSigning:
//               row.confirmedSignatures + 1n >= requiredSignatures.value,
//           })),
//         context.db.insert(SignedForAffirmation).values({
//           signatureId: ids.signature(messageHash, validatorId),
//           userRequestId: messageId,
//           blockId,
//           transactionId,
//           messageHash,
//           validatorId,
//           logIndex: event.log.logIndex,
//           orderId: orderId(context, event),
//         }),
//       ]),
//     ),
//   ])
// })

// ponder.on('HomeAMB:SignedForUserRequest', async ({ event, context }) => {
//   const messageHash = event.args.messageHash
//   const bridgeId = ids.bridge(context, event.log.address)
//   const validatorId = ids.validator(bridgeId, event.args.signer)
//   const blockId = ids.block(context, event.block.hash)
//   const transactionId = ids.transaction(context, event.transaction.hash)
//   await Promise.all([
//     upsertBlock(context, event.block),
//     upsertTransaction(context, event.block, event.transaction),
//     upsertBridge(context, event.log.address),
//     Promise.all([
//       getLatestRequiredSignatures(context, bridgeId),
//       getOutstandingMessageIdByHash(context, event),
//     ]).then(([requiredSignatures, messageId]) =>
//       messageId && Promise.all([
//         context.db
//           .update(UserRequestForSignature, {
//             messageId,
//           })
//           .set((row) => ({
//             confirmedSignatures: row.confirmedSignatures + 1n,
//             finishedSigning:
//               row.confirmedSignatures + 1n >= requiredSignatures.value,
//           })),
//         context.db.insert(SignedForUserRequest).values({
//           signatureId: ids.signature(messageHash, validatorId),
//           userRequestId: messageId,
//           blockId,
//           transactionId,
//           messageHash,
//           validatorId,
//           logIndex: event.log.logIndex,
//           orderId: orderId(context, event),
//         }),
//       ]),
//     ),
//   ])
// })

// ponder.on('HomeAMB:AffirmationCompleted', async ({ event, context }) => {
//   const transactionId = ids.transaction(context, event.transaction.hash)
//   await Promise.all([
//     upsertTransaction(context, event.block, event.transaction),
//     upsertBlock(context, event.block),
//     context.db
//       .find(UserRequestForAffirmation, {
//         messageId: event.args.messageId,
//       })
//       .then((userRequestForAffirmation) => {
//         if (!userRequestForAffirmation) {
//           console.warn('user request for affirmation not found', event.args)
//           return
//         }
//         return context.db.insert(AffirmationCompleted).values({
//           transactionId,
//           userRequestId: event.args.messageId,
//           messageHash: userRequestForAffirmation!.messageHash,
//           deliverer: event.transaction.from,
//           logIndex: event.log.logIndex,
//           orderId: orderId(context, event),
//         })
//       }),
//   ])
// })

// ponder.on('ForeignAMB:RelayedMessage', async ({ event, context }) => {
//   const transactionId = ids.transaction(context, event.transaction.hash)
//   await Promise.all([
//     upsertBlock(context, event.block),
//     upsertTransaction(context, event.block, event.transaction),
//     context.db
//       .find(UserRequestForSignature, {
//         messageId: event.args.messageId,
//       })
//       .then((userRequestForSignature) => {
//         return context.db.insert(RelayMessage).values({
//           transactionId,
//           userRequestId: event.args.messageId,
//           messageHash: userRequestForSignature!.messageHash,
//           deliverer: event.transaction.from,
//           logIndex: event.log.logIndex,
//           orderId: orderId(context, event),
//         })
//       }),
//   ])
// })
