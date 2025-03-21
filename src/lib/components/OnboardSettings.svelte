<script lang="ts">
  import { zeroAddress, type Hex } from 'viem'
  import Button from './Button.svelte'
  import Icon from '@iconify/svelte'
  import { Chains, Provider } from '$lib/stores/auth/types'
  import { accountState, modal } from '$lib/stores/auth/AuthProvider.svelte'
  import { Popover } from '@skeletonlabs/skeleton-svelte'
  import {
    assetOutKey,
    bridgeSettings,
    searchKnownAddresses,
  } from '$lib/stores/bridge-settings.svelte'
  import { assetLink, latestBlock, loadAssetLink, minAmount } from '$lib/stores/chain-events.svelte'
  import { bridgableTokens, loadFeeFor, recipient, bridgeKey } from '$lib/stores/input.svelte'
  import { showTooltips } from '$lib/stores/storage.svelte'
  import { untrack } from 'svelte'
  import Image from './Image.svelte'
  import coinbase from '$lib/images/providers/coinbase.svg?raw'
  import meldio from '$lib/images/providers/meld-io.svg?raw'
  const openOnRamp = () => {
    modal.open({
      view: 'OnRampProviders',
    })
  }
  const toggleHelp = () => {
    showTooltips.value = !showTooltips.value
  }
  const tokenInput = $derived(bridgeSettings.assetIn.value)
  $effect.pre(() => {
    bridgeKey.value = [Provider.PULSECHAIN, Chains.ETH, Chains.PLS]
  })
  $effect(() => {
    const assetInAddress = tokenInput?.address
    if (!assetInAddress) return
    const assetOutputKey = assetOutKey({
      bridgeKeyPath: bridgeKey.path,
      assetInAddress: assetInAddress as Hex,
      unwrap: false,
    })
    if (!assetOutputKey) return
    const tokensUnderBridgeKey = bridgableTokens.bridgeableTokensUnder({
      provider: bridgeKey.provider,
      chain: Number(bridgeKey.toChain),
      partnerChain: Number(bridgeKey.fromChain),
    })
    const link = loadAssetLink({
      bridgeKey: bridgeKey.value,
      assetIn: tokenInput,
    })
    link.promise.then((l) => {
      if (link.controller.signal.aborted || !l?.assetOutAddress) return
      // reverse the chains here because we are looking for the destination
      const assetOut = searchKnownAddresses({
        tokensUnderBridgeKey,
        address: l?.assetOutAddress,
        customTokens: [],
      })
      assetLink.value = l
      if (!assetOut) return
      bridgeSettings.setAssetOut(assetOutputKey, {
        ...assetOut,
        logoURI: tokenInput.logoURI,
      })
    })
    return link.cleanup
  })
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
  $effect(() => {
    recipient.value = accountState.address ?? zeroAddress
  })
  $effect(() => {
    if (!bridgeSettings.assetIn.value) return
    return minAmount.fetch(bridgeKey.value, bridgeSettings.assetIn.value)
  })
  let onrampOpen = $state(false)
</script>

<header class="flex flex-col items-center justify-between gap-2">
  <div class="flex flex-row w-full items-center justify-between relative">
    <div class="flex flex-row grow items-center gap-1 h-12">
      <Button
        onclick={toggleHelp}
        class="flex flex-row items-center italic gap-1 pr-1 border-2 rounded-full {showTooltips.value
          ? ' '
          : ' border-transparent'}">
        <Icon icon="material-symbols:help" mode="svg" class="size-9" />
        <span class="text-sm pr-1 leading-6" class:invisible={!showTooltips.value}>Dismiss</span>
      </Button>
    </div>
    <div class="flex flex-row gap-1 grow items-center justify-end">
      <Popover
        open={onrampOpen}
        onOpenChange={() => (onrampOpen = !onrampOpen)}
        positioning={{ placement: 'bottom-end', gutter: 0, shift: 4 }}
        triggerBase="flex flex-row items-center justify-center size-10 border-2 border-white rounded-full"
        contentClasses="flex flex-col max-h-64 rounded-2xl bg-surface-50 text-surface-contrast-50 overflow-y-scroll relative border shadow"
        positionerClasses="pointer-events-auto"
        modal>
        {#snippet trigger()}
          <Icon
            icon="mdi:bank-circle"
            mode="svg"
            class="size-9 rounded-full fill-surface-50 flex transition-all duration-200 {onrampOpen
              ? 'rotate-180'
              : ''}" />
        {/snippet}
        {#snippet content()}
          <div class="flex flex-col bg-white">
            <span class="px-4 pt-2 text-gray-500 text-sm">Onramps</span>
            <ul class="flex flex-col gap-0">
              <li class="hover:bg-surface-900-100">
                <a
                  href="https://zkp2p.xyz/swap?toToken=ETH{accountState.address
                    ? `&recipientAddress=${accountState.address}`
                    : ''}"
                  target="_blank"
                  class="flex flex-row gap-4 items-center text-surface-contrast-50 px-4 py-1 justify-between w-full">
                  <span class="h-full leading-8">ZKP2P</span>
                  <span class="size-8 items-center flex justify-center">
                    <Image src="https://zkp2p.xyz/logo512.png" sizeClasses="size-6" />
                  </span>
                </a>
              </li>
              <li class="hover:bg-surface-900-100">
                <Button
                  class="rounded-l-full flex flex-row items-center px-4 py-1 justify-between w-full gap-4"
                  onclick={openOnRamp}>
                  <span class="h-full leading-8">Coinbase</span>
                  <span class="size-8 items-center flex justify-center rounded-md overflow-hidden">
                    {@html coinbase}
                  </span>
                </Button>
              </li>
              <li class="hover:bg-surface-900-100">
                <Button
                  class="rounded-l-full flex flex-row items-center px-4 py-1 justify-between w-full gap-4"
                  onclick={openOnRamp}>
                  <span class="h-full leading-8">Meld.io</span>
                  <span class="size-8 items-center flex justify-center">
                    {@html meldio}
                  </span>
                </Button>
              </li>
            </ul>
          </div>
        {/snippet}
      </Popover>
    </div>
    <div class="absolute left-1/2 -translate-x-1/2 top-0 h-12 items-center justify-center flex">
      <Icon icon="mingcute:run-fill" mode="svg" class="size-8" />
    </div>
  </div>
</header>
