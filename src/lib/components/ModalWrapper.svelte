<script lang="ts">
  import { onMount } from 'svelte'
  import * as modalStore from '$lib/stores/modal'
  import _ from 'lodash'
  // import Icon from '@iconify/svelte'
  // export let openOnMount: boolean = false
  // export let id = 'dynamic'
  // export let height = 'fixed'

  // let modal: HTMLDialogElement | null = null
  const doClose = (e: Event) => {
    modalStore.type.set(null)
  }
  // onMount(() => {
  //   modal?.addEventListener('close', doClose)
  //   if (openOnMount) {
  //     modal?.showModal()
  //   }
  //   return () => {
  //     modal?.removeEventListener('close', doClose)
  //     modal = null
  //   }
  // })
</script>

<div class="relative z-10 modal-box" aria-labelledby="modal-title" role="dialog" aria-modal="true">
  <div class="fixed inset-0 bg-neutral-900 bg-opacity-70 transition-opacity" aria-hidden="true"></div>

  <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
    <div
      class="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0"
      on:click={doClose}
      on:keypress={doClose}
      role="button"
      tabindex="-1">
      <div
        class="relative transform overflow-hidden rounded-lg bg-neutral-900 text-slate-100 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl"
        on:click|stopPropagation
        on:keypress|stopPropagation
        role="button"
        tabindex="-1">
        <slot close={doClose} />
      </div>
    </div>
  </div>
</div>

<!-- <dialog id="{id}-modal" class="modal" bind:this={modal}>
  <div
    class="modal-box text-neutral-900 dark:text-slate-50 max-h-full p-0 overflow-hidden flex flex-col"
    class:h-96={height === 'fixed'}>
    <slot close={doClose} />
  </div>
  <form method="dialog" class="modal-backdrop">
    <button
      type="button"
      on:click={() => {
        modalStore.type.set(null)
      }}>close</button>
  </form>
</dialog> -->

<style lang="postcss">
  .modal-box {
    width: 100%;
    @apply max-w-[36rem] shadow-lg shadow-black;
  }
</style>
