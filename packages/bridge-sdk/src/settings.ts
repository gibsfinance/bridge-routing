import { concatHex, encodeAbiParameters, encodeFunctionData, getAddress, type Hex, isAddress, zeroAddress } from "viem";
import { Chains, isNative, nativeAssetOut, type Pathway, pathway } from "./config.js";
import { FeeType } from "./fee-type.js";
import type { BridgeKey, Token } from "./types.js";
import type { TokenBridgeInfo } from "./chain-info.js";
import * as abis from "./abis.js";

export const oneEther = 10n ** 18n

export const basisPoints = 10_000n

export const bridgePathway = ({
  bridgeKey,
  isProd,
  assetIn,
}: {
  bridgeKey: BridgeKey
  isProd: boolean
  assetIn: Token | null
}) => (
  pathway(bridgeKey, isProd, assetIn?.address) ?? null
)

export const amountToBridge = ({
  amountIn,
  assetIn,
}: {
  amountIn: bigint | null
  assetIn: Token | null
}) => {
  if (!amountIn || amountIn === 0n || !assetIn) {
    return 0n
  }
  return amountIn
}

export const bridgeCost = ({
  amountToBridge,
  bridgeFee,
}: {
  amountToBridge: bigint
  bridgeFee: bigint | null
}) => {
  if (bridgeFee === null) return null
  return (amountToBridge * bridgeFee) / oneEther
}

export const amountAfterBridgeFee = ({
  amountToBridge,
  bridgeCost,
}: {
  amountToBridge: bigint
  bridgeCost: bigint | null
}) => {
  if (bridgeCost === null) return null
  const afterFee = amountToBridge - bridgeCost
  if (afterFee < 0n) return 0n
  return afterFee
}

export const estimatedAmountOut = ({
  amountAfterBridgeFee,
  fee,
}: {
  amountAfterBridgeFee: bigint | null
  fee: bigint | null
}) => {
  if (typeof fee !== 'bigint') return null
  if (amountAfterBridgeFee === null) return null
  if (fee > amountAfterBridgeFee) return 0n
  return amountAfterBridgeFee - fee
}

export const estimatedFee = ({
  amountAfterBridgeFee,
  fee,
  percentFee,
  feeType,
  limit,
  costsToDeliver,
}: {
  amountAfterBridgeFee: bigint | null
  fee: bigint
  percentFee: bigint
  feeType: FeeType
  limit: bigint | null
  costsToDeliver: boolean
}) => {
  const fixedFee = amountAfterBridgeFee ? (amountAfterBridgeFee * percentFee) / oneEther : null
  if (!costsToDeliver) {
    return 0n
  }
  if (feeType === FeeType.FIXED) {
    return fee
  } else if (feeType === FeeType.PERCENT) {
    if (amountAfterBridgeFee === null) return null
    return fixedFee
  } else if (feeType === FeeType.GAS_TIP) {
    return limit
  }
  return null
}

export const estimatedNativeNetworkCost = ({
  estimatedGas,
  latestBaseFeePerGas,
  requiresDelivery,
}: {
  estimatedGas: bigint | null
  latestBaseFeePerGas: bigint | null
  requiresDelivery: boolean
}) => {
  if (!estimatedGas || !latestBaseFeePerGas || !requiresDelivery) {
    return null
  }
  return BigInt(estimatedGas * latestBaseFeePerGas)
}

export const estimatedTokenNetworkCost = ({
  estimatedNativeNetworkCost,
  priceCorrective,
  decimals,
  oneTokenInt,
}: {
  estimatedNativeNetworkCost: bigint | null
  priceCorrective: bigint | null
  decimals: number | null
  oneTokenInt: bigint | null
}) => {
  if (!priceCorrective || !oneTokenInt || !estimatedNativeNetworkCost || !decimals) {
    return null
  }
  const tokenCost = (estimatedNativeNetworkCost * oneTokenInt) / priceCorrective
  return tokenCost
}

export const oneTokenInt = ({
  assetIn,
}: {
  assetIn: Token | null
}) => {
  if (!assetIn) return 1n
  return 10n ** BigInt(assetIn.decimals)
}

export const limit = (lim: bigint | null) => {
  if (!lim) {
    return 0n
  }
  return lim
}

export const networkSwitchAssetOutAddress = ({
  assetOut,
  unwrap,
  toChain,
}: {
  assetOut: Token | null
  unwrap: boolean
  toChain: Chains
}) => {
  if (!assetOut) return null
  if (!unwrap) return assetOut.address
  return nativeAssetOut[toChain] === assetOut.address ? zeroAddress : assetOut.address
}

