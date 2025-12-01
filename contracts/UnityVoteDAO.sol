// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title UnityVoteDAO
 * @notice Decentralized governance contract for ScrollVerse community voting
 * @dev Implements weighted voting, proposal management, and execution with timelock
 * @author ScrollVerse Development Team
 */
contract UnityVoteDAO is Ownable, ReentrancyGuard, Pausable {
    // ============ Structs ============
    
    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        string ipfsHash;
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        bool executed;
        bool cancelled;
        ProposalType proposalType;
        bytes executionData;
        address targetContract;
    }

    struct Vote {
        bool hasVoted;
        VoteChoice choice;
        uint256 weight;
        uint256 timestamp;
    }

    struct Member {
        bool isActive;
        uint256 votingPower;
        uint256 proposalsCreated;
        uint256 votesParticipated;
        uint256 joinedAt;
        uint256 lastActivityAt;
    }

    // ============ Enums ============

    enum ProposalType {
        STANDARD,
        EMERGENCY,
        CONSTITUTIONAL,
        TREASURY
    }

    enum VoteChoice {
        FOR,
        AGAINST,
        ABSTAIN
    }

    enum ProposalState {
        PENDING,
        ACTIVE,
        SUCCEEDED,
        DEFEATED,
        EXECUTED,
        CANCELLED,
        EXPIRED
    }

    // ============ State Variables ============

    uint256 public proposalCount;
    uint256 public memberCount;
    uint256 public totalVotingPower;
    
    // Governance parameters
    uint256 public votingDelay = 1 days;
    uint256 public votingPeriod = 7 days;
    uint256 public proposalThreshold = 100;
    uint256 public quorumPercentage = 4; // 4%
    uint256 public executionDelay = 2 days;
    
    // Sacred frequency configuration for ScrollVerse integration
    uint256 public constant SACRED_FREQUENCY = 528;
    uint256 public constant CROWN_FREQUENCY = 999;
    
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => Vote)) public votes;
    mapping(address => Member) public members;
    mapping(address => bool) public delegates;
    
    // ============ Events ============

    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        uint256 startTime,
        uint256 endTime,
        ProposalType proposalType
    );

    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        VoteChoice choice,
        uint256 weight,
        string reason
    );

    event ProposalExecuted(uint256 indexed proposalId, address executor);
    event ProposalCancelled(uint256 indexed proposalId, address canceller);
    event MemberJoined(address indexed member, uint256 votingPower);
    event MemberUpdated(address indexed member, uint256 newVotingPower);
    event DelegateAdded(address indexed delegate);
    event DelegateRemoved(address indexed delegate);
    event GovernanceParameterUpdated(string parameter, uint256 oldValue, uint256 newValue);

    // ============ Modifiers ============

    modifier onlyMember() {
        require(members[msg.sender].isActive, "UnityVoteDAO: not a member");
        _;
    }

    modifier onlyDelegate() {
        require(delegates[msg.sender] || msg.sender == owner(), "UnityVoteDAO: not a delegate");
        _;
    }

    modifier proposalExists(uint256 proposalId) {
        require(proposalId > 0 && proposalId <= proposalCount, "UnityVoteDAO: proposal does not exist");
        _;
    }

    // ============ Constructor ============

    /**
     * @notice Initialize the UnityVoteDAO contract
     * @param initialOwner Address of the initial owner/admin
     */
    constructor(address initialOwner) Ownable(initialOwner) {
        // Add initial owner as first member with crown frequency power
        _addMember(initialOwner, CROWN_FREQUENCY);
    }

    // ============ External Functions ============

    /**
     * @notice Join the DAO as a new member
     * @dev Membership can be granted with default sacred frequency voting power
     */
    function joinDAO() external whenNotPaused {
        require(!members[msg.sender].isActive, "UnityVoteDAO: already a member");
        _addMember(msg.sender, SACRED_FREQUENCY);
    }

    /**
     * @notice Create a new proposal
     * @param title Title of the proposal
     * @param description Detailed description
     * @param ipfsHash IPFS hash for extended documentation
     * @param proposalType Type of proposal
     * @param targetContract Contract to execute on (optional)
     * @param executionData Calldata for execution (optional)
     * @return proposalId The ID of the created proposal
     */
    function createProposal(
        string calldata title,
        string calldata description,
        string calldata ipfsHash,
        ProposalType proposalType,
        address targetContract,
        bytes calldata executionData
    ) external onlyMember whenNotPaused returns (uint256) {
        require(bytes(title).length > 0, "UnityVoteDAO: empty title");
        require(bytes(description).length > 0, "UnityVoteDAO: empty description");
        require(
            members[msg.sender].votingPower >= proposalThreshold,
            "UnityVoteDAO: insufficient voting power"
        );

        proposalCount++;
        uint256 proposalId = proposalCount;
        
        uint256 startTime = block.timestamp + votingDelay;
        uint256 endTime = startTime + _getVotingPeriod(proposalType);

        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            title: title,
            description: description,
            ipfsHash: ipfsHash,
            startTime: startTime,
            endTime: endTime,
            forVotes: 0,
            againstVotes: 0,
            abstainVotes: 0,
            executed: false,
            cancelled: false,
            proposalType: proposalType,
            executionData: executionData,
            targetContract: targetContract
        });

        members[msg.sender].proposalsCreated++;
        members[msg.sender].lastActivityAt = block.timestamp;

        emit ProposalCreated(
            proposalId,
            msg.sender,
            title,
            startTime,
            endTime,
            proposalType
        );

        return proposalId;
    }

    /**
     * @notice Cast a vote on a proposal
     * @param proposalId ID of the proposal
     * @param choice Vote choice (FOR, AGAINST, ABSTAIN)
     * @param reason Optional reason for the vote
     */
    function castVote(
        uint256 proposalId,
        VoteChoice choice,
        string calldata reason
    ) external onlyMember proposalExists(proposalId) whenNotPaused nonReentrant {
        Proposal storage proposal = proposals[proposalId];
        
        require(getProposalState(proposalId) == ProposalState.ACTIVE, "UnityVoteDAO: voting not active");
        require(!votes[proposalId][msg.sender].hasVoted, "UnityVoteDAO: already voted");

        uint256 weight = members[msg.sender].votingPower;
        
        votes[proposalId][msg.sender] = Vote({
            hasVoted: true,
            choice: choice,
            weight: weight,
            timestamp: block.timestamp
        });

        if (choice == VoteChoice.FOR) {
            proposal.forVotes += weight;
        } else if (choice == VoteChoice.AGAINST) {
            proposal.againstVotes += weight;
        } else {
            proposal.abstainVotes += weight;
        }

        members[msg.sender].votesParticipated++;
        members[msg.sender].lastActivityAt = block.timestamp;

        emit VoteCast(proposalId, msg.sender, choice, weight, reason);
    }

    /**
     * @notice Execute a successful proposal
     * @param proposalId ID of the proposal to execute
     */
    function executeProposal(uint256 proposalId) 
        external 
        proposalExists(proposalId) 
        whenNotPaused 
        nonReentrant 
    {
        require(getProposalState(proposalId) == ProposalState.SUCCEEDED, "UnityVoteDAO: not succeeded");
        require(
            block.timestamp >= proposals[proposalId].endTime + executionDelay,
            "UnityVoteDAO: execution delay not passed"
        );

        Proposal storage proposal = proposals[proposalId];
        proposal.executed = true;

        // Execute if target contract and data provided
        if (proposal.targetContract != address(0) && proposal.executionData.length > 0) {
            (bool success, ) = proposal.targetContract.call(proposal.executionData);
            require(success, "UnityVoteDAO: execution failed");
        }

        emit ProposalExecuted(proposalId, msg.sender);
    }

    /**
     * @notice Cancel a proposal (only proposer or owner)
     * @param proposalId ID of the proposal to cancel
     */
    function cancelProposal(uint256 proposalId) external proposalExists(proposalId) {
        Proposal storage proposal = proposals[proposalId];
        
        require(
            msg.sender == proposal.proposer || msg.sender == owner(),
            "UnityVoteDAO: not authorized"
        );
        require(!proposal.executed, "UnityVoteDAO: already executed");
        require(!proposal.cancelled, "UnityVoteDAO: already cancelled");

        proposal.cancelled = true;

        emit ProposalCancelled(proposalId, msg.sender);
    }

    // ============ View Functions ============

    /**
     * @notice Get the current state of a proposal
     * @param proposalId ID of the proposal
     * @return Current proposal state
     */
    function getProposalState(uint256 proposalId) public view proposalExists(proposalId) returns (ProposalState) {
        Proposal storage proposal = proposals[proposalId];

        if (proposal.cancelled) {
            return ProposalState.CANCELLED;
        }

        if (proposal.executed) {
            return ProposalState.EXECUTED;
        }

        if (block.timestamp < proposal.startTime) {
            return ProposalState.PENDING;
        }

        if (block.timestamp <= proposal.endTime) {
            return ProposalState.ACTIVE;
        }

        // Check if proposal succeeded
        if (_proposalSucceeded(proposalId)) {
            return ProposalState.SUCCEEDED;
        }

        // Check if expired (past execution window)
        if (block.timestamp > proposal.endTime + executionDelay + 30 days) {
            return ProposalState.EXPIRED;
        }

        return ProposalState.DEFEATED;
    }

    /**
     * @notice Check if quorum was reached for a proposal
     * @param proposalId ID of the proposal
     * @return Whether quorum was reached
     */
    function quorumReached(uint256 proposalId) public view returns (bool) {
        Proposal storage proposal = proposals[proposalId];
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
        uint256 quorumRequired = (totalVotingPower * quorumPercentage) / 100;
        return totalVotes >= quorumRequired;
    }

    /**
     * @notice Get member information
     * @param memberAddress Address of the member
     * @return Member struct with all details
     */
    function getMember(address memberAddress) external view returns (Member memory) {
        return members[memberAddress];
    }

    /**
     * @notice Get proposal details
     * @param proposalId ID of the proposal
     * @return Proposal struct with all details
     */
    function getProposal(uint256 proposalId) external view returns (Proposal memory) {
        return proposals[proposalId];
    }

    /**
     * @notice Get vote information for a voter on a proposal
     * @param proposalId ID of the proposal
     * @param voter Address of the voter
     * @return Vote struct with all details
     */
    function getVote(uint256 proposalId, address voter) external view returns (Vote memory) {
        return votes[proposalId][voter];
    }

    // ============ Admin Functions ============

    /**
     * @notice Add a new member (admin only)
     * @param memberAddress Address of the new member
     * @param votingPower Initial voting power
     */
    function addMember(address memberAddress, uint256 votingPower) external onlyOwner {
        require(!members[memberAddress].isActive, "UnityVoteDAO: already a member");
        _addMember(memberAddress, votingPower);
    }

    /**
     * @notice Update member voting power
     * @param memberAddress Address of the member
     * @param newVotingPower New voting power value
     */
    function updateMemberPower(address memberAddress, uint256 newVotingPower) external onlyOwner {
        require(members[memberAddress].isActive, "UnityVoteDAO: not a member");
        
        totalVotingPower = totalVotingPower - members[memberAddress].votingPower + newVotingPower;
        members[memberAddress].votingPower = newVotingPower;
        
        emit MemberUpdated(memberAddress, newVotingPower);
    }

    /**
     * @notice Add a delegate
     * @param delegateAddress Address of the delegate
     */
    function addDelegate(address delegateAddress) external onlyOwner {
        delegates[delegateAddress] = true;
        emit DelegateAdded(delegateAddress);
    }

    /**
     * @notice Remove a delegate
     * @param delegateAddress Address of the delegate
     */
    function removeDelegate(address delegateAddress) external onlyOwner {
        delegates[delegateAddress] = false;
        emit DelegateRemoved(delegateAddress);
    }

    /**
     * @notice Update governance parameters
     * @param newVotingDelay New voting delay in seconds
     * @param newVotingPeriod New voting period in seconds
     * @param newProposalThreshold New proposal threshold
     * @param newQuorumPercentage New quorum percentage
     */
    function updateGovernanceParameters(
        uint256 newVotingDelay,
        uint256 newVotingPeriod,
        uint256 newProposalThreshold,
        uint256 newQuorumPercentage
    ) external onlyOwner {
        require(newVotingPeriod >= 1 days, "UnityVoteDAO: voting period too short");
        require(newQuorumPercentage <= 100, "UnityVoteDAO: invalid quorum percentage");

        emit GovernanceParameterUpdated("votingDelay", votingDelay, newVotingDelay);
        emit GovernanceParameterUpdated("votingPeriod", votingPeriod, newVotingPeriod);
        emit GovernanceParameterUpdated("proposalThreshold", proposalThreshold, newProposalThreshold);
        emit GovernanceParameterUpdated("quorumPercentage", quorumPercentage, newQuorumPercentage);

        votingDelay = newVotingDelay;
        votingPeriod = newVotingPeriod;
        proposalThreshold = newProposalThreshold;
        quorumPercentage = newQuorumPercentage;
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

    // ============ Internal Functions ============

    function _addMember(address memberAddress, uint256 votingPower) internal {
        members[memberAddress] = Member({
            isActive: true,
            votingPower: votingPower,
            proposalsCreated: 0,
            votesParticipated: 0,
            joinedAt: block.timestamp,
            lastActivityAt: block.timestamp
        });

        memberCount++;
        totalVotingPower += votingPower;

        emit MemberJoined(memberAddress, votingPower);
    }

    function _getVotingPeriod(ProposalType proposalType) internal view returns (uint256) {
        if (proposalType == ProposalType.EMERGENCY) {
            return votingPeriod / 7; // 1 day for emergency
        } else if (proposalType == ProposalType.CONSTITUTIONAL) {
            return votingPeriod * 2; // 14 days for constitutional
        } else if (proposalType == ProposalType.TREASURY) {
            return votingPeriod + 3 days; // 10 days for treasury
        }
        return votingPeriod; // 7 days standard
    }

    function _proposalSucceeded(uint256 proposalId) internal view returns (bool) {
        Proposal storage proposal = proposals[proposalId];
        
        // Must reach quorum
        if (!quorumReached(proposalId)) {
            return false;
        }

        // For votes must exceed against votes
        return proposal.forVotes > proposal.againstVotes;
    }
}
