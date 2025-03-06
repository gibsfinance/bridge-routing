<script lang="ts">
  import { Tooltip } from '@skeletonlabs/skeleton-svelte'
  import type { Snippet } from 'svelte'
  import classNames from 'classnames'
  type Props = {
    placement?: 'top' | 'bottom' | 'left' | 'right'
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
    maxWidth = 'max-w-[380px]',
    tooltip,
    children,
    class: className,
    positionerClassName,
    openDelay = 0,
    closeDelay = 0,
  }: Props = $props()
  let open = $state(false)
  const classes = $derived(classNames('relative flex tooltip-container', className))
  const positionerClasses = $derived(classNames('pointer-events-none', positionerClassName))
  const onOpenChange = (details: { open: boolean }) => {
    open = details.open
  }
</script>

<Tooltip
  {open}
  positioning={{ placement, gutter: 4 }}
  {closeDelay}
  interactive={false}
  {classes}
  triggerClasses="flex"
  contentBase="card preset-filled-tertiary-500 text-sm px-2 py-1 {maxWidth}"
  {positionerClasses}
  {openDelay}
  {onOpenChange}>
  {#snippet trigger()}{@render children?.()}{/snippet}
  {#snippet content()}{tooltip}{/snippet}
</Tooltip>
