import * as input from '$lib/stores/input.svelte'
import {
  zeroAddress,
  type Hex,
  parseUnits,
  isAddress,
  encodeAbiParameters,
  concatHex,
  encodeFunctionData,
  getAddress,
  type Block,
  getContract,
  erc20Abi,
} from 'viem'
import { Chains, toChain } from './auth/types'
import { loading, resolved } from './loading.svelte'
import { type Token, type TokenOut, NullableProxyStore, ProxyStore } from '$lib/types.svelte'
import * as chainEvents from './chain-events.svelte'
import { chainsMetadata } from './auth/constants'
import { multicallErc20, multicallRead, type Erc20Metadata } from '$lib/utils.svelte'
import _ from 'lodash'
import { uniV2Routers, nativeAssetOut, pathway, whitelisted } from './config.svelte'
import * as abis from './abis'
import * as imageLinks from './image-links'
import { settings } from './fee-manager.svelte'
import type { BridgeKeyStore } from '$lib/stores/input.svelte'
import { accountState } from './auth/AuthProvider.svelte'

// const backupAssetIn = {
//   address: zeroAddress,
//   name: 'unknown',
//   symbol: 'xxx',
//   decimals: 18,
//   logoURI: '',
//   chainId: 369,
// } as Token

export class BridgeSettings {
  constructor() {}
  // hold some basic state so that requests don't have to be re-created
  assetIn = new NullableProxyStore<Token>()
  assetOut = new NullableProxyStore<TokenOut>()
  priceCorrective = new ProxyStore<bigint>(0n)
  approval = new NullableProxyStore<bigint>()

  bridgePathway = $derived.by(() => {
    return pathway(input.bridgeKey.value)
  })
  bridgeFees = $derived.by(() => {
    return settings.get(input.bridgeKey.value)
  })
  bridgeFee = $derived.by(() => {
    const setting = settings.get(input.bridgeKey.value)
    const path = pathway(input.bridgeKey.value)
    return (path?.toHome ? setting?.feeF2H : setting?.feeH2F) || 0n
  })
  amountToBridge = $derived.by(() => {
    const amountIn = input.amountIn.value
    if (!amountIn || amountIn === 0n || !this.assetIn.value) return 0n
    return amountIn
  })
  bridgeCost = $derived.by(() => {
    return (this.amountToBridge * this.bridgeFee) / oneEther
  })
  amountAfterBridgeFee = $derived.by(() => {
    const afterFee = this.amountToBridge - this.bridgeCost
    if (afterFee < 0n) return 0n
    return afterFee
  })
  baseFeeReimbersement = $derived.by(() => {
    return (this.estimatedNetworkCost * (oneEther + this.fee)) / oneEther
  })
  estimatedNetworkCost = $derived.by(() => {
    const priceCorrective = this.priceCorrective.value
    if (!priceCorrective || !this.bridgePathway?.requiresDelivery) {
      return 0n
    }
    return BigInt(
      (this.estimatedGas * this.latestBaseFeePerGas * this.oneTokenInt) / priceCorrective,
    )
  })
  estimatedGas = $derived.by(() => {
    return input.estimatedGas.value
  })
  latestBaseFeePerGas = $derived.by(() => {
    return chainEvents.latestBlock.latestBaseFeePerGas(Number(input.bridgeKey.value[2]))
  })
  clampedReimbersement = $derived.by(() => {
    if (input.feeType.value === input.FeeType.PERCENT) {
      return this.limitFromPercent
    }
    return this.baseFeeReimbersement > this.limit ? this.limit : this.baseFeeReimbersement
  })
  oneTokenInt = $derived.by(() => {
    return this.assetIn.value ? 10n ** BigInt(this.assetIn.value.decimals) : 1n
  })
  fee = $derived.by(() => {
    const fee = input.fee.value
    if (!fee || fee === 0n || !this.bridgePathway || !this.bridgePathway.requiresDelivery) {
      return 0n
    }
    return fee / 100n
  })
  limit = $derived.by(() => {
    const limit = input.limit.value
    if (!limit || limit === 0n) {
      return 0n
    }
    return limit
  })
  limitFromPercent = $derived.by(() => {
    return (this.amountAfterBridgeFee * this.fee) / oneEther
  })
  networkSwitchAssetOutAddress = $derived.by(() => {
    const toChainId = input.bridgeKey.value[2]
    const assetOut = this.assetOut.value
    if (!assetOut) return null
    if (!input.unwrap.value) return assetOut.address
    return nativeAssetOut[toChainId] === assetOut.address ? zeroAddress : assetOut.address
  })
  desiredExcessCompensationBasisPoints = $derived.by(() => {
    const path = pathway(input.bridgeKey.value)
    if (!path?.requiresDelivery) {
      return 0n
    }
    return !this.assetIn.value
      ? 0n
      : input.feeType.value === input.FeeType.PERCENT
        ? 1_000n
        : input.isNative(this.assetIn.value, input.bridgeKey.value)
          ? 1_000n
          : whitelisted.value.has(getAddress(this.assetIn.value.address))
            ? 5_000n
            : 10_000n
  })
  estimatedCost = $derived.by(() => {
    if (!input.shouldDeliver.value) return 0n
    if (input.feeType.value === input.FeeType.PERCENT) {
      return this.limitFromPercent
    }
    if (input.feeType.value === input.FeeType.FIXED) {
      return this.limit
    }
    return this.clampedReimbersement
  })
  assetInAddress = $derived.by(() => {
    return this.assetIn.value?.address
  })
  interactingWithBridgeToken = $derived.by(() => {
    const { toForeign, toHome } = chainEvents.assetLink.value || {}
    const { foreign } = toForeign || {}
    const { home } = toHome || {}
    let assetInAddress = this.assetInAddress
    if (!assetInAddress) return false
    assetInAddress = getAddress(assetInAddress)
    return !!(
      (foreign && getAddress(foreign) === assetInAddress) ||
      (home && getAddress(home) === assetInAddress)
    )
  })
  foreignDataParam = $derived.by(() => {
    if (!this.bridgePathway || !this.assetIn.value) {
      return null
    }
    const destinationRouter = this.bridgePathway.destinationRouter
    if (!destinationRouter || !this.feeDirectorStructEncoded || !chainEvents.assetLink.value) {
      return null
    }
    if (this.bridgePathway.requiresDelivery && !input.shouldDeliver.value) {
      return input.recipient.value
    }
    return concatHex([destinationRouter, this.feeDirectorStructEncoded])
  })
  feeDirectorStructEncoded = $derived.by(() => {
    const priceCorrective = this.priceCorrective.value
    if (!this.assetOut.value || !this.bridgePathway || !priceCorrective) {
      return null
    }
    let multiplier = 0n
    if (input.feeType.value === input.FeeType.GAS_TIP && priceCorrective > 0n) {
      multiplier =
        ((oneEther + this.fee) * 10n ** BigInt(this.assetOut.value.decimals)) / priceCorrective
    } else if (input.feeType.value === input.FeeType.PERCENT) {
      multiplier = this.fee
    }
    if (!isAddress(input.recipient.value)) {
      return null
    }
    return encodeAbiParameters(abis.feeDeliveryStruct, [
      [input.recipient.value, this.feeTypeSettings, this.limit, multiplier],
    ])
  })
  feeTypeSettings = $derived.by(() => {
    const th0 = input.feeType.value === input.FeeType.FIXED ? 1n : 0n
    const st1 = input.unwrap.value ? 1n : 0n
    const nd2 = 1n // always exclude priority when you can
    const rd3 = input.feeType.value === input.FeeType.PERCENT ? 1n : 0n
    return (rd3 << 3n) | (nd2 << 2n) | (st1 << 1n) | th0
  })
  desiredExcessCompensationPercentage = $derived.by(() => {
    return this.desiredExcessCompensationBasisPoints
  })
  desiredCompensationRatio = $derived.by(() => {
    return oneEther + (this.desiredExcessCompensationBasisPoints * oneEther) / 10_000n
  })
  unwrap = $derived.by(() => {
    return input.canChangeUnwrap(input.bridgeKey.value, this.assetIn.value) && input.unwrap.value
  })

