import { concatHex, encodeAbiParameters, encodeFunctionData, getAddress, type Hex, isAddress, zeroAddress } from "viem";
import { Chains, isNative, nativeAssetOut, type Pathway, pathway } from "./config.js";
import { FeeType } from "./fee-type.js";
import type { BridgeKey, Token } from "./types.js";
import type { TokenBridgeInfo } from "./chain-info.js";
import * as abis from "./abis.js";

export const oneEther = 10n ** 18n

export const basisPoints = 10_000n

/**
 * Returns the bridge pathway (configuration) for a given bridge key, asset in, and whether to use the production pathway
 * @param bridgeKey - the bridge key to use
 * @param isProd - whether to use the production pathway
 * @param assetIn - the asset in to bridge
 * @returns the bridge pathway
 */
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

/**
 * Retrieves the amount to bridge from the amount and asset in. If either of them is nil, returns 0n
 * @param amountIn - the amount to bridge
 * @param assetIn - the asset in to bridge
 * @returns the amount to bridge
 */
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

/**
 * Calculates the bridge cost from the amount to bridge and bridge fee
 * @param amountToBridge - the amount to bridge
 * @param bridgeFee - the bridge fee
 * @returns the bridge cost
 */
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

/**
 * Calculates the amount after bridge fee from the amount to bridge and bridge cost
 * @param amountToBridge - the amount to bridge
 * @param bridgeCost - the bridge cost
 * @returns the amount after bridge fee
 */
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

/**
 * Calculates the estimated amount out from the amount after bridge fee and fee
 * @param amountAfterBridgeFee - the amount after bridge fee
 * @param fee - the fee
 * @returns the estimated amount out
 */
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

/**
 * Calculates the estimated fee from the amount after bridge fee, fee, percent fee, fee type, limit, and whether to deliver the costs
 * @param amountAfterBridgeFee - the amount after bridge fee
 * @param fee - the fee
 * @param percentFee - the percent fee
 * @param feeType - the fee type
 * @param limit - the limit
 * @param costsToDeliver - whether to deliver the costs
 * @returns the estimated fee
 */
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

/**
 * Calculates the estimated native network cost from the estimated gas and latest base fee per gas
 * @param estimatedGas - the estimated gas
 * @param latestBaseFeePerGas - the latest base fee per gas
 * @param requiresDelivery - whether to deliver the costs
 * @returns the estimated native network cost
 */
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

/**
 * Calculates the estimated token network cost from the estimated native
 * network cost, price corrective, decimals, and one token int
 * @param estimatedNativeNetworkCost - the estimated native network cost
 * @param priceCorrective - the price corrective
 * @param decimals - the decimals
 * @param oneTokenInt - the one token int
 * @returns the estimated token network cost
 */
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

/**
 * Calculates one token of the asset in as an int
 * @param assetIn - the asset in to bridge
 * @returns the one token int
 */
export const oneTokenInt = ({
  assetIn,
}: {
  assetIn: Token | null
}) => {
  if (!assetIn) return 1n
  return 10n ** BigInt(assetIn.decimals)
}

/**
 * Returns the limit as a bigint. Nil uses 0n
 * @param lim - the limit
 * @returns the limit
 */
export const limit = (lim: bigint | null) => {
  if (!lim) {
    return 0n
  }
  return lim
}

/**
 * Returns the network switch asset out address from the asset out, unwrap, and to chain
 * @param assetOut - the asset out
 * @param unwrap - whether to unwrap
 * @param toChain - the chain to switch to
 * @returns the network switch asset out address
 */
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

/**
 * Calculates the desired excess compensation basis points from the path, asset in, asset out, bridge key, fee type, list, and asset out address
 * @param path - the path
 * @param assetIn - the asset in to bridge
 * @param assetOut - the asset out
 * @param bridgeKey - the bridge key
 * @param feeType - the fee type
 * @param list - the list
 * @param assetOutAddress - the asset out address
 * @returns the desired excess compensation basis points
 */
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

/**
 * Calculates the estimated cost from the should deliver, amount after bridge fee, percent fee,
 * estimated token network cost, reasonable percent on top of gas fee, and fee type
 * @param shouldDeliver - whether to deliver the costs
 * @param amountAfterBridgeFee - the amount after bridge fee
 * @param percentFee - the percent fee
 * @param estimatedTokenNetworkCost - the estimated token network cost
 * @param reasonablePercentOnTopOfGasFee - the reasonable percent on top of gas fee
 * @param feeType - the fee type
 * @returns the estimated cost
 */
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

/**
 * Calculates the reasonable fixed fee from the estimated token network cost and desired excess compensation basis points
 * @param estimatedTokenNetworkCost - the estimated token network cost
 * @param desiredExcessCompensationBasisPoints - the desired excess compensation basis points
 * @returns the reasonable fixed fee
 */
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

/**
 * Calculates the reasonable percent on gas limit from the gas tip fee and estimated token network cost
 * @param gasTipFee - the gas tip fee
 * @param estimatedTokenNetworkCost - the estimated token network cost
 * @returns the reasonable percent on gas limit
 */
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

/**
 * Calculates the reasonable percent fee from the reasonable fixed fee and amount after bridge fee
 * @param reasonableFixedFee - the reasonable fixed fee
 * @param amountAfterBridgeFee - the amount after bridge fee
 * @returns the reasonable percent fee
 */
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

/**
 * Returns whether the asset in address is interacting with a bridge token
 * @param assetLink - the asset link
 * @param assetInAddress - the asset in address
 * @returns whether the asset in address is interacting with a bridge token
 */
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

