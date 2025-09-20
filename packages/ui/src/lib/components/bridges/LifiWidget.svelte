<script lang="ts">
  import { LiFiWidget, type WidgetConfig } from '@lifi/widget'
  import ReactAdapter from './ReactAdapter.svelte'

  const config = {
    walletConfig: {
      partialWalletManagement: true,
    },
    toChain: 1,
    toToken: '0x0000000000000000000000000000000000000000',
    integrator: 'gibs.finance',
  } as WidgetConfig
  const { close } = $$props
</script>

<ReactAdapter element={LiFiWidget} {config} {close} integrator={config.integrator} />
