import { createConfig } from 'ponder'
import HomeAMBAbi from './abis/HomeAMB'
import ForeignAMBAbi from './abis/ForeignAMB'
import BaseBridgeValidatorsAbi from './abis/BaseBridgeValidators'
import { chains, pathways, Providers, getValidatorAddress, toTransport } from './src/utils'

Error.stackTraceLimit = Infinity

export default createConfig({
  database: {
    kind: 'postgres',
    connectionString: process.env.DATABASE_URL,
  },
  ordering: 'omnichain',
  // database: {
  //   kind: 'postgres',
  //   connectionString: process.env.DATABASE_URL,
  // },
  // ordering: 'multichain',
  chains: {
    pulsechain: {
      id: chains.pulsechain,
      rpc: toTransport(chains.pulsechain),
      pollingInterval: 15_000,
      maxRequestsPerSecond: 1_000,
    },
    pulsechainV4: {
      id: chains.pulsechainV4,
      rpc: toTransport(chains.pulsechainV4),
      pollingInterval: 15_000,
      maxRequestsPerSecond: 1_000,
    },
    ethereum: {
      id: chains.ethereum,
      rpc: toTransport(chains.ethereum),
      pollingInterval: 15_000,
      maxRequestsPerSecond: 1_000,
    },
    bsc: {
      id: chains.bsc,
      rpc: toTransport(chains.bsc),
      pollingInterval: 15_000,
      maxRequestsPerSecond: 1_000,
    },
    sepolia: {
      id: chains.sepolia,
      rpc: toTransport(chains.sepolia),
      pollingInterval: 15_000,
      maxRequestsPerSecond: 1_000,
    },
  },
  contracts: {
    ValidatorContract: {
      includeTransactionReceipts: true,
      abi: BaseBridgeValidatorsAbi,
      chain: {
        pulsechain: {
          address: [
            await getValidatorAddress(Providers.PULSECHAIN, chains.pulsechain, chains.ethereum, 'home'),
            await getValidatorAddress(Providers.TOKENSEX, chains.pulsechain, chains.bsc, 'home'),
          ],
          startBlock: 17_268_297,
        },
        pulsechainV4: {
          address: [await getValidatorAddress(Providers.PULSECHAIN, chains.pulsechainV4, chains.sepolia, 'home')],
          startBlock: 16_564_223,
        },
        ethereum: {
          address: [await getValidatorAddress(Providers.PULSECHAIN, chains.pulsechain, chains.ethereum, 'foreign')],
          startBlock: 17_264_119,
        },
        sepolia: {
          address: [await getValidatorAddress(Providers.PULSECHAIN, chains.pulsechainV4, chains.sepolia, 'foreign')],
          startBlock: 3_331_893,
        },
        bsc: {
          address: [await getValidatorAddress(Providers.TOKENSEX, chains.pulsechain, chains.bsc, 'foreign')],
          startBlock: 28_987_322,
        },
      },
    },
    HomeAMB: {
      includeTransactionReceipts: true,
      abi: HomeAMBAbi,
      filter: [
        {
          event: 'UserRequestForSignature', // home -> foreign start
          args: {},
        },
        {
          event: 'SignedForAffirmation', // foreign -> home signed
          args: {},
        },
        {
          event: 'SignedForUserRequest', // home -> foreign signed
          args: {},
        },
        {
          event: 'AffirmationCompleted', // foreign -> home complete
          args: {},
        },
      ],
      chain: {
        pulsechain: {
          address: [
            pathways.pulsechain[chains.pulsechain]![chains.ethereum]!.home,
            pathways.tokensex[chains.pulsechain]![chains.bsc]!.home,
          ],
          // bsc is deployed at 17_494_240
          // startBlock: 20427991,
          startBlock: 17_268_302,
        },
        pulsechainV4: {
          address: [pathways.pulsechain[chains.pulsechainV4]![chains.sepolia]!.home],
          // startBlock: 19836620,
          startBlock: 16_564_237,
        },
      },
    },
    ForeignAMB: {
      includeTransactionReceipts: true,
      filter: [
        {
          event: 'UserRequestForAffirmation', // foreign -> home start
          args: {},
        },
        {
          event: 'RelayedMessage', // home -> foreign complete
          args: {},
        },
      ],
      abi: ForeignAMBAbi,
      chain: {
        ethereum: {
          address: [pathways.pulsechain[chains.pulsechain]![chains.ethereum]!.foreign],
          // startBlock: 19920476,
          startBlock: 17_264_119,
        },
        bsc: {
          address: [pathways.tokensex[chains.pulsechain]![chains.bsc]!.foreign],
          // startBlock: 39182556,
          startBlock: 28_987_322,
        },
        sepolia: {
          address: [pathways.pulsechain[chains.pulsechainV4]![chains.sepolia]!.foreign],
          // startBlock: 7019369,
          startBlock: 3_331_901,
        },
      },
    },
  },
})
