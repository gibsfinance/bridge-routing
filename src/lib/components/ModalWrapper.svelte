<script lang="ts">
  import { Modal } from '@skeletonlabs/skeleton-svelte'
  import type { Snippet } from 'svelte'

  function modalClose() {
    open = false
  }
  type Props = {
    contents?: Snippet<[{ close: () => void }]>
    button?: Snippet
    triggerClasses?: string
    wrapperClasses?: string
    contentClasses?: string
  }
  const { contents, button, triggerClasses = '', wrapperClasses, contentClasses }: Props = $props()
  let open = $state(false)
</script>

<Modal
  {open}
  classes={wrapperClasses}
  triggerBase={triggerClasses}
  contentBase="card bg-surface-950-50 space-y-2 max-w-(--container-lg) w-full text-surface-contrast-50 h-full max-h-[512px] border border-surface-200"
  backdropClasses="backdrop-blur-xs"
  zIndex="50"
  positionerClasses="h-full z-40"
  onOpenChange={(e) => {
    open = e.open
  }}>
  {#snippet trigger()}{@render button?.()}{/snippet}
  {#snippet content()}{@render contents?.({ close: modalClose })}{/snippet}
</Modal>
