<script lang="ts">
  import type { FormEventHandler } from 'svelte/elements'
  import Icon from '@iconify/svelte'
  import { writable } from 'svelte/store'
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()
  export let value = writable('')
  export let suffix = ''
  export let editOnLeft = false
  const changeFromEvent: FormEventHandler<HTMLInputElement> = (e) => {
    value.set(e.currentTarget.value)
    dispatch('input', {
      value: e.currentTarget.value,
    })
  }
  let className = ''
  export { className as class }
  let input!: HTMLInputElement
  const focusOnInput = () => {
    input.focus()
    input.setSelectionRange(0, input.value.length)
  }
  const ensureValue = () => {
    if (!input.value) {
    }
  }
</script>

<div class="flex flex-row justify-center">
  {#if editOnLeft}
    <button class="flex items-center text-sm" on:click={focusOnInput}>
      <Icon icon="teenyicons:edit-outline" height="1em" width="1em" />
    </button>
  {/if}
  <div class="flex flex-row relative text-transparent pl-1 text-center min-w-6 {className}">
    {$value}
    <input
      class="bg-transparent absolute w-full h-full text-slate-950 text-right top-0 left-0 focus:outline-none"
      value={$value}
      spellcheck="false"
      bind:this={input}
      on:input={changeFromEvent}
      on:blur={ensureValue} />
  </div>
  {#if suffix}{suffix}&nbsp;{:else if !editOnLeft}&nbsp;{/if}
  {#if !editOnLeft}
    <button class="flex items-center text-sm" on:click={focusOnInput}>
      <Icon icon="teenyicons:edit-outline" height="1em" width="1em" />
    </button>
  {/if}
</div>
