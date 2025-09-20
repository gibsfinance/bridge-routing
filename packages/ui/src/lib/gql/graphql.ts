export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  BigInt: string;
  JSON: any;
};

export type AffirmationCompleted = {
  __typename?: 'AffirmationCompleted';
  block?: Maybe<Block>;
  blockHash: Scalars['String'];
  chainId: Scalars['BigInt'];
  deliverer: Scalars['String'];
  destinationToken?: Maybe<Token>;
  destinationTokenAddress?: Maybe<Scalars['String']>;
  destinationTokenAmbAddress?: Maybe<Scalars['String']>;
  destinationTokenChainId?: Maybe<Scalars['BigInt']>;
  logIndex: Scalars['Float'];
  messageHash: Scalars['String'];
  orderId: Scalars['BigInt'];
  originationToken?: Maybe<Token>;
  originationTokenAddress?: Maybe<Scalars['String']>;
  originationTokenAmbAddress?: Maybe<Scalars['String']>;
  originationTokenChainId?: Maybe<Scalars['BigInt']>;
  signature?: Maybe<SignedForAffirmationPage>;
  transaction?: Maybe<Transaction>;
  transactionHash: Scalars['String'];
  userRequest?: Maybe<UserRequestForAffirmation>;
  userRequestId: Scalars['String'];
};


export type AffirmationCompletedSignatureArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<SignedForAffirmationFilter>;
};

export type AffirmationCompletedFilter = {
  AND?: InputMaybe<Array<InputMaybe<AffirmationCompletedFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<AffirmationCompletedFilter>>>;
  blockHash?: InputMaybe<Scalars['String']>;
  blockHash_contains?: InputMaybe<Scalars['String']>;
  blockHash_ends_with?: InputMaybe<Scalars['String']>;
  blockHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  blockHash_not?: InputMaybe<Scalars['String']>;
  blockHash_not_contains?: InputMaybe<Scalars['String']>;
  blockHash_not_ends_with?: InputMaybe<Scalars['String']>;
  blockHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  blockHash_not_starts_with?: InputMaybe<Scalars['String']>;
  blockHash_starts_with?: InputMaybe<Scalars['String']>;
  chainId?: InputMaybe<Scalars['BigInt']>;
  chainId_gt?: InputMaybe<Scalars['BigInt']>;
  chainId_gte?: InputMaybe<Scalars['BigInt']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  chainId_lt?: InputMaybe<Scalars['BigInt']>;
  chainId_lte?: InputMaybe<Scalars['BigInt']>;
  chainId_not?: InputMaybe<Scalars['BigInt']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  deliverer?: InputMaybe<Scalars['String']>;
  deliverer_contains?: InputMaybe<Scalars['String']>;
  deliverer_ends_with?: InputMaybe<Scalars['String']>;
  deliverer_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  deliverer_not?: InputMaybe<Scalars['String']>;
  deliverer_not_contains?: InputMaybe<Scalars['String']>;
  deliverer_not_ends_with?: InputMaybe<Scalars['String']>;
  deliverer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  deliverer_not_starts_with?: InputMaybe<Scalars['String']>;
  deliverer_starts_with?: InputMaybe<Scalars['String']>;
  destinationTokenAddress?: InputMaybe<Scalars['String']>;
  destinationTokenAddress_contains?: InputMaybe<Scalars['String']>;
  destinationTokenAddress_ends_with?: InputMaybe<Scalars['String']>;
  destinationTokenAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  destinationTokenAddress_not?: InputMaybe<Scalars['String']>;
  destinationTokenAddress_not_contains?: InputMaybe<Scalars['String']>;
  destinationTokenAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  destinationTokenAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  destinationTokenAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  destinationTokenAddress_starts_with?: InputMaybe<Scalars['String']>;
  destinationTokenAmbAddress?: InputMaybe<Scalars['String']>;
  destinationTokenAmbAddress_contains?: InputMaybe<Scalars['String']>;
  destinationTokenAmbAddress_ends_with?: InputMaybe<Scalars['String']>;
  destinationTokenAmbAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  destinationTokenAmbAddress_not?: InputMaybe<Scalars['String']>;
  destinationTokenAmbAddress_not_contains?: InputMaybe<Scalars['String']>;
  destinationTokenAmbAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  destinationTokenAmbAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  destinationTokenAmbAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  destinationTokenAmbAddress_starts_with?: InputMaybe<Scalars['String']>;
  destinationTokenChainId?: InputMaybe<Scalars['BigInt']>;
  destinationTokenChainId_gt?: InputMaybe<Scalars['BigInt']>;
  destinationTokenChainId_gte?: InputMaybe<Scalars['BigInt']>;
  destinationTokenChainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  destinationTokenChainId_lt?: InputMaybe<Scalars['BigInt']>;
  destinationTokenChainId_lte?: InputMaybe<Scalars['BigInt']>;
  destinationTokenChainId_not?: InputMaybe<Scalars['BigInt']>;
  destinationTokenChainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  logIndex?: InputMaybe<Scalars['Float']>;
  logIndex_gt?: InputMaybe<Scalars['Float']>;
  logIndex_gte?: InputMaybe<Scalars['Float']>;
  logIndex_in?: InputMaybe<Array<InputMaybe<Scalars['Float']>>>;
  logIndex_lt?: InputMaybe<Scalars['Float']>;
  logIndex_lte?: InputMaybe<Scalars['Float']>;
  logIndex_not?: InputMaybe<Scalars['Float']>;
  logIndex_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']>>>;
  messageHash?: InputMaybe<Scalars['String']>;
  messageHash_contains?: InputMaybe<Scalars['String']>;
  messageHash_ends_with?: InputMaybe<Scalars['String']>;
  messageHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  messageHash_not?: InputMaybe<Scalars['String']>;
  messageHash_not_contains?: InputMaybe<Scalars['String']>;
  messageHash_not_ends_with?: InputMaybe<Scalars['String']>;
  messageHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  messageHash_not_starts_with?: InputMaybe<Scalars['String']>;
  messageHash_starts_with?: InputMaybe<Scalars['String']>;
  orderId?: InputMaybe<Scalars['BigInt']>;
  orderId_gt?: InputMaybe<Scalars['BigInt']>;
  orderId_gte?: InputMaybe<Scalars['BigInt']>;
  orderId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  orderId_lt?: InputMaybe<Scalars['BigInt']>;
  orderId_lte?: InputMaybe<Scalars['BigInt']>;
  orderId_not?: InputMaybe<Scalars['BigInt']>;
  orderId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  originationTokenAddress?: InputMaybe<Scalars['String']>;
  originationTokenAddress_contains?: InputMaybe<Scalars['String']>;
  originationTokenAddress_ends_with?: InputMaybe<Scalars['String']>;
  originationTokenAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  originationTokenAddress_not?: InputMaybe<Scalars['String']>;
  originationTokenAddress_not_contains?: InputMaybe<Scalars['String']>;
  originationTokenAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  originationTokenAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  originationTokenAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  originationTokenAddress_starts_with?: InputMaybe<Scalars['String']>;
  originationTokenAmbAddress?: InputMaybe<Scalars['String']>;
  originationTokenAmbAddress_contains?: InputMaybe<Scalars['String']>;
  originationTokenAmbAddress_ends_with?: InputMaybe<Scalars['String']>;
  originationTokenAmbAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  originationTokenAmbAddress_not?: InputMaybe<Scalars['String']>;
  originationTokenAmbAddress_not_contains?: InputMaybe<Scalars['String']>;
  originationTokenAmbAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  originationTokenAmbAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  originationTokenAmbAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  originationTokenAmbAddress_starts_with?: InputMaybe<Scalars['String']>;
  originationTokenChainId?: InputMaybe<Scalars['BigInt']>;
  originationTokenChainId_gt?: InputMaybe<Scalars['BigInt']>;
  originationTokenChainId_gte?: InputMaybe<Scalars['BigInt']>;
  originationTokenChainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  originationTokenChainId_lt?: InputMaybe<Scalars['BigInt']>;
  originationTokenChainId_lte?: InputMaybe<Scalars['BigInt']>;
  originationTokenChainId_not?: InputMaybe<Scalars['BigInt']>;
  originationTokenChainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  transactionHash?: InputMaybe<Scalars['String']>;
  transactionHash_contains?: InputMaybe<Scalars['String']>;
  transactionHash_ends_with?: InputMaybe<Scalars['String']>;
  transactionHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  transactionHash_not?: InputMaybe<Scalars['String']>;
  transactionHash_not_contains?: InputMaybe<Scalars['String']>;
  transactionHash_not_ends_with?: InputMaybe<Scalars['String']>;
  transactionHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  transactionHash_not_starts_with?: InputMaybe<Scalars['String']>;
  transactionHash_starts_with?: InputMaybe<Scalars['String']>;
  userRequestId?: InputMaybe<Scalars['String']>;
  userRequestId_contains?: InputMaybe<Scalars['String']>;
  userRequestId_ends_with?: InputMaybe<Scalars['String']>;
  userRequestId_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  userRequestId_not?: InputMaybe<Scalars['String']>;
  userRequestId_not_contains?: InputMaybe<Scalars['String']>;
  userRequestId_not_ends_with?: InputMaybe<Scalars['String']>;
  userRequestId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  userRequestId_not_starts_with?: InputMaybe<Scalars['String']>;
  userRequestId_starts_with?: InputMaybe<Scalars['String']>;
};

