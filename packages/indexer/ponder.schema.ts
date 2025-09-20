import { index, onchainEnum, onchainTable, primaryKey, relations, uniqueIndex } from 'ponder'

export const Block = onchainTable('Block', (t) => ({
  chainId: t.bigint().notNull(),
  hash: t.hex().notNull(),
  number: t.bigint().notNull(),
  timestamp: t.bigint().notNull(),
  baseFeePerGas: t.bigint(),
}), (table) => ({
  pk: primaryKey({ columns: [table.chainId, table.hash] }),
}))

export const Transaction = onchainTable('Transaction', (t) => ({
  chainId: t.bigint().notNull(),
  hash: t.hex().notNull(),
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

export const Token = onchainTable('Token', (t) => ({
  address: t.hex().notNull(),
  chainId: t.bigint().notNull(),
  ambAddress: t.hex().notNull(),
  // global sorting mechanism
  orderId: t.bigint().notNull(),
  // for derivative tokens to use and link back to the original token
  originationChainId: t.bigint(),
  originationAddress: t.hex(),
  originationAmbAddress: t.hex(),
  destinationChainId: t.bigint(),
  destinationAddress: t.hex(),
  destinationAmbAddress: t.hex(),
  // metadata
  // symbol: t.text().notNull(),
  // name: t.text().notNull(),
  // decimals: t.bigint().notNull(),
}), (table) => ({
  pk: primaryKey({ columns: [table.address, table.chainId, table.ambAddress] }),
  // originationKey: index().on(table.originationChainId, table.originationAddress),
}))

export const TokenRelations = relations(Token, (t) => ({
  derivatives: t.many(Token),
  origination: t.one(Token, {
    fields: [Token.originationChainId, Token.originationAddress, Token.originationAmbAddress],
    references: [Token.chainId, Token.address, Token.ambAddress],
  }),
  destination: t.one(Token, {
    fields: [Token.destinationChainId, Token.destinationAddress, Token.destinationAmbAddress],
    references: [Token.chainId, Token.address, Token.ambAddress],
  }),
  userRequestForSignatures: t.many(UserRequestForSignature),
  userRequestForAffirmations: t.many(UserRequestForAffirmation),
}))

export const internalTokenReverseLookup = onchainTable('internalTokenReverseLookup', (t) => ({
  address: t.hex().notNull(),
  chainId: t.bigint().notNull(),
  omnibridgeAddress: t.hex().notNull(),
  destinationChainId: t.bigint().notNull(),
  destinationAddress: t.hex().notNull(),
}), (table) => ({
  pk: primaryKey({ columns: [table.address, table.chainId, table.omnibridgeAddress] }),
}))

export const internalTokenReverseLookupRelations = relations(internalTokenReverseLookup, (t) => ({
  destination: t.one(Token, {
    fields: [internalTokenReverseLookup.destinationChainId, internalTokenReverseLookup.destinationAddress],
    references: [Token.chainId, Token.address],
  }),
}))

export const LatestValidatorStatusUpdate = onchainTable('LatestValidatorStatusUpdate', (t) => ({
  chainId: t.bigint().notNull(),
  bridgeAddress: t.hex().notNull(),
  validatorAddress: t.hex().notNull(),
  orderId: t.bigint().notNull(),
}), (table) => ({
  pk: primaryKey({ columns: [table.chainId, table.bridgeAddress, table.validatorAddress] }),
}))

export const ValidatorStatusUpdate = onchainTable('ValidatorStatusUpdate', (t) => ({
  orderId: t.bigint().primaryKey().notNull(),
  chainId: t.bigint().notNull(),
  bridgeAddress: t.hex().notNull(),
  validatorAddress: t.hex().notNull(),
  transactionHash: t.hex().notNull(),
  blockHash: t.hex().notNull(),
  value: t.boolean().notNull(),
  logIndex: t.smallint().notNull(),
}))

export const Direction = onchainEnum('Direction', ['home', 'foreign'])

export const Provider = onchainEnum('Provider', ['pulsechain', 'tokensex'])

export const BridgeSide = onchainTable('BridgeSide', (t) => ({
  chainId: t.bigint().notNull(),
  address: t.hex().notNull(),
  provider: Provider().notNull(),
  pair: t.text().notNull(),
  side: Direction().notNull(),
}), (table) => ({
  pk: primaryKey({ columns: [table.chainId, table.address] }),
}))

export const RequiredSignaturesChanged = onchainTable('RequiredSignaturesChanged', (t) => ({
  orderId: t.bigint().primaryKey().notNull(),
  chainId: t.bigint().notNull(),
  bridgeAddress: t.hex().notNull(),
  value: t.bigint().notNull(),
  transactionHash: t.hex().notNull(),
  blockHash: t.hex().notNull(),
  logIndex: t.smallint().notNull(),
}))

export const LatestRequiredSignaturesChanged = onchainTable('LatestRequiredSignaturesChanged', (t) => ({
  chainId: t.bigint().notNull(),
  bridgeAddress: t.hex().notNull(),
  orderId: t.bigint().notNull(),
}), (table) => ({
  pk: primaryKey({ columns: [table.chainId, table.bridgeAddress] }),
}))

export const LatestRequiredSignaturesChangedRelations = relations(LatestRequiredSignaturesChanged, (t) => ({
  bridge: t.one(BridgeSide, {
    fields: [LatestRequiredSignaturesChanged.chainId, LatestRequiredSignaturesChanged.bridgeAddress],
    references: [BridgeSide.chainId, BridgeSide.address],
  }),
}))

export const UserRequestForAffirmation = onchainTable('UserRequestForAffirmation', (t) => ({
  messageId: t.hex().primaryKey().notNull(),
  orderId: t.bigint().notNull(),
  blockHash: t.hex().notNull(),
  chainId: t.bigint().notNull(),
  transactionHash: t.hex().notNull(),
  messageHash: t.hex().notNull(),
  from: t.hex().notNull(),
  to: t.hex().notNull(),
  amount: t.bigint().notNull(),
  encodedData: t.hex().notNull(),
  logIndex: t.smallint().notNull(),
  bridgeAddress: t.hex().notNull(),
  originationTokenChainId: t.bigint().notNull(),
  originationTokenAddress: t.hex(), // set async
  originationTokenAmbAddress: t.hex().notNull(),
  destinationTokenChainId: t.bigint().notNull(),
  destinationTokenAddress: t.hex(),
  destinationTokenAmbAddress: t.hex().notNull(),
  requiredSignatureOrderId: t.bigint(),
  confirmedSignatures: t.bigint().notNull(),
  finishedSigning: t.boolean().notNull(),
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
  blockHash: t.hex().notNull(),
  chainId: t.bigint().notNull(),
  transactionHash: t.hex().notNull(),
  messageHash: t.hex().notNull(),
  from: t.hex().notNull(),
  to: t.hex().notNull(),
  amount: t.bigint().notNull(),
  encodedData: t.hex().notNull(),
  logIndex: t.smallint().notNull(),
  bridgeAddress: t.hex().notNull(),
  originationTokenChainId: t.bigint().notNull(),
  originationTokenAddress: t.hex(),
  originationTokenAmbAddress: t.hex().notNull(),
  destinationTokenChainId: t.bigint().notNull(),
  destinationTokenAddress: t.hex(),
  destinationTokenAmbAddress: t.hex().notNull(),
  requiredSignatureOrderId: t.bigint(),
  confirmedSignatures: t.bigint().notNull(),
  finishedSigning: t.boolean().notNull(),
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
  bridgeAddress: t.hex().notNull(),
  validatorAddress: t.hex().notNull(),
  orderId: t.bigint().notNull(),
  blockHash: t.hex().notNull(),
  chainId: t.bigint().notNull(),
  transactionHash: t.hex().notNull(),
  userRequestId: t.hex().notNull(),
  logIndex: t.smallint().notNull(),
}), (table) => ({
  pk: primaryKey({ columns: [table.messageHash, table.chainId, table.bridgeAddress, table.validatorAddress] }),
}))

export const SignedForAffirmationRelations = relations(SignedForAffirmation, (t) => ({
  transaction: t.one(Transaction, {
    fields: [SignedForAffirmation.chainId, SignedForAffirmation.transactionHash],
    references: [Transaction.chainId, Transaction.hash],
  }),
  block: t.one(Block, {
    fields: [SignedForAffirmation.chainId, SignedForAffirmation.blockHash],
    references: [Block.chainId, Block.hash],
  }),
  userRequest: t.one(UserRequestForAffirmation, {
    fields: [SignedForAffirmation.messageHash],
    references: [UserRequestForAffirmation.messageHash],
  }),
  bridge: t.one(BridgeSide, {
    fields: [SignedForAffirmation.chainId, SignedForAffirmation.bridgeAddress],
    references: [BridgeSide.chainId, BridgeSide.address],
  }),
  completion: t.one(AffirmationCompleted, {
    fields: [SignedForAffirmation.messageHash],
    references: [AffirmationCompleted.messageHash],
  }),
  delivery: t.one(AffirmationCompleted, {
    fields: [SignedForAffirmation.messageHash],
    references: [AffirmationCompleted.messageHash],
  }),
}))

export const SignedForUserRequest = onchainTable('SignedForUserRequest', (t) => ({
  messageHash: t.hex().notNull(),
  bridgeAddress: t.hex().notNull(),
  validatorAddress: t.hex().notNull(),
  orderId: t.bigint().notNull(),
  blockHash: t.hex().notNull(),
  chainId: t.bigint().notNull(),
  transactionHash: t.hex().notNull(),
  userRequestId: t.hex().notNull(),
  logIndex: t.smallint().notNull(),
}), (table) => ({
  pk: primaryKey({ columns: [table.messageHash, table.chainId, table.bridgeAddress, table.validatorAddress] }),
}))

export const RelayedMessage = onchainTable('RelayedMessage', (t) => ({
  messageHash: t.hex().primaryKey(),
  orderId: t.bigint().notNull(),
  chainId: t.bigint().notNull(),
  transactionHash: t.hex().notNull(),
  blockHash: t.hex().notNull(),
  userRequestId: t.hex().notNull(),
  deliverer: t.hex().notNull(),
  logIndex: t.smallint().notNull(),
  originationTokenAddress: t.hex(),
  originationTokenChainId: t.bigint(),
  originationTokenAmbAddress: t.hex(),
  destinationTokenAddress: t.hex(),
  destinationTokenChainId: t.bigint(),
  destinationTokenAmbAddress: t.hex(),
}))

export const AffirmationCompleted = onchainTable('AffirmationCompleted', (t) => ({
  messageHash: t.hex().primaryKey(),
  orderId: t.bigint().notNull(),
  chainId: t.bigint().notNull(),
  transactionHash: t.hex().notNull(),
  blockHash: t.hex().notNull(),
  userRequestId: t.hex().notNull(),
  deliverer: t.hex().notNull(),
  logIndex: t.smallint().notNull(),
  originationTokenChainId: t.bigint(),
  originationTokenAddress: t.hex(),
  originationTokenAmbAddress: t.hex(),
  destinationTokenAddress: t.hex(),
  destinationTokenChainId: t.bigint(),
  destinationTokenAmbAddress: t.hex(),
}))

// export const CollectedSignatures = onchainTable('CollectedSignatures', (t) => ({
//   messageHash: t.hex().primaryKey(),
//   orderId: t.bigint().notNull(),
//   chainId: t.bigint().notNull(),
//   transactionHash: t.hex().notNull(),
//   blockHash: t.hex().notNull(),
//   userRequestId: t.hex().notNull(),
//   logIndex: t.smallint().notNull(),
//   originationTokenChainId: t.bigint().notNull(),
//   originationTokenAddress: t.hex().notNull(),
//   originationTokenAmbAddress: t.hex().notNull(),
//   destinationTokenAddress: t.hex().notNull(),
//   destinationTokenAmbAddress: t.hex().notNull(),
//   destinationTokenChainId: t.bigint().notNull(),
// }))

// export const CollectedSignaturesRelations = relations(CollectedSignatures, (t) => ({
//   transaction: t.one(Transaction, {
//     fields: [CollectedSignatures.chainId, CollectedSignatures.transactionHash],
//     references: [Transaction.chainId, Transaction.hash],
//   }),
//   block: t.one(Block, {
//     fields: [CollectedSignatures.chainId, CollectedSignatures.blockHash],
//     references: [Block.chainId, Block.hash],
//   }),
//   userRequest: t.one(UserRequestForSignature, {
//     fields: [CollectedSignatures.messageHash],
//     references: [UserRequestForSignature.messageHash],
//   }),
//   // signature: t.many(SignedForAffirmation),
//   originationToken: t.one(Token, {
//     fields: [CollectedSignatures.originationTokenAddress, CollectedSignatures.originationTokenChainId, CollectedSignatures.originationTokenAmbAddress],
//     references: [Token.address, Token.chainId, Token.ambAddress],
//   }),
//   destinationToken: t.one(Token, {
//     fields: [CollectedSignatures.destinationTokenAddress, CollectedSignatures.destinationTokenChainId, CollectedSignatures.destinationTokenAmbAddress],
//     references: [Token.address, Token.chainId, Token.ambAddress],
//   }),
// }))

export const TransactionRelations = relations(Transaction, (t) => ({
  block: t.one(Block, {
    fields: [Transaction.chainId, Transaction.blockHash],
    references: [Block.chainId, Block.hash],
  }),
  userRequestForSignature: t.many(UserRequestForSignature),
  userRequestForAffirmation: t.many(UserRequestForAffirmation),
  signedForUserRequest: t.many(SignedForUserRequest),
  signedForAffirmation: t.many(SignedForAffirmation),
  AffirmationCompleted: t.many(AffirmationCompleted),
  relayedMessage: t.many(RelayedMessage),
}))

export const RequiredSignaturesChangedRelations = relations(RequiredSignaturesChanged, (t) => ({
  transaction: t.one(Transaction, {
    fields: [RequiredSignaturesChanged.chainId, RequiredSignaturesChanged.transactionHash],
    references: [Transaction.chainId, Transaction.hash],
  }),
  block: t.one(Block, {
    fields: [RequiredSignaturesChanged.chainId, RequiredSignaturesChanged.blockHash],
    references: [Block.chainId, Block.hash],
  }),
  bridge: t.one(BridgeSide, {
    fields: [RequiredSignaturesChanged.chainId, RequiredSignaturesChanged.bridgeAddress],
    references: [BridgeSide.chainId, BridgeSide.address],
  }),
}))

export const UserRequestForAffirmationRelations = relations(UserRequestForAffirmation, (t) => ({
  block: t.one(Block, {
    fields: [UserRequestForAffirmation.chainId, UserRequestForAffirmation.blockHash],
    references: [Block.chainId, Block.hash],
  }),
  transaction: t.one(Transaction, {
    fields: [UserRequestForAffirmation.chainId, UserRequestForAffirmation.transactionHash],
    references: [Transaction.chainId, Transaction.hash],
  }),
  signatures: t.many(SignedForAffirmation),
  delivery: t.one(AffirmationCompleted, {
    fields: [UserRequestForAffirmation.messageHash],
    references: [AffirmationCompleted.messageHash],
  }),
  bridge: t.one(BridgeSide, {
    fields: [UserRequestForAffirmation.chainId, UserRequestForAffirmation.bridgeAddress],
    references: [BridgeSide.chainId, BridgeSide.address],
  }),
  requiredSignatures: t.one(RequiredSignaturesChanged, {
    fields: [UserRequestForAffirmation.requiredSignatureOrderId],
    references: [RequiredSignaturesChanged.orderId],
  }),
  originationToken: t.one(Token, {
    fields: [UserRequestForAffirmation.originationTokenAddress, UserRequestForAffirmation.originationTokenChainId, UserRequestForAffirmation.originationTokenAmbAddress],
    references: [Token.address, Token.chainId, Token.ambAddress],
  }),
  destinationToken: t.one(Token, {
    fields: [UserRequestForAffirmation.destinationTokenAddress, UserRequestForAffirmation.destinationTokenChainId, UserRequestForAffirmation.destinationTokenAmbAddress],
    references: [Token.address, Token.chainId, Token.ambAddress],
  }),
}))

export const UserRequestForSignatureRelations = relations(UserRequestForSignature, (t) => ({
  block: t.one(Block, {
    fields: [UserRequestForSignature.chainId, UserRequestForSignature.blockHash],
    references: [Block.chainId, Block.hash],
  }),
  transaction: t.one(Transaction, {
    fields: [UserRequestForSignature.chainId, UserRequestForSignature.transactionHash],
    references: [Transaction.chainId, Transaction.hash],
  }),
  signatures: t.many(SignedForUserRequest),
  delivery: t.one(RelayedMessage, {
    fields: [UserRequestForSignature.messageHash],
    references: [RelayedMessage.messageHash],
  }),
  feeDirector: t.one(FeeDirector, {
    fields: [UserRequestForSignature.messageId],
    references: [FeeDirector.messageId],
  }),
  bridge: t.one(BridgeSide, {
    fields: [UserRequestForSignature.chainId, UserRequestForSignature.bridgeAddress],
    references: [BridgeSide.chainId, BridgeSide.address],
  }),
  requiredSignatures: t.one(RequiredSignaturesChanged, {
    fields: [UserRequestForSignature.requiredSignatureOrderId],
    references: [RequiredSignaturesChanged.orderId],
  }),
  originationToken: t.one(Token, {
    fields: [UserRequestForSignature.originationTokenAddress, UserRequestForSignature.originationTokenChainId, UserRequestForSignature.originationTokenAmbAddress],
    references: [Token.address, Token.chainId, Token.ambAddress],
  }),
  destinationToken: t.one(Token, {
    fields: [UserRequestForSignature.destinationTokenAddress, UserRequestForSignature.destinationTokenChainId, UserRequestForSignature.destinationTokenAmbAddress],
    references: [Token.address, Token.chainId, Token.ambAddress],
  }),
}))

export const SignedForUserRequestsRelations = relations(SignedForUserRequest, (t) => ({
  transaction: t.one(Transaction, {
    fields: [SignedForUserRequest.chainId, SignedForUserRequest.transactionHash],
    references: [Transaction.chainId, Transaction.hash],
  }),
  block: t.one(Block, {
    fields: [SignedForUserRequest.chainId, SignedForUserRequest.blockHash],
    references: [Block.chainId, Block.hash],
  }),
  userRequest: t.one(UserRequestForSignature, {
    fields: [SignedForUserRequest.messageHash],
    references: [UserRequestForSignature.messageHash],
  }),
  delivery: t.one(RelayedMessage, {
    fields: [SignedForUserRequest.messageHash],
    references: [RelayedMessage.messageHash],
  }),
}))

export const SignedForAffirmationsRelations = relations(SignedForAffirmation, (t) => ({
  transaction: t.one(Transaction, {
    fields: [SignedForAffirmation.chainId, SignedForAffirmation.transactionHash],
    references: [Transaction.chainId, Transaction.hash],
  }),
  block: t.one(Block, {
    fields: [SignedForAffirmation.chainId, SignedForAffirmation.blockHash],
    references: [Block.chainId, Block.hash],
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

export const RelayedMessagesRelations = relations(RelayedMessage, (t) => ({
  transaction: t.one(Transaction, {
    fields: [RelayedMessage.chainId, RelayedMessage.transactionHash],
    references: [Transaction.chainId, Transaction.hash],
  }),
  block: t.one(Block, {
    fields: [RelayedMessage.chainId, RelayedMessage.blockHash],
    references: [Block.chainId, Block.hash],
  }),
  userRequest: t.one(UserRequestForSignature, {
    fields: [RelayedMessage.messageHash],
    references: [UserRequestForSignature.messageHash],
  }),
  signature: t.many(SignedForUserRequest),
  originationToken: t.one(Token, {
    fields: [RelayedMessage.originationTokenAddress, RelayedMessage.originationTokenChainId, RelayedMessage.originationTokenAmbAddress],
    references: [Token.address, Token.chainId, Token.ambAddress],
  }),
  destinationToken: t.one(Token, {
    fields: [RelayedMessage.destinationTokenAddress, RelayedMessage.destinationTokenChainId, RelayedMessage.destinationTokenAmbAddress],
    references: [Token.address, Token.chainId, Token.ambAddress],
  }),
}))

export const AffirmationCompletedRelations = relations(AffirmationCompleted, (t) => ({
  transaction: t.one(Transaction, {
    fields: [AffirmationCompleted.chainId, AffirmationCompleted.transactionHash],
    references: [Transaction.chainId, Transaction.hash],
  }),
  block: t.one(Block, {
    fields: [AffirmationCompleted.chainId, AffirmationCompleted.blockHash],
    references: [Block.chainId, Block.hash],
  }),
  userRequest: t.one(UserRequestForAffirmation, {
    fields: [AffirmationCompleted.messageHash],
    references: [UserRequestForAffirmation.messageHash],
  }),
  signature: t.many(SignedForAffirmation),
  originationToken: t.one(Token, {
    fields: [AffirmationCompleted.originationTokenAddress, AffirmationCompleted.originationTokenChainId, AffirmationCompleted.originationTokenAmbAddress],
    references: [Token.address, Token.chainId, Token.ambAddress],
  }),
  destinationToken: t.one(Token, {
    fields: [AffirmationCompleted.destinationTokenAddress, AffirmationCompleted.destinationTokenChainId, AffirmationCompleted.destinationTokenAmbAddress],
    references: [Token.address, Token.chainId, Token.ambAddress],
  }),
}))

export const LatestValidatorStatusUpdateRelations = relations(LatestValidatorStatusUpdate, (t) => ({
  validatorStatusUpdate: t.one(ValidatorStatusUpdate, {
    fields: [LatestValidatorStatusUpdate.orderId],
    references: [ValidatorStatusUpdate.orderId],
  }),
}))

export const ValidatorStatusUpdateRelations = relations(ValidatorStatusUpdate, (t) => ({
  bridge: t.one(BridgeSide, {
    fields: [ValidatorStatusUpdate.chainId, ValidatorStatusUpdate.bridgeAddress],
    references: [BridgeSide.chainId, BridgeSide.address],
  }),
  transaction: t.one(Transaction, {
    fields: [ValidatorStatusUpdate.chainId, ValidatorStatusUpdate.transactionHash],
    references: [Transaction.chainId, Transaction.hash],
  }),
  block: t.one(Block, {
    fields: [ValidatorStatusUpdate.chainId, ValidatorStatusUpdate.blockHash],
    references: [Block.chainId, Block.hash],
  }),
}))
