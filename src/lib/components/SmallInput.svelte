<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { validatable } from '$lib/stores/validatable'
  import type { FormEventHandler } from 'svelte/elements'
  import Icon from '@iconify/svelte'
  import { humanReadableNumber, numberWithCommas, stripNonNumber } from '$lib/stores/utils'
  import { parseUnits } from 'viem'
  import _ from 'lodash'

  const dispatch = createEventDispatcher()
  export let isNumber = false
  export let validate = (v: string): any => v
  export let value = ''
  export let suffix = ''
  export let editOnLeft = false
  let val = validatable(value, validate)
  let lastValue = value
  $: {
    let [i, d] = value.split('.')
    if (i) {
      i = numberWithCommas(i)
    }
    if (d) {
      value = `${i}.${d}`
    } else {
      value = i
    }
  }
  const changeFromEvent: FormEventHandler<HTMLInputElement> = (e) => {
    let v = e.currentTarget.value
    v = isNumber ? stripNonNumber(v) : v
    val.set(v)
    _updateValue(v, true)
  }
  const _updateValue = (v: string, fromInput = false) => {
    if (isNumber) {
      const d = v.split('.')[1]?.length
      const valAsInt = parseUnits(stripNonNumber(v), d || 0)
      if (_.isNumber(d) && !d) {
        return
      }
      if (valAsInt) {
        value = humanReadableNumber(valAsInt, d || 0)
        lastValue = value
        dispatch('update', {
          value: stripNonNumber(value),
          fromInput,
        })
      } else if (v) {
        lastValue = '0'
      }
    } else {
      value = v
      if (v) {
        lastValue = value
      }
      dispatch('update', {
        value,
        fromInput,
      })
    }
  }
  $: if (_.isString($val)) {
    _updateValue($val)
  }
  $: $val && _updateValue($val)
  let className = ''
  export { className as class }
  let input!: HTMLInputElement
  const focusOnInput = () => {
    input.focus()
    input.setSelectionRange(0, input.value.length)
  }
  const ensureValue = () => {
    if (!input.value) {
      value = lastValue
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
    {value}
    <input
      class="bg-transparent absolute w-full h-full text-slate-950 text-right top-0 left-0 focus:outline-none"
      bind:value
      spellcheck="false"
      bind:this={input}
      on:input={changeFromEvent}
      on:blur={ensureValue} />
  </div>
  {#if suffix}&nbsp;{suffix}&nbsp;{:else if !editOnLeft}&nbsp;{/if}
  {#if !editOnLeft}
    <button class="flex items-center text-sm" on:click={focusOnInput}>
      <Icon icon="teenyicons:edit-outline" height="1em" width="1em" />
    </button>
  {/if}
</div>
