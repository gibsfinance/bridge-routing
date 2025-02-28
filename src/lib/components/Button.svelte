<script lang="ts">
  import type { Snippet } from 'svelte'
  type Props = {
    type?: 'button' | 'submit' | 'reset'
    class?: string
    children?: Snippet
    onclick?: () => void
    title?: string
    disabled?: boolean
  }
  const { type = 'button', class: className, children, onclick, title, disabled }: Props = $props()
</script>

<button {type} class={className} {onclick} {title} {disabled}>
  {@render children?.()}
</button>
