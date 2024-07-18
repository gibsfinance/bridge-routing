import * as viem from 'viem'
import { imageRoot } from "$lib/config"

export const list = (path: string) => {
  return `${imageRoot}/list${path}`
}

interface MinimalTokenInfo {
  chainId: number;
  address: viem.Hex;
  logoURI?: string;
}

export const image = (t: MinimalTokenInfo) => (
  t.logoURI ||
  `${network(t.chainId)}/${viem.getAddress(t.address)}`
)

export const network = (chainId: number) => (
  `${imageRoot}/image/${Number(chainId)}`
)
