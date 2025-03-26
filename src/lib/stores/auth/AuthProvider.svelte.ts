import {
  createAppKit,
  type CaipNetwork,
  type ConnectedWalletInfo,
  type UseAppKitAccountReturn,
} from '@reown/appkit'
import * as networks from '@reown/appkit/networks'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { NullableProxyStore } from '$lib/types.svelte'
import * as chains from 'viem/chains'
import { walletConnectProjectId as projectId } from '$lib/config'
import { UniversalProvider } from '@walletconnect/universal-provider'
import type { GetBalanceReturnType } from '@wagmi/core'
import { SvelteMap } from 'svelte/reactivity'
import { SolflareWalletAdapter, PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import type { BaseWalletAdapter } from '@solana/wallet-adapter-base'

export const appkitNetworkList = [
  networks.mainnet,
  networks.pulsechain,
  networks.solana,
  networks.sepolia,
  networks.pulsechainV4,
  networks.bsc,
  // lifi network list
  networks.arbitrum,
  networks.base,
  networks.blast,
  networks.avalanche,
  networks.polygon,
  networks.scroll,
  networks.optimism,
  networks.linea,
  networks.zksync,
  networks.polygonZkEvm,
  networks.gnosis,
  networks.fantom,
  networks.fuse,
  networks.boba,
  networks.unichain,
  networks.aurora,
  networks.sei,
  networks.immutableZkEvm,
  networks.sonic,
  networks.gravity,
  networks.taiko,
  networks.cronos,
  networks.cronoszkEVM,
  networks.fraxtal,
  networks.abstract,
  networks.rootstock,
  networks.celo,
  networks.worldchain,
  networks.mantle,
  networks.berachain,
] as unknown as [CaipNetwork, ...CaipNetwork[]]

export const appkitNetworkIds = new Set(appkitNetworkList.map((n) => n.id))
export const appkitNetworkById = new Map<string | number, CaipNetwork>(
  appkitNetworkList.map((n) => [n.id, n] as [string | number, CaipNetwork]),
)
export const evmChainsById = new Map<string | number, chains.Chain>(
  Object.values(chains)
    .filter((chain) => appkitNetworkIds.has(chain.id))
    .map((chain) => [chain.id, chain]),
)

// 2. Set up Wagmi adapter
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: appkitNetworkList,
  syncConnectedChain: false,
})

export const solanaAdapter = new SolanaAdapter({
  wallets: [
    new PhantomWalletAdapter() as unknown as BaseWalletAdapter,
    new SolflareWalletAdapter() as unknown as BaseWalletAdapter,
  ],
})

// 3. Configure the metadata
const metadata = {
  name: 'Gibs',
  description: 'Bridge and Swap your favorite Pulsechain tokens.',
  url: location.origin, // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
}

// 3. Create the modal
export const modal = createAppKit({
  adapters: [wagmiAdapter, solanaAdapter],
  networks: appkitNetworkList,
  metadata,
  projectId,
  features: {
    analytics: false,
  },
})

// export const universalProvider = await UniversalProvider.init({
//   projectId,
//   metadata,
// })
export const connect = async () => {
  await modal.open()
}

// type EthereumProviderType = Awaited<ReturnType<typeof UniversalProvider.init>>
// export const provider = new NullableProxyStore<EthereumProviderType>()

export const disconnect = async () => {
  return await modal.close()
}

export const switchNetwork = async (chain: CaipNetwork | null | undefined) => {
  if (chain) {
    try {
      // const connectors = getConnectors(wagmiAdapter.wagmiConfig)
      // if (!connectors.length) {
      //   console.log('no connectors')
      //   return
      // }
      // await provider.value?.connect()
      // await provider.value?.session?.
      // await provider.value?.switchChain({
      //   caipNetwork: chain as CaipNetwork,
      // })
      // console.log('switching to', chain)
      await modal.switchNetwork(chain)
      // await modal.open({
      //   view: 'Networks',
      //   data: {
      //     caipNetwork: chain as CaipNetwork,
      //   },
      // })
    } catch (err) {
      console.error('err at switchNetwork', err)
    }
  }
}

