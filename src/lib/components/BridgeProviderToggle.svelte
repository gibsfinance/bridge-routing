<script lang="ts">
  import Button from './Button.svelte'
  import ProviderIcon from './ProviderIcon.svelte'
  import * as input from '$lib/stores/input.svelte'
  import { Provider } from '$lib/stores/auth/types'
  import * as nav from '$lib/stores/nav.svelte'
  import { inferBridgeKey } from '$lib/stores/bridge-settings.svelte'
  import { zeroAddress } from 'viem'
  const toggleProvider = () => {
    const nextProvider =
      input.bridgeKey.provider === Provider.PULSECHAIN ? Provider.TOKENSEX : Provider.PULSECHAIN
    const nextKey = inferBridgeKey({
      currentKey: input.bridgeKey.value,
      provider: nextProvider,
    })
    input.bridgeKey.value = nextKey
    input.amountIn.value = null
    input.resetFeeInputs()
    input.bridgeKey.assetInAddress = null
    console.log(input.bridgeKey.value, zeroAddress)
    nav.delivery.shallow(input.bridgeKey.value, zeroAddress)
  }
</script>

<div class="flex flex-row bg-surface-50 p-0.5 rounded-full size-5">
  <Button class="flex flex-row items-center gap-2 justify-center" onclick={toggleProvider}>
    <ProviderIcon provider={input.bridgeKey.provider} />
  </Button>
</div>
