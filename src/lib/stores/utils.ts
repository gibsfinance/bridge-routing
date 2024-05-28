import { formatUnits, parseUnits, type Hex } from 'viem'
import type { chainsMetadata } from './auth/constants'

export const humanReadableNumber = (num = 0n, decimals = 18) => {
  return num === 0n ? '0.0' : formatUnits(num, decimals)
}
export type Asset = {
  symbol: string
  name: string
  address: Hex
  decimals: number
  networkOrigination: keyof typeof chainsMetadata
}

export const decimalValidation = (v: string, decimals = 18) => {
  if (!v) {
    return v
  }
  try {
    parseUnits(v, decimals)
  } catch (err) {
    return
  }
  const split = v.split('.')
  if (split.length <= 2 && (split.length === 1 || split[1].length <= decimals)) {
    return v
  }
}
