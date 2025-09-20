import type { Address } from 'viem'
import type { Currency, CurrencyAmount, Percent } from '@pulsex/sdk'

export enum PoolType {
  V1,
  V2,
  STABLE,
}

export interface BasePool {
  type: PoolType
}

export interface V1Pool extends BasePool {
  address: Address | ''
  type: PoolType.V1
  reserve0: CurrencyAmount<Currency>
  reserve1: CurrencyAmount<Currency>
}

export interface V2Pool extends BasePool {
  address: Address | ''
  type: PoolType.V2
  reserve0: CurrencyAmount<Currency>
  reserve1: CurrencyAmount<Currency>
}

export interface StablePool extends BasePool {
  address: Address
  type: PoolType.STABLE
  // Could be 2 token pool or more
  balances: CurrencyAmount<Currency>[]
  amplifier: bigint
  // Swap fee
  fee: Percent
}

export type Pool = V1Pool | V2Pool | StablePool

export interface WithTvl {
  tvlUSD: bigint
}

export type V1PoolWithTvl = V1Pool & WithTvl

export type V2PoolWithTvl = V2Pool & WithTvl

export type StablePoolWithTvl = StablePool & WithTvl
