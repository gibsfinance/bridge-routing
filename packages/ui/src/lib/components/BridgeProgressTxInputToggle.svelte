<script lang="ts">
  import Button from './Button.svelte'
  import Icon from '@iconify/svelte'
  import { bridgeTx } from '../stores/storage.svelte'
  const showTxInputEdit = () => {
    bridgeTx.extend({ showEdit: true })
  }
</script>

<Button
  onclick={showTxInputEdit}
  class="opacity-0 hover:opacity-100 transition-opacity duration-100 text-surface-50 absolute left-0 translate-y-1/2 -translate-x-1/2">
  <Icon icon="mdi:pencil" class="size-4 flex" />
</Button>
