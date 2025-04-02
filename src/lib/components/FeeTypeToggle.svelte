<script lang="ts">
  type Option = {
    key: string
    text: string
  }
  
  type Props = {
    options: Option[]
    active?: string
    onchange?: (option: Option) => void
  }
  let { options, active = options[0]?.key, onchange }: Props = $props()
</script>

<div class="isolate inline-flex text-surface-contrast-50">
  {#each options as option, i (option.key)}
    <button
      class="leading-5 min-w-5 uppercase text-xs px-1 border-2 rounded-full hover:border-surface-500 flex items-center justify-center"
      class:ml-0.5={i > 0}
      onclick={() => {
        active = option.key
        onchange?.(option)
      }}
      class:border-surface-400={active !== option.key}
      class:border-surface-600={active === option.key}>{option.text}</button>
  {/each}
</div>
