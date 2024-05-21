import type { Chain } from 'viem/chains'

/**
 * Add here your chain id as hex, be sure to add your chain in the chainsMetadata object too
 */
export enum Chains {
	PLS = '0x171',
	ETH = '0x1',
	// OP = '0xa',
}

export type VisualChain = Chain & {
	icon: string;
	alt: string;
}

export type ChainsMetadata = Record<Chains, VisualChain>
