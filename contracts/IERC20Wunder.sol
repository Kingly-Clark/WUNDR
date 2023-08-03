// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @dev Interface of Wunder
 */
interface IERC20Wunder is IERC20 {
    /**
     * @dev Emitted when `amounts` tokens are moved from one account (`sender`) to multiple `recipients`.
     */
    event BatchTransfer(
        address indexed sender,
        address[] recipients,
        uint256[] amounts
    );

    /**
     * @dev Emitted when `amounts` tokens are minted to multiple `recipients`.
     */
    event BatchMint(
        address indexed minter,
        address[] recipients,
        uint256[] amounts
    );

    /**
     * @dev See {ERC20-_transfer}.
     *
     * The ability to transfor to mutiple recipients.
     *
     * @param recipients - array of recipient addresses
     * @param amounts - array of amounts to transfer to each recipient
     *
     */
    function batchTransfer(
        address[] memory recipients,
        uint256[] memory amounts
    ) external;

    /**
     * @dev Mint tokens to multiple recipients.
     *
     * @param recipients - array of recipient addresses
     * @param amounts - array of amounts to mint to each recipient
     *
     */
    function batchMint(
        address[] memory recipients,
        uint256[] memory amounts
    ) external;
}
