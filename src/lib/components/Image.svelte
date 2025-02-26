<script lang="ts" module>
  import Lazy from './Lazy.svelte'
  import type { Snippet } from 'svelte'

  const loadedImages = new Set()
</script>

<script lang="ts">
  let {
    src,
    alt,
    style,
    class: classNameInput = 'flex',
    sizeClasses = 'size-6',
    onload,
    onerror,
  }: {
    sizeClasses?: string
    src: string | null | undefined
    alt?: string
    style?: string
    class?: string
    onload?: () => void
    onerror?: () => void
    fallback?: Snippet
  } = $props()
  const className = $derived(`${classNameInput} ${sizeClasses}`)
  let img = $state<HTMLImageElement | null>(null)
  const visibleCheck = ({ visible }: { visible: boolean }) => {
    if (visible) {
      loadedImages.add(src)
    }
  }
</script>

<Lazy tag="span" class="flex" onvisible={visibleCheck}>
  {#snippet visible({ visible })}
    {@const url = visible || loadedImages.has(src) ? src : null}
    <img bind:this={img} src={url} {alt} title={alt} class={className} {style} {onload} {onerror} />
  {/snippet}
</Lazy>
