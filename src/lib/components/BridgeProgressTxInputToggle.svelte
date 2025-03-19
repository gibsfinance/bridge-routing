<script lang="ts">
  import Button from './Button.svelte'
  import Icon from '@iconify/svelte'
  import { bridgeTx } from '$lib/stores/storage.svelte'
  const showTxInputEdit = () => {
    bridgeTx.extend({ showEdit: true })
  }
</script>

<Button
  onclick={showTxInputEdit}
  class="opacity-0 hover:opacity-100 transition-opacity duration-100 text-surface-contrast-50 absolute top-full left-0">
  <Icon icon="mdi:pencil" class="size-4 flex" />
</Button>
