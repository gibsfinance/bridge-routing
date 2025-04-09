<script lang="ts">
  import lifi from '../images/providers/lifi.svg?raw'
  import Icon from '@iconify/svelte'
  import type { ClassValue } from 'svelte/elements'
  type Props = {
    textColor?: ClassValue
    size?: ClassValue
    position?: ClassValue
  }
  const {
    textColor = '[&>svg]:stroke-white [&>svg>path]:fill-white',
    size = 'h-full w-16',
    position = 'inline-flex translate-y-2.5 -mt-2.5',
  }: Props = $props()
  const classes = $derived([position, textColor, size])
</script>

<a href="https://li.fi/" target="_blank" class="inline-flex items-center gap-2">
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  <span class={classes}>{@html lifi}</span>
  <Icon icon="gis:direct" class="size-6 {position}" />
</a>
