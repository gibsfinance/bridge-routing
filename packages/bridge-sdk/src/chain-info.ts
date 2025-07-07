import { encodeFunctionData, getContract, type Hex, multicall3Abi, type PublicClient, zeroAddress } from "viem"
import { Chains, nativeAssetOut, type Pathway, pathway, toChain, uniV2Routers } from "./config.js"
import type { BridgeKey, Token } from "./types.js"
import _ from "lodash"
import { chainsMetadata } from "./chains.js"
import * as abis from "./abis.js"
import { multicallRead } from "@gibs/common/multicall"

export type TokenBridgeInfo = {
  originationChainId: Chains
  assetInAddress: Hex
  assetOutAddress: Hex | null
  toForeign?: {
    home: Hex
    foreign: Hex | null
  }
  toHome?: {
    home: Hex | null
    foreign: Hex
  }
}

export const links = _.memoize(
  async ({ chainId, target, address, client }: { chainId: number; target: Hex; address: Hex, client: PublicClient }) => {
    return multicallRead<Hex[]>({
      client,
      chain: chainsMetadata[toChain(chainId)],
      abi: abis.inputBridge,
      target,
      calls: [
        { functionName: 'bridgedTokenAddress', args: [address] },
        { functionName: 'nativeTokenAddress', args: [address] },
      ],
    })
  },
  ({ chainId, target, address }) => `${chainId}-${target}-${address}`.toLowerCase(),
)

export const tokenBridgeInfo = async ({
  bridgeKey,
  assetIn,
  isProd,
  fromChainClient,
  toChainClient,
}: {
  bridgeKey: BridgeKey,
  assetIn: Token | null,
  isProd: boolean,
  fromChainClient: PublicClient,
  toChainClient: PublicClient,
}): Promise<null | TokenBridgeInfo> => {
  const bridgePathway = pathway(bridgeKey, isProd, assetIn?.address as Hex | null)
  if (!assetIn || !bridgePathway) {
    console.log('missing asset in or bridge pathway')
    return null
  }
  const [, fromChain, toChain] = bridgeKey
  const assetInAddress =
    assetIn.address === zeroAddress ? nativeAssetOut[fromChain] : assetIn.address
  const [toMappings, fromMappings] = await Promise.all([
    links({
      chainId: Number(toChain),
      target: bridgePathway.to,
      address: assetInAddress as Hex,
      client: toChainClient,
    }),
    links({
      chainId: Number(fromChain),
      target: bridgePathway.from,
      address: assetInAddress as Hex,
      client: fromChainClient,
    }),
  ])
  const [toBridged, toNative] = toMappings
  // const notGas = !Object.values(nativeAssetOut).find(
  //   (v) => v.toLowerCase() === assetInAddress.toLowerCase(),
  // )
  if (toBridged !== zeroAddress) {
    // if (notGas) console.log('toBridged')
    return {
      originationChainId: fromChain,
      assetInAddress: assetInAddress as Hex,
      assetOutAddress: toBridged,
      toHome: {
        home: toBridged,
        foreign: assetInAddress as Hex,
      },
    }
  }
  if (toNative !== zeroAddress) {
    // if (notGas) console.log('toNative')
    console.log('toNative', toNative)
    return {
      originationChainId: toChain,
      assetInAddress: assetInAddress as Hex,
      assetOutAddress: toNative,
      toForeign: {
        home: toNative,
        foreign: assetInAddress as Hex,
      },
    }
  }
  const [fromBridged, fromNative] = fromMappings
  if (fromNative !== zeroAddress) {
    // if (notGas) console.log('fromNative')
    console.log('fromNative', fromNative)
    return {
      originationChainId: toChain,
      assetInAddress: assetInAddress as Hex,
      assetOutAddress: fromNative,
      toHome: {
        home: assetInAddress as Hex,
        foreign: fromNative,
      },
    }
  }
  if (fromBridged !== zeroAddress) {
    // if (notGas) console.log('fromBridged')
    return {
      originationChainId: fromChain,
      assetInAddress: assetInAddress as Hex,
      assetOutAddress: fromBridged,
      toForeign: {
        foreign: fromBridged,
        home: assetInAddress as Hex,
      },
    }
  }
  // the token has not been bridged yet
  return {
    originationChainId: toChain,
    assetInAddress: assetInAddress as Hex,
    assetOutAddress: null,
    ...(bridgePathway.toHome
      ? {
        toHome: {
          foreign: assetInAddress as Hex,
          home: null,
        },
      }
      : {
        toForeign: {
          foreign: null,
          home: assetInAddress as Hex,
        },
      }),
  }
}
export type FetchResult = bigint[] | Hex
/**
 * check the prices that each router offers for the given paths
 * @param assetInAddress the address of the asset going into the bridge
 * @param oneTokenInt the number of tokens to push into the bridge (before fees)
 * @param chain the chain of the asset going into the bridge
 * @param bridgeKey the bridge key
 * @param blockNumber the block number to use for the price
 * @param paths the paths to check
 * @returns the prices as bigint for each path, hex whenever the price is not available
 */
