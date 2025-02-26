<script lang="ts">
  import { Switch } from '@skeletonlabs/skeleton-svelte'
  import _ from 'lodash'
  type Props = {
    checked?: boolean
    onchange?: (checked: { checked: boolean }) => void
    class?: string
    name?: string
  }
  let {
    name = _.uniqueId('slide-toggle-'),
    checked: startChecked,
    class: className,
    onchange,
  }: Props = $props()
  let checked = $state(startChecked ?? false)
</script>

<Switch
  {name}
  {checked}
  classes={className}
  onCheckedChange={(e) => {
    checked = e.checked
    onchange?.(e)
  }}
  controlInactive={'bg-gray-400'}
  thumbInactive={'bg-surface-200'}
  controlActive={'bg-surface-500'} />
