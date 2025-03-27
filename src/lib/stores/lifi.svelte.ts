import type {
  Chain,
  GetStatusRequest,
  LiFiStep,
  QuoteRequest,
  RelayerQuoteResponseData,
  Token,
} from '@lifi/types'
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
} from '@lifi/sdk'
import { solanaAdapter } from './auth/AuthProvider.svelte'

const integrator = 'gibs.finance'
createConfig({
  integrator,
  debug: true,
  providers: [
    Solana({
      getWalletAdapter: async () => solanaAdapter,
    }),
  ],
})

export const availableChains = new SvelteMap<number | string, Chain>()
export const availableChainsByName = new SvelteMap<string, Chain>()
export const availableTokensPerOriginChain = new SvelteMap<number, Token[]>()
export const targetedOriginChain = new NullableProxyStore<Chain>()
export const targetedDestinationChain = new NullableProxyStore<Chain>()
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
    availableChainsByName.set(chain.name.toLowerCase(), chain)
  })
  const ethereum = [...availableChains.values()].find((chain) => chain.key === 'eth')!
  targetedDestinationChain.set(ethereum)
  await loadTokensForChains(ethereum)
  const tokens = availableTokensPerOriginChain.get(ethereum.id)!
  tokenOut.set(tokens[0])
})

const getTokensAndCache = _.memoize(
  loading.loadsAfterTick<Token[], number>('lifi-tokens', async (id: number) => {
    const tokens = await getTokens({
      chains: [id],
    })
    availableTokensPerOriginChain.set(id, tokens.tokens[id])
    return tokens.tokens[id]
  }),
)

export const loadTokensForChains = async (chain: Chain) => {
  if (availableTokensPerOriginChain.has(chain.id)) {
    return availableTokensPerOriginChain.get(chain.id)!
  }
  const getter = getTokensAndCache(chain.id)
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
    quote: Promise<RelayerQuoteResponseData['quote']>
  }
>()

export const getLifiQuoteKey = (quote: QuoteRequest) => {
  return JSON.stringify({
    ...quote,
    integrator,
  }).toLowerCase()
}

export const getQuoteStep = loading.loadsAfterTick<
  RelayerQuoteResponseData['quote'],
  QuoteRequest & { blockNumber: bigint }
>(
  'lifi-quote',
  maxMemoize(
    async ({
      fromChain,
      toChain,
      fromToken,
      toToken,
      fromAmount,
      fromAddress,
      toAddress,
    }: QuoteRequest) => {
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
      const quote = getQuote({
        fromChain,
        toChain,
        fromToken,
        toToken,
        fromAmount,
        fromAddress,
        toAddress,
        integrator,
      })
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
    await new Promise((resolve) => setTimeout(resolve, 1000))
    if (timeout.signal.aborted) {
      break
    }
  }
  return null
}
