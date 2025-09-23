import { getAddress, keccak256, stringToHex, zeroAddress, type Hex } from "viem";
import _ from 'lodash'
import type { BridgeKey, Token, TokenOut } from "./types.js";

/**
 * Add here your chain id as hex, be sure to add your chain in the chainsMetadata object too
 */
export enum Chains {
  PLS = '0x171',
  ETH = '0x1',
  BNB = '0x38',
  // testnets
  SEP = '0xaa36a7',
  V4PLS = '0x3af',
  // TBNB = '0x61',
}

/** The key of a chain - human readable for query params */
export type ChainKey = keyof typeof Chains

/** A map of chain ids to chain keys */
export const chainIdToKey = new Map<Chains, ChainKey>(
  Object.entries(Chains).map(([key, chain]) => [chain, key] as [Chains, ChainKey]),
)

/**
 * Converts a chain id to a chain key
 * @param chainId - the chain id
 * @returns the chain key
 */
export const toChain = (chainId: number | string) => `0x${Number(chainId).toString(16)}` as Chains

/**
 * Converts a chain id to a chain key
 * @param chainId - the chain id
 * @returns the chain key
 */
export const toChainKey = (chainId: number | string) => chainIdToKey.get(toChain(chainId))

// /** The provider of an omnibridge */
// export enum Provider {
//   PULSECHAIN = 'pulsechain',
//   TOKENSEX = 'tokensex',
// }


export const Providers = {
  PULSECHAIN: 'pulsechain',
  TOKENSEX: 'tokensex',
} as const

export type Provider = typeof Providers[keyof typeof Providers]

/** A map of chains to native asset out addresses */
export const nativeAssetOut = {
  [Chains.ETH]: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  [Chains.BNB]: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  [Chains.PLS]: '0xA1077a294dDE1B09bB078844df40758a5D0f9a27',
  [Chains.SEP]: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
  [Chains.V4PLS]: '0x70499adEBB11Efd915E3b69E700c331778628707',
} as Record<Chains, Hex>

/** A map of chains to deprecated native asset out addresses */
export const deprecatedNativeAssetOut = {
  [Chains.PLS]: new Set(['0x97Ac4a2439A47c07ad535bb1188c989dae755341']),
} as Partial<Record<Chains, Set<Hex>>>

/** A map of chains to uni v2 router addresses */
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

/** A map of chains to native token symbols */
export const nativeTokenSymbol = {
  [Chains.PLS]: 'PLS',
  [Chains.V4PLS]: 'V4PLS',
  [Chains.ETH]: 'ETH',
  [Chains.SEP]: 'sepETH',
  [Chains.BNB]: 'BNB',
} as Record<Chains, string>

/** A map of chains to native token names */
export const nativeTokenName = {
  [Chains.PLS]: 'Pulse',
  [Chains.V4PLS]: 'V4 Pulse',
  [Chains.ETH]: 'Ether',
  [Chains.SEP]: 'Sepolia Ether',
  [Chains.BNB]: 'BNB',
} as Record<Chains, string>

/** The pathway of a bridge */
export type Pathway = {
  from: Hex
  to: Hex
  destinationRouter: Hex | null
  nativeRouter: Hex
  validator: Hex
  // defaultAssetIn: Token
  usesExtraParam: boolean
  feeManager: 'from' | 'to'
  toHome: boolean
  requiresDelivery: boolean
  bridgedNativeAssetOut: Hex
  settingOverrides?: Record<Hex, Partial<Pathway>>
}

/** A map of providers to pathways */
export type DeepPathwayConfig = Record<
  Provider,
  Partial<Record<Chains, Partial<Record<Chains, Pathway>>>>
>

/** The settings for the pulsechain pls eth pathway */
const pulsechainPLSETHSettings = {
  from: '0x0e18d0d556b652794EF12Bf68B2dC857EF5f3996',
  to: '0xe20E337DB2a00b1C37139c873B92a0AAd3F468bF',
  destinationRouter: '0x1F0144Ce3BDaf11944Fe0beF6444599a0500695B',
  nativeRouter: '0xE66877Cfe4CEc10ffBbBB3092B7001321AB5809D',
}

