<script lang="ts">
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import type { Token } from '$lib/types'
  import type { DestinationChains } from '$lib/stores/auth/types'
  import TokenIcon from './TokenIcon.svelte'
  import { assetSources, getOriginationChainId } from '$lib/stores/bridge-settings'

  export let asset!: Token
  export let tokenSize = 10
  export let networkSize = 5
  $: originationChainId = getOriginationChainId(asset)
  $: chain = chainsMetadata[`0x${originationChainId.toString(16)}` as DestinationChains]
</script>

<span class="token-image-container relative" style="--token-size: {tokenSize};">
  <TokenIcon
    visible
    size={tokenSize * 4}
    sources={assetSources(asset)}
    class="rounded-full overflow-hidden shadow-md" />
  <!-- {#if provider}
    <div class="absolute -bottom-1 -left-1 rounded-full">
      <ProviderIcon provider={$provider} size="16" />
    </div>
  {/if} -->
  <img
    class="network-image absolute -bottom-1 -right-1 bg-slate-100 rounded-full"
    style="--network-size: {networkSize};"
    src={chain.icon}
    alt={chain.alt} />
</span>

<style lang="postcss">
  .token-image-container {
    height: calc(var(--token-size) * 4px);
    width: calc(var(--token-size) * 4px);
    .network-image {
      height: calc(var(--network-size) * 4px);
      width: calc(var(--network-size) * 4px);
    }
  }
</style>
