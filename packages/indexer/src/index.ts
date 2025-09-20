import { Context, ponder } from 'ponder:registry'
import _ from 'lodash'
import {
  Token,
  AffirmationCompleted,
  // CollectedSignatures,
  FeeDirector,
  LatestRequiredSignaturesChanged,
  RelayedMessage,
  RequiredSignaturesChanged,
  ReverseMessageHashBinding,
  SignedForAffirmation,
  SignedForUserRequest,
  UserRequestForAffirmation,
  UserRequestForSignature,
  ValidatorStatusUpdate,
  LatestValidatorStatusUpdate,
} from 'ponder:schema'
import { type Hex } from 'viem'
import { parseAMBMessage } from './message'
import { getOmniFromValidator, createOrderId, bridgeInfo, getOmniFromAmb } from './utils'
import {
  getLatestRequiredSignatures,
  upsertBridge,
  upsertBlock,
  upsertTransaction,
} from './cache'
import type { SignatureEvent } from './config'

ponder.on('ValidatorContract:ValidatorAdded', async ({ event, context }) => {
  console.log(
    'validator %o on %o added',
    event.args.validator,
    context.chain.id,
  )
  const bridgeAddress = await getOmniFromValidator(event.log.address)
  const orderId = createOrderId(context, event)
  console.log('chain_id=%o address=%o', context.chain.id, bridgeAddress)
  await Promise.all([
    upsertBridge(context, bridgeAddress),
    upsertBlock(context, event.block),
    upsertTransaction(context, event.block, event.transaction),
    context.db
      .insert(LatestValidatorStatusUpdate)
      .values({
        chainId: BigInt(context.chain.id),
        bridgeAddress,
        validatorAddress: event.args.validator.toLowerCase() as Hex,
        orderId,
      })
      .onConflictDoUpdate(() => ({
        orderId,
      })),
    context.db.insert(ValidatorStatusUpdate).values({
      orderId,
      bridgeAddress,
      validatorAddress: event.args.validator.toLowerCase() as Hex,
      chainId: BigInt(context.chain.id),
      blockHash: event.block.hash,
      transactionHash: event.transaction.hash,
      value: true,
      logIndex: event.log.logIndex,
    }),
  ])
})

ponder.on('ValidatorContract:ValidatorRemoved', async ({ event, context }) => {
  console.log(
    'validator %o on %o removed',
    event.args.validator,
    context.chain.id,
  )
  const bridgeAddress = await getOmniFromValidator(event.log.address)
  const orderId = createOrderId(context, event)
  console.log('chain_id=%o address=%o', context.chain.id, bridgeAddress)
  await Promise.all([
    upsertBridge(context, bridgeAddress),
    upsertBlock(context, event.block),
    upsertTransaction(context, event.block, event.transaction),
    context.db
      .insert(LatestValidatorStatusUpdate)
      .values({
        chainId: BigInt(context.chain.id),
        bridgeAddress,
        validatorAddress: event.args.validator.toLowerCase() as Hex,
        orderId,
      })
      .onConflictDoUpdate(() => ({
        orderId,
      })),
    context.db.insert(ValidatorStatusUpdate).values({
      orderId,
      bridgeAddress,
      validatorAddress: event.args.validator.toLowerCase() as Hex,
      chainId: BigInt(context.chain.id),
      blockHash: event.block.hash,
      transactionHash: event.transaction.hash,
      value: false,
      logIndex: event.log.logIndex,
    }),
  ])
})

ponder.on(
  'ValidatorContract:RequiredSignaturesChanged',
  async ({ event, context }) => {
    const bridgeAddress = await getOmniFromValidator(event.log.address)
    const orderId = createOrderId(context, event)
    console.log('required signatures changed address=%o required=%o',
      bridgeAddress, event.args.requiredSignatures)
    await Promise.all([
      upsertBridge(context, bridgeAddress),
      upsertBlock(context, event.block),
      upsertTransaction(context, event.block, event.transaction),
      context.db
        .insert(LatestRequiredSignaturesChanged)
        .values({
          chainId: BigInt(context.chain.id),
          bridgeAddress: bridgeAddress.toLowerCase() as Hex,
          orderId,
        })
        .onConflictDoUpdate(() => ({
          orderId,
        })),
      context.db.insert(RequiredSignaturesChanged).values({
        orderId,
        bridgeAddress: bridgeAddress.toLowerCase() as Hex,
        value: event.args.requiredSignatures,
        chainId: BigInt(context.chain.id),
        blockHash: event.block.hash,
        transactionHash: event.transaction.hash,
        logIndex: event.log.logIndex,
      }),
    ])
  },
)