  get transactionInputs() {
    // check that path / bridge key is valid
    if (!this.bridgePathway) return null
    // check that recipient is valid
    if (!input.recipient.value || !isAddress(input.recipient.value)) return null
    // check that wallet account is valid
    if (!accountState.address || !isAddress(accountState.address)) return null
    // check that asset in is valid
    if (!this.assetIn.value) return null
    // check that asset link is valid
    if (!chainEvents.assetLink.value) return null
    let value = 0n
    // we are moving "from" this side, so we need to call a function on the "from" address
    // only relevant for the relayTokens(AndCall) pathway outside of native tokens
    let toAddress = this.bridgePathway.from
    let data = '0x' as Hex
    if (this.interactingWithBridgeToken) {
      // when interacting with a bridged token, we need to call the token address directly
      toAddress = this.assetIn.value.address as Hex
      value = 0n
      // if we want delivery of the tokens (going from home to foreign) then we need to have the foreign data param
      // and it needs to start with the destination router
      if (!this.foreignDataParam) return null
      data = this.bridgePathway.usesExtraParam
        ? encodeFunctionData({
            abi: abis.erc677ExtraInput,
            functionName: 'transferAndCall',
            args: [
              this.bridgePathway.from,
              this.amountToBridge,
              this.foreignDataParam,
              accountState.address,
            ],
          })
        : encodeFunctionData({
            abi: abis.erc677,
            functionName: 'transferAndCall',
            args: [this.bridgePathway.from, this.amountToBridge, this.foreignDataParam],
          })
    } else if (this.assetIn.value.address === zeroAddress) {
      value = this.amountToBridge
      toAddress = this.bridgePathway.nativeRouter
      if (this.bridgePathway.feeManager === 'from' && input.shouldDeliver.value) {
        // transferring native to foreign
        if (!this.feeDirectorStructEncoded) return null
        if (!this.bridgePathway.destinationRouter) return null
        data = this.bridgePathway.usesExtraParam
          ? encodeFunctionData({
              abi: abis.nativeRouterExtraInput,
              functionName: 'relayTokensAndCall',
              args: [
                this.bridgePathway.destinationRouter,
                this.feeDirectorStructEncoded,
                accountState.address,
              ],
            })
          : encodeFunctionData({
              abi: abis.nativeRouter,
              functionName: 'relayTokensAndCall',
              args: [this.bridgePathway.destinationRouter, this.feeDirectorStructEncoded],
            })
      } else {
        // delivery always occurs when moving from foreign to home
        data = this.bridgePathway.usesExtraParam
          ? encodeFunctionData({
              abi: abis.nativeRouterExtraInput,
              functionName: 'wrapAndRelayTokens',
              args: [input.recipient.value, accountState.address],
            })
          : encodeFunctionData({
              abi: abis.nativeRouter,
              functionName: 'wrapAndRelayTokens',
              args: [input.recipient.value],
            })
      }
    } else {
      // tokens native to this side, entering the bridge
      if (input.shouldDeliver.value && this.bridgePathway.requiresDelivery) {
        if (!this.feeDirectorStructEncoded) return null
        if (!this.bridgePathway.destinationRouter) return null
        data = this.bridgePathway.usesExtraParam
          ? encodeFunctionData({
              abi: abis.inputBridgeExtraInput,
              functionName: 'relayTokensAndCall',
              args: [
                this.assetIn.value.address as Hex,
                this.bridgePathway.destinationRouter,
                this.amountToBridge,
                this.feeDirectorStructEncoded,
                accountState.address,
              ],
            })
          : encodeFunctionData({
              abi: abis.inputBridge,
              functionName: 'relayTokensAndCall',
              args: [
                this.assetIn.value.address as Hex,
                this.bridgePathway.destinationRouter,
                this.amountToBridge,
                this.feeDirectorStructEncoded,
              ],
            })
      } else {
        data = this.bridgePathway.usesExtraParam
          ? encodeFunctionData({
              abi: abis.inputBridgeExtraInput,
              functionName: 'relayTokens',
              args: [
                this.assetIn.value.address as Hex,
                input.recipient.value,
                this.amountToBridge,
                accountState.address,
              ],
            })
          : encodeFunctionData({
              abi: abis.inputBridge,
              functionName: 'relayTokens',
              args: [this.assetIn.value.address as Hex, input.recipient.value, this.amountToBridge],
            })
      }
    }
    return {
      to: toAddress,
      value,
      data,
    }
  }
}

export const bridgeSettings = new BridgeSettings()

export const updateAssetIn = loading.loadsAfterTick<
  Token | null,
  {
    bridgeKey: BridgeKeyStore
    address: Hex | null
    customTokens: Token[]
  }
>(
  'asset-in',
  async ({
    bridgeKey,
    address,
    customTokens,
  }: {
    bridgeKey: BridgeKeyStore
    address: Hex
    customTokens: Token[]
  }) => {
    if (!address) {
      return null
    }

    const tokensUnderBridgeKey = input.bridgableTokens.bridgeableTokensUnder({
      chain: bridgeKey.fromChain,
      partnerChain: bridgeKey.toChain,
    })
    const foundAssetIn = searchKnownAddresses({
      address,
      customTokens,
      tokensUnderBridgeKey,
    })
    if (foundAssetIn) {
      return foundAssetIn
    }
    return await getAsset(bridgeKey.fromChain, address)
  },
)

