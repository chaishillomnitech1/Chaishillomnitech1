// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title LoveCoin
 * @dev $LOVE - Token of Divine Love and Heart-Centered Unity
 * @author Supreme King Chais The Great ∞
 * 
 * This contract implements the Love Coin with:
 * - ERC-20 standard compliance
 * - Reward mechanism for love-based practices and unity actions
 * - Integration with Holy Bloodline NFT contract
 * - Heart-centered meditation rewards
 * - Unity and compassion action rewards
 * - Love frequency alignment (528Hz)
 * 
 * Total Supply: 528,000,000 $LOVE (aligned with 528Hz frequency)
 * Frequency: 528Hz (Love & DNA Repair)
 * Status: LOVE FREQUENCY ACTIVATION PROTOCOL ACTIVE
 */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract LoveCoin is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ReentrancyGuard {
    
    // ============ FREQUENCY CONSTANTS ============
    
    /// @dev Love frequency (528Hz) - DNA repair and healing
    uint256 public constant LOVE_FREQUENCY_528HZ = 528;
    
    // ============ TOKEN CONSTANTS ============
    
    /// @dev Total supply: 528 million LOVE tokens
    uint256 public constant TOTAL_SUPPLY = 528_000_000 * 10**18;
    
    /// @dev Reward pool allocation (50% of supply)
    uint256 public constant REWARD_POOL = TOTAL_SUPPLY * 50 / 100;
    
    /// @dev Community treasury (30% of supply)
    uint256 public constant COMMUNITY_TREASURY = TOTAL_SUPPLY * 30 / 100;
    
    /// @dev Development fund (15% of supply)
    uint256 public constant DEVELOPMENT_FUND = TOTAL_SUPPLY * 15 / 100;
    
    /// @dev Initial distribution (5% of supply)
    uint256 public constant INITIAL_DISTRIBUTION = TOTAL_SUPPLY * 5 / 100;
    
    // ============ REWARD CONSTANTS ============
    
    /// @dev Base reward for heart meditation
    uint256 public constant HEART_MEDITATION_REWARD = 52 * 10**18;
    
    /// @dev Base reward for compassion action
    uint256 public constant COMPASSION_REWARD = 28 * 10**18;
    
    /// @dev Base reward for unity practice
    uint256 public constant UNITY_REWARD = 108 * 10**18;
    
    /// @dev Base reward for forgiveness milestone
    uint256 public constant FORGIVENESS_REWARD = 77 * 10**18;
    
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
    
    /// @dev Mapping: User => Heart Meditation Count
    mapping(address => uint256) public heartMeditationCount;
    
    /// @dev Mapping: User => Compassion Actions
    mapping(address => uint256) public compassionActions;
    
    /// @dev Mapping: User => Unity Practices
    mapping(address => uint256) public unityPractices;
    
    /// @dev Mapping: User => Forgiveness Milestones
    mapping(address => uint256) public forgivenessMilestones;
    
    /// @dev Mapping: Address => Authorized Rewarder Status
    mapping(address => bool) public isRewarder;
    
    /// @dev Total rewards distributed
    uint256 public totalRewardsDistributed;
    
    /// @dev Cooldown period for claims (8 hours)
    uint256 public constant CLAIM_COOLDOWN = 8 hours;
    
    // ============ EVENTS ============
    
    event RewardClaimed(address indexed user, uint256 amount, string practiceType);
    event HeartMeditationCompleted(address indexed user, uint256 count, uint256 reward);
    event CompassionActionRecorded(address indexed user, uint256 count, uint256 reward);
    event UnityPracticeCompleted(address indexed user, uint256 count, uint256 reward);
    event ForgivenessAchieved(address indexed user, uint256 level, uint256 reward);
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
    ) ERC20("Love Coin", "LOVE") Ownable(msg.sender) {
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
     * @dev Reward user for heart-centered meditation
     * @param user Address to reward
     * @param sessions Number of meditation sessions completed
     */
    function rewardHeartMeditation(address user, uint256 sessions) external nonReentrant {
        if (!isRewarder[msg.sender]) revert UnauthorizedRewarder();
        if (user == address(0)) revert InvalidAddress();
        
        uint256 reward = HEART_MEDITATION_REWARD * sessions;
        if (balanceOf(address(this)) < reward) revert InsufficientRewardPool();
        
        heartMeditationCount[user] += sessions;
        _distributeReward(user, reward, "HEART_MEDITATION");
        
        emit HeartMeditationCompleted(user, heartMeditationCount[user], reward);
    }
    
    /**
     * @dev Reward user for compassion action
     * @param user Address to reward
     * @param actions Number of compassion actions performed
     */
    function rewardCompassion(address user, uint256 actions) external nonReentrant {
        if (!isRewarder[msg.sender]) revert UnauthorizedRewarder();
        if (user == address(0)) revert InvalidAddress();
        
        uint256 reward = COMPASSION_REWARD * actions;
        if (balanceOf(address(this)) < reward) revert InsufficientRewardPool();
        
        compassionActions[user] += actions;
        _distributeReward(user, reward, "COMPASSION");
        
        emit CompassionActionRecorded(user, compassionActions[user], reward);
    }
    
    /**
     * @dev Reward user for unity practice
     * @param user Address to reward
     * @param practices Number of unity practices completed
     */
    function rewardUnity(address user, uint256 practices) external nonReentrant {
        if (!isRewarder[msg.sender]) revert UnauthorizedRewarder();
        if (user == address(0)) revert InvalidAddress();
        
        uint256 reward = UNITY_REWARD * practices;
        if (balanceOf(address(this)) < reward) revert InsufficientRewardPool();
        
        unityPractices[user] += practices;
        _distributeReward(user, reward, "UNITY");
        
        emit UnityPracticeCompleted(user, unityPractices[user], reward);
    }
    
    /**
     * @dev Reward user for forgiveness milestone
     * @param user Address to reward
     * @param level Forgiveness milestone level
     */
    function rewardForgiveness(address user, uint256 level) external nonReentrant {
        if (!isRewarder[msg.sender]) revert UnauthorizedRewarder();
        if (user == address(0)) revert InvalidAddress();
        
        uint256 reward = FORGIVENESS_REWARD * level;
        if (balanceOf(address(this)) < reward) revert InsufficientRewardPool();
        
        forgivenessMilestones[user] = level;
        _distributeReward(user, reward, "FORGIVENESS");
        
        emit ForgivenessAchieved(user, level, reward);
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
        uint256 heartMeditations,
        uint256 compassion,
        uint256 unity,
        uint256 forgiveness
    ) {
        return (
            totalRewardsEarned[user],
            lastClaimTime[user],
            heartMeditationCount[user],
            compassionActions[user],
            unityPractices[user],
            forgivenessMilestones[user]
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
        return LOVE_FREQUENCY_528HZ;
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
