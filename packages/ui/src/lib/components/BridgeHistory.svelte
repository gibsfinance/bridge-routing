<!-- this component shows the bridges that have been triggered by the provided address, on the provided bridge pair -->


<script lang="ts">
  import Icon from '@iconify/svelte'
  import Loader from './Loader.svelte'
  import { loadBridgeTransactions, type Bridge, type BridgeData, type TokenMetadata } from '../stores/history'
  import { accountState, connect } from '../stores/auth/AuthProvider.svelte'
  import { getTokenAddressFromBridge } from '../stores/token-metadata-cache'
  import { uri } from '../stores/toast'
  import { toChain } from '@gibs/bridge-sdk/config'
  import type { Token } from '@gibs/bridge-sdk/types'
  import DirectLink from './DirectLink.svelte'
  import ProviderIcon from './ProviderIcon.svelte'
  import AssetWithNetwork from './AssetWithNetwork.svelte'
  import StaticNetworkImage from './StaticNetworkImage.svelte'
    import { numberWithCommas } from '../stores/utils'
    import type { Hex } from 'viem'

  const walletAccount = $derived(accountState.address)

  // State for bridge data and pagination
  let bridgeData: BridgeData | null = $state(null)
  let isLoading = $state(false)
  let error: string | null = $state(null)
  let currentPage = $state(1)
  let totalPages = $state(1)

  // Load bridge transactions when account changes
  $effect(() => {
    currentPage = 1
    loadPageData()
  })
  let limit = $state<number>(10)
  const pageSizeOptions = [5, 10, 20, 50, 100]

  // Calculate total pages when limit changes
  $effect(() => {
    if (bridgeData?.totalCount) {
      totalPages = Math.ceil(bridgeData.totalCount / limit)
      if (currentPage > totalPages) {
        currentPage = totalPages
      }
    }
  })

  async function loadPageData() {
    isLoading = true
    error = null

    try {
      const params = {
        address: accountState.address as Hex | null | undefined,
        limit: limit,
        after: undefined // We'll implement cursor navigation for specific pages later
      }

      const { promise } = loadBridgeTransactions(params)
      const result = await promise

      if (result) {
        bridgeData = result

        // Calculate total pages
        if (result.totalCount) {
          totalPages = Math.ceil(result.totalCount / limit)
        }
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load bridge transactions'
      console.error('Error loading bridge transactions:', err)
    } finally {
      isLoading = false
    }
  }

  // Page navigation functions
  function goToFirstPage() {
    if (currentPage > 1 && !isLoading) {
      currentPage = 1
      loadPageData()
    }
  }

  function goToPreviousPage() {
    if (currentPage > 1 && !isLoading) {
      currentPage -= 1
      loadPageData()
    }
  }

  function goToNextPage() {
    if (currentPage < totalPages && !isLoading) {
      currentPage += 1
      loadPageData()
    }
  }

  function goToLastPage() {
    if (currentPage < totalPages && !isLoading) {
      currentPage = totalPages
      loadPageData()
    }
  }

  // Change page size function
  function changePageSize(newLimit: number) {
    limit = newLimit
    currentPage = 1 // Reset to first page
    loadPageData()
  }

  // Retry function
  function retryLoad() {
    loadPageData()
  }

  // Helper function to get token metadata
  function getTokenMetadata(bridge: Bridge, tokenMetadata: Map<string, TokenMetadata> | undefined): TokenMetadata | null {
    if (!tokenMetadata) return null

    // Try to get metadata for origination token first (relations or individual fields)
    let originationAddress: string | null = null
    let originationChainId: number | null = null
    // console.log(bridge)
    if (bridge.originationToken?.address && bridge.originationToken?.chainId) {
      originationAddress = bridge.originationToken.address
      originationChainId = Number(bridge.originationToken.chainId)
    } else if (bridge.originationTokenAddress && bridge.originationChainId) {
      originationAddress = bridge.originationTokenAddress
      originationChainId = Number(bridge.originationChainId)
    }

    if (originationAddress && originationChainId) {
      const key = `${originationChainId}:${originationAddress.toLowerCase()}`
      const metadata = tokenMetadata.get(key)
      if (metadata) return metadata
    }

    // Fallback to destination token
    let destinationAddress: string | null = null
    let destinationChainId: number | null = null

    if (bridge.destinationToken?.address && bridge.destinationToken?.chainId) {
      destinationAddress = bridge.destinationToken.address
      destinationChainId = Number(bridge.destinationToken.chainId)
    } else if (bridge.destinationTokenAddress && bridge.destinationChainId) {
      destinationAddress = bridge.destinationTokenAddress
      destinationChainId = Number(bridge.destinationChainId)
    }

    if (destinationAddress && destinationChainId) {
      const key = `${destinationChainId}:${destinationAddress.toLowerCase()}`
      const metadata = tokenMetadata.get(key)
      if (metadata) return metadata
    }

    return null
  }

  // Helper function to get token address for display
  function getTokenAddress(bridge: Bridge): string {
    return bridge.originationToken?.address ||
          //  bridge.destinationToken?.address ||
           bridge.originationTokenAddress ||
          //  bridge.destinationTokenAddress ||
           ''
  }

  // Helper function to get token chain ID for display
  function getTokenChainId(bridge: Bridge): number {
    return Number(
      bridge.originationToken?.chainId ||
      bridge.destinationToken?.chainId ||
      bridge.originationChainId ||
      bridge.destinationChainId ||
      1
    )
  }

  // Helper function to format token amount with decimals
  function formatTokenAmount(amount: string, {decimals}:{decimals: number}): string {
    try {
      const amountBigInt = BigInt(amount)
      const divisor = BigInt(10 ** decimals)
      const wholePart = amountBigInt / divisor
      const fractionalPart = amountBigInt % divisor

      if (fractionalPart === 0n) {
        return wholePart.toString()
      }

      const fractionalStr = fractionalPart.toString().padStart(decimals, '0')
      const trimmed = fractionalStr.replace(/0+$/, '')
      return trimmed ? `${numberWithCommas(wholePart.toString())}.${trimmed}` : numberWithCommas(wholePart.toString())
    } catch (err) {
      console.log('failed to format token amount', err)
      return amount
    }
  }

  // Helper function to create Token object from bridge data
  function createTokenFromBridge(bridge: Bridge, metadata: TokenMetadata | null): Token | null {
    const address = getTokenAddress(bridge)
    const chainId = getTokenChainId(bridge)

    if (!address || !chainId) return null

    return {
      address,
      chainId: chainId,
      symbol: metadata?.symbol || '',
      name: metadata?.name || '',
      decimals: metadata?.decimals || 18,
      logoURI: `https://gib.show/image/${chainId}/${address}`
    }
  }
</script>


<!--
go to the bridge history api endpoint and get the bridges for the provided address and bridge pair
map out the progress of each bridge and display it to the user
-->

<div class="w-full flex flex-col dark:bg-gray-900 bg-gray-50">
<div class="max-w-5xl w-full mx-auto py-8">
  <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 p-0">
    <div class="p-4">
       <div class="flex items-center justify-between">
         <div class="flex items-center space-x-3 w-full">
           <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Bridge History</h2>
           {#if !walletAccount}
            <div class="flex items-center space-x-2 ml-auto">
              <div class="relative group">
                <svg class="w-5 h-5 text-blue-500 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 dark:bg-gray-700 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  Connect your wallet to see your personal bridge history
                  <div class="absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-800 dark:bg-gray-700 rotate-45"></div>
                </div>
              </div>
              <button
                class="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onclick={connect}
              >
                Connect Wallet
              </button>
            </div>
          {/if}
        </div>
      </div>
      <p class="text-gray-600 dark:text-gray-300 text-xs">
        {walletAccount
          ? 'Recent bridge transactions and their status for the connected wallet'
          : 'View recent bridge transactions from all users'
        }
      </p>
    </div>

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
          class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onclick={retryLoad}
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Retry
        </button>
      </div>
    {:else if isLoading}
      <div class="text-center py-12">
        <div class="flex justify-center mb-4 text-gray-700">
          <Loader class="size-8" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Loading Bridge Transactions</h3>
        <p class="text-gray-600 dark:text-gray-300">
          {walletAccount
            ? 'Fetching your bridge history...'
            : 'Fetching recent bridge transactions...'
          }
        </p>
      </div>
    {:else if bridgeData && bridgeData.userRequests.length > 0}
      {#snippet mergedTransactions()}
        <!-- Use userRequests directly, already sorted by orderId -->
        {@const allTransactions = bridgeData?.userRequests || []}

        <div class="space-y-4">

          <!-- Transaction Cards -->
          <div class="gap-2 px-4 flex flex-col">
            {#each allTransactions as bridge (bridge.orderId)}
              {@const metadata = getTokenMetadata(bridge, bridgeData?.tokenMetadata)}
              {@const originChainId = bridge.originationChainId || 'Unknown'}
              {@const destChainId = bridge.destinationChainId || 'Unknown'}
              {@const provider = bridge.originationAMBBridge?.provider || bridge.destinationAMBBridge?.provider || 'Bridge'}
              {@const tokenImage = `https://gib.show/image/${originChainId}/${getTokenAddress(bridge)}`}
              {@const inputToken = createTokenFromBridge(bridge, metadata)}
              <!-- {@const outputToken = createTokenFromBridge(bridge, metadata)} -->

              <div class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full hover:shadow-xs transition-shadow">
                <!-- Section 1: Summary -->
                <div class="flex flex-row gap-2 justify-between">
                  <!-- <h3 class="text-sm font-medium text-gray-500 mb-3">Bridge Summary</h3> -->
                  <div class="flex items-center justify-between gap-2 py-1 px-2">
                    <!-- Input Token -->
                    <div class="flex items-center gap-2">
                      <div class="flex flex-col min-w-0 flex-1 w-48 text-right">
                        <div class="flex items-center space-x-1 truncate justify-end leading-5">
                          <span class="text-lg font-semibold text-gray-900 dark:text-white truncate">
                            {metadata ? formatTokenAmount(bridge.amount, {decimals: metadata.decimals}) : bridge.amount}
                          </span>
                        </div>
                      </div>
                      <span class="text-sm text-gray-600 dark:text-gray-300 truncate w-16">
                        {metadata?.symbol}
                      </span>
                      <AssetWithNetwork
                        asset={inputToken}
                        network={Number(originChainId)}
                        tokenSizeClasses="w-6 h-6"
                        networkSizeClasses="w-3 h-3"
                      />
                      <!-- Transaction link to block explorer -->
                      {#if bridge.transaction?.hash && bridge.transaction?.chainId}
                        <DirectLink
                          path="/tx/{bridge.transaction.hash}"
                          chain={Number(bridge.transaction.chainId)}
                          class="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
                          size={5}
                        />
                      {/if}
                    </div>

                    <!-- Arrow and Chain Flow -->
                    <div class="flex items-center space-x-3 justify-center">
                      <!-- <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg> -->

                      <!-- Origin Chain -->
                      <div class="flex items-center space-x-1 mx-0">
                        <StaticNetworkImage
                          network={Number(originChainId)}
                          sizeClasses="w-5 h-5"
                        />
                        <!-- <span class="text-xs text-gray-500">{originChainId}</span> -->
                      </div>

                      <!-- Provider -->
                      <!-- <div class="px-2 py-1 bg-blue-50 flex items-center justify-center"> -->
                        <!-- <ProviderIcon provider={provider.toLowerCase()} sizeClasses="w-5 h-5" /> -->
                      <!-- </div> -->
                      <Icon icon="jam:chevron-right" class="w-4 h-4 text-gray-400 mx-0" />
                      <!-- Destination Chain -->
                      <div class="flex items-center space-x-1 mx-0">
                        <StaticNetworkImage
                          network={Number(destChainId)}
                          sizeClasses="w-5 h-5"
                        />
                        <!-- <span class="text-xs text-gray-500">{destChainId}</span> -->
                      </div>

                      <!-- <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg> -->
                    </div>

                    <div class="flex items-center space-x-1 truncate justify-end leading-3">
                      <span class="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                        <!-- amount out from the bridge -->
                        {metadata ? formatTokenAmount(bridge.amount, {decimals: metadata.decimals}) : bridge.amount}
                      </span>
                    </div>
                  </div>

                   <!-- Button group justified to the right -->
                   <div class="flex justify-end">
                     <div class="inline-flex shadow-sm rounded-r-full" role="group">
                       <button
                         class="px-3 py-1 bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:z-10 h-full"
                         onclick={() => console.log('clicked')}
                       >
                         Release
                       </button>
                       <div class="relative">
                         <button
                           class="px-2 py-1 bg-blue-600 text-white text-sm rounded-r-full border-l border-blue-500 hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:z-10 h-full w-10"
                           onclick={(event) => {
                             // Toggle dropdown visibility
                             const target = event.currentTarget as HTMLElement;
                             const dropdown = target.nextElementSibling as HTMLElement;
                             if (dropdown) {
                               dropdown.classList.toggle('hidden');
                             }
                           }}
                         >
                           <Icon icon="lucide:chevron-down" class="w-4 h-4" />
                         </button>
                         <div class="hidden absolute right-0 mt-1 w-48 bg-white shadow-lg border border-gray-200 z-50 rounded-xl">
                             <button
                               class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors rounded-xl"
                               onclick={(event) => {
                                 console.log('Option 1 clicked');
                                 const target = event.currentTarget as HTMLElement;
                                 const dropdown = target.closest('.absolute') as HTMLElement;
                                 if (dropdown) {
                                   dropdown.classList.add('hidden');
                                 }
                               }}
                             >
                               Release without Tip
                             </button>
                             <!-- <button
                               class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                               onclick={(event) => {
                                 console.log('Option 2 clicked');
                                 const target = event.currentTarget as HTMLElement;
                                 const dropdown = target.closest('.absolute') as HTMLElement;
                                 if (dropdown) {
                                   dropdown.classList.add('hidden');
                                 }
                               }}
                             >
                               Option 2
                             </button>
                             <button
                               class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                               onclick={(event) => {
                                 console.log('Option 3 clicked');
                                 const target = event.currentTarget as HTMLElement;
                                 const dropdown = target.closest('.absolute') as HTMLElement;
                                 if (dropdown) {
                                   dropdown.classList.add('hidden');
                                 }
                               }}
                             >
                               Option 3
                             </button> -->
                         </div>
                       </div>
                     </div>
                   </div>
                </div>

                <!-- Section 2: Details -->
                <!-- <div class="border-t border-gray-100 pt-4">
                  <h4 class="text-sm font-medium text-gray-500 mb-3">Transaction Details</h4>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div class="text-xs text-gray-500 mb-1">Addresses</div>
                      <div class="space-y-1">
                        <div class="flex items-center space-x-1">
                          <span class="text-xs text-gray-600">From: {bridge.from.slice(0, 6)}...{bridge.from.slice(-4)}</span>
                          {#if bridge.transaction?.chainId}
                            <DirectLink
                              path="/address/{bridge.from}"
                              chain={Number(bridge.transaction.chainId)}
                              class="w-3 h-3 text-gray-400 hover:text-blue-600 transition-colors"
                            />
                          {/if}
                        </div>
                        <div class="flex items-center space-x-1">
                          <span class="text-xs text-gray-600">To: {bridge.to.slice(0, 6)}...{bridge.to.slice(-4)}</span>
                          {#if bridge.transaction?.chainId}
                            <DirectLink
                              path="/address/{bridge.to}"
                              chain={Number(bridge.transaction.chainId)}
                              class="w-3 h-3 text-gray-400 hover:text-blue-600 transition-colors"
                            />
                          {/if}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div class="text-xs text-gray-500 mb-1">Time</div>
                      {#if bridge.block?.timestamp}
                        <div class="text-xs text-gray-600">
                          {new Date(Number(bridge.block.timestamp) * 1000).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      {:else}
                        <div class="text-xs text-gray-400">-</div>
                      {/if}
                    </div>

                    <div>
                      <div class="text-xs text-gray-500 mb-1">Transaction</div>
                      {#if bridge.transaction?.hash && bridge.transaction?.chainId}
                        <div class="flex items-center space-x-2">
                          <span class="text-xs text-gray-600">{bridge.transaction.hash.slice(0, 8)}...{bridge.transaction.hash.slice(-6)}</span>
                          <DirectLink
                            path="/tx/{bridge.transaction.hash}"
                            chain={Number(bridge.transaction.chainId)}
                            class="w-4 h-4 text-gray-400 hover:text-blue-600 transition-colors"
                          />
                        </div>
                      {:else}
                        <div class="text-xs text-gray-400">-</div>
                      {/if}
                    </div>
                  </div>

                  <div class="mt-3 pt-3 border-t border-gray-100">
                    <div class="flex items-center space-x-2">
                      <div class="w-2 h-2 rounded-full {bridge.type === 'signature' ? 'bg-blue-500' : 'bg-green-500'}"></div>
                      <span class="text-xs font-medium {bridge.type === 'signature' ? 'text-blue-600' : 'text-green-600'}">
                        {bridge.type === 'signature' ? 'Signature Request' : 'Affirmation Request'}
                      </span>
                      <span class="text-xs text-gray-500">#{bridge.orderId}</span>
                    </div>
                  </div>
                </div> -->
              </div>
            {/each}
          </div>

          <!-- Pagination Controls and Page Size Selector -->
          <div class="border-t border-gray-100 dark:border-gray-600 py-4 px-4">
            <div class="flex items-center justify-between flex-wrap gap-4">
              <!-- Page Size Selector (left side) -->
              <div class="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                <span>Showing</span>
                <select
                  class="pl-2 pr-8 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white dark:bg-gray-700 dark:text-white"
                  value={limit}
                  onchange={(e) => changePageSize(Number((e.target as HTMLSelectElement).value))}
                >
                  {#each pageSizeOptions as option}
                    <option value={option}>{option}</option>
                  {/each}
                </select>
                <span>of</span>
                {#if bridgeData?.totalCount}
                  <span class="font-medium">{bridgeData.totalCount}</span>
                  <span>bridge{bridgeData.totalCount !== 1 ? 's' : ''}</span>
                {/if}
              </div>

              <!-- Pagination Navigation (right side) -->
              {#if totalPages > 1}
                <div class="flex items-center space-x-1">
                  <!-- First Page (double chevron left) -->
                  <button
                    class="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
                    onclick={goToFirstPage}
                    disabled={currentPage === 1 || isLoading}
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
                    disabled={currentPage === 1 || isLoading}
                    aria-label="Previous page"
                    title="Previous page"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <!-- Page Info -->
                  <div class="px-3 py-1 text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {currentPage} of {totalPages}
                  </div>

                  <!-- Next Page (single chevron right) -->
                  <button
                    class="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
                    onclick={goToNextPage}
                    disabled={currentPage === totalPages || isLoading}
                    aria-label="Next page"
                    title="Next page"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <!-- Last Page (double chevron right) -->
                  <button
                    class="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
                    onclick={goToLastPage}
                    disabled={currentPage === totalPages || isLoading}
                    aria-label="Last page"
                    title="Last page"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/snippet}

      {@render mergedTransactions()}
    {:else}
      <div class="text-center py-12">
        <div class="text-gray-400 dark:text-gray-500 mb-4">
          <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Bridge Transactions</h3>
        <p class="text-gray-600 dark:text-gray-300">
          {walletAccount
            ? 'No bridge transactions found for this address. Try making a bridge transaction or check a different address.'
            : 'No recent bridge transactions found. Try refreshing or check back later.'
          }
        </p>
      </div>
    {/if}
  </div>
</div>
</div>
