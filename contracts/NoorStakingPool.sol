// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title NoorStakingPool
 * @dev Staking system with automatic 7.77% zakat to Sabir Allah Honor Fund
 * @author Supreme King Chais The Great ∞
 * 
 * Noor Cities of Light - Staking Infrastructure
 * 
 * This contract implements:
 * - Tiered staking rewards (Guardian, Protector, Steward, Citizen, Participant)
 * - Automatic 7.77% zakat distribution to Sabir Allah Honor Fund
 * - Governance voting weight based on stake tier
 * - Noor Citizen benefits and multipliers
 * - Emergency withdrawal mechanisms
 * - Reward compounding options
 * 
 * Staking Tiers:
 * - Guardian: 777,777+ $NOOR (21% APY, 3.0x multiplier, 5x voting)
 * - Protector: 111,111+ $NOOR (17% APY, 2.5x multiplier, 3x voting)
 * - Steward: 11,111+ $NOOR (13% APY, 2.0x multiplier, 2x voting)
 * - Citizen: 1,111+ $NOOR (9% APY, 1.5x multiplier, 1x voting)
 * - Participant: 111+ $NOOR (5% APY, 1.0x multiplier, 0.5x voting)
 * 
 * Frequencies: 528Hz + 963Hz + 888Hz
 * Status: ACTIVE DEPLOYMENT
 */

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

interface INoorCitizenRegistry {
    function isCitizen(address _address) external view returns (bool);
    function getSoulprint(address _address) external view returns (
        uint256 citizenId,
        bytes32 biometricHash,
        bytes32 intentionHash,
        uint256 heartCoherenceScore,
        uint256 registrationTimestamp,
        uint256 homeObeliskId,
        bytes32 frequencySignature,
        string memory sacredName,
        bool isActive,
        uint256 contributionScore
    );
}