export const searchKnownAddresses = ({
  // fromChain,
  // toChain,
  // address,
  tokensUnderBridgeKey,
  customTokens,
  address,
}: {
  // fromChain: Chains
  // toChain: Chains
  address: Hex
  tokensUnderBridgeKey: Token[]
  customTokens: Token[]
}) => {
  return tokensUnderBridgeKey.length
    ? _.find(tokensUnderBridgeKey, { address: getAddress(address) }) ||
        _.find(customTokens, { address: getAddress(address) }) ||
        null
    : null
}

export const getAsset = async (chainId: Chains, assetInAddress: Hex) => {
  if (assetInAddress === zeroAddress) {
    const chain = chainsMetadata[chainId]
    return {
      address: zeroAddress,
      chainId: Number(chainId),
      ...chain.nativeCurrency,
      logoURI: imageLinks.image({
        chainId: Number(chainId),
        address: zeroAddress,
      }),
    }
  }
  const asset = await multicallErc20({
    client: input.clientFromChain(Number(chainId)),
    chain: chainsMetadata[toChain(chainId)],
    target: assetInAddress,
  }).catch(() => null)
  if (!asset) {
    console.log('getAsset failed', assetInAddress)
    return null
  }
  const [name, symbol, decimals] = asset
  return {
    name,
    symbol,
    decimals,
    address: assetInAddress,
    chainId: Number(chainId),
    logoURI: imageLinks.image({
      chainId: Number(chainId),
      address: assetInAddress,
    }),
  } as Token
}

const backupAssetIn = {
  address: zeroAddress,
  name: 'unknown',
  symbol: 'xxx',
  decimals: 18,
  logoURI: '',
  chainId: 369,
} as Token

export const updateAssetOut = ({
  bridgeKey,
  assetInput,
  assetLink,
}: {
  bridgeKey: input.BridgeKeyStore
  assetInput: Token
  assetLink: chainEvents.TokenBridgeInfo
}) => {
  if (!bridgeKey || !assetInput || !assetLink) {
    return resolved(null)
  }
  const { assetOutAddress } = assetLink
  if (!assetOutAddress) {
    return resolved(null)
  }
  if (assetInput.address === zeroAddress) {
    const toChainId = bridgeKey.toChain
    return resolved({
      address: nativeAssetOut[toChainId],
      chainId: Number(toChainId),
      name: `${assetInput.name} from Pulsechain`,
      symbol: `w${assetInput.symbol}`,
      decimals: assetInput.decimals,
      logoURI: imageLinks.image({
        chainId: Number(toChainId),
        address: nativeAssetOut[toChainId],
      }),
      extensions: {
        bridgeInfo: {
          [assetInput.chainId]: {
            tokenAddress: assetInput.address,
          },
        },
      },
    })
  }
  return loading.loadsAfterTick<Token | null>(
    'asset-out',
    async () => {
      const contract = getContract({
        address: assetOutAddress,
        abi: erc20Abi,
        client: input.clientFromChain(Number(bridgeKey.toChain)),
      })
      return contract.read.totalSupply().catch(() => {
        return -1n
      })
    },
    async (data: bigint, abortController: AbortController) => {
      if (data < 0n) {
        abortController.abort()
        return null
      }
      return await multicallErc20({
        client: input.clientFromChain(Number(bridgeKey.toChain)),
        chain: chainsMetadata[bridgeKey.toChain],
        target: assetOutAddress,
      }).catch(() => null)
    },
    (r: Erc20Metadata | null) => {
      const result = r as Erc20Metadata | null
      let res = backupAssetIn
      if (result) {
        const [name, symbol, decimals] = result
        res = {
          name,
          symbol,
          decimals,
          chainId: Number(bridgeKey.toChain),
          address: assetOutAddress,
        } as Token
        res.logoURI = imageLinks.image(res)
      } else {
        // assumptions
        res = {
          ...assetInput,
          chainId: Number(bridgeKey.toChain),
          address: zeroAddress,
          name: `${assetInput.name} from Pulsechain`,
          symbol: `w${assetInput.symbol}`,
        } as Token
      }
      return res
    },
  )()
}
// export const loadAssetOut = loading.loadsAfterTick<TokenOut>()
// export const assetOut = derived(
//   [input.bridgeKey, input.assetIn, chainEvents.assetLink],
//   ([$bridgeKey, $assetIn, assetLink], set) => {
// const fetchAssetOut = loading.loadsAfterTick(
//       'assetout',
//       async ({assetOutAddress, toChainId, client}:{assetOutAddress: Hex, toChainId: Chains, client: PublicClient}) => {
//         const contract = getContract({
//           address: assetOutAddress,
//           abi: erc20Abi,
//           client,
//         })
//         return contract.read.totalSupply().catch(() => {
//           return -1n
//         })
//       },
//       async (data: bigint, cleanup: Cleanup) => {
//         // console.log('fetching asset out', data)
//         if (data < 0n) {
//           cleanup()
//           return null
//         }
//         return await multicallErc20({
//           client: input.clientFromChain(toChainId),
//           chain: chainsMetadata[toChainId],
//           target: assetOutAddress,
//         }).catch(() => null)
//       }
//     )
// export const loadAssetOut = (bridgeKey: input.BridgeKey, assetInput: Token, assetLink: chainEvents.TokenBridgeInfo) => {
//     if (!bridgeKey || !assetInput) {
//       assetOut.set(null)
//       return noop
//     }
//     const toChainId = bridgeKey[2]
//     const assetIn = {
//       ...assetInput,
//       address:
//         assetInput.address === zeroAddress
//           ? nativeAssetOut[bridgeKey[1]]
//           : getAddress(assetInput.address),
//     }
//     // if there is no asset link, then the token is native and has not yet been bridged
//     if (!assetLink) {
//       assetOut.set(null)
//       return noop
//     }
//     const { assetOutAddress } = assetLink
//     if (!assetOutAddress) {
//       assetOut.set({
//         address: null,
//         decimals: assetInput.decimals,
//         chainId: assetInput.chainId,
//         name: `${assetInput.name} from Pulsechain`,
//         symbol: `w${assetInput.symbol}`,
//         extensions: {
//           bridgeInfo: {
//             [assetInput.chainId]: {
//               tokenAddress: assetInput.address,
//             },
//           },
//         },
//       })
//       return noop
//     }
//     const client = input.clientFromChain(toChainId)
//     assetOut.set(null)
//     return loading.loadsAfterTick(
//       'assetout',
//       async () => {
//         const contract = getContract({
//           address: assetOutAddress,
//           abi: erc20Abi,
//           client,
//         })
//         return contract.read.totalSupply().catch(() => {
//           return -1n
//         })
//       },
//       async (data: bigint, cleanup: Cleanup) => {
//         // console.log('fetching asset out', data)
//         if (data < 0n) {
//           cleanup()
//           return null
//         }
//         return await multicallErc20({
//           client: input.clientFromChain(toChainId),
//           chain: chainsMetadata[toChainId],
//           target: assetOutAddress,
//         }).catch(() => null)
//       },
//       (r: Erc20Metadata | null) => {
//         const result = r as Erc20Metadata | null
//         let res = backupAssetIn
//         if (result) {
//           const [name, symbol, decimals] = result
//           res = {
//             name,
//             symbol,
//             decimals,
//             chainId: Number(toChainId),
//             address: assetOutAddress,
//           } as Token
//           res.logoURI = imageLinks.image(res)
//         } else {
//           // assumptions
//           res = {
//             ...assetIn,
//             chainId: Number(toChainId),
//             address: zeroAddress,
//             name: `${assetIn.name} from Pulsechain`,
//             symbol: `w${assetIn.symbol}`,
//           } as Token
//         }
//         return res
//       },
//       set,
//     )
//   },
//   null as TokenOut | null,
// )

