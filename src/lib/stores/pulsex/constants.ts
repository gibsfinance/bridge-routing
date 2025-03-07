import { ChainId } from '@pulsex/chains'
import type { Address } from 'viem'
import { Percent } from '@pulsex/swap-sdk-core'

// = 1 << 23 or 100000000000000000000000
export const V1_FEE_PATH_PLACEHOLDER = 1
export const V2_FEE_PATH_PLACEHOLDER = 2

export const MSG_SENDER = '0x0000000000000000000000000000000000000001'
export const ADDRESS_THIS = '0x0000000000000000000000000000000000000002'

export const MIXED_ROUTE_QUOTER_ADDRESSES = {
  [ChainId.PULSECHAIN]: '0x9bFD17162271f995C0A5a2BD0b00C430bF4b2550',
  [ChainId.PULSECHAIN_TESTNET]: '0x0DE173Ad275e4dA52aBe829F3B5C62b812B64B48',
} as const satisfies Record<ChainId, Address>

export const ONE_HUNDRED_PERCENT = new Percent('1')
