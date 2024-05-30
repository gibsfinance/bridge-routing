<script lang="ts">
  import '$lib/styles/global.css'
  // import 'iconify-icon'
  import Nav from '$lib/components/Nav.svelte'

  import AuthProvider from '$lib/stores/auth/AuthProvider.svelte'
  import payMe from '$lib/images/pay-me.png'
  import bridge from '$lib/images/bridge.jpeg'
  import futureBridge from '$lib/images/future-bridge.webp'
  import fingers from '$lib/images/1FAF0.svg'
  const preloadImageUrls = [payMe, bridge, futureBridge, fingers]
</script>

<svelte:head>
  {#each preloadImageUrls as image}
    <link rel="preload" as="image" href={image} />
  {/each}
  <meta name="robots" content="noindex nofollow" />
  <html lang="en" />
</svelte:head>

<AuthProvider>
  <div class="app bg-slate-50">
    <Nav />
    <main class="flex flex-col box-border w-full h-fit">
      <slot />
    </main>
  </div>
</AuthProvider>

<style>
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
</style>
