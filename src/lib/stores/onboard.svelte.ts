import type { Token } from '$lib/types.svelte'
import { zeroAddress } from 'viem'

type ForeignBridgeSettings = {
  show: boolean
}

const localForeignBridgeValue = localStorage.getItem('foreignBridge')
let defaultForeignBridgeValue: ForeignBridgeSettings = {
  show: false,
}
if (localForeignBridgeValue) {
  try {
    defaultForeignBridgeValue = JSON.parse(localForeignBridgeValue) as ForeignBridgeSettings
  } catch (err) {
    console.error(err)
  }
}

const storeLocal = (foreignBridge: ForeignBridgeSettings) => {
  localStorage.setItem('foreignBridge', JSON.stringify(foreignBridge))
}
export class OnboardSettings {
  // show foreign bridge
  foreignBridge = $state(defaultForeignBridgeValue)
  foreignBridgeExpectedOut = $state(0n)
  toggleShowBridge() {
    this.foreignBridge.show = !this.foreignBridge.show
    storeLocal(this.foreignBridge)
  }
  // pls out token
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
