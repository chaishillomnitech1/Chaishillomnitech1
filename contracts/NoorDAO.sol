// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title NoorDAO
 * @notice Decentralized governance for Noor Nodes ecosystem
 * @dev Community-driven governance with proposal and voting mechanisms
 * 
 * BISMILLAH - Aligned with ScrollVerse ethos and ethical safeguards
 * 
 * Frequency: 999Hz (Crown Chakra) - Divine Governance Alignment
 */
contract NoorDAO is AccessControl, ReentrancyGuard, Pausable {
    
    // ============ Role Definitions ============
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    bytes32 public constant VOTER_ROLE = keccak256("VOTER_ROLE");
    
    // ============ Proposal Types ============
    enum ProposalType {
        PARAMETER_CHANGE,
        NODE_GOVERNANCE,
        TREASURY_ALLOCATION,
        PROTOCOL_UPGRADE,
        EMERGENCY_ACTION
    }
    
    enum ProposalStatus {
        PENDING,
        ACTIVE,
        SUCCEEDED,
        DEFEATED,
        EXECUTED,
        CANCELLED
    }
    
    // ============ Proposal Structure ============
    struct Proposal {
        uint256 id;
        address proposer;
        ProposalType proposalType;
        ProposalStatus status;
        string title;
        string description;
        string ipfsMetadata;
        uint256 createdAt;
        uint256 votingStartTime;
        uint256 votingEndTime;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        bool executed;
        bytes executionData;
    }
    
    // ============ State Variables ============
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(address => uint256)) public voteWeight;
    mapping(address => uint256) public votingPower;
    
    uint256 public proposalCount;
    uint256 public votingPeriod; // in seconds
    uint256 public proposalThreshold; // minimum votes to create proposal
    uint256 public quorumPercentage; // percentage needed for quorum
    
    address public noorNodesContract;
    address public treasuryAddress;
    
    // ============ Events ============
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        ProposalType proposalType,
        string title
    );
    
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 weight
    );
    
    event ProposalExecuted(
        uint256 indexed proposalId,
        address indexed executor
    );
    
    event ProposalCancelled(
        uint256 indexed proposalId,
        address indexed canceller
    );
    
    event VotingPowerUpdated(
        address indexed voter,
        uint256 oldPower,
        uint256 newPower
    );
    
    // ============ Constructor ============
    constructor(
        uint256 _votingPeriod,
        uint256 _proposalThreshold,
        uint256 _quorumPercentage,
        address _treasuryAddress
    ) {
        require(_quorumPercentage <= 100, "Invalid quorum percentage");
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        
        votingPeriod = _votingPeriod;
        proposalThreshold = _proposalThreshold;
        quorumPercentage = _quorumPercentage;
        treasuryAddress = _treasuryAddress;
    }
    
    // ============ Proposal Functions ============
    
    /**
     * @notice Create a new governance proposal
     * @param _proposalType Type of proposal
     * @param _title Proposal title
     * @param _description Proposal description
     * @param _ipfsMetadata IPFS hash with detailed proposal information
     * @param _executionData Encoded function call data for execution
     */
    function createProposal(
        ProposalType _proposalType,
        string memory _title,
        string memory _description,
        string memory _ipfsMetadata,
        bytes memory _executionData
    ) external whenNotPaused returns (uint256) {
        require(
            votingPower[msg.sender] >= proposalThreshold,
            "Insufficient voting power"
        );
        
        proposalCount++;
        uint256 proposalId = proposalCount;
        
        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            proposalType: _proposalType,
            status: ProposalStatus.PENDING,
            title: _title,
            description: _description,
            ipfsMetadata: _ipfsMetadata,
            createdAt: block.timestamp,
            votingStartTime: block.timestamp,
            votingEndTime: block.timestamp + votingPeriod,
            forVotes: 0,
            againstVotes: 0,
            abstainVotes: 0,
            executed: false,
            executionData: _executionData
        });
        
        // Activate proposal
        proposals[proposalId].status = ProposalStatus.ACTIVE;
        
        emit ProposalCreated(proposalId, msg.sender, _proposalType, _title);
        
        return proposalId;
    }
    
    /**
     * @notice Cast vote on a proposal
     * @param _proposalId Proposal ID
     * @param _support True for yes, false for no
     * @param _abstain True to abstain from voting
     */
    function castVote(
        uint256 _proposalId,
        bool _support,
        bool _abstain
    ) external whenNotPaused {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal");
        require(!hasVoted[_proposalId][msg.sender], "Already voted");
        require(votingPower[msg.sender] > 0, "No voting power");
        
        Proposal storage proposal = proposals[_proposalId];
        
        require(proposal.status == ProposalStatus.ACTIVE, "Proposal not active");
        require(block.timestamp <= proposal.votingEndTime, "Voting ended");
        
        uint256 weight = votingPower[msg.sender];
        
        if (_abstain) {
            proposal.abstainVotes += weight;
        } else if (_support) {
            proposal.forVotes += weight;
        } else {
            proposal.againstVotes += weight;
        }
        
        hasVoted[_proposalId][msg.sender] = true;
        voteWeight[_proposalId][msg.sender] = weight;
        
        emit VoteCast(_proposalId, msg.sender, _support, weight);
    }
    
    /**
     * @notice Finalize proposal after voting period
     * @param _proposalId Proposal ID
     */
    function finalizeProposal(uint256 _proposalId) external {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal");
        
        Proposal storage proposal = proposals[_proposalId];
        
        require(proposal.status == ProposalStatus.ACTIVE, "Proposal not active");
        require(block.timestamp > proposal.votingEndTime, "Voting not ended");
        
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
        uint256 quorumRequired = (getTotalVotingPower() * quorumPercentage) / 100;
        
        if (totalVotes >= quorumRequired && proposal.forVotes > proposal.againstVotes) {
            proposal.status = ProposalStatus.SUCCEEDED;
        } else {
            proposal.status = ProposalStatus.DEFEATED;
        }
    }
    
    /**
     * @notice Execute a succeeded proposal
     * @param _proposalId Proposal ID
     */
    function executeProposal(uint256 _proposalId)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        nonReentrant
    {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal");
        
        Proposal storage proposal = proposals[_proposalId];
        
        require(proposal.status == ProposalStatus.SUCCEEDED, "Proposal not succeeded");
        require(!proposal.executed, "Already executed");
        
        proposal.executed = true;
        proposal.status = ProposalStatus.EXECUTED;
        
        emit ProposalExecuted(_proposalId, msg.sender);
    }
    
    /**
     * @notice Cancel a proposal (admin only for emergency)
     * @param _proposalId Proposal ID
     */
    function cancelProposal(uint256 _proposalId)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal");
        
        Proposal storage proposal = proposals[_proposalId];
        require(
            proposal.status == ProposalStatus.PENDING ||
            proposal.status == ProposalStatus.ACTIVE,
            "Cannot cancel"
        );
        
        proposal.status = ProposalStatus.CANCELLED;
        
        emit ProposalCancelled(_proposalId, msg.sender);
    }
    
    // ============ Voting Power Management ============
    
    /**
     * @notice Update voting power for an address
     * @param _voter Voter address
     * @param _newPower New voting power
     * @dev Called by authorized contracts (e.g., Noor Nodes based on stake)
     */
    function updateVotingPower(address _voter, uint256 _newPower)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        uint256 oldPower = votingPower[_voter];
        votingPower[_voter] = _newPower;
        
        // Grant or revoke voter role
        if (_newPower > 0 && !hasRole(VOTER_ROLE, _voter)) {
            _grantRole(VOTER_ROLE, _voter);
        } else if (_newPower == 0 && hasRole(VOTER_ROLE, _voter)) {
            _revokeRole(VOTER_ROLE, _voter);
        }
        
        emit VotingPowerUpdated(_voter, oldPower, _newPower);
    }
    
    /**
     * @notice Batch update voting power
     * @param _voters Array of voter addresses
     * @param _powers Array of corresponding voting powers
     */
    function batchUpdateVotingPower(
        address[] calldata _voters,
        uint256[] calldata _powers
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_voters.length == _powers.length, "Array length mismatch");
        
        for (uint256 i = 0; i < _voters.length; i++) {
            uint256 oldPower = votingPower[_voters[i]];
            votingPower[_voters[i]] = _powers[i];
            
            if (_powers[i] > 0 && !hasRole(VOTER_ROLE, _voters[i])) {
                _grantRole(VOTER_ROLE, _voters[i]);
            } else if (_powers[i] == 0 && hasRole(VOTER_ROLE, _voters[i])) {
                _revokeRole(VOTER_ROLE, _voters[i]);
            }
            
            emit VotingPowerUpdated(_voters[i], oldPower, _powers[i]);
        }
    }
    
    // ============ Configuration Functions ============
    
    /**
     * @notice Set Noor Nodes contract address
     * @param _nodesContract Address of Noor Nodes contract
     */
    function setNoorNodesContract(address _nodesContract)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(_nodesContract != address(0), "Invalid address");
        noorNodesContract = _nodesContract;
    }
    
    /**
     * @notice Update voting period
     * @param _newPeriod New voting period in seconds
     */
    function updateVotingPeriod(uint256 _newPeriod)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(_newPeriod > 0, "Invalid period");
        votingPeriod = _newPeriod;
    }
    
    /**
     * @notice Update proposal threshold
     * @param _newThreshold New threshold
     */
    function updateProposalThreshold(uint256 _newThreshold)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        proposalThreshold = _newThreshold;
    }
    
    /**
     * @notice Update quorum percentage
     * @param _newQuorum New quorum percentage
     */
    function updateQuorumPercentage(uint256 _newQuorum)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(_newQuorum <= 100, "Invalid percentage");
        quorumPercentage = _newQuorum;
    }
    
    // ============ Emergency Functions ============
    
    /**
     * @notice Pause contract
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @notice Unpause contract
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get proposal details
     * @param _proposalId Proposal ID
     */
    function getProposal(uint256 _proposalId)
        external
        view
        returns (
            address proposer,
            ProposalType proposalType,
            ProposalStatus status,
            string memory title,
            uint256 forVotes,
            uint256 againstVotes,
            uint256 votingEndTime
        )
    {
        Proposal memory proposal = proposals[_proposalId];
        return (
            proposal.proposer,
            proposal.proposalType,
            proposal.status,
            proposal.title,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.votingEndTime
        );
    }
    
    /**
     * @notice Get total voting power in the system
     */
    function getTotalVotingPower() public view returns (uint256) {
        // This would typically aggregate from all voters
        // Simplified implementation - in production, track this more efficiently
        return 1000000; // Placeholder
    }
    
    /**
     * @notice Check if address has voted on proposal
     * @param _proposalId Proposal ID
     * @param _voter Voter address
     */
    function hasVotedOnProposal(uint256 _proposalId, address _voter)
        external
        view
        returns (bool)
    {
        return hasVoted[_proposalId][_voter];
    }
}
