<!-- <script lang="ts">
  import * as modalStore from '$lib/stores/modal.svelte'
  import type { Snippet } from 'svelte'
  type Props = {
    contents?: Snippet<[{ close: () => void }]>
  }
  const doClose = () => {
    modalStore.type.value = ''
  }
  const stopPropagation = (e: Event) => {
    e.stopPropagation()
  }
  const { contents }: Props = $props()
</script>

<div class="modal-box relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
  <div class="bg-opacity-70 fixed inset-0 bg-neutral-900 transition-opacity" aria-hidden="true"
  ></div>

  <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
    <div
      class="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0"
      onclick={doClose}
      onkeypress={doClose}
      role="button"
      tabindex="-1">
      <div
        class="relative transform overflow-hidden rounded-lg bg-neutral-900 text-left text-slate-100 shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl"
        onclick={stopPropagation}
        onkeypress={stopPropagation}
        role="button"
        tabindex="-1">
        {@render contents?.({ close: doClose })}
      </div>
    </div>
  </div>
</div>

<style lang="postcss">
  @reference "tailwindcss/theme";
  .modal-box {
    width: 100%;
    @apply max-w-[36rem] shadow-lg shadow-black;
  }
</style> -->
<script lang="ts">
  import { Modal } from '@skeletonlabs/skeleton-svelte'
  import type { Snippet } from 'svelte'

  let open = $state(false)

  function modalClose() {
    open = false
  }
  type Props = {
    contents?: Snippet<[{ close: () => void }]>
    button?: Snippet
    triggerClasses?: string
  }
  const { contents, button, triggerClasses = 'btn preset-tonal' }: Props = $props()
</script>

<Modal
  {open}
  triggerBase={triggerClasses}
  contentBase="card bg-surface-200-800 space-y-2 shadow-xl max-w-screen-sm w-full"
  backdropClasses="backdrop-blur-sm"
  onOpenChange={(e) => {
    open = e.open
  }}>
  {#snippet trigger()}{@render button?.()}{/snippet}
  {#snippet content()}{@render contents?.({ close: modalClose })}{/snippet}
</Modal>
