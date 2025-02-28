import { createAppKit, type ConnectedWalletInfo, type UseAppKitAccountReturn } from '@reown/appkit'
import {
  mainnet,
  pulsechain,
  sepolia,
  pulsechainV4,
  bsc,
  type AppKitNetwork,
} from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { NullableProxyStore } from '$lib/types.svelte'
import type { Hex } from 'viem'
import { walletConnectProjectId } from '$lib/config'
import { EthereumProvider } from '@walletconnect/ethereum-provider'
import { getBalance, watchBlockNumber, type GetBalanceReturnType } from '@wagmi/core'
import { SvelteMap } from 'svelte/reactivity'

const projectId = walletConnectProjectId

export const networks = [mainnet, pulsechain, sepolia, pulsechainV4, bsc] as [
  AppKitNetwork,
  ...AppKitNetwork[],
]

// 2. Set up Wagmi adapter
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
  syncConnectedChain: true,
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
  networks,
  metadata,
  projectId,
  features: {
    // collapseWallets: true,
    // allWallets: true,
    analytics: false,
  },
})

export const connect = async () => {
  // accountState.modalOpen = true
  await modal.open()

  const ethProvider = await EthereumProvider.init({
    projectId,
    metadata,
    showQrModal: true,
    chains: networks.map((n) => n.id) as [number, ...number[]],
  })
  provider.value = ethProvider
}

type EthereumProviderType = Awaited<ReturnType<typeof EthereumProvider.init>>
export const provider = new NullableProxyStore<EthereumProviderType>()

export const disconnect = async () => {
  return await modal.close()
}

export const switchNetwork = async (chain: AppKitNetwork | null | undefined) => {
  if (chain) {
    try {
      modal.switchNetwork(chain)
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
    return this.value?.address as Hex | null
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
      onBlockNumber: async () => {
        const balance = await getBalance(wagmiAdapter.wagmiConfig, {
          address,
          chainId: this.chainId!,
        })
        this.lastKnownBalances.set(this.caipAddress, {
          lastUpdated: Date.now(),
          ...balance,
        })
      },
    })
  }
}
export const accountState = new AccountState()

modal.subscribeProviders((providers) => {
  if (!providers.eip155) return
  provider.value = providers.eip155 as EthereumProviderType
})

modal.subscribeEvents((event) => {
  const { event: e } = event.data
  console.log(event.data)
  if (e === 'MODAL_OPEN') {
    accountState.modalOpen = true
  } else if (e === 'MODAL_CLOSE') {
    accountState.modalOpen = false
  }
  // else if (e === 'CONNECT_SUCCESS') {
  //   // accountState.connected = false
  // }
})

modal.subscribeWalletInfo((walletInfo) => {
  console.log('walletInfo', walletInfo)
  walletInfoState.value = walletInfo ?? null
})

modal.subscribeAccount((account) => {
  accountState.value = account ?? null
})
