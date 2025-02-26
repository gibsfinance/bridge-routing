<script lang="ts">
  import { observe, unobserve } from '$lib/stores/lazyload.svelte'
  import type { Snippet } from 'svelte'
  type Props = {
    tag: string
    class?: string
    visible?: Snippet<[{ visible: boolean }]>
    onvisible?: (rendering: { visible: boolean }) => void
  }
  const { tag, class: className, visible, onvisible, ...extras }: Props = $props()
  let visibleState = $state(false)
  let el = $state<HTMLElement | null>(null)
  const visibleCheck = (rendering: boolean) => {
    onvisible?.({
      visible: rendering,
    })
    visibleState = rendering
  }
  $effect(() => {
    if (el) {
      unobserve(el)
      observe(el, visibleCheck)
    }
  })
</script>

<svelte:element this={tag} class={className} bind:this={el} {...extras}>
  {@render visible?.({ visible: visibleState })}
</svelte:element>
