<script lang="ts">
  import FromNetwork from './FromNetwork.svelte'
  import ToNetwork from './ToNetwork.svelte'
  import ConnectAndBridge from './ConnectAndBridge.svelte'
  import * as nav from '$lib/stores/nav.svelte'
  import NetworkDirection from './NetworkDirection.svelte'
  import Settings from './Settings.svelte'
  import * as customTokens from '$lib/stores/custom-tokens.svelte'
  import Details from './Details.svelte'
  import * as transactions from '$lib/stores/transactions'
  import BridgeSettings from './BridgeSettings.svelte'
  import BridgeAdvancedMode from './BridgeAdvancedMode.svelte'
  import {
    details,
    bridgeSettings,
    updateAssetIn,
    type ExtraDataOptions,
    updateAssetOut,
    loadPriceCorrective,
    assetSources,
  } from '$lib/stores/bridge-settings.svelte'
  import {
    bridgeKey,
    loadFeeFor,
    // bridgeAdminSettings,
    // clientFromChain,
    toPath,
    unwrap,
    isUnwrappable,
  } from '$lib/stores/input.svelte'
  import { settings as bridgeAdminSettings } from '$lib/stores/fee-manager.svelte'
  import { accountState } from '$lib/stores/auth/AuthProvider.svelte'
  import {
    // watchFinalizedBlocks,
    // unwatchFinalizedBlocks,
    fromTokenBalance,
    toTokenBalance,
    minAmount,
    latestBlock,
    loadAssetLink,
    assetLink,
    watchFinalizedBlocksForOneChain,
  } from '$lib/stores/chain-events.svelte'
  import { getAddress, zeroAddress, type Hex } from 'viem'
  import { untrack } from 'svelte'
  import { loading } from '$lib/stores/loading.svelte'
  import InputOutputForm from './InputOutputForm.svelte'
  import { nativeAssetOut } from '$lib/stores/config.svelte'
  import BridgeHeader from './BridgeHeader.svelte'
  import { advancedMode } from '$lib/stores/storage.svelte'

  // watch for finalized blocks to update balances
  $effect(() => {
    const pathway = bridgeKey.pathway
    if (!pathway) return
    const result = loadFeeFor({
      value: bridgeKey.value,
      pathway,
      fromChain: Number(bridgeKey.fromChain),
      toChain: Number(bridgeKey.toChain),
    })
    return result.cleanup
  })
  $effect(() => watchFinalizedBlocksForOneChain(Number(bridgeKey.fromChain)))
  $effect(() => {
    if (!bridgeSettings.assetIn.value) return
    return minAmount.fetch(bridgeKey.value, bridgeSettings.assetIn.value)
  })
  $effect(() => {
    const keyAddress = bridgeKey.assetInAddress
    if (!keyAddress) return
    const assetIn = untrack(() => bridgeSettings.assetIn.value)
    if (keyAddress && assetIn?.address) {
      if (getAddress(keyAddress) === getAddress(assetIn?.address)) {
        // if we don't return here, we have an infinite loop for some reason
        // console.log('assetIn already set', keyAddress, assetIn?.address)
        return
      }
    }
    // console.log('updating assetIn', keyAddress)
    const updatingAssetIn = updateAssetIn({
      bridgeKey: bridgeKey.value,
      address: keyAddress as Hex,
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
    // console.log('assetIn', JSON.stringify(assetLink.value, null, 2))
    const updatingAssetOut = updateAssetOut({
      toChainId: Number(bridgeKey.toChain),
      assetInput: assetIn,
      assetLink: assetLink.value,
    })
    const assetOutKey = `${bridgeKey.path}/${assetIn.address.toLowerCase()}`
    updatingAssetOut.promise.then((asset) => {
      if (updatingAssetOut.controller.signal.aborted) return
      if (asset) {
        bridgeSettings.setAssetOut(assetOutKey, asset)
      } else {
        // some fallback logic - never been bridged yet
      }
    })
    return updatingAssetOut.cleanup
  })
  const ticker = $derived(latestBlock.block(Number(bridgeKey.fromChain)))
  $effect(() => {
    console.log('checking price corrective')
    if (!ticker || !bridgeSettings.assetOut) return
    const priceCorrective = loadPriceCorrective({
      bridgeKey: bridgeKey.value,
      assetOut: bridgeSettings.assetOut,
      assetLink: assetLink.value,
      block: ticker,
      amountToBridge: bridgeSettings.amountToBridge,
    })
    priceCorrective.promise.then((price) => {
      if (priceCorrective.controller.signal.aborted) return
      console.log(
        // bridgeKey.value,
        // bridgeSettings.assetOut,
        // assetLink.value,
        'priceloaded',
        price,
        // bridgeSettings.amountToBridge,
      )
      bridgeSettings.priceCorrective.value = price ?? 0n
    })
    return priceCorrective.cleanup
  })
  $effect(() => untrack(() => latestBlock.watch(Number(bridgeKey.fromChain))))
  $effect(() => untrack(() => latestBlock.watch(Number(bridgeKey.toChain))))
  const originationBlock = $derived(latestBlock.block(Number(bridgeKey.fromChain)))
  $effect(() => {
    if (!bridgeSettings.assetIn.value || !accountState.address || originationBlock) return
    // console.log(
    //   'fetching fromTokenBalance',
    //   bridgeSettings.assetIn.value,
    //   accountState.address,
    //   originationBlock,
    // )
    return fromTokenBalance.fetch(
      Number(bridgeKey.fromChain),
      bridgeSettings.assetIn.value,
      accountState.address,
      originationBlock,
    )
  })
  const destinationBlock = $derived(latestBlock.block(Number(bridgeKey.toChain)))
  $effect(() => {
    // console.log(
    //   'toTokenBalance',
    //   Number(bridgeKey.toChain),
    //   bridgeSettings.assetOut?.address,
    //   accountState.address,
    //   destinationBlock,
    // )
    if (!bridgeSettings.assetOut?.address || !accountState.address || !destinationBlock) {
      return
    }
    return toTokenBalance.fetch(
      Number(bridgeKey.toChain),
      bridgeSettings.assetOut,
      accountState.address,
      destinationBlock,
    )
  })
  const loadApproval = loading.loadsAfterTick<bigint, transactions.ApprovalParameters>(
    'approval',
    async (inputs: transactions.ApprovalParameters) => {
      const result = await transactions
        .checkAllowance(inputs)
        .catch(async () => {
          await new Promise((resolve) => setTimeout(resolve, 500))
          return transactions.checkAllowance(inputs)
        })
        .catch(() => {
          console.error('unable to load allowance', inputs)
          return 0n
        })
      return result
    },
  )
  const originationTicker = $derived(latestBlock.block(Number(bridgeKey.fromChain)))
  // const destinationTicker = $derived(latestBlock.block(Number(bridgeKey.toChain)))
  $effect(() => {
    const account = accountState.address
    const token = bridgeSettings.assetIn.value?.address
    const bridgePath = bridgeKey.pathway?.from
    if (!account || !bridgePath || !token || !bridgeKey.fromChain || !originationTicker) return
    // console.log(
    //   'loading approval',
    //   account,
    //   token,
    //   bridgePath,
    //   bridgeKey.fromChain,
    //   originationTicker,
    // )
    const result = loadApproval({
      account,
      token: token as Hex,
      spender: bridgePath,
      chainId: Number(bridgeKey.fromChain),
    })
    result.promise.then((approval) => {
      if (result.controller.signal.aborted) return
      bridgeSettings.approval.value = approval ?? 0n
    })
    return result.cleanup
  })
  const assetOutAddress = $derived(bridgeSettings.assetOut?.address)
  const futureAssetOutAddress = $derived.by(() => {
    if (!assetOutAddress) {
      return null
    }
    const wrapped = nativeAssetOut[bridgeKey.toChain]
    if (!wrapped || getAddress(assetOutAddress) !== getAddress(wrapped)) {
      return assetOutAddress
    }
    if (
      unwrap.value &&
      bridgeSettings.assetOut &&
      isUnwrappable(bridgeSettings.assetOut, bridgeKey.value)
    ) {
      return zeroAddress
    }
    return assetOutAddress
  })
  const dividerDisabled = $derived(!assetOutAddress)
  // $inspect(unwrap.value, bridgeKey.toChain, futureAssetOutAddress)
  const ondividerclick = () => {
    nav.delivery.shallow(bridgeKey.partner, futureAssetOutAddress as string)
  }
</script>

<div class="flex flex-col max-w-lg">
  <BridgeHeader />
  <div class="flex flex-col max-w-lg mx-auto w-full p-2 bg-white card rounded-3xl relative">
    <InputOutputForm
      icon="mdi:swap-horizontal"
      ondividerclick={dividerDisabled ? null : ondividerclick}>
      {#snippet input()}
        <FromNetwork />
      {/snippet}
      {#snippet output()}
        <ToNetwork asset={bridgeSettings.assetOut} />
      {/snippet}
      {#snippet info()}
        {#if advancedMode.value}
          <BridgeAdvancedMode asset={bridgeSettings.assetOut} />
        {/if}
      {/snippet}
      {#snippet button()}
        <ConnectAndBridge />
      {/snippet}
    </InputOutputForm>
  </div>
</div>
