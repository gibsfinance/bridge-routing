<script lang="ts">
  import type { ClassValue } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  type Props = {
    children: Snippet
    class?: ClassValue
    textSizeClasses?: ClassValue
    tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  }
  const { children, class: className = '', textSizeClasses = 'text-5xl', tag = 'h1' }: Props = $props()
  const classes = $derived([
    'font-italiana z-10 top-0 bottom-0 left-0 right-0 text-center content-center font-bold',
    textSizeClasses,
    className,
  ])
</script>

<svelte:element this={tag} class={classes}>{@render children?.()}</svelte:element>
