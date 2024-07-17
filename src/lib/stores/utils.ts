import { formatUnits, parseUnits, type Hex } from 'viem'

export const humanReadableNumber = (num = 0n, decimals = 18) => {
  return num === 0n ? '0.0' : formatUnits(num, decimals)
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
