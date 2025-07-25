# Bridge SDK

A comprehensive toolkit for facilitating cross-chain bridge operations across multiple blockchain networks. This SDK provides low-level building blocks for implementing bridge functionality in decentralized applications.

## 🎯 Use Cases

### Primary Use Cases
- **Cross-Chain Bridge Implementation**: Build applications that move tokens between different blockchain networks
- **Multi-Chain DApp Development**: Create applications that operate across PulseChain, Ethereum, Binance Smart Chain, and other supported networks
- **Bridge Provider Integration**: Integrate with multiple bridge providers (PulseChain native bridges, TokenSex, etc.)
- **Token Metadata Management**: Access standardized token information, logos, and network-specific addresses
- **Fee Calculation**: Calculate and manage bridge fees across different providers and networks

### Target Applications
- Cross-chain DEX interfaces
- Bridge aggregator platforms
- Multi-chain portfolio management tools
- DeFi applications requiring cross-chain functionality
- Wallet applications with bridge features

## 🔧 Core Functionality

### Chain Management
- **Supported Networks**: PulseChain (0x171), Ethereum (0x1), Binance Smart Chain (0x38), and testnets
- **Chain Metadata**: Complete chain configurations including RPC URLs, native tokens, and visual assets
- **Chain Utilities**: Convert between chain IDs and human-readable chain keys

### Token & Bridge Configuration
- **Token Types**: Standardized token metadata with cross-chain bridge information
- **Bridge Providers**: Support for multiple bridge providers with different fee structures
- **Asset Mapping**: Native asset addresses and wrapped token configurations across chains

### Smart Contract Integration
- **ABIs**: Pre-configured contract ABIs for bridge operations
- **Contract Addresses**: Deployed contract addresses across supported networks
- **Type Safety**: Full TypeScript support with strongly typed contract interactions

## 📦 Installation

```sh
npm install @gibs/bridge-sdk
# or
yarn add @gibs/bridge-sdk
```

## 📖 API Examples

### Types (`@gibs/bridge-sdk/types`)

```typescript
import type {
  Token,
  BridgeKey,
  TokenList,
  TokenOut,
  PerNetworkBridgeLink,
  Extensions,
  TokenMetadata,
  VisualChain
} from '@gibs/bridge-sdk/types'

// Core token metadata
const tokenMetadata: TokenMetadata = {
  name: "Wrapped Ethereum",
  symbol: "WETH",
  decimals: 18
}

// Bridge link information
const bridgeLink: PerNetworkBridgeLink = {
  tokenAddress: "0x..." // Address on destination chain
}

// Token extensions for cross-chain info
const extensions: Extensions = {
  wrapped: { address: "0x..." },
  bridgeInfo: {
    369: { tokenAddress: "0x..." } // PulseChain mapping
  }
}

// Complete token with bridge metadata
const token: Token = {
  ...tokenMetadata,
  address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  chainId: 1,
  logoURI: "https://example.com/weth.png",
  extensions
}

// Token for output (address can be null)
const tokenOut: TokenOut = {
  ...tokenMetadata,
  address: null, // Can be null for native tokens
  chainId: 369,
  logoURI: null
}

// Bridge route definition
const bridgeKey: BridgeKey = [
  'pulsechain',  // Provider
  '0x1',        // From chain (Ethereum)
  '0x171'       // To chain (PulseChain)
]

// Visual chain with logo info
const visualChain: VisualChain = {
  id: 369,
  name: 'PulseChain',
  chainId: '0x171' as any,
  logoURI: 'https://example.com/pls.png',
  alt: 'PulseChain logo'
  // ... other Chain properties
}
```

### Config (`@gibs/bridge-sdk/config`)

