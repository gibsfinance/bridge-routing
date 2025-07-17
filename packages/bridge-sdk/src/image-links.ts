import { getAddress } from 'viem'

let imageRoot = 'https://gib.show'

/**
 * Sets the image root for the bridge
 * @param root - the root
 */
export const setImageRoot = (root: string) => {
  imageRoot = root
}

/**
 * Returns the image root for the bridge
 * @returns the image root
 */
export const getImageRoot = () => imageRoot

/** The minimal token info */
interface MinimalTokenInfo {
  chainId: number
  address: string
  logoURI?: string | null
}

/**
 * Returns the list image for the given path
 * @param path - the path
 * @returns the list image
 */
export const list = (path: string) => {
  return `${imageRoot}/list${path}`
}

/**
 * Returns the network image for the given chain id
 * @param chainId - the chain id
 * @returns the network image
 */
export const network = (chainId: number) => {
  if (!chainId) {
    console.trace('network image')
  }
  return `${imageRoot}/image/${Number(chainId)}`
}

/**
 * Returns the image url for the given token info
 * @param t - the token info
 * @returns the image url
 */
export const image = (t: MinimalTokenInfo) =>
  t.logoURI || `${network(t.chainId)}/${getAddress(t.address)}`

/**
 * Returns a url that will lookup all sources for the given array
 * @param sources - the sources
 * @returns the images
 */
export const images = (sources: string[]) =>
  `${imageRoot}/image/?${sources.map((s) => `i=${s}`).join('&')}`
