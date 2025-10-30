import {
  zeroAddress,
  type Hex,
  parseUnits,
  getAddress,
  type Block,
  getContract,
  erc20Abi,
} from 'viem'
import { FeeType } from '@gibs/bridge-sdk/fee-type'
import type { Token, BridgeKey } from '@gibs/bridge-sdk/types'
import { nativeAssetOut, Chains, canChangeUnwrap, toChain } from '@gibs/bridge-sdk/config'
import * as imageLinks from '@gibs/bridge-sdk/image-links'
import { chainsMetadata } from '@gibs/bridge-sdk/chains'
import { multicallErc20 } from '@gibs/common/erc20'
import type { Erc20Metadata } from '@gibs/common/types'
import { fetchPriceCorrective, type TokenBridgeInfo } from '@gibs/bridge-sdk/chain-info'
import * as sdkSettings from '@gibs/bridge-sdk/settings'
import _ from 'lodash'
import { SvelteMap } from 'svelte/reactivity'

import * as input from '../stores/input.svelte'
import { bridgeSettings as storageBridgeSettings } from './storage.svelte'
import { loading, resolved } from './loading.svelte'
import { NullableProxyStore, ProxyStore } from '../types.svelte'
import * as chainEvents from './chain-events.svelte'
import { isProd, whitelisted } from './config.svelte'
import { settingKey, settings } from './fee-manager.svelte'
import { accountState } from './auth/AuthProvider.svelte'

export class BridgeSettings {
  constructor() {}
  // hold some basic state so that requests don't have to be re-created
  assetIn = new NullableProxyStore<Token>()
  assetOuts = new SvelteMap<string, Token>()
  priceCorrective = new ProxyStore<bigint>(0n)
  approval = new NullableProxyStore<bigint>()

  get assetOut() {
    return sdkSettings.assetOut({
      assetInAddress: input.bridgeKey.assetInAddress,
      assetsOut: this.assetOuts,
      bridgeKeyPath: input.bridgeKey.path,
      unwrap: input.unwrap.value,
    })
  }
  setAssetOut(assetOutKey: string, assetOut: Token) {
    this.assetOuts.set(assetOutKey, assetOut)
  }

