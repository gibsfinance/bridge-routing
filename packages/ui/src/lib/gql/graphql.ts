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

export type AmbBridge = {
  __typename?: 'AMBBridge';
  address: Scalars['String'];
  bridges?: Maybe<OmnibridgePage>;
  chainId: Scalars['BigInt'];
  pair: Scalars['String'];
  provider: Provider;
  side: Direction;
  validatorAddress: Scalars['String'];
  validatorContract?: Maybe<ValidatorContract>;
};


export type AmbBridgeBridgesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<OmnibridgeFilter>;
};

export type AmbBridgeFilter = {
  AND?: InputMaybe<Array<InputMaybe<AmbBridgeFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<AmbBridgeFilter>>>;
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
  pair?: InputMaybe<Scalars['String']>;
  pair_contains?: InputMaybe<Scalars['String']>;
  pair_ends_with?: InputMaybe<Scalars['String']>;
  pair_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  pair_not?: InputMaybe<Scalars['String']>;
  pair_not_contains?: InputMaybe<Scalars['String']>;
  pair_not_ends_with?: InputMaybe<Scalars['String']>;
  pair_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  pair_not_starts_with?: InputMaybe<Scalars['String']>;
  pair_starts_with?: InputMaybe<Scalars['String']>;
  provider?: InputMaybe<Provider>;
  provider_in?: InputMaybe<Array<InputMaybe<Provider>>>;
  provider_not?: InputMaybe<Provider>;
  provider_not_in?: InputMaybe<Array<InputMaybe<Provider>>>;
  side?: InputMaybe<Direction>;
  side_in?: InputMaybe<Array<InputMaybe<Direction>>>;
  side_not?: InputMaybe<Direction>;
  side_not_in?: InputMaybe<Array<InputMaybe<Direction>>>;
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

export type AmbBridgePage = {
  __typename?: 'AMBBridgePage';
  items: Array<AmbBridge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type Block = {
  __typename?: 'Block';
  baseFeePerGas?: Maybe<Scalars['BigInt']>;
  chainId: Scalars['BigInt'];
  completions?: Maybe<CompletionPage>;
  deliveries?: Maybe<DeliveryPage>;
  hash: Scalars['String'];
  number: Scalars['BigInt'];
  requiredSignaturesChanged?: Maybe<RequiredSignaturesChangedPage>;
  signatures?: Maybe<SignaturePage>;
  timestamp: Scalars['BigInt'];
  transactions?: Maybe<TransactionPage>;
  userRequests?: Maybe<UserRequestPage>;
  validatorStatusUpdates?: Maybe<ValidatorStatusUpdatePage>;
};


export type BlockCompletionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<CompletionFilter>;
};


export type BlockDeliveriesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<DeliveryFilter>;
};


export type BlockRequiredSignaturesChangedArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<RequiredSignaturesChangedFilter>;
};


export type BlockSignaturesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<SignatureFilter>;
};


export type BlockTransactionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<TransactionFilter>;
};


export type BlockUserRequestsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<UserRequestFilter>;
};


export type BlockValidatorStatusUpdatesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<ValidatorStatusUpdateFilter>;
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

export type Completion = {
  __typename?: 'Completion';
  block?: Maybe<Block>;
  blockHash: Scalars['String'];
  chainId: Scalars['BigInt'];
  delivery?: Maybe<Delivery>;
  destinationAMBBridge?: Maybe<AmbBridge>;
  destinationAmbAddress: Scalars['String'];
  destinationChainId: Scalars['BigInt'];
  messageHash: Scalars['String'];
  orderId: Scalars['BigInt'];
  originationAMBBridge?: Maybe<AmbBridge>;
  originationAmbAddress: Scalars['String'];
  originationChainId: Scalars['BigInt'];
  transaction?: Maybe<Transaction>;
  transactionHash: Scalars['String'];
  userRequest?: Maybe<UserRequest>;
};

