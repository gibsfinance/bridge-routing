<script lang="ts">
  type Option = {
    key: string
    text: string
  }
  // export let options: Option[] = []
  // export let active = options[0]?.key
  // export let onchange?: (option: Option) => void
  type Props = {
    options: Option[]
    active?: string
    onchange?: (option: Option) => void
  }
  let { options, active = options[0]?.key, onchange }: Props = $props()
</script>

<div class="isolate inline-flex rounded-md overflow-hidden">
  {#each options as option, i}
    <button
      class="leading-6 uppercase text-xs px-2 text-white hover:bg-tertiary-500"
      class:ml-0.5={i > 0}
      onclick={() => {
        active = option.key
        onchange?.(option)
      }}
      class:bg-tertiary-400={active !== option.key}
      class:bg-tertiary-600={active === option.key}>{option.text}</button>
  {/each}
</div>
