import { onchainEnum, onchainTable, primaryKey, relations } from 'ponder'

export const Block = onchainTable('Block', (t) => ({
  chainId: t.numeric().notNull(),
  hash: t.hex().notNull(),
  number: t.bigint().notNull(),
  timestamp: t.bigint().notNull(),
  baseFeePerGas: t.bigint(),
}), (table) => ({
  pk: primaryKey({ columns: [table.chainId, table.hash] }),
}))

export const Transaction = onchainTable('Transaction', (t) => ({
  chainId: t.numeric().notNull(),
  hash: t.hex().notNull(),
  blockChainId: t.numeric().notNull(),
  blockHash: t.hex().notNull(),
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
}), (table) => ({
  pk: primaryKey({ columns: [table.chainId, table.hash] }),
}))

export const LatestValidatorStatusUpdate = onchainTable('LatestValidatorStatusUpdate', (t) => ({
  bridgeChainId: t.numeric().notNull(),
  bridgeAddress: t.hex().notNull(),
  validatorAddress: t.hex().notNull(),
  orderId: t.bigint().notNull(),
}), (table) => ({
  pk: primaryKey({ columns: [table.bridgeChainId, table.bridgeAddress, table.validatorAddress] }),
}))

export const ValidatorStatusUpdate = onchainTable('ValidatorStatusUpdate', (t) => ({
  orderId: t.bigint().primaryKey().notNull(),
  bridgeChainId: t.numeric().notNull(),
  bridgeAddress: t.hex().notNull(),
  validatorAddress: t.hex().notNull(),
  transactionChainId: t.numeric().notNull(),
  transactionHash: t.hex().notNull(),
  value: t.boolean().notNull(),
  logIndex: t.smallint().notNull(),
}))

export const Direction = onchainEnum('Direction', ['home', 'foreign'])

export const Provider = onchainEnum('Provider', ['pulsechain', 'tokensex'])

export const BridgeSide = onchainTable('BridgeSide', (t) => ({
  chainId: t.numeric().notNull(),
  address: t.hex().notNull(),
  provider: Provider().notNull(),
  side: Direction().notNull(),
}), (table) => ({
  pk: primaryKey({ columns: [table.chainId, table.address] }),
}))

export const RequiredSignaturesChanged = onchainTable('RequiredSignaturesChanged', (t) => ({
  orderId: t.bigint().primaryKey().notNull(),
  bridgeChainId: t.numeric().notNull(),
  bridgeAddress: t.hex().notNull(),
  value: t.bigint().notNull(),
  transactionChainId: t.numeric().notNull(),
  transactionHash: t.hex().notNull(),
  logIndex: t.smallint().notNull(),
}))

export const LatestRequiredSignaturesChanged = onchainTable('LatestRequiredSignaturesChanged', (t) => ({
  bridgeChainId: t.numeric().notNull(),
  bridgeAddress: t.hex().notNull(),
  orderId: t.bigint().notNull(),
}), (table) => ({
  pk: primaryKey({ columns: [table.bridgeChainId, table.bridgeAddress] }),
}))

export const LatestRequiredSignaturesChangedRelations = relations(LatestRequiredSignaturesChanged, (t) => ({
  bridge: t.one(BridgeSide, {
    fields: [LatestRequiredSignaturesChanged.bridgeChainId, LatestRequiredSignaturesChanged.bridgeAddress],
    references: [BridgeSide.chainId, BridgeSide.address],
  }),
}))

export const UserRequestForAffirmation = onchainTable('UserRequestForAffirmation', (t) => ({
  messageId: t.hex().primaryKey().notNull(),
  orderId: t.bigint().notNull(),
  blockChainId: t.numeric().notNull(),
  blockHash: t.hex().notNull(),
  transactionChainId: t.numeric().notNull(),
  transactionHash: t.hex().notNull(),
  messageHash: t.hex().notNull(),
  from: t.hex().notNull(),
  to: t.hex().notNull(),
  amount: t.bigint().notNull(),
  encodedData: t.hex().notNull(),
  logIndex: t.smallint().notNull(),
  bridgeChainId: t.numeric().notNull(),
  bridgeAddress: t.hex().notNull(),
  originationChainId: t.bigint().notNull(),
  destinationChainId: t.bigint().notNull(),
  requiredSignatureOrderId: t.bigint(),
  confirmedSignatures: t.bigint().notNull(),
  finishedSigning: t.boolean().notNull(),
  token: t.hex().notNull(),
  handlingNative: t.boolean().notNull(),
  deliveringNative: t.boolean().notNull(),
}))

