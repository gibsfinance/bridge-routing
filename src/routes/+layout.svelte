<script lang="ts">
  import '../app.css'
  import Nav from '$lib/components/Nav.svelte'
  import Footer from '$lib/components/Footer.svelte'
  import { ToastProvider } from '@skeletonlabs/skeleton-svelte'
  const { children } = $props()
  console.log('children', children)
</script>

<svelte:head>
  <meta name="robots" content="noindex nofollow" />
</svelte:head>

<!--
  importing in this way allows the scripts to be loaded in parallel
  and for us to show a loader until loading is complete
-->
<ToastProvider
  placement="bottom-end"
  zIndex="z-50"
  toastBase="flex flex-row bg-surface-50 rounded-lg text-surface-contrast-50 text-base">
  <div class="app bg-slate-950">
    <div class="app">
      <Nav />
      <main class="mt-14 box-border flex min-h-screen w-full flex-col bg-slate-950 text-white">
        {@render children()}
        <Footer />
      </main>
    </div>
  </div>
</ToastProvider>

<style lang="postcss">
  @reference "tailwindcss/theme";
  .app {
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  /* :global(.tooltip::before) {
    @apply max-w-96 whitespace-pre-line;
  }
  :global(.tooltip.tooltip-top.tooltip-left-toward-center::before) {
    @apply left-auto right-0 -translate-x-0;
  }
  :global(.tooltip.tooltip-top.tooltip-right-toward-center::before) {
    @apply left-0 right-auto -translate-x-0;
  } */
</style>