// export const networkSwitchAssetOutAddress = (
//   toChainId: Chains,
//   assetOut: TokenOut | null,
//   unwrap: boolean,
// ) => {
//   if (!assetOut) return null
//   if (!unwrap) return assetOut.address
//   return nativeAssetOut[toChainId] === assetOut.address ? zeroAddress : assetOut.address
// }

// export const unwrap = new ProxyStore<boolean>(false)
// export const willUnwrap = (canChangeUnwrap: boolean, unwrapSetting: boolean) => {
//   return canChangeUnwrap && unwrapSetting
// }
// export const unwrap = derived(
//   [input.unwrap, input.canChangeUnwrap],
//   ([$unwrapSetting, $canChangeUnwrap]) => {
//     return $canChangeUnwrap && $unwrapSetting
//   },
// )

export const oneEther = 10n ** 18n

// export const desiredExcessCompensationBasisPoints = derived(
//   [input.assetIn, input.feeType, whitelisted, input.bridgeKey],
//   ([$assetIn, $feeType, $whitelisted, $bridgeKey]) => {
// export const desiredExcessCompensationBasisPoints = (
//   assetIn: Token,
//   feeType: input.FeeType,
//   whitelisted: Set<Hex>,
//   bridgeKey: input.BridgeKey,
// ) => {
//   const path = pathway(bridgeKey)
//   if (!path?.requiresDelivery) {
//     return 0n
//   }
//   return !assetIn
//     ? 0n
//     : feeType === input.FeeType.PERCENT
//       ? 1_000n
//       : input.isNative(assetIn, bridgeKey)
//         ? 1_000n
//         : whitelisted.has(getAddress(assetIn.address))
//           ? 5_000n
//           : 10_000n
// }
// // )

// export const desiredCompensationRatio = (desiredExcessCompensationBasisPoints: bigint) => {
//   return oneEther + (desiredExcessCompensationBasisPoints * oneEther) / 10_000n
// }

// export const desiredExcessCompensationPercentage = (
//   desiredExcessCompensationBasisPoints: bigint,
// ) => {
//   return formatUnits(desiredExcessCompensationBasisPoints, 2)
// }

// export const oneTokenInt = (assetIn: Token) => {
//   return assetIn ? 10n ** BigInt(assetIn.decimals) : 1n
// }

type FetchResult = bigint[] | Hex
const fetchCache = new Map<
  string,
  {
    time: number
    result: Promise<FetchResult[]>
  }
>()
setInterval(() => {
  const now = Date.now()
  for (const [k, cached] of fetchCache.entries()) {
    if (cached.time + 10_000 < now) {
      fetchCache.delete(k)
    }
  }
}, 3_000)

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
const readAmountOut = (
  $assetInAddress: Hex,
  $oneTokenInt: bigint,
  chain: Chains,
  $bridgeKey: input.BridgeKeyStore,
  blockNumber: bigint,
  paths: Hex[][],
): Promise<FetchResult[]> => {
  const key =
    `${chain}-${$bridgeKey.value}-${blockNumber}-${$assetInAddress}-${$oneTokenInt}`.toLowerCase()
  const res = fetchCache.get(key)
  if (res) {
    return res.result
  }
  const q = multicallRead<FetchResult[]>({
    chain: chainsMetadata[chain],
    client: input.clientFromChain(Number(chain)),
    abi: abis.univ2Router,
    // pulsex router
    calls: _.flatMap(uniV2Routers[chain], (target) =>
      paths.map((path) => ({
        functionName: 'getAmountsOut',
        allowFailure: true,
        args: [$oneTokenInt, path],
        target,
      })),
    ),
  })
  fetchCache.set(key, {
    time: Date.now(),
    result: q,
  })
  return q
}

