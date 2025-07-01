import {
  zeroAddress,
  type Hex,
  parseUnits,
  isAddress,
  encodeAbiParameters,
  concatHex,
  encodeFunctionData,
  getAddress,
  type Block,
  getContract,
  erc20Abi,
  parseEther,
} from 'viem'
import { FeeType } from '@gibs/bridge-sdk/fee-type'
import type { Token, BridgeKey } from '@gibs/bridge-sdk/types'
import { nativeAssetOut, pathway, Chains, canChangeUnwrap, isNative, toChain } from '@gibs/bridge-sdk/config'
import * as abis from '@gibs/bridge-sdk/abis'
import * as imageLinks from '@gibs/bridge-sdk/image-links'
import { chainsMetadata } from '@gibs/bridge-sdk/chains'
import { multicallErc20 } from '@gibs/common/erc20'
import type { Erc20Metadata } from '@gibs/common/types'
import { fetchPriceCorrective, type TokenBridgeInfo } from '@gibs/bridge-sdk/chain-info'
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

export const assetOutKey = ({
  bridgeKeyPath,
  assetInAddress,
  unwrap,
}: {
  bridgeKeyPath: string
  assetInAddress?: Hex | null
  unwrap: boolean
}) => {
  if (!bridgeKeyPath || !assetInAddress) return null
  return `${bridgeKeyPath}/${unwrap ? 'native' : 'erc20'}/${assetInAddress.toLowerCase()}`
}

export class BridgeSettings {
  constructor() { }
  // hold some basic state so that requests don't have to be re-created
  assetIn = new NullableProxyStore<Token>()
  // private output = new NullableProxyStore<Token>()
  assetOuts = new SvelteMap<string, Token>()
  priceCorrective = new ProxyStore<bigint>(0n)
  approval = new NullableProxyStore<bigint>()

  get assetOut() {
    const assetInAddress = input.bridgeKey.assetInAddress
    const assetsOut = this.assetOuts
    if (!assetInAddress) return null
    const key = assetOutKey({
      bridgeKeyPath: input.bridgeKey.path,
      assetInAddress: assetInAddress,
      unwrap: input.unwrap.value,
    })
    if (!key) return null
    // console.log(key)
    return assetsOut.get(key) ?? null
  }
  setAssetOut(assetOutKey: string, assetOut: Token) {
    this.assetOuts.set(assetOutKey, assetOut)
  }

  bridgePathway = $derived.by(() => {
    return pathway(input.bridgeKey.value, isProd.value, this.assetIn.value?.address)
  })
  bridgeFees = $derived.by(() => {
    return settings.get(settingKey(input.bridgeKey.value))
  })
  bridgeFee = $derived.by(() => {
    const setting = settings.get(settingKey(input.bridgeKey.value))
    const path = pathway(input.bridgeKey.value, isProd.value, this.assetIn.value?.address)
    return (path?.toHome ? setting?.feeF2H : setting?.feeH2F) ?? null
  })
  amountToBridge = $derived.by(() => {
    const amountIn = input.amountIn.value
    const assetIn = this.assetIn.value
    if (!amountIn || amountIn === 0n || !assetIn) return 0n
    return amountIn
  })
  bridgeCost = $derived.by(() => {
    const bridgeFee = this.bridgeFee
    const amountToBridge = this.amountToBridge
    if (bridgeFee === null) return null
    return (amountToBridge * bridgeFee) / oneEther
  })
  amountAfterBridgeFee = $derived.by(() => {
    const bridgeCost = this.bridgeCost
    const amountToBridge = this.amountToBridge
    if (bridgeCost === null) return null
    const afterFee = amountToBridge - bridgeCost
    if (afterFee < 0n) return 0n
    return afterFee
  })
  feeType = $derived.by(() => {
    return storageBridgeSettings.value?.feeType ?? FeeType.PERCENT
  })
  estimatedAmountOut = $derived.by(() => {
    const fee = this.estimatedFee
    const amountAfterBridgeFee = this.amountAfterBridgeFee
    if (typeof fee !== 'bigint') return null
    if (amountAfterBridgeFee === null) return null
    if (fee > amountAfterBridgeFee) return 0n
    return amountAfterBridgeFee - fee
  })
  estimatedFee = $derived.by(() => {
    const fee = input.fixedFee.value ?? 0n
    const percentFee = input.percentFee.value ?? 0n
    const amountAfterBridgeFee = this.amountAfterBridgeFee
    const fixedFee = amountAfterBridgeFee ? (amountAfterBridgeFee * percentFee) / input.oneEther : null
    const feeType = this.feeType
    const limit = this.limit
    if (feeType === FeeType.FIXED) {
      return fee
    } else if (feeType === FeeType.PERCENT) {
      if (amountAfterBridgeFee === null) return null
      return fixedFee
    } else if (feeType === FeeType.GAS_TIP) {
      return limit
    }
    return null
  })

