/* eslint-disable */
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigInt: { input: any; output: any; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any; }
};

export type AffirmationCompleted = {
  __typename?: 'AffirmationCompleted';
  block: Block;
  blockId: Scalars['String']['output'];
  deliverer: Scalars['String']['output'];
  id: Scalars['String']['output'];
  logIndex: Scalars['Int']['output'];
  messageHash: Scalars['String']['output'];
  orderId: Scalars['String']['output'];
  signatures?: Maybe<SignedForAffirmationPage>;
  transaction: Transaction;
  transactionId: Scalars['String']['output'];
  userRequest: UserRequestForAffirmation;
  userRequestId: Scalars['String']['output'];
};


export type AffirmationCompletedSignaturesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<SignedForAffirmationFilter>;
};

export type AffirmationCompletedFilter = {
  AND?: InputMaybe<Array<InputMaybe<AffirmationCompletedFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<AffirmationCompletedFilter>>>;
  blockId?: InputMaybe<Scalars['String']['input']>;
  blockId_gt?: InputMaybe<Scalars['String']['input']>;
  blockId_gte?: InputMaybe<Scalars['String']['input']>;
  blockId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  blockId_lt?: InputMaybe<Scalars['String']['input']>;
  blockId_lte?: InputMaybe<Scalars['String']['input']>;
  blockId_not?: InputMaybe<Scalars['String']['input']>;
  blockId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  deliverer?: InputMaybe<Scalars['String']['input']>;
  deliverer_gt?: InputMaybe<Scalars['String']['input']>;
  deliverer_gte?: InputMaybe<Scalars['String']['input']>;
  deliverer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  deliverer_lt?: InputMaybe<Scalars['String']['input']>;
  deliverer_lte?: InputMaybe<Scalars['String']['input']>;
  deliverer_not?: InputMaybe<Scalars['String']['input']>;
  deliverer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_gt?: InputMaybe<Scalars['String']['input']>;
  id_gte?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_lt?: InputMaybe<Scalars['String']['input']>;
  id_lte?: InputMaybe<Scalars['String']['input']>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  logIndex?: InputMaybe<Scalars['Int']['input']>;
  logIndex_gt?: InputMaybe<Scalars['Int']['input']>;
  logIndex_gte?: InputMaybe<Scalars['Int']['input']>;
  logIndex_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  logIndex_lt?: InputMaybe<Scalars['Int']['input']>;
  logIndex_lte?: InputMaybe<Scalars['Int']['input']>;
  logIndex_not?: InputMaybe<Scalars['Int']['input']>;
  logIndex_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  messageHash?: InputMaybe<Scalars['String']['input']>;
  messageHash_gt?: InputMaybe<Scalars['String']['input']>;
  messageHash_gte?: InputMaybe<Scalars['String']['input']>;
  messageHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  messageHash_lt?: InputMaybe<Scalars['String']['input']>;
  messageHash_lte?: InputMaybe<Scalars['String']['input']>;
  messageHash_not?: InputMaybe<Scalars['String']['input']>;
  messageHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  orderId?: InputMaybe<Scalars['String']['input']>;
  orderId_gt?: InputMaybe<Scalars['String']['input']>;
  orderId_gte?: InputMaybe<Scalars['String']['input']>;
  orderId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  orderId_lt?: InputMaybe<Scalars['String']['input']>;
  orderId_lte?: InputMaybe<Scalars['String']['input']>;
  orderId_not?: InputMaybe<Scalars['String']['input']>;
  orderId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  transactionId?: InputMaybe<Scalars['String']['input']>;
  transactionId_gt?: InputMaybe<Scalars['String']['input']>;
  transactionId_gte?: InputMaybe<Scalars['String']['input']>;
  transactionId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  transactionId_lt?: InputMaybe<Scalars['String']['input']>;
  transactionId_lte?: InputMaybe<Scalars['String']['input']>;
  transactionId_not?: InputMaybe<Scalars['String']['input']>;
  transactionId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  userRequestId?: InputMaybe<Scalars['String']['input']>;
  userRequestId_gt?: InputMaybe<Scalars['String']['input']>;
  userRequestId_gte?: InputMaybe<Scalars['String']['input']>;
  userRequestId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  userRequestId_lt?: InputMaybe<Scalars['String']['input']>;
  userRequestId_lte?: InputMaybe<Scalars['String']['input']>;
  userRequestId_not?: InputMaybe<Scalars['String']['input']>;
  userRequestId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type AffirmationCompletedPage = {
  __typename?: 'AffirmationCompletedPage';
  items: Array<AffirmationCompleted>;
  pageInfo: PageInfo;
};

export type Block = {
  __typename?: 'Block';
  affirmationCompleted?: Maybe<AffirmationCompletedPage>;
  baseFeePerGas: Scalars['BigInt']['output'];
  chainId: Scalars['BigInt']['output'];
  hash: Scalars['String']['output'];
  id: Scalars['String']['output'];
  number: Scalars['BigInt']['output'];
  relayMessage?: Maybe<RelayMessagePage>;
  signedForAffirmation?: Maybe<SignedForAffirmationPage>;
  signedForUserRequest?: Maybe<SignedForUserRequestPage>;
  timestamp: Scalars['BigInt']['output'];
  transactions?: Maybe<TransactionPage>;
  userRequestForAffirmation?: Maybe<UserRequestForAffirmationPage>;
  userRequestForSignature?: Maybe<UserRequestForSignaturePage>;
};


export type BlockAffirmationCompletedArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<AffirmationCompletedFilter>;
};


export type BlockRelayMessageArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<RelayMessageFilter>;
};


export type BlockSignedForAffirmationArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<SignedForAffirmationFilter>;
};


export type BlockSignedForUserRequestArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<SignedForUserRequestFilter>;
};


export type BlockTransactionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<TransactionFilter>;
};


export type BlockUserRequestForAffirmationArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<UserRequestForAffirmationFilter>;
};


export type BlockUserRequestForSignatureArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<UserRequestForSignatureFilter>;
};

export type BlockFilter = {
  AND?: InputMaybe<Array<InputMaybe<BlockFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<BlockFilter>>>;
  baseFeePerGas?: InputMaybe<Scalars['BigInt']['input']>;
  baseFeePerGas_gt?: InputMaybe<Scalars['BigInt']['input']>;
  baseFeePerGas_gte?: InputMaybe<Scalars['BigInt']['input']>;
  baseFeePerGas_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  baseFeePerGas_lt?: InputMaybe<Scalars['BigInt']['input']>;
  baseFeePerGas_lte?: InputMaybe<Scalars['BigInt']['input']>;
  baseFeePerGas_not?: InputMaybe<Scalars['BigInt']['input']>;
  baseFeePerGas_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  chainId?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  chainId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_not?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  hash?: InputMaybe<Scalars['String']['input']>;
  hash_gt?: InputMaybe<Scalars['String']['input']>;
  hash_gte?: InputMaybe<Scalars['String']['input']>;
  hash_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  hash_lt?: InputMaybe<Scalars['String']['input']>;
  hash_lte?: InputMaybe<Scalars['String']['input']>;
  hash_not?: InputMaybe<Scalars['String']['input']>;
  hash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_gt?: InputMaybe<Scalars['String']['input']>;
  id_gte?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_lt?: InputMaybe<Scalars['String']['input']>;
  id_lte?: InputMaybe<Scalars['String']['input']>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  number?: InputMaybe<Scalars['BigInt']['input']>;
  number_gt?: InputMaybe<Scalars['BigInt']['input']>;
  number_gte?: InputMaybe<Scalars['BigInt']['input']>;
  number_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  number_lt?: InputMaybe<Scalars['BigInt']['input']>;
  number_lte?: InputMaybe<Scalars['BigInt']['input']>;
  number_not?: InputMaybe<Scalars['BigInt']['input']>;
  number_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
};

export type BlockPage = {
  __typename?: 'BlockPage';
  items: Array<Block>;
  pageInfo: PageInfo;
};

export type BridgeSide = {
  __typename?: 'BridgeSide';
  address: Scalars['String']['output'];
  chainId: Scalars['BigInt']['output'];
  id: Scalars['String']['output'];
  provider: Provider;
  side: Direction;
};

