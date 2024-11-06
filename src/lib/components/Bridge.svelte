<script lang="ts">
  import FromNetwork from './FromNetwork.svelte'
  import ToNetwork from './ToNetwork.svelte'
  import ConnectAndBridge from './ConnectAndBridge.svelte'
  import NetworkDirection from './NetworkDirection.svelte'
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import Settings from './Settings.svelte'
  import Details from './Details.svelte'
  import { assetOut } from '$lib/stores/bridge-settings'
  import * as input from '$lib/stores/input'
  const { fromChainId, toChainId, assetIn } = input
  $: originationNetwork = chainsMetadata[$fromChainId]
  $: destinationNetwork = chainsMetadata[$toChainId]
  let dropdowns: Record<string, boolean> = {}
  const toggleDropdowns = (e: CustomEvent) => {
    for (const k of Object.keys(dropdowns)) {
      if (k !== e.detail) {
        dropdowns[k] = false
      }
    }
    dropdowns[e.detail] = !dropdowns[e.detail]
  }
</script>

<div class="bg-slate-200 p-3 md:p-4 rounded-lg shadow-inner text-slate-950 my-8">
  <FromNetwork network={originationNetwork} asset={$assetIn} value={input.amountIn} />
  <NetworkDirection />
  <ToNetwork {destinationNetwork} on:toggle={toggleDropdowns} asset={$assetOut} />
  {#if dropdowns.settings}
    <Settings />
  {/if}
  {#if dropdowns.details}
    <Details asset={$assetOut} />
  {/if}
  <div class="mt-4">
    <ConnectAndBridge />
  </div>
</div>
