<script lang="ts">
  import type { Token } from '$lib/types.svelte'
  import { zeroAddress } from 'viem'
  import Button from './Button.svelte'
  import Icon from '@iconify/svelte'
  import TokenInfo from './TokenInfo.svelte'
  import ModalWrapper from './ModalWrapper.svelte'
  import TokenSelect from './TokenSelect.svelte'
  import { Chains, Provider } from '$lib/stores/auth/types'
  import { accountState, modal } from '$lib/stores/auth/AuthProvider.svelte'
  import ConnectButton from './ConnectButton.svelte'
  import { bridgeSettings, searchKnownAddresses } from '$lib/stores/bridge-settings.svelte'
  import VerticalDivider from './VerticalDivider.svelte'
  import {
    assetLink,
    loadAssetLink,
    loadPrice,
    minAmount,
    priceInt,
    watchWplsUSDPrice,
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
  import Image from './Image.svelte'
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import { SvelteMap } from 'svelte/reactivity'
  import OnboardBridge from './OnboardBridge.svelte'
  import OnboardPulseX from './OnboardPulseX.svelte'
  let tokenOutput = $state<Token>({
    logoURI: `https://gib.show/image/369/${zeroAddress}`,
    name: 'Pulse',
    symbol: 'PLS',
    decimals: 18,
    chainId: 369,
    address: zeroAddress,
  })
  const bridgedToken = $derived(bridgeSettings.assetOut.value as Token | null)
  const updateTokenInput = (token: Token) => {
    bridgeSettings.assetIn.value = token
  }
  const updateTokenOutput = (token: Token) => {
    tokenOutput = token
  }
  const openOnRamp = () => {
    modal.open({
      view: 'OnRampProviders',
    })
  }
  const openBridge = () => {
    modal.open({
      view: 'Swap',
    })
  }
  const tokenInput = $derived(bridgeSettings.assetIn.value)
  $effect.pre(() => {
    bridgeKey.value = [Provider.PULSECHAIN, Chains.ETH, Chains.PLS]
  })
  $inspect(accountState.chainId)
  const networkIsSet = $derived(!!accountState.chainId)
  const networkMatches = $derived(accountState.chainId === Number(bridgeKey.fromChain))
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
  const targetChain = $derived(chainsMetadata[bridgeKey.fromChain])
  const switchToTargetChain = () => {
    modal.open({
      view: 'Networks',
    })
  }
  // let usdMultiplier = $state(0n)
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
</script>

<!-- {#if !networkMatches}
  <div class="flex flex-row items-center justify-center gap-4">
    <Button class="btn preset-filled-tertiary-950-50 w-fit" onclick={switchToTargetChain}>
      <span>Switch Network</span>
      <Image src={targetChain.icon} alt={targetChain.name} class="size-4" />
    </Button>
  </div> -->
{#if tokenInput}
  <div class="flex flex-col gap-4 max-w-2xl mx-auto w-full">
    <header class="flex flex-row justify-between">
      <div class="flex flex-row gap-2">
        <Button
          class="btn preset-tonal gap-1 shadow-inner border border-surface-100/20"
          onclick={openOnRamp}>
          <span>OnRamp</span>
          <Icon icon="material-symbols:ramp-left-rounded" mode="svg" class="size-6" />
        </Button>
        <Button
          class="btn preset-tonal gap-2 shadow-inner border border-surface-100/20"
          onclick={openBridge}>
          <span>Bridge</span>
          <Icon icon="icon-park-solid:bridge-one" mode="svg" class="size-6" />
        </Button>
      </div>
      <ConnectButton />
    </header>
    <div
      class="w-full card preset-outline-surface-500 bg-surface-950-50 shadow-sm hover:shadow-lg transition-all duration-100">
      <header class="flex flex-row justify-between relative">
        <!-- token that i have -->
        <div class="w-1/2 flex flex-col justify-end relative">
          <ModalWrapper
            wrapperClasses="w-full h-full"
            triggerClasses="p-4 flex relative justify-end w-full h-full items-center gap-2 text-surface-contrast-50 group">
            {#snippet button()}
              <span class="flex flex-row px-1 w-full">
                <TokenInfo
                  token={tokenInput}
                  truncate={8}
                  reversed
                  externalGroup
                  wrapperSizeClasses="w-full h-8" />
              </span>
            {/snippet}
            {#snippet contents({ close })}
              <TokenSelect
                chain={Chains.ETH}
                onsubmit={(tkn) => {
                  updateTokenInput(tkn)
                  close()
                }} />
            {/snippet}
          </ModalWrapper>
        </div>
        <!-- vertical divider -->
        <VerticalDivider>
          <Icon
            icon="mdi:run"
            class="text-surface-500 bg-surface-950-50 rounded-full w-full h-full ring-2 ring-current ring-inset p-1" />
        </VerticalDivider>
        <!-- token that i want -->
        <div class="w-1/2 flex">
          <ModalWrapper
            wrapperClasses="w-full h-full"
            triggerClasses="p-4 flex relative justify-end w-full h-full items-center gap-2 text-surface-contrast-50 group">
            {#snippet button()}
              <span class="flex flex-row px-1 w-full">
                <TokenInfo
                  token={tokenOutput}
                  truncate={8}
                  externalGroup
                  wrapperSizeClasses="w-full h-8" />
              </span>
            {/snippet}
            {#snippet contents({ close })}
              <TokenSelect
                chain={Chains.PLS}
                onsubmit={(tkn) => {
                  updateTokenOutput(tkn)
                  close()
                }} />
            {/snippet}
          </ModalWrapper>
        </div>
      </header>
    </div>
    {#if !networkIsSet || networkMatches}
      <OnboardBridge />
      <OnboardPulseX tokenOut={tokenOutput} />
    {:else}
      <div class="flex flex-row items-center justify-center gap-4">
        <Button class="btn preset-filled-tertiary-950-50 w-fit" onclick={switchToTargetChain}>
          <span>Switch Network</span>
          <Image src={targetChain.icon} alt={targetChain.name} class="size-4" />
        </Button>
      </div>
    {/if}
  </div>
{/if}
