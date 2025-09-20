import {
  decodeAbiParameters,
  decodeFunctionData,
  getAddress,
  type Hex,
  isAddress,
  keccak256,
  numberToHex,
  parseAbiParameters,
  zeroAddress,
} from 'viem'

import abi from '../abis/BasicOmnibridge'
import extraAbi from '../abis/BasicOmnibridgeExtra'
import { mergeAbis } from 'ponder'

const mergedAbi = mergeAbis([abi, extraAbi])

function strip0x(input: string) {
  return input.replace(/^0x/, '')
}

/**
 * Decodes the datatype byte from the AMB message.
 * First (the most significant bit) denotes if the message should be forwarded to the manual lane.
 * @param dataType: datatype of the received AMB message.
 */
const decodeAMBDataType = (dataType: number) => ({
  manualLane: (dataType & 128) === 128,
})

export function signatureToVRS(rawSignature: string) {
  const signature = strip0x(rawSignature)
  const word = 32
  const word2 = word * 2
  const word4 = word2 * 2
  const r = signature.slice(0, word2)
  const s = signature.slice(word2, word4)
  const v = signature.slice(word4)
  return { v, r, s }
}

export function packSignatures(array: ReturnType<typeof signatureToVRS>[]) {
  const length = strip0x(numberToHex(array.length))
  const msgLength = length.length === 1 ? `0${length}` : length
  let v = ''
  let r = ''
  let s = ''
  array.forEach((e) => {
    v = v.concat(e.v)
    r = r.concat(e.r)
    s = s.concat(e.s)
  })
  return `0x${msgLength}${v}${r}${s}`
}

const abiDelivery = parseAbiParameters(['(address,uint256,uint256,uint256)'])

const parseDelivery = (data: Hex) => {
  try {
    const parsed = decodeAbiParameters(abiDelivery, data)
    return parsed[0]
  } catch (err) {
    //
  }
  // const parsed = parseAbi([
  //   'function deliver(address,uint256,bytes)',
  // ])
}

type FeeDirector = {
  recipient: Hex
  settings: bigint
  limit: bigint
  multiplier: bigint
  feeType: 'gas+' | 'fixed' | 'percentage'
  unwrapped: boolean
  excludePriority: boolean
}

