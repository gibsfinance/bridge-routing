<script lang="ts">
  import { Modal } from '@skeletonlabs/skeleton-svelte'
  import type { ClassValue } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { clsx } from 'clsx'

  function modalClose() {
    if (externalOpen === undefined) {
      internalOpen = false
    }
  }
  type Props = {
    contents?: Snippet<[{ close: () => void }]>
    button?: Snippet
    triggerClasses?: ClassValue
    wrapperClasses?: ClassValue
    contentClasses?: ClassValue
    contentWidthClass?: ClassValue
    contentHeightClass?: ClassValue
    contentBorderClass?: ClassValue
    open?: boolean
  }
  const {
    contents,
    button,
    triggerClasses = '',
    wrapperClasses,
    contentClasses,
    contentWidthClass = 'max-w-[548px] w-full',
    contentHeightClass = 'h-full max-h-[512px]',
    contentBorderClass = 'border border-surface-200 dark:border-surface-700',
    open: externalOpen,
  }: Props = $props()
  let internalOpen = $state(false)
  let open = $derived(externalOpen !== undefined ? externalOpen : internalOpen)
  const classes = $derived(clsx([wrapperClasses]))
  const triggerBase = $derived(clsx([triggerClasses]))
  const contentWidth = $derived(clsx([contentWidthClass]))
  const contentHeight = $derived(clsx([contentHeightClass]))
  const contentBorder = $derived(clsx([contentBorderClass]))
  const contentBase = $derived(
    clsx([
      'card bg-white dark:bg-surface-950 space-y-2 text-surface-950 dark:text-surface-50',
      contentClasses,
      contentWidth,
      contentHeight,
      contentBorder,
    ]),
  )
</script>

<Modal
  {open}
  {classes}
  {triggerBase}
  {contentBase}
  backdropClasses="backdrop-blur-xs"
  zIndex="50"
  positionerClasses="h-full z-40"
  onOpenChange={(e) => {
    if (externalOpen === undefined) {
      internalOpen = e.open
    }
  }}>
  {#snippet trigger()}{@render button?.()}{/snippet}
  {#snippet content()}{@render contents?.({ close: modalClose })}{/snippet}
</Modal>
