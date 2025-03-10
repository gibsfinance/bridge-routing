<script lang="ts">
  import type { ClassParam, Token } from '$lib/types.svelte'
  import TokenIcon from './TokenIcon.svelte'
  import { assetSources } from '$lib/stores/bridge-settings.svelte'
  import { loading } from '$lib/stores/loading.svelte'
  import Image from './Image.svelte'
  import classNames from 'classnames'
  import { availableChains } from '$lib/stores/lifi.svelte'

  type Props = {
    class?: ClassParam
    asset: Token
    network?: number
    tokenSizeClasses?: string
    networkSizeClasses?: string
  }
  const {
    asset,
    tokenSizeClasses = 'size-8',
    networkSizeClasses = 'size-4',
    class: className = '',
  }: Props = $props()
  const chain = $derived(availableChains.get(Number(asset.chainId)))
  const src = $derived(asset?.logoURI || assetSources(asset))
  const tokenClasses = $derived(`overflow-hidden absolute`)
  const classes = $derived(
    classNames('flex basis-auto relative text-surface-contrast-50', tokenSizeClasses, className),
  )
</script>

<span class={classes} title={asset.symbol}>
  <TokenIcon visible sizeClasses={tokenSizeClasses} class={tokenClasses} {src} />
  {#if chain && loading.isResolved('token')}
    <Image
      class="network-image absolute -right-0.5 -bottom-0.5 rounded-full"
      sizeClasses={networkSizeClasses}
      src={chain.logoURI}
      alt={chain.name} />
  {/if}
</span>
