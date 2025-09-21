import type { Context, Event } from 'ponder:registry'
import {
  createPublicClient,
  fallback,
  getAddress,
  getContract,
  http,
  webSocket,
  type Hex,
} from 'viem'
import HomeAMBAbi from '../abis/HomeAMB'
import _ from 'lodash'
import { rateLimit } from 'ponder'
import BasicOmnibridge from '../abis/BasicOmnibridge'

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
  pair: string
  home: Hex
  foreign: Hex
}

export type ProviderHomeChainEntry = Partial<Record<ChainId, PathwayInfo[]>>

export type ProviderEntries = Partial<Record<ChainId, ProviderHomeChainEntry>>

export type Pathway = Record<Provider, ProviderEntries>

// provider -> home -> foreign
export const pathways = {
  [Providers.PULSECHAIN]: {
    [chains.pulsechain]: {
      [chains.ethereum]: [{
        pair: 'mainnet',
        home: '0x4fD0aaa7506f3d9cB8274bdB946Ec42A1b8751Ef',
        foreign: '0x1715a3e4a142d8b698131108995174f37aeba10d',
      }, {
        pair: 'mainnet-native',
        home: '0x0e18d0d556b652794EF12Bf68B2dC857EF5f3996',
        foreign: '0xe20E337DB2a00b1C37139c873B92a0AAd3F468bF',
      }],
    },
    [chains.pulsechainV4]: {
      [chains.sepolia]: [{
        pair: 'v4',
        home: '0x6B08a50865aDeCe6e3869D9AfbB316d0a0436B6c',
        foreign: '0x546e37DAA15cdb82fd1a717E5dEEa4AF08D4349A',
      }, {
        pair: 'v4-native',
        home: '0x81c10846F40fA2B173FC47958D0a892529983F50',
        foreign: '0x5e238ef968467cf443ef5ecb683b76c5a04a0421',
      }],
    },
  },
  [Providers.TOKENSEX]: {
    [chains.pulsechain]: {
      [chains.bsc]: [{
        pair: 'bsctokensex',
        home: '0xf1DFc63e10fF01b8c3d307529b47AefaD2154C0e',
        foreign: '0xb4005881e81a6ecd2c1f75d58e8e41f28d59c6b1',
      }],
    },
  },
} as Pathway

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

export type Side = 'home' | 'foreign'

export type MinimalKey = `${ChainId}-${Hex}`

export type PathPairing = {
  chainId: ChainId
  omni: Hex
  amb: Promise<Hex>
  validator: Promise<Hex>
}

export type MinimalInfo = {
  pair: string
  provider: Provider
  side: Side
  homeChainId: ChainId
  foreignChainId: ChainId
  target: PathPairing
  partner: PathPairing
}

type MinimalEntry = [MinimalKey, MinimalInfo]

const minimalEntries: MinimalEntry[] = []