export const pathways = {
  [Providers.PULSECHAIN]: {
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
        // weth from ethereum on pulsechain
        bridgedNativeAssetOut: '0x02DcdD04e3F455D838cd1249292C58f3B79e3C3C',
        settingOverrides: {
          [zeroAddress]: pulsechainPLSETHSettings,
          [getAddress(nativeAssetOut[Chains.PLS])]: pulsechainPLSETHSettings,
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
        // wpls from pulsechain on ethereum
        bridgedNativeAssetOut: '0xA882606494D86804B5514E07e6Bd2D6a6eE6d68A',
        settingOverrides: {
          [getAddress('0xa882606494d86804b5514e07e6bd2d6a6ee6d68a')]: {
            from: '0xe20E337DB2a00b1C37139c873B92a0AAd3F468bF',
            to: '0x0e18d0d556b652794EF12Bf68B2dC857EF5f3996',
            destinationRouter: '0xE66877Cfe4CEc10ffBbBB3092B7001321AB5809D',
            nativeRouter: '0x1F0144Ce3BDaf11944Fe0beF6444599a0500695B',
          },
        },
      },
    },
  },
  [Providers.TOKENSEX]: {
    [Chains.PLS]: {
      [Chains.BNB]: {
        from: '0xf1DFc63e10fF01b8c3d307529b47AefaD2154C0e',
        to: '0xb4005881e81a6ecd2c1f75d58e8e41f28d59c6b1',
        destinationRouter: '0x9c50EfD36dF2DBD310fBC981d6D8478cF3484B85',
        nativeRouter: '0xB80B80EBB375BD83a9d6c0761b197d16a8670f81',
        validator: '0xc3c3d5d3ba946a2eb3906878ebe187418b0b524e',
        feeManager: 'from',
        usesExtraParam: true,
        toHome: false,
        requiresDelivery: true,
        // wbnb from bsc on pulsechain (tokensex)
        bridgedNativeAssetOut: '0x518076CCE3729eF1a3877EA3647a26e278e764FE',
      },
    },
    [Chains.BNB]: {
      [Chains.PLS]: {
        from: '0xb4005881e81a6ecd2c1f75d58e8e41f28d59c6b1',
        to: '0xf1DFc63e10fF01b8c3d307529b47AefaD2154C0e',
        nativeRouter: '0x9c50EfD36dF2DBD310fBC981d6D8478cF3484B85',
        destinationRouter: '0xB80B80EBB375BD83a9d6c0761b197d16a8670f81',
        validator: '0xc3c3d5d3ba946a2eb3906878ebe187418b0b524e',
        feeManager: 'to',
        usesExtraParam: true,
        toHome: true,
        requiresDelivery: false,
        // wpls from pulsechain on bsc (tokensex)
        bridgedNativeAssetOut: '0xF6088134D28eeBEF7128BA41FaDb2FCA0666c64C',
      },
    },
  },
} as DeepPathwayConfig

export const testnetPathways = {
  [Providers.TOKENSEX]: {
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
  [Providers.PULSECHAIN]: {
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
        bridgedNativeAssetOut: '0x3677bd78ccf4d299328ecfba61790cf8dbfcf686',
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
        bridgedNativeAssetOut: '0x35807560aD0597E23F452cdc82D4Fb0e7E3c6590',
      },
    },
  },
} as DeepPathwayConfig

/** The mainnet bridge keys */
const mainnetBridgeKeys = [
  [Providers.PULSECHAIN, Chains.PLS, Chains.ETH],
  [Providers.PULSECHAIN, Chains.ETH, Chains.PLS],
  [Providers.TOKENSEX, Chains.PLS, Chains.BNB],
  [Providers.TOKENSEX, Chains.BNB, Chains.PLS],
] as BridgeKey[]

/** The testnet bridge keys */
const testnetBridgeKeys = [
  [Providers.PULSECHAIN, Chains.SEP, Chains.V4PLS],
  [Providers.PULSECHAIN, Chains.V4PLS, Chains.SEP],
] as BridgeKey[]

/** Returns the valid bridge keys for the given is prod */
export const validBridgeKeys = (isProd: boolean) => [
  ...mainnetBridgeKeys,
  ...(isProd ? [] : testnetBridgeKeys),
]

/**
 * Infers the bridge key from the current key, provider, from chain, and to chain
 * @param currentKey - the current bridge key
 * @param provider - the provider
 * @param fromChain - the from chain
 * @param toChain - the to chain
 * @returns the inferred bridge key
 */
export const inferBridgeKey = ({
  currentKey,
  provider,
  fromChain,
  toChain,
}: {
  currentKey: BridgeKey
  provider: Provider
  fromChain?: Chains
  toChain?: Chains
}) => {
  const [, fromChainKey, toChainKey] = currentKey
  const from = fromChain ?? fromChainKey
  const to = toChain ?? toChainKey
  const currentFromChainIsValid = !!_.get(pathways, [provider, from])
  const nextFromChain = currentFromChainIsValid
    ? from
    : (Object.keys(pathways[provider])[0] as Chains)
  const currentToChainIsValid = !!_.get(pathways, [provider, nextFromChain, to])
  const nextToChain = currentToChainIsValid
    ? to
    : (Object.keys(pathways[provider]![nextFromChain]!)[0] as Chains)
  return [provider, nextFromChain, nextToChain] as BridgeKey
}

/**
 * Returns the pathway for the given bridge key, is prod, and asset in address
 * @param bridgeKey - the bridge key
 * @param isProd - whether to use the production pathway
 * @param assetInAddress - the asset in address
 * @returns the pathway
 */
export const pathway = (bridgeKey: BridgeKey | null, isProd: boolean, assetInAddress?: string | Hex | null | undefined) => {
  if (!bridgeKey) return
  let pathway = _.get(pathways, bridgeKey) || (!isProd ? _.get(testnetPathways, bridgeKey) : undefined)
  if (assetInAddress) {
    const addr = getAddress(assetInAddress)
    if (pathway?.settingOverrides?.[addr]) {
      pathway = {
        ...pathway,
        ...pathway.settingOverrides[addr],
      }
    }
  }
  return pathway
}

