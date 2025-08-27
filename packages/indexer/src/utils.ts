import type { Context } from 'ponder:registry'
import {
  createPublicClient,
  fallback,
  getAddress,
  getContract,
  http,
  PublicClient,
  webSocket,
  type Hex,
} from 'viem'
import HomeAMBAbi from '../abis/HomeAMB'
import _ from 'lodash'
import { rateLimit } from 'ponder'

export const chains = {
  ethereum: 1,
  bsc: 56,
  pulsechain: 369,
  pulsechainV4: 943,
  sepolia: 11155111,
} as const

export const chainIds = Object.values(chains)

export type ChainId = (typeof chainIds)[number]

export const Providers = {
  PULSECHAIN: 'pulsechain',
  TOKENSEX: 'tokensex',
} as const

export type Provider = (typeof Providers)[keyof typeof Providers]

export type PathwayInfo = {
  home: Hex
  foreign: Hex
}

export type ProviderHomeChainEntry = Partial<Record<ChainId, PathwayInfo>>

export type ProviderEntries = Partial<Record<ChainId, ProviderHomeChainEntry>>

export type Pathway = Record<Provider, ProviderEntries>

// provider -> home -> foreign
export const pathways = {
  [Providers.PULSECHAIN]: {
    [chains.pulsechain]: {
      [chains.ethereum]: {
        home: '0x6ef79FD6f9f840264332884240539Ed7A2dA8b2b',
        foreign: '0xd0764FAe29E0a6a96fF685f71CfC685456D5636c',
      },
    },
    [chains.pulsechainV4]: {
      [chains.sepolia]: {
        home: '0xf902DE27606cd3A7F66695c77487769Ff96211fE',
        foreign: '0x67e190aaF39b9E05b162A78ab94189446077C694',
      },
    },
  },
  [Providers.TOKENSEX]: {
    [chains.pulsechain]: {
      [chains.bsc]: {
        home: '0xa3177000d645c599e45f946240f9c2f46d26718b',
        foreign: '0x8C0Db248E87F53e53f7D19A8Bd1CFAB16f5B69E7',
      },
    },
  },
} as Pathway

export type Side = 'home' | 'foreign'

const getProviderInControlOf = (address: Hex) => {
  for (const [homeChainId, value] of Object.entries(pathways[Providers.PULSECHAIN])) {
    for (const [foreignChainId, pathwayToForeignChain] of Object.entries(value)) {
      if (pathwayToForeignChain.home.toLowerCase() === address.toLowerCase()) {
        return Providers.PULSECHAIN
      }
    }
  }
  return Providers.TOKENSEX
}

type MinimalKey = `${ChainId}-${Hex}`

type MinimalInfo = {
  provider: Provider
  side: Side
  homeChainId: ChainId
  foreignChainId: ChainId
  address: Hex
  partner: Hex
}

type MinimalEntry = [MinimalKey, MinimalInfo]

const minimalEntries: MinimalEntry[] = []

Object.entries(pathways).forEach(([provider, entries]) => {
  Object.entries(entries).forEach(([homeChainId, pathwayToForeignChain]) => {
    Object.entries(pathwayToForeignChain).forEach(([foreignChainId, info]) => {
      const common = {
        provider: provider as Provider,
        homeChainId: +homeChainId as ChainId,
        foreignChainId: +foreignChainId as ChainId,
      } as const
      minimalEntries.push(
        [
          `${+homeChainId as ChainId}-${info.home}`,
          {
            ...common,
            side: 'home',
            address: info.home,
            partner: info.foreign,
          },
        ] as const,
        [
          `${+foreignChainId as ChainId}-${info.foreign}`,
          {
            ...common,
            side: 'foreign',
            address: info.foreign,
            partner: info.home,
          },
        ] as const,
      )
    })
  })
})

export const minimalInfo = new Map<MinimalKey, MinimalInfo>(minimalEntries)

