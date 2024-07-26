<script lang="ts">
  import { navigating } from '$app/stores'

  import Loading from '$lib/components/Loading.svelte'
</script>

<div class="bg-slate-950 flex min-h-[100vh] w-full">
  {#if $navigating}
    <Loading />
  {:else}
    <slot />
  {/if}
</div>
