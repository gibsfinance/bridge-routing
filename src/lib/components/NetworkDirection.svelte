<script lang="ts">
  import { goto } from '$app/navigation'
  import { bridgeKey, toPath, validBridgeKey, type BridgeKey } from '$lib/stores/input'
  import { zeroAddress } from 'viem'

  const flipDirection = async () => {
    await goto(`/delivery/${toPath(flippedBridgeKey)}/${flippedAddressIn}`)
  }
  $: provider = $bridgeKey[0]
  $: fromChain = $bridgeKey[1]
  $: toChain = $bridgeKey[2]
  $: flippedBridgeKey = [provider, toChain, fromChain] as BridgeKey
  $: flippedIsValid = validBridgeKey([flippedBridgeKey])
  $: flippedAddressIn = zeroAddress
  $: disabled = !flippedIsValid
</script>

<div class="h-0 w-full flex relative my-1">
  <button
    type="button"
    {disabled}
    class:cursor-not-allowed={disabled}
    class:bg-purple-400={disabled}
    class:cursor-pointer={!disabled}
    class:bg-purple-700={!disabled}
    class="rounded-md w-7 h-7 box-content border-transparent absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 text-white text-sm"
    on:click={flipDirection}>
    &DoubleDownArrow;
  </button>
</div>
