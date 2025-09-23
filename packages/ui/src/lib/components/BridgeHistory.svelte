<!-- this component shows the bridges that have been triggered by the provided address, on the provided bridge pair -->


<script lang="ts">
  import Icon from '@iconify/svelte'
  import Loader from './Loader.svelte'
  import { loadBridgeTransactions, type BridgeData, type TokenMetadata } from '../stores/history'
  import type { UserRequest } from '../gql/graphql'
  import { accountState, connect } from '../stores/auth/AuthProvider.svelte'
  import type { Token } from '@gibs/bridge-sdk/types'
  import DirectLink from './DirectLink.svelte'
  import AssetWithNetwork from './AssetWithNetwork.svelte'
  import StaticNetworkImage from './StaticNetworkImage.svelte'
  import InfoTooltip from './InfoTooltip.svelte'
  import Tooltip from './Tooltip.svelte'
  import { numberWithCommas } from '../stores/utils'
  import { zeroAddress, type Hex, isAddress } from 'viem'
  import ConnectButton from './ConnectButton.svelte'
  import * as imageLinks from '@gibs/bridge-sdk/image-links'
  import { HOME_TO_FOREIGN_FEE, FOREIGN_TO_HOME_FEE, Chains } from '@gibs/bridge-sdk/config'
  import { oneEther } from '@gibs/bridge-sdk/settings'
    import { chainsMetadata } from '@gibs/bridge-sdk/chains'
    const payMe = 'images/pay-me-isolated.png'

  // const walletAccount = $derived(accountState.address)
  const walletAccount = $derived(accountState.address)
  $inspect(walletAccount)

  // Manual address input state
  let manualAddressInput = $state('')
  let manualAddress = $state<string | null>(null)
  let manualAddressCleared = $state(false) // Track if user explicitly cleared the address
  let addressInputRef = $state<HTMLInputElement>()

  // Track previous wallet account to detect changes
  let previousWalletAccount = $state<string | null>(null)

  // Effect to detect wallet address changes and override manual address
  $effect(() => {
    if (walletAccount !== previousWalletAccount) {
      // Wallet address changed - override manual address if wallet is connected
      if (walletAccount) {
        manualAddress = walletAccount
        manualAddressCleared = false // Reset cleared flag when wallet connects
      }
      previousWalletAccount = walletAccount
    }
  })

  // Derived address - use manual address as primary, fallback to wallet if no manual address
  // But if user explicitly cleared the address, show all bridges (null)
  const activeAddress = $derived(
    manualAddressCleared ? null : (manualAddress || walletAccount)
  )

  // State for bridge data and pagination
  let bridgeData: BridgeData | null = $state(null)
  // $inspect(bridgeData)
  let isLoading = $state(false)
  let error: string | null = $state(null)
  let currentPage = $state(1)
  // let totalPages = $state(1)
  let retryCounter = $state(0)

  // Toggle state for filtering between "all" and "pending"
  let filterMode: 'all' | 'pending' = $state('all')

  // Load bridge transactions when account changes
  $effect(() => {
    currentPage = 1
    // loadPageData()
  })
  let limit = $state<number>(10)
  const pageSizeOptions = [5, 10, 20, 50, 100]

  const totalPages = $derived.by(() => Math.ceil((bridgeData?.totalCount ?? 0) / limit))
  // Calculate total pages when limit changes
  // Reset to valid page when totalPages changes
  $effect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      currentPage = totalPages
    }
  })


  $effect(() => {
    // Track reactive dependencies: activeAddress, limit, currentPage, retryCounter
    const currentActiveAddress = activeAddress
    const currentLimit = limit
    const currentCurrentPage = currentPage
    const currentRetryCounter = retryCounter

    isLoading = true
    error = null

    const params = {
      address: currentActiveAddress as Hex | null | undefined,
      limit: currentLimit,
      after: undefined // We'll implement cursor navigation for specific pages later
    }

    const { promise, cleanup } = loadBridgeTransactions(params)
    promise.then((result) => {
      if (result) {
        bridgeData = result
      }
    }).catch((err) => {
      error = err instanceof Error ? err.message : 'Failed to load bridge transactions'
      console.error('Error loading bridge transactions:', err)
    }).finally(() => {
      isLoading = false
    })
    return cleanup
  })

  // Page navigation functions
  function goToFirstPage() {
    if (currentPage > 1 && !isLoading) {
      currentPage = 1
      retryCounter++
      // loadPageData()
    }
  }

  function goToPreviousPage() {
    if (currentPage > 1 && !isLoading) {
      currentPage -= 1
    }
  }

  function goToNextPage() {
    if (currentPage < totalPages && !isLoading) {
      currentPage += 1
    }
  }

  function goToLastPage() {
    if (currentPage < totalPages && !isLoading) {
      currentPage = totalPages
      retryCounter++
    }
  }

  // Change page size function
  function changePageSize(newLimit: number) {
    limit = newLimit
    currentPage = 1 // Reset to first page
    retryCounter++
  }

  // Retry function
  function retryLoad() {
    retryCounter++
  }

  // Address input handling functions
  function handleAddressInput() {
    const trimmedInput = manualAddressInput.trim()
    if (trimmedInput && isAddress(trimmedInput)) {
      manualAddress = trimmedInput
      manualAddressCleared = false // Reset the cleared flag when setting a new address
      manualAddressInput = ''
      currentPage = 1 // Reset to first page when address changes
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
    retryCounter++
  }

  // Helper function to get token metadata
  function getTokenMetadata(bridge: UserRequest, tokenMetadata: Map<string, TokenMetadata> | undefined): TokenMetadata | null {
    if (!tokenMetadata) return null

    // Try to get metadata for origination token first (relations or individual fields)
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
  function getTokenAddress(bridge: UserRequest): string {
    return bridge.originationToken?.address ||
          //  bridge.destinationToken?.address ||
           bridge.originationTokenAddress ||
          //  bridge.destinationTokenAddress ||
           ''
  }

  // Helper function to get token chain ID for display
  function getTokenChainId(bridge: UserRequest): number {
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
      const wholePartInt = amountBigInt / divisor
      const fractionalPart = amountBigInt % divisor
      const wholePart = numberWithCommas(wholePartInt.toString())
      if (fractionalPart === 0n) {
        return wholePart
      }

      const fractionalStr = fractionalPart.toString().padStart(decimals, '0')
      const trimmed = fractionalStr.replace(/0+$/, '')
      return trimmed ? `${wholePart}.${trimmed}` : wholePart
    } catch (err) {
      console.log('failed to format token amount', err)
      return amount
    }
  }

  // Helper function to create Token object from bridge data
  function createTokenFromBridge(bridge: UserRequest, metadata: TokenMetadata | null): Token | null {
    // const address = getTokenAddress(bridge)
    const address = bridge.originationToken?.originationAddress ?? bridge.originationToken?.address ?? bridge.originationToken?.destinationAddress ??
    bridge.originationTokenAddress
    const chainId = Number(bridge.originationChainId)

    if (!address || !chainId) return null

    const images = [`${chainId}/${address}`]
    const otherSide = bridge.destinationTokenAddress
    if (otherSide) {
      images.push(`${bridge.destinationChainId}/${otherSide}`)
    }
    if (chainId === 943 && (address === '0x70499adEBB11Efd915E3b69E700c331778628707' || address === zeroAddress)) {
      return {
        address,
        chainId,
        ...chainsMetadata[Chains.V4PLS]!.nativeCurrency,
        logoURI: chainsMetadata[Chains.V4PLS]!.logoURI,
      }
    }

    return {
      address,
      chainId: chainId,
      symbol: metadata?.symbol || '',
      name: metadata?.name || '',
      decimals: metadata?.decimals || 18,
      logoURI: imageLinks.images(images),
    }
  }

  // Helper function to calculate amount out using fee data
  function calculateAmountOut(bridge: UserRequest, feeData: any[] | undefined): bigint | null {
    if (!bridge.amountIn || !feeData) return null

    const tokenAddress = getTokenAddress(bridge)

    // Determine if this is home to foreign or foreign to home
    // Based on the pathway config, we need to check the bridge direction
    const isHomeToForeign = bridge.originationAMBBridge?.side === 'home' ||
                           bridge.destinationAMBBridge?.side === 'foreign'

    const feeTypeToMatch = isHomeToForeign ? HOME_TO_FOREIGN_FEE : FOREIGN_TO_HOME_FEE

    // Find matching fee data
    const matchingFee = feeData.find(fee =>
      fee.tokenAddress.toLowerCase() === tokenAddress.toLowerCase() &&
      fee.feeManagerContract.chainId === (isHomeToForeign ? bridge.originationChainId : bridge.destinationChainId) &&
      fee.feeUpdate.feeType === feeTypeToMatch
    )

    if (!matchingFee) return null

    const amountInBigInt = BigInt(bridge.amountIn)
    const feeBigInt = BigInt(matchingFee.feeUpdate.fee)

    // Fee is typically in basis points (10000 = 100%)
    const amountOutBigInt = amountInBigInt - (amountInBigInt * feeBigInt / oneEther)

    return amountOutBigInt
  }

  // Helper function to determine if a bridge transaction is finished
  function isBridgeFinished(bridge: UserRequest): boolean {
    // A bridge is considered finished if it has both completion and delivery transactions
    // or if the signing process is finished
    return bridge.finishedSigning ||
           (bridge.completion?.transactionHash != null && bridge.delivery?.transactionHash != null)
  }
</script>


<!--
go to the bridge history api endpoint and get the bridges for the provided address and bridge pair
map out the progress of each bridge and display it to the user
-->

<div class="w-full flex flex-col dark:bg-surface-950 bg-gray-50">
<div class="max-w-5xl w-full mx-auto py-8">
  <div class="bg-white dark:bg-slate-950 lg:rounded-3xl shadow-lg border-y md:border border-surface-200 dark:border-surface-800 p-0 text-surface-contrast-50 dark:text-surface-contrast-950">
    <div class="flex items-center justify-between px-2 md:px-4 pt-4 md:pb-2">
      <div class="flex gap-4 w-full">
        <div class="flex md:static absolute gap-2 items-center">
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
        </div>
        <!-- {#if !walletAccount} -->
        <!-- Large screens: inline layout -->
        <div class="flex flex-col lg:flex-row-reverse justify-end flex-grow items-center gap-2">
          <div class="flex items-center gap-2 ml-auto lg:ml-0">
            <button
              class="flex items-center justify-center w-8 h-8 rounded-full bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 transition-colors focus:outline-none focus:ring-2 focus:ring-surface-500 focus:ring-offset-2"
              onclick={() => {
                retryCounter++
              }}
              title="Reload page"
            >
              <Icon icon="lucide:refresh-cw" class="w-4 h-4 text-surface-600 dark:text-surface-400" />
            </button>
            <InfoTooltip
              text="Connect your wallet to see your personal bridge history, or enter any address to view its transactions"
              placement="top"
              iconSize={5}
              maxWidth="max-w-96"
              iconColor="text-surface-500"
            />
            <ConnectButton />
          </div>
          <div class="items-center gap-2 ml-auto flex">
            <!-- Manual address badge (shown when address is set) -->
            {#if manualAddress}
              <div class="flex items-center bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 rounded-full text-sm overflow-hidden h-8 border border-surface-200 dark:border-surface-800">
                <span class="px-3 py-1">
                  {manualAddress.slice(0, 2+4)}...{manualAddress.slice(-4)}
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

            <!-- Address input field -->
            <div class="relative flex flex-grow justify-end h-10">
              <input
                bind:this={addressInputRef}
                bind:value={manualAddressInput}
                onkeydown={handleAddressKeydown}
                placeholder="Enter address..."
                class="pl-3 pr-10 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-full focus:ring focus:ring-surface-500 focus:border-surface-500 bg-white dark:bg-surface-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 w-fit min-w-60 h-full"
                type="text"
              />
{#if manualAddressInput.trim() && !isAddress(manualAddressInput.trim())}
              <Tooltip placement="top" positionerClassName="z-50">
                {#snippet trigger()}
                  <button
                    onclick={handleAddressInput}
                    disabled={true}
                    class="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full disabled:border-gray-300 dark:disabled:border-gray-600 disabled:text-gray-500 dark:disabled:text-gray-300 transition-colors flex items-center justify-center disabled:cursor-not-allowed"
                    aria-label="Invalid address"
                  >
                    <Icon icon="lucide:help-circle" class="w-5 h-5" />
                  </button>
                {/snippet}
                {#snippet content()}
                  Invalid address
                {/snippet}
              </Tooltip>
            {:else}
              <button
                onclick={handleAddressInput}
                disabled={!manualAddressInput.trim()}
                class="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-2 dark:border-surface-600 border-surface-500 hover:border-surface-600 dark:hover:border-surface-600 disabled:border-gray-300 dark:disabled:border-gray-600 text-white disabled:text-gray-500 dark:disabled:text-gray-300 transition-colors flex items-center justify-center disabled:cursor-not-allowed"
                aria-label="Submit address"
              >
                <Icon icon="lucide:arrow-up" class="w-5 h-5" />
              </button>
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
        <!-- Use userRequests directly, already sorted by orderId -->
        {@const allTransactions = bridgeData?.userRequests || []}
        {@const filteredTransactions = filterMode === 'pending'
          ? allTransactions.filter(bridge => !isBridgeFinished(bridge))
          : allTransactions}

        {#if filteredTransactions.length > 0}
          <div class="flex flex-col gap-2 h-124 py-2 overflow-y-auto custom-scrollbar">
            <!-- Transaction Cards -->
            <div class="gap-2 md:px-4 px-0 flex flex-col">
              {#each filteredTransactions as bridge (bridge.orderId)}
              {@const metadata = getTokenMetadata(bridge, bridgeData?.tokenMetadata)}
              {@const originChainId = bridge.originationChainId || 'Unknown'}
              {@const destChainId = bridge.destinationChainId || 'Unknown'}
              <!-- {@const provider = bridge.originationAMBBridge?.provider || bridge.destinationAMBBridge?.provider || 'Bridge'}
              {@const tokenImage = `https://gib.show/image/${originChainId}/${getTokenAddress(bridge)}`} -->
              {@const inputToken = createTokenFromBridge(bridge, metadata)}
              <!-- {@const outputToken = createTokenFromBridge(bridge, metadata)} -->

              <div class="bg-white dark:bg-surface-950 ring ring-surface-200 dark:ring-surface-700 md:rounded-full hover:shadow-xs transition-shadow md:h-10">
                <!-- Section 1: Summary -->
                <div class="flex flex-row justify-between h-full">
                  <!-- <h3 class="text-sm font-medium text-gray-500 mb-3">Bridge Summary</h3> -->
                  <div class="flex items-center justify-between md:gap-2 gap-0 py-1 px-4 flex-grow flex-col md:flex-row flex-grow align-center">
                    <!-- Input Token and chain -->
                    <div class="flex items-center gap-2 flex-grow md:flex-grow-0 self-start">
                      <!-- <div class="flex flex-col min-w-0 flex-1 w-48 text-right"> -->
                      <div class="flex items-center space-x-1 truncate justify-end leading-5 flex-grow w-35 lg:w-48">
                        <span class="text-lg text-gray-900 dark:text-white truncate">
                          {metadata && bridge.amountIn ? formatTokenAmount(bridge.amountIn, {decimals: metadata.decimals}) : bridge.amountIn}
                        </span>
                      </div>
                      <AssetWithNetwork
                        asset={inputToken}
                        network={Number(originChainId)}
                        tokenSizeClasses="w-6 h-6"
                        networkSizeClasses="w-3 h-3"
                      />
                      <span class="text-sm text-gray-600 dark:text-gray-300 truncate md:w-24 w-12">
                        {metadata?.symbol}
                      </span>
                    </div>
                    <!-- output chain, amount, and token with links -->
                    <div class="flex items-center gap-2 flex-grow self-end h-full w-full md:w-auto pl-4 md:pl-0">
                      <!-- Transaction link to block explorer -->
                      {#if bridge.transaction?.hash && bridge.transaction?.chainId}
                      <div class="rounded-full border-surface-200 dark:border-surface-700 border p-0.5">
                        <DirectLink
                          path="/tx/{bridge.transaction.hash}"
                          chain={Number(bridge.transaction.chainId)}
                          class="text-surface-500 dark:text-surface-500 hover:text-surface-600 transition-colors"
                          size={4}
                        />
                      </div>
                      {/if}
                      <!-- Origin Chain -->
                       <div class="flex gap-1 flex-row">
                      <div class="flex items-center mx-0">
                        <StaticNetworkImage
                          network={Number(originChainId)}
                          sizeClasses="w-5 h-5"
                        />
                      </div>
                      <Icon icon="jam:chevron-right" class="w-4 h-4 text-gray-400 mx-0" />
                      <!-- Destination Chain -->
                      <div class="flex items-center mx-0">
                        <StaticNetworkImage
                          network={Number(destChainId)}
                          sizeClasses="w-5 h-5"
                        />
                        <!-- <span class="text-xs text-gray-500">{destChainId}</span> -->
                      </div>
                      </div>
                      <div class="flex items-center gap-2 flex-grow h-full">
                        <!-- Completion transaction link -->
                        {#if bridge.completion?.transactionHash && bridge.completion?.chainId}
                        <div class="rounded-full border-surface-200 dark:border-surface-700 border p-0.5">
                          <DirectLink
                            path="/tx/{bridge.completion.transactionHash}"
                            chain={Number(bridge.completion.chainId)}
                            class="text-surface-500 dark:text-surface-500 hover:text-surface-600 transition-colors"
                            size={4}
                          />
                          </div>
                        {:else}
                          <!-- Transparent placeholder for completion -->
                          <div class="w-5 h-5 opacity-0 pointer-events-none"></div>
                        {/if}

                        <span class="text-sm font-medium text-gray-600 dark:text-gray-400 truncate flex-grow hidden opacity-0 lg:opacity-100 md:flex text-[1px] lg:text-sm justify-end">
                          <!-- amount out from the bridge -->
                          {(() => {
                            // If we have actual amountOut, use it
                            if (bridge.amountOut && metadata) {
                              return formatTokenAmount(bridge.amountOut, {decimals: metadata.decimals})
                            }

                            // If no amountOut but we have amountIn, calculate using fee data
                            if (bridge.amountIn && metadata) {
                              const calculatedAmountOut = calculateAmountOut(bridge, bridgeData?.feeData)
                              if (calculatedAmountOut !== null) {
                                return formatTokenAmount(calculatedAmountOut.toString(), {decimals: metadata.decimals})
                              }
                              // Fallback to amountIn if calculation fails
                              return formatTokenAmount(bridge.amountIn, {decimals: metadata.decimals})
                            }

                            // Final fallback
                            return bridge.amountOut || bridge.amountIn || ''
                          })()}
                        </span>
                        <AssetWithNetwork
                          asset={inputToken}
                          network={Number(destChainId)}
                          tokenSizeClasses="w-6 h-6"
                          networkSizeClasses="w-3 h-3"
                        />

                        <!-- Delivery transaction link -->
                        {#if bridge.delivery?.transactionHash && bridge.delivery?.chainId}
                        <div class="rounded-full border-surface-200 dark:border-surface-700 border p-0.5">
                          <DirectLink
                            path="/tx/{bridge.delivery.transactionHash}"
                            chain={Number(bridge.delivery.chainId)}
                            class="text-surface-500 dark:text-surface-500 hover:text-surface-600 transition-colors"
                            size={4}
                          />
                          </div>
                        {:else}
                          <!-- Transparent placeholder for delivery -->
                          <div class="w-5 h-5 opacity-0 pointer-events-none"></div>
                        {/if}
                      </div>
                    </div>
                  </div>

                  <!-- Button group justified to the right -->
                  <div class="flex justify-end">
                     <div class="inline-flex shadow-sm md:rounded-r-full gap-0.5" role="group">
                       <button
                         class="px-4 py-1 bg-surface-500 hover:bg-surface-600 dark:bg-surface-600 text-white text-sm dark:hover:bg-surface-700 transition-colors focus:ring focus:ring-surface-500 focus:ring-offset-2 focus:z-10 h-full bg-position-[-55px_6px] hover:bg-position-[-4px_6px]"
                         style="background-image: url({payMe}); background-size: 46px 35px; background-repeat: no-repeat; transition: background-position 200ms ease-in-out;"
                         onclick={() => console.log('clicked')}
                       >
                         Release
                       </button>
                       <div class="relative">
                         <button
                           class="px-2 py-1 bg-surface-500 dark:bg-surface-600 text-white text-sm md:rounded-r-full border-l border-surface-500 hover:bg-surface-500 dark:hover:bg-surface-700 transition-colors focus:ring focus:ring-surface-500 focus:ring-offset-2 focus:z-10 h-full w-10"
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
                         <div class="hidden absolute right-0 mt-0 w-48 bg-white shadow-lg border border-gray-200 z-50 rounded-xl">
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
                              class="w-3 h-3 text-gray-400 hover:text-surface-600 transition-colors"
                            />
                          {/if}
                        </div>
                        <div class="flex items-center space-x-1">
                          <span class="text-xs text-gray-600">To: {bridge.to.slice(0, 6)}...{bridge.to.slice(-4)}</span>
                          {#if bridge.transaction?.chainId}
                            <DirectLink
                              path="/address/{bridge.to}"
                              chain={Number(bridge.transaction.chainId)}
                              class="w-3 h-3 text-gray-400 hover:text-surface-600 transition-colors"
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
                            class="w-4 h-4 text-gray-400 hover:text-surface-600 transition-colors"
                          />
                        </div>
                      {:else}
                        <div class="text-xs text-gray-400">-</div>
                      {/if}
                    </div>
                  </div>

                  <div class="mt-3 pt-3 border-t border-gray-100">
                    <div class="flex items-center space-x-2">
                      <div class="w-2 h-2 rounded-full {bridge.type === 'signature' ? 'bg-surface-500' : 'bg-green-500'}"></div>
                      <span class="text-xs font-medium {bridge.type === 'signature' ? 'text-surface-600' : 'text-green-600'}">
                        {bridge.type === 'signature' ? 'Signature Request' : 'Affirmation Request'}
                      </span>
                      <span class="text-xs text-gray-500">#{bridge.orderId}</span>
                    </div>
                  </div>
                </div> -->
              </div>
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
      {#if isLoading}
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
          <span>Showing</span>
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
            <span class="font-medium">{bridgeData.totalCount}</span>
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
            disabled={currentPage === 1 || isLoading || totalPages <= 1}
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
            disabled={currentPage === 1 || isLoading || totalPages <= 1}
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
              {currentPage} of {totalPages}
            {/if}
          </div>

          <!-- Next Page (single chevron right) -->
          <button
            class="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
            onclick={goToNextPage}
            disabled={currentPage === totalPages || isLoading || totalPages <= 1}
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
