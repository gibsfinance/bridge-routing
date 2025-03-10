<script lang="ts">
  import { activeOnboardStep } from '$lib/stores/storage.svelte'
  import classNames from 'classnames'
  import Button from './Button.svelte'
  import Icon from '@iconify/svelte'
  type Props = {
    step: number
    justifyClass?: string
    sizeClass?: string
  }
  const {
    step,
    justifyClass,
    sizeClass = 'w-5 h-full flex items-center justify-center',
  }: Props = $props()
  const isActive = $derived(activeOnboardStep.value >= step)
  const classes = classNames(sizeClass, justifyClass)
</script>

<Button class={classes} onclick={() => (activeOnboardStep.value = step)}>
  <Icon
    icon="rivet-icons:chevron-right"
    class="h-3.5 w-3.5 text-surface-800 {isActive ? '' : 'opacity-40'}" />
</Button>
