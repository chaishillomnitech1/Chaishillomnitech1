// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ProsperityCoin
 * @dev $PROSPER - Token of Infinite Abundance and Divine Prosperity
 * @author Supreme King Chais The Great ∞
 * 
 * This contract implements the Prosperity Coin with:
 * - ERC-20 standard compliance
 * - Reward mechanism for abundance mindset practices
 * - Integration with Holy Bloodline NFT contract
 * - Wealth consciousness milestone rewards
 * - Prosperity affirmation rewards
 * - Abundance frequency alignment (888Hz)
 * 
 * Total Supply: 888,000,000 $PROSPER (aligned with 888Hz frequency)
 * Frequency: 888Hz (Infinite Abundance)
 * Status: PROSPERITY ACTIVATION PROTOCOL ACTIVE
 */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ProsperityCoin is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ReentrancyGuard {
    
    // ============ FREQUENCY CONSTANTS ============
    
    /// @dev Infinite abundance frequency (888Hz)
    uint256 public constant ABUNDANCE_FREQUENCY_888HZ = 888;
    
    // ============ TOKEN CONSTANTS ============
    
    /// @dev Total supply: 888 million PROSPER tokens
    uint256 public constant TOTAL_SUPPLY = 888_000_000 * 10**18;
    
    /// @dev Reward pool allocation (55% of supply)
    uint256 public constant REWARD_POOL = TOTAL_SUPPLY * 55 / 100;
    
    /// @dev Community treasury (30% of supply)
    uint256 public constant COMMUNITY_TREASURY = TOTAL_SUPPLY * 30 / 100;
    
    /// @dev Development fund (10% of supply)
    uint256 public constant DEVELOPMENT_FUND = TOTAL_SUPPLY * 10 / 100;
    
    /// @dev Initial distribution (5% of supply)
    uint256 public constant INITIAL_DISTRIBUTION = TOTAL_SUPPLY * 5 / 100;
    
    // ============ REWARD CONSTANTS ============
    
    /// @dev Base reward for prosperity practice
    uint256 public constant PROSPERITY_PRACTICE_REWARD = 88 * 10**18;
    
    /// @dev Base reward for abundance affirmation
    uint256 public constant AFFIRMATION_REWARD = 8 * 10**18;
    
    /// @dev Base reward for wealth milestone
    uint256 public constant WEALTH_MILESTONE_REWARD = 888 * 10**18;
    
    /// @dev Base reward for generosity action
    uint256 public constant GENEROSITY_REWARD = 44 * 10**18;
    
    // ============ STATE VARIABLES ============
    
    /// @dev Holy Bloodline NFT contract address
    address public holyBloodlineNFT;
    
    /// @dev Community treasury address
    address public communityTreasury;
    
    /// @dev Development fund address
    address public developmentFund;
    
    /// @dev Mapping: User => Total Rewards Earned
    mapping(address => uint256) public totalRewardsEarned;
    
    /// @dev Mapping: User => Last Claim Timestamp
    mapping(address => uint256) public lastClaimTime;
    
    /// @dev Mapping: User => Affirmation Count
    mapping(address => uint256) public affirmationCount;
    
    /// @dev Mapping: User => Wealth Milestone Level
    mapping(address => uint256) public wealthMilestoneLevel;
    
    /// @dev Mapping: User => Generosity Acts
    mapping(address => uint256) public generosityActs;
    
    /// @dev Mapping: Address => Authorized Rewarder Status
    mapping(address => bool) public isRewarder;
    
    /// @dev Total rewards distributed
    uint256 public totalRewardsDistributed;
    
    /// @dev Cooldown period for claims (12 hours)
    uint256 public constant CLAIM_COOLDOWN = 12 hours;
    
    // ============ EVENTS ============
    
    event RewardClaimed(address indexed user, uint256 amount, string practiceType);
    event AffirmationCompleted(address indexed user, uint256 count, uint256 reward);
    event WealthMilestoneAchieved(address indexed user, uint256 level, uint256 reward);
    event GenerosityRecorded(address indexed user, uint256 count, uint256 reward);
    event RewarderUpdated(address indexed rewarder, bool status);
    event HolyBloodlineNFTUpdated(address indexed oldNFT, address indexed newNFT);
    event CommunityTreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event DevelopmentFundUpdated(address indexed oldFund, address indexed newFund);
    
    // ============ ERRORS ============
    
    error InvalidAddress();
    error ClaimCooldownActive();
    error InsufficientRewardPool();
    error UnauthorizedRewarder();
    error InvalidRewardAmount();
    
    // ============ CONSTRUCTOR ============
    
    /**
     * @dev Constructor initializes the token with distribution
     * @param _communityTreasury Address of Community Treasury
     * @param _developmentFund Address of Development Fund
     */
    constructor(
        address _communityTreasury,
        address _developmentFund
    ) ERC20("Prosperity Coin", "PROSPER") Ownable(msg.sender) {
        if (_communityTreasury == address(0) || _developmentFund == address(0)) {
            revert InvalidAddress();
        }
        
        communityTreasury = _communityTreasury;
        developmentFund = _developmentFund;
        
        // Mint tokens according to distribution
        _mint(address(this), REWARD_POOL); // Held for rewards
        _mint(_communityTreasury, COMMUNITY_TREASURY);
        _mint(_developmentFund, DEVELOPMENT_FUND);
        _mint(address(this), INITIAL_DISTRIBUTION); // Held for initial distribution
        
        // Owner is authorized rewarder by default
        isRewarder[msg.sender] = true;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Set Holy Bloodline NFT contract address
     * @param _nftContract NFT contract address
     */
    function setHolyBloodlineNFT(address _nftContract) external onlyOwner {
        if (_nftContract == address(0)) revert InvalidAddress();
        address oldNFT = holyBloodlineNFT;
        holyBloodlineNFT = _nftContract;
        emit HolyBloodlineNFTUpdated(oldNFT, _nftContract);
    }
    
    /**
     * @dev Update community treasury address
     * @param _newTreasury New treasury address
     */
    function updateCommunityTreasury(address _newTreasury) external onlyOwner {
        if (_newTreasury == address(0)) revert InvalidAddress();
        address oldTreasury = communityTreasury;
        communityTreasury = _newTreasury;
        emit CommunityTreasuryUpdated(oldTreasury, _newTreasury);
    }
    
    /**
     * @dev Update development fund address
     * @param _newFund New fund address
     */
    function updateDevelopmentFund(address _newFund) external onlyOwner {
        if (_newFund == address(0)) revert InvalidAddress();
        address oldFund = developmentFund;
        developmentFund = _newFund;
        emit DevelopmentFundUpdated(oldFund, _newFund);
    }
    
    /**
     * @dev Update rewarder authorization
     * @param _rewarder Address to update
     * @param _status Authorization status
     */
    function updateRewarder(address _rewarder, bool _status) external onlyOwner {
        if (_rewarder == address(0)) revert InvalidAddress();
        isRewarder[_rewarder] = _status;
        emit RewarderUpdated(_rewarder, _status);
    }
    
    /**
     * @dev Pause token transfers (emergency only)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // ============ REWARD FUNCTIONS ============
    
    /**
     * @dev Reward user for abundance affirmation
     * @param user Address to reward
     * @param count Number of affirmations completed
     */
    function rewardAffirmation(address user, uint256 count) external nonReentrant {
        if (!isRewarder[msg.sender]) revert UnauthorizedRewarder();
        if (user == address(0)) revert InvalidAddress();
        
        uint256 reward = AFFIRMATION_REWARD * count;
        if (balanceOf(address(this)) < reward) revert InsufficientRewardPool();
        
        affirmationCount[user] += count;
        _distributeReward(user, reward, "AFFIRMATION");
        
        emit AffirmationCompleted(user, affirmationCount[user], reward);
    }
    
    /**
     * @dev Reward user for wealth milestone achievement
     * @param user Address to reward
     * @param level Wealth milestone level achieved
     */
    function rewardWealthMilestone(address user, uint256 level) external nonReentrant {
        if (!isRewarder[msg.sender]) revert UnauthorizedRewarder();
        if (user == address(0)) revert InvalidAddress();
        
        uint256 reward = WEALTH_MILESTONE_REWARD * level;
        if (balanceOf(address(this)) < reward) revert InsufficientRewardPool();
        
        wealthMilestoneLevel[user] = level;
        _distributeReward(user, reward, "WEALTH_MILESTONE");
        
        emit WealthMilestoneAchieved(user, level, reward);
    }
    
    /**
     * @dev Reward user for generosity action
     * @param user Address to reward
     * @param acts Number of generosity acts performed
     */
    function rewardGenerosity(address user, uint256 acts) external nonReentrant {
        if (!isRewarder[msg.sender]) revert UnauthorizedRewarder();
        if (user == address(0)) revert InvalidAddress();
        
        uint256 reward = GENEROSITY_REWARD * acts;
        if (balanceOf(address(this)) < reward) revert InsufficientRewardPool();
        
        generosityActs[user] += acts;
        _distributeReward(user, reward, "GENEROSITY");
        
        emit GenerosityRecorded(user, generosityActs[user], reward);
    }
    
    /**
     * @dev Reward user for prosperity practice
     * @param user Address to reward
     * @param practices Number of practices completed
     */
    function rewardProsperityPractice(address user, uint256 practices) external nonReentrant {
        if (!isRewarder[msg.sender]) revert UnauthorizedRewarder();
        if (user == address(0)) revert InvalidAddress();
        
        uint256 reward = PROSPERITY_PRACTICE_REWARD * practices;
        if (balanceOf(address(this)) < reward) revert InsufficientRewardPool();
        
        _distributeReward(user, reward, "PROSPERITY_PRACTICE");
    }
    
    /**
     * @dev Custom reward with specific amount
     * @param user Address to reward
     * @param amount Reward amount
     * @param practiceType Type of practice completed
     */
    function customReward(
        address user,
        uint256 amount,
        string memory practiceType
    ) external nonReentrant {
        if (!isRewarder[msg.sender]) revert UnauthorizedRewarder();
        if (user == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidRewardAmount();
        
        if (balanceOf(address(this)) < amount) revert InsufficientRewardPool();
        
        _distributeReward(user, amount, practiceType);
    }
    
    /**
     * @dev Internal function to distribute rewards
     */
    function _distributeReward(
        address user,
        uint256 amount,
        string memory practiceType
    ) private {
        _transfer(address(this), user, amount);
        totalRewardsEarned[user] += amount;
        totalRewardsDistributed += amount;
        lastClaimTime[user] = block.timestamp;
        
        emit RewardClaimed(user, amount, practiceType);
    }
    
    // ============ DISTRIBUTION FUNCTIONS ============
    
    /**
     * @dev Airdrop tokens to multiple addresses
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts to airdrop
     */
    function airdrop(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external onlyOwner nonReentrant {
        require(recipients.length == amounts.length, "Length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            if (recipients[i] != address(0)) {
                _transfer(address(this), recipients[i], amounts[i]);
            }
        }
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get user statistics
     */
    function getUserStats(address user) external view returns (
        uint256 totalRewards,
        uint256 lastClaim,
        uint256 affirmations,
        uint256 wealthLevel,
        uint256 generosity
    ) {
        return (
            totalRewardsEarned[user],
            lastClaimTime[user],
            affirmationCount[user],
            wealthMilestoneLevel[user],
            generosityActs[user]
        );
    }
    
    /**
     * @dev Get remaining reward pool balance
     */
    function getRemainingRewardPool() external view returns (uint256) {
        return balanceOf(address(this));
    }
    
    /**
     * @dev Get frequency signature
     */
    function getFrequencySignature() external pure returns (uint256) {
        return ABUNDANCE_FREQUENCY_888HZ;
    }
    
    // ============ OVERRIDE FUNCTIONS ============
    
    function _update(
        address from,
        address to,
        uint256 amount
    ) internal virtual override(ERC20, ERC20Pausable) {
        super._update(from, to, amount);
    }
}
