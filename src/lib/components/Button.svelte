<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { EventHandler } from 'svelte/elements'
  import type { ClassValue } from 'svelte/elements'
  type Props = {
    type?: 'button' | 'submit' | 'reset'
    class?: ClassValue
    children?: Snippet
    onclick?: EventHandler
    title?: string
    name?: string
    id?: string
    disabled?: boolean
    tabindex?: number
  }
  const {
    type = 'button',
    class: className,
    children,
    onclick,
    title,
    name,
    id,
    disabled,
    tabindex,
  }: Props = $props()
</script>

<button {type} class={className} {onclick} {title} {disabled} {name} {id} {tabindex}>
  {@render children?.()}
</button>
