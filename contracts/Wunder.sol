// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

// import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/AccessControlDefaultAdminRules.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./IERC20Wunder.sol";

contract Wunder is
    ERC20,
    AccessControlDefaultAdminRules,
    Pausable,
    IERC20Wunder
{
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    /**
     * See {IERC20-constructor}.
     *
     * @dev Grants `DEFAULT_ADMIN_ROLE` to the account that deploys the contract.
     *
     * Further roles can be granted by the deployer wallets by calling {grantRole}.
     *
     */
    constructor()
        ERC20("Wunderpar Token", "Wunder")
        AccessControlDefaultAdminRules(
            3 days,
            msg.sender // Explicit initial `DEFAULT_ADMIN_ROLE` holder
        )
    {}

    /**
     * @dev See {ERC20-_mint}.
     *
     * Requirements:
     * - contract must not be paused.
     * - caller must have the `MINTER_ROLE`.
     * - account must not be frozen.
     */
    function mint(
        address account,
        uint256 amount
    ) public whenNotPaused onlyRole(MINTER_ROLE) {
        _mint(account, amount);
    }

    /**
     * @dev See {ERC20-_burn}.
     *
     * Requirements:
     * - contract must not be paused.
     * - caller must have the `BURNER_ROLE`.
     */
    function burn(uint256 amount) public whenNotPaused onlyRole(BURNER_ROLE) {
        _burn(_msgSender(), amount);
    }

    /**
     * @dev See {Pausable-_pause}.
     *
     * Requirements:
     * - caller must have the `PAUSER_ROLE`.
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev See {Pausable-_unpause}.
     *
     * Requirements:
     * - caller must have the `PAUSER_ROLE`.
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function transfer(
        address to,
        uint256 amount
    ) public override(ERC20, IERC20) whenNotPaused returns (bool) {
        return super.transfer(to, amount);
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override(ERC20, IERC20) whenNotPaused returns (bool) {
        return super.transferFrom(from, to, amount);
    }

    /**
     * @dev Uses ERC20._transfer to transfer tokens from sender to recipient.
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
    ) public override whenNotPaused returns (bool) {
        require(
            recipients.length == amounts.length,
            "Wunder: recipients and amounts length mismatch"
        );

        require(
            recipients.length < 256,
            "Wunder: recipients and amounts length must be less than 256"
        );

        for (uint256 i = 0; i < recipients.length; i++) {
            require(
                recipients[i] != _msgSender(),
                "Wunder: Recipient cannot be the sender"
            );
            _transfer(_msgSender(), recipients[i], amounts[i]);
        }
        emit MultiTransfer(_msgSender(), recipients, amounts);
        return true;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override returns (bool) {
        return
            super.supportsInterface(interfaceId) ||
            interfaceId == type(IERC20).interfaceId ||
            interfaceId == type(IERC20Wunder).interfaceId;
    }
}
