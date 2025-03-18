<script lang="ts">
  import type { Token } from '$lib/types.svelte'
  import { zeroAddress } from 'viem'
  import { Chains, Provider } from '$lib/stores/auth/types'
  import { modal } from '$lib/stores/auth/AuthProvider.svelte'
  import { bridgeSettings } from '$lib/stores/bridge-settings.svelte'
  import { loadPrice, priceInt, latestBlock } from '$lib/stores/chain-events.svelte'
  import { bridgeKey } from '$lib/stores/input.svelte'
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import { SvelteMap } from 'svelte/reactivity'
  import OnboardBridge from './OnboardBridge.svelte'
  import OnboardPulseX from './OnboardPulseX.svelte'
  import OnboardForeignBridge from './OnboardForeignBridge.svelte'
  import { untrack } from 'svelte'
  import { activeOnboardStep } from '$lib/stores/storage.svelte'

  const bridgedToken = $derived(bridgeSettings.assetOut as Token | null)
  const tokenInput = $derived(bridgeSettings.assetIn.value)
  // const networkIsSet = $derived(!!accountState.chainId)
  // const networkMatches = $derived(accountState.chainId === Number(bridgeKey.fromChain))
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
  const targetChain = $derived(chainsMetadata[bridgeKey.fromChain])
  const switchToTargetChain = () => {
    modal.open({
      view: 'Networks',
    })
  }
  const wplsTokenPrice = new SvelteMap<string, bigint | null>()
  const key = $derived(`${bridgeKey.toChain}-${bridgedToken?.address}`.toLowerCase())
  $effect(() => untrack(() => latestBlock.watch(Number(bridgeKey.fromChain))))
  $effect(() => untrack(() => latestBlock.watch(Number(bridgeKey.toChain))))
  $effect(() => {
    const block = latestBlock.block(Number(bridgeKey.toChain))
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

{#if tokenInput}
  <div
    class="flex flex-col max-w-lg mx-auto w-full p-2 bg-white card rounded-3xl relative overflow-hidden">
    {#if activeOnboardStep.value === 1}
      <OnboardForeignBridge />
    {:else if activeOnboardStep.value === 2}
      <OnboardBridge />
    {:else if activeOnboardStep.value === 3}
      <OnboardPulseX />
    {/if}
    <!-- {#if !networkIsSet || networkMatches}
    {:else}
      <div class="flex flex-row items-center justify-center gap-4">
        <Button class="btn preset-filled-tertiary-950-50 w-fit" onclick={switchToTargetChain}>
          <span>Switch Network</span>
          <Image src={targetChain.logoURI} alt={targetChain.name} class="size-4" />
        </Button>
      </div>
    {/if} -->
  </div>
{/if}
