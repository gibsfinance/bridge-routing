import type {
  ExtendedChain,
  ChainKey,
  GetStatusRequest,
  LiFiStep,
  QuoteRequest,
  Token,
} from '@lifi/sdk'
import type { RelayerQuoteResponseData } from '@lifi/types'
import { SvelteMap } from 'svelte/reactivity'
import { loading } from './loading.svelte'
import _ from 'lodash'
import { maxMemoize } from '$lib/utils.svelte'
import { NullableProxyStore } from '$lib/types.svelte'
import {
  getTokenBalance as getTokenBalanceLifi,
  ChainType,
  getChains,
  getTokens,
  getQuote,
  createConfig,
  Solana,
  getStatus,
  UTXO,
  EVM,
} from '@lifi/sdk'
import { bitcoinAdapter, solanaAdapter, wagmiAdapter } from './auth/AuthProvider.svelte'

const integrator = 'gibs.finance'
createConfig({
  integrator,
  debug: true,
  providers: [
    EVM({
      // getWalletClient: async () => wagmiAdapter,
    }),
    Solana({
      // getWalletAdapter: async () => solanaAdapter,
    }),
    UTXO({
      // getWalletAdapter: async () => bitcoinAdapter,
    }),
  ],
})

export const availableChains = new SvelteMap<number | string, ExtendedChain>()
export const availableChainsByName = new SvelteMap<string, ExtendedChain>()
export const availableTokensPerOriginChain = new SvelteMap<number, Token[]>()
export const targetedOriginChain = new NullableProxyStore<ExtendedChain>()
export const targetedDestinationChain = new NullableProxyStore<ExtendedChain>()
export const amountIn = new NullableProxyStore<bigint>()
export const amountOut = new NullableProxyStore<bigint>()
export const tokenIn = new NullableProxyStore<Token>()
export const tokenOut = new NullableProxyStore<Token>()
export const currentStep = new NullableProxyStore<LiFiStep>()
export const toAddress = new NullableProxyStore<string>()

const fetchChains = _.memoize(async () => {
  const chains = await getChains({
    chainTypes: [ChainType.EVM, ChainType.UTXO, ChainType.SVM, ChainType.MVM],
  })
  return chains
})

export const loadData = _.memoize(async () => {
  const [chains] = await Promise.all([fetchChains()])
  chains.forEach((chain) => {
    if (availableChains.has(chain.id)) return
    availableChains.set(chain.id, chain)
    if (chain.chainType === ChainType.UTXO) {
      availableChainsByName.set('bip122', chain)
    }
    if (chain.chainType === ChainType.SVM) {
      availableChainsByName.set(chain.name.toLowerCase(), chain)
    }
  })
  // console.log(availableChainsByName.get('bitcoin'))
  const ethereum = [...availableChains.values()].find((chain) => chain.key === 'eth')!
  targetedDestinationChain.set(ethereum)
  await loadTokensForChains(ethereum)
  const tokens = availableTokensPerOriginChain.get(ethereum.id)!
  tokenOut.set(tokens[0])
})

const getTokensAndCache = _.memoize(
  loading.loadsAfterTick<Token[], ChainKey>('lifi-tokens', async (key: ChainKey) => {
    const tokens = await getTokens({
      chains: [key],
    })
    const chain = [...availableChains.values()].find((chain) => chain.key === key)!
    const id = chain.id
    const tkns = tokens.tokens[id] ?? (chain.nativeToken ? [chain.nativeToken] : [])
    availableTokensPerOriginChain.set(id, tkns)
    return tkns
  }),
)

export const loadTokensForChains = async (chain: ExtendedChain) => {
  if (availableTokensPerOriginChain.has(chain.id)) {
    return availableTokensPerOriginChain.get(chain.id)!
  }
  const getter = getTokensAndCache(chain.key)
  return getter.promise
}

export const flipTokens = () => {
  const tempTokenIn = tokenIn.value
  const tempTokenOut = tokenOut.value
  const tempTargetedOriginChain = targetedOriginChain.value
  const tempTargetedDestinationChain = targetedDestinationChain.value

  tokenIn.set(tempTokenOut)
  tokenOut.set(tempTokenIn)
  targetedOriginChain.set(tempTargetedDestinationChain)
  targetedDestinationChain.set(tempTargetedOriginChain)
}

export const lifiQuotes = new SvelteMap<
  string,
  {
    updatedAt: number
    quote: Promise<LiFiStep>
  }
>()

export const getLifiQuoteKey = (quote: QuoteRequest) => {
  return JSON.stringify({
    ...quote,
    integrator,
  }).toLowerCase()
}

export const getQuoteStep = loading.loadsAfterTick<
  LiFiStep,
  QuoteRequest & { blockNumber: bigint }
>(
  'lifi-quote',
  maxMemoize(
    async (
      { fromChain, toChain, fromToken, toToken, fromAmount, fromAddress, toAddress }: QuoteRequest,
      controller: AbortController,
    ) => {
      const lifiQuoteKey = getLifiQuoteKey({
        fromChain,
        toChain,
        fromToken,
        toToken,
        fromAmount,
        fromAddress,
        toAddress,
        integrator,
      })
      const existingQuote = lifiQuotes.get(lifiQuoteKey)
      if (existingQuote && existingQuote.updatedAt > Date.now() - 1000 * 30) {
        return existingQuote.quote
      }
      const quote = getQuote(
        {
          fromChain,
          toChain,
          fromToken,
          toToken,
          fromAmount,
          fromAddress,
          toAddress,
          integrator,
        },
        {
          signal: controller.signal,
        },
      )
      lifiQuotes.set(lifiQuoteKey, {
        updatedAt: Date.now(),
        quote,
      })
      return quote
    },
  ),
)

export const toLifiToken = (token: { chainId: number; address: string }) => {
  const chain = availableChains.get(token.chainId)
  if (!chain)
    return {
      chain: null,
      token: null,
    }
  const tokens = availableTokensPerOriginChain.get(chain.id)
  if (!tokens)
    return {
      chain,
      token: null,
    }
  const lifiToken = tokens.find((t) => t.address.toLowerCase() === token.address.toLowerCase())
  if (!lifiToken)
    return {
      chain,
      token: null,
    }
  return {
    chain,
    token: lifiToken,
  }
}

export const getTokenBalance = async (asset: {
  chainId: number
  address: string
  account: string
}) => {
  const { token } = toLifiToken(asset)
  if (!token) return null
  const balance = await getTokenBalanceLifi(asset.account, token)
  return balance
}

export const waitForBridge = async ({
  timeout,
  ...options
}: GetStatusRequest & {
  timeout: AbortController
}) => {
  while (true) {
    const result = await getStatus(options)
    if (timeout.signal.aborted) {
      break
    }
    const { status } = result
    if (status === 'DONE') {
      return result
    }
    await new Promise((resolve) => setTimeout(resolve, 3_000))
    if (timeout.signal.aborted) {
      break
    }
  }
  return null
}