export const FeeDirector = onchainTable('FeeDirector', (t) => ({
  messageId: t.hex().primaryKey(),
  recipient: t.hex().notNull(),
  settings: t.bigint().notNull(),
  limit: t.bigint().notNull(),
  multiplier: t.bigint().notNull(),
  feeType: t.text().notNull(),
  unwrapped: t.boolean().notNull(),
  excludePriority: t.boolean().notNull(),
}))

export const UserRequestForSignature = onchainTable('UserRequestForSignature', (t) => ({
  messageId: t.hex().primaryKey(),
  orderId: t.bigint().notNull(),
  blockChainId: t.numeric().notNull(),
  blockHash: t.hex().notNull(),
  transactionChainId: t.numeric().notNull(),
  transactionHash: t.hex().notNull(),
  messageHash: t.hex().notNull(),
  from: t.hex().notNull(),
  to: t.hex().notNull(),
  amount: t.bigint().notNull(),
  encodedData: t.hex().notNull(),
  logIndex: t.smallint().notNull(),
  bridgeChainId: t.numeric().notNull(),
  bridgeAddress: t.hex().notNull(),
  originationChainId: t.bigint().notNull(),
  destinationChainId: t.bigint().notNull(),
  requiredSignatureOrderId: t.bigint(),
  confirmedSignatures: t.bigint().notNull(),
  finishedSigning: t.boolean().notNull(),
  token: t.hex().notNull(),
  handlingNative: t.boolean().notNull(),
  deliveringNative: t.boolean().notNull(),
}))

export const ReverseMessageHashBinding = onchainTable('ReverseMessageHashBinding', (t) => ({
  messageHash: t.hex().notNull(),
  messageId: t.hex().notNull(),
}), (table) => ({
  pk: primaryKey({ columns: [table.messageHash] }),
}))

export const FeeDirectorRelations = relations(FeeDirector, (t) => ({
  userRequest: t.one(UserRequestForSignature, {
    fields: [FeeDirector.messageId],
    references: [UserRequestForSignature.messageId],
  }),
}))

export const SignedForAffirmation = onchainTable('SignedForAffirmation', (t) => ({
  messageHash: t.hex().notNull(),
  bridgeChainId: t.numeric().notNull(),
  bridgeAddress: t.hex().notNull(),
  validatorAddress: t.hex().notNull(),
  orderId: t.bigint().notNull(),
  blockChainId: t.numeric().notNull(),
  blockHash: t.hex().notNull(),
  transactionChainId: t.numeric().notNull(),
  transactionHash: t.hex().notNull(),
  userRequestId: t.hex().notNull(),
  logIndex: t.smallint().notNull(),
}), (table) => ({
  pk: primaryKey({ columns: [table.messageHash, table.bridgeChainId, table.bridgeAddress, table.validatorAddress] }),
}))

export const SignedForUserRequest = onchainTable('SignedForUserRequest', (t) => ({
  messageHash: t.hex().notNull(),
  bridgeChainId: t.numeric().notNull(),
  bridgeAddress: t.hex().notNull(),
  validatorAddress: t.hex().notNull(),
  orderId: t.bigint().notNull(),
  blockChainId: t.numeric().notNull(),
  blockHash: t.hex().notNull(),
  transactionChainId: t.numeric().notNull(),
  transactionHash: t.hex().notNull(),
  userRequestId: t.hex().notNull(),
  logIndex: t.smallint().notNull(),
}), (table) => ({
  pk: primaryKey({ columns: [table.messageHash, table.bridgeChainId, table.bridgeAddress, table.validatorAddress] }),
}))

export const RelayMessage = onchainTable('RelayMessage', (t) => ({
  messageHash: t.hex().primaryKey(),
  orderId: t.bigint().notNull(),
  transactionChainId: t.numeric().notNull(),
  transactionHash: t.hex().notNull(),
  userRequestId: t.hex().notNull(),
  deliverer: t.hex().notNull(),
  logIndex: t.smallint().notNull(),
}))

export const AffirmationCompleted = onchainTable('AffirmationCompleted', (t) => ({
  messageHash: t.hex().primaryKey(),
  orderId: t.bigint().notNull(),
  transactionChainId: t.numeric().notNull(),
  transactionHash: t.hex().notNull(),
  userRequestId: t.hex().notNull(),
  deliverer: t.hex().notNull(),
  logIndex: t.smallint().notNull(),
}))

