<script lang="ts">
  import * as input from '$lib/stores/input.svelte'
  import { navigating, page } from '$app/state'
  import { pathway } from '$lib/stores/config.svelte'
  import Loading from '$lib/components/Loading.svelte'
  import { Chains, type Provider, type ChainKey } from '$lib/stores/auth/types'
  import { goto } from '$app/navigation'
  import { getAddress, isAddress, type Hex } from 'viem'
  const provider = $derived(page.params.provider as Provider)
  const fromChain = $derived(page.params.fromChain as ChainKey)
  const toChain = $derived(page.params.toChain as ChainKey)
  const bridgeKey = $derived([provider, Chains[fromChain], Chains[toChain]] as input.BridgeKey)

  $effect(() => {
    if (!pathway(bridgeKey)) {
      const bridgeKeyPath = input.toPath(input.defaultBridgeKey)
      goto(`#/delivery/${bridgeKeyPath}/${page.params.assetInAddress}`)
    } else {
      input.bridgeKey.value = bridgeKey
      let assetInAddress = page.params.assetInAddress as Hex | null
      if (assetInAddress && isAddress(assetInAddress)) {
        assetInAddress = getAddress(assetInAddress)
      } else {
        assetInAddress = null
      }
      input.assetInAddress.value = assetInAddress
    }
  })
  const props = $props()
</script>

<div class="custom-height flex w-full bg-slate-950">
  {#if navigating.to}
    <Loading />
  {:else}
    {@render props.children()}
  {/if}
</div>

<style lang="postcss">
  @reference "tailwindcss/theme";
  .custom-height {
    /* min-height: calc(100vh - 100px); */
  }
</style>
