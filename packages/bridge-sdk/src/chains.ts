import { mainnet, pulsechain, bsc, sepolia, pulsechainV4 } from '@reown/appkit/networks'
import { Chains } from '@gibs/bridge-sdk/config'
import type { ChainsMetadata } from '@gibs/bridge-sdk/types'
import * as imageLinks from '@gibs/bridge-sdk/image-links'

/**
 * all of the chains that are enabled in this dapp
 * and their corresponding useful metadata
 */
export const chainsMetadata = {
  [Chains.PLS]: {
    ...pulsechain,
    chainId: Chains.PLS,
    logoURI: imageLinks.network(pulsechain.id),
    alt: 'a pink blue and purple hexagon with an ekg line running horizontally',
    rpcUrls: {
      default: {
        http: ['https://rpc.pulsechain.com'],
      },
    },
    contracts: {
      ...pulsechain.contracts,
      ensRegistry: {
        address: '0xbd5133993FCDED5945c5539D9f032261F0d13170',
      },
      ensUniversalResolver: {
        address: '0x2FDBb906b4FE68e31D928C1ED0b6a3bD1f204374',
        blockCreated: 19_400_610,
      },
    },
  },
  [Chains.ETH]: {
    ...mainnet,
    chainId: Chains.ETH,
    logoURI: imageLinks.network(mainnet.id),
    alt: 'two pyramids joined on one side',
    rpcUrls: {
      default: {
        http: ['https://rpc-ethereum.g4mm4.io'],
      },
    },
  },
  [Chains.BNB]: {
    ...bsc,
    name: 'Binance Smart Chain',
    chainId: Chains.BNB,
    logoURI: imageLinks.network(bsc.id),
    alt: 'a gold cube with slits in the middle of each side',
    rpcUrls: {
      default: {
        http: ['https://bsc-pokt.nodies.app'],
      },
    },
  },
  [Chains.SEP]: {
    ...sepolia,
    name: 'Sepolia',
    chainId: Chains.SEP,
    logoURI: imageLinks.network(sepolia.id),
    alt: 'two pyramids joined on one side',
    rpcUrls: {
      default: {
        http: ['https://ethereum-sepolia-rpc.publicnode.com'],
      },
    },
  },
  [Chains.V4PLS]: {
    ...pulsechainV4,
    name: 'Pulsechain V4',
    chainId: Chains.V4PLS,
    logoURI: imageLinks.network(pulsechainV4.id),
    alt: 'a pink blue and purple hexagon with an ekg line running horizontally',
    rpcUrls: {
      default: {
        http: ['https://rpc-testnet-pulsechain.g4mm4.io'],
      },
    },
    contracts: {
      ...pulsechainV4.contracts,
      ensRegistry: {
        address: '0xaDB38309aF7F85034FDC35bd6E6B45d1216CfB56',
      },
      ensUniversalResolver: {
        address: '0xDDFde3fA938dE0cdff82645579d03Ed750DE2e69',
      },
    },
  },
} as ChainsMetadata
