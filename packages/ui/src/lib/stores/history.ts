import { loading } from './loading.svelte'
import { getAddress, type Hex } from 'viem'
import * as networks from 'viem/chains'
import type {
  Query,
  UserRequest,
  UserRequestFilter,
  UserRequestType
} from '../gql/graphql'
import { gql, GraphQLClient } from 'graphql-request'
import { indexer } from '../config'
import { sortBy } from 'lodash'
import type { UseAppKitAccountReturn } from '@reown/appkit'
import { multicallErc20, type Erc20Metadata } from '@gibs/common'
import { clientFromChain } from './input.svelte'
import { getStoreKey, getTokenMetadata, parseTokenKey, loadTokenMetadata as loadTokenMetadataFromCache } from './token-metadata-cache'

export type Bridge = UserRequest

export interface TokenMetadata {
  name: string
  symbol: string
  decimals: number
}

export interface BridgeData {
  userRequests: UserRequest[]
  tokenMetadata: Map<string, TokenMetadata> // Key: chainId:tokenAddress
}

const client = new GraphQLClient(indexer)

const fragment = gql`{
    messageHash
    messageId
    type
    orderId
    blockHash
    chainId
    transactionHash
    from
    to
    amount
    encodedData
    logIndex
    requiredSignatureOrderId
    confirmedSignatures
    finishedSigning
    originationChainId
    originationAmbAddress
    destinationChainId
    destinationAmbAddress
    originationOmnibridgeAddress
    destinationOmnibridgeAddress
    originationTokenAddress
    destinationTokenAddress
    handlingNative
    deliveringNative
    block {
      chainId
      hash
      number
      timestamp
      baseFeePerGas
    }
    transaction {
      chainId
      hash
      blockHash
      index
      from
      to
      value
      gas
      gasPrice
      nonce
      type
    }
    originationAMBBridge {
      chainId
      address
      provider
      side
    }
    destinationAMBBridge {
      chainId
      address
      provider
      side
    }
    requiredSignatures {
      orderId
      chainId
      value
      transactionHash
      logIndex
    }
    completion {
      messageHash
      orderId
      chainId
      transactionHash
    }
    delivery {
      messageHash
      orderId
      chainId
      transactionHash
      deliverer
      logIndex
    }
    originationToken {
      address
      chainId
      ambAddress
      originationAddress
      destinationAddress
    }
    destinationToken {
      address
      chainId
      ambAddress
      originationAddress
      destinationAddress
    }
  }`

// GraphQL fragments for bridge data
const BRIDGE_CORE_FRAGMENT = gql`
  fragment BridgeCore on UserRequest ${fragment}
`


const SIGNATURE_FRAGMENT = gql`{
  messageHash
  chainId
  validatorId
  orderId
  blockHash
  transactionHash
  logIndex
}`

const PAGE_INFO_FRAGMENT = gql`
totalCount
pageInfo {
  hasNextPage
  hasPreviousPage
  startCursor
  endCursor
}`

// Query to get bridge transactions for a user account
const GET_BRIDGES_QUERY = gql`
  query GetBridgesUnderAccount($where: UserRequestFilter) {
    userRequests(where: $where, limit: 1000, orderBy: "orderId", orderDirection: "desc") {
      items {
        ...BridgeCore
        signatures(limit: 10, orderBy: "orderId", orderDirection: "desc") {
          items ${SIGNATURE_FRAGMENT}
        }
      }
      ${PAGE_INFO_FRAGMENT}
    }
  }
  ${BRIDGE_CORE_FRAGMENT}
`

// Query to get recent bridge transactions without requiring an address
const GET_RECENT_BRIDGES_QUERY = gql`
  query GetRecentBridges($limit: Int = 50) {
    userRequests(limit: $limit, orderBy: "orderId", orderDirection: "desc") {
      items {
        ...BridgeCore
        signatures(limit: 10, orderBy: "orderId", orderDirection: "desc") {
          items ${SIGNATURE_FRAGMENT}
        }
      }
      ${PAGE_INFO_FRAGMENT}
    }
  }
  ${BRIDGE_CORE_FRAGMENT}
`

// Helper function to get connected wallet address
const connectedAddress = (accountState: UseAppKitAccountReturn): string | undefined => {
  return accountState.address
}

// Type for the query variables
interface GetBridgesQueryVariables {
  where: UserRequestFilter
}

// Type for the query result
interface GetBridgesQueryResult {
  userRequests: {
    items: UserRequest[]
    pageInfo: {
      hasNextPage: boolean
      hasPreviousPage: boolean
      startCursor?: string | null
      endCursor?: string | null
    }
    totalCount: number
  }
}

// Type for recent bridges query variables
interface GetRecentBridgesQueryVariables {
  limit?: number
}

/**
 * Helper function to load token metadata for unique tokens across chains
 */