export const desiredExcessCompensationBasisPoints = ({
  path,
  assetIn,
  assetOut,
  bridgeKey,
  feeType,
  list,
  assetOutAddress,
}: {
  path: Pathway | null
  assetIn: Token | null
  assetOut: Token | null
  bridgeKey: BridgeKey
  feeType: FeeType
  list: Set<string>
  assetOutAddress: string | null
}) => {
  if (!path?.requiresDelivery) {
    return 0n
  }
  return (
    !assetIn
      ? 0n
      : feeType === FeeType.PERCENT
        ? 1_000n
        : isNative(assetIn, bridgeKey) || isNative(assetOut, bridgeKey)
          ? 1_000n
          : list.has(getAddress(assetIn?.address ?? '')) ||
            list.has(assetOutAddress ? getAddress(assetOutAddress) : '0x')
            ? 5_000n
            : 10_000n
  )
}

export const estimatedCost = ({
  shouldDeliver,
  amountAfterBridgeFee,
  percentFee,
  estimatedTokenNetworkCost,
  reasonablePercentOnTopOfGasFee,
  feeType,
}: {
  shouldDeliver: boolean
  amountAfterBridgeFee: bigint | null
  percentFee: bigint | null
  estimatedTokenNetworkCost: bigint | null
  reasonablePercentOnTopOfGasFee: bigint | null
  feeType: FeeType
}) => {
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
}

export const reasonableFixedFee = ({
  estimatedTokenNetworkCost,
  desiredExcessCompensationBasisPoints,
}: {
  estimatedTokenNetworkCost: bigint | null
  desiredExcessCompensationBasisPoints: bigint
}) => {
  if (!estimatedTokenNetworkCost) {
    return null
  }
  return (
    (estimatedTokenNetworkCost * (25_000n + desiredExcessCompensationBasisPoints)) /
    basisPoints
  )
}

export const reasonablePercentOnGasLimit = ({
  gasTipFee,
  estimatedTokenNetworkCost,
}: {
  gasTipFee: bigint | null
  estimatedTokenNetworkCost: bigint | null
}) => {
  return (
    (25_000n *
      ((oneEther + (gasTipFee ?? 0n)) * (estimatedTokenNetworkCost ?? 0n))) /
    (oneEther * basisPoints)
  )
}

export const reasonablePercentFee = ({
  reasonableFixedFee,
  amountAfterBridgeFee,
}: {
  reasonableFixedFee: bigint | null
  amountAfterBridgeFee: bigint | null
}) => {
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
}

export const interactingWithBridgeToken = ({
  assetLink,
  assetInAddress,
}: {
  assetLink: TokenBridgeInfo | null
  assetInAddress: string | null
}) => {
  const { toForeign, toHome } = assetLink || {}
  const { foreign } = toForeign || {}
  const { home } = toHome || {}
  if (!assetInAddress) return false
  return !!(
    (foreign && getAddress(foreign) === getAddress(assetInAddress)) ||
    (home && getAddress(home) === getAddress(assetInAddress))
  )
}

export const feeDirectorStructEncoded = ({
  recipient,
  bridgePathway,
  feeType,
  priceCorrective,
  gasTipFee,
  percentFee,
  feeTypeSettings,
  limit,
  assetOut,
}: {
  recipient: Hex | null
  feeType: FeeType
  priceCorrective: bigint | null
  gasTipFee: bigint | null
  percentFee: bigint | null
  feeTypeSettings: bigint
  limit: bigint
  bridgePathway: Pathway | null
  assetOut: Token | null
}) => {

  // const assetOut = this.assetOut
  // const bridgePathway = this.bridgePathway
  // const priceCorrective = this.priceCorrective.value
  // const feeType = this.feeType
  // const recipient = input.recipient.value
  // const gasTipFee = input.gasTipFee.value
  // const percentFee = input.percentFee.value
  // const feeTypeSettings = this.feeTypeSettings
  // const limit = this.limit
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
    multiplier = percentFee ?? 0n
  }
  if (!recipient || !isAddress(recipient)) {
    return null
  }
  return encodeAbiParameters(abis.feeDeliveryStruct, [
    [recipient, feeTypeSettings, limit, multiplier],
  ])
}

