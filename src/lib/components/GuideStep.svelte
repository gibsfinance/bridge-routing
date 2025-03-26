<script lang="ts">
  import Tooltip from './Tooltip.svelte'
  import { showTooltips } from '$lib/stores/storage.svelte'
  import classNames from 'classnames'
  import type { ClassParam } from '$lib/types.svelte'
  import type { Snippet } from 'svelte'
  type Props = {
    placement?: 'top' | 'bottom' | 'left' | 'right'
    children: Snippet
    step: number | string
    triggerClass?: ClassParam
    contentClass?: ClassParam
  }
  const { placement = 'top', children, step, triggerClass, contentClass }: Props = $props()
  const triggerVisible = $derived(showTooltips.value)
  const contentClasses = $derived(
    classNames('card preset-filled-primary-500 text-sm px-2 py-1', contentClass),
  )
  const triggerClasses = $derived(
    classNames(
      'flex items-center justify-center bg-surface-50 border-2 border-secondary-500 rounded-full size-8 leading-6 shadow text-contrast-surface-50 text-secondary-500 pointer-events-auto',
      triggerClass,
      { invisible: !triggerVisible },
    ),
  )
</script>

{#snippet trigger()}{step}{/snippet}
{#snippet content()}{@render children?.()}{/snippet}
<Tooltip
  positioning={{ placement, gutter: 2 }}
  {triggerClasses}
  openDelay={0}
  closeDelay={0}
  interactive={false}
  {contentClasses}
  {trigger}
  {content}>
</Tooltip>
