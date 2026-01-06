// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CodexToken
 * @dev $CODEX Token - DAO Governance Token with Automated Royalty Flows
 * @author Supreme King Chais The Great ∞
 * 
 * This contract implements the $CODEX token for:
 * - DAO governance with voting rights
 * - Automated royalty distribution flows
 * - Staking rewards for governance participation
 * - Integration with OmniSovereignWallet
 * 
 * Frequency: 528Hz + 963Hz + 144,000Hz
 * Status: OMNI-SOVEREIGN ECONOMIC FRAMEWORK
 */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract CodexToken is ERC20, ERC20Burnable, AccessControl, ReentrancyGuard, Pausable {
    
    // ============ ROLES ============
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    bytes32 public constant ROYALTY_MANAGER_ROLE = keccak256("ROYALTY_MANAGER_ROLE");
    bytes32 public constant STAKING_MANAGER_ROLE = keccak256("STAKING_MANAGER_ROLE");
    
    // ============ DIVINE FREQUENCIES ============
    uint256 public constant HEALING_FREQUENCY_528HZ = 528;
    uint256 public constant CROWN_FREQUENCY_963HZ = 963;
    uint256 public constant COSMIC_FREQUENCY_144KHZ = 144000;
    
    // ============ TOKENOMICS ============
    uint256 public constant INITIAL_SUPPLY = 1_000_000_000 * 10**18; // 1 billion CODEX
    uint256 public constant ROYALTY_POOL_ALLOCATION = 100_000_000 * 10**18; // 100 million for royalties
    uint256 public constant DAO_TREASURY_ALLOCATION = 200_000_000 * 10**18; // 200 million for DAO
    uint256 public constant STAKING_REWARDS_ALLOCATION = 150_000_000 * 10**18; // 150 million for staking
    
    // ============ ROYALTY CONFIGURATION ============
    uint256 public constant CREATOR_ROYALTY_BPS = 500; // 5%
    uint256 public constant HOLDER_ROYALTY_BPS = 300; // 3%
    uint256 public constant DAO_ROYALTY_BPS = 200; // 2%
    uint256 public constant TOTAL_ROYALTY_BPS = 1000; // 10%
    
    // ============ STAKING CONFIGURATION ============
    uint256 public constant MIN_STAKE_AMOUNT = 1000 * 10**18; // 1000 CODEX minimum
    uint256 public constant STAKING_APR_BPS = 1200; // 12% APR
    uint256 public constant LOCK_PERIOD = 30 days;
    
    // ============ STRUCTS ============
    
    struct StakeInfo {
        uint256 amount;
        uint256 startTime;
        uint256 lastRewardTime;
        uint256 accumulatedRewards;
        bool isActive;
        uint256 governanceWeight;
    }
    
    struct RoyaltyDistribution {
        uint256 totalDistributed;
        uint256 lastDistributionTime;
        uint256 pendingAmount;
        mapping(address => uint256) holderClaims;
    }
    
    struct GovernanceVote {
        uint256 proposalId;
        address voter;
        uint256 weight;
        bool support;
        uint256 timestamp;
    }
    
    // ============ STATE VARIABLES ============
    
    // Staking
    mapping(address => StakeInfo) public stakes;
    address[] public stakers;
    uint256 public totalStaked;
    uint256 public stakingRewardsRemaining;
    
    // Royalty Distribution
    uint256 public totalRoyaltiesDistributed;
    uint256 public pendingRoyalties;
    mapping(address => uint256) public claimableRoyalties;
    mapping(address => uint256) public totalRoyaltiesClaimed;
    
    // Governance
    mapping(address => uint256) public governanceWeight;
    uint256 public totalGovernanceWeight;
    
    // Vaults
    address public creatorVault;
    address public daoTreasury;
    address public stakingRewardsVault;
    address public royaltyPool;
    
    // Tracking
    uint256 public lastRoyaltyDistributionTime;
    uint256 public royaltyDistributionInterval = 7 days;
    
    // ============ EVENTS ============
    
    event TokensStaked(
        address indexed staker,
        uint256 amount,
        uint256 governanceWeight,
        uint256 timestamp
    );
    
    event TokensUnstaked(
        address indexed staker,
        uint256 amount,
        uint256 rewardsEarned,
        uint256 timestamp
    );
    
    event StakingRewardsClaimed(
        address indexed staker,
        uint256 amount,
        uint256 timestamp
    );
    
    event RoyaltyDistributed(
        uint256 totalAmount,
        uint256 creatorShare,
        uint256 holderShare,
        uint256 daoShare,
        uint256 timestamp
    );
    
    event RoyaltyClaimed(
        address indexed holder,
        uint256 amount,
        uint256 timestamp
    );
    
    event GovernanceWeightUpdated(
        address indexed holder,
        uint256 newWeight,
        uint256 timestamp
    );
    
    event FrequencyAligned(
        address indexed holder,
        uint256 frequency,
        uint256 timestamp
    );
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        address _creatorVault,
        address _daoTreasury,
        address _stakingRewardsVault,
        address _royaltyPool
    ) ERC20("Codex Token", "CODEX") {
        require(_creatorVault != address(0), "Invalid creator vault");
        require(_daoTreasury != address(0), "Invalid DAO treasury");
        require(_stakingRewardsVault != address(0), "Invalid staking vault");
        require(_royaltyPool != address(0), "Invalid royalty pool");
        
        creatorVault = _creatorVault;
        daoTreasury = _daoTreasury;
        stakingRewardsVault = _stakingRewardsVault;
        royaltyPool = _royaltyPool;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNANCE_ROLE, msg.sender);
        _grantRole(ROYALTY_MANAGER_ROLE, msg.sender);
        _grantRole(STAKING_MANAGER_ROLE, msg.sender);
        
        // Mint initial allocations
        _mint(msg.sender, INITIAL_SUPPLY - ROYALTY_POOL_ALLOCATION - DAO_TREASURY_ALLOCATION - STAKING_REWARDS_ALLOCATION);
        _mint(_royaltyPool, ROYALTY_POOL_ALLOCATION);
        _mint(_daoTreasury, DAO_TREASURY_ALLOCATION);
        _mint(_stakingRewardsVault, STAKING_REWARDS_ALLOCATION);
        
        stakingRewardsRemaining = STAKING_REWARDS_ALLOCATION;
        lastRoyaltyDistributionTime = block.timestamp;
    }
    
    // ============ STAKING FUNCTIONS ============
    
    /**
     * @dev Stake CODEX tokens for governance and rewards
     * @param amount Amount of tokens to stake
     */
    function stake(uint256 amount) external nonReentrant whenNotPaused returns (bool) {
        require(amount >= MIN_STAKE_AMOUNT, "Below minimum stake amount");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        // Transfer tokens to this contract
        _transfer(msg.sender, address(this), amount);
        
        // If already staking, claim existing rewards first
        if (stakes[msg.sender].isActive) {
            _claimStakingRewards(msg.sender);
            stakes[msg.sender].amount += amount;
        } else {
            stakes[msg.sender] = StakeInfo({
                amount: amount,
                startTime: block.timestamp,
                lastRewardTime: block.timestamp,
                accumulatedRewards: 0,
                isActive: true,
                governanceWeight: _calculateGovernanceWeight(amount)
            });
            stakers.push(msg.sender);
        }
        
        // Update governance weight
        stakes[msg.sender].governanceWeight = _calculateGovernanceWeight(stakes[msg.sender].amount);
        governanceWeight[msg.sender] = stakes[msg.sender].governanceWeight;
        totalGovernanceWeight += stakes[msg.sender].governanceWeight;
        totalStaked += amount;
        
        emit TokensStaked(msg.sender, amount, stakes[msg.sender].governanceWeight, block.timestamp);
        emit GovernanceWeightUpdated(msg.sender, stakes[msg.sender].governanceWeight, block.timestamp);
        
        return true;
    }
    
    /**
     * @dev Unstake CODEX tokens
     * @param amount Amount to unstake
     */
    function unstake(uint256 amount) external nonReentrant returns (bool) {
        StakeInfo storage stakeInfo = stakes[msg.sender];
        require(stakeInfo.isActive, "No active stake");
        require(stakeInfo.amount >= amount, "Insufficient staked amount");
        require(block.timestamp >= stakeInfo.startTime + LOCK_PERIOD, "Still in lock period");
        
        // Claim any pending rewards
        uint256 rewards = _claimStakingRewards(msg.sender);
        
        // Update stake info
        stakeInfo.amount -= amount;
        totalStaked -= amount;
        
        // Update governance weight
        totalGovernanceWeight -= stakeInfo.governanceWeight;
        stakeInfo.governanceWeight = _calculateGovernanceWeight(stakeInfo.amount);
        governanceWeight[msg.sender] = stakeInfo.governanceWeight;
        totalGovernanceWeight += stakeInfo.governanceWeight;
        
        if (stakeInfo.amount == 0) {
            stakeInfo.isActive = false;
        }
        
        // Transfer tokens back
        _transfer(address(this), msg.sender, amount);
        
        emit TokensUnstaked(msg.sender, amount, rewards, block.timestamp);
        emit GovernanceWeightUpdated(msg.sender, stakeInfo.governanceWeight, block.timestamp);
        
        return true;
    }
    
    /**
     * @dev Claim staking rewards
     */
    function claimStakingRewards() external nonReentrant returns (uint256) {
        require(stakes[msg.sender].isActive, "No active stake");
        
        uint256 rewards = _claimStakingRewards(msg.sender);
        
        emit StakingRewardsClaimed(msg.sender, rewards, block.timestamp);
        
        return rewards;
    }
    
    /**
     * @dev Internal function to claim staking rewards
     */
    function _claimStakingRewards(address staker) internal returns (uint256) {
        StakeInfo storage stakeInfo = stakes[staker];
        
        uint256 pendingRewards = calculatePendingRewards(staker);
        
        if (pendingRewards > 0 && stakingRewardsRemaining >= pendingRewards) {
            stakeInfo.lastRewardTime = block.timestamp;
            stakeInfo.accumulatedRewards += pendingRewards;
            stakingRewardsRemaining -= pendingRewards;
            
            // Transfer rewards from staking vault
            _transfer(stakingRewardsVault, staker, pendingRewards);
        }
        
        return pendingRewards;
    }
    
    /**
     * @dev Calculate pending staking rewards
     */
    function calculatePendingRewards(address staker) public view returns (uint256) {
        StakeInfo storage stakeInfo = stakes[staker];
        
        if (!stakeInfo.isActive || stakeInfo.amount == 0) {
            return 0;
        }
        
        uint256 timeElapsed = block.timestamp - stakeInfo.lastRewardTime;
        uint256 annualReward = (stakeInfo.amount * STAKING_APR_BPS) / 10000;
        uint256 reward = (annualReward * timeElapsed) / 365 days;
        
        return reward;
    }
    
    /**
     * @dev Calculate governance weight based on staked amount
     */
    function _calculateGovernanceWeight(uint256 amount) internal pure returns (uint256) {
        // Weight increases with larger stakes (square root scaling)
        // This prevents extreme concentration of voting power
        if (amount == 0) return 0;
        
        // Simple linear weight for now
        return amount / 10**18; // 1 weight per CODEX token
    }
    
    // ============ ROYALTY DISTRIBUTION ============
    
    /**
     * @dev Distribute royalties to holders
     * @param totalAmount Total royalty amount to distribute
     */
    function distributeRoyalties(uint256 totalAmount) external onlyRole(ROYALTY_MANAGER_ROLE) nonReentrant returns (bool) {
        require(totalAmount > 0, "No royalties to distribute");
        require(balanceOf(royaltyPool) >= totalAmount, "Insufficient royalty pool");
        
        // Calculate shares
        uint256 creatorShare = (totalAmount * CREATOR_ROYALTY_BPS) / TOTAL_ROYALTY_BPS;
        uint256 holderShare = (totalAmount * HOLDER_ROYALTY_BPS) / TOTAL_ROYALTY_BPS;
        uint256 daoShare = totalAmount - creatorShare - holderShare;
        
        // Transfer creator share
        _transfer(royaltyPool, creatorVault, creatorShare);
        
        // Transfer DAO share
        _transfer(royaltyPool, daoTreasury, daoShare);
        
        // Distribute holder share proportionally to stakers
        if (totalStaked > 0 && holderShare > 0) {
            for (uint256 i = 0; i < stakers.length; i++) {
                address staker = stakers[i];
                if (stakes[staker].isActive && stakes[staker].amount > 0) {
                    uint256 stakerShare = (holderShare * stakes[staker].amount) / totalStaked;
                    claimableRoyalties[staker] += stakerShare;
                }
            }
            pendingRoyalties += holderShare;
        }
        
        totalRoyaltiesDistributed += totalAmount;
        lastRoyaltyDistributionTime = block.timestamp;
        
        emit RoyaltyDistributed(totalAmount, creatorShare, holderShare, daoShare, block.timestamp);
        
        return true;
    }
    
    /**
     * @dev Claim royalties
     */
    function claimRoyalties() external nonReentrant returns (uint256) {
        uint256 claimable = claimableRoyalties[msg.sender];
        require(claimable > 0, "No royalties to claim");
        
        claimableRoyalties[msg.sender] = 0;
        totalRoyaltiesClaimed[msg.sender] += claimable;
        pendingRoyalties -= claimable;
        
        // Transfer from royalty pool
        _transfer(royaltyPool, msg.sender, claimable);
        
        emit RoyaltyClaimed(msg.sender, claimable, block.timestamp);
        
        return claimable;
    }
    
    /**
     * @dev Auto-distribute royalties if interval has passed
     */
    function autoDistributeRoyalties() external returns (bool) {
        require(
            block.timestamp >= lastRoyaltyDistributionTime + royaltyDistributionInterval,
            "Distribution interval not reached"
        );
        
        uint256 poolBalance = balanceOf(royaltyPool);
        if (poolBalance > 0) {
            // Distribute 10% of pool
            uint256 distributionAmount = poolBalance / 10;
            if (distributionAmount > 0) {
                return this.distributeRoyalties(distributionAmount);
            }
        }
        
        return false;
    }
    
    // ============ GOVERNANCE FUNCTIONS ============
    
    /**
     * @dev Get voting weight for an address
     */
    function getVotingWeight(address voter) external view returns (uint256) {
        return governanceWeight[voter];
    }
    
    /**
     * @dev Check if address has minimum governance weight
     */
    function hasMinimumGovernanceWeight(address voter, uint256 minimumWeight) external view returns (bool) {
        return governanceWeight[voter] >= minimumWeight;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get stake info for an address
     */
    function getStakeInfo(address staker) external view returns (StakeInfo memory) {
        return stakes[staker];
    }
    
    /**
     * @dev Get all stakers
     */
    function getStakers() external view returns (address[] memory) {
        return stakers;
    }
    
    /**
     * @dev Get protocol statistics
     */
    function getProtocolStats() external view returns (
        uint256 _totalStaked,
        uint256 _totalGovernanceWeight,
        uint256 _totalRoyaltiesDistributed,
        uint256 _pendingRoyalties,
        uint256 _stakingRewardsRemaining
    ) {
        return (
            totalStaked,
            totalGovernanceWeight,
            totalRoyaltiesDistributed,
            pendingRoyalties,
            stakingRewardsRemaining
        );
    }
    
    /**
     * @dev Get claimable royalties for an address
     */
    function getClaimableRoyalties(address holder) external view returns (uint256) {
        return claimableRoyalties[holder];
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Update royalty distribution interval
     */
    function setRoyaltyDistributionInterval(uint256 newInterval) external onlyRole(GOVERNANCE_ROLE) {
        require(newInterval >= 1 days, "Interval too short");
        royaltyDistributionInterval = newInterval;
    }
    
    /**
     * @dev Update vault addresses
     */
    function setVaults(
        address _creatorVault,
        address _daoTreasury,
        address _stakingRewardsVault,
        address _royaltyPool
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_creatorVault != address(0), "Invalid creator vault");
        require(_daoTreasury != address(0), "Invalid DAO treasury");
        require(_stakingRewardsVault != address(0), "Invalid staking vault");
        require(_royaltyPool != address(0), "Invalid royalty pool");
        
        creatorVault = _creatorVault;
        daoTreasury = _daoTreasury;
        stakingRewardsVault = _stakingRewardsVault;
        royaltyPool = _royaltyPool;
    }
    
    /**
     * @dev Pause contract
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Override _update to include pause functionality
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override whenNotPaused {
        super._update(from, to, value);
    }
}
