<script lang="ts">
  import { Modal } from '@skeletonlabs/skeleton-svelte'
  import type { ClassValue } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { clsx } from 'clsx'

  function modalClose() {
    open = false
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
  }
  const {
    contents,
    button,
    triggerClasses = '',
    wrapperClasses,
    contentClasses,
    contentWidthClass = 'max-w-[548px] w-full',
    contentHeightClass = 'h-full max-h-[512px]',
    contentBorderClass = 'border border-surface-200',
  }: Props = $props()
  let open = $state(false)
  const classes = $derived([wrapperClasses])
  const triggerBase = $derived([triggerClasses])
  const contentWidth = $derived([contentWidthClass])
  const contentHeight = $derived([contentHeightClass])
  const contentBorder = $derived([contentBorderClass])
  const contentBase = $derived(
    clsx([
      'card bg-white space-y-2 text-surface-contrast-50',
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
    open = e.open
  }}>
  {#snippet trigger()}{@render button?.()}{/snippet}
  {#snippet content()}{@render contents?.({ close: modalClose })}{/snippet}
</Modal>