  bridgePathway = $derived.by(() => {
    return sdkSettings.bridgePathway({
      bridgeKey: input.bridgeKey.value,
      isProd: isProd.value,
      assetIn: this.assetIn.value,
    })
  })
  bridgeFees = $derived.by(() => {
    return settings.get(settingKey(input.bridgeKey.value))
  })
  bridgeFee = $derived.by(() => {
    const setting = settings.get(settingKey(input.bridgeKey.value))
    const path = this.bridgePathway
    return (path?.toHome ? setting?.feeF2H : setting?.feeH2F) ?? null
  })
  amountToBridge = $derived.by(() => {
    return sdkSettings.amountToBridge({
      amountIn: input.amountIn.value,
      assetIn: this.assetIn.value,
    })
  })
  bridgeCost = $derived.by(() => {
    return sdkSettings.bridgeCost({
      amountToBridge: this.amountToBridge,
      bridgeFee: this.bridgeFee,
    })
  })
  amountAfterBridgeFee = $derived.by(() => {
    return sdkSettings.amountAfterBridgeFee({
      amountToBridge: this.amountToBridge,
      bridgeCost: this.bridgeCost,
    })
  })
  feeType = $derived.by(() => {
    return storageBridgeSettings.value?.feeType ?? FeeType.PERCENT
  })
  estimatedAmountOut = $derived.by(() => {
    return sdkSettings.estimatedAmountOut({
      amountAfterBridgeFee: this.amountAfterBridgeFee,
      fee: this.estimatedFee,
    })
  })
  estimatedFee = $derived.by(() => {
    return sdkSettings.estimatedFee({
      amountAfterBridgeFee: this.amountAfterBridgeFee,
      fee: input.fixedFee.value ?? 0n,
      percentFee: input.percentFee.value ?? 0n,
      feeType: this.feeType,
      limit: this.limit,
      costsToDeliver: input.shouldDeliver.value,
    })
  })
  estimatedNativeNetworkCost = $derived.by(() => {
    const estimatedGas = this.estimatedGas
    const latestBaseFeePerGas = this.latestBaseFeePerGas
    const requiresDelivery = this.bridgePathway?.requiresDelivery ?? false
    return sdkSettings.estimatedNativeNetworkCost({
      estimatedGas,
      latestBaseFeePerGas,
      requiresDelivery,
    })
  })
  estimatedTokenNetworkCost = $derived.by(() => {
    return sdkSettings.estimatedTokenNetworkCost({
      estimatedNativeNetworkCost: this.estimatedNativeNetworkCost,
      priceCorrective: this.priceCorrective.value,
      decimals: this.assetIn.value?.decimals ?? null,
      oneTokenInt: this.oneTokenInt,
    })
  })
  estimatedGas = $derived.by(() => {
    return input.estimatedGas.value
  })
  latestBaseFeePerGas = $derived.by(() => {
    return chainEvents.latestBaseFeePerGas(Number(input.bridgeKey.value[2]))
  })
  oneTokenInt = $derived.by(() => {
    return sdkSettings.oneTokenInt({
      assetIn: this.assetIn.value,
    })
  })
  limit = $derived.by(() => {
    return sdkSettings.limit(input.limit.value)
  })
  networkSwitchAssetOutAddress = $derived.by(() => {
    return sdkSettings.networkSwitchAssetOutAddress({
      assetOut: this.assetOut,
      unwrap: input.unwrap.value,
      toChain: input.bridgeKey.value[2],
    })
  })
  desiredExcessCompensationBasisPoints = $derived.by(() => {
    const bridgeKey = input.bridgeKey.value
    const path = this.bridgePathway
    const assetIn = this.assetIn.value
    const assetOut = this.assetOut
    const assetOutAddress = assetOut?.address ?? null
    const list = whitelisted.value
    return sdkSettings.desiredExcessCompensationBasisPoints({
      path,
      assetIn,
      assetOut,
      bridgeKey,
      list,
      feeType: this.feeType,
      assetOutAddress,
    })
  })
  estimatedCost = $derived.by(() => {
    return sdkSettings.estimatedCost({
      shouldDeliver: input.shouldDeliver.value,
      amountAfterBridgeFee: this.amountAfterBridgeFee,
      percentFee: input.percentFee.value,
      estimatedTokenNetworkCost: this.estimatedTokenNetworkCost,
      reasonablePercentOnTopOfGasFee: this.reasonablePercentOnTopOfGasFee,
      feeType: this.feeType,
    })
  })
  reasonableFixedFee = $derived.by(() => {
    return sdkSettings.reasonableFixedFee({
      estimatedTokenNetworkCost: this.estimatedTokenNetworkCost,
      desiredExcessCompensationBasisPoints: this.desiredExcessCompensationBasisPoints,
    })
  })
  reasonablePercentOnGasLimit = $derived.by(() => {
    return sdkSettings.reasonablePercentOnGasLimit({
      gasTipFee: input.gasTipFee.value,
      estimatedTokenNetworkCost: this.estimatedTokenNetworkCost,
    })
  })
  reasonablePercentFee = $derived.by(() => {
    return sdkSettings.reasonablePercentFee({
      reasonableFixedFee: this.reasonableFixedFee,
      amountAfterBridgeFee: this.amountAfterBridgeFee,
    })
  })
  assetInAddress = $derived.by(() => {
    return this.assetIn.value?.address
  })
  interactingWithBridgeToken = $derived.by(() => {
    return sdkSettings.interactingWithBridgeToken({
      assetLink: chainEvents.assetLink.value,
      assetInAddress: this.assetInAddress ?? null,
    })
  })
  requiresDestinationDataParam = $derived.by(() => {
    const bridgePathway = this.bridgePathway
    return bridgePathway?.requiresDelivery
  })
  destinationDataParam = $derived.by(() => {
    const bridgePathway = this.bridgePathway
    const assetIn = this.assetIn.value
    const destinationRouter = bridgePathway?.destinationRouter ?? null
    const feeDirectorStructEncoded = this.feeDirectorStructEncoded
    const assetLink = chainEvents.assetLink.value
    const shouldDeliver = input.shouldDeliver.value
    const bridgeKey = input.bridgeKey.value
    const unwrap = input.unwrap.value && canChangeUnwrap(bridgeKey, assetIn)
    const recipient = input.recipient.value
    return sdkSettings.destinationDataParam({
      recipient,
      bridgePathway,
      assetIn,
      destinationRouter,
      feeDirectorStructEncoded,
      assetLink,
      shouldDeliver,
      unwrap,
    })
  })
  feeDirectorStructEncoded = $derived.by(() => {
    const assetOut = this.assetOut
    const bridgePathway = this.bridgePathway
    const priceCorrective = this.priceCorrective.value
    const feeType = this.feeType
    const recipient = input.recipient.value
    const gasTipFee = input.gasTipFee.value
    const percentFee = input.percentFee.value
    const feeTypeSettings = this.feeTypeSettings
    const limit = this.limit
    return sdkSettings.feeDirectorStructEncoded({
      recipient,
      bridgePathway,
      assetOut,
      priceCorrective,
      feeType,
      gasTipFee,
      percentFee,
      feeTypeSettings,
      limit,
    })
  })
  feeTypeSettings = $derived.by(() => {
    const feeType = this.feeType
    const unwrap = input.unwrap.value
    const th0 = feeType === FeeType.FIXED ? 1n : 0n
    const st1 = unwrap ? 1n : 0n
    const nd2 = 1n // always exclude priority when you can
    const rd3 = feeType === FeeType.PERCENT ? 1n : 0n
    return (rd3 << 3n) | (nd2 << 2n) | (st1 << 1n) | th0
  })
  reasonablePercentOnTopOfGasFee = $derived.by(() => {
    return sdkSettings.reasonablePercentOnTopOfGasFee({
      desiredExcessCompensationBasisPoints: this.desiredExcessCompensationBasisPoints,
    })
  })
  /** if a user sets a percentage below this amount, then we will show a warning so that they can choose to increase the fee */
  desiredCompensationRatio = $derived.by(() => {
    return sdkSettings.desiredCompensationRatio({
      desiredExcessCompensationBasisPoints: this.desiredExcessCompensationBasisPoints,
    })
  })
  /** whether or not the ui should show that the asset will be unwrapped */
  unwrap = $derived.by(() => {
    return canChangeUnwrap(input.bridgeKey.value, this.assetIn.value) && input.unwrap.value
  })