export type AffirmationCompletedPage = {
  __typename?: 'AffirmationCompletedPage';
  items: Array<AffirmationCompleted>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type Block = {
  __typename?: 'Block';
  baseFeePerGas?: Maybe<Scalars['BigInt']>;
  chainId: Scalars['BigInt'];
  hash: Scalars['String'];
  number: Scalars['BigInt'];
  timestamp: Scalars['BigInt'];
};

export type BlockFilter = {
  AND?: InputMaybe<Array<InputMaybe<BlockFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<BlockFilter>>>;
  baseFeePerGas?: InputMaybe<Scalars['BigInt']>;
  baseFeePerGas_gt?: InputMaybe<Scalars['BigInt']>;
  baseFeePerGas_gte?: InputMaybe<Scalars['BigInt']>;
  baseFeePerGas_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  baseFeePerGas_lt?: InputMaybe<Scalars['BigInt']>;
  baseFeePerGas_lte?: InputMaybe<Scalars['BigInt']>;
  baseFeePerGas_not?: InputMaybe<Scalars['BigInt']>;
  baseFeePerGas_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  chainId?: InputMaybe<Scalars['BigInt']>;
  chainId_gt?: InputMaybe<Scalars['BigInt']>;
  chainId_gte?: InputMaybe<Scalars['BigInt']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  chainId_lt?: InputMaybe<Scalars['BigInt']>;
  chainId_lte?: InputMaybe<Scalars['BigInt']>;
  chainId_not?: InputMaybe<Scalars['BigInt']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  hash?: InputMaybe<Scalars['String']>;
  hash_contains?: InputMaybe<Scalars['String']>;
  hash_ends_with?: InputMaybe<Scalars['String']>;
  hash_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  hash_not?: InputMaybe<Scalars['String']>;
  hash_not_contains?: InputMaybe<Scalars['String']>;
  hash_not_ends_with?: InputMaybe<Scalars['String']>;
  hash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  hash_not_starts_with?: InputMaybe<Scalars['String']>;
  hash_starts_with?: InputMaybe<Scalars['String']>;
  number?: InputMaybe<Scalars['BigInt']>;
  number_gt?: InputMaybe<Scalars['BigInt']>;
  number_gte?: InputMaybe<Scalars['BigInt']>;
  number_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  number_lt?: InputMaybe<Scalars['BigInt']>;
  number_lte?: InputMaybe<Scalars['BigInt']>;
  number_not?: InputMaybe<Scalars['BigInt']>;
  number_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  timestamp?: InputMaybe<Scalars['BigInt']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']>;
  timestamp_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']>;
  timestamp_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
};

export type BlockPage = {
  __typename?: 'BlockPage';
  items: Array<Block>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type BridgeSide = {
  __typename?: 'BridgeSide';
  address: Scalars['String'];
  chainId: Scalars['BigInt'];
  provider: Provider;
  side: Direction;
};

export type BridgeSideFilter = {
  AND?: InputMaybe<Array<InputMaybe<BridgeSideFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<BridgeSideFilter>>>;
  address?: InputMaybe<Scalars['String']>;
  address_contains?: InputMaybe<Scalars['String']>;
  address_ends_with?: InputMaybe<Scalars['String']>;
  address_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  address_not?: InputMaybe<Scalars['String']>;
  address_not_contains?: InputMaybe<Scalars['String']>;
  address_not_ends_with?: InputMaybe<Scalars['String']>;
  address_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  address_not_starts_with?: InputMaybe<Scalars['String']>;
  address_starts_with?: InputMaybe<Scalars['String']>;
  chainId?: InputMaybe<Scalars['BigInt']>;
  chainId_gt?: InputMaybe<Scalars['BigInt']>;
  chainId_gte?: InputMaybe<Scalars['BigInt']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  chainId_lt?: InputMaybe<Scalars['BigInt']>;
  chainId_lte?: InputMaybe<Scalars['BigInt']>;
  chainId_not?: InputMaybe<Scalars['BigInt']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
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
  totalCount: Scalars['Int'];
};

export type Direction =
  | 'foreign'
  | 'home'
  | '%future added value';

export type FeeDirector = {
  __typename?: 'FeeDirector';
  excludePriority: Scalars['Boolean'];
  feeType: Scalars['String'];
  limit: Scalars['BigInt'];
  messageId: Scalars['String'];
  multiplier: Scalars['BigInt'];
  recipient: Scalars['String'];
  settings: Scalars['BigInt'];
  unwrapped: Scalars['Boolean'];
  userRequest?: Maybe<UserRequestForSignature>;
};

export type FeeDirectorFilter = {
  AND?: InputMaybe<Array<InputMaybe<FeeDirectorFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<FeeDirectorFilter>>>;
  excludePriority?: InputMaybe<Scalars['Boolean']>;
  excludePriority_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']>>>;
  excludePriority_not?: InputMaybe<Scalars['Boolean']>;
  excludePriority_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']>>>;
  feeType?: InputMaybe<Scalars['String']>;
  feeType_contains?: InputMaybe<Scalars['String']>;
  feeType_ends_with?: InputMaybe<Scalars['String']>;
  feeType_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  feeType_not?: InputMaybe<Scalars['String']>;
  feeType_not_contains?: InputMaybe<Scalars['String']>;
  feeType_not_ends_with?: InputMaybe<Scalars['String']>;
  feeType_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  feeType_not_starts_with?: InputMaybe<Scalars['String']>;
  feeType_starts_with?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['BigInt']>;
  limit_gt?: InputMaybe<Scalars['BigInt']>;
  limit_gte?: InputMaybe<Scalars['BigInt']>;
  limit_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  limit_lt?: InputMaybe<Scalars['BigInt']>;
  limit_lte?: InputMaybe<Scalars['BigInt']>;
  limit_not?: InputMaybe<Scalars['BigInt']>;
  limit_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  messageId?: InputMaybe<Scalars['String']>;
  messageId_contains?: InputMaybe<Scalars['String']>;
  messageId_ends_with?: InputMaybe<Scalars['String']>;
  messageId_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  messageId_not?: InputMaybe<Scalars['String']>;
  messageId_not_contains?: InputMaybe<Scalars['String']>;
  messageId_not_ends_with?: InputMaybe<Scalars['String']>;
  messageId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  messageId_not_starts_with?: InputMaybe<Scalars['String']>;
  messageId_starts_with?: InputMaybe<Scalars['String']>;
  multiplier?: InputMaybe<Scalars['BigInt']>;
  multiplier_gt?: InputMaybe<Scalars['BigInt']>;
  multiplier_gte?: InputMaybe<Scalars['BigInt']>;
  multiplier_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  multiplier_lt?: InputMaybe<Scalars['BigInt']>;
  multiplier_lte?: InputMaybe<Scalars['BigInt']>;
  multiplier_not?: InputMaybe<Scalars['BigInt']>;
  multiplier_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  recipient?: InputMaybe<Scalars['String']>;
  recipient_contains?: InputMaybe<Scalars['String']>;
  recipient_ends_with?: InputMaybe<Scalars['String']>;
  recipient_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  recipient_not?: InputMaybe<Scalars['String']>;
  recipient_not_contains?: InputMaybe<Scalars['String']>;
  recipient_not_ends_with?: InputMaybe<Scalars['String']>;
  recipient_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  recipient_not_starts_with?: InputMaybe<Scalars['String']>;
  recipient_starts_with?: InputMaybe<Scalars['String']>;
  settings?: InputMaybe<Scalars['BigInt']>;
  settings_gt?: InputMaybe<Scalars['BigInt']>;
  settings_gte?: InputMaybe<Scalars['BigInt']>;
  settings_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  settings_lt?: InputMaybe<Scalars['BigInt']>;
  settings_lte?: InputMaybe<Scalars['BigInt']>;
  settings_not?: InputMaybe<Scalars['BigInt']>;
  settings_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  unwrapped?: InputMaybe<Scalars['Boolean']>;
  unwrapped_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']>>>;
  unwrapped_not?: InputMaybe<Scalars['Boolean']>;
  unwrapped_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']>>>;
};

export type FeeDirectorPage = {
  __typename?: 'FeeDirectorPage';
  items: Array<FeeDirector>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type LatestRequiredSignaturesChanged = {
  __typename?: 'LatestRequiredSignaturesChanged';
  bridge?: Maybe<BridgeSide>;
  bridgeAddress: Scalars['String'];
  chainId: Scalars['BigInt'];
  orderId: Scalars['BigInt'];
};

export type LatestRequiredSignaturesChangedFilter = {
  AND?: InputMaybe<Array<InputMaybe<LatestRequiredSignaturesChangedFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<LatestRequiredSignaturesChangedFilter>>>;
  bridgeAddress?: InputMaybe<Scalars['String']>;
  bridgeAddress_contains?: InputMaybe<Scalars['String']>;
  bridgeAddress_ends_with?: InputMaybe<Scalars['String']>;
  bridgeAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  bridgeAddress_not?: InputMaybe<Scalars['String']>;
  bridgeAddress_not_contains?: InputMaybe<Scalars['String']>;
  bridgeAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  bridgeAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  bridgeAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  bridgeAddress_starts_with?: InputMaybe<Scalars['String']>;
  chainId?: InputMaybe<Scalars['BigInt']>;
  chainId_gt?: InputMaybe<Scalars['BigInt']>;
  chainId_gte?: InputMaybe<Scalars['BigInt']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  chainId_lt?: InputMaybe<Scalars['BigInt']>;
  chainId_lte?: InputMaybe<Scalars['BigInt']>;
  chainId_not?: InputMaybe<Scalars['BigInt']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  orderId?: InputMaybe<Scalars['BigInt']>;
  orderId_gt?: InputMaybe<Scalars['BigInt']>;
  orderId_gte?: InputMaybe<Scalars['BigInt']>;
  orderId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  orderId_lt?: InputMaybe<Scalars['BigInt']>;
  orderId_lte?: InputMaybe<Scalars['BigInt']>;
  orderId_not?: InputMaybe<Scalars['BigInt']>;
  orderId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
};

export type LatestRequiredSignaturesChangedPage = {
  __typename?: 'LatestRequiredSignaturesChangedPage';
  items: Array<LatestRequiredSignaturesChanged>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type LatestValidatorStatusUpdate = {
  __typename?: 'LatestValidatorStatusUpdate';
  bridgeAddress: Scalars['String'];
  chainId: Scalars['BigInt'];
  orderId: Scalars['BigInt'];
  validatorAddress: Scalars['String'];
  validatorStatusUpdate?: Maybe<ValidatorStatusUpdate>;
};

export type LatestValidatorStatusUpdateFilter = {
  AND?: InputMaybe<Array<InputMaybe<LatestValidatorStatusUpdateFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<LatestValidatorStatusUpdateFilter>>>;
  bridgeAddress?: InputMaybe<Scalars['String']>;
  bridgeAddress_contains?: InputMaybe<Scalars['String']>;
  bridgeAddress_ends_with?: InputMaybe<Scalars['String']>;
  bridgeAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  bridgeAddress_not?: InputMaybe<Scalars['String']>;
  bridgeAddress_not_contains?: InputMaybe<Scalars['String']>;
  bridgeAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  bridgeAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  bridgeAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  bridgeAddress_starts_with?: InputMaybe<Scalars['String']>;
  chainId?: InputMaybe<Scalars['BigInt']>;
  chainId_gt?: InputMaybe<Scalars['BigInt']>;
  chainId_gte?: InputMaybe<Scalars['BigInt']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  chainId_lt?: InputMaybe<Scalars['BigInt']>;
  chainId_lte?: InputMaybe<Scalars['BigInt']>;
  chainId_not?: InputMaybe<Scalars['BigInt']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  orderId?: InputMaybe<Scalars['BigInt']>;
  orderId_gt?: InputMaybe<Scalars['BigInt']>;
  orderId_gte?: InputMaybe<Scalars['BigInt']>;
  orderId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  orderId_lt?: InputMaybe<Scalars['BigInt']>;
  orderId_lte?: InputMaybe<Scalars['BigInt']>;
  orderId_not?: InputMaybe<Scalars['BigInt']>;
  orderId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  validatorAddress?: InputMaybe<Scalars['String']>;
  validatorAddress_contains?: InputMaybe<Scalars['String']>;
  validatorAddress_ends_with?: InputMaybe<Scalars['String']>;
  validatorAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  validatorAddress_not?: InputMaybe<Scalars['String']>;
  validatorAddress_not_contains?: InputMaybe<Scalars['String']>;
  validatorAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  validatorAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  validatorAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  validatorAddress_starts_with?: InputMaybe<Scalars['String']>;
};

export type LatestValidatorStatusUpdatePage = {
  __typename?: 'LatestValidatorStatusUpdatePage';
  items: Array<LatestValidatorStatusUpdate>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type Meta = {
  __typename?: 'Meta';
  status?: Maybe<Scalars['JSON']>;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']>;
  hasNextPage: Scalars['Boolean'];
  hasPreviousPage: Scalars['Boolean'];
  startCursor?: Maybe<Scalars['String']>;
};

export type Provider =
  | 'pulsechain'
  | 'tokensex'
  | '%future added value';

export type Query = {
  __typename?: 'Query';
  _meta?: Maybe<Meta>;
  affirmationCompleted?: Maybe<AffirmationCompleted>;
  affirmationCompleteds: AffirmationCompletedPage;
  block?: Maybe<Block>;
  blocks: BlockPage;
  bridgeSide?: Maybe<BridgeSide>;
  bridgeSides: BridgeSidePage;
  feeDirector?: Maybe<FeeDirector>;
  feeDirectors: FeeDirectorPage;
  internalTokenReverseLookup?: Maybe<InternalTokenReverseLookup>;
  internalTokenReverseLookups: InternalTokenReverseLookupPage;
  latestRequiredSignaturesChanged?: Maybe<LatestRequiredSignaturesChanged>;
  latestRequiredSignaturesChangeds: LatestRequiredSignaturesChangedPage;
  latestValidatorStatusUpdate?: Maybe<LatestValidatorStatusUpdate>;
  latestValidatorStatusUpdates: LatestValidatorStatusUpdatePage;
  relayedMessage?: Maybe<RelayedMessage>;
  relayedMessages: RelayedMessagePage;
  requiredSignaturesChanged?: Maybe<RequiredSignaturesChanged>;
  requiredSignaturesChangeds: RequiredSignaturesChangedPage;
  reverseMessageHashBinding?: Maybe<ReverseMessageHashBinding>;
  reverseMessageHashBindings: ReverseMessageHashBindingPage;
  signedForAffirmation?: Maybe<SignedForAffirmation>;
  signedForAffirmations: SignedForAffirmationPage;
  signedForUserRequest?: Maybe<SignedForUserRequest>;
  signedForUserRequests: SignedForUserRequestPage;
  token?: Maybe<Token>;
  tokens: TokenPage;
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
  messageHash: Scalars['String'];
};


export type QueryAffirmationCompletedsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<AffirmationCompletedFilter>;
};


export type QueryBlockArgs = {
  chainId: Scalars['BigInt'];
  hash: Scalars['String'];
};


export type QueryBlocksArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<BlockFilter>;
};


export type QueryBridgeSideArgs = {
  address: Scalars['String'];
  chainId: Scalars['BigInt'];
};


export type QueryBridgeSidesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<BridgeSideFilter>;
};


export type QueryFeeDirectorArgs = {
  messageId: Scalars['String'];
};


export type QueryFeeDirectorsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<FeeDirectorFilter>;
};


export type QueryInternalTokenReverseLookupArgs = {
  address: Scalars['String'];
  chainId: Scalars['BigInt'];
  omnibridgeAddress: Scalars['String'];
};


export type QueryInternalTokenReverseLookupsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<InternalTokenReverseLookupFilter>;
};


export type QueryLatestRequiredSignaturesChangedArgs = {
  bridgeAddress: Scalars['String'];
  chainId: Scalars['BigInt'];
};


export type QueryLatestRequiredSignaturesChangedsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<LatestRequiredSignaturesChangedFilter>;
};


export type QueryLatestValidatorStatusUpdateArgs = {
  bridgeAddress: Scalars['String'];
  chainId: Scalars['BigInt'];
  validatorAddress: Scalars['String'];
};


export type QueryLatestValidatorStatusUpdatesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<LatestValidatorStatusUpdateFilter>;
};


export type QueryRelayedMessageArgs = {
  messageHash: Scalars['String'];
};


export type QueryRelayedMessagesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<RelayedMessageFilter>;
};


export type QueryRequiredSignaturesChangedArgs = {
  orderId: Scalars['BigInt'];
};


export type QueryRequiredSignaturesChangedsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<RequiredSignaturesChangedFilter>;
};


export type QueryReverseMessageHashBindingArgs = {
  messageHash: Scalars['String'];
};


export type QueryReverseMessageHashBindingsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<ReverseMessageHashBindingFilter>;
};


