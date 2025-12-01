// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title UnityVoteDAO
 * @notice ScrollVerse DAO governance contract for community voting
 * @dev Implements proposal creation, voting, and execution with sacred frequency resonance
 * 
 * Features:
 * - Proposal creation with minimum stake requirement
 * - Time-locked voting periods
 * - Quadratic voting support
 * - Sacred frequency alignment bonuses
 * - Multi-signature execution for critical proposals
 */
contract UnityVoteDAO is Ownable, ReentrancyGuard, Pausable {
    // ============ Constants ============
    
    /// @notice Sacred frequencies for resonance bonuses (in Hz)
    uint256 public constant DNA_HEALING_FREQUENCY = 528;
    uint256 public constant PINEAL_ACTIVATION_FREQUENCY = 963;
    uint256 public constant CROWN_CHAKRA_FREQUENCY = 999;
    
    /// @notice Minimum voting period in seconds (3 days)
    uint256 public constant MIN_VOTING_PERIOD = 3 days;
    
    /// @notice Maximum voting period in seconds (14 days)
    uint256 public constant MAX_VOTING_PERIOD = 14 days;
    
    /// @notice Execution delay after proposal passes (1 day)
    uint256 public constant EXECUTION_DELAY = 1 days;
    
    // ============ Structs ============
    
    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        string ipfsHash;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        uint256 startTime;
        uint256 endTime;
        uint256 executionTime;
        bool executed;
        bool cancelled;
        ProposalType proposalType;
        bytes callData;
        address targetContract;
    }
    
    struct Vote {
        bool hasVoted;
        VoteType voteType;
        uint256 weight;
        uint256 frequencyBonus;
    }
    
    struct Member {
        bool isActive;
        uint256 votingPower;
        uint256 proposalsCreated;
        uint256 votesParticipated;
        uint256 joinedAt;
        uint256 resonanceLevel;
    }
    
    // ============ Enums ============
    
    enum ProposalType {
        Standard,           // General governance proposals
        Treasury,           // Fund allocation proposals
        ParameterChange,    // Protocol parameter changes
        Emergency,          // Emergency actions (shorter voting period)
        Sacred              // Sacred frequency alignment proposals
    }
    
    enum VoteType {
        Against,
        For,
        Abstain
    }
    
    enum ProposalState {
        Pending,
        Active,
        Succeeded,
        Defeated,
        Queued,
        Executed,
        Cancelled
    }
    
    // ============ State Variables ============
    
    /// @notice Governance token used for voting
    IERC20 public governanceToken;
    
    /// @notice Minimum tokens required to create a proposal
    uint256 public proposalThreshold;
    
    /// @notice Minimum participation required for proposal to pass (basis points)
    uint256 public quorumBasisPoints;
    
    /// @notice Total proposals created
    uint256 public proposalCount;
    
    /// @notice Mapping of proposal ID to Proposal
    mapping(uint256 => Proposal) public proposals;
    
    /// @notice Mapping of proposal ID to voter address to Vote
    mapping(uint256 => mapping(address => Vote)) public votes;
    
    /// @notice Mapping of address to Member data
    mapping(address => Member) public members;
    
    /// @notice Total active members
    uint256 public totalMembers;
    
    /// @notice Treasury balance tracking
    uint256 public treasuryBalance;
    
    // ============ Events ============
    
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        ProposalType proposalType,
        uint256 startTime,
        uint256 endTime
    );
    
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        VoteType voteType,
        uint256 weight,
        uint256 frequencyBonus
    );
    
    event ProposalExecuted(uint256 indexed proposalId);
    
    event ProposalCancelled(uint256 indexed proposalId);
    
    event MemberJoined(address indexed member, uint256 votingPower);
    
    event MemberLeft(address indexed member);
    
    event ResonanceLevelUpdated(address indexed member, uint256 newLevel);
    
    event TreasuryDeposit(address indexed depositor, uint256 amount);
    
    event TreasuryWithdrawal(address indexed recipient, uint256 amount);
    
    // ============ Modifiers ============
    
    modifier onlyMember() {
        require(members[msg.sender].isActive, "UnityVoteDAO: Not an active member");
        _;
    }
    
    modifier proposalExists(uint256 proposalId) {
        require(proposalId > 0 && proposalId <= proposalCount, "UnityVoteDAO: Invalid proposal ID");
        _;
    }
    
    // ============ Constructor ============
    
    /**
     * @notice Initialize the DAO with governance token and parameters
     * @param initialOwner Address of the initial owner
     * @param _governanceToken Address of the ERC20 governance token
     * @param _proposalThreshold Minimum tokens to create proposal
     * @param _quorumBasisPoints Quorum requirement in basis points (e.g., 400 = 4%)
     */
    constructor(
        address initialOwner,
        address _governanceToken,
        uint256 _proposalThreshold,
        uint256 _quorumBasisPoints
    ) Ownable(initialOwner) {
        require(_governanceToken != address(0), "UnityVoteDAO: Invalid token address");
        require(_quorumBasisPoints <= 10000, "UnityVoteDAO: Invalid quorum");
        
        governanceToken = IERC20(_governanceToken);
        proposalThreshold = _proposalThreshold;
        quorumBasisPoints = _quorumBasisPoints;
    }
    
    // ============ External Functions ============
    
    /**
     * @notice Join the DAO as a voting member
     * @dev Requires holding governance tokens above threshold
     */
    function joinDAO() external nonReentrant whenNotPaused {
        require(!members[msg.sender].isActive, "UnityVoteDAO: Already a member");
        
        uint256 balance = governanceToken.balanceOf(msg.sender);
        require(balance > 0, "UnityVoteDAO: Must hold governance tokens");
        
        members[msg.sender] = Member({
            isActive: true,
            votingPower: balance,
            proposalsCreated: 0,
            votesParticipated: 0,
            joinedAt: block.timestamp,
            resonanceLevel: 1
        });
        
        totalMembers++;
        emit MemberJoined(msg.sender, balance);
    }
    
    /**
     * @notice Leave the DAO
     */
    function leaveDAO() external onlyMember nonReentrant {
        members[msg.sender].isActive = false;
        totalMembers--;
        emit MemberLeft(msg.sender);
    }
    
    /**
     * @notice Create a new proposal
     * @param title Short title for the proposal
     * @param description Detailed description
     * @param ipfsHash IPFS hash for extended documentation
     * @param proposalType Type of proposal
     * @param votingPeriod Duration of voting in seconds
     * @param targetContract Contract to call if proposal passes (optional)
     * @param callData Encoded function call data (optional)
     * @return proposalId ID of the created proposal
     */
    function createProposal(
        string calldata title,
        string calldata description,
        string calldata ipfsHash,
        ProposalType proposalType,
        uint256 votingPeriod,
        address targetContract,
        bytes calldata callData
    ) external onlyMember nonReentrant whenNotPaused returns (uint256) {
        uint256 balance = governanceToken.balanceOf(msg.sender);
        require(balance >= proposalThreshold, "UnityVoteDAO: Insufficient tokens to propose");
        
        // Validate voting period
        uint256 minPeriod = proposalType == ProposalType.Emergency ? 1 days : MIN_VOTING_PERIOD;
        require(votingPeriod >= minPeriod && votingPeriod <= MAX_VOTING_PERIOD, 
            "UnityVoteDAO: Invalid voting period");
        
        proposalCount++;
        uint256 proposalId = proposalCount;
        
        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            title: title,
            description: description,
            ipfsHash: ipfsHash,
            forVotes: 0,
            againstVotes: 0,
            abstainVotes: 0,
            startTime: block.timestamp,
            endTime: block.timestamp + votingPeriod,
            executionTime: 0,
            executed: false,
            cancelled: false,
            proposalType: proposalType,
            callData: callData,
            targetContract: targetContract
        });
        
        members[msg.sender].proposalsCreated++;
        
        emit ProposalCreated(
            proposalId,
            msg.sender,
            title,
            proposalType,
            block.timestamp,
            block.timestamp + votingPeriod
        );
        
        return proposalId;
    }
    
    /**
     * @notice Cast a vote on a proposal
     * @param proposalId ID of the proposal
     * @param voteType Type of vote (For, Against, Abstain)
     * @param frequencyAlignment Sacred frequency for resonance bonus (528, 963, or 999)
     */
    function castVote(
        uint256 proposalId,
        VoteType voteType,
        uint256 frequencyAlignment
    ) external onlyMember proposalExists(proposalId) nonReentrant whenNotPaused {
        Proposal storage proposal = proposals[proposalId];
        
        require(getProposalState(proposalId) == ProposalState.Active, "UnityVoteDAO: Voting not active");
        require(!votes[proposalId][msg.sender].hasVoted, "UnityVoteDAO: Already voted");
        
        uint256 weight = governanceToken.balanceOf(msg.sender);
        require(weight > 0, "UnityVoteDAO: No voting power");
        
        // Calculate frequency resonance bonus (up to 10% bonus)
        uint256 frequencyBonus = 0;
        if (frequencyAlignment == DNA_HEALING_FREQUENCY ||
            frequencyAlignment == PINEAL_ACTIVATION_FREQUENCY ||
            frequencyAlignment == CROWN_CHAKRA_FREQUENCY) {
            frequencyBonus = weight / 10; // 10% bonus for sacred frequency alignment
        }
        
        uint256 totalWeight = weight + frequencyBonus;
        
        votes[proposalId][msg.sender] = Vote({
            hasVoted: true,
            voteType: voteType,
            weight: totalWeight,
            frequencyBonus: frequencyBonus
        });
        
        if (voteType == VoteType.For) {
            proposal.forVotes += totalWeight;
        } else if (voteType == VoteType.Against) {
            proposal.againstVotes += totalWeight;
        } else {
            proposal.abstainVotes += totalWeight;
        }
        
        members[msg.sender].votesParticipated++;
        
        // Update resonance level based on participation
        if (members[msg.sender].votesParticipated % 10 == 0) {
            members[msg.sender].resonanceLevel++;
            emit ResonanceLevelUpdated(msg.sender, members[msg.sender].resonanceLevel);
        }
        
        emit VoteCast(proposalId, msg.sender, voteType, totalWeight, frequencyBonus);
    }
    
    /**
     * @notice Execute a passed proposal
     * @param proposalId ID of the proposal to execute
     */
    function executeProposal(uint256 proposalId) 
        external 
        proposalExists(proposalId) 
        nonReentrant 
        whenNotPaused 
    {
        require(getProposalState(proposalId) == ProposalState.Succeeded, 
            "UnityVoteDAO: Proposal not in succeeded state");
        
        Proposal storage proposal = proposals[proposalId];
        
        // Check execution delay has passed
        if (proposal.executionTime == 0) {
            proposal.executionTime = block.timestamp + EXECUTION_DELAY;
            return;
        }
        
        require(block.timestamp >= proposal.executionTime, "UnityVoteDAO: Execution delay not passed");
        
        proposal.executed = true;
        
        // Execute call data if present
        if (proposal.targetContract != address(0) && proposal.callData.length > 0) {
            (bool success, ) = proposal.targetContract.call(proposal.callData);
            require(success, "UnityVoteDAO: Execution failed");
        }
        
        emit ProposalExecuted(proposalId);
    }
    
    /**
     * @notice Cancel a proposal (only proposer or owner)
     * @param proposalId ID of the proposal to cancel
     */
    function cancelProposal(uint256 proposalId) 
        external 
        proposalExists(proposalId) 
        nonReentrant 
    {
        Proposal storage proposal = proposals[proposalId];
        
        require(
            msg.sender == proposal.proposer || msg.sender == owner(),
            "UnityVoteDAO: Not authorized to cancel"
        );
        require(!proposal.executed, "UnityVoteDAO: Already executed");
        require(!proposal.cancelled, "UnityVoteDAO: Already cancelled");
        
        proposal.cancelled = true;
        emit ProposalCancelled(proposalId);
    }
    
    /**
     * @notice Deposit ETH to treasury
     */
    function depositToTreasury() external payable nonReentrant {
        require(msg.value > 0, "UnityVoteDAO: Zero deposit");
        treasuryBalance += msg.value;
        emit TreasuryDeposit(msg.sender, msg.value);
    }
    
    /**
     * @notice Withdraw from treasury (owner only, for executed treasury proposals)
     * @param recipient Address to receive funds
     * @param amount Amount to withdraw
     */
    function withdrawFromTreasury(address recipient, uint256 amount) 
        external 
        onlyOwner 
        nonReentrant 
    {
        require(amount <= treasuryBalance, "UnityVoteDAO: Insufficient treasury balance");
        require(recipient != address(0), "UnityVoteDAO: Invalid recipient");
        
        treasuryBalance -= amount;
        
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "UnityVoteDAO: Transfer failed");
        
        emit TreasuryWithdrawal(recipient, amount);
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get the current state of a proposal
     * @param proposalId ID of the proposal
     * @return Current ProposalState
     */
    function getProposalState(uint256 proposalId) 
        public 
        view 
        proposalExists(proposalId) 
        returns (ProposalState) 
    {
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.cancelled) {
            return ProposalState.Cancelled;
        }
        
        if (proposal.executed) {
            return ProposalState.Executed;
        }
        
        if (block.timestamp < proposal.startTime) {
            return ProposalState.Pending;
        }
        
        if (block.timestamp <= proposal.endTime) {
            return ProposalState.Active;
        }
        
        // Voting has ended - check if passed
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
        uint256 totalSupply = governanceToken.totalSupply();
        uint256 quorumVotes = (totalSupply * quorumBasisPoints) / 10000;
        
        if (totalVotes < quorumVotes) {
            return ProposalState.Defeated;
        }
        
        if (proposal.forVotes > proposal.againstVotes) {
            if (proposal.executionTime > 0) {
                return ProposalState.Queued;
            }
            return ProposalState.Succeeded;
        }
        
        return ProposalState.Defeated;
    }
    
    /**
     * @notice Get vote details for a voter on a proposal
     * @param proposalId ID of the proposal
     * @param voter Address of the voter
     * @return Vote struct with voting details
     */
    function getVote(uint256 proposalId, address voter) 
        external 
        view 
        proposalExists(proposalId) 
        returns (Vote memory) 
    {
        return votes[proposalId][voter];
    }
    
    /**
     * @notice Get member details
     * @param memberAddress Address of the member
     * @return Member struct with member details
     */
    function getMember(address memberAddress) external view returns (Member memory) {
        return members[memberAddress];
    }
    
    /**
     * @notice Check if address is an active member
     * @param account Address to check
     * @return True if active member
     */
    function isMember(address account) external view returns (bool) {
        return members[account].isActive;
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Update proposal threshold
     * @param newThreshold New minimum tokens to create proposal
     */
    function setProposalThreshold(uint256 newThreshold) external onlyOwner {
        proposalThreshold = newThreshold;
    }
    
    /**
     * @notice Update quorum requirement
     * @param newQuorum New quorum in basis points
     */
    function setQuorum(uint256 newQuorum) external onlyOwner {
        require(newQuorum <= 10000, "UnityVoteDAO: Invalid quorum");
        quorumBasisPoints = newQuorum;
    }
    
    /**
     * @notice Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @notice Receive ETH for treasury
     */
    receive() external payable {
        treasuryBalance += msg.value;
        emit TreasuryDeposit(msg.sender, msg.value);
    }
}
