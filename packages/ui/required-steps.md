# Required Info for Implementation

1. collect the relevant user inputs
    1. bridge to cross
    1. token to bridge
    1. amount to bridge
    1. destination wallet
    1. delivery desired
    1. delivery constraints (fee configuration)
1. pull relevant information from blockchain
    1. bridge fee percentage
    1. amount minimum for input token
    1. user balance of input token
    1. linked output token from bridge
    1. user balance of output token (optional for comprehensive ux)
    1. latest blocks from both chains (for gas info)
1. get relevant configured information
    1. images and info for both tokens (may be best to stick with 1 image for both)
    1. images and names for networks
    1. no expectations address
    1. bridge contracts
    1. router contracts
    1. whether or not the bridge requires extra parameter (bsc<>pls)
1. from the previous information it is possible to encode a transaction that can take a small fee from the user when delivery occurs. However, this only has to happen when going from pls to eth/bsc. Going to pls can be done without a router contract (most cases).
1. in order to make this internet money flavored, an additional fee will be taken
    1. Fee will be collected at the _beginning_ of the bridge
    1. Will be held in a pitstop or router contract paid in the gas token of the initiating network.
    1. The contract will be hardcoded to divide the input amount between a "no expectations" address and the time dividend contract on the respective network.
    1. A public function will allow for the tokens to be swept toward the aformentioned destinations.
    1. The amount required to initiate a bridge will be determined by...

