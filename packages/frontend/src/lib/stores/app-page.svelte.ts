import { Page } from "./page.svelte"

const embedModes = new Set(['simple', 'embed'])

export class AppPage extends Page {
  get changing() {
    return this.val.changing
  }
  get mode() {
    return this.val.params?.get('mode') ?? null
  }
  get embed() {
    return embedModes.has(this.mode ?? '')
  }
  get onramps() {
    return this.val.params?.get('onramps') ?? null
  }
  get guide() {
    return this.val.params?.get('guide') ?? null
  }
  get stage() {
    return this.val.params?.get('stage') ?? null
  }
  get details() {
    return this.val.params?.get('details') ?? null
  }
  get settings() {
    const settings = this.val.params?.get('settings')
    if (!settings) return null
    return settings
  }
  params = $derived.by(() => {
    const [page, provider, fromChain, toChain, assetInAddress] = this.val.path.split('/').slice(1)
    if (provider && fromChain && toChain && assetInAddress) {
      return {
        page,
        provider,
        fromChain,
        toChain,
        assetInAddress,
      }
    }
    return {
      page,
    }
  })
  route = $derived.by(() => {
    return {
      id: this.val.path,
    }
  })
}
export const page = new AppPage()

