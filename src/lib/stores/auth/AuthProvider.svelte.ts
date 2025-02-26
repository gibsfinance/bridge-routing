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
  await modal.open()

  const ethProvider = await EthereumProvider.init({
    projectId,
    metadata,
    showQrModal: true,
    chains: networks.map((n) => n.id) as [number, ...number[]],
  })
  // console.log(ethProvider)
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
  set value(account: UseAppKitAccountReturn | null) {
    this.val = account
  }
  get value() {
    return this.val
  }
  get address() {
    return this.value?.address as Hex | null
  }
}
export const accountState = new AccountState()

modal.subscribeProviders((providers) => {
  if (!providers.eip155) return
  provider.value = providers.eip155 as EthereumProviderType
})

modal.subscribeWalletInfo((walletInfo) => {
  walletInfoState.value = walletInfo ?? null
})

modal.subscribeAccount((account) => {
  accountState.value = account ?? null
})