```typescript
import {
  Chains,
  Provider,
  toChain,
  toChainKey,
  pathways,
  validBridgeKeys,
  inferBridgeKey,
  pathway,
  isNative,
  canChangeUnwrap,
  defaultAssetIn
} from '@gibs/bridge-sdk/config'

// Chain enum usage
console.log(Chains.PLS)    // "0x171"
console.log(Chains.ETH)    // "0x1"

// Provider enum usage
console.log(Provider.PULSECHAIN) // "pulsechain"

// Convert numeric chain ID to hex
const chainHex = toChain(369)     // "0x171"
const chainHex2 = toChain("369")  // "0x171"

// Convert chain ID to human-readable key
const chainKey = toChainKey(369)  // "PLS"

// Get all valid bridge routes for environment
const bridgeRoutes = validBridgeKeys(true) // Production routes
const testRoutes = validBridgeKeys(false)  // Include testnets

// Find bridge provider for chain pair
const bridgeKey = inferBridgeKey({
  fromChain: Chains.ETH,
  toChain: Chains.PLS,
  isProd: true
}) // Returns: ['pulsechain', '0x1', '0x171']

// Get pathway configuration for a bridge route
const pathwayConfig = pathway(['pulsechain', '0x1', '0x171'], true)
console.log(pathwayConfig?.from)      // Bridge contract on Ethereum
console.log(pathwayConfig?.to)        // Bridge contract on PulseChain

// Check if token is native to chain
const native = isNative(token, bridgeKey) // boolean

// Check if unwrapping is allowed
const canUnwrap = canChangeUnwrap(bridgeKey, token) // boolean

// Get default asset for bridge route
const defaultToken = defaultAssetIn(bridgeKey, true) // Default token address
```

```typescript
import {
  nativeAssetOut,
  nativeTokenSymbol,
  nativeTokenName,
  uniV2Routers
} from '@gibs/bridge-sdk/config'

// Get native wrapped token address for a chain
const wethAddress = nativeAssetOut[Chains.ETH] // "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
const wplsAddress = nativeAssetOut[Chains.PLS] // "0xA1077a294dDE1B09bB078844df40758a5D0f9a27"

// Get native token symbols and names
const ethSymbol = nativeTokenSymbol[Chains.ETH] // "ETH"
const plsName = nativeTokenName[Chains.PLS]     // "Pulse"

// Get UniV2 router addresses for chain
const plsRouters = uniV2Routers[Chains.PLS] // Array of router addresses
```

### Settings (`@gibs/bridge-sdk/settings`)

```typescript
import {
  oneEther,
  basisPoints,
  bridgePathway,
  amountToBridge,
  bridgeCost,
  estimatedAmountOut,
  estimatedFee,
  oneTokenInt,
  assetOutKey,
  assetOut
} from '@gibs/bridge-sdk/settings'

// Common constants
console.log(oneEther)    // 1000000000000000000n (1e18)
console.log(basisPoints) // 10000n

// Calculate actual amount to bridge
const amount = amountToBridge({
  amountIn: 1000000000000000000n, // 1 ETH
  assetIn: token,
}) // Returns 1000000000000000000n or 0n if invalid

// Calculate bridge cost
const cost = bridgeCost({
  bridgeKey: ['pulsechain', '0x1', '0x171'],
  amountIn: oneEther,
  // ... other parameters
})

// Estimate output amount after fees
const outputAmount = estimatedAmountOut({
  amountIn: oneEther,
  bridgeKey: ['pulsechain', '0x1', '0x171'],
  // ... fee parameters
})

// Calculate fee amount
const feeAmount = estimatedFee({
  amountIn: oneEther,
  feeType: 'percent',
  // ... other parameters
})

// Convert amount to "one token" representation
const oneToken = oneTokenInt({
  decimals: 18,
  amount: oneEther
}) // 1000000000000000000n

// Generate asset out key for caching
const cacheKey = assetOutKey({
  bridgeKey: ['pulsechain', '0x1', '0x171'],
  assetIn: token
}) // String key for asset lookup

// Get output asset configuration
const outputAsset = assetOut({
  bridgeKey: ['pulsechain', '0x1', '0x171'],
  assetIn: token,
  // ... other parameters
})
```

