<script lang="ts">
  import Warning from '../Warning.svelte'
  import { bridgeSettings } from '../../stores/bridge-settings.svelte'
  import { bridgeKey } from '../../stores/input.svelte'
</script>

{#if bridgeSettings.amountAfterBridgeFee}
  {#if !bridgeSettings.estimatedNativeNetworkCost && bridgeKey.pathway?.requiresDelivery}
    <Warning
      show
      tooltip="Unable to compute network cost. Executor will probably not deliver these tokens." />
  {:else}
    <Warning
      wrapperPositionClass="top-1 -left-6"
      show={bridgeSettings.isUndercompensated}
      tooltip="Network cost could be higher than compensation when it is time to run. Try other delivery fee types, increasing the amount bridged, or the fee" />
  {/if}
{/if}