// /** the number of tokens to push into the bridge (before fees) */
// export const amountToBridge = (amountIn: string, assetIn: Token) => {
//   if (isZero(amountIn) || !assetIn) return 0n
//   return parseUnits(stripNonNumber(amountIn), assetIn.decimals)
// }
// export const priceCorrective = derived(
//   [
//     input.bridgeKey,
//     oneTokenInt,
//     chainEvents.assetLink,
//     assetOut,
//     amountToBridge,
//     chainEvents.destination.block,
//   ],
//   ([$bridgeKey, $oneTokenInt, $assetLink, $assetOut, $amountToBridge, $block], set) => {
type PriceCorrectiveInputs = {
  bridgeKey: input.BridgeKeyStore
  assetOut: Token | null
  assetLink: chainEvents.TokenBridgeInfo | null
  block: Block | null
  amountToBridge: bigint
}
export const loadPriceCorrective = ({
  bridgeKey,
  assetOut,
  assetLink,
  block,
  amountToBridge,
}: PriceCorrectiveInputs) => {
  if (!assetLink?.assetOutAddress || !assetOut || !assetOut.address || !block || !bridgeKey) {
    return resolved<bigint>(oneEther)
  }
  const oneToken = $derived(1n ** BigInt(assetOut.decimals))
  // the max fee i am targeting is 10%
  let aboutToBridge = amountToBridge / 10n
  if (aboutToBridge === 0n) {
    aboutToBridge = parseUnits('10', assetOut.decimals)
  }
  const [, fromChain, toChain] = bridgeKey.value
  const measurementToken = nativeAssetOut[toChain]
  const outputFromRouter = (result: FetchResult) => {
    if (_.isString(result)) {
      return 0n
    }
    if (!result.length) {
      return 0n
    }
    const last = result[result.length - 1]
    return (last * oneToken) / aboutToBridge
  }
  return loading.loadsAfterTick<bigint>(
    'gas',
    async () =>
      // fetch the token bridge info for the token that is about to be spent by the delivery service
      await chainEvents.tokenBridgeInfo(bridgeKey.partner, {
        ...assetOut,
        address: measurementToken,
      }),
    async (paymentTokenResult: chainEvents.TokenBridgeInfo) => {
      // for a bridge going from foreign to home,
      // use the destination token as the measurement token for the home side
      const homeBridgedPaymentToken = paymentTokenResult!.assetOutAddress!
      return await Promise.all([
        readAmountOut(
          assetLink.assetInAddress,
          aboutToBridge,
          fromChain,
          bridgeKey,
          block!.number!,
          [
            // check the direct route
            [assetLink.assetInAddress, homeBridgedPaymentToken],
            // might have heavier liquidity going through the native asset on the home side
            [assetLink.assetInAddress, nativeAssetOut[fromChain], homeBridgedPaymentToken],
          ],
        ),
        readAmountOut(
          assetOut.address as Hex, //
          aboutToBridge,
          toChain, //
          bridgeKey, //
          block!.number!,
          // only the direct route is available.
          // might be able to create a whitelist for this at some point
          [[assetOut.address as Hex, measurementToken]],
        ),
      ])
    },
    (results: [FetchResult[], FetchResult[]]) => {
      const max = (amountsOut: (bigint | undefined)[]) => {
        return _.compact(amountsOut).reduce((max, current) => (max < current ? current : max), 0n)
      }
      const [outputs, inputs] = results
      const outputAmounts = outputs.map(outputFromRouter)
      const inputAmounts = inputs.map(outputFromRouter)
      const outputToken = max(outputAmounts)
      const inputToken = max(inputAmounts)
      return outputToken && outputToken > 0n
        ? inputToken && inputToken > outputToken && inputToken / outputToken === 1n
          ? inputToken
          : outputToken
        : inputToken
    },
  )()
}

/**
 * the oneTokenInt, estimated cost for running a transaction
 * on the foreign network, given current gas conditions
 */
// export const estimatedNetworkCost = ({
//   bridgePathway,
//   estimatedGas,
//   latestBaseFeePerGas,
//   priceCorrective,
//   oneTokenInt,
// }: {
//   bridgePathway: Pathway
//   estimatedGas: bigint
//   latestBaseFeePerGas: bigint
//   priceCorrective: bigint
//   oneTokenInt: bigint
// }) => {
//   if (!priceCorrective || !bridgePathway?.requiresDelivery) {
//     return 0n
//   }
//   return BigInt((estimatedGas * latestBaseFeePerGas * oneTokenInt) / priceCorrective)
// }
/** the maximum number of tokens that the user wishes to pay in fees */
// export const limit = ({ limit, assetIn }: { limit: string; assetIn: Token }) => {
//   if (isZero(limit) || !assetIn) return 0n
//   return parseUnits(stripNonNumber(limit), assetIn.decimals)
// }
// export const fee = ({ fee, bridgePathway }: { fee: string; bridgePathway: Pathway }) => {
//   if (isZero(fee) || !bridgePathway || !bridgePathway.requiresDelivery) return 0n
//   return parseUnits(stripNonNumber(fee), 18) / 100n
// }

// export const bridgeFee = (bridgeKey: input.BridgeKey) => {
//   const setting = settings.get(bridgeKey)
//   const path = pathway(bridgeKey)
//   return (path?.toHome ? setting?.feeF2H : setting?.feeH2F) || 0n
// }

// /** the number of tokens charged as fee for crossing the bridge */
// export const bridgeCost = ({
//   amountToBridge,
//   bridgeFee,
// }: {
//   amountToBridge: bigint
//   bridgeFee: bigint
// }) => {
//   return (amountToBridge * bridgeFee) / oneEther
// }
// /** the number of tokens available after they have crossed the bridge */
// export const amountAfterBridgeFee = ({
//   amountToBridge,
//   bridgeCost,
// }: {
//   amountToBridge: bigint
//   bridgeCost: bigint
// }) => {
//   const afterFee = amountToBridge - bridgeCost
//   if (afterFee < 0n) return 0n
//   return afterFee
// }

// export const limitFromPercent = ({
//   fee,
//   amountAfterBridgeFee,
// }: {
//   fee: bigint
//   amountAfterBridgeFee: bigint
// }) => {
//   return (amountAfterBridgeFee * fee) / oneEther
// }

// /** the estimated network cost + tip */
// export const baseFeeReimbersement = ({
//   estimatedNetworkCost,
//   fee,
// }: {
//   estimatedNetworkCost: bigint
//   fee: bigint
// }) => {
//   return (estimatedNetworkCost * (oneEther + fee)) / oneEther
// }

// /** the fee, clamped to the user defined limit */
// export const clampedReimbersement = ({
//   baseFeeReimbersement,
//   limit,
//   feeType,
//   limitFromPercent,
// }: {
//   baseFeeReimbersement: bigint
//   limit: bigint
//   feeType: input.FeeType
//   limitFromPercent: bigint
// }) => {
//   if (feeType === input.FeeType.PERCENT) {
//     return limitFromPercent
//   }
//   return baseFeeReimbersement > limit ? limit : baseFeeReimbersement
// }
// /** the estimated cost given the choice for a fixed fee, limit and incentive fee */
// export const estimatedCost = ({
//   feeType,
//   limit,
//   limitFromPercent,
//   clampedReimbersement,
//   shouldDeliver,
// }: {
//   feeType: input.FeeType
//   limit: bigint
//   limitFromPercent: bigint
//   clampedReimbersement: bigint
//   shouldDeliver: boolean
// }) => {
//   if (!shouldDeliver) return 0n
//   if (feeType === input.FeeType.PERCENT) {
//     return limitFromPercent
//   }
//   if (feeType === input.FeeType.FIXED) {
//     return limit
//   }
//   return clampedReimbersement
// }
// export const estimatedCost = derived(
//   [input.feeType, limit, limitFromPercent, clampedReimbersement, input.shouldDeliver],
//   ([$feeType, $limit, $limitFromPercent, $clampedReimbersement, $shouldDeliver]) => {
//     if (!$shouldDeliver) return 0n
//     if ($feeType === input.FeeType.PERCENT) {
//       return $limitFromPercent
//     }
//     if ($feeType === input.FeeType.FIXED) {
//       return $limit
//     }
//     return $clampedReimbersement
//   },
// )
// /** creates the settings param for the fee director struct */
// export const feeTypeSettings = ({
//   feeType,
//   unwrap,
// }: {
//   feeType: input.FeeType
//   unwrap: boolean
// }) => {
//   const th0 = feeType === input.FeeType.FIXED ? 1n : 0n
//   const st1 = unwrap ? 1n : 0n
//   const nd2 = 1n // always exclude priority when you can
//   const rd3 = feeType === input.FeeType.PERCENT ? 1n : 0n
//   return (rd3 << 3n) | (nd2 << 2n) | (st1 << 1n) | th0
// }

