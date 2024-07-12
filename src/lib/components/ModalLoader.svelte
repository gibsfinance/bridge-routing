<script lang="ts">
  import { desiredAssetIn, feeType, isNative, unwrapSetting } from '$lib/stores/bridge-settings'
  import { type as modalType } from '$lib/stores/modal'
  import type { Token } from '$lib/types'
  import Modal from './Modal.svelte'
  const chooseTokenSubmit = (e: CustomEvent<Token>) => {
    desiredAssetIn.set(e.detail)
    const native = isNative(e.detail)
    unwrapSetting.set(native)
    if ($feeType === '%' && native) {
      feeType.set('gas+%')
    } else if ($feeType === 'gas+%' && !native) {
      feeType.set('%')
    }
  }
</script>

{#if $modalType === 'choosetoken'}
  <Modal openOnMount on:submit={chooseTokenSubmit} />
{/if}