export type QuerySignedForAffirmationArgs = {
  bridgeAddress: Scalars['String'];
  chainId: Scalars['BigInt'];
  messageHash: Scalars['String'];
  validatorAddress: Scalars['String'];
};


export type QuerySignedForAffirmationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<SignedForAffirmationFilter>;
};


export type QuerySignedForUserRequestArgs = {
  bridgeAddress: Scalars['String'];
  chainId: Scalars['BigInt'];
  messageHash: Scalars['String'];
  validatorAddress: Scalars['String'];
};


export type QuerySignedForUserRequestsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<SignedForUserRequestFilter>;
};


export type QueryTokenArgs = {
  address: Scalars['String'];
  ambAddress: Scalars['String'];
  chainId: Scalars['BigInt'];
};


export type QueryTokensArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<TokenFilter>;
};


export type QueryTransactionArgs = {
  chainId: Scalars['BigInt'];
  hash: Scalars['String'];
};


export type QueryTransactionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<TransactionFilter>;
};


export type QueryUserRequestForAffirmationArgs = {
  messageId: Scalars['String'];
};


export type QueryUserRequestForAffirmationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<UserRequestForAffirmationFilter>;
};


export type QueryUserRequestForSignatureArgs = {
  messageId: Scalars['String'];
};


export type QueryUserRequestForSignaturesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<UserRequestForSignatureFilter>;
};


export type QueryValidatorStatusUpdateArgs = {
  orderId: Scalars['BigInt'];
};


export type QueryValidatorStatusUpdatesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<ValidatorStatusUpdateFilter>;
};

export type RelayedMessage = {
  __typename?: 'RelayedMessage';
  block?: Maybe<Block>;
  blockHash: Scalars['String'];
  chainId: Scalars['BigInt'];
  deliverer: Scalars['String'];
  destinationToken?: Maybe<Token>;
  destinationTokenAddress?: Maybe<Scalars['String']>;
  destinationTokenAmbAddress?: Maybe<Scalars['String']>;
  destinationTokenChainId?: Maybe<Scalars['BigInt']>;
  logIndex: Scalars['Float'];
  messageHash: Scalars['String'];
  orderId: Scalars['BigInt'];
  originationToken?: Maybe<Token>;
  originationTokenAddress?: Maybe<Scalars['String']>;
  originationTokenAmbAddress?: Maybe<Scalars['String']>;
  originationTokenChainId?: Maybe<Scalars['BigInt']>;
  signature?: Maybe<SignedForUserRequestPage>;
  transaction?: Maybe<Transaction>;
  transactionHash: Scalars['String'];
  userRequest?: Maybe<UserRequestForSignature>;
  userRequestId: Scalars['String'];
};


export type RelayedMessageSignatureArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<SignedForUserRequestFilter>;
};

export type RelayedMessageFilter = {
  AND?: InputMaybe<Array<InputMaybe<RelayedMessageFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<RelayedMessageFilter>>>;
  blockHash?: InputMaybe<Scalars['String']>;
  blockHash_contains?: InputMaybe<Scalars['String']>;
  blockHash_ends_with?: InputMaybe<Scalars['String']>;
  blockHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  blockHash_not?: InputMaybe<Scalars['String']>;
  blockHash_not_contains?: InputMaybe<Scalars['String']>;
  blockHash_not_ends_with?: InputMaybe<Scalars['String']>;
  blockHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  blockHash_not_starts_with?: InputMaybe<Scalars['String']>;
  blockHash_starts_with?: InputMaybe<Scalars['String']>;
  chainId?: InputMaybe<Scalars['BigInt']>;
  chainId_gt?: InputMaybe<Scalars['BigInt']>;
  chainId_gte?: InputMaybe<Scalars['BigInt']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  chainId_lt?: InputMaybe<Scalars['BigInt']>;
  chainId_lte?: InputMaybe<Scalars['BigInt']>;
  chainId_not?: InputMaybe<Scalars['BigInt']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  deliverer?: InputMaybe<Scalars['String']>;
  deliverer_contains?: InputMaybe<Scalars['String']>;
  deliverer_ends_with?: InputMaybe<Scalars['String']>;
  deliverer_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  deliverer_not?: InputMaybe<Scalars['String']>;
  deliverer_not_contains?: InputMaybe<Scalars['String']>;
  deliverer_not_ends_with?: InputMaybe<Scalars['String']>;
  deliverer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  deliverer_not_starts_with?: InputMaybe<Scalars['String']>;
  deliverer_starts_with?: InputMaybe<Scalars['String']>;
  destinationTokenAddress?: InputMaybe<Scalars['String']>;
  destinationTokenAddress_contains?: InputMaybe<Scalars['String']>;
  destinationTokenAddress_ends_with?: InputMaybe<Scalars['String']>;
  destinationTokenAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  destinationTokenAddress_not?: InputMaybe<Scalars['String']>;
  destinationTokenAddress_not_contains?: InputMaybe<Scalars['String']>;
  destinationTokenAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  destinationTokenAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  destinationTokenAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  destinationTokenAddress_starts_with?: InputMaybe<Scalars['String']>;
  destinationTokenAmbAddress?: InputMaybe<Scalars['String']>;
  destinationTokenAmbAddress_contains?: InputMaybe<Scalars['String']>;
  destinationTokenAmbAddress_ends_with?: InputMaybe<Scalars['String']>;
  destinationTokenAmbAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  destinationTokenAmbAddress_not?: InputMaybe<Scalars['String']>;
  destinationTokenAmbAddress_not_contains?: InputMaybe<Scalars['String']>;
  destinationTokenAmbAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  destinationTokenAmbAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  destinationTokenAmbAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  destinationTokenAmbAddress_starts_with?: InputMaybe<Scalars['String']>;
  destinationTokenChainId?: InputMaybe<Scalars['BigInt']>;
  destinationTokenChainId_gt?: InputMaybe<Scalars['BigInt']>;
  destinationTokenChainId_gte?: InputMaybe<Scalars['BigInt']>;
  destinationTokenChainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  destinationTokenChainId_lt?: InputMaybe<Scalars['BigInt']>;
  destinationTokenChainId_lte?: InputMaybe<Scalars['BigInt']>;
  destinationTokenChainId_not?: InputMaybe<Scalars['BigInt']>;
  destinationTokenChainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  logIndex?: InputMaybe<Scalars['Float']>;
  logIndex_gt?: InputMaybe<Scalars['Float']>;
  logIndex_gte?: InputMaybe<Scalars['Float']>;
  logIndex_in?: InputMaybe<Array<InputMaybe<Scalars['Float']>>>;
  logIndex_lt?: InputMaybe<Scalars['Float']>;
  logIndex_lte?: InputMaybe<Scalars['Float']>;
  logIndex_not?: InputMaybe<Scalars['Float']>;
  logIndex_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']>>>;
  messageHash?: InputMaybe<Scalars['String']>;
  messageHash_contains?: InputMaybe<Scalars['String']>;
  messageHash_ends_with?: InputMaybe<Scalars['String']>;
  messageHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  messageHash_not?: InputMaybe<Scalars['String']>;
  messageHash_not_contains?: InputMaybe<Scalars['String']>;
  messageHash_not_ends_with?: InputMaybe<Scalars['String']>;
  messageHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  messageHash_not_starts_with?: InputMaybe<Scalars['String']>;
  messageHash_starts_with?: InputMaybe<Scalars['String']>;
  orderId?: InputMaybe<Scalars['BigInt']>;
  orderId_gt?: InputMaybe<Scalars['BigInt']>;
  orderId_gte?: InputMaybe<Scalars['BigInt']>;
  orderId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  orderId_lt?: InputMaybe<Scalars['BigInt']>;
  orderId_lte?: InputMaybe<Scalars['BigInt']>;
  orderId_not?: InputMaybe<Scalars['BigInt']>;
  orderId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  originationTokenAddress?: InputMaybe<Scalars['String']>;
  originationTokenAddress_contains?: InputMaybe<Scalars['String']>;
  originationTokenAddress_ends_with?: InputMaybe<Scalars['String']>;
  originationTokenAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  originationTokenAddress_not?: InputMaybe<Scalars['String']>;
  originationTokenAddress_not_contains?: InputMaybe<Scalars['String']>;
  originationTokenAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  originationTokenAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  originationTokenAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  originationTokenAddress_starts_with?: InputMaybe<Scalars['String']>;
  originationTokenAmbAddress?: InputMaybe<Scalars['String']>;
  originationTokenAmbAddress_contains?: InputMaybe<Scalars['String']>;
  originationTokenAmbAddress_ends_with?: InputMaybe<Scalars['String']>;
  originationTokenAmbAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  originationTokenAmbAddress_not?: InputMaybe<Scalars['String']>;
  originationTokenAmbAddress_not_contains?: InputMaybe<Scalars['String']>;
  originationTokenAmbAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  originationTokenAmbAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  originationTokenAmbAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  originationTokenAmbAddress_starts_with?: InputMaybe<Scalars['String']>;
  originationTokenChainId?: InputMaybe<Scalars['BigInt']>;
  originationTokenChainId_gt?: InputMaybe<Scalars['BigInt']>;
  originationTokenChainId_gte?: InputMaybe<Scalars['BigInt']>;
  originationTokenChainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  originationTokenChainId_lt?: InputMaybe<Scalars['BigInt']>;
  originationTokenChainId_lte?: InputMaybe<Scalars['BigInt']>;
  originationTokenChainId_not?: InputMaybe<Scalars['BigInt']>;
  originationTokenChainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  transactionHash?: InputMaybe<Scalars['String']>;
  transactionHash_contains?: InputMaybe<Scalars['String']>;
  transactionHash_ends_with?: InputMaybe<Scalars['String']>;
  transactionHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  transactionHash_not?: InputMaybe<Scalars['String']>;
  transactionHash_not_contains?: InputMaybe<Scalars['String']>;
  transactionHash_not_ends_with?: InputMaybe<Scalars['String']>;
  transactionHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  transactionHash_not_starts_with?: InputMaybe<Scalars['String']>;
  transactionHash_starts_with?: InputMaybe<Scalars['String']>;
  userRequestId?: InputMaybe<Scalars['String']>;
  userRequestId_contains?: InputMaybe<Scalars['String']>;
  userRequestId_ends_with?: InputMaybe<Scalars['String']>;
  userRequestId_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  userRequestId_not?: InputMaybe<Scalars['String']>;
  userRequestId_not_contains?: InputMaybe<Scalars['String']>;
  userRequestId_not_ends_with?: InputMaybe<Scalars['String']>;
  userRequestId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  userRequestId_not_starts_with?: InputMaybe<Scalars['String']>;
  userRequestId_starts_with?: InputMaybe<Scalars['String']>;
};

