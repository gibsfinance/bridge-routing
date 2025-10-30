<script lang="ts">
  import { LiFiWidget, type WidgetConfig } from '@lifi/widget'
  import ReactAdapter from './ReactAdapter.svelte'

  interface Props {
    close: () => void
  }

  const { close }: Props = $props()

  const config = {
    walletConfig: {
      partialWalletManagement: true,
    },
    toChain: 1,
    toToken: '0x0000000000000000000000000000000000000000',
    integrator: 'gibs.finance',
  } as WidgetConfig
</script>

<ReactAdapter element={LiFiWidget} {config} {close} integrator={config.integrator} />
