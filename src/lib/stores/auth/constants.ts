import { mainnet, pulsechain, bsc } from 'viem/chains'
import type { ChainsMetadata } from './types'
import { Chains } from './types'
import ethNetworkUrl from '$lib/images/networks/0x1.svg'
import bnbNetworkUrl from '$lib/images/networks/0x38.png'

/**
 * all of the chains that are enabled in this dapp
 * and their corresponding useful metadata
 */
export const chainsMetadata = {
  [Chains.PLS]: {
    ...pulsechain,
    chainId: Chains.PLS,
    icon: 'https://pulsex-tokens.s3.eu-west-2.amazonaws.com/0xA1077a294dDE1B09bB078844df40758a5D0f9a27.png',
    alt: 'a pink blue and purple hexagon with an ekg line running horizontally',
    rpcUrls: {
      default: {
        http: ['https://rpc-pulsechain.g4mm4.io'],
      },
    },
    contracts: {
      ...pulsechain.contracts,
      ensRegistry: {
        address: '0xbd5133993FCDED5945c5539D9f032261F0d13170',
      },
      ensUniversalResolver: {
        address: '0x6644e794F5aFfb8abcfea0e71d5624D013BA2dBA',
        blockCreated: 19_400_582,
      },
    },
  },
  [Chains.ETH]: {
    ...mainnet,
    chainId: Chains.ETH,
    icon: ethNetworkUrl,
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
    icon: bnbNetworkUrl,
    alt: 'a gold cube with slits in the middle of each side',
    rpcUrls: {
      default: {
        http: ['https://bsc-pokt.nodies.app'],
      },
    },
  },
} as ChainsMetadata
