/* eslint-disable */
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> }
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> }
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = {
  [_ in K]?: never
}
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never }
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string }
  String: { input: string; output: string }
  Boolean: { input: boolean; output: boolean }
  Int: { input: number; output: number }
  Float: { input: number; output: number }
  BigInt: { input: any; output: any }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any }
}

export type AffirmationComplete = {
  __typename?: 'AffirmationComplete'
  deliverer: Scalars['String']['output']
  logIndex: Scalars['Float']['output']
  messageHash: Scalars['String']['output']
  orderId: Scalars['String']['output']
  signature?: Maybe<SignedForAffirmationPage>
  transaction?: Maybe<Transaction>
  transactionId: Scalars['String']['output']
  userRequest?: Maybe<UserRequestForAffirmation>
}

export type AffirmationCompleteSignatureArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  before?: InputMaybe<Scalars['String']['input']>
  limit?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<Scalars['String']['input']>
  orderDirection?: InputMaybe<Scalars['String']['input']>
  where?: InputMaybe<SignedForAffirmationFilter>
}

export type AffirmationCompleteFilter = {
  AND?: InputMaybe<Array<InputMaybe<AffirmationCompleteFilter>>>
  OR?: InputMaybe<Array<InputMaybe<AffirmationCompleteFilter>>>
  deliverer?: InputMaybe<Scalars['String']['input']>
  deliverer_contains?: InputMaybe<Scalars['String']['input']>
  deliverer_ends_with?: InputMaybe<Scalars['String']['input']>
  deliverer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  deliverer_not?: InputMaybe<Scalars['String']['input']>
  deliverer_not_contains?: InputMaybe<Scalars['String']['input']>
  deliverer_not_ends_with?: InputMaybe<Scalars['String']['input']>
  deliverer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  deliverer_not_starts_with?: InputMaybe<Scalars['String']['input']>
  deliverer_starts_with?: InputMaybe<Scalars['String']['input']>
  logIndex?: InputMaybe<Scalars['Float']['input']>
  logIndex_gt?: InputMaybe<Scalars['Float']['input']>
  logIndex_gte?: InputMaybe<Scalars['Float']['input']>
  logIndex_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>
  logIndex_lt?: InputMaybe<Scalars['Float']['input']>
  logIndex_lte?: InputMaybe<Scalars['Float']['input']>
  logIndex_not?: InputMaybe<Scalars['Float']['input']>
  logIndex_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>
  messageHash?: InputMaybe<Scalars['String']['input']>
  messageHash_contains?: InputMaybe<Scalars['String']['input']>
  messageHash_ends_with?: InputMaybe<Scalars['String']['input']>
  messageHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  messageHash_not?: InputMaybe<Scalars['String']['input']>
  messageHash_not_contains?: InputMaybe<Scalars['String']['input']>
  messageHash_not_ends_with?: InputMaybe<Scalars['String']['input']>
  messageHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  messageHash_not_starts_with?: InputMaybe<Scalars['String']['input']>
  messageHash_starts_with?: InputMaybe<Scalars['String']['input']>
  orderId?: InputMaybe<Scalars['String']['input']>
  orderId_contains?: InputMaybe<Scalars['String']['input']>
  orderId_ends_with?: InputMaybe<Scalars['String']['input']>
  orderId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  orderId_not?: InputMaybe<Scalars['String']['input']>
  orderId_not_contains?: InputMaybe<Scalars['String']['input']>
  orderId_not_ends_with?: InputMaybe<Scalars['String']['input']>
  orderId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  orderId_not_starts_with?: InputMaybe<Scalars['String']['input']>
  orderId_starts_with?: InputMaybe<Scalars['String']['input']>
  transactionId?: InputMaybe<Scalars['String']['input']>
  transactionId_contains?: InputMaybe<Scalars['String']['input']>
  transactionId_ends_with?: InputMaybe<Scalars['String']['input']>
  transactionId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  transactionId_not?: InputMaybe<Scalars['String']['input']>
  transactionId_not_contains?: InputMaybe<Scalars['String']['input']>
  transactionId_not_ends_with?: InputMaybe<Scalars['String']['input']>
  transactionId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  transactionId_not_starts_with?: InputMaybe<Scalars['String']['input']>
  transactionId_starts_with?: InputMaybe<Scalars['String']['input']>
}

