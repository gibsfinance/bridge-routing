<script lang="ts">
  import _ from 'lodash'
  import Input from './Input.svelte'
  import classNames from 'classnames'
  import type { ClassParam } from '$lib/types.svelte'
  import { tick, type Snippet } from 'svelte'
  type Props = {
    value: string
    roundedClasses?: ClassParam
    borderClasses?: ClassParam
    backgroundClasses?: ClassParam
    paddingClasses?: ClassParam
    oninput: (val: string) => void
    icon?: Snippet
  }
  const {
    value,
    roundedClasses = 'rounded-full',
    borderClasses = 'border border-gray-50 focus:border-gray-50',
    backgroundClasses = 'bg-white',
    paddingClasses = 'leading-8 pr-4 pl-18',
    oninput,
    icon,
  }: Props = $props()
  const searchInputId = _.uniqueId('search-input')
  const classes = $derived(
    classNames(paddingClasses, roundedClasses, backgroundClasses, borderClasses),
  )
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
