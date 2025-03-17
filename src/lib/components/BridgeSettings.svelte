<script lang="ts">
  import Button from './Button.svelte'
  import ProviderIcon from './ProviderIcon.svelte'
  import { bridgeKey, toPath } from '$lib/stores/input.svelte'
  import { Chains, Provider } from '$lib/stores/auth/types'
  import { pathways } from '$lib/stores/config.svelte'
  import _ from 'lodash'
  import { pushState } from '$app/navigation'
  import { inferBridgeKey } from '$lib/stores/bridge-settings.svelte'
  const toggleProvider = () => {
    const nextProvider =
      bridgeKey.provider === Provider.PULSECHAIN ? Provider.TOKENSEX : Provider.PULSECHAIN
    const nextKey = inferBridgeKey({
      currentKey: bridgeKey.value,
      provider: nextProvider,
    })
    bridgeKey.value = nextKey
    pushState(`#/delivery/${toPath(bridgeKey.value)}`, {})
  }
</script>

<div class="flex flex-row bg-surface-50 p-0.5 rounded-full size-5">
  <Button class="flex flex-row items-center gap-2 justify-center" onclick={toggleProvider}>
    <ProviderIcon provider={bridgeKey.provider} />
  </Button>
</div>
