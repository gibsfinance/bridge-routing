<script lang="ts">
  import * as input from '$lib/stores/input'
  import {
    desiredExcessCompensationBasisPoints,
  } from '$lib/stores/bridge-settings'
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import { type as modalType } from '$lib/stores/modal'
  import type { Token } from '$lib/types'
  import Modal from './Modal.svelte'
  import * as imageLinks from '$lib/stores/image-links'
  import { formatUnits } from 'viem'
  const chooseTokenSubmit = async (e: CustomEvent<Token>) => {
    await goto(`/delivery/${$page.params.bridgeKey}/${e.detail.address}`)
    const native = input.isNative(e.detail)
    input.unwrap.set(native)
    input.fee.set(formatUnits($desiredExcessCompensationBasisPoints, 2))
  }
</script>

{#if $modalType === 'choosetoken'}
  <Modal openOnMount on:submit={chooseTokenSubmit} />
{/if}
