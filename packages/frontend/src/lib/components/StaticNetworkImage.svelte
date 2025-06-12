<script lang="ts">
  import { toChain, type VisualChain } from '../stores/auth/types'
  import { chainsMetadata } from '../stores/auth/constants'
  import ProviderIcon from './ProviderIcon.svelte'
  import Image from './Image.svelte'
  import * as imageLinks from '../stores/image-links'
  import type { ClassValue } from 'svelte/elements'
  import clsx from 'clsx'

  type Props = {
    network: number | string
    icon?: string
    sizeClasses?: ClassValue
    provider?: string | null
    providerSizeClasses?: ClassValue
  }
  const {
    network,
    sizeClasses = 'size-8',
    providerSizeClasses = 'size-4',
    provider = null,
    icon,
  }: Props = $props()
  const visualChain = $derived((chainsMetadata[toChain(network)] || null) as VisualChain | null)
  const classes = $derived(clsx([sizeClasses, 'network-icon']))
  const providerWrapperClasses = $derived(
    clsx([providerSizeClasses, 'absolute -bottom-1 -left-1 rounded-full']),
  )
  const wrapperClasses = $derived(clsx(['relative', sizeClasses]))
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
