// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "../utils/WandurparVoucher.sol";

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);

    function transfer(address to, uint256 amount) external returns (bool);
}

contract WandurparRewards is Ownable, AccessControl, WandurparVoucher {
    IERC20 _rewardsERC20;

    bytes32 ADMIN_ROLE = keccak256("ADMIN_ROLE");

    mapping(address => uint256) public userEarnings;

    event RewardClaimed(
        address rewardAddresses,
        uint256 amounts,
        uint256 timestamp
    );
    event MaxAmountUpdated(
        uint256 oldAmount,
        uint256 newAmount,
        uint256 timestamp
    );

    uint256 private _maxTokensPerUserPerTransaction = 240 * 10**18; // 240 tokens

    constructor(IERC20 rewardsERC20) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setRoleAdmin(ADMIN_ROLE, DEFAULT_ADMIN_ROLE);
        _rewardsERC20 = rewardsERC20;
    }

    function getRewardsERC20() public view returns (IERC20) {
        return _rewardsERC20;
    }

    function setRewardsERC20(IERC20 rewardsERC20) public onlyOwner {
        _rewardsERC20 = rewardsERC20;
    }

    function getMaxTransactionAmount() public view returns (uint256) {
        return _maxTokensPerUserPerTransaction;
    }

    function setMaxTransactionAmount(uint256 amount)
        public
        onlyRole(ADMIN_ROLE)
    {
        uint256 oldAmount = _maxTokensPerUserPerTransaction;
        _maxTokensPerUserPerTransaction = amount;
        emit MaxAmountUpdated(oldAmount, amount, block.timestamp);
    }

    function checkPoolTokens() public view returns (uint256) {
        return _rewardsERC20.balanceOf(address(this));
    }

    function claimReward(RewardVoucher calldata voucher) public payable {
        require(
            _msgSender() == voucher.redeemer,
            "Wandurpar: Only the redeemer can redeem this voucher"
        );

        address signer = _verifyVoucher(voucher);
        require(
            hasRole(ADMIN_ROLE, signer),
            "Wandurpar: Unauthorized signature"
        );
        _rewardsERC20.transfer(voucher.redeemer, voucher.amount);
        emit RewardClaimed(voucher.redeemer, voucher.amount, block.timestamp);
    }
}
