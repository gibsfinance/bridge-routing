<script lang="ts">
  import { Tooltip } from '@skeletonlabs/skeleton-svelte'
  import type { Snippet } from 'svelte'
  import classNames from 'classnames'
  import type { ClassParam } from '$lib/types.svelte'
  type Props = {
    placement?: 'top' | 'bottom' | 'left' | 'right'
    positioning?: {
      placement?: 'top' | 'bottom' | 'left' | 'right'
      gutter?: number
    }
    maxWidth?: string
    tooltip?: string
    content?: Snippet
    class?: ClassParam
    openDelay?: number
    closeDelay?: number
    positionerClassName?: ClassParam
    contentClasses?: ClassParam
    triggerClasses?: ClassParam
    gutter?: number
    interactive?: boolean
    // open: boolean
    trigger: Snippet
    onOpenChange?: (details: { open: boolean }) => void
  }
  let {
    placement,
    maxWidth = 'max-w-[380px]',
    class: className,
    positionerClassName,
    openDelay = 0,
    closeDelay = 0,
    triggerClasses: triggerClassNames,
    contentClasses: contentClassNames,
    interactive = false,
    gutter = 4,
    // open = false,
    onOpenChange,
    trigger: triggerSnippet,
    content: contentSnippet,
  }: Props = $props()
  let open = $state(false)
  const classes = $derived(classNames('relative flex tooltip-container', className))
  const positionerClasses = $derived(classNames('pointer-events-none', positionerClassName))
  // const onOpenChange = (details: { open: boolean }) => {
  //   open = details.open
  // }
  const triggerClasses = $derived(classNames('flex', triggerClassNames))
  const contentBase = $derived(
    classNames(
      'card bg-white border text-surface-contrast-50 text-sm px-2 py-1',
      maxWidth,
      contentClassNames,
    ),
  )
</script>

<Tooltip
  {open}
  arrow
  positioning={{ placement, gutter }}
  {closeDelay}
  {interactive}
  {classes}
  {triggerClasses}
  {contentBase}
  {positionerClasses}
  {openDelay}
  onOpenChange={({ open: openProp }) => {
    open = openProp
    onOpenChange?.({ open: openProp })
  }}>
  {#snippet trigger()}{@render triggerSnippet?.()}{/snippet}
  {#snippet content()}{@render contentSnippet?.()}{/snippet}
</Tooltip>
