<!-- Info tooltip component with question mark icon -->
<script lang="ts">
  import Tooltip from './Tooltip.svelte'

  interface Props {
    text: string
    placement?: 'top' | 'bottom' | 'left' | 'right'
    iconSize?: number
    iconColor?: string
    class?: string
    maxWidth?: string
  }

  let {
    text,
    placement = 'top',
    iconSize = 4,
    iconColor = 'text-gray-500 dark:text-gray-400',
    class: className = '',
    maxWidth,
  }: Props = $props()
</script>

<Tooltip {placement} class={className} {maxWidth} zIndex="50">
  {#snippet trigger()}
    <svg
      class="w-{iconSize} h-{iconSize} {iconColor} cursor-help"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  {/snippet}

  {#snippet content()}
    {text}
  {/snippet}
</Tooltip>
