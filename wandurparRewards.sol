// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract wandurparRewards is Ownable, AccessControl {
    IERC20 _rewardsERC20;
    
    bytes32 adminRole = keccak256("Admin");

    uint256 _cooldownTimeperiod = 1 days;
    mapping (address => uint256) public userCooldown;
    mapping (address => uint256) public userEarnings;

    event RewardSent(address[] rewardAddresses, uint256[] amounts, uint256 timestamp);

    constructor (IERC20 rewardsERC20) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(adminRole, msg.sender);
        _setRoleAdmin(adminRole, DEFAULT_ADMIN_ROLE);

        _rewardsERC20 = rewardsERC20;       
    }

    function getRewardsERC20() public view returns (IERC20) {
        return _rewardsERC20;
    }

    function setRewardsERC20(IERC20 rewardsERC20) public onlyOwner {
        _rewardsERC20 = rewardsERC20;
    }

    function checkPoolTokens() public view returns (uint256) {
        return _rewardsERC20.balanceOf(address(this));
    }

    function setCooldown(uint256 cooldownTime) public onlyOwner {
        _cooldownTimeperiod = cooldownTime;
    }

    function getCooldown() public view returns(uint256) {
        return _cooldownTimeperiod;
    }

    function sendRewards(address[] memory rewardAddresses, uint256[] memory amounts) public onlyRole(adminRole) {
        require(rewardAddresses.length == amounts.length, "length of addresses don't match the the amounts sent");
        for (uint256 i = 0; i < rewardAddresses.length; i++) {
            require(block.timestamp >= userCooldown[rewardAddresses[i]] + _cooldownTimeperiod, "One of the addresses is still under cooldown timeperiod");
            require(_rewardsERC20.transfer(rewardAddresses[i], amounts[i]));
            userCooldown[rewardAddresses[i]] = block.timestamp;
            userEarnings[rewardAddresses[i]] += amounts[i];
        }
        emit RewardSent(rewardAddresses, amounts, block.timestamp);
    }

}
