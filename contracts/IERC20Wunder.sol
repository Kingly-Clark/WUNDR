// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @dev Interface of Wunder
 */
interface IERC20Wunder is IERC20 {
    /**
     * @dev Emitted when `account` is frozen.
     */
    event MultiTransfer(
        address indexed sender,
        address[] recipients,
        uint256[] amounts
    );

    /**
     * @dev See {ERC20-_transfer}.
     *
     * The ability to transfor to mutiple recipients.
     *
     * Requirements:
     * - contract must not be paused.
     * - sender must not be frozen.
     * - recipients must not be frozen.
     * - recipients must not be the sender.
     */
    function multiTransfer(
        address[] memory recipients,
        uint256[] memory amounts
    ) external returns (bool);
}
