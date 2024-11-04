<script lang="ts">
  import * as input from '$lib/stores/input'
  import { navigating, page } from '$app/stores'
  import Loading from '$lib/components/Loading.svelte'
  import { Chains, type Provider, type ChainKey } from '$lib/stores/auth/types'
  import { goto } from '$app/navigation'
  $: provider = $page.params.provider as Provider
  $: fromChain = $page.params.fromChain as ChainKey
  $: toChain = $page.params.toChain as ChainKey
  $: bridgeKey = [provider, Chains[fromChain], Chains[toChain]] as input.BridgeKey
  $: if (!input.validBridgeKey([bridgeKey])) {
    console.log('invalid bridge key', bridgeKey)
    goto(`/delivery/${input.toPath(input.defaultBridgeKey)}/${$page.params.assetInAddress}`)
  } else {
    input.bridgeKey.set(bridgeKey)
  }
</script>

<div class="bg-slate-950 flex min-h-[100vh] w-full">
  {#if $navigating}
    <Loading />
  {:else}
    <slot />
  {/if}
</div>
