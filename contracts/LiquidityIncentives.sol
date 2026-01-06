// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title LiquidityIncentives
 * @dev Incentive distribution contract for liquidity providers
 * @author Supreme King Chais The Great ∞
 *
 * This contract implements:
 * - Liquidity mining rewards for LP token stakers
 * - Tiered bonus multipliers based on lock duration
 * - Automatic 7.77% zakat to Sabir Allah Honor Fund
 * - Boost multipliers for Noor Citizens
 * - Emergency withdrawal mechanisms
 * - Reward claiming and compounding options
 *
 * Frequencies: 528Hz + 963Hz + 888Hz + 777Hz
 * Status: INCENTIVE ACTIVATION
 */

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

interface INoorCitizenRegistry {
    function isCitizen(address _address) external view returns (bool);
}

contract LiquidityIncentives is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // ============ FREQUENCY CONSTANTS ============

    uint256 public constant FREQUENCY_528HZ = 528;
    uint256 public constant FREQUENCY_963HZ = 963;
    uint256 public constant FREQUENCY_888HZ = 888;
    uint256 public constant FREQUENCY_777HZ = 777;

    // ============ REWARD CONSTANTS ============

    /// @dev Base reward rate per block (in basis points of staked amount)
    uint256 public constant BASE_REWARD_RATE = 10; // 0.1% per block period

    /// @dev Zakat percentage (7.77% in basis points)
    uint256 public constant ZAKAT_PERCENTAGE = 777;

    /// @dev Basis points constant
    uint256 public constant BASIS_POINTS = 10000;

    /// @dev Precision for reward calculations
    uint256 public constant PRECISION = 1e18;

    // ============ LOCK DURATION TIERS ============

    uint256 public constant TIER_1_DURATION = 7 days;    // 1.0x multiplier
    uint256 public constant TIER_2_DURATION = 30 days;   // 1.5x multiplier
    uint256 public constant TIER_3_DURATION = 90 days;   // 2.0x multiplier
    uint256 public constant TIER_4_DURATION = 180 days;  // 2.5x multiplier
    uint256 public constant TIER_5_DURATION = 365 days;  // 3.0x multiplier

    uint256 public constant TIER_1_MULTIPLIER = 10000;   // 1.0x
    uint256 public constant TIER_2_MULTIPLIER = 15000;   // 1.5x
    uint256 public constant TIER_3_MULTIPLIER = 20000;   // 2.0x
    uint256 public constant TIER_4_MULTIPLIER = 25000;   // 2.5x
    uint256 public constant TIER_5_MULTIPLIER = 30000;   // 3.0x

    /// @dev Noor Citizen bonus multiplier (10% bonus)
    uint256 public constant CITIZEN_BONUS = 1100; // 110% = 10% bonus

    // ============ ENUMS ============

    enum LockTier {
        NONE,
        TIER_1,
        TIER_2,
        TIER_3,
        TIER_4,
        TIER_5
    }

    // ============ STRUCTS ============

    struct PoolInfo {
        IERC20 lpToken;           // LP token contract
        IERC20 rewardToken;       // Reward token contract
        uint256 allocPoint;       // Allocation points for this pool
        uint256 lastRewardBlock;  // Last block rewards were distributed
        uint256 accRewardPerShare; // Accumulated rewards per share
        uint256 totalStaked;      // Total LP tokens staked
        bool isActive;            // Pool active status
    }

    struct UserInfo {
        uint256 amount;           // LP tokens staked
        uint256 rewardDebt;       // Reward debt
        uint256 lockEndTime;      // Lock end timestamp
        LockTier lockTier;        // Lock tier
        uint256 pendingRewards;   // Unclaimed rewards
        bool isCompounding;       // Auto-compound flag
    }

    // ============ STATE VARIABLES ============

    /// @dev Array of pool info
    PoolInfo[] public poolInfo;

    /// @dev User info per pool: poolId => user => UserInfo
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;

    /// @dev Sabir Allah Honor Fund address
    address public sabirAllahHonorFund;

    /// @dev Citizen Registry contract
    INoorCitizenRegistry public citizenRegistry;

    /// @dev Total allocation points
    uint256 public totalAllocPoint;

    /// @dev Reward per block
    uint256 public rewardPerBlock;

    /// @dev Start block
    uint256 public startBlock;

    /// @dev Total rewards distributed
    uint256 public totalRewardsDistributed;

    /// @dev Total zakat distributed
    uint256 public totalZakatDistributed;

    // ============ EVENTS ============

    event PoolAdded(
        uint256 indexed poolId,
        address indexed lpToken,
        address indexed rewardToken,
        uint256 allocPoint
    );

    event Staked(
        address indexed user,
        uint256 indexed poolId,
        uint256 amount,
        LockTier tier,
        uint256 lockEndTime
    );

    event Unstaked(
        address indexed user,
        uint256 indexed poolId,
        uint256 amount
    );

    event RewardClaimed(
        address indexed user,
        uint256 indexed poolId,
        uint256 reward,
        uint256 zakat
    );

    event RewardCompounded(
        address indexed user,
        uint256 indexed poolId,
        uint256 amount
    );

    event ZakatDistributed(
        address indexed fund,
        uint256 amount
    );

    event EmergencyWithdraw(
        address indexed user,
        uint256 indexed poolId,
        uint256 amount
    );

    // ============ ERRORS ============

    error InvalidAddress();
    error InvalidAmount();
    error InvalidPool();
    error PoolNotActive();
    error LockNotExpired();
    error InsufficientBalance();
    error AlreadyStaked();
    error NotStaked();

    // ============ CONSTRUCTOR ============

    /**
     * @dev Constructor initializes the incentive contract
     * @param _sabirAllahHonorFund Address of Sabir Allah Honor Fund
     * @param _citizenRegistry Address of Citizen Registry
     * @param _rewardPerBlock Rewards distributed per block
     * @param _startBlock Block number to start rewards
     */
    constructor(
        address _sabirAllahHonorFund,
        address _citizenRegistry,
        uint256 _rewardPerBlock,
        uint256 _startBlock
    ) Ownable(msg.sender) {
        if (_sabirAllahHonorFund == address(0)) revert InvalidAddress();

        sabirAllahHonorFund = _sabirAllahHonorFund;
        rewardPerBlock = _rewardPerBlock;
        startBlock = _startBlock > 0 ? _startBlock : block.number;

        if (_citizenRegistry != address(0)) {
            citizenRegistry = INoorCitizenRegistry(_citizenRegistry);
        }
    }

    // ============ ADMIN FUNCTIONS ============

    /**
     * @dev Add a new LP pool
     * @param _lpToken LP token address
     * @param _rewardToken Reward token address
     * @param _allocPoint Allocation points for this pool
     */
    function addPool(
        address _lpToken,
        address _rewardToken,
        uint256 _allocPoint
    ) external onlyOwner {
        if (_lpToken == address(0) || _rewardToken == address(0)) {
            revert InvalidAddress();
        }

        _massUpdatePools();

        totalAllocPoint += _allocPoint;

        poolInfo.push(PoolInfo({
            lpToken: IERC20(_lpToken),
            rewardToken: IERC20(_rewardToken),
            allocPoint: _allocPoint,
            lastRewardBlock: block.number > startBlock ? block.number : startBlock,
            accRewardPerShare: 0,
            totalStaked: 0,
            isActive: true
        }));

        emit PoolAdded(poolInfo.length - 1, _lpToken, _rewardToken, _allocPoint);
    }

    /**
     * @dev Update pool allocation points
     * @param _poolId Pool ID
     * @param _allocPoint New allocation points
     */
    function setPoolAllocPoint(uint256 _poolId, uint256 _allocPoint) external onlyOwner {
        if (_poolId >= poolInfo.length) revert InvalidPool();

        _massUpdatePools();

        totalAllocPoint = totalAllocPoint - poolInfo[_poolId].allocPoint + _allocPoint;
        poolInfo[_poolId].allocPoint = _allocPoint;
    }

    /**
     * @dev Set pool active status
     * @param _poolId Pool ID
     * @param _isActive Active status
     */
    function setPoolActive(uint256 _poolId, bool _isActive) external onlyOwner {
        if (_poolId >= poolInfo.length) revert InvalidPool();
        poolInfo[_poolId].isActive = _isActive;
    }

    /**
     * @dev Update reward per block
     * @param _rewardPerBlock New reward per block
     */
    function setRewardPerBlock(uint256 _rewardPerBlock) external onlyOwner {
        _massUpdatePools();
        rewardPerBlock = _rewardPerBlock;
    }

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
     * @dev Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ============ STAKING FUNCTIONS ============

    /**
     * @dev Stake LP tokens
     * @param _poolId Pool ID
     * @param _amount Amount to stake
     * @param _lockTier Lock tier for bonus multiplier
     */
    function stake(
        uint256 _poolId,
        uint256 _amount,
        LockTier _lockTier
    ) external nonReentrant whenNotPaused {
        if (_poolId >= poolInfo.length) revert InvalidPool();
        if (_amount == 0) revert InvalidAmount();

        PoolInfo storage pool = poolInfo[_poolId];
        UserInfo storage user = userInfo[_poolId][msg.sender];

        if (!pool.isActive) revert PoolNotActive();

        _updatePool(_poolId);

        // Claim pending rewards if already staking
        if (user.amount > 0) {
            uint256 pending = _calculatePending(pool, user);
            if (pending > 0) {
                user.pendingRewards += pending;
            }
        }

        // Transfer LP tokens
        pool.lpToken.safeTransferFrom(msg.sender, address(this), _amount);

        // Update user info
        user.amount += _amount;
        user.lockTier = _lockTier;
        user.lockEndTime = block.timestamp + _getLockDuration(_lockTier);
        user.rewardDebt = (user.amount * pool.accRewardPerShare) / PRECISION;

        pool.totalStaked += _amount;

        emit Staked(msg.sender, _poolId, _amount, _lockTier, user.lockEndTime);
    }

    /**
     * @dev Unstake LP tokens
     * @param _poolId Pool ID
     * @param _amount Amount to unstake
     */
    function unstake(uint256 _poolId, uint256 _amount) external nonReentrant {
        if (_poolId >= poolInfo.length) revert InvalidPool();
        if (_amount == 0) revert InvalidAmount();

        PoolInfo storage pool = poolInfo[_poolId];
        UserInfo storage user = userInfo[_poolId][msg.sender];

        if (user.amount < _amount) revert InsufficientBalance();
        if (block.timestamp < user.lockEndTime) revert LockNotExpired();

        _updatePool(_poolId);

        // Calculate and claim pending rewards
        uint256 pending = _calculatePending(pool, user) + user.pendingRewards;
        if (pending > 0) {
            _distributeReward(_poolId, msg.sender, pending);
            user.pendingRewards = 0;
        }

        // Update user info
        user.amount -= _amount;
        user.rewardDebt = (user.amount * pool.accRewardPerShare) / PRECISION;

        pool.totalStaked -= _amount;

        // Transfer LP tokens back
        pool.lpToken.safeTransfer(msg.sender, _amount);

        emit Unstaked(msg.sender, _poolId, _amount);
    }

    /**
     * @dev Claim rewards without unstaking
     * @param _poolId Pool ID
     */
    function claimRewards(uint256 _poolId) external nonReentrant {
        if (_poolId >= poolInfo.length) revert InvalidPool();

        PoolInfo storage pool = poolInfo[_poolId];
        UserInfo storage user = userInfo[_poolId][msg.sender];

        if (user.amount == 0) revert NotStaked();

        _updatePool(_poolId);

        uint256 pending = _calculatePending(pool, user) + user.pendingRewards;
        if (pending == 0) revert InvalidAmount();

        user.rewardDebt = (user.amount * pool.accRewardPerShare) / PRECISION;
        user.pendingRewards = 0;

        _distributeReward(_poolId, msg.sender, pending);
    }

    /**
     * @dev Compound rewards into stake
     * @param _poolId Pool ID
     */
    function compoundRewards(uint256 _poolId) external nonReentrant {
        if (_poolId >= poolInfo.length) revert InvalidPool();

        PoolInfo storage pool = poolInfo[_poolId];
        UserInfo storage user = userInfo[_poolId][msg.sender];

        if (user.amount == 0) revert NotStaked();

        _updatePool(_poolId);

        uint256 pending = _calculatePending(pool, user) + user.pendingRewards;
        if (pending == 0) revert InvalidAmount();

        // Calculate zakat
        uint256 zakatAmount = (pending * ZAKAT_PERCENTAGE) / BASIS_POINTS;
        uint256 netReward = pending - zakatAmount;

        // Add net reward to stake (assuming reward token is LP token for simplicity)
        user.amount += netReward;
        user.rewardDebt = (user.amount * pool.accRewardPerShare) / PRECISION;
        user.pendingRewards = 0;

        pool.totalStaked += netReward;
        totalRewardsDistributed += netReward;

        // Distribute zakat
        if (zakatAmount > 0) {
            pool.rewardToken.safeTransfer(sabirAllahHonorFund, zakatAmount);
            totalZakatDistributed += zakatAmount;
            emit ZakatDistributed(sabirAllahHonorFund, zakatAmount);
        }

        emit RewardCompounded(msg.sender, _poolId, netReward);
    }

    /**
     * @dev Toggle auto-compounding
     * @param _poolId Pool ID
     */
    function toggleCompounding(uint256 _poolId) external {
        if (_poolId >= poolInfo.length) revert InvalidPool();
        UserInfo storage user = userInfo[_poolId][msg.sender];
        if (user.amount == 0) revert NotStaked();
        user.isCompounding = !user.isCompounding;
    }

    /**
     * @dev Emergency withdraw without caring about rewards
     * @param _poolId Pool ID
     */
    function emergencyWithdraw(uint256 _poolId) external nonReentrant {
        if (_poolId >= poolInfo.length) revert InvalidPool();

        PoolInfo storage pool = poolInfo[_poolId];
        UserInfo storage user = userInfo[_poolId][msg.sender];

        uint256 amount = user.amount;
        if (amount == 0) revert NotStaked();

        // Reset user info
        user.amount = 0;
        user.rewardDebt = 0;
        user.pendingRewards = 0;
        user.lockEndTime = 0;
        user.lockTier = LockTier.NONE;

        pool.totalStaked -= amount;

        // Transfer LP tokens back
        pool.lpToken.safeTransfer(msg.sender, amount);

        emit EmergencyWithdraw(msg.sender, _poolId, amount);
    }

    // ============ INTERNAL FUNCTIONS ============

    /**
     * @dev Update all pools
     */
    function _massUpdatePools() internal {
        uint256 length = poolInfo.length;
        for (uint256 i = 0; i < length; i++) {
            _updatePool(i);
        }
    }

    /**
     * @dev Update reward variables for a pool
     * @param _poolId Pool ID
     */
    function _updatePool(uint256 _poolId) internal {
        PoolInfo storage pool = poolInfo[_poolId];

        if (block.number <= pool.lastRewardBlock) {
            return;
        }

        if (pool.totalStaked == 0 || totalAllocPoint == 0) {
            pool.lastRewardBlock = block.number;
            return;
        }

        uint256 blocks = block.number - pool.lastRewardBlock;
        uint256 reward = (blocks * rewardPerBlock * pool.allocPoint) / totalAllocPoint;

        pool.accRewardPerShare += (reward * PRECISION) / pool.totalStaked;
        pool.lastRewardBlock = block.number;
    }

    /**
     * @dev Calculate pending rewards for a user
     * @param pool Pool info
     * @param user User info
     * @return Pending reward amount
     */
    function _calculatePending(PoolInfo storage pool, UserInfo storage user) internal view returns (uint256) {
        uint256 accRewardPerShare = pool.accRewardPerShare;

        if (block.number > pool.lastRewardBlock && pool.totalStaked > 0 && totalAllocPoint > 0) {
            uint256 blocks = block.number - pool.lastRewardBlock;
            uint256 reward = (blocks * rewardPerBlock * pool.allocPoint) / totalAllocPoint;
            accRewardPerShare += (reward * PRECISION) / pool.totalStaked;
        }

        uint256 baseReward = ((user.amount * accRewardPerShare) / PRECISION) - user.rewardDebt;

        // Apply lock tier multiplier
        uint256 multiplier = _getTierMultiplier(user.lockTier);
        baseReward = (baseReward * multiplier) / BASIS_POINTS;

        // Apply Noor Citizen bonus if applicable
        if (address(citizenRegistry) != address(0) && citizenRegistry.isCitizen(msg.sender)) {
            baseReward = (baseReward * CITIZEN_BONUS) / 1000;
        }

        return baseReward;
    }

    /**
     * @dev Distribute reward with zakat
     * @param _poolId Pool ID
     * @param _user User address
     * @param _amount Reward amount
     */
    function _distributeReward(uint256 _poolId, address _user, uint256 _amount) internal {
        PoolInfo storage pool = poolInfo[_poolId];

        // Calculate zakat
        uint256 zakatAmount = (_amount * ZAKAT_PERCENTAGE) / BASIS_POINTS;
        uint256 netReward = _amount - zakatAmount;

        // Transfer net reward to user
        pool.rewardToken.safeTransfer(_user, netReward);
        totalRewardsDistributed += netReward;

        // Transfer zakat to Sabir Allah Honor Fund
        if (zakatAmount > 0) {
            pool.rewardToken.safeTransfer(sabirAllahHonorFund, zakatAmount);
            totalZakatDistributed += zakatAmount;
            emit ZakatDistributed(sabirAllahHonorFund, zakatAmount);
        }

        emit RewardClaimed(_user, _poolId, netReward, zakatAmount);
    }

    /**
     * @dev Get lock duration for a tier
     * @param _tier Lock tier
     * @return Lock duration in seconds
     */
    function _getLockDuration(LockTier _tier) internal pure returns (uint256) {
        if (_tier == LockTier.TIER_5) return TIER_5_DURATION;
        if (_tier == LockTier.TIER_4) return TIER_4_DURATION;
        if (_tier == LockTier.TIER_3) return TIER_3_DURATION;
        if (_tier == LockTier.TIER_2) return TIER_2_DURATION;
        if (_tier == LockTier.TIER_1) return TIER_1_DURATION;
        return 0;
    }

    /**
     * @dev Get multiplier for a tier
     * @param _tier Lock tier
     * @return Multiplier in basis points
     */
    function _getTierMultiplier(LockTier _tier) internal pure returns (uint256) {
        if (_tier == LockTier.TIER_5) return TIER_5_MULTIPLIER;
        if (_tier == LockTier.TIER_4) return TIER_4_MULTIPLIER;
        if (_tier == LockTier.TIER_3) return TIER_3_MULTIPLIER;
        if (_tier == LockTier.TIER_2) return TIER_2_MULTIPLIER;
        if (_tier == LockTier.TIER_1) return TIER_1_MULTIPLIER;
        return BASIS_POINTS;
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @dev Get number of pools
     * @return Pool count
     */
    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }

    /**
     * @dev Get pending rewards for a user
     * @param _poolId Pool ID
     * @param _user User address
     * @return Pending reward amount
     */
    function pendingReward(uint256 _poolId, address _user) external view returns (uint256) {
        if (_poolId >= poolInfo.length) return 0;

        PoolInfo storage pool = poolInfo[_poolId];
        UserInfo storage user = userInfo[_poolId][_user];

        if (user.amount == 0) return user.pendingRewards;

        return _calculatePending(pool, user) + user.pendingRewards;
    }

    /**
     * @dev Get user stake info
     * @param _poolId Pool ID
     * @param _user User address
     * @return UserInfo struct
     */
    function getUserInfo(uint256 _poolId, address _user) external view returns (UserInfo memory) {
        return userInfo[_poolId][_user];
    }

    /**
     * @dev Get pool info
     * @param _poolId Pool ID
     * @return PoolInfo struct
     */
    function getPoolInfo(uint256 _poolId) external view returns (PoolInfo memory) {
        return poolInfo[_poolId];
    }

    /**
     * @dev Get tier info
     * @param _tier Lock tier
     * @return duration Lock duration
     * @return multiplier Reward multiplier
     */
    function getTierInfo(LockTier _tier) external pure returns (uint256 duration, uint256 multiplier) {
        duration = _getLockDuration(_tier);
        multiplier = _getTierMultiplier(_tier);
    }

    /**
     * @dev Get resonance signature
     * @return Combined frequency
     */
    function getResonanceSignature() external pure returns (uint256) {
        return FREQUENCY_528HZ + FREQUENCY_963HZ + FREQUENCY_888HZ + FREQUENCY_777HZ;
    }
}
