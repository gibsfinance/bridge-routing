<script lang="ts">
  import type { Token } from '$lib/types.svelte'
  import { zeroAddress } from 'viem'
  import Button from './Button.svelte'
  import Icon from '@iconify/svelte'
  import { Chains, Provider } from '$lib/stores/auth/types'
  import { accountState, modal } from '$lib/stores/auth/AuthProvider.svelte'
  import ConnectButton from './ConnectButton.svelte'
  import { bridgeSettings, searchKnownAddresses } from '$lib/stores/bridge-settings.svelte'
  import {
    assetLink,
    loadAssetLink,
    loadPrice,
    minAmount,
    priceInt,
    origination,
    destination,
  } from '$lib/stores/chain-events.svelte'
  import {
    bridgableTokens,
    bridgeableTokensUnder,
    bridgeFee,
    loadFeeFor,
    recipient,
    bridgeKey,
  } from '$lib/stores/input.svelte'
  import { SvelteMap } from 'svelte/reactivity'
  import SlideToggle from './SlideToggle.svelte'
  import { onboardSettings } from '$lib/stores/onboard.svelte'
  const bridgedToken = $derived(bridgeSettings.assetOut.value as Token | null)
  const openOnRamp = () => {
    modal.open({
      view: 'OnRampProviders',
    })
  }
  const openZKP2P = () => {
    open('https://zkp2p.xyz/swap', '_blank')?.focus()
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
  const wplsTokenPrice = new SvelteMap<string, bigint>()
  const key = $derived(`${bridgeKey.toChain}-${bridgedToken?.address}`.toLowerCase())
  $effect(() => origination.watch(bridgeKey.fromChain))
  $effect(() => destination.watch(bridgeKey.toChain))
  $effect(() => {
    const block = destination.block
    if (!bridgedToken || !block) return
    const price = loadPrice(bridgedToken, block)
    price.promise
      .then((priceResult) => {
        if (price.controller.signal.aborted) {
          return
        }
        if (!priceResult) {
          wplsTokenPrice.set(key, 0n)
        } else {
          const price = priceInt(priceResult, bridgedToken.decimals)
          wplsTokenPrice.set(key, price)
        }
      })
      .catch(() => {
        wplsTokenPrice.set(key, 0n)
      })
    return price.cleanup
  })
  $effect(() => {
    if (!bridgeSettings.assetIn.value) return
    return minAmount.fetch(bridgeKey.value, bridgeSettings.assetIn.value)
  })
  const toggleShowBridge = () => {
    onboardSettings.toggleShowBridge()
  }
</script>

<header class="flex flex-row justify-between">
  <div class="flex flex-row gap-2">
    <div class="flex flex-row gap-0 border-surface-100/20">
      <Button
        class="btn gap-1 shadow-inner border px-1 rounded-r-none border-surface-100/20"
        onclick={openOnRamp}>
        <Icon icon="material-symbols:ramp-left-rounded" mode="svg" class="size-6" />
      </Button>
      <Button
        class="btn gap-2 shadow-inner border border-surface-100/20 pl-2 rounded-l-none bg-surface-300/20 border-l-0"
        onclick={openZKP2P}>
        <span>OnRamp</span>
        <Icon icon="codicon:circuit-board" mode="svg" class="size-6" />
      </Button>
    </div>
    <Button
      class="btn preset-tonal gap-2 shadow-inner border border-surface-100/20 pr-1"
      onclick={toggleShowBridge}>
      <Icon icon="icon-park-solid:bridge-one" mode="svg" class="size-6" />
      <span>Bridge</span>
      <!-- put slide toggle inside a button so we have to let the mouse events pass through -->
      <SlideToggle checked={onboardSettings.showBridge} class="pointer-events-none" />
    </Button>
  </div>
  <ConnectButton />
</header>
