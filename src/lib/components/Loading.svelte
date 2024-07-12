<script lang="ts">
  import { loading as l } from '$lib/stores/loading'
  export let size = 'sm'
  export let loading = l
  export let key: string | string[] | undefined = undefined
  let className = ''
  export { className as class }
</script>

{#if $loading.isResolved(key)}
  <slot />
{:else}
  <span
    class="loading loading-dots {className}"
    class:loading-xs={size === 'xs'}
    class:loading-sm={size === 'sm'}
    class:loading-md={size === 'md'}
    class:loading-lg={size === 'lg'}>
  </span>
{/if}
