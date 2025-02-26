<script lang="ts">
  import type { Snippet } from 'svelte'
  type Props = {
    type?: 'button' | 'submit' | 'reset'
    class?: string
    children?: Snippet
    onclick?: () => void
  }
  const { type = 'button', class: className, children, onclick }: Props = $props()
</script>

<button {type} class={className} {onclick}>
  {@render children?.()}
</button>
