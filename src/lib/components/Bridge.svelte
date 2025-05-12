<script lang="ts">
  import * as input from '../stores/input.svelte'
  import FromNetwork from './FromNetwork.svelte'
  import ToNetwork from './ToNetwork.svelte'
  import ConnectAndBridge from './ConnectAndBridge.svelte'
  import * as nav from '../stores/nav.svelte'
  import * as customTokens from '../stores/custom-tokens.svelte'
  import * as transactions from '../stores/transactions'
  import BridgeAdvancedMode from './BridgeAdvancedMode.svelte'
  import { page } from '../stores/page.svelte'
  import {
    bridgeSettings,
    updateAssetIn,
    updateAssetOut,
    loadPriceCorrective,
    assetOutKey,
  } from '../stores/bridge-settings.svelte'
  import { bridgeKey, loadFeeFor, unwrap, isUnwrappable } from '../stores/input.svelte'
  import { accountState } from '../stores/auth/AuthProvider.svelte'
  import {
    latestBlock,
    loadAssetLink,
    assetLink,
    watchFinalizedBlocksForOneChain,
    blocks,
    fetchMinBridgeAmountIn,
  } from '../stores/chain-events.svelte'
  import { getAddress, isAddress, zeroAddress, type Hex } from 'viem'
  import { untrack } from 'svelte'
  import InputOutputForm from './InputOutputForm.svelte'
  import { nativeAssetOut } from '../stores/config.svelte'
  import BridgeHeader from './BridgeHeader.svelte'
  import { advancedMode, bridgeSettings as storageBridgeSettings } from '../stores/storage.svelte'
  import BridgeProgress from './BridgeProgress.svelte'
  import ExchangeInputDivider from './ExchangeInputDivider.svelte'

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
  $effect(() => fetchMinBridgeAmountIn(bridgeKey.value, bridgeSettings.assetIn.value))
  $effect(() => {
    const keyAddress = bridgeKey.assetInAddress
    const tokens = input.bridgableTokens.value
    if (!keyAddress || !tokens.length) return
    const assetIn = untrack(() => bridgeSettings.assetIn.value)
    if (keyAddress && assetIn?.address) {
      if (getAddress(keyAddress) === getAddress(assetIn?.address)) {
        // if we don't return here, we have an infinite loop for some reason
        // console.log('assetIn already set', keyAddress, assetIn?.address)
        return
      }
    }
    const updatingAssetIn = updateAssetIn({
      bridgeKey: bridgeKey.value,
      address: keyAddress as Hex,
      customTokens: customTokens.tokens.value,
      tokens,
    })
    updatingAssetIn.promise.then((asset) => {
      if (updatingAssetIn.controller.signal.aborted) return
      bridgeSettings.assetIn.value = asset
    })
    return updatingAssetIn.cleanup
  })
  $effect(() => {
    if (!bridgeSettings.assetIn.value || !bridgeKey.value) {
      console.log('missing asset in or bridge key')
      return
    }
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
    const assetOutputKey = assetOutKey({
      bridgeKeyPath: bridgeKey.path,
      assetInAddress: assetIn?.address as Hex,
      unwrap: unwrap.value,
    })
    if (!assetIn || !assetOutputKey || !assetLink.value) return
    const updatingAssetOut = updateAssetOut({
      bridgeKey: bridgeKey.value,
      assetInput: assetIn,
      assetLink: assetLink.value,
      unwrap: unwrap.value,
    })
    updatingAssetOut.promise.then((asset) => {
      if (updatingAssetOut.controller.signal.aborted) return
      if (asset) {
        bridgeSettings.setAssetOut(assetOutputKey, asset)
      } else {
        // some fallback logic - never been bridged yet
      }
    })
    return updatingAssetOut.cleanup
  })
  const ticker = $derived(blocks.get(Number(bridgeKey.fromChain)))
  $effect(() => {
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
      bridgeSettings.priceCorrective.value = price ?? 0n
    })
    return priceCorrective.cleanup
  })
  const fromChainId = $derived(Number(bridgeKey.fromChain))
  const toChainId = $derived(Number(bridgeKey.toChain))
  $effect(() => latestBlock(fromChainId))
  $effect(() => latestBlock(toChainId))
  const originationTicker = $derived(blocks.get(Number(bridgeKey.fromChain))?.number)
  $effect(() => {
    const account = accountState.address
    const token = bridgeSettings.assetIn.value?.address
    const bridgePath = bridgeKey.pathway?.from
    if (
      !account ||
      !isAddress(account) ||
      !bridgePath ||
      !token ||
      !bridgeKey.fromChain ||
      !originationTicker ||
      !assetLink.value ||
      assetLink.value.assetInAddress !== token ||
      Number(bridgeKey.fromChain) !== bridgeSettings.assetIn.value?.chainId
    ) {
      return
    }
    const result = transactions.loadAllowance({
      account: account as Hex,
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
  const dividerDisabled = $derived(!assetOutAddress || !futureAssetOutAddress)
  const ondividerclick = () => {
    input.amountIn.value = null
    nav.delivery.shallow(bridgeKey.partner, futureAssetOutAddress as string)
  }
  const deliveryFeeLocked = $derived(storageBridgeSettings.value?.deliveryFeeLocked ?? false)
  const costLimitLocked = $derived(storageBridgeSettings.value?.costLimitLocked ?? false)
  const feeType = $derived(storageBridgeSettings.value?.feeType ?? input.FeeType.PERCENT)
  storageBridgeSettings.extend({
    deliveryFeeLocked: false,
    costLimitLocked: false,
  })
  const reasonableFixedFee = $derived(bridgeSettings.reasonableFixedFee)
  const reasonablePercentOnTopOfGasFee = $derived(bridgeSettings.reasonablePercentOnTopOfGasFee)
  const reasonablePercentFee = $derived(bridgeSettings.reasonablePercentFee)
  $effect.pre(() => {
    if (feeType === input.FeeType.GAS_TIP && !deliveryFeeLocked) {
      input.gasTipFee.value = reasonablePercentOnTopOfGasFee
    } else if (feeType === input.FeeType.FIXED && !deliveryFeeLocked) {
      input.fixedFee.value = reasonableFixedFee
    } else if (feeType === input.FeeType.PERCENT && !deliveryFeeLocked) {
      input.percentFee.value = reasonablePercentFee
    }
  })
  $effect.pre(() => {
    const amountAfterBridgeFee = bridgeSettings.amountAfterBridgeFee
    if (!costLimitLocked) {
      if (feeType === input.FeeType.GAS_TIP) {
        input.limit.value = bridgeSettings.reasonablePercentOnGasLimit
      } else if (
        feeType === input.FeeType.PERCENT &&
        reasonablePercentFee &&
        amountAfterBridgeFee
      ) {
        input.limit.value = (amountAfterBridgeFee * reasonablePercentFee) / input.oneEther
      } else if (feeType === input.FeeType.FIXED) {
        input.limit.value = reasonableFixedFee
      }
    }
    // console.log(
    //   amountAfterBridgeFee,
    //   costLimitLocked,
    //   feeType,
    //   reasonablePercentFee,
    //   input.limit.value,
    // )
  })
</script>

<div class="flex flex-col max-w-lg">
  {#if !page.embed || page.mode === 'simple'}
    <BridgeHeader />
  {/if}
  <div
    class="flex flex-col max-w-lg mx-auto w-full p-2 bg-white card rounded-3xl relative overflow-hidden">
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
      {#snippet divider()}
        <ExchangeInputDivider
          class="flex order-2"
          verticalSizeClasses="h-0"
          iconWrapperSizeClasses="size-10"
          iconWrapperColorClasses="-translate-y-1/2 -translate-x-1/2 left-1/2 absolute"
          onclick={ondividerclick}
          icon="ic:sharp-swap-calls" />
      {/snippet}
      {#snippet button()}
        <ConnectAndBridge />
      {/snippet}
      {#snippet progress()}
        <BridgeProgress />
      {/snippet}
    </InputOutputForm>
  </div>
</div>
