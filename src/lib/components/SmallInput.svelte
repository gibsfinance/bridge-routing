<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { FormEventHandler } from 'svelte/elements'

  const dispatch = createEventDispatcher()
  export let value = ''
  export let validate = (v: string) => {}
  export let updateValue = (v: string) => v
  const changeFromEvent: FormEventHandler<HTMLInputElement> = (e) => {
    const v = e.currentTarget.value
    try {
      validate(v)
    } catch (err) {
      value = value.replace((e as any).data as string, '')
      return
    }
    _updateValue(v, true)
  }
  const _updateValue = (v: string, fromInput = false) => {
    value = updateValue(v)
    dispatch('update', {
      value,
      fromInput,
    })
  }
  $: value && _updateValue(value)
</script>

<div class="flex flex-row relative text-transparent pl-1 text-center min-w-6">
  {value}<input
    class="bg-transparent absolute w-full h-full text-slate-950 text-right top-0 left-0 focus:outline-none"
    bind:value
    on:input={changeFromEvent}
  />
</div>