export const TransactionRelations = relations(Transaction, (t) => ({
  block: t.one(Block, {
    fields: [Transaction.blockChainId, Transaction.blockHash],
    references: [Block.chainId, Block.hash],
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
    fields: [RequiredSignaturesChanged.transactionChainId, RequiredSignaturesChanged.transactionHash],
    references: [Transaction.chainId, Transaction.hash],
  }),
  bridge: t.one(BridgeSide, {
    fields: [RequiredSignaturesChanged.bridgeChainId, RequiredSignaturesChanged.bridgeAddress],
    references: [BridgeSide.chainId, BridgeSide.address],
  }),
}))

export const UserRequestForAffirmationRelations = relations(UserRequestForAffirmation, (t) => ({
  block: t.one(Block, {
    fields: [UserRequestForAffirmation.blockChainId, UserRequestForAffirmation.blockHash],
    references: [Block.chainId, Block.hash],
  }),
  transaction: t.one(Transaction, {
    fields: [UserRequestForAffirmation.transactionChainId, UserRequestForAffirmation.transactionHash],
    references: [Transaction.chainId, Transaction.hash],
  }),
  signatures: t.many(SignedForAffirmation),
  delivery: t.one(AffirmationCompleted, {
    fields: [UserRequestForAffirmation.messageHash],
    references: [AffirmationCompleted.messageHash],
  }),
  bridge: t.one(BridgeSide, {
    fields: [UserRequestForAffirmation.bridgeChainId, UserRequestForAffirmation.bridgeAddress],
    references: [BridgeSide.chainId, BridgeSide.address],
  }),
  requiredSignatures: t.one(RequiredSignaturesChanged, {
    fields: [UserRequestForAffirmation.requiredSignatureOrderId],
    references: [RequiredSignaturesChanged.orderId],
  }),
}))

export const UserRequestForSignatureRelations = relations(UserRequestForSignature, (t) => ({
  block: t.one(Block, {
    fields: [UserRequestForSignature.blockChainId, UserRequestForSignature.blockHash],
    references: [Block.chainId, Block.hash],
  }),
  transaction: t.one(Transaction, {
    fields: [UserRequestForSignature.transactionChainId, UserRequestForSignature.transactionHash],
    references: [Transaction.chainId, Transaction.hash],
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
    fields: [UserRequestForSignature.bridgeChainId, UserRequestForSignature.bridgeAddress],
    references: [BridgeSide.chainId, BridgeSide.address],
  }),
  requiredSignatures: t.one(RequiredSignaturesChanged, {
    fields: [UserRequestForSignature.requiredSignatureOrderId],
    references: [RequiredSignaturesChanged.orderId],
  }),
}))

export const SignedForUserRequestsRelations = relations(SignedForUserRequest, (t) => ({
  transaction: t.one(Transaction, {
    fields: [SignedForUserRequest.transactionChainId, SignedForUserRequest.transactionHash],
    references: [Transaction.chainId, Transaction.hash],
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
    fields: [SignedForAffirmation.transactionChainId, SignedForAffirmation.transactionHash],
    references: [Transaction.chainId, Transaction.hash],
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
    fields: [RelayMessage.transactionChainId, RelayMessage.transactionHash],
    references: [Transaction.chainId, Transaction.hash],
  }),
  userRequest: t.one(UserRequestForSignature, {
    fields: [RelayMessage.messageHash],
    references: [UserRequestForSignature.messageHash],
  }),
  signature: t.many(SignedForUserRequest),
}))

export const AffirmationCompletedRelations = relations(AffirmationCompleted, (t) => ({
  transaction: t.one(Transaction, {
    fields: [AffirmationCompleted.transactionChainId, AffirmationCompleted.transactionHash],
    references: [Transaction.chainId, Transaction.hash],
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
    fields: [ValidatorStatusUpdate.bridgeChainId, ValidatorStatusUpdate.bridgeAddress],
    references: [BridgeSide.chainId, BridgeSide.address],
  }),
  transaction: t.one(Transaction, {
    fields: [ValidatorStatusUpdate.transactionChainId, ValidatorStatusUpdate.transactionHash],
    references: [Transaction.chainId, Transaction.hash],
  }),
}))
