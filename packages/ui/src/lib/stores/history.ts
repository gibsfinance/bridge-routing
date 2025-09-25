import { loading } from './loading.svelte'
import { getAddress, type Hex } from 'viem'
import * as networks from 'viem/chains'
import type {
  UserRequest,
  UserRequestFilter,
} from '../gql/graphql'
import { gql, GraphQLClient } from 'graphql-request'
import { indexer } from '../config'
import { sortBy } from 'lodash'
import type { UseAppKitAccountReturn } from '@reown/appkit'
import { multicallErc20, type Erc20Metadata } from '@gibs/common'
import { clientFromChain } from './input.svelte'
import { getStoreKey, getTokenMetadata, parseTokenKey, loadTokenMetadata as loadTokenMetadataFromCache } from './token-metadata-cache'
import type { TokenMetadata } from '@gibs/bridge-sdk/types'

export interface FeeData {
  tokenAddress: Hex
  feeManagerContract: {
    chainId: string
    address: Hex
    omnibridgeAddress: Hex
  }
  feeUpdate: {
    feeType: Hex
    fee: string
  }
}

export interface BridgeData {
  userRequests: UserRequest[]
  tokenMetadata: Map<string, TokenMetadata> // Key: chainId:tokenAddress
  feeData: FeeData[] // Latest fee updates for cross-referencing amount out calculations
  pageInfo?: {
    hasNextPage: boolean
    hasPreviousPage: boolean
    startCursor?: string | null
    endCursor?: string | null
  }
  totalCount?: number
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
    amountIn
    amountOut
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
    signatures
    finishedSigning
    delivered
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
      originationChainId
      destinationAddress
      destinationChainId
    }
    destinationToken {
      address
      chainId
      ambAddress
      originationAddress
      destinationAddress
    }
    feeDirector {
      messageHash
      recipient
      settings
      limit
      multiplier
      feeType
      unwrapped
    }
  }`

// GraphQL fragments for bridge data
const BRIDGE_CORE_FRAGMENT = gql`
  fragment BridgeCore on UserRequest ${fragment}