export type RelayedMessagePage = {
  __typename?: 'RelayedMessagePage';
  items: Array<RelayedMessage>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type RequiredSignaturesChanged = {
  __typename?: 'RequiredSignaturesChanged';
  block?: Maybe<Block>;
  blockHash: Scalars['String'];
  bridge?: Maybe<BridgeSide>;
  bridgeAddress: Scalars['String'];
  chainId: Scalars['BigInt'];
  logIndex: Scalars['Float'];
  orderId: Scalars['BigInt'];
  transaction?: Maybe<Transaction>;
  transactionHash: Scalars['String'];
  value: Scalars['BigInt'];
};

export type RequiredSignaturesChangedFilter = {
  AND?: InputMaybe<Array<InputMaybe<RequiredSignaturesChangedFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<RequiredSignaturesChangedFilter>>>;
  blockHash?: InputMaybe<Scalars['String']>;
  blockHash_contains?: InputMaybe<Scalars['String']>;
  blockHash_ends_with?: InputMaybe<Scalars['String']>;
  blockHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  blockHash_not?: InputMaybe<Scalars['String']>;
  blockHash_not_contains?: InputMaybe<Scalars['String']>;
  blockHash_not_ends_with?: InputMaybe<Scalars['String']>;
  blockHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  blockHash_not_starts_with?: InputMaybe<Scalars['String']>;
  blockHash_starts_with?: InputMaybe<Scalars['String']>;
  bridgeAddress?: InputMaybe<Scalars['String']>;
  bridgeAddress_contains?: InputMaybe<Scalars['String']>;
  bridgeAddress_ends_with?: InputMaybe<Scalars['String']>;
  bridgeAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  bridgeAddress_not?: InputMaybe<Scalars['String']>;
  bridgeAddress_not_contains?: InputMaybe<Scalars['String']>;
  bridgeAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  bridgeAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  bridgeAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  bridgeAddress_starts_with?: InputMaybe<Scalars['String']>;
  chainId?: InputMaybe<Scalars['BigInt']>;
  chainId_gt?: InputMaybe<Scalars['BigInt']>;
  chainId_gte?: InputMaybe<Scalars['BigInt']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  chainId_lt?: InputMaybe<Scalars['BigInt']>;
  chainId_lte?: InputMaybe<Scalars['BigInt']>;
  chainId_not?: InputMaybe<Scalars['BigInt']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  logIndex?: InputMaybe<Scalars['Float']>;
  logIndex_gt?: InputMaybe<Scalars['Float']>;
  logIndex_gte?: InputMaybe<Scalars['Float']>;
  logIndex_in?: InputMaybe<Array<InputMaybe<Scalars['Float']>>>;
  logIndex_lt?: InputMaybe<Scalars['Float']>;
  logIndex_lte?: InputMaybe<Scalars['Float']>;
  logIndex_not?: InputMaybe<Scalars['Float']>;
  logIndex_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']>>>;
  orderId?: InputMaybe<Scalars['BigInt']>;
  orderId_gt?: InputMaybe<Scalars['BigInt']>;
  orderId_gte?: InputMaybe<Scalars['BigInt']>;
  orderId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  orderId_lt?: InputMaybe<Scalars['BigInt']>;
  orderId_lte?: InputMaybe<Scalars['BigInt']>;
  orderId_not?: InputMaybe<Scalars['BigInt']>;
  orderId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  transactionHash?: InputMaybe<Scalars['String']>;
  transactionHash_contains?: InputMaybe<Scalars['String']>;
  transactionHash_ends_with?: InputMaybe<Scalars['String']>;
  transactionHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  transactionHash_not?: InputMaybe<Scalars['String']>;
  transactionHash_not_contains?: InputMaybe<Scalars['String']>;
  transactionHash_not_ends_with?: InputMaybe<Scalars['String']>;
  transactionHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  transactionHash_not_starts_with?: InputMaybe<Scalars['String']>;
  transactionHash_starts_with?: InputMaybe<Scalars['String']>;
  value?: InputMaybe<Scalars['BigInt']>;
  value_gt?: InputMaybe<Scalars['BigInt']>;
  value_gte?: InputMaybe<Scalars['BigInt']>;
  value_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  value_lt?: InputMaybe<Scalars['BigInt']>;
  value_lte?: InputMaybe<Scalars['BigInt']>;
  value_not?: InputMaybe<Scalars['BigInt']>;
  value_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
};

export type RequiredSignaturesChangedPage = {
  __typename?: 'RequiredSignaturesChangedPage';
  items: Array<RequiredSignaturesChanged>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type ReverseMessageHashBinding = {
  __typename?: 'ReverseMessageHashBinding';
  messageHash: Scalars['String'];
  messageId: Scalars['String'];
};

export type ReverseMessageHashBindingFilter = {
  AND?: InputMaybe<Array<InputMaybe<ReverseMessageHashBindingFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<ReverseMessageHashBindingFilter>>>;
  messageHash?: InputMaybe<Scalars['String']>;
  messageHash_contains?: InputMaybe<Scalars['String']>;
  messageHash_ends_with?: InputMaybe<Scalars['String']>;
  messageHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  messageHash_not?: InputMaybe<Scalars['String']>;
  messageHash_not_contains?: InputMaybe<Scalars['String']>;
  messageHash_not_ends_with?: InputMaybe<Scalars['String']>;
  messageHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  messageHash_not_starts_with?: InputMaybe<Scalars['String']>;
  messageHash_starts_with?: InputMaybe<Scalars['String']>;
  messageId?: InputMaybe<Scalars['String']>;
  messageId_contains?: InputMaybe<Scalars['String']>;
  messageId_ends_with?: InputMaybe<Scalars['String']>;
  messageId_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  messageId_not?: InputMaybe<Scalars['String']>;
  messageId_not_contains?: InputMaybe<Scalars['String']>;
  messageId_not_ends_with?: InputMaybe<Scalars['String']>;
  messageId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  messageId_not_starts_with?: InputMaybe<Scalars['String']>;
  messageId_starts_with?: InputMaybe<Scalars['String']>;
};

export type ReverseMessageHashBindingPage = {
  __typename?: 'ReverseMessageHashBindingPage';
  items: Array<ReverseMessageHashBinding>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type SignedForAffirmation = {
  __typename?: 'SignedForAffirmation';
  block?: Maybe<Block>;
  blockHash: Scalars['String'];
  bridge?: Maybe<BridgeSide>;
  bridgeAddress: Scalars['String'];
  chainId: Scalars['BigInt'];
  completion?: Maybe<AffirmationCompleted>;
  delivery?: Maybe<AffirmationCompleted>;
  logIndex: Scalars['Float'];
  messageHash: Scalars['String'];
  orderId: Scalars['BigInt'];
  transaction?: Maybe<Transaction>;
  transactionHash: Scalars['String'];
  userRequest?: Maybe<UserRequestForAffirmation>;
  userRequestId: Scalars['String'];
  validatorAddress: Scalars['String'];
};

export type SignedForAffirmationFilter = {
  AND?: InputMaybe<Array<InputMaybe<SignedForAffirmationFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<SignedForAffirmationFilter>>>;
  blockHash?: InputMaybe<Scalars['String']>;
  blockHash_contains?: InputMaybe<Scalars['String']>;
  blockHash_ends_with?: InputMaybe<Scalars['String']>;
  blockHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  blockHash_not?: InputMaybe<Scalars['String']>;
  blockHash_not_contains?: InputMaybe<Scalars['String']>;
  blockHash_not_ends_with?: InputMaybe<Scalars['String']>;
  blockHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  blockHash_not_starts_with?: InputMaybe<Scalars['String']>;
  blockHash_starts_with?: InputMaybe<Scalars['String']>;
  bridgeAddress?: InputMaybe<Scalars['String']>;
  bridgeAddress_contains?: InputMaybe<Scalars['String']>;
  bridgeAddress_ends_with?: InputMaybe<Scalars['String']>;
  bridgeAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  bridgeAddress_not?: InputMaybe<Scalars['String']>;
  bridgeAddress_not_contains?: InputMaybe<Scalars['String']>;
  bridgeAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  bridgeAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  bridgeAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  bridgeAddress_starts_with?: InputMaybe<Scalars['String']>;
  chainId?: InputMaybe<Scalars['BigInt']>;
  chainId_gt?: InputMaybe<Scalars['BigInt']>;
  chainId_gte?: InputMaybe<Scalars['BigInt']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  chainId_lt?: InputMaybe<Scalars['BigInt']>;
  chainId_lte?: InputMaybe<Scalars['BigInt']>;
  chainId_not?: InputMaybe<Scalars['BigInt']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  logIndex?: InputMaybe<Scalars['Float']>;
  logIndex_gt?: InputMaybe<Scalars['Float']>;
  logIndex_gte?: InputMaybe<Scalars['Float']>;
  logIndex_in?: InputMaybe<Array<InputMaybe<Scalars['Float']>>>;
  logIndex_lt?: InputMaybe<Scalars['Float']>;
  logIndex_lte?: InputMaybe<Scalars['Float']>;
  logIndex_not?: InputMaybe<Scalars['Float']>;
  logIndex_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']>>>;
  messageHash?: InputMaybe<Scalars['String']>;
  messageHash_contains?: InputMaybe<Scalars['String']>;
  messageHash_ends_with?: InputMaybe<Scalars['String']>;
  messageHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  messageHash_not?: InputMaybe<Scalars['String']>;
  messageHash_not_contains?: InputMaybe<Scalars['String']>;
  messageHash_not_ends_with?: InputMaybe<Scalars['String']>;
  messageHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  messageHash_not_starts_with?: InputMaybe<Scalars['String']>;
  messageHash_starts_with?: InputMaybe<Scalars['String']>;
  orderId?: InputMaybe<Scalars['BigInt']>;
  orderId_gt?: InputMaybe<Scalars['BigInt']>;
  orderId_gte?: InputMaybe<Scalars['BigInt']>;
  orderId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  orderId_lt?: InputMaybe<Scalars['BigInt']>;
  orderId_lte?: InputMaybe<Scalars['BigInt']>;
  orderId_not?: InputMaybe<Scalars['BigInt']>;
  orderId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  transactionHash?: InputMaybe<Scalars['String']>;
  transactionHash_contains?: InputMaybe<Scalars['String']>;
  transactionHash_ends_with?: InputMaybe<Scalars['String']>;
  transactionHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  transactionHash_not?: InputMaybe<Scalars['String']>;
  transactionHash_not_contains?: InputMaybe<Scalars['String']>;
  transactionHash_not_ends_with?: InputMaybe<Scalars['String']>;
  transactionHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  transactionHash_not_starts_with?: InputMaybe<Scalars['String']>;
  transactionHash_starts_with?: InputMaybe<Scalars['String']>;
  userRequestId?: InputMaybe<Scalars['String']>;
  userRequestId_contains?: InputMaybe<Scalars['String']>;
  userRequestId_ends_with?: InputMaybe<Scalars['String']>;
  userRequestId_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  userRequestId_not?: InputMaybe<Scalars['String']>;
  userRequestId_not_contains?: InputMaybe<Scalars['String']>;
  userRequestId_not_ends_with?: InputMaybe<Scalars['String']>;
  userRequestId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  userRequestId_not_starts_with?: InputMaybe<Scalars['String']>;
  userRequestId_starts_with?: InputMaybe<Scalars['String']>;
  validatorAddress?: InputMaybe<Scalars['String']>;
  validatorAddress_contains?: InputMaybe<Scalars['String']>;
  validatorAddress_ends_with?: InputMaybe<Scalars['String']>;
  validatorAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  validatorAddress_not?: InputMaybe<Scalars['String']>;
  validatorAddress_not_contains?: InputMaybe<Scalars['String']>;
  validatorAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  validatorAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  validatorAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  validatorAddress_starts_with?: InputMaybe<Scalars['String']>;
};

export type SignedForAffirmationPage = {
  __typename?: 'SignedForAffirmationPage';
  items: Array<SignedForAffirmation>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type SignedForUserRequest = {
  __typename?: 'SignedForUserRequest';
  block?: Maybe<Block>;
  blockHash: Scalars['String'];
  bridgeAddress: Scalars['String'];
  chainId: Scalars['BigInt'];
  delivery?: Maybe<RelayedMessage>;
  logIndex: Scalars['Float'];
  messageHash: Scalars['String'];
  orderId: Scalars['BigInt'];
  transaction?: Maybe<Transaction>;
  transactionHash: Scalars['String'];
  userRequest?: Maybe<UserRequestForSignature>;
  userRequestId: Scalars['String'];
  validatorAddress: Scalars['String'];
};

export type SignedForUserRequestFilter = {
  AND?: InputMaybe<Array<InputMaybe<SignedForUserRequestFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<SignedForUserRequestFilter>>>;
  blockHash?: InputMaybe<Scalars['String']>;
  blockHash_contains?: InputMaybe<Scalars['String']>;
  blockHash_ends_with?: InputMaybe<Scalars['String']>;
  blockHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  blockHash_not?: InputMaybe<Scalars['String']>;
  blockHash_not_contains?: InputMaybe<Scalars['String']>;
  blockHash_not_ends_with?: InputMaybe<Scalars['String']>;
  blockHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  blockHash_not_starts_with?: InputMaybe<Scalars['String']>;
  blockHash_starts_with?: InputMaybe<Scalars['String']>;
  bridgeAddress?: InputMaybe<Scalars['String']>;
  bridgeAddress_contains?: InputMaybe<Scalars['String']>;
  bridgeAddress_ends_with?: InputMaybe<Scalars['String']>;
  bridgeAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  bridgeAddress_not?: InputMaybe<Scalars['String']>;
  bridgeAddress_not_contains?: InputMaybe<Scalars['String']>;
  bridgeAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  bridgeAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  bridgeAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  bridgeAddress_starts_with?: InputMaybe<Scalars['String']>;
  chainId?: InputMaybe<Scalars['BigInt']>;
  chainId_gt?: InputMaybe<Scalars['BigInt']>;
  chainId_gte?: InputMaybe<Scalars['BigInt']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  chainId_lt?: InputMaybe<Scalars['BigInt']>;
  chainId_lte?: InputMaybe<Scalars['BigInt']>;
  chainId_not?: InputMaybe<Scalars['BigInt']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  logIndex?: InputMaybe<Scalars['Float']>;
  logIndex_gt?: InputMaybe<Scalars['Float']>;
  logIndex_gte?: InputMaybe<Scalars['Float']>;
  logIndex_in?: InputMaybe<Array<InputMaybe<Scalars['Float']>>>;
  logIndex_lt?: InputMaybe<Scalars['Float']>;
  logIndex_lte?: InputMaybe<Scalars['Float']>;
  logIndex_not?: InputMaybe<Scalars['Float']>;
  logIndex_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']>>>;
  messageHash?: InputMaybe<Scalars['String']>;
  messageHash_contains?: InputMaybe<Scalars['String']>;
  messageHash_ends_with?: InputMaybe<Scalars['String']>;
  messageHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  messageHash_not?: InputMaybe<Scalars['String']>;
  messageHash_not_contains?: InputMaybe<Scalars['String']>;
  messageHash_not_ends_with?: InputMaybe<Scalars['String']>;
  messageHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  messageHash_not_starts_with?: InputMaybe<Scalars['String']>;
  messageHash_starts_with?: InputMaybe<Scalars['String']>;
  orderId?: InputMaybe<Scalars['BigInt']>;
  orderId_gt?: InputMaybe<Scalars['BigInt']>;
  orderId_gte?: InputMaybe<Scalars['BigInt']>;
  orderId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  orderId_lt?: InputMaybe<Scalars['BigInt']>;
  orderId_lte?: InputMaybe<Scalars['BigInt']>;
  orderId_not?: InputMaybe<Scalars['BigInt']>;
  orderId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  transactionHash?: InputMaybe<Scalars['String']>;
  transactionHash_contains?: InputMaybe<Scalars['String']>;
  transactionHash_ends_with?: InputMaybe<Scalars['String']>;
  transactionHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  transactionHash_not?: InputMaybe<Scalars['String']>;
  transactionHash_not_contains?: InputMaybe<Scalars['String']>;
  transactionHash_not_ends_with?: InputMaybe<Scalars['String']>;
  transactionHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  transactionHash_not_starts_with?: InputMaybe<Scalars['String']>;
  transactionHash_starts_with?: InputMaybe<Scalars['String']>;
  userRequestId?: InputMaybe<Scalars['String']>;
  userRequestId_contains?: InputMaybe<Scalars['String']>;
  userRequestId_ends_with?: InputMaybe<Scalars['String']>;
  userRequestId_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  userRequestId_not?: InputMaybe<Scalars['String']>;
  userRequestId_not_contains?: InputMaybe<Scalars['String']>;
  userRequestId_not_ends_with?: InputMaybe<Scalars['String']>;
  userRequestId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  userRequestId_not_starts_with?: InputMaybe<Scalars['String']>;
  userRequestId_starts_with?: InputMaybe<Scalars['String']>;
  validatorAddress?: InputMaybe<Scalars['String']>;
  validatorAddress_contains?: InputMaybe<Scalars['String']>;
  validatorAddress_ends_with?: InputMaybe<Scalars['String']>;
  validatorAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  validatorAddress_not?: InputMaybe<Scalars['String']>;
  validatorAddress_not_contains?: InputMaybe<Scalars['String']>;
  validatorAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  validatorAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  validatorAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  validatorAddress_starts_with?: InputMaybe<Scalars['String']>;
};

export type SignedForUserRequestPage = {
  __typename?: 'SignedForUserRequestPage';
  items: Array<SignedForUserRequest>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type Token = {
  __typename?: 'Token';
  address: Scalars['String'];
  ambAddress: Scalars['String'];
  chainId: Scalars['BigInt'];
  derivatives?: Maybe<TokenPage>;
  destination?: Maybe<Token>;
  destinationAddress?: Maybe<Scalars['String']>;
  destinationAmbAddress?: Maybe<Scalars['String']>;
  destinationChainId?: Maybe<Scalars['BigInt']>;
  orderId: Scalars['BigInt'];
  origination?: Maybe<Token>;
  originationAddress?: Maybe<Scalars['String']>;
  originationAmbAddress?: Maybe<Scalars['String']>;
  originationChainId?: Maybe<Scalars['BigInt']>;
  userRequestForAffirmations?: Maybe<UserRequestForAffirmationPage>;
  userRequestForSignatures?: Maybe<UserRequestForSignaturePage>;
};


export type TokenDerivativesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<TokenFilter>;
};


export type TokenUserRequestForAffirmationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<UserRequestForAffirmationFilter>;
};


export type TokenUserRequestForSignaturesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<UserRequestForSignatureFilter>;
};

export type TokenFilter = {
  AND?: InputMaybe<Array<InputMaybe<TokenFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<TokenFilter>>>;
  address?: InputMaybe<Scalars['String']>;
  address_contains?: InputMaybe<Scalars['String']>;
  address_ends_with?: InputMaybe<Scalars['String']>;
  address_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  address_not?: InputMaybe<Scalars['String']>;
  address_not_contains?: InputMaybe<Scalars['String']>;
  address_not_ends_with?: InputMaybe<Scalars['String']>;
  address_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  address_not_starts_with?: InputMaybe<Scalars['String']>;
  address_starts_with?: InputMaybe<Scalars['String']>;
  ambAddress?: InputMaybe<Scalars['String']>;
  ambAddress_contains?: InputMaybe<Scalars['String']>;
  ambAddress_ends_with?: InputMaybe<Scalars['String']>;
  ambAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  ambAddress_not?: InputMaybe<Scalars['String']>;
  ambAddress_not_contains?: InputMaybe<Scalars['String']>;
  ambAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  ambAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  ambAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  ambAddress_starts_with?: InputMaybe<Scalars['String']>;
  chainId?: InputMaybe<Scalars['BigInt']>;
  chainId_gt?: InputMaybe<Scalars['BigInt']>;
  chainId_gte?: InputMaybe<Scalars['BigInt']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  chainId_lt?: InputMaybe<Scalars['BigInt']>;
  chainId_lte?: InputMaybe<Scalars['BigInt']>;
  chainId_not?: InputMaybe<Scalars['BigInt']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  destinationAddress?: InputMaybe<Scalars['String']>;
  destinationAddress_contains?: InputMaybe<Scalars['String']>;
  destinationAddress_ends_with?: InputMaybe<Scalars['String']>;
  destinationAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  destinationAddress_not?: InputMaybe<Scalars['String']>;
  destinationAddress_not_contains?: InputMaybe<Scalars['String']>;
  destinationAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  destinationAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  destinationAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  destinationAddress_starts_with?: InputMaybe<Scalars['String']>;
  destinationAmbAddress?: InputMaybe<Scalars['String']>;
  destinationAmbAddress_contains?: InputMaybe<Scalars['String']>;
  destinationAmbAddress_ends_with?: InputMaybe<Scalars['String']>;
  destinationAmbAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  destinationAmbAddress_not?: InputMaybe<Scalars['String']>;
  destinationAmbAddress_not_contains?: InputMaybe<Scalars['String']>;
  destinationAmbAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  destinationAmbAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  destinationAmbAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  destinationAmbAddress_starts_with?: InputMaybe<Scalars['String']>;
  destinationChainId?: InputMaybe<Scalars['BigInt']>;
  destinationChainId_gt?: InputMaybe<Scalars['BigInt']>;
  destinationChainId_gte?: InputMaybe<Scalars['BigInt']>;
  destinationChainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  destinationChainId_lt?: InputMaybe<Scalars['BigInt']>;
  destinationChainId_lte?: InputMaybe<Scalars['BigInt']>;
  destinationChainId_not?: InputMaybe<Scalars['BigInt']>;
  destinationChainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  orderId?: InputMaybe<Scalars['BigInt']>;
  orderId_gt?: InputMaybe<Scalars['BigInt']>;
  orderId_gte?: InputMaybe<Scalars['BigInt']>;
  orderId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  orderId_lt?: InputMaybe<Scalars['BigInt']>;
  orderId_lte?: InputMaybe<Scalars['BigInt']>;
  orderId_not?: InputMaybe<Scalars['BigInt']>;
  orderId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  originationAddress?: InputMaybe<Scalars['String']>;
  originationAddress_contains?: InputMaybe<Scalars['String']>;
  originationAddress_ends_with?: InputMaybe<Scalars['String']>;
  originationAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  originationAddress_not?: InputMaybe<Scalars['String']>;
  originationAddress_not_contains?: InputMaybe<Scalars['String']>;
  originationAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  originationAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  originationAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  originationAddress_starts_with?: InputMaybe<Scalars['String']>;
  originationAmbAddress?: InputMaybe<Scalars['String']>;
  originationAmbAddress_contains?: InputMaybe<Scalars['String']>;
  originationAmbAddress_ends_with?: InputMaybe<Scalars['String']>;
  originationAmbAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  originationAmbAddress_not?: InputMaybe<Scalars['String']>;
  originationAmbAddress_not_contains?: InputMaybe<Scalars['String']>;
  originationAmbAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  originationAmbAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  originationAmbAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  originationAmbAddress_starts_with?: InputMaybe<Scalars['String']>;
  originationChainId?: InputMaybe<Scalars['BigInt']>;
  originationChainId_gt?: InputMaybe<Scalars['BigInt']>;
  originationChainId_gte?: InputMaybe<Scalars['BigInt']>;
  originationChainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  originationChainId_lt?: InputMaybe<Scalars['BigInt']>;
  originationChainId_lte?: InputMaybe<Scalars['BigInt']>;
  originationChainId_not?: InputMaybe<Scalars['BigInt']>;
  originationChainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
};

export type TokenPage = {
  __typename?: 'TokenPage';
  items: Array<Token>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type Transaction = {
  __typename?: 'Transaction';
  AffirmationCompleted?: Maybe<AffirmationCompletedPage>;
  block?: Maybe<Block>;
  blockHash: Scalars['String'];
  chainId: Scalars['BigInt'];
  from: Scalars['String'];
  gas: Scalars['BigInt'];
  gasPrice?: Maybe<Scalars['BigInt']>;
  hash: Scalars['String'];
  index: Scalars['String'];
  maxFeePerGas?: Maybe<Scalars['BigInt']>;
  maxPriorityFeePerGas?: Maybe<Scalars['BigInt']>;
  nonce: Scalars['BigInt'];
  relayedMessage?: Maybe<RelayedMessagePage>;
  signedForAffirmation?: Maybe<SignedForAffirmationPage>;
  signedForUserRequest?: Maybe<SignedForUserRequestPage>;
  to: Scalars['String'];
  type: Scalars['String'];
  userRequestForAffirmation?: Maybe<UserRequestForAffirmationPage>;
  userRequestForSignature?: Maybe<UserRequestForSignaturePage>;
  value: Scalars['BigInt'];
};


export type TransactionAffirmationCompletedArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<AffirmationCompletedFilter>;
};


export type TransactionRelayedMessageArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<RelayedMessageFilter>;
};


export type TransactionSignedForAffirmationArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<SignedForAffirmationFilter>;
};


export type TransactionSignedForUserRequestArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<SignedForUserRequestFilter>;
};


export type TransactionUserRequestForAffirmationArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<UserRequestForAffirmationFilter>;
};


export type TransactionUserRequestForSignatureArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<UserRequestForSignatureFilter>;
};

export type TransactionFilter = {
  AND?: InputMaybe<Array<InputMaybe<TransactionFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<TransactionFilter>>>;
  blockHash?: InputMaybe<Scalars['String']>;
  blockHash_contains?: InputMaybe<Scalars['String']>;
  blockHash_ends_with?: InputMaybe<Scalars['String']>;
  blockHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  blockHash_not?: InputMaybe<Scalars['String']>;
  blockHash_not_contains?: InputMaybe<Scalars['String']>;
  blockHash_not_ends_with?: InputMaybe<Scalars['String']>;
  blockHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  blockHash_not_starts_with?: InputMaybe<Scalars['String']>;
  blockHash_starts_with?: InputMaybe<Scalars['String']>;
  chainId?: InputMaybe<Scalars['BigInt']>;
  chainId_gt?: InputMaybe<Scalars['BigInt']>;
  chainId_gte?: InputMaybe<Scalars['BigInt']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  chainId_lt?: InputMaybe<Scalars['BigInt']>;
  chainId_lte?: InputMaybe<Scalars['BigInt']>;
  chainId_not?: InputMaybe<Scalars['BigInt']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  from?: InputMaybe<Scalars['String']>;
  from_contains?: InputMaybe<Scalars['String']>;
  from_ends_with?: InputMaybe<Scalars['String']>;
  from_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  from_not?: InputMaybe<Scalars['String']>;
  from_not_contains?: InputMaybe<Scalars['String']>;
  from_not_ends_with?: InputMaybe<Scalars['String']>;
  from_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  from_not_starts_with?: InputMaybe<Scalars['String']>;
  from_starts_with?: InputMaybe<Scalars['String']>;
  gas?: InputMaybe<Scalars['BigInt']>;
  gasPrice?: InputMaybe<Scalars['BigInt']>;
  gasPrice_gt?: InputMaybe<Scalars['BigInt']>;
  gasPrice_gte?: InputMaybe<Scalars['BigInt']>;
  gasPrice_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  gasPrice_lt?: InputMaybe<Scalars['BigInt']>;
  gasPrice_lte?: InputMaybe<Scalars['BigInt']>;
  gasPrice_not?: InputMaybe<Scalars['BigInt']>;
  gasPrice_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  gas_gt?: InputMaybe<Scalars['BigInt']>;
  gas_gte?: InputMaybe<Scalars['BigInt']>;
  gas_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  gas_lt?: InputMaybe<Scalars['BigInt']>;
  gas_lte?: InputMaybe<Scalars['BigInt']>;
  gas_not?: InputMaybe<Scalars['BigInt']>;
  gas_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  hash?: InputMaybe<Scalars['String']>;
  hash_contains?: InputMaybe<Scalars['String']>;
  hash_ends_with?: InputMaybe<Scalars['String']>;
  hash_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  hash_not?: InputMaybe<Scalars['String']>;
  hash_not_contains?: InputMaybe<Scalars['String']>;
  hash_not_ends_with?: InputMaybe<Scalars['String']>;
  hash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  hash_not_starts_with?: InputMaybe<Scalars['String']>;
  hash_starts_with?: InputMaybe<Scalars['String']>;
  index?: InputMaybe<Scalars['String']>;
  index_contains?: InputMaybe<Scalars['String']>;
  index_ends_with?: InputMaybe<Scalars['String']>;
  index_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  index_not?: InputMaybe<Scalars['String']>;
  index_not_contains?: InputMaybe<Scalars['String']>;
  index_not_ends_with?: InputMaybe<Scalars['String']>;
  index_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  index_not_starts_with?: InputMaybe<Scalars['String']>;
  index_starts_with?: InputMaybe<Scalars['String']>;
  maxFeePerGas?: InputMaybe<Scalars['BigInt']>;
  maxFeePerGas_gt?: InputMaybe<Scalars['BigInt']>;
  maxFeePerGas_gte?: InputMaybe<Scalars['BigInt']>;
  maxFeePerGas_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  maxFeePerGas_lt?: InputMaybe<Scalars['BigInt']>;
  maxFeePerGas_lte?: InputMaybe<Scalars['BigInt']>;
  maxFeePerGas_not?: InputMaybe<Scalars['BigInt']>;
  maxFeePerGas_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  maxPriorityFeePerGas?: InputMaybe<Scalars['BigInt']>;
  maxPriorityFeePerGas_gt?: InputMaybe<Scalars['BigInt']>;
  maxPriorityFeePerGas_gte?: InputMaybe<Scalars['BigInt']>;
  maxPriorityFeePerGas_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  maxPriorityFeePerGas_lt?: InputMaybe<Scalars['BigInt']>;
  maxPriorityFeePerGas_lte?: InputMaybe<Scalars['BigInt']>;
  maxPriorityFeePerGas_not?: InputMaybe<Scalars['BigInt']>;
  maxPriorityFeePerGas_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  nonce?: InputMaybe<Scalars['BigInt']>;
  nonce_gt?: InputMaybe<Scalars['BigInt']>;
  nonce_gte?: InputMaybe<Scalars['BigInt']>;
  nonce_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  nonce_lt?: InputMaybe<Scalars['BigInt']>;
  nonce_lte?: InputMaybe<Scalars['BigInt']>;
  nonce_not?: InputMaybe<Scalars['BigInt']>;
  nonce_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  to?: InputMaybe<Scalars['String']>;
  to_contains?: InputMaybe<Scalars['String']>;
  to_ends_with?: InputMaybe<Scalars['String']>;
  to_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  to_not?: InputMaybe<Scalars['String']>;
  to_not_contains?: InputMaybe<Scalars['String']>;
  to_not_ends_with?: InputMaybe<Scalars['String']>;
  to_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  to_not_starts_with?: InputMaybe<Scalars['String']>;
  to_starts_with?: InputMaybe<Scalars['String']>;
  type?: InputMaybe<Scalars['String']>;
  type_contains?: InputMaybe<Scalars['String']>;
  type_ends_with?: InputMaybe<Scalars['String']>;
  type_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  type_not?: InputMaybe<Scalars['String']>;
  type_not_contains?: InputMaybe<Scalars['String']>;
  type_not_ends_with?: InputMaybe<Scalars['String']>;
  type_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  type_not_starts_with?: InputMaybe<Scalars['String']>;
  type_starts_with?: InputMaybe<Scalars['String']>;
  value?: InputMaybe<Scalars['BigInt']>;
  value_gt?: InputMaybe<Scalars['BigInt']>;
  value_gte?: InputMaybe<Scalars['BigInt']>;
  value_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  value_lt?: InputMaybe<Scalars['BigInt']>;
  value_lte?: InputMaybe<Scalars['BigInt']>;
  value_not?: InputMaybe<Scalars['BigInt']>;
  value_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
};

