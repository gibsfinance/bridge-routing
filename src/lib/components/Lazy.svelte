<script lang="ts">
  import { lazyload } from '$lib/modifiers/lazyload'
  let className = ''
  let load = false
  let everLoaded = false
  const loadHandler = (e: CustomEvent) => {
    load = !!e.detail
    everLoaded = everLoaded || !!load
  }
  export { className as class }
</script>

<div class={className} use:lazyload on:visible={loadHandler}>
  <slot {load} {everLoaded} />
</div>
