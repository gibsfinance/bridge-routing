<script lang="ts">
  let el = $state<HTMLDivElement | null>(null)
  let previous = $state<{ height: number; width: number } | null>(null)
  $effect(() => {
    if (disabled) return
    const watchSize = () => {
      if (!el) return
      const rect = el.getBoundingClientRect()
      if (previous && previous.height === rect.height && previous.width === rect.width) return
      previous = { height: rect.height, width: rect.width }
      postMessage({
        type: 'resize',
        ...previous,
      })
    }
    const timeout = setInterval(watchSize, 250)
    watchSize()
    return () => {
      clearInterval(timeout)
    }
  })
  const { class: className, children, disabled = false } = $props()
</script>

<div bind:this={el} class={className}>
  {@render children?.()}
</div>
