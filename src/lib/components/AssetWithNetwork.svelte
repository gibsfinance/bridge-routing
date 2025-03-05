<script lang="ts">
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import type { Token } from '$lib/types.svelte'
  import TokenIcon from './TokenIcon.svelte'
  import { assetSources } from '$lib/stores/bridge-settings.svelte'
  import { loading } from '$lib/stores/loading.svelte'
  import { zeroAddress } from 'viem'
  import Image from './Image.svelte'
  import type { Chains } from '$lib/stores/auth/types'

  type Props = {
    asset: Token
    network?: Chains
    tokenSizeClasses?: string
    networkSizeClasses?: string
  }
  const {
    asset,
    network: tokenOriginationChain,
    tokenSizeClasses = 'size-8',
    networkSizeClasses = 'size-4',
  }: Props = $props()
  const chain = $derived(
    asset.address !== zeroAddress && tokenOriginationChain && chainsMetadata[tokenOriginationChain],
  )
  const src = $derived(asset?.logoURI || assetSources(asset))
  const tokenClasses = $derived(`overflow-hidden absolute`)
  const classes = $derived(`flex basis-auto relative ${tokenSizeClasses}`)
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