export type AffirmationCompletePage = {
  __typename?: 'AffirmationCompletePage'
  items: Array<AffirmationComplete>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type Block = {
  __typename?: 'Block'
  baseFeePerGas?: Maybe<Scalars['BigInt']['output']>
  blockId: Scalars['String']['output']
  chainId: Scalars['String']['output']
  hash: Scalars['String']['output']
  number: Scalars['BigInt']['output']
  timestamp: Scalars['BigInt']['output']
}

export type BlockFilter = {
  AND?: InputMaybe<Array<InputMaybe<BlockFilter>>>
  OR?: InputMaybe<Array<InputMaybe<BlockFilter>>>
  baseFeePerGas?: InputMaybe<Scalars['BigInt']['input']>
  baseFeePerGas_gt?: InputMaybe<Scalars['BigInt']['input']>
  baseFeePerGas_gte?: InputMaybe<Scalars['BigInt']['input']>
  baseFeePerGas_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  baseFeePerGas_lt?: InputMaybe<Scalars['BigInt']['input']>
  baseFeePerGas_lte?: InputMaybe<Scalars['BigInt']['input']>
  baseFeePerGas_not?: InputMaybe<Scalars['BigInt']['input']>
  baseFeePerGas_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  blockId?: InputMaybe<Scalars['String']['input']>
  blockId_contains?: InputMaybe<Scalars['String']['input']>
  blockId_ends_with?: InputMaybe<Scalars['String']['input']>
  blockId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  blockId_not?: InputMaybe<Scalars['String']['input']>
  blockId_not_contains?: InputMaybe<Scalars['String']['input']>
  blockId_not_ends_with?: InputMaybe<Scalars['String']['input']>
  blockId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  blockId_not_starts_with?: InputMaybe<Scalars['String']['input']>
  blockId_starts_with?: InputMaybe<Scalars['String']['input']>
  chainId?: InputMaybe<Scalars['String']['input']>
  chainId_contains?: InputMaybe<Scalars['String']['input']>
  chainId_ends_with?: InputMaybe<Scalars['String']['input']>
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  chainId_not?: InputMaybe<Scalars['String']['input']>
  chainId_not_contains?: InputMaybe<Scalars['String']['input']>
  chainId_not_ends_with?: InputMaybe<Scalars['String']['input']>
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  chainId_not_starts_with?: InputMaybe<Scalars['String']['input']>
  chainId_starts_with?: InputMaybe<Scalars['String']['input']>
  hash?: InputMaybe<Scalars['String']['input']>
  hash_contains?: InputMaybe<Scalars['String']['input']>
  hash_ends_with?: InputMaybe<Scalars['String']['input']>
  hash_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  hash_not?: InputMaybe<Scalars['String']['input']>
  hash_not_contains?: InputMaybe<Scalars['String']['input']>
  hash_not_ends_with?: InputMaybe<Scalars['String']['input']>
  hash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  hash_not_starts_with?: InputMaybe<Scalars['String']['input']>
  hash_starts_with?: InputMaybe<Scalars['String']['input']>
  number?: InputMaybe<Scalars['BigInt']['input']>
  number_gt?: InputMaybe<Scalars['BigInt']['input']>
  number_gte?: InputMaybe<Scalars['BigInt']['input']>
  number_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  number_lt?: InputMaybe<Scalars['BigInt']['input']>
  number_lte?: InputMaybe<Scalars['BigInt']['input']>
  number_not?: InputMaybe<Scalars['BigInt']['input']>
  number_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  timestamp?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>
  timestamp_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
}

export type BlockPage = {
  __typename?: 'BlockPage'
  items: Array<Block>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type BridgeSide = {
  __typename?: 'BridgeSide'
  address: Scalars['String']['output']
  bridgeId: Scalars['String']['output']
  chainId: Scalars['String']['output']
  provider: Provider
  side: Direction
}

export type BridgeSideFilter = {
  AND?: InputMaybe<Array<InputMaybe<BridgeSideFilter>>>
  OR?: InputMaybe<Array<InputMaybe<BridgeSideFilter>>>
  address?: InputMaybe<Scalars['String']['input']>
  address_contains?: InputMaybe<Scalars['String']['input']>
  address_ends_with?: InputMaybe<Scalars['String']['input']>
  address_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  address_not?: InputMaybe<Scalars['String']['input']>
  address_not_contains?: InputMaybe<Scalars['String']['input']>
  address_not_ends_with?: InputMaybe<Scalars['String']['input']>
  address_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  address_not_starts_with?: InputMaybe<Scalars['String']['input']>
  address_starts_with?: InputMaybe<Scalars['String']['input']>
  bridgeId?: InputMaybe<Scalars['String']['input']>
  bridgeId_contains?: InputMaybe<Scalars['String']['input']>
  bridgeId_ends_with?: InputMaybe<Scalars['String']['input']>
  bridgeId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  bridgeId_not?: InputMaybe<Scalars['String']['input']>
  bridgeId_not_contains?: InputMaybe<Scalars['String']['input']>
  bridgeId_not_ends_with?: InputMaybe<Scalars['String']['input']>
  bridgeId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  bridgeId_not_starts_with?: InputMaybe<Scalars['String']['input']>
  bridgeId_starts_with?: InputMaybe<Scalars['String']['input']>
  chainId?: InputMaybe<Scalars['String']['input']>
  chainId_contains?: InputMaybe<Scalars['String']['input']>
  chainId_ends_with?: InputMaybe<Scalars['String']['input']>
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  chainId_not?: InputMaybe<Scalars['String']['input']>
  chainId_not_contains?: InputMaybe<Scalars['String']['input']>
  chainId_not_ends_with?: InputMaybe<Scalars['String']['input']>
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  chainId_not_starts_with?: InputMaybe<Scalars['String']['input']>
  chainId_starts_with?: InputMaybe<Scalars['String']['input']>
  provider?: InputMaybe<Provider>
  provider_in?: InputMaybe<Array<InputMaybe<Provider>>>
  provider_not?: InputMaybe<Provider>
  provider_not_in?: InputMaybe<Array<InputMaybe<Provider>>>
  side?: InputMaybe<Direction>
  side_in?: InputMaybe<Array<InputMaybe<Direction>>>
  side_not?: InputMaybe<Direction>
  side_not_in?: InputMaybe<Array<InputMaybe<Direction>>>
}

export type BridgeSidePage = {
  __typename?: 'BridgeSidePage'
  items: Array<BridgeSide>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export enum Direction {
  Foreign = 'foreign',
  Home = 'home',
}

export type FeeDirector = {
  __typename?: 'FeeDirector'
  excludePriority: Scalars['Boolean']['output']
  feeType: Scalars['String']['output']
  limit: Scalars['BigInt']['output']
  messageId: Scalars['String']['output']
  multiplier: Scalars['BigInt']['output']
  recipient: Scalars['String']['output']
  settings: Scalars['BigInt']['output']
  unwrapped: Scalars['Boolean']['output']
  userRequest?: Maybe<UserRequestForSignature>
}

export type FeeDirectorFilter = {
  AND?: InputMaybe<Array<InputMaybe<FeeDirectorFilter>>>
  OR?: InputMaybe<Array<InputMaybe<FeeDirectorFilter>>>
  excludePriority?: InputMaybe<Scalars['Boolean']['input']>
  excludePriority_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>
  excludePriority_not?: InputMaybe<Scalars['Boolean']['input']>
  excludePriority_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>
  feeType?: InputMaybe<Scalars['String']['input']>
  feeType_contains?: InputMaybe<Scalars['String']['input']>
  feeType_ends_with?: InputMaybe<Scalars['String']['input']>
  feeType_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  feeType_not?: InputMaybe<Scalars['String']['input']>
  feeType_not_contains?: InputMaybe<Scalars['String']['input']>
  feeType_not_ends_with?: InputMaybe<Scalars['String']['input']>
  feeType_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  feeType_not_starts_with?: InputMaybe<Scalars['String']['input']>
  feeType_starts_with?: InputMaybe<Scalars['String']['input']>
  limit?: InputMaybe<Scalars['BigInt']['input']>
  limit_gt?: InputMaybe<Scalars['BigInt']['input']>
  limit_gte?: InputMaybe<Scalars['BigInt']['input']>
  limit_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  limit_lt?: InputMaybe<Scalars['BigInt']['input']>
  limit_lte?: InputMaybe<Scalars['BigInt']['input']>
  limit_not?: InputMaybe<Scalars['BigInt']['input']>
  limit_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  messageId?: InputMaybe<Scalars['String']['input']>
  messageId_contains?: InputMaybe<Scalars['String']['input']>
  messageId_ends_with?: InputMaybe<Scalars['String']['input']>
  messageId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  messageId_not?: InputMaybe<Scalars['String']['input']>
  messageId_not_contains?: InputMaybe<Scalars['String']['input']>
  messageId_not_ends_with?: InputMaybe<Scalars['String']['input']>
  messageId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  messageId_not_starts_with?: InputMaybe<Scalars['String']['input']>
  messageId_starts_with?: InputMaybe<Scalars['String']['input']>
  multiplier?: InputMaybe<Scalars['BigInt']['input']>
  multiplier_gt?: InputMaybe<Scalars['BigInt']['input']>
  multiplier_gte?: InputMaybe<Scalars['BigInt']['input']>
  multiplier_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  multiplier_lt?: InputMaybe<Scalars['BigInt']['input']>
  multiplier_lte?: InputMaybe<Scalars['BigInt']['input']>
  multiplier_not?: InputMaybe<Scalars['BigInt']['input']>
  multiplier_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  recipient?: InputMaybe<Scalars['String']['input']>
  recipient_contains?: InputMaybe<Scalars['String']['input']>
  recipient_ends_with?: InputMaybe<Scalars['String']['input']>
  recipient_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  recipient_not?: InputMaybe<Scalars['String']['input']>
  recipient_not_contains?: InputMaybe<Scalars['String']['input']>
  recipient_not_ends_with?: InputMaybe<Scalars['String']['input']>
  recipient_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  recipient_not_starts_with?: InputMaybe<Scalars['String']['input']>
  recipient_starts_with?: InputMaybe<Scalars['String']['input']>
  settings?: InputMaybe<Scalars['BigInt']['input']>
  settings_gt?: InputMaybe<Scalars['BigInt']['input']>
  settings_gte?: InputMaybe<Scalars['BigInt']['input']>
  settings_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  settings_lt?: InputMaybe<Scalars['BigInt']['input']>
  settings_lte?: InputMaybe<Scalars['BigInt']['input']>
  settings_not?: InputMaybe<Scalars['BigInt']['input']>
  settings_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  unwrapped?: InputMaybe<Scalars['Boolean']['input']>
  unwrapped_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>
  unwrapped_not?: InputMaybe<Scalars['Boolean']['input']>
  unwrapped_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>
}

export type FeeDirectorPage = {
  __typename?: 'FeeDirectorPage'
  items: Array<FeeDirector>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type Meta = {
  __typename?: 'Meta'
  status?: Maybe<Scalars['JSON']['output']>
}

export type PageInfo = {
  __typename?: 'PageInfo'
  endCursor?: Maybe<Scalars['String']['output']>
  hasNextPage: Scalars['Boolean']['output']
  hasPreviousPage: Scalars['Boolean']['output']
  startCursor?: Maybe<Scalars['String']['output']>
}

export enum Provider {
  Pulsechain = 'pulsechain',
  Tokensex = 'tokensex',
}

export type Query = {
  __typename?: 'Query'
  _meta?: Maybe<Meta>
  affirmationComplete?: Maybe<AffirmationComplete>
  affirmationCompletes: AffirmationCompletePage
  block?: Maybe<Block>
  blocks: BlockPage
  bridgeSide?: Maybe<BridgeSide>
  bridgeSides: BridgeSidePage
  feeDirector?: Maybe<FeeDirector>
  feeDirectors: FeeDirectorPage
  relayMessage?: Maybe<RelayMessage>
  relayMessages: RelayMessagePage
  requiredSignaturesChange?: Maybe<RequiredSignaturesChange>
  requiredSignaturesChanges: RequiredSignaturesChangePage
  reverseMessageHashBinding?: Maybe<ReverseMessageHashBinding>
  reverseMessageHashBindings: ReverseMessageHashBindingPage
  signedForAffirmation?: Maybe<SignedForAffirmation>
  signedForAffirmations: SignedForAffirmationPage
  signedForUserRequest?: Maybe<SignedForUserRequest>
  signedForUserRequests: SignedForUserRequestPage
  transaction?: Maybe<Transaction>
  transactions: TransactionPage
  userRequestForAffirmation?: Maybe<UserRequestForAffirmation>
  userRequestForAffirmations: UserRequestForAffirmationPage
  userRequestForSignature?: Maybe<UserRequestForSignature>
  userRequestForSignatures: UserRequestForSignaturePage
  validatorStatus?: Maybe<ValidatorStatus>
  validatorStatuss: ValidatorStatusPage
}

export type QueryAffirmationCompleteArgs = {
  messageHash: Scalars['String']['input']
}

export type QueryAffirmationCompletesArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  before?: InputMaybe<Scalars['String']['input']>
  limit?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<Scalars['String']['input']>
  orderDirection?: InputMaybe<Scalars['String']['input']>
  where?: InputMaybe<AffirmationCompleteFilter>
}

export type QueryBlockArgs = {
  blockId: Scalars['String']['input']
}

export type QueryBlocksArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  before?: InputMaybe<Scalars['String']['input']>
  limit?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<Scalars['String']['input']>
  orderDirection?: InputMaybe<Scalars['String']['input']>
  where?: InputMaybe<BlockFilter>
}

export type QueryBridgeSideArgs = {
  bridgeId: Scalars['String']['input']
}

export type QueryBridgeSidesArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  before?: InputMaybe<Scalars['String']['input']>
  limit?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<Scalars['String']['input']>
  orderDirection?: InputMaybe<Scalars['String']['input']>
  where?: InputMaybe<BridgeSideFilter>
}

export type QueryFeeDirectorArgs = {
  messageId: Scalars['String']['input']
}

export type QueryFeeDirectorsArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  before?: InputMaybe<Scalars['String']['input']>
  limit?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<Scalars['String']['input']>
  orderDirection?: InputMaybe<Scalars['String']['input']>
  where?: InputMaybe<FeeDirectorFilter>
}

