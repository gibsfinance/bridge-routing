<script lang="ts">
  import { goto } from '$app/navigation'
  import { useAuth } from '$lib/stores/auth/methods'
  import { toPath, validBridgeKey, flippedBridgeKey, toChainId } from '$lib/stores/input'
  import { networkSwitchAssetOutAddress } from '$lib/stores/bridge-settings'
  import { walletAccount } from '$lib/stores/auth/store'

  const { switchChain } = useAuth()

  const flipDirection = async () => {
    if ($walletAccount) await switchChain($toChainId)
    await goto(`/delivery/${toPath($flippedBridgeKey)}/${flippedAddressIn}`)
  }
  $: flippedIsValid = validBridgeKey([$flippedBridgeKey])
  $: flippedAddressIn = $networkSwitchAssetOutAddress
  $: disabled = !flippedIsValid || !$networkSwitchAssetOutAddress
</script>

<div class="h-0 w-full flex relative my-1">
  <button
    type="button"
    {disabled}
    class:cursor-not-allowed={disabled}
    class:bg-purple-400={disabled}
    class:cursor-pointer={!disabled}
    class:bg-purple-600={!disabled}
    class:hover:bg-purple-500={!disabled}
    class="rounded-md w-7 h-7 box-content border-transparent absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 text-white text-sm"
    on:click={flipDirection}>
    &DoubleDownArrow;
  </button>
</div>
