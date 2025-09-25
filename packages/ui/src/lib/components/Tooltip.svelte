<script lang="ts">
  import { Tooltip } from '@skeletonlabs/skeleton-svelte'
  import type { Snippet } from 'svelte'
  import type { ClassValue } from 'svelte/elements'
  import { clsx } from 'clsx'

  type Placement = 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  type Props = {
    placement?: Placement
    positioning?: {
      placement?: Placement
      gutter?: number
    }
    maxWidth?: string
    zIndex?: string
    tooltip?: string
    content?: Snippet
    class?: ClassValue
    openDelay?: number
    closeDelay?: number
    positionerClassName?: ClassValue
    contentClasses?: ClassValue
    triggerClasses?: ClassValue
    gutter?: number
    interactive?: boolean
    trigger: Snippet
    onclick?: () => void
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
    zIndex = '50',
    onOpenChange,
    trigger: triggerSnippet,
    content: contentSnippet,
    onclick,
  }: Props = $props()
  let open = $state(false)
  const classes = $derived(clsx(['flex', className]))
  const positionerClasses = $derived(clsx(['pointer-events-none', positionerClassName]))
  const triggerClasses = $derived(clsx(['flex', triggerClassNames]))
  const contentBase = $derived(
    clsx([
      'card bg-white dark:bg-surface-950 border border-surface-200 dark:border-surface-700 text-surface-contrast-50 dark:text-gray-500 text-sm px-2 py-1',
      maxWidth,
      contentClassNames,
    ]),
  )
</script>

<Tooltip
  {open}
  positioning={{ placement, gutter }}
  {closeDelay}
  {interactive}
  {classes}
  {triggerClasses}
  {contentBase}
  {positionerClasses}
  {openDelay}
  {onclick}
  {zIndex}
  onOpenChange={({ open: openProp }) => {
    open = openProp
    onOpenChange?.({ open: openProp })
  }}>
  {#snippet trigger()}{@render triggerSnippet?.()}{/snippet}
  {#snippet content()}{@render contentSnippet?.()}{/snippet}
</Tooltip>