  // deliveryCost = $derived.by(() => {
  //   // if (this.feeType === FeeType.PERCENT) { } else if (this.feeType === FeeType.GAS_TIP) { } else if (this.feeType === FeeType.FIXED) {

  //   // }
  //   // if (this.feeType === FeeType.PERCENT) {
  //   //   return (this.estimatedNetworkCost * (oneEther + this.percentFee)) / oneEther
  //   // }
  //   // return this.estimatedNetworkCost
  // })
  estimatedNativeNetworkCost = $derived.by(() => {
    const estimatedGas = this.estimatedGas
    const latestBaseFeePerGas = this.latestBaseFeePerGas
    const requiresDelivery = this.bridgePathway?.requiresDelivery
    if (!estimatedGas || !latestBaseFeePerGas || !requiresDelivery) {
      return null
    }
    return BigInt(estimatedGas * latestBaseFeePerGas)
  })
  estimatedTokenNetworkCost = $derived.by(() => {
    const estimatedNativeNetworkCost = this.estimatedNativeNetworkCost
    const priceCorrective = this.priceCorrective.value
    const decimals = this.assetIn.value?.decimals
    const oneTokenInt = this.oneTokenInt
    if (!priceCorrective || !oneTokenInt || !estimatedNativeNetworkCost || !decimals) {
      return null
    }
    const tokenCost = (estimatedNativeNetworkCost * oneTokenInt) / priceCorrective
    return tokenCost
  })
  estimatedGas = $derived.by(() => {
    return input.estimatedGas.value
  })
  latestBaseFeePerGas = $derived.by(() => {
    return chainEvents.latestBaseFeePerGas(Number(input.bridgeKey.value[2]))
  })
  oneTokenInt = $derived.by(() => {
    const assetIn = this.assetIn.value
    if (!assetIn) return 1n
    return 10n ** BigInt(assetIn.decimals)
  })
  limit = $derived.by(() => {
    const limit = input.limit.value
    if (!limit || limit === 0n) {
      return 0n
    }
    return limit
  })
  // percentFee = $derived.by(() => {
  //   if (!input.shouldDeliver.value) {
  //     return 0n
  //   }
  //   if (input.percentFee.value) {
  //     return input.percentFee.value
  //   }
  //   return (this.amountAfterBridgeFee * (input.percentFee.value ?? 0n)) / oneEther
  // })
  networkSwitchAssetOutAddress = $derived.by(() => {
    const toChainId = input.bridgeKey.value[2]
    const assetOut = this.assetOut
    if (!assetOut) return null
    if (!input.unwrap.value) return assetOut.address
    return nativeAssetOut[toChainId] === assetOut.address ? zeroAddress : assetOut.address
  })
  desiredExcessCompensationBasisPoints = $derived.by(() => {
    const bridgeKey = input.bridgeKey.value
    const path = pathway(bridgeKey, isProd.value, this.assetIn.value?.address)
    const assetIn = this.assetIn.value
    const assetOut = this.assetOut
    const assetOutAddress = assetOut?.address ?? null
    const list = whitelisted.value
    if (!path?.requiresDelivery) {
      return 0n
    }
    return (
      !assetIn
        ? 0n
        : this.feeType === FeeType.PERCENT
          ? 1_000n
          : isNative(assetIn, bridgeKey) || isNative(assetOut, bridgeKey)
            ? 1_000n
            : list.has(getAddress(assetIn?.address ?? '')) ||
              list.has(assetOutAddress ? getAddress(assetOutAddress) : '0x')
              ? 5_000n
              : 10_000n
    )
  })
  estimatedCost = $derived.by(() => {
    const shouldDeliver = input.shouldDeliver.value
    const amountAfterBridgeFee = this.amountAfterBridgeFee
    const percentFee = input.percentFee.value
    const estimatedTokenNetworkCost = this.estimatedTokenNetworkCost
    const reasonablePercentOnTopOfGasFee = this.reasonablePercentOnTopOfGasFee
    const feeType = this.feeType
    if (!shouldDeliver) {
      return null
    }
    if (feeType === FeeType.PERCENT) {
      if (amountAfterBridgeFee === null) return null
      return (amountAfterBridgeFee * (percentFee ?? 0n)) / oneEther
    }
    // gas tip
    if (!estimatedTokenNetworkCost) {
      return null
    }
    if (!reasonablePercentOnTopOfGasFee) {
      return null
    }
    return estimatedTokenNetworkCost * (reasonablePercentOnTopOfGasFee + oneEther)
  })
  reasonableFixedFee = $derived.by(() => {
    const estimatedTokenNetworkCost = this.estimatedTokenNetworkCost
    const desiredExcessCompensationBasisPoints = this.desiredExcessCompensationBasisPoints
    if (!estimatedTokenNetworkCost) {
      return null
    }
    return (
      (estimatedTokenNetworkCost * (25_000n + desiredExcessCompensationBasisPoints)) /
      input.basisPoints
    )
  })
  reasonablePercentOnGasLimit = $derived.by(() => {
    const gasTipFee = input.gasTipFee.value
    const estimatedTokenNetworkCost = this.estimatedTokenNetworkCost
    return (
      (25_000n *
        ((oneEther + (gasTipFee ?? 0n)) * (estimatedTokenNetworkCost ?? 0n))) /
      (oneEther * input.basisPoints)
    )
  })
  reasonablePercentFee = $derived.by(() => {
    const reasonableFixedFee = this.reasonableFixedFee
    const amountAfterBridgeFee = this.amountAfterBridgeFee
    if (!reasonableFixedFee) {
      return null
    }
    if (!amountAfterBridgeFee) {
      return null
    }
    const highFee = amountAfterBridgeFee / 10n
    const basisFeeTruncator = 10n ** 14n
    const max = 1_000n * basisFeeTruncator
    const min = 5n * basisFeeTruncator
    if (highFee < reasonableFixedFee) {
      return max // 10%
    }
    const highResPercent = (reasonableFixedFee * oneEther) / amountAfterBridgeFee
    if (highResPercent < min) {
      return min
    } else if (highResPercent > max) {
      return max
    }
    const basisPoint = highResPercent / basisFeeTruncator
    return basisPoint * basisFeeTruncator
  })
  assetInAddress = $derived.by(() => {
    return this.assetIn.value?.address
  })
  interactingWithBridgeToken = $derived.by(() => {
    const { toForeign, toHome } = chainEvents.assetLink.value || {}
    const { foreign } = toForeign || {}
    const { home } = toHome || {}
    let assetInAddress = this.assetInAddress
    if (!assetInAddress) return false
    assetInAddress = getAddress(assetInAddress)
    return !!(
      (foreign && getAddress(foreign) === assetInAddress) ||
      (home && getAddress(home) === assetInAddress)
    )
  })
  requiresForeignDataParam = $derived.by(() => {
    const bridgePathway = this.bridgePathway
    return bridgePathway?.requiresDelivery
  })
  foreignDataParam = $derived.by(() => {
    const bridgePathway = this.bridgePathway
    const assetIn = this.assetIn.value
    const destinationRouter = bridgePathway?.destinationRouter
    const feeDirectorStructEncoded = this.feeDirectorStructEncoded
    const assetLink = chainEvents.assetLink.value
    if (!bridgePathway || !assetIn) {
      return null
    }
    if (!destinationRouter) {
      console.log('no destination router')
      return null
    }
    if (bridgePathway.requiresDelivery && !feeDirectorStructEncoded) {
      console.log('no fee director struct encoded')
      return null
    }
    if (!assetLink) {
      console.log('no asset link')
      return null
    }
    if (bridgePathway.requiresDelivery && !input.shouldDeliver.value) {
      return input.recipient.value
    }
    const calldata = feeDirectorStructEncoded ?? '0x'
    return concatHex([destinationRouter, calldata])
  })
  feeDirectorStructEncoded = $derived.by(() => {
    const assetOut = this.assetOut
    const bridgePathway = this.bridgePathway
    const priceCorrective = this.priceCorrective.value
    const feeType = this.feeType
    const recipient = input.recipient.value
    const gasTipFee = input.gasTipFee.value
    const feeTypeSettings = this.feeTypeSettings
    const limit = this.limit
    if (!assetOut || !bridgePathway) {
      return null
    }
    if (!bridgePathway.requiresDelivery) {
      return null
    }
    if (!priceCorrective) {
      return null
    }
    let multiplier = 0n
    if (feeType === FeeType.GAS_TIP && priceCorrective > 0n) {
      multiplier =
        ((oneEther + (gasTipFee ?? 0n)) * 10n ** BigInt(assetOut.decimals)) /
        priceCorrective
    } else if (feeType === FeeType.PERCENT) {
      multiplier = input.percentFee.value ?? 0n
    }
    if (!recipient || !isAddress(recipient)) {
      return null
    }
    return encodeAbiParameters(abis.feeDeliveryStruct, [
      [recipient, feeTypeSettings, limit, multiplier],
    ])
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
  scaledBasisPoint = parseEther('0.01')
  max = parseEther('10')
  min = parseEther('0.05')
  reasonablePercentOnTopOfGasFee = $derived.by(() => {
    const result = this.desiredExcessCompensationBasisPoints * (oneEther / input.basisPoints)
    return result
  })
  /** if a user sets a percentage below this amount, then we will show a warning so that they can choose to increase the fee */
  desiredCompensationRatio = $derived.by(() => {
    return oneEther + (this.desiredExcessCompensationBasisPoints * oneEther) / input.basisPoints
  })
  /** whether or not the ui should show that the asset will be unwrapped */
  unwrap = $derived.by(() => {
    return canChangeUnwrap(input.bridgeKey.value, this.assetIn.value) && input.unwrap.value
  })

  availableCompensationMaximum = $derived.by(() => {
    const amountAfterBridgeFee = this.amountAfterBridgeFee
    const percentFee = input.percentFee.value
    const feeType = this.feeType
    const fixedFee = input.fixedFee.value
    const limit = this.limit
    if (feeType === FeeType.PERCENT) {
      if (amountAfterBridgeFee === null) return null
      return (amountAfterBridgeFee * (percentFee ?? 0n)) / oneEther
    } else if (feeType === FeeType.GAS_TIP) {
      return limit
    } else if (feeType === FeeType.FIXED) {
      return fixedFee ?? 0n
    }
    return 0n
  })

  get transactionInputs() {
    // check that path / bridge key is valid
    const bridgePathway = this.bridgePathway
    const assetIn = this.assetIn.value
    const recipient = input.recipient.value
    // const requiresForeignDataParam = this.requiresForeignDataParam
    const foreignDataParam = this.foreignDataParam
    const amountToBridge = this.amountToBridge
    const feeDirectorStructEncoded = this.feeDirectorStructEncoded
    const interactingWithBridgeToken = this.interactingWithBridgeToken
    const shouldDeliver = input.shouldDeliver.value
    if (!bridgePathway) {
      console.log('no bridge pathway')
      return null
    }
    // check that recipient is valid
    if (
      !recipient ||
      !isAddress(recipient) ||
      accountState.address === zeroAddress
    ) {
      console.log('no recipient')
      return null
    }
    // check that wallet account is valid
    if (
      !accountState.address ||
      !isAddress(accountState.address) ||
      accountState.address === zeroAddress
    ) {
      console.log('no account')
      return null
    }
    // check that asset in is valid
    if (!assetIn) {
      console.log('no asset in')
      return null
    }
    // check that asset link is valid
    if (!chainEvents.assetLink.value) {
      console.log('no asset link')
      return null
    }
    let value = 0n
    // we are moving "from" this side, so we need to call a function on the "from" address
    // only relevant for the relayTokens(AndCall) pathway outside of native tokens
    let toAddress = bridgePathway.from
    let data = '0x' as Hex
    if (interactingWithBridgeToken) {
      // when interacting with a bridged token, we need to call the token address directly
      toAddress = assetIn.address as Hex
      value = 0n
      // if we want delivery of the tokens (going from home to foreign) then we need to have the foreign data param
      // and it needs to start with the destination router
      if (!foreignDataParam) {
        return null
      }
      data = bridgePathway.usesExtraParam
        ? encodeFunctionData({
          abi: abis.erc677ExtraInput,
          functionName: 'transferAndCall',
          args: [
            bridgePathway.from,
            amountToBridge,
            foreignDataParam,
            accountState.address,
          ],
        })
        : encodeFunctionData({
          abi: abis.erc677,
          functionName: 'transferAndCall',
          args: [bridgePathway.from, amountToBridge, foreignDataParam],
        })
    } else if (assetIn.address === zeroAddress) {
      value = amountToBridge
      toAddress = bridgePathway.nativeRouter
      if (bridgePathway.feeManager === 'from' && shouldDeliver) {
        // transferring native to foreign
        if (!feeDirectorStructEncoded) return null
        if (!bridgePathway.destinationRouter) return null
        data = bridgePathway.usesExtraParam
          ? encodeFunctionData({
            abi: abis.nativeRouterExtraInput,
            functionName: 'relayTokensAndCall',
            args: [
              bridgePathway.destinationRouter,
              feeDirectorStructEncoded,
              accountState.address,
            ],
          })
          : encodeFunctionData({
            abi: abis.nativeRouter,
            functionName: 'relayTokensAndCall',
            args: [bridgePathway.destinationRouter, feeDirectorStructEncoded],
          })
      } else {
        // delivery always occurs when moving from foreign to home
        data = bridgePathway.usesExtraParam
          ? encodeFunctionData({
            abi: abis.nativeRouterExtraInput,
            functionName: 'wrapAndRelayTokens',
            args: [recipient, accountState.address],
          })
          : encodeFunctionData({
            abi: abis.nativeRouter,
            functionName: 'wrapAndRelayTokens',
            args: [recipient],
          })
      }
    } else {
      // tokens native to this side, entering the bridge
      if (shouldDeliver && bridgePathway.requiresDelivery) {
        if (!feeDirectorStructEncoded) return null
        if (!bridgePathway.destinationRouter) return null
        data = bridgePathway.usesExtraParam
          ? encodeFunctionData({
            abi: abis.inputBridgeExtraInput,
            functionName: 'relayTokensAndCall',
            args: [
              assetIn.address as Hex,
              bridgePathway.destinationRouter,
              amountToBridge,
              feeDirectorStructEncoded,
              accountState.address,
            ],
          })
          : encodeFunctionData({
            abi: abis.inputBridge,
            functionName: 'relayTokensAndCall',
            args: [
              assetIn.address as Hex,
              bridgePathway.destinationRouter,
              amountToBridge,
              feeDirectorStructEncoded,
            ],
          })
      } else {
        data = bridgePathway.usesExtraParam
          ? encodeFunctionData({
            abi: abis.inputBridgeExtraInput,
            functionName: 'relayTokens',
            args: [
              assetIn.address as Hex,
              recipient,
              amountToBridge,
              accountState.address,
            ],
          })
          : encodeFunctionData({
            abi: abis.inputBridge,
            functionName: 'relayTokens',
            args: [assetIn.address as Hex, recipient, amountToBridge],
          })
      }
    }
    return {
      to: toAddress,
      value,
      data,
    }
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
      logoURI: imageLinks.images([
        `${Number(toChain)}`,
        `${Number(toChain)}/${assetOutAddress}`,
      ]),
    }
    console.log('assetOut', assetOut)
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
export const oneEther = 10n ** 18n

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
    return resolved<bigint>(oneEther)
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
  return asset.logoURI ?? address === zeroAddress ? imageLinks.images(sources) : input.tokenImageLookup({
    chainId,
    address,
  }, bridgableTokens) ?? imageLinks.images(sources)
}
