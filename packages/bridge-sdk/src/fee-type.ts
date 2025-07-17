/** The type of fee to use for the bridge */
export enum FeeType {
  PERCENT = '%',
  GAS_TIP = 'gas+%',
  FIXED = 'fixed',
}

/** The keys of the fee type */
export type FeeTypeKeys = keyof typeof FeeType

/** A map of fee type values to keys */
export const feeTypeValToKeyMap = new Map<FeeType, FeeTypeKeys>(
  (Object.keys(FeeType) as FeeTypeKeys[]).map((key) => [FeeType[key], key]),
)
