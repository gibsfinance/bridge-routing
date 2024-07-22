<script lang="ts">
  import Icon from '@iconify/svelte'
  import _ from 'lodash'
  export let src = ''
  export let alt = ''
  export let size = 32
  export let visible = false
  let className = ''
  export { className as class }
  let loaded: boolean | null = null
  const markLoaded = (val: boolean) => () => {
    loaded = val
  }
  const markSuccess = markLoaded(true)
  const markFailure = markLoaded(false)
</script>

<div class="flex" data-url={src}>
  {#if src && visible && loaded !== false}
    <img on:load={markSuccess} on:error={markFailure} {src} {alt} height={size} width={size} class={className} />
  {:else if !loaded}
    <Icon icon="ph:question" height={size} width={size} class={className} />
  {/if}
</div>
