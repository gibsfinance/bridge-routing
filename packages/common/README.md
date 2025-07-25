# Common Utilities

A collection of essential blockchain utilities and helpers that provide foundational functionality for decentralized applications. This package contains reusable, blockchain-agnostic tools that are not specific to bridge operations but commonly needed across DeFi applications.

## 🎯 Use Cases

### Primary Use Cases
- **RPC Client Management**: Create and cache blockchain RPC connections with fallback support
- **Token Operations**: Load ERC20 token metadata directly from blockchain contracts
- **Data Serialization**: Handle BigInt serialization in JSON for blockchain data
- **Performance Optimization**: Cache expensive blockchain calls and computations
- **Batch Operations**: Execute multiple blockchain calls efficiently using multicall

### Target Applications
- Multi-chain DeFi applications
- Blockchain data aggregators
- Token analytics platforms
- Wallet backends
- DApp infrastructure
- Bridge applications (used by `@gibs/bridge-sdk`)

## 🔧 Core Functionality

### RPC Client Management
- **Connection Pooling**: Cached RPC clients to avoid duplicate connections
- **Fallback Support**: Automatic failover between multiple RPC endpoints
- **WebSocket & HTTP**: Support for both HTTP and WebSocket connections
- **Batch Configuration**: Optimized batching for better performance

### ERC20 Token Operations
- **Metadata Loading**: Fetch token name, symbol, decimals from blockchain
- **Multiple ABI Support**: Handles both standard and bytes32 symbol formats
- **Caching**: Memoized token calls to reduce redundant blockchain requests
- **Error Handling**: Graceful fallbacks for non-standard token contracts

### Advanced Caching
- **TTL Caching**: Time-based cache expiration for data freshness
- **Size-Limited Caching**: LRU-style caching with maximum entry limits
- **Serialization Support**: Cache complex objects including BigInt values
- **Memory Efficient**: Automatic cleanup of expired cache entries

### Multicall Operations
- **Batch Calls**: Execute multiple contract calls in a single transaction
- **Gas Optimization**: Reduce gas costs through call aggregation
- **Type Safety**: Fully typed multicall results
- **Error Resilience**: Handle partial failures in batch operations

## 📦 Installation

```sh
npm install @gibs/common
# or
yarn add @gibs/common
```

## 📖 API Examples

### Client (`@gibs/common/client`)

```typescript
import {
  clientFromChain,
  chainKey,
  clientCache,
  defaultBatchConfig
} from '@gibs/common/client'
import { mainnet, polygon } from 'viem/chains'

// Create a cached RPC client with fallback URLs
const client = clientFromChain({
  chain: mainnet,
  urls: [
    'https://mainnet.infura.io/v3/your-key',
    'https://eth-mainnet.g.alchemy.com/v2/your-key'
  ]
})

// Create client with custom batch configuration
const polygonClient = clientFromChain({
  chain: polygon,
  urls: ['https://polygon-rpc.com']
})

// Generate cache key for debugging
const key = chainKey(1, ['https://rpc.url']) // "1,https://rpc.url"
const multiKey = chainKey(137, ['https://rpc1.url', 'https://rpc2.url']) // "137,https://rpc1.url,https://rpc2.url"

// Access client cache directly
const cached = clientCache.get(1) // { key: string, client: PublicClient } | undefined
console.log(cached?.key) // Cache key used for this client

// View default batch configuration
console.log(defaultBatchConfig)
// {
//   batch: {
//     wait: 10,        // Wait 10ms before batching
//     batchSize: 32,   // Maximum 32 calls per batch
//   }
// }

// Clear cache entry
clientCache.delete(1)

// Check cache size
console.log(clientCache.size) // Number of cached clients
```

### ERC20 (`@gibs/common/erc20`)

```typescript
import { multicallErc20, erc20MetadataCalls } from '@gibs/common/erc20'
import { mainnet, arbitrum } from 'viem/chains'

// Load token metadata (with automatic caching)
const tokenAddress = '0xA0b86a33E6441e4f4a1b95c0B5a7F1ac03c7B3B0'
const [name, symbol, decimals] = await multicallErc20({
  client,
  target: tokenAddress,
  chain: mainnet
})

console.log(name)     // "Wrapped Ether"
console.log(symbol)   // "WETH"
console.log(decimals) // 18

// Load multiple tokens efficiently
const tokens = [
  '0xA0b86a33E6441e4f4a1b95c0B5a7F1ac03c7B3B0', // WETH
  '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
  '0xdAC17F958D2ee523a2206206994597C13D831ec7'  // USDT
]

const tokenMetadata = await Promise.all(
  tokens.map(async (address) => {
    const [name, symbol, decimals] = await multicallErc20({
      client,
      target: address,
      chain: mainnet
    })
    return { name, symbol, decimals, address }
  })
)

// Handle tokens with bytes32 symbols (automatically handled)
const [usdcName, usdcSymbol, usdcDecimals] = await multicallErc20({
  client,
  target: '0xA0b86a33E6441e4f4a1b95c0B5a7F1ac03c7B3B0',
  chain: mainnet
}) // Falls back to bytes32 ABI if standard fails

// View the standard metadata calls used
console.log(erc20MetadataCalls)
// [
//   { functionName: 'name' },
//   { functionName: 'symbol' },
//   { functionName: 'decimals' }
// ]
```

