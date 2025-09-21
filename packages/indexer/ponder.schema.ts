import { onchainEnum, onchainTable, primaryKey, relations } from 'ponder'

export const Direction = onchainEnum('direction', ['home', 'foreign'])

export const Provider = onchainEnum('provider', ['pulsechain', 'tokensex'])

export const UserRequestType = onchainEnum('user_request_type', ['signature', 'affirmation'])

export const AMBBridge = onchainTable('amb_bridge', (t) => ({
  chainId: t.bigint().notNull(),
  address: t.hex().notNull(),
  validatorAddress: t.hex().notNull(),
  // the administrator of the bridge (hardcoded into config)
  provider: Provider().notNull(),
  // should add fee address
  pair: t.text().notNull(),
  side: Direction().notNull(),
}), (t) => ({
  pk: primaryKey({ columns: [t.chainId, t.address] }),
}))

export const AMBBridgeRelations = relations(AMBBridge, (t) => ({
  validatorContract: t.one(ValidatorContract, {
    fields: [AMBBridge.chainId, AMBBridge.address],
    references: [ValidatorContract.chainId, ValidatorContract.address],
  }),
  bridges: t.many(Omnibridge),
}))

export const ValidatorContract = onchainTable('validator_contract', (t) => ({
  chainId: t.bigint().notNull(),
  address: t.hex().notNull(),
  latestRequiredSignaturesOrderId: t.bigint().notNull(),
}), (t) => ({
  pk: primaryKey({ columns: [t.chainId, t.address] }),
}))

export const ValidatorContractRelations = relations(ValidatorContract, (t) => ({
  validators: t.many(Validator),
  requiredSignaturesChanged: t.one(RequiredSignaturesChanged, {
    fields: [ValidatorContract.latestRequiredSignaturesOrderId],
    references: [RequiredSignaturesChanged.orderId],
  }),
  requiredSiganturesChangedEvents: t.many(RequiredSignaturesChanged),
}))

export const Omnibridge = onchainTable('omnibridge_side', (t) => ({
  chainId: t.bigint().notNull(),
  address: t.hex().notNull(),
  ambAddress: t.hex().notNull(),
}), (table) => ({
  pk: primaryKey({ columns: [table.chainId, table.address] }),
}))

export const OmnibridgeRelations = relations(Omnibridge, (t) => ({
  // requiredSignaturesChanged: t.many(RequiredSignaturesChanged),
  // validatorStatusUpdates: t.many(ValidatorStatusUpdate),
  ambBridge: t.one(AMBBridge, {
    fields: [Omnibridge.chainId, Omnibridge.address],
    references: [AMBBridge.chainId, AMBBridge.address],
  }),
  validatorContract: t.one(ValidatorContract, {
    fields: [Omnibridge.chainId, Omnibridge.address],
    references: [ValidatorContract.chainId, ValidatorContract.address],
  }),
}))

export const Validator = onchainTable('validator', (t) => ({
  // hash of the validator address, chain id, validator contract address
  validatorId: t.hex().notNull().primaryKey(),
  address: t.hex().notNull(),
  chainId: t.bigint().notNull(),
  validatorContractAddress: t.hex().notNull(),
  ambAddress: t.hex().notNull(),
  // }), (t) => ({
  //   pk: primaryKey({ columns: [t.address, t.chainId, t.validatorContractAddress] }),
}))

export const ValidatorRelations = relations(Validator, (t) => ({
  validatorStatusUpdates: t.many(ValidatorStatusUpdate),
  signatures: t.many(Signature),
  validatorContract: t.one(ValidatorContract, {
    fields: [Validator.validatorContractAddress, Validator.chainId],
    references: [ValidatorContract.address, ValidatorContract.chainId],
  }),
}))

export const Block = onchainTable('block', (t) => ({
  chainId: t.bigint().notNull(),
  hash: t.hex().notNull(),
  number: t.bigint().notNull(),
  timestamp: t.bigint().notNull(),
  baseFeePerGas: t.bigint(),
}), (table) => ({
  pk: primaryKey({ columns: [table.chainId, table.hash] }),
}))