export type CompletionFilter = {
  AND?: InputMaybe<Array<InputMaybe<CompletionFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<CompletionFilter>>>;
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

export type CompletionPage = {
  __typename?: 'CompletionPage';
  items: Array<Completion>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type Delivery = {
  __typename?: 'Delivery';
  block?: Maybe<Block>;
  blockHash: Scalars['String'];
  chainId: Scalars['BigInt'];
  completion?: Maybe<Completion>;
  deliverer: Scalars['String'];
  destinationAMBBridge?: Maybe<AmbBridge>;
  destinationAmbAddress?: Maybe<Scalars['String']>;
  destinationChainId?: Maybe<Scalars['BigInt']>;
  destinationOmnibridge?: Maybe<Omnibridge>;
  destinationOmnibridgeAddress?: Maybe<Scalars['String']>;
  destinationToken?: Maybe<Token>;
  destinationTokenAddress?: Maybe<Scalars['String']>;
  logIndex: Scalars['Float'];
  messageHash: Scalars['String'];
  orderId: Scalars['BigInt'];
  originationAMBBridge?: Maybe<AmbBridge>;
  originationAmbAddress?: Maybe<Scalars['String']>;
  originationChainId?: Maybe<Scalars['BigInt']>;
  originationOmnibridge?: Maybe<Omnibridge>;
  originationOmnibridgeAddress?: Maybe<Scalars['String']>;
  originationToken?: Maybe<Token>;
  originationTokenAddress?: Maybe<Scalars['String']>;
  transaction?: Maybe<Transaction>;
  transactionHash: Scalars['String'];
  userRequest?: Maybe<UserRequest>;
  userRequestHash: Scalars['String'];
};

export type DeliveryFilter = {
  AND?: InputMaybe<Array<InputMaybe<DeliveryFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<DeliveryFilter>>>;
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
  destinationOmnibridgeAddress?: InputMaybe<Scalars['String']>;
  destinationOmnibridgeAddress_contains?: InputMaybe<Scalars['String']>;
  destinationOmnibridgeAddress_ends_with?: InputMaybe<Scalars['String']>;
  destinationOmnibridgeAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  destinationOmnibridgeAddress_not?: InputMaybe<Scalars['String']>;
  destinationOmnibridgeAddress_not_contains?: InputMaybe<Scalars['String']>;
  destinationOmnibridgeAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  destinationOmnibridgeAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  destinationOmnibridgeAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  destinationOmnibridgeAddress_starts_with?: InputMaybe<Scalars['String']>;
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
  originationOmnibridgeAddress?: InputMaybe<Scalars['String']>;
  originationOmnibridgeAddress_contains?: InputMaybe<Scalars['String']>;
  originationOmnibridgeAddress_ends_with?: InputMaybe<Scalars['String']>;
  originationOmnibridgeAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  originationOmnibridgeAddress_not?: InputMaybe<Scalars['String']>;
  originationOmnibridgeAddress_not_contains?: InputMaybe<Scalars['String']>;
  originationOmnibridgeAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  originationOmnibridgeAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  originationOmnibridgeAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  originationOmnibridgeAddress_starts_with?: InputMaybe<Scalars['String']>;
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
  userRequestHash?: InputMaybe<Scalars['String']>;
  userRequestHash_contains?: InputMaybe<Scalars['String']>;
  userRequestHash_ends_with?: InputMaybe<Scalars['String']>;
  userRequestHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  userRequestHash_not?: InputMaybe<Scalars['String']>;
  userRequestHash_not_contains?: InputMaybe<Scalars['String']>;
  userRequestHash_not_ends_with?: InputMaybe<Scalars['String']>;
  userRequestHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  userRequestHash_not_starts_with?: InputMaybe<Scalars['String']>;
  userRequestHash_starts_with?: InputMaybe<Scalars['String']>;
};

export type DeliveryPage = {
  __typename?: 'DeliveryPage';
  items: Array<Delivery>;
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
  userRequest?: Maybe<UserRequest>;
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

export type LatestValidatorStatusUpdate = {
  __typename?: 'LatestValidatorStatusUpdate';
  ambAddress: Scalars['String'];
  ambBridge?: Maybe<AmbBridge>;
  chainId: Scalars['BigInt'];
  orderId: Scalars['BigInt'];
  validatorContract?: Maybe<ValidatorContract>;
  validatorContractAddress: Scalars['String'];
  validatorId: Scalars['String'];
  validatorStatusUpdate?: Maybe<ValidatorStatusUpdate>;
};

export type LatestValidatorStatusUpdateFilter = {
  AND?: InputMaybe<Array<InputMaybe<LatestValidatorStatusUpdateFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<LatestValidatorStatusUpdateFilter>>>;
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
  orderId?: InputMaybe<Scalars['BigInt']>;
  orderId_gt?: InputMaybe<Scalars['BigInt']>;
  orderId_gte?: InputMaybe<Scalars['BigInt']>;
  orderId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  orderId_lt?: InputMaybe<Scalars['BigInt']>;
  orderId_lte?: InputMaybe<Scalars['BigInt']>;
  orderId_not?: InputMaybe<Scalars['BigInt']>;
  orderId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  validatorContractAddress?: InputMaybe<Scalars['String']>;
  validatorContractAddress_contains?: InputMaybe<Scalars['String']>;
  validatorContractAddress_ends_with?: InputMaybe<Scalars['String']>;
  validatorContractAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  validatorContractAddress_not?: InputMaybe<Scalars['String']>;
  validatorContractAddress_not_contains?: InputMaybe<Scalars['String']>;
  validatorContractAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  validatorContractAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  validatorContractAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  validatorContractAddress_starts_with?: InputMaybe<Scalars['String']>;
  validatorId?: InputMaybe<Scalars['String']>;
  validatorId_contains?: InputMaybe<Scalars['String']>;
  validatorId_ends_with?: InputMaybe<Scalars['String']>;
  validatorId_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  validatorId_not?: InputMaybe<Scalars['String']>;
  validatorId_not_contains?: InputMaybe<Scalars['String']>;
  validatorId_not_ends_with?: InputMaybe<Scalars['String']>;
  validatorId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  validatorId_not_starts_with?: InputMaybe<Scalars['String']>;
  validatorId_starts_with?: InputMaybe<Scalars['String']>;
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

export type Omnibridge = {
  __typename?: 'Omnibridge';
  address: Scalars['String'];
  ambAddress: Scalars['String'];
  ambBridge?: Maybe<AmbBridge>;
  chainId: Scalars['BigInt'];
  validatorContract?: Maybe<ValidatorContract>;
};

export type OmnibridgeFilter = {
  AND?: InputMaybe<Array<InputMaybe<OmnibridgeFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<OmnibridgeFilter>>>;
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
};

export type OmnibridgePage = {
  __typename?: 'OmnibridgePage';
  items: Array<Omnibridge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
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
  aMBBridge?: Maybe<AmbBridge>;
  aMBBridges: AmbBridgePage;
  block?: Maybe<Block>;
  blocks: BlockPage;
  completion?: Maybe<Completion>;
  completions: CompletionPage;
  delivery?: Maybe<Delivery>;
  deliverys: DeliveryPage;
  feeDirector?: Maybe<FeeDirector>;
  feeDirectors: FeeDirectorPage;
  latestValidatorStatusUpdate?: Maybe<LatestValidatorStatusUpdate>;
  latestValidatorStatusUpdates: LatestValidatorStatusUpdatePage;
  omnibridge?: Maybe<Omnibridge>;
  omnibridges: OmnibridgePage;
  requiredSignaturesChanged?: Maybe<RequiredSignaturesChanged>;
  requiredSignaturesChangeds: RequiredSignaturesChangedPage;
  reverseMessageHashBinding?: Maybe<ReverseMessageHashBinding>;
  reverseMessageHashBindings: ReverseMessageHashBindingPage;
  signature?: Maybe<Signature>;
  signatures: SignaturePage;
  token?: Maybe<Token>;
  tokens: TokenPage;
  transaction?: Maybe<Transaction>;
  transactions: TransactionPage;
  userRequest?: Maybe<UserRequest>;
  userRequests: UserRequestPage;
  validator?: Maybe<Validator>;
  validatorContract?: Maybe<ValidatorContract>;
  validatorContracts: ValidatorContractPage;
  validatorStatusUpdate?: Maybe<ValidatorStatusUpdate>;
  validatorStatusUpdates: ValidatorStatusUpdatePage;
  validators: ValidatorPage;
};


export type QueryAMbBridgeArgs = {
  address: Scalars['String'];
  chainId: Scalars['BigInt'];
};


export type QueryAMbBridgesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<AmbBridgeFilter>;
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


export type QueryCompletionArgs = {
  messageHash: Scalars['String'];
};


export type QueryCompletionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<CompletionFilter>;
};


export type QueryDeliveryArgs = {
  messageHash: Scalars['String'];
};


export type QueryDeliverysArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<DeliveryFilter>;
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


export type QueryLatestValidatorStatusUpdateArgs = {
  ambAddress: Scalars['String'];
  chainId: Scalars['BigInt'];
  validatorId: Scalars['String'];
};


export type QueryLatestValidatorStatusUpdatesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<LatestValidatorStatusUpdateFilter>;
};


export type QueryOmnibridgeArgs = {
  address: Scalars['String'];
  chainId: Scalars['BigInt'];
};


export type QueryOmnibridgesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<OmnibridgeFilter>;
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
  messageId: Scalars['String'];
};


export type QueryReverseMessageHashBindingsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<ReverseMessageHashBindingFilter>;
};


