<script lang="ts">
  export let size = 'sm'
  let className = ''
  export { className as class }
  export let loaded = false
</script>

<span
  class="loading loading-dots {className}"
  class:invisible={loaded}
  class:loading-xs={size === 'xs'}
  class:loading-sm={size === 'sm'}
  class:loading-md={size === 'md'}
  class:loading-lg={size === 'lg'}>
</span>