// /** the encoded struct to be passed to the foreign router */
// export const feeDirectorStructEncoded = ({
//   bridgePathway,
//   recipient,
//   feeTypeSettings,
//   limit,
//   fee,
//   feeType,
//   assetOut,
//   priceCorrective,
// }: {
//   bridgePathway: Pathway
//   recipient: Hex
//   feeTypeSettings: bigint
//   limit: bigint
//   fee: bigint
//   feeType: input.FeeType
//   assetOut: Token
//   priceCorrective: bigint
// }) => {
//   if (!assetOut || !bridgePathway) {
//     return null
//   }
//   let multiplier = 0n
//   if (feeType === input.FeeType.GAS_TIP && priceCorrective > 0n) {
//     multiplier = ((oneEther + fee) * 10n ** BigInt(assetOut.decimals)) / priceCorrective
//   } else if (feeType === input.FeeType.PERCENT) {
//     multiplier = fee
//   }
//   if (!isAddress(recipient)) {
//     return null
//   }
//   return encodeAbiParameters(abis.feeDeliveryStruct, [
//     [recipient, feeTypeSettings, limit, multiplier],
//   ])
// }
// export const feeDirectorStructEncoded = derived(
//   [
//     input.bridgePathway,
//     input.recipient,
//     feeTypeSettings,
//     limit,
//     fee,
//     input.feeType,
//     assetOut,
//     priceCorrective,
//   ],
//   ([
//     $bridgePathway,
//     $recipient,
//     $feeTypeSettings,
//     $limit,
//     $fee,
//     $feeType,
//     $assetOut,
//     $priceCorrective,
//   ]) => {
//     if (!$assetOut || !$bridgePathway) {
//       return null
//     }
//     let multiplier = 0n
//     if ($feeType === input.FeeType.GAS_TIP && $priceCorrective > 0n) {
//       multiplier = ((oneEther + $fee) * 10n ** BigInt($assetOut.decimals)) / $priceCorrective
//     } else if ($feeType === input.FeeType.PERCENT) {
//       multiplier = $fee
//     }
//     if (!isAddress($recipient)) {
//       return null
//     }
//     return encodeAbiParameters(abis.feeDeliveryStruct, [
//       [$recipient, $feeTypeSettings, $limit, multiplier],
//     ])
//   },
// )

// export const interactingWithBridgeToken = ({
//   assetIn,
//   assetLink,
// }: {
//   assetIn: Token
//   assetLink: chainEvents.TokenBridgeInfo
// }) => {
//   const { toForeign, toHome } = assetLink || {}
//   const { foreign } = toForeign || {}
//   const { home } = toHome || {}
//   let assetInAddress = assetIn?.address
//   if (!assetInAddress) return false
//   assetInAddress = getAddress(assetInAddress)
//   return !!(
//     (foreign && getAddress(foreign) === assetInAddress) ||
//     (home && getAddress(home) === assetInAddress)
//   )
// }
/**
 * the full calldata defined in the home bridge's _data prop
 * to be used to call on the foreign router
 */
// export const foreignDataParam = ({
//   bridgePathway,
//   assetIn,
//   assetLink,
//   destinationRouter,
//   feeDirectorStructEncoded,
//   recipient,
//   shouldDeliver,
// }: {
//   bridgePathway: Pathway
//   assetIn: Token
//   assetLink: chainEvents.TokenBridgeInfo
//   destinationRouter: Hex
//   feeDirectorStructEncoded: Hex
//   recipient: Hex
//   shouldDeliver: boolean
// }) => {
//   if (!bridgePathway || !assetIn) {
//     return null
//   }
//   if (!destinationRouter || !feeDirectorStructEncoded || !assetLink) {
//     return null
//   }
//   if (bridgePathway.requiresDelivery && !shouldDeliver) {
//     return recipient
//   }
//   return concatHex([destinationRouter, feeDirectorStructEncoded])
// }
// export const foreignDataParam = derived(
//   [
//     input.bridgePathway,
//     input.assetIn,
//     chainEvents.assetLink,
//     input.destinationRouter,
//     feeDirectorStructEncoded,
//     input.recipient,
//     input.shouldDeliver,
//   ],
//   ([
//     $bridgePathway,
//     $assetIn,
//     $assetLink,
//     $destinationRouter,
//     $feeDirectorStructEncoded,
//     $recipient,
//     $shouldDeliver,
//   ]) => {
//     if (!$bridgePathway || !$assetIn) {
//       return null
//     }
//     if (!$destinationRouter || !$feeDirectorStructEncoded || !$assetLink) {
//       return null
//     }
//     if ($bridgePathway.requiresDelivery && !$shouldDeliver) {
//       return $recipient
//     }
//     return concatHex([$destinationRouter, $feeDirectorStructEncoded])
//   },
// )
// export const foreignCalldata = derived(
//   [assetOut, input.shouldDeliver, amountAfterBridgeFee, feeDirectorStructEncoded],
//   ([$assetOut, $shouldDeliver, $amountAfterBridgeFee, $feeDirectorStructEncoded]) => {
//     if (!$feeDirectorStructEncoded || !$assetOut) {
//       return null
//     }
//     if (!$shouldDeliver) {
//       return '0x' as Hex
//     }
//     return encodeFunctionData({
//       abi: abis.outputRouter,
//       functionName: 'onTokenBridged',
//       args: [$assetOut.address, $amountAfterBridgeFee, $feeDirectorStructEncoded],
//     })
//   },
// )

/**
 * the inputs to the transaction that will be signed over by the user's wallet
 * this transaction transfers to the relevant bridge address and the user's amount that they wish to bridge before fees
 * it also contains calldata that is shuttled over to the foreign network
 * to be executed there after validator signatures are provided
 */
