import { padEnd } from 'lodash'
import { formatUnits, parseUnits } from 'viem'

export const countDecimals = (v: string) => {
  if (!v) return 0
  const [, d] = v.split('.')
  return d ? d.length : 0
}

export const humanReadableNumber = (num = 0n, decimals = 18, decimalCount: null | number = null) => {
  let n = num === 0n ? '0.0' : formatUnits(num, decimals)
  const len = Math.min(n.length, 20)
  n = n.slice(0, len)
  // this line should only be hit when non zero values are passed
  if (n[n.length - 1] === '.') {
    n = n.slice(0, n.length - 1)
  }
  if (decimalCount !== null) {
    let [i, d] = n.split('.')
    if (d) {
      if (d.length < decimalCount) {
        d = padEnd(d, decimalCount, '0')
      }
      n = `${i}.${d}`
    } else {
      n = i
    }
  }
  return numberWithCommas(n)
}

export const stripNonNumber = (n: string) => {
  return n.replace(/[^0-9.]/g, '').split('.').slice(0, 2).join('.')
}

export const isZero = (n: string) => (
  !n || !n.replace(/[0.]/g, '').length
)

export function numberWithCommas(x: string) {
  var parts = x.toString().split(".")
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  return parts.join(".")
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
