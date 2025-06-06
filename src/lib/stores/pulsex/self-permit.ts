import { type BigintIsh, type Token } from '@pulsex/swap-sdk-core'
import { type Hash, encodeFunctionData } from 'viem'
import { selfPermitABI } from './abis/SelfPermit'

export interface StandardPermitArguments {
  v: 0 | 1 | 27 | 28
  r: Hash
  s: Hash
  amount: BigintIsh
  deadline: BigintIsh
}

export interface AllowedPermitArguments {
  v: 0 | 1 | 27 | 28
  r: Hash
  s: Hash
  nonce: BigintIsh
  expiry: BigintIsh
}

export type PermitOptions = StandardPermitArguments | AllowedPermitArguments

function isAllowedPermit(permitOptions: PermitOptions): permitOptions is AllowedPermitArguments {
  return 'nonce' in permitOptions
}

export abstract class SelfPermit {
  public static ABI = selfPermitABI

  /**
   * Cannot be constructed.
   */
  private constructor() {}

  public static encodePermit(token: Token, options: PermitOptions) {
    return isAllowedPermit(options)
      ? encodeFunctionData({
          abi: SelfPermit.ABI,
          functionName: 'selfPermitAllowed',
          args: [
            token.address,
            BigInt(options.nonce),
            BigInt(options.expiry),
            options.v,
            options.r,
            options.s,
          ],
        })
      : encodeFunctionData({
          abi: SelfPermit.ABI,
          functionName: 'selfPermit',
          args: [
            token.address,
            BigInt(options.amount),
            BigInt(options.deadline),
            options.v,
            options.r,
            options.s,
          ],
        })
  }
}