export type QueryRelayMessageArgs = {
  messageHash: Scalars['String']['input']
}

export type QueryRelayMessagesArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  before?: InputMaybe<Scalars['String']['input']>
  limit?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<Scalars['String']['input']>
  orderDirection?: InputMaybe<Scalars['String']['input']>
  where?: InputMaybe<RelayMessageFilter>
}

export type QueryRequiredSignaturesChangeArgs = {
  orderId: Scalars['String']['input']
}

export type QueryRequiredSignaturesChangesArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  before?: InputMaybe<Scalars['String']['input']>
  limit?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<Scalars['String']['input']>
  orderDirection?: InputMaybe<Scalars['String']['input']>
  where?: InputMaybe<RequiredSignaturesChangeFilter>
}

export type QueryReverseMessageHashBindingArgs = {
  messageHash: Scalars['String']['input']
}

export type QueryReverseMessageHashBindingsArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  before?: InputMaybe<Scalars['String']['input']>
  limit?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<Scalars['String']['input']>
  orderDirection?: InputMaybe<Scalars['String']['input']>
  where?: InputMaybe<ReverseMessageHashBindingFilter>
}

export type QuerySignedForAffirmationArgs = {
  id: Scalars['String']['input']
}

export type QuerySignedForAffirmationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  before?: InputMaybe<Scalars['String']['input']>
  limit?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<Scalars['String']['input']>
  orderDirection?: InputMaybe<Scalars['String']['input']>
  where?: InputMaybe<SignedForAffirmationFilter>
}

export type QuerySignedForUserRequestArgs = {
  id: Scalars['String']['input']
}

export type QuerySignedForUserRequestsArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  before?: InputMaybe<Scalars['String']['input']>
  limit?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<Scalars['String']['input']>
  orderDirection?: InputMaybe<Scalars['String']['input']>
  where?: InputMaybe<SignedForUserRequestFilter>
}

export type QueryTransactionArgs = {
  transactionId: Scalars['String']['input']
}

export type QueryTransactionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  before?: InputMaybe<Scalars['String']['input']>
  limit?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<Scalars['String']['input']>
  orderDirection?: InputMaybe<Scalars['String']['input']>
  where?: InputMaybe<TransactionFilter>
}

export type QueryUserRequestForAffirmationArgs = {
  messageId: Scalars['String']['input']
}

export type QueryUserRequestForAffirmationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  before?: InputMaybe<Scalars['String']['input']>
  limit?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<Scalars['String']['input']>
  orderDirection?: InputMaybe<Scalars['String']['input']>
  where?: InputMaybe<UserRequestForAffirmationFilter>
}

export type QueryUserRequestForSignatureArgs = {
  messageId: Scalars['String']['input']
}

export type QueryUserRequestForSignaturesArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  before?: InputMaybe<Scalars['String']['input']>
  limit?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<Scalars['String']['input']>
  orderDirection?: InputMaybe<Scalars['String']['input']>
  where?: InputMaybe<UserRequestForSignatureFilter>
}

export type QueryValidatorStatusArgs = {
  orderId: Scalars['String']['input']
  validatorId: Scalars['String']['input']
}

export type QueryValidatorStatussArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  before?: InputMaybe<Scalars['String']['input']>
  limit?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<Scalars['String']['input']>
  orderDirection?: InputMaybe<Scalars['String']['input']>
  where?: InputMaybe<ValidatorStatusFilter>
}

export type RelayMessage = {
  __typename?: 'RelayMessage'
  deliverer: Scalars['String']['output']
  logIndex: Scalars['Float']['output']
  messageHash: Scalars['String']['output']
  orderId: Scalars['String']['output']
  signature?: Maybe<SignedForUserRequestPage>
  transaction?: Maybe<Transaction>
  transactionId: Scalars['String']['output']
  userRequest?: Maybe<UserRequestForSignature>
}

export type RelayMessageSignatureArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  before?: InputMaybe<Scalars['String']['input']>
  limit?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<Scalars['String']['input']>
  orderDirection?: InputMaybe<Scalars['String']['input']>
  where?: InputMaybe<SignedForUserRequestFilter>
}

export type RelayMessageFilter = {
  AND?: InputMaybe<Array<InputMaybe<RelayMessageFilter>>>
  OR?: InputMaybe<Array<InputMaybe<RelayMessageFilter>>>
  deliverer?: InputMaybe<Scalars['String']['input']>
  deliverer_contains?: InputMaybe<Scalars['String']['input']>
  deliverer_ends_with?: InputMaybe<Scalars['String']['input']>
  deliverer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  deliverer_not?: InputMaybe<Scalars['String']['input']>
  deliverer_not_contains?: InputMaybe<Scalars['String']['input']>
  deliverer_not_ends_with?: InputMaybe<Scalars['String']['input']>
  deliverer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  deliverer_not_starts_with?: InputMaybe<Scalars['String']['input']>
  deliverer_starts_with?: InputMaybe<Scalars['String']['input']>
  logIndex?: InputMaybe<Scalars['Float']['input']>
  logIndex_gt?: InputMaybe<Scalars['Float']['input']>
  logIndex_gte?: InputMaybe<Scalars['Float']['input']>
  logIndex_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>
  logIndex_lt?: InputMaybe<Scalars['Float']['input']>
  logIndex_lte?: InputMaybe<Scalars['Float']['input']>
  logIndex_not?: InputMaybe<Scalars['Float']['input']>
  logIndex_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>
  messageHash?: InputMaybe<Scalars['String']['input']>
  messageHash_contains?: InputMaybe<Scalars['String']['input']>
  messageHash_ends_with?: InputMaybe<Scalars['String']['input']>
  messageHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  messageHash_not?: InputMaybe<Scalars['String']['input']>
  messageHash_not_contains?: InputMaybe<Scalars['String']['input']>
  messageHash_not_ends_with?: InputMaybe<Scalars['String']['input']>
  messageHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  messageHash_not_starts_with?: InputMaybe<Scalars['String']['input']>
  messageHash_starts_with?: InputMaybe<Scalars['String']['input']>
  orderId?: InputMaybe<Scalars['String']['input']>
  orderId_contains?: InputMaybe<Scalars['String']['input']>
  orderId_ends_with?: InputMaybe<Scalars['String']['input']>
  orderId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  orderId_not?: InputMaybe<Scalars['String']['input']>
  orderId_not_contains?: InputMaybe<Scalars['String']['input']>
  orderId_not_ends_with?: InputMaybe<Scalars['String']['input']>
  orderId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  orderId_not_starts_with?: InputMaybe<Scalars['String']['input']>
  orderId_starts_with?: InputMaybe<Scalars['String']['input']>
  transactionId?: InputMaybe<Scalars['String']['input']>
  transactionId_contains?: InputMaybe<Scalars['String']['input']>
  transactionId_ends_with?: InputMaybe<Scalars['String']['input']>
  transactionId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  transactionId_not?: InputMaybe<Scalars['String']['input']>
  transactionId_not_contains?: InputMaybe<Scalars['String']['input']>
  transactionId_not_ends_with?: InputMaybe<Scalars['String']['input']>
  transactionId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  transactionId_not_starts_with?: InputMaybe<Scalars['String']['input']>
  transactionId_starts_with?: InputMaybe<Scalars['String']['input']>
}

