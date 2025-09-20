import { loading } from './loading.svelte'
import { getAddress, type Hex } from 'viem'
import * as networks from 'viem/chains'
import type {
  Query,
  UserRequestForAffirmation,
  UserRequestForSignature,
  UserRequestForSignatureFilter,
  UserRequestForAffirmationFilter
} from '../gql/graphql'
import { gql, GraphQLClient } from 'graphql-request'
import { indexer } from '../config'
import { sortBy } from 'lodash'
import type { UseAppKitAccountReturn } from '@reown/appkit'
import { multicallErc20, type Erc20Metadata } from '@gibs/common'
import { clientFromChain } from './input.svelte'
import { getTokenMetadata } from './token-metadata-cache.svelte'

export type Bridge = UserRequestForSignature | UserRequestForAffirmation

export interface TokenMetadata {
  name: string
  symbol: string
  decimals: number
}

export interface BridgeData {
  signatures: UserRequestForSignature[]
  affirmations: UserRequestForAffirmation[]
  tokenMetadata: Map<string, TokenMetadata> // Key: chainId:tokenAddress
}

const client = new GraphQLClient(indexer)

const fragment = gql`{
    messageId
    orderId
    originationTokenChainId
    destinationTokenChainId
    from
    to
    amount
    handlingNative
    deliveringNative
    messageHash
    encodedData
    confirmedSignatures
    finishedSigning
    chainId
    blockHash
    transactionHash
    logIndex
    bridgeAddress
    requiredSignatureOrderId
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
    bridge {
      chainId
      address
      provider
      side
    }
    requiredSignatures {
      orderId
      chainId
      bridgeAddress
      value
      transactionHash
      logIndex
    }
    delivery {
      messageHash
      orderId
      chainId
      transactionHash
      userRequestId
      deliverer
      logIndex
    }
      originationTokenAddress
      originationTokenChainId
      destinationTokenAddress
      destinationTokenChainId
      destinationTokenAmbAddress
      originationTokenAmbAddress
    originationToken {
      address
      chainId
      ambAddress
    }
    destinationToken {
      address
      chainId
      ambAddress
    }
  }`

// GraphQL fragments for bridge data
const BRIDGE_CORE_FRAGMENT = gql`
  fragment BridgeCore on UserRequestForSignature ${fragment}
`

const BRIDGE_AFFIRMATION_FRAGMENT = gql`
  fragment BridgeAffirmation on UserRequestForAffirmation ${fragment}
`

const FEE_DIRECTOR_FRAGMENT = gql`
  fragment FeeDirectorInfo on FeeDirector {
    messageId
    recipient
    settings
    limit
    multiplier
    feeType
    unwrapped
    excludePriority
  }
`

const SIGNATURE_FRAGMENT = gql`{
  messageHash
  bridgeAddress
  validatorAddress
  orderId
  chainId
  blockHash
  transactionHash
  userRequestId
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

// Query to get bridge transactions for a user account (returns separate columns)
const GET_BRIDGES_QUERY = gql`
  query GetBridgesUnderAccount($whereSig: UserRequestForSignatureFilter, $whereAff: UserRequestForAffirmationFilter) {
    userRequestForSignatures(where: $whereSig, limit: 1000, orderBy: "orderId", orderDirection: "desc") {
      items {
        ...BridgeCore
        feeDirector {
          ...FeeDirectorInfo
        }
        signatures(limit: 10, orderBy: "orderId", orderDirection: "desc") {
          items ${SIGNATURE_FRAGMENT}
        }
      }
      ${PAGE_INFO_FRAGMENT}
    }
    userRequestForAffirmations(where: $whereAff, limit: 1000, orderBy: "orderId", orderDirection: "desc") {
      items {
        ...BridgeAffirmation
        signatures(limit: 10, orderBy: "orderId", orderDirection: "desc") {
          items ${SIGNATURE_FRAGMENT}
        }
      }
      ${PAGE_INFO_FRAGMENT}
    }
  }
  ${BRIDGE_CORE_FRAGMENT}
  ${BRIDGE_AFFIRMATION_FRAGMENT}
  ${FEE_DIRECTOR_FRAGMENT}
`

// Query to get recent bridge transactions without requiring an address
const GET_RECENT_BRIDGES_QUERY = gql`
  query GetRecentBridges($limit: Int = 50) {
    userRequestForSignatures(limit: $limit, orderBy: "orderId", orderDirection: "desc") {
      items {
        ...BridgeCore
        feeDirector {
          ...FeeDirectorInfo
        }
        signatures(limit: 10, orderBy: "orderId", orderDirection: "desc") {
          items ${SIGNATURE_FRAGMENT}
        }
      }
      ${PAGE_INFO_FRAGMENT}
    }
    userRequestForAffirmations(limit: $limit, orderBy: "orderId", orderDirection: "desc") {
      items {
        ...BridgeAffirmation
        signatures(limit: 10, orderBy: "orderId", orderDirection: "desc") {
          items ${SIGNATURE_FRAGMENT}
        }
      }
      ${PAGE_INFO_FRAGMENT}
    }
  }
  ${BRIDGE_CORE_FRAGMENT}
  ${BRIDGE_AFFIRMATION_FRAGMENT}
  ${FEE_DIRECTOR_FRAGMENT}
