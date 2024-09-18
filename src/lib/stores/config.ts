import { type Hex, zeroAddress, getAddress } from 'viem'
import * as imageLinks from './image-links'
import type { Token, TokenList } from '$lib/types'
import { Chains, Provider } from './auth/types'
import { derived } from 'svelte/store'
import { windowLoaded } from './window'
import type { BridgeKey } from './input'
import _ from 'lodash'

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
  [Chains.SEP]: {
    routers: [],
    wNative: zeroAddress,
  },
  [Chains.V4PLS]: {
    routers: [],
    wNative: zeroAddress,
  },
} as Record<
  Chains,
  {
    routers: Hex[]
    wNative: Hex
  }
>

export type Pathway = {
  from: Hex
  to: Hex
  router?: Hex
  bridgedNative?: Hex
  defaultAssetIn: Token
  usesExtraParam: boolean;
  feeManager: 'from' | 'to'
  toHome: boolean;
}

export const pathways = {
  [Provider.PULSECHAIN]: {
    [Chains.PLS]: {
      [Chains.ETH]: {
        from: '0x4fD0aaa7506f3d9cB8274bdB946Ec42A1b8751Ef',
        to: '0x1715a3E4A142d8b698131108995174F37aEBA10D',
        router: '0x0560e1392185bf554E1e0044cD752aeA83F37C6E',
        bridgedNative: '0x02DcdD04e3F455D838cd1249292C58f3B79e3C3C',
        usesExtraParam: false,
        feeManager: 'from',
        toHome: false,
        defaultAssetIn: {
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
      },
    },
    [Chains.ETH]: {
      [Chains.PLS]: {
        from: '0x1715a3E4A142d8b698131108995174F37aEBA10D',
        to: '0x4fD0aaa7506f3d9cB8274bdB946Ec42A1b8751Ef',
        // router: zeroAddress,
        feeManager: 'to',
        usesExtraParam: false,
        bridgedNative: '0xA882606494D86804B5514E07e6Bd2D6a6eE6d68A',
        toHome: true,
        defaultAssetIn: {
          chainId: 1,
          address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          name: "Wrapped Ether",
          symbol: "WETH",
          decimals: 18,
          extensions: {
            bridgeInfo: {
              '369': {
                tokenAddress: "0x02DcdD04e3F455D838cd1249292C58f3B79e3C3C",
                originationBridgeAddress: zeroAddress,
                destinationBridgeAddress: zeroAddress,
              }
            }
          }
        },
      },
    },
  },
  [Provider.TOKENSEX]: {
    [Chains.PLS]: {
      [Chains.BNB]: {
        from: '0xf1DFc63e10fF01b8c3d307529b47AefaD2154C0e',
        to: '0xb4005881e81a6ecd2c1f75d58e8e41f28d59c6b1',
        router: '0xC985f38b9d082692C6744C628026305E3f202fE1',
        bridgedNative: '0x518076CCE3729eF1a3877EA3647a26e278e764FE',
        feeManager: 'from',
        usesExtraParam: true,
        toHome: false,
        defaultAssetIn: {
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
      },
    },
    [Chains.BNB]: {
      [Chains.PLS]: {
        from: '0xb4005881e81a6ecd2c1f75d58e8e41f28d59c6b1',
        to: '0xf1DFc63e10fF01b8c3d307529b47AefaD2154C0e',
        feeManager: 'to',
        usesExtraParam: true,
        // router: '0x',
        bridgedNative: '0xD69D520f4F23d62C36Cf745E8f5c50f2906F51da',
        toHome: true,
        defaultAssetIn: {
          "chainId": 56,
          "address": "0xD69D520f4F23d62C36Cf745E8f5c50f2906F51da",
          "name": "Wrapped Pulse from PulseChain",
          "symbol": "WPLS",
          "decimals": 18,
          "extensions": {
            "bridgeInfo": {
              "369": {
                "tokenAddress": "0x37567B4A01B0F6Ac9b317814Ff0624Fa2013b170",
                "originationBridgeAddress": zeroAddress,
                "destinationBridgeAddress": zeroAddress
              }
            }
          }
        },
      },
    },
  },
} as Record<Provider, Partial<
  Record<Chains, Partial<
    Record<Chains, Pathway>
  >>
>>

export const validBridgeKeys = [
  [Provider.PULSECHAIN, Chains.PLS, Chains.ETH],
  [Provider.PULSECHAIN, Chains.ETH, Chains.PLS],
  [Provider.TOKENSEX, Chains.PLS, Chains.BNB],
  [Provider.TOKENSEX, Chains.BNB, Chains.PLS],
  // testnets
  [Provider.PULSECHAIN, Chains.SEP, Chains.V4PLS],
  [Provider.PULSECHAIN, Chains.V4PLS, Chains.SEP],
] as BridgeKey[]

export const networkInputs = _(validBridgeKeys).map('1').uniq().value()

export const networkOutputs = (input: Chains) => (
  _(validBridgeKeys).filter((a) => a[1] !== input).map('2').uniq().value()
)

export const pathway = (bridgeKey: BridgeKey | null) => {
  if (!bridgeKey) return
  const [provider, fromChain, toChain] = bridgeKey
  return pathways[provider][fromChain]?.[toChain]
}

export const defaultAssetIn = ($bridgeKey: BridgeKey | null) => {
  const conf = pathway($bridgeKey)
  const defaultAssetIn = _.get(conf, ['defaultAssetIn']) as Token | undefined
  return defaultAssetIn
}

export const nativeAssetOut = {
  [Chains.ETH]: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  [Chains.BNB]: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  [Chains.PLS]: '0xA1077a294dDE1B09bB078844df40758a5D0f9a27',
  [Chains.SEP]: zeroAddress,
  [Chains.V4PLS]: zeroAddress,
} as Record<Chains, Hex>

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