  availableCompensationMaximum = $derived.by(() => {
    return sdkSettings.availableCompensationMaximum({
      amountAfterBridgeFee: this.amountAfterBridgeFee,
      percentFee: input.percentFee.value,
      feeType: this.feeType,
      fixedFee: input.fixedFee.value,
      limit: this.limit,
    })
  })

  isUndercompensated = $derived.by(() => {
    return sdkSettings.isUndercompensated({
      estimatedTokenNetworkCost: this.estimatedTokenNetworkCost,
      feeType: this.feeType,
      limit: this.limit,
      amountAfterBridgeFee: this.amountAfterBridgeFee,
      desiredExcessCompensationBasisPoints: this.desiredExcessCompensationBasisPoints,
    })
  })

  get transactionInputs() {
    return sdkSettings.transactionInputs({
      bridgePathway: this.bridgePathway ?? null,
      assetIn: this.assetIn.value,
      recipient: input.recipient.value,
      account: accountState.address as Hex,
      assetLink: chainEvents.assetLink.value,
      destinationDataParam: this.destinationDataParam,
      amountToBridge: this.amountToBridge,
      feeDirectorStructEncoded: this.feeDirectorStructEncoded,
      shouldDeliver: input.shouldDeliver.value,
    })
  }
}

export const bridgeSettings = new BridgeSettings()

export type UpdateAssetInParams = {
  bridgeKey: BridgeKey
  address: Hex | null
  customTokens: Token[]
  tokens: Token[]
}

export const updateAssetIn = loading.loadsAfterTick<Token | null, UpdateAssetInParams>(
  'asset-in',
  async ({ bridgeKey, address, customTokens, tokens }: UpdateAssetInParams) => {
    if (!address) {
      return null
    }

    const [provider, fromChain, toChain] = bridgeKey
    const tokensUnderBridgeKey = input.bridgeableTokensUnder({
      tokens,
      provider: provider,
      chain: Number(fromChain),
      partnerChain: Number(toChain),
    })
    const foundAssetIn = searchKnownAddresses({
      address,
      customTokens,
      tokensUnderBridgeKey,
    })
    if (foundAssetIn) {
      return foundAssetIn
    }
    return await getAsset(fromChain, address)
  },
)

export const searchKnownAddresses = ({
  tokensUnderBridgeKey,
  customTokens,
  address,
}: {
  address: Hex
  tokensUnderBridgeKey: Token[]
  customTokens: Token[]
}) => {
  return (
    _.find(tokensUnderBridgeKey, { address: getAddress(address) }) ??
    _.find(tokensUnderBridgeKey, { address: address.toLowerCase() }) ??
    _.find(customTokens, { address: getAddress(address) }) ??
    _.find(customTokens, { address: address.toLowerCase() }) ??
    null
  )
}

