import { type Hex, getAddress } from 'viem'
import * as imageLinks from './image-links'
import { ProxyStore, type Token, type TokenList } from '../types.svelte'
import { Chains, Provider } from './auth/types'
import type { BridgeKey } from './input.svelte'
import _ from 'lodash'
import { nodeEnv } from '../config'

export const isProd = new ProxyStore(nodeEnv === 'production')

export const nativeAssetOut = {
  [Chains.ETH]: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  [Chains.BNB]: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  [Chains.PLS]: '0xA1077a294dDE1B09bB078844df40758a5D0f9a27',
  [Chains.SEP]: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
  [Chains.V4PLS]: '0x70499adEBB11Efd915E3b69E700c331778628707',
} as Record<Chains, Hex>

export const uniV2Routers = {
  [Chains.PLS]: [
    '0x98bf93ebf5c380C0e6Ae8e192A7e2AE08edAcc02',
    '0x165C3410fC91EF562C50559f7d2289fEbed552d9',
  ],
  [Chains.ETH]: ['0x7a250d5630b4cf539739df2c5dacb4c659f2488d'],
  [Chains.BNB]: ['0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F'],
  [Chains.SEP]: ['0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3'],
  [Chains.V4PLS]: [
    '0xDaE9dd3d1A52CfCe9d5F2fAC7fDe164D500E50f7',
    '0x636f6407B90661b73b1C0F7e24F4C79f624d0738',
  ],
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
  destinationRouter: Hex | null
  nativeRouter: Hex
  validator: Hex
  defaultAssetIn: Token
  usesExtraParam: boolean
  feeManager: 'from' | 'to'
  toHome: boolean
  requiresDelivery: boolean
}

export type DeepPathwayConfig = Record<
  Provider,
  Partial<Record<Chains, Partial<Record<Chains, Pathway>>>>
>

export const pathways = {
  [Provider.PULSECHAIN]: {
    [Chains.PLS]: {
      [Chains.ETH]: {
        from: '0x4fD0aaa7506f3d9cB8274bdB946Ec42A1b8751Ef',
        to: '0x1715a3E4A142d8b698131108995174F37aEBA10D',
        destinationRouter: '0x2Ed02372C3efF1F239B22a901ceA8Cf6fbf82d8d',
        nativeRouter: '0x612Da68aA7BcA625dD2F27f252cddB573674991A',
        validator: '0x5ECfE77502317F3677f23C3b8Ab17929ACE3D74E',
        usesExtraParam: false,
        feeManager: 'from',
        toHome: false,
        requiresDelivery: true,
        defaultAssetIn: {
          symbol: 'wWETH',
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
        nativeRouter: '0x2Ed02372C3efF1F239B22a901ceA8Cf6fbf82d8d',
        destinationRouter: '0x612Da68aA7BcA625dD2F27f252cddB573674991A',
        validator: '0x5ECfE77502317F3677f23C3b8Ab17929ACE3D74E',
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
        destinationRouter: '0x9c50EfD36dF2DBD310fBC981d6D8478cF3484B85',
        nativeRouter: '0x553569B7760d8e4afFA80aBFc9860Dc85F60397c',
        validator: '0xc3c3d5d3ba946a2eb3906878ebe187418b0b524e',
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
        nativeRouter: '0x9c50EfD36dF2DBD310fBC981d6D8478cF3484B85',
        destinationRouter: '0x553569B7760d8e4afFA80aBFc9860Dc85F60397c',
        validator: '0xc3c3d5d3ba946a2eb3906878ebe187418b0b524e',
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
        nativeRouter: '0xCA1BDc038909038C4B3cbab0EA0ec3cC2839F106',
        destinationRouter: '0xCb4057d7DA4CE521B93b71186DfE11f9FBC3e3b1',
        validator: '0xDcd4D88552c86114b2ca029F7F8d4e1a7951d051',
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
        nativeRouter: '0xCb4057d7DA4CE521B93b71186DfE11f9FBC3e3b1',
        destinationRouter: '0xCA1BDc038909038C4B3cbab0EA0ec3cC2839F106',
        validator: '0xDcd4D88552c86114b2ca029F7F8d4e1a7951d051',
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

const mainnetBridgeKeys = [
  [Provider.PULSECHAIN, Chains.PLS, Chains.ETH],
  [Provider.PULSECHAIN, Chains.ETH, Chains.PLS],
  [Provider.TOKENSEX, Chains.PLS, Chains.BNB],
  [Provider.TOKENSEX, Chains.BNB, Chains.PLS],
] as BridgeKey[]

const testnetBridgeKeys = [
  [Provider.PULSECHAIN, Chains.SEP, Chains.V4PLS],
  [Provider.PULSECHAIN, Chains.V4PLS, Chains.SEP],
] as BridgeKey[]

export const validBridgeKeys = (isProd: boolean) => [
  ...mainnetBridgeKeys,
  ...(isProd ? [] : testnetBridgeKeys),
]

export const pathway = (bridgeKey: BridgeKey | null) => {
  if (!bridgeKey) return
  return _.get(pathways, bridgeKey) || (!isProd ? _.get(testnetPathways, bridgeKey) : undefined)
}

export const defaultAssetIn = ($bridgeKey: BridgeKey | null) => {
  const conf = pathway($bridgeKey)
  const defaultAssetIn = _.get(conf, ['defaultAssetIn']) as Token | undefined
  return defaultAssetIn
}

export const blacklist = new Set<Hex>(['0xA882606494D86804B5514E07e6Bd2D6a6eE6d68A'])
export const whitelisted = new ProxyStore<Set<Hex>>(new Set<Hex>())
fetch(imageLinks.list('/pulsex'))
  .then(async (res) => (await res.json()) as TokenList)
  .then(({ tokens }) => {
    whitelisted.value = new Set<Hex>(tokens.map((tkn) => getAddress(tkn.address)))
  })