export type QuerySignatureArgs = {
  chainId: Scalars['BigInt'];
  messageHash: Scalars['String'];
  validatorId: Scalars['String'];
};


export type QuerySignaturesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<SignatureFilter>;
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


export type QueryUserRequestArgs = {
  messageHash: Scalars['String'];
};


export type QueryUserRequestsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<UserRequestFilter>;
};


export type QueryValidatorArgs = {
  validatorId: Scalars['String'];
};


export type QueryValidatorContractArgs = {
  address: Scalars['String'];
  chainId: Scalars['BigInt'];
};


export type QueryValidatorContractsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<ValidatorContractFilter>;
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


export type QueryValidatorsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<ValidatorFilter>;
};

export type RequiredSignaturesChanged = {
  __typename?: 'RequiredSignaturesChanged';
  block?: Maybe<Block>;
  blockHash: Scalars['String'];
  chainId: Scalars['BigInt'];
  logIndex: Scalars['Float'];
  orderId: Scalars['BigInt'];
  transaction?: Maybe<Transaction>;
  transactionHash: Scalars['String'];
  validatorContract?: Maybe<ValidatorContract>;
  validatorContractAddress: Scalars['String'];
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
  validatorContractAddress?: InputMaybe<Scalars['String']>;
  validatorContractAddress_contains?: InputMaybe<Scalars['String']>;
  validatorContractAddress_ends_with?: InputMaybe<Scalars['String']>;
  validatorContractAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  validatorContractAddress_not?: InputMaybe<Scalars['String']>;
  validatorContractAddress_not_contains?: InputMaybe<Scalars['String']>;
  validatorContractAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  validatorContractAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  validatorContractAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  validatorContractAddress_starts_with?: InputMaybe<Scalars['String']>;
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
  userRequest?: Maybe<UserRequest>;
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

export type Signature = {
  __typename?: 'Signature';
  ambAddress: Scalars['String'];
  ambBridge?: Maybe<AmbBridge>;
  block?: Maybe<Block>;
  blockHash: Scalars['String'];
  chainId: Scalars['BigInt'];
  completion?: Maybe<Completion>;
  logIndex: Scalars['Float'];
  messageHash: Scalars['String'];
  orderId: Scalars['BigInt'];
  transaction?: Maybe<Transaction>;
  transactionHash: Scalars['String'];
  userRequest?: Maybe<UserRequest>;
  validator?: Maybe<Validator>;
  validatorId: Scalars['String'];
};

export type SignatureFilter = {
  AND?: InputMaybe<Array<InputMaybe<SignatureFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<SignatureFilter>>>;
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
  validatorId?: InputMaybe<Scalars['String']>;
  validatorId_contains?: InputMaybe<Scalars['String']>;
  validatorId_ends_with?: InputMaybe<Scalars['String']>;
  validatorId_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  validatorId_not?: InputMaybe<Scalars['String']>;
  validatorId_not_contains?: InputMaybe<Scalars['String']>;
  validatorId_not_ends_with?: InputMaybe<Scalars['String']>;
  validatorId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  validatorId_not_starts_with?: InputMaybe<Scalars['String']>;
  validatorId_starts_with?: InputMaybe<Scalars['String']>;
};

export type SignaturePage = {
  __typename?: 'SignaturePage';
  items: Array<Signature>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type Token = {
  __typename?: 'Token';
  address: Scalars['String'];
  ambAddress: Scalars['String'];
  chainId: Scalars['BigInt'];
  destination?: Maybe<Token>;
  destinationAddress?: Maybe<Scalars['String']>;
  destinationAmbAddress?: Maybe<Scalars['String']>;
  destinationChainId?: Maybe<Scalars['BigInt']>;
  destinationOmnibridge?: Maybe<Omnibridge>;
  destinationOmnibridgeAddress?: Maybe<Scalars['String']>;
  destinations?: Maybe<TokenPage>;
  orderId: Scalars['BigInt'];
  origination?: Maybe<Token>;
  originationAddress: Scalars['String'];
  originationAmbAddress: Scalars['String'];
  originationChainId: Scalars['BigInt'];
  originationOmnibridge?: Maybe<Omnibridge>;
  originationOmnibridgeAddress: Scalars['String'];
  userRequest?: Maybe<UserRequestPage>;
};


export type TokenDestinationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<TokenFilter>;
};


export type TokenUserRequestArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<UserRequestFilter>;
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
  destinationOmnibridgeAddress?: InputMaybe<Scalars['String']>;
  destinationOmnibridgeAddress_contains?: InputMaybe<Scalars['String']>;
  destinationOmnibridgeAddress_ends_with?: InputMaybe<Scalars['String']>;
  destinationOmnibridgeAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  destinationOmnibridgeAddress_not?: InputMaybe<Scalars['String']>;
  destinationOmnibridgeAddress_not_contains?: InputMaybe<Scalars['String']>;
  destinationOmnibridgeAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  destinationOmnibridgeAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  destinationOmnibridgeAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  destinationOmnibridgeAddress_starts_with?: InputMaybe<Scalars['String']>;
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
  originationOmnibridgeAddress?: InputMaybe<Scalars['String']>;
  originationOmnibridgeAddress_contains?: InputMaybe<Scalars['String']>;
  originationOmnibridgeAddress_ends_with?: InputMaybe<Scalars['String']>;
  originationOmnibridgeAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  originationOmnibridgeAddress_not?: InputMaybe<Scalars['String']>;
  originationOmnibridgeAddress_not_contains?: InputMaybe<Scalars['String']>;
  originationOmnibridgeAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  originationOmnibridgeAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  originationOmnibridgeAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  originationOmnibridgeAddress_starts_with?: InputMaybe<Scalars['String']>;
};

