<script lang="ts">
  import { loading } from '$lib/stores/loading.svelte'
  import Tooltip from './Tooltip.svelte'
  type Props = {
    show?: boolean
    disabled?: boolean
    placement?: 'right' | 'left'
    tooltip?: string
  }
  let {
    show = false,
    disabled = false,
    placement = 'right' as 'right' | 'left',
    tooltip = '',
  }: Props = $props()
  const resolved = $derived(loading.resolved)
</script>

{#if show}
  <Tooltip {tooltip} {placement}>
    <div
      role="alert"
      class="absolute h-6 w-6 top-0 -translate-x-1/2 -translate-y-1/2 text-center font-black text-white rounded-md leading-6 text-sm z-20"
      class:positioned-left={placement === 'left'}
      class:positioned-right={placement === 'right'}
      class:bg-red-600={!disabled && resolved}
      class:bg-red-400={disabled || !resolved}>
      !!
    </div>
  </Tooltip>
{/if}
<!--
<style lang="postcss">
  @reference "tailwindcss/theme";
  .positioned-right {
    @apply left-full -translate-x-1/2;
  }
  .positioned-left {
    @apply right-full translate-x-1/2;
  }
</style> -->
