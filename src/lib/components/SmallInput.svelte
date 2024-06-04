<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { validatable } from '$lib/stores/validatable'
  import type { FormEventHandler } from 'svelte/elements'
  import Icon from '@iconify/svelte'

  const dispatch = createEventDispatcher()
  export let validate = (v: string): any => v
  export let value = ''
  export let suffix = ''
  export let editOnLeft = false
  let val = validatable(value, validate)
  const changeFromEvent: FormEventHandler<HTMLInputElement> = (e) => {
    val.set(e.currentTarget.value)
    _updateValue($val, true)
  }
  const _updateValue = (v: string, fromInput = false) => {
    value = v
    dispatch('update', {
      value,
      fromInput,
    })
  }
  $: $val && _updateValue($val)
  let className = ''
  export { className as class }
  let input!: HTMLInputElement
  const focusOnInput = () => {
    input.focus()
    input.setSelectionRange(0, input.value.length)
  }
</script>

<div class="flex flex-row justify-center">
  {#if editOnLeft}
    <button class="flex items-center text-sm" on:click={focusOnInput}>
      <Icon icon="teenyicons:edit-outline" height="1em" width="1em" />
    </button>
  {/if}
  <div class="flex flex-row relative text-transparent pl-1 text-center min-w-6 {className}">
    {value}
    <input
      class="bg-transparent absolute w-full h-full text-slate-950 text-right top-0 left-0 focus:outline-none"
      bind:value
      bind:this={input}
      on:input={changeFromEvent} />
  </div>
  {#if suffix}&nbsp;{suffix}&nbsp;{:else if !editOnLeft}&nbsp;{/if}
  {#if !editOnLeft}
    <button class="flex items-center text-sm" on:click={focusOnInput}>
      <Icon icon="teenyicons:edit-outline" height="1em" width="1em" />
    </button>
  {/if}
</div>