export const createOrderId = (context: Context, event: any): bigint => {
  // Create a bigint order ID for sorting based on:
  // timestamp (seconds) | transaction index | log index | chain id
  const timestamp = BigInt(event.block.timestamp)
  const txIndex = BigInt(event.transaction.transactionIndex)
  const logIndex = BigInt(event.log.logIndex)
  const chainId = BigInt(context.chain.id)
  
  // Combine into a single bigint for ordering
  // timestamp takes highest bits for primary ordering
  // Each component gets sufficient bits to avoid collision
  return (timestamp << 32n) | (txIndex << 16n) | (logIndex << 8n) | chainId
}

export const bridgeValidatorCache = new Map<string, Promise<Hex>>()

export const getValidatorContract = async (
  provider: Provider,
  from: ChainId,
  to: ChainId,
  side: Side,
  client: PublicClient,
) => {
  const address = pathways[provider]![from]![to]![side]!
  const key = `${provider}-${from}-${to}-${side}-${address.toLowerCase()}`
  if (bridgeValidatorCache.has(key)) {
    return bridgeValidatorCache.get(key)!
  }
  const omnibridge = getContract({
    address,
    abi: HomeAMBAbi,
    client,
  })
  const result = omnibridge.read.validatorContract()
  bridgeValidatorCache.set(key, result)
  result
    .then((validator) => {
      console.log(address, validator, provider, from, to, side)
    })
    .catch((err) => {
      console.error(err)
    })
  return result
}

export const getValidatorAddressFromBridge = _.memoize(async (bridgeAddress: Hex) => {
  const entries = [...bridgeValidatorCache.entries()]
  for (const [key, value] of entries) {
    const keyPortion = key.split('-')[4]!
    if (getAddress(keyPortion) === getAddress(bridgeAddress)) {
      return value
    }
  }
  throw new Error('No key found')
})

export const getBridgeAddressFromValidator = _.memoize(async (validatorAddress: Hex) => {
  const entries = [...bridgeValidatorCache.entries()]
  for (const [key, value] of entries) {
    const validatorContract = await value
    if (getAddress(validatorContract) === getAddress(validatorAddress)) {
      const splitKey = key.split('-')
      return splitKey[splitKey.length - 1]! as Hex
    }
  }
  throw new Error('No key found')
})

export const bridgeInfo = _.memoize((bridgeAddress: Hex) => {
  return [...minimalInfo.values()].find((info) => {
    return getAddress(info.address) === getAddress(bridgeAddress)
  })
})

export const gatherTransportList = (chainId: ChainId) => {
  let index = 0
  const list = []
  if (process.env[`PONDER_RPC_URL_${chainId}`]) {
    list.push(process.env[`PONDER_RPC_URL_${chainId}`]!)
  }
  while (process.env[`PONDER_RPC_URL_${chainId}_${index}`]) {
    list.push(process.env[`PONDER_RPC_URL_${chainId}_${index}`]!)
    index++
  }
  return list
}

export const toTransport = (chainId: ChainId) => {
  const list = gatherTransportList(chainId)
  const backup = (a: any) => a
  const rateLimitSettings = {
    browser: false,
    requestsPerSecond: 1000,
  }
  return fallback(
    list.map((url) => {
      const wrapper = url.includes('publicnode') || url.includes('pulsechain') ? rateLimit : backup
      return wrapper(
        url.startsWith('http')
          ? http(url, {
              timeout: 4_000,
              retryCount: 10,
              retryDelay: 200,
            })
          : webSocket(url, {
              reconnect: true,
              keepAlive: true,
              timeout: 4_000,
              retryCount: 10,
              retryDelay: 100,
            }),
        rateLimitSettings,
      )
    }),
  )
}

export const getValidatorAddress = (provider: Provider, from: ChainId, to: ChainId, side: Side) => {
  const client = createPublicClient({
    transport: toTransport(side === 'home' ? from : to),
  })
  return getValidatorContract(provider, from, to, side, client)
}