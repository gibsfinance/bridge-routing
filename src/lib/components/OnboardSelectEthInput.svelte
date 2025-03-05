<script lang="ts">
  import type { Token } from '$lib/types.svelte'
  import { zeroAddress } from 'viem'
  import TokenInfo from './TokenInfo.svelte'
  import ModalWrapper from './ModalWrapper.svelte'
  import TokenSelect from './TokenSelect.svelte'
  import { Chains, Provider } from '$lib/stores/auth/types'
  import { accountState } from '$lib/stores/auth/AuthProvider.svelte'
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
  import type { Snippet } from 'svelte'
  const {
    namePrefix,
    side = 'left',
    children,
  }: { namePrefix?: string; side?: 'left' | 'right'; children?: Snippet } = $props()

  const bridgedToken = $derived(bridgeSettings.assetOut.value as Token | null)
  const updateTokenInput = (token: Token) => {
    bridgeSettings.assetIn.value = token
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
  const token = $derived.by(() =>
    tokenInput
      ? {
          ...tokenInput,
          name: namePrefix ?? tokenInput.name,
        }
      : null,
  )
</script>

{#if token}
  <div class="w-1/2 flex flex-row justify-end relative">
    <ModalWrapper
      wrapperClasses="grow h-full"
      triggerClasses="p-4 flex relative justify-end grow h-full items-center gap-2 text-surface-contrast-50 group w-full">
      {#snippet button()}
        <span class="flex flex-row px-1 w-full">
          <TokenInfo
            {token}
            truncate={8}
            reversed={side === 'left'}
            externalGroup
            wrapperSizeClasses="w-full h-8"
            nameClasses="text-base" />
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
    {@render children?.()}
  </div>
{/if}
