<script lang="ts">
  import * as input from '$lib/stores/input'
  import { desiredExcessCompensationBasisPoints } from '$lib/stores/bridge-settings'
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import { type as modalType } from '$lib/stores/modal'
  import type { Token } from '$lib/types'
  import ModalWrapper from '$lib/components/ModalWrapper.svelte'
  import TokenSelect from '$lib/components/TokenSelect.svelte'
  import RPCConfig from '$lib/components/RPC.svelte'
  import { formatUnits } from 'viem'
  const chooseTokenSubmit = async (e: CustomEvent<Token>) => {
    await goto(`/delivery/${$page.params.bridgeKey}/${e.detail.address}`)
    const native = input.isNative(e.detail)
    input.unwrap.set(native)
    input.fee.set(formatUnits($desiredExcessCompensationBasisPoints, 2))
  }
  const chooseRpcSubmit = () => {
    window.location.reload()
  }
</script>

{#if $modalType === 'choosetoken'}
  <ModalWrapper openOnMount>
    <TokenSelect openOnMount on:submit={chooseTokenSubmit} />
  </ModalWrapper>
{:else if $modalType === 'rpc'}
  <ModalWrapper openOnMount let:close>
    <RPCConfig
      on:submit={(e) => {
        close(e)
        input.incrementForcedRefresh()
      }}
      on:close={close} />
  </ModalWrapper>
{/if}
