<!-- <script lang="ts">
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

<div class="w-1 h-6 bg-gray-400 flex"></div>

<Switch
  {name}
  {checked}
  classes={className}
  onCheckedChange={onchange}
  controlBase="w-10 h-6"
  controlInactive={'bg-gray-400'}
  controlActive={'bg-surface-500'}
  thumbInactive={'bg-surface-200'}
  thumbActive={'bg-surface-500'} /> -->
