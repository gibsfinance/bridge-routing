<script lang="ts">
  import _ from 'lodash'
  import Input from './Input.svelte'
  import type { ClassValue } from 'svelte/elements'
  import { tick, type Snippet } from 'svelte'
  type Props = {
    value: string
    roundedClasses?: ClassValue
    borderClasses?: ClassValue
    backgroundClasses?: ClassValue
    paddingClasses?: ClassValue
    oninput: (val: string) => void
    icon?: Snippet
  }
  const {
    value,
    roundedClasses = 'rounded-full',
    borderClasses = 'border border-gray-50 focus:border-gray-50',
    backgroundClasses = 'bg-white',
    paddingClasses = `leading-8 px-4`,
    oninput,
    icon,
  }: Props = $props()
  const searchInputId = _.uniqueId('search-input')
  const classes = $derived([paddingClasses, roundedClasses, backgroundClasses, borderClasses])
  let inputRef: HTMLInputElement | null = $state(null)
  $effect(() => {
    if (inputRef) {
      tick().then(() => {
        inputRef?.focus()
      })
    }
  })
</script>

<label class="flex h-fit flex-row items-center px-6 py-2" for={searchInputId}>
  <div class="flex flex-row items-center gap-2 relative w-full">
    <Input
      autoFocus
      id={searchInputId}
      size="md"
      placeholder="Search Tokens"
      class={classes}
      {value}
      {oninput}
      setref={(el) => {
        inputRef = el
      }} />
    <div class="absolute left-0 top-0 bottom-0 m-auto">
      {@render icon?.()}
    </div>
  </div>
</label>
