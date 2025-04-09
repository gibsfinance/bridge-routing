<script lang="ts" module>
  import Lazy from './Lazy.svelte'
  import { onDestroy, type Snippet } from 'svelte'
  import type { ClassValue } from 'svelte/elements'
  const loadedImages = new WeakMap<HTMLImageElement, string>()
</script>

<script lang="ts">
  let {
    src,
    alt,
    style,
    class: classNameInput = 'flex',
    sizeClasses = 'size-6',
    containerClasses = 'flex',
    onload,
    onerror,
  }: {
    sizeClasses?: ClassValue
    src: string | null | undefined
    alt?: string | null | undefined
    style?: string
    class?: ClassValue
    containerClasses?: ClassValue
    onload?: () => void
    onerror?: () => void
    fallback?: Snippet
  } = $props()
  const className = $derived([classNameInput, sizeClasses])
  const containerClass = $derived([containerClasses, sizeClasses])
  let img = $state<HTMLImageElement | null>(null)
  let visible = $state(false)
  $effect(() => {
    if (visible && img && src) {
      loadedImages.set(img!, src)
    }
  })
  const visibleCheck = (e: { visible: boolean }) => {
    visible = e.visible
  }
  onDestroy(() => {
    if (img) {
      loadedImages.delete(img)
    }
  })
</script>

<Lazy tag="span" class={containerClass} onvisible={visibleCheck}>
  {#snippet visible({ visible })}
    {@const url = visible || loadedImages.has(img!) ? src : null}
    <img
      bind:this={img}
      src={url}
      {alt}
      title={alt}
      class={className}
      {style}
      {onload}
      {onerror}
      data-url={src} />
  {/snippet}
</Lazy>
