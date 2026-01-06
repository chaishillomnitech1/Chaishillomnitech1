// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title NoorCitiesStaking
 * @dev Noor Cities Economy Staking System with multi-token support
 * @author Chais The Great ∞
 * 
 * This contract implements staking for:
 * - $NOOR tokens
 * - EarthCoin
 * - BlessingCoin
 * 
 * Features:
 * - Automatic zakat forwarding (7.77%)
 * - Secure wallet delegation
 * - Integration with CHXToken ecosystem
 * - Frequency alignment: 963Hz + 528Hz
 * 
 * Status: ACTIVE
 */

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract NoorCitiesStaking is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // ============ CONSTANTS ============
    
    /// @dev Zakat percentage (7.77% = 777 basis points)
    uint256 public constant ZAKAT_PERCENTAGE = 777;
    uint256 public constant BASIS_POINTS = 10000;
    
    /// @dev Divine frequencies (Hz)
    uint256 public constant PINEAL_FREQUENCY = 963;
    uint256 public constant HEALING_FREQUENCY = 528;
    
    /// @dev Minimum staking period (7 days)
    uint256 public constant MIN_STAKING_PERIOD = 7 days;
    
    // ============ STRUCTS ============
    
    struct StakeInfo {
        uint256 amount;
        uint256 startTime;
        uint256 lastClaimTime;
        uint256 rewardDebt;
        bool isDelegated;
        address delegatee;
    }
    
    struct TokenConfig {
        bool enabled;
        uint256 rewardRate; // Rewards per second per token staked (in basis points)
        uint256 totalStaked;
        address zakatRecipient;
    }
    
    // ============ STATE VARIABLES ============
    
    /// @dev Token configurations
    mapping(address => TokenConfig) public tokenConfigs;
    
    /// @dev User stakes: user => token => StakeInfo
    mapping(address => mapping(address => StakeInfo)) public stakes;
    
    /// @dev Delegation mappings
    mapping(address => address) public delegates;
    mapping(address => bool) public isDelegator;
    
    /// @dev Total zakat distributed per token
    mapping(address => uint256) public totalZakatDistributed;
    
    /// @dev Supported token addresses
    address[] public supportedTokens;
    
    // ============ EVENTS ============
    
    event TokenConfigured(address indexed token, bool enabled, uint256 rewardRate, address zakatRecipient);
    event Staked(address indexed user, address indexed token, uint256 amount, uint256 zakatAmount);
    event Unstaked(address indexed user, address indexed token, uint256 amount, uint256 rewards);
    event RewardsClaimed(address indexed user, address indexed token, uint256 amount);
    event ZakatForwarded(address indexed token, address indexed recipient, uint256 amount);
    event DelegationSet(address indexed delegator, address indexed delegatee);
    event DelegationRemoved(address indexed delegator, address indexed delegatee);
    
    // ============ CONSTRUCTOR ============
    
    constructor() Ownable(msg.sender) {}
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Configure a token for staking
     * @param token Token address
     * @param enabled Whether token is enabled for staking
     * @param rewardRate Reward rate in basis points per second
     * @param zakatRecipient Address to receive zakat
     */
    function configureToken(
        address token,
        bool enabled,
        uint256 rewardRate,
        address zakatRecipient
    ) external onlyOwner {
        require(token != address(0), "Invalid token address");
        require(zakatRecipient != address(0), "Invalid zakat recipient");
        
        if (!tokenConfigs[token].enabled && enabled) {
            supportedTokens.push(token);
        }
        
        tokenConfigs[token] = TokenConfig({
            enabled: enabled,
            rewardRate: rewardRate,
            totalStaked: tokenConfigs[token].totalStaked,
            zakatRecipient: zakatRecipient
        });
        
        emit TokenConfigured(token, enabled, rewardRate, zakatRecipient);
    }
    
    /**
     * @dev Pause staking operations
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause staking operations
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // ============ STAKING FUNCTIONS ============
    
    /**
     * @dev Stake tokens
     * @param token Token address to stake
     * @param amount Amount to stake
     */
    function stake(address token, uint256 amount) external nonReentrant whenNotPaused {
        require(tokenConfigs[token].enabled, "Token not enabled");
        require(amount > 0, "Amount must be greater than 0");
        
        TokenConfig storage config = tokenConfigs[token];
        StakeInfo storage stakeInfo = stakes[msg.sender][token];
        
        // Claim any pending rewards first
        if (stakeInfo.amount > 0) {
            _claimRewards(msg.sender, token);
        }
        
        // Calculate zakat (7.77%)
        uint256 zakatAmount = (amount * ZAKAT_PERCENTAGE) / BASIS_POINTS;
        uint256 stakeAmount = amount - zakatAmount;
        
        // Transfer tokens from user
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        
        // Forward zakat
        if (zakatAmount > 0) {
            IERC20(token).safeTransfer(config.zakatRecipient, zakatAmount);
            totalZakatDistributed[token] += zakatAmount;
            emit ZakatForwarded(token, config.zakatRecipient, zakatAmount);
        }
        
        // Update stake info
        stakeInfo.amount += stakeAmount;
        if (stakeInfo.startTime == 0) {
            stakeInfo.startTime = block.timestamp;
        }
        stakeInfo.lastClaimTime = block.timestamp;
        
        // Update total staked
        config.totalStaked += stakeAmount;
        
        emit Staked(msg.sender, token, stakeAmount, zakatAmount);
    }
    
    /**
     * @dev Unstake tokens
     * @param token Token address to unstake
     * @param amount Amount to unstake
     */
    function unstake(address token, uint256 amount) external nonReentrant whenNotPaused {
        StakeInfo storage stakeInfo = stakes[msg.sender][token];
        require(stakeInfo.amount >= amount, "Insufficient stake");
        require(block.timestamp >= stakeInfo.startTime + MIN_STAKING_PERIOD, "Minimum staking period not met");
        
        // Claim rewards first
        uint256 rewards = _claimRewards(msg.sender, token);
        
        // Update stake info
        stakeInfo.amount -= amount;
        
        // Update total staked
        tokenConfigs[token].totalStaked -= amount;
        
        // Transfer tokens back to user
        IERC20(token).safeTransfer(msg.sender, amount);
        
        emit Unstaked(msg.sender, token, amount, rewards);
    }
    
    /**
     * @dev Claim pending rewards
     * @param token Token address
     */
    function claimRewards(address token) external nonReentrant whenNotPaused {
        uint256 rewards = _claimRewards(msg.sender, token);
        require(rewards > 0, "No rewards to claim");
    }
    
    // ============ DELEGATION FUNCTIONS ============
    
    /**
     * @dev Set delegation for wallet
     * @param delegatee Address to delegate to
     */
    function setDelegation(address delegatee) external {
        require(delegatee != address(0), "Invalid delegatee");
        require(delegatee != msg.sender, "Cannot delegate to self");
        
        delegates[msg.sender] = delegatee;
        isDelegator[msg.sender] = true;
        
        emit DelegationSet(msg.sender, delegatee);
    }
    
    /**
     * @dev Remove delegation
     */
    function removeDelegation() external {
        address previousDelegatee = delegates[msg.sender];
        require(previousDelegatee != address(0), "No delegation set");
        
        delete delegates[msg.sender];
        isDelegator[msg.sender] = false;
        
        emit DelegationRemoved(msg.sender, previousDelegatee);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Calculate pending rewards for a user
     * @param user User address
     * @param token Token address
     * @return Pending rewards amount
     */
    function pendingRewards(address user, address token) external view returns (uint256) {
        StakeInfo storage stakeInfo = stakes[user][token];
        if (stakeInfo.amount == 0) {
            return 0;
        }
        
        TokenConfig storage config = tokenConfigs[token];
        uint256 timeElapsed = block.timestamp - stakeInfo.lastClaimTime;
        uint256 rewards = (stakeInfo.amount * config.rewardRate * timeElapsed) / BASIS_POINTS;
        
        return rewards;
    }
    
    /**
     * @dev Get user's stake info
     * @param user User address
     * @param token Token address
     * @return amount Staked amount
     * @return startTime Stake start time
     * @return pendingReward Pending rewards
     */
    function getStakeInfo(address user, address token) external view returns (
        uint256 amount,
        uint256 startTime,
        uint256 pendingReward
    ) {
        StakeInfo storage stakeInfo = stakes[user][token];
        amount = stakeInfo.amount;
        startTime = stakeInfo.startTime;
        
        if (stakeInfo.amount > 0) {
            TokenConfig storage config = tokenConfigs[token];
            uint256 timeElapsed = block.timestamp - stakeInfo.lastClaimTime;
            pendingReward = (stakeInfo.amount * config.rewardRate * timeElapsed) / BASIS_POINTS;
        }
    }
    
    /**
     * @dev Get delegation info
     * @param user User address
     * @return isDelegating Whether user has delegation set
     * @return delegatee Delegatee address
     */
    function getDelegationInfo(address user) external view returns (bool isDelegating, address delegatee) {
        isDelegating = isDelegator[user];
        delegatee = delegates[user];
    }
    
    /**
     * @dev Get all supported tokens
     * @return Array of supported token addresses
     */
    function getSupportedTokens() external view returns (address[] memory) {
        return supportedTokens;
    }
    
    /**
     * @dev Get token configuration
     * @param token Token address
     * @return enabled Whether token is enabled
     * @return rewardRate Reward rate
     * @return totalStaked Total amount staked
     * @return zakatRecipient Zakat recipient address
     */
    function getTokenConfig(address token) external view returns (
        bool enabled,
        uint256 rewardRate,
        uint256 totalStaked,
        address zakatRecipient
    ) {
        TokenConfig storage config = tokenConfigs[token];
        enabled = config.enabled;
        rewardRate = config.rewardRate;
        totalStaked = config.totalStaked;
        zakatRecipient = config.zakatRecipient;
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Internal function to claim rewards
     * @param user User address
     * @param token Token address
     * @return rewards Amount of rewards claimed
     */
    function _claimRewards(address user, address token) internal returns (uint256 rewards) {
        StakeInfo storage stakeInfo = stakes[user][token];
        if (stakeInfo.amount == 0) {
            return 0;
        }
        
        TokenConfig storage config = tokenConfigs[token];
        uint256 timeElapsed = block.timestamp - stakeInfo.lastClaimTime;
        rewards = (stakeInfo.amount * config.rewardRate * timeElapsed) / BASIS_POINTS;
        
        if (rewards > 0) {
            stakeInfo.lastClaimTime = block.timestamp;
            stakeInfo.rewardDebt += rewards;
            
            // Transfer rewards (from contract balance)
            IERC20(token).safeTransfer(user, rewards);
            
            emit RewardsClaimed(user, token, rewards);
        }
    }
}