const readAmountOut = ({
  amountIn,
  chain,
  paths,
  client,
  uniV2Router,
}: {
  amountIn: bigint,
  chain: Chains,
  paths: Hex[][],
  client: PublicClient,
  uniV2Router?: Hex,
}): Promise<FetchResult[]> => {
  return multicallRead<FetchResult[]>({
    chain: chainsMetadata[chain],
    client,
    abi: abis.univ2Router,
    // pulsex router
    calls: _.flatMap(uniV2Router ? [uniV2Router] : uniV2Routers[chain], (target) =>
      paths.map((path) => ({
        functionName: 'getAmountsOut',
        allowFailure: true,
        args: [amountIn, path],
        target,
      })),
    ),
  })
}

export const fetchPriceCorrective = ({
  // bridgeKey,
  // assetIn,
  // isProd,
  bridgeKeyPartner,
  assetOut,
  measurementToken,
  fromChainClient,
  toChainClient,
  assetLink,
  amountIn,
  isProd,
}: {
  bridgeKey: BridgeKey,
  bridgeKeyPartner: BridgeKey,
  measurementToken: Hex,
  assetOut: Token,
  fromChainClient: PublicClient,
  toChainClient: PublicClient,
  assetLink: TokenBridgeInfo,
  amountIn: bigint,
  isProd: boolean,
}) => {
  return {
    getPaymentToken: async () => {
      // fetch the token bridge info for the token that is about to be spent by the delivery service
      return await tokenBridgeInfo({
        bridgeKey: bridgeKeyPartner,
        assetIn: {
          ...assetOut,
          address: measurementToken,
        },
        isProd,
        // clients are reversed here because we are actually fetching the
        // tokens going the opposite direction to the provided bridge key
        fromChainClient: toChainClient,
        toChainClient: fromChainClient,
      })
    },
    getSwapResults: async ({
      paymentTokenResult,
      chain,
      uniV2Router,
      client,
    }: {
      paymentTokenResult: TokenBridgeInfo
      chain: Chains
      client: PublicClient
      uniV2Router?: Hex
    }) => {
      return await Promise.all([
        readAmountOut({
          amountIn,
          chain,
          uniV2Router,
          client,
          paths: [
            // check the direct route
            [assetLink.assetInAddress, paymentTokenResult!.assetOutAddress!],
            // might have heavier liquidity going through the native asset on the home side
            [assetLink.assetInAddress, nativeAssetOut[chain], paymentTokenResult!.assetOutAddress!],
          ],
        }),
        readAmountOut({
          amountIn,
          chain,
          uniV2Router,
          client,
          paths: [[assetOut.address as Hex, measurementToken]],
          // only the direct route is available.
          // might be able to create a whitelist for this at some point
        }),
      ])
    },
    reduceResults: ({
      results,
      oneToken,
    }: {
      results: [FetchResult[], ...[FetchResult[]]]
      oneToken: bigint
    }) => {
      const outputFromRouter = (result: FetchResult) => {
        if (_.isString(result)) {
          // the router failed to return a result
          return 0n
        }
        if (!result.length) {
          // the router returned an empty result
          return 0n
        }
        // the last element is the amount of the output token
        const last = result[result.length - 1]
        return (last * oneToken) / amountIn
      }
      const max = (amountsOut: (bigint | undefined)[]) => {
        return _.compact(amountsOut).reduce((max, current) => (max < current ? current : max), 0n)
      }
      // could do with a refactor to unify the results
      const [outputs, inputs] = results
      const outputAmounts = outputs.map(outputFromRouter)
      const inputAmounts = inputs.map(outputFromRouter)
      const outputToken = max(outputAmounts)
      const inputToken = max(inputAmounts)
      const result =
        outputToken && outputToken > 0n
          ? inputToken && inputToken > outputToken && inputToken / outputToken === 1n
            ? inputToken
            : outputToken
          : inputToken
      return result
    }
  }
}

