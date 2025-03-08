<script lang="ts">
  import Icon from '@iconify/svelte'
  import Button from './Button.svelte'
  import Loading from './Loading.svelte'
  import { activeOnboardStep } from '$lib/stores/storage.svelte'

  type Props = {
    disabled: boolean
    onclick: () => void
    text: string
    loadingKey: string
  }
  const { disabled, onclick, text, loadingKey }: Props = $props()
  const incrementOnboardStep = () => {
    activeOnboardStep.value += 1
  }
  const decrementOnboardStep = () => {
    activeOnboardStep.value -= 1
  }
</script>

<div class="flex flex-row rounded-2xl overflow-hidden">
  <Button
    class="w-14 bg-tertiary-500 text-surface-contrast-950 group flex items-center justify-center"
    onclick={decrementOnboardStep}
    disabled={activeOnboardStep.value === 1}>
    <Icon
      icon="line-md:chevron-double-left"
      class="size-7 transition-transform duration-100 {activeOnboardStep.value !== 1
        ? 'group-hover:-translate-x-0.5'
        : ''}" />
  </Button>
  <Button
    {disabled}
    class="bg-tertiary-500 text-surface-contrast-950 h-14 grow text-xl flex flex-row items-center justify-center shrink-0"
    {onclick}>
    <Loading key={loadingKey}>
      {#snippet contents()}{text}{/snippet}
    </Loading>
  </Button>
  <Button
    class="w-14 bg-tertiary-500 text-surface-contrast-950 group flex items-center justify-center"
    onclick={incrementOnboardStep}
    disabled={activeOnboardStep.value === 3}>
    <Icon
      icon="line-md:chevron-double-right"
      class="size-7 transition-transform duration-100 {activeOnboardStep.value !== 3
        ? 'group-hover:translate-x-0.5'
        : ''}" />
  </Button>
</div>
