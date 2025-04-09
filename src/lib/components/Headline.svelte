<script lang="ts">
  import type { ClassValue } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  type Props = {
    children: Snippet
    class?: ClassValue
  }
  const { children, class: className = '' }: Props = $props()
  const classes = $derived([
    'text-white font-italiana z-10 top-0 bottom-0 left-0 right-0 text-center content-center text-5xl font-bold',
    className,
  ])
</script>

<h1 class={classes}>{@render children?.()}</h1>
