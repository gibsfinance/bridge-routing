<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'
  export let openOnMount: boolean = false
  import * as modalStore from '$lib/stores/modal'

  const dispatch = createEventDispatcher()
  const submit = () => {
    dispatch('submit', {})
  }
  let modal!: HTMLDialogElement
  onMount(() => {
    if (!openOnMount) return
    modal.showModal()
    return () => {
      // console.log('modal removed')
    }
  })
  const tokens: { address: string; name: string; symbol: string; decimals: number; logoURI: string }[] = []
</script>

<dialog id="choose-token-modal" class="modal" bind:this={modal}>
  <div class="modal-box text-slate-50">
    {#each tokens as token}{/each}
  </div>
  <form
    method="dialog"
    class="modal-backdrop"
    on:submit={() => {
      // console.log('submission')
    }}>
    <button
      on:click={() => {
        // console.log('clicked')
        modalStore.type.set(null)
      }}>close</button>
  </form>
</dialog>