const getOutstandingMessageIdByHash = async (
  context: Context,
  hash: Hex,
): Promise<Hex | null> => {
  const messageHash = hash
  const binding = await context.db.find(ReverseMessageHashBinding, {
    messageHash,
  })
  if (!binding) {
    console.warn('reverse message hash binding not found', messageHash)
    return null
  }
  return binding!.messageId
}

const loadToken = async (inputs: {
  context: Context,
  tokenAddress: Hex,
  tokenChainId: bigint,
  orderId: bigint,
  ambAddress: Hex,
  requireExisting?: boolean,
}) => {
  const { context, tokenAddress, tokenChainId, orderId, ambAddress, requireExisting = false } = inputs
  const token = await context.db.find(Token, {
    address: tokenAddress.toLowerCase() as Hex,
    chainId: tokenChainId,
    ambAddress,
  })
  if (token) {
    return token
  }
  if (requireExisting) {
    throw new Error(`Token not found for address ${tokenAddress} on chain ${tokenChainId} and amb address ${ambAddress}`)
  }
  // if (tokenAddress.toLowerCase() === '0x95b303987a60c71504d99aa1b13b4da07b0790ab' && tokenChainId === 1n) {
  //   console.trace('loading token', tokenAddress, tokenChainId, ambAddress)
  // }
  // console.log('loading token=%o chain=%o amb=%o', tokenAddress, tokenChainId, ambAddress)
  return await context.db.insert(Token).values({
    address: tokenAddress.toLowerCase() as Hex,
    chainId: tokenChainId,
    ambAddress,
    // ...metadata,
    originationChainId: tokenChainId,
    originationAddress: tokenAddress.toLowerCase() as Hex,
    originationAmbAddress: ambAddress,
    destinationChainId: null,
    destinationAddress: null,
    destinationAmbAddress: null,
    orderId,
  }).onConflictDoNothing()
}
// const call = <T extends 'symbol' | 'name' | 'decimals'>(tokenAddress: Hex, functionName: T, abi: typeof erc20Abi | typeof erc20Abi_bytes32 = erc20Abi) => ({
//   abi,
//   functionName,
//   args: [],
//   address: tokenAddress as Hex,
//   allowFailure: false,
// } as const)

// const loadTokenMetadata = async ({ context, tokenAddress }: {
//   context: Context,
//   tokenAddress: Hex,
// }) => {
//   const address = tokenAddress as Hex
//   try {
//     const [symbolResult, nameResult, decimalsResult] = await context.client.multicall({
//       contracts: [
//         call(address, 'symbol'),
//         call(address, 'name'),
//         call(address, 'decimals'),
//       ],
//     })
//     if (isValidMetadataResult(symbolResult, nameResult, decimalsResult)) {
//       return {
//         symbol: symbolResult.result!,
//         name: nameResult.result!,
//         decimals: BigInt(decimalsResult.result!),
//       }
//     }
//   } catch (err) {
//     console.log(err)
//   }

//   const [symbolResult, nameResult, decimalsResult] = await context.client.multicall({
//     contracts: [
//       call(address, 'symbol', erc20Abi_bytes32),
//       call(address, 'name', erc20Abi_bytes32),
//       call(address, 'decimals', erc20Abi_bytes32),
//     ],
//   })
//   if (isValidMetadataResult(symbolResult, nameResult, decimalsResult)) {
//     return {
//       symbol: symbolResult.result!,
//       name: nameResult.result!,
//       decimals: BigInt(decimalsResult.result!),
//     }
//   }
//   console.log('unable to load metadata', { chainId: context.chain.id, tokenAddress })
//   throw new Error('Invalid metadata result')
// }

// const isValidMetadataResult = (symbolResult: { result?: string }, nameResult: { result?: string }, decimalsResult: { result?: number }) => {
//   return _.isString(symbolResult.result) && _.isString(nameResult.result) && _.isNumber(decimalsResult.result)
// }

