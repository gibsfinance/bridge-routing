import { type Hex, getAddress } from 'viem'
import { imageRoot } from '$lib/config'

interface MinimalTokenInfo {
  chainId: number
  address: Hex
  logoURI?: string
}

export const list = (path: string) => {
  return `${imageRoot}/list${path}`
}

export const network = (chainId: number) => `${imageRoot}/image/${Number(chainId)}`

export const image = (t: MinimalTokenInfo) =>
  t.logoURI || `${network(t.chainId)}/${getAddress(t.address)}`

export const images = (sources: string[]) =>
  `${imageRoot}/image/?${sources.map((s) => `i=${s}`).join('&')}`
