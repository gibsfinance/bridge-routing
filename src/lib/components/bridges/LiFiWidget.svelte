<script lang="ts">
  import { LiFiWidget, type WidgetConfig } from '@lifi/widget'
  import ReactAdapter from './ReactAdapter.svelte'

  type Props = {
    config: Omit<WidgetConfig, 'integrator'>
    integrator?: string
  }
  const { config, integrator = 'gibs.finance' }: Props = $props()
</script>

<ReactAdapter element={LiFiWidget} {config} {integrator} />
