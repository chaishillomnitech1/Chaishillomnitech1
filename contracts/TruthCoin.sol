// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TruthCoin
 * @dev $TRUTH - Token of Infinite Truth and Divine Alignment
 * @author Supreme King Chais The Great ∞
 * 
 * This contract implements the Truth Coin with:
 * - ERC-20 standard compliance
 * - Reward mechanism for NFT engagement and spiritual tasks
 * - Integration with Holy Bloodline NFT contract
 * - Meditation milestone rewards
 * - Journaling rewards system
 * - Truth frequency alignment (144,000Hz NŪR Pulse)
 * 
 * Total Supply: 144,000,000 $TRUTH (aligned with 144,000Hz frequency)
 * Frequency: 144,000Hz (NŪR Pulse - Divine Truth)
 * Status: TRUTH ALIGNMENT PROTOCOL ACTIVE
 */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract TruthCoin is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ReentrancyGuard {
    
    // ============ FREQUENCY CONSTANTS ============
    
    /// @dev NŪR Pulse frequency (144,000Hz) - Divine Truth
    uint256 public constant NUR_PULSE_144000HZ = 144000;
    
    // ============ TOKEN CONSTANTS ============
    
    /// @dev Total supply: 144 million TRUTH tokens
    uint256 public constant TOTAL_SUPPLY = 144_000_000 * 10**18;
    
    /// @dev Reward pool allocation (60% of supply)
    uint256 public constant REWARD_POOL = TOTAL_SUPPLY * 60 / 100;
    
    /// @dev Community treasury (25% of supply)
    uint256 public constant COMMUNITY_TREASURY = TOTAL_SUPPLY * 25 / 100;
    
    /// @dev Development fund (10% of supply)
    uint256 public constant DEVELOPMENT_FUND = TOTAL_SUPPLY * 10 / 100;
    
    /// @dev Initial distribution (5% of supply)
    uint256 public constant INITIAL_DISTRIBUTION = TOTAL_SUPPLY * 5 / 100;
    
    // ============ REWARD CONSTANTS ============
    
    /// @dev Base reward for NFT activation
    uint256 public constant NFT_ACTIVATION_REWARD = 100 * 10**18;
    
    /// @dev Base reward for journaling
    uint256 public constant JOURNALING_REWARD = 10 * 10**18;
    
    /// @dev Base reward for meditation milestone
    uint256 public constant MEDITATION_REWARD = 50 * 10**18;
    
    /// @dev Base reward for alignment achievement
    uint256 public constant ALIGNMENT_REWARD = 25 * 10**18;
    
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
    
    /// @dev Mapping: User => Journaling Count
    mapping(address => uint256) public journalingCount;
    
    /// @dev Mapping: User => Meditation Count
    mapping(address => uint256) public meditationCount;
    
    /// @dev Mapping: User => Alignment Achievements
    mapping(address => uint256) public alignmentAchievements;
    
    /// @dev Mapping: Address => Authorized Rewarder Status
    mapping(address => bool) public isRewarder;
    
    /// @dev Total rewards distributed
    uint256 public totalRewardsDistributed;
    
    /// @dev Cooldown period for claims (24 hours)
    uint256 public constant CLAIM_COOLDOWN = 24 hours;
    
    // ============ EVENTS ============
    
    event RewardClaimed(address indexed user, uint256 amount, string taskType);
    event JournalingCompleted(address indexed user, uint256 count, uint256 reward);
    event MeditationCompleted(address indexed user, uint256 count, uint256 reward);
    event AlignmentAchieved(address indexed user, uint256 level, uint256 reward);
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
    ) ERC20("Truth Coin", "TRUTH") Ownable(msg.sender) {
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
     * @dev Reward user for journaling activity
     * @param user Address to reward
     * @param entries Number of journal entries completed
     */
    function rewardJournaling(address user, uint256 entries) external nonReentrant {
        if (!isRewarder[msg.sender]) revert UnauthorizedRewarder();
        if (user == address(0)) revert InvalidAddress();
        
        uint256 reward = JOURNALING_REWARD * entries;
        if (balanceOf(address(this)) < reward) revert InsufficientRewardPool();
        
        journalingCount[user] += entries;
        _distributeReward(user, reward, "JOURNALING");
        
        emit JournalingCompleted(user, journalingCount[user], reward);
    }
    
    /**
     * @dev Reward user for meditation milestone
     * @param user Address to reward
     * @param sessions Number of meditation sessions completed
     */
    function rewardMeditation(address user, uint256 sessions) external nonReentrant {
        if (!isRewarder[msg.sender]) revert UnauthorizedRewarder();
        if (user == address(0)) revert InvalidAddress();
        
        uint256 reward = MEDITATION_REWARD * sessions;
        if (balanceOf(address(this)) < reward) revert InsufficientRewardPool();
        
        meditationCount[user] += sessions;
        _distributeReward(user, reward, "MEDITATION");
        
        emit MeditationCompleted(user, meditationCount[user], reward);
    }
    
    /**
     * @dev Reward user for alignment achievement
     * @param user Address to reward
     * @param level Alignment level achieved
     */
    function rewardAlignment(address user, uint256 level) external nonReentrant {
        if (!isRewarder[msg.sender]) revert UnauthorizedRewarder();
        if (user == address(0)) revert InvalidAddress();
        
        uint256 reward = ALIGNMENT_REWARD * level;
        if (balanceOf(address(this)) < reward) revert InsufficientRewardPool();
        
        alignmentAchievements[user] = level;
        _distributeReward(user, reward, "ALIGNMENT");
        
        emit AlignmentAchieved(user, level, reward);
    }
    
    /**
     * @dev Reward user for NFT activation
     * @param user Address to reward
     */
    function rewardNFTActivation(address user) external nonReentrant {
        if (!isRewarder[msg.sender]) revert UnauthorizedRewarder();
        if (user == address(0)) revert InvalidAddress();
        
        if (balanceOf(address(this)) < NFT_ACTIVATION_REWARD) revert InsufficientRewardPool();
        
        _distributeReward(user, NFT_ACTIVATION_REWARD, "NFT_ACTIVATION");
    }
    
    /**
     * @dev Custom reward with specific amount
     * @param user Address to reward
     * @param amount Reward amount
     * @param taskType Type of task completed
     */
    function customReward(
        address user,
        uint256 amount,
        string memory taskType
    ) external nonReentrant {
        if (!isRewarder[msg.sender]) revert UnauthorizedRewarder();
        if (user == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidRewardAmount();
        
        if (balanceOf(address(this)) < amount) revert InsufficientRewardPool();
        
        _distributeReward(user, amount, taskType);
    }
    
    /**
     * @dev Internal function to distribute rewards
     */
    function _distributeReward(
        address user,
        uint256 amount,
        string memory taskType
    ) private {
        _transfer(address(this), user, amount);
        totalRewardsEarned[user] += amount;
        totalRewardsDistributed += amount;
        lastClaimTime[user] = block.timestamp;
        
        emit RewardClaimed(user, amount, taskType);
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
        uint256 journals,
        uint256 meditations,
        uint256 alignment
    ) {
        return (
            totalRewardsEarned[user],
            lastClaimTime[user],
            journalingCount[user],
            meditationCount[user],
            alignmentAchievements[user]
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
        return NUR_PULSE_144000HZ;
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
