<script lang="ts">
  import { Chains } from '$lib/stores/auth/types'
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import ProviderIcon from './ProviderIcon.svelte'
  import Image from './Image.svelte'
  import classNames from 'classnames'

  type Props = {
    network: Chains
    sizeClasses?: string
    provider?: string | null
    providerSizeClasses?: string
  }
  const {
    network,
    sizeClasses = 'size-8',
    providerSizeClasses = 'size-4',
    provider = null,
  }: Props = $props()
  const visualChain = $derived(chainsMetadata[network])
  const classes = $derived(`${sizeClasses} network-icon min-w-8`)
  const providerWrapperClasses = $derived(
    `${providerSizeClasses} absolute -bottom-1 -left-1 rounded-full`,
  )
  const wrapperClasses = $derived(classNames('relative', sizeClasses))
</script>

<div class={wrapperClasses}>
  <Image class={classes} {sizeClasses} src={visualChain.icon} alt={visualChain.alt} />
  {#if provider}
    <div class={providerWrapperClasses}>
      <ProviderIcon {provider} sizeClasses={providerSizeClasses} />
    </div>
  {/if}
</div>