export type TransactionPage = {
  __typename?: 'TransactionPage';
  items: Array<Transaction>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type UserRequestForAffirmation = {
  __typename?: 'UserRequestForAffirmation';
  amount: Scalars['BigInt'];
  block?: Maybe<Block>;
  blockHash: Scalars['String'];
  bridge?: Maybe<BridgeSide>;
  bridgeAddress: Scalars['String'];
  chainId: Scalars['BigInt'];
  confirmedSignatures: Scalars['BigInt'];
  deliveringNative: Scalars['Boolean'];
  delivery?: Maybe<AffirmationCompleted>;
  destinationToken?: Maybe<Token>;
  destinationTokenAddress?: Maybe<Scalars['String']>;
  destinationTokenAmbAddress: Scalars['String'];
  destinationTokenChainId: Scalars['BigInt'];
  encodedData: Scalars['String'];
  finishedSigning: Scalars['Boolean'];
  from: Scalars['String'];
  handlingNative: Scalars['Boolean'];
  logIndex: Scalars['Float'];
  messageHash: Scalars['String'];
  messageId: Scalars['String'];
  orderId: Scalars['BigInt'];
  originationToken?: Maybe<Token>;
  originationTokenAddress?: Maybe<Scalars['String']>;
  originationTokenAmbAddress: Scalars['String'];
  originationTokenChainId: Scalars['BigInt'];
  requiredSignatureOrderId?: Maybe<Scalars['BigInt']>;
  requiredSignatures?: Maybe<RequiredSignaturesChanged>;
  signatures?: Maybe<SignedForAffirmationPage>;
  to: Scalars['String'];
  transaction?: Maybe<Transaction>;
  transactionHash: Scalars['String'];
};


export type UserRequestForAffirmationSignaturesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<SignedForAffirmationFilter>;
};

export type UserRequestForAffirmationFilter = {
  AND?: InputMaybe<Array<InputMaybe<UserRequestForAffirmationFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<UserRequestForAffirmationFilter>>>;
  amount?: InputMaybe<Scalars['BigInt']>;
  amount_gt?: InputMaybe<Scalars['BigInt']>;
  amount_gte?: InputMaybe<Scalars['BigInt']>;
  amount_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  amount_lt?: InputMaybe<Scalars['BigInt']>;
  amount_lte?: InputMaybe<Scalars['BigInt']>;
  amount_not?: InputMaybe<Scalars['BigInt']>;
  amount_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  blockHash?: InputMaybe<Scalars['String']>;
  blockHash_contains?: InputMaybe<Scalars['String']>;
  blockHash_ends_with?: InputMaybe<Scalars['String']>;
  blockHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  blockHash_not?: InputMaybe<Scalars['String']>;
  blockHash_not_contains?: InputMaybe<Scalars['String']>;
  blockHash_not_ends_with?: InputMaybe<Scalars['String']>;
  blockHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  blockHash_not_starts_with?: InputMaybe<Scalars['String']>;
  blockHash_starts_with?: InputMaybe<Scalars['String']>;
  bridgeAddress?: InputMaybe<Scalars['String']>;
  bridgeAddress_contains?: InputMaybe<Scalars['String']>;
  bridgeAddress_ends_with?: InputMaybe<Scalars['String']>;
  bridgeAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  bridgeAddress_not?: InputMaybe<Scalars['String']>;
  bridgeAddress_not_contains?: InputMaybe<Scalars['String']>;
  bridgeAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  bridgeAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  bridgeAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  bridgeAddress_starts_with?: InputMaybe<Scalars['String']>;
  chainId?: InputMaybe<Scalars['BigInt']>;
  chainId_gt?: InputMaybe<Scalars['BigInt']>;
  chainId_gte?: InputMaybe<Scalars['BigInt']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  chainId_lt?: InputMaybe<Scalars['BigInt']>;
  chainId_lte?: InputMaybe<Scalars['BigInt']>;
  chainId_not?: InputMaybe<Scalars['BigInt']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  confirmedSignatures?: InputMaybe<Scalars['BigInt']>;
  confirmedSignatures_gt?: InputMaybe<Scalars['BigInt']>;
  confirmedSignatures_gte?: InputMaybe<Scalars['BigInt']>;
  confirmedSignatures_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  confirmedSignatures_lt?: InputMaybe<Scalars['BigInt']>;
  confirmedSignatures_lte?: InputMaybe<Scalars['BigInt']>;
  confirmedSignatures_not?: InputMaybe<Scalars['BigInt']>;
  confirmedSignatures_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  deliveringNative?: InputMaybe<Scalars['Boolean']>;
  deliveringNative_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']>>>;
  deliveringNative_not?: InputMaybe<Scalars['Boolean']>;
  deliveringNative_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']>>>;
  destinationTokenAddress?: InputMaybe<Scalars['String']>;
  destinationTokenAddress_contains?: InputMaybe<Scalars['String']>;
  destinationTokenAddress_ends_with?: InputMaybe<Scalars['String']>;
  destinationTokenAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  destinationTokenAddress_not?: InputMaybe<Scalars['String']>;
  destinationTokenAddress_not_contains?: InputMaybe<Scalars['String']>;
  destinationTokenAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  destinationTokenAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  destinationTokenAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  destinationTokenAddress_starts_with?: InputMaybe<Scalars['String']>;
  destinationTokenAmbAddress?: InputMaybe<Scalars['String']>;
  destinationTokenAmbAddress_contains?: InputMaybe<Scalars['String']>;
  destinationTokenAmbAddress_ends_with?: InputMaybe<Scalars['String']>;
  destinationTokenAmbAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  destinationTokenAmbAddress_not?: InputMaybe<Scalars['String']>;
  destinationTokenAmbAddress_not_contains?: InputMaybe<Scalars['String']>;
  destinationTokenAmbAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  destinationTokenAmbAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  destinationTokenAmbAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  destinationTokenAmbAddress_starts_with?: InputMaybe<Scalars['String']>;
  destinationTokenChainId?: InputMaybe<Scalars['BigInt']>;
  destinationTokenChainId_gt?: InputMaybe<Scalars['BigInt']>;
  destinationTokenChainId_gte?: InputMaybe<Scalars['BigInt']>;
  destinationTokenChainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  destinationTokenChainId_lt?: InputMaybe<Scalars['BigInt']>;
  destinationTokenChainId_lte?: InputMaybe<Scalars['BigInt']>;
  destinationTokenChainId_not?: InputMaybe<Scalars['BigInt']>;
  destinationTokenChainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  encodedData?: InputMaybe<Scalars['String']>;
  encodedData_contains?: InputMaybe<Scalars['String']>;
  encodedData_ends_with?: InputMaybe<Scalars['String']>;
  encodedData_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  encodedData_not?: InputMaybe<Scalars['String']>;
  encodedData_not_contains?: InputMaybe<Scalars['String']>;
  encodedData_not_ends_with?: InputMaybe<Scalars['String']>;
  encodedData_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  encodedData_not_starts_with?: InputMaybe<Scalars['String']>;
  encodedData_starts_with?: InputMaybe<Scalars['String']>;
  finishedSigning?: InputMaybe<Scalars['Boolean']>;
  finishedSigning_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']>>>;
  finishedSigning_not?: InputMaybe<Scalars['Boolean']>;
  finishedSigning_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']>>>;
  from?: InputMaybe<Scalars['String']>;
  from_contains?: InputMaybe<Scalars['String']>;
  from_ends_with?: InputMaybe<Scalars['String']>;
  from_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  from_not?: InputMaybe<Scalars['String']>;
  from_not_contains?: InputMaybe<Scalars['String']>;
  from_not_ends_with?: InputMaybe<Scalars['String']>;
  from_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  from_not_starts_with?: InputMaybe<Scalars['String']>;
  from_starts_with?: InputMaybe<Scalars['String']>;
  handlingNative?: InputMaybe<Scalars['Boolean']>;
  handlingNative_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']>>>;
  handlingNative_not?: InputMaybe<Scalars['Boolean']>;
  handlingNative_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']>>>;
  logIndex?: InputMaybe<Scalars['Float']>;
  logIndex_gt?: InputMaybe<Scalars['Float']>;
  logIndex_gte?: InputMaybe<Scalars['Float']>;
  logIndex_in?: InputMaybe<Array<InputMaybe<Scalars['Float']>>>;
  logIndex_lt?: InputMaybe<Scalars['Float']>;
  logIndex_lte?: InputMaybe<Scalars['Float']>;
  logIndex_not?: InputMaybe<Scalars['Float']>;
  logIndex_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']>>>;
  messageHash?: InputMaybe<Scalars['String']>;
  messageHash_contains?: InputMaybe<Scalars['String']>;
  messageHash_ends_with?: InputMaybe<Scalars['String']>;
  messageHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  messageHash_not?: InputMaybe<Scalars['String']>;
  messageHash_not_contains?: InputMaybe<Scalars['String']>;
  messageHash_not_ends_with?: InputMaybe<Scalars['String']>;
  messageHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  messageHash_not_starts_with?: InputMaybe<Scalars['String']>;
  messageHash_starts_with?: InputMaybe<Scalars['String']>;
  messageId?: InputMaybe<Scalars['String']>;
  messageId_contains?: InputMaybe<Scalars['String']>;
  messageId_ends_with?: InputMaybe<Scalars['String']>;
  messageId_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  messageId_not?: InputMaybe<Scalars['String']>;
  messageId_not_contains?: InputMaybe<Scalars['String']>;
  messageId_not_ends_with?: InputMaybe<Scalars['String']>;
  messageId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  messageId_not_starts_with?: InputMaybe<Scalars['String']>;
  messageId_starts_with?: InputMaybe<Scalars['String']>;
  orderId?: InputMaybe<Scalars['BigInt']>;
  orderId_gt?: InputMaybe<Scalars['BigInt']>;
  orderId_gte?: InputMaybe<Scalars['BigInt']>;
  orderId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  orderId_lt?: InputMaybe<Scalars['BigInt']>;
  orderId_lte?: InputMaybe<Scalars['BigInt']>;
  orderId_not?: InputMaybe<Scalars['BigInt']>;
  orderId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  originationTokenAddress?: InputMaybe<Scalars['String']>;
  originationTokenAddress_contains?: InputMaybe<Scalars['String']>;
  originationTokenAddress_ends_with?: InputMaybe<Scalars['String']>;
  originationTokenAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  originationTokenAddress_not?: InputMaybe<Scalars['String']>;
  originationTokenAddress_not_contains?: InputMaybe<Scalars['String']>;
  originationTokenAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  originationTokenAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  originationTokenAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  originationTokenAddress_starts_with?: InputMaybe<Scalars['String']>;
  originationTokenAmbAddress?: InputMaybe<Scalars['String']>;
  originationTokenAmbAddress_contains?: InputMaybe<Scalars['String']>;
  originationTokenAmbAddress_ends_with?: InputMaybe<Scalars['String']>;
  originationTokenAmbAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  originationTokenAmbAddress_not?: InputMaybe<Scalars['String']>;
  originationTokenAmbAddress_not_contains?: InputMaybe<Scalars['String']>;
  originationTokenAmbAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  originationTokenAmbAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  originationTokenAmbAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  originationTokenAmbAddress_starts_with?: InputMaybe<Scalars['String']>;
  originationTokenChainId?: InputMaybe<Scalars['BigInt']>;
  originationTokenChainId_gt?: InputMaybe<Scalars['BigInt']>;
  originationTokenChainId_gte?: InputMaybe<Scalars['BigInt']>;
  originationTokenChainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  originationTokenChainId_lt?: InputMaybe<Scalars['BigInt']>;
  originationTokenChainId_lte?: InputMaybe<Scalars['BigInt']>;
  originationTokenChainId_not?: InputMaybe<Scalars['BigInt']>;
  originationTokenChainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  requiredSignatureOrderId?: InputMaybe<Scalars['BigInt']>;
  requiredSignatureOrderId_gt?: InputMaybe<Scalars['BigInt']>;
  requiredSignatureOrderId_gte?: InputMaybe<Scalars['BigInt']>;
  requiredSignatureOrderId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  requiredSignatureOrderId_lt?: InputMaybe<Scalars['BigInt']>;
  requiredSignatureOrderId_lte?: InputMaybe<Scalars['BigInt']>;
  requiredSignatureOrderId_not?: InputMaybe<Scalars['BigInt']>;
  requiredSignatureOrderId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  to?: InputMaybe<Scalars['String']>;
  to_contains?: InputMaybe<Scalars['String']>;
  to_ends_with?: InputMaybe<Scalars['String']>;
  to_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  to_not?: InputMaybe<Scalars['String']>;
  to_not_contains?: InputMaybe<Scalars['String']>;
  to_not_ends_with?: InputMaybe<Scalars['String']>;
  to_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  to_not_starts_with?: InputMaybe<Scalars['String']>;
  to_starts_with?: InputMaybe<Scalars['String']>;
  transactionHash?: InputMaybe<Scalars['String']>;
  transactionHash_contains?: InputMaybe<Scalars['String']>;
  transactionHash_ends_with?: InputMaybe<Scalars['String']>;
  transactionHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  transactionHash_not?: InputMaybe<Scalars['String']>;
  transactionHash_not_contains?: InputMaybe<Scalars['String']>;
  transactionHash_not_ends_with?: InputMaybe<Scalars['String']>;
  transactionHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  transactionHash_not_starts_with?: InputMaybe<Scalars['String']>;
  transactionHash_starts_with?: InputMaybe<Scalars['String']>;
};

