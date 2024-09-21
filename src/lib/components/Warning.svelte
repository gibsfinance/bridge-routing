<script lang="ts">
  import { hover } from '$lib/modifiers/hover'
  import { loading } from '$lib/stores/loading'
  import Hover from './Hover.svelte'
  import Tooltip from './Tooltip.svelte'
  export let tooltip = ''
  export let show = false
  export let disabled = false
  export let position = 'right'
</script>

{#if show}
  <Hover let:handlers let:hovering>
    <div
      use:hover={handlers}
      role="alert"
      class="absolute h-6 w-6 top-0 -translate-x-1/2 -translate-y-1/2 text-center font-black text-white rounded-md leading-6 text-sm z-20"
      class:positioned-left={position === 'left'}
      class:positioned-right={position === 'right'}
      class:bg-red-600={!disabled && $loading.resolved}
      class:bg-red-400={disabled || !$loading.resolved}>
      !!
      <Tooltip position={position === 'left' ? 'right' : 'left'} show={hovering}>{tooltip}</Tooltip>
    </div>
  </Hover>
{/if}

<style lang="postcss">
  .positioned-right {
    @apply left-full -translate-x-1/2;
  }
  .positioned-left {
    @apply right-full translate-x-1/2;
  }
</style>
