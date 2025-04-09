<script lang="ts">
  import Loader from '../components/Loader.svelte'
  import { loading as l } from '../stores/loading.svelte'
  import type { Snippet } from 'svelte'
  type Props = {
    class?: string
    key?: string | string[] | null
    contents?: Snippet
    loader?: Snippet
  }
  const { class: className, key, contents }: Props = $props()
  const loaded = $derived(l.isResolved(key))
</script>

{#snippet loader()}
  <Loader class={className} {loaded} />
{/snippet}

{#if loaded}
  {@render contents?.()}
{:else}
  {@render loader?.()}
{/if}
