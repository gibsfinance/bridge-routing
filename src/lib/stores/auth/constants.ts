import { mainnet, pulsechain } from 'viem/chains'
import type { ChainsMetadata } from './types'
import { Chains } from './types'

/**
 *
 */
export const chainsMetadata = {
	[Chains.PLS]: {
		...pulsechain,
		icon: 'https://pulsex-tokens.s3.eu-west-2.amazonaws.com/0xA1077a294dDE1B09bB078844df40758a5D0f9a27.png',
		alt: "a pink blue and purple hexagon with an ekg line running horizontally",
		rpcUrls: {
			default: {
				http: ['https://rpc-pulsechain.g4mm4.io'],
			},
		},
	},
	[Chains.ETH]: {
		...mainnet,
		icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
		alt: 'two pyramids joined on one side',
		rpcUrls: {
			default: {
				http: ['https://rpc-ethereum.g4mm4.io'],
			},
		},
	},
	// [Chains.OP]: optimism,
} as ChainsMetadata
