<script lang="ts">
  import { Tooltip } from '@skeletonlabs/skeleton-svelte'
  import type { Snippet } from 'svelte'
  type Props = {
    placement?: 'top' | 'bottom' | 'left' | 'right'
    show?: boolean
    maxWidth?: string
    tooltip?: string
    children?: Snippet
  }
  let { placement, show = false, maxWidth = 'max-w-[380px]', tooltip, children }: Props = $props()
</script>

<Tooltip
  bind:open={show}
  positioning={{ placement, gutter: 4 }}
  closeDelay={0}
  interactive={false}
  classes="relative flex tooltip-container"
  triggerClasses="flex"
  contentBase="card preset-filled-tertiary-500 text-sm px-2 py-1 {maxWidth}"
  openDelay={0}>
  {#snippet trigger()}{@render children?.()}{/snippet}
  {#snippet content()}{tooltip}{/snippet}
</Tooltip>
