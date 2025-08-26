import { index, onchainEnum, onchainTable, relations } from 'ponder'

export const Block = onchainTable(
  'Block',
  (t) => ({
    blockId: t.hex().primaryKey(),
    chainId: t.numeric().notNull(),
    hash: t.hex().notNull(),
    number: t.bigint().notNull(),
    timestamp: t.bigint().notNull(),
    baseFeePerGas: t.bigint(),
  }),
  (t) => ({
    hash: index().on(t.hash),
    blockId: index().on(t.blockId),
    number: index().on(t.number),
  }),
)

export const Transaction = onchainTable(
  'Transaction',
  (t) => ({
    transactionId: t.hex().primaryKey(),
    blockId: t.hex().notNull(),
    hash: t.hex().notNull(),
    index: t.numeric().notNull(),
    from: t.hex().notNull(),
    to: t.hex().notNull(),
    value: t.bigint().notNull(),
    maxFeePerGas: t.bigint(),
    maxPriorityFeePerGas: t.bigint(),
    gas: t.bigint().notNull(),
    gasPrice: t.bigint(),
    nonce: t.bigint().notNull(),
    type: t.text().notNull(),
  }),
  (t) => ({
    hash: index().on(t.hash),
    blockId: index().on(t.blockId),
    transactionId: index().on(t.transactionId),
    from: index().on(t.from),
    to: index().on(t.to),
    type: index().on(t.type),
    nonce: index().on(t.nonce),
    value: index().on(t.value),
    maxFeePerGas: index().on(t.maxFeePerGas),
    maxPriorityFeePerGas: index().on(t.maxPriorityFeePerGas),
    gas: index().on(t.gas),
  }),
)

export const LatestValidatorStatusUpdate = onchainTable('LatestValidatorStatusUpdate', (t) => ({
  // validator id is the bridge id + validator address
  // bridge id is the chain id (number) + bridge address
  validatorId: t.hex().primaryKey().notNull(),
  orderId: t.hex().notNull(),
}))

export const ValidatorStatusUpdate = onchainTable(
  'ValidatorStatusUpdate',
  (t) => ({
    validatorId: t.hex().notNull(),
    orderId: t.hex().primaryKey().notNull(),
    transactionId: t.hex().notNull(),
    address: t.hex().notNull(),
    bridgeId: t.hex().notNull(),
    value: t.boolean().notNull(),
    logIndex: t.smallint().notNull(),
  }),
  (t) => ({
    validatorId: index().on(t.validatorId),
    bridgeId: index().on(t.bridgeId),
    transactionId: index().on(t.transactionId),
  }),
)

export const Direction = onchainEnum('Direction', ['home', 'foreign'])

export const Provider = onchainEnum('Provider', ['pulsechain', 'tokensex'])

export const BridgeSide = onchainTable(
  'BridgeSide',
  (t) => ({
    bridgeId: t.hex().primaryKey(),
    chainId: t.numeric().notNull(),
    address: t.hex().notNull(),
    provider: Provider().notNull(),
    side: Direction().notNull(),
  }),
  (t) => ({
    bridgeId: index().on(t.bridgeId),
    chainId: index().on(t.chainId),
  }),
)

export const RequiredSignaturesChanged = onchainTable(
  'RequiredSignaturesChanged',
  (t) => ({
    orderId: t.hex().primaryKey(),
    bridgeId: t.hex().notNull(),
    value: t.bigint().notNull(),
    transactionId: t.hex().notNull(),
    logIndex: t.smallint().notNull(),
  }),
  (t) => ({
    bridgeId: index().on(t.bridgeId),
    orderId: index().on(t.orderId),
    transactionId: index().on(t.transactionId),
  }),
)

export const LatestRequiredSignaturesChanged = onchainTable('LatestRequiredSignaturesChanged', (t) => ({
  bridgeId: t.hex().primaryKey(),
  orderId: t.hex().notNull(), // used as primary key for required_signatures_change table
}))

export const LatestRequiredSignaturesChangedRelations = relations(LatestRequiredSignaturesChanged, (t) => ({
  bridge: t.one(BridgeSide, {
    fields: [LatestRequiredSignaturesChanged.bridgeId],
    references: [BridgeSide.bridgeId],
  }),
}))

