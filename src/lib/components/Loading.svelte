<script lang="ts">
  import { loading } from '$lib/stores/loading'
  export let size = 'sm'
  let className = ''
  export { className as class }
</script>

{#if $loading.resolved}
  <slot />
{:else}
  <span
    class="loading loading-dots {className}"
    class:loading-xs={size === 'xs'}
    class:loading-sm={size === 'sm'}
    class:loading-md={size === 'md'}
    class:loading-lg={size === 'lg'}></span>
{/if}