export const minBridgeAmountIn = async ({
  assetIn,
  pathway,
  fromPublicClient,
  toPublicClient,
}: {
  assetIn: Token,
  pathway: Pathway,
  fromPublicClient: PublicClient,
  toPublicClient: PublicClient,
}) => {
  const publicClient = pathway?.feeManager === 'from' ? fromPublicClient : toPublicClient
  return publicClient.readContract({
    abi: abis.inputBridge,
    functionName: 'minPerTx',
    args: [assetIn.address as Hex],
    address: pathway[pathway.feeManager],
  })
}
/** get the symbol of the native asset, unwrap it if it needs to be */
export const nativeSymbol = (asset: { address: string, symbol: string, chainId: number } | null, unwrap = false) => {
  return asset ? (unwrap && asset.address === nativeAssetOut[toChain(asset.chainId)] ? asset.symbol.slice(1) : asset.symbol) : ''
}

export type InputLoadFeeFor = {
  pathway: Pathway
  fromChainClient: PublicClient
  toChainClient: PublicClient
}

export type PathwayExtendableConfig = {
  feeManager: Hex
  feeH2F: bigint
  feeF2H: bigint
}

export const chainMulticall = (client: PublicClient) => {
  const chainId = client.chain!.id
  const metadata = chainsMetadata[toChain(chainId)]
  return getContract({
    abi: multicall3Abi,
    client: client as any,
    address: metadata.contracts!.multicall3!.address,
  }) as any
}

export const loadBridgeFees = async ({ pathway, fromChainClient, toChainClient }: InputLoadFeeFor) => {
  const multicall = pathway.feeManager === 'from'
    ? chainMulticall(fromChainClient)
    : chainMulticall(toChainClient)

  const [feeManagerResponse] = await multicall.read.aggregate3([
    [
      {
        allowFailure: false,
        target: pathway[pathway.feeManager],
        callData: encodeFunctionData({
          abi: abis.inputBridge,
          functionName: 'feeManager',
        }),
      },
    ],
  ])
  const { success, returnData } = feeManagerResponse
  if (!success) {
    throw new Error('unable to load feeManager')
  }
  if (returnData === '0x') {
    throw new Error('unable to read feeManager')
  }
  const feeManager = (
    returnData.startsWith('0x000000000000000000000000')
      ? `0x${returnData.slice(26)}`
      : `0x${returnData.slice(-40)}`
  ) as Hex
  const [keyH2F, keyF2H] = await multicall.read.aggregate3([
    [
      {
        allowFailure: false,
        target: feeManager,
        callData: encodeFunctionData({
          abi: abis.feeManager,
          functionName: 'HOME_TO_FOREIGN_FEE',
        }),
      },
      {
        allowFailure: false,
        target: feeManager,
        callData: encodeFunctionData({
          abi: abis.feeManager,
          functionName: 'FOREIGN_TO_HOME_FEE',
        }),
      },
    ],
  ])
  const [feeH2F, feeF2H] = await multicall.read.aggregate3([
    [
      {
        allowFailure: false,
        target: feeManager,
        callData: encodeFunctionData({
          abi: abis.feeManager,
          functionName: 'getFee',
          args: [keyH2F.returnData, zeroAddress],
        }),
      },
      {
        allowFailure: false,
        target: feeManager,
        callData: encodeFunctionData({
          abi: abis.feeManager,
          functionName: 'getFee',
          args: [keyF2H.returnData, zeroAddress],
        }),
      },
    ],
  ])
  const setting = {
    feeManager,
    feeH2F: BigInt(feeH2F.returnData),
    feeF2H: BigInt(feeF2H.returnData),
  } as PathwayExtendableConfig
  return setting
}