// user initated going from foreign chain to home chain
export const UserRequestForAffirmation = onchainTable(
  'UserRequestForAffirmation',
  (t) => ({
    blockId: t.hex().notNull(),
    orderId: t.hex().notNull(),
    transactionId: t.hex().notNull(),
    // should be unique to each bridge across all chains
    messageId: t.hex().primaryKey().notNull(),
    messageHash: t.hex().notNull(),
    from: t.hex().notNull(),
    to: t.hex().notNull(),
    amount: t.bigint().notNull(),
    encodedData: t.hex().notNull(),
    logIndex: t.smallint().notNull(),
    bridgeId: t.hex().notNull(),
    originationChainId: t.bigint().notNull(),
    destinationChainId: t.bigint().notNull(),
    requiredSignatureId: t.hex().notNull(),
    confirmedSignatures: t.bigint().notNull(),
    finishedSigning: t.boolean().notNull(),
    token: t.hex().notNull(),
    handlingNative: t.boolean().notNull(),
    deliveringNative: t.boolean().notNull(),
  }),
  (t) => ({
    messageIdIndex: index().on(t.messageId),
    messageHashIndex: index().on(t.messageHash),
    bridgeIdIndex: index().on(t.bridgeId),
    finishedSigningIndex: index().on(t.finishedSigning),
    requiredSignaturesIdIndex: index().on(t.requiredSignatureId),
  }),
)
export const FeeDirector = onchainTable(
  'FeeDirector',
  (t) => ({
    messageId: t.hex().primaryKey(),
    recipient: t.hex().notNull(),
    settings: t.bigint().notNull(),
    limit: t.bigint().notNull(),
    multiplier: t.bigint().notNull(),
    feeType: t.text().notNull(),
    unwrapped: t.boolean().notNull(),
    excludePriority: t.boolean().notNull(),
  }),
  (t) => ({
    messageIdIndex: index().on(t.messageId),
  }),
)

// user initated going from home chain to foreign chain
export const UserRequestForSignature = onchainTable(
  'UserRequestForSignature',
  (t) => ({
    // references the block and transaction that the request was made in
    blockId: t.hex().notNull(),
    transactionId: t.hex().notNull(),
    orderId: t.hex().notNull(),
    // should be unique to each bridge across all chains
    messageHash: t.hex().notNull(),
    from: t.hex().notNull(),
    to: t.hex().notNull(),
    amount: t.bigint().notNull(),
    messageId: t.hex().primaryKey(),
    encodedData: t.hex().notNull(),
    logIndex: t.smallint().notNull(),
    bridgeId: t.hex().notNull(),
    originationChainId: t.bigint().notNull(),
    destinationChainId: t.bigint().notNull(),
    requiredSignatureId: t.hex().notNull(),
    confirmedSignatures: t.bigint().notNull(),
    finishedSigning: t.boolean().notNull(),
    token: t.hex().notNull(),
    handlingNative: t.boolean().notNull(),
    deliveringNative: t.boolean().notNull(),
  }),
  (t) => ({
    messageIdIndex: index().on(t.messageId),
    messageHashIndex: index().on(t.messageHash),
    bridgeIdIndex: index().on(t.bridgeId),
    finishedSigningIndex: index().on(t.finishedSigning),
    requiredSignaturesIdIndex: index().on(t.requiredSignatureId),
  }),
)

export const ReverseMessageHashBinding = onchainTable(
  'ReverseMessageHashBinding',
  (t) => ({
    messageHash: t.hex().notNull().primaryKey(),
    messageId: t.hex().notNull(),
  }),
  (t) => ({
    messageHashIndex: index().on(t.messageHash),
    messageIdIndex: index().on(t.messageId),
  }),
)

export const FeeDirectorRelations = relations(FeeDirector, (t) => ({
  userRequest: t.one(UserRequestForSignature, {
    fields: [FeeDirector.messageId],
    references: [UserRequestForSignature.messageId],
  }),
}))

