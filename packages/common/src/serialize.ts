
const BIGINT_TYPE = 'bigint' as const
type SerializedBigInt = {
  __type__: typeof BIGINT_TYPE
  value: string
}
export const jsonAnyStringify = (key: string, value: unknown) => {
  if (typeof value === BIGINT_TYPE) {
    return {
      __type__: BIGINT_TYPE,
      value: (value as bigint).toString(),
    }
  }
  return value
}

export const isSerializedBigInt = (value: unknown): value is SerializedBigInt => {
  return (
    !!value && typeof value === 'object' && (value as SerializedBigInt).__type__ === BIGINT_TYPE
  )
}

export const jsonAnyParse = (_key: string, value: unknown) => {
  if (isSerializedBigInt(value)) {
    return BigInt(value.value)
  }
  return value
}
