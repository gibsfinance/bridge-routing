import {
  createAppKit,
  type CaipNetwork,
  type ConnectedWalletInfo,
  type UseAppKitAccountReturn,
} from '@reown/appkit'
import * as networks from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { NullableProxyStore } from '$lib/types.svelte'
import type { Hex } from 'viem'
import * as chains from 'viem/chains'
import { walletConnectProjectId } from '$lib/config'
import { EthereumProvider } from '@walletconnect/ethereum-provider'
import { getBalance, getConnectors, watchBlockNumber, type GetBalanceReturnType } from '@wagmi/core'
import { SvelteMap } from 'svelte/reactivity'

const projectId = walletConnectProjectId

export const appkitNetworkList = [
  networks.mainnet,
  networks.pulsechain,
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
] as [networks.AppKitNetwork, ...networks.AppKitNetwork[]]
export const appkitNetworkIds = new Set(appkitNetworkList.map((n) => n.id))
export const appkitNetworkById = new Map<number, networks.AppKitNetwork>(
  appkitNetworkList.map((n) => [n.id, n] as [number, networks.AppKitNetwork]),
)
export const chainsById = new Map<string | number, chains.Chain>(
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
// 3. Configure the metadata
const metadata = {
  name: 'Gibs',
  description: 'Bridge and Swap your favorite Pulsechain tokens.',
  url: location.origin, // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
}

// 3. Create the modal
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: appkitNetworkList,
  metadata,
  projectId,
  features: {
    // collapseWallets: true,
    // allWallets: true,
    analytics: false,
  },
})

// try {
//   // modal.disconnect()
//   modal.resetAccount('eip155')
// } catch {
//   console.log('err at disconnect')
// }

export const connect = async () => {
  // accountState.modalOpen = true
  await modal.open()

  const ethProvider = await EthereumProvider.init({
    projectId,
    metadata,
    showQrModal: true,
    chains: appkitNetworkList.map((n) => n.id) as [number, ...number[]],
  })
  provider.value = ethProvider
}

type EthereumProviderType = Awaited<ReturnType<typeof EthereumProvider.init>>
export const provider = new NullableProxyStore<EthereumProviderType>()

export const disconnect = async () => {
  return await modal.close()
}

export const switchNetwork = async (chain: networks.AppKitNetwork | null | undefined) => {
  // console.log('switchNetwork', chain)
  if (chain) {
    try {
      const connectors = getConnectors(wagmiAdapter.wagmiConfig)
      if (!connectors.length) {
        console.log('no connectors')
        return
      }
      await wagmiAdapter.switchNetwork({
        caipNetwork: chain as CaipNetwork,
      })
    } catch (err) {
      console.error('err at switchNetwork', err)
    }
  }
}

export const walletInfoState = new NullableProxyStore<ConnectedWalletInfo>()

class AccountState {
  private val = $state<UseAppKitAccountReturn | null>(null)
  chainId = $state<number | null>(null)
  lastKnownBalances = new SvelteMap<
    UseAppKitAccountReturn['caipAddress'],
    GetBalanceReturnType & {
      lastUpdated: number
    }
  >()
  set value(account: UseAppKitAccountReturn | null) {
    this.val = account
    const caipAddress = account?.caipAddress
    if (!caipAddress) return
    this.chainId = +caipAddress.split(':')[1] || (null as number | null)
    this.setupWatchBalance()
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
  get chainIdHex() {
    return this.chainId ? `0x${this.chainId.toString(16)}` : null
  }
  get value() {
    return this.val
  }
  get address() {
    return (this.value?.address ?? null) as Hex | null
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
  private setupWatchBalanceCleanup = () => {}
  setupWatchBalance() {
    this.setupWatchBalanceCleanup?.()
    const address = this.address
    if (!address) return
    this.setupWatchBalanceCleanup = watchBlockNumber(wagmiAdapter.wagmiConfig, {
      chainId: this.chainId!,
      emitOnBegin: true,
      // emitMissed: true,
      onBlockNumber: async () => {
        const balance = await getBalance(wagmiAdapter.wagmiConfig, {
          address,
          chainId: this.chainId!,
        }).catch(() => ({
          value: 0n,
          decimals: 18,
          formatted: '0',
          symbol: 'ETH',
        }))
        this.lastKnownBalances.set(this.caipAddress, {
          lastUpdated: Date.now(),
          ...balance,
        })
      },
    })
    return this.setupWatchBalanceCleanup
  }
}
export const accountState = new AccountState()

modal.subscribeProviders((providers) => {
  if (!providers.eip155) return
  provider.value = providers.eip155 as EthereumProviderType
})

modal.subscribeEvents((event) => {
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
  if (account.status === 'connected') {
    accountState.value = account ?? null
  }
})