// validator initiated going from foreign chain to home chain
export const SignedForAffirmation = onchainTable(
  'SignedForAffirmation',
  (t) => ({
    // references the block and transaction that the request was made in
    blockId: t.hex().notNull(),
    transactionId: t.hex().notNull(),
    messageHash: t.hex().notNull(),
    orderId: t.hex().notNull(),
    // should be unique to each bridge across all chains
    signatureId: t.hex().primaryKey(), // message hash + validator address
    validatorId: t.hex().notNull(),
    userRequestId: t.hex().notNull(),
    logIndex: t.smallint().notNull(),
  }),
  (t) => ({
    messageHashIndex: index().on(t.messageHash),
    orderIdIndex: index().on(t.orderId),
    validatorIdIndex: index().on(t.validatorId),
  }),
)

// validator initiated going from home to foreign chain
export const SignedForUserRequest = onchainTable(
  'SignedForUserRequest',
  (t) => ({
    // references the block and transaction that the request was made in
    blockId: t.hex().notNull(),
    transactionId: t.hex().notNull(),
    messageHash: t.hex().notNull(),
    orderId: t.hex().notNull(),
    // should be unique to each bridge across all chains
    signatureId: t.hex().primaryKey(), // message hash + validator address
    validatorId: t.hex().notNull(),
    userRequestId: t.hex().notNull(),
    logIndex: t.smallint().notNull(),
  }),
  (t) => ({
    messageHashIndex: index().on(t.messageHash),
    orderIdIndex: index().on(t.orderId),
    validatorIdIndex: index().on(t.validatorId),
  }),
)

export const RelayMessage = onchainTable(
  'RelayMessage',
  (t) => ({
    messageHash: t.hex().primaryKey(),
    transactionId: t.hex().notNull(),
    orderId: t.hex().notNull(),
    // the address that delivered the tokens
    deliverer: t.hex().notNull(),
    logIndex: t.smallint().notNull(),
  }),
  (t) => ({
    messageHashIndex: index().on(t.messageHash),
  }),
)

export const AffirmationCompleted = onchainTable(
  'AffirmationCompleted',
  (t) => ({
    messageHash: t.hex().primaryKey(),
    transactionId: t.hex().notNull(),
    orderId: t.hex().notNull(),
    // the address that delivered the tokens - in this case, the final signer
    deliverer: t.hex().notNull(),
    logIndex: t.smallint().notNull(),
  }),
  (t) => ({
    messageHashIndex: index().on(t.messageHash),
  }),
)

export const TransactionRelations = relations(Transaction, (t) => ({
  block: t.one(Block, {
    fields: [Transaction.blockId],
    references: [Block.blockId],
  }),
  userRequestForSignature: t.many(UserRequestForSignature),
  userRequestForAffirmation: t.many(UserRequestForAffirmation),
  signedForUserRequest: t.many(SignedForUserRequest),
  signedForAffirmation: t.many(SignedForAffirmation),
  AffirmationCompleted: t.many(AffirmationCompleted),
  relayMessage: t.many(RelayMessage),
}))

export const RequiredSignaturesChangedRelations = relations(RequiredSignaturesChanged, (t) => ({
  transaction: t.one(Transaction, {
    fields: [RequiredSignaturesChanged.transactionId],
    references: [Transaction.transactionId],
  }),
  bridge: t.one(BridgeSide, {
    fields: [RequiredSignaturesChanged.bridgeId],
    references: [BridgeSide.bridgeId],
  }),
}))

export const UserRequestForAffirmationRelations = relations(UserRequestForAffirmation, (t) => ({
  block: t.one(Block, {
    fields: [UserRequestForAffirmation.blockId],
    references: [Block.blockId],
  }),
  transaction: t.one(Transaction, {
    fields: [UserRequestForAffirmation.transactionId],
    references: [Transaction.transactionId],
  }),
  signatures: t.many(SignedForAffirmation),
  // should happen automatically at the final signature encouter
  delivery: t.one(AffirmationCompleted, {
    fields: [UserRequestForAffirmation.messageHash],
    references: [AffirmationCompleted.messageHash],
  }),
  bridge: t.one(BridgeSide, {
    fields: [UserRequestForAffirmation.bridgeId],
    references: [BridgeSide.bridgeId],
  }),
  requiredSignatures: t.one(RequiredSignaturesChanged, {
    fields: [UserRequestForAffirmation.requiredSignatureId],
    references: [RequiredSignaturesChanged.orderId],
  }),
}))

