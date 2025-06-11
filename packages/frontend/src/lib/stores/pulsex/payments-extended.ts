import { type Hex, type Address, encodeFunctionData } from 'viem'
import { type Percent, type Token, validateAndParseAddress } from '@pulsex/sdk'
import { type FeeOptions, Payments } from './payments'
import { peripheryPaymentsWithFeeExtendedAbi } from './abis/IPeripheryPaymentsWithFeeExtended'

function encodeFeeBips(fee: Percent): bigint {
  return fee.multiply(10_000).quotient
}

export abstract class PaymentsExtended {
  public static ABI = peripheryPaymentsWithFeeExtendedAbi

  public static encodeUnwrapWETH9(
    amountMinimum: bigint,
    recipient?: Address,
    feeOptions?: FeeOptions,
  ): Hex {
    // if there's a recipient, just pass it along
    if (typeof recipient === 'string') {
      return Payments.encodeUnwrapWETH9(amountMinimum, recipient, feeOptions) as Hex
    }

    // eslint-disable-next-line no-extra-boolean-cast
    if (!!feeOptions) {
      const feeBips = encodeFeeBips(feeOptions.fee)
      const feeRecipient = validateAndParseAddress(feeOptions.recipient)

      return encodeFunctionData({
        abi: PaymentsExtended.ABI,
        functionName: 'unwrapWETH9WithFee',
        args: [amountMinimum, feeBips, feeRecipient],
      })
    }

    return encodeFunctionData({
      abi: PaymentsExtended.ABI,
      functionName: 'unwrapWETH9',
      args: [amountMinimum],
    })
  }

  public static encodeSweepToken(
    token: Token,
    amountMinimum: bigint,
    recipient?: Address,
    feeOptions?: FeeOptions,
  ): Hex {
    // if there's a recipient, just pass it along
    if (typeof recipient === 'string') {
      return Payments.encodeSweepToken(token, amountMinimum, recipient, feeOptions) as Hex
    }

    // eslint-disable-next-line no-extra-boolean-cast
    if (!!feeOptions) {
      const feeBips = encodeFeeBips(feeOptions.fee)
      const feeRecipient = validateAndParseAddress(feeOptions.recipient)

      return encodeFunctionData({
        abi: PaymentsExtended.ABI,
        functionName: 'sweepTokenWithFee',
        args: [token.address, amountMinimum, feeBips, feeRecipient],
      })
    }

    return encodeFunctionData({
      abi: PaymentsExtended.ABI,
      functionName: 'sweepToken',
      args: [token.address, amountMinimum],
    })
  }

  public static encodePull(token: Token, amount: bigint): Hex {
    return encodeFunctionData({
      abi: PaymentsExtended.ABI,
      functionName: 'pull',
      args: [token.address, amount],
    })
  }

  public static encodeWrapETH(amount: bigint): Hex {
    return encodeFunctionData({
      abi: PaymentsExtended.ABI,
      functionName: 'wrapETH',
      args: [amount],
    })
  }
}
