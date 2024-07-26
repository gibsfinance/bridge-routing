<script lang="ts">
  import { onMount } from 'svelte'
  import * as modalStore from '$lib/stores/modal'
  import _ from 'lodash'
  export let openOnMount: boolean = false
  export let id = 'dynamic'
  export let height = 'fixed'

  let modal: HTMLDialogElement | null = null
  const doClose = (e: Event) => {
    modalStore.type.set(null)
  }
  onMount(() => {
    modal?.addEventListener('close', doClose)
    if (openOnMount) {
      modal?.showModal()
    }
    return () => {
      modal?.removeEventListener('close', doClose)
      modal = null
    }
  })
</script>

<dialog id="{id}-modal" class="modal" bind:this={modal}>
  <div class="modal-box text-slate-50 max-h-full p-0 overflow-hidden flex flex-col" class:h-96={height === 'fixed'}>
    <slot close={doClose} />
  </div>
  <form method="dialog" class="modal-backdrop">
    <button
      type="button"
      on:click={() => {
        modalStore.type.set(null)
      }}>close</button>
  </form>
</dialog>

<style lang="postcss">
  .modal-box {
    width: 100%;
    @apply max-w-[36rem] shadow-lg shadow-black;
  }
</style>
