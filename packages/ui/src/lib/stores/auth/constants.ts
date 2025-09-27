import { Chains, Providers } from '@gibs/bridge-sdk/config'

const PULSECHAIN_MAINNET_BRIDGE_GRAPHQL_URLS = {
  foreign: 'https://graph.ethereum.pulsechain.com/subgraphs/name/ethereum/bridge',
  home: 'https://graph.pulsechain.com/subgraphs/name/pulsechain/bridge',
}

export const bridgeGraphqlUrl = {
  [Providers.PULSECHAIN]: {
    [Chains.PLS]: {
      [Chains.ETH]: PULSECHAIN_MAINNET_BRIDGE_GRAPHQL_URLS,
    },
    [Chains.ETH]: {
      [Chains.PLS]: PULSECHAIN_MAINNET_BRIDGE_GRAPHQL_URLS,
    },
  },
}
