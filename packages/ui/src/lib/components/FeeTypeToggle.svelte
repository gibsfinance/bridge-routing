<script lang="ts">
  import Icon from "@iconify/svelte"
  import { Popover } from "@skeletonlabs/skeleton-svelte"

  type Option = {
    key: string
    text: string
    tooltip: string
  }

  type Props = {
    options: Option[]
    active?: string
    onchange?: (option: Option) => void
  }
  let { options, active = options[0]?.key, onchange }: Props = $props()
  const activeOption = $derived(options.find((option) => option.key === active))
</script>

<div class="flex text-surface-950 dark:text-surface-500">
  {#each options as option, i (option.key)}
    <button
      type="button"
      class="leading-5 min-w-5 uppercase text-xs px-1 border-2 rounded-full hover:border-surface-500 flex items-center justify-center"
      class:ml-0.5={i > 0}
      class:border-surface-400={active !== option.key}
      class:border-surface-600={active === option.key}
      class:dark:border-surface-800={active !== option.key}
      class:dark:border-surface-600={active === option.key}
      title={option.tooltip}
      onclick={() => {
        active = option.key
        onchange?.(option)
      }}>{option.text}</button>
  {/each}
  <Popover positioning={{ placement: 'top' }} triggerClasses="flex" contentClasses="card bg-white border text-surface-50 text-sm px-2 py-1 max-w-[280px]">
    {#snippet trigger()}
      <Icon icon="mdi:information-outline" class="w-6 h-6" />
    {/snippet}
    {#snippet content()}{activeOption!.tooltip}{/snippet}
  </Popover>
</div>
