<script lang="ts">
  import { FeeType } from '@gibs/bridge-sdk/fee-type'
  import type { Token } from '@gibs/bridge-sdk/types'
  import { isNative } from '@gibs/bridge-sdk/config'

  import * as input from '../stores/input.svelte'
  import { bridgeSettings } from '../stores/bridge-settings.svelte'
  import { bridgeSettings as storageBridgeSettings } from '../stores/storage.svelte'
  import { humanReadableNumber } from '../stores/utils'
  import { assetLink } from '../stores/chain-events.svelte'
  import { settingKey } from '../stores/fee-manager.svelte'

  import SectionInput from './SectionInput.svelte'
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
  const feeIsEstimated = $derived(
    input.shouldDeliver.value &&
      !!asset &&
      isNative(asset, input.bridgeKey.value) &&
      storageBridgeSettings.value?.feeType === FeeType.GAS_TIP,
  )
  const amountAfterBridgeFee = $derived(bridgeSettings.amountAfterBridgeFee)
  const decimals = $derived(asset?.decimals ?? 18)
  const amountOut = $derived.by(() => {
    return bridgeSettings.estimatedAmountOut ?? 0n
  })
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
