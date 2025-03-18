<script lang="ts">
  import { Tooltip } from '@skeletonlabs/skeleton-svelte'
  import type { Snippet } from 'svelte'
  import classNames from 'classnames'
  import type { ClassParam } from '$lib/types.svelte'
  type Props = {
    placement?: 'top' | 'bottom' | 'left' | 'right'
    maxWidth?: string
    tooltip?: string
    children?: Snippet
    class?: ClassParam
    openDelay?: number
    closeDelay?: number
    positionerClassName?: ClassParam
    triggerClassName?: ClassParam
    gutter?: number
  }
  let {
    placement,
    maxWidth = 'max-w-[380px]',
    tooltip,
    children,
    class: className,
    positionerClassName,
    openDelay = 0,
    closeDelay = 0,
    triggerClassName,
    gutter = 4,
  }: Props = $props()
  let open = $state(false)
  const classes = $derived(classNames('relative flex tooltip-container', className))
  const positionerClasses = $derived(classNames('pointer-events-none', positionerClassName))
  const onOpenChange = (details: { open: boolean }) => {
    open = details.open
  }
  const triggerClasses = $derived(classNames('flex', triggerClassName))
</script>

<Tooltip
  {open}
  positioning={{ placement, gutter }}
  {closeDelay}
  interactive={false}
  {classes}
  {triggerClasses}
  contentBase="card preset-filled-tertiary-500 text-sm px-2 py-1 {maxWidth}"
  {positionerClasses}
  {openDelay}
  {onOpenChange}>
  {#snippet trigger()}{@render children?.()}{/snippet}
  {#snippet content()}{tooltip}{/snippet}
</Tooltip>
