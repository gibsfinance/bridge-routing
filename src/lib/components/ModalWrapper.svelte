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
  }
  const { contents, button, triggerClasses = '', wrapperClasses }: Props = $props()
  let open = $state(false)
</script>

<Modal
  {open}
  classes={wrapperClasses}
  triggerBase={triggerClasses}
  contentBase="card bg-surface-200-800 space-y-2 shadow-xl max-w-(--container-lg) w-full"
  backdropClasses="backdrop-blur-xs"
  onOpenChange={(e) => {
    open = e.open
  }}>
  {#snippet trigger()}{@render button?.()}{/snippet}
  {#snippet content()}{@render contents?.({ close: modalClose })}{/snippet}
</Modal>
