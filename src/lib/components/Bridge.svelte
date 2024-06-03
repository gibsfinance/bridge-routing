<script lang="ts">
  import FromNetwork from './FromNetwork.svelte'
  import ToNetwork from './ToNetwork.svelte'
  import Version from './Version.svelte'
  import ConnectAndBridge from './ConnectAndBridge.svelte'
  import NetworkDirection from './NetworkDirection.svelte'
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import Settings from './Settings.svelte'
  import Details from './Details.svelte'
  import { assetIn, assetOut } from '$lib/stores/bridge-settings'
  $: originationNetwork = chainsMetadata[$assetIn.hostedNetwork]
  $: destinationNetwork = chainsMetadata[$assetOut.hostedNetwork]
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

<div class="bg-slate-200 p-4 rounded-lg shadow-inner text-slate-950 my-8">
  <FromNetwork network={originationNetwork} asset={$assetIn} />
  <NetworkDirection />
  <ToNetwork {originationNetwork} {destinationNetwork} on:toggle={toggleDropdowns} asset={$assetOut} />
  {#if dropdowns.settings}
    <Settings />
  {/if}
  {#if dropdowns.details}
    <Details asset={$assetOut} {originationNetwork} {destinationNetwork} />
  {/if}
  <!-- <Version /> -->
  <div class="mt-3">
    <ConnectAndBridge />
  </div>
</div>
