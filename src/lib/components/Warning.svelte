<script lang="ts">
  export let tooltip = ''
  export let show = false
</script>

{#if show}
  <div
    class="absolute h-6 w-6 left-full top-0 -translate-x-1/2 -translate-y-1/2 tooltip font-black bg-red-600 text-white rounded-md leading-6 text-sm"
    data-tip={tooltip}>
    !!
  </div>
{/if}
