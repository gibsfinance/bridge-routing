<script lang="ts">
  import '$lib/styles/global.css'
  import { onMount } from 'svelte'

  import { firstMount } from '$lib/stores/window'
  import Nav from '$lib/components/Nav.svelte'
  import Footer from '$lib/components/Footer.svelte'
  import Loader from '$lib/components/Loader.svelte'
  onMount(() => {
    firstMount.set(true)
  })
</script>

<svelte:head>
  <meta name="robots" content="noindex nofollow" />
  <html lang="en" />
</svelte:head>

<!--
  importing in this way allows the scripts to be loaded in parallel
  and for us to show a loader until loading is complete
-->
<div class="app bg-slate-950">
  {#await import('$lib/pages/Delivery.svelte')}
    <div class="app">
      <Nav />
      <main class="flex flex-col box-border w-full min-h-screen bg-slate-950 text-white mt-10">
        <div class="flex grow items-center justify-center">
          <Loader loaded={false} size="lg" />
        </div>
        <Footer />
      </main>
    </div>
  {:then c}
    <svelte:component this={c.default}>
      <slot />
    </svelte:component>
  {/await}
</div>

<style>
  .app {
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  :global(.tooltip::before) {
    @apply max-w-96 whitespace-pre-line;
  }
  :global(.tooltip.tooltip-top.tooltip-left-toward-center::before) {
    @apply -translate-x-0 right-0 left-auto;
  }
  :global(.tooltip.tooltip-top.tooltip-right-toward-center::before) {
    @apply -translate-x-0 left-0 right-auto;
  }
</style>