// export const transactionInputs = ({
//   walletAccount,
//   recipient,
//   assetIn,
//   destinationRouter,
//   shouldDeliver,
//   assetLink,
//   bridgePathway,
//   amountToBridge,
//   foreignDataParam,
//   feeDirectorStructEncoded,
//   interactingWithBridgeToken,
// }: {
//   walletAccount: Hex
//   recipient: Hex
//   assetIn: Token
//   destinationRouter: Hex
//   shouldDeliver: boolean
//   assetLink: chainEvents.TokenBridgeInfo
//   bridgePathway: Pathway
//   amountToBridge: bigint
//   foreignDataParam: Hex
//   feeDirectorStructEncoded: Hex
//   interactingWithBridgeToken: boolean
// }) => {
//   // check that path / bridge key is valid
//   if (!bridgePathway) return null
//   // check that recipient is valid
//   if (!recipient || !isAddress(recipient)) return null
//   // check that wallet account is valid
//   if (!walletAccount || !isAddress(walletAccount)) return null
//   // check that asset in is valid
//   if (!assetIn) return null
//   // check that asset link is valid
//   if (!assetLink) return null
//   let value = 0n
//   // we are moving "from" this side, so we need to call a function on the "from" address
//   // only relevant for the relayTokens(AndCall) pathway outside of native tokens
//   let toAddress = bridgePathway.from
//   let data = '0x' as Hex
//   if (interactingWithBridgeToken) {
//     // when interacting with a bridged token, we need to call the token address directly
//     toAddress = assetIn.address
//     value = 0n
//     // if we want delivery of the tokens (going from home to foreign) then we need to have the foreign data param
//     // and it needs to start with the destination router
//     if (!foreignDataParam) return null
//     data = bridgePathway.usesExtraParam
//       ? encodeFunctionData({
//           abi: abis.erc677ExtraInput,
//           functionName: 'transferAndCall',
//           args: [bridgePathway.from, amountToBridge, foreignDataParam, walletAccount],
//         })
//       : encodeFunctionData({
//           abi: abis.erc677,
//           functionName: 'transferAndCall',
//           args: [bridgePathway.from, amountToBridge, foreignDataParam],
//         })
//   } else if (assetIn.address === zeroAddress) {
//     value = amountToBridge
//     toAddress = bridgePathway.nativeRouter
//     if (bridgePathway.feeManager === 'from' && shouldDeliver) {
//       // transferring native to foreign
//       if (!feeDirectorStructEncoded) return null
//       if (!destinationRouter) return null
//       data = bridgePathway.usesExtraParam
//         ? encodeFunctionData({
//             abi: abis.nativeRouterExtraInput,
//             functionName: 'relayTokensAndCall',
//             args: [destinationRouter, feeDirectorStructEncoded, walletAccount],
//           })
//         : encodeFunctionData({
//             abi: abis.nativeRouter,
//             functionName: 'relayTokensAndCall',
//             args: [destinationRouter, feeDirectorStructEncoded],
//           })
//     } else {
//       // delivery always occurs when moving from foreign to home
//       data = bridgePathway.usesExtraParam
//         ? encodeFunctionData({
//             abi: abis.nativeRouterExtraInput,
//             functionName: 'wrapAndRelayTokens',
//             args: [recipient, walletAccount],
//           })
//         : encodeFunctionData({
//             abi: abis.nativeRouter,
//             functionName: 'wrapAndRelayTokens',
//             args: [recipient],
//           })
//     }
//   } else {
//     // tokens native to this side, entering the bridge
//     if (shouldDeliver && bridgePathway.requiresDelivery) {
//       if (!feeDirectorStructEncoded) return null
//       if (!destinationRouter) return null
//       data = bridgePathway.usesExtraParam
//         ? encodeFunctionData({
//             abi: abis.inputBridgeExtraInput,
//             functionName: 'relayTokensAndCall',
//             args: [
//               assetIn.address,
//               destinationRouter,
//               amountToBridge,
//               feeDirectorStructEncoded,
//               walletAccount,
//             ],
//           })
//         : encodeFunctionData({
//             abi: abis.inputBridge,
//             functionName: 'relayTokensAndCall',
//             args: [assetIn.address, destinationRouter, amountToBridge, feeDirectorStructEncoded],
//           })
//     } else {
//       data = bridgePathway.usesExtraParam
//         ? encodeFunctionData({
//             abi: abis.inputBridgeExtraInput,
//             functionName: 'relayTokens',
//             args: [assetIn.address, recipient, amountToBridge, walletAccount],
//           })
//         : encodeFunctionData({
//             abi: abis.inputBridge,
//             functionName: 'relayTokens',
//             args: [assetIn.address, recipient, amountToBridge],
//           })
//     }
//   }
//   return {
//     to: toAddress,
//     value,
//     data,
//   }
// }
// export const transactionInputs = derived(
//   [
//     walletAccount,
//     input.recipient,
//     input.assetIn,
//     input.destinationRouter,
//     input.shouldDeliver,
//     chainEvents.assetLink,
//     input.bridgePathway,
//     amountToBridge,
//     foreignDataParam,
//     feeDirectorStructEncoded,
//     interactingWithBridgeToken,
//   ],
//   ([
//     $walletAccount,
//     $recipient,
//     $assetIn,
//     $destinationRouter,
//     $shouldDeliver,
//     $assetLink,
//     $bridgePathway,
//     $amountToBridge,
//     $foreignDataParam,
//     $feeDirectorStructEncoded,
//     $interactingWithBridgeToken,
//   ]) => {
//     // check that path / bridge key is valid
//     if (!$bridgePathway) return null
//     // check that recipient is valid
//     if (!$recipient || !isAddress($recipient)) return null
//     // check that wallet account is valid
//     if (!$walletAccount || !isAddress($walletAccount)) return null
//     // check that asset in is valid
//     if (!$assetIn) return null
//     // check that asset link is valid
//     if (!$assetLink) return null
//     let value = 0n
//     // we are moving "from" this side, so we need to call a function on the "from" address
//     // only relevant for the relayTokens(AndCall) pathway outside of native tokens
//     let toAddress = $bridgePathway.from
//     let data = '0x' as Hex
//     if ($interactingWithBridgeToken) {
//       // when interacting with a bridged token, we need to call the token address directly
//       toAddress = $assetIn.address
//       value = 0n
//       // if we want delivery of the tokens (going from home to foreign) then we need to have the foreign data param
//       // and it needs to start with the destination router
//       if (!$foreignDataParam) return null
//       data = $bridgePathway.usesExtraParam
//         ? encodeFunctionData({
//             abi: abis.erc677ExtraInput,
//             functionName: 'transferAndCall',
//             args: [$bridgePathway.from, $amountToBridge, $foreignDataParam, $walletAccount],
//           })
//         : encodeFunctionData({
//             abi: abis.erc677,
//             functionName: 'transferAndCall',
//             args: [$bridgePathway.from, $amountToBridge, $foreignDataParam],
//           })
//     } else if ($assetIn.address === zeroAddress) {
//       value = $amountToBridge
//       toAddress = $bridgePathway.nativeRouter
//       if ($bridgePathway.feeManager === 'from' && $shouldDeliver) {
//         // transferring native to foreign
//         if (!$feeDirectorStructEncoded) return null
//         if (!$destinationRouter) return null
//         data = $bridgePathway.usesExtraParam
//           ? encodeFunctionData({
//               abi: abis.nativeRouterExtraInput,
//               functionName: 'relayTokensAndCall',
//               args: [$destinationRouter, $feeDirectorStructEncoded, $walletAccount],
//             })
//           : encodeFunctionData({
//               abi: abis.nativeRouter,
//               functionName: 'relayTokensAndCall',
//               args: [$destinationRouter, $feeDirectorStructEncoded],
//             })
//       } else {
//         // delivery always occurs when moving from foreign to home
//         data = $bridgePathway.usesExtraParam
//           ? encodeFunctionData({
//               abi: abis.nativeRouterExtraInput,
//               functionName: 'wrapAndRelayTokens',
//               args: [$recipient, $walletAccount],
//             })
//           : encodeFunctionData({
//               abi: abis.nativeRouter,
//               functionName: 'wrapAndRelayTokens',
//               args: [$recipient],
//             })
//       }
//     } else {
//       // tokens native to this side, entering the bridge
//       if ($shouldDeliver && $bridgePathway.requiresDelivery) {
//         if (!$feeDirectorStructEncoded) return null
//         if (!$destinationRouter) return null
//         data = $bridgePathway.usesExtraParam
//           ? encodeFunctionData({
//               abi: abis.inputBridgeExtraInput,
//               functionName: 'relayTokensAndCall',
//               args: [
//                 $assetIn.address,
//                 $destinationRouter,
//                 $amountToBridge,
//                 $feeDirectorStructEncoded,
//                 $walletAccount,
//               ],
//             })
//           : encodeFunctionData({
//               abi: abis.inputBridge,
//               functionName: 'relayTokensAndCall',
//               args: [
//                 $assetIn.address,
//                 $destinationRouter,
//                 $amountToBridge,
//                 $feeDirectorStructEncoded,
//               ],
//             })
//       } else {
//         data = $bridgePathway.usesExtraParam
//           ? encodeFunctionData({
//               abi: abis.inputBridgeExtraInput,
//               functionName: 'relayTokens',
//               args: [$assetIn.address, $recipient, $amountToBridge, $walletAccount],
//             })
//           : encodeFunctionData({
//               abi: abis.inputBridge,
//               functionName: 'relayTokens',
//               args: [$assetIn.address, $recipient, $amountToBridge],
//             })
//       }
//     }
//     return {
//       to: toAddress,
//       value,
//       data,
//     }
//   },
// )

