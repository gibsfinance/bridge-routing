<script lang="ts">
  import '$lib/styles/global.css'
  // import 'iconify-icon'
  import Nav from '$lib/components/Nav.svelte'

  import AuthProvider from '$lib/stores/auth/AuthProvider.svelte'
</script>

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