export const getAsset = async (chainId: Chains, assetInAddress: Hex) => {
  if (assetInAddress === zeroAddress) {
    const chain = chainsMetadata[chainId]
    return {
      address: zeroAddress,
      chainId: Number(chainId),
      ...chain.nativeCurrency,
      // logoURI: imageLinks.image({
      //   chainId: Number(chainId),
      //   address: zeroAddress,
      // }),
    }
  }
  const asset = await multicallErc20({
    client: input.clientFromChain(Number(chainId)),
    chain: chainsMetadata[chainId],
    target: assetInAddress,
  }).catch(() => null)
  if (!asset) {
    console.log('getAsset failed', assetInAddress)
    return null
  }
  const [name, symbol, decimals] = asset
  return {
    name,
    symbol,
    decimals,
    address: assetInAddress,
    chainId: Number(chainId),
    // logoURI: imageLinks.image({
    //   chainId: Number(chainId),
    //   address: assetInAddress,
    // }),
  } as Token
}

const backupAssetIn = {
  address: zeroAddress,
  name: 'unknown',
  symbol: 'xxx',
  decimals: 18,
  logoURI: '',
  chainId: 369,
} as Token

export const updateAssetOut = ({
  bridgeKey,
  assetInput,
  assetLink,
  unwrap,
}: {
  bridgeKey: BridgeKey
  assetInput: Token
  assetLink: TokenBridgeInfo
  unwrap: boolean
}) => {
  const [, fromChain, toChain] = bridgeKey
  const fromChainId = Number(fromChain)
  const toChainId = Number(toChain)
  if (!fromChainId || !toChainId || !assetInput || !assetLink) {
    return resolved(null)
  }
  const { assetOutAddress } = assetLink
  if (!assetOutAddress) {
    return resolved(null)
  }
  if (unwrap && getAddress(nativeAssetOut[toChain]) === getAddress(assetOutAddress)) {
    const assetOut = {
      address: zeroAddress,
      chainId: Number(toChain),
      ...chainsMetadata[toChain].nativeCurrency,
      logoURI: imageLinks.images([`${Number(toChain)}`, `${Number(toChain)}/${assetOutAddress}`]),
    }
    // console.log('assetOut', assetOut)
    return resolved(assetOut)
  }
  return loading.loadsAfterTick<Token | null>(
    'asset-out',
    async () => {
      const contract = getContract({
        address: assetOutAddress,
        abi: erc20Abi,
        client: input.clientFromChain(toChainId),
      })
      return contract.read.totalSupply().catch(() => {
        return -1n
      })
    },
    async (data: bigint) => {
      if (data < 0n) {
        return null
      }
      return await multicallErc20({
        client: input.clientFromChain(toChainId),
        chain: chainsMetadata[toChain],
        target: assetOutAddress,
      }).catch(() => null)
    },
    (r: Erc20Metadata | null) => {
      const result = r as Erc20Metadata | null
      let res = backupAssetIn
      if (result) {
        const [name, symbol, decimals] = result
        res = {
          ...assetInput, // preserve extensions
          name,
          symbol,
          decimals,
          chainId: Number(toChainId),
          address: assetOutAddress,
        } as Token
      } else {
        // assumptions
        res = {
          ...assetInput,
          chainId: Number(toChainId),
          address: zeroAddress,
          name: `${assetInput.name} from Pulsechain`,
          symbol: `w${assetInput.symbol}`,
        } as Token
      }
      return res
    },
  )()
}
// export const oneEther = 10n ** 18n

// export const desiredExcessCompensationBasisPoints = derived(
//   [input.assetIn, feeType, whitelisted, input.bridgeKey],
//   ([$assetIn, $feeType, $whitelisted, $bridgeKey]) => {
// export const desiredExcessCompensationBasisPoints = (
//   assetIn: Token,
//   feeType: FeeType,
//   whitelisted: Set<Hex>,
//   bridgeKey: input.BridgeKey,
// ) => {
//   const path = pathway(bridgeKey)
//   if (!path?.requiresDelivery) {
//     return 0n
//   }
//   return !assetIn
//     ? 0n
//     : feeType === FeeType.PERCENT
//       ? 1_000n
//       : input.isNative(assetIn, bridgeKey)
//         ? 1_000n
//         : whitelisted.has(getAddress(assetIn.address))
//           ? 5_000n
//           : 10_000n
// }
// // )

// export const desiredCompensationRatio = (desiredExcessCompensationBasisPoints: bigint) => {
//   return oneEther + (desiredExcessCompensationBasisPoints * oneEther) / 10_000n
// }

// export const desiredExcessCompensationPercentage = (
//   desiredExcessCompensationBasisPoints: bigint,
// ) => {
//   return formatUnits(desiredExcessCompensationBasisPoints, 2)
// }

// export const oneTokenInt = (assetIn: Token) => {
//   return assetIn ? 10n ** BigInt(assetIn.decimals) : 1n
// }

