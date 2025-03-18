<script lang="ts">
  import * as input from '$lib/stores/input.svelte'
  import { bridgeSettings } from '$lib/stores/bridge-settings.svelte'
  import { bridgeSettings as storageBridgeSettings } from '$lib/stores/storage.svelte'
  import SectionInput from './SectionInput.svelte'
  import type { Token } from '$lib/types.svelte'
  import { zeroAddress } from 'viem'
  import { humanReadableNumber } from '$lib/stores/utils'
  import { accountState } from '$lib/stores/auth/AuthProvider.svelte'
  import { assetLink, minAmount } from '$lib/stores/chain-events.svelte'
  type Props = {
    asset: Token | null
  }
  const { asset = null }: Props = $props()
  const out = $derived(
    asset && assetLink.value && minAmount.value && bridgeSettings.bridgeFee !== null ? asset : null,
  )
  $effect(() => {
    input.recipient.value = accountState.address ?? zeroAddress
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
  focused
  value={inputValue}
  readonlyInput
  readonlyTokenSelect
  onbalanceupdate={() => {}}>
</SectionInput>
