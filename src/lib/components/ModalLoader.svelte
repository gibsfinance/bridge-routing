<script lang="ts">
  import * as input from '$lib/stores/input'
  import { desiredExcessCompensationBasisPoints } from '$lib/stores/bridge-settings'
  import { goto } from '$app/navigation'
  import { type as modalType } from '$lib/stores/modal'
  import type { Token } from '$lib/types'
  import InfoExplain from '$lib/components/InfoExplain.svelte'
  import ModalWrapper from '$lib/components/ModalWrapper.svelte'
  import TokenSelect from '$lib/components/TokenSelect.svelte'
  import RPCConfig from '$lib/components/RPC.svelte'
  import { formatUnits } from 'viem'
  import { get } from 'svelte/store'
  const chooseTokenSubmit = async (e: CustomEvent<Token>) => {
    const $bridgeKey = get(input.bridgeKey)
    await goto(`/delivery/${input.toPath($bridgeKey)}/${e.detail.address}`)
    const native = input.isNative(e.detail, $bridgeKey)
    input.unwrap.set(native)
    input.fee.set(formatUnits($desiredExcessCompensationBasisPoints, 2))
  }
</script>

{#if $modalType === 'choosetoken'}
  <ModalWrapper>
    <TokenSelect on:submit={chooseTokenSubmit} />
  </ModalWrapper>
{:else if $modalType === 'rpc'}
  <ModalWrapper let:close>
    <RPCConfig
      on:submit={(e) => {
        close(e)
        input.incrementForcedRefresh()
      }}
      on:close={close} />
  </ModalWrapper>
{:else if $modalType === 'info'}
  <ModalWrapper>
    <InfoExplain />
  </ModalWrapper>
{/if}
