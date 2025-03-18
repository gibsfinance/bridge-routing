<script lang="ts">
  import { loading } from '$lib/stores/loading.svelte'
  import Tooltip from './Tooltip.svelte'
  type Props = {
    show?: boolean
    disabled?: boolean
    placement?: 'right' | 'left'
    tooltip?: string
  }
  const {
    show = false,
    disabled = false,
    placement = 'right' as 'right' | 'left',
    tooltip = '',
  }: Props = $props()
  const resolved = $derived(loading.resolved)
</script>

{#if show}
  <div
    class="absolute top-0"
    class:left-0={placement === 'left'}
    class:right-0={placement === 'right'}>
    <Tooltip {tooltip} {placement} gutter={0}>
      <div
        role="alert"
        class="h-6 w-6 top-0 translate-x-1/2 -translate-y-1/2 text-center font-black text-white rounded-md leading-6 text-sm z-20"
        class:bg-red-600={!disabled && resolved}
        class:bg-red-400={disabled || !resolved}>
        !!
      </div>
    </Tooltip>
  </div>
{/if}
