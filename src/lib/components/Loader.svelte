<script lang="ts">
  import Icon from '@iconify/svelte'

  // export let size = 'sm'
  let className = ''
  export { className as class }
  export let loaded = false
</script>

<span class="flex align-baseline">
  <Icon icon="svg-spinners:3-dots-bounce" class={className + (loaded ? ' invisible' : '')} />
</span>
