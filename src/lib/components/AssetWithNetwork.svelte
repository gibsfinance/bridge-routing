<script lang="ts">
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import type { Token } from '$lib/types'
  import TokenIcon from './TokenIcon.svelte'
  import { assetSources } from '$lib/stores/bridge-settings'
  import { tokenOriginationChainId } from '$lib/stores/chain-events'
  import { loading } from '$lib/stores/loading'
  import { zeroAddress } from 'viem'

  export let asset!: Token
  export let tokenSize = 10
  export let networkSize = 5
  $: chain = asset.address !== zeroAddress && $tokenOriginationChainId && chainsMetadata[$tokenOriginationChainId]
  $: src = assetSources(asset)
  $: size = tokenSize * 4
</script>

<span class="token-image-container relative" style="--token-size: {tokenSize};">
  <TokenIcon visible {size} {src} class="overflow-hidden" />
  {#if chain && $loading.isResolved('token')}
    <img
      class="network-image absolute -bottom-1 -right-1 bg-slate-100 rounded-full"
      style="--network-size: {networkSize};"
      src={chain.icon}
      alt={chain.alt} />
  {/if}
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
