<script lang="ts">
  import { Switch } from '@skeletonlabs/skeleton-svelte'
  import _ from 'lodash'
  type Props = {
    checked?: boolean
    onchange?: (checked: { checked: boolean }) => void
    class?: string
    name?: string
  }
  const {
    name = _.uniqueId('slide-toggle-'),
    checked,
    class: className,
    onchange,
  }: Props = $props()
</script>

<Switch
  {name}
  {checked}
  classes={className}
  onCheckedChange={onchange}
  controlInactive={'bg-gray-400'}
  thumbInactive={'bg-surface-200'}
  controlActive={'bg-surface-500'} />
