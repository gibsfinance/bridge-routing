<script lang="ts">
  import { encodeFunctionData, zeroAddress, type Hex } from 'viem'
  import { Chains, FOREIGN_TO_HOME_FEE, HOME_TO_FOREIGN_FEE, pathway } from '@gibs/bridge-sdk/config'
  import * as abis from '@gibs/bridge-sdk/abis'
  import { packSignatures, signatureToVRS } from '../stores/messages'
  import * as transactions from '../stores/transactions'
  import { chainsMetadata } from '@gibs/bridge-sdk/chains'
  import * as imageLinks from '@gibs/bridge-sdk/image-links'
  import type { UserRequest } from '../gql/graphql'
  import type { Token, TokenMetadata } from '@gibs/bridge-sdk/types'
  import { formatTokenAmount } from '../stores/utils'
  import AssetWithNetwork from './AssetWithNetwork.svelte'
  import DirectLink from './DirectLink.svelte'
  import StaticNetworkImage from './StaticNetworkImage.svelte'
  import Tooltip from './Tooltip.svelte'
  import Icon from '@iconify/svelte'
  import { oneEther } from '@gibs/bridge-sdk/settings'
  import { bridgeETA } from '../stores/utils'
  import { accountState, appkitNetworkById, connect, switchNetwork } from '../stores/auth/AuthProvider.svelte'
  import { blocks, bridgeStatuses, type ContinuedLiveBridgeStatusParams } from '../stores/chain-events.svelte'
  import { toChain } from '@gibs/bridge-sdk/config'
  import type { BridgeKey } from '@gibs/bridge-sdk/types'
  import type { FeeData } from '../stores/history'
  import { uri } from '../stores/toast'
  import { transactionButtonPress } from '../stores/transaction'

  const payMe = 'images/pay-me-isolated.png'
  type Props = {
    bridge: UserRequest
    tokenMetadata: Map<string, TokenMetadata>
    feeData: FeeData[]
  }
  const { bridge, tokenMetadata, feeData }: Props = $props()
  const walletAccount = $derived(accountState.address)
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

  // Helper function to create Token object from bridge data
  function createTokenFromBridge(bridge: UserRequest, metadata: TokenMetadata | null): Token | null {
    const originationToken = bridge.originationToken
    const address = originationToken?.originationAddress
    const chainId = Number(originationToken?.originationChainId)

    if (!address || !chainId) return null

    const images = [`${chainId}/${address}`]
    if (originationToken.destinationAddress) {
      images.push(`${originationToken.destinationChainId}/${originationToken.destinationAddress}`)
    }
    if (chainId === 943 && (address.toLowerCase() === '0x70499adEBB11Efd915E3b69E700c331778628707'.toLowerCase() || address === zeroAddress)) {
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

  const bridgeToKey = (bridge: UserRequest) => {
    return [bridge.originationAMBBridge?.provider, toChain(bridge.originationChainId), toChain(bridge.destinationChainId)] as BridgeKey
  }

  /**
   * Convert historical bridge data to bridge status format for calculateETA
   */
  function createBridgeStatusFromHistory(bridge: UserRequest): ContinuedLiveBridgeStatusParams | null {
    // If bridge is not yet signed, it's still in validation
    const bridgeKey = bridgeToKey(bridge)
    const hash = bridge.transaction!.hash as Hex
    const receipt = {
      blockNumber: BigInt(bridge.block!.number!),
      transactionHash: hash,
      // blockHash: bridge.transaction?.blockHash,
      // transactionIndex: bridge.transaction?.index,
    }
    const fBlock = blocks.get(Number(bridge.originationChainId!))?.get('finalized')?.block
    if (!fBlock) {
      return null
    }
    const finalizedBlock = { number: fBlock.number! }
    if (!bridge.finishedSigning) {
      return {
        receipt,
        hash,
        ticker: { number: 0n } as any, // Placeholder - not used for pending status
        bridgeKey,
        status: bridgeStatuses.MINED,
        statusIndex: 1,
        finalizedBlock,
      }
    }

    // If signed but not delivered, it's finalized and ready for delivery
    if (bridge.finishedSigning && !bridge.delivered) {
      return {
        receipt,
        hash,
        ticker: { number: 0n } as any,
        bridgeKey,
        status: bridgeStatuses.AFFIRMED,
        statusIndex: 2,
        finalizedBlock,
      }
    }

    // If delivered, it's affirmed/complete
    if (bridge.delivered) {
      return {
        receipt,
        hash,
        ticker: { number: 0n } as any,
        bridgeKey,
        status: bridgeStatuses.DELIVERED,
        statusIndex: 4,
        finalizedBlock,
      }
    }

    return null
  }

  // Helper function to calculate amount out using fee data
  function calculateAmountOut(bridge: UserRequest, feeData: any[] | undefined): bigint | null {
    if (!bridge.amountIn || !feeData) return null

    const tokenAddress = bridge.originationToken?.address
    if (!tokenAddress) return null

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

  // const metadata = getTokenMetadata(bridge, bridgeData?.tokenMetadata)
  const metadata = $derived(getTokenMetadata(bridge, tokenMetadata))
  const originChainId = $derived(bridge.originationChainId || 'Unknown')
  const destChainId = $derived(bridge.destinationChainId || 'Unknown')
  const destinationChainId = $derived(Number(bridge.destinationChainId))
  const inputToken = $derived(createTokenFromBridge(bridge, metadata))
  const key = $derived(bridgeToKey(bridge))
  const path = $derived(pathway(key, false))
  const doReleaseWithoutTip = $derived(
    bridge.type !== 'signature' ? null : transactionButtonPress({
      chainId: destinationChainId,
      steps: [
        async () => {
          if (Number(accountState.chainId) !== destinationChainId) {
            await switchNetwork(appkitNetworkById.get(destinationChainId))
          }
          // allow testnet pathways
          const encodedSignatures = packSignatures(bridge.signatures!.map(signatureToVRS)) as Hex
          const tx = await transactions.sendTransaction({
            ...transactions.options(
              destinationChainId,
              blocks.get(destinationChainId)!.get('latest')!.block!,
            ),
            account: walletAccount as Hex,
            value: 0n,
            to: bridge.destinationAmbAddress as Hex,
            data: encodeFunctionData({
              abi: abis.relayTokensDirect,
              functionName: 'safeExecuteSignaturesWithAutoGasLimit',
              args: [
                bridge.encodedData! as Hex,
                encodedSignatures,
              ],
            })
          })
          return tx
        },
      ],
    })
  )
  const doReleaseToRouter = $derived(
    bridge.type !== 'signature' ? null : transactionButtonPress({
      chainId: destinationChainId,
      steps: [
        async () => {
          if (Number(accountState.chainId) !== destinationChainId) {
            await switchNetwork(appkitNetworkById.get(destinationChainId))
          }
          // allow testnet pathways
          const encodedSignatures = packSignatures(bridge.signatures!.map(signatureToVRS)) as Hex
          const tx = await transactions.sendTransaction({
            ...transactions.options(
              destinationChainId,
              blocks.get(destinationChainId)!.get('latest')!.block!,
            ),
            account: walletAccount as Hex,
            value: 0n,
            to: path!.destinationRouter!,
            data: encodeFunctionData({
              abi: abis.outputRouter,
              functionName: 'safeExecuteSignaturesWithAutoGasLimit',
              args: [
                path!.validator!,
                bridge.encodedData! as Hex,
                encodedSignatures,
              ],
            })
          })
          return tx
        },
      ],
    })
  )
  const releaseWithoutTipDisabled = $derived(!doReleaseWithoutTip)
  const releaseDisabled = $derived.by(() => {
    return !walletAccount || bridge.type !== 'signature'
  })
</script>
<div class="bg-white dark:bg-surface-950 ring ring-surface-200 dark:ring-surface-700 md:rounded-full hover:shadow-xs transition-shadow md:h-10 group relative">
  <!-- Clock icon with timestamp tooltip - always visible -->

  <!-- Section 1: Summary -->
  <div class="flex flex-row justify-between h-full">
    <!-- <h3 class="text-sm font-medium text-gray-500 mb-3">Bridge Summary</h3> -->
    <div class="flex items-center justify-between md:gap-2 gap-0 py-1 pr-4 pl-1 flex-grow flex-col md:flex-row flex-grow align-center">
      <div class="flex items-center">
        <Tooltip placement="top-start" gutter={8}>
          {#snippet trigger()}
            <div class="bg-surface-100 dark:bg-surface-800 rounded-full p-1 shadow-sm border border-surface-200 dark:border-surface-700 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors cursor-pointer">
              <Icon icon="mdi:clock-outline" class="w-6 h-6 text-surface-600 dark:text-surface-400" />
            </div>
          {/snippet}
          {#snippet content()}
            <div class="text-sm">
              {#if bridge.block?.timestamp}
                <div class="text-xs text-surface-500 dark:text-surface-500 mt-1">
                  {new Date(Number(bridge.block.timestamp) * 1000).toLocaleString()}
                </div>
              {:else}
                <div>Timestamp unavailable</div>
              {/if}
            </div>
          {/snippet}
        </Tooltip>
      </div>
      <!-- Input Token and chain -->
      <div class="flex items-center gap-2 flex-grow md:flex-grow-0 self-start h-full">
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
          wrapInLink={uri(toChain(Number(originChainId)), 'address', bridge.originationToken?.address ?? '')}
        />
        <span class="text-sm text-gray-600 dark:text-gray-300 truncate md:w-24 w-12">
          {metadata?.symbol}
        </span>
      </div>
      <!-- output chain, amount, and token with links -->
      <div class="flex items-center gap-2 flex-grow self-end h-full w-full md:w-auto pl-4 md:pl-0">
        <!-- Transaction link to block explorer -->
        {#if bridge.transaction?.hash && bridge.transaction?.chainId}
          <DirectLink
            path="/tx/{bridge.transaction.hash}"
            chain={Number(bridge.transaction.chainId)}
            class="text-surface-500 dark:text-surface-500 hover:text-surface-600 transition-colors rounded-full border-surface-200 dark:border-surface-700 border size-6 p-0.5 items-center"
            size={5}
          />
        {/if}
        <!-- Origin Chain -->
          <div class="flex gap-1 flex-row items-center h-full">
        <div class="flex items-center mx-0">
          <StaticNetworkImage
            network={Number(originChainId)}
            sizeClasses="w-6 h-6"
          />
        </div>
        <Icon icon="jam:chevron-right" class="w-4 h-4 text-gray-400 mx-0" />
        <!-- Destination Chain -->
        <div class="flex items-center mx-0">
          <StaticNetworkImage
            network={Number(destChainId)}
            sizeClasses="w-6 h-6"
          />
          <!-- <span class="text-xs text-gray-500">{destChainId}</span> -->
        </div>
        </div>
        <div class="flex items-center gap-2 flex-grow h-full">
          <!-- Completion transaction link -->
          {#if bridge.completion?.transactionHash && bridge.completion?.chainId}
            <DirectLink
              path="/tx/{bridge.completion.transactionHash}"
              chain={Number(bridge.completion.chainId)}
              class="text-surface-500 hover:text-surface-600 transition-colors rounded-full border-surface-200 dark:border-surface-700 border size-6 p-0.5 items-center"
              size={5}
            />
          {:else}
            <!-- Transparent placeholder for completion -->
            <div class="w-6 h-6 opacity-0 pointer-events-none"></div>
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
                const calculatedAmountOut = calculateAmountOut(bridge, feeData)
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
            wrapInLink={uri(toChain(Number(destChainId)), 'address', bridge.destinationToken?.address ?? '')}
          />

          <!-- Delivery transaction link -->
          {#if bridge.delivery?.transactionHash && bridge.delivery?.chainId}
            <DirectLink
              path="/tx/{bridge.delivery.transactionHash}"
              chain={Number(bridge.delivery.chainId)}
              class="text-surface-500 dark:text-surface-500 hover:text-surface-600 transition-colors rounded-full border-surface-200 dark:border-surface-700 border size-6 p-0.5 items-center"
              size={5}
            />
          {:else}
            <!-- Transparent placeholder for delivery -->
            <div class="w-6 h-6 opacity-0 pointer-events-none"></div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Button group or status display to maintain horizontal space -->
      {#if !bridge.finishedSigning}
      <!-- Show pending status with ETA tooltip -->
      <div class="flex justify-end w-32">
        <div class="flex shadow-sm md:rounded-r-full gap-0.5 w-full">
          <span class="px-4 py-1 bg-surface-100 dark:bg-surface-900 text-surface-800 dark:text-surface-200 text-sm md:rounded-r-full h-full flex items-center w-full justify-between">
            <span>Pending</span>
            <Tooltip placement="top" gutter={3}>
              {#snippet trigger()}
                <Icon icon="mdi:clock" class="w-4 h-4 text-surface-500 dark:text-surface-500" />
              {/snippet}
              {#snippet content()}
                <span>{bridgeETA.calculateETA({
                  bridgeStatus: createBridgeStatusFromHistory(bridge),
                  fromChainBlocks: blocks.get(Number(bridge.originationChainId!)),
                })}</span>
              {/snippet}
            </Tooltip>
          </span>
        </div>
      </div>
    {:else if bridge.finishedSigning && !bridge.delivered}
    <div class="flex justify-end w-32">
      <!-- {#if bridge.feeDirector} -->
      <!-- Show button group with tip options when feeDirector exists -->
      <div class="flex flex-grow shadow-sm md:rounded-r-full gap-0.5 w-full" role="group">
        <button
          class="px-4 py-1 bg-surface-500 hover:bg-surface-600 dark:bg-surface-600 text-white text-sm dark:hover:bg-surface-700 transition-colors focus:ring focus:ring-surface-500 focus:ring-offset-2 focus:z-10 h-full bg-position-[-55px_6px] hover:bg-position-[-4px_6px] disabled:opacity-80 disabled:hover:bg-surface-500 disabled:dark:hover:bg-surface-600 disabled:cursor-not-allowed disabled:bg-position-[-1000px_6px]"
          style="background-image: url({payMe}); background-size: 46px 35px; background-repeat: no-repeat; transition: background-position 200ms ease-in-out;"
          class:rounded-r-full={!bridge.feeDirector}
          class:flex-grow={!bridge.feeDirector}
          class:text-left={!bridge.feeDirector}
          onclick={!walletAccount
            ? connect
            : (bridge.type === 'signature' && bridge.feeDirector
              ? doReleaseToRouter
              : doReleaseWithoutTip
          )}>
        {#if walletAccount}
          Release
        {:else}
          Connect
        {/if}
        </button>
        {#if bridge.feeDirector}
        <div class="relative">
          <button
            class="px-2 py-1 bg-surface-500 dark:bg-surface-600 text-white text-sm md:rounded-r-full border-l border-surface-500 hover:bg-surface-500 dark:hover:bg-surface-700 transition-colors focus:ring focus:ring-surface-500 focus:ring-offset-2 focus:z-10 h-full w-10 disabled:opacity-80 disabled:hover:bg-surface-500 disabled:dark:hover:bg-surface-600 disabled:cursor-not-allowed"
            disabled={releaseDisabled}
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
                const target = event.currentTarget as HTMLElement;
                const dropdown = target.closest('.absolute') as HTMLElement;
                if (dropdown) {
                  dropdown.classList.add('hidden');
                }
                doReleaseWithoutTip?.()
              }}
            >
              Release without Tip
            </button>
          </div>
        </div>
        {/if}
      </div>
      <!-- Show single release button when no feeDirector exists (no tip available) -->
      <!-- {:else}
        <button
          class="px-4 py-1 bg-surface-500 hover:bg-surface-600 dark:bg-surface-600 text-white text-sm md:rounded-r-full shadow-sm transition-colors focus:ring focus:ring-surface-500 focus:ring-offset-2 focus:z-10 h-full bg-position-[-55px_6px] hover:bg-position-[-4px_6px] disabled:opacity-80 disabled:hover:bg-surface-500 disabled:dark:hover:bg-surface-600 disabled:cursor-not-allowed disabled:bg-position-[-1000px_6px]"
          style="background-image: url({payMe}); background-size: 46px 35px; background-repeat: no-repeat; transition: background-position 200ms ease-in-out;"
          onclick={doReleaseToRouter}
          disabled={releaseDisabled}
        >
          Release
        </button>
      {/if} -->
    </div>
    {:else}
    <!-- Show delivered status to maintain horizontal space -->
    <div class="flex justify-end w-32">
      <div class="flex shadow-sm md:rounded-r-full gap-0.5 w-full">
        <span class="px-4 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm md:rounded-r-full h-full flex items-center w-full">
          Delivered
        </span>
      </div>
    </div>
    {/if}
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