export const destinationDataParam = ({
  recipient,
  bridgePathway,
  assetIn,
  destinationRouter,
  feeDirectorStructEncoded,
  assetLink,
  shouldDeliver,
  unwrap,
}: {
  recipient: Hex | null
  bridgePathway: Pathway | null
  assetIn: Token | null
  destinationRouter: Hex | null
  feeDirectorStructEncoded: Hex | null
  assetLink: TokenBridgeInfo | null
  shouldDeliver: boolean
  unwrap: boolean
}) => {
  // const recipient = input.recipient.value
  if (!recipient) {
    return null
  }
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
  if (bridgePathway.requiresDelivery) {
    // going from home to foreign
    if (!shouldDeliver) {
      // act like a regular bridge
      return recipient
    }
    // going from foreign to home
    if (feeDirectorStructEncoded) {
      return concatHex([destinationRouter, feeDirectorStructEncoded])
    }
    return recipient
  }
  if (!unwrap) {
    return recipient
  }
  // unwrap wpls->pls
  return concatHex([destinationRouter, recipient])
}

/** converts a desired excess compensation basis point value into a percentage as an integer, with the denominator assumed to be 1e18 */
export const reasonablePercentOnTopOfGasFee = ({
  desiredExcessCompensationBasisPoints,
}: {
  desiredExcessCompensationBasisPoints: bigint
}) => {
  return (desiredExcessCompensationBasisPoints * (oneEther / basisPoints))
}

export const desiredCompensationRatio = ({
  desiredExcessCompensationBasisPoints,
}: {
  desiredExcessCompensationBasisPoints: bigint
}) => {
  return oneEther + (desiredExcessCompensationBasisPoints * oneEther) / basisPoints
}

export const availableCompensationMaximum = ({
  amountAfterBridgeFee,
  percentFee,
  feeType,
  fixedFee,
  limit,
}: {
  amountAfterBridgeFee: bigint | null
  percentFee: bigint | null
  feeType: FeeType
  fixedFee: bigint | null
  limit: bigint
}) => {
  if (feeType === FeeType.PERCENT) {
    if (amountAfterBridgeFee === null) return null
    return (amountAfterBridgeFee * (percentFee ?? 0n)) / oneEther
  } else if (feeType === FeeType.GAS_TIP) {
    return limit
  } else if (feeType === FeeType.FIXED) {
    return fixedFee ?? 0n
  }
  return 0n
}

/**
 * @param bridgePathway - the bridge pathway to use
 * @param assetIn - the asset in to bridge
 * @param recipient - the recipient of the bridge
 * @param account - the account to bridge from
 * @param assetLink - the asset link to use
 * @param destinationDataParam - the destination data param to use
 * @param amountToBridge - the amount to bridge
 * @param feeDirectorStructEncoded - the fee director struct encoded to use
 */
export const transactionInputs = ({
  bridgePathway,
  assetIn,
  recipient,
  account,
  assetLink,
  destinationDataParam,
  amountToBridge,
  feeDirectorStructEncoded,
  shouldDeliver,
}: {
  bridgePathway: Pathway | null
  assetIn: Token | null
  recipient: Hex | null
  account: Hex | null
  assetLink: TokenBridgeInfo | null
  destinationDataParam: Hex | null
  amountToBridge: bigint
  feeDirectorStructEncoded: Hex | null
  // interactingWithBridgeToken: boolean
  shouldDeliver: boolean
}) => {
  if (!bridgePathway) {
    console.log('no bridge pathway')
    return null
  }
  // check that recipient is valid
  if (
    !recipient ||
    !isAddress(recipient) ||
    account === zeroAddress
  ) {
    console.log('no recipient')
    return null
  }
  // check that wallet account is valid
  if (
    !account ||
    !isAddress(account) ||
    account === zeroAddress
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
  if (!assetLink) {
    console.log('no asset link')
    return null
  }
  let value = 0n
  // we are moving "from" this side, so we need to call a function on the "from" address
  // only relevant for the relayTokens(AndCall) pathway outside of native tokens
  let toAddress = bridgePathway.from
  let data = '0x' as Hex
  const inputIsBridgeToken = interactingWithBridgeToken({
    assetLink,
    assetInAddress: assetIn.address,
  })
  if (inputIsBridgeToken) {
    // when interacting with a bridged token, we need to call the token address directly
    toAddress = assetIn.address as Hex
    value = 0n
    // if we want delivery of the tokens (going from home to foreign) then we need to have the foreign data param
    // and it needs to start with the destination router
    if (!destinationDataParam) {
      return null
    }
    data = bridgePathway.usesExtraParam
      ? encodeFunctionData({
        abi: abis.erc677ExtraInput,
        functionName: 'transferAndCall',
        args: [
          bridgePathway.from,
          amountToBridge,
          destinationDataParam,
          account,
        ],
      })
      : encodeFunctionData({
        abi: abis.erc677,
        functionName: 'transferAndCall',
        args: [bridgePathway.from, amountToBridge, destinationDataParam],
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
            account,
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
          args: [recipient, account],
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
            account,
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
            account,
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
