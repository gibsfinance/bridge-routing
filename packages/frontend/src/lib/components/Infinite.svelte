<script lang="ts">
  import type { Snippet } from 'svelte'
  import Lazy from './Lazy.svelte'
  type Props = {
    tag?: string
    class?: string
    onloadmore?: () => void
    children?: Snippet
  }
  const { tag = 'div', class: className, onloadmore, children }: Props = $props()
</script>

<Lazy
  {tag}
  class={className}
  onvisible={(e) => {
    if (e.visible) {
      onloadmore?.()
    }
  }}>
  {#snippet visible()}
    {@render children?.()}
  {/snippet}
</Lazy>