export type TokenPage = {
  __typename?: 'TokenPage';
  items: Array<Token>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type Transaction = {
  __typename?: 'Transaction';
  block?: Maybe<Block>;
  blockHash: Scalars['String'];
  chainId: Scalars['BigInt'];
  completions?: Maybe<CompletionPage>;
  deliveries?: Maybe<DeliveryPage>;
  from: Scalars['String'];
  gas: Scalars['BigInt'];
  gasPrice?: Maybe<Scalars['BigInt']>;
  hash: Scalars['String'];
  index: Scalars['String'];
  maxFeePerGas?: Maybe<Scalars['BigInt']>;
  maxPriorityFeePerGas?: Maybe<Scalars['BigInt']>;
  nonce: Scalars['BigInt'];
  requiredSignaturesChanged?: Maybe<RequiredSignaturesChangedPage>;
  signatures?: Maybe<SignaturePage>;
  to: Scalars['String'];
  type: Scalars['String'];
  userRequests?: Maybe<UserRequestPage>;
  validatorStatusUpdates?: Maybe<ValidatorStatusUpdatePage>;
  value: Scalars['BigInt'];
};


export type TransactionCompletionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<CompletionFilter>;
};


export type TransactionDeliveriesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<DeliveryFilter>;
};


export type TransactionRequiredSignaturesChangedArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<RequiredSignaturesChangedFilter>;
};


