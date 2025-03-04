import type { Token } from "$lib/types.svelte"
import { zeroAddress } from "viem"

export class OnboardSettings {
  showBridge = $state(false)
  toggleShowBridge() {
    this.showBridge = !this.showBridge
  }
  plsOutToken = $state<Token>({
    logoURI: `https://gib.show/image/369/${zeroAddress}`,
    name: 'Pulse',
    symbol: 'PLS',
    decimals: 18,
    chainId: 369,
    address: zeroAddress,
  })
}

export const onboardSettings = new OnboardSettings()
