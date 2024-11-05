import { type Hex, getAddress } from 'viem'
import * as imageLinks from './image-links'
import type { Token, TokenList } from '$lib/types'
import { Chains, Provider } from './auth/types'
import { derived } from 'svelte/store'
import { windowLoaded } from './window'
import type { BridgeKey } from './input'
import _ from 'lodash'

export const isProd = __PROD__

export const nativeAssetOut = {
  [Chains.ETH]: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  [Chains.BNB]: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  [Chains.PLS]: '0xA1077a294dDE1B09bB078844df40758a5D0f9a27',
  [Chains.SEP]: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
  [Chains.V4PLS]: '0x70499adEBB11Efd915E3b69E700c331778628707',
} as Record<Chains, Hex>

export const uniV2Routers = {
  [Chains.PLS]: ['0x98bf93ebf5c380C0e6Ae8e192A7e2AE08edAcc02', '0x165C3410fC91EF562C50559f7d2289fEbed552d9'],
  [Chains.ETH]: ['0x7a250d5630b4cf539739df2c5dacb4c659f2488d'],
  [Chains.BNB]: ['0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F'],
  [Chains.SEP]: ['0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3'],
  [Chains.V4PLS]: ['0xDaE9dd3d1A52CfCe9d5F2fAC7fDe164D500E50f7', '0x636f6407B90661b73b1C0F7e24F4C79f624d0738'],
} as Record<Chains, Hex[]>

export const nativeTokenSymbol = {
  [Chains.PLS]: 'PLS',
  [Chains.V4PLS]: 'V4PLS',
  [Chains.ETH]: 'ETH',
  [Chains.SEP]: 'sepETH',
  [Chains.BNB]: 'BNB',
} as Record<Chains, string>

export const nativeTokenName = {
  [Chains.PLS]: 'Pulse',
  [Chains.V4PLS]: 'V4 Pulse',
  [Chains.ETH]: 'Ether',
  [Chains.SEP]: 'Sepolia Ether',
  [Chains.BNB]: 'BNB',
} as Record<Chains, string>

export type Pathway = {
  from: Hex
  to: Hex
  router?: Hex
  nativeRouter: Hex
  defaultAssetIn: Token
  usesExtraParam: boolean
  feeManager: 'from' | 'to'
  toHome: boolean
  requiresDelivery: boolean
}

export type DeepPathwayConfig = Record<Provider, Partial<Record<Chains, Partial<Record<Chains, Pathway>>>>>

