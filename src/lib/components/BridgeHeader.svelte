<script lang="ts">
  import Icon from '@iconify/svelte'
  import { advancedMode } from '$lib/stores/storage.svelte'
  import Button from './Button.svelte'
</script>

<div class="size-12 w-full relative flex items-center flex-row">
  <Button
    class="size-9 rounded-full flex items-center justify-center border-2 transition-all duration-100 {advancedMode.value
      ? ''
      : 'border-transparent'} {advancedMode.value ? 'rotate-45' : 'rotate-180'}"
    onclick={() => {
      advancedMode.value = !advancedMode.value
    }}>
    <Icon
      icon="material-symbols:settings-outline-rounded"
      class="transition-all duration-100 {advancedMode.value ? 'size-7' : 'size-8'}" />
  </Button>
  <div
    class="absolute left-0 right-0 top-0 bottom-0 flex items-center justify-center size-9 m-auto">
    <Icon icon="icon-park-solid:bridge-one" class="size-8" />
  </div>
</div>
