<script lang="ts">
  import { lazyload } from '$lib/modifiers/lazyload'
  let className = ''
  let load = false
  const loadHandler = (e: CustomEvent) => {
    load = !!e.detail
  }
  export { className as class }
</script>

<div class={className} use:lazyload on:visible={loadHandler}>
  <slot {load} />
</div>
