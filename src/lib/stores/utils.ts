import { concatHex, formatUnits, getAddress, keccak256, parseUnits, type Hex } from 'viem'
import _ from 'lodash'

export const ellipsis = (v: string, { length = 8, prefixLength = 0 } = {}) =>
  length === (v.length - prefixLength) / 2
    ? v
    : `${v.slice(0, length + prefixLength)}...${v.slice(-length)}`

export const countDecimals = (v: string) => {
  if (!v) return 0
  const [, d] = v.split('.')
  return d ? d.length : 0
}

export const humanReadableDate = (date: Date) => {
  return date.toISOString().split('T').join(' ').slice(0, -5)
}

export const humanReadableNumber = (
  num = 0n,
  settings: {
    decimals?: number
    decimalCount?: number | null
    truncLen?: boolean
    maxDecimals?: number
  } = {},
) => {
  const { decimals = 18, decimalCount = null, truncLen = false, maxDecimals = decimals } = settings
  let n = num === 0n ? '0.0' : formatUnits(num, decimals)
  const len = truncLen ? Math.min(n.length, 20) : n.length
  n = n.slice(0, len)
  // this line should only be hit when non zero values are passed
  if (n[n.length - 1] === '.') {
    n = n.slice(0, n.length - 1)
  }
  if (decimalCount !== null) {
    const [i, d] = n.split('.')
    // console.log(i, d)
    if (d) {
      let dec = d
      if (dec.length < decimalCount) {
        dec = _.padEnd(dec, decimalCount, '0')
      }
      n = `${i}.${dec}`
    } else {
      n = i
    }
  }
  const [i, d] = n.split('.')
  if (d && d.length > maxDecimals) {
    n = `${i}.${d.slice(0, maxDecimals)}`
  }
  return numberWithCommas(n)
}

export const stripNonNumber = (n: string) => {
  return n
    .replace(/[^0-9.]/g, '')
    .split('.')
    .slice(0, 2)
    .join('.')
}

export const isZero = (n: string) => !n || !n.replace(/[0.]/g, '').length

export function numberWithCommas(x: string) {
  const parts = x.toString().split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

export const decimalValidation = (v: string, decimals = 18) => {
  if (!v) {
    return v
  }
  try {
    parseUnits(v, decimals)
  } catch {
    return
  }
  const split = v.split('.')
  if (split.length <= 2 && (split.length === 1 || split[1].length <= decimals)) {
    return v
  }
}

export const tokenToPair = _.memoize(
  (token0: Hex, token1: Hex, factory: Hex, initCodeHash: Hex) => {
    const tl0 = token0.toLowerCase()
    const tl1 = token1.toLowerCase()
    const [t0, t1] = tl0 < tl1 ? [token0, token1] : [token1, token0]
    // should check chain for these values in the future
    const input = concatHex(['0xff', factory, keccak256(concatHex([t0, t1])), initCodeHash])
    return [`0x${keccak256(input).slice(-40)}` as Hex, getAddress(t0), getAddress(t1)] as const
  },
  (token0, token1, factory, initCodeHash) =>
    `${token0}-${token1}-${factory}-${initCodeHash}`.toLowerCase(),
)

export const usd = {
  zeroUsdValue: '0.00',
  toCents(usdValueTokenAmount: bigint) {
    return usdValueTokenAmount
      ? humanReadableNumber(usdValueTokenAmount, { maxDecimals: 2 })
      : this.zeroUsdValue
  },
}
