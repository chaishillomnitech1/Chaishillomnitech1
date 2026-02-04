// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ScrollVerseHealthCoin
 * @dev Blockchain-backed voting token with healing-powered rewards
 * @author Supreme King Chais The Great ∞
 * 
 * This contract implements the ScrollVerse HealthCoin with:
 * - ERC-20 standard compliance with voting capabilities
 * - Blockchain-backed voting mechanism
 * - Healing-powered rewards system (528Hz Love Frequency)
 * - Health milestone tracking and rewards
 * - Community health initiatives governance
 * - Integration with Academy Learning Modules
 * 
 * Total Supply: 528,000,000 $HEALTH (aligned with 528Hz healing frequency)
 * Frequency: 528Hz (DNA Healing & Love)
 * Status: SCROLLVERSE HEALTH ACTIVATION PROTOCOL ACTIVE
 */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ScrollVerseHealthCoin is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ReentrancyGuard {
    
    // ============ FREQUENCY CONSTANTS ============
    
    /// @dev Healing frequency (528Hz) - DNA repair and healing
    uint256 public constant HEALING_FREQUENCY_528HZ = 528;
    
    /// @dev Pineal activation frequency (963Hz)
    uint256 public constant PINEAL_FREQUENCY_963HZ = 963;
    
    // ============ TOKEN CONSTANTS ============
    
    /// @dev Total supply: 528 million HEALTH tokens
    uint256 public constant TOTAL_SUPPLY = 528_000_000 * 10**18;
    
    /// @dev Reward pool allocation (40% of supply)
    uint256 public constant REWARD_POOL = TOTAL_SUPPLY * 40 / 100;
    
    /// @dev Governance reserve (30% of supply)
    uint256 public constant GOVERNANCE_RESERVE = TOTAL_SUPPLY * 30 / 100;
    
    /// @dev Community health initiatives (20% of supply)
    uint256 public constant COMMUNITY_HEALTH_POOL = TOTAL_SUPPLY * 20 / 100;
    
    /// @dev Initial distribution (10% of supply)
    uint256 public constant INITIAL_DISTRIBUTION = TOTAL_SUPPLY * 10 / 100;
    
    // ============ REWARD CONSTANTS ============
    
    /// @dev Base reward for health milestone achievement
    uint256 public constant HEALTH_MILESTONE_REWARD = 528 * 10**18;
    
    /// @dev Base reward for completing healing meditation
    uint256 public constant HEALING_MEDITATION_REWARD = 52 * 10**18;
    
    /// @dev Base reward for wellness practice
    uint256 public constant WELLNESS_PRACTICE_REWARD = 28 * 10**18;
    
    /// @dev Base reward for community health action
    uint256 public constant COMMUNITY_HEALTH_REWARD = 108 * 10**18;
    
    /// @dev Voting reward for participation
    uint256 public constant VOTING_REWARD = 10 * 10**18;
    
    // ============ VOTING CONSTANTS ============
    
    /// @dev Minimum tokens required to create proposal
    uint256 public constant PROPOSAL_THRESHOLD = 10000 * 10**18;
    
    /// @dev Voting period duration (7 days)
    uint256 public constant VOTING_PERIOD = 7 days;
    
    /// @dev Quorum requirement (10% of total supply)
    uint256 public constant QUORUM = TOTAL_SUPPLY * 10 / 100;
    
    // ============ STRUCTS ============
    
    /// @dev Proposal structure for health governance
    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        bool passed;
        mapping(address => bool) hasVoted;
        mapping(address => uint256) voteWeight;
    }
    
    /// @dev Health milestone structure
    struct HealthMilestone {
        uint256 id;
        address achiever;
        string milestoneType;
        uint256 timestamp;
        uint256 rewardAmount;
    }
    
    // ============ STATE VARIABLES ============
    
    /// @dev Governance reserve address
    address public governanceReserve;
    
    /// @dev Community health pool address
    address public communityHealthPool;
    
    /// @dev Reward pool address
    address public rewardPool;
    
    /// @dev Proposal counter
    uint256 public proposalCount;
    
    /// @dev Health milestone counter
    uint256 public milestoneCount;
    
    /// @dev Mapping: Proposal ID => Proposal
    mapping(uint256 => Proposal) public proposals;
    
    /// @dev Mapping: User => Total Rewards Earned
    mapping(address => uint256) public totalRewardsEarned;
    
    /// @dev Mapping: User => Last Claim Timestamp
    mapping(address => uint256) public lastClaimTime;
    
    /// @dev Mapping: User => Health Milestones Achieved
    mapping(address => uint256) public healthMilestonesAchieved;
    
    /// @dev Mapping: User => Healing Meditations Completed
    mapping(address => uint256) public healingMeditationsCompleted;
    
    /// @dev Mapping: User => Wellness Practices Completed
    mapping(address => uint256) public wellnessPracticesCompleted;
    
    /// @dev Mapping: User => Community Health Actions
    mapping(address => uint256) public communityHealthActions;
    
    /// @dev Mapping: User => Total Votes Cast
    mapping(address => uint256) public totalVotesCast;
    
    /// @dev Mapping: Address => Authorized Rewarder Status
    mapping(address => bool) public isRewarder;
    
    /// @dev Mapping: Address => Academy Module Completion
    mapping(address => mapping(uint256 => bool)) public academyModuleCompleted;
    
    /// @dev Array of all health milestones
    HealthMilestone[] public healthMilestones;
    
    /// @dev Total rewards distributed
    uint256 public totalRewardsDistributed;
    
    /// @dev Voting enabled
    bool public votingEnabled;
    
    // ============ EVENTS ============
    
    event RewardDistributed(address indexed recipient, uint256 amount, string rewardType);
    event HealthMilestoneAchieved(address indexed achiever, uint256 milestoneId, string milestoneType, uint256 reward);
    event HealingMeditationCompleted(address indexed user, uint256 count, uint256 reward);
    event WellnessPracticeCompleted(address indexed user, uint256 count, uint256 reward);
    event CommunityHealthAction(address indexed user, uint256 count, uint256 reward);
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string description);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId, bool passed);
    event RewarderUpdated(address indexed rewarder, bool status);
    event VotingStatusChanged(bool enabled);
    event AcademyModuleCompleted(address indexed user, uint256 moduleId, uint256 reward);
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        address initialOwner,
        address _governanceReserve,
        address _communityHealthPool,
        address _rewardPool
    ) ERC20("ScrollVerse HealthCoin", "HEALTH") Ownable(initialOwner) {
        require(_governanceReserve != address(0), "Invalid governance reserve");
        require(_communityHealthPool != address(0), "Invalid community health pool");
        require(_rewardPool != address(0), "Invalid reward pool");
        
        governanceReserve = _governanceReserve;
        communityHealthPool = _communityHealthPool;
        rewardPool = _rewardPool;
        
        votingEnabled = true;
        
        // Mint initial allocations
        _mint(_rewardPool, REWARD_POOL);
        _mint(_governanceReserve, GOVERNANCE_RESERVE);
        _mint(_communityHealthPool, COMMUNITY_HEALTH_POOL);
        _mint(initialOwner, INITIAL_DISTRIBUTION);
    }
    
    // ============ MODIFIERS ============
    
    modifier onlyRewarder() {
        require(isRewarder[msg.sender] || msg.sender == owner(), "Not authorized rewarder");
        _;
    }
    
    modifier whenVotingEnabled() {
        require(votingEnabled, "Voting is currently disabled");
        _;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Set rewarder status
     * @param rewarder Address to update
     * @param status New rewarder status
     */
    function setRewarder(address rewarder, bool status) external onlyOwner {
        require(rewarder != address(0), "Invalid address");
        isRewarder[rewarder] = status;
        emit RewarderUpdated(rewarder, status);
    }
    
    /**
     * @dev Enable or disable voting
     * @param enabled New voting status
     */
    function setVotingEnabled(bool enabled) external onlyOwner {
        votingEnabled = enabled;
        emit VotingStatusChanged(enabled);
    }
    
    // ============ HEALTH REWARD FUNCTIONS ============
    
    /**
     * @dev Reward user for achieving health milestone
     * @param user Address of user
     * @param milestoneType Type of milestone achieved
     */
    function rewardHealthMilestone(address user, string memory milestoneType) 
        external 
        onlyRewarder 
        nonReentrant 
    {
        require(user != address(0), "Invalid user address");
        
        milestoneCount++;
        
        HealthMilestone storage milestone = healthMilestones.push();
        milestone.id = milestoneCount;
        milestone.achiever = user;
        milestone.milestoneType = milestoneType;
        milestone.timestamp = block.timestamp;
        milestone.rewardAmount = HEALTH_MILESTONE_REWARD;
        
        healthMilestonesAchieved[user]++;
        totalRewardsEarned[user] += HEALTH_MILESTONE_REWARD;
        totalRewardsDistributed += HEALTH_MILESTONE_REWARD;
        
        // Transfer reward from reward pool
        _transfer(rewardPool, user, HEALTH_MILESTONE_REWARD);
        
        emit HealthMilestoneAchieved(user, milestoneCount, milestoneType, HEALTH_MILESTONE_REWARD);
        emit RewardDistributed(user, HEALTH_MILESTONE_REWARD, "Health Milestone");
    }
    
    /**
     * @dev Reward user for completing healing meditation
     * @param user Address of user
     */
    function rewardHealingMeditation(address user) 
        external 
        onlyRewarder 
        nonReentrant 
    {
        require(user != address(0), "Invalid user address");
        
        healingMeditationsCompleted[user]++;
        totalRewardsEarned[user] += HEALING_MEDITATION_REWARD;
        totalRewardsDistributed += HEALING_MEDITATION_REWARD;
        
        _transfer(rewardPool, user, HEALING_MEDITATION_REWARD);
        
        emit HealingMeditationCompleted(user, healingMeditationsCompleted[user], HEALING_MEDITATION_REWARD);
        emit RewardDistributed(user, HEALING_MEDITATION_REWARD, "Healing Meditation");
    }
    
    /**
     * @dev Reward user for completing wellness practice
     * @param user Address of user
     */
    function rewardWellnessPractice(address user) 
        external 
        onlyRewarder 
        nonReentrant 
    {
        require(user != address(0), "Invalid user address");
        
        wellnessPracticesCompleted[user]++;
        totalRewardsEarned[user] += WELLNESS_PRACTICE_REWARD;
        totalRewardsDistributed += WELLNESS_PRACTICE_REWARD;
        
        _transfer(rewardPool, user, WELLNESS_PRACTICE_REWARD);
        
        emit WellnessPracticeCompleted(user, wellnessPracticesCompleted[user], WELLNESS_PRACTICE_REWARD);
        emit RewardDistributed(user, WELLNESS_PRACTICE_REWARD, "Wellness Practice");
    }
    
    /**
     * @dev Reward user for community health action
     * @param user Address of user
     */
    function rewardCommunityHealthAction(address user) 
        external 
        onlyRewarder 
        nonReentrant 
    {
        require(user != address(0), "Invalid user address");
        
        communityHealthActions[user]++;
        totalRewardsEarned[user] += COMMUNITY_HEALTH_REWARD;
        totalRewardsDistributed += COMMUNITY_HEALTH_REWARD;
        
        _transfer(rewardPool, user, COMMUNITY_HEALTH_REWARD);
        
        emit CommunityHealthAction(user, communityHealthActions[user], COMMUNITY_HEALTH_REWARD);
        emit RewardDistributed(user, COMMUNITY_HEALTH_REWARD, "Community Health Action");
    }
    
    /**
     * @dev Reward user for completing academy module
     * @param user Address of user
     * @param moduleId Academy module ID
     */
    function rewardAcademyModuleCompletion(address user, uint256 moduleId) 
        external 
        onlyRewarder 
        nonReentrant 
    {
        require(user != address(0), "Invalid user address");
        require(!academyModuleCompleted[user][moduleId], "Module already completed");
        
        academyModuleCompleted[user][moduleId] = true;
        
        uint256 moduleReward = HEALING_MEDITATION_REWARD; // Base academy reward
        totalRewardsEarned[user] += moduleReward;
        totalRewardsDistributed += moduleReward;
        
        _transfer(rewardPool, user, moduleReward);
        
        emit AcademyModuleCompleted(user, moduleId, moduleReward);
        emit RewardDistributed(user, moduleReward, "Academy Module");
    }
    
    // ============ VOTING FUNCTIONS ============
    
    /**
     * @dev Create a governance proposal
     * @param description Proposal description
     */
    function createProposal(string memory description) 
        external 
        whenVotingEnabled 
        returns (uint256) 
    {
        require(balanceOf(msg.sender) >= PROPOSAL_THRESHOLD, "Insufficient tokens to create proposal");
        require(bytes(description).length > 0, "Description cannot be empty");
        
        proposalCount++;
        Proposal storage proposal = proposals[proposalCount];
        proposal.id = proposalCount;
        proposal.proposer = msg.sender;
        proposal.description = description;
        proposal.startTime = block.timestamp;
        proposal.endTime = block.timestamp + VOTING_PERIOD;
        proposal.executed = false;
        proposal.passed = false;
        
        emit ProposalCreated(proposalCount, msg.sender, description);
        
        return proposalCount;
    }
    
    /**
     * @dev Cast vote on a proposal
     * @param proposalId Proposal ID
     * @param support True for yes, false for no
     */
    function vote(uint256 proposalId, bool support) 
        external 
        whenVotingEnabled 
        nonReentrant 
    {
        Proposal storage proposal = proposals[proposalId];
        require(proposalId > 0 && proposalId <= proposalCount, "Invalid proposal");
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting ended");
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        
        uint256 voteWeight = balanceOf(msg.sender);
        require(voteWeight > 0, "No voting power");
        
        proposal.hasVoted[msg.sender] = true;
        proposal.voteWeight[msg.sender] = voteWeight;
        
        if (support) {
            proposal.votesFor += voteWeight;
        } else {
            proposal.votesAgainst += voteWeight;
        }
        
        totalVotesCast[msg.sender]++;
        
        // Reward for voting participation
        totalRewardsEarned[msg.sender] += VOTING_REWARD;
        totalRewardsDistributed += VOTING_REWARD;
        _transfer(rewardPool, msg.sender, VOTING_REWARD);
        
        emit VoteCast(proposalId, msg.sender, support, voteWeight);
        emit RewardDistributed(msg.sender, VOTING_REWARD, "Voting Participation");
    }
    
    /**
     * @dev Execute a proposal after voting period
     * @param proposalId Proposal ID
     */
    function executeProposal(uint256 proposalId) external nonReentrant {
        Proposal storage proposal = proposals[proposalId];
        require(proposalId > 0 && proposalId <= proposalCount, "Invalid proposal");
        require(block.timestamp > proposal.endTime, "Voting still active");
        require(!proposal.executed, "Already executed");
        
        uint256 totalVotes = proposal.votesFor + proposal.votesAgainst;
        require(totalVotes >= QUORUM, "Quorum not reached");
        
        proposal.executed = true;
        proposal.passed = proposal.votesFor > proposal.votesAgainst;
        
        emit ProposalExecuted(proposalId, proposal.passed);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get proposal details
     * @param proposalId Proposal ID
     */
    function getProposal(uint256 proposalId) 
        external 
        view 
        returns (
            uint256 id,
            address proposer,
            string memory description,
            uint256 votesFor,
            uint256 votesAgainst,
            uint256 startTime,
            uint256 endTime,
            bool executed,
            bool passed
        ) 
    {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.id,
            proposal.proposer,
            proposal.description,
            proposal.votesFor,
            proposal.votesAgainst,
            proposal.startTime,
            proposal.endTime,
            proposal.executed,
            proposal.passed
        );
    }
    
    /**
     * @dev Check if user has voted on proposal
     * @param proposalId Proposal ID
     * @param user User address
     */
    function hasVoted(uint256 proposalId, address user) external view returns (bool) {
        return proposals[proposalId].hasVoted[user];
    }
    
    /**
     * @dev Get user's health statistics
     * @param user User address
     */
    function getUserHealthStats(address user) 
        external 
        view 
        returns (
            uint256 milestones,
            uint256 meditations,
            uint256 wellness,
            uint256 communityActions,
            uint256 totalRewards,
            uint256 votesCast
        ) 
    {
        return (
            healthMilestonesAchieved[user],
            healingMeditationsCompleted[user],
            wellnessPracticesCompleted[user],
            communityHealthActions[user],
            totalRewardsEarned[user],
            totalVotesCast[user]
        );
    }
    
    /**
     * @dev Get total number of health milestones
     */
    function getTotalHealthMilestones() external view returns (uint256) {
        return healthMilestones.length;
    }
    
    // ============ REQUIRED OVERRIDES ============
    
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Pausable)
    {
        super._update(from, to, value);
    }
}
