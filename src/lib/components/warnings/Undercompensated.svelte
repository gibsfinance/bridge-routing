<script lang="ts">
  import Warning from '../Warning.svelte'
  import {
    // amountAfterBridgeFee,
    // estimatedCost,
    // desiredCompensationRatio,
    // estimatedNetworkCost,
    oneEther,
    bridgeSettings,
  } from '$lib/stores/bridge-settings.svelte'
  import { bridgeKey } from '$lib/stores/input.svelte'
</script>

{#if bridgeSettings.amountAfterBridgeFee}
  {#if !bridgeSettings.estimatedNetworkCost && bridgeKey.pathway?.requiresDelivery}
    <Warning
      show
      tooltip="Unable to compute network cost. Executor will probably not deliver these tokens." />
  {:else}
    <Warning
      show={bridgeSettings.amountAfterBridgeFee > 0n &&
        bridgeSettings.estimatedCost <
          (bridgeSettings.estimatedNetworkCost * bridgeSettings.desiredCompensationRatio) /
            oneEther}
      tooltip="Network cost could be higher than compensation when it is time to run. Try other delivery fee types, increasing the amount bridged, or the fee" />
  {/if}
{/if}
