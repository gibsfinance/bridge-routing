import { formatUnits } from "viem"
import type { chainsMetadata } from "./auth/constants"

export const humanReadableNumber = (num = 0n, decimals = 18) => {
  return num === 0n ? '0.0' : formatUnits(num, decimals)
}
export type Asset = {
  symbol: string
  name: string
  address: `0x${string}`
  decimals: number
  networkOrigination: keyof typeof chainsMetadata
}