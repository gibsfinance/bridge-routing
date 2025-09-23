import { Context, Event, ponder } from 'ponder:registry'
import _ from 'lodash'
import {
  Token,
  Completion,
  Delivery,
  FeeDirector,
  RequiredSignaturesChanged,
  ReverseMessageHashBinding,
  UserRequest,
  SignFor,
  ValidatorStatusUpdate,
  LatestValidatorStatusUpdate,
  FeeUpdate,
  LatestFeeUpdate,
} from 'ponder:schema'
import { decodeFunctionData, parseAbi, type Hex } from 'viem'
import { parseAMBMessage } from './message'
import { getInfoBy, createOrderId } from './utils'
import { ChainId } from '@gibs/bridge-sdk'
import {
  getLatestRequiredSignatures,
  upsertOmniBridge,
  upsertBlock,
  upsertTransaction,
  upsertValidatorContract,
  upsertAmbBridge,
  upsertValidator,
  upsertFeeManagerContract,
  toValidatorId,
  getLatestFeeUpdate,
} from './cache'

ponder.on('ValidatorContract:ValidatorAdded', async ({ event, context }) => {
  console.log(
    'validator %o on %o added',
    event.args.validator,
    context.chain.id,
  )
  const info = await getInfoBy({ key: 'validator', address: event.log.address, chainId: context.chain.id })
  const ambAddress = await info.target.amb
  const omnibridgeAddress = info.target.omni
  const orderId = createOrderId(context, event)
  console.log('chain_id=%o amb=%o omni=%o', context.chain.id, ambAddress, omnibridgeAddress)
  const validatorId = await toValidatorId({
    validator: event.args.validator,
    amb: ambAddress,
    contract: event.log.address,
    chainId: context.chain.id,
  })
  await Promise.all([
    upsertValidatorContract(context, event.log.address),
    upsertAmbBridge(context, ambAddress),
    upsertOmniBridge(context, omnibridgeAddress),
    upsertBlock(context, event.block),
    upsertValidator(context, event.args.validator, info),
    upsertTransaction(context, event.block, event.transaction),
    upsertFeeManagerContract(context, info.target),
    context.db
      .insert(LatestValidatorStatusUpdate)
      .values({
        chainId: BigInt(context.chain.id),
        validatorId,
        validatorContractAddress: event.log.address,
        orderId,
        ambAddress,
      })
      .onConflictDoUpdate(() => ({
        orderId,
      })),
    context.db.insert(ValidatorStatusUpdate).values({
      orderId,
      ambAddress,
      validatorId,
      validatorContractAddress: event.log.address,
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
  const info = await getInfoBy({ key: 'validator', address: event.log.address, chainId: context.chain.id })
  const bridgeAddress = info.target.omni
  const ambAddress = await info.target.amb
  const orderId = createOrderId(context, event)
  console.log('chain_id=%o amb=%o omni=%o', context.chain.id, ambAddress, bridgeAddress)
  const validatorId = await toValidatorId({
    validator: event.args.validator,
    amb: ambAddress,
    contract: event.log.address,
    chainId: context.chain.id,
  })
  await Promise.all([
    upsertAmbBridge(context, ambAddress),
    upsertValidatorContract(context, event.log.address),
    upsertValidator(context, event.args.validator, info),
    upsertOmniBridge(context, bridgeAddress),
    upsertBlock(context, event.block),
    upsertTransaction(context, event.block, event.transaction),
    context.db
      .insert(LatestValidatorStatusUpdate)
      .values({
        chainId: BigInt(context.chain.id),
        validatorId,
        validatorContractAddress: event.log.address,
        orderId,
        ambAddress: ambAddress,
      })
      .onConflictDoUpdate(() => ({
        orderId,
      })),
    context.db.insert(ValidatorStatusUpdate).values({
      orderId,
      validatorId,
      validatorContractAddress: event.log.address,
      ambAddress: ambAddress,
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
    const info = await getInfoBy({ key: 'validator', address: event.log.address, chainId: context.chain.id })
    const bridgeAddress = info.target.omni
    const orderId = createOrderId(context, event)
    console.log('required signatures changed address=%o required=%o',
      bridgeAddress, event.args.requiredSignatures)
    await Promise.all([
      upsertAmbBridge(context, info.target.amb),
      upsertOmniBridge(context, bridgeAddress),
      upsertBlock(context, event.block),
      upsertTransaction(context, event.block, event.transaction),
      upsertFeeManagerContract(context, info.target),
      upsertValidatorContract(context, event.log.address, {
        latestRequiredSignaturesOrderId: orderId,
      }),
      context.db.insert(RequiredSignaturesChanged).values({
        orderId,
        validatorContractAddress: event.log.address,
        value: event.args.requiredSignatures,
        chainId: BigInt(context.chain.id),
        blockHash: event.block.hash,
        transactionHash: event.transaction.hash,
        logIndex: event.log.logIndex,
      }),
    ])
  },
)

const loadToken = async (inputs: {
  context: Context,
  tokenAddress: Hex,
  tokenChainId: bigint,
  orderId: bigint,
  ambAddress: Hex,
  omnibridgeAddress: Hex,
  requireExisting?: boolean,
}) => {
  const { context, tokenAddress, tokenChainId, orderId, ambAddress, omnibridgeAddress, requireExisting = false } = inputs
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
  return await context.db.insert(Token).values({
    address: tokenAddress.toLowerCase() as Hex,
    chainId: tokenChainId,
    ambAddress,
    originationChainId: tokenChainId,
    originationAddress: tokenAddress.toLowerCase() as Hex,
    originationAmbAddress: ambAddress,
    destinationChainId: null,
    destinationAddress: null,
    destinationAmbAddress: null,
    originationOmnibridgeAddress: omnibridgeAddress.toLowerCase() as Hex,
    destinationOmnibridgeAddress: null,
    orderId,
  }).onConflictDoNothing()
}

const handleUserRequest = (type: 'signature' | 'affirmation') => async ({ event, context }: {
  event: Event<'ForeignAMB:UserRequestForAffirmation' | 'HomeAMB:UserRequestForSignature'>,
  context: Context,
}) => {
  const parsed = parseAMBMessage(
    event.transaction.from,
    event.args.encodedData,
  )
  const info = await getInfoBy({ key: 'amb', address: event.log.address, chainId: context.chain.id })
  const orderId = createOrderId(context, event)
  await Promise.all([
    upsertBlock(context, event.block),
    upsertTransaction(context, event.block, event.transaction),
    upsertOmniBridge(context, info.target.omni),
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
    upsertAmbBridge(context, info.target.amb).then(async () => {
      return await Promise.all([
        getLatestRequiredSignatures(context, info.target.amb),
      ])
    })
      .then(async ([requiredSignatures]) => {
        return context.db.insert(UserRequest).values({
          type: type,
          messageId: event.args.messageId,
          orderId,
          blockHash: event.block.hash,
          chainId: BigInt(context.chain.id),
          transactionHash: event.transaction.hash,
          messageHash: parsed.messageHash,
          from: parsed.from.toLowerCase() as Hex,
          to: parsed.to.toLowerCase() as Hex,
          encodedData: event.args.encodedData,
          logIndex: event.log.logIndex,
          originationChainId: parsed.originationChainId,
          destinationChainId: parsed.destinationChainId,
          originationAmbAddress: await info.target.amb,
          destinationAmbAddress: await info.partner.amb,
          originationOmnibridgeAddress: info.target.omni.toLowerCase() as Hex,
          destinationOmnibridgeAddress: info.partner.omni.toLowerCase() as Hex,
          amountIn: info.side === 'foreign' ? parsed.nestedData.amount : null,
          amountOut: info.side === 'home' ? parsed.nestedData.amount : null,
          originationTokenAddress: null,
          destinationTokenAddress: null,
          requiredSignatureOrderId: requiredSignatures.orderId,
          confirmedSignatures: 0n,
          finishedSigning: false,
          handlingNative: parsed.handlingNative,
          deliveringNative: parsed.deliveringNative,
          signatures: type === 'signature' ? [] : null,
          feeUpdateOrderId: null,
          delivered: false,
        })
      }),
  ])
}

ponder.on('ForeignAMB:UserRequestForAffirmation', handleUserRequest('affirmation'))
ponder.on('HomeAMB:UserRequestForSignature', handleUserRequest('signature'))

const homeAmbSignatureParseAbi = parseAbi([
  'function submitSignature(bytes signature, bytes message) external',
])

const parseSignature = (event: Event<'HomeAMB:SignedForAffirmation' | 'HomeAMB:SignedForUserRequest'>) => {
  try {
    // if you are ever able to convince the team to move to a multicall signature scheme then you will have to update this
    const { functionName, args } = decodeFunctionData({
      abi: homeAmbSignatureParseAbi,
      data: event.transaction.input,
    })
    if (functionName !== 'submitSignature') {
      return null
    }
    return {
      signature: args[0],
      message: args[1],
    }
  } catch (err) {
    return null
  }
}

const handleSignedFor = async ({ event, context }: {
  event: Event<'HomeAMB:SignedForAffirmation' | 'HomeAMB:SignedForUserRequest'>,
  context: Context,
}) => {
  const messageHash = event.args.messageHash
  const info = await getInfoBy({ key: 'amb', address: event.log.address, chainId: context.chain.id })
  const parsedSignature = parseSignature(event)
  const validatorAddress = event.args.signer
  const orderId = createOrderId(context, event)
  const validatorId = await toValidatorId({
    validator: validatorAddress,
    amb: info.target.amb,
    contract: event.log.address,
    chainId: context.chain.id,
  })
  await Promise.all([
    upsertBlock(context, event.block),
    upsertTransaction(context, event.block, event.transaction),
    upsertOmniBridge(context, info.target.omni),
    upsertAmbBridge(context, event.log.address).then(async () => {
      return await getLatestRequiredSignatures(context, event.log.address)
    }).then(async (requiredSignatures) =>
      Promise.all([
        context.db
          .update(UserRequest, {
            messageHash,
          })
          .set((row) => ({
            confirmedSignatures: row.confirmedSignatures + 1n,
            requiredSignatureOrderId: requiredSignatures.orderId,
            signatures: parsedSignature ? [...(row.signatures as Hex[] ?? []), parsedSignature.signature] : row.signatures,
          })),
        context.db.insert(SignFor).values({
          messageHash,
          ambAddress: event.log.address,
          validatorId,
          orderId,
          blockHash: event.block.hash,
          chainId: BigInt(context.chain.id),
          transactionHash: event.transaction.hash,
          logIndex: event.log.logIndex,
        }),
      ]),
    ),
  ])
}

ponder.on('HomeAMB:SignedForAffirmation', handleSignedFor)
ponder.on('HomeAMB:SignedForUserRequest', handleSignedFor)

// this function only runs when the token is being delivered to the end user
ponder.on('BasicOmnibridge:NewTokenRegistered', async ({ event, context }) => {
  const orderId = createOrderId(context, event)
  // Get bridge info to determine partner chain ID
  // const info = bridgeInfo(context.chain.id, event.log.address)
  const info = await getInfoBy({ key: 'omni', address: event.log.address, chainId: context.chain.id })
  if (!info) {
    throw new Error(`No bridge info found for address ${event.log.address}`)
  }
  const bridgedToken = {
    address: event.args.bridged,
    chainId: BigInt(context.chain.id),
    ambAddress: await info.target.amb,
    omnibridgeAddress: info.target.omni.toLowerCase() as Hex,
  }
  const nativeToken = {
    address: event.args.native,
    chainId: BigInt(info.partner.chainId),
    ambAddress: await info.partner.amb,
    omnibridgeAddress: info.partner.omni.toLowerCase() as Hex,
  }
  console.log(`${nativeToken.chainId}/${nativeToken.address.toLowerCase()}->${bridgedToken.chainId}/${bridgedToken.address.toLowerCase()}@${info.key}`)
  if (
    (nativeToken.address === '0x70499adebb11efd915e3b69e700c331778628707' && nativeToken.chainId === 11155111n)
    || (nativeToken.address === '0xa1077a294dde1b09bb078844df40758a5d0f9a27' && nativeToken.chainId === 1n)
  ) {
    console.log('special case token', event.transaction.hash, nativeToken, bridgedToken)
    // prevent logging of the special case tokens since they are emitted on the wrong side
    return
  }
  const tokenProps = {
    originationAddress: nativeToken.address,
    originationChainId: nativeToken.chainId,
    originationAmbAddress: nativeToken.ambAddress,
    originationOmnibridgeAddress: info.target.omni.toLowerCase() as Hex,
    destinationAddress: bridgedToken.address,
    destinationChainId: bridgedToken.chainId,
    destinationAmbAddress: bridgedToken.ambAddress,
    destinationOmnibridgeAddress: info.partner.omni.toLowerCase() as Hex,
  } as const
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

ponder.on('HomeAMB:CollectedSignatures', async ({ event, context }) => {
  const orderId = createOrderId(context, event)
  const info = await getInfoBy({ key: 'amb', address: event.log.address, chainId: context.chain.id })
  await Promise.all([
    context.db.update(UserRequest, {
      messageHash: event.args.messageHash,
    }).set({
      authorityResponsibleForRelay: event.args.authorityResponsibleForRelay.toLowerCase() as Hex,
      finishedSigning: true,
    }).then(async (userRequest) => {
      return context.db.insert(Completion).values({
        messageHash: event.args.messageHash,
        orderId,
        chainId: BigInt(context.chain.id),
        blockHash: event.block.hash,
        transactionHash: event.transaction.hash,
        originationAmbAddress: userRequest.originationAmbAddress,
        destinationAmbAddress: userRequest.destinationAmbAddress,
        originationChainId: userRequest.originationChainId,
        destinationChainId: userRequest.destinationChainId,
      })
    }),
  ])
})

const deliverTokens = async ({ event, context }: {
  event: Event<'HomeAMB:AffirmationCompleted' | 'ForeignAMB:RelayedMessage'>,
  context: Context,
}) => {
  const orderId = createOrderId(context, event)
  const info = await getInfoBy({
    key: 'amb',
    chainId: context.chain.id,
    address: event.log.address,
  })
  await Promise.all([
    upsertTransaction(context, event.block, event.transaction),
    upsertBlock(context, event.block),
    context.db.find(ReverseMessageHashBinding, {
      messageId: event.args.messageId,
    })
      .then(async (reverseLookup) => {
        return await context.db
          .update(UserRequest, {
            messageHash: reverseLookup!.messageHash,
          }).set({
            finishedSigning: true,
            delivered: true,
          })
      })
      .then(async (userRequest) => {
        const zeroSignerRequired = userRequest!.requiredSignatureOrderId === null

        let tokenData: Partial<typeof Delivery.$inferInsert> = {}
        if (userRequest!.originationTokenAddress) {
          const originationToken = await context.db.find(Token, {
            address: userRequest!.originationTokenAddress,
            chainId: userRequest!.originationChainId,
            ambAddress: await info!.partner.amb,
          })
          const isDestination = originationToken!.address === originationToken!.destinationAddress
          const destinationToken = await context.db.find(Token, {
            address: isDestination
              ? originationToken!.originationAddress!
              : originationToken!.destinationAddress!,
            chainId: userRequest!.destinationChainId,
            ambAddress: await info!.target.amb,
          })
          tokenData = {
            originationTokenAddress: userRequest!.originationTokenAddress,
            originationChainId: userRequest!.originationChainId,
            originationAmbAddress: userRequest!.originationAmbAddress,
            originationOmnibridgeAddress: info!.target.omni.toLowerCase() as Hex,
            destinationTokenAddress: zeroSignerRequired ? destinationToken?.address : destinationToken!.address,
            destinationChainId: zeroSignerRequired ? destinationToken?.chainId : destinationToken!.chainId,
            destinationAmbAddress: zeroSignerRequired ? destinationToken?.ambAddress : destinationToken!.ambAddress,
            destinationOmnibridgeAddress: info!.partner.omni.toLowerCase() as Hex,
          }
        }

        return await Promise.all([
          info.side === 'foreign'
            ? null // h2f is captured by CollectedSignatures
            : context.db.insert(Completion).values({
              messageHash: userRequest!.messageHash,
              orderId,
              chainId: BigInt(context.chain.id),
              blockHash: event.block.hash,
              transactionHash: event.transaction.hash,
              originationAmbAddress: userRequest.originationAmbAddress,
              destinationAmbAddress: userRequest.destinationAmbAddress,
              originationChainId: userRequest.originationChainId,
              destinationChainId: userRequest.destinationChainId,
            }),
          // context.db.insert(Delivery).values({
          //   messageHash: userRequest!.messageHash,
          //   orderId,
          //   chainId: BigInt(context.chain.id),
          //   blockHash: event.block.hash,
          //   transactionHash: event.transaction.hash,
          //   userRequestHash: userRequest!.messageHash,
          //   deliverer: event.transaction.from,
          //   logIndex: event.log.logIndex,
          //   ...tokenData,
          // }),
        ])
      }),
  ])
}

ponder.on('HomeAMB:AffirmationCompleted', deliverTokens)
ponder.on('ForeignAMB:RelayedMessage', deliverTokens)

ponder.on('BasicOmnibridge:TokensBridged', async ({ event, context }) => {
  const info = await getInfoBy({ key: 'omni', address: event.log.address, chainId: context.chain.id })
  if (!info) {
    throw new Error(`No bridge info found for address ${event.log.address}`)
  }
  const reverseLookup = await context.db.find(ReverseMessageHashBinding, {
    messageId: event.args.messageId,
  })
  const orderId = createOrderId(context, event)
  const [userRequest, token] = await Promise.all([
    context.db.find(UserRequest, {
      messageHash: reverseLookup!.messageHash,
    }),
    context.db.find(Token, {
      address: event.args.token,
      chainId: BigInt(info.target.chainId),
      ambAddress: await info.target.amb,
    }),
  ])
  if (!userRequest) {
    throw new Error(`No user request found for message hash ${reverseLookup!.messageHash}`)
  }
  if (!token?.destinationAddress) {
    throw new Error(`No destination token found for address ${event.args.token}`)
  }
  await Promise.all([
    upsertBlock(context, event.block),
    upsertTransaction(context, event.block, event.transaction),
    context.db.update(UserRequest, {
      messageHash: reverseLookup!.messageHash,
    }).set({
      delivered: true,
    }),
    context.db.insert(Delivery).values({
      logIndex: event.log.logIndex,
      deliverer: event.transaction.from,
      orderId,
      chainId: BigInt(context.chain.id),
      blockHash: event.block.hash,
      transactionHash: event.transaction.hash,
      messageHash: userRequest!.messageHash,
      originationAmbAddress: userRequest!.originationAmbAddress,
      destinationAmbAddress: userRequest!.destinationAmbAddress,
      originationChainId: userRequest!.originationChainId,
      destinationChainId: userRequest!.destinationChainId,
      originationTokenAddress: userRequest!.originationTokenAddress,
      destinationTokenAddress: token!.destinationAddress,
      userRequestHash: userRequest!.messageHash,
    }),
  ])
})

ponder.on('BasicOmnibridge:TokensBridgingInitiated', async ({ event, context }) => {
  const info = await getInfoBy({ key: 'omni', address: event.log.address, chainId: context.chain.id })
  if (!info) {
    throw new Error(`No bridge info found for address ${event.log.address}`)
  }
  const orderId = createOrderId(context, event)
  // console.log(`init: msg=${context.chain.id}/${event.args.messageId}=>${info.partner.chainId} token=${event.args.token} order=${orderId} side=${info.side}`)
  const [reverseLookup, token] = await Promise.all([
    context.db.find(ReverseMessageHashBinding, {
      messageId: event.args.messageId,
    }),
    context.db.find(Token, {
      address: event.args.token,
      chainId: BigInt(info.target.chainId),
      ambAddress: await info.target.amb,
    }),
  ])
  const destinationTokenAddress = !token ? null
    : token.originationAddress && event.args.token.toLowerCase() === token.originationAddress?.toLowerCase()
      ? token.destinationAddress
      : token.originationAddress
  await Promise.all([
    context.db.update(UserRequest, {
      messageHash: reverseLookup!.messageHash,
    }).set({
      originationTokenAddress: event.args.token,
      destinationTokenAddress,
    }),
    loadToken({
      context,
      tokenAddress: event.args.token,
      tokenChainId: BigInt(info.target.chainId),
      orderId,
      ambAddress: await info.target.amb,
      omnibridgeAddress: info.target.omni.toLowerCase() as Hex,
    }),
  ])
})

ponder.on('FeeManager:FeeUpdated', async ({ event, context }) => {
  const info = await getInfoBy({ key: 'feeManager', address: event.log.address, chainId: context.chain.id })
  if (!info) {
    throw new Error(`No bridge info found for address ${event.log.address}`)
  }
  const orderId = createOrderId(context, event)
  await Promise.all([
    upsertBlock(context, event.block),
    upsertTransaction(context, event.block, event.transaction),
    upsertFeeManagerContract(context, info.target),
    context.db.insert(LatestFeeUpdate).values({
      chainId: BigInt(context.chain.id),
      feeManagerContractAddress: event.log.address,
      tokenAddress: event.args.token,
      orderId,
      feeType: event.args.feeType,
      omnibridgeAddress: info.target.omni.toLowerCase() as Hex,
    }).onConflictDoUpdate(() => ({
      orderId,
    })),
    // should fail if a duplicate order id is found
    context.db.insert(FeeUpdate).values({
      orderId,
      chainId: BigInt(context.chain.id),
      transactionHash: event.transaction.hash,
      blockHash: event.block.hash,
      feeType: event.args.feeType,
      feeManagerContractAddress: event.log.address,
      tokenAddress: event.args.token,
      fee: event.args.fee,
      omnibridgeAddress: info.target.omni.toLowerCase() as Hex,
    })
  ])
})

ponder.on('BasicOmnibridge:FeeDistributed', async ({ event, context }) => {
  const reverseLookup = await context.db.find(ReverseMessageHashBinding, {
    messageId: event.args.messageId,
  })
  const userRequest = await context.db.find(UserRequest, {
    messageHash: reverseLookup!.messageHash,
  })
  const feeCollectionSideInfo = await getInfoBy({
    key: 'omni',
    address: event.log.address,
    chainId: context.chain.id,
  })
  const fee = event.args.fee
  const originationInfo = await getInfoBy({
    key: 'omni',
    address: userRequest!.originationOmnibridgeAddress!,
    chainId: Number(userRequest!.originationChainId!) as ChainId,
  })
  const originationFromHome = originationInfo.side === 'home'
  const userRequestUpdates = originationFromHome ? {
    // amount in was always more than amount out
    amountIn: userRequest!.amountOut! + fee,
  } : {
    // amount out is always less than amount in
    amountOut: userRequest!.amountIn! - fee,
  }
  const feeUpdate = await getLatestFeeUpdate({
    context,
    feeManagerContractAddress: event.log.address,
    tokenAddress: event.args.token,
    originationFromHome,
    omnibridgeAddress: feeCollectionSideInfo.target.omni.toLowerCase() as Hex,
  })
  await Promise.all([
    upsertBlock(context, event.block),
    upsertTransaction(context, event.block, event.transaction),
    context.db.update(UserRequest, {
      messageHash: userRequest!.messageHash,
    }).set({
      ...userRequestUpdates,
      feeUpdateOrderId: feeUpdate.orderId,
      feeManagerContractChainId: feeUpdate.chainId ? BigInt(feeUpdate.chainId) : null,
      feeManagerContractAddress: feeUpdate.feeManagerContractAddress,
    }),
  ])
})
