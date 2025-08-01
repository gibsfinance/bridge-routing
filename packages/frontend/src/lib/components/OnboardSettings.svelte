<script lang="ts">
  import { zeroAddress, type Hex } from 'viem'
  import Icon from '@iconify/svelte'
  import { Chains, Provider } from '@gibs/bridge-sdk/config'
  import { assetOutKey } from '@gibs/bridge-sdk/settings'

  import Button from './Button.svelte'
  import { accountState } from '../stores/auth/AuthProvider.svelte'
  import {
    bridgeSettings,
    searchKnownAddresses,
  } from '../stores/bridge-settings.svelte'
  import { assetLink, loadAssetLink } from '../stores/chain-events.svelte'
  import { bridgableTokens, recipient, bridgeKey } from '../stores/input.svelte'
  import { page } from '../stores/app-page.svelte'
  import * as settings from '../stores/settings.svelte'

  const toggleHelp = () => {
    page.setParam('guide', page.guide === settings.guide.SHOW ? null : settings.guide.SHOW)
  }
  const tokenInput = $derived(bridgeSettings.assetIn.value)
  $effect(() => {
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
    recipient.value = (accountState.address ?? zeroAddress) as `0x${string}`
  })
</script>

<header class="flex flex-col items-center justify-between gap-2">
  <div class="flex flex-row w-full items-center justify-between relative">
    <div class="flex flex-row grow items-center gap-1 h-12">
      <Button
        onclick={toggleHelp}
        class="flex flex-row items-center italic gap-1 pr-1 border-2 rounded-full{page.guide === settings.guide.SHOW
          ? ''
          : ' border-transparent'}">
        <Icon icon="material-symbols:help" mode="svg" class="size-9" />
        <span class="text-sm pr-1 leading-6" class:invisible={!page.guide}>Dismiss</span>
      </Button>
    </div>
    <div class="absolute left-1/2 -translate-x-1/2 top-0 h-12 items-center justify-center flex">
      {#each [null, 'swap'] as step (step)}
        <Button
          class="flex w-8 items-center flex-row"
          onclick={() => {
            page.setParam('stage', step)
            // onboardStage.value = step
          }}>
          <Icon
            icon="mingcute:run-fill"
            mode="svg"
            class="size-8 -mr-1.5 {page.stage !== step
              ? 'text-gray-300 opacity-75'
              : ''}" />
        </Button>
      {/each}
    </div>
  </div>
</header>