async function loadTokenMetadata(bridges: Bridge[]): Promise<Map<string, TokenMetadata>> {
  const tokenMetadata = new Map<string, TokenMetadata>()

  // Extract unique token/chain combinations
  const uniqueTokens: Array<{ chainId: number; address: string }> = []
  const uniqueTokenKeys = new Set<string>()

  bridges.forEach(bridge => {
    // Try to use token relations first, fallback to individual fields
    // Add origination token
    let originationAddress: string | null = null
    let originationChainId: number | null = null

    if (bridge.originationToken?.address && bridge.originationToken?.chainId) {
      originationAddress = bridge.originationToken.address
      originationChainId = Number(bridge.originationToken.chainId)
    } else if (bridge.originationTokenAddress && bridge.originationChainId) {
      originationAddress = bridge.originationTokenAddress
      originationChainId = Number(bridge.originationChainId)
    }

    if (originationAddress && originationChainId) {
      const key = getStoreKey(originationChainId, originationAddress)
      if (!uniqueTokenKeys.has(key)) {
        uniqueTokenKeys.add(key)
        uniqueTokens.push({ chainId: originationChainId, address: originationAddress })
      }
    }

    // Add destination token if it exists and is different
    let destinationAddress: string | null = null
    let destinationChainId: number | null = null

    if (bridge.destinationToken?.address && bridge.destinationToken?.chainId) {
      destinationAddress = bridge.destinationToken.address
      destinationChainId = Number(bridge.destinationToken.chainId)
    } else if (bridge.destinationTokenAddress && bridge.destinationChainId) {
      destinationAddress = bridge.destinationTokenAddress
      destinationChainId = Number(bridge.destinationChainId)
    }

    if (destinationAddress && destinationChainId &&
      destinationAddress !== originationAddress) {
      const key = getStoreKey(destinationChainId, destinationAddress)
      if (!uniqueTokenKeys.has(key)) {
        uniqueTokenKeys.add(key)
        uniqueTokens.push({ chainId: destinationChainId, address: destinationAddress })
      }
    }
  })

  // Load token metadata into cache first
  if (uniqueTokens.length > 0) {
    await loadTokenMetadataFromCache(uniqueTokens.map(token => ({
      chainId: token.chainId,
      address: token.address as `0x${string}`
    })))
  }

  // Now get metadata from the populated cache
  Array.from(uniqueTokenKeys).forEach((key) => {
    try {
      const { chainId, address } = parseTokenKey(key)
      const metadata = getTokenMetadata(chainId, address)
      if (metadata) {
        tokenMetadata.set(key, metadata)
      }
    } catch (error) {
      console.error(`Failed to load metadata for ${key}:`, error)
    }
  })

  return tokenMetadata
}

/**
 * Reactive store that loads bridge transactions for the connected account (returns separate data)
 * @param account - The connected wallet account address
 * @returns A loading store containing bridge transactions separated by type
 */
export const loadBridgeTransactions = loading.loadsAfterTick<BridgeData | null, string | null | undefined>(
  'bridges',
  async (
    account: Hex | null | undefined,
    controller: AbortController
  ): Promise<BridgeData | null> => {
    if (!account) {
      return null
    }

    // Create filter for user requests
    const filter: UserRequestFilter = {
      OR: [
        { from: account },
        { to: account }
      ]
    }

    const variables: GetBridgesQueryVariables = {
      where: filter
    }

    try {
      const data = await client.request<GetBridgesQueryResult>(GET_BRIDGES_QUERY, variables)

      // Check if the request was aborted
      if (controller.signal.aborted) {
        return null
      }

      // Sort the array
      const sortedUserRequests = sortBy(data.userRequests.items, [(bridge) => -BigInt(bridge.orderId)])

      // Load token metadata for all bridges
      const tokenMetadata = await loadTokenMetadata(sortedUserRequests)

      // Return unified array with metadata
      return {
        userRequests: sortedUserRequests,
        tokenMetadata
      }

    } catch (error) {
      console.error('Failed to fetch bridge transactions:', error)

      // Check if the request was aborted before throwing
      if (controller.signal.aborted) {
        return null
      }

      throw error
    }
  }
)

/**
 * Reactive store that loads recent bridge transactions without requiring an account
 * @returns A loading store containing recent bridge transactions separated by type
 */
export const loadRecentBridgeTransactions = loading.loadsAfterTick<BridgeData | null, number | undefined>(
  'recent-bridges',
  async (
    limit: number = 100,
    controller: AbortController
  ): Promise<BridgeData | null> => {
    const variables: GetRecentBridgesQueryVariables = {
      limit
    }

    try {
      const data = await client.request<GetBridgesQueryResult>(GET_RECENT_BRIDGES_QUERY, variables)

      // Check if the request was aborted
      if (controller.signal.aborted) {
        return null
      }

      // Sort the array
      const sortedUserRequests = sortBy(data.userRequests.items, [(bridge) => -BigInt(bridge.orderId)])

      // Load token metadata for all bridges
      const tokenMetadata = await loadTokenMetadata(sortedUserRequests)

      console.log(tokenMetadata)
      // Return unified array with metadata
      return {
        userRequests: sortedUserRequests,
        tokenMetadata
      }

    } catch (error) {
      console.error('Failed to fetch recent bridge transactions:', error)

      // Check if the request was aborted before throwing
      if (controller.signal.aborted) {
        return null
      }

      throw error
    }
  }
)
