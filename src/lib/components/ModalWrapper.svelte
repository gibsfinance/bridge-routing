<script lang="ts">
  import type { ClassParam } from '$lib/types.svelte'
  import { Modal } from '@skeletonlabs/skeleton-svelte'
  import classNames from 'classnames'
  import type { Snippet } from 'svelte'

  function modalClose() {
    open = false
  }
  type Props = {
    contents?: Snippet<[{ close: () => void }]>
    button?: Snippet
    triggerClasses?: ClassParam
    wrapperClasses?: ClassParam
    contentClasses?: ClassParam
    contentWidthClass?: ClassParam
    contentHeightClass?: ClassParam
    contentBorderClass?: ClassParam
  }
  const {
    contents,
    button,
    triggerClasses = '',
    wrapperClasses,
    contentClasses,
    // contentWidthClass = 'max-w-(--container-lg) w-full',
    contentWidthClass = 'max-w-[548px] w-full',
    contentHeightClass = 'h-full max-h-[512px]',
    contentBorderClass,
  }: Props = $props()
  let open = $state(false)
  const classes = $derived(classNames(wrapperClasses))
  const triggerBase = $derived(classNames(triggerClasses))
  const contentWidth = $derived(classNames(contentWidthClass))
  const contentHeight = $derived(classNames(contentHeightClass))
  const contentBorder = $derived(classNames('border border-surface-200', contentBorderClass))
  const contentBase = $derived(
    classNames(
      'card bg-white space-y-2 text-surface-contrast-50',
      contentClasses,
      contentWidth,
      contentHeight,
      contentBorder,
    ),
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