export const walletInfoState = new NullableProxyStore<ConnectedWalletInfo>()

class AccountState {
  private val = $state<UseAppKitAccountReturn | null>(null)
  lastKnownBalances = new SvelteMap<
    UseAppKitAccountReturn['caipAddress'],
    GetBalanceReturnType & {
      lastUpdated: number
    }
  >()
  set value(account: UseAppKitAccountReturn | null) {
    this.val = account
    // console.log('account', account)
    // const caipAddress = account?.caipAddress
    // if (!caipAddress) return
    // const chainId = +caipAddress.split(':')[1] || (null as number | null)
    // console.log('chainId', caipAddress, chainId)
    // this.chainId = chainId
    // this.setupWatchBalance()
  }
  get balance() {
    const caipAddress = this.val?.caipAddress
    if (!caipAddress) return null
    const balance = this.lastKnownBalances.get(caipAddress)
    if (!balance) return null
    // if balance is older than 2 minutes, return null
    if (balance.lastUpdated < Date.now() - 1000 * 60 * 2) return null
    return balance.value
  }
  get caipAddress() {
    return this.val?.caipAddress
  }
  get chainId() {
    return this.val?.caipAddress?.split(':')[1] || null
  }
  get prefix() {
    return this.val?.caipAddress?.split(':')[0] || null
  }
  // get chainIdHex() {
  //   const chainId = this.chainId
  //   if (chainId && Number.isNaN(Number(chainId))) {
  //     // console.log('chainId is not a number', chainId)
  //     return
  //   }
  //   const cId = Number(chainId)
  //   return cId ? `0x${cId.toString(16)}` : null
  // }
  get value() {
    return this.val
  }
  get address() {
    return (this.value?.address ?? null) as string | null
  }
  get connected() {
    return !!this.value?.address
  }
  private modalIsOpen = $state(false)
  get modalOpen() {
    return this.modalIsOpen
  }
  set modalOpen(open: boolean) {
    this.modalIsOpen = open
  }
  // private setupWatchBalanceCleanup = () => {}
  // setupWatchBalance() {
  // this.setupWatchBalanceCleanup?.()
  // const address = this.address
  // if (!address) return
  // this.setupWatchBalanceCleanup = watchBlockNumber(wagmiAdapter.wagmiConfig, {
  //   chainId: this.chainId!,
  //   emitOnBegin: true,
  //   // emitMissed: true,
  //   onBlockNumber: async () => {
  //     const balance = await getBalance(wagmiAdapter.wagmiConfig, {
  //       address,
  //       chainId: this.chainId!,
  //     }).catch(() => ({
  //       value: 0n,
  //       decimals: 18,
  //       formatted: '0',
  //       symbol: 'ETH',
  //     }))
  //     this.lastKnownBalances.set(this.caipAddress, {
  //       lastUpdated: Date.now(),
  //       ...balance,
  //     })
  //   },
  // })
  // return this.setupWatchBalanceCleanup
  // }
}
export const accountState = new AccountState()

// modal.subscribeProviders((providers) => {
//   console.log(providers)
//   if (!providers.eip155) return
//   provider.value = providers.eip155 as EthereumProviderType
// })

modal.subscribeEvents((event) => {
  // console.log('event', event)
  const { event: e } = event.data
  if (e === 'MODAL_OPEN') {
    accountState.modalOpen = true
  } else if (e === 'MODAL_CLOSE') {
    accountState.modalOpen = false
  }
})

modal.subscribeWalletInfo((walletInfo) => {
  walletInfoState.value = walletInfo ?? null
})

modal.subscribeAccount((account) => {
  // console.log('account', account)
  if (account.status === 'connected') {
    accountState.value = account ?? null
  } else if (account.status === 'disconnected') {
    accountState.value = null
  }
})

export const destroy = async () => {
  await Promise.all([wagmiAdapter.disconnect(), modal.disconnect()])
}

export const getNetwork = (options: { chainId: number | string; name: string }) => {
  const { chainId, name } = options
  return [...appkitNetworkById.values()].find(
    (c) => c.id === chainId || c.name.toLowerCase() === name.toLowerCase(),
  )
}
