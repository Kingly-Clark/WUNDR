# Wunder

<a href="https://wunderpar.com/">Wunderpar</a> is an innovative golf app that combines the power of blockchain technology with the passion of golfers worldwide.

Our mission is to enhance the golf experience for players of all skill levels and ages by offering a unique rewards system, comprehensive golf tools, and access to an exclusive marketplace, incentivizing them to play even more rounds, and earn while doing so.

## Overview

Wunder is a ERC20 token that draws a lot of inspiration from the [USDP](https://github.com/paxosglobal/usdp-contracts) project. It is a non-upgradable EIP-20 compatible contract with 3 additional features:

- The ability to freeze-and-seize funds from a user's account through a wallet with the GOVERN_ROLE
- The ability for third parties to offer "GAS-less" transactions to custodial wallet users through the use of the `multiTransfer` method.
- Uses <a href="https://docs.openzeppelin.com/contracts/4.x/api/access#AccessControlDefaultAdminRules">AccessControlDefaultAdminRules</a> instead of <a href="">Ownable</a> to allow more stringent control over the admin role in the future.

### Inheritance

The contract inherits from the following OpenZeppelin contracts:

- ERC20
- ERC20Burnable
- AccessControlDefaultAdminRules - and by extension the following contracts:
  - Context
  - ERC165
- Pausable

### Roles

- MINTER_ROLE: A wallet that has this role can
  - call the `mint` method
- BURNER_ROLE: A wallet that has this role can
  - call the `burn` method
- GOVERN_ROLE: A wallet that has this role can
  - call the `freeze` method
  - call the `unfreeze` method
  - call the `seize` method
  - call the `withdraw` method
- PAUSER_ROLE: A wallet that has this role can
  - call the `pause` method
  - call the `unpause` method

### ERC20 Token

The public interface of Wunder is the ERC20 interface
specified by [EIP-20](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md).

- `name()`
- `symbol()`
- `decimals()`
- `totalSupply()`
- `balanceOf(address who)`
- `transfer(address to, uint256 value)`
- `approve(address spender, uint256 value)`
- `allowance(address owner, address spender)`
- `transferFrom(address from, address to, uint256 value)`

And the usual events.

- `event Transfer(address indexed from, address indexed to, uint256 value)`
- `event Approval(address indexed owner, address indexed spender, uint256 value)`

A typical interaction with the contract will use `transfer` to move the token as payment.
Additionally, a pattern involving `approve` and `transferFrom` can be used to allow another
address to move tokens from your address to a third party without the need for the middle person
to custody the tokens, such as in the 0x protocol.

### Additional Events

We've enriched the ERC20 interface with the IERC20Wunder interface (`0xe6f9bbc6`), which adds the following methods and events:

#### Methods

- isFrozen(address account)
- freeze(address account)
- unfreeze(address account)
- seize(address account)
- withdraw(uint256 amount)
- multiTransfer(address[] memory recipients, uint256[] memory amounts)

#### Events

- event AddressFrozen(address indexed account);
- event AddressUnfrozen(address indexed account);
- event AddressSeized(address indexed account);
- event FundsWithdrew(address indexed account, uint256 amount);
- event MultiTransfer(address indexed sender, address[] recipients, uint256[] amounts);

## Testnet

There is a testnet version of the contract deployed on the Polygon Mumbai testnet at the following address:

```
Deploying contracts with the account: 0xb669972b8B410964C3f3d06A414a39Fc1B89b7e0
Wunder deployed to: 0xFd2a122420eA39F8d8234Ef365E0095921684F50
```
