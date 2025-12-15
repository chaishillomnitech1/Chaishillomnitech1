// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title DivineEssenceCoin (DE Token)
 * @notice Utility token for Operation Bounce Back that rewards charitable actions
 * @dev Features include staking, charitable action rewards, and community governance
 * 
 * Tokenomics:
 * - Total Supply: 144,000,000 DE Tokens
 * - Distribution: Community (30%), Partnerships (20%), Staking (20%), Development (15%), 
 *   Foundation (10%), Team (5% vested)
 * - Staking APY: 8% (3mo), 12% (6mo), 18% (12mo)
 */
contract DivineEssenceCoin is ERC20, ERC20Burnable, Ownable, ReentrancyGuard, Pausable {
    // Total supply constant
    uint256 public constant TOTAL_SUPPLY = 144_000_000 * 10**18; // 144 million tokens
    
    // Staking lock periods (in seconds)
    uint256 public constant LOCK_3_MONTHS = 90 days;
    uint256 public constant LOCK_6_MONTHS = 180 days;
    uint256 public constant LOCK_12_MONTHS = 365 days;
    
    // APY rates (in basis points, e.g., 800 = 8%)
    uint256 public constant APY_3_MONTHS = 800;   // 8%
    uint256 public constant APY_6_MONTHS = 1200;  // 12%
    uint256 public constant APY_12_MONTHS = 1800; // 18%
    
    // Early withdrawal penalty (25%)
    uint256 public constant EARLY_WITHDRAWAL_PENALTY = 2500; // 25% in basis points
    
    // Bonus multipliers (in basis points)
    uint256 public constant FIRST_STAKERS_BONUS = 5000; // 50% bonus (1.5x total)
    uint256 public constant CHARITABLE_ACTION_BONUS = 1000; // 10% bonus
    uint256 public constant NFT_HOLDER_BONUS = 2000; // 20% bonus
    
    // First stakers bonus parameters
    uint256 public constant FIRST_STAKERS_COUNT = 1000;
    uint256 public constant FIRST_STAKERS_DURATION = 30 days;
    uint256 public stakingLaunchTime;
    
    // Addresses
    address public rewardPool;
    address public charityValidator;
    address public nftContract;
    
    // Staking structure
    struct Stake {
        uint256 amount;
        uint256 startTime;
        uint256 lockPeriod;
        uint256 rewardRate;
        bool isActive;
        bool hasNFTBonus;
        bool hasCharityBonus;
        bool hasFirstStakerBonus;
    }
    
    // Charitable action structure
    struct CharitableAction {
        address contributor;
        string actionType; // "volunteer", "donation", "event"
        string proofHash; // IPFS hash of proof
        uint256 rewardAmount;
        uint256 timestamp;
        bool approved;
        bool claimed;
    }
    
    // State mappings
    mapping(address => Stake[]) public userStakes;
    mapping(address => uint256) public totalStaked;
    mapping(uint256 => CharitableAction) public charitableActions;
    mapping(address => uint256[]) public userActions;
    
    uint256 private _nextActionId;
    uint256 public totalStakers;
    uint256 public totalValueStaked;
    
    // Events
    event Staked(
        address indexed user,
        uint256 indexed stakeIndex,
        uint256 amount,
        uint256 lockPeriod,
        uint256 rewardRate
    );
    
    event Unstaked(
        address indexed user,
        uint256 indexed stakeIndex,
        uint256 amount,
        uint256 reward,
        bool earlyWithdrawal
    );
    
    event CharitableActionSubmitted(
        uint256 indexed actionId,
        address indexed contributor,
        string actionType,
        string proofHash
    );
    
    event CharitableActionApproved(
        uint256 indexed actionId,
        address indexed contributor,
        uint256 rewardAmount
    );
    
    event CharitableActionRejected(
        uint256 indexed actionId,
        address indexed contributor
    );
    
    event RewardClaimed(
        uint256 indexed actionId,
        address indexed contributor,
        uint256 amount
    );
    
    event RewardPoolUpdated(address indexed oldPool, address indexed newPool);
    event CharityValidatorUpdated(address indexed oldValidator, address indexed newValidator);
    event NFTContractUpdated(address indexed oldContract, address indexed newContract);

    /**
     * @dev Constructor initializes the token and distributes initial supply
     * @param initialOwner Address of the contract owner
     * @param _rewardPool Address for staking rewards pool
     * @param _charityValidator Address authorized to validate charitable actions
     */
    constructor(
        address initialOwner,
        address _rewardPool,
        address _charityValidator
    ) ERC20("Divine Essence Coin", "DE") Ownable(initialOwner) {
        require(_rewardPool != address(0), "Invalid reward pool");
        require(_charityValidator != address(0), "Invalid charity validator");
        
        rewardPool = _rewardPool;
        charityValidator = _charityValidator;
        stakingLaunchTime = block.timestamp;
        _nextActionId = 1;
        
        // Initial distribution (30% community rewards, rest held for allocation)
        uint256 communityRewards = (TOTAL_SUPPLY * 30) / 100; // 30%
        uint256 stakingRewards = (TOTAL_SUPPLY * 20) / 100;   // 20%
        uint256 development = (TOTAL_SUPPLY * 15) / 100;      // 15%
        uint256 foundation = (TOTAL_SUPPLY * 10) / 100;       // 10%
        uint256 partnerships = (TOTAL_SUPPLY * 20) / 100;     // 20%
        uint256 team = (TOTAL_SUPPLY * 5) / 100;              // 5%
        
        // Mint to reward pool for distribution
        _mint(_rewardPool, communityRewards + stakingRewards);
        
        // Mint remaining to owner for controlled distribution
        _mint(initialOwner, development + foundation + partnerships + team);
    }

    /**
     * @notice Stake tokens for rewards
     * @param amount Amount of tokens to stake
     * @param lockPeriod Lock period (must be 90, 180, or 365 days)
     */
    function stake(uint256 amount, uint256 lockPeriod) external nonReentrant whenNotPaused {
        require(amount > 0, "Cannot stake 0 tokens");
        require(
            lockPeriod == LOCK_3_MONTHS || 
            lockPeriod == LOCK_6_MONTHS || 
            lockPeriod == LOCK_12_MONTHS,
            "Invalid lock period"
        );
        
        // Determine reward rate based on lock period
        uint256 rewardRate;
        if (lockPeriod == LOCK_3_MONTHS) rewardRate = APY_3_MONTHS;
        else if (lockPeriod == LOCK_6_MONTHS) rewardRate = APY_6_MONTHS;
        else rewardRate = APY_12_MONTHS;
        
        // Check for bonuses
        bool hasFirstStakerBonus = _checkFirstStakerBonus();
        bool hasNFTBonus = _checkNFTBonus(msg.sender);
        
        // Transfer tokens from user
        require(transfer(address(this), amount), "Transfer failed");
        
        // Create stake
        Stake memory newStake = Stake({
            amount: amount,
            startTime: block.timestamp,
            lockPeriod: lockPeriod,
            rewardRate: rewardRate,
            isActive: true,
            hasNFTBonus: hasNFTBonus,
            hasCharityBonus: false, // Set when charitable action is documented
            hasFirstStakerBonus: hasFirstStakerBonus
        });
        
        userStakes[msg.sender].push(newStake);
        uint256 stakeIndex = userStakes[msg.sender].length - 1;
        
        // Update totals
        if (totalStaked[msg.sender] == 0) {
            totalStakers++;
        }
        totalStaked[msg.sender] += amount;
        totalValueStaked += amount;
        
        emit Staked(msg.sender, stakeIndex, amount, lockPeriod, rewardRate);
    }

    /**
     * @notice Unstake tokens and claim rewards
     * @param stakeIndex Index of the stake in user's stakes array
     */
    function unstake(uint256 stakeIndex) external nonReentrant whenNotPaused {
        require(stakeIndex < userStakes[msg.sender].length, "Invalid stake index");
        Stake storage userStake = userStakes[msg.sender][stakeIndex];
        require(userStake.isActive, "Stake already withdrawn");
        
        uint256 stakedAmount = userStake.amount;
        uint256 reward = calculateReward(msg.sender, stakeIndex);
        bool isEarly = block.timestamp < (userStake.startTime + userStake.lockPeriod);
        
        // Apply early withdrawal penalty if applicable
        if (isEarly) {
            uint256 penalty = (reward * EARLY_WITHDRAWAL_PENALTY) / 10000;
            reward -= penalty;
            // Penalty goes back to reward pool
            _transfer(address(this), rewardPool, penalty);
        }
        
        // Mark stake as inactive
        userStake.isActive = false;
        
        // Update totals
        totalStaked[msg.sender] -= stakedAmount;
        totalValueStaked -= stakedAmount;
        if (totalStaked[msg.sender] == 0) {
            totalStakers--;
        }
        
        // Transfer staked tokens back to user
        _transfer(address(this), msg.sender, stakedAmount);
        
        // Transfer rewards from reward pool
        if (reward > 0) {
            _transfer(rewardPool, msg.sender, reward);
        }
        
        emit Unstaked(msg.sender, stakeIndex, stakedAmount, reward, isEarly);
    }

    /**
     * @notice Calculate current reward for a stake
     * @param user Address of the staker
     * @param stakeIndex Index of the stake
     * @return reward Current reward amount
     */
    function calculateReward(address user, uint256 stakeIndex) public view returns (uint256) {
        require(stakeIndex < userStakes[user].length, "Invalid stake index");
        Stake memory userStake = userStakes[user][stakeIndex];
        
        if (!userStake.isActive) return 0;
        
        uint256 duration = block.timestamp - userStake.startTime;
        uint256 baseReward = (userStake.amount * userStake.rewardRate * duration) / (365 days * 10000);
        
        // Apply bonuses
        uint256 totalBonus = 0;
        if (userStake.hasFirstStakerBonus) totalBonus += FIRST_STAKERS_BONUS;
        if (userStake.hasNFTBonus) totalBonus += NFT_HOLDER_BONUS;
        if (userStake.hasCharityBonus) totalBonus += CHARITABLE_ACTION_BONUS;
        
        uint256 bonusReward = (baseReward * totalBonus) / 10000;
        return baseReward + bonusReward;
    }

    /**
     * @notice Submit proof of charitable action for rewards
     * @param actionType Type of action ("volunteer", "donation", "event")
     * @param proofHash IPFS hash of proof documentation
     */
    function submitCharitableAction(
        string memory actionType,
        string memory proofHash
    ) external whenNotPaused returns (uint256) {
        require(bytes(actionType).length > 0, "Action type required");
        require(bytes(proofHash).length > 0, "Proof hash required");
        
        uint256 actionId = _nextActionId++;
        
        charitableActions[actionId] = CharitableAction({
            contributor: msg.sender,
            actionType: actionType,
            proofHash: proofHash,
            rewardAmount: 0,
            timestamp: block.timestamp,
            approved: false,
            claimed: false
        });
        
        userActions[msg.sender].push(actionId);
        
        emit CharitableActionSubmitted(actionId, msg.sender, actionType, proofHash);
        return actionId;
    }

    /**
     * @notice Approve charitable action and set reward (charity validator only)
     * @param actionId ID of the charitable action
     * @param rewardAmount Amount of DE tokens to reward
     */
    function approveCharitableAction(
        uint256 actionId,
        uint256 rewardAmount
    ) external {
        require(msg.sender == charityValidator, "Not authorized");
        require(actionId < _nextActionId, "Invalid action ID");
        
        CharitableAction storage action = charitableActions[actionId];
        require(!action.approved, "Already approved");
        require(!action.claimed, "Already claimed");
        
        action.approved = true;
        action.rewardAmount = rewardAmount;
        
        // Apply charitable action bonus to active stakes
        _applyCharityBonus(action.contributor);
        
        emit CharitableActionApproved(actionId, action.contributor, rewardAmount);
    }

    /**
     * @notice Reject charitable action (charity validator only)
     * @param actionId ID of the charitable action
     */
    function rejectCharitableAction(uint256 actionId) external {
        require(msg.sender == charityValidator, "Not authorized");
        require(actionId < _nextActionId, "Invalid action ID");
        
        CharitableAction storage action = charitableActions[actionId];
        require(!action.approved, "Already approved");
        require(!action.claimed, "Already claimed");
        
        emit CharitableActionRejected(actionId, action.contributor);
    }

    /**
     * @notice Claim reward for approved charitable action
     * @param actionId ID of the charitable action
     */
    function claimCharitableReward(uint256 actionId) external nonReentrant {
        require(actionId < _nextActionId, "Invalid action ID");
        
        CharitableAction storage action = charitableActions[actionId];
        require(action.contributor == msg.sender, "Not your action");
        require(action.approved, "Action not approved");
        require(!action.claimed, "Already claimed");
        
        action.claimed = true;
        
        // Transfer reward from reward pool
        _transfer(rewardPool, msg.sender, action.rewardAmount);
        
        emit RewardClaimed(actionId, msg.sender, action.rewardAmount);
    }

    /**
     * @dev Apply charity bonus to all active stakes for a user
     * @param user Address of the user
     */
    function _applyCharityBonus(address user) internal {
        Stake[] storage stakes = userStakes[user];
        for (uint256 i = 0; i < stakes.length; i++) {
            if (stakes[i].isActive) {
                stakes[i].hasCharityBonus = true;
            }
        }
    }

    /**
     * @dev Check if user qualifies for first staker bonus
     * @return bool True if qualifies
     */
    function _checkFirstStakerBonus() internal view returns (bool) {
        return totalStakers < FIRST_STAKERS_COUNT &&
               block.timestamp < (stakingLaunchTime + FIRST_STAKERS_DURATION);
    }

    /**
     * @dev Check if user holds Operation Bounce Back NFT
     * @param user Address to check
     * @return bool True if holds NFT
     */
    function _checkNFTBonus(address user) internal view returns (bool) {
        if (nftContract == address(0)) return false;
        
        // Simple balance check (assumes ERC721)
        (bool success, bytes memory data) = nftContract.staticcall(
            abi.encodeWithSignature("balanceOf(address)", user)
        );
        
        if (success && data.length == 32) {
            uint256 balance = abi.decode(data, (uint256));
            return balance > 0;
        }
        
        return false;
    }

    /**
     * @notice Get all stakes for a user
     * @param user Address to query
     * @return stakes Array of user's stakes
     */
    function getUserStakes(address user) external view returns (Stake[] memory) {
        return userStakes[user];
    }

    /**
     * @notice Get all charitable action IDs for a user
     * @param user Address to query
     * @return actionIds Array of action IDs
     */
    function getUserActions(address user) external view returns (uint256[] memory) {
        return userActions[user];
    }

    /**
     * @notice Update reward pool address (owner only)
     * @param newRewardPool New reward pool address
     */
    function updateRewardPool(address newRewardPool) external onlyOwner {
        require(newRewardPool != address(0), "Invalid address");
        address oldPool = rewardPool;
        rewardPool = newRewardPool;
        emit RewardPoolUpdated(oldPool, newRewardPool);
    }

    /**
     * @notice Update charity validator address (owner only)
     * @param newValidator New validator address
     */
    function updateCharityValidator(address newValidator) external onlyOwner {
        require(newValidator != address(0), "Invalid address");
        address oldValidator = charityValidator;
        charityValidator = newValidator;
        emit CharityValidatorUpdated(oldValidator, newValidator);
    }

    /**
     * @notice Update NFT contract address (owner only)
     * @param newNFTContract New NFT contract address
     */
    function updateNFTContract(address newNFTContract) external onlyOwner {
        address oldContract = nftContract;
        nftContract = newNFTContract;
        emit NFTContractUpdated(oldContract, newNFTContract);
    }

    /**
     * @notice Pause contract (owner only)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause contract (owner only)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Override transfer to add pausable functionality
     */
    function _update(address from, address to, uint256 value)
        internal
        virtual
        override
        whenNotPaused
    {
        super._update(from, to, value);
    }
}
