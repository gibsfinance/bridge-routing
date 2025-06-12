import { parseAbi, parseAbiParameters } from 'viem'

/** the abi for the bridge */
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
export const inputBridgeExtraInput = parseAbi([
  'function relayTokensAndCall(address token, address _receiver, uint256 _value, bytes memory _data, address _senderOrigin) external',
  'function relayTokens(address token, address _receiver, uint256 _value, address _senderOrigin) external',
])
export const erc677 = parseAbi([
  'function transferAndCall(address, uint256, bytes calldata) external',
])
export const erc677ExtraInput = parseAbi([
  'function transferAndCall(address, uint256, bytes calldata, address sender) external',
])
export const outputRouter = parseAbi([
  'function onTokenBridged(address _token, uint256 _value, bytes memory _data) external payable',
  'function WETH() external view returns(address)',
  'function bridge() external view returns(address)',
])
export const outputBridge = parseAbi(['function bridgeContract() external view returns(address)'])
export const feeManager = parseAbi([
  'function HOME_TO_FOREIGN_FEE() public view returns(bytes32)',
  'function FOREIGN_TO_HOME_FEE() public view returns(bytes32)',
  'function getFee(bytes32, address) public view returns(uint256)',
])
export const nativeRouter = parseAbi([
  'function wrapAndRelayTokens(address receiver) external payable',
  'function relayTokensAndCall(address receiver, bytes calldata data) external payable',
])
export const nativeRouterExtraInput = parseAbi([
  'function wrapAndRelayTokens(address receiver, address sender) external payable',
  'function relayTokensAndCall(address receiver, bytes calldata data, address sender) external payable',
])
export const univ2Router = parseAbi([
  'function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns(uint256[] memory)',
])
export const feeDeliveryStruct = parseAbiParameters('(address, uint256, uint256, uint256)')

export const relayTokensDirect = parseAbi([
  'function safeExecuteSignaturesWithAutoGasLimit(bytes calldata data, bytes calldata signatures) external',
])
export const homeAmb = parseAbi([
  'function submitSignature(bytes message, bytes signature) external',
])
