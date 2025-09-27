import { parseAbi } from "viem";

export const FeeManagerAbi = parseAbi([
  'event FeeUpdated(bytes32 feeType, address indexed token, uint256 fee)',
])