### Chain Info (`@gibs/bridge-sdk/chain-info`)

```typescript
import {
  loadBridgeFees,
  nativeSymbol,
  tokenBridgeInfo,
  fetchPriceCorrective,
  minBridgeAmountIn,
  chainMulticall
} from '@gibs/bridge-sdk/chain-info'

// Load bridge fees for a route
const fees = await loadBridgeFees({
  pathway: pathwayConfig,
  fromChainClient: ethClient,
  toChainClient: plsClient
})

// Get native symbol for token, with unwrap logic
const symbol = nativeSymbol(token, false) // "WETH" or "ETH" if unwrapped

// Get token bridge information
const bridgeInfo = await tokenBridgeInfo({
  bridgeKey: ['pulsechain', '0x1', '0x171'],
  client: ethClient,
  target: token.address,
  // ... other parameters
})

// Fetch price corrective data
const priceData = fetchPriceCorrective({
  bridgeKey: ['pulsechain', '0x1', '0x171'],
  // ... other parameters
})

// Get minimum bridge amount
const minAmount = await minBridgeAmountIn({
  bridgeKey: ['pulsechain', '0x1', '0x171'],
  client: ethClient,
  // ... other parameters
})

// Create multicall helper for chain
const multicall = chainMulticall(ethClient)
// Use for batched contract calls
```

### Image Links (`@gibs/bridge-sdk/image-links`)

```typescript
import * as imageLinks from '@gibs/bridge-sdk/image-links'

// Configure image root URL
imageLinks.setImageRoot('https://cdn.example.com/images/')
const currentRoot = imageLinks.getImageRoot() // Current root URL

// Get network image URL
const networkImage = imageLinks.network(1)    // Ethereum logo URL
const plsImage = imageLinks.network(369)      // PulseChain logo URL

// Get single token image
const tokenImage = imageLinks.image({
  chainId: 1,
  address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
})

// Get token images for multiple sources
const tokenImages = imageLinks.images([
  "1/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH on Ethereum
  "369/0xA1077a294dDE1B09bB078844df40758a5D0f9a27"  // WPLS on PulseChain
])

// List available images in a directory
const availableImages = imageLinks.list('tokens/') // Array of image paths
```

### ABIs (`@gibs/bridge-sdk/abis`)

```typescript
import * as abis from '@gibs/bridge-sdk/abis'

// Bridge contract ABIs
const inputBridgeAbi = abis.inputBridge         // Input bridge contract
const outputBridgeAbi = abis.outputBridge       // Output bridge contract
const outputRouterAbi = abis.outputRouter       // Output router contract

// Token contract ABIs
const erc677Abi = abis.erc677                   // ERC677 token contract
const erc677ExtraAbi = abis.erc677ExtraInput    // With extra input functions

// Router and fee ABIs
const nativeRouterAbi = abis.nativeRouter       // Native token router
const feeManagerAbi = abis.feeManager           // Fee management contract
const univ2RouterAbi = abis.univ2Router         // UniswapV2 router

// Utility ABIs and types
const feeDeliveryStruct = abis.feeDeliveryStruct // Fee delivery struct ABI
const homeAmbAbi = abis.homeAmb                  // Home AMB contract
const pairAbi = abis.pair                        // Pair contract

// Use with viem contract calls
const contract = getContract({
  address: bridgeAddress,
  abi: inputBridgeAbi,
  client: publicClient
})

const bridgeFunction = contract.read.someFunction()
```

### Fee Types (`@gibs/bridge-sdk/fee-type`)

