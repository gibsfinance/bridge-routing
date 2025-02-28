<script lang="ts">
  import { Tooltip } from '@skeletonlabs/skeleton-svelte'
  import type { Snippet } from 'svelte'
  import classNames from 'classnames'
  type Props = {
    placement?: 'top' | 'bottom' | 'left' | 'right'
    show?: boolean
    maxWidth?: string
    tooltip?: string
    children?: Snippet
    class?: string
    openDelay?: number
    closeDelay?: number
    positionerClassName?: string
  }
  let {
    placement,
    show = false,
    maxWidth = 'max-w-[380px]',
    tooltip,
    children,
    class: className,
    positionerClassName,
    openDelay = 0,
    closeDelay = 0,
  }: Props = $props()
  const classes = $derived(classNames('relative flex tooltip-container', className))
  const positionerClasses = $derived(classNames('pointer-events-none', positionerClassName))
</script>

<Tooltip
  bind:open={show}
  positioning={{ placement, gutter: 4 }}
  {closeDelay}
  interactive={false}
  {classes}
  triggerClasses="flex"
  contentBase="card preset-filled-tertiary-500 text-sm px-2 py-1 {maxWidth}"
  {positionerClasses}
  {openDelay}>
  {#snippet trigger()}{@render children?.()}{/snippet}
  {#snippet content()}{tooltip}{/snippet}
</Tooltip>
