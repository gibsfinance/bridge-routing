<script lang="ts">
  import AuthProvider from '$lib/stores/auth/AuthProvider.svelte'
  import Nav from '$lib/components/Nav.svelte'
  import Footer from '$lib/components/Footer.svelte'
  import ModalLoader from '$lib/components/ModalLoader.svelte'
</script>

<AuthProvider>
  <Nav />
  <main class="flex flex-col box-border w-full h-fit bg-slate-50 mt-10">
    <slot />
    <Footer />
  </main>
  <ModalLoader />
</AuthProvider>
