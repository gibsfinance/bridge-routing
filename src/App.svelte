<script lang="ts">
  import Layout from './Layout.svelte'
  import Home from './lib/pages/Home.svelte'
  import Delivery from './lib/pages/Delivery.svelte'
  import Onboard from './lib/pages/Onboard.svelte'
  import { page } from './lib/stores/page.svelte'
  import { activeOnboardStep, defaultOnboardTokens, onboardShowOnramps, showTooltips } from './lib/stores/storage.svelte'
  import { isAddress } from 'viem'
  if (page.onramps === 'open') {
    onboardShowOnramps.value = true
  }
  if (page.guide === 'open') {
    showTooltips.value = true
  } else if (page.guide === 'closed') {
    showTooltips.value = false
  }
  if (page.stage === 'onboard') {
    activeOnboardStep.value = 1
  } else if (page.stage === 'swap') {
    activeOnboardStep.value = 2
  }
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
  defaultOnboardTokens.extend(updates)
</script>

<Layout>
  {#if page.route.id === '/'}
    <Home />
  {:else if page.route.id.startsWith('/delivery')}
    <Delivery />
  {:else if page.route.id.startsWith('/onboard')}
    <Onboard />
  {/if}
</Layout>