/**
 * Calculates the fee director struct encoded from the recipient, bridge pathway, fee type, price corrective, gas tip fee, percent fee, fee type settings, limit, and asset out
 * @param recipient - the recipient
 * @param bridgePathway - the bridge pathway
 * @param feeType - the fee type
 * @param priceCorrective - the price corrective
 * @param gasTipFee - the gas tip fee
 * @param percentFee - the percent fee
 * @param feeTypeSettings - the fee type settings
 * @param limit - the limit
 * @param assetOut - the asset out
 * @returns the fee director struct encoded
 */
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

/**
 * Calculates the destination data param from the recipient, bridge pathway, asset in, destination router, fee director struct encoded, asset link, should deliver, and unwrap
 * @param recipient - the recipient
 * @param bridgePathway - the bridge pathway
 * @param assetIn - the asset in to bridge
 * @param destinationRouter - the destination router
 * @param feeDirectorStructEncoded - the fee director struct encoded
 * @param assetLink - the asset link
 * @param shouldDeliver - whether to deliver the costs
 * @param unwrap - whether to unwrap
 * @returns the destination data param
 */
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

/**
 * Converts a desired excess compensation basis point value into a percentage as an integer, with the denominator assumed to be 1e18
 * @param desiredExcessCompensationBasisPoints - the desired excess compensation basis points
 * @returns the reasonable percent on top of gas fee
 */
export const reasonablePercentOnTopOfGasFee = ({
  desiredExcessCompensationBasisPoints,
}: {
  desiredExcessCompensationBasisPoints: bigint
}) => {
  return (desiredExcessCompensationBasisPoints * (oneEther / basisPoints))
}

/**
 * Calculates the desired compensation ratio from the desired excess compensation basis points
 * @param desiredExcessCompensationBasisPoints - the desired excess compensation basis points
 * @returns the desired compensation ratio
 */
export const desiredCompensationRatio = ({
  desiredExcessCompensationBasisPoints,
}: {
  desiredExcessCompensationBasisPoints: bigint
}) => {
  return oneEther + (desiredExcessCompensationBasisPoints * oneEther) / basisPoints
}

/**
 * Calculates the available compensation maximum from the amount after bridge fee, percent fee, fee type, fixed fee, and limit
 * @param amountAfterBridgeFee - the amount after bridge fee
 * @param percentFee - the percent fee
 * @param feeType - the fee type
 * @param fixedFee - the fixed fee
 * @param limit - the limit
 * @returns the available compensation maximum
 */
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
 * Determines if the bridge is undercompensated based on network costs vs compensation limit using desired compensation rate
 * @param estimatedTokenNetworkCost - the estimated token network cost
 * @param feeType - the fee type
 * @param limit - the maximum compensation limit
 * @param amountAfterBridgeFee - the amount after bridge fee
 * @param desiredExcessCompensationBasisPoints - the desired excess compensation basis points
 * @returns whether the bridge is undercompensated
 */
export const isUndercompensated = ({
  estimatedTokenNetworkCost,
  feeType,
  limit,
  amountAfterBridgeFee,
  desiredExcessCompensationBasisPoints,
}: {
  estimatedTokenNetworkCost: bigint | null
  feeType: FeeType
  limit: bigint
  amountAfterBridgeFee: bigint | null
  desiredExcessCompensationBasisPoints: bigint
}) => {
  // No undercompensation if no amount to bridge
  if (!amountAfterBridgeFee || amountAfterBridgeFee <= 0n) {
    return false
  }

  // GAS_TIP fee type doesn't have undercompensation issues
  if (feeType === FeeType.GAS_TIP) {
    return false
  }

  // No network cost estimate means we can't determine undercompensation
  if (!estimatedTokenNetworkCost) {
    return false
  }

  // Calculate desired compensation using the actual desired compensation ratio
  const desiredCompensationRatio = oneEther + (desiredExcessCompensationBasisPoints * oneEther) / basisPoints
  const desiredCompensationForNetworkCost = (estimatedTokenNetworkCost * desiredCompensationRatio) / oneEther

  // Undercompensated if desired compensation exceeds the limit
  return desiredCompensationForNetworkCost > limit
}

/**
 * Calculates the transaction inputs from the bridge pathway, asset in, recipient, account, asset link, destination data param, amount to bridge, fee director struct encoded, and should deliver
 * @param bridgePathway - the bridge pathway to use
 * @param assetIn - the asset in to bridge
 * @param recipient - the recipient of the bridge
 * @param account - the account to bridge from
 * @param assetLink - the asset link to use
 * @param destinationDataParam - the destination data param to use
 * @param amountToBridge - the amount to bridge
 * @param feeDirectorStructEncoded - the fee director struct encoded to use
 * @param shouldDeliver - whether to deliver the tokens to the recipient
 * @returns the transaction inputs
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

/**
 * Calculates the asset out key from the bridge key path, asset in address, and unwrap
 * @param bridgeKeyPath - the bridge key path
 * @param assetInAddress - the asset in address
 * @param unwrap - whether to unwrap
 * @returns the asset out key
 */
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

/**
 * Returns the asset out from the asset in address, assets out, bridge key path, and unwrap
 * @param assetInAddress - the asset in address
 * @param assetsOut - the assets out
 * @param bridgeKeyPath - the bridge key path
 * @param unwrap - whether to unwrap
 * @returns the asset out
 */
export const assetOut = ({
  assetInAddress,
  assetsOut,
  bridgeKeyPath,
  unwrap,
}: {
  assetInAddress: Hex | null
  assetsOut: Map<string, Token>
  bridgeKeyPath: string
  unwrap: boolean
}) => {
  if (!assetInAddress) return null
  const key = assetOutKey({
    bridgeKeyPath,
    assetInAddress,
    unwrap,
  })
  if (!key) return null
  return assetsOut.get(key) ?? null
}
