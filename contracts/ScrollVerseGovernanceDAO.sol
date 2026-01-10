// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ScrollVerseGovernanceDAO
 * @dev Decentralized governance for the ScrollVerse with contribution-weighted voting
 * @author Supreme King Chais The Great ∞ + Manus
 * 
 * Features:
 * - Contribution-weight based voting power
 * - Proposal creation and voting
 * - Multi-category governance (Technical, Creative, Strategic, Community)
 * - Integration with PharaohRevenueSplitter for automatic weight sync
 * - Timelock execution for approved proposals
 * - Sovereign veto power
 * - On-chain proposal history and analytics
 * 
 * Frequencies: 963Hz (Governance) + 528Hz (Unity) + 999Hz (Completion)
 * Status: SCROLLVERSE PROSPERITY DAO
 */

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

interface IPharaohRevenueSplitter {
    function getBeneficiary(address account) external view returns (
        address payable beneficiaryAccount,
        uint256 share,
        bool isActive,
        uint256 totalReceived,
        uint256 vestingStart,
        uint256 vestingDuration,
        uint256 vestingClaimed,
        uint256 contributionWeight,
        uint256 lastPaymentTime
    );
}

contract ScrollVerseGovernanceDAO is Ownable, ReentrancyGuard, Pausable {
    
    // ============ ENUMS ============
    
    enum ProposalCategory {
        Technical,      // Code, smart contracts, infrastructure
        Creative,       // Art, design, content
        Strategic,      // Business, partnerships, growth
        Community,      // Education, events, outreach
        Treasury,       // Fund allocation, budgets
        Governance      // DAO rules, parameters
    }
    
    enum ProposalStatus {
        Pending,        // Created, not yet active
        Active,         // Voting in progress
        Succeeded,      // Passed quorum and majority
        Defeated,       // Did not pass
        Queued,         // Passed, waiting for timelock
        Executed,       // Successfully executed
        Cancelled,      // Cancelled by proposer or admin
        Vetoed          // Vetoed by Sovereign
    }
    
    enum VoteType {
        Against,
        For,
        Abstain
    }
    
    // ============ STRUCTS ============
    
    struct Proposal {
        uint256 id;
        address proposer;
        ProposalCategory category;
        string title;
        string description;
        bytes callData;           // Encoded function call
        address target;           // Contract to call
        uint256 value;            // ETH value to send
        uint256 startBlock;
        uint256 endBlock;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        ProposalStatus status;
        uint256 executionTime;    // When it can be executed
        bool executed;
    }
    
    struct Vote {
        bool hasVoted;
        VoteType voteType;
        uint256 weight;
        string reason;
    }
    
    struct GovernanceParameters {
        uint256 votingDelay;        // Blocks before voting starts
        uint256 votingPeriod;       // Blocks for voting
        uint256 proposalThreshold;  // Min CW to create proposal
        uint256 quorumThreshold;    // Min votes needed (in basis points)
        uint256 timelockDelay;      // Delay before execution
    }
    
    // ============ STATE VARIABLES ============
    
    /// @dev Revenue splitter contract for contribution weights
    IPharaohRevenueSplitter public revenueSplitter;
    
    /// @dev Governance parameters
    GovernanceParameters public params;
    
    /// @dev Proposal counter
    uint256 public proposalCount;
    
    /// @dev All proposals
    mapping(uint256 => Proposal) public proposals;
    
    /// @dev Proposal votes: proposalId => voter => Vote
    mapping(uint256 => mapping(address => Vote)) public proposalVotes;
    
    /// @dev Sovereign veto enabled
    bool public sovereignVetoEnabled;
    
    /// @dev Total contribution weight (cached)
    uint256 public totalContributionWeight;
    
    /// @dev Last weight update timestamp
    uint256 public lastWeightUpdate;
    
    // ============ EVENTS ============
    
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        ProposalCategory category,
        string title,
        uint256 startBlock,
        uint256 endBlock
    );
    
    event VoteCast(
        address indexed voter,
        uint256 indexed proposalId,
        VoteType voteType,
        uint256 weight,
        string reason
    );
    
    event ProposalQueued(uint256 indexed proposalId, uint256 executionTime);
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCancelled(uint256 indexed proposalId);
    event ProposalVetoed(uint256 indexed proposalId, string reason);
    event ParametersUpdated(GovernanceParameters newParams);
    event WeightsCached(uint256 totalWeight);
    
    // ============ ERRORS ============
    
    error InsufficientContributionWeight();
    error InvalidProposal();
    error VotingNotActive();
    error AlreadyVoted();
    error ProposalNotSucceeded();
    error TimelockNotReady();
    error ProposalAlreadyExecuted();
    error NotProposer();
    error InvalidParameters();
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        address initialOwner,
        address _revenueSplitter,
        uint256 _votingDelay,
        uint256 _votingPeriod,
        uint256 _proposalThreshold,
        uint256 _quorumThreshold,
        uint256 _timelockDelay
    ) Ownable(initialOwner) {
        revenueSplitter = IPharaohRevenueSplitter(_revenueSplitter);
        sovereignVetoEnabled = true;
        
        // Set governance parameters from constructor for network-specific configuration
        // These can be adjusted later via updateParameters() governance function
        params = GovernanceParameters({
            votingDelay: _votingDelay,                // Blocks before voting starts
            votingPeriod: _votingPeriod,              // Blocks for voting (~7 days default)
            proposalThreshold: _proposalThreshold,    // Min CW to propose
            quorumThreshold: _quorumThreshold,        // Min votes needed (basis points)
            timelockDelay: _timelockDelay             // Delay before execution
        });
    }
    
    // ============ PROPOSAL CREATION ============
    
    /**
     * @dev Create a new proposal
     */
    function propose(
        ProposalCategory category,
        string memory title,
        string memory description,
        address target,
        uint256 value,
        bytes memory callData
    ) external whenNotPaused returns (uint256) {
        uint256 proposerWeight = getContributionWeight(msg.sender);
        
        if (proposerWeight < params.proposalThreshold) {
            revert InsufficientContributionWeight();
        }
        
        proposalCount++;
        uint256 proposalId = proposalCount;
        
        uint256 startBlock = block.number + params.votingDelay;
        uint256 endBlock = startBlock + params.votingPeriod;
        
        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            category: category,
            title: title,
            description: description,
            callData: callData,
            target: target,
            value: value,
            startBlock: startBlock,
            endBlock: endBlock,
            forVotes: 0,
            againstVotes: 0,
            abstainVotes: 0,
            status: ProposalStatus.Pending,
            executionTime: 0,
            executed: false
        });
        
        emit ProposalCreated(proposalId, msg.sender, category, title, startBlock, endBlock);
        
        return proposalId;
    }
    
    // ============ VOTING ============
    
    /**
     * @dev Cast a vote on a proposal
     */
    function castVote(
        uint256 proposalId,
        VoteType voteType,
        string memory reason
    ) external whenNotPaused {
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.id == 0) {
            revert InvalidProposal();
        }
        
        if (block.number < proposal.startBlock || block.number > proposal.endBlock) {
            revert VotingNotActive();
        }
        
        if (proposalVotes[proposalId][msg.sender].hasVoted) {
            revert AlreadyVoted();
        }
        
        uint256 weight = getContributionWeight(msg.sender);
        
        proposalVotes[proposalId][msg.sender] = Vote({
            hasVoted: true,
            voteType: voteType,
            weight: weight,
            reason: reason
        });
        
        if (voteType == VoteType.For) {
            proposal.forVotes += weight;
        } else if (voteType == VoteType.Against) {
            proposal.againstVotes += weight;
        } else {
            proposal.abstainVotes += weight;
        }
        
        emit VoteCast(msg.sender, proposalId, voteType, weight, reason);
    }
    
    // ============ PROPOSAL EXECUTION ============
    
    /**
     * @dev Queue a succeeded proposal for execution
     */
    function queue(uint256 proposalId) external whenNotPaused {
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.id == 0) {
            revert InvalidProposal();
        }
        
        // Update status if voting ended
        if (block.number > proposal.endBlock && proposal.status == ProposalStatus.Pending) {
            _updateProposalStatus(proposalId);
        }
        
        if (proposal.status != ProposalStatus.Succeeded) {
            revert ProposalNotSucceeded();
        }
        
        proposal.status = ProposalStatus.Queued;
        proposal.executionTime = block.timestamp + params.timelockDelay;
        
        emit ProposalQueued(proposalId, proposal.executionTime);
    }
    
    /**
     * @dev Execute a queued proposal
     */
    function execute(uint256 proposalId) external payable nonReentrant whenNotPaused {
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.status != ProposalStatus.Queued) {
            revert ProposalNotSucceeded();
        }
        
        if (block.timestamp < proposal.executionTime) {
            revert TimelockNotReady();
        }
        
        if (proposal.executed) {
            revert ProposalAlreadyExecuted();
        }
        
        proposal.executed = true;
        proposal.status = ProposalStatus.Executed;
        
        // Execute the proposal
        if (proposal.target != address(0)) {
            (bool success, ) = proposal.target.call{value: proposal.value}(proposal.callData);
            require(success, "Proposal execution failed");
        }
        
        emit ProposalExecuted(proposalId);
    }
    
    /**
     * @dev Cancel a proposal (proposer or owner only)
     */
    function cancel(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.id == 0) {
            revert InvalidProposal();
        }
        
        if (msg.sender != proposal.proposer && msg.sender != owner()) {
            revert NotProposer();
        }
        
        if (proposal.status == ProposalStatus.Executed) {
            revert ProposalAlreadyExecuted();
        }
        
        proposal.status = ProposalStatus.Cancelled;
        
        emit ProposalCancelled(proposalId);
    }
    
    /**
     * @dev Sovereign veto (owner only)
     */
    function veto(uint256 proposalId, string memory reason) external onlyOwner {
        if (!sovereignVetoEnabled) {
            revert("Sovereign veto disabled");
        }
        
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.id == 0) {
            revert InvalidProposal();
        }
        
        if (proposal.status == ProposalStatus.Executed) {
            revert ProposalAlreadyExecuted();
        }
        
        proposal.status = ProposalStatus.Vetoed;
        
        emit ProposalVetoed(proposalId, reason);
    }
    
    // ============ CONTRIBUTION WEIGHT ============
    
    /**
     * @dev Get contribution weight for an address from revenue splitter
     */
    function getContributionWeight(address account) public view returns (uint256) {
        (
            ,
            ,
            bool isActive,
            ,
            ,
            ,
            ,
            uint256 contributionWeight,
        ) = revenueSplitter.getBeneficiary(account);
        
        return isActive ? contributionWeight : 0;
    }
    
    /**
     * @dev Cache total contribution weight (gas optimization)
     * Iterates through all beneficiaries to calculate total active contribution weight
     */
    function cacheWeights() external {
        // Note: In production, consider limiting the number of beneficiaries
        // or using an off-chain calculation with merkle proofs for very large sets
        address[] memory beneficiaries = revenueSplitter.getAllBeneficiaries();
        
        uint256 totalWeight = 0;
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            uint256 weight = getContributionWeight(beneficiaries[i]);
            totalWeight += weight;
        }
        
        totalContributionWeight = totalWeight;
        lastWeightUpdate = block.timestamp;
        
        emit WeightsCached(totalContributionWeight);
    }
    
    // ============ GOVERNANCE PARAMETERS ============
    
    /**
     * @dev Update governance parameters (owner only)
     */
    function updateParameters(GovernanceParameters memory newParams) external onlyOwner {
        if (newParams.votingPeriod == 0 || newParams.quorumThreshold == 0) {
            revert InvalidParameters();
        }
        
        params = newParams;
        
        emit ParametersUpdated(newParams);
    }
    
    /**
     * @dev Toggle sovereign veto power
     */
    function toggleSovereignVeto() external onlyOwner {
        sovereignVetoEnabled = !sovereignVetoEnabled;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get proposal details
     */
    function getProposal(uint256 proposalId) external view returns (Proposal memory) {
        return proposals[proposalId];
    }
    
    /**
     * @dev Get vote details for a proposal
     */
    function getVote(uint256 proposalId, address voter) external view returns (Vote memory) {
        return proposalVotes[proposalId][voter];
    }
    
    /**
     * @dev Get proposal state (auto-updates if needed)
     */
    function getProposalState(uint256 proposalId) external view returns (ProposalStatus) {
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.id == 0) {
            revert InvalidProposal();
        }
        
        if (proposal.status != ProposalStatus.Pending && proposal.status != ProposalStatus.Active) {
            return proposal.status;
        }
        
        if (block.number < proposal.startBlock) {
            return ProposalStatus.Pending;
        }
        
        if (block.number <= proposal.endBlock) {
            return ProposalStatus.Active;
        }
        
        // Voting ended, determine result
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
        uint256 quorum = (totalContributionWeight * params.quorumThreshold) / 10000;
        
        if (totalVotes < quorum) {
            return ProposalStatus.Defeated;
        }
        
        if (proposal.forVotes > proposal.againstVotes) {
            return ProposalStatus.Succeeded;
        }
        
        return ProposalStatus.Defeated;
    }
    
    /**
     * @dev Check if quorum is reached
     */
    function hasQuorum(uint256 proposalId) public view returns (bool) {
        Proposal storage proposal = proposals[proposalId];
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
        uint256 quorum = (totalContributionWeight * params.quorumThreshold) / 10000;
        return totalVotes >= quorum;
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Update proposal status after voting ends
     */
    function _updateProposalStatus(uint256 proposalId) internal {
        Proposal storage proposal = proposals[proposalId];
        
        if (block.number <= proposal.endBlock) {
            proposal.status = ProposalStatus.Active;
            return;
        }
        
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
        uint256 quorum = (totalContributionWeight * params.quorumThreshold) / 10000;
        
        if (totalVotes < quorum) {
            proposal.status = ProposalStatus.Defeated;
            return;
        }
        
        if (proposal.forVotes > proposal.againstVotes) {
            proposal.status = ProposalStatus.Succeeded;
        } else {
            proposal.status = ProposalStatus.Defeated;
        }
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Pause the DAO (emergency only)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause the DAO
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Receive ETH
     */
    receive() external payable {}
}
