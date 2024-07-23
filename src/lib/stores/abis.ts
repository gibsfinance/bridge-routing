import * as viem from 'viem'

/** the abi for the bridge */
export const inputBridge = viem.parseAbi([
  'function relayTokensAndCall(address token, address _receiver, uint256 _value, bytes memory _data) external',
  'function relayTokens(address token, address _receiver, uint256 _value) external',
  'function minPerTx(address token) external view returns(uint256)',
  'function foreignTokenAddress(address token) external view returns(address)',
  'function bridgedTokenAddress(address token) external view returns(address)',
  'function homeTokenAddress(address token) external view returns(address)',
  'function nativeTokenAddress(address token) external view returns(address)',
])
export const inputBridgeBNB = viem.parseAbi([
  'function relayTokens(address token, address _receiver, uint256 _value, address _senderOrigin) external',
])
export const erc677 = viem.parseAbi(['function transferAndCall(address, uint256, bytes calldata) external'])
export const erc677BNB = viem.parseAbi([
  'function transferAndCall(address, uint256, bytes calldata, address sender) external',
])
export const outputRouter = viem.parseAbi([
  'function onTokenBridged(address _token, uint256 _value, bytes memory _data) external payable',
  'function WETH() external view returns(address)',
])
export const feeManager = viem.parseAbi([
  'function HOME_TO_FOREIGN_FEE() public view returns(bytes32)',
  'function FOREIGN_TO_HOME_FEE() public view returns(bytes32)',
  'function getFee(bytes32, address) public view returns(uint256)',
])
export const pulsexRouter = viem.parseAbi([
  'function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns(uint256[] memory)',
])
export const feeDeliveryStruct = viem.parseAbiParameters('(address, uint256, uint256, uint256)')
