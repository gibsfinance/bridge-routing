<script lang="ts">
  import { zeroAddress } from 'viem'
  import { Provider, inferBridgeKey } from '@gibs/bridge-sdk/config'

  import * as input from '../stores/input.svelte'
  import * as nav from '../stores/nav.svelte'

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