const normalize = (c: Hex) => c.toLowerCase() as Hex
Object.entries(pathways).forEach(([provider, entries]) => {
  Object.entries(entries).forEach(([homeChainId, pathwayToForeignChain]) => {
    Object.entries(pathwayToForeignChain).forEach(([foreignChainId, infos]) => {
      for (let i = 0; i < infos.length; i++) {
        const info = infos[i]!
        const common = {
          provider: provider as Provider,
          homeChainId: +homeChainId as ChainId,
          foreignChainId: +foreignChainId as ChainId,
        } as const
        // create clients for the home and foreign chains
        const homeClient = createPublicClient({
          transport: toTransport(common.homeChainId),
        })
        const foreignClient = createPublicClient({
          transport: toTransport(common.foreignChainId),
        })
        // fetch the amb contract that the omni contract points to
        const homeAmb = getContract({
          address: info.home,
          abi: BasicOmnibridge,
          client: homeClient,
        }).read.bridgeContract().then(normalize)
        const foreignAmb = getContract({
          address: info.foreign,
          abi: BasicOmnibridge,
          client: foreignClient,
        }).read.bridgeContract().then(normalize)
        const homeValidator = homeAmb.then((amb) => getContract({
          address: amb,
          abi: HomeAMBAbi,
          client: homeClient,
        }).read.validatorContract()).then(normalize)
        const foreignValidator = foreignAmb.then((amb) => getContract({
          address: amb,
          abi: HomeAMBAbi,
          client: foreignClient,
        }).read.validatorContract()).then(normalize)
        Promise.all([homeValidator, foreignValidator, homeAmb, foreignAmb]).then(([homeValidator, foreignValidator, homeAmb, foreignAmb]) => {
          console.log('omni=%o amb=%o validator=%o side=%o', info.home, homeAmb, homeValidator, 'home')
          console.log('omni=%o amb=%o validator=%o side=%o', info.foreign, foreignAmb, foreignValidator, 'foreign')
        }).catch((err) => {
          console.log(err)
          throw err
        })
        const home = {
          chainId: common.homeChainId,
          omni: normalize(info.home),
          amb: homeAmb,
          validator: homeValidator,
        }
        const foreign = {
          chainId: common.foreignChainId,
          omni: normalize(info.foreign),
          amb: foreignAmb,
          validator: foreignValidator,
        }
        minimalEntries.push(
          [
            `${+homeChainId as ChainId}-${info.home.toLowerCase() as Hex}`,
            {
              ...common,
              pair: info.pair,
              side: 'home',
              target: home,
              partner: foreign,
            },
          ] as const,
          [
            `${+foreignChainId as ChainId}-${info.foreign.toLowerCase() as Hex}`,
            {
              ...common,
              pair: info.pair,
              side: 'foreign',
              target: foreign,
              partner: home,
            },
          ] as const,
        )
      }
    })
  })
})

export const minimalInfo = new Map<MinimalKey, MinimalInfo>(minimalEntries)

export const createOrderId = (context: Context, event: Event): bigint => {
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

export type ContractsAccessInputs = {
  provider: Provider,
  from: ChainId,
  to: ChainId,
  side: Side,
  type: 'validator' | 'amb' | 'omni',
}

export const accessContract = async (i: ContractsAccessInputs & {
  index: number,
}) => {
  const address = pathways[i.provider]![i.from]![i.to]![i.index]![i.side]!
  // look up by omni contract address
  const scope = i.side === 'home' ? i.from : i.to
  const pair = minimalInfo.get(`${scope}-${address.toLowerCase() as Hex}`)
  if (!pair) {
    throw new Error(`No pair found for ${scope}-${address.toLowerCase() as Hex}`)
  }
  const result = await pair.target[i.type]
  return result
}

export const accessContracts = async (i: ContractsAccessInputs) => {
  return await Promise.all(pathways[i.provider]![i.from]![i.to]!.map((_p, index) => (
    accessContract({
      ...i,
      index,
    })
  )))
}

type InfoSelectionOption = 'omni' | 'amb' | 'validator'

export const getInfoBy = _.memoize(async ({ key, address, chainId }: {
  key: InfoSelectionOption,
  address: Hex,
  chainId: ChainId,
}) => {
  const entries = [...minimalInfo.values()]
  for (const info of entries) {
    // console.log('key=%o info=%o', key, await info.target[key])
    if ((await info.target[key])!.toLowerCase() === address.toLowerCase() && info.target.chainId === chainId) {
      // return the amb value from the target
      return info
    }
  }
  throw new Error('No key found')
})
// export const getOmniFromAmb = _.memoize(async (chainId: ChainId, ambAddress: Hex) => {
//   const entries = [...minimalInfo.entries()]
//   for (const [key, info] of entries) {
//     const ambContract = await info.target.amb
//     if (info.target.chainId === chainId && getAddress(ambContract) === getAddress(ambAddress)) {
//       // return the amb value from the target
//       return info.target.omni
//     }
//   }
//   throw new Error('No key found')
// })

// export const bridgeInfo = _.memoize((chainId: ChainId, omnibridgeAddress: Hex) => {
//   return [...minimalInfo.values()].find((info) => {
//     return info.target.chainId === chainId
//       && getAddress(info.target.omni) === getAddress(omnibridgeAddress)
//   })
// }, (chainId, omnibridgeAddress) => `${chainId}-${omnibridgeAddress}`.toLowerCase())
