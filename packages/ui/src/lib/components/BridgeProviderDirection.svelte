<script lang="ts">
  import Icon from '@iconify/svelte'
  import { Chains, type Provider, Providers } from '@gibs/bridge-sdk/config'
  import type { ClassValue } from 'svelte/elements'
  import { clsx } from 'clsx'

  import Button from './Button.svelte'
  import ProviderIcon from './ProviderIcon.svelte'
  import StaticNetworkImage from './StaticNetworkImage.svelte'

  type Props = {
    id?: string
    provider: Provider
    fromChain: Chains
    toChain: Chains
    showProvider?: boolean
    disabled?: boolean
    onclick?: () => void
    wrapperHeightClasses?: ClassValue
    wrapperPaddingClasses?: ClassValue
    sizeClasses?: ClassValue
  }
  const { id, provider, fromChain, toChain, showProvider = false, disabled = false, onclick = () => {}, wrapperHeightClasses = 'h-5', wrapperPaddingClasses = 'p-0.5', sizeClasses = 'size-4' }: Props = $props()
  const wrapperClasses = $derived(clsx('flex flex-row bg-surface-50 dark:bg-surface-950 rounded-full border dark:border-surface-700', wrapperHeightClasses, wrapperPaddingClasses))
</script>

<div class={wrapperClasses}>
  <Button class="flex flex-row items-center gap-0 justify-center {disabled ? 'cursor-not-allowed' : ''}" onclick={onclick} disabled={disabled} {id}>
    <StaticNetworkImage network={fromChain} sizeClasses={sizeClasses} />
    <Icon icon="jam:chevron-right" class={sizeClasses} />
    {#if showProvider || provider !== Providers.PULSECHAIN}
      <ProviderIcon provider={provider} {sizeClasses} />
      <Icon icon="jam:chevron-right" class={sizeClasses} />
    {/if}
    <StaticNetworkImage network={toChain} {sizeClasses} />
  </Button>
</div>
