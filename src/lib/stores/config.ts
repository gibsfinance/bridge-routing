import { type Hex, zeroAddress, getAddress } from 'viem'
import * as imageLinks from './image-links'
import type { Token, TokenList } from '$lib/types'
import { Chains, Provider, type DestinationChains } from './auth/types'
import { derived } from 'svelte/store'
import { windowLoaded } from './window'

export const uniV2Settings = {
  [Chains.PLS]: {
    routers: ['0x98bf93ebf5c380C0e6Ae8e192A7e2AE08edAcc02', '0x165C3410fC91EF562C50559f7d2289fEbed552d9'],
    wNative: '0xA1077a294dDE1B09bB078844df40758a5D0f9a27',
  },
  [Chains.ETH]: {
    routers: ['0x7a250d5630b4cf539739df2c5dacb4c659f2488d'],
    wNative: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  },
  [Chains.BNB]: {
    routers: ['0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F'],
    wNative: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  },
} as Record<
  Chains,
  {
    routers: Hex[]
    wNative: Hex
  }
>

export const pathways = {
  [Provider.PULSECHAIN]: {
    [Chains.PLS]: {
      [Chains.ETH]: {
        home: '0x4fD0aaa7506f3d9cB8274bdB946Ec42A1b8751Ef',
        foreign: '0x1715a3E4A142d8b698131108995174F37aEBA10D',
        router: '0x0560e1392185bf554E1e0044cD752aeA83F37C6E',
      },
    },
  },
  [Provider.TOKENSEX]: {
    [Chains.PLS]: {
      [Chains.BNB]: {
        home: '0xf1DFc63e10fF01b8c3d307529b47AefaD2154C0e',
        foreign: '0xb4005881e81a6ecd2c1f75d58e8e41f28d59c6b1',
        router: '0xC985f38b9d082692C6744C628026305E3f202fE1',
      },
    },
  },
} as Record<
  Provider, Partial<Record<
    Chains, Partial<Record<
      DestinationChains, {
        home: Hex;
        foreign: Hex;
        router: Hex;
      }
    >>
  >>
>

export const destinationChains = {
  [Chains.ETH]: {
    provider: 'pulsechain',
    homeBridge: '0x4fD0aaa7506f3d9cB8274bdB946Ec42A1b8751Ef',
    foreignBridge: '0x1715a3E4A142d8b698131108995174F37aEBA10D',
    router: '0x0560e1392185bf554E1e0044cD752aeA83F37C6E',
  },
  [Chains.BNB]: {
    provider: 'tokensex',
    homeBridge: '0xf1DFc63e10fF01b8c3d307529b47AefaD2154C0e',
    foreignBridge: '0xb4005881e81a6ecd2c1f75d58e8e41f28d59c6b1',
    router: '0xC985f38b9d082692C6744C628026305E3f202fE1',
  },
} as Record<
  DestinationChains,
  {
    provider: Provider
    homeBridge: Hex
    foreignBridge: Hex
    router: Hex
  }
>

export const nativeAssetOut = {
  [Chains.ETH]: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  [Chains.BNB]: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
} as Record<DestinationChains, Hex>

export const defaultAssetIn = {
  [Chains.ETH]: {
    symbol: 'WETH',
    name: 'Wrapped Ether from Ethereum',
    address: '0x02DcdD04e3F455D838cd1249292C58f3B79e3C3C',
    decimals: 18,
    chainId: 369,
    extensions: {
      bridgeInfo: {
        '1': {
          tokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          destinationBridgeAddress: zeroAddress,
          originationBridgeAddress: zeroAddress,
        },
      },
    },
  },
  [Chains.BNB]: {
    symbol: 'WBNB',
    name: 'Wrapped BNB',
    address: '0x518076CCE3729eF1a3877EA3647a26e278e764FE',
    decimals: 18,
    chainId: 369,
    extensions: {
      bridgeInfo: {
        '56': {
          tokenAddress: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
          destinationBridgeAddress: zeroAddress,
          originationBridgeAddress: zeroAddress,
        },
      },
    },
  },
} as Record<DestinationChains, Token>

export const whitelisted = derived(
  [windowLoaded],
  ([$windowLoaded], set) => {
    let cancelled = false
    if (!$windowLoaded) {
      set(new Set<Hex>([]))
      return
    }
    fetch(imageLinks.list('/pulsex'))
      .then(async (res) => (await res.json()) as TokenList)
      .then(({ tokens }) => {
        if (cancelled) return
        set(new Set<Hex>(tokens.map((tkn) => getAddress(tkn.address))))
      })
    return () => {
      cancelled = true
    }
  },
  new Set<Hex>(),
)
