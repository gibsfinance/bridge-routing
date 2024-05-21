<script lang="ts">
  // import '../app.css';
  // import './styles.css';
  import '$lib/styles/global.css'
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