export type TransactionSignaturesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<SignatureFilter>;
};


export type TransactionUserRequestsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<UserRequestFilter>;
};


export type TransactionValidatorStatusUpdatesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<ValidatorStatusUpdateFilter>;
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

export type UserRequest = {
  __typename?: 'UserRequest';
  amount: Scalars['BigInt'];
  block?: Maybe<Block>;
  blockHash: Scalars['String'];
  chainId: Scalars['BigInt'];
  completion?: Maybe<Completion>;
  confirmedSignatures: Scalars['BigInt'];
  deliveringNative: Scalars['Boolean'];
  delivery?: Maybe<Delivery>;
  destinationAMBBridge?: Maybe<AmbBridge>;
  destinationAmbAddress: Scalars['String'];
  destinationChainId: Scalars['BigInt'];
  destinationOmnibridge?: Maybe<Omnibridge>;
  destinationOmnibridgeAddress?: Maybe<Scalars['String']>;
  destinationToken?: Maybe<Token>;
  destinationTokenAddress?: Maybe<Scalars['String']>;
  encodedData: Scalars['String'];
  finishedSigning: Scalars['Boolean'];
  from: Scalars['String'];
  handlingNative: Scalars['Boolean'];
  logIndex: Scalars['Float'];
  messageHash: Scalars['String'];
  messageId: Scalars['String'];
  orderId: Scalars['BigInt'];
  originationAMBBridge?: Maybe<AmbBridge>;
  originationAmbAddress: Scalars['String'];
  originationChainId: Scalars['BigInt'];
  originationOmnibridge?: Maybe<Omnibridge>;
  originationOmnibridgeAddress?: Maybe<Scalars['String']>;
  originationToken?: Maybe<Token>;
  originationTokenAddress?: Maybe<Scalars['String']>;
  requiredSignatureOrderId?: Maybe<Scalars['BigInt']>;
  requiredSignatures?: Maybe<RequiredSignaturesChanged>;
  signatures?: Maybe<SignaturePage>;
  to: Scalars['String'];
  transaction?: Maybe<Transaction>;
  transactionHash: Scalars['String'];
  type: UserRequestType;
};


