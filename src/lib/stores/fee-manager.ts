import * as viem from 'viem'
import { Chains } from './auth/types'

type Settings = {
  bridge: viem.Hex
  feeH2F: bigint
  feeF2H: bigint
}

export const feeManagerMapping = new Map<Chains, Map<Chains, Settings>>([
  [
    Chains.PLS,
    new Map<Chains, Settings>([
      [
        Chains.ETH,
        {
          bridge: '0xba86ca0aeca30247f9e2fd8736879997bcd01dc4',
          feeH2F: 0n,
          feeF2H: 0n,
        },
      ],
      [
        Chains.BNB,
        {
          bridge: '0xbb00578b4eb6a14081797463ec57ab00a973edba',
          feeH2F: 0n,
          feeF2H: 0n,
        },
      ],
    ]),
  ],
])
