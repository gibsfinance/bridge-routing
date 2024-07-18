<script lang="ts">
  import { amountToBridge, desiredAssetIn, isNative, unwrapSetting } from '$lib/stores/bridge-settings'
  import { type as modalType } from '$lib/stores/modal'
  import type { Token } from '$lib/types'
  import Modal from './Modal.svelte'
  import * as imageLinks from '$lib/stores/image-links'
  const chooseTokenSubmit = (e: CustomEvent<Token>) => {
    desiredAssetIn.set({
      ...e.detail,
      logoURI: e.detail.logoURI || imageLinks.image(e.detail),
    })
    const native = isNative(e.detail)
    unwrapSetting.set(native)
    amountToBridge.set(0n)
  }
</script>

{#if $modalType === 'choosetoken'}
  <Modal openOnMount on:submit={chooseTokenSubmit} />
{/if}
