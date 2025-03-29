import { ChainType, type Chain, type Token } from '@lifi/types'
import type { AppKitNetwork } from '@reown/appkit/networks'
import { defineChain } from '@reown/appkit/networks'

export type ChainNamespace = 'eip155' | 'solana' | 'polkadot' | 'bip122'

export interface ExtendedChain extends Chain {
  nativeToken: Token
  diamondAddress: string
  permit2?: string
  permit2Proxy?: string
}

export type AppKitSupportedChainTypes = Exclude<ChainType, ChainType.MVM>

export const ChainTypeSpaceMap: Record<AppKitSupportedChainTypes, ChainNamespace> = {
  [ChainType.EVM]: 'eip155',
  [ChainType.UTXO]: 'bip122',
  [ChainType.SVM]: 'solana',
}

export type ChainImages = Record<number, string>

export const chainToAppKitNetworks = (chains: ExtendedChain[]): AppKitNetwork[] =>
  chains.map((chain) =>
    defineChain({
      id: chain.id,
      blockExplorers: {
        default: {
          name: `${chain.name} explorer`,
          url: chain.metamask.blockExplorerUrls[0],
        },
      },
      name: chain.metamask.chainName,
      rpcUrls: {
        default: {
          http: chain.metamask.rpcUrls,
        },
      },
      nativeCurrency: chain.metamask.nativeCurrency,
      chainNamespace: ChainTypeSpaceMap[chain.chainType as AppKitSupportedChainTypes],
      caipNetworkId: `${ChainTypeSpaceMap[chain.chainType as AppKitSupportedChainTypes]}:${chain.id}`,
      assets: {
        imageId: `${ChainTypeSpaceMap[chain.chainType as AppKitSupportedChainTypes]}:${chain.id}`,
        imageUrl: chain.logoURI!,
      },
    }),
  )

export const getChainImagesConfig = (chains: ExtendedChain[]): ChainImages => {
  const chainImages: ChainImages = {}
  for (const chain of chains) {
    chainImages[chain.id] = chain.logoURI || ''
  }
  return chainImages
}
