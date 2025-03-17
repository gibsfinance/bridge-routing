<script lang="ts">
  import { Chains, toChain, type ChainsMetadata, type VisualChain } from '$lib/stores/auth/types'
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import ProviderIcon from './ProviderIcon.svelte'
  import Image from './Image.svelte'
  import classNames from 'classnames'
  import * as imageLinks from '$lib/stores/image-links'

  type Props = {
    network: number | string
    icon?: string
    sizeClasses?: string
    provider?: string | null
    providerSizeClasses?: string
  }
  const {
    network,
    sizeClasses = 'size-8',
    providerSizeClasses = 'size-4',
    provider = null,
    icon,
  }: Props = $props()
  const visualChain = $derived((chainsMetadata[toChain(network)] || null) as VisualChain | null)
  const classes = $derived(`${sizeClasses} network-icon`)
  const providerWrapperClasses = $derived(
    `${providerSizeClasses} absolute -bottom-1 -left-1 rounded-full`,
  )
  const wrapperClasses = $derived(classNames('relative', sizeClasses))
</script>

<div class={wrapperClasses}>
  <Image
    class={classes}
    {sizeClasses}
    src={icon ?? visualChain?.logoURI ?? imageLinks.network(Number(network))}
    alt={visualChain?.alt || null} />
  {#if provider}
    <div class={providerWrapperClasses}>
      <ProviderIcon {provider} sizeClasses={providerSizeClasses} />
    </div>
  {/if}
</div>