export const pathways = {
  [Provider.PULSECHAIN]: {
    [Chains.PLS]: {
      [Chains.ETH]: {
        from: '0x4fD0aaa7506f3d9cB8274bdB946Ec42A1b8751Ef',
        to: '0x1715a3E4A142d8b698131108995174F37aEBA10D',
        router: '0x0560e1392185bf554E1e0044cD752aeA83F37C6E',
        nativeRouter: '0xf868dA5a5D5f799CEe2205d8FD1f5aD2c4A28499',
        usesExtraParam: false,
        feeManager: 'from',
        toHome: false,
        requiresDelivery: true,
        defaultAssetIn: {
          symbol: 'WETH',
          name: 'Wrapped Ether from Ethereum',
          address: '0x02DcdD04e3F455D838cd1249292C58f3B79e3C3C',
          decimals: 18,
          chainId: 369,
          extensions: {
            bridgeInfo: {
              '1': {
                tokenAddress: nativeAssetOut[Chains.ETH],
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
        nativeRouter: '0x8AC4ae65b3656e26dC4e0e69108B392283350f55',
        feeManager: 'to',
        usesExtraParam: false,
        toHome: true,
        requiresDelivery: false,
        defaultAssetIn: {
          chainId: 1,
          address: nativeAssetOut[Chains.ETH],
          name: 'Wrapped Ether',
          symbol: 'WETH',
          decimals: 18,
          extensions: {
            bridgeInfo: {
              '369': {
                tokenAddress: '0x02DcdD04e3F455D838cd1249292C58f3B79e3C3C',
              },
            },
          },
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
        nativeRouter: '0x3B0e59054b34Fc91e6Fa4C5600F661a183409AF1',
        feeManager: 'from',
        usesExtraParam: true,
        toHome: false,
        requiresDelivery: true,
        defaultAssetIn: {
          symbol: 'WBNB',
          name: 'Wrapped BNB',
          address: '0x518076CCE3729eF1a3877EA3647a26e278e764FE',
          decimals: 18,
          chainId: 369,
          extensions: {
            bridgeInfo: {
              '56': {
                tokenAddress: nativeAssetOut[Chains.BNB],
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
        nativeRouter: '0x814622879684979C63Fcb753580D89bD1C940E3b',
        feeManager: 'to',
        usesExtraParam: true,
        toHome: true,
        requiresDelivery: false,
        defaultAssetIn: {
          chainId: 56,
          address: nativeAssetOut[Chains.BNB],
          name: 'Wrapped BNB from BSC',
          symbol: 'WBNB',
          decimals: 18,
          extensions: {
            bridgeInfo: {
              '369': {
                tokenAddress: '0x518076CCE3729eF1a3877EA3647a26e278e764FE',
              },
            },
          },
        },
      },
    },
  },
} as DeepPathwayConfig

export const testnetPathways = {
  [Provider.TOKENSEX]: {
    // plsv4 to bnb home omnibridge: 0xfd0c07C376D27EA0E9fA64Ac5D2481439e36CF9C
    // [Chains.BNB]: {
    //   [Chains.V4PLS]: {
    //     from: '0xDDf1b0CD7fb7AAA310c703C17995c6671F9DC806',
    //     to: '0xfd0c07C376D27EA0E9fA64Ac5D2481439e36CF9C',
    //     usesExtraParam: false,
    //     requiresDelivery: false,
    //     toHome: true,
    //     feeManager: 'to',
    //     defaultAssetIn: {
    //       chainId: 56,
    //       address: nativeAssetOut[Chains.TBNB],
    //     },
    //   },
    // },
    // [Chains.V4PLS]: {
    //   [Chains.BNB]: {
    //     from: '0xfd0c07C376D27EA0E9fA64Ac5D2481439e36CF9C',
    //     to: '0xDDf1b0CD7fb7AAA310c703C17995c6671F9DC806',
    //   },
    // },
  },
  [Provider.PULSECHAIN]: {
    [Chains.V4PLS]: {
      [Chains.SEP]: {
        from: '0x6B08a50865aDeCe6e3869D9AfbB316d0a0436B6c',
        to: '0x546e37DAA15cdb82fd1a717E5dEEa4AF08D4349A',
        nativeRouter: '0x78c38e4536a39A78910fEa9D7c80fDd0aAF89661',
        usesExtraParam: false,
        requiresDelivery: true,
        toHome: false,
        feeManager: 'from',
        defaultAssetIn: {
          chainId: 943,
          address: '0x3677bd78CCf4d299328ECFBa61790cf8dBfcF686',
          name: 'Wrapped Ether from Sepolia',
          symbol: 'WsepETH',
          decimals: 18,
          extensions: {
            bridgeInfo: {
              '11155111': {
                tokenAddress: nativeAssetOut[Chains.SEP],
              },
            },
          },
        },
      },
    },
    [Chains.SEP]: {
      [Chains.V4PLS]: {
        from: '0x546e37DAA15cdb82fd1a717E5dEEa4AF08D4349A',
        to: '0x6B08a50865aDeCe6e3869D9AfbB316d0a0436B6c',
        nativeRouter: '0x4e33d534FB1699f52a6d4C0BB2CF5fDC85d90bDC',
        usesExtraParam: false,
        requiresDelivery: false,
        toHome: true,
        feeManager: 'to',
        defaultAssetIn: {
          chainId: 11_155_111,
          address: nativeAssetOut[Chains.SEP],
          name: 'Wrapped Ether',
          symbol: 'sepWETH',
          decimals: 18,
          extensions: {
            bridgeInfo: {
              '943': {
                tokenAddress: '0x3677bd78CCf4d299328ECFBa61790cf8dBfcF686',
              },
            },
          },
        },
      },
    },
  },
} as DeepPathwayConfig

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

export const networkOutputs = (input: Chains) =>
  _(validBridgeKeys)
    .filter((a) => a[1] !== input)
    .map('2')
    .uniq()
    .value()

export const pathway = (bridgeKey: BridgeKey | null) => {
  if (!bridgeKey) return
  return _.get(pathways, bridgeKey) || (isProd ? _.get(testnetPathways, bridgeKey) : undefined)
}

export const defaultAssetIn = ($bridgeKey: BridgeKey | null) => {
  const conf = pathway($bridgeKey)
  const defaultAssetIn = _.get(conf, ['defaultAssetIn']) as Token | undefined
  return defaultAssetIn
}

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
