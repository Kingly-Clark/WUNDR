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
     * @dev Emitted when `account` is frozen.
     */
    event AddressFrozen(address indexed account);

    /**
     * @dev Emitted when `account` is unfrozen.
     */
    event AddressUnfrozen(address indexed account);

    /**
     * @dev Emitted when `account` is seized.
     *
     * note account needs to be frozen before it can be seized.
     */
    event AddressSeized(address indexed account);

    /**
     * @dev Emitted when `account` withdraws `amount` of funds that have been seized.
     */
    event FundsWithdrew(address indexed account, uint256 amount);

    /**
     * @dev Returns the amount of tokens in existence.
     */
    function isFrozen(address account) external view returns (bool);

    /**
     * @dev Freezes a specific account.
     *
     * @param account The address to be frozen.
     *
     * Requirements:
     * - the contract must not be paused.
     * - the caller must have the `GOVERN_ROLE`.
     * - the account must not be frozen.
     *
     * Emits AddressFrozen event.
     */
    function freeze(address account) external returns (bool);

    /**
     * @dev Unfreezes a specific account.
     *
     * @param account The address to be unfrozen.
     *
     * Requirements:
     * - the contract must not be paused.
     * - the caller must have the `GOVERN_ROLE`.
     * - the account must be frozen.
     *
     *
     * Emits AddressUnfrozen event.
     */
    function unfreeze(address account) external returns (bool);

    /**
     * @dev Seizes a specific account which entails transffering
     * all the funds to this contract which can later be pulled
     * and/or burned using the withdraw function.
     *
     * @param account The address to be seized.
     *
     * Requirements:
     * - contract must not be paused.
     * - caller must have the GOVERN_ROLE.
     * - account must not be frozen.
     * - account cannot be the contract address.
     * - account must have a balance greater than zero.
     *
     * Emits AddressSeized event.
     */
    function seize(address account) external returns (bool);

    /**
     * @dev Withdraws a specific amount of Wunder from this contract.
     *
     * @param amount The amount of Wunder to withdraw to the sender.
     *
     * Requirements:
     *
     * - contract must not be paused.
     * - contract must have enough Wunder to withdraw.
     * - caller must have the `GOVERN_ROLE`.
     *
     * Emits FundsWithdrew event.
     */
    function withdraw(uint256 amount) external returns (bool);

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