export type UserRequestForAffirmationPage = {
  __typename?: 'UserRequestForAffirmationPage';
  items: Array<UserRequestForAffirmation>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type UserRequestForSignature = {
  __typename?: 'UserRequestForSignature';
  amount: Scalars['BigInt'];
  block?: Maybe<Block>;
  blockHash: Scalars['String'];
  bridge?: Maybe<BridgeSide>;
  bridgeAddress: Scalars['String'];
  chainId: Scalars['BigInt'];
  confirmedSignatures: Scalars['BigInt'];
  deliveringNative: Scalars['Boolean'];
  delivery?: Maybe<RelayedMessage>;
  destinationToken?: Maybe<Token>;
  destinationTokenAddress?: Maybe<Scalars['String']>;
  destinationTokenAmbAddress: Scalars['String'];
  destinationTokenChainId: Scalars['BigInt'];
  encodedData: Scalars['String'];
  feeDirector?: Maybe<FeeDirector>;
  finishedSigning: Scalars['Boolean'];
  from: Scalars['String'];
  handlingNative: Scalars['Boolean'];
  logIndex: Scalars['Float'];
  messageHash: Scalars['String'];
  messageId: Scalars['String'];
  orderId: Scalars['BigInt'];
  originationToken?: Maybe<Token>;
  originationTokenAddress?: Maybe<Scalars['String']>;
  originationTokenAmbAddress: Scalars['String'];
  originationTokenChainId: Scalars['BigInt'];
  requiredSignatureOrderId?: Maybe<Scalars['BigInt']>;
  requiredSignatures?: Maybe<RequiredSignaturesChanged>;
  signatures?: Maybe<SignedForUserRequestPage>;
  to: Scalars['String'];
  transaction?: Maybe<Transaction>;
  transactionHash: Scalars['String'];
};


export type UserRequestForSignatureSignaturesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<SignedForUserRequestFilter>;
};

export type UserRequestForSignatureFilter = {
  AND?: InputMaybe<Array<InputMaybe<UserRequestForSignatureFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<UserRequestForSignatureFilter>>>;
  amount?: InputMaybe<Scalars['BigInt']>;
  amount_gt?: InputMaybe<Scalars['BigInt']>;
  amount_gte?: InputMaybe<Scalars['BigInt']>;
  amount_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  amount_lt?: InputMaybe<Scalars['BigInt']>;
  amount_lte?: InputMaybe<Scalars['BigInt']>;
  amount_not?: InputMaybe<Scalars['BigInt']>;
  amount_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  blockHash?: InputMaybe<Scalars['String']>;
  blockHash_contains?: InputMaybe<Scalars['String']>;
  blockHash_ends_with?: InputMaybe<Scalars['String']>;
  blockHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  blockHash_not?: InputMaybe<Scalars['String']>;
  blockHash_not_contains?: InputMaybe<Scalars['String']>;
  blockHash_not_ends_with?: InputMaybe<Scalars['String']>;
  blockHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  blockHash_not_starts_with?: InputMaybe<Scalars['String']>;
  blockHash_starts_with?: InputMaybe<Scalars['String']>;
  bridgeAddress?: InputMaybe<Scalars['String']>;
  bridgeAddress_contains?: InputMaybe<Scalars['String']>;
  bridgeAddress_ends_with?: InputMaybe<Scalars['String']>;
  bridgeAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  bridgeAddress_not?: InputMaybe<Scalars['String']>;
  bridgeAddress_not_contains?: InputMaybe<Scalars['String']>;
  bridgeAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  bridgeAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  bridgeAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  bridgeAddress_starts_with?: InputMaybe<Scalars['String']>;
  chainId?: InputMaybe<Scalars['BigInt']>;
  chainId_gt?: InputMaybe<Scalars['BigInt']>;
  chainId_gte?: InputMaybe<Scalars['BigInt']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  chainId_lt?: InputMaybe<Scalars['BigInt']>;
  chainId_lte?: InputMaybe<Scalars['BigInt']>;
  chainId_not?: InputMaybe<Scalars['BigInt']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  confirmedSignatures?: InputMaybe<Scalars['BigInt']>;
  confirmedSignatures_gt?: InputMaybe<Scalars['BigInt']>;
  confirmedSignatures_gte?: InputMaybe<Scalars['BigInt']>;
  confirmedSignatures_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  confirmedSignatures_lt?: InputMaybe<Scalars['BigInt']>;
  confirmedSignatures_lte?: InputMaybe<Scalars['BigInt']>;
  confirmedSignatures_not?: InputMaybe<Scalars['BigInt']>;
  confirmedSignatures_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  deliveringNative?: InputMaybe<Scalars['Boolean']>;
  deliveringNative_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']>>>;
  deliveringNative_not?: InputMaybe<Scalars['Boolean']>;
  deliveringNative_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']>>>;
  destinationTokenAddress?: InputMaybe<Scalars['String']>;
  destinationTokenAddress_contains?: InputMaybe<Scalars['String']>;
  destinationTokenAddress_ends_with?: InputMaybe<Scalars['String']>;
  destinationTokenAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  destinationTokenAddress_not?: InputMaybe<Scalars['String']>;
  destinationTokenAddress_not_contains?: InputMaybe<Scalars['String']>;
  destinationTokenAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  destinationTokenAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  destinationTokenAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  destinationTokenAddress_starts_with?: InputMaybe<Scalars['String']>;
  destinationTokenAmbAddress?: InputMaybe<Scalars['String']>;
  destinationTokenAmbAddress_contains?: InputMaybe<Scalars['String']>;
  destinationTokenAmbAddress_ends_with?: InputMaybe<Scalars['String']>;
  destinationTokenAmbAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  destinationTokenAmbAddress_not?: InputMaybe<Scalars['String']>;
  destinationTokenAmbAddress_not_contains?: InputMaybe<Scalars['String']>;
  destinationTokenAmbAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  destinationTokenAmbAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  destinationTokenAmbAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  destinationTokenAmbAddress_starts_with?: InputMaybe<Scalars['String']>;
  destinationTokenChainId?: InputMaybe<Scalars['BigInt']>;
  destinationTokenChainId_gt?: InputMaybe<Scalars['BigInt']>;
  destinationTokenChainId_gte?: InputMaybe<Scalars['BigInt']>;
  destinationTokenChainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  destinationTokenChainId_lt?: InputMaybe<Scalars['BigInt']>;
  destinationTokenChainId_lte?: InputMaybe<Scalars['BigInt']>;
  destinationTokenChainId_not?: InputMaybe<Scalars['BigInt']>;
  destinationTokenChainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  encodedData?: InputMaybe<Scalars['String']>;
  encodedData_contains?: InputMaybe<Scalars['String']>;
  encodedData_ends_with?: InputMaybe<Scalars['String']>;
  encodedData_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  encodedData_not?: InputMaybe<Scalars['String']>;
  encodedData_not_contains?: InputMaybe<Scalars['String']>;
  encodedData_not_ends_with?: InputMaybe<Scalars['String']>;
  encodedData_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  encodedData_not_starts_with?: InputMaybe<Scalars['String']>;
  encodedData_starts_with?: InputMaybe<Scalars['String']>;
  finishedSigning?: InputMaybe<Scalars['Boolean']>;
  finishedSigning_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']>>>;
  finishedSigning_not?: InputMaybe<Scalars['Boolean']>;
  finishedSigning_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']>>>;
  from?: InputMaybe<Scalars['String']>;
  from_contains?: InputMaybe<Scalars['String']>;
  from_ends_with?: InputMaybe<Scalars['String']>;
  from_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  from_not?: InputMaybe<Scalars['String']>;
  from_not_contains?: InputMaybe<Scalars['String']>;
  from_not_ends_with?: InputMaybe<Scalars['String']>;
  from_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  from_not_starts_with?: InputMaybe<Scalars['String']>;
  from_starts_with?: InputMaybe<Scalars['String']>;
  handlingNative?: InputMaybe<Scalars['Boolean']>;
  handlingNative_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']>>>;
  handlingNative_not?: InputMaybe<Scalars['Boolean']>;
  handlingNative_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']>>>;
  logIndex?: InputMaybe<Scalars['Float']>;
  logIndex_gt?: InputMaybe<Scalars['Float']>;
  logIndex_gte?: InputMaybe<Scalars['Float']>;
  logIndex_in?: InputMaybe<Array<InputMaybe<Scalars['Float']>>>;
  logIndex_lt?: InputMaybe<Scalars['Float']>;
  logIndex_lte?: InputMaybe<Scalars['Float']>;
  logIndex_not?: InputMaybe<Scalars['Float']>;
  logIndex_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']>>>;
  messageHash?: InputMaybe<Scalars['String']>;
  messageHash_contains?: InputMaybe<Scalars['String']>;
  messageHash_ends_with?: InputMaybe<Scalars['String']>;
  messageHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  messageHash_not?: InputMaybe<Scalars['String']>;
  messageHash_not_contains?: InputMaybe<Scalars['String']>;
  messageHash_not_ends_with?: InputMaybe<Scalars['String']>;
  messageHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  messageHash_not_starts_with?: InputMaybe<Scalars['String']>;
  messageHash_starts_with?: InputMaybe<Scalars['String']>;
  messageId?: InputMaybe<Scalars['String']>;
  messageId_contains?: InputMaybe<Scalars['String']>;
  messageId_ends_with?: InputMaybe<Scalars['String']>;
  messageId_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  messageId_not?: InputMaybe<Scalars['String']>;
  messageId_not_contains?: InputMaybe<Scalars['String']>;
  messageId_not_ends_with?: InputMaybe<Scalars['String']>;
  messageId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  messageId_not_starts_with?: InputMaybe<Scalars['String']>;
  messageId_starts_with?: InputMaybe<Scalars['String']>;
  orderId?: InputMaybe<Scalars['BigInt']>;
  orderId_gt?: InputMaybe<Scalars['BigInt']>;
  orderId_gte?: InputMaybe<Scalars['BigInt']>;
  orderId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  orderId_lt?: InputMaybe<Scalars['BigInt']>;
  orderId_lte?: InputMaybe<Scalars['BigInt']>;
  orderId_not?: InputMaybe<Scalars['BigInt']>;
  orderId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  originationTokenAddress?: InputMaybe<Scalars['String']>;
  originationTokenAddress_contains?: InputMaybe<Scalars['String']>;
  originationTokenAddress_ends_with?: InputMaybe<Scalars['String']>;
  originationTokenAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  originationTokenAddress_not?: InputMaybe<Scalars['String']>;
  originationTokenAddress_not_contains?: InputMaybe<Scalars['String']>;
  originationTokenAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  originationTokenAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  originationTokenAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  originationTokenAddress_starts_with?: InputMaybe<Scalars['String']>;
  originationTokenAmbAddress?: InputMaybe<Scalars['String']>;
  originationTokenAmbAddress_contains?: InputMaybe<Scalars['String']>;
  originationTokenAmbAddress_ends_with?: InputMaybe<Scalars['String']>;
  originationTokenAmbAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  originationTokenAmbAddress_not?: InputMaybe<Scalars['String']>;
  originationTokenAmbAddress_not_contains?: InputMaybe<Scalars['String']>;
  originationTokenAmbAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  originationTokenAmbAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  originationTokenAmbAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  originationTokenAmbAddress_starts_with?: InputMaybe<Scalars['String']>;
  originationTokenChainId?: InputMaybe<Scalars['BigInt']>;
  originationTokenChainId_gt?: InputMaybe<Scalars['BigInt']>;
  originationTokenChainId_gte?: InputMaybe<Scalars['BigInt']>;
  originationTokenChainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  originationTokenChainId_lt?: InputMaybe<Scalars['BigInt']>;
  originationTokenChainId_lte?: InputMaybe<Scalars['BigInt']>;
  originationTokenChainId_not?: InputMaybe<Scalars['BigInt']>;
  originationTokenChainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  requiredSignatureOrderId?: InputMaybe<Scalars['BigInt']>;
  requiredSignatureOrderId_gt?: InputMaybe<Scalars['BigInt']>;
  requiredSignatureOrderId_gte?: InputMaybe<Scalars['BigInt']>;
  requiredSignatureOrderId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  requiredSignatureOrderId_lt?: InputMaybe<Scalars['BigInt']>;
  requiredSignatureOrderId_lte?: InputMaybe<Scalars['BigInt']>;
  requiredSignatureOrderId_not?: InputMaybe<Scalars['BigInt']>;
  requiredSignatureOrderId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  to?: InputMaybe<Scalars['String']>;
  to_contains?: InputMaybe<Scalars['String']>;
  to_ends_with?: InputMaybe<Scalars['String']>;
  to_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  to_not?: InputMaybe<Scalars['String']>;
  to_not_contains?: InputMaybe<Scalars['String']>;
  to_not_ends_with?: InputMaybe<Scalars['String']>;
  to_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  to_not_starts_with?: InputMaybe<Scalars['String']>;
  to_starts_with?: InputMaybe<Scalars['String']>;
  transactionHash?: InputMaybe<Scalars['String']>;
  transactionHash_contains?: InputMaybe<Scalars['String']>;
  transactionHash_ends_with?: InputMaybe<Scalars['String']>;
  transactionHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  transactionHash_not?: InputMaybe<Scalars['String']>;
  transactionHash_not_contains?: InputMaybe<Scalars['String']>;
  transactionHash_not_ends_with?: InputMaybe<Scalars['String']>;
  transactionHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  transactionHash_not_starts_with?: InputMaybe<Scalars['String']>;
  transactionHash_starts_with?: InputMaybe<Scalars['String']>;
};