export type BridgeSideFilter = {
  AND?: InputMaybe<Array<InputMaybe<BridgeSideFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<BridgeSideFilter>>>;
  address?: InputMaybe<Scalars['String']['input']>;
  address_gt?: InputMaybe<Scalars['String']['input']>;
  address_gte?: InputMaybe<Scalars['String']['input']>;
  address_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  address_lt?: InputMaybe<Scalars['String']['input']>;
  address_lte?: InputMaybe<Scalars['String']['input']>;
  address_not?: InputMaybe<Scalars['String']['input']>;
  address_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  chainId?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  chainId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_not?: InputMaybe<Scalars['BigInt']['input']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_gt?: InputMaybe<Scalars['String']['input']>;
  id_gte?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_lt?: InputMaybe<Scalars['String']['input']>;
  id_lte?: InputMaybe<Scalars['String']['input']>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  provider?: InputMaybe<Provider>;
  provider_in?: InputMaybe<Array<InputMaybe<Provider>>>;
  provider_not?: InputMaybe<Provider>;
  provider_not_in?: InputMaybe<Array<InputMaybe<Provider>>>;
  side?: InputMaybe<Direction>;
  side_in?: InputMaybe<Array<InputMaybe<Direction>>>;
  side_not?: InputMaybe<Direction>;
  side_not_in?: InputMaybe<Array<InputMaybe<Direction>>>;
};

export type BridgeSidePage = {
  __typename?: 'BridgeSidePage';
  items: Array<BridgeSide>;
  pageInfo: PageInfo;
};

export enum Direction {
  Foreign = 'foreign',
  Home = 'home'
}

export type FeeDirector = {
  __typename?: 'FeeDirector';
  excludePriority: Scalars['Boolean']['output'];
  feeType: Scalars['String']['output'];
  id: Scalars['String']['output'];
  limit: Scalars['BigInt']['output'];
  multiplier: Scalars['BigInt']['output'];
  recipient: Scalars['String']['output'];
  settings: Scalars['BigInt']['output'];
  unwrapped: Scalars['Boolean']['output'];
  userRequest: UserRequestForSignature;
  userRequestId: Scalars['String']['output'];
};

export type FeeDirectorFilter = {
  AND?: InputMaybe<Array<InputMaybe<FeeDirectorFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<FeeDirectorFilter>>>;
  excludePriority?: InputMaybe<Scalars['Boolean']['input']>;
  excludePriority_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  excludePriority_not?: InputMaybe<Scalars['Boolean']['input']>;
  excludePriority_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  feeType?: InputMaybe<Scalars['String']['input']>;
  feeType_contains?: InputMaybe<Scalars['String']['input']>;
  feeType_ends_with?: InputMaybe<Scalars['String']['input']>;
  feeType_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  feeType_not?: InputMaybe<Scalars['String']['input']>;
  feeType_not_contains?: InputMaybe<Scalars['String']['input']>;
  feeType_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  feeType_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  feeType_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  feeType_starts_with?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_gt?: InputMaybe<Scalars['String']['input']>;
  id_gte?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_lt?: InputMaybe<Scalars['String']['input']>;
  id_lte?: InputMaybe<Scalars['String']['input']>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  limit?: InputMaybe<Scalars['BigInt']['input']>;
  limit_gt?: InputMaybe<Scalars['BigInt']['input']>;
  limit_gte?: InputMaybe<Scalars['BigInt']['input']>;
  limit_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  limit_lt?: InputMaybe<Scalars['BigInt']['input']>;
  limit_lte?: InputMaybe<Scalars['BigInt']['input']>;
  limit_not?: InputMaybe<Scalars['BigInt']['input']>;
  limit_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  multiplier?: InputMaybe<Scalars['BigInt']['input']>;
  multiplier_gt?: InputMaybe<Scalars['BigInt']['input']>;
  multiplier_gte?: InputMaybe<Scalars['BigInt']['input']>;
  multiplier_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  multiplier_lt?: InputMaybe<Scalars['BigInt']['input']>;
  multiplier_lte?: InputMaybe<Scalars['BigInt']['input']>;
  multiplier_not?: InputMaybe<Scalars['BigInt']['input']>;
  multiplier_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  recipient?: InputMaybe<Scalars['String']['input']>;
  recipient_gt?: InputMaybe<Scalars['String']['input']>;
  recipient_gte?: InputMaybe<Scalars['String']['input']>;
  recipient_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  recipient_lt?: InputMaybe<Scalars['String']['input']>;
  recipient_lte?: InputMaybe<Scalars['String']['input']>;
  recipient_not?: InputMaybe<Scalars['String']['input']>;
  recipient_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  settings?: InputMaybe<Scalars['BigInt']['input']>;
  settings_gt?: InputMaybe<Scalars['BigInt']['input']>;
  settings_gte?: InputMaybe<Scalars['BigInt']['input']>;
  settings_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  settings_lt?: InputMaybe<Scalars['BigInt']['input']>;
  settings_lte?: InputMaybe<Scalars['BigInt']['input']>;
  settings_not?: InputMaybe<Scalars['BigInt']['input']>;
  settings_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  unwrapped?: InputMaybe<Scalars['Boolean']['input']>;
  unwrapped_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  unwrapped_not?: InputMaybe<Scalars['Boolean']['input']>;
  unwrapped_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  userRequestId?: InputMaybe<Scalars['String']['input']>;
  userRequestId_gt?: InputMaybe<Scalars['String']['input']>;
  userRequestId_gte?: InputMaybe<Scalars['String']['input']>;
  userRequestId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  userRequestId_lt?: InputMaybe<Scalars['String']['input']>;
  userRequestId_lte?: InputMaybe<Scalars['String']['input']>;
  userRequestId_not?: InputMaybe<Scalars['String']['input']>;
  userRequestId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type FeeDirectorPage = {
  __typename?: 'FeeDirectorPage';
  items: Array<FeeDirector>;
  pageInfo: PageInfo;
};

export type LatestRequiredSignaturesChanged = {
  __typename?: 'LatestRequiredSignaturesChanged';
  id: Scalars['String']['output'];
  order: RequiredSignaturesChanged;
  orderId: Scalars['String']['output'];
};

export type LatestRequiredSignaturesChangedFilter = {
  AND?: InputMaybe<Array<InputMaybe<LatestRequiredSignaturesChangedFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<LatestRequiredSignaturesChangedFilter>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_gt?: InputMaybe<Scalars['String']['input']>;
  id_gte?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_lt?: InputMaybe<Scalars['String']['input']>;
  id_lte?: InputMaybe<Scalars['String']['input']>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  orderId?: InputMaybe<Scalars['String']['input']>;
  orderId_gt?: InputMaybe<Scalars['String']['input']>;
  orderId_gte?: InputMaybe<Scalars['String']['input']>;
  orderId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  orderId_lt?: InputMaybe<Scalars['String']['input']>;
  orderId_lte?: InputMaybe<Scalars['String']['input']>;
  orderId_not?: InputMaybe<Scalars['String']['input']>;
  orderId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type LatestRequiredSignaturesChangedPage = {
  __typename?: 'LatestRequiredSignaturesChangedPage';
  items: Array<LatestRequiredSignaturesChanged>;
  pageInfo: PageInfo;
};

export type LatestValidatorStatusUpdate = {
  __typename?: 'LatestValidatorStatusUpdate';
  bridge: BridgeSide;
  bridgeId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  order: ValidatorStatusUpdate;
  orderId: Scalars['String']['output'];
};

export type LatestValidatorStatusUpdateFilter = {
  AND?: InputMaybe<Array<InputMaybe<LatestValidatorStatusUpdateFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<LatestValidatorStatusUpdateFilter>>>;
  bridgeId?: InputMaybe<Scalars['String']['input']>;
  bridgeId_gt?: InputMaybe<Scalars['String']['input']>;
  bridgeId_gte?: InputMaybe<Scalars['String']['input']>;
  bridgeId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  bridgeId_lt?: InputMaybe<Scalars['String']['input']>;
  bridgeId_lte?: InputMaybe<Scalars['String']['input']>;
  bridgeId_not?: InputMaybe<Scalars['String']['input']>;
  bridgeId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_gt?: InputMaybe<Scalars['String']['input']>;
  id_gte?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_lt?: InputMaybe<Scalars['String']['input']>;
  id_lte?: InputMaybe<Scalars['String']['input']>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  orderId?: InputMaybe<Scalars['String']['input']>;
  orderId_gt?: InputMaybe<Scalars['String']['input']>;
  orderId_gte?: InputMaybe<Scalars['String']['input']>;
  orderId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  orderId_lt?: InputMaybe<Scalars['String']['input']>;
  orderId_lte?: InputMaybe<Scalars['String']['input']>;
  orderId_not?: InputMaybe<Scalars['String']['input']>;
  orderId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type LatestValidatorStatusUpdatePage = {
  __typename?: 'LatestValidatorStatusUpdatePage';
  items: Array<LatestValidatorStatusUpdate>;
  pageInfo: PageInfo;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export enum Provider {
  Pulsechain = 'pulsechain',
  Tokensex = 'tokensex'
}

export type Query = {
  __typename?: 'Query';
  _meta?: Maybe<_Meta>;
  affirmationCompleted?: Maybe<AffirmationCompleted>;
  affirmationCompleteds: AffirmationCompletedPage;
  block?: Maybe<Block>;
  blocks: BlockPage;
  bridgeSide?: Maybe<BridgeSide>;
  bridgeSides: BridgeSidePage;
  feeDirector?: Maybe<FeeDirector>;
  feeDirectors: FeeDirectorPage;
  latestRequiredSignaturesChanged?: Maybe<LatestRequiredSignaturesChanged>;
  latestRequiredSignaturesChangeds: LatestRequiredSignaturesChangedPage;
  latestValidatorStatusUpdate?: Maybe<LatestValidatorStatusUpdate>;
  latestValidatorStatusUpdates: LatestValidatorStatusUpdatePage;
  relayMessage?: Maybe<RelayMessage>;
  relayMessages: RelayMessagePage;
  requiredSignaturesChanged?: Maybe<RequiredSignaturesChanged>;
  requiredSignaturesChangeds: RequiredSignaturesChangedPage;
  reverseMessageHashBinding?: Maybe<ReverseMessageHashBinding>;
  reverseMessageHashBindings: ReverseMessageHashBindingPage;
  signedForAffirmation?: Maybe<SignedForAffirmation>;
  signedForAffirmations: SignedForAffirmationPage;
  signedForUserRequest?: Maybe<SignedForUserRequest>;
  signedForUserRequests: SignedForUserRequestPage;
  transaction?: Maybe<Transaction>;
  transactions: TransactionPage;
  userRequestForAffirmation?: Maybe<UserRequestForAffirmation>;
  userRequestForAffirmations: UserRequestForAffirmationPage;
  userRequestForSignature?: Maybe<UserRequestForSignature>;
  userRequestForSignatures: UserRequestForSignaturePage;
  validatorStatusUpdate?: Maybe<ValidatorStatusUpdate>;
  validatorStatusUpdates: ValidatorStatusUpdatePage;
};


export type QueryAffirmationCompletedArgs = {
  id: Scalars['String']['input'];
};


export type QueryAffirmationCompletedsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<AffirmationCompletedFilter>;
};


export type QueryBlockArgs = {
  id: Scalars['String']['input'];
};


export type QueryBlocksArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<BlockFilter>;
};


export type QueryBridgeSideArgs = {
  id: Scalars['String']['input'];
};


export type QueryBridgeSidesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<BridgeSideFilter>;
};


export type QueryFeeDirectorArgs = {
  id: Scalars['String']['input'];
};


export type QueryFeeDirectorsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<FeeDirectorFilter>;
};