```typescript
import { FeeType, feeTypeValToKeyMap, type FeeTypeKeys } from '@gibs/bridge-sdk/fee-type'

// Fee type enum
console.log(FeeType.PERCENT)  // "%"
console.log(FeeType.GAS_TIP)  // "gas+%"
console.log(FeeType.FIXED)    // "fixed"

// Fee type keys
const percentKey: FeeTypeKeys = 'PERCENT'
const gasTipKey: FeeTypeKeys = 'GAS_TIP'

// Convert fee type value back to key
const feeTypeKey = feeTypeValToKeyMap.get('%') // "PERCENT"
const gasKey = feeTypeValToKeyMap.get('gas+%') // "GAS_TIP"
```

### Chains (`@gibs/bridge-sdk/chains`)

```typescript
import { chainsMetadata } from '@gibs/bridge-sdk/chains'
import { Chains } from '@gibs/bridge-sdk/config'

// Get complete chain configuration
const pulseChain = chainsMetadata[Chains.PLS]
console.log(pulseChain.name)        // "PulseChain"
console.log(pulseChain.chainId)     // "0x171"
console.log(pulseChain.logoURI)     // Chain logo URL
console.log(pulseChain.rpcUrls.default.http[0]) // Default RPC URL

// Access native currency info
console.log(pulseChain.nativeCurrency.name)     // "Pulse"
console.log(pulseChain.nativeCurrency.symbol)   // "PLS"
console.log(pulseChain.nativeCurrency.decimals) // 18

// Access contract addresses
console.log(pulseChain.contracts?.multicall3?.address) // Multicall3 address
console.log(pulseChain.contracts?.ensRegistry?.address) // ENS registry if available
```

## 📋 API Reference

### Exports

| Export Path | Description |
|-------------|-------------|
| `@gibs/bridge-sdk` | Main entry point with all exports |
| `@gibs/bridge-sdk/types` | TypeScript type definitions |
| `@gibs/bridge-sdk/config` | Chain IDs, providers, and core configuration |
| `@gibs/bridge-sdk/chains` | Chain metadata and network configurations |
| `@gibs/bridge-sdk/abis` | Smart contract ABIs |
| `@gibs/bridge-sdk/image-links` | Network and token image utilities |
| `@gibs/bridge-sdk/fee-type` | Fee calculation types and utilities |
| `@gibs/bridge-sdk/settings` | Bridge settings and configuration |
| `@gibs/bridge-sdk/chain-info` | Chain-specific bridge information |

### Key Types

```typescript
// Core chain identifier
enum Chains {
  PLS = '0x171',     // PulseChain
  ETH = '0x1',       // Ethereum
  BNB = '0x38',      // Binance Smart Chain
  SEP = '0xaa36a7',  // Sepolia Testnet
  V4PLS = '0x3af'    // PulseChain V4 Testnet
}

// Bridge providers
enum Provider {
  PULSECHAIN = 'pulsechain',
  TOKENSEX = 'tokensex'
}

// Bridge route: [Provider, FromChain, ToChain]
type BridgeKey = [Provider, Chains, Chains]

// Token with bridge metadata
interface Token {
  name: string
  symbol: string
  decimals: number
  address: string
  chainId: number
  logoURI: string | null
  extensions?: {
    wrapped?: { address: Hex }
    bridgeInfo?: Record<number, PerNetworkBridgeLink>
  }
}
```

## ⚠️ Important Notes

- **Beta Stage**: This SDK is in active development. APIs may change between versions.
- **Version Sync**: All packages in this monorepo maintain synchronized versions.
- **Low-Level Tools**: These are building blocks that require careful integration.
- **Dependencies**: Built on top of `@gibs/common` utilities and `viem` for Ethereum interactions.

## 🔗 Dependencies

- `@gibs/common`: Shared utilities for RPC clients, caching, and ERC20 operations
- `viem`: Type-safe Ethereum library for contract interactions
- `lodash`: Utility functions for data manipulation

## 📝 Development Status

This package is actively maintained and used in production bridge applications. However, as it's in beta:

- APIs may change in minor version updates
- New bridge providers and chains are regularly added
- Breaking changes will be documented in release notes

For the most up-to-date information, check the package version and changelog.
