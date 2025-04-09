<script lang="ts">
  import Layout from './Layout.svelte'
  import Home from './lib/pages/Home.svelte'
  import Delivery from './lib/pages/Delivery.svelte'
  import Onboard from './lib/pages/Onboard.svelte'
  import { page } from './lib/stores/page.svelte.ts'
  import tokensex from '$public/images/providers/tokensex.svg'
  import lifi from '$public/images/providers/lifi.svg'
  import coinbase from '$public/images/providers/coinbase.svg'
  import meldIo from '$public/images/providers/meld-io.svg'
  import runners from '$public/images/runners.jpg'
  import payMe from '$public/images/pay-me.png'
  import futureBridge from '$public/images/future-bridge.webp'
  import logo from '$public/images/1FAF0.svg'
  import plsV4NetworkUrl from '$public/images/networks/0x3af.png'
  import bnbNetworkUrl from '$public/images/networks/0x38.png'
</script>

<!-- <svelte:head>
  <link rel="icon" href={tokensex} />
  <link rel="icon" href={lifi} />
  <link rel="icon" href={coinbase} />
  <link rel="icon" href={meldIo} />
  <link rel="icon" href={runners} />
  <link rel="icon" href={payMe} />
  <link rel="icon" href={futureBridge} />
  <link rel="icon" href={logo} />
</svelte:head> -->

<Layout>
  {#if page.route.id === '/'}
    <Home />
  {:else if page.route.id.startsWith('/delivery')}
    <Delivery />
  {:else if page.route.id.startsWith('/onboard')}
    <Onboard />
  {/if}
</Layout>