### Serialize (`@gibs/common/serialize`)

```typescript
import {
  jsonAnyStringify,
  jsonAnyParse,
  isSerializedBigInt
} from '@gibs/common/serialize'

// Serialize data with BigInt values
const data = {
  balance: 1500000000000000000n, // 1.5 ETH
  user: '0x123...',
  timestamp: Date.now(),
  amounts: [100n, 200n, 300n], // Array with BigInts
  nested: {
    value: 999999999999999999n
  }
}

// Convert to JSON string
const jsonString = JSON.stringify(data, jsonAnyStringify)
console.log(jsonString)
// '{"balance":{"__type__":"bigint","value":"1500000000000000000"},"user":"0x123...","timestamp":1699123456789,"amounts":[{"__type__":"bigint","value":"100"},{"__type__":"bigint","value":"200"},{"__type__":"bigint","value":"300"}],"nested":{"value":{"__type__":"bigint","value":"999999999999999999"}}}'

// Parse back to original types
const parsed = JSON.parse(jsonString, jsonAnyParse)
console.log(typeof parsed.balance) // "bigint"
console.log(parsed.balance === 1500000000000000000n) // true
console.log(parsed.amounts[0] === 100n) // true

// Check if value is serialized BigInt
const serializedValue = { __type__: 'bigint', value: '123' }
console.log(isSerializedBigInt(serializedValue)) // true
console.log(isSerializedBigInt({ type: 'bigint', value: '123' })) // false
console.log(isSerializedBigInt('123')) // false

// Use in localStorage/sessionStorage
const cacheData = { price: 1234567890123456789n, lastUpdate: Date.now() }
localStorage.setItem('cache', JSON.stringify(cacheData, jsonAnyStringify))
const restored = JSON.parse(localStorage.getItem('cache')!, jsonAnyParse)
console.log(typeof restored.price) // "bigint"
```

### Cache (`@gibs/common/cache`)

```typescript
import { maxMemoize, ttlMemoizeSingle } from '@gibs/common/cache'

// Size-limited caching (default: 1024 entries)
const expensiveCalc = maxMemoize((x: number, y: number) => {
  console.log(`Computing ${x} * ${y}...`) // Only logs on cache miss
  return x * y * Math.random()
}, 100) // Limit to 100 entries

console.log(expensiveCalc(5, 10)) // Computes and caches
console.log(expensiveCalc(5, 10)) // Returns cached result
console.log(expensiveCalc(3, 7))  // Computes new value

// TTL-based caching (default: 1 hour)
const fetchPrice = ttlMemoizeSingle((symbol: string) => {
  console.log(`Fetching price for ${symbol}...`)
  return fetch(`/api/price/${symbol}`).then(r => r.json())
}, 30000) // Cache for 30 seconds

const ethPrice1 = await fetchPrice('ETH') // Fetches from API
const ethPrice2 = await fetchPrice('ETH') // Returns cached result (if within 30s)

// Advanced caching with BigInt serialization
const tokenPriceCache = maxMemoize((tokenAddress: string, chainId: number) => {
  console.log(`Loading price for ${tokenAddress} on chain ${chainId}`)
  return {
    price: 1500000000000000000n, // BigInt price
    timestamp: Date.now()
  }
}, 500)

const wethPrice = tokenPriceCache('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 1)
console.log(typeof wethPrice.price) // "bigint"

// TTL cache with complex return types
const getBlockInfo = ttlMemoizeSingle(async (blockNumber: bigint) => {
  return {
    number: blockNumber,
    timestamp: BigInt(Date.now()),
    hash: '0x...',
    gasUsed: 21000n
  }
}, 15000) // Cache for 15 seconds

const block = await getBlockInfo(18500000n)
console.log(typeof block.number) // "bigint"
```

### Multicall (`@gibs/common/multicall`)

