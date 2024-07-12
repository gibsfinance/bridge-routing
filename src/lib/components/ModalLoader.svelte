<script lang="ts">
  import { desiredAssetIn, isNative, unwrapSetting } from '$lib/stores/bridge-settings'
  import { type as modalType } from '$lib/stores/modal'
  import type { Token } from '$lib/types'
  import Modal from './Modal.svelte'
  const chooseTokenSubmit = (e: CustomEvent<Token>) => {
    desiredAssetIn.set(e.detail)
    unwrapSetting.set(isNative(e.detail))
    console.log(e.detail, isNative(e.detail))
  }
</script>

{#if $modalType === 'choosetoken'}
  <Modal openOnMount on:submit={chooseTokenSubmit} />
{/if}
