<script lang="ts">
  import type { FormEventHandler } from 'svelte/elements'
  import Icon from '@iconify/svelte'
  type Props = {
    value?: string | null
    suffix?: string
    editOnLeft?: boolean
    class?: string
    inputClass?: string
    oninput?: (e: string) => void
  }
  let {
    value: startValue = '',
    suffix = '',
    editOnLeft = false,
    oninput = () => {},
    class: className,
    inputClass: inputClassName,
  }: Props = $props()
  let value = $state(startValue)
  // export let value = writable('')
  // export let suffix = ''
  // export let editOnLeft = false
  const changeFromEvent: FormEventHandler<HTMLInputElement> = (e) => {
    value = e.currentTarget.value
    oninput?.(e.currentTarget.value)
  }
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
    <button class="flex items-center text-sm" type="button" onclick={focusOnInput}>
      <Icon icon="teenyicons:edit-outline" height="1em" width="1em" />
    </button>
  {/if}
  <div class="flex flex-row relative text-transparent pl-1 text-center min-w-8 {className}">
    {value}
    <input
      class="bg-transparent absolute w-full h-full text-slate-950 text-right top-0 left-0 min-w-8 p-0 pr-0.5 focus:outline-hidden border-none focus:ring-0 {inputClassName}"
      {value}
      spellcheck="false"
      bind:this={input}
      oninput={changeFromEvent}
      onblur={ensureValue} />
  </div>
  {#if suffix}{suffix}&nbsp;{:else if !editOnLeft}&nbsp;{/if}
  {#if !editOnLeft}
    <button class="flex items-center text-sm" type="button" onclick={focusOnInput}>
      <Icon icon="teenyicons:edit-outline" height="1em" width="1em" />
    </button>
  {/if}
</div>