export type RelayMessagePage = {
  __typename?: 'RelayMessagePage'
  items: Array<RelayMessage>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type RequiredSignaturesChange = {
  __typename?: 'RequiredSignaturesChange'
  bridge?: Maybe<BridgeSide>
  bridgeId: Scalars['String']['output']
  logIndex: Scalars['Float']['output']
  orderId: Scalars['String']['output']
  requiredSignatures: Scalars['BigInt']['output']
  transaction?: Maybe<Transaction>
  transactionId: Scalars['String']['output']
}

export type RequiredSignaturesChangeFilter = {
  AND?: InputMaybe<Array<InputMaybe<RequiredSignaturesChangeFilter>>>
  OR?: InputMaybe<Array<InputMaybe<RequiredSignaturesChangeFilter>>>
  bridgeId?: InputMaybe<Scalars['String']['input']>
  bridgeId_contains?: InputMaybe<Scalars['String']['input']>
  bridgeId_ends_with?: InputMaybe<Scalars['String']['input']>
  bridgeId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  bridgeId_not?: InputMaybe<Scalars['String']['input']>
  bridgeId_not_contains?: InputMaybe<Scalars['String']['input']>
  bridgeId_not_ends_with?: InputMaybe<Scalars['String']['input']>
  bridgeId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  bridgeId_not_starts_with?: InputMaybe<Scalars['String']['input']>
  bridgeId_starts_with?: InputMaybe<Scalars['String']['input']>
  logIndex?: InputMaybe<Scalars['Float']['input']>
  logIndex_gt?: InputMaybe<Scalars['Float']['input']>
  logIndex_gte?: InputMaybe<Scalars['Float']['input']>
  logIndex_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>
  logIndex_lt?: InputMaybe<Scalars['Float']['input']>
  logIndex_lte?: InputMaybe<Scalars['Float']['input']>
  logIndex_not?: InputMaybe<Scalars['Float']['input']>
  logIndex_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>
  orderId?: InputMaybe<Scalars['String']['input']>
  orderId_contains?: InputMaybe<Scalars['String']['input']>
  orderId_ends_with?: InputMaybe<Scalars['String']['input']>
  orderId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  orderId_not?: InputMaybe<Scalars['String']['input']>
  orderId_not_contains?: InputMaybe<Scalars['String']['input']>
  orderId_not_ends_with?: InputMaybe<Scalars['String']['input']>
  orderId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  orderId_not_starts_with?: InputMaybe<Scalars['String']['input']>
  orderId_starts_with?: InputMaybe<Scalars['String']['input']>
  requiredSignatures?: InputMaybe<Scalars['BigInt']['input']>
  requiredSignatures_gt?: InputMaybe<Scalars['BigInt']['input']>
  requiredSignatures_gte?: InputMaybe<Scalars['BigInt']['input']>
  requiredSignatures_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  requiredSignatures_lt?: InputMaybe<Scalars['BigInt']['input']>
  requiredSignatures_lte?: InputMaybe<Scalars['BigInt']['input']>
  requiredSignatures_not?: InputMaybe<Scalars['BigInt']['input']>
  requiredSignatures_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  transactionId?: InputMaybe<Scalars['String']['input']>
  transactionId_contains?: InputMaybe<Scalars['String']['input']>
  transactionId_ends_with?: InputMaybe<Scalars['String']['input']>
  transactionId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  transactionId_not?: InputMaybe<Scalars['String']['input']>
  transactionId_not_contains?: InputMaybe<Scalars['String']['input']>
  transactionId_not_ends_with?: InputMaybe<Scalars['String']['input']>
  transactionId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  transactionId_not_starts_with?: InputMaybe<Scalars['String']['input']>
  transactionId_starts_with?: InputMaybe<Scalars['String']['input']>
}

export type RequiredSignaturesChangePage = {
  __typename?: 'RequiredSignaturesChangePage'
  items: Array<RequiredSignaturesChange>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type ReverseMessageHashBinding = {
  __typename?: 'ReverseMessageHashBinding'
  messageHash: Scalars['String']['output']
  messageId: Scalars['String']['output']
}

export type ReverseMessageHashBindingFilter = {
  AND?: InputMaybe<Array<InputMaybe<ReverseMessageHashBindingFilter>>>
  OR?: InputMaybe<Array<InputMaybe<ReverseMessageHashBindingFilter>>>
  messageHash?: InputMaybe<Scalars['String']['input']>
  messageHash_contains?: InputMaybe<Scalars['String']['input']>
  messageHash_ends_with?: InputMaybe<Scalars['String']['input']>
  messageHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  messageHash_not?: InputMaybe<Scalars['String']['input']>
  messageHash_not_contains?: InputMaybe<Scalars['String']['input']>
  messageHash_not_ends_with?: InputMaybe<Scalars['String']['input']>
  messageHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  messageHash_not_starts_with?: InputMaybe<Scalars['String']['input']>
  messageHash_starts_with?: InputMaybe<Scalars['String']['input']>
  messageId?: InputMaybe<Scalars['String']['input']>
  messageId_contains?: InputMaybe<Scalars['String']['input']>
  messageId_ends_with?: InputMaybe<Scalars['String']['input']>
  messageId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  messageId_not?: InputMaybe<Scalars['String']['input']>
  messageId_not_contains?: InputMaybe<Scalars['String']['input']>
  messageId_not_ends_with?: InputMaybe<Scalars['String']['input']>
  messageId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  messageId_not_starts_with?: InputMaybe<Scalars['String']['input']>
  messageId_starts_with?: InputMaybe<Scalars['String']['input']>
}

export type ReverseMessageHashBindingPage = {
  __typename?: 'ReverseMessageHashBindingPage'
  items: Array<ReverseMessageHashBinding>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type SignedForAffirmation = {
  __typename?: 'SignedForAffirmation'
  blockId: Scalars['String']['output']
  delivery?: Maybe<AffirmationComplete>
  id: Scalars['String']['output']
  logIndex: Scalars['Float']['output']
  messageHash: Scalars['String']['output']
  orderId: Scalars['String']['output']
  transaction?: Maybe<Transaction>
  transactionId: Scalars['String']['output']
  userRequest?: Maybe<UserRequestForAffirmation>
  validatorId: Scalars['String']['output']
}

export type SignedForAffirmationFilter = {
  AND?: InputMaybe<Array<InputMaybe<SignedForAffirmationFilter>>>
  OR?: InputMaybe<Array<InputMaybe<SignedForAffirmationFilter>>>
  blockId?: InputMaybe<Scalars['String']['input']>
  blockId_contains?: InputMaybe<Scalars['String']['input']>
  blockId_ends_with?: InputMaybe<Scalars['String']['input']>
  blockId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  blockId_not?: InputMaybe<Scalars['String']['input']>
  blockId_not_contains?: InputMaybe<Scalars['String']['input']>
  blockId_not_ends_with?: InputMaybe<Scalars['String']['input']>
  blockId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  blockId_not_starts_with?: InputMaybe<Scalars['String']['input']>
  blockId_starts_with?: InputMaybe<Scalars['String']['input']>
  id?: InputMaybe<Scalars['String']['input']>
  id_contains?: InputMaybe<Scalars['String']['input']>
  id_ends_with?: InputMaybe<Scalars['String']['input']>
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  id_not?: InputMaybe<Scalars['String']['input']>
  id_not_contains?: InputMaybe<Scalars['String']['input']>
  id_not_ends_with?: InputMaybe<Scalars['String']['input']>
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  id_not_starts_with?: InputMaybe<Scalars['String']['input']>
  id_starts_with?: InputMaybe<Scalars['String']['input']>
  logIndex?: InputMaybe<Scalars['Float']['input']>
  logIndex_gt?: InputMaybe<Scalars['Float']['input']>
  logIndex_gte?: InputMaybe<Scalars['Float']['input']>
  logIndex_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>
  logIndex_lt?: InputMaybe<Scalars['Float']['input']>
  logIndex_lte?: InputMaybe<Scalars['Float']['input']>
  logIndex_not?: InputMaybe<Scalars['Float']['input']>
  logIndex_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>
  messageHash?: InputMaybe<Scalars['String']['input']>
  messageHash_contains?: InputMaybe<Scalars['String']['input']>
  messageHash_ends_with?: InputMaybe<Scalars['String']['input']>
  messageHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  messageHash_not?: InputMaybe<Scalars['String']['input']>
  messageHash_not_contains?: InputMaybe<Scalars['String']['input']>
  messageHash_not_ends_with?: InputMaybe<Scalars['String']['input']>
  messageHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  messageHash_not_starts_with?: InputMaybe<Scalars['String']['input']>
  messageHash_starts_with?: InputMaybe<Scalars['String']['input']>
  orderId?: InputMaybe<Scalars['String']['input']>
  orderId_contains?: InputMaybe<Scalars['String']['input']>
  orderId_ends_with?: InputMaybe<Scalars['String']['input']>
  orderId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  orderId_not?: InputMaybe<Scalars['String']['input']>
  orderId_not_contains?: InputMaybe<Scalars['String']['input']>
  orderId_not_ends_with?: InputMaybe<Scalars['String']['input']>
  orderId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  orderId_not_starts_with?: InputMaybe<Scalars['String']['input']>
  orderId_starts_with?: InputMaybe<Scalars['String']['input']>
  transactionId?: InputMaybe<Scalars['String']['input']>
  transactionId_contains?: InputMaybe<Scalars['String']['input']>
  transactionId_ends_with?: InputMaybe<Scalars['String']['input']>
  transactionId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  transactionId_not?: InputMaybe<Scalars['String']['input']>
  transactionId_not_contains?: InputMaybe<Scalars['String']['input']>
  transactionId_not_ends_with?: InputMaybe<Scalars['String']['input']>
  transactionId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  transactionId_not_starts_with?: InputMaybe<Scalars['String']['input']>
  transactionId_starts_with?: InputMaybe<Scalars['String']['input']>
  validatorId?: InputMaybe<Scalars['String']['input']>
  validatorId_contains?: InputMaybe<Scalars['String']['input']>
  validatorId_ends_with?: InputMaybe<Scalars['String']['input']>
  validatorId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  validatorId_not?: InputMaybe<Scalars['String']['input']>
  validatorId_not_contains?: InputMaybe<Scalars['String']['input']>
  validatorId_not_ends_with?: InputMaybe<Scalars['String']['input']>
  validatorId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  validatorId_not_starts_with?: InputMaybe<Scalars['String']['input']>
  validatorId_starts_with?: InputMaybe<Scalars['String']['input']>
}

export type SignedForAffirmationPage = {
  __typename?: 'SignedForAffirmationPage'
  items: Array<SignedForAffirmation>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type SignedForUserRequest = {
  __typename?: 'SignedForUserRequest'
  blockId: Scalars['String']['output']
  delivery?: Maybe<RelayMessage>
  id: Scalars['String']['output']
  logIndex: Scalars['Float']['output']
  messageHash: Scalars['String']['output']
  orderId: Scalars['String']['output']
  transaction?: Maybe<Transaction>
  transactionId: Scalars['String']['output']
  userRequest?: Maybe<UserRequestForSignature>
  validatorId: Scalars['String']['output']
}

export type SignedForUserRequestFilter = {
  AND?: InputMaybe<Array<InputMaybe<SignedForUserRequestFilter>>>
  OR?: InputMaybe<Array<InputMaybe<SignedForUserRequestFilter>>>
  blockId?: InputMaybe<Scalars['String']['input']>
  blockId_contains?: InputMaybe<Scalars['String']['input']>
  blockId_ends_with?: InputMaybe<Scalars['String']['input']>
  blockId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  blockId_not?: InputMaybe<Scalars['String']['input']>
  blockId_not_contains?: InputMaybe<Scalars['String']['input']>
  blockId_not_ends_with?: InputMaybe<Scalars['String']['input']>
  blockId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  blockId_not_starts_with?: InputMaybe<Scalars['String']['input']>
  blockId_starts_with?: InputMaybe<Scalars['String']['input']>
  id?: InputMaybe<Scalars['String']['input']>
  id_contains?: InputMaybe<Scalars['String']['input']>
  id_ends_with?: InputMaybe<Scalars['String']['input']>
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  id_not?: InputMaybe<Scalars['String']['input']>
  id_not_contains?: InputMaybe<Scalars['String']['input']>
  id_not_ends_with?: InputMaybe<Scalars['String']['input']>
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  id_not_starts_with?: InputMaybe<Scalars['String']['input']>
  id_starts_with?: InputMaybe<Scalars['String']['input']>
  logIndex?: InputMaybe<Scalars['Float']['input']>
  logIndex_gt?: InputMaybe<Scalars['Float']['input']>
  logIndex_gte?: InputMaybe<Scalars['Float']['input']>
  logIndex_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>
  logIndex_lt?: InputMaybe<Scalars['Float']['input']>
  logIndex_lte?: InputMaybe<Scalars['Float']['input']>
  logIndex_not?: InputMaybe<Scalars['Float']['input']>
  logIndex_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>
  messageHash?: InputMaybe<Scalars['String']['input']>
  messageHash_contains?: InputMaybe<Scalars['String']['input']>
  messageHash_ends_with?: InputMaybe<Scalars['String']['input']>
  messageHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  messageHash_not?: InputMaybe<Scalars['String']['input']>
  messageHash_not_contains?: InputMaybe<Scalars['String']['input']>
  messageHash_not_ends_with?: InputMaybe<Scalars['String']['input']>
  messageHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  messageHash_not_starts_with?: InputMaybe<Scalars['String']['input']>
  messageHash_starts_with?: InputMaybe<Scalars['String']['input']>
  orderId?: InputMaybe<Scalars['String']['input']>
  orderId_contains?: InputMaybe<Scalars['String']['input']>
  orderId_ends_with?: InputMaybe<Scalars['String']['input']>
  orderId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  orderId_not?: InputMaybe<Scalars['String']['input']>
  orderId_not_contains?: InputMaybe<Scalars['String']['input']>
  orderId_not_ends_with?: InputMaybe<Scalars['String']['input']>
  orderId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  orderId_not_starts_with?: InputMaybe<Scalars['String']['input']>
  orderId_starts_with?: InputMaybe<Scalars['String']['input']>
  transactionId?: InputMaybe<Scalars['String']['input']>
  transactionId_contains?: InputMaybe<Scalars['String']['input']>
  transactionId_ends_with?: InputMaybe<Scalars['String']['input']>
  transactionId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  transactionId_not?: InputMaybe<Scalars['String']['input']>
  transactionId_not_contains?: InputMaybe<Scalars['String']['input']>
  transactionId_not_ends_with?: InputMaybe<Scalars['String']['input']>
  transactionId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  transactionId_not_starts_with?: InputMaybe<Scalars['String']['input']>
  transactionId_starts_with?: InputMaybe<Scalars['String']['input']>
  validatorId?: InputMaybe<Scalars['String']['input']>
  validatorId_contains?: InputMaybe<Scalars['String']['input']>
  validatorId_ends_with?: InputMaybe<Scalars['String']['input']>
  validatorId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  validatorId_not?: InputMaybe<Scalars['String']['input']>
  validatorId_not_contains?: InputMaybe<Scalars['String']['input']>
  validatorId_not_ends_with?: InputMaybe<Scalars['String']['input']>
  validatorId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  validatorId_not_starts_with?: InputMaybe<Scalars['String']['input']>
  validatorId_starts_with?: InputMaybe<Scalars['String']['input']>
}

export type SignedForUserRequestPage = {
  __typename?: 'SignedForUserRequestPage'
  items: Array<SignedForUserRequest>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type Transaction = {
  __typename?: 'Transaction'
  block?: Maybe<Block>
  blockId: Scalars['String']['output']
  from: Scalars['String']['output']
  hash: Scalars['String']['output']
  index: Scalars['String']['output']
  to: Scalars['String']['output']
  transactionId: Scalars['String']['output']
  value: Scalars['BigInt']['output']
}

export type TransactionFilter = {
  AND?: InputMaybe<Array<InputMaybe<TransactionFilter>>>
  OR?: InputMaybe<Array<InputMaybe<TransactionFilter>>>
  blockId?: InputMaybe<Scalars['String']['input']>
  blockId_contains?: InputMaybe<Scalars['String']['input']>
  blockId_ends_with?: InputMaybe<Scalars['String']['input']>
  blockId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  blockId_not?: InputMaybe<Scalars['String']['input']>
  blockId_not_contains?: InputMaybe<Scalars['String']['input']>
  blockId_not_ends_with?: InputMaybe<Scalars['String']['input']>
  blockId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  blockId_not_starts_with?: InputMaybe<Scalars['String']['input']>
  blockId_starts_with?: InputMaybe<Scalars['String']['input']>
  from?: InputMaybe<Scalars['String']['input']>
  from_contains?: InputMaybe<Scalars['String']['input']>
  from_ends_with?: InputMaybe<Scalars['String']['input']>
  from_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  from_not?: InputMaybe<Scalars['String']['input']>
  from_not_contains?: InputMaybe<Scalars['String']['input']>
  from_not_ends_with?: InputMaybe<Scalars['String']['input']>
  from_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  from_not_starts_with?: InputMaybe<Scalars['String']['input']>
  from_starts_with?: InputMaybe<Scalars['String']['input']>
  hash?: InputMaybe<Scalars['String']['input']>
  hash_contains?: InputMaybe<Scalars['String']['input']>
  hash_ends_with?: InputMaybe<Scalars['String']['input']>
  hash_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  hash_not?: InputMaybe<Scalars['String']['input']>
  hash_not_contains?: InputMaybe<Scalars['String']['input']>
  hash_not_ends_with?: InputMaybe<Scalars['String']['input']>
  hash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  hash_not_starts_with?: InputMaybe<Scalars['String']['input']>
  hash_starts_with?: InputMaybe<Scalars['String']['input']>
  index?: InputMaybe<Scalars['String']['input']>
  index_contains?: InputMaybe<Scalars['String']['input']>
  index_ends_with?: InputMaybe<Scalars['String']['input']>
  index_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  index_not?: InputMaybe<Scalars['String']['input']>
  index_not_contains?: InputMaybe<Scalars['String']['input']>
  index_not_ends_with?: InputMaybe<Scalars['String']['input']>
  index_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  index_not_starts_with?: InputMaybe<Scalars['String']['input']>
  index_starts_with?: InputMaybe<Scalars['String']['input']>
  to?: InputMaybe<Scalars['String']['input']>
  to_contains?: InputMaybe<Scalars['String']['input']>
  to_ends_with?: InputMaybe<Scalars['String']['input']>
  to_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  to_not?: InputMaybe<Scalars['String']['input']>
  to_not_contains?: InputMaybe<Scalars['String']['input']>
  to_not_ends_with?: InputMaybe<Scalars['String']['input']>
  to_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  to_not_starts_with?: InputMaybe<Scalars['String']['input']>
  to_starts_with?: InputMaybe<Scalars['String']['input']>
  transactionId?: InputMaybe<Scalars['String']['input']>
  transactionId_contains?: InputMaybe<Scalars['String']['input']>
  transactionId_ends_with?: InputMaybe<Scalars['String']['input']>
  transactionId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  transactionId_not?: InputMaybe<Scalars['String']['input']>
  transactionId_not_contains?: InputMaybe<Scalars['String']['input']>
  transactionId_not_ends_with?: InputMaybe<Scalars['String']['input']>
  transactionId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  transactionId_not_starts_with?: InputMaybe<Scalars['String']['input']>
  transactionId_starts_with?: InputMaybe<Scalars['String']['input']>
  value?: InputMaybe<Scalars['BigInt']['input']>
  value_gt?: InputMaybe<Scalars['BigInt']['input']>
  value_gte?: InputMaybe<Scalars['BigInt']['input']>
  value_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  value_lt?: InputMaybe<Scalars['BigInt']['input']>
  value_lte?: InputMaybe<Scalars['BigInt']['input']>
  value_not?: InputMaybe<Scalars['BigInt']['input']>
  value_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
}

export type TransactionPage = {
  __typename?: 'TransactionPage'
  items: Array<Transaction>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type UserRequestForAffirmation = {
  __typename?: 'UserRequestForAffirmation'
  amount: Scalars['BigInt']['output']
  block?: Maybe<Block>
  blockId: Scalars['String']['output']
  bridge?: Maybe<BridgeSide>
  bridgeId: Scalars['String']['output']
  confirmedSignatures: Scalars['BigInt']['output']
  delivery?: Maybe<AffirmationComplete>
  destinationChainId: Scalars['BigInt']['output']
  encodedData: Scalars['String']['output']
  finishedSigning: Scalars['Boolean']['output']
  from: Scalars['String']['output']
  logIndex: Scalars['Float']['output']
  messageHash: Scalars['String']['output']
  messageId: Scalars['String']['output']
  orderId: Scalars['String']['output']
  originationChainId: Scalars['BigInt']['output']
  requiredSignatures: Scalars['BigInt']['output']
  signatures?: Maybe<SignedForAffirmationPage>
  to: Scalars['String']['output']
  transaction?: Maybe<Transaction>
  transactionId: Scalars['String']['output']
}

export type UserRequestForAffirmationSignaturesArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  before?: InputMaybe<Scalars['String']['input']>
  limit?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<Scalars['String']['input']>
  orderDirection?: InputMaybe<Scalars['String']['input']>
  where?: InputMaybe<SignedForAffirmationFilter>
}

export type UserRequestForAffirmationFilter = {
  AND?: InputMaybe<Array<InputMaybe<UserRequestForAffirmationFilter>>>
  OR?: InputMaybe<Array<InputMaybe<UserRequestForAffirmationFilter>>>
  amount?: InputMaybe<Scalars['BigInt']['input']>
  amount_gt?: InputMaybe<Scalars['BigInt']['input']>
  amount_gte?: InputMaybe<Scalars['BigInt']['input']>
  amount_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  amount_lt?: InputMaybe<Scalars['BigInt']['input']>
  amount_lte?: InputMaybe<Scalars['BigInt']['input']>
  amount_not?: InputMaybe<Scalars['BigInt']['input']>
  amount_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  blockId?: InputMaybe<Scalars['String']['input']>
  blockId_contains?: InputMaybe<Scalars['String']['input']>
  blockId_ends_with?: InputMaybe<Scalars['String']['input']>
  blockId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  blockId_not?: InputMaybe<Scalars['String']['input']>
  blockId_not_contains?: InputMaybe<Scalars['String']['input']>
  blockId_not_ends_with?: InputMaybe<Scalars['String']['input']>
  blockId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  blockId_not_starts_with?: InputMaybe<Scalars['String']['input']>
  blockId_starts_with?: InputMaybe<Scalars['String']['input']>
  bridgeId?: InputMaybe<Scalars['String']['input']>
  bridgeId_contains?: InputMaybe<Scalars['String']['input']>
  bridgeId_ends_with?: InputMaybe<Scalars['String']['input']>
  bridgeId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  bridgeId_not?: InputMaybe<Scalars['String']['input']>
  bridgeId_not_contains?: InputMaybe<Scalars['String']['input']>
  bridgeId_not_ends_with?: InputMaybe<Scalars['String']['input']>
  bridgeId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  bridgeId_not_starts_with?: InputMaybe<Scalars['String']['input']>
  bridgeId_starts_with?: InputMaybe<Scalars['String']['input']>
  confirmedSignatures?: InputMaybe<Scalars['BigInt']['input']>
  confirmedSignatures_gt?: InputMaybe<Scalars['BigInt']['input']>
  confirmedSignatures_gte?: InputMaybe<Scalars['BigInt']['input']>
  confirmedSignatures_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  confirmedSignatures_lt?: InputMaybe<Scalars['BigInt']['input']>
  confirmedSignatures_lte?: InputMaybe<Scalars['BigInt']['input']>
  confirmedSignatures_not?: InputMaybe<Scalars['BigInt']['input']>
  confirmedSignatures_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  destinationChainId?: InputMaybe<Scalars['BigInt']['input']>
  destinationChainId_gt?: InputMaybe<Scalars['BigInt']['input']>
  destinationChainId_gte?: InputMaybe<Scalars['BigInt']['input']>
  destinationChainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  destinationChainId_lt?: InputMaybe<Scalars['BigInt']['input']>
  destinationChainId_lte?: InputMaybe<Scalars['BigInt']['input']>
  destinationChainId_not?: InputMaybe<Scalars['BigInt']['input']>
  destinationChainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  encodedData?: InputMaybe<Scalars['String']['input']>
  encodedData_contains?: InputMaybe<Scalars['String']['input']>
  encodedData_ends_with?: InputMaybe<Scalars['String']['input']>
  encodedData_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  encodedData_not?: InputMaybe<Scalars['String']['input']>
  encodedData_not_contains?: InputMaybe<Scalars['String']['input']>
  encodedData_not_ends_with?: InputMaybe<Scalars['String']['input']>
  encodedData_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  encodedData_not_starts_with?: InputMaybe<Scalars['String']['input']>
  encodedData_starts_with?: InputMaybe<Scalars['String']['input']>
  finishedSigning?: InputMaybe<Scalars['Boolean']['input']>
  finishedSigning_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>
  finishedSigning_not?: InputMaybe<Scalars['Boolean']['input']>
  finishedSigning_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>
  from?: InputMaybe<Scalars['String']['input']>
  from_contains?: InputMaybe<Scalars['String']['input']>
  from_ends_with?: InputMaybe<Scalars['String']['input']>
  from_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  from_not?: InputMaybe<Scalars['String']['input']>
  from_not_contains?: InputMaybe<Scalars['String']['input']>
  from_not_ends_with?: InputMaybe<Scalars['String']['input']>
  from_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  from_not_starts_with?: InputMaybe<Scalars['String']['input']>
  from_starts_with?: InputMaybe<Scalars['String']['input']>
  logIndex?: InputMaybe<Scalars['Float']['input']>
  logIndex_gt?: InputMaybe<Scalars['Float']['input']>
  logIndex_gte?: InputMaybe<Scalars['Float']['input']>
  logIndex_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>
  logIndex_lt?: InputMaybe<Scalars['Float']['input']>
  logIndex_lte?: InputMaybe<Scalars['Float']['input']>
  logIndex_not?: InputMaybe<Scalars['Float']['input']>
  logIndex_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>
  messageHash?: InputMaybe<Scalars['String']['input']>
  messageHash_contains?: InputMaybe<Scalars['String']['input']>
  messageHash_ends_with?: InputMaybe<Scalars['String']['input']>
  messageHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  messageHash_not?: InputMaybe<Scalars['String']['input']>
  messageHash_not_contains?: InputMaybe<Scalars['String']['input']>
  messageHash_not_ends_with?: InputMaybe<Scalars['String']['input']>
  messageHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  messageHash_not_starts_with?: InputMaybe<Scalars['String']['input']>
  messageHash_starts_with?: InputMaybe<Scalars['String']['input']>
  messageId?: InputMaybe<Scalars['String']['input']>
  messageId_contains?: InputMaybe<Scalars['String']['input']>
  messageId_ends_with?: InputMaybe<Scalars['String']['input']>
  messageId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  messageId_not?: InputMaybe<Scalars['String']['input']>
  messageId_not_contains?: InputMaybe<Scalars['String']['input']>
  messageId_not_ends_with?: InputMaybe<Scalars['String']['input']>
  messageId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  messageId_not_starts_with?: InputMaybe<Scalars['String']['input']>
  messageId_starts_with?: InputMaybe<Scalars['String']['input']>
  orderId?: InputMaybe<Scalars['String']['input']>
  orderId_contains?: InputMaybe<Scalars['String']['input']>
  orderId_ends_with?: InputMaybe<Scalars['String']['input']>
  orderId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  orderId_not?: InputMaybe<Scalars['String']['input']>
  orderId_not_contains?: InputMaybe<Scalars['String']['input']>
  orderId_not_ends_with?: InputMaybe<Scalars['String']['input']>
  orderId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  orderId_not_starts_with?: InputMaybe<Scalars['String']['input']>
  orderId_starts_with?: InputMaybe<Scalars['String']['input']>
  originationChainId?: InputMaybe<Scalars['BigInt']['input']>
  originationChainId_gt?: InputMaybe<Scalars['BigInt']['input']>
  originationChainId_gte?: InputMaybe<Scalars['BigInt']['input']>
  originationChainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  originationChainId_lt?: InputMaybe<Scalars['BigInt']['input']>
  originationChainId_lte?: InputMaybe<Scalars['BigInt']['input']>
  originationChainId_not?: InputMaybe<Scalars['BigInt']['input']>
  originationChainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  requiredSignatures?: InputMaybe<Scalars['BigInt']['input']>
  requiredSignatures_gt?: InputMaybe<Scalars['BigInt']['input']>
  requiredSignatures_gte?: InputMaybe<Scalars['BigInt']['input']>
  requiredSignatures_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  requiredSignatures_lt?: InputMaybe<Scalars['BigInt']['input']>
  requiredSignatures_lte?: InputMaybe<Scalars['BigInt']['input']>
  requiredSignatures_not?: InputMaybe<Scalars['BigInt']['input']>
  requiredSignatures_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  to?: InputMaybe<Scalars['String']['input']>
  to_contains?: InputMaybe<Scalars['String']['input']>
  to_ends_with?: InputMaybe<Scalars['String']['input']>
  to_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  to_not?: InputMaybe<Scalars['String']['input']>
  to_not_contains?: InputMaybe<Scalars['String']['input']>
  to_not_ends_with?: InputMaybe<Scalars['String']['input']>
  to_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  to_not_starts_with?: InputMaybe<Scalars['String']['input']>
  to_starts_with?: InputMaybe<Scalars['String']['input']>
  transactionId?: InputMaybe<Scalars['String']['input']>
  transactionId_contains?: InputMaybe<Scalars['String']['input']>
  transactionId_ends_with?: InputMaybe<Scalars['String']['input']>
  transactionId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  transactionId_not?: InputMaybe<Scalars['String']['input']>
  transactionId_not_contains?: InputMaybe<Scalars['String']['input']>
  transactionId_not_ends_with?: InputMaybe<Scalars['String']['input']>
  transactionId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  transactionId_not_starts_with?: InputMaybe<Scalars['String']['input']>
  transactionId_starts_with?: InputMaybe<Scalars['String']['input']>
}

export type UserRequestForAffirmationPage = {
  __typename?: 'UserRequestForAffirmationPage'
  items: Array<UserRequestForAffirmation>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type UserRequestForSignature = {
  __typename?: 'UserRequestForSignature'
  amount: Scalars['BigInt']['output']
  block?: Maybe<Block>
  blockId: Scalars['String']['output']
  bridge?: Maybe<BridgeSide>
  bridgeId: Scalars['String']['output']
  confirmedSignatures: Scalars['BigInt']['output']
  delivery?: Maybe<RelayMessage>
  destinationChainId: Scalars['BigInt']['output']
  encodedData: Scalars['String']['output']
  feeDirector?: Maybe<FeeDirector>
  finishedSigning: Scalars['Boolean']['output']
  from: Scalars['String']['output']
  logIndex: Scalars['Float']['output']
  messageHash: Scalars['String']['output']
  messageId: Scalars['String']['output']
  orderId: Scalars['String']['output']
  originationChainId: Scalars['BigInt']['output']
  requiredSignatures: Scalars['BigInt']['output']
  signatures?: Maybe<SignedForUserRequestPage>
  to: Scalars['String']['output']
  transaction?: Maybe<Transaction>
  transactionId: Scalars['String']['output']
}

export type UserRequestForSignatureSignaturesArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  before?: InputMaybe<Scalars['String']['input']>
  limit?: InputMaybe<Scalars['Int']['input']>
  orderBy?: InputMaybe<Scalars['String']['input']>
  orderDirection?: InputMaybe<Scalars['String']['input']>
  where?: InputMaybe<SignedForUserRequestFilter>
}

export type UserRequestForSignatureFilter = {
  AND?: InputMaybe<Array<InputMaybe<UserRequestForSignatureFilter>>>
  OR?: InputMaybe<Array<InputMaybe<UserRequestForSignatureFilter>>>
  amount?: InputMaybe<Scalars['BigInt']['input']>
  amount_gt?: InputMaybe<Scalars['BigInt']['input']>
  amount_gte?: InputMaybe<Scalars['BigInt']['input']>
  amount_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  amount_lt?: InputMaybe<Scalars['BigInt']['input']>
  amount_lte?: InputMaybe<Scalars['BigInt']['input']>
  amount_not?: InputMaybe<Scalars['BigInt']['input']>
  amount_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  blockId?: InputMaybe<Scalars['String']['input']>
  blockId_contains?: InputMaybe<Scalars['String']['input']>
  blockId_ends_with?: InputMaybe<Scalars['String']['input']>
  blockId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  blockId_not?: InputMaybe<Scalars['String']['input']>
  blockId_not_contains?: InputMaybe<Scalars['String']['input']>
  blockId_not_ends_with?: InputMaybe<Scalars['String']['input']>
  blockId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  blockId_not_starts_with?: InputMaybe<Scalars['String']['input']>
  blockId_starts_with?: InputMaybe<Scalars['String']['input']>
  bridgeId?: InputMaybe<Scalars['String']['input']>
  bridgeId_contains?: InputMaybe<Scalars['String']['input']>
  bridgeId_ends_with?: InputMaybe<Scalars['String']['input']>
  bridgeId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  bridgeId_not?: InputMaybe<Scalars['String']['input']>
  bridgeId_not_contains?: InputMaybe<Scalars['String']['input']>
  bridgeId_not_ends_with?: InputMaybe<Scalars['String']['input']>
  bridgeId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  bridgeId_not_starts_with?: InputMaybe<Scalars['String']['input']>
  bridgeId_starts_with?: InputMaybe<Scalars['String']['input']>
  confirmedSignatures?: InputMaybe<Scalars['BigInt']['input']>
  confirmedSignatures_gt?: InputMaybe<Scalars['BigInt']['input']>
  confirmedSignatures_gte?: InputMaybe<Scalars['BigInt']['input']>
  confirmedSignatures_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  confirmedSignatures_lt?: InputMaybe<Scalars['BigInt']['input']>
  confirmedSignatures_lte?: InputMaybe<Scalars['BigInt']['input']>
  confirmedSignatures_not?: InputMaybe<Scalars['BigInt']['input']>
  confirmedSignatures_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  destinationChainId?: InputMaybe<Scalars['BigInt']['input']>
  destinationChainId_gt?: InputMaybe<Scalars['BigInt']['input']>
  destinationChainId_gte?: InputMaybe<Scalars['BigInt']['input']>
  destinationChainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  destinationChainId_lt?: InputMaybe<Scalars['BigInt']['input']>
  destinationChainId_lte?: InputMaybe<Scalars['BigInt']['input']>
  destinationChainId_not?: InputMaybe<Scalars['BigInt']['input']>
  destinationChainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  encodedData?: InputMaybe<Scalars['String']['input']>
  encodedData_contains?: InputMaybe<Scalars['String']['input']>
  encodedData_ends_with?: InputMaybe<Scalars['String']['input']>
  encodedData_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  encodedData_not?: InputMaybe<Scalars['String']['input']>
  encodedData_not_contains?: InputMaybe<Scalars['String']['input']>
  encodedData_not_ends_with?: InputMaybe<Scalars['String']['input']>
  encodedData_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  encodedData_not_starts_with?: InputMaybe<Scalars['String']['input']>
  encodedData_starts_with?: InputMaybe<Scalars['String']['input']>
  finishedSigning?: InputMaybe<Scalars['Boolean']['input']>
  finishedSigning_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>
  finishedSigning_not?: InputMaybe<Scalars['Boolean']['input']>
  finishedSigning_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>
  from?: InputMaybe<Scalars['String']['input']>
  from_contains?: InputMaybe<Scalars['String']['input']>
  from_ends_with?: InputMaybe<Scalars['String']['input']>
  from_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  from_not?: InputMaybe<Scalars['String']['input']>
  from_not_contains?: InputMaybe<Scalars['String']['input']>
  from_not_ends_with?: InputMaybe<Scalars['String']['input']>
  from_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  from_not_starts_with?: InputMaybe<Scalars['String']['input']>
  from_starts_with?: InputMaybe<Scalars['String']['input']>
  logIndex?: InputMaybe<Scalars['Float']['input']>
  logIndex_gt?: InputMaybe<Scalars['Float']['input']>
  logIndex_gte?: InputMaybe<Scalars['Float']['input']>
  logIndex_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>
  logIndex_lt?: InputMaybe<Scalars['Float']['input']>
  logIndex_lte?: InputMaybe<Scalars['Float']['input']>
  logIndex_not?: InputMaybe<Scalars['Float']['input']>
  logIndex_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>
  messageHash?: InputMaybe<Scalars['String']['input']>
  messageHash_contains?: InputMaybe<Scalars['String']['input']>
  messageHash_ends_with?: InputMaybe<Scalars['String']['input']>
  messageHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  messageHash_not?: InputMaybe<Scalars['String']['input']>
  messageHash_not_contains?: InputMaybe<Scalars['String']['input']>
  messageHash_not_ends_with?: InputMaybe<Scalars['String']['input']>
  messageHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  messageHash_not_starts_with?: InputMaybe<Scalars['String']['input']>
  messageHash_starts_with?: InputMaybe<Scalars['String']['input']>
  messageId?: InputMaybe<Scalars['String']['input']>
  messageId_contains?: InputMaybe<Scalars['String']['input']>
  messageId_ends_with?: InputMaybe<Scalars['String']['input']>
  messageId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  messageId_not?: InputMaybe<Scalars['String']['input']>
  messageId_not_contains?: InputMaybe<Scalars['String']['input']>
  messageId_not_ends_with?: InputMaybe<Scalars['String']['input']>
  messageId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  messageId_not_starts_with?: InputMaybe<Scalars['String']['input']>
  messageId_starts_with?: InputMaybe<Scalars['String']['input']>
  orderId?: InputMaybe<Scalars['String']['input']>
  orderId_contains?: InputMaybe<Scalars['String']['input']>
  orderId_ends_with?: InputMaybe<Scalars['String']['input']>
  orderId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  orderId_not?: InputMaybe<Scalars['String']['input']>
  orderId_not_contains?: InputMaybe<Scalars['String']['input']>
  orderId_not_ends_with?: InputMaybe<Scalars['String']['input']>
  orderId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  orderId_not_starts_with?: InputMaybe<Scalars['String']['input']>
  orderId_starts_with?: InputMaybe<Scalars['String']['input']>
  originationChainId?: InputMaybe<Scalars['BigInt']['input']>
  originationChainId_gt?: InputMaybe<Scalars['BigInt']['input']>
  originationChainId_gte?: InputMaybe<Scalars['BigInt']['input']>
  originationChainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  originationChainId_lt?: InputMaybe<Scalars['BigInt']['input']>
  originationChainId_lte?: InputMaybe<Scalars['BigInt']['input']>
  originationChainId_not?: InputMaybe<Scalars['BigInt']['input']>
  originationChainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  requiredSignatures?: InputMaybe<Scalars['BigInt']['input']>
  requiredSignatures_gt?: InputMaybe<Scalars['BigInt']['input']>
  requiredSignatures_gte?: InputMaybe<Scalars['BigInt']['input']>
  requiredSignatures_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  requiredSignatures_lt?: InputMaybe<Scalars['BigInt']['input']>
  requiredSignatures_lte?: InputMaybe<Scalars['BigInt']['input']>
  requiredSignatures_not?: InputMaybe<Scalars['BigInt']['input']>
  requiredSignatures_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>
  to?: InputMaybe<Scalars['String']['input']>
  to_contains?: InputMaybe<Scalars['String']['input']>
  to_ends_with?: InputMaybe<Scalars['String']['input']>
  to_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  to_not?: InputMaybe<Scalars['String']['input']>
  to_not_contains?: InputMaybe<Scalars['String']['input']>
  to_not_ends_with?: InputMaybe<Scalars['String']['input']>
  to_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  to_not_starts_with?: InputMaybe<Scalars['String']['input']>
  to_starts_with?: InputMaybe<Scalars['String']['input']>
  transactionId?: InputMaybe<Scalars['String']['input']>
  transactionId_contains?: InputMaybe<Scalars['String']['input']>
  transactionId_ends_with?: InputMaybe<Scalars['String']['input']>
  transactionId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  transactionId_not?: InputMaybe<Scalars['String']['input']>
  transactionId_not_contains?: InputMaybe<Scalars['String']['input']>
  transactionId_not_ends_with?: InputMaybe<Scalars['String']['input']>
  transactionId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  transactionId_not_starts_with?: InputMaybe<Scalars['String']['input']>
  transactionId_starts_with?: InputMaybe<Scalars['String']['input']>
}

export type UserRequestForSignaturePage = {
  __typename?: 'UserRequestForSignaturePage'
  items: Array<UserRequestForSignature>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type ValidatorStatus = {
  __typename?: 'ValidatorStatus'
  active: Scalars['Boolean']['output']
  address: Scalars['String']['output']
  bridge?: Maybe<BridgeSide>
  bridgeId: Scalars['String']['output']
  logIndex: Scalars['Float']['output']
  orderId: Scalars['String']['output']
  transaction?: Maybe<Transaction>
  transactionId: Scalars['String']['output']
  validatorId: Scalars['String']['output']
}

export type ValidatorStatusFilter = {
  AND?: InputMaybe<Array<InputMaybe<ValidatorStatusFilter>>>
  OR?: InputMaybe<Array<InputMaybe<ValidatorStatusFilter>>>
  active?: InputMaybe<Scalars['Boolean']['input']>
  active_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>
  active_not?: InputMaybe<Scalars['Boolean']['input']>
  active_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>
  address?: InputMaybe<Scalars['String']['input']>
  address_contains?: InputMaybe<Scalars['String']['input']>
  address_ends_with?: InputMaybe<Scalars['String']['input']>
  address_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  address_not?: InputMaybe<Scalars['String']['input']>
  address_not_contains?: InputMaybe<Scalars['String']['input']>
  address_not_ends_with?: InputMaybe<Scalars['String']['input']>
  address_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  address_not_starts_with?: InputMaybe<Scalars['String']['input']>
  address_starts_with?: InputMaybe<Scalars['String']['input']>
  bridgeId?: InputMaybe<Scalars['String']['input']>
  bridgeId_contains?: InputMaybe<Scalars['String']['input']>
  bridgeId_ends_with?: InputMaybe<Scalars['String']['input']>
  bridgeId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  bridgeId_not?: InputMaybe<Scalars['String']['input']>
  bridgeId_not_contains?: InputMaybe<Scalars['String']['input']>
  bridgeId_not_ends_with?: InputMaybe<Scalars['String']['input']>
  bridgeId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  bridgeId_not_starts_with?: InputMaybe<Scalars['String']['input']>
  bridgeId_starts_with?: InputMaybe<Scalars['String']['input']>
  logIndex?: InputMaybe<Scalars['Float']['input']>
  logIndex_gt?: InputMaybe<Scalars['Float']['input']>
  logIndex_gte?: InputMaybe<Scalars['Float']['input']>
  logIndex_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>
  logIndex_lt?: InputMaybe<Scalars['Float']['input']>
  logIndex_lte?: InputMaybe<Scalars['Float']['input']>
  logIndex_not?: InputMaybe<Scalars['Float']['input']>
  logIndex_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>
  orderId?: InputMaybe<Scalars['String']['input']>
  orderId_contains?: InputMaybe<Scalars['String']['input']>
  orderId_ends_with?: InputMaybe<Scalars['String']['input']>
  orderId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  orderId_not?: InputMaybe<Scalars['String']['input']>
  orderId_not_contains?: InputMaybe<Scalars['String']['input']>
  orderId_not_ends_with?: InputMaybe<Scalars['String']['input']>
  orderId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  orderId_not_starts_with?: InputMaybe<Scalars['String']['input']>
  orderId_starts_with?: InputMaybe<Scalars['String']['input']>
  transactionId?: InputMaybe<Scalars['String']['input']>
  transactionId_contains?: InputMaybe<Scalars['String']['input']>
  transactionId_ends_with?: InputMaybe<Scalars['String']['input']>
  transactionId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  transactionId_not?: InputMaybe<Scalars['String']['input']>
  transactionId_not_contains?: InputMaybe<Scalars['String']['input']>
  transactionId_not_ends_with?: InputMaybe<Scalars['String']['input']>
  transactionId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  transactionId_not_starts_with?: InputMaybe<Scalars['String']['input']>
  transactionId_starts_with?: InputMaybe<Scalars['String']['input']>
  validatorId?: InputMaybe<Scalars['String']['input']>
  validatorId_contains?: InputMaybe<Scalars['String']['input']>
  validatorId_ends_with?: InputMaybe<Scalars['String']['input']>
  validatorId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  validatorId_not?: InputMaybe<Scalars['String']['input']>
  validatorId_not_contains?: InputMaybe<Scalars['String']['input']>
  validatorId_not_ends_with?: InputMaybe<Scalars['String']['input']>
  validatorId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  validatorId_not_starts_with?: InputMaybe<Scalars['String']['input']>
  validatorId_starts_with?: InputMaybe<Scalars['String']['input']>
}

export type ValidatorStatusPage = {
  __typename?: 'ValidatorStatusPage'
  items: Array<ValidatorStatus>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}
