<script lang="ts">
  import Icon from '@iconify/svelte'

  export let icon = ''
  export let size = 24
  export let color = 'green'
</script>

<div class="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
  <Icon {icon} height={size} width={size} {color} />
</div>
