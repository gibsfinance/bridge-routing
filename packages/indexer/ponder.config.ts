import { createConfig, mergeAbis } from 'ponder'
import HomeAMBAbi from './abis/HomeAMB'
import ForeignAMBAbi from './abis/ForeignAMB'
import BaseBridgeValidatorsAbi from './abis/BaseBridgeValidators'
import { toTransport, accessContracts } from './src/utils'
import BasicOmnibridge from './abis/BasicOmnibridge'
import { chains, Providers } from '@gibs/bridge-sdk/config'
import { FeeManagerAbi } from './abis/FeeManager'

Error.stackTraceLimit = Infinity

const startBlocks = {
  pulsechain: 17_268_302,
  pulsechainV4: 16_564_237,
  ethereum: 17_264_119,
  sepolia: 3_331_901,
  bsc: 28_987_322,
}

const chain = (chain: keyof typeof chains) => {
  return {
    id: chains[chain],
    rpc: toTransport(chains[chain]),
    pollingInterval: 5_000,
    maxRequestsPerSecond: 1_000,
  }
}

export default createConfig({
  database: {
    kind: 'postgres',
    connectionString: process.env.DATABASE_URL,
  },
  ordering: 'omnichain',
  chains: {
    pulsechain: chain('pulsechain'),
    pulsechainV4: chain('pulsechainV4'),
    ethereum: chain('ethereum'),
    sepolia: chain('sepolia'),
    bsc: chain('bsc'),
  },
  contracts: {
    ValidatorContract: {
      includeTransactionReceipts: true,
      abi: BaseBridgeValidatorsAbi,
      chain: {
        pulsechain: {
          startBlock: startBlocks.pulsechain,
          address: [
            ...(await accessContracts({
              provider: Providers.PULSECHAIN,
              from: chains.pulsechain,
              to: chains.ethereum,
              side: 'home',
              type: 'validator',
            })),
            ...(await accessContracts({
              provider: Providers.TOKENSEX,
              from: chains.pulsechain,
              to: chains.bsc,
              side: 'home',
              type: 'validator',
            })),
          ],
        },
        ethereum: {
          startBlock: startBlocks.ethereum,
          address: await accessContracts({
            provider: Providers.PULSECHAIN,
            from: chains.pulsechain,
            to: chains.ethereum,
            side: 'foreign',
            type: 'validator',
          }),
        },
        pulsechainV4: {
          startBlock: startBlocks.pulsechainV4,
          address: await accessContracts({
            provider: Providers.PULSECHAIN,
            from: chains.pulsechainV4,
            to: chains.sepolia,
            side: 'home',
            type: 'validator',
          }),
        },
        sepolia: {
          startBlock: startBlocks.sepolia,
          address: await accessContracts({
            provider: Providers.PULSECHAIN,
            from: chains.pulsechainV4,
            to: chains.sepolia,
            side: 'foreign',
            type: 'validator',
          }),
        },
        bsc: {
          startBlock: startBlocks.bsc,
          address: await accessContracts({
            provider: Providers.TOKENSEX,
            from: chains.pulsechain,
            to: chains.bsc,
            side: 'foreign',
            type: 'validator',
          }),
        },
      },
    },
    HomeAMB: {
      includeTransactionReceipts: true,
      abi: mergeAbis([HomeAMBAbi, BasicOmnibridge]),
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
        {
          event: 'CollectedSignatures', // foreign -> home complete
          args: {},
        },
      ],
      chain: {
        pulsechain: {
          startBlock: startBlocks.pulsechain,
          address: [
            ...(await accessContracts({
              provider: Providers.PULSECHAIN,
              from: chains.pulsechain,
              to: chains.ethereum,
              side: 'home',
              type: 'amb',
            })),
            ...(await accessContracts({
              provider: Providers.TOKENSEX,
              from: chains.pulsechain,
              to: chains.bsc,
              side: 'home',
              type: 'amb',
            })),
          ],
        },
        pulsechainV4: {
          startBlock: startBlocks.pulsechainV4,
          address: await accessContracts({
            provider: Providers.PULSECHAIN,
            from: chains.pulsechainV4,
            to: chains.sepolia,
            side: 'home',
            type: 'amb',
          }),
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
      abi: mergeAbis([ForeignAMBAbi, BasicOmnibridge]),
      chain: {
        ethereum: {
          startBlock: startBlocks.ethereum,
          address: await accessContracts({
            provider: Providers.PULSECHAIN,
            from: chains.pulsechain,
            to: chains.ethereum,
            side: 'foreign',
            type: 'amb',
          }),
        },
        bsc: {
          startBlock: startBlocks.bsc,
          address: await accessContracts({
            provider: Providers.TOKENSEX,
            from: chains.pulsechain,
            to: chains.bsc,
            side: 'foreign',
            type: 'amb',
          }),
        },
        sepolia: {
          startBlock: startBlocks.sepolia,
          address: await accessContracts({
            provider: Providers.PULSECHAIN,
            from: chains.pulsechainV4,
            to: chains.sepolia,
            side: 'foreign',
            type: 'amb',
          }),
        },
      },
    },
    BasicOmnibridge: {
      includeTransactionReceipts: true,
      abi: BasicOmnibridge,
      filter: [
        {
          event: 'NewTokenRegistered',
          args: {},
        },
        {
          event: 'TokensBridgingInitiated',
          args: {},
        },
        {
          event: 'TokensBridged',
          args: {},
        },
        {
          event: 'FeeDistributed',
          args: {},
        },
      ],
      chain: {
        pulsechain: {
          startBlock: startBlocks.pulsechain,
          address: [
            ...await accessContracts({
              provider: Providers.PULSECHAIN,
              from: chains.pulsechain,
              to: chains.ethereum,
              side: 'home',
              type: 'omni',
            }),
            ...await accessContracts({
              provider: Providers.TOKENSEX,
              from: chains.pulsechain,
              to: chains.bsc,
              side: 'home',
              type: 'omni',
            }),
          ],
        },
        ethereum: {
          startBlock: startBlocks.ethereum,
          address: await accessContracts({
            provider: Providers.PULSECHAIN,
            from: chains.pulsechain,
            to: chains.ethereum,
            side: 'foreign',
            type: 'omni',
          }),
        },
        pulsechainV4: {
          startBlock: startBlocks.pulsechainV4,
          address: await accessContracts({
            provider: Providers.PULSECHAIN,
            from: chains.pulsechainV4,
            to: chains.sepolia,
            side: 'home',
            type: 'omni',
          }),
        },
        sepolia: {
          startBlock: startBlocks.sepolia,
          address: await accessContracts({
            provider: Providers.PULSECHAIN,
            from: chains.pulsechainV4,
            to: chains.sepolia,
            side: 'foreign',
            type: 'omni',
          }),
        },
        bsc: {
          startBlock: startBlocks.bsc,
          address: await accessContracts({
            provider: Providers.TOKENSEX,
            from: chains.pulsechain,
            to: chains.bsc,
            side: 'foreign',
            type: 'omni',
          }),
        },
      },
    },
    FeeManager: {
      abi: FeeManagerAbi,
      includeTransactionReceipts: true,
      filter: [
        {
          event: 'FeeUpdated',
          args: {},
        },
      ],
      chain: {
        pulsechain: {
          startBlock: startBlocks.pulsechain,
          address: [
            ...await accessContracts({
              provider: Providers.PULSECHAIN,
              from: chains.pulsechain,
              to: chains.ethereum,
              side: 'home',
              type: 'feeManager',
            }),
            ...await accessContracts({
              provider: Providers.TOKENSEX,
              from: chains.pulsechain,
              to: chains.bsc,
              side: 'home',
              type: 'feeManager',
            }),
          ],
        },
        pulsechainV4: {
          startBlock: startBlocks.pulsechainV4,
          address: await accessContracts({
            provider: Providers.PULSECHAIN,
            from: chains.pulsechainV4,
            to: chains.sepolia,
            side: 'home',
            type: 'feeManager',
          }),
        },
      },
    },
  },
})