ponder.on('ForeignAMB:UserRequestForAffirmation', async ({ event, context }) => {
  const parsed = parseAMBMessage(
    event.transaction.from,
    event.args.encodedData,
  )
  const bridgeAddress = await getOmniFromAmb(context.chain.id, event.log.address)
  const info = bridgeInfo(context.chain.id, bridgeAddress)
  const partnerBridgeAddress = info!.partner.omni
  const orderId = createOrderId(context, event)
  await Promise.all([
    upsertBlock(context, event.block),
    upsertTransaction(context, event.block, event.transaction),
    upsertBridge(context, bridgeAddress),
    context.db.insert(ReverseMessageHashBinding).values({
      messageHash: parsed.messageHash,
      messageId: event.args.messageId,
    }),
    Promise.all([
      getLatestRequiredSignatures(context, bridgeAddress),
    ]).then(async ([requiredSignatures]) => {
      return context.db.insert(UserRequestForAffirmation).values({
        messageId: event.args.messageId,
        orderId,
        blockHash: event.block.hash,
        chainId: BigInt(context.chain.id),
        transactionHash: event.transaction.hash,
        messageHash: parsed.messageHash,
        from: parsed.from.toLowerCase() as Hex,
        to: parsed.to.toLowerCase() as Hex,
        amount: parsed.nestedData.amount,
        encodedData: event.args.encodedData,
        logIndex: event.log.logIndex,
        bridgeAddress: bridgeAddress.toLowerCase() as Hex,
        originationTokenChainId: parsed.originationChainId,
        // originationTokenAddress: inputToken!.address!.toLowerCase() as Hex,
        destinationTokenChainId: parsed.destinationChainId,
        // destinationTokenAddress: outputToken?.address?.toLowerCase() as Hex ?? null,
        originationTokenAddress: null,
        originationTokenAmbAddress: parsed.sender,
        destinationTokenAddress: null,
        destinationTokenAmbAddress: parsed.executor,
        requiredSignatureOrderId: requiredSignatures.orderId,
        confirmedSignatures: 0n,
        finishedSigning: false,
        handlingNative: parsed.handlingNative,
        deliveringNative: parsed.deliveringNative,
      })
    }
    ),
  ])
},
)

ponder.on('HomeAMB:UserRequestForSignature', async ({ event, context }) => {
  const bridgeAddress = await getOmniFromAmb(context.chain.id, event.log.address)
  const info = bridgeInfo(context.chain.id, bridgeAddress)
  // const partnerBridgeAddress = info!.partner.omni
  const parsed = parseAMBMessage(event.transaction.from, event.args.encodedData)
  const orderId = createOrderId(context, event)
  // if (parsed.nestedData.token.toLowerCase() === '0x95b303987a60c71504d99aa1b13b4da07b0790ab') {
  //   console.log('loading token home->foreign', parsed)
  // }
  // console.log(`urfs: msg=${context.chain.id}/${event.args.messageId}=>${info!.partner.chainId} token=${parsed.nestedData.token} order=${orderId} side=${info!.side}`)
  await Promise.all([
    upsertBlock(context, event.block),
    upsertTransaction(context, event.block, event.transaction),
    upsertBridge(context, bridgeAddress),
    context.db.insert(ReverseMessageHashBinding).values({
      messageHash: parsed.messageHash,
      messageId: event.args.messageId,
    }),
    parsed.feeDirector
      ? context.db.insert(FeeDirector).values({
        messageId: event.args.messageId,
        recipient: parsed.feeDirector.recipient.toLowerCase() as Hex,
        settings: parsed.feeDirector.settings,
        limit: parsed.feeDirector.limit,
        multiplier: parsed.feeDirector.multiplier,
        feeType: parsed.feeDirector.feeType,
        unwrapped: parsed.feeDirector.unwrapped,
        excludePriority: parsed.feeDirector.excludePriority,
      })
      : null,
    // register the incoming token
    Promise.all([
      getLatestRequiredSignatures(context, bridgeAddress),
    ]).then(async ([requiredSignatures]) => {
      return context.db.insert(UserRequestForSignature).values({
        messageId: event.args.messageId,
        orderId,
        blockHash: event.block.hash,
        chainId: BigInt(context.chain.id),
        transactionHash: event.transaction.hash,
        messageHash: parsed.messageHash,
        from: parsed.from.toLowerCase() as Hex,
        to: parsed.to.toLowerCase() as Hex,
        amount: parsed.nestedData.amount,
        encodedData: event.args.encodedData,
        logIndex: event.log.logIndex,
        bridgeAddress: bridgeAddress.toLowerCase() as Hex,
        originationTokenChainId: parsed.originationChainId,
        originationTokenAddress: null,
        originationTokenAmbAddress: parsed.sender,
        destinationTokenAddress: null,
        destinationTokenChainId: parsed.destinationChainId,
        destinationTokenAmbAddress: parsed.executor,
        requiredSignatureOrderId: requiredSignatures.orderId,
        confirmedSignatures: 0n,
        finishedSigning: false,
        handlingNative: parsed.handlingNative,
        deliveringNative: parsed.deliveringNative,
      })
    }),
  ])
})

