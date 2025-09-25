<!-- this component shows the bridges that have been triggered by the provided address, on the provided bridge pair -->


<script lang="ts">
  import * as abis from '@gibs/bridge-sdk/abis'
  import { packSignatures, signatureToVRS } from '../stores/messages'
  import * as transactions from '../stores/transactions'
  import type { TokenMetadata } from '@gibs/bridge-sdk/types'
  import { formatTokenAmount } from '../stores/utils'
  import Icon from '@iconify/svelte'
  import Loader from './Loader.svelte'
  import { loadBridgeTransactions, type BridgeData } from '../stores/history'
  import type { UserRequest } from '../gql/graphql'
  import { accountState } from '../stores/auth/AuthProvider.svelte'
  import type { BridgeKey, Token } from '@gibs/bridge-sdk/types'
  import DirectLink from './DirectLink.svelte'
  import AssetWithNetwork from './AssetWithNetwork.svelte'
  import StaticNetworkImage from './StaticNetworkImage.svelte'
  import InfoTooltip from './InfoTooltip.svelte'
  import Tooltip from './Tooltip.svelte'
  import { numberWithCommas, bridgeETA } from '../stores/utils'
  import { zeroAddress, type Hex, isAddress, encodeFunctionData, isHex } from 'viem'
  import ConnectButton from './ConnectButton.svelte'
  import { blocks, latestBlock, bridgeStatuses, type ContinuedLiveBridgeStatusParams, finalizedBlock } from '../stores/chain-events.svelte'
  import * as imageLinks from '@gibs/bridge-sdk/image-links'
  import { HOME_TO_FOREIGN_FEE, FOREIGN_TO_HOME_FEE, Chains, pathway, toChain } from '@gibs/bridge-sdk/config'
  import { oneEther } from '@gibs/bridge-sdk/settings'
  import { chainsMetadata } from '@gibs/bridge-sdk/chains'
  import { loading } from '../stores/loading.svelte'
    import BridgeHistoryItem from './BridgeHistoryItem.svelte'

  const payMe = 'images/pay-me-isolated.png'

  // const walletAccount = $derived(accountState.address)
  const walletAccount = $derived(accountState.address)
  $inspect(walletAccount)

  // Manual address input state
  let manualAddressInput = $state('')
  let manualAddress = $state<string | null>(null)
  let manualAddressCleared = $state(false) // Track if user explicitly cleared the address
  let addressInputRef = $state<HTMLInputElement>()

  // Manual hash input state
  let manualHash = $state<string | null>(null)
  let manualHashCleared = $state(false) // Track if user explicitly cleared the hash

  // Track previous wallet account to detect changes
  let previousWalletAccount = $state<string | null>(accountState.address)

  // Effect to detect wallet address changes and override manual address
  $effect(() => {
    if (walletAccount !== previousWalletAccount) {
      // Wallet address changed - override manual address if wallet is connected
      if (walletAccount) {
        // manualAddress = walletAccount
        manualAddressCleared = false // Reset cleared flag when wallet connects
        manualHashCleared = false // Also reset hash cleared flag
        currentPage = 1
        currentCursor = undefined // Reset cursor when flipping to page 1
        currentDirection = 'first'
        retryCounter++ // Increment to trigger fresh data fetch
      }
      previousWalletAccount = walletAccount
    }
  })
  // $inspect('manualAddressCleared', manualAddressCleared)

  // Derived address - use manual address as primary, fallback to wallet if no manual address
  // But if user explicitly cleared the address, show all bridges (null)
  const activeAddress = $derived(
    manualAddressCleared ? null : (manualAddress || walletAccount)
  )

  // Derived hash - use manual hash if provided and not cleared
  const activeHash = $derived(
    manualHashCleared ? null : manualHash
  )

  // Helper function to validate if input is a bytes32 hash (0x + 64 hex chars)
  function isBytes32Hash(input: string): boolean {
    return isHex(input) && input.length === 66 // 0x + 64 chars
  }

  // State for bridge data and pagination
  let bridgeData: BridgeData | null = $state(null)

  $inspect(bridgeData)
  let error: string | null = $state(null)
  let currentPage = $state(1)
  // let totalPages = $state(1)
  let retryCounter = $state(0)
  const isLoading = $derived(!loading.isResolved('bridges'))

  // Toggle state for filtering between "all" and "pending"
  let filterMode: 'all' | 'pending' = $state('all')

  let limit = $state<number>(10)
  const pageSizeOptions = [5, 10, 20, 50, 100, 1000]

  const totalPages = $derived.by(() => Math.ceil((bridgeData?.totalCount ?? 0) / limit))
  // Calculate total pages when limit changes
  // Reset to valid page when totalPages changes
  $effect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      currentPage = totalPages
    }
  })

  // Set up block tracking for chains we need for ETA calculations
  $effect(() => {
    // Track latest blocks for common chains used in bridges
    for (const chainId of Object.values(Chains)) {
      latestBlock(Number(chainId))
      finalizedBlock(Number(chainId))
    }
  })

  // Background refresh timer - refresh data every 15 seconds
  $effect(() => {
    const intervalId = setInterval(() => {
      // Only do background refresh if we have data and are not currently loading
      if (bridgeData && !isLoading) {
        console.log('triggering background refresh')
        isBackgroundRefresh = true
        retryCounter++
      }
    }, 15000) // 15 seconds

    return () => clearInterval(intervalId)
  })

  // Track request state for UI purposes
  // let requestInProgress = $state<boolean>(false)
  let isBackgroundRefresh = $state<boolean>(false) // Track if this is a background refresh
  // $inspect(refreshDisabled, manualAddressCleared , manualAddress, walletAccount)

  // Pagination cursor state
  let currentCursor = $state<string | undefined>(undefined)
  let currentDirection = $state<'forward' | 'backward' | 'first'>('first')

  const loadBridgeParams = $derived.by(() => ({
    address: (activeAddress?.toLowerCase() ?? null) as Hex | null | undefined,
    hash: activeHash as Hex | null | undefined,
    limit,
    after: currentDirection === 'forward' ? currentCursor : undefined,
    before: currentDirection === 'backward' ? currentCursor : undefined,
    filterMode,
  }))

  // Load bridge data when parameters change or retryCounter changes
  $effect(() => {
    // Track retryCounter to trigger refreshes, but don't pass it to the data function
    const currentRetryCounter = retryCounter

    const result = loadBridgeTransactions({ ...loadBridgeParams })
    result.promise.then((result) => {
      bridgeData = result
    }).catch((err) => {
      error = err instanceof Error ? err.message : 'Failed to load bridge transactions'
    }).finally(() => {
      isBackgroundRefresh = false
    })
    return result.cleanup
  })

  // Cursor navigation functions
  function goToFirstPage() {
    if (!isLoading) {
      currentCursor = undefined
      currentDirection = 'first'
      currentPage = 1 // Reset page counter for display
      retryCounter++ // Trigger data fetch to ensure fresh data
    }
  }

  function goToPreviousPage() {
    if (bridgeData?.pageInfo?.hasPreviousPage && !isLoading) {
      currentCursor = bridgeData.pageInfo.startCursor || undefined
      currentDirection = 'backward'
      if (currentPage > 1) currentPage -= 1
    }
  }

  function goToNextPage() {
    if (bridgeData?.pageInfo?.hasNextPage && !isLoading) {
      currentCursor = bridgeData.pageInfo.endCursor || undefined
      currentDirection = 'forward'
      currentPage += 1
    }
  }

  // function goToLastPage() {
  //   // Note: GraphQL cursor pagination doesn't support "go to last page" directly
  //   // We would need to implement this differently or remove this functionality
  //   console.log('Go to last page not supported with cursor pagination')
  // }

  // Change page size function
  function changePageSize(newLimit: number) {
    limit = newLimit
    currentPage = 1 // Reset to first page
    currentCursor = undefined // Reset cursor
    currentDirection = 'first'
    retryCounter++
  }

  // Retry function
  function retryLoad() {
    retryCounter++
  }

  // Input handling functions
  function handleAddressInput() {
    const trimmedInput = manualAddressInput.trim()
    if (trimmedInput && isAddress(trimmedInput)) {
      manualAddress = trimmedInput
      manualAddressCleared = false // Reset the cleared flag when setting a new address
      manualAddressInput = ''
      currentPage = 1 // Reset to first page when address changes
      currentCursor = undefined // Reset cursor
      currentDirection = 'first'
      retryCounter++
    } else if (trimmedInput && isBytes32Hash(trimmedInput)) {
      manualHash = trimmedInput
      manualHashCleared = false // Reset the cleared flag when setting a new hash
      manualAddressInput = ''
      currentPage = 1 // Reset to first page when hash changes
      currentCursor = undefined // Reset cursor
      currentDirection = 'first'
      retryCounter++
    }
  }

  function handleAddressKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleAddressInput()
    }
  }

  function clearManualAddress() {
    manualAddress = null
    manualAddressCleared = true // Mark that user explicitly cleared the address
    currentPage = 1 // Reset to first page when address is cleared
    currentCursor = undefined // Reset cursor
    currentDirection = 'first'
    retryCounter++
  }

  function clearManualHash() {
    manualHash = null
    manualHashCleared = true // Mark that user explicitly cleared the hash
    currentPage = 1 // Reset to first page when hash is cleared
    currentCursor = undefined // Reset cursor
    currentDirection = 'first'
    retryCounter++
  }

  const bridgeToKey = (bridge: UserRequest) => {
    return [bridge.originationAMBBridge?.provider, toChain(bridge.originationChainId), toChain(bridge.destinationChainId)] as BridgeKey
  }

  // /**
  //  * Convert historical bridge data to bridge status format for calculateETA
  //  */
  // function createBridgeStatusFromHistory(bridge: UserRequest): ContinuedLiveBridgeStatusParams | null {
  //   // If bridge is not yet signed, it's still in validation
  //   const bridgeKey = bridgeToKey(bridge)
  //   const hash = bridge.transaction!.hash as Hex
  //   const receipt = {
  //     blockNumber: BigInt(bridge.block!.number!),
  //     transactionHash: hash,
  //     // blockHash: bridge.transaction?.blockHash,
  //     // transactionIndex: bridge.transaction?.index,
  //   }
  //   const fBlock = blocks.get(Number(bridge.originationChainId!))?.get('finalized')?.block
  //   if (!fBlock) {
  //     return null
  //   }
  //   const finalizedBlock = { number: fBlock.number! }
  //   if (!bridge.finishedSigning) {
  //     return {
  //       receipt,
  //       hash,
  //       ticker: { number: 0n } as any, // Placeholder - not used for pending status
  //       bridgeKey,
  //       status: bridgeStatuses.MINED,
  //       statusIndex: 1,
  //       finalizedBlock,
  //     }
  //   }

  //   // If signed but not delivered, it's finalized and ready for delivery
  //   if (bridge.finishedSigning && !bridge.delivered) {
  //     return {
  //       receipt,
  //       hash,
  //       ticker: { number: 0n } as any,
  //       bridgeKey,
  //       status: bridgeStatuses.AFFIRMED,
  //       statusIndex: 2,
  //       finalizedBlock,
  //     }
  //   }

  //   // If delivered, it's affirmed/complete
  //   if (bridge.delivered) {
  //     return {
  //       receipt,
  //       hash,
  //       ticker: { number: 0n } as any,
  //       bridgeKey,
  //       status: bridgeStatuses.DELIVERED,
  //       statusIndex: 4,
  //       finalizedBlock,
  //     }
  //   }

  //   return null
  // }

  // // Helper function to get token metadata
  // function getTokenMetadata(bridge: UserRequest, tokenMetadata: Map<string, TokenMetadata> | undefined): TokenMetadata | null {
  //   if (!tokenMetadata) return null

  //   // Try to get metadata for origination token first (relations or individual fields)
  //   let originationAddress: string | null = null
  //   let originationChainId: number | null = null
  //   if (bridge.originationToken?.address && bridge.originationToken?.chainId) {
  //     originationAddress = bridge.originationToken.address
  //     originationChainId = Number(bridge.originationToken.chainId)
  //   } else if (bridge.originationTokenAddress && bridge.originationChainId) {
  //     originationAddress = bridge.originationTokenAddress
  //     originationChainId = Number(bridge.originationChainId)
  //   }

  //   if (originationAddress && originationChainId) {
  //     const key = `${originationChainId}:${originationAddress.toLowerCase()}`
  //     const metadata = tokenMetadata.get(key)
  //     if (metadata) return metadata
  //   }

  //   // Fallback to destination token
  //   let destinationAddress: string | null = null
  //   let destinationChainId: number | null = null

  //   if (bridge.destinationToken?.address && bridge.destinationToken?.chainId) {
  //     destinationAddress = bridge.destinationToken.address
  //     destinationChainId = Number(bridge.destinationToken.chainId)
  //   } else if (bridge.destinationTokenAddress && bridge.destinationChainId) {
  //     destinationAddress = bridge.destinationTokenAddress
  //     destinationChainId = Number(bridge.destinationChainId)
  //   }

  //   if (destinationAddress && destinationChainId) {
  //     const key = `${destinationChainId}:${destinationAddress.toLowerCase()}`
  //     const metadata = tokenMetadata.get(key)
  //     if (metadata) return metadata
  //   }

  //   return null
  // }

  // // Helper function to get token address for display
  // function getTokenAddress(bridge: UserRequest): string {
  //   return bridge.originationToken?.address ||
  //         //  bridge.destinationToken?.address ||
  //          bridge.originationTokenAddress ||
  //         //  bridge.destinationTokenAddress ||
  //          ''
  // }

  // // Helper function to get token chain ID for display
  // function getTokenChainId(bridge: UserRequest): number {
  //   return Number(
  //     bridge.originationToken?.chainId ||
  //     bridge.destinationToken?.chainId ||
  //     bridge.originationChainId ||
  //     bridge.destinationChainId ||
  //     1
  //   )
  // }

