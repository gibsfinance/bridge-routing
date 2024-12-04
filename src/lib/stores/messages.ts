import { numberToHex } from 'viem'

export function strip0x(input: string) {
  return input.replace(/^0x/, '')
}

/**
 * Decodes the datatype byte from the AMB message.
 * First (the most significant bit) denotes if the message should be forwarded to the manual lane.
 * @param dataType: datatype of the received AMB message.
 */
export const decodeAMBDataType = (dataType: number) => ({
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
