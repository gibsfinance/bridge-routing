<script lang="ts">
  import Icon from '@iconify/svelte'
  import type { ClassValue } from 'svelte/elements'

  import type { Token } from '@gibs/bridge-sdk/types'

  import AssetWithNetwork from './AssetWithNetwork.svelte'

  type Props = {
    token: Token | null
    network?: number
    hideChevron?: boolean
    disableHover?: boolean
    class?: ClassValue
  }
  const {
    class: className,
    token,
    network,
    hideChevron = false,
    disableHover = false,
  }: Props = $props()
  const classes = $derived([
    'flex flex-row items-center justify-center h-full p-0.5 rounded-full pl-2',
    hideChevron ? 'gap-2' : '',
    className,
  ])
</script>

<div
  class={classes}
  class:hover:bg-surface-50={!disableHover}
  class:border={!hideChevron}
  class:shadow-sm={!hideChevron}
  title={token?.address}>
  <span class="flex flex-row items-center justify-center">
    <span class="text-surface-contrast-50 leading-8 text-sm font-bold">{token?.symbol}</span>
    {#if !hideChevron}
      <Icon icon="mdi:chevron-down" class="text-surface-500 h-6 w-6 justify-self-start" />
    {/if}
  </span>
  <AssetWithNetwork asset={token} {network} />
</div>