export type UserRequestSignaturesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<SignatureFilter>;
};

export type UserRequestFilter = {
  AND?: InputMaybe<Array<InputMaybe<UserRequestFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<UserRequestFilter>>>;
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
  destinationOmnibridgeAddress?: InputMaybe<Scalars['String']>;
  destinationOmnibridgeAddress_contains?: InputMaybe<Scalars['String']>;
  destinationOmnibridgeAddress_ends_with?: InputMaybe<Scalars['String']>;
  destinationOmnibridgeAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  destinationOmnibridgeAddress_not?: InputMaybe<Scalars['String']>;
  destinationOmnibridgeAddress_not_contains?: InputMaybe<Scalars['String']>;
  destinationOmnibridgeAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  destinationOmnibridgeAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  destinationOmnibridgeAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  destinationOmnibridgeAddress_starts_with?: InputMaybe<Scalars['String']>;
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
  originationOmnibridgeAddress?: InputMaybe<Scalars['String']>;
  originationOmnibridgeAddress_contains?: InputMaybe<Scalars['String']>;
  originationOmnibridgeAddress_ends_with?: InputMaybe<Scalars['String']>;
  originationOmnibridgeAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  originationOmnibridgeAddress_not?: InputMaybe<Scalars['String']>;
  originationOmnibridgeAddress_not_contains?: InputMaybe<Scalars['String']>;
  originationOmnibridgeAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  originationOmnibridgeAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  originationOmnibridgeAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  originationOmnibridgeAddress_starts_with?: InputMaybe<Scalars['String']>;
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
  type?: InputMaybe<UserRequestType>;
  type_in?: InputMaybe<Array<InputMaybe<UserRequestType>>>;
  type_not?: InputMaybe<UserRequestType>;
  type_not_in?: InputMaybe<Array<InputMaybe<UserRequestType>>>;
};

