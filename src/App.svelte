<script lang="ts">
  import Layout from './Layout.svelte'
  import Home from './lib/pages/Home.svelte'
  import Delivery from './lib/pages/Delivery.svelte'
  import Onboard from './lib/pages/Onboard.svelte'
  import { page } from './lib/stores/app-page.svelte'
  import { isAddress } from 'viem'
  import { bridgeKey } from './lib/stores/input.svelte'

  if (page.embed || window !== window.top) {
    if (page.settings !== 'disabled') {
      // page.setParam('settings', 'disabled')
    }
  }
  // if (page.onramps === 'open') {
  //   onboardShowOnramps.value = true
  // }
  const queryParams = page.queryParams
  const keys = [
    'bridgeTokenIn',
    // 'bridgeTokenOut',
    'pulsexTokenIn',
    'pulsexTokenOut',
  ]
  const updates = [...queryParams.entries()].reduce((acc, [key, value]) => {
    if (keys.includes(key) && isAddress(value)) {
      acc[key] = value
    }
    return acc
  }, {} as Record<string, string>)
  if (page.route.id === '/delivery' && updates.bridgeTokenIn && isAddress(updates.bridgeTokenIn)) {
    bridgeKey.assetInAddress = updates.bridgeTokenIn
  }
</script>

<Layout>
  <div class="flex flex-col w-full min-w-80 h-screen overflow-y-scroll">
    {#if page.route.id === '/'}
      <Home />
    {:else if page.route.id.startsWith('/delivery')}
      <Delivery />
    {:else if page.route.id.startsWith('/onboard')}
      <Onboard />
    {/if}
  </div>
</Layout>
