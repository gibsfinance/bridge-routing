<script lang="ts">
  import { type as modalType } from '$lib/stores/modal'
  import Modal from './Modal.svelte'
</script>

{#if $modalType === 'choosetoken'}
  <Modal
    openOnMount
    on:submit={(e) => {
      console.log(e.detail)
    }} />
{/if}
