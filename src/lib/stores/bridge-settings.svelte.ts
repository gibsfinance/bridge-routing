import * as input from '../stores/input.svelte'
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
import { bridgeSettings as storageBridgeSettings } from './storage.svelte'
import { Chains, Provider, toChain } from './auth/types'
import { loading, resolved } from './loading.svelte'
import { type Token, NullableProxyStore, ProxyStore } from '../types.svelte'
import * as chainEvents from './chain-events.svelte'
import { chainsMetadata } from './auth/constants'
import { multicallErc20, multicallRead, type Erc20Metadata } from '../utils.svelte'
import _ from 'lodash'
import { uniV2Routers, nativeAssetOut, pathway, whitelisted, pathways } from './config.svelte'
import * as abis from './abis'
import * as imageLinks from './image-links'
import { settingKey, settings } from './fee-manager.svelte'
import type { BridgeKey } from '../stores/input.svelte'
import { accountState } from './auth/AuthProvider.svelte'
import { SvelteMap } from 'svelte/reactivity'

// const backupAssetIn = {
//   address: zeroAddress,
//   name: 'unknown',
//   symbol: 'xxx',
//   decimals: 18,
//   logoURI: '',
//   chainId: 369,
// } as Token

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
  constructor() {}
  // hold some basic state so that requests don't have to be re-created
  assetIn = new NullableProxyStore<Token>()
  // private output = new NullableProxyStore<Token>()
  assetOuts = new SvelteMap<string, Token>()
  priceCorrective = new ProxyStore<bigint>(0n)
  approval = new NullableProxyStore<bigint>()

  get assetOut() {
    const assetInAddress = input.bridgeKey.assetInAddress
    if (!assetInAddress) return null
    const key = assetOutKey({
      bridgeKeyPath: input.bridgeKey.path,
      assetInAddress: assetInAddress,
      unwrap: input.unwrap.value,
    })
    if (!key) return null
    return this.assetOuts.get(key) ?? null
  }
  setAssetOut(assetOutKey: string, assetOut: Token) {
    this.assetOuts.set(assetOutKey, assetOut)
  }

  bridgePathway = $derived.by(() => {
    return pathway(input.bridgeKey.value)
  })
  bridgeFees = $derived.by(() => {
    return settings.get(settingKey(input.bridgeKey.value))
  })
  bridgeFee = $derived.by(() => {
    const setting = settings.get(settingKey(input.bridgeKey.value))
    const path = pathway(input.bridgeKey.value)
    return (path?.toHome ? setting?.feeF2H : setting?.feeH2F) ?? null
  })
  amountToBridge = $derived.by(() => {
    const amountIn = input.amountIn.value
    if (!amountIn || amountIn === 0n || !this.assetIn.value) return 0n
    return amountIn
  })
  bridgeCost = $derived.by(() => {
    const bridgeFee = this.bridgeFee
    if (bridgeFee === null) return null
    return (this.amountToBridge * bridgeFee) / oneEther
  })
  amountAfterBridgeFee = $derived.by(() => {
    const bridgeCost = this.bridgeCost
    if (bridgeCost === null) return null
    const afterFee = this.amountToBridge - bridgeCost
    if (afterFee < 0n) return 0n
    return afterFee
  })
  feeType = $derived.by(() => {
    return storageBridgeSettings.value?.feeType ?? input.FeeType.PERCENT
  })
  estimatedAmountOut = $derived.by(() => {
    const fee = this.estimatedFee
    if (typeof fee !== 'bigint') return null
    const amountAfterBridgeFee = this.amountAfterBridgeFee
    if (amountAfterBridgeFee === null) return null
    if (fee > amountAfterBridgeFee) return 0n
    return amountAfterBridgeFee - fee
  })
  estimatedFee = $derived.by(() => {
    if (this.feeType === input.FeeType.FIXED) {
      const fee = input.fixedFee.value ?? 0n
      return fee
    } else if (this.feeType === input.FeeType.PERCENT) {
      const percentFee = input.percentFee.value ?? 0n
      const amountAfterBridgeFee = this.amountAfterBridgeFee
      if (amountAfterBridgeFee === null) return null
      const fee = (amountAfterBridgeFee * percentFee) / input.oneEther
      return fee
    } else if (this.feeType === input.FeeType.GAS_TIP) {
      return this.limit
    }
    return null
  })

  // deliveryCost = $derived.by(() => {
  //   // if (this.feeType === input.FeeType.PERCENT) { } else if (this.feeType === input.FeeType.GAS_TIP) { } else if (this.feeType === input.FeeType.FIXED) {

  //   // }
  //   // if (this.feeType === input.FeeType.PERCENT) {
  //   //   return (this.estimatedNetworkCost * (oneEther + this.percentFee)) / oneEther
  //   // }
  //   // return this.estimatedNetworkCost
  // })
  estimatedNativeNetworkCost = $derived.by(() => {
    if (!this.bridgePathway?.requiresDelivery) {
      return null
    }
    return BigInt(this.estimatedGas * this.latestBaseFeePerGas)
  })
  estimatedTokenNetworkCost = $derived.by(() => {
    const estimatedNativeNetworkCost = this.estimatedNativeNetworkCost
    const priceCorrective = this.priceCorrective.value
    const decimals = this.assetIn.value?.decimals
    if (!priceCorrective || !this.oneTokenInt || !estimatedNativeNetworkCost || !decimals) {
      return null
    }
    const tokenCost = (estimatedNativeNetworkCost * this.oneTokenInt) / priceCorrective
    // console.log(
    //   'estimated cost',
    //   `${formatUnits(estimatedNativeNetworkCost, 18)}ETH`,
    //   `${formatUnits(tokenCost, decimals)}${this.assetOut?.symbol}`,
    // )
    return tokenCost
  })
  estimatedGas = $derived.by(() => {
    return input.estimatedGas.value
  })
  latestBaseFeePerGas = $derived.by(() => {
    return chainEvents.latestBaseFeePerGas(Number(input.bridgeKey.value[2]))
  })
  oneTokenInt = $derived.by(() => {
    return this.assetIn.value ? 10n ** BigInt(this.assetIn.value.decimals) : 1n
  })
  // fee = $derived.by(() => {
  //   const settings = input.bridgeAdminSettings.value
  //   const pathway = input.bridgeKey.pathway
  //   if (!settings || !pathway) return 0n
  //   const fee = pathway.toHome ? settings.feeF2H : settings.feeH2F
  //   if (!fee || fee === 0n || !this.bridgePathway || !this.bridgePathway.requiresDelivery) {
  //     return 0n
  //   }
  //   return fee / 100n
  // })
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
    const path = pathway(bridgeKey)
    if (!path?.requiresDelivery) {
      return 0n
    }
    const assetIn = this.assetIn.value
    const assetOut = this.assetOut
    const assetOutAddress = assetOut?.address ?? null
    return !assetIn
      ? 0n
      : this.feeType === input.FeeType.PERCENT
        ? 1_000n
        : input.isNative(assetIn, bridgeKey) || input.isNative(assetOut, bridgeKey)
          ? 1_000n
          : whitelisted.value.has(getAddress(assetIn?.address ?? '')) ||
              whitelisted.value.has(assetOutAddress ? getAddress(assetOutAddress) : '0x')
            ? 5_000n
            : 10_000n
  })
  estimatedCost = $derived.by(() => {
    if (!input.shouldDeliver.value) {
      return null
    }
    if (this.feeType === input.FeeType.PERCENT) {
      const amountAfterBridgeFee = this.amountAfterBridgeFee
      if (amountAfterBridgeFee === null) return null
      return (amountAfterBridgeFee * (input.percentFee.value ?? 0n)) / oneEther
    }
    // gas tip
    if (!this.estimatedTokenNetworkCost) {
      return null
    }
    const reasonablePercentOnTopOfGasFee = this.reasonablePercentOnTopOfGasFee
    if (!reasonablePercentOnTopOfGasFee) {
      return null
    }
    return this.estimatedTokenNetworkCost * (reasonablePercentOnTopOfGasFee + oneEther)
  })
  reasonableFixedFee = $derived.by(() => {
    const estimatedTokenNetworkCost = this.estimatedTokenNetworkCost
    if (!estimatedTokenNetworkCost) {
      return null
    }
    return (
      (estimatedTokenNetworkCost * (25_000n + this.desiredExcessCompensationBasisPoints)) /
      input.basisPoints
    )
  })
  reasonablePercentOnGasLimit = $derived.by(() => {
    return (
      (25_000n *
        ((oneEther + (input.gasTipFee.value ?? 0n)) * (this.estimatedTokenNetworkCost ?? 0n))) /
      (oneEther * input.basisPoints)
    )
  })
  reasonablePercentFee = $derived.by(() => {
    // const estimatedTokenNetworkCost = this.estimatedTokenNetworkCost
    // if (!estimatedTokenNetworkCost) {
    //   return null
    // }
    const reasonableFixedFee = this.reasonableFixedFee
    if (!reasonableFixedFee) {
      return null
    }
    const amountAfterBridgeFee = this.amountAfterBridgeFee
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
  // reasonablePercentOnTopOfGasFee = $derived.by(() => {
  //   return this.desiredExcessCompensationBasisPoints
  // })
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
  foreignDataParam = $derived.by(() => {
    if (!this.bridgePathway || !this.assetIn.value) {
      return null
    }
    const destinationRouter = this.bridgePathway.destinationRouter
    if (!destinationRouter || !this.feeDirectorStructEncoded || !chainEvents.assetLink.value) {
      return null
    }
    if (this.bridgePathway.requiresDelivery && !input.shouldDeliver.value) {
      return input.recipient.value
    }
    return concatHex([destinationRouter, this.feeDirectorStructEncoded])
  })
  feeDirectorStructEncoded = $derived.by(() => {
    const priceCorrective = this.priceCorrective.value
    if (!this.assetOut || !this.bridgePathway || !priceCorrective) {
      return null
    }
    let multiplier = 0n
    if (this.feeType === input.FeeType.GAS_TIP && priceCorrective > 0n) {
      multiplier =
        ((oneEther + (input.gasTipFee.value ?? 0n)) * 10n ** BigInt(this.assetOut.decimals)) /
        priceCorrective
    } else if (this.feeType === input.FeeType.PERCENT) {
      multiplier = input.percentFee.value ?? 0n
    }
    if (!isAddress(input.recipient.value)) {
      return null
    }
    return encodeAbiParameters(abis.feeDeliveryStruct, [
      [input.recipient.value, this.feeTypeSettings, this.limit, multiplier],
    ])
  })
  feeTypeSettings = $derived.by(() => {
    const th0 = this.feeType === input.FeeType.FIXED ? 1n : 0n
    const st1 = input.unwrap.value ? 1n : 0n
    const nd2 = 1n // always exclude priority when you can
    const rd3 = this.feeType === input.FeeType.PERCENT ? 1n : 0n
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
    return input.canChangeUnwrap(input.bridgeKey.value, this.assetIn.value) && input.unwrap.value
  })

  availableCompensationMaximum = $derived.by(() => {
    if (this.feeType === input.FeeType.PERCENT) {
      const amountAfterBridgeFee = this.amountAfterBridgeFee
      if (amountAfterBridgeFee === null) return null
      return (amountAfterBridgeFee * (input.percentFee.value ?? 0n)) / oneEther
    } else if (this.feeType === input.FeeType.GAS_TIP) {
      return this.limit
    } else if (this.feeType === input.FeeType.FIXED) {
      return input.fixedFee.value ?? 0n
    }
    return 0n
  })

  get transactionInputs() {
    // check that path / bridge key is valid
    if (!this.bridgePathway) {
      console.log('no bridge pathway')
      return null
    }
    // check that recipient is valid
    if (
      !input.recipient.value ||
      !isAddress(input.recipient.value) ||
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
    if (!this.assetIn.value) {
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
    let toAddress = this.bridgePathway.from
    let data = '0x' as Hex
    if (this.interactingWithBridgeToken) {
      // when interacting with a bridged token, we need to call the token address directly
      toAddress = this.assetIn.value.address as Hex
      value = 0n
      // if we want delivery of the tokens (going from home to foreign) then we need to have the foreign data param
      // and it needs to start with the destination router
      if (!this.foreignDataParam) return null
      data = this.bridgePathway.usesExtraParam
        ? encodeFunctionData({
            abi: abis.erc677ExtraInput,
            functionName: 'transferAndCall',
            args: [
              this.bridgePathway.from,
              this.amountToBridge,
              this.foreignDataParam,
              accountState.address,
            ],
          })
        : encodeFunctionData({
            abi: abis.erc677,
            functionName: 'transferAndCall',
            args: [this.bridgePathway.from, this.amountToBridge, this.foreignDataParam],
          })
    } else if (this.assetIn.value.address === zeroAddress) {
      value = this.amountToBridge
      toAddress = this.bridgePathway.nativeRouter
      if (this.bridgePathway.feeManager === 'from' && input.shouldDeliver.value) {
        // transferring native to foreign
        if (!this.feeDirectorStructEncoded) return null
        if (!this.bridgePathway.destinationRouter) return null
        data = this.bridgePathway.usesExtraParam
          ? encodeFunctionData({
              abi: abis.nativeRouterExtraInput,
              functionName: 'relayTokensAndCall',
              args: [
                this.bridgePathway.destinationRouter,
                this.feeDirectorStructEncoded,
                accountState.address,
              ],
            })
          : encodeFunctionData({
              abi: abis.nativeRouter,
              functionName: 'relayTokensAndCall',
              args: [this.bridgePathway.destinationRouter, this.feeDirectorStructEncoded],
            })
      } else {
        // delivery always occurs when moving from foreign to home
        data = this.bridgePathway.usesExtraParam
          ? encodeFunctionData({
              abi: abis.nativeRouterExtraInput,
              functionName: 'wrapAndRelayTokens',
              args: [input.recipient.value, accountState.address],
            })
          : encodeFunctionData({
              abi: abis.nativeRouter,
              functionName: 'wrapAndRelayTokens',
              args: [input.recipient.value],
            })
      }
    } else {
      // tokens native to this side, entering the bridge
      if (input.shouldDeliver.value && this.bridgePathway.requiresDelivery) {
        if (!this.feeDirectorStructEncoded) return null
        if (!this.bridgePathway.destinationRouter) return null
        data = this.bridgePathway.usesExtraParam
          ? encodeFunctionData({
              abi: abis.inputBridgeExtraInput,
              functionName: 'relayTokensAndCall',
              args: [
                this.assetIn.value.address as Hex,
                this.bridgePathway.destinationRouter,
                this.amountToBridge,
                this.feeDirectorStructEncoded,
                accountState.address,
              ],
            })
          : encodeFunctionData({
              abi: abis.inputBridge,
              functionName: 'relayTokensAndCall',
              args: [
                this.assetIn.value.address as Hex,
                this.bridgePathway.destinationRouter,
                this.amountToBridge,
                this.feeDirectorStructEncoded,
              ],
            })
      } else {
        data = this.bridgePathway.usesExtraParam
          ? encodeFunctionData({
              abi: abis.inputBridgeExtraInput,
              functionName: 'relayTokens',
              args: [
                this.assetIn.value.address as Hex,
                input.recipient.value,
                this.amountToBridge,
                accountState.address,
              ],
            })
          : encodeFunctionData({
              abi: abis.inputBridge,
              functionName: 'relayTokens',
              args: [this.assetIn.value.address as Hex, input.recipient.value, this.amountToBridge],
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
    _.find(customTokens, { address: getAddress(address) }) ??
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
      logoURI: imageLinks.image({
        chainId: Number(chainId),
        address: zeroAddress,
      }),
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
    logoURI: imageLinks.image({
      chainId: Number(chainId),
      address: assetInAddress,
    }),
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
  bridgeKey: input.BridgeKey
  assetInput: Token
  assetLink: chainEvents.TokenBridgeInfo
  unwrap: boolean
}) => {
  const [, fromChain, toChain] = bridgeKey
  const fromChainId = Number(fromChain)
  const toChainId = Number(toChain)
  if (!toChainId || !assetInput || !assetLink) {
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
        `${Number(toChain)}/${zeroAddress}`,
        `${Number(toChain)}/${assetOutAddress}`,
      ]),
    }
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
        // res.logoURI = imageLinks.image(res)
        res.logoURI = imageLinks.images([
          `${Number(toChainId)}/${assetOutAddress}`,
          `${fromChainId}/${assetInput.address}`,
        ])
      } else {
        // assumptions
        console.log('assetInput', assetInput)
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
//   [input.assetIn, input.feeType, whitelisted, input.bridgeKey],
//   ([$assetIn, $feeType, $whitelisted, $bridgeKey]) => {
// export const desiredExcessCompensationBasisPoints = (
//   assetIn: Token,
//   feeType: input.FeeType,
//   whitelisted: Set<Hex>,
//   bridgeKey: input.BridgeKey,
// ) => {
//   const path = pathway(bridgeKey)
//   if (!path?.requiresDelivery) {
//     return 0n
//   }
//   return !assetIn
//     ? 0n
//     : feeType === input.FeeType.PERCENT
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

type FetchResult = bigint[] | Hex
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

/**
 * check the prices that each router offers for the given paths
 * @param assetInAddress the address of the asset going into the bridge
 * @param oneTokenInt the number of tokens to push into the bridge (before fees)
 * @param chain the chain of the asset going into the bridge
 * @param bridgeKey the bridge key
 * @param blockNumber the block number to use for the price
 * @param paths the paths to check
 * @returns the prices as bigint for each path, hex whenever the price is not available
 */
const readAmountOut = (
  assetInAddress: Hex,
  oneTokenInt: bigint,
  chain: Chains,
  bridgeKey: input.BridgeKey,
  blockNumber: bigint,
  paths: Hex[][],
): Promise<FetchResult[]> => {
  const key = `${chain}-${bridgeKey}-${blockNumber}-${assetInAddress}-${oneTokenInt}`.toLowerCase()
  const res = fetchCache.get(key)
  if (res) {
    return res.result
  }
  const q = multicallRead<FetchResult[]>({
    chain: chainsMetadata[chain],
    client: input.clientFromChain(Number(chain)),
    abi: abis.univ2Router,
    // pulsex router
    calls: _.flatMap(uniV2Routers[chain], (target) =>
      paths.map((path) => ({
        functionName: 'getAmountsOut',
        allowFailure: true,
        args: [oneTokenInt, path],
        target,
      })),
    ),
  })
  fetchCache.set(key, {
    time: Date.now(),
    result: q,
  })
  return q
}

type PriceCorrectiveInputs = {
  bridgeKey: input.BridgeKey
  assetOut: Token | null
  assetLink: chainEvents.TokenBridgeInfo | null
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
    console.log('resolve with null')
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
  const outputFromRouter = (result: FetchResult) => {
    if (_.isString(result)) {
      return 0n
    }
    if (!result.length) {
      return 0n
    }
    const last = result[result.length - 1]
    return (last * oneToken) / aboutToBridge
  }
  const partner = [provider, toChain, fromChain] as input.BridgeKey
  return loading.loadsAfterTick<bigint>(
    'gas',
    async () => {
      // fetch the token bridge info for the token that is about to be spent by the delivery service
      return await chainEvents.tokenBridgeInfo(partner, {
        ...assetOut,
        address: measurementToken,
      })
    },
    async (paymentTokenResult: chainEvents.TokenBridgeInfo) => {
      // for a bridge going from foreign to home,
      // use the destination token as the measurement token for the home side
      const homeBridgedPaymentToken = paymentTokenResult!.assetOutAddress!
      return await Promise.all([
        readAmountOut(
          assetLink.assetInAddress,
          aboutToBridge,
          fromChain,
          bridgeKey,
          block!.number!,
          [
            // check the direct route
            [assetLink.assetInAddress, homeBridgedPaymentToken],
            // might have heavier liquidity going through the native asset on the home side
            [assetLink.assetInAddress, nativeAssetOut[fromChain], homeBridgedPaymentToken],
          ],
        ),
        readAmountOut(
          assetOut.address as Hex, //
          aboutToBridge,
          toChain, //
          bridgeKey, //
          block!.number!,
          // only the direct route is available.
          // might be able to create a whitelist for this at some point
          [[assetOut.address as Hex, measurementToken]],
        ),
      ])
    },
    (results: [FetchResult[], FetchResult[]]) => {
      const max = (amountsOut: (bigint | undefined)[]) => {
        return _.compact(amountsOut).reduce((max, current) => (max < current ? current : max), 0n)
      }
      const [outputs, inputs] = results
      const outputAmounts = outputs.map(outputFromRouter)
      const inputAmounts = inputs.map(outputFromRouter)
      const outputToken = max(outputAmounts)
      const inputToken = max(inputAmounts)
      // console.log(results, outputAmounts, inputAmounts)
      const result =
        outputToken && outputToken > 0n
          ? inputToken && inputToken > outputToken && inputToken / outputToken === 1n
            ? inputToken
            : outputToken
          : inputToken
      // console.log('price corrective', result)
      return result
    },
  )()
}

/**
 * the oneTokenInt, estimated cost for running a transaction
 * on the foreign network, given current gas conditions
 */
// export const estimatedTokenNetworkCost = ({
//   bridgePathway,
//   estimatedGas,
//   latestBaseFeePerGas,
//   priceCorrective,
//   oneTokenInt,
// }: {
//   bridgePathway: Pathway
//   estimatedGas: bigint
//   latestBaseFeePerGas: bigint
//   priceCorrective: bigint
//   oneTokenInt: bigint
// }) => {
//   if (!priceCorrective || !bridgePathway?.requiresDelivery) {
//     return 0n
//   }
//   return BigInt((estimatedGas * latestBaseFeePerGas * oneTokenInt) / priceCorrective)
// }
/** the maximum number of tokens that the user wishes to pay in fees */
// export const limit = ({ limit, assetIn }: { limit: string; assetIn: Token }) => {
//   if (isZero(limit) || !assetIn) return 0n
//   return parseUnits(stripNonNumber(limit), assetIn.decimals)
// }
// export const fee = ({ fee, bridgePathway }: { fee: string; bridgePathway: Pathway }) => {
//   if (isZero(fee) || !bridgePathway || !bridgePathway.requiresDelivery) return 0n
//   return parseUnits(stripNonNumber(fee), 18) / 100n
// }

// export const bridgeFee = (bridgeKey: input.BridgeKey) => {
//   const setting = settings.get(bridgeKey)
//   const path = pathway(bridgeKey)
//   return (path?.toHome ? setting?.feeF2H : setting?.feeH2F) || 0n
// }

// /** the number of tokens charged as fee for crossing the bridge */
// export const bridgeCost = ({
//   amountToBridge,
//   bridgeFee,
// }: {
//   amountToBridge: bigint
//   bridgeFee: bigint
// }) => {
//   return (amountToBridge * bridgeFee) / oneEther
// }
// /** the number of tokens available after they have crossed the bridge */
// export const amountAfterBridgeFee = ({
//   amountToBridge,
//   bridgeCost,
// }: {
//   amountToBridge: bigint
//   bridgeCost: bigint
// }) => {
//   const afterFee = amountToBridge - bridgeCost
//   if (afterFee < 0n) return 0n
//   return afterFee
// }

// export const limitFromPercent = ({
//   fee,
//   amountAfterBridgeFee,
// }: {
//   fee: bigint
//   amountAfterBridgeFee: bigint
// }) => {
//   return (amountAfterBridgeFee * fee) / oneEther
// }

// /** the estimated network cost + tip */
// export const baseFeeReimbersement = ({
//   estimatedTokenNetworkCost,
//   fee,
// }: {
//   estimatedNetworkCost: bigint
//   fee: bigint
// }) => {
//   return (estimatedNetworkCost * (oneEther + fee)) / oneEther
// }

// /** the fee, clamped to the user defined limit */
// export const clampedReimbersement = ({
//   baseFeeReimbersement,
//   limit,
//   feeType,
//   limitFromPercent,
// }: {
//   baseFeeReimbersement: bigint
//   limit: bigint
//   feeType: input.FeeType
//   limitFromPercent: bigint
// }) => {
//   if (feeType === input.FeeType.PERCENT) {
//     return limitFromPercent
//   }
//   return baseFeeReimbersement > limit ? limit : baseFeeReimbersement
// }
// /** the estimated cost given the choice for a fixed fee, limit and incentive fee */
// export const estimatedCost = ({
//   feeType,
//   limit,
//   limitFromPercent,
//   clampedReimbersement,
//   shouldDeliver,
// }: {
//   feeType: input.FeeType
//   limit: bigint
//   limitFromPercent: bigint
//   clampedReimbersement: bigint
//   shouldDeliver: boolean
// }) => {
//   if (!shouldDeliver) return 0n
//   if (feeType === input.FeeType.PERCENT) {
//     return limitFromPercent
//   }
//   if (feeType === input.FeeType.FIXED) {
//     return limit
//   }
//   return clampedReimbersement
// }
// export const estimatedCost = derived(
//   [input.feeType, limit, limitFromPercent, clampedReimbersement, input.shouldDeliver],
//   ([$feeType, $limit, $limitFromPercent, $clampedReimbersement, $shouldDeliver]) => {
//     if (!$shouldDeliver) return 0n
//     if ($feeType === input.FeeType.PERCENT) {
//       return $limitFromPercent
//     }
//     if ($feeType === input.FeeType.FIXED) {
//       return $limit
//     }
//     return $clampedReimbersement
//   },
// )
// /** creates the settings param for the fee director struct */
// export const feeTypeSettings = ({
//   feeType,
//   unwrap,
// }: {
//   feeType: input.FeeType
//   unwrap: boolean
// }) => {
//   const th0 = feeType === input.FeeType.FIXED ? 1n : 0n
//   const st1 = unwrap ? 1n : 0n
//   const nd2 = 1n // always exclude priority when you can
//   const rd3 = feeType === input.FeeType.PERCENT ? 1n : 0n
//   return (rd3 << 3n) | (nd2 << 2n) | (st1 << 1n) | th0
// }

// /** the encoded struct to be passed to the foreign router */
// export const feeDirectorStructEncoded = ({
//   bridgePathway,
//   recipient,
//   feeTypeSettings,
//   limit,
//   fee,
//   feeType,
//   assetOut,
//   priceCorrective,
// }: {
//   bridgePathway: Pathway
//   recipient: Hex
//   feeTypeSettings: bigint
//   limit: bigint
//   fee: bigint
//   feeType: input.FeeType
//   assetOut: Token
//   priceCorrective: bigint
// }) => {
//   if (!assetOut || !bridgePathway) {
//     return null
//   }
//   let multiplier = 0n
//   if (feeType === input.FeeType.GAS_TIP && priceCorrective > 0n) {
//     multiplier = ((oneEther + fee) * 10n ** BigInt(assetOut.decimals)) / priceCorrective
//   } else if (feeType === input.FeeType.PERCENT) {
//     multiplier = fee
//   }
//   if (!isAddress(recipient)) {
//     return null
//   }
//   return encodeAbiParameters(abis.feeDeliveryStruct, [
//     [recipient, feeTypeSettings, limit, multiplier],
//   ])
// }
// export const feeDirectorStructEncoded = derived(
//   [
//     input.bridgePathway,
//     input.recipient,
//     feeTypeSettings,
//     limit,
//     fee,
//     input.feeType,
//     assetOut,
//     priceCorrective,
//   ],
//   ([
//     $bridgePathway,
//     $recipient,
//     $feeTypeSettings,
//     $limit,
//     $fee,
//     $feeType,
//     $assetOut,
//     $priceCorrective,
//   ]) => {
//     if (!$assetOut || !$bridgePathway) {
//       return null
//     }
//     let multiplier = 0n
//     if ($feeType === input.FeeType.GAS_TIP && $priceCorrective > 0n) {
//       multiplier = ((oneEther + $fee) * 10n ** BigInt($assetOut.decimals)) / $priceCorrective
//     } else if ($feeType === input.FeeType.PERCENT) {
//       multiplier = $fee
//     }
//     if (!isAddress($recipient)) {
//       return null
//     }
//     return encodeAbiParameters(abis.feeDeliveryStruct, [
//       [$recipient, $feeTypeSettings, $limit, multiplier],
//     ])
//   },
// )

// export const interactingWithBridgeToken = ({
//   assetIn,
//   assetLink,
// }: {
//   assetIn: Token
//   assetLink: chainEvents.TokenBridgeInfo
// }) => {
//   const { toForeign, toHome } = assetLink || {}
//   const { foreign } = toForeign || {}
//   const { home } = toHome || {}
//   let assetInAddress = assetIn?.address
//   if (!assetInAddress) return false
//   assetInAddress = getAddress(assetInAddress)
//   return !!(
//     (foreign && getAddress(foreign) === assetInAddress) ||
//     (home && getAddress(home) === assetInAddress)
//   )
// }
/**
 * the full calldata defined in the home bridge's _data prop
 * to be used to call on the foreign router
 */
// export const foreignDataParam = ({
//   bridgePathway,
//   assetIn,
//   assetLink,
//   destinationRouter,
//   feeDirectorStructEncoded,
//   recipient,
//   shouldDeliver,
// }: {
//   bridgePathway: Pathway
//   assetIn: Token
//   assetLink: chainEvents.TokenBridgeInfo
//   destinationRouter: Hex
//   feeDirectorStructEncoded: Hex
//   recipient: Hex
//   shouldDeliver: boolean
// }) => {
//   if (!bridgePathway || !assetIn) {
//     return null
//   }
//   if (!destinationRouter || !feeDirectorStructEncoded || !assetLink) {
//     return null
//   }
//   if (bridgePathway.requiresDelivery && !shouldDeliver) {
//     return recipient
//   }
//   return concatHex([destinationRouter, feeDirectorStructEncoded])
// }
// export const foreignDataParam = derived(
//   [
//     input.bridgePathway,
//     input.assetIn,
//     chainEvents.assetLink,
//     input.destinationRouter,
//     feeDirectorStructEncoded,
//     input.recipient,
//     input.shouldDeliver,
//   ],
//   ([
//     $bridgePathway,
//     $assetIn,
//     $assetLink,
//     $destinationRouter,
//     $feeDirectorStructEncoded,
//     $recipient,
//     $shouldDeliver,
//   ]) => {
//     if (!$bridgePathway || !$assetIn) {
//       return null
//     }
//     if (!$destinationRouter || !$feeDirectorStructEncoded || !$assetLink) {
//       return null
//     }
//     if ($bridgePathway.requiresDelivery && !$shouldDeliver) {
//       return $recipient
//     }
//     return concatHex([$destinationRouter, $feeDirectorStructEncoded])
//   },
// )
// export const foreignCalldata = derived(
//   [assetOut, input.shouldDeliver, amountAfterBridgeFee, feeDirectorStructEncoded],
//   ([$assetOut, $shouldDeliver, $amountAfterBridgeFee, $feeDirectorStructEncoded]) => {
//     if (!$feeDirectorStructEncoded || !$assetOut) {
//       return null
//     }
//     if (!$shouldDeliver) {
//       return '0x' as Hex
//     }
//     return encodeFunctionData({
//       abi: abis.outputRouter,
//       functionName: 'onTokenBridged',
//       args: [$assetOut.address, $amountAfterBridgeFee, $feeDirectorStructEncoded],
//     })
//   },
// )

/**
 * the inputs to the transaction that will be signed over by the user's wallet
 * this transaction transfers to the relevant bridge address and the user's amount that they wish to bridge before fees
 * it also contains calldata that is shuttled over to the foreign network
 * to be executed there after validator signatures are provided
 */
// export const transactionInputs = ({
//   walletAccount,
//   recipient,
//   assetIn,
//   destinationRouter,
//   shouldDeliver,
//   assetLink,
//   bridgePathway,
//   amountToBridge,
//   foreignDataParam,
//   feeDirectorStructEncoded,
//   interactingWithBridgeToken,
// }: {
//   walletAccount: Hex
//   recipient: Hex
//   assetIn: Token
//   destinationRouter: Hex
//   shouldDeliver: boolean
//   assetLink: chainEvents.TokenBridgeInfo
//   bridgePathway: Pathway
//   amountToBridge: bigint
//   foreignDataParam: Hex
//   feeDirectorStructEncoded: Hex
//   interactingWithBridgeToken: boolean
// }) => {
//   // check that path / bridge key is valid
//   if (!bridgePathway) return null
//   // check that recipient is valid
//   if (!recipient || !isAddress(recipient)) return null
//   // check that wallet account is valid
//   if (!walletAccount || !isAddress(walletAccount)) return null
//   // check that asset in is valid
//   if (!assetIn) return null
//   // check that asset link is valid
//   if (!assetLink) return null
//   let value = 0n
//   // we are moving "from" this side, so we need to call a function on the "from" address
//   // only relevant for the relayTokens(AndCall) pathway outside of native tokens
//   let toAddress = bridgePathway.from
//   let data = '0x' as Hex
//   if (interactingWithBridgeToken) {
//     // when interacting with a bridged token, we need to call the token address directly
//     toAddress = assetIn.address
//     value = 0n
//     // if we want delivery of the tokens (going from home to foreign) then we need to have the foreign data param
//     // and it needs to start with the destination router
//     if (!foreignDataParam) return null
//     data = bridgePathway.usesExtraParam
//       ? encodeFunctionData({
//           abi: abis.erc677ExtraInput,
//           functionName: 'transferAndCall',
//           args: [bridgePathway.from, amountToBridge, foreignDataParam, walletAccount],
//         })
//       : encodeFunctionData({
//           abi: abis.erc677,
//           functionName: 'transferAndCall',
//           args: [bridgePathway.from, amountToBridge, foreignDataParam],
//         })
//   } else if (assetIn.address === zeroAddress) {
//     value = amountToBridge
//     toAddress = bridgePathway.nativeRouter
//     if (bridgePathway.feeManager === 'from' && shouldDeliver) {
//       // transferring native to foreign
//       if (!feeDirectorStructEncoded) return null
//       if (!destinationRouter) return null
//       data = bridgePathway.usesExtraParam
//         ? encodeFunctionData({
//             abi: abis.nativeRouterExtraInput,
//             functionName: 'relayTokensAndCall',
//             args: [destinationRouter, feeDirectorStructEncoded, walletAccount],
//           })
//         : encodeFunctionData({
//             abi: abis.nativeRouter,
//             functionName: 'relayTokensAndCall',
//             args: [destinationRouter, feeDirectorStructEncoded],
//           })
//     } else {
//       // delivery always occurs when moving from foreign to home
//       data = bridgePathway.usesExtraParam
//         ? encodeFunctionData({
//             abi: abis.nativeRouterExtraInput,
//             functionName: 'wrapAndRelayTokens',
//             args: [recipient, walletAccount],
//           })
//         : encodeFunctionData({
//             abi: abis.nativeRouter,
//             functionName: 'wrapAndRelayTokens',
//             args: [recipient],
//           })
//     }
//   } else {
//     // tokens native to this side, entering the bridge
//     if (shouldDeliver && bridgePathway.requiresDelivery) {
//       if (!feeDirectorStructEncoded) return null
//       if (!destinationRouter) return null
//       data = bridgePathway.usesExtraParam
//         ? encodeFunctionData({
//             abi: abis.inputBridgeExtraInput,
//             functionName: 'relayTokensAndCall',
//             args: [
//               assetIn.address,
//               destinationRouter,
//               amountToBridge,
//               feeDirectorStructEncoded,
//               walletAccount,
//             ],
//           })
//         : encodeFunctionData({
//             abi: abis.inputBridge,
//             functionName: 'relayTokensAndCall',
//             args: [assetIn.address, destinationRouter, amountToBridge, feeDirectorStructEncoded],
//           })
//     } else {
//       data = bridgePathway.usesExtraParam
//         ? encodeFunctionData({
//             abi: abis.inputBridgeExtraInput,
//             functionName: 'relayTokens',
//             args: [assetIn.address, recipient, amountToBridge, walletAccount],
//           })
//         : encodeFunctionData({
//             abi: abis.inputBridge,
//             functionName: 'relayTokens',
//             args: [assetIn.address, recipient, amountToBridge],
//           })
//     }
//   }
//   return {
//     to: toAddress,
//     value,
//     data,
//   }
// }
// export const transactionInputs = derived(
//   [
//     walletAccount,
//     input.recipient,
//     input.assetIn,
//     input.destinationRouter,
//     input.shouldDeliver,
//     chainEvents.assetLink,
//     input.bridgePathway,
//     amountToBridge,
//     foreignDataParam,
//     feeDirectorStructEncoded,
//     interactingWithBridgeToken,
//   ],
//   ([
//     $walletAccount,
//     $recipient,
//     $assetIn,
//     $destinationRouter,
//     $shouldDeliver,
//     $assetLink,
//     $bridgePathway,
//     $amountToBridge,
//     $foreignDataParam,
//     $feeDirectorStructEncoded,
//     $interactingWithBridgeToken,
//   ]) => {
//     // check that path / bridge key is valid
//     if (!$bridgePathway) return null
//     // check that recipient is valid
//     if (!$recipient || !isAddress($recipient)) return null
//     // check that wallet account is valid
//     if (!$walletAccount || !isAddress($walletAccount)) return null
//     // check that asset in is valid
//     if (!$assetIn) return null
//     // check that asset link is valid
//     if (!$assetLink) return null
//     let value = 0n
//     // we are moving "from" this side, so we need to call a function on the "from" address
//     // only relevant for the relayTokens(AndCall) pathway outside of native tokens
//     let toAddress = $bridgePathway.from
//     let data = '0x' as Hex
//     if ($interactingWithBridgeToken) {
//       // when interacting with a bridged token, we need to call the token address directly
//       toAddress = $assetIn.address
//       value = 0n
//       // if we want delivery of the tokens (going from home to foreign) then we need to have the foreign data param
//       // and it needs to start with the destination router
//       if (!$foreignDataParam) return null
//       data = $bridgePathway.usesExtraParam
//         ? encodeFunctionData({
//             abi: abis.erc677ExtraInput,
//             functionName: 'transferAndCall',
//             args: [$bridgePathway.from, $amountToBridge, $foreignDataParam, $walletAccount],
//           })
//         : encodeFunctionData({
//             abi: abis.erc677,
//             functionName: 'transferAndCall',
//             args: [$bridgePathway.from, $amountToBridge, $foreignDataParam],
//           })
//     } else if ($assetIn.address === zeroAddress) {
//       value = $amountToBridge
//       toAddress = $bridgePathway.nativeRouter
//       if ($bridgePathway.feeManager === 'from' && $shouldDeliver) {
//         // transferring native to foreign
//         if (!$feeDirectorStructEncoded) return null
//         if (!$destinationRouter) return null
//         data = $bridgePathway.usesExtraParam
//           ? encodeFunctionData({
//               abi: abis.nativeRouterExtraInput,
//               functionName: 'relayTokensAndCall',
//               args: [$destinationRouter, $feeDirectorStructEncoded, $walletAccount],
//             })
//           : encodeFunctionData({
//               abi: abis.nativeRouter,
//               functionName: 'relayTokensAndCall',
//               args: [$destinationRouter, $feeDirectorStructEncoded],
//             })
//       } else {
//         // delivery always occurs when moving from foreign to home
//         data = $bridgePathway.usesExtraParam
//           ? encodeFunctionData({
//               abi: abis.nativeRouterExtraInput,
//               functionName: 'wrapAndRelayTokens',
//               args: [$recipient, $walletAccount],
//             })
//           : encodeFunctionData({
//               abi: abis.nativeRouter,
//               functionName: 'wrapAndRelayTokens',
//               args: [$recipient],
//             })
//       }
//     } else {
//       // tokens native to this side, entering the bridge
//       if ($shouldDeliver && $bridgePathway.requiresDelivery) {
//         if (!$feeDirectorStructEncoded) return null
//         if (!$destinationRouter) return null
//         data = $bridgePathway.usesExtraParam
//           ? encodeFunctionData({
//               abi: abis.inputBridgeExtraInput,
//               functionName: 'relayTokensAndCall',
//               args: [
//                 $assetIn.address,
//                 $destinationRouter,
//                 $amountToBridge,
//                 $feeDirectorStructEncoded,
//                 $walletAccount,
//               ],
//             })
//           : encodeFunctionData({
//               abi: abis.inputBridge,
//               functionName: 'relayTokensAndCall',
//               args: [
//                 $assetIn.address,
//                 $destinationRouter,
//                 $amountToBridge,
//                 $feeDirectorStructEncoded,
//               ],
//             })
//       } else {
//         data = $bridgePathway.usesExtraParam
//           ? encodeFunctionData({
//               abi: abis.inputBridgeExtraInput,
//               functionName: 'relayTokens',
//               args: [$assetIn.address, $recipient, $amountToBridge, $walletAccount],
//             })
//           : encodeFunctionData({
//               abi: abis.inputBridge,
//               functionName: 'relayTokens',
//               args: [$assetIn.address, $recipient, $amountToBridge],
//             })
//       }
//     }
//     return {
//       to: toAddress,
//       value,
//       data,
//     }
//   },
// )

/** the sources of the asset, including the wrapped asset if it exists */
export const assetSources = (
  asset: {
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
  extraSources: string[] = [],
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
  const sources = sorted.map((a: MinTokenInfo) => `${a.chainId}/${a.address}`.toLowerCase())
  return imageLinks.images(sources.concat(extraSources))
}

export const findAssetByUnique = (
  {
    allBridgeableTokens,
    fromChainId,
    // toChainId,
    address,
  }: {
    allBridgeableTokens: Token[]
    fromChainId: number
    // toChainId: number,
    address: Hex
  },
  // allBridgeableTokens: Token[],
  // fromChainId: number,
  // toChainId: number,
  // address: Hex,
) => {
  const addr = getAddress(address)
  return (
    allBridgeableTokens.find((t) => t.chainId === fromChainId && getAddress(t.address) === addr) ||
    // allBridgeableTokens.find((t) => t.chainId === toChainId && getAddress(t.address) === addr) ||
    allBridgeableTokens.find((t) =>
      t.extensions?.bridgeInfo?.[fromChainId]?.tokenAddress
        ? getAddress(t.extensions.bridgeInfo[fromChainId].tokenAddress) === addr
        : false,
    )
  )
  // return $bridgeableTokens.find(
  //   (t) =>
  //     (t.chainId === fromChainId && getAddress(t.address) === addr) ||
  //     (t.chainId === toChainId && getAddress(t.address) === addr) ||
  //     (t.extensions?.bridgeInfo?.[fromChainId]?.tokenAddress
  //       ? getAddress(t.extensions.bridgeInfo[fromChainId].tokenAddress) === addr
  //       : false) ||
  //     (t.extensions?.bridgeInfo?.[toChainId]?.tokenAddress
  //       ? getAddress(t.extensions.bridgeInfo[toChainId].tokenAddress) === addr
  //       : false),
  // )
}

// // export const details = writable<null | 'settings' | 'details'>(null)
export type ExtraDataOptions = 'settings' | 'details'
export type ExtraDataSettings = ExtraDataOptions | null
export const details = new NullableProxyStore<ExtraDataOptions>()

export const inferBridgeKey = ({
  currentKey,
  provider,
  fromChain,
  toChain,
}: {
  currentKey: input.BridgeKey
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
  return [provider, nextFromChain, nextToChain] as input.BridgeKey
}
