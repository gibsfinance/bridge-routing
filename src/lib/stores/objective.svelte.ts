import {
  ChainType,
  getChains,
  getTools,
  getTokens,
  getQuote,
  getConnections,
  createConfig,
} from '@lifi/sdk'
import type {
  Chain,
  Connection,
  LiFiStep,
  QuoteRequest,
  RelayerQuoteResponseData,
  Token,
  ToolsResponse,
} from '@lifi/types'
import { SvelteMap } from 'svelte/reactivity'
import type { Hex } from 'viem'
import { loading } from './loading.svelte'

const integrator = 'gibs.finance'
createConfig({
  integrator,
  // preloadChains: true,
})

export const availableTools = $state({
  value: null as null | ToolsResponse,
  set: (tools: ToolsResponse) => {
    availableTools.value = tools
  },
})
export const availableChains = new SvelteMap<number, Chain>()
export const availableTokensPerOriginChain = new SvelteMap<number, Token[]>()
export const availableTokensPerDestinationChain = new SvelteMap<number, Token[]>()

export const loadData = async () => {
  const [chains] = await Promise.all([
    getChains({
      chainTypes: [ChainType.EVM, ChainType.UTXO, ChainType.SVM, ChainType.MVM],
    }),
    getTools(),
  ])
  const c = new Map<string, Chain>()
  chains.forEach((chain) => {
    if (c.has(chain.key)) return
    c.set(chain.key, chain)
    availableChains.set(chain.id, chain)
  })
  const ethereum = [...availableChains.values()].find((chain) => chain.key === 'eth')!
  targetedDestinationChain.set(ethereum)
  await loadTokensForChains(ethereum)
  const tokens = availableTokensPerOriginChain.get(ethereum.id)!
  tokenOut.set(tokens[0])
}

export const targetedOriginChain = $state({
  value: null as null | Chain,
  set: (chain: null | Chain) => {
    targetedOriginChain.value = chain
  },
})

export const targetedDestinationChain = $state({
  value: null as null | Chain,
  set: (chain: null | Chain) => {
    targetedDestinationChain.value = chain
  },
})

export const amountIn = $state({
  value: null as bigint | null,
  set: (amount: bigint | null) => {
    amountIn.value = amount
  },
})

export const amountOut = $state({
  value: null as bigint | null,
  set: (amount: bigint | null) => {
    amountOut.value = amount
  },
})

export const tokenIn = $state({
  value: null as null | Token,
  set: (token: Token | null) => {
    tokenIn.value = token
    ensureConnections()
  },
})

const connectionsPerInput = new Map<string, Promise<Connection[]>>()

const ensureConnections = async () => {
  const tokenInput = tokenIn.value
  const chainInput = targetedOriginChain.value
  const chainOutput = targetedDestinationChain.value
  if (!tokenInput || !chainInput || !chainOutput) return
  const inputKey = `${chainInput.id}-${tokenInput.address}-${chainInput.id}`.toLowerCase()
  const known = connectionsPerInput.get(inputKey)
  if (known) return
  connectionsPerInput.set(inputKey, loadConnections(chainInput, tokenInput, chainOutput))
}

const loadConnections = async (chainInput: Chain, tokenInput: Token, chainOutput: Chain) => {
  const { connections } = await getConnections({
    fromChain: chainInput.id,
    toChain: chainOutput.id,
    fromToken: tokenInput.address as Hex,
  })
  return connections
}

export const tokenOut = $state({
  value: null as null | Token,
  set: (token: Token | null) => {
    tokenOut.value = token
  },
})

export const loadTokensForChains = async (chain: Chain) => {
  if (availableTokensPerOriginChain.has(chain.id)) {
    return availableTokensPerOriginChain.get(chain.id)!
  }
  const tokens = await getTokens({
    chains: [chain.id],
  })
  availableTokensPerOriginChain.set(chain.id, tokens.tokens[chain.id])
}

export const loadTools = async () => {
  const tools = await getTools()
  availableTools.set(tools)
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

export type Proxy<T> = {
  value: T
  set: (value: T) => void
}

export const currentStep = $state({
  value: null as null | LiFiStep,
  set: (step: null | LiFiStep) => {
    currentStep.value = step
  },
})

export const toAddress = $state({
  value: null as null | string,
  set: (address: null | string) => {
    toAddress.value = address
  },
})

export const getQuoteStep = loading.loadsAfterTick<RelayerQuoteResponseData['quote'], QuoteRequest>(
  'lifi-quote',
  async ({
    fromChain,
    toChain,
    fromToken,
    toToken,
    fromAmount,
    fromAddress,
    toAddress,
  }: QuoteRequest) => {
    return await getQuote({
      fromChain,
      toChain,
      fromToken,
      toToken,
      fromAmount,
      fromAddress,
      toAddress,
      integrator,
    })
  },
)