export type FetchResult = bigint[] | Hex
const fetchCache = new Map<
  string,
  {
    time: number
    result: Promise<FetchResult[]>
  }
>()
setInterval(() => {
  const now = Date.now()
  for (const [k, cached] of fetchCache.entries()) {
    if (cached.time + 10_000 < now) {
      fetchCache.delete(k)
    }
  }
}, 3_000)

type PriceCorrectiveInputs = {
  bridgeKey: BridgeKey
  assetOut: Token | null
  assetLink: TokenBridgeInfo | null
  block: Block | null
  amountToBridge: bigint
}
export const loadPriceCorrective = ({
  bridgeKey,
  assetOut,
  assetLink,
  block,
  amountToBridge,
}: PriceCorrectiveInputs) => {
  if (!assetLink?.assetOutAddress || !assetOut || !assetOut.address || !block || !bridgeKey) {
    return resolved<bigint>(sdkSettings.oneEther)
  }
  const oneToken = $derived(10n ** BigInt(assetOut.decimals))
  // the max fee i am targeting is 10%
  let aboutToBridge = amountToBridge / 10n
  if (aboutToBridge === 0n) {
    aboutToBridge = parseUnits('10', assetOut.decimals)
  }
  const [provider, fromChain, toChain] = bridgeKey
  const measurementToken = nativeAssetOut[toChain]
  const partner = [provider, toChain, fromChain] as BridgeKey
  const fromChainClient = input.clientFromChain(Number(fromChain))
  if (fromChain !== Chains.PLS && fromChain !== Chains.V4PLS) {
    return resolved(null)
  }
  const fetch = fetchPriceCorrective({
    isProd: isProd.value,
    bridgeKey,
    bridgeKeyPartner: partner,
    measurementToken,
    assetOut,
    fromChainClient,
    toChainClient: input.clientFromChain(Number(toChain)),
    assetLink,
    amountIn: aboutToBridge,
  })
  return loading.loadsAfterTick<bigint>(
    'gas',
    async () => {
      return await fetch.getPaymentToken()
    },
    async (paymentTokenResult: TokenBridgeInfo) => {
      // for a bridge going from foreign to home,
      // use the destination token as the measurement token for the home side
      return await fetch.getSwapResults({
        chain: fromChain,
        client: fromChainClient,
        paymentTokenResult,
      })
    },
    (results: [FetchResult[], ...[FetchResult[]]]) => {
      return fetch.reduceResults({
        results,
        oneToken,
      })
    },
  )()
}

/** the sources of the asset, including the wrapped asset if it exists */
export const assetSources = (
  asset: {
    logoURI?: string | null
    chainId: number
    address: string
    extensions?: {
      bridgeInfo?: {
        [chainId: string]: {
          tokenAddress: string
        }
      }
      wrapped?: {
        address: string
      }
    }
  } | null,
  bridgableTokens: Token[] = [],
) => {
  if (!asset) {
    return null
  }
  type MinTokenInfo = Pick<Token, 'chainId' | 'address'>
  const { chainId, address, extensions } = asset
  if (!chainId || !address) {
    return null
  }
  const inputs = _.compact(
    _.flatten([
      { chainId, address },
      extensions?.wrapped ? { chainId, address: extensions.wrapped.address } : null,
      ...Object.entries(extensions?.bridgeInfo || {}).map(([chainId, info]) => {
        if (!info.tokenAddress) {
          return null
        }
        const otherSide = [
          {
            chainId: Number(chainId),
            address: info.tokenAddress,
          },
        ]
        if (address === nativeAssetOut[toChain(asset.chainId)]) {
          otherSide.push({
            chainId: asset.chainId,
            address: zeroAddress,
          })
        }
        if (info.tokenAddress === nativeAssetOut[toChain(+chainId)]) {
          otherSide.push({
            chainId: Number(chainId),
            address: zeroAddress,
          })
        }
        return otherSide
      }),
    ]),
  )
  const sorted = _.sortBy(inputs, [
    (a: MinTokenInfo) => a.chainId,
    (a: MinTokenInfo) => a.address.toLowerCase(),
  ]) as MinTokenInfo[]
  sorted.forEach((a: MinTokenInfo) => {
    if (a.address === zeroAddress) {
      a.address = ''
    }
  })
  const sources = sorted.map((a: MinTokenInfo) => `${a.chainId}/${a.address}`.toLowerCase())
  return (asset.logoURI ?? address === zeroAddress)
    ? imageLinks.images(sources)
    : (input.tokenImageLookup(
        {
          chainId,
          address,
        },
        bridgableTokens,
      ) ?? imageLinks.images(sources))
}
