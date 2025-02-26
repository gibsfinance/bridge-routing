<script lang="ts">
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import type { Token } from '$lib/types.svelte'
  import TokenIcon from './TokenIcon.svelte'
  import { assetSources } from '$lib/stores/bridge-settings.svelte'
  import { tokenOriginationChainId } from '$lib/stores/chain-events.svelte'
  import { loading } from '$lib/stores/loading.svelte'
  import { zeroAddress } from 'viem'
  import { assetLink } from '$lib/stores/chain-events.svelte'
  import Image from './Image.svelte'

  type Props = {
    asset: Token
    tokenSizeClasses?: string
    networkSizeClasses?: string
  }
  const { asset, tokenSizeClasses = 'size-8', networkSizeClasses = 'size-4' }: Props = $props()
  const tokenOriginationChain = $derived(tokenOriginationChainId(assetLink.value))
  const chain = $derived(
    asset.address !== zeroAddress && tokenOriginationChain && chainsMetadata[tokenOriginationChain],
  )
  const src = $derived(assetSources(asset))
  const tokenClasses = $derived(`overflow-hidden absolute`)
  const classes = $derived(`relative ${tokenSizeClasses}`)
</script>

<span class={classes} title={asset.symbol}>
  <TokenIcon visible sizeClasses={tokenSizeClasses} class={tokenClasses} {src} />
  {#if chain && loading.isResolved('token')}
    <Image
      class="network-image absolute -right-1 -bottom-1 rounded-full bg-slate-100"
      sizeClasses={networkSizeClasses}
      src={chain.icon}
      alt={chain.alt} />
  {/if}
</span>
<!--
<style lang="postcss">
  @reference "tailwindcss/theme";
  .token-image-container {
    height: calc(var(--token-size));
    width: calc(var(--token-size));
    :global(.network-image) {
      height: calc(var(--network-size));
      width: calc(var(--network-size));
    }
  }
</style> -->
