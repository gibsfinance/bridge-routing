<script lang="ts">
  import { createElement } from 'react'
  import type { Root } from 'react-dom/client'
  import { createRoot } from 'react-dom/client'
  import { onDestroy, onMount } from 'svelte'

  interface Props {
    element: any
    children?: any
    class?: string
    close: () => void
    [key: string]: any
  }

  const propsAll: Props = $props()
  const { element, children, class: className, close, ...restProps } = propsAll

  let container: HTMLDivElement
  let root: Root

  onMount(() => {
    container = document.getElementById('lifi-renderable') as HTMLDivElement
    container.className = `fixed flex top-0 left-0 bottom-0 right-0 w-full h-full z-50 [&>div]:!max-w-[440px] [&>div]:m-auto [&>div]:bg-gray-500/10 [&>div]:top-0 [&>div]:left-0 [&>div]:right-0 [&>div]:bottom-0 [&>div]:!max-h-none ${className}`
    container.onclick = (e) => {
      if (e.srcElement === container) {
        container.className = ''
        close()
      }
    }
    try {
      root = createRoot(container)
      root.render(createElement(element, restProps, children))
    } catch (e) {
      console.warn('ReactAdapter failed to mount.', e)
    }
  })

  onDestroy(() => {
    try {
      root?.unmount?.()
    } catch (e) {
      console.warn('ReactAdapter failed to unmount.', e)
    }
  })
</script>
