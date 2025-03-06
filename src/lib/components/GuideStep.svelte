<script lang="ts">
  import { Tooltip } from '@skeletonlabs/skeleton-svelte'
  import { showTooltips } from '$lib/stores/storage.svelte'
  import classNames from 'classnames'
  import type { ClassParam } from '$lib/types.svelte'
  type Props = {
    placement?: 'top' | 'bottom' | 'left' | 'right'
    children: any
    step: number
    triggerClass?: ClassParam
    contentClass?: ClassParam
  }
  const { placement = 'top', children, step, triggerClass, contentClass }: Props = $props()
  let open = $state(false)
  const triggerVisible = $derived(showTooltips.value)
  const contentClasses = $derived(
    classNames('card preset-filled-tertiary-500 text-sm px-2 py-1', contentClass),
  )
  const triggerClasses = $derived(
    classNames(
      'flex items-center justify-center bg-surface-50 border-2 border-tertiary-500 rounded-full size-8 leading-6 shadow text-contrast-surface-50 text-tertiary-500 pointer-events-auto',
      triggerClass,
      { invisible: !triggerVisible },
    ),
  )
  const onOpenChange = (details: { open: boolean }) => {
    open = details.open
  }
</script>

<Tooltip
  positioning={{ placement, gutter: 2 }}
  {open}
  {triggerClasses}
  openDelay={0}
  closeDelay={0}
  interactive={false}
  {contentClasses}
  {onOpenChange}>
  {#snippet trigger()}{step}{/snippet}
  {#snippet content()}{@render children?.()}{/snippet}
</Tooltip>
