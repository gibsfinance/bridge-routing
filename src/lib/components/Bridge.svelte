<script lang="ts">
  import FromNetwork from './FromNetwork.svelte'
  import ToNetwork from './ToNetwork.svelte'
  import ConnectAndBridge from './ConnectAndBridge.svelte'
  import NetworkDirection from './NetworkDirection.svelte'
  import Settings from './Settings.svelte'
  import * as customTokens from '$lib/stores/custom-tokens.svelte'
  import Details from './Details.svelte'
  import {
    details,
    bridgeSettings,
    updateAssetIn,
    type ExtraDataOptions,
    updateAssetOut,
    loadPriceCorrective,
  } from '$lib/stores/bridge-settings.svelte'
  import {
    bridgeKey,
    assetInAddress,
    loadFeeFor,
    bridgeFee,
    clientFromChain,
  } from '$lib/stores/input.svelte'
  import { accountState } from '$lib/stores/auth/AuthProvider.svelte'
  import {
    watchFinalizedBlocks,
    unwatchFinalizedBlocks,
    fromTokenBalance,
    toTokenBalance,
    minAmount,
    origination,
    destination,
    loadAssetLink,
    assetLink,
    loadApproval,
  } from '$lib/stores/chain-events.svelte'
  import type { Token } from '$lib/types.svelte'
  import { getAddress } from 'viem'
  import { windowStore } from '$lib/stores/window.svelte'
  // const originationNetwork = $derived(chainsMetadata[bridgeKey.fromChain])
  // const destinationNetwork = $derived(chainsMetadata[bridgeKey.toChain])
  const toggleDropdowns = (type: string) => {
    if (details.value === type) details.value = null
    else details.value = type as ExtraDataOptions
  }
  // watch for finalized blocks to update balances
  $effect(() => {
    const result = loadFeeFor(bridgeKey)
    result.promise.then((fee) => {
      if (result.controller.signal.aborted) return
      bridgeFee.value = fee
    })
    return result.cleanup
  })
  $effect(() => {
    const finalizedBlocksCleanup = watchFinalizedBlocks()
    return () => {
      unwatchFinalizedBlocks(finalizedBlocksCleanup)
    }
  })
  $effect(() => {
    if (!bridgeSettings.assetIn.value) return
    return minAmount.fetch(bridgeKey.value, bridgeSettings.assetIn.value)
  })
  $effect(() => {
    if (assetInAddress.value && bridgeSettings.assetIn.value?.address) {
      if (getAddress(assetInAddress.value) === getAddress(bridgeSettings.assetIn.value?.address)) {
        return
      }
    }
    const updatingAssetIn = updateAssetIn({
      bridgeKey,
      address: assetInAddress.value,
      customTokens: customTokens.tokens.value,
    })
    updatingAssetIn.promise.then((asset) => {
      if (updatingAssetIn.controller.signal.aborted) return
      bridgeSettings.assetIn.value = asset
    })
    return updatingAssetIn.cleanup
  })
  $effect(() => {
    if (!bridgeSettings.assetIn.value) return
    const loadingAssetLink = loadAssetLink({
      bridgeKey: bridgeKey.value,
      assetIn: bridgeSettings.assetIn.value,
    })
    loadingAssetLink.promise.then((link) => {
      if (loadingAssetLink.controller.signal.aborted) return
      assetLink.value = link
    })
    return loadingAssetLink.cleanup
  })
  $effect(() => {
    const assetIn = bridgeSettings.assetIn.value
    if (!assetIn || !assetLink.value) return
    console.log('assetIn', JSON.stringify(assetLink.value, null, 2))
    const updatingAssetOut = updateAssetOut({
      bridgeKey,
      assetInput: assetIn,
      assetLink: assetLink.value,
    })
    updatingAssetOut.promise.then((asset) => {
      if (updatingAssetOut.controller.signal.aborted) return
      bridgeSettings.assetOut.value = asset
    })
    return updatingAssetOut.cleanup
  })
  $effect(() => {
    const priceCorrective = loadPriceCorrective({
      bridgeKey,
      assetOut: bridgeSettings.assetOut.value as Token,
      assetLink: assetLink.value,
      block: origination.block,
      amountToBridge: bridgeSettings.amountToBridge,
    })
    priceCorrective.promise.then((price) => {
      if (priceCorrective.controller.signal.aborted) return
      bridgeSettings.priceCorrective.value = price ?? 0n
    })
    return priceCorrective.cleanup
  })
  $effect(() => origination.watch(bridgeKey.fromChain))
  $effect(() => destination.watch(bridgeKey.toChain))
  $effect(() => {
    if (!bridgeSettings.assetIn.value || !accountState.address || !origination.block) return
    return fromTokenBalance.fetch(
      bridgeKey.fromChain,
      bridgeSettings.assetIn.value,
      accountState.address,
      origination.block,
    )
  })
  $effect(() => {
    if (!bridgeSettings.assetOut.value?.address || !accountState.address || !destination.block) {
      return
    }
    return toTokenBalance.fetch(
      bridgeKey.toChain,
      bridgeSettings.assetOut.value as Token,
      accountState.address,
      destination.block,
    )
  })
  $effect(() => {
    const result = loadApproval({
      walletAccount: accountState.address,
      bridgeKey: bridgeKey.value,
      assetLink: assetLink.value,
      publicClient: clientFromChain(bridgeKey.fromChain),
    })
    result.promise.then((approval) => {
      if (result.controller.signal.aborted) return
      bridgeSettings.approval.value = approval ?? 0n
    })
    return result.cleanup
  })
</script>

<div
  class="bg-slate-200 p-3 sm:p-4 shadow-inner text-slate-950 my-8"
  class:rounded-lg={windowStore.large}>
  <FromNetwork />
  <NetworkDirection />
  <ToNetwork ontoggle={toggleDropdowns} asset={bridgeSettings.assetOut.value} />
  {#if details.value === 'settings'}
    <Settings />
  {/if}
  {#if details.value === 'details'}
    <Details asset={bridgeSettings.assetOut.value} />
  {/if}
  <div class="mt-4">
    <ConnectAndBridge />
  </div>
</div>
