import { mainnet, pulsechain, bsc, sepolia, pulsechainV4 } from '@reown/appkit/networks'
import { Chains, Provider } from '@gibsfinance/bridge-sdk/config'
import type { ChainsMetadata } from '@gibsfinance/bridge-sdk/types'
import * as imageLinks from '@gibsfinance/bridge-sdk/image-links'

const bnbNetworkUrl = 'images/networks/0x38.png'
const plsV4NetworkUrl = 'images/networks/0x3af.png'

const PULSECHAIN_MAINNET_BRIDGE_GRAPHQL_URLS = {
  foreign: 'https://graph.ethereum.pulsechain.com/subgraphs/name/ethereum/bridge',
  home: 'https://graph.pulsechain.com/subgraphs/name/pulsechain/bridge',
}

export const bridgeGraphqlUrl = {
  [Provider.PULSECHAIN]: {
    [Chains.PLS]: {
      [Chains.ETH]: PULSECHAIN_MAINNET_BRIDGE_GRAPHQL_URLS,
    },
    [Chains.ETH]: {
      [Chains.PLS]: PULSECHAIN_MAINNET_BRIDGE_GRAPHQL_URLS,
    },
  },
}
