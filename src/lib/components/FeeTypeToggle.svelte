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

<div class="join">
  {#each options as option}
    <button
      class="leading-6 uppercase text-xs px-2 mr-[3px] text-white join-item hover:bg-purple-600"
      on:click={() => {
        active = option.key
        dispatch('change', option)
      }}
      class:bg-purple-400={active !== option.key}
      class:bg-purple-600={active === option.key}>{option.text}</button>
  {/each}
</div>
<!--
<div class="join">
  <button
    class="leading-6 uppercase text-xs px-2 mr-[3px] text-white join-item hover:bg-purple-600"
    on:click={() => {
      active = 'fixed'
    }}
    class:bg-purple-400={active !== 'fixed'}
    class:bg-purple-600={active === 'fixed'}>Fixed</button>
  <button
    class="leading-6 uppercase text-xs px-2 mr-[3px] text-white join-item hover:bg-purple-600"
    on:click={() => {
      active = 'base'
    }}
    class:bg-purple-400={active !== 'base'}
    class:bg-purple-600={active === 'base'}>Base</button>
  <button
    class="leading-6 uppercase text-xs px-2 mr-[3px] text-white join-item hover:bg-purple-600"
    on:click={() => {
      active = '%'
    }}
    class:bg-purple-400={active !== '%'}
    class:bg-purple-600={active === '%'}>%</button>
</div> -->