</script>


<!--
go to the bridge history api endpoint and get the bridges for the provided address and bridge pair
map out the progress of each bridge and display it to the user
-->

<div class="w-full flex flex-col dark:bg-surface-950 bg-gray-50">
<div class="max-w-5xl w-full mx-auto py-8">
  <div class="bg-white dark:bg-slate-950 lg:rounded-3xl shadow-lg border-y md:border border-surface-200 dark:border-surface-800 p-0 text-surface-contrast-50 dark:text-surface-contrast-950">
    <div class="flex items-center justify-between px-2 md:px-4 pt-4 md:pb-2">
      <div class="flex gap-4 w-full justify-start">
        <div class="flex lg:static absolute gap-2 items-center">
          <h2 class="text-4xl font-bold font-italiana">History</h2>
          <InfoTooltip
            text={activeAddress
              ? 'Recent bridge transactions and their status for the specified address'
              : 'View recent bridge transactions from all users'
            }
            iconSize={5}
            iconColor="text-surface-500"
            placement="top"
          />
          <!-- Filter Toggle Switch -->
          <button
            class="relative inline-flex h-8 w-14 items-center rounded-full bg-surface-200 dark:bg-surface-700 transition-colors focus:outline-none focus:ring focus:ring-surface-500 {filterMode === 'pending' ? 'bg-surface-500 dark:bg-surface-600' : ''}"
            onclick={() => filterMode = filterMode === 'all' ? 'pending' : 'all'}
            title={filterMode === 'all' ? 'Switch to pending transactions' : 'Switch to all transactions'}
          >
            <span class="sr-only">Toggle filter mode</span>
            <span
              class="h-6 w-6 transform rounded-full bg-white dark:bg-surface-100 shadow-lg transition-transform duration-200 ease-in-out flex items-center justify-center {filterMode === 'pending' ? 'translate-x-7' : 'translate-x-1'}"
            >
              <Icon icon={filterMode === 'all' ? 'lucide:list' : 'lucide:clock'} class="w-4 h-4 text-surface-600" />
            </span>
          </button>
          <!-- Background refresh spinner -->
          {#if isBackgroundRefresh}
            <div class="flex items-center" title="Refreshing data...">
              <Loader class="size-4 text-surface-500" />
            </div>
          {/if}
        </div>
        <!-- {#if !walletAccount} -->
        <!-- Large screens: inline layout -->
        <div class="flex flex-col lg:flex-row-reverse justify-end flex-grow items-center gap-2">
          <div class="flex items-center gap-2 ml-auto lg:ml-0">
            <button
              class="flex items-center justify-center w-8 h-8 rounded-full bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 transition-colors focus:outline-none focus:ring-2 focus:ring-surface-500 focus:ring-offset-2"
              onclick={() => {
                isBackgroundRefresh = false // Ensure manual refresh shows overlay
                retryCounter++
              }}
              title="Reload page"
            >
              <Icon icon="lucide:refresh-cw" class="w-4 h-4 text-surface-600 dark:text-surface-400" />
            </button>
            <!-- <InfoTooltip
              text="Connect your wallet to see your personal bridge history, or enter any address or hash (transaction hash, message ID, or message hash) to search for specific transactions"
              placement="top"
              iconSize={5}
              maxWidth="max-w-96"
              iconColor="text-surface-500"
            /> -->
            <ConnectButton />
          </div>
          <div class="gap-2 ml-auto flex flex-col md:flex-row-reverse items-end md:items-center">
            <!-- Address input field -->
            <div class="flex items-center gap-2">
            <div class="relative flex flex-grow justify-end h-10">
              <input
                bind:this={addressInputRef}
                bind:value={manualAddressInput}
                onkeydown={handleAddressKeydown}
                placeholder="Address or tx hash..."
                class="pl-3 pr-10 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-full focus:ring focus:ring-surface-500 focus:border-surface-500 bg-white dark:bg-surface-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 min-w-40 h-full"
                type="text"
              />
            {#if manualAddressInput.trim() && !isAddress(manualAddressInput.trim()) && !isBytes32Hash(manualAddressInput.trim())}
              <Tooltip placement="top" positionerClassName="z-50">
                {#snippet trigger()}
                  <button
                    onclick={handleAddressInput}
                    disabled={true}
                    class="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full disabled:border-gray-300 dark:disabled:border-gray-600 disabled:text-gray-500 dark:disabled:text-gray-300 transition-colors flex items-center justify-center disabled:cursor-not-allowed"
                    aria-label="Invalid input"
                  >
                    <Icon icon="lucide:help-circle" class="w-5 h-5" />
                  </button>
                {/snippet}
                {#snippet content()}
                  Invalid address or hash
                {/snippet}
              </Tooltip>
            {:else}
              <button
                onclick={handleAddressInput}
                disabled={!manualAddressInput.trim()}
                class="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-2 dark:border-surface-600 border-surface-500 hover:border-surface-600 dark:hover:border-surface-600 disabled:border-gray-300 dark:disabled:border-gray-600 text-white disabled:text-gray-500 dark:disabled:text-gray-300 transition-colors flex items-center justify-center disabled:cursor-not-allowed"
                aria-label="Submit input"
              >
                <Icon icon="lucide:arrow-up" class="w-5 h-5" />
              </button>
            {/if}
            </div>
            </div>
            <div class="flex items-center gap-2 justify-start">
            <!-- Manual hash badge (shown when hash is set, appears before address badge) -->
            {#if activeHash}
              <div class="flex items-center bg-blue-100 dark:bg-blue-700 text-blue-900 dark:text-blue-300 rounded-full text-sm overflow-hidden h-8 border border-blue-200 dark:border-blue-800">
                <span class="px-3 py-1">
                  ...{activeHash.slice(-8)}
                </span>
                <button
                  onclick={clearManualHash}
                  class="px-2 py-0 h-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors border-l border-blue-200 dark:border-blue-900 text-blue-500 hover:text-blue-700 dark:hover:text-blue-200"
                  aria-label="Clear hash"
                >
                  <Icon icon="lucide:x" class="w-4 h-4" />
                </button>
              </div>
            {/if}

            <!-- Manual address badge (shown when address is set) -->
            {#if activeAddress}
              <div class="flex items-center bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-300 rounded-full text-sm overflow-hidden h-8 border border-surface-200 dark:border-surface-800">
                <span class="px-3 py-1">
                  {activeAddress.slice(0, 2+4)}...{activeAddress.slice(-4)}
                </span>
                <button
                  onclick={clearManualAddress}
                  class="px-2 py-0 h-full hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors border-l border-surface-200 dark:border-surface-900 text-surface-500 hover:text-surface-700 dark:hover:text-surface-200"
                  aria-label="Clear address"
                >
                  <Icon icon="lucide:x" class="w-4 h-4" />
                </button>
              </div>
            {/if}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Global Content Container with Loading Overlay -->
    <div class="relative">
      {#if error}
      <div class="text-center py-12">
        <div class="text-red-400 mb-4">
          <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Bridge History</h3>
        <p class="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
        <button
          class="inline-flex items-center px-4 py-2 bg-surface-600 text-white hover:bg-surface-700 transition-colors focus:ring focus:ring-surface-500 focus:ring-offset-2 rounded-full"
          onclick={retryLoad}
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Retry
        </button>
      </div>
    {:else if bridgeData && bridgeData.userRequests.length > 0}
      {#snippet mergedTransactions()}
        <!-- Use userRequests directly, already sorted by orderId and filtered by backend -->
        {@const allTransactions = bridgeData?.userRequests || []}

        {#if allTransactions.length > 0}
          <div class="flex flex-col gap-2 h-124 py-2 overflow-y-auto custom-scrollbar">
            <!-- Transaction Cards -->
            <div class="gap-2 md:px-4 px-0 flex flex-col">
              {#each allTransactions as bridge (bridge.orderId)}
              <BridgeHistoryItem
                bridge={bridge}
                tokenMetadata={bridgeData?.tokenMetadata ?? new Map<string, TokenMetadata>()}
                feeData={bridgeData?.feeData ?? []} />
              {/each}
            </div>
          </div>
        {:else}
          <!-- No filtered transactions state -->
          <div class="text-center py-12 h-124">
            <div class="text-gray-400 dark:text-gray-500 mb-4">
              <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No {filterMode === 'pending' ? 'Pending' : ''} Bridge Transactions</h3>
            <p class="text-gray-600 dark:text-gray-300">
              {#if filterMode === 'pending'}
                No pending bridge transactions found. All transactions appear to be completed.
              {:else}
                No bridge transactions found.
              {/if}
            </p>
          </div>
        {/if}
      {/snippet}

        {@render mergedTransactions()}
      {:else}
        <!-- No Data State - hidden during loading to avoid confusion -->
        <div class="text-center py-12 h-124 transition-opacity duration-200" class:opacity-0={isLoading}>
          <div class="text-gray-400 dark:text-gray-500 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Bridge Transactions</h3>
          <p class="text-gray-600 dark:text-gray-300">
            {#if activeAddress}
              <span>No bridge transactions found for {activeAddress.slice(0, (2+6))}...{activeAddress.slice(-6)}.
                <br>Try making a bridge transaction or check a different address.
              </span>
            {:else}
              No recent bridge transactions found. Try refreshing or check back later.
            {/if}
          </p>
        </div>
      {/if}

      <!-- Global Loading Overlay - appears over ANY content when loading -->
      {#if isLoading && !isBackgroundRefresh}
        <div class="absolute inset-0 bg-white/20 dark:bg-surface-950/20 backdrop-blur-[2px] flex items-center justify-center z-10 rounded-lg">
          <div class="text-center">
            <div class="flex justify-center mb-4 text-gray-700 dark:text-gray-300">
              <Loader class="size-8" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 text-shadow-sm dark:text-white dark:text-shadow-sm dark:text-shadow-black mb-2">Loading Bridge Transactions</h3>
            <p class="text-gray-600 dark:text-gray-300">
              {activeAddress
                ? `Fetching bridge history for ${activeAddress.slice(0, (2+6))}...${activeAddress.slice(-6)}`
                : 'Fetching bridge transactions...'
              }
            </p>
          </div>
        </div>
      {/if}
    </div>

    <!-- Pagination Controls and Page Size Selector (always visible) -->
    <div class="border-t border-surface-200 dark:border-surface-800 py-4 px-4">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <!-- Page Size Selector (left side) -->
        <div class="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
          <select
            class="pl-2 pr-8 py-1 text-sm rounded-md ring ring-surface-200 dark:ring-surface-700 border-none bg-white hover:bg-surface-50 dark:bg-surface-900 hover:dark:bg-surface-800 dark:text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            value={limit}
            onchange={(e) => changePageSize(Number((e.target as HTMLSelectElement).value))}
          >
            {#each pageSizeOptions as option}
              <option value={option}>{option}</option>
            {/each}
          </select>
          <span>of</span>
          {#if bridgeData?.totalCount}
            <span class="font-medium">{formatTokenAmount(bridgeData.totalCount.toString(), { decimals: 0 })}</span>
          {:else if isLoading}
            <span class="font-medium animate-pulse">...</span>
          {:else}
            <span class="font-medium">0</span>
          {/if}
        </div>

        <!-- Pagination Navigation (right side) -->
        <div class="flex items-center space-x-1">
          <!-- First Page (double chevron left) -->
          <button
            class="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
            onclick={goToFirstPage}
            disabled={!bridgeData?.pageInfo?.hasPreviousPage || isLoading}
            aria-label="First page"
            title="First page"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>

          <!-- Previous Page (single chevron left) -->
          <button
            class="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
            onclick={goToPreviousPage}
            disabled={!bridgeData?.pageInfo?.hasPreviousPage || isLoading}
            aria-label="Previous page"
            title="Previous page"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <!-- Page Info -->
          <div class="px-3 py-1 text-sm text-gray-700 dark:text-gray-300 font-medium">
            {#if !isLoading && !bridgeData}
              <span class="animate-pulse">... of ...</span>
            {:else}
              {formatTokenAmount(currentPage.toString(), { decimals: 0 })} of {formatTokenAmount(totalPages.toString(), { decimals: 0 })}
            {/if}
          </div>

          <!-- Next Page (single chevron right) -->
          <button
            class="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
            onclick={goToNextPage}
            disabled={!bridgeData?.pageInfo?.hasNextPage || isLoading}
            aria-label="Next page"
            title="Next page"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <!-- Last Page (double chevron right) -->
          <!-- <button
            class="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
            onclick={goToLastPage}
            disabled={currentPage === totalPages || isLoading || totalPages <= 1}
            aria-label="Last page"
            title="Last page"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button> -->
        </div>
      </div>
    </div>
  </div>
</div>
</div>