ponder.on('HomeAMB:SignedForAffirmation', async ({ event, context }) => {
  const messageHash = event.args.messageHash
  const bridgeAddress = await getOmniFromAmb(context.chain.id, event.log.address)
  const validatorAddress = event.args.signer
  const orderId = createOrderId(context, event)
  await Promise.all([
    upsertBlock(context, event.block),
    upsertTransaction(context, event.block, event.transaction),
    upsertBridge(context, bridgeAddress),
    Promise.all([
      getLatestRequiredSignatures(context, bridgeAddress),
      getOutstandingMessageIdByHash(context, event.args.messageHash),
    ]).then(([requiredSignatures, messageId]) =>
      messageId && Promise.all([
        context.db
          .update(UserRequestForAffirmation, {
            messageId,
          })
          .set((row) => ({
            confirmedSignatures: row.confirmedSignatures + 1n,
            requiredSignatureOrderId: requiredSignatures.orderId,
            // finishedSigning:
            //   row.confirmedSignatures + 1n >= requiredSignatures.value,
          })),
        context.db.insert(SignedForAffirmation).values({
          messageHash,
          bridgeAddress: bridgeAddress.toLowerCase() as Hex,
          validatorAddress: validatorAddress.toLowerCase() as Hex,
          orderId,
          blockHash: event.block.hash,
          chainId: BigInt(context.chain.id),
          transactionHash: event.transaction.hash,
          userRequestId: messageId,
          logIndex: event.log.logIndex,
        }),
      ]),
    ),
  ])
})

ponder.on('HomeAMB:SignedForUserRequest', async ({ event, context }) => {
  const messageHash = event.args.messageHash
  const bridgeAddress = await getOmniFromAmb(context.chain.id, event.log.address)
  const validatorAddress = event.args.signer
  const orderId = createOrderId(context, event)
  await Promise.all([
    upsertBlock(context, event.block),
    upsertTransaction(context, event.block, event.transaction),
    upsertBridge(context, bridgeAddress),
    Promise.all([
      getLatestRequiredSignatures(context, bridgeAddress),
      getOutstandingMessageIdByHash(context, event.args.messageHash),
    ]).then(([requiredSignatures, messageId]) =>
      messageId && Promise.all([
        context.db
          .update(UserRequestForSignature, {
            messageId,
          })
          .set((row) => ({
            confirmedSignatures: row.confirmedSignatures + 1n,
            requiredSignatureOrderId: requiredSignatures.orderId,
            // finishedSigning:
            //   row.confirmedSignatures + 1n >= requiredSignatures.value,
          })),
        context.db.insert(SignedForUserRequest).values({
          messageHash,
          bridgeAddress,
          validatorAddress: validatorAddress.toLowerCase() as Hex,
          orderId,
          blockHash: event.block.hash,
          chainId: BigInt(context.chain.id),
          transactionHash: event.transaction.hash,
          userRequestId: messageId,
          logIndex: event.log.logIndex,
        }),
      ]),
    ),
  ])
})