export type UserRequestPage = {
  __typename?: 'UserRequestPage';
  items: Array<UserRequest>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type UserRequestType =
  | 'affirmation'
  | 'signature'
  | '%future added value';

export type Validator = {
  __typename?: 'Validator';
  address: Scalars['String'];
  ambAddress: Scalars['String'];
  chainId: Scalars['BigInt'];
  signatures?: Maybe<SignaturePage>;
  validatorContract?: Maybe<ValidatorContract>;
  validatorContractAddress: Scalars['String'];
  validatorId: Scalars['String'];
  validatorStatusUpdates?: Maybe<ValidatorStatusUpdatePage>;
};


export type ValidatorSignaturesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<SignatureFilter>;
};


export type ValidatorValidatorStatusUpdatesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<ValidatorStatusUpdateFilter>;
};

export type ValidatorContract = {
  __typename?: 'ValidatorContract';
  address: Scalars['String'];
  chainId: Scalars['BigInt'];
  latestRequiredSignaturesOrderId: Scalars['BigInt'];
  requiredSiganturesChangedEvents?: Maybe<RequiredSignaturesChangedPage>;
  requiredSignaturesChanged?: Maybe<RequiredSignaturesChanged>;
  validators?: Maybe<ValidatorPage>;
};


export type ValidatorContractRequiredSiganturesChangedEventsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<RequiredSignaturesChangedFilter>;
};


export type ValidatorContractValidatorsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<ValidatorFilter>;
};

export type ValidatorContractFilter = {
  AND?: InputMaybe<Array<InputMaybe<ValidatorContractFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<ValidatorContractFilter>>>;
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
  latestRequiredSignaturesOrderId?: InputMaybe<Scalars['BigInt']>;
  latestRequiredSignaturesOrderId_gt?: InputMaybe<Scalars['BigInt']>;
  latestRequiredSignaturesOrderId_gte?: InputMaybe<Scalars['BigInt']>;
  latestRequiredSignaturesOrderId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
  latestRequiredSignaturesOrderId_lt?: InputMaybe<Scalars['BigInt']>;
  latestRequiredSignaturesOrderId_lte?: InputMaybe<Scalars['BigInt']>;
  latestRequiredSignaturesOrderId_not?: InputMaybe<Scalars['BigInt']>;
  latestRequiredSignaturesOrderId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']>>>;
};