`

// Helper function to get connected wallet address
const connectedAddress = (accountState: UseAppKitAccountReturn): string | undefined => {
  return accountState.address
}

// Type for the query variables
interface GetBridgesQueryVariables {
  whereSig: UserRequestForSignatureFilter
  whereAff: UserRequestForAffirmationFilter
}

// Type for the query result
interface GetBridgesQueryResult {
  userRequestForSignatures: {
    items: UserRequestForSignature[]
    pageInfo: {
      hasNextPage: boolean
      hasPreviousPage: boolean
      startCursor?: string | null
      endCursor?: string | null
    }
    totalCount: number
  }
  userRequestForAffirmations: {
    items: UserRequestForAffirmation[]
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
  const uniqueTokens = new Set<string>()
  console.log('bridges', bridges)
  bridges.forEach(bridge => {

    // Try to use token relations first, fallback to individual fields
    // Add origination token
    let originationAddress: string | null = null
    let originationChainId: number | null = null

    if (bridge.originationToken?.address && bridge.originationToken?.chainId) {
      originationAddress = bridge.originationToken.address
      originationChainId = Number(bridge.originationToken.chainId)
    } else if (bridge.originationTokenAddress && bridge.originationTokenChainId) {
      originationAddress = bridge.originationTokenAddress
      originationChainId = Number(bridge.originationTokenChainId)
    }

    if (originationAddress && originationChainId) {
      const key = `${originationChainId}:${originationAddress.toLowerCase()}`
      uniqueTokens.add(key)
    }

    // Add destination token if it exists and is different
    let destinationAddress: string | null = null
    let destinationChainId: number | null = null

    if (bridge.destinationToken?.address && bridge.destinationToken?.chainId) {
      destinationAddress = bridge.destinationToken.address
      destinationChainId = Number(bridge.destinationToken.chainId)
    } else if (bridge.destinationTokenAddress && bridge.destinationTokenChainId) {
      destinationAddress = bridge.destinationTokenAddress
      destinationChainId = Number(bridge.destinationTokenChainId)
    }

    if (destinationAddress && destinationChainId &&
      destinationAddress !== originationAddress) {
      const key = `${destinationChainId}:${destinationAddress.toLowerCase()}`
      uniqueTokens.add(key)
    }
  })

  console.log('uniqueTokens', uniqueTokens)
  // Load metadata for each unique token using the cache
  const metadataPromises = Array.from(uniqueTokens).map(async (key) => {
    const [chainIdStr, tokenAddress] = key.split(':')
    const chainId = parseInt(chainIdStr)
    try {
      const metadata = await getTokenMetadata(chainId, tokenAddress)
      return { key, metadata }
    } catch (error) {
      console.error(`Failed to load metadata for ${key}:`, error)
      return { key, metadata: null }
    }
  })

  // Wait for all metadata to load
  const results = await Promise.all(metadataPromises)

  // Store successful results
  results.forEach(({ key, metadata }) => {
    if (metadata) {
      tokenMetadata.set(key, metadata)
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

    // Create filters for both signature and affirmation requests
    const filter: UserRequestForSignatureFilter & UserRequestForAffirmationFilter = {
      OR: [
        { from: account },
        { to: account }
      ]
    }

    const variables: GetBridgesQueryVariables = {
      whereSig: filter,
      whereAff: filter
    }

    try {
      const data = await client.request<GetBridgesQueryResult>(GET_BRIDGES_QUERY, variables)

      // Check if the request was aborted
      if (controller.signal.aborted) {
        return null
      }

      // Sort the arrays
      const sortedSignatures = sortBy(data.userRequestForSignatures.items, [(bridge) => -BigInt(bridge.orderId)])
      const sortedAffirmations = sortBy(data.userRequestForAffirmations.items, [(bridge) => -BigInt(bridge.orderId)])

      // Load token metadata for all bridges
      const allBridges: Bridge[] = [...sortedSignatures, ...sortedAffirmations]
      const tokenMetadata = await loadTokenMetadata(allBridges)

      // Return separate arrays with metadata
      return {
        signatures: sortedSignatures,
        affirmations: sortedAffirmations,
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
    limit: number = 50,
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

      // Sort the arrays
      const sortedSignatures = sortBy(data.userRequestForSignatures.items, [(bridge) => -BigInt(bridge.orderId)])
      const sortedAffirmations = sortBy(data.userRequestForAffirmations.items, [(bridge) => -BigInt(bridge.orderId)])

      // Load token metadata for all bridges
      const allBridges: Bridge[] = [...sortedSignatures, ...sortedAffirmations]
      const tokenMetadata = await loadTokenMetadata(allBridges)

      // Return separate arrays with metadata
      return {
        signatures: sortedSignatures,
        affirmations: sortedAffirmations,
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
