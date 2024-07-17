<script lang="ts">
  import { imageRoot } from '$lib/config'
  import {
    provider,
    amountToBridge,
    desiredAssetIn,
    feeType,
    isNative,
    unwrapSetting,
  } from '$lib/stores/bridge-settings'
  import { type as modalType } from '$lib/stores/modal'
  import type { Token } from '$lib/types'
  import Modal from './Modal.svelte'
  const chooseTokenSubmit = (e: CustomEvent<Token>) => {
    desiredAssetIn.set({
      ...e.detail,
      logoURI: `${imageRoot}/image/${e.detail.chainId}/${e.detail.address}`,
    })
    const native = isNative(e.detail)
    unwrapSetting.set(native)
    amountToBridge.set(0n)
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
