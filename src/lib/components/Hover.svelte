<!-- <script lang="ts">
  import type { Snippet } from 'svelte'

  let hovering = $state<boolean>(false)
  const handlers = {
    enter: () => {
      hovering = true
    },
    leave: () => {
      hovering = false
    },
  }
  type Props = {

    hoverable: Snippet<
      [
        {
          handlers: typeof handlers
          hovering: typeof hovering
        },
      ]
    >
  }
  let { hoverable }: Props = $props()
</script> -->

<!-- {@render hoverable?.({ hovering, handlers })} -->
