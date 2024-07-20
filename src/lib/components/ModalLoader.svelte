<script lang="ts">
  import * as input from '$lib/stores/input'
  import {
    // desiredAssetIn,
    isNative,
    // unwrapSetting,
    desiredExcessCompensationBasisPoints,
  } from '$lib/stores/bridge-settings'
  import { type as modalType } from '$lib/stores/modal'
  import type { Token } from '$lib/types'
  import Modal from './Modal.svelte'
  import * as imageLinks from '$lib/stores/image-links'
  import { formatUnits } from 'viem'
  const chooseTokenSubmit = (e: CustomEvent<Token>) => {
    input.assetIn.set({
      ...e.detail,
      logoURI: e.detail.logoURI || imageLinks.image(e.detail),
    })
    const native = isNative(e.detail)
    input.unwrap.set(native)
    input.fee.set(formatUnits($desiredExcessCompensationBasisPoints, 2))
  }
</script>

{#if $modalType === 'choosetoken'}
  <Modal openOnMount on:submit={chooseTokenSubmit} />
{/if}