export type ValidatorContractPage = {
  __typename?: 'ValidatorContractPage';
  items: Array<ValidatorContract>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type ValidatorFilter = {
  AND?: InputMaybe<Array<InputMaybe<ValidatorFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<ValidatorFilter>>>;
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
  validatorContractAddress?: InputMaybe<Scalars['String']>;
  validatorContractAddress_contains?: InputMaybe<Scalars['String']>;
  validatorContractAddress_ends_with?: InputMaybe<Scalars['String']>;
  validatorContractAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  validatorContractAddress_not?: InputMaybe<Scalars['String']>;
  validatorContractAddress_not_contains?: InputMaybe<Scalars['String']>;
  validatorContractAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  validatorContractAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  validatorContractAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  validatorContractAddress_starts_with?: InputMaybe<Scalars['String']>;
  validatorId?: InputMaybe<Scalars['String']>;
  validatorId_contains?: InputMaybe<Scalars['String']>;
  validatorId_ends_with?: InputMaybe<Scalars['String']>;
  validatorId_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  validatorId_not?: InputMaybe<Scalars['String']>;
  validatorId_not_contains?: InputMaybe<Scalars['String']>;
  validatorId_not_ends_with?: InputMaybe<Scalars['String']>;
  validatorId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  validatorId_not_starts_with?: InputMaybe<Scalars['String']>;
  validatorId_starts_with?: InputMaybe<Scalars['String']>;
};

export type ValidatorPage = {
  __typename?: 'ValidatorPage';
  items: Array<Validator>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type ValidatorStatusUpdate = {
  __typename?: 'ValidatorStatusUpdate';
  ambAddress: Scalars['String'];
  block?: Maybe<Block>;
  blockHash: Scalars['String'];
  bridge?: Maybe<Omnibridge>;
  chainId: Scalars['BigInt'];
  logIndex: Scalars['Float'];
  orderId: Scalars['BigInt'];
  transaction?: Maybe<Transaction>;
  transactionHash: Scalars['String'];
  validator?: Maybe<Validator>;
  validatorContract?: Maybe<ValidatorContract>;
  validatorContractAddress: Scalars['String'];
  validatorId: Scalars['String'];
  value: Scalars['Boolean'];
};

export type ValidatorStatusUpdateFilter = {
  AND?: InputMaybe<Array<InputMaybe<ValidatorStatusUpdateFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<ValidatorStatusUpdateFilter>>>;
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
  validatorContractAddress?: InputMaybe<Scalars['String']>;
  validatorContractAddress_contains?: InputMaybe<Scalars['String']>;
  validatorContractAddress_ends_with?: InputMaybe<Scalars['String']>;
  validatorContractAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  validatorContractAddress_not?: InputMaybe<Scalars['String']>;
  validatorContractAddress_not_contains?: InputMaybe<Scalars['String']>;
  validatorContractAddress_not_ends_with?: InputMaybe<Scalars['String']>;
  validatorContractAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  validatorContractAddress_not_starts_with?: InputMaybe<Scalars['String']>;
  validatorContractAddress_starts_with?: InputMaybe<Scalars['String']>;
  validatorId?: InputMaybe<Scalars['String']>;
  validatorId_contains?: InputMaybe<Scalars['String']>;
  validatorId_ends_with?: InputMaybe<Scalars['String']>;
  validatorId_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  validatorId_not?: InputMaybe<Scalars['String']>;
  validatorId_not_contains?: InputMaybe<Scalars['String']>;
  validatorId_not_ends_with?: InputMaybe<Scalars['String']>;
  validatorId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  validatorId_not_starts_with?: InputMaybe<Scalars['String']>;
  validatorId_starts_with?: InputMaybe<Scalars['String']>;
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

export type SingleUserRequestQueryVariables = Exact<{
  hash: Scalars['String'];
}>;


export type SingleUserRequestQuery = { __typename?: 'Query', userRequests: { __typename?: 'UserRequestPage', items: Array<{ __typename?: 'UserRequest', messageId: string, signatures?: { __typename?: 'SignaturePage', items: Array<{ __typename?: 'Signature', messageHash: string }> } | null }> } };

export type SingleExecutionQueryVariables = Exact<{
  messageHash: Scalars['String'];
}>;


export type SingleExecutionQuery = { __typename?: 'Query', deliverys: { __typename?: 'DeliveryPage', items: Array<{ __typename?: 'Delivery', transactionHash: string }> } };