// this function only runs when the token is being delivered to the end user
ponder.on('BasicOmnibridge:NewTokenRegistered', async ({ event, context }) => {
  const orderId = createOrderId(context, event)
  // Get bridge info to determine partner chain ID
  const info = bridgeInfo(context.chain.id, event.log.address)
  if (!info) {
    throw new Error(`No bridge info found for address ${event.log.address}`)
  }
  const bridgedToken = {
    address: event.args.bridged,
    chainId: BigInt(context.chain.id),
    ambAddress: await info.target.amb,
  }
  const nativeToken = {
    address: event.args.native,
    chainId: BigInt(info.partner.chainId),
    ambAddress: await info.partner.amb,
  }
  console.log(`${nativeToken.chainId}/${nativeToken.address.toLowerCase()}@${nativeToken.ambAddress.toLowerCase()}->${bridgedToken.chainId}/${bridgedToken.address.toLowerCase()}@${bridgedToken.ambAddress.toLowerCase()}`)
  if (
    (nativeToken.address === '0x70499adebb11efd915e3b69e700c331778628707' && nativeToken.chainId === 11155111n)
    || (nativeToken.address === '0xa1077a294dde1b09bb078844df40758a5d0f9a27' && nativeToken.chainId === 1n)
  ) {
    console.log('special case token', event.transaction.hash, nativeToken, bridgedToken)
    // prevent logging of the special case tokens since they are emitted on the wrong side
    return
  }
  const tokenProps: Partial<typeof Token.$inferInsert> = {
    originationAddress: nativeToken.address,
    originationChainId: nativeToken.chainId,
    originationAmbAddress: nativeToken.ambAddress,
    destinationAddress: bridgedToken.address,
    destinationChainId: bridgedToken.chainId,
    destinationAmbAddress: bridgedToken.ambAddress,
  }
  await Promise.all([
    upsertTransaction(context, event.block, event.transaction),
    upsertBlock(context, event.block),
    context.db.insert(Token).values({
      orderId,
      ...bridgedToken,
      ...tokenProps,
    }),
    context.db.insert(Token).values({
      orderId,
      ...nativeToken,
      ...tokenProps,
    }).onConflictDoUpdate(() => tokenProps),
  ])
})

ponder.on('HomeAMB:AffirmationCompleted', async ({ event, context }) => {
  const orderId = createOrderId(context, event)
  const crossedBridgeAddress = await getOmniFromAmb(context.chain.id, event.log.address)
  const info = bridgeInfo(context.chain.id, crossedBridgeAddress)
  await Promise.all([
    upsertTransaction(context, event.block, event.transaction),
    upsertBlock(context, event.block),
    context.db
      .find(UserRequestForAffirmation, {
        messageId: event.args.messageId,
      })
      .then(async (userRequestForAffirmation) => {
        const zeroSignerRequired = userRequestForAffirmation?.requiredSignatureOrderId === null

        let tokenData: Partial<typeof AffirmationCompleted.$inferInsert> = {}
        if (userRequestForAffirmation!.originationTokenAddress) {
          const originationToken = await context.db.find(Token, {
            address: userRequestForAffirmation!.originationTokenAddress,
            chainId: userRequestForAffirmation!.originationTokenChainId,
            ambAddress: await info!.partner.amb,
          })
          const isDestination = originationToken!.address === originationToken!.destinationAddress
          const destinationToken = await context.db.find(Token, {
            address: isDestination
              ? originationToken!.originationAddress!
              : originationToken!.destinationAddress!,
            chainId: userRequestForAffirmation!.destinationTokenChainId,
            ambAddress: await info!.target.amb,
          })
          tokenData = {
            originationTokenAddress: userRequestForAffirmation!.originationTokenAddress,
            originationTokenChainId: userRequestForAffirmation!.originationTokenChainId,
            originationTokenAmbAddress: userRequestForAffirmation!.originationTokenAmbAddress,
            destinationTokenAddress: zeroSignerRequired ? destinationToken?.address ?? null : destinationToken!.address,
            destinationTokenChainId: zeroSignerRequired ? destinationToken?.chainId ?? null : destinationToken!.chainId,
            destinationTokenAmbAddress: zeroSignerRequired ? destinationToken?.ambAddress ?? null : destinationToken!.ambAddress,
          }
        }

        return context.db.insert(AffirmationCompleted).values({
          messageHash: userRequestForAffirmation!.messageHash,
          orderId,
          chainId: BigInt(context.chain.id),
          blockHash: event.block.hash,
          transactionHash: event.transaction.hash,
          userRequestId: event.args.messageId,
          deliverer: event.transaction.from,
          logIndex: event.log.logIndex,
          ...tokenData,
        })
      }),
  ])
})

