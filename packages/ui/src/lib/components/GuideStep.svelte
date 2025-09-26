<script lang="ts">
  import Tooltip from './Tooltip.svelte'
  import type { ClassValue } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  type Props = {
    placement?: 'top' | 'bottom' | 'left' | 'right'
    children: Snippet
    step: number | string
    triggerClass?: ClassValue
    contentClass?: ClassValue
    triggerWrapperPositionClass?: ClassValue
  }
  const {
    placement = 'top',
    children,
    step,
    triggerClass,
    triggerWrapperPositionClass = 'top-0 left-0',
    contentClass,
  }: Props = $props()
  const contentClasses = $derived([
    'card preset-filled-primary-500 text-sm px-2 py-1',
    contentClass,
  ])
  const triggerClasses = $derived([
    'flex items-center justify-center bg-surface-50 border-2 border-secondary-500 rounded-full size-8 leading-6 shadow text-surface-50 text-secondary-500 pointer-events-auto',
    triggerClass,
    // { invisible: !triggerVisible },
  ])
  const trigWrapperPositionClasses = $derived([triggerWrapperPositionClass])
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
  class={trigWrapperPositionClasses}
  {trigger}
  {content}>
</Tooltip>
