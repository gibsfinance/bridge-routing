<script lang="ts">
  import Button from './Button.svelte'
  import ProviderIcon from './ProviderIcon.svelte'
  import * as input from '../stores/input.svelte'
  import { Provider } from '../stores/auth/types'
  import * as nav from '../stores/nav.svelte'
  import { inferBridgeKey } from '../stores/bridge-settings.svelte'
  import { zeroAddress } from 'viem'
  import StaticNetworkImage from './StaticNetworkImage.svelte'
  import Icon from '@iconify/svelte'
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
    nav.delivery.shallow(input.bridgeKey.value, zeroAddress)
  }
</script>

<div class="flex flex-row bg-surface-50 p-0.5 rounded-full h-5 border">
  <Button class="flex flex-row items-center gap-0 justify-center" onclick={toggleProvider}>
    <StaticNetworkImage network={input.bridgeKey.fromChain} sizeClasses="size-4" />
    <Icon icon="jam:chevron-right" />
    <ProviderIcon provider={input.bridgeKey.provider} />
    <Icon icon="jam:chevron-right" />
    <StaticNetworkImage network={input.bridgeKey.toChain} sizeClasses="size-4" />
  </Button>
</div>
