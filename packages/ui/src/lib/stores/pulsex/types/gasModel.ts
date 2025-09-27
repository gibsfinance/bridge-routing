import type { GasCost } from './gasCost'
import type { RouteWithoutGasEstimate } from './route'

export interface GasEstimateRequiredInfo {
  initializedTickCrossedList: number[]
}

export interface GasModel {
  estimateGasCost: (route: RouteWithoutGasEstimate, info: GasEstimateRequiredInfo) => GasCost
}
