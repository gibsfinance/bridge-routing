<script lang="ts">
  import '$lib/styles/global.css'
  import Nav from '$lib/components/Nav.svelte'
  import ModalLoader from '$lib/components/ModalLoader.svelte'

  import AuthProvider from '$lib/stores/auth/AuthProvider.svelte'
  // import payMe from '$lib/images/pay-me.png'
  // import bridge from '$lib/images/bridge.jpeg'
  // import futureBridge from '$lib/images/future-bridge.webp'
  // import fingers from '$lib/images/1FAF0.svg'
  // const preloadImageUrls = [payMe, bridge, futureBridge, fingers]
</script>

<svelte:head>
  <!-- {#each preloadImageUrls as image}
    <link rel="preload" as="image" href={image} />
  {/each} -->
  <meta name="robots" content="noindex nofollow" />
  <html lang="en" />
</svelte:head>

<!-- <svelte:window on:resize={updateWindow} /> -->

<AuthProvider>
  <div class="app bg-slate-950">
    <Nav />
    <main class="flex flex-col box-border w-full h-fit bg-slate-50 mt-10">
      <slot />
    </main>
    <ModalLoader />
  </div>
</AuthProvider>

<style>
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  :global(.tooltip::before) {
    @apply max-w-none;
  }
  :global(.tooltip.tooltip-top.tooltip-left-toward-center::before) {
    @apply -translate-x-0 right-0 left-auto;
  }
  :global(.tooltip.tooltip-top.tooltip-right-toward-center::before) {
    @apply -translate-x-0 left-0 right-auto;
  }
</style>