```typescript
import { multicallRead } from '@gibs/common/multicall'
import { erc20Abi } from 'viem'

// Basic multicall - batch multiple contract calls efficiently
const calls = [
  { functionName: 'balanceOf', args: ['0x123...'] },
  { functionName: 'allowance', args: ['0x123...', '0x456...'] },
  { functionName: 'totalSupply', args: [] }
]

const results = await multicallRead({
  client,
  chain: mainnet,
  abi: erc20Abi,
  target: '0xA0b86a33E6441e4f4a1b95c0B5a7F1ac03c7B3B0', // WETH
  calls
})

const [balance, allowance, totalSupply] = results
console.log('Balance:', balance)       // bigint
console.log('Allowance:', allowance)   // bigint
console.log('Total Supply:', totalSupply) // bigint

// Advanced multicall with different targets and ABIs
const mixedCalls = [
  {
    functionName: 'balanceOf',
    args: ['0x123...'],
    target: '0xA0b86a33E6441e4f4a1b95c0B5a7F1ac03c7B3B0', // WETH
    abi: erc20Abi
  },
  {
    functionName: 'balanceOf',
    args: ['0x123...'],
    target: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
    abi: erc20Abi
  },
  {
    functionName: 'name',
    args: [],
    target: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
    abi: erc20Abi
  }
]

const mixedResults = await multicallRead({
  client,
  chain: mainnet,
  abi: erc20Abi, // Default ABI
  calls: mixedCalls
})

const [wethBalance, daiBalance, usdtName] = mixedResults

// Multicall with failure handling
const riskyCalls = [
  {
    functionName: 'balanceOf',
    args: ['0x123...'],
    target: '0xValidToken...',
    allowFailure: false // Will throw if this fails
  },
  {
    functionName: 'balanceOf',
    args: ['0x123...'],
    target: '0xMaybeInvalidToken...',
    allowFailure: true // Will return error object instead of throwing
  }
]

const riskyResults = await multicallRead({
  client,
  chain: mainnet,
  abi: erc20Abi,
  calls: riskyCalls
})

// riskyResults[1] might be an error object if the call failed
```

### Types (`@gibs/common/types`)

```typescript
import type { Erc20Metadata, Call } from '@gibs/common/types'

// ERC20 token metadata structure (returned by multicallErc20)
const tokenMetadata: Erc20Metadata = ['Wrapped Ether', 'WETH', 18]
const [name, symbol, decimals] = tokenMetadata
console.log(`${name} (${symbol}) has ${decimals} decimals`)

// Multicall call configuration
const balanceCall: Call = {
  functionName: 'balanceOf',
  args: ['0x123...'],
  target: '0xTokenAddress...',
  abi: erc20Abi,
  allowFailure: false
}

const nameCall: Call = {
  functionName: 'name',
  args: [],
  // target and abi will be inherited from multicallRead params
  allowFailure: true
}

// Use in function signatures
function processTokenMetadata(metadata: Erc20Metadata) {
  const [name, symbol, decimals] = metadata
  console.log(`Processing ${symbol} (${name}) with ${decimals} decimals`)
  return {
    displayName: `${name} (${symbol})`,
    precision: decimals,
    isStablecoin: name.toLowerCase().includes('usd')
  }
}

function buildMulticall(calls: Call[]) {
  return multicallRead({
    client,
    chain: mainnet,
    abi: erc20Abi,
    calls
  })
}

// Advanced Call configurations
const complexCalls: Call[] = [
  {
    functionName: 'getReserves',
    args: [],
    target: '0xPairAddress...',
    abi: pairAbi,
    allowFailure: false
  },
  {
    functionName: 'token0',
    args: [],
    target: '0xPairAddress...',
    abi: pairAbi,
    allowFailure: false
  },
  {
    functionName: 'token1',
    args: [],
    target: '0xPairAddress...',
    abi: pairAbi,
    allowFailure: false
  }
]
```

## 🔧 Configuration

### Default Batch Configuration
```typescript
import { defaultBatchConfig } from '@gibs/common/client'

console.log(defaultBatchConfig)
// {
//   batch: {
//     wait: 10,        // Wait 10ms before batching
//     batchSize: 32,   // Maximum 32 calls per batch
//   }
// }

// This configuration is automatically applied to all HTTP transports
// WebSocket transports get additional configuration:
// {
//   keepAlive: true,
//   reconnect: true,
//   retryDelay: 250,
//   retryCount: 10,
//   timeout: 4000,
//   ...defaultBatchConfig
// }
```

## 📋 API Reference

### Exports

