<script lang="ts">
  import * as input from '$lib/stores/input.svelte'
  import { bridgeSettings } from '$lib/stores/bridge-settings.svelte'
  import { bridgeSettings as storageBridgeSettings } from '$lib/stores/storage.svelte'
  import SectionInput from './SectionInput.svelte'
  import type { Token } from '$lib/types.svelte'
  import { isAddress, zeroAddress, type Hex } from 'viem'
  import { humanReadableNumber } from '$lib/stores/utils'
  import { accountState } from '$lib/stores/auth/AuthProvider.svelte'
  import { assetLink } from '$lib/stores/chain-events.svelte'
  import { settingKey } from '$lib/stores/fee-manager.svelte'
  import BridgeProgressTxInputToggle from './BridgeProgressTxInputToggle.svelte'

  type Props = {
    asset: Token | null
  }
  const { asset = null }: Props = $props()
  const out = $derived(
    asset &&
      assetLink.value !== null &&
      settingKey(input.bridgeKey.value) &&
      bridgeSettings.bridgeFee !== null
      ? asset
      : null,
  )
  $effect(() => {
    input.recipient.value = isAddress(accountState.address ?? '')
      ? (accountState.address as Hex)
      : zeroAddress
  })
  const feeIsEstimated = $derived(
    input.shouldDeliver.value &&
      !!asset &&
      input.isNative(asset, input.bridgeKey.value) &&
      storageBridgeSettings.value?.feeType === input.FeeType.GAS_TIP,
  )
  const amountAfterBridgeFee = $derived(bridgeSettings.amountAfterBridgeFee)
  const decimals = $derived(asset?.decimals ?? 18)
  const amountOut = $derived(bridgeSettings.estimatedAmountOut ?? 0n)
  const value = $derived(amountOut ? humanReadableNumber(amountOut, { decimals }) : '0')
  const inputValue = $derived(amountAfterBridgeFee && feeIsEstimated ? `~${value}` : value)
</script>

<SectionInput
  label="Output"
  token={out}
  value={inputValue}
  readonlyInput
  readonlyTokenSelect
  onbalanceupdate={() => {}}>
  {#snippet underinput()}
    <BridgeProgressTxInputToggle />
  {/snippet}
</SectionInput>
