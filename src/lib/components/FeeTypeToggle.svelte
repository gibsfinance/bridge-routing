<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()
  type Option = {
    key: string
    text: string
  }
  export let options: Option[] = []
  export let active = options[0]?.key
</script>

<div class="isolate inline-flex rounded-md overflow-hidden">
  {#each options as option, i}
    <button
      class="leading-6 uppercase text-xs px-2 text-white hover:bg-purple-600"
      class:ml-0.5={i > 0}
      on:click={() => {
        active = option.key
        dispatch('change', option)
      }}
      class:bg-purple-400={active !== option.key}
      class:bg-purple-600={active === option.key}>{option.text}</button>
  {/each}
</div>
