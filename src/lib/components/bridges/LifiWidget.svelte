<script lang="ts">
  import { LiFiWidget, type WidgetConfig } from '@lifi/widget'
  import ReactAdapter from './ReactAdapter.svelte'
  // import { connect } from '$lib/stores/auth/AuthProvider.svelte'

  const config = {
    theme: {
      container: {
        // boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.08)',
        // borderRadius: '24px',
      },
    },
    walletConfig: {
      // onConnect: () => {
      //   connect()
      // },
      partialWalletManagement: true,
    },
    toChain: 1,
    toToken: '0x0000000000000000000000000000000000000000',
    integrator: 'gibs.finance',
  } as WidgetConfig
  const { close } = $$props
</script>

<ReactAdapter element={LiFiWidget} {config} {close} />
