<script lang="ts">
  import * as input from '../stores/input.svelte'
  import { Provider } from '../stores/auth/types'
  import * as nav from '../stores/nav.svelte'
  import { inferBridgeKey } from '../stores/bridge-settings.svelte'
  import { zeroAddress } from 'viem'
  import BridgeProviderDirection from './BridgeProviderDirection.svelte'
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
    nav.bridge.shallow(input.bridgeKey.value, zeroAddress)
  }
  const provider = $derived(input.bridgeKey.provider)
  const fromChain = $derived(input.bridgeKey.fromChain)
  const toChain = $derived(input.bridgeKey.toChain)
</script>

<BridgeProviderDirection {provider} {fromChain} {toChain} onclick={toggleProvider} />
