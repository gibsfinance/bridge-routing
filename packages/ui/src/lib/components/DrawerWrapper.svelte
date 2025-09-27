<script lang="ts">
  import { Modal } from '@skeletonlabs/skeleton-svelte'
  import type { Snippet } from 'svelte'
  let open = $state(false)
  const drawerClose = () => {
    open = false
  }
  type Props = {
    contents?: Snippet<[{ close: () => void }]>
    button?: Snippet
    wrapperClasses?: string
    triggerClasses?: string
  }
  const { contents, button, wrapperClasses, triggerClasses = 'btn preset-tonal' }: Props = $props()
</script>

<Modal
  {open}
  classes={wrapperClasses}
  triggerBase={triggerClasses}
  contentBase="bg-surface-100-900 space-y-4 shadow-xl w-[480px] h-screen"
  positionerJustify="justify-start"
  positionerAlign=""
  zIndex="50"
  positionerPadding=""
  transitionsPositionerIn={{ x: -480, duration: 200 }}
  transitionsPositionerOut={{ x: -480, duration: 200 }}>
  {#snippet trigger()}{@render button?.()}{/snippet}
  {#snippet content()}{@render contents?.({ close: drawerClose })}{/snippet}
</Modal>
