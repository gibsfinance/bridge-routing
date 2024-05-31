<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { validatable } from '$lib/stores/validatable'
  import type { FormEventHandler } from 'svelte/elements'

  const dispatch = createEventDispatcher()
  export let validate = (v: string): any => v
  export let value = ''
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
</script>

<div class="flex flex-row relative text-transparent pl-1 text-center min-w-6 {className}">
  {value}<input
    class="bg-transparent absolute w-full h-full text-slate-950 text-right top-0 left-0 focus:outline-none"
    bind:value
    on:input={changeFromEvent} />
</div>
