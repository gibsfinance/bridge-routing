<script lang="ts">
  export let tooltip = ''
  export let show = false
  export let disabled = false
  export let position = 'right'
</script>

{#if show}
  <div
    class="absolute h-6 w-6 top-0 -translate-x-1/2 -translate-y-1/2 tooltip font-black text-white rounded-md leading-6 text-sm"
    class:positioned-left={position === 'left'}
    class:positioned-right={position === 'right'}
    class:tooltip-left={position === 'right'}
    class:tooltip-right={position === 'left'}
    class:bg-red-600={!disabled}
    class:bg-red-400={disabled}
    data-tip={tooltip}>
    !!
  </div>
{/if}

<style lang="postcss">
  .positioned-right {
    @apply left-full -translate-x-1/2;
  }
  .positioned-left {
    @apply right-full translate-x-1/2;
  }
</style>