export type QueryLatestRequiredSignaturesChangedArgs = {
  id: Scalars['String']['input'];
};


export type QueryLatestRequiredSignaturesChangedsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<LatestRequiredSignaturesChangedFilter>;
};


export type QueryLatestValidatorStatusUpdateArgs = {
  id: Scalars['String']['input'];
};


export type QueryLatestValidatorStatusUpdatesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<LatestValidatorStatusUpdateFilter>;
};


export type QueryRelayMessageArgs = {
  id: Scalars['String']['input'];
};


export type QueryRelayMessagesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<RelayMessageFilter>;
};


export type QueryRequiredSignaturesChangedArgs = {
  id: Scalars['String']['input'];
};


export type QueryRequiredSignaturesChangedsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<RequiredSignaturesChangedFilter>;
};


export type QueryReverseMessageHashBindingArgs = {
  id: Scalars['String']['input'];
};


export type QueryReverseMessageHashBindingsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<ReverseMessageHashBindingFilter>;
};


export type QuerySignedForAffirmationArgs = {
  id: Scalars['String']['input'];
};


export type QuerySignedForAffirmationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<SignedForAffirmationFilter>;
};


export type QuerySignedForUserRequestArgs = {
  id: Scalars['String']['input'];
};


export type QuerySignedForUserRequestsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<SignedForUserRequestFilter>;
};


export type QueryTransactionArgs = {
  id: Scalars['String']['input'];
};


export type QueryTransactionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<TransactionFilter>;
};


export type QueryUserRequestForAffirmationArgs = {
  id: Scalars['String']['input'];
};


export type QueryUserRequestForAffirmationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<UserRequestForAffirmationFilter>;
};


export type QueryUserRequestForSignatureArgs = {
  id: Scalars['String']['input'];
};


export type QueryUserRequestForSignaturesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<UserRequestForSignatureFilter>;
};


export type QueryValidatorStatusUpdateArgs = {
  id: Scalars['String']['input'];
};


export type QueryValidatorStatusUpdatesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<ValidatorStatusUpdateFilter>;
};

export type RelayMessage = {
  __typename?: 'RelayMessage';
  block: Block;
  blockId: Scalars['String']['output'];
  deliverer: Scalars['String']['output'];
  id: Scalars['String']['output'];
  logIndex: Scalars['Int']['output'];
  messageHash: Scalars['String']['output'];
  orderId: Scalars['String']['output'];
  signatures?: Maybe<SignedForUserRequestPage>;
  transaction: Transaction;
  transactionId: Scalars['String']['output'];
  userRequest: UserRequestForSignature;
  userRequestId: Scalars['String']['output'];
};


export type RelayMessageSignaturesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<SignedForUserRequestFilter>;
};

