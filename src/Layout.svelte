<script lang="ts">
  import './app.css'
  import Nav from './lib/components/Nav.svelte'
  import Footer from './lib/components/Footer.svelte'
  import { Toaster } from '@skeletonlabs/skeleton-svelte'
  import { toaster } from './lib/stores/toast'
  import { page } from './lib/stores/page.svelte'

  const { children } = $props()
</script>

<svelte:head>
  <meta name="robots" content="noindex nofollow" />
  <meta name="description" content="Gibs Finance" />
</svelte:head>

<!--
  importing in this way allows the scripts to be loaded in parallel
  and for us to show a loader until loading is complete
-->
{#if !page.embed}
  <div class="app bg-slate-950">
    <div class="app">
      <Nav />
      <main class="mt-14 box-border flex min-h-screen w-full flex-col bg-slate-950 text-white">
        {@render children()}
        <Footer />
      </main>
    </div>
  </div>
{:else}
{@render children()}
{/if}
<Toaster {toaster} placement="bottom-end" />

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