export const UserRequestForSignatureRelations = relations(UserRequestForSignature, (t) => ({
  block: t.one(Block, {
    fields: [UserRequestForSignature.blockId],
    references: [Block.blockId],
  }),
  transaction: t.one(Transaction, {
    fields: [UserRequestForSignature.transactionId],
    references: [Transaction.transactionId],
  }),
  signatures: t.many(SignedForUserRequest),
  delivery: t.one(RelayMessage, {
    fields: [UserRequestForSignature.messageHash],
    references: [RelayMessage.messageHash],
  }),
  feeDirector: t.one(FeeDirector, {
    fields: [UserRequestForSignature.messageId],
    references: [FeeDirector.messageId],
  }),
  bridge: t.one(BridgeSide, {
    fields: [UserRequestForSignature.bridgeId],
    references: [BridgeSide.bridgeId],
  }),
  requiredSignatures: t.one(RequiredSignaturesChanged, {
    fields: [UserRequestForSignature.requiredSignatureId],
    references: [RequiredSignaturesChanged.orderId],
  }),
}))

export const SignedForUserRequestsRelations = relations(SignedForUserRequest, (t) => ({
  transaction: t.one(Transaction, {
    fields: [SignedForUserRequest.transactionId],
    references: [Transaction.transactionId],
  }),
  userRequest: t.one(UserRequestForSignature, {
    fields: [SignedForUserRequest.messageHash],
    references: [UserRequestForSignature.messageHash],
  }),
  delivery: t.one(RelayMessage, {
    fields: [SignedForUserRequest.messageHash],
    references: [RelayMessage.messageHash],
  }),
}))

export const SignedForAffirmationsRelations = relations(SignedForAffirmation, (t) => ({
  transaction: t.one(Transaction, {
    fields: [SignedForAffirmation.transactionId],
    references: [Transaction.transactionId],
  }),
  userRequest: t.one(UserRequestForAffirmation, {
    fields: [SignedForAffirmation.messageHash],
    references: [UserRequestForAffirmation.messageHash],
  }),
  delivery: t.one(AffirmationCompleted, {
    fields: [SignedForAffirmation.messageHash],
    references: [AffirmationCompleted.messageHash],
  }),
}))

export const RelayMessagesRelations = relations(RelayMessage, (t) => ({
  transaction: t.one(Transaction, {
    fields: [RelayMessage.transactionId],
    references: [Transaction.transactionId],
  }),
  userRequest: t.one(UserRequestForSignature, {
    fields: [RelayMessage.messageHash],
    references: [UserRequestForSignature.messageHash],
  }),
  signature: t.many(SignedForUserRequest),
}))

export const AffirmationCompletedRelations = relations(AffirmationCompleted, (t) => ({
  transaction: t.one(Transaction, {
    fields: [AffirmationCompleted.transactionId],
    references: [Transaction.transactionId],
  }),
  userRequest: t.one(UserRequestForAffirmation, {
    fields: [AffirmationCompleted.messageHash],
    references: [UserRequestForAffirmation.messageHash],
  }),
  signature: t.many(SignedForAffirmation),
}))

export const LatestValidatorStatusUpdateRelations = relations(LatestValidatorStatusUpdate, (t) => ({
  validatorStatusUpdate: t.one(ValidatorStatusUpdate, {
    fields: [LatestValidatorStatusUpdate.orderId],
    references: [ValidatorStatusUpdate.orderId],
  }),
}))

export const ValidatorStatusUpdateRelations = relations(ValidatorStatusUpdate, (t) => ({
  bridge: t.one(BridgeSide, {
    fields: [ValidatorStatusUpdate.bridgeId],
    references: [BridgeSide.bridgeId],
  }),
  transaction: t.one(Transaction, {
    fields: [ValidatorStatusUpdate.transactionId],
    references: [Transaction.transactionId],
  }),
}))