/** the sources of the asset, including the wrapped asset if it exists */
export const assetSources = (
  asset: {
    chainId: number
    address: string
    extensions?: {
      bridgeInfo?: {
        [chainId: string]: {
          tokenAddress: string
        }
      }
      wrapped?: {
        address: string
      }
    }
  } | null,
) => {
  if (!asset) {
    return ''
  }
  type MinTokenInfo = Pick<Token, 'chainId' | 'address'>
  const { chainId, address, extensions } = asset
  const inputs = _.compact(
    _.flatten([
      { chainId, address },
      extensions?.wrapped ? { chainId, address: extensions.wrapped.address } : null,
      ...Object.entries(extensions?.bridgeInfo || {}).map(([chainId, info]) => {
        if (!info.tokenAddress) {
          return null
        }
        const otherSide = [
          {
            chainId: Number(chainId),
            address: info.tokenAddress,
          },
        ]
        if (address === nativeAssetOut[toChain(asset.chainId)]) {
          otherSide.push({
            chainId: asset.chainId,
            address: zeroAddress,
          })
        }
        if (info.tokenAddress === nativeAssetOut[toChain(+chainId)]) {
          otherSide.push({
            chainId: Number(chainId),
            address: zeroAddress,
          })
        }
        return otherSide
      }),
    ]),
  )
  const sorted = _.sortBy(inputs, [(a: MinTokenInfo) => a.chainId]) as MinTokenInfo[]
  const sources = sorted.map((a: MinTokenInfo) => `${a.chainId}/${a.address}`.toLowerCase())
  return imageLinks.images(sources)
}

export const findAssetByUnique = (
  {
    allBridgeableTokens,
    fromChainId,
    // toChainId,
    address,
  }: {
    allBridgeableTokens: Token[]
    fromChainId: number
    // toChainId: number,
    address: Hex
  },
  // allBridgeableTokens: Token[],
  // fromChainId: number,
  // toChainId: number,
  // address: Hex,
) => {
  const addr = getAddress(address)
  return (
    allBridgeableTokens.find((t) => t.chainId === fromChainId && getAddress(t.address) === addr) ||
    // allBridgeableTokens.find((t) => t.chainId === toChainId && getAddress(t.address) === addr) ||
    allBridgeableTokens.find((t) =>
      t.extensions?.bridgeInfo?.[fromChainId]?.tokenAddress
        ? getAddress(t.extensions.bridgeInfo[fromChainId].tokenAddress) === addr
        : false,
    )
  )
  // return $bridgeableTokens.find(
  //   (t) =>
  //     (t.chainId === fromChainId && getAddress(t.address) === addr) ||
  //     (t.chainId === toChainId && getAddress(t.address) === addr) ||
  //     (t.extensions?.bridgeInfo?.[fromChainId]?.tokenAddress
  //       ? getAddress(t.extensions.bridgeInfo[fromChainId].tokenAddress) === addr
  //       : false) ||
  //     (t.extensions?.bridgeInfo?.[toChainId]?.tokenAddress
  //       ? getAddress(t.extensions.bridgeInfo[toChainId].tokenAddress) === addr
  //       : false),
  // )
}

// // export const details = writable<null | 'settings' | 'details'>(null)
export type ExtraDataOptions = 'settings' | 'details'
export type ExtraDataSettings = ExtraDataOptions | null
export const details = new NullableProxyStore<ExtraDataOptions>()
