<script lang="ts">
  import type { Token } from '$lib/types.svelte'
  import { zeroAddress } from 'viem'
  import Button from './Button.svelte'
  import { Chains, Provider } from '$lib/stores/auth/types'
  import { accountState, modal } from '$lib/stores/auth/AuthProvider.svelte'
  import { bridgeSettings } from '$lib/stores/bridge-settings.svelte'
  import { loadPrice, priceInt, latestBlock } from '$lib/stores/chain-events.svelte'
  import { bridgeKey } from '$lib/stores/input.svelte'
  import Image from './Image.svelte'
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import { SvelteMap } from 'svelte/reactivity'
  import OnboardBridge from './OnboardBridge.svelte'
  import OnboardPulseX from './OnboardPulseX.svelte'
  import OnboardSettings from './OnboardSettings.svelte'
  import OnboardForeignBridge from './OnboardForeignBridge.svelte'
  import { untrack } from 'svelte'

  const bridgedToken = $derived(bridgeSettings.assetOut.value as Token | null)
  const tokenInput = $derived(bridgeSettings.assetIn.value)
  const networkIsSet = $derived(!!accountState.chainId)
  const networkMatches = $derived(accountState.chainId === Number(bridgeKey.fromChain))
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
  <div class="flex flex-col gap-4 max-w-2xl mx-auto w-full">
    <OnboardSettings />
    <OnboardForeignBridge />
    <OnboardBridge />
    <OnboardPulseX />
    <!-- {#if !networkIsSet || networkMatches}
    {:else}
      <div class="flex flex-row items-center justify-center gap-4">
        <Button class="btn preset-filled-tertiary-950-50 w-fit" onclick={switchToTargetChain}>
          <span>Switch Network</span>
          <Image src={targetChain.icon} alt={targetChain.name} class="size-4" />
        </Button>
      </div>
    {/if} -->
  </div>
{/if}