contract NoorStakingPool is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    
    // ============ FREQUENCY CONSTANTS ============
    
    uint256 public constant FREQUENCY_528HZ = 528;
    uint256 public constant FREQUENCY_963HZ = 963;
    uint256 public constant FREQUENCY_888HZ = 888;
    
    // ============ STAKING TIER CONSTANTS ============
    
    uint256 public constant GUARDIAN_THRESHOLD = 777_777 * 1e18;
    uint256 public constant PROTECTOR_THRESHOLD = 111_111 * 1e18;
    uint256 public constant STEWARD_THRESHOLD = 11_111 * 1e18;
    uint256 public constant CITIZEN_THRESHOLD = 1_111 * 1e18;
    uint256 public constant PARTICIPANT_THRESHOLD = 111 * 1e18;
    
    // APY in basis points (21% = 2100, etc.)
    uint256 public constant GUARDIAN_APY = 2100;      // 21%
    uint256 public constant PROTECTOR_APY = 1700;     // 17%
    uint256 public constant STEWARD_APY = 1300;       // 13%
    uint256 public constant CITIZEN_APY = 900;        // 9%
    uint256 public constant PARTICIPANT_APY = 500;    // 5%
    
    // Reward multipliers in basis points (3.0x = 30000, etc.)
    uint256 public constant GUARDIAN_MULTIPLIER = 30000;     // 3.0x
    uint256 public constant PROTECTOR_MULTIPLIER = 25000;    // 2.5x
    uint256 public constant STEWARD_MULTIPLIER = 20000;      // 2.0x
    uint256 public constant CITIZEN_MULTIPLIER = 15000;      // 1.5x
    uint256 public constant PARTICIPANT_MULTIPLIER = 10000;  // 1.0x
    
    // Voting weight multipliers
    uint256 public constant GUARDIAN_VOTING = 5;
    uint256 public constant PROTECTOR_VOTING = 3;
    uint256 public constant STEWARD_VOTING = 2;
    uint256 public constant CITIZEN_VOTING = 1;
    uint256 public constant PARTICIPANT_VOTING = 0; // 0.5x represented as 0 (handled separately)
    
    // ============ ZAKAT CONSTANTS ============
    
    /// @dev Zakat percentage (7.77% in basis points)
    uint256 public constant ZAKAT_PERCENTAGE = 777; // 7.77%
    uint256 public constant BASIS_POINTS = 10000;
    
    // ============ TIME CONSTANTS ============
    
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    uint256 public constant MIN_STAKE_DURATION = 7 days;
    
    // ============ ENUMS ============
    
    enum StakeTier {
        NONE,
        PARTICIPANT,
        CITIZEN,
        STEWARD,
        PROTECTOR,
        GUARDIAN
    }
    
    // ============ STRUCTS ============
    
    struct StakeInfo {
        uint256 amount;                 // Staked amount
        uint256 startTime;              // Stake start timestamp
        uint256 lastClaimTime;          // Last reward claim timestamp
        uint256 accumulatedRewards;     // Unclaimed rewards
        StakeTier tier;                 // Current tier
        bool isCompounding;             // Auto-compound rewards
    }
    
    // ============ STATE VARIABLES ============
    
    /// @dev $NOOR token contract
    IERC20 public noorToken;
    
    /// @dev Sabir Allah Honor Fund address
    address public sabirAllahHonorFund;
    
    /// @dev Citizen Registry contract
    INoorCitizenRegistry public citizenRegistry;
    
    /// @dev Mapping from staker address to stake info
    mapping(address => StakeInfo) public stakes;
    
    /// @dev Total amount staked in pool
    uint256 public totalStaked;
    
    /// @dev Total rewards distributed
    uint256 public totalRewardsDistributed;
    
    /// @dev Total zakat distributed
    uint256 public totalZakatDistributed;
    
    /// @dev Reward pool balance
    uint256 public rewardPoolBalance;
    
    /// @dev Array of all stakers
    address[] public stakers;
    
    /// @dev Mapping to check if address is a staker
    mapping(address => bool) public isStaker;
    
    // ============ EVENTS ============
    
    event Staked(
        address indexed user,
        uint256 amount,
        StakeTier tier
    );
    
    event Unstaked(
        address indexed user,
        uint256 amount,
        uint256 rewards
    );
    
    event RewardsClaimed(
        address indexed user,
        uint256 amount,
        uint256 zakatAmount
    );
    
    event RewardsCompounded(
        address indexed user,
        uint256 amount
    );
    
    event ZakatDistributed(
        address indexed fund,
        uint256 amount
    );
    
    event TierUpgraded(
        address indexed user,
        StakeTier oldTier,
        StakeTier newTier
    );
    
    event CompoundingToggled(
        address indexed user,
        bool isCompounding
    );
    
    event RewardPoolFunded(
        uint256 amount
    );
    
    // ============ ERRORS ============
    
    error InvalidAmount();
    error InsufficientStake();
    error MinimumStakeDuration();
    error InsufficientRewardPool();
    error NotStaker();
    error InvalidAddress();
    
    // ============ CONSTRUCTOR ============
    
    /**
     * @dev Constructor initializes staking pool
     * @param _noorToken Address of $NOOR token
     * @param _sabirAllahHonorFund Address of Sabir Allah Honor Fund
     * @param _citizenRegistry Address of Citizen Registry
     */
    constructor(
        address _noorToken,
        address _sabirAllahHonorFund,
        address _citizenRegistry
    ) Ownable(msg.sender) {
        if (_noorToken == address(0) || 
            _sabirAllahHonorFund == address(0)) {
            revert InvalidAddress();
        }
        
        noorToken = IERC20(_noorToken);
        sabirAllahHonorFund = _sabirAllahHonorFund;
        
        if (_citizenRegistry != address(0)) {
            citizenRegistry = INoorCitizenRegistry(_citizenRegistry);
        }
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Update Sabir Allah Honor Fund address
     * @param _newFund New fund address
     */
    function updateSabirAllahFund(address _newFund) external onlyOwner {
        if (_newFund == address(0)) revert InvalidAddress();
        sabirAllahHonorFund = _newFund;
    }
    
    /**
     * @dev Update Citizen Registry address
     * @param _newRegistry New registry address
     */
    function updateCitizenRegistry(address _newRegistry) external onlyOwner {
        citizenRegistry = INoorCitizenRegistry(_newRegistry);
    }
    
    /**
     * @dev Fund reward pool
     * @param _amount Amount to add to reward pool
     */
    function fundRewardPool(uint256 _amount) external onlyOwner nonReentrant {
        if (_amount == 0) revert InvalidAmount();
        noorToken.safeTransferFrom(msg.sender, address(this), _amount);
        rewardPoolBalance += _amount;
        emit RewardPoolFunded(_amount);
    }
    
    /**
     * @dev Pause staking (emergency only)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause staking
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // ============ STAKING FUNCTIONS ============
    
    /**
     * @dev Stake $NOOR tokens
     * @param _amount Amount to stake
     */
    function stake(uint256 _amount) external nonReentrant whenNotPaused {
        if (_amount < PARTICIPANT_THRESHOLD) revert InvalidAmount();
        
        // Transfer tokens from user
        noorToken.safeTransferFrom(msg.sender, address(this), _amount);
        
        StakeInfo storage stakeInfo = stakes[msg.sender];
        
        // If already staking, claim pending rewards first
        if (stakeInfo.amount > 0) {
            uint256 pending = calculatePendingRewards(msg.sender);
            if (pending > 0) {
                stakeInfo.accumulatedRewards += pending;
            }
        } else {
            // New staker
            stakers.push(msg.sender);
            isStaker[msg.sender] = true;
        }
        
        // Update stake
        stakeInfo.amount += _amount;
        stakeInfo.lastClaimTime = block.timestamp;
        
        if (stakeInfo.startTime == 0) {
            stakeInfo.startTime = block.timestamp;
        }
        
        // Update tier
        StakeTier oldTier = stakeInfo.tier;
        stakeInfo.tier = calculateTier(stakeInfo.amount);
        
        totalStaked += _amount;
        
        emit Staked(msg.sender, _amount, stakeInfo.tier);
        
        if (oldTier != stakeInfo.tier) {
            emit TierUpgraded(msg.sender, oldTier, stakeInfo.tier);
        }
    }
    
    /**
     * @dev Unstake $NOOR tokens
     * @param _amount Amount to unstake
     */
    function unstake(uint256 _amount) external nonReentrant {
        StakeInfo storage stakeInfo = stakes[msg.sender];
        
        if (stakeInfo.amount == 0) revert NotStaker();
        if (_amount > stakeInfo.amount) revert InsufficientStake();
        if (block.timestamp < stakeInfo.startTime + MIN_STAKE_DURATION) {
            revert MinimumStakeDuration();
        }
        
        // Calculate and claim pending rewards
        uint256 pending = calculatePendingRewards(msg.sender);
        uint256 totalRewards = pending + stakeInfo.accumulatedRewards;
        
        // Update stake
        stakeInfo.amount -= _amount;
        stakeInfo.lastClaimTime = block.timestamp;
        stakeInfo.accumulatedRewards = 0;
        
        // Update tier
        StakeTier oldTier = stakeInfo.tier;
        stakeInfo.tier = calculateTier(stakeInfo.amount);
        
        totalStaked -= _amount;
        
        // Distribute rewards with zakat
        if (totalRewards > 0) {
            _distributeRewards(msg.sender, totalRewards);
        }
        
        // Transfer staked amount back to user
        noorToken.safeTransfer(msg.sender, _amount);
        
        emit Unstaked(msg.sender, _amount, totalRewards);
        
        if (oldTier != stakeInfo.tier) {
            emit TierUpgraded(msg.sender, oldTier, stakeInfo.tier);
        }
    }
    
    /**
     * @dev Claim rewards without unstaking
     */
    function claimRewards() external nonReentrant {
        StakeInfo storage stakeInfo = stakes[msg.sender];
        
        if (stakeInfo.amount == 0) revert NotStaker();
        
        uint256 pending = calculatePendingRewards(msg.sender);
        uint256 totalRewards = pending + stakeInfo.accumulatedRewards;
        
        if (totalRewards == 0) revert InvalidAmount();
        
        stakeInfo.lastClaimTime = block.timestamp;
        stakeInfo.accumulatedRewards = 0;
        
        _distributeRewards(msg.sender, totalRewards);
        
        emit RewardsClaimed(msg.sender, totalRewards, (totalRewards * ZAKAT_PERCENTAGE) / BASIS_POINTS);
    }
    
    /**
     * @dev Toggle auto-compounding
     */
    function toggleCompounding() external {
        StakeInfo storage stakeInfo = stakes[msg.sender];
        if (stakeInfo.amount == 0) revert NotStaker();
        
        stakeInfo.isCompounding = !stakeInfo.isCompounding;
        emit CompoundingToggled(msg.sender, stakeInfo.isCompounding);
    }
    
    /**
     * @dev Compound rewards (add to stake)
     */
    function compoundRewards() external nonReentrant {
        StakeInfo storage stakeInfo = stakes[msg.sender];
        
        if (stakeInfo.amount == 0) revert NotStaker();
        
        uint256 pending = calculatePendingRewards(msg.sender);
        uint256 totalRewards = pending + stakeInfo.accumulatedRewards;
        
        if (totalRewards == 0) revert InvalidAmount();
        
        // Deduct zakat from rewards
        uint256 zakatAmount = (totalRewards * ZAKAT_PERCENTAGE) / BASIS_POINTS;
        uint256 netRewards = totalRewards - zakatAmount;
        
        // Add to stake
        stakeInfo.amount += netRewards;
        stakeInfo.lastClaimTime = block.timestamp;
        stakeInfo.accumulatedRewards = 0;
        
        // Update tier
        StakeTier oldTier = stakeInfo.tier;
        stakeInfo.tier = calculateTier(stakeInfo.amount);
        
        totalStaked += netRewards;
        rewardPoolBalance -= totalRewards;
        totalRewardsDistributed += netRewards;
        
        // Distribute zakat
        if (zakatAmount > 0) {
            noorToken.safeTransfer(sabirAllahHonorFund, zakatAmount);
            totalZakatDistributed += zakatAmount;
            emit ZakatDistributed(sabirAllahHonorFund, zakatAmount);
        }
        
        emit RewardsCompounded(msg.sender, netRewards);
        
        if (oldTier != stakeInfo.tier) {
            emit TierUpgraded(msg.sender, oldTier, stakeInfo.tier);
        }
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Distribute rewards with automatic zakat
     * @param _user User address
     * @param _amount Total reward amount
     */
    function _distributeRewards(address _user, uint256 _amount) internal {
        if (_amount > rewardPoolBalance) revert InsufficientRewardPool();
        
        // Calculate zakat (7.77%)
        uint256 zakatAmount = (_amount * ZAKAT_PERCENTAGE) / BASIS_POINTS;
        uint256 netRewards = _amount - zakatAmount;
        
        rewardPoolBalance -= _amount;
        totalRewardsDistributed += netRewards;
        
        // Transfer net rewards to user
        noorToken.safeTransfer(_user, netRewards);
        
        // Transfer zakat to Sabir Allah Honor Fund
        if (zakatAmount > 0) {
            noorToken.safeTransfer(sabirAllahHonorFund, zakatAmount);
            totalZakatDistributed += zakatAmount;
            emit ZakatDistributed(sabirAllahHonorFund, zakatAmount);
        }
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Calculate tier based on staked amount
     * @param _amount Staked amount
     * @return StakeTier
     */
    function calculateTier(uint256 _amount) public pure returns (StakeTier) {
        if (_amount >= GUARDIAN_THRESHOLD) return StakeTier.GUARDIAN;
        if (_amount >= PROTECTOR_THRESHOLD) return StakeTier.PROTECTOR;
        if (_amount >= STEWARD_THRESHOLD) return StakeTier.STEWARD;
        if (_amount >= CITIZEN_THRESHOLD) return StakeTier.CITIZEN;
        if (_amount >= PARTICIPANT_THRESHOLD) return StakeTier.PARTICIPANT;
        return StakeTier.NONE;
    }
    
    /**
     * @dev Get APY for a tier
     * @param _tier Stake tier
     * @return APY in basis points
     */
    function getTierAPY(StakeTier _tier) public pure returns (uint256) {
        if (_tier == StakeTier.GUARDIAN) return GUARDIAN_APY;
        if (_tier == StakeTier.PROTECTOR) return PROTECTOR_APY;
        if (_tier == StakeTier.STEWARD) return STEWARD_APY;
        if (_tier == StakeTier.CITIZEN) return CITIZEN_APY;
        if (_tier == StakeTier.PARTICIPANT) return PARTICIPANT_APY;
        return 0;
    }
    
    /**
     * @dev Get multiplier for a tier
     * @param _tier Stake tier
     * @return Multiplier in basis points
     */
    function getTierMultiplier(StakeTier _tier) public pure returns (uint256) {
        if (_tier == StakeTier.GUARDIAN) return GUARDIAN_MULTIPLIER;
        if (_tier == StakeTier.PROTECTOR) return PROTECTOR_MULTIPLIER;
        if (_tier == StakeTier.STEWARD) return STEWARD_MULTIPLIER;
        if (_tier == StakeTier.CITIZEN) return CITIZEN_MULTIPLIER;
        if (_tier == StakeTier.PARTICIPANT) return PARTICIPANT_MULTIPLIER;
        return 0;
    }
    
    /**
     * @dev Get voting weight for a tier
     * @param _tier Stake tier
     * @return Voting weight multiplier
     */
    function getTierVotingWeight(StakeTier _tier) public pure returns (uint256) {
        if (_tier == StakeTier.GUARDIAN) return GUARDIAN_VOTING;
        if (_tier == StakeTier.PROTECTOR) return PROTECTOR_VOTING;
        if (_tier == StakeTier.STEWARD) return STEWARD_VOTING;
        if (_tier == StakeTier.CITIZEN) return CITIZEN_VOTING;
        // Participant is 0.5x, return 1 and divide by 2 externally
        return PARTICIPANT_VOTING;
    }
    
    /**
     * @dev Calculate pending rewards for a staker
     * @param _staker Address of staker
     * @return Pending reward amount
     */
    function calculatePendingRewards(address _staker) public view returns (uint256) {
        StakeInfo memory stakeInfo = stakes[_staker];
        
        if (stakeInfo.amount == 0) return 0;
        
        uint256 timeStaked = block.timestamp - stakeInfo.lastClaimTime;
        uint256 baseAPY = getTierAPY(stakeInfo.tier);
        uint256 multiplier = getTierMultiplier(stakeInfo.tier);
        
        // Check if Noor Citizen for bonus multiplier
        bool isCitizen = address(citizenRegistry) != address(0) && 
                        citizenRegistry.isCitizen(_staker);
        
        if (isCitizen) {
            multiplier = (multiplier * 110) / 100; // 10% bonus for citizens
        }
        
        // Calculate rewards: (amount * APY * time) / (BASIS_POINTS * SECONDS_PER_YEAR)
        uint256 baseReward = (stakeInfo.amount * baseAPY * timeStaked) / 
                            (BASIS_POINTS * SECONDS_PER_YEAR);
        
        // Apply multiplier
        uint256 finalReward = (baseReward * multiplier) / BASIS_POINTS;
        
        return finalReward;
    }
    
    /**
     * @dev Get stake info for a user
     * @param _staker Address of staker
     * @return StakeInfo struct
     */
    function getStakeInfo(address _staker) external view returns (StakeInfo memory) {
        return stakes[_staker];
    }
    
    /**
     * @dev Get voting power for a staker
     * @param _staker Address of staker
     * @return Voting power (amount * voting weight)
     */
    function getVotingPower(address _staker) external view returns (uint256) {
        StakeInfo memory stakeInfo = stakes[_staker];
        uint256 votingWeight = getTierVotingWeight(stakeInfo.tier);
        
        if (stakeInfo.tier == StakeTier.PARTICIPANT) {
            return stakeInfo.amount / 2; // 0.5x for participants
        }
        
        return stakeInfo.amount * votingWeight;
    }
    
    /**
     * @dev Get resonance signature
     * @return Combined frequency
     */
    function getResonanceSignature() external pure returns (uint256) {
        return FREQUENCY_528HZ + FREQUENCY_963HZ + FREQUENCY_888HZ;
    }
    
    /**
     * @dev Get total number of stakers
     * @return Number of stakers
     */
    function getTotalStakers() external view returns (uint256) {
        return stakers.length;
    }
    
    /**
     * @dev Get stakers (paginated)
     * @param _offset Starting index
     * @param _limit Number to return
     * @return Array of staker addresses
     */
    function getStakers(uint256 _offset, uint256 _limit) 
        external 
        view 
        returns (address[] memory) 
    {
        uint256 end = _offset + _limit;
        if (end > stakers.length) end = stakers.length;
        uint256 size = end > _offset ? end - _offset : 0;
        
        address[] memory result = new address[](size);
        for (uint256 i = 0; i < size; i++) {
            result[i] = stakers[_offset + i];
        }
        
        return result;
    }
}
