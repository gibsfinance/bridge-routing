
const BIGINT_TYPE = 'bigint' as const
type SerializedBigInt = {
  __type__: typeof BIGINT_TYPE
  value: string
}
/** The json any stringify for the given key and value */
export const jsonAnyStringify = (key: string, value: unknown) => {
  if (typeof value === BIGINT_TYPE) {
    return {
      __type__: BIGINT_TYPE,
      value: (value as bigint).toString(),
    }
  }
  return value
}

/** The is serialized big int for the given value */
export const isSerializedBigInt = (value: unknown): value is SerializedBigInt => {
  return (
    !!value && typeof value === 'object' && (value as SerializedBigInt).__type__ === BIGINT_TYPE
  )
}

/** The json any parse for the given key and value */
export const jsonAnyParse = (_key: string, value: unknown) => {
  if (isSerializedBigInt(value)) {
    return BigInt(value.value)
  }
  return value
}