| Export Path | Description |
|-------------|-------------|
| `@gibs/common` | Main entry point with all exports |
| `@gibs/common/client` | RPC client creation and management |
| `@gibs/common/erc20` | ERC20 token metadata utilities |
| `@gibs/common/cache` | Caching and memoization functions |
| `@gibs/common/serialize` | JSON serialization with BigInt support |
| `@gibs/common/multicall` | Batch contract call utilities |
| `@gibs/common/types` | TypeScript type definitions |

### Key Functions

#### Client Management
```typescript
// Create cached RPC client with fallback support
function clientFromChain(params: {
  chain: Chain
  urls: string[]
}): PublicClient

// Generate cache key for client identification
function chainKey(chainId: number, urls: string[]): string

// Client cache Map
const clientCache: Map<number, { key: string, client: PublicClient }>
```

#### ERC20 Operations
```typescript
// Load ERC20 metadata with caching and fallback ABIs
function multicallErc20(params: {
  client: PublicClient
  target: Hex
  chain: Chain
}): Promise<[string, string, number]> // [name, symbol, decimals]

// Standard ERC20 metadata calls
const erc20MetadataCalls: readonly [
  { functionName: 'name' },
  { functionName: 'symbol' },
  { functionName: 'decimals' }
]
```

#### Caching
```typescript
// Size-limited memoization
function maxMemoize<A extends unknown[], B>(
  fn: (...a: A) => B,
  max?: number
): (...a: A) => B

// TTL-based single value caching
function ttlMemoizeSingle<A extends unknown[], B>(
  fn: (...a: A) => B,
  ttl?: number
): (...a: A) => B
```

#### Serialization
```typescript
// JSON replacer for BigInt serialization
function jsonAnyStringify(key: string, value: any): any

// JSON reviver for BigInt deserialization
function jsonAnyParse(key: string, value: any): any

// Type guard for serialized BigInt values
function isSerializedBigInt(value: unknown): value is SerializedBigInt
```

#### Multicall
```typescript
// Execute multiple contract calls in a single transaction
function multicallRead<T = readonly unknown[]>(params: {
  client: PublicClient
  chain: Chain
  abi: Abi
  target: Hex
  calls: readonly unknown[]
}): Promise<T>
```

### Key Types

```typescript
// ERC20 token metadata tuple
type Erc20Metadata = [string, string, number] // [name, symbol, decimals]

// Multicall call configuration
interface Call {
  functionName: string
  args?: (bigint | Hex | Hex[] | bigint[] | string | string[])[]
  target?: Hex          // Override default target
  abi?: Abi            // Override default ABI
  allowFailure?: boolean // Default: false
}

// Serialized BigInt structure
interface SerializedBigInt {
  __type__: 'bigint'
  value: string
}
```

## ⚡ Performance Features

### Client Caching
- RPC clients are cached by chain ID and URL combination
- Prevents unnecessary connection overhead
- Automatic cache invalidation when URLs change

### Request Optimization
- Batch configuration reduces RPC call frequency
- Fallback RPC URLs provide reliability
- WebSocket connections for real-time data when available

### Memory Management
- Size-limited caches prevent memory leaks
- TTL caches automatically expire stale data
- Efficient cache key generation for complex objects

## 🔗 Dependencies

- `viem`: Type-safe Ethereum library for blockchain interactions
- `lodash`: Utility functions for data manipulation and memoization

## 📝 Best Practices

### Client Management
```typescript
// ✅ Good: Reuse clients with consistent URLs
const client = clientFromChain({ chain: mainnet, urls: rpcUrls })

// ❌ Avoid: Creating new clients with different URL arrays each time
const client1 = clientFromChain({ chain: mainnet, urls: [url1, url2] })
const client2 = clientFromChain({ chain: mainnet, urls: [url2, url1] }) // Different cache key!
```

### Caching Strategy
```typescript
// ✅ Good: Use appropriate cache types for your use case
const tokenMetadata = maxMemoize(fetchTokenMetadata, 500) // Bounded cache
const priceData = ttlMemoizeSingle(fetchPrices, 30000)    // 30-second TTL

// ✅ Good: Cache expensive computations, not simple operations
const expensiveCalc = maxMemoize(heavyComputation)
const simpleCalc = (a, b) => a + b // Don't cache simple operations
```

### Error Handling
```typescript
// ✅ Good: Handle multicall failures gracefully
try {
  const results = await multicallRead({ ... })
} catch (error) {
  console.warn('Multicall failed, falling back to individual calls')
  // Implement fallback logic
}
```

This package provides the foundation for robust, efficient blockchain applications by handling common infrastructure concerns so you can focus on your application logic.
