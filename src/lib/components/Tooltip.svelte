<script lang="ts">
  import { Tooltip } from '@skeletonlabs/skeleton-svelte'
  import type { Snippet } from 'svelte'
  import type { ClassValue } from 'svelte/elements'
  import { clsx } from 'clsx'

  type Props = {
    placement?: 'top' | 'bottom' | 'left' | 'right'
    positioning?: {
      placement?: 'top' | 'bottom' | 'left' | 'right'
      gutter?: number
    }
    maxWidth?: string
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
      'card bg-white border text-surface-contrast-50 text-sm px-2 py-1',
      maxWidth,
      contentClassNames,
    ]),
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
  {onclick}
  onOpenChange={({ open: openProp }) => {
    open = openProp
    onOpenChange?.({ open: openProp })
  }}>
  {#snippet trigger()}{@render triggerSnippet?.()}{/snippet}
  {#snippet content()}{@render contentSnippet?.()}{/snippet}
</Tooltip>