export type UserRequestForSignaturePage = {
  __typename?: 'UserRequestForSignaturePage';
  items: Array<UserRequestForSignature>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type ValidatorStatusUpdate = {
  __typename?: 'ValidatorStatusUpdate';
  block?: Maybe<Block>;
  blockHash: Scalars['String'];
  bridge?: Maybe<BridgeSide>;
  bridgeAddress: Scalars['String'];
  chainId: Scalars['BigInt'];
  logIndex: Scalars['Float'];
  orderId: Scalars['BigInt'];
  transaction?: Maybe<Transaction>;
  transactionHash: Scalars['String'];
  validatorAddress: Scalars['String'];
  value: Scalars['Boolean'];
};

export type ValidatorStatusUpdateFilter = {
  AND?: InputMaybe<Array<InputMaybe<ValidatorStatusUpdateFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<ValidatorStatusUpdateFilter>>>;
  blockHash?: InputMaybe<Scalars['String']>;
  blockHash_contains?: InputMaybe<Scalars['String']>;
  blockHash_ends_with?: InputMaybe<Scalars['String']>;
  blockHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  blockHash_not?: InputMaybe<Scalars['String']>;
  blockHash_not_contains?: InputMaybe<Scalars['String']>;
  blockHash_not_ends_with?: InputMaybe<Scalars['String']>;
  blockHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  blockHash_not_starts_with?: InputMaybe<Scalars['String']>;
  blockHash_starts_with?: InputMaybe<Scalars['String']>;
  bridgeAddress?: InputMaybe<Scalars['String']>;
  bridgeAddress_contains?: InputMaybe<Scalars['String']>;
  bridgeAddress_ends_with?: InputMaybe<Scalars['String']>;
  bridgeAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  bridgeAddress_not?: InputMaybe<Scalars['String']>;
  bridgeAddress_not_contains?: InputMaybe<Scalars['String']>;
  bridgeAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  bridgeAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  bridgeAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  bridgeAddress_starts_with?: InputMaybe<Scalars['String']>;
  chainId?: InputMaybe<Scalars['BigInt']>;
  chainId_gt?: InputMaybe<Scalars['BigInt']>;
  chainId_gte?: InputMaybe<Scalars['BigInt']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  chainId_lt?: InputMaybe<Scalars['BigInt']>;
  chainId_lte?: InputMaybe<Scalars['BigInt']>;
  chainId_not?: InputMaybe<Scalars['BigInt']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  logIndex?: InputMaybe<Scalars['Float']>;
  logIndex_gt?: InputMaybe<Scalars['Float']>;
  logIndex_gte?: InputMaybe<Scalars['Float']>;
  logIndex_in?: InputMaybe<Array<InputMaybe<Scalars['Float']>>>;
  logIndex_lt?: InputMaybe<Scalars['Float']>;
  logIndex_lte?: InputMaybe<Scalars['Float']>;
  logIndex_not?: InputMaybe<Scalars['Float']>;
  logIndex_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']>>>;
  orderId?: InputMaybe<Scalars['BigInt']>;
  orderId_gt?: InputMaybe<Scalars['BigInt']>;
  orderId_gte?: InputMaybe<Scalars['BigInt']>;
  orderId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  orderId_lt?: InputMaybe<Scalars['BigInt']>;
  orderId_lte?: InputMaybe<Scalars['BigInt']>;
  orderId_not?: InputMaybe<Scalars['BigInt']>;
  orderId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  transactionHash?: InputMaybe<Scalars['String']>;
  transactionHash_contains?: InputMaybe<Scalars['String']>;
  transactionHash_ends_with?: InputMaybe<Scalars['String']>;
  transactionHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  transactionHash_not?: InputMaybe<Scalars['String']>;
  transactionHash_not_contains?: InputMaybe<Scalars['String']>;
  transactionHash_not_ends_with?: InputMaybe<Scalars['String']>;
  transactionHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  transactionHash_not_starts_with?: InputMaybe<Scalars['String']>;
  transactionHash_starts_with?: InputMaybe<Scalars['String']>;
  validatorAddress?: InputMaybe<Scalars['String']>;
  validatorAddress_contains?: InputMaybe<Scalars['String']>;
  validatorAddress_ends_with?: InputMaybe<Scalars['String']>;
  validatorAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  validatorAddress_not?: InputMaybe<Scalars['String']>;
  validatorAddress_not_contains?: InputMaybe<Scalars['String']>;
  validatorAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  validatorAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  validatorAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  validatorAddress_starts_with?: InputMaybe<Scalars['String']>;
  value?: InputMaybe<Scalars['Boolean']>;
  value_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']>>>;
  value_not?: InputMaybe<Scalars['Boolean']>;
  value_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']>>>;
};

export type ValidatorStatusUpdatePage = {
  __typename?: 'ValidatorStatusUpdatePage';
  items: Array<ValidatorStatusUpdate>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type InternalTokenReverseLookup = {
  __typename?: 'internalTokenReverseLookup';
  address: Scalars['String'];
  chainId: Scalars['BigInt'];
  destination?: Maybe<Token>;
  destinationAddress: Scalars['String'];
  destinationChainId: Scalars['BigInt'];
  omnibridgeAddress: Scalars['String'];
};

export type InternalTokenReverseLookupFilter = {
  AND?: InputMaybe<Array<InputMaybe<InternalTokenReverseLookupFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<InternalTokenReverseLookupFilter>>>;
  address?: InputMaybe<Scalars['String']>;
  address_contains?: InputMaybe<Scalars['String']>;
  address_ends_with?: InputMaybe<Scalars['String']>;
  address_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  address_not?: InputMaybe<Scalars['String']>;
  address_not_contains?: InputMaybe<Scalars['String']>;
  address_not_ends_with?: InputMaybe<Scalars['String']>;
  address_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  address_not_starts_with?: InputMaybe<Scalars['String']>;
  address_starts_with?: InputMaybe<Scalars['String']>;
  chainId?: InputMaybe<Scalars['BigInt']>;
  chainId_gt?: InputMaybe<Scalars['BigInt']>;
  chainId_gte?: InputMaybe<Scalars['BigInt']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  chainId_lt?: InputMaybe<Scalars['BigInt']>;
  chainId_lte?: InputMaybe<Scalars['BigInt']>;
  chainId_not?: InputMaybe<Scalars['BigInt']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  destinationAddress?: InputMaybe<Scalars['String']>;
  destinationAddress_contains?: InputMaybe<Scalars['String']>;
  destinationAddress_ends_with?: InputMaybe<Scalars['String']>;
  destinationAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  destinationAddress_not?: InputMaybe<Scalars['String']>;
  destinationAddress_not_contains?: InputMaybe<Scalars['String']>;
  destinationAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  destinationAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  destinationAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  destinationAddress_starts_with?: InputMaybe<Scalars['String']>;
  destinationChainId?: InputMaybe<Scalars['BigInt']>;
  destinationChainId_gt?: InputMaybe<Scalars['BigInt']>;
  destinationChainId_gte?: InputMaybe<Scalars['BigInt']>;
  destinationChainId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  destinationChainId_lt?: InputMaybe<Scalars['BigInt']>;
  destinationChainId_lte?: InputMaybe<Scalars['BigInt']>;
  destinationChainId_not?: InputMaybe<Scalars['BigInt']>;
  destinationChainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  omnibridgeAddress?: InputMaybe<Scalars['String']>;
  omnibridgeAddress_contains?: InputMaybe<Scalars['String']>;
  omnibridgeAddress_ends_with?: InputMaybe<Scalars['String']>;
  omnibridgeAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  omnibridgeAddress_not?: InputMaybe<Scalars['String']>;
  omnibridgeAddress_not_contains?: InputMaybe<Scalars['String']>;
  omnibridgeAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  omnibridgeAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  omnibridgeAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  omnibridgeAddress_starts_with?: InputMaybe<Scalars['String']>;
};

export type InternalTokenReverseLookupPage = {
  __typename?: 'internalTokenReverseLookupPage';
  items: Array<InternalTokenReverseLookup>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type SingleUserRequestQueryVariables = Exact<{
  hash: Scalars['String'];
}>;


export type SingleUserRequestQuery = { __typename?: 'Query', userRequestForSignatures: { __typename?: 'UserRequestForSignaturePage', items: Array<{ __typename?: 'UserRequestForSignature', messageId: string, signatures?: { __typename?: 'SignedForUserRequestPage', items: Array<{ __typename?: 'SignedForUserRequest', messageHash: string }> } | null }> } };

export type SingleExecutionQueryVariables = Exact<{
  messageId: Scalars['String'];
}>;


export type SingleExecutionQuery = { __typename?: 'Query', relayedMessages: { __typename?: 'RelayedMessagePage', items: Array<{ __typename?: 'RelayedMessage', transactionHash: string }> } };
