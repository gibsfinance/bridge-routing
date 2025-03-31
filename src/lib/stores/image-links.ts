import { getAddress } from 'viem'
import { imageRoot } from '$lib/config'

interface MinimalTokenInfo {
  chainId: number
  address: string
  logoURI?: string | null
}

export const list = (path: string) => {
  return `${imageRoot}/list${path}`
}

export const network = (chainId: number) => {
  if (!chainId) {
    console.trace('network image')
  }
  return `${imageRoot}/image/${Number(chainId)}`
}

export const image = (t: MinimalTokenInfo) =>
  t.logoURI || `${network(t.chainId)}/${getAddress(t.address)}`

export const images = (sources: string[]) =>
  `${imageRoot}/image/?${sources.map((s) => `i=${s}`).join('&')}`
