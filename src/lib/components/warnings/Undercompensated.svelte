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
  import { bridgeKey, FeeType, gasTipFee, percentFee } from '$lib/stores/input.svelte'
  import { formatEther } from 'viem'
  const estimatedNativeNetworkCostWithBuffer = $derived(
    (bridgeSettings.estimatedNativeNetworkCost ?? 0n) * 2n,
  )
  // $inspect(
  //   formatEther(estimatedNativeNetworkCostWithBuffer),
  //   formatEther(bridgeSettings.availableCompensationMaximum ?? 0n),
  //   bridgeSettings.feeType,
  //   gasTipFee.value,
  // )
  const amountAfterBridgeFee = $derived(bridgeSettings.amountAfterBridgeFee ?? 0n)
  const availableCompensationMaximum = $derived(bridgeSettings.availableCompensationMaximum ?? 0n)
  const estimatedNetworkCostGreaterThanAvailableCompensation = $derived(
    bridgeSettings.feeType !== FeeType.GAS_TIP &&
      estimatedNativeNetworkCostWithBuffer > availableCompensationMaximum,
  )
  const limitIsGreaterThan10PercentOfTotalBridging = $derived(
    availableCompensationMaximum > amountAfterBridgeFee / 10n,
  )
  const showUndercompensated = $derived(
    amountAfterBridgeFee > 0n &&
      (estimatedNetworkCostGreaterThanAvailableCompensation ||
        limitIsGreaterThan10PercentOfTotalBridging),
  )
  // $inspect(showUndercompensated)
</script>

{#if bridgeSettings.amountAfterBridgeFee}
  {#if !bridgeSettings.estimatedNativeNetworkCost && bridgeKey.pathway?.requiresDelivery}
    <Warning
      show
      tooltip="Unable to compute network cost. Executor will probably not deliver these tokens." />
  {:else}
    <Warning
      show={showUndercompensated}
      tooltip="Network cost could be higher than compensation when it is time to run. Try other delivery fee types, increasing the amount bridged, or the fee" />
  {/if}
{/if}