export type RelayMessageFilter = {
  AND?: InputMaybe<Array<InputMaybe<RelayMessageFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<RelayMessageFilter>>>;
  blockId?: InputMaybe<Scalars['String']['input']>;
  blockId_gt?: InputMaybe<Scalars['String']['input']>;
  blockId_gte?: InputMaybe<Scalars['String']['input']>;
  blockId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  blockId_lt?: InputMaybe<Scalars['String']['input']>;
  blockId_lte?: InputMaybe<Scalars['String']['input']>;
  blockId_not?: InputMaybe<Scalars['String']['input']>;
  blockId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  deliverer?: InputMaybe<Scalars['String']['input']>;
  deliverer_gt?: InputMaybe<Scalars['String']['input']>;
  deliverer_gte?: InputMaybe<Scalars['String']['input']>;
  deliverer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  deliverer_lt?: InputMaybe<Scalars['String']['input']>;
  deliverer_lte?: InputMaybe<Scalars['String']['input']>;
  deliverer_not?: InputMaybe<Scalars['String']['input']>;
  deliverer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_gt?: InputMaybe<Scalars['String']['input']>;
  id_gte?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_lt?: InputMaybe<Scalars['String']['input']>;
  id_lte?: InputMaybe<Scalars['String']['input']>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  logIndex?: InputMaybe<Scalars['Int']['input']>;
  logIndex_gt?: InputMaybe<Scalars['Int']['input']>;
  logIndex_gte?: InputMaybe<Scalars['Int']['input']>;
  logIndex_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  logIndex_lt?: InputMaybe<Scalars['Int']['input']>;
  logIndex_lte?: InputMaybe<Scalars['Int']['input']>;
  logIndex_not?: InputMaybe<Scalars['Int']['input']>;
  logIndex_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  messageHash?: InputMaybe<Scalars['String']['input']>;
  messageHash_gt?: InputMaybe<Scalars['String']['input']>;
  messageHash_gte?: InputMaybe<Scalars['String']['input']>;
  messageHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  messageHash_lt?: InputMaybe<Scalars['String']['input']>;
  messageHash_lte?: InputMaybe<Scalars['String']['input']>;
  messageHash_not?: InputMaybe<Scalars['String']['input']>;
  messageHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  orderId?: InputMaybe<Scalars['String']['input']>;
  orderId_gt?: InputMaybe<Scalars['String']['input']>;
  orderId_gte?: InputMaybe<Scalars['String']['input']>;
  orderId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  orderId_lt?: InputMaybe<Scalars['String']['input']>;
  orderId_lte?: InputMaybe<Scalars['String']['input']>;
  orderId_not?: InputMaybe<Scalars['String']['input']>;
  orderId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  transactionId?: InputMaybe<Scalars['String']['input']>;
  transactionId_gt?: InputMaybe<Scalars['String']['input']>;
  transactionId_gte?: InputMaybe<Scalars['String']['input']>;
  transactionId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  transactionId_lt?: InputMaybe<Scalars['String']['input']>;
  transactionId_lte?: InputMaybe<Scalars['String']['input']>;
  transactionId_not?: InputMaybe<Scalars['String']['input']>;
  transactionId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  userRequestId?: InputMaybe<Scalars['String']['input']>;
  userRequestId_gt?: InputMaybe<Scalars['String']['input']>;
  userRequestId_gte?: InputMaybe<Scalars['String']['input']>;
  userRequestId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  userRequestId_lt?: InputMaybe<Scalars['String']['input']>;
  userRequestId_lte?: InputMaybe<Scalars['String']['input']>;
  userRequestId_not?: InputMaybe<Scalars['String']['input']>;
  userRequestId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type RelayMessagePage = {
  __typename?: 'RelayMessagePage';
  items: Array<RelayMessage>;
  pageInfo: PageInfo;
};

export type RequiredSignaturesChanged = {
  __typename?: 'RequiredSignaturesChanged';
  bridge: BridgeSide;
  bridgeId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  logIndex: Scalars['Int']['output'];
  transaction: Transaction;
  transactionId: Scalars['String']['output'];
  value: Scalars['BigInt']['output'];
};

export type RequiredSignaturesChangedFilter = {
  AND?: InputMaybe<Array<InputMaybe<RequiredSignaturesChangedFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<RequiredSignaturesChangedFilter>>>;
  bridgeId?: InputMaybe<Scalars['String']['input']>;
  bridgeId_gt?: InputMaybe<Scalars['String']['input']>;
  bridgeId_gte?: InputMaybe<Scalars['String']['input']>;
  bridgeId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  bridgeId_lt?: InputMaybe<Scalars['String']['input']>;
  bridgeId_lte?: InputMaybe<Scalars['String']['input']>;
  bridgeId_not?: InputMaybe<Scalars['String']['input']>;
  bridgeId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_gt?: InputMaybe<Scalars['String']['input']>;
  id_gte?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_lt?: InputMaybe<Scalars['String']['input']>;
  id_lte?: InputMaybe<Scalars['String']['input']>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  logIndex?: InputMaybe<Scalars['Int']['input']>;
  logIndex_gt?: InputMaybe<Scalars['Int']['input']>;
  logIndex_gte?: InputMaybe<Scalars['Int']['input']>;
  logIndex_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  logIndex_lt?: InputMaybe<Scalars['Int']['input']>;
  logIndex_lte?: InputMaybe<Scalars['Int']['input']>;
  logIndex_not?: InputMaybe<Scalars['Int']['input']>;
  logIndex_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  transactionId?: InputMaybe<Scalars['String']['input']>;
  transactionId_gt?: InputMaybe<Scalars['String']['input']>;
  transactionId_gte?: InputMaybe<Scalars['String']['input']>;
  transactionId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  transactionId_lt?: InputMaybe<Scalars['String']['input']>;
  transactionId_lte?: InputMaybe<Scalars['String']['input']>;
  transactionId_not?: InputMaybe<Scalars['String']['input']>;
  transactionId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  value?: InputMaybe<Scalars['BigInt']['input']>;
  value_gt?: InputMaybe<Scalars['BigInt']['input']>;
  value_gte?: InputMaybe<Scalars['BigInt']['input']>;
  value_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  value_lt?: InputMaybe<Scalars['BigInt']['input']>;
  value_lte?: InputMaybe<Scalars['BigInt']['input']>;
  value_not?: InputMaybe<Scalars['BigInt']['input']>;
  value_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
};

export type RequiredSignaturesChangedPage = {
  __typename?: 'RequiredSignaturesChangedPage';
  items: Array<RequiredSignaturesChanged>;
  pageInfo: PageInfo;
};

export type ReverseMessageHashBinding = {
  __typename?: 'ReverseMessageHashBinding';
  bridge: BridgeSide;
  bridgeId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  userRequest: UserRequestForSignature;
  userRequestId: Scalars['String']['output'];
};

export type ReverseMessageHashBindingFilter = {
  AND?: InputMaybe<Array<InputMaybe<ReverseMessageHashBindingFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<ReverseMessageHashBindingFilter>>>;
  bridgeId?: InputMaybe<Scalars['String']['input']>;
  bridgeId_gt?: InputMaybe<Scalars['String']['input']>;
  bridgeId_gte?: InputMaybe<Scalars['String']['input']>;
  bridgeId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  bridgeId_lt?: InputMaybe<Scalars['String']['input']>;
  bridgeId_lte?: InputMaybe<Scalars['String']['input']>;
  bridgeId_not?: InputMaybe<Scalars['String']['input']>;
  bridgeId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_gt?: InputMaybe<Scalars['String']['input']>;
  id_gte?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_lt?: InputMaybe<Scalars['String']['input']>;
  id_lte?: InputMaybe<Scalars['String']['input']>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  userRequestId?: InputMaybe<Scalars['String']['input']>;
  userRequestId_gt?: InputMaybe<Scalars['String']['input']>;
  userRequestId_gte?: InputMaybe<Scalars['String']['input']>;
  userRequestId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  userRequestId_lt?: InputMaybe<Scalars['String']['input']>;
  userRequestId_lte?: InputMaybe<Scalars['String']['input']>;
  userRequestId_not?: InputMaybe<Scalars['String']['input']>;
  userRequestId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ReverseMessageHashBindingPage = {
  __typename?: 'ReverseMessageHashBindingPage';
  items: Array<ReverseMessageHashBinding>;
  pageInfo: PageInfo;
};

export type SignedForAffirmation = {
  __typename?: 'SignedForAffirmation';
  block: Block;
  blockId: Scalars['String']['output'];
  bridge: BridgeSide;
  bridgeId: Scalars['String']['output'];
  delivery?: Maybe<AffirmationCompleted>;
  deliveryId?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  logIndex: Scalars['Int']['output'];
  messageHash: Scalars['String']['output'];
  orderId: Scalars['String']['output'];
  transaction: Transaction;
  transactionId: Scalars['String']['output'];
  userRequest: UserRequestForAffirmation;
  userRequestId: Scalars['String']['output'];
  validatorId: Scalars['String']['output'];
};

export type SignedForAffirmationFilter = {
  AND?: InputMaybe<Array<InputMaybe<SignedForAffirmationFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<SignedForAffirmationFilter>>>;
  blockId?: InputMaybe<Scalars['String']['input']>;
  blockId_gt?: InputMaybe<Scalars['String']['input']>;
  blockId_gte?: InputMaybe<Scalars['String']['input']>;
  blockId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  blockId_lt?: InputMaybe<Scalars['String']['input']>;
  blockId_lte?: InputMaybe<Scalars['String']['input']>;
  blockId_not?: InputMaybe<Scalars['String']['input']>;
  blockId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  bridgeId?: InputMaybe<Scalars['String']['input']>;
  bridgeId_gt?: InputMaybe<Scalars['String']['input']>;
  bridgeId_gte?: InputMaybe<Scalars['String']['input']>;
  bridgeId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  bridgeId_lt?: InputMaybe<Scalars['String']['input']>;
  bridgeId_lte?: InputMaybe<Scalars['String']['input']>;
  bridgeId_not?: InputMaybe<Scalars['String']['input']>;
  bridgeId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  deliveryId?: InputMaybe<Scalars['String']['input']>;
  deliveryId_gt?: InputMaybe<Scalars['String']['input']>;
  deliveryId_gte?: InputMaybe<Scalars['String']['input']>;
  deliveryId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  deliveryId_lt?: InputMaybe<Scalars['String']['input']>;
  deliveryId_lte?: InputMaybe<Scalars['String']['input']>;
  deliveryId_not?: InputMaybe<Scalars['String']['input']>;
  deliveryId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_gt?: InputMaybe<Scalars['String']['input']>;
  id_gte?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_lt?: InputMaybe<Scalars['String']['input']>;
  id_lte?: InputMaybe<Scalars['String']['input']>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  logIndex?: InputMaybe<Scalars['Int']['input']>;
  logIndex_gt?: InputMaybe<Scalars['Int']['input']>;
  logIndex_gte?: InputMaybe<Scalars['Int']['input']>;
  logIndex_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  logIndex_lt?: InputMaybe<Scalars['Int']['input']>;
  logIndex_lte?: InputMaybe<Scalars['Int']['input']>;
  logIndex_not?: InputMaybe<Scalars['Int']['input']>;
  logIndex_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  messageHash?: InputMaybe<Scalars['String']['input']>;
  messageHash_gt?: InputMaybe<Scalars['String']['input']>;
  messageHash_gte?: InputMaybe<Scalars['String']['input']>;
  messageHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  messageHash_lt?: InputMaybe<Scalars['String']['input']>;
  messageHash_lte?: InputMaybe<Scalars['String']['input']>;
  messageHash_not?: InputMaybe<Scalars['String']['input']>;
  messageHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  orderId?: InputMaybe<Scalars['String']['input']>;
  orderId_gt?: InputMaybe<Scalars['String']['input']>;
  orderId_gte?: InputMaybe<Scalars['String']['input']>;
  orderId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  orderId_lt?: InputMaybe<Scalars['String']['input']>;
  orderId_lte?: InputMaybe<Scalars['String']['input']>;
  orderId_not?: InputMaybe<Scalars['String']['input']>;
  orderId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  transactionId?: InputMaybe<Scalars['String']['input']>;
  transactionId_gt?: InputMaybe<Scalars['String']['input']>;
  transactionId_gte?: InputMaybe<Scalars['String']['input']>;
  transactionId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  transactionId_lt?: InputMaybe<Scalars['String']['input']>;
  transactionId_lte?: InputMaybe<Scalars['String']['input']>;
  transactionId_not?: InputMaybe<Scalars['String']['input']>;
  transactionId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  userRequestId?: InputMaybe<Scalars['String']['input']>;
  userRequestId_gt?: InputMaybe<Scalars['String']['input']>;
  userRequestId_gte?: InputMaybe<Scalars['String']['input']>;
  userRequestId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  userRequestId_lt?: InputMaybe<Scalars['String']['input']>;
  userRequestId_lte?: InputMaybe<Scalars['String']['input']>;
  userRequestId_not?: InputMaybe<Scalars['String']['input']>;
  userRequestId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  validatorId?: InputMaybe<Scalars['String']['input']>;
  validatorId_gt?: InputMaybe<Scalars['String']['input']>;
  validatorId_gte?: InputMaybe<Scalars['String']['input']>;
  validatorId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  validatorId_lt?: InputMaybe<Scalars['String']['input']>;
  validatorId_lte?: InputMaybe<Scalars['String']['input']>;
  validatorId_not?: InputMaybe<Scalars['String']['input']>;
  validatorId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type SignedForAffirmationPage = {
  __typename?: 'SignedForAffirmationPage';
  items: Array<SignedForAffirmation>;
  pageInfo: PageInfo;
};

export type SignedForUserRequest = {
  __typename?: 'SignedForUserRequest';
  block: Block;
  blockId: Scalars['String']['output'];
  bridge: BridgeSide;
  bridgeId: Scalars['String']['output'];
  delivery?: Maybe<RelayMessage>;
  deliveryId?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  logIndex: Scalars['Int']['output'];
  messageHash: Scalars['String']['output'];
  orderId: Scalars['String']['output'];
  transaction: Transaction;
  transactionId: Scalars['String']['output'];
  userRequest: UserRequestForSignature;
  userRequestId: Scalars['String']['output'];
  validatorId: Scalars['String']['output'];
};

export type SignedForUserRequestFilter = {
  AND?: InputMaybe<Array<InputMaybe<SignedForUserRequestFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<SignedForUserRequestFilter>>>;
  blockId?: InputMaybe<Scalars['String']['input']>;
  blockId_gt?: InputMaybe<Scalars['String']['input']>;
  blockId_gte?: InputMaybe<Scalars['String']['input']>;
  blockId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  blockId_lt?: InputMaybe<Scalars['String']['input']>;
  blockId_lte?: InputMaybe<Scalars['String']['input']>;
  blockId_not?: InputMaybe<Scalars['String']['input']>;
  blockId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  bridgeId?: InputMaybe<Scalars['String']['input']>;
  bridgeId_gt?: InputMaybe<Scalars['String']['input']>;
  bridgeId_gte?: InputMaybe<Scalars['String']['input']>;
  bridgeId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  bridgeId_lt?: InputMaybe<Scalars['String']['input']>;
  bridgeId_lte?: InputMaybe<Scalars['String']['input']>;
  bridgeId_not?: InputMaybe<Scalars['String']['input']>;
  bridgeId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  deliveryId?: InputMaybe<Scalars['String']['input']>;
  deliveryId_gt?: InputMaybe<Scalars['String']['input']>;
  deliveryId_gte?: InputMaybe<Scalars['String']['input']>;
  deliveryId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  deliveryId_lt?: InputMaybe<Scalars['String']['input']>;
  deliveryId_lte?: InputMaybe<Scalars['String']['input']>;
  deliveryId_not?: InputMaybe<Scalars['String']['input']>;
  deliveryId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_gt?: InputMaybe<Scalars['String']['input']>;
  id_gte?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_lt?: InputMaybe<Scalars['String']['input']>;
  id_lte?: InputMaybe<Scalars['String']['input']>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  logIndex?: InputMaybe<Scalars['Int']['input']>;
  logIndex_gt?: InputMaybe<Scalars['Int']['input']>;
  logIndex_gte?: InputMaybe<Scalars['Int']['input']>;
  logIndex_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  logIndex_lt?: InputMaybe<Scalars['Int']['input']>;
  logIndex_lte?: InputMaybe<Scalars['Int']['input']>;
  logIndex_not?: InputMaybe<Scalars['Int']['input']>;
  logIndex_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  messageHash?: InputMaybe<Scalars['String']['input']>;
  messageHash_gt?: InputMaybe<Scalars['String']['input']>;
  messageHash_gte?: InputMaybe<Scalars['String']['input']>;
  messageHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  messageHash_lt?: InputMaybe<Scalars['String']['input']>;
  messageHash_lte?: InputMaybe<Scalars['String']['input']>;
  messageHash_not?: InputMaybe<Scalars['String']['input']>;
  messageHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  orderId?: InputMaybe<Scalars['String']['input']>;
  orderId_gt?: InputMaybe<Scalars['String']['input']>;
  orderId_gte?: InputMaybe<Scalars['String']['input']>;
  orderId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  orderId_lt?: InputMaybe<Scalars['String']['input']>;
  orderId_lte?: InputMaybe<Scalars['String']['input']>;
  orderId_not?: InputMaybe<Scalars['String']['input']>;
  orderId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  transactionId?: InputMaybe<Scalars['String']['input']>;
  transactionId_gt?: InputMaybe<Scalars['String']['input']>;
  transactionId_gte?: InputMaybe<Scalars['String']['input']>;
  transactionId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  transactionId_lt?: InputMaybe<Scalars['String']['input']>;
  transactionId_lte?: InputMaybe<Scalars['String']['input']>;
  transactionId_not?: InputMaybe<Scalars['String']['input']>;
  transactionId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  userRequestId?: InputMaybe<Scalars['String']['input']>;
  userRequestId_gt?: InputMaybe<Scalars['String']['input']>;
  userRequestId_gte?: InputMaybe<Scalars['String']['input']>;
  userRequestId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  userRequestId_lt?: InputMaybe<Scalars['String']['input']>;
  userRequestId_lte?: InputMaybe<Scalars['String']['input']>;
  userRequestId_not?: InputMaybe<Scalars['String']['input']>;
  userRequestId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  validatorId?: InputMaybe<Scalars['String']['input']>;
  validatorId_gt?: InputMaybe<Scalars['String']['input']>;
  validatorId_gte?: InputMaybe<Scalars['String']['input']>;
  validatorId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  validatorId_lt?: InputMaybe<Scalars['String']['input']>;
  validatorId_lte?: InputMaybe<Scalars['String']['input']>;
  validatorId_not?: InputMaybe<Scalars['String']['input']>;
  validatorId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type SignedForUserRequestPage = {
  __typename?: 'SignedForUserRequestPage';
  items: Array<SignedForUserRequest>;
  pageInfo: PageInfo;
};

export type Transaction = {
  __typename?: 'Transaction';
  affirmationCompleted?: Maybe<AffirmationCompletedPage>;
  block: Block;
  blockId: Scalars['String']['output'];
  from: Scalars['String']['output'];
  gas: Scalars['BigInt']['output'];
  gasPrice?: Maybe<Scalars['BigInt']['output']>;
  hash: Scalars['String']['output'];
  id: Scalars['String']['output'];
  index: Scalars['BigInt']['output'];
  maxFeePerGas?: Maybe<Scalars['BigInt']['output']>;
  maxPriorityFeePerGas?: Maybe<Scalars['BigInt']['output']>;
  nonce: Scalars['BigInt']['output'];
  relayMessage?: Maybe<RelayMessagePage>;
  signedForAffirmation?: Maybe<SignedForAffirmationPage>;
  signedForUserRequest?: Maybe<SignedForUserRequestPage>;
  to: Scalars['String']['output'];
  userRequestForAffirmation?: Maybe<UserRequestForAffirmationPage>;
  userRequestForSignature?: Maybe<UserRequestForSignaturePage>;
  value: Scalars['BigInt']['output'];
};


export type TransactionAffirmationCompletedArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<AffirmationCompletedFilter>;
};


export type TransactionRelayMessageArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<RelayMessageFilter>;
};


export type TransactionSignedForAffirmationArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<SignedForAffirmationFilter>;
};


export type TransactionSignedForUserRequestArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<SignedForUserRequestFilter>;
};


export type TransactionUserRequestForAffirmationArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<UserRequestForAffirmationFilter>;
};


export type TransactionUserRequestForSignatureArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<UserRequestForSignatureFilter>;
};

export type TransactionFilter = {
  AND?: InputMaybe<Array<InputMaybe<TransactionFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<TransactionFilter>>>;
  blockId?: InputMaybe<Scalars['String']['input']>;
  blockId_gt?: InputMaybe<Scalars['String']['input']>;
  blockId_gte?: InputMaybe<Scalars['String']['input']>;
  blockId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  blockId_lt?: InputMaybe<Scalars['String']['input']>;
  blockId_lte?: InputMaybe<Scalars['String']['input']>;
  blockId_not?: InputMaybe<Scalars['String']['input']>;
  blockId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  from?: InputMaybe<Scalars['String']['input']>;
  from_gt?: InputMaybe<Scalars['String']['input']>;
  from_gte?: InputMaybe<Scalars['String']['input']>;
  from_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  from_lt?: InputMaybe<Scalars['String']['input']>;
  from_lte?: InputMaybe<Scalars['String']['input']>;
  from_not?: InputMaybe<Scalars['String']['input']>;
  from_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  gas?: InputMaybe<Scalars['BigInt']['input']>;
  gasPrice?: InputMaybe<Scalars['BigInt']['input']>;
  gasPrice_gt?: InputMaybe<Scalars['BigInt']['input']>;
  gasPrice_gte?: InputMaybe<Scalars['BigInt']['input']>;
  gasPrice_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  gasPrice_lt?: InputMaybe<Scalars['BigInt']['input']>;
  gasPrice_lte?: InputMaybe<Scalars['BigInt']['input']>;
  gasPrice_not?: InputMaybe<Scalars['BigInt']['input']>;
  gasPrice_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  gas_gt?: InputMaybe<Scalars['BigInt']['input']>;
  gas_gte?: InputMaybe<Scalars['BigInt']['input']>;
  gas_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  gas_lt?: InputMaybe<Scalars['BigInt']['input']>;
  gas_lte?: InputMaybe<Scalars['BigInt']['input']>;
  gas_not?: InputMaybe<Scalars['BigInt']['input']>;
  gas_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  hash?: InputMaybe<Scalars['String']['input']>;
  hash_gt?: InputMaybe<Scalars['String']['input']>;
  hash_gte?: InputMaybe<Scalars['String']['input']>;
  hash_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  hash_lt?: InputMaybe<Scalars['String']['input']>;
  hash_lte?: InputMaybe<Scalars['String']['input']>;
  hash_not?: InputMaybe<Scalars['String']['input']>;
  hash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_gt?: InputMaybe<Scalars['String']['input']>;
  id_gte?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_lt?: InputMaybe<Scalars['String']['input']>;
  id_lte?: InputMaybe<Scalars['String']['input']>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  index?: InputMaybe<Scalars['BigInt']['input']>;
  index_gt?: InputMaybe<Scalars['BigInt']['input']>;
  index_gte?: InputMaybe<Scalars['BigInt']['input']>;
  index_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  index_lt?: InputMaybe<Scalars['BigInt']['input']>;
  index_lte?: InputMaybe<Scalars['BigInt']['input']>;
  index_not?: InputMaybe<Scalars['BigInt']['input']>;
  index_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  maxFeePerGas?: InputMaybe<Scalars['BigInt']['input']>;
  maxFeePerGas_gt?: InputMaybe<Scalars['BigInt']['input']>;
  maxFeePerGas_gte?: InputMaybe<Scalars['BigInt']['input']>;
  maxFeePerGas_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  maxFeePerGas_lt?: InputMaybe<Scalars['BigInt']['input']>;
  maxFeePerGas_lte?: InputMaybe<Scalars['BigInt']['input']>;
  maxFeePerGas_not?: InputMaybe<Scalars['BigInt']['input']>;
  maxFeePerGas_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  maxPriorityFeePerGas?: InputMaybe<Scalars['BigInt']['input']>;
  maxPriorityFeePerGas_gt?: InputMaybe<Scalars['BigInt']['input']>;
  maxPriorityFeePerGas_gte?: InputMaybe<Scalars['BigInt']['input']>;
  maxPriorityFeePerGas_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  maxPriorityFeePerGas_lt?: InputMaybe<Scalars['BigInt']['input']>;
  maxPriorityFeePerGas_lte?: InputMaybe<Scalars['BigInt']['input']>;
  maxPriorityFeePerGas_not?: InputMaybe<Scalars['BigInt']['input']>;
  maxPriorityFeePerGas_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  nonce?: InputMaybe<Scalars['BigInt']['input']>;
  nonce_gt?: InputMaybe<Scalars['BigInt']['input']>;
  nonce_gte?: InputMaybe<Scalars['BigInt']['input']>;
  nonce_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  nonce_lt?: InputMaybe<Scalars['BigInt']['input']>;
  nonce_lte?: InputMaybe<Scalars['BigInt']['input']>;
  nonce_not?: InputMaybe<Scalars['BigInt']['input']>;
  nonce_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  to?: InputMaybe<Scalars['String']['input']>;
  to_gt?: InputMaybe<Scalars['String']['input']>;
  to_gte?: InputMaybe<Scalars['String']['input']>;
  to_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  to_lt?: InputMaybe<Scalars['String']['input']>;
  to_lte?: InputMaybe<Scalars['String']['input']>;
  to_not?: InputMaybe<Scalars['String']['input']>;
  to_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  value?: InputMaybe<Scalars['BigInt']['input']>;
  value_gt?: InputMaybe<Scalars['BigInt']['input']>;
  value_gte?: InputMaybe<Scalars['BigInt']['input']>;
  value_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  value_lt?: InputMaybe<Scalars['BigInt']['input']>;
  value_lte?: InputMaybe<Scalars['BigInt']['input']>;
  value_not?: InputMaybe<Scalars['BigInt']['input']>;
  value_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
};

