<script lang="ts">
  import type { ClassParam } from '$lib/types.svelte'
  import { loading } from '$lib/stores/loading.svelte'
  import classNames from 'classnames'
  import Tooltip from './Tooltip.svelte'

  type Props = {
    show?: boolean
    disabled?: boolean
    placement?: 'right' | 'left'
    tooltip?: string
    wrapperPositionClass?: ClassParam
    wrapperClasses?: ClassParam
    triggerClasses?: ClassParam
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
  const wrapperClassNames = $derived(classNames(wrapperClasses, wrapperPositionClass))
  const resolved = $derived(loading.resolved)
  const triggerClass = $derived(
    classNames(
      'h-6 w-6 text-center font-black text-white rounded-md leading-6 text-sm z-20 text-center justify-center items-center',
      triggerClasses,
      {
        'bg-red-600': !disabled && resolved,
        'bg-red-400': disabled || !resolved,
      },
    ),
  )
</script>

{#if show}
  <div class={wrapperClassNames}>
    <Tooltip {placement} triggerClasses={triggerClass}>
      {#snippet trigger()}!!{/snippet}
      {#snippet content()}{tooltip}{/snippet}
    </Tooltip>
  </div>
{/if}
