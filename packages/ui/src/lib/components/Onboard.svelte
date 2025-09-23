<script lang="ts">
  import type { Token } from '@gibs/bridge-sdk/types'
  import { Chains, Providers } from '@gibs/bridge-sdk/config'
  import { SvelteMap } from 'svelte/reactivity'

  import { bridgeSettings } from '../stores/bridge-settings.svelte'
  import { loadPrice, priceInt, latestBlock, blocks } from '../stores/chain-events.svelte'
  import { bridgeKey } from '../stores/input.svelte'

  import OnboardForeignBridge from './OnboardForeignBridge.svelte'

  const bridgedToken = $derived(bridgeSettings.assetOut as Token | null)
  $effect(() => {
    // while on the onboarding page, we only care about eth -> pls
    bridgeKey.value = [Providers.PULSECHAIN, Chains.ETH, Chains.PLS]
  })
  const wplsTokenPrice = new SvelteMap<string, bigint | null>()
  const key = $derived(`${bridgeKey.toChain}-${bridgedToken?.address}`.toLowerCase())
  $effect(() => latestBlock(Number(bridgeKey.fromChain)))
  $effect(() => latestBlock(Number(bridgeKey.toChain)))
  const block = $derived(blocks.get(Number(bridgeKey.toChain))?.get('latest')?.block ?? null)
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
  class="flex flex-col max-w-lg mx-auto w-full p-2 bg-white card rounded-3xl relative overflow-hidden gap-2">
  <OnboardForeignBridge />
</div>
