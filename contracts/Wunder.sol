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
    mapping(address => bool) private _frozen;
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant GOVERN_ROLE = keccak256("GOVERN_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    modifier whenNotFrozen(address account) {
        require(!_frozen[account], "Wunder: Account is frozen");
        _;
    }

    modifier whenFrozen(address account) {
        require(_frozen[account], "Wunder: Account is not frozen");
        _;
    }

    function isFrozen(address account) public view override returns (bool) {
        return _frozen[account];
    }

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
    function freeze(
        address account
    )
        public
        override
        whenNotPaused
        onlyRole(GOVERN_ROLE)
        whenNotFrozen(account)
        returns (bool)
    {
        _frozen[account] = true;
        emit AddressFrozen(account);
        return true;
    }

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
    function unfreeze(
        address account
    )
        public
        override
        whenNotPaused
        onlyRole(GOVERN_ROLE)
        whenFrozen(account)
        returns (bool)
    {
        _frozen[account] = false;
        emit AddressUnfrozen(account);
        return true;
    }

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
    function seize(
        address account
    ) public override onlyRole(GOVERN_ROLE) whenFrozen(account) returns (bool) {
        require(account != address(this), "Wunder: cannot clean to self");
        require(balanceOf(account) > 0, "Wunder: cannot clean empty account");
        uint256 balance = balanceOf(account);
        // unfreeze the account to allow transfer
        // and use curBalance and newBalance to check if transfer was successful
        uint256 curBalance = balanceOf(address(this));
        _frozen[account] = false;
        _transfer(account, address(this), balance);
        uint256 newBalance = balanceOf(address(this));
        _frozen[account] = newBalance == curBalance + balance;
        emit AddressSeized(account);
        return true;
    }

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
    function withdraw(
        uint256 amount
    ) public override onlyRole(GOVERN_ROLE) returns (bool) {
        require(amount <= balanceOf(address(this)), "Wunder: not enough funds");
        _transfer(address(this), _msgSender(), amount);
        emit FundsWithdrew(_msgSender(), amount);
        return true;
    }

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
    ) public whenNotPaused onlyRole(MINTER_ROLE) whenNotFrozen(account) {
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
    ) public override returns (bool) {
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
            require(!isFrozen(recipients[i]), "Wunder: Account is frozen");
            _transfer(_msgSender(), recipients[i], amounts[i]);
        }
        emit MultiTransfer(_msgSender(), recipients, amounts);
        return true;
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

    /*
     * @dev See {ERC20-_beforeTokenTransfer}.
     *
     * Adds the following restrictions:
     * - contract must not be paused.
     * - sender must not be frozen.
     * - recipient must not be frozen.
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused whenNotFrozen(from) whenNotFrozen(to) {
        super._beforeTokenTransfer(from, to, amount);
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
