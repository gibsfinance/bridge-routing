import { type Chain, type PublicClient, createPublicClient, fallback, http, webSocket } from "viem"

/** The default batch config for the client */
export const defaultBatchConfig = {
  batch: {
    wait: 10,
    batchSize: 32,
  },
}

/**
 * Returns the chain key for the given chain id and urls
 * @param chainId - the chain id
 * @param urls - the urls
 * @returns the chain key
 */
export const chainKey = (chainId: number, urls: string[]) => {
  return `${chainId},${urls.join(',')}`.toLowerCase()
}

/** The client cache for the given chain id */
export const clientCache = new Map<number, {
  key: string
  client: PublicClient
}>()

/**
 * Returns the client for the given chain and urls
 * @param chain - the chain
 * @param urls - the urls
 * @returns the client
 */
export const clientFromChain = ({
  chain,
  urls,
}: {
  chain: Chain
  urls: string[]
}): PublicClient => {
  const key = chainKey(chain.id, urls)
  const existing = clientCache.get(chain.id)
  if (existing && existing.key === key) {
    return existing.client
  }
  const transport = !urls?.length
    ? http()
    : fallback(
      urls.map((rpc) =>
        rpc.startsWith('http')
          ? http(rpc, {
            ...defaultBatchConfig,
          })
          : webSocket(rpc, {
            keepAlive: true,
            reconnect: true,
            retryDelay: 250,
            retryCount: 10,
            timeout: 4_000,
            ...defaultBatchConfig,
          }),
      ),
      { rank: true },
    )
  const client = createPublicClient({
    chain,
    transport,
  })
  clientCache.set(chain.id, {
    key,
    client,
  })
  return client
}
