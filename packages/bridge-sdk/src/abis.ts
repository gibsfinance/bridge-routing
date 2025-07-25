import { parseAbi, parseAbiParameters } from 'viem'

/** the abi for the input bridge */
export const inputBridge = parseAbi([
  'function minPerTx(address token) external view returns(uint256)',
  'function foreignTokenAddress(address token) external view returns(address)',
  'function homeTokenAddress(address token) external view returns(address)',
  'function bridgedTokenAddress(address token) external view returns(address)',
  'function nativeTokenAddress(address token) external view returns(address)',
  'function feeManager() external view returns(address)',
  'function relayTokensAndCall(address token, address _receiver, uint256 _value, bytes memory _data) external',
  'function relayTokens(address token, address _receiver, uint256 _value) external',
])
/** the abi for the input bridge with extra input for the sender origin (tokensex) */
export const inputBridgeExtraInput = parseAbi([
  'function relayTokensAndCall(address token, address _receiver, uint256 _value, bytes memory _data, address _senderOrigin) external',
  'function relayTokens(address token, address _receiver, uint256 _value, address _senderOrigin) external',
])
/** the abi for erc677 tokens */
export const erc677 = parseAbi([
  'function transferAndCall(address, uint256, bytes calldata) external',
])
/** the abi for erc677 tokens bridge with extra input for the sender origin (tokensex) */
export const erc677ExtraInput = parseAbi([
  'function transferAndCall(address, uint256, bytes calldata, address sender) external',
])
/** the abi to read data from the output router */
export const outputRouter = parseAbi([
  'function onTokenBridged(address _token, uint256 _value, bytes memory _data) external payable',
  'function WETH() external view returns(address)',
  'function bridge() external view returns(address)',
])
/** the abi for the output bridge */
export const outputBridge = parseAbi(['function bridgeContract() external view returns(address)'])
/** the abi for the fee manager */
export const feeManager = parseAbi([
  'function HOME_TO_FOREIGN_FEE() public view returns(bytes32)',
  'function FOREIGN_TO_HOME_FEE() public view returns(bytes32)',
  'function getFee(bytes32, address) public view returns(uint256)',
])
/** the abi for the native router */
export const nativeRouter = parseAbi([
  'function wrapAndRelayTokens(address receiver) external payable',
  'function relayTokensAndCall(address receiver, bytes calldata data) external payable',
])
/** the abi for the native router with extra input for the sender origin (tokensex) */
export const nativeRouterExtraInput = parseAbi([
  'function wrapAndRelayTokens(address receiver, address sender) external payable',
  'function relayTokensAndCall(address receiver, bytes calldata data, address sender) external payable',
])
/** the abi for the univ2 router */
export const univ2Router = parseAbi([
  'function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns(uint256[] memory)',
])
/** the abi for the fee delivery struct */
export const feeDeliveryStruct = parseAbiParameters('(address, uint256, uint256, uint256)')
/** the abi for the relay tokens direct */
export const relayTokensDirect = parseAbi([
  'function safeExecuteSignaturesWithAutoGasLimit(bytes calldata data, bytes calldata signatures) external',
])
/** the abi for the home amb */
export const homeAmb = parseAbi([
  'function submitSignature(bytes message, bytes signature) external',
])

/** the abi for the univ2 pair */
export const pair = parseAbi([
  'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
])
