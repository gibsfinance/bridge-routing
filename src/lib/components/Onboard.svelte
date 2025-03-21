<script lang="ts">
  import type { Token } from '$lib/types.svelte'
  import { Chains, Provider } from '$lib/stores/auth/types'
  import { bridgeSettings } from '$lib/stores/bridge-settings.svelte'
  import { loadPrice, priceInt, latestBlock } from '$lib/stores/chain-events.svelte'
  import { bridgeKey } from '$lib/stores/input.svelte'
  import { SvelteMap } from 'svelte/reactivity'
  import OnboardBridge from './OnboardBridge.svelte'
  import OnboardPulseX from './OnboardPulseX.svelte'
  import OnboardForeignBridge from './OnboardForeignBridge.svelte'
  import { untrack } from 'svelte'
  import { activeOnboardStep } from '$lib/stores/storage.svelte'

  const bridgedToken = $derived(bridgeSettings.assetOut as Token | null)
  $effect.pre(() => {
    bridgeKey.value = [Provider.PULSECHAIN, Chains.ETH, Chains.PLS]
  })
  const wplsTokenPrice = new SvelteMap<string, bigint | null>()
  const key = $derived(`${bridgeKey.toChain}-${bridgedToken?.address}`.toLowerCase())
  $effect.pre(() => latestBlock.watch(Number(bridgeKey.fromChain)))
  $effect.pre(() => latestBlock.watch(Number(bridgeKey.toChain)))
  const block = $derived(latestBlock.block(Number(bridgeKey.toChain)))
  $effect(() => {
    if (!bridgedToken || !block) return
    const price = loadPrice(bridgedToken, block)
    price.promise
      .then((priceResult) => {
        if (price.controller.signal.aborted) return
        const priceVal = priceInt(priceResult, bridgedToken.decimals)
        wplsTokenPrice.set(key, priceVal)
      })
      .catch(() => {
        wplsTokenPrice.set(key, 0n)
      })
    return price.cleanup
  })
</script>

<div
  class="flex flex-col max-w-lg mx-auto w-full p-2 bg-white card rounded-3xl relative overflow-hidden">
  {#if activeOnboardStep.value === 1}
    <OnboardForeignBridge />
  {:else if activeOnboardStep.value === 2}
    <OnboardBridge />
  {:else if activeOnboardStep.value === 3}
    <OnboardPulseX />
  {/if}
</div>
