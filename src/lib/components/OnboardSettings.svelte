<script lang="ts">
  import type { Token } from '$lib/types.svelte'
  import { zeroAddress } from 'viem'
  import Button from './Button.svelte'
  import Icon from '@iconify/svelte'
  import { Chains, Provider } from '$lib/stores/auth/types'
  import { accountState, modal, wagmiAdapter } from '$lib/stores/auth/AuthProvider.svelte'
  import ConnectButton from './ConnectButton.svelte'
  import { bridgeSettings, searchKnownAddresses } from '$lib/stores/bridge-settings.svelte'
  import { assetLink, latestBlock, loadAssetLink, minAmount } from '$lib/stores/chain-events.svelte'
  import {
    bridgableTokens,
    bridgeableTokensUnder,
    bridgeFee,
    loadFeeFor,
    recipient,
    bridgeKey,
  } from '$lib/stores/input.svelte'
  // import { onboardSettings } from '$lib/stores/onboard.svelte'
  import { showTooltips } from '$lib/stores/storage.svelte'
  import { onDestroy, untrack } from 'svelte'
  import OnboardRadio from './OnboardRadio.svelte'
  const openOnRamp = () => {
    modal.open({
      view: 'OnRampProviders',
    })
  }
  const openZKP2P = () => {
    open('https://zkp2p.xyz/swap', '_blank')?.focus()
  }
  const toggleHelp = () => {
    showTooltips.value = !showTooltips.value
  }
  const tokenInput = $derived(bridgeSettings.assetIn.value)
  $effect.pre(() => {
    bridgeKey.value = [Provider.PULSECHAIN, Chains.ETH, Chains.PLS]
  })
  $effect(() => {
    if (!tokenInput) {
      bridgeSettings.assetIn.value = {
        logoURI: `https://gib.show/image/1/${zeroAddress}`,
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
        chainId: 1,
        address: zeroAddress,
      }
    }
  })
  $effect(() => {
    if (!tokenInput) return
    const tokensUnderBridgeKey = bridgeableTokensUnder({
      tokens: bridgableTokens.value,
      chain: bridgeKey.toChain,
      partnerChain: bridgeKey.fromChain,
    })
    const link = loadAssetLink({
      bridgeKey: bridgeKey.value,
      assetIn: tokenInput,
    })
    link.promise.then((l) => {
      if (link.controller.signal.aborted || !l?.assetOutAddress) return
      // reverse the chains here because we are looking for the destination
      let assetOut = searchKnownAddresses({
        tokensUnderBridgeKey,
        address: l?.assetOutAddress,
        customTokens: [],
      })
      assetLink.value = l
      bridgeSettings.assetOut.value = assetOut
        ? {
            ...assetOut,
            logoURI: tokenInput.logoURI,
          }
        : null
    })
    return link.cleanup
  })
  $effect(() => {
    const result = loadFeeFor(bridgeKey)
    result.promise.then((fee) => {
      if (result.controller.signal.aborted) return
      bridgeFee.value = fee
    })
    return result.cleanup
  })
  $effect(() => {
    recipient.value = accountState.address ?? zeroAddress
  })
  $effect(() => untrack(() => latestBlock.watch(Number(bridgeKey.fromChain))))
  $effect(() => untrack(() => latestBlock.watch(Number(bridgeKey.toChain))))
  $effect(() => {
    if (!bridgeSettings.assetIn.value) return
    return minAmount.fetch(bridgeKey.value, bridgeSettings.assetIn.value)
  })
  onDestroy(async () => {
    await Promise.all([wagmiAdapter.disconnect(), modal.disconnect()])
  })
  // const toggleShowBridge = () => {
  //   onboardSettings.toggleShowBridge()
  // }
</script>

<header class="flex flex-col items-center justify-between mt-2 gap-2">
  <div class="flex flex-row w-full items-center relative">
    <div class="flex flex-row gap-1 grow items-center">
      <div class="flex flex-row border-surface-100/20 gap-1 py-2">
        <Button
          class="gap-1 rounded-l-full shadow-inner border-r-0 px-1 rounded-r-none border-surface-100/20"
          onclick={openOnRamp}>
          <Icon icon="material-symbols:ramp-left-rounded" mode="svg" class="size-8" />
        </Button>
        <!-- <Button class="gap-2 shadow-inner px-1 rounded-l-none" onclick={openZKP2P}> -->
        <a href="https://zkp2p.xyz/swap" target="_blank" class="flex items-center">
          <Icon icon="ph:circuitry-fill" mode="svg" class="size-8" />
        </a>
        <!-- </Button> -->
        <Button
          onclick={toggleHelp}
          class="flex flex-row items-center italic gap-1 pr-1 border-2 rounded-full {showTooltips.value
            ? ' '
            : ' border-transparent'}">
          <Icon icon="material-symbols:help" mode="svg" class="size-9" />
          <span class="text-sm pr-1 leading-9" class:invisible={!showTooltips.value}>Dismiss</span>
        </Button>
      </div>
    </div>
    <ConnectButton />
    <div class="absolute left-1/2 -translate-x-1/2 top-0 h-14 items-center justify-center flex">
      <Icon icon="mingcute:run-fill" mode="svg" class="size-8" />
    </div>
  </div>
</header>
