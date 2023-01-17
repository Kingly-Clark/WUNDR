// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    constructor() ERC20("wunderpar", "WUNDR") {
        _mint(msg.sender, uint256(10**6 * 10**18)); // minting 1 million tokens with 18 decimals
    }
}
