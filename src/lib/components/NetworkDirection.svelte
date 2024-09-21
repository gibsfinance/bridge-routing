<script lang="ts">
  import { goto } from '$app/navigation'
  import { flippedTokenAddressIn, toPath, validBridgeKey, flippedBridgeKey } from '$lib/stores/input'
  import { zeroAddress } from 'viem'

  const flipDirection = async () => {
    await goto(`/delivery/${toPath($flippedBridgeKey)}/${flippedAddressIn}`)
  }
  $: flippedIsValid = validBridgeKey([$flippedBridgeKey])
  $: flippedAddressIn = $flippedTokenAddressIn || zeroAddress
  $: disabled = !flippedIsValid
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