export const parseAMBMessage = (txFrom: Hex, msg: Hex) => {
  const message = strip0x(msg)
  const messageId = `0x${message.slice(0, 64)}`
  const sender = `0x${message.slice(64, 104)}`
  const executor = `0x${message.slice(104, 144)}`
  const gaslimit = `0x${message.slice(144, 152)}`
  const originationChainIdLength = Number(`0x${message.slice(152, 154)}`) * 2
  const destinationChainIdLength = Number(`0x${message.slice(154, 156)}`) * 2
  const dataType = parseInt(message.slice(156, 158), 16)
  const originationChainIdOffset = 158
  const destinationChainIdOffset =
    originationChainIdOffset + originationChainIdLength
  const calldataStart = destinationChainIdOffset + destinationChainIdLength
  const originationChainId = BigInt(
    `0x${message.slice(originationChainIdOffset, destinationChainIdOffset)}`,
  )
  const destinationChainId = BigInt(
    `0x${message.slice(destinationChainIdOffset, calldataStart)}`,
  )
  const bridgeCalldata = `0x${message.slice(calldataStart)}` as Hex
  const bridgeSigHash = bridgeCalldata.slice(0, 10)
  const messageHash = keccak256(msg)

  const nestedData = {
    token: zeroAddress as Hex,
    router: zeroAddress as Hex,
    amount: 0n as bigint,
    calldata: '0x' as Hex,
  }
  const { args, functionName } = decodeFunctionData({
    abi: mergedAbi,
    data: bridgeCalldata,
  })
  let handlingNative = false
  let from = zeroAddress as Hex
  let to = zeroAddress as Hex
  if (functionName === 'handleNativeTokens') {
    nestedData.token = args[0].toLowerCase() as Hex
    nestedData.router = args[1].toLowerCase() as Hex
    nestedData.amount = args[2] as bigint
  } else if (functionName === 'handleBridgedTokens') {
    nestedData.token = args[0].toLowerCase() as Hex
    nestedData.router = args[1].toLowerCase() as Hex
    nestedData.amount = args[2] as bigint
  } else if (functionName === 'handleNativeTokensAndCall') {
    nestedData.token = args[0].toLowerCase() as Hex
    nestedData.router = args[1].toLowerCase() as Hex
    nestedData.amount = args[2] as bigint
    nestedData.calldata = args[3] as Hex
  } else if (functionName === 'handleBridgedTokensAndCall') {
    nestedData.token = args[0].toLowerCase() as Hex
    nestedData.router = args[1].toLowerCase() as Hex
    nestedData.amount = args[2] as bigint
    nestedData.calldata = args[3] as Hex
  } else if (functionName === 'relayTokensAndCall') {
    nestedData.token = args[0].toLowerCase() as Hex
    nestedData.router = args[1].toLowerCase() as Hex
    nestedData.amount = args[2] as bigint
    nestedData.calldata = args[3] as Hex
    handlingNative = true
  } else if (functionName === 'deployAndHandleBridgedTokens') {
    nestedData.token = args[0].toLowerCase() as Hex
    // nestedData.name = args[1] as string
    // nestedData.symbol = args[2] as string
    // nestedData.decimals = args[3] as number
    nestedData.router = args[4].toLowerCase() as Hex
    nestedData.amount = args[5] as bigint
  } else if (functionName === 'deployAndHandleBridgedTokensAndCall') {
    nestedData.token = args[0].toLowerCase() as Hex
    nestedData.router = args[4].toLowerCase() as Hex
    nestedData.amount = args[5] as bigint
    nestedData.calldata = args[6] as Hex
  }
  let feeDirector: null | FeeDirector = null
  let deliveringNative = false
  if (isAddress(nestedData.calldata)) {
    to = nestedData.calldata
    // implies native delivery? - TODO: check if this is correct
    deliveringNative = true
  } else {
    const parsed = parseDelivery(nestedData.calldata)
    if (parsed) {
      const [recipient, settings, limit, multiplier] = parsed
      to = recipient
      const feeTypeFixed = BigInt.asUintN(1, settings) === 1n
      const unwrapped = BigInt.asUintN(1, settings >> 1n) === 1n
      const excludePriority = BigInt.asUintN(1, settings >> 2n) === 1n
      const feeTypePercentage = BigInt.asUintN(1, settings >> 3n) === 1n
      let feeType: FeeDirector['feeType'] = 'gas+'
      if (feeTypeFixed) {
        feeType = 'fixed'
      } else if (feeTypePercentage) {
        feeType = 'percentage'
      }
      feeDirector = {
        recipient: recipient.toLowerCase() as Hex,
        settings,
        limit,
        multiplier,
        feeType,
        unwrapped,
        excludePriority,
      }
      deliveringNative = unwrapped
    }
  }
  if (from === zeroAddress) {
    from = txFrom
  }
  if (to === zeroAddress) {
    to = getAddress(nestedData.router)
  }

  return {
    handlingNative,
    deliveringNative,
    feeDirector,
    messageHash,
    sender: getAddress(sender).toLowerCase() as Hex,
    executor: getAddress(executor).toLowerCase() as Hex,
    messageId,
    dataType,
    gaslimit,
    decodedDataType: decodeAMBDataType(dataType),
    originationChainId,
    destinationChainId,
    bridgeCalldata,
    bridgeSigHash,
    nestedData,
    from: from.toLowerCase() as Hex,
    to: to.toLowerCase() as Hex,
  } as const
}

export type ParseAMBMessageResult = Awaited<ReturnType<typeof parseAMBMessage>>
