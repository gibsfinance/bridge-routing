<script lang="ts">
  import { goto } from '$app/navigation'
  import { toPath, bridgeKey } from '$lib/stores/input.svelte'
  import { bridgeSettings } from '$lib/stores/bridge-settings.svelte'
  import { switchNetwork, accountState } from '$lib/stores/auth/AuthProvider.svelte'
  import { pathway } from '$lib/stores/config.svelte'

  const flipDirection = async () => {
    const flippedBridgeKey = bridgeKey.partner
    if (accountState.address) {
      await switchNetwork(bridgeKey.partnerChain)
    }
    await goto(
      `#/delivery/${toPath(flippedBridgeKey)}/${bridgeSettings.networkSwitchAssetOutAddress}`,
    )
  }
  const flippedIsValid = $derived(!!pathway(bridgeKey.partner))
  const disabled = $derived(!flippedIsValid || !bridgeSettings.networkSwitchAssetOutAddress)
</script>

<div class="relative my-1 flex h-0 w-full">
  <button
    type="button"
    {disabled}
    class:cursor-not-allowed={disabled}
    class:bg-tertiary-400={disabled}
    class:cursor-pointer={!disabled}
    class:bg-tertiary-600={!disabled}
    class:hover:bg-tertiary-500={!disabled}
    class="absolute left-1/2 top-1/2 box-content h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-md border-transparent text-sm text-white"
    onclick={flipDirection}>
    &DoubleDownArrow;
  </button>
</div>
