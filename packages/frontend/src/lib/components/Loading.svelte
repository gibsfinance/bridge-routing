<script lang="ts">
  import type { Snippet } from 'svelte'

  import { loading as l } from '../stores/loading.svelte'

  import Loader from './Loader.svelte'

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