export type TransactionPage = {
  __typename?: 'TransactionPage';
  items: Array<Transaction>;
  pageInfo: PageInfo;
};

export type UserRequestForAffirmation = {
  __typename?: 'UserRequestForAffirmation';
  amount: Scalars['BigInt']['output'];
  block: Block;
  blockId: Scalars['String']['output'];
  bridge: BridgeSide;
  bridgeId: Scalars['String']['output'];
  confirmedSignatures: Scalars['BigInt']['output'];
  delivery?: Maybe<AffirmationCompleted>;
  deliveryId?: Maybe<Scalars['String']['output']>;
  destinationChainId: Scalars['BigInt']['output'];
  encodedData: Scalars['String']['output'];
  finishedSigning: Scalars['Boolean']['output'];
  from: Scalars['String']['output'];
  id: Scalars['String']['output'];
  logIndex: Scalars['Int']['output'];
  messageHash: Scalars['String']['output'];
  orderId: Scalars['String']['output'];
  originationChainId: Scalars['BigInt']['output'];
  requiredSignature: RequiredSignaturesChanged;
  requiredSignatureId: Scalars['String']['output'];
  signatures?: Maybe<SignedForAffirmationPage>;
  to: Scalars['String']['output'];
  transaction: Transaction;
  transactionId: Scalars['String']['output'];
};


export type UserRequestForAffirmationSignaturesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<SignedForAffirmationFilter>;
};

