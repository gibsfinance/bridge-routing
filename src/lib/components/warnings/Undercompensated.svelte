<script lang="ts">
  import Warning from '../Warning.svelte'
  import {
    amountAfterBridgeFee,
    estimatedCost,
    desiredCompensationRatio,
    estimatedNetworkCost,
    oneEther,
  } from '$lib/stores/bridge-settings'
</script>

<Warning
  show={$amountAfterBridgeFee > 0n && $estimatedCost < ($estimatedNetworkCost * $desiredCompensationRatio) / oneEther}
  tooltip="Network cost is higher than estimated compensation. Executor may refuse to run. Try other delivery fee types, increasing the amount bridged, or the fee" />
