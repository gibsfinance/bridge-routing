<script lang="ts">
  import Icon from '@iconify/svelte'

  interface Props {
    icon?: string
    size?: number
    color?: string
  }

  const { icon = '', size = 24, color = 'green dark:text-green-200' }: Props = $props()
</script>

<div class="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 text-green-500">
  <Icon {icon} height={size} width={size} {color} />
</div>