export type UserRequestForAffirmationFilter = {
  AND?: InputMaybe<Array<InputMaybe<UserRequestForAffirmationFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<UserRequestForAffirmationFilter>>>;
  amount?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  amount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  blockId?: InputMaybe<Scalars['String']['input']>;
  blockId_gt?: InputMaybe<Scalars['String']['input']>;
  blockId_gte?: InputMaybe<Scalars['String']['input']>;
  blockId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  blockId_lt?: InputMaybe<Scalars['String']['input']>;
  blockId_lte?: InputMaybe<Scalars['String']['input']>;
  blockId_not?: InputMaybe<Scalars['String']['input']>;
  blockId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  bridgeId?: InputMaybe<Scalars['String']['input']>;
  bridgeId_gt?: InputMaybe<Scalars['String']['input']>;
  bridgeId_gte?: InputMaybe<Scalars['String']['input']>;
  bridgeId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  bridgeId_lt?: InputMaybe<Scalars['String']['input']>;
  bridgeId_lte?: InputMaybe<Scalars['String']['input']>;
  bridgeId_not?: InputMaybe<Scalars['String']['input']>;
  bridgeId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  confirmedSignatures?: InputMaybe<Scalars['BigInt']['input']>;
  confirmedSignatures_gt?: InputMaybe<Scalars['BigInt']['input']>;
  confirmedSignatures_gte?: InputMaybe<Scalars['BigInt']['input']>;
  confirmedSignatures_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  confirmedSignatures_lt?: InputMaybe<Scalars['BigInt']['input']>;
  confirmedSignatures_lte?: InputMaybe<Scalars['BigInt']['input']>;
  confirmedSignatures_not?: InputMaybe<Scalars['BigInt']['input']>;
  confirmedSignatures_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  deliveryId?: InputMaybe<Scalars['String']['input']>;
  deliveryId_gt?: InputMaybe<Scalars['String']['input']>;
  deliveryId_gte?: InputMaybe<Scalars['String']['input']>;
  deliveryId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  deliveryId_lt?: InputMaybe<Scalars['String']['input']>;
  deliveryId_lte?: InputMaybe<Scalars['String']['input']>;
  deliveryId_not?: InputMaybe<Scalars['String']['input']>;
  deliveryId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  destinationChainId?: InputMaybe<Scalars['BigInt']['input']>;
  destinationChainId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  destinationChainId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  destinationChainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  destinationChainId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  destinationChainId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  destinationChainId_not?: InputMaybe<Scalars['BigInt']['input']>;
  destinationChainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  encodedData?: InputMaybe<Scalars['String']['input']>;
  encodedData_gt?: InputMaybe<Scalars['String']['input']>;
  encodedData_gte?: InputMaybe<Scalars['String']['input']>;
  encodedData_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  encodedData_lt?: InputMaybe<Scalars['String']['input']>;
  encodedData_lte?: InputMaybe<Scalars['String']['input']>;
  encodedData_not?: InputMaybe<Scalars['String']['input']>;
  encodedData_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  finishedSigning?: InputMaybe<Scalars['Boolean']['input']>;
  finishedSigning_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  finishedSigning_not?: InputMaybe<Scalars['Boolean']['input']>;
  finishedSigning_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  from?: InputMaybe<Scalars['String']['input']>;
  from_gt?: InputMaybe<Scalars['String']['input']>;
  from_gte?: InputMaybe<Scalars['String']['input']>;
  from_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  from_lt?: InputMaybe<Scalars['String']['input']>;
  from_lte?: InputMaybe<Scalars['String']['input']>;
  from_not?: InputMaybe<Scalars['String']['input']>;
  from_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_gt?: InputMaybe<Scalars['String']['input']>;
  id_gte?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_lt?: InputMaybe<Scalars['String']['input']>;
  id_lte?: InputMaybe<Scalars['String']['input']>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  logIndex?: InputMaybe<Scalars['Int']['input']>;
  logIndex_gt?: InputMaybe<Scalars['Int']['input']>;
  logIndex_gte?: InputMaybe<Scalars['Int']['input']>;
  logIndex_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  logIndex_lt?: InputMaybe<Scalars['Int']['input']>;
  logIndex_lte?: InputMaybe<Scalars['Int']['input']>;
  logIndex_not?: InputMaybe<Scalars['Int']['input']>;
  logIndex_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  messageHash?: InputMaybe<Scalars['String']['input']>;
  messageHash_gt?: InputMaybe<Scalars['String']['input']>;
  messageHash_gte?: InputMaybe<Scalars['String']['input']>;
  messageHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  messageHash_lt?: InputMaybe<Scalars['String']['input']>;
  messageHash_lte?: InputMaybe<Scalars['String']['input']>;
  messageHash_not?: InputMaybe<Scalars['String']['input']>;
  messageHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  orderId?: InputMaybe<Scalars['String']['input']>;
  orderId_gt?: InputMaybe<Scalars['String']['input']>;
  orderId_gte?: InputMaybe<Scalars['String']['input']>;
  orderId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  orderId_lt?: InputMaybe<Scalars['String']['input']>;
  orderId_lte?: InputMaybe<Scalars['String']['input']>;
  orderId_not?: InputMaybe<Scalars['String']['input']>;
  orderId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  originationChainId?: InputMaybe<Scalars['BigInt']['input']>;
  originationChainId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  originationChainId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  originationChainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  originationChainId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  originationChainId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  originationChainId_not?: InputMaybe<Scalars['BigInt']['input']>;
  originationChainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  requiredSignatureId?: InputMaybe<Scalars['String']['input']>;
  requiredSignatureId_gt?: InputMaybe<Scalars['String']['input']>;
  requiredSignatureId_gte?: InputMaybe<Scalars['String']['input']>;
  requiredSignatureId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  requiredSignatureId_lt?: InputMaybe<Scalars['String']['input']>;
  requiredSignatureId_lte?: InputMaybe<Scalars['String']['input']>;
  requiredSignatureId_not?: InputMaybe<Scalars['String']['input']>;
  requiredSignatureId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  to?: InputMaybe<Scalars['String']['input']>;
  to_gt?: InputMaybe<Scalars['String']['input']>;
  to_gte?: InputMaybe<Scalars['String']['input']>;
  to_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  to_lt?: InputMaybe<Scalars['String']['input']>;
  to_lte?: InputMaybe<Scalars['String']['input']>;
  to_not?: InputMaybe<Scalars['String']['input']>;
  to_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  transactionId?: InputMaybe<Scalars['String']['input']>;
  transactionId_gt?: InputMaybe<Scalars['String']['input']>;
  transactionId_gte?: InputMaybe<Scalars['String']['input']>;
  transactionId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  transactionId_lt?: InputMaybe<Scalars['String']['input']>;
  transactionId_lte?: InputMaybe<Scalars['String']['input']>;
  transactionId_not?: InputMaybe<Scalars['String']['input']>;
  transactionId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type UserRequestForAffirmationPage = {
  __typename?: 'UserRequestForAffirmationPage';
  items: Array<UserRequestForAffirmation>;
  pageInfo: PageInfo;
};

export type UserRequestForSignature = {
  __typename?: 'UserRequestForSignature';
  amount: Scalars['BigInt']['output'];
  blockId: Scalars['String']['output'];
  bridge: BridgeSide;
  bridgeId: Scalars['String']['output'];
  confirmedSignatures: Scalars['BigInt']['output'];
  delivery?: Maybe<RelayMessage>;
  deliveryId?: Maybe<Scalars['String']['output']>;
  destinationChainId: Scalars['BigInt']['output'];
  encodedData: Scalars['String']['output'];
  feeDirector?: Maybe<FeeDirector>;
  feeDirectorId?: Maybe<Scalars['String']['output']>;
  finishedSigning: Scalars['Boolean']['output'];
  from: Scalars['String']['output'];
  id: Scalars['String']['output'];
  logIndex: Scalars['Int']['output'];
  messageHash: Scalars['String']['output'];
  orderId: Scalars['String']['output'];
  originationChainId: Scalars['BigInt']['output'];
  requiredSignature: RequiredSignaturesChanged;
  requiredSignatureId: Scalars['String']['output'];
  signatures?: Maybe<SignedForUserRequestPage>;
  to: Scalars['String']['output'];
  transaction: Transaction;
  transactionId: Scalars['String']['output'];
};


export type UserRequestForSignatureSignaturesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<SignedForUserRequestFilter>;
};