`


const SIGN_FOR_FRAGMENT = gql`{
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

// Query to get bridge transactions and fee data (optionally filtered by user account)
const GET_BRIDGES_QUERY = gql`
  query GetBridges($where: UserRequestFilter, $limit: Int = 10, $after: String, $before: String) {
    userRequests(where: $where, limit: $limit, after: $after, before: $before, orderBy: "orderId", orderDirection: "desc") {
      items {
        ...BridgeCore
      }
      ${PAGE_INFO_FRAGMENT}
    }
    latestFeeUpdates(limit: 1000) {
      items {
        tokenAddress
        feeManagerContract {
          chainId
          address
          omnibridgeAddress
        }
        feeUpdate {
          feeType
          fee
        }
      }
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
  where?: UserRequestFilter
  limit?: number
  after?: string
  before?: string
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
  latestFeeUpdates: {
    items: FeeData[]
  }
}

/**
 * Helper function to load token metadata for unique tokens across chains
 */
async function loadTokenMetadata(bridges: UserRequest[]): Promise<Map<string, TokenMetadata>> {
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
        if (originationChainId === 56) { // BSC chain ID
          console.log(`Found BSC origination token:`, { address: originationAddress, chainId: originationChainId, key })
        }
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
        // if (destinationChainId === 56) { // BSC chain ID
        //   console.log(`Found BSC destination token:`, { address: destinationAddress, chainId: destinationChainId, key })
        // }
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

export type LoadBridgesParams = {
  address: Hex | null | undefined
  hash?: Hex | null | undefined
  limit?: number
  after?: string
  before?: string
  filterMode?: 'all' | 'pending'
}

// Cache for bridge transactions with 5-second invalidation
const bridgeCache = new Map<string, { timestamp: number, result: Promise<BridgeData | null> }>()
const BRIDGE_CACHE_TTL = 5 * 1000 // 5 seconds

/**
 * Reactive store that loads bridge transactions with optional filtering and pagination
 * @param params - Parameters including address (optional), limit, and cursor for pagination
 * @returns A loading store containing bridge transactions with pagination info
 */
export const loadBridgeTransactions = loading.loadsAfterTick<BridgeData | null, LoadBridgesParams>(
  'bridges',
  async (
    params: LoadBridgesParams,
    controller: AbortController
  ): Promise<BridgeData | null> => {
    const { address, hash, limit = 10, after, before, filterMode = 'all' } = params || {}
    console.log('loading bridge transactions', params)

    // Create cache key from actual data parameters
    const cacheKey = JSON.stringify({ address, hash, limit, after, before, filterMode })

    // Clean up stale cache entries
    const now = Date.now()
    for (const [key, value] of bridgeCache) {
      if (value.timestamp < now - BRIDGE_CACHE_TTL) {
        bridgeCache.delete(key)
      }
    }

    // Check cache
    const cached = bridgeCache.get(cacheKey)
    if (cached && cached.timestamp > now - BRIDGE_CACHE_TTL) {
      const result = await cached.result
      if (result) {
        console.log('returning cached bridge data', cached)
        return cached.result
      }
    }

    // Create filter for user requests
    let filter: UserRequestFilter | undefined = undefined

    // Start with address filter if provided
    if (address) {
      filter = {
        OR: [
          { from: address as Hex },
          { to: address as Hex }
        ]
      }
    }

    // Add hash filter if provided (OR filter for transaction hash, message id, and message hash)
    if (hash) {
      const h = hash as Hex
      const hashFilter: UserRequestFilter = {
        OR: [
          { transactionHash: h },
          { messageId: h },
          { messageHash: h }
        ]
      }

      if (filter) {
        // Combine address filter with hash filter using AND
        filter = {
          AND: [filter, hashFilter]
        }
      } else {
        filter = hashFilter
      }
    }

    // Add status filter based on filterMode
    if (filterMode === 'pending') {
      const statusFilter: UserRequestFilter = {
        AND: [
          // { finishedSigning: true },
          { delivered: false }
        ]
      }

      if (filter) {
        // Combine address filter with status filter
        filter = {
          AND: [filter, statusFilter]
        }
      } else {
        filter = statusFilter
      }
    }

    const variables: GetBridgesQueryVariables = {
      where: filter,
      limit,
      after,
      before
    }

    // Create and cache the promise for the actual data fetching
    const dataPromise = (async (): Promise<BridgeData | null> => {
      try {
        const data = await client.request<GetBridgesQueryResult>(GET_BRIDGES_QUERY, variables)

        // Check if the request was aborted
        if (controller.signal.aborted) {
          return null
        }

        // Sort the array
        const sortedUserRequests = sortBy(data.userRequests.items, [(bridge) => -BigInt(bridge.orderId)])
        console.log('sortedUserRequests', sortedUserRequests)

        // Load token metadata for all bridges
        const tokenMetadata = await loadTokenMetadata(sortedUserRequests)

        if (data.latestFeeUpdates.items.length >= 1000) {
          console.warn('Latest fee updates limit reached, some fee updates may be missing')
        }

        // Return unified array with metadata, fee data, and pagination info
        return {
          userRequests: sortedUserRequests,
          tokenMetadata,
          feeData: data.latestFeeUpdates.items,
          pageInfo: data.userRequests.pageInfo,
          totalCount: data.userRequests.totalCount
        }

      } catch (error) {
        console.error('Failed to fetch bridge transactions:', error)

        // Check if the request was aborted before throwing
        if (controller.signal.aborted) {
          return null
        }

        throw error
      }
    })()

    // Cache the promise (even if it fails, to prevent duplicate requests)
    bridgeCache.set(cacheKey, {
      timestamp: now,
      result: dataPromise
    })

    return dataPromise
  }
)
