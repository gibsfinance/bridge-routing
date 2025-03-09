<script lang="ts">
  import _ from 'lodash'
  import Input from './Input.svelte'
  import Icon from '@iconify/svelte'
  import classNames from 'classnames'
  import type { ClassParam } from '$lib/types.svelte'
  type Props = {
    value: string
    roundedClasses?: ClassParam
    borderClasses?: ClassParam
    backgroundClasses?: ClassParam
    paddingClasses?: ClassParam
    oninput: (val: string) => void
  }
  const {
    value,
    roundedClasses = 'rounded-full',
    borderClasses = 'border-none',
    backgroundClasses = 'bg-surface-900-100',
    paddingClasses = 'leading-8 px-4',
    oninput,
  }: Props = $props()
  const searchInputId = _.uniqueId('search-input')
  // "rounded-lg border border-slate-400 pl-6"
  const classes = $derived(
    classNames(paddingClasses, roundedClasses, backgroundClasses, borderClasses),
  )
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
      {oninput} />
    <!-- <Icon
      icon="ic:baseline-search"
      height="1.5em"
      width="1.5em"
      class="cursor-text size-8 p-1 flex absolute right-0" /> -->
  </div>
</label>