export const BlockRelations = relations(Block, (t) => ({
  transactions: t.many(Transaction),
  userRequests: t.many(UserRequest),
  signatures: t.many(Signature),
  deliveries: t.many(Delivery),
  completions: t.many(Completion),
  requiredSignaturesChanged: t.many(RequiredSignaturesChanged),
  validatorStatusUpdates: t.many(ValidatorStatusUpdate),
}))

export const Transaction = onchainTable('transaction', (t) => ({
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

export const TransactionRelations = relations(Transaction, (t) => ({
  block: t.one(Block, {
    fields: [Transaction.chainId, Transaction.blockHash],
    references: [Block.chainId, Block.hash],
  }),
  userRequests: t.many(UserRequest),
  signatures: t.many(Signature),
  deliveries: t.many(Delivery),
  completions: t.many(Completion),
  requiredSignaturesChanged: t.many(RequiredSignaturesChanged),
  validatorStatusUpdates: t.many(ValidatorStatusUpdate),
}))

export const Token = onchainTable('token', (t) => ({
  address: t.hex().notNull(),
  chainId: t.bigint().notNull(),
  ambAddress: t.hex().notNull(),
  // global sorting mechanism
  orderId: t.bigint().notNull(),
  // for derivative tokens to use and link back to the original token
  originationChainId: t.bigint().notNull(),
  originationAmbAddress: t.hex().notNull(),
  originationAddress: t.hex().notNull(),
  originationOmnibridgeAddress: t.hex().notNull(),
  destinationOmnibridgeAddress: t.hex(),
  destinationChainId: t.bigint(),
  destinationAmbAddress: t.hex(),
  destinationAddress: t.hex(),
}), (table) => ({
  pk: primaryKey({ columns: [table.address, table.chainId, table.ambAddress] }),
}))

export const TokenRelations = relations(Token, (t) => ({
  userRequest: t.many(UserRequest),
  origination: t.one(Token, {
    fields: [Token.originationChainId, Token.originationAddress, Token.originationAmbAddress],
    references: [Token.chainId, Token.address, Token.ambAddress],
  }),
  destination: t.one(Token, {
    fields: [Token.destinationChainId, Token.destinationAddress, Token.destinationAmbAddress],
    references: [Token.chainId, Token.address, Token.ambAddress],
  }),
  // many tokens could point to this token as their origination token
  destinations: t.many(Token),
  originationOmnibridge: t.one(Omnibridge, {
    fields: [Token.originationChainId, Token.originationOmnibridgeAddress],
    references: [Omnibridge.chainId, Omnibridge.address],
  }),
  destinationOmnibridge: t.one(Omnibridge, {
    fields: [Token.destinationChainId, Token.destinationOmnibridgeAddress],
    references: [Omnibridge.chainId, Omnibridge.address],
  }),
}))

export const LatestValidatorStatusUpdate = onchainTable('latest_validator_status_update', (t) => ({
  chainId: t.bigint().notNull(),
  ambAddress: t.hex().notNull(),
  validatorId: t.hex().notNull(),
  orderId: t.bigint().notNull(),
  validatorContractAddress: t.hex().notNull(),
}), (table) => ({
  pk: primaryKey({ columns: [table.chainId, table.ambAddress, table.validatorId] }),
}))

export const LatestValidatorStatusUpdateRelations = relations(LatestValidatorStatusUpdate, (t) => ({
  validatorStatusUpdate: t.one(ValidatorStatusUpdate, {
    fields: [LatestValidatorStatusUpdate.orderId],
    references: [ValidatorStatusUpdate.orderId],
  }),
  ambBridge: t.one(AMBBridge, {
    fields: [LatestValidatorStatusUpdate.chainId, LatestValidatorStatusUpdate.ambAddress],
    references: [AMBBridge.chainId, AMBBridge.address],
  }),
  validatorContract: t.one(ValidatorContract, {
    fields: [LatestValidatorStatusUpdate.chainId, LatestValidatorStatusUpdate.validatorContractAddress],
    references: [ValidatorContract.chainId, ValidatorContract.address],
  }),
}))

export const ValidatorStatusUpdate = onchainTable('validator_status_update', (t) => ({
  orderId: t.bigint().primaryKey().notNull(),
  chainId: t.bigint().notNull(),
  ambAddress: t.hex().notNull(),
  validatorId: t.hex().notNull(),
  transactionHash: t.hex().notNull(),
  blockHash: t.hex().notNull(),
  value: t.boolean().notNull(),
  logIndex: t.smallint().notNull(),
  validatorContractAddress: t.hex().notNull(),
}))

export const ValidatorStatusUpdateRelations = relations(ValidatorStatusUpdate, (t) => ({
  bridge: t.one(Omnibridge, {
    fields: [ValidatorStatusUpdate.chainId, ValidatorStatusUpdate.ambAddress],
    references: [Omnibridge.chainId, Omnibridge.ambAddress],
  }),
  transaction: t.one(Transaction, {
    fields: [ValidatorStatusUpdate.chainId, ValidatorStatusUpdate.transactionHash],
    references: [Transaction.chainId, Transaction.hash],
  }),
  block: t.one(Block, {
    fields: [ValidatorStatusUpdate.chainId, ValidatorStatusUpdate.blockHash],
    references: [Block.chainId, Block.hash],
  }),
  validator: t.one(Validator, {
    fields: [ValidatorStatusUpdate.validatorId],
    references: [Validator.validatorId],
  }),
  validatorContract: t.one(ValidatorContract, {
    fields: [ValidatorStatusUpdate.chainId, ValidatorStatusUpdate.validatorContractAddress],
    references: [ValidatorContract.chainId, ValidatorContract.address],
  }),
}))

export const RequiredSignaturesChanged = onchainTable('required_signatures_changed', (t) => ({
  // the id of the log on the blockchain
  orderId: t.bigint().primaryKey().notNull(),
  chainId: t.bigint().notNull(),
  validatorContractAddress: t.hex().notNull(),
  value: t.bigint().notNull(),
  transactionHash: t.hex().notNull(),
  blockHash: t.hex().notNull(),
  logIndex: t.smallint().notNull(),
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
  validatorContract: t.one(ValidatorContract, {
    fields: [RequiredSignaturesChanged.chainId, RequiredSignaturesChanged.validatorContractAddress],
    references: [ValidatorContract.chainId, ValidatorContract.address],
  }),
}))

export const UserRequest = onchainTable('user_request', (t) => ({
  messageHash: t.hex().notNull().primaryKey(),
  messageId: t.hex().notNull(),
  type: UserRequestType().notNull(),
  orderId: t.bigint().notNull(),
  blockHash: t.hex().notNull(),
  chainId: t.bigint().notNull(),
  transactionHash: t.hex().notNull(),
  // parsed from encoded data - could be wrong!
  from: t.hex().notNull(),
  to: t.hex().notNull(),
  amount: t.bigint().notNull(),
  encodedData: t.hex().notNull(),
  logIndex: t.smallint().notNull(),
  // might not be set
  requiredSignatureOrderId: t.bigint(),
  confirmedSignatures: t.bigint().notNull(),
  finishedSigning: t.boolean().notNull(),
  originationChainId: t.bigint().notNull(),
  originationAmbAddress: t.hex().notNull(),
  destinationChainId: t.bigint().notNull(),
  destinationAmbAddress: t.hex().notNull(),
  // set async / only if the request is going through an omnibridge
  originationOmnibridgeAddress: t.hex(),
  destinationOmnibridgeAddress: t.hex(),
  originationTokenAddress: t.hex(),
  destinationTokenAddress: t.hex(),
  // from derived data (encoded data)
  handlingNative: t.boolean().notNull(),
  deliveringNative: t.boolean().notNull(),
  signatures: t.jsonb(),
}))

export const UserRequestRelations = relations(UserRequest, (t) => ({
  block: t.one(Block, {
    fields: [UserRequest.chainId, UserRequest.blockHash],
    references: [Block.chainId, Block.hash],
  }),
  transaction: t.one(Transaction, {
    fields: [UserRequest.chainId, UserRequest.transactionHash],
    references: [Transaction.chainId, Transaction.hash],
  }),
  signatures: t.many(Signature),
  completion: t.one(Completion, {
    fields: [UserRequest.messageHash],
    references: [Completion.messageHash],
  }),
  delivery: t.one(Delivery, {
    fields: [UserRequest.messageHash],
    references: [Delivery.messageHash],
  }),
  originationAMBBridge: t.one(AMBBridge, {
    fields: [UserRequest.chainId, UserRequest.originationAmbAddress],
    references: [AMBBridge.chainId, AMBBridge.address],
  }),
  destinationAMBBridge: t.one(AMBBridge, {
    fields: [UserRequest.chainId, UserRequest.destinationAmbAddress],
    references: [AMBBridge.chainId, AMBBridge.address],
  }),
  originationOmnibridge: t.one(Omnibridge, {
    fields: [UserRequest.chainId, UserRequest.originationAmbAddress],
    references: [Omnibridge.chainId, Omnibridge.ambAddress],
  }),
  destinationOmnibridge: t.one(Omnibridge, {
    fields: [UserRequest.chainId, UserRequest.destinationAmbAddress],
    references: [Omnibridge.chainId, Omnibridge.ambAddress],
  }),
  requiredSignatures: t.one(RequiredSignaturesChanged, {
    fields: [UserRequest.requiredSignatureOrderId],
    references: [RequiredSignaturesChanged.orderId],
  }),
  originationToken: t.one(Token, {
    fields: [UserRequest.originationTokenAddress, UserRequest.originationChainId, UserRequest.originationAmbAddress],
    references: [Token.address, Token.chainId, Token.ambAddress],
  }),
  destinationToken: t.one(Token, {
    fields: [UserRequest.destinationTokenAddress, UserRequest.destinationChainId, UserRequest.destinationAmbAddress],
    references: [Token.address, Token.chainId, Token.ambAddress],
  }),
}))

/** parsed from calldata */
export const FeeDirector = onchainTable('fee_director', (t) => ({
  messageId: t.hex().primaryKey(),
  recipient: t.hex().notNull(),
  settings: t.bigint().notNull(),
  limit: t.bigint().notNull(),
  multiplier: t.bigint().notNull(),
  feeType: t.text().notNull(),
  unwrapped: t.boolean().notNull(),
  excludePriority: t.boolean().notNull(),
}))

export const FeeDirectorRelations = relations(FeeDirector, (t) => ({
  userRequest: t.one(UserRequest, {
    fields: [FeeDirector.messageId],
    references: [UserRequest.messageId],
  }),
}))
/** allows us to get to the message (and the id) from the message hash */
export const ReverseMessageHashBinding = onchainTable('reverse_message_hash_binding', (t) => ({
  messageId: t.hex().notNull().primaryKey(),
  messageHash: t.hex().notNull(),
}))

export const ReverseMessageHashBindingRelations = relations(ReverseMessageHashBinding, (t) => ({
  userRequest: t.one(UserRequest, {
    fields: [ReverseMessageHashBinding.messageHash],
    references: [UserRequest.messageHash],
  }),
}))

export const Signature = onchainTable('signature', (t) => ({
  messageHash: t.hex().notNull(),
  ambAddress: t.hex().notNull(),
  validatorId: t.hex().notNull(),
  orderId: t.bigint().notNull(),
  blockHash: t.hex().notNull(),
  chainId: t.bigint().notNull(),
  transactionHash: t.hex().notNull(),
  logIndex: t.smallint().notNull(),
}), (table) => ({
  pk: primaryKey({ columns: [table.messageHash, table.chainId, table.validatorId] }),
}))

export const SignatureRelations = relations(Signature, (t) => ({
  block: t.one(Block, {
    fields: [Signature.chainId, Signature.blockHash],
    references: [Block.chainId, Block.hash],
  }),
  transaction: t.one(Transaction, {
    fields: [Signature.chainId, Signature.transactionHash],
    references: [Transaction.chainId, Transaction.hash],
  }),
  validator: t.one(Validator, {
    fields: [Signature.validatorId],
    references: [Validator.validatorId],
  }),
  userRequest: t.one(UserRequest, {
    fields: [Signature.messageHash],
    references: [UserRequest.messageHash],
  }),
  ambBridge: t.one(AMBBridge, {
    fields: [Signature.chainId, Signature.ambAddress],
    references: [AMBBridge.chainId, AMBBridge.address],
  }),
  completion: t.one(Completion, {
    fields: [Signature.messageHash],
    references: [Completion.messageHash],
  }),
}))
/** when the bridge is completed - tokens are not necessarily delivered yet */
export const Completion = onchainTable('completion', (t) => ({
  messageHash: t.hex().primaryKey(),
  orderId: t.bigint().notNull(),
  chainId: t.bigint().notNull(),
  transactionHash: t.hex().notNull(),
  blockHash: t.hex().notNull(),
  originationAmbAddress: t.hex().notNull(),
  destinationAmbAddress: t.hex().notNull(),
  originationChainId: t.bigint().notNull(),
  destinationChainId: t.bigint().notNull(),
}))

export const CompletionRelations = relations(Completion, (t) => ({
  userRequest: t.one(UserRequest, {
    fields: [Completion.messageHash],
    references: [UserRequest.messageHash],
  }),
  delivery: t.one(Delivery, {
    fields: [Completion.messageHash],
    references: [Delivery.messageHash],
  }),
  transaction: t.one(Transaction, {
    fields: [Completion.chainId, Completion.transactionHash],
    references: [Transaction.chainId, Transaction.hash],
  }),
  block: t.one(Block, {
    fields: [Completion.chainId, Completion.blockHash],
    references: [Block.chainId, Block.hash],
  }),
  originationAMBBridge: t.one(AMBBridge, {
    fields: [Completion.chainId, Completion.originationAmbAddress],
    references: [AMBBridge.chainId, AMBBridge.address],
  }),
  destinationAMBBridge: t.one(AMBBridge, {
    fields: [Completion.chainId, Completion.destinationAmbAddress],
    references: [AMBBridge.chainId, AMBBridge.address],
  }),
}))

/** validators' job is complete, now what happens to the tokens?
 * this is using omnibridge, not amb, but we can still link to it
 */
export const Delivery = onchainTable('delivery', (t) => ({
  messageHash: t.hex().primaryKey(),
  orderId: t.bigint().notNull(),
  chainId: t.bigint().notNull(),
  transactionHash: t.hex().notNull(),
  blockHash: t.hex().notNull(),
  userRequestHash: t.hex().notNull(),
  deliverer: t.hex().notNull(),
  logIndex: t.smallint().notNull(),
  // amb entries
  originationAmbAddress: t.hex(),
  destinationAmbAddress: t.hex(),
  originationChainId: t.bigint(),
  destinationChainId: t.bigint(),
  // links to the token entries
  originationOmnibridgeAddress: t.hex(),
  destinationOmnibridgeAddress: t.hex(),
  originationTokenAddress: t.hex(),
  destinationTokenAddress: t.hex(),
}))

export const DeliveryRelations = relations(Delivery, (t) => ({
  transaction: t.one(Transaction, {
    fields: [Delivery.chainId, Delivery.transactionHash],
    references: [Transaction.chainId, Transaction.hash],
  }),
  block: t.one(Block, {
    fields: [Delivery.chainId, Delivery.blockHash],
    references: [Block.chainId, Block.hash],
  }),
  userRequest: t.one(UserRequest, {
    fields: [Delivery.messageHash],
    references: [UserRequest.messageHash],
  }),
  completion: t.one(Completion, {
    fields: [Delivery.messageHash],
    references: [Completion.messageHash],
  }),
  originationAMBBridge: t.one(AMBBridge, {
    fields: [Delivery.chainId, Delivery.originationAmbAddress],
    references: [AMBBridge.chainId, AMBBridge.address],
  }),
  destinationAMBBridge: t.one(AMBBridge, {
    fields: [Delivery.chainId, Delivery.destinationAmbAddress],
    references: [AMBBridge.chainId, AMBBridge.address],
  }),
  originationOmnibridge: t.one(Omnibridge, {
    fields: [Delivery.chainId, Delivery.originationOmnibridgeAddress],
    references: [Omnibridge.chainId, Omnibridge.address],
  }),
  destinationOmnibridge: t.one(Omnibridge, {
    fields: [Delivery.chainId, Delivery.destinationOmnibridgeAddress],
    references: [Omnibridge.chainId, Omnibridge.address],
  }),
  originationToken: t.one(Token, {
    fields: [Delivery.originationTokenAddress, Delivery.originationChainId, Delivery.originationAmbAddress],
    references: [Token.address, Token.chainId, Token.ambAddress],
  }),
  destinationToken: t.one(Token, {
    fields: [Delivery.destinationTokenAddress, Delivery.destinationChainId, Delivery.destinationAmbAddress],
    references: [Token.address, Token.chainId, Token.ambAddress],
  }),
}))
