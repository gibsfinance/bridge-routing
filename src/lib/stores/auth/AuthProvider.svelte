<script lang="ts">
  import Onboard, {
    type ConnectOptions,
    type DisconnectOptions,
    type PreflightNotificationsOptions,
    type WalletState,
  } from '@web3-onboard/core'
  import { chainsMetadata } from './constants'
  import injectedWallet from '@web3-onboard/injected-wallets'
  import walletConnectModule from '@web3-onboard/walletconnect'
  import { Chains } from './types'
  import { onMount, setContext } from 'svelte'
  import { CONTEXT_KEY } from './methods'
  import { activeChain, walletClient } from './store'
  import type { ChainWithDecimalId } from '@web3-onboard/common'
  import { createWalletClient, custom } from 'viem'
  import gibsIcon from '$lib/images/1FAF0.svg'
  const walletConnect = walletConnectModule({
    projectId: '1f8a963aa1809cada8560d560360107d',
    requiredChains: Object.values(Chains).map((cId) => Number(cId)),
    dappUrl: 'https://gibs.finance',
  })

  const chains = [Chains.PLS].map((key) => {
    const chain = chainsMetadata[key as Chains]

    return {
      id: +key,
      label: chain.name,
      rpcUrl: chain!.rpcUrls!.default.http[0],
      token: chain.nativeCurrency.symbol,
      icon: chain.icon,
    } as ChainWithDecimalId
  })
  const onboard = Onboard({
    chains: chains,
    wallets: [injectedWallet(), walletConnect],
    appMetadata: {
      name: 'Gibs',
      description: 'Get your tokens where they need to go',
      logo: gibsIcon,
      icon: gibsIcon,
    },
    // containerElements: '',
    // notify: {
    //   mobile: {
    //     enabled: true,
    //     transactionHandler: (txInfo) => {
    //       console.log(txInfo)
    //     },
    //     position: 'bottomRight',
    //   },
    //   desktop: {
    //     enabled: true,
    //     transactionHandler: (txInfo) => {
    //       console.log(txInfo)
    //     },
    //     position: 'bottomRight',
    //   },
    // },
    accountCenter: {
      desktop: {
        enabled: true,
        minimal: true,
        position: 'bottomRight',
      },
      mobile: {
        enabled: true,
        minimal: true,
        position: 'bottomRight',
      },
    },
  })

  async function OnWalletsStateChange(walletState: WalletState[]) {
    /**Check if the wallet is connected*/
    if (!walletState || walletState.length === 0) {
      if ($walletClient) {
        $walletClient = undefined
      }
      return
    }

    if (
      Object.keys(chainsMetadata).findIndex((key) => {
        return key.toLowerCase() === walletState[0].chains[0].id.toLowerCase()
      }) === -1 ||
      // Delete this part if you don't want to check if the current wallet chain is the one from the store
      walletState[0].chains[0].id.toLowerCase() !== $activeChain.toLowerCase()
    ) {
      //await switchChain(Chains.ETH);
      await switchChain($activeChain)
    } else {
      $activeChain = walletState[0].chains[0].id as Chains
    }
    $walletClient = createWalletClient({
      chain: chainsMetadata[$activeChain],
      transport: custom(walletState[0].provider),
    })
  }

  onMount(() => {
    const sub = onboard.state.select('wallets').subscribe(OnWalletsStateChange)
    // const subNotifications = onboard.state.select('notifications').subscribe((update) => {
    //   console.log('tx notification', update)
    // })
    return () => {
      sub?.unsubscribe()
      // subNotifications?.unsubscribe()
    }
  })

  async function connect(options?: ConnectOptions) {
    await onboard.connectWallet(options)
  }

  async function disconnect(options: DisconnectOptions) {
    const [primaryWallet] = onboard.state.get().wallets

    if (primaryWallet) {
      await onboard.disconnectWallet({
        ...options,
        label: primaryWallet.label,
      })
      if ($walletClient) $walletClient = undefined
    }
  }

  async function switchChain(chain: string | Chains) {
    await onboard.setChain({ chainId: chain })
  }

  // const sendTransaction = async (args: PreflightNotificationsOptions) => {
  //   return await onboard.state.actions.preflightNotifications(args)
  // }

  setContext(CONTEXT_KEY, {
    connect,
    disconnect,
    switchChain,
    // sendTransaction,
  })
</script>

<slot />
