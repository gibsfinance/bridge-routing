<script lang="ts">
  import AuthProvider from '$lib/stores/auth/AuthProvider.svelte'
  import Nav from '$lib/components/Nav.svelte'
  import Footer from '$lib/components/Footer.svelte'
  import ModalLoader from '$lib/components/ModalLoader.svelte'
</script>

<main class="flex flex-col box-border w-full h-fit min-h-screen bg-slate-950">
  <AuthProvider>
    <Nav />
    <div class="flex flex-col mt-10">
      <slot />
    </div>
    <Footer />
    <ModalLoader />
  </AuthProvider>
</main>
