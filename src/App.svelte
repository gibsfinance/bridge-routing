<script lang="ts">
  import Layout from './Layout.svelte'
  import Home from './lib/pages/Home.svelte'
  import Delivery from './lib/pages/Delivery.svelte'
  import Onboard from './lib/pages/Onboard.svelte'
  import { page } from './lib/stores/page.svelte'
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
