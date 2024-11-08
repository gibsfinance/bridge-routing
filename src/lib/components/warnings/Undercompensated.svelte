<script lang="ts">
  import Warning from '../Warning.svelte'
  import {
    amountAfterBridgeFee,
    estimatedCost,
    desiredCompensationRatio,
    estimatedNetworkCost,
    oneEther,
  } from '$lib/stores/bridge-settings'
  import { bridgePathway } from '$lib/stores/input'
</script>

{#if $amountAfterBridgeFee}
  {#if !$estimatedNetworkCost && $bridgePathway?.requiresDelivery}
    <Warning
      show
      tooltip="Unable to compute network cost. Executor will probably not deliver these tokens." />
  {:else}
    <Warning
      show={$amountAfterBridgeFee > 0n &&
        $estimatedCost < ($estimatedNetworkCost * $desiredCompensationRatio) / oneEther}
      tooltip="Network cost could be higher than compensation when it is time to run. Try other delivery fee types, increasing the amount bridged, or the fee" />
  {/if}
{/if}