export type UserRequestForSignatureFilter = {
  AND?: InputMaybe<Array<InputMaybe<UserRequestForSignatureFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<UserRequestForSignatureFilter>>>;
  amount?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  amount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  blockId?: InputMaybe<Scalars['String']['input']>;
  blockId_gt?: InputMaybe<Scalars['String']['input']>;
  blockId_gte?: InputMaybe<Scalars['String']['input']>;
  blockId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  blockId_lt?: InputMaybe<Scalars['String']['input']>;
  blockId_lte?: InputMaybe<Scalars['String']['input']>;
  blockId_not?: InputMaybe<Scalars['String']['input']>;
  blockId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  bridgeId?: InputMaybe<Scalars['String']['input']>;
  bridgeId_gt?: InputMaybe<Scalars['String']['input']>;
  bridgeId_gte?: InputMaybe<Scalars['String']['input']>;
  bridgeId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  bridgeId_lt?: InputMaybe<Scalars['String']['input']>;
  bridgeId_lte?: InputMaybe<Scalars['String']['input']>;
  bridgeId_not?: InputMaybe<Scalars['String']['input']>;
  bridgeId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  confirmedSignatures?: InputMaybe<Scalars['BigInt']['input']>;
  confirmedSignatures_gt?: InputMaybe<Scalars['BigInt']['input']>;
  confirmedSignatures_gte?: InputMaybe<Scalars['BigInt']['input']>;
  confirmedSignatures_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  confirmedSignatures_lt?: InputMaybe<Scalars['BigInt']['input']>;
  confirmedSignatures_lte?: InputMaybe<Scalars['BigInt']['input']>;
  confirmedSignatures_not?: InputMaybe<Scalars['BigInt']['input']>;
  confirmedSignatures_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  deliveryId?: InputMaybe<Scalars['String']['input']>;
  deliveryId_gt?: InputMaybe<Scalars['String']['input']>;
  deliveryId_gte?: InputMaybe<Scalars['String']['input']>;
  deliveryId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  deliveryId_lt?: InputMaybe<Scalars['String']['input']>;
  deliveryId_lte?: InputMaybe<Scalars['String']['input']>;
  deliveryId_not?: InputMaybe<Scalars['String']['input']>;
  deliveryId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  destinationChainId?: InputMaybe<Scalars['BigInt']['input']>;
  destinationChainId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  destinationChainId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  destinationChainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  destinationChainId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  destinationChainId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  destinationChainId_not?: InputMaybe<Scalars['BigInt']['input']>;
  destinationChainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  encodedData?: InputMaybe<Scalars['String']['input']>;
  encodedData_gt?: InputMaybe<Scalars['String']['input']>;
  encodedData_gte?: InputMaybe<Scalars['String']['input']>;
  encodedData_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  encodedData_lt?: InputMaybe<Scalars['String']['input']>;
  encodedData_lte?: InputMaybe<Scalars['String']['input']>;
  encodedData_not?: InputMaybe<Scalars['String']['input']>;
  encodedData_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  feeDirectorId?: InputMaybe<Scalars['String']['input']>;
  feeDirectorId_gt?: InputMaybe<Scalars['String']['input']>;
  feeDirectorId_gte?: InputMaybe<Scalars['String']['input']>;
  feeDirectorId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  feeDirectorId_lt?: InputMaybe<Scalars['String']['input']>;
  feeDirectorId_lte?: InputMaybe<Scalars['String']['input']>;
  feeDirectorId_not?: InputMaybe<Scalars['String']['input']>;
  feeDirectorId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  finishedSigning?: InputMaybe<Scalars['Boolean']['input']>;
  finishedSigning_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  finishedSigning_not?: InputMaybe<Scalars['Boolean']['input']>;
  finishedSigning_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  from?: InputMaybe<Scalars['String']['input']>;
  from_gt?: InputMaybe<Scalars['String']['input']>;
  from_gte?: InputMaybe<Scalars['String']['input']>;
  from_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  from_lt?: InputMaybe<Scalars['String']['input']>;
  from_lte?: InputMaybe<Scalars['String']['input']>;
  from_not?: InputMaybe<Scalars['String']['input']>;
  from_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_gt?: InputMaybe<Scalars['String']['input']>;
  id_gte?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_lt?: InputMaybe<Scalars['String']['input']>;
  id_lte?: InputMaybe<Scalars['String']['input']>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  logIndex?: InputMaybe<Scalars['Int']['input']>;
  logIndex_gt?: InputMaybe<Scalars['Int']['input']>;
  logIndex_gte?: InputMaybe<Scalars['Int']['input']>;
  logIndex_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  logIndex_lt?: InputMaybe<Scalars['Int']['input']>;
  logIndex_lte?: InputMaybe<Scalars['Int']['input']>;
  logIndex_not?: InputMaybe<Scalars['Int']['input']>;
  logIndex_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  messageHash?: InputMaybe<Scalars['String']['input']>;
  messageHash_gt?: InputMaybe<Scalars['String']['input']>;
  messageHash_gte?: InputMaybe<Scalars['String']['input']>;
  messageHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  messageHash_lt?: InputMaybe<Scalars['String']['input']>;
  messageHash_lte?: InputMaybe<Scalars['String']['input']>;
  messageHash_not?: InputMaybe<Scalars['String']['input']>;
  messageHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  orderId?: InputMaybe<Scalars['String']['input']>;
  orderId_gt?: InputMaybe<Scalars['String']['input']>;
  orderId_gte?: InputMaybe<Scalars['String']['input']>;
  orderId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  orderId_lt?: InputMaybe<Scalars['String']['input']>;
  orderId_lte?: InputMaybe<Scalars['String']['input']>;
  orderId_not?: InputMaybe<Scalars['String']['input']>;
  orderId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  originationChainId?: InputMaybe<Scalars['BigInt']['input']>;
  originationChainId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  originationChainId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  originationChainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  originationChainId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  originationChainId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  originationChainId_not?: InputMaybe<Scalars['BigInt']['input']>;
  originationChainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  requiredSignatureId?: InputMaybe<Scalars['String']['input']>;
  requiredSignatureId_gt?: InputMaybe<Scalars['String']['input']>;
  requiredSignatureId_gte?: InputMaybe<Scalars['String']['input']>;
  requiredSignatureId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  requiredSignatureId_lt?: InputMaybe<Scalars['String']['input']>;
  requiredSignatureId_lte?: InputMaybe<Scalars['String']['input']>;
  requiredSignatureId_not?: InputMaybe<Scalars['String']['input']>;
  requiredSignatureId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  to?: InputMaybe<Scalars['String']['input']>;
  to_gt?: InputMaybe<Scalars['String']['input']>;
  to_gte?: InputMaybe<Scalars['String']['input']>;
  to_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  to_lt?: InputMaybe<Scalars['String']['input']>;
  to_lte?: InputMaybe<Scalars['String']['input']>;
  to_not?: InputMaybe<Scalars['String']['input']>;
  to_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  transactionId?: InputMaybe<Scalars['String']['input']>;
  transactionId_gt?: InputMaybe<Scalars['String']['input']>;
  transactionId_gte?: InputMaybe<Scalars['String']['input']>;
  transactionId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  transactionId_lt?: InputMaybe<Scalars['String']['input']>;
  transactionId_lte?: InputMaybe<Scalars['String']['input']>;
  transactionId_not?: InputMaybe<Scalars['String']['input']>;
  transactionId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type UserRequestForSignaturePage = {
  __typename?: 'UserRequestForSignaturePage';
  items: Array<UserRequestForSignature>;
  pageInfo: PageInfo;
};

export type ValidatorStatusUpdate = {
  __typename?: 'ValidatorStatusUpdate';
  active: Scalars['Boolean']['output'];
  address: Scalars['String']['output'];
  block: Block;
  blockId: Scalars['String']['output'];
  bridge: BridgeSide;
  bridgeId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  logIndex: Scalars['Int']['output'];
  transaction: Transaction;
  transactionId: Scalars['String']['output'];
  validatorId: Scalars['String']['output'];
};

export type ValidatorStatusUpdateFilter = {
  AND?: InputMaybe<Array<InputMaybe<ValidatorStatusUpdateFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<ValidatorStatusUpdateFilter>>>;
  active?: InputMaybe<Scalars['Boolean']['input']>;
  active_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  active_not?: InputMaybe<Scalars['Boolean']['input']>;
  active_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  address?: InputMaybe<Scalars['String']['input']>;
  address_gt?: InputMaybe<Scalars['String']['input']>;
  address_gte?: InputMaybe<Scalars['String']['input']>;
  address_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  address_lt?: InputMaybe<Scalars['String']['input']>;
  address_lte?: InputMaybe<Scalars['String']['input']>;
  address_not?: InputMaybe<Scalars['String']['input']>;
  address_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  blockId?: InputMaybe<Scalars['String']['input']>;
  blockId_gt?: InputMaybe<Scalars['String']['input']>;
  blockId_gte?: InputMaybe<Scalars['String']['input']>;
  blockId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  blockId_lt?: InputMaybe<Scalars['String']['input']>;
  blockId_lte?: InputMaybe<Scalars['String']['input']>;
  blockId_not?: InputMaybe<Scalars['String']['input']>;
  blockId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  bridgeId?: InputMaybe<Scalars['String']['input']>;
  bridgeId_gt?: InputMaybe<Scalars['String']['input']>;
  bridgeId_gte?: InputMaybe<Scalars['String']['input']>;
  bridgeId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  bridgeId_lt?: InputMaybe<Scalars['String']['input']>;
  bridgeId_lte?: InputMaybe<Scalars['String']['input']>;
  bridgeId_not?: InputMaybe<Scalars['String']['input']>;
  bridgeId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_gt?: InputMaybe<Scalars['String']['input']>;
  id_gte?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_lt?: InputMaybe<Scalars['String']['input']>;
  id_lte?: InputMaybe<Scalars['String']['input']>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  logIndex?: InputMaybe<Scalars['Int']['input']>;
  logIndex_gt?: InputMaybe<Scalars['Int']['input']>;
  logIndex_gte?: InputMaybe<Scalars['Int']['input']>;
  logIndex_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  logIndex_lt?: InputMaybe<Scalars['Int']['input']>;
  logIndex_lte?: InputMaybe<Scalars['Int']['input']>;
  logIndex_not?: InputMaybe<Scalars['Int']['input']>;
  logIndex_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  transactionId?: InputMaybe<Scalars['String']['input']>;
  transactionId_gt?: InputMaybe<Scalars['String']['input']>;
  transactionId_gte?: InputMaybe<Scalars['String']['input']>;
  transactionId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  transactionId_lt?: InputMaybe<Scalars['String']['input']>;
  transactionId_lte?: InputMaybe<Scalars['String']['input']>;
  transactionId_not?: InputMaybe<Scalars['String']['input']>;
  transactionId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  validatorId?: InputMaybe<Scalars['String']['input']>;
  validatorId_gt?: InputMaybe<Scalars['String']['input']>;
  validatorId_gte?: InputMaybe<Scalars['String']['input']>;
  validatorId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  validatorId_lt?: InputMaybe<Scalars['String']['input']>;
  validatorId_lte?: InputMaybe<Scalars['String']['input']>;
  validatorId_not?: InputMaybe<Scalars['String']['input']>;
  validatorId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ValidatorStatusUpdatePage = {
  __typename?: 'ValidatorStatusUpdatePage';
  items: Array<ValidatorStatusUpdate>;
  pageInfo: PageInfo;
};

export type _Meta = {
  __typename?: '_meta';
  status?: Maybe<Scalars['JSON']['output']>;
};
