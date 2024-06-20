<script lang="ts">
  import { desiredAssetIn } from '$lib/stores/bridge-settings'
  import { type as modalType } from '$lib/stores/modal'
  import Modal from './Modal.svelte'
</script>

{#if $modalType === 'choosetoken'}
  <Modal
    openOnMount
    on:submit={(e) => {
      desiredAssetIn.set(e.detail)
    }} />
{/if}