/**
 * Returns the default asset in for the given bridge key and is prod
 * @param bridgeKey - the bridge key
 * @param isProd - whether to use the production pathway
 * @returns the default asset in
 */
export const defaultAssetIn = ($bridgeKey: BridgeKey | null, isProd: boolean) => {
  if (!$bridgeKey) return null
  const conf = pathway($bridgeKey, isProd)
  const defaultAssetIn = _.get(conf, ['bridgedNativeAssetOut']) as Hex | undefined
  return defaultAssetIn
}

/**
 * Returns whether the given asset is the native asset for the given bridge key
 * @param asset - the asset
 * @param bridgeKey - the bridge key
 * @returns whether the given asset is the native asset for the given bridge key
 */
export const isNative = (asset: Token | TokenOut | null, bridgeKey: BridgeKey | null) => {
  if (!bridgeKey || !asset) {
    return false
  }
  const path = pathway(bridgeKey, false)
  return (
    getAddress(asset.address!) === getAddress(path!.bridgedNativeAssetOut!) ||
    (asset.address === zeroAddress ||
      nativeAssetOut[toChain(asset.chainId)]?.toLowerCase() === asset.address?.toLowerCase()) &&
    !asset.name.includes(' from Pulsechain')
  )
}

/**
 * Returns whether the given asset is unwrappable for the given bridge key
 * @param bridgeKey - the bridge key
 * @param assetIn - the asset in
 * @returns whether the given asset is unwrappable for the given bridge key
 */
export const isUnwrappable = (
  bridgeKey: BridgeKey | null,
  assetIn: Pick<Token, 'address'> | null,
) => {
  if (!bridgeKey || !assetIn) {
    return false
  }
  const addr = getAddress(assetIn.address)
  const path = pathway(bridgeKey, false)
  if (!path) return false
  return path.bridgedNativeAssetOut === getAddress(addr)
}

/**
 * Returns whether the given asset can be unwrapped for the given bridge key
 * @param bridgeKey - the bridge key
 * @param assetIn - the asset in
 * @returns boolean
 */
export const canChangeUnwrap = (bridgeKey: BridgeKey, assetIn: Token | null) => {
  return !!assetIn && isUnwrappable(bridgeKey, assetIn)
}

export const chains = {
  ethereum: 1,
  bsc: 56,
  pulsechain: 369,
  pulsechainV4: 943,
  sepolia: 11155111,
} as const

export const chainIds = Object.values(chains)

export type ChainId = (typeof chainIds)[number]

export type Side = 'home' | 'foreign'

export type MinimalKey = `${ChainId}-${Hex}`

// export const Providers = {
//   PULSECHAIN: 'pulsechain',
//   TOKENSEX: 'tokensex',
// } as const

export type PathwayInfo = {
  pair: string
  key: string
  home: Hex
  foreign: Hex
}

export type ProviderHomeChainEntry = Partial<Record<ChainId, PathwayInfo[]>>

export type ProviderEntries = Partial<Record<ChainId, ProviderHomeChainEntry>>

export type BridgeConfig = Record<Provider, ProviderEntries>

// provider -> home -> foreign
export const bridgeConfigs = {
  [Providers.PULSECHAIN]: {
    [chains.pulsechain]: {
      [chains.ethereum]: [{
        pair: 'mainnet',
        key: 'erc20',
        home: '0x4fD0aaa7506f3d9cB8274bdB946Ec42A1b8751Ef',
        foreign: '0x1715a3e4a142d8b698131108995174f37aeba10d',
      }, {
        pair: 'mainnet',
        key: 'native',
        home: '0x0e18d0d556b652794EF12Bf68B2dC857EF5f3996',
        foreign: '0xe20E337DB2a00b1C37139c873B92a0AAd3F468bF',
      }],
    },
    [chains.pulsechainV4]: {
      [chains.sepolia]: [{
        pair: 'v4',
        key: 'erc20',
        home: '0x6B08a50865aDeCe6e3869D9AfbB316d0a0436B6c',
        foreign: '0x546e37DAA15cdb82fd1a717E5dEEa4AF08D4349A',
      }, {
        pair: 'v4',
        key: 'native',
        home: '0x81c10846F40fA2B173FC47958D0a892529983F50',
        foreign: '0x5e238ef968467cf443ef5ecb683b76c5a04a0421',
      }],
    },
  },
  [Providers.TOKENSEX]: {
    [chains.pulsechain]: {
      [chains.bsc]: [{
        pair: 'bsctokensex',
        key: 'erc20',
        home: '0xf1DFc63e10fF01b8c3d307529b47AefaD2154C0e',
        foreign: '0xb4005881e81a6ecd2c1f75d58e8e41f28d59c6b1',
      }],
    },
  },
} as BridgeConfig


export const HOME_TO_FOREIGN_FEE = keccak256(stringToHex("homeToForeignFee"))
export const FOREIGN_TO_HOME_FEE = keccak256(stringToHex("foreignToHomeFee"))