ponder.on('ForeignAMB:RelayedMessage', async ({ event, context }) => {
  const orderId = createOrderId(context, event)
  const crossedBridgeAddress = await getOmniFromAmb(context.chain.id, event.log.address)
  const info = bridgeInfo(context.chain.id, crossedBridgeAddress)
  await Promise.all([
    upsertBlock(context, event.block),
    upsertTransaction(context, event.block, event.transaction),
    context.db
      .find(UserRequestForSignature, {
        messageId: event.args.messageId,
      })
      .then(async (userRequestForSignature) => {
        const zeroSignerRequired = userRequestForSignature?.requiredSignatureOrderId === null

        let tokenData: Partial<typeof RelayedMessage.$inferInsert> = {}
        if (userRequestForSignature!.originationTokenAddress) {
          const originationToken = await context.db.find(Token, {
            address: userRequestForSignature!.originationTokenAddress,
            chainId: userRequestForSignature!.originationTokenChainId,
            ambAddress: await info!.partner.amb,
          })
          const destinationToken = await context.db.find(Token, {
            address: originationToken!.address === originationToken!.destinationAddress
              ? originationToken!.originationAddress!
              : originationToken!.destinationAddress!,
            chainId: userRequestForSignature!.destinationTokenChainId,
            ambAddress: await info!.target.amb,
          })
          tokenData = {
            originationTokenAddress: userRequestForSignature!.originationTokenAddress,
            originationTokenChainId: userRequestForSignature!.originationTokenChainId,
            originationTokenAmbAddress: userRequestForSignature!.originationTokenAmbAddress,
            // only use defaults because the testnet was create with a zero signer settings
            destinationTokenAddress: zeroSignerRequired ? destinationToken?.address ?? null : destinationToken!.address,
            destinationTokenChainId: zeroSignerRequired ? destinationToken?.chainId ?? null : destinationToken!.chainId,
            destinationTokenAmbAddress: zeroSignerRequired ? destinationToken?.ambAddress ?? null : destinationToken!.ambAddress,
          }
        }
        return await context.db.insert(RelayedMessage).values({
          messageHash: userRequestForSignature!.messageHash,
          orderId,
          chainId: BigInt(context.chain.id),
          blockHash: event.block.hash,
          transactionHash: event.transaction.hash,
          userRequestId: event.args.messageId,
          deliverer: event.transaction.from,
          logIndex: event.log.logIndex,
          ...tokenData,
        })
      }),
  ])
})

ponder.on('BasicOmnibridge:TokensBridged', async ({ event, context }) => {
  const info = bridgeInfo(context.chain.id, event.log.address)
  if (!info) {
    throw new Error(`No bridge info found for address ${event.log.address}`)
  }
  await Promise.all([
    upsertBlock(context, event.block),
    upsertTransaction(context, event.block, event.transaction),
    context.db.update(info.side === 'home' ? UserRequestForAffirmation : UserRequestForSignature, {
      messageId: event.args.messageId,
    }).set({
      finishedSigning: true,
    }),
  ])
})

ponder.on('BasicOmnibridge:TokensBridgingInitiated', async ({ event, context }) => {
  const info = bridgeInfo(context.chain.id, event.log.address)
  if (!info) {
    throw new Error(`No bridge info found for address ${event.log.address}`)
  }
  const orderId = createOrderId(context, event)
  // console.log(`init: msg=${context.chain.id}/${event.args.messageId}=>${info.partner.chainId} token=${event.args.token} order=${orderId} side=${info.side}`)
  if (info.side === 'foreign') {
    const [urfa] = await Promise.all([
      context.db.update(UserRequestForAffirmation, {
        messageId: event.args.messageId,
      }).set({
        originationTokenAddress: event.args.token,
      }),
      loadToken({
        context,
        tokenAddress: event.args.token,
        tokenChainId: BigInt(info.target.chainId),
        orderId,
        ambAddress: await info.target.amb,
      }),
    ])
  } else {
    // home
    const [urfs] = await Promise.all([
      context.db.update(UserRequestForSignature, {
        messageId: event.args.messageId,
      }).set({
        originationTokenAddress: event.args.token,
      }),
      loadToken({
        context,
        tokenAddress: event.args.token,
        tokenChainId: BigInt(info.target.chainId),
        orderId,
        ambAddress: await info.target.amb,
      }),
    ])
  }
})
