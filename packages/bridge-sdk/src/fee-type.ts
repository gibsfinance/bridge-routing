
export enum FeeType {
  PERCENT = '%',
  GAS_TIP = 'gas+%',
  FIXED = 'fixed',
}

export type FeeTypeKeys = keyof typeof FeeType

export const feeTypeValToKeyMap = new Map<FeeType, FeeTypeKeys>(
  (Object.keys(FeeType) as FeeTypeKeys[]).map((key) => [FeeType[key], key]),
)
