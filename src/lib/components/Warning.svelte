<script lang="ts">
  import { loading } from '../stores/loading.svelte'
  import type { ClassValue } from 'svelte/elements'
  import Tooltip from './Tooltip.svelte'

  type Props = {
    show?: boolean
    disabled?: boolean
    placement?: 'right' | 'left'
    tooltip?: string
    wrapperPositionClass?: ClassValue
    wrapperClasses?: ClassValue
    triggerClasses?: ClassValue
  }
  const {
    show = false,
    disabled = false,
    placement = 'right' as 'right' | 'left',
    tooltip = '',
    wrapperPositionClass = 'top-0 left-0',
    wrapperClasses = 'absolute',
    triggerClasses = '',
  }: Props = $props()
  const wrapperClassNames = $derived([wrapperClasses, wrapperPositionClass])
  const resolved = $derived(loading.resolved)
  const triggerClass = $derived([
    'h-6 w-6 text-center font-black text-white rounded-md leading-6 text-sm z-20 text-center justify-center items-center',
    triggerClasses,
    {
      'bg-red-600': !disabled && resolved,
      'bg-red-400': disabled || !resolved,
    },
  ])
</script>

{#if show}
  <div class={wrapperClassNames}>
    <Tooltip {placement} triggerClasses={triggerClass}>
      {#snippet trigger()}!!{/snippet}
      {#snippet content()}{tooltip}{/snippet}
    </Tooltip>
  </div>
{/if}
