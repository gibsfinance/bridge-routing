<!-- <script lang="ts">
  import * as input from '$lib/stores/input.svelte'
  import { goto } from '$app/navigation'
  import { type as modalType } from '$lib/stores/modal.svelte'
  import type { Token } from '$lib/types.svelte'
  import InfoExplain from '$lib/components/InfoExplain.svelte'
  import ModalWrapper from '$lib/components/ModalWrapper.svelte'
  import TokenSelect from '$lib/components/TokenSelect.svelte'
  import RPCConfig from '$lib/components/RPC.svelte'
  import { formatUnits } from 'viem'

  import { bridgeSettings } from '$lib/stores/bridge-settings.svelte'
  const chooseTokenSubmit = async (token: Token) => {
    const bridgeKey = input.bridgeKey.value
    await goto(`#/delivery/${input.toPath(bridgeKey)}/${token.address}`)
    const native = input.isNative(token, bridgeKey)
    input.unwrap.value = native
    input.fee.value = formatUnits(bridgeSettings.desiredExcessCompensationBasisPoints, 2)
  }
  const modalValue = $derived(modalType.value)
</script>

{#if modalValue === 'choosetoken'}
  <ModalWrapper>
    {#snippet contents({ close })}
      <TokenSelect
        onsubmit={(e) => {
          chooseTokenSubmit(e)
          close()
        }} />
    {/snippet}
  </ModalWrapper>
{:else if modalValue === 'rpc'}
  <ModalWrapper>
    {#snippet contents({ close })}
      <RPCConfig
        on:submit={(token) => {
          input.incrementForcedRefresh()
          close()
        }}
        on:close={close} />
    {/snippet}
  </ModalWrapper>
{:else if modalValue === 'info'}
  <ModalWrapper>
    {#snippet contents()}
      <InfoExplain />
    {/snippet}
  </ModalWrapper>
{/if} -->
