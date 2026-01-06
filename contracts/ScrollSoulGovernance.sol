// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title ScrollSoulGovernance
 * @dev Enhanced governance system for ScrollSoul DAO pathway with artist-specific DAO support
 * 
 * @notice SCROLLSOUL GOVERNANCE PROTOCOL
 * 
 * This contract manages:
 * - Virtual governance collaboration for decentralized decision-making
 * - Artist-specific DAO infrastructure and voting utilities
 * - ScrollVerse DAO protocol integration across contributor tiers
 * - Multi-tier governance with specialized voting mechanisms
 * 
 * Frequency: 528Hz (Love) + 963Hz (Unity) + 999Hz (Crown)
 * 
 * ALLĀHU AKBAR! 🕋✨💎🌌
 */
contract ScrollSoulGovernance is AccessControl, ReentrancyGuard, Pausable {
    
    // ========== ROLES ==========
    bytes32 public constant GOVERNANCE_ADMIN_ROLE = keccak256("GOVERNANCE_ADMIN_ROLE");
    bytes32 public constant DAO_CREATOR_ROLE = keccak256("DAO_CREATOR_ROLE");
    bytes32 public constant VOTING_FACILITATOR_ROLE = keccak256("VOTING_FACILITATOR_ROLE");
    bytes32 public constant SCROLLSOUL_MEMBER_ROLE = keccak256("SCROLLSOUL_MEMBER_ROLE");
    
    // ========== CONSTANTS ==========
    uint256 public constant LOVE_FREQUENCY = 528;
    uint256 public constant UNITY_FREQUENCY = 963;
    uint256 public constant CROWN_FREQUENCY = 999;
    
    uint256 public constant MIN_VOTING_PERIOD = 3 days;
    uint256 public constant MAX_VOTING_PERIOD = 30 days;
    uint256 public constant QUORUM_BASIS_POINTS = 1000; // 10%
    
    // ========== ENUMS ==========
    
    enum DAOType {
        ARTIST_COLLECTIVE,
        CREATOR_GUILD,
        SCROLLSOUL_CHAPTER,
        SPECIALIZED_WORKING_GROUP,
        GLOBAL_GOVERNANCE
    }
    
    enum ProposalType {
        ARTIST_SUPPORT,
        RESOURCE_ALLOCATION,
        PROTOCOL_UPGRADE,
        COLLABORATION_INITIATIVE,
        GOVERNANCE_CHANGE
    }
    
    enum VoteType {
        SIMPLE_MAJORITY,
        SUPERMAJORITY,
        QUADRATIC,
        WEIGHTED_BY_CONTRIBUTION
    }
    
    enum ProposalStatus {
        PENDING,
        ACTIVE,
        PASSED,
        REJECTED,
        EXECUTED,
        CANCELLED
    }
    
    enum ContributorTier {
        COMMUNITY,
        CREATOR,
        MASTER,
        LEGENDARY,
        SOVEREIGN
    }
    
    // ========== STRUCTS ==========
    
    struct ArtistDAO {
        uint256 daoId;
        string name;
        string description;
        DAOType daoType;
        address creator;
        uint256 createdAt;
        uint256 memberCount;
        uint256 proposalCount;
        uint256 treasuryBalance;
        bool isActive;
        VoteType defaultVoteType;
        uint256 quorumPercentage;
    }
    
    struct Proposal {
        uint256 proposalId;
        uint256 daoId;
        address proposer;
        ProposalType proposalType;
        string title;
        string description;
        string ipfsHash;
        uint256 startTime;
        uint256 endTime;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 votesAbstain;
        uint256 totalVoters;
        ProposalStatus status;
        VoteType voteType;
        uint256 quorumRequired;
        bool executed;
    }
    
    struct Vote {
        address voter;
        uint256 proposalId;
        uint256 votingPower;
        bool support;
        uint256 timestamp;
        string comment;
    }
    
    struct GovernanceMember {
        address memberAddress;
        ContributorTier tier;
        uint256 joinedAt;
        uint256 proposalsCreated;
        uint256 votescast;
        uint256 votingPower;
        uint256 contributionScore;
        bool isActive;
    }
    
    struct VirtualCollaboration {
        uint256 collaborationId;
        uint256[] participatingDAOs;
        string topic;
        string platform;
        uint256 scheduledTime;
        uint256 participantCount;
        bool isActive;
    }
    
    // ========== STATE VARIABLES ==========
    
    // DAOs
    mapping(uint256 => ArtistDAO) public artistDAOs;
    uint256[] public daoIds;
    uint256 public totalDAOs;
    uint256 private _nextDAOId;
    
    // DAO membership
    mapping(uint256 => mapping(address => bool)) public daoMembers;
    mapping(uint256 => address[]) public daoMemberList;
    mapping(address => uint256[]) public memberDAOs;
    
    // Proposals
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => uint256[]) public daoProposals;
    uint256 public totalProposals;
    uint256 private _nextProposalId;
    
    // Voting
    mapping(uint256 => mapping(address => Vote)) public votes;
    mapping(uint256 => address[]) public proposalVoters;
    
    // Members
    mapping(address => GovernanceMember) public members;
    address[] public memberAddresses;
    uint256 public totalMembers;
    
    // Virtual collaborations
    mapping(uint256 => VirtualCollaboration) public collaborations;
    uint256 public totalCollaborations;
    uint256 private _nextCollaborationId;
    
    // Tier-based voting power
    mapping(ContributorTier => uint256) public tierVotingPower;
    
    // ========== EVENTS ==========
    
    event DAOCreated(uint256 indexed daoId, string name, DAOType daoType, address creator);
    event MemberJoined(uint256 indexed daoId, address indexed member, ContributorTier tier);
    event ProposalCreated(uint256 indexed proposalId, uint256 indexed daoId, address proposer, ProposalType proposalType);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 votingPower);
    event ProposalExecuted(uint256 indexed proposalId, bool passed);
    event CollaborationScheduled(uint256 indexed collaborationId, string topic, uint256 scheduledTime);
    event TierUpdated(address indexed member, ContributorTier newTier);
    event VotingPowerUpdated(address indexed member, uint256 newPower);
    
    // ========== CONSTRUCTOR ==========
    
    constructor(address initialOwner) {
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(GOVERNANCE_ADMIN_ROLE, initialOwner);
        _grantRole(DAO_CREATOR_ROLE, initialOwner);
        _grantRole(VOTING_FACILITATOR_ROLE, initialOwner);
        
        _nextDAOId = 1;
        _nextProposalId = 1;
        _nextCollaborationId = 1;
        
        // Initialize tier voting power
        tierVotingPower[ContributorTier.COMMUNITY] = 100;
        tierVotingPower[ContributorTier.CREATOR] = 200;
        tierVotingPower[ContributorTier.MASTER] = 500;
        tierVotingPower[ContributorTier.LEGENDARY] = 1000;
        tierVotingPower[ContributorTier.SOVEREIGN] = 2000;
    }
    
    // ========== DAO MANAGEMENT ==========
    
    /**
     * @dev Create new artist-specific DAO
     */
    function createArtistDAO(
        string memory name,
        string memory description,
        DAOType daoType,
        VoteType defaultVoteType,
        uint256 quorumPercentage
    ) external returns (uint256) {
        require(bytes(name).length > 0, "Name required");
        require(quorumPercentage <= 10000, "Invalid quorum");
        
        uint256 daoId = _nextDAOId++;
        
        artistDAOs[daoId] = ArtistDAO({
            daoId: daoId,
            name: name,
            description: description,
            daoType: daoType,
            creator: msg.sender,
            createdAt: block.timestamp,
            memberCount: 1,
            proposalCount: 0,
            treasuryBalance: 0,
            isActive: true,
            defaultVoteType: defaultVoteType,
            quorumPercentage: quorumPercentage
        });
        
        daoIds.push(daoId);
        totalDAOs++;
        
        // Add creator as first member
        daoMembers[daoId][msg.sender] = true;
        daoMemberList[daoId].push(msg.sender);
        memberDAOs[msg.sender].push(daoId);
        
        // Initialize member if not exists
        if (!members[msg.sender].isActive) {
            _initializeMember(msg.sender, ContributorTier.CREATOR);
        }
        
        emit DAOCreated(daoId, name, daoType, msg.sender);
        
        return daoId;
    }
    
    /**
     * @dev Join DAO
     */
    function joinDAO(uint256 daoId, ContributorTier tier) external whenNotPaused {
        require(artistDAOs[daoId].isActive, "DAO not active");
        require(!daoMembers[daoId][msg.sender], "Already member");
        
        daoMembers[daoId][msg.sender] = true;
        daoMemberList[daoId].push(msg.sender);
        memberDAOs[msg.sender].push(daoId);
        artistDAOs[daoId].memberCount++;
        
        // Initialize or update member
        if (!members[msg.sender].isActive) {
            _initializeMember(msg.sender, tier);
        }
        
        emit MemberJoined(daoId, msg.sender, tier);
    }
    
    // ========== PROPOSAL MANAGEMENT ==========
    
    /**
     * @dev Create proposal
     */
    function createProposal(
        uint256 daoId,
        ProposalType proposalType,
        string memory title,
        string memory description,
        string memory ipfsHash,
        uint256 votingPeriod
    ) external returns (uint256) {
        require(artistDAOs[daoId].isActive, "DAO not active");
        require(daoMembers[daoId][msg.sender], "Not DAO member");
        require(votingPeriod >= MIN_VOTING_PERIOD && votingPeriod <= MAX_VOTING_PERIOD, "Invalid period");
        
        uint256 proposalId = _nextProposalId++;
        ArtistDAO storage dao = artistDAOs[daoId];
        
        uint256 quorumRequired = (dao.memberCount * dao.quorumPercentage) / 10000;
        
        proposals[proposalId] = Proposal({
            proposalId: proposalId,
            daoId: daoId,
            proposer: msg.sender,
            proposalType: proposalType,
            title: title,
            description: description,
            ipfsHash: ipfsHash,
            startTime: block.timestamp,
            endTime: block.timestamp + votingPeriod,
            votesFor: 0,
            votesAgainst: 0,
            votesAbstain: 0,
            totalVoters: 0,
            status: ProposalStatus.ACTIVE,
            voteType: dao.defaultVoteType,
            quorumRequired: quorumRequired,
            executed: false
        });
        
        daoProposals[daoId].push(proposalId);
        dao.proposalCount++;
        totalProposals++;
        
        members[msg.sender].proposalsCreated++;
        
        emit ProposalCreated(proposalId, daoId, msg.sender, proposalType);
        
        return proposalId;
    }
    
    /**
     * @dev Cast vote on proposal
     */
    function castVote(
        uint256 proposalId,
        bool support,
        string memory comment
    ) external whenNotPaused {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.ACTIVE, "Proposal not active");
        require(block.timestamp <= proposal.endTime, "Voting ended");
        require(daoMembers[proposal.daoId][msg.sender], "Not DAO member");
        require(votes[proposalId][msg.sender].voter == address(0), "Already voted");
        
        GovernanceMember storage member = members[msg.sender];
        uint256 votingPower = _calculateVotingPower(msg.sender, proposal.voteType);
        
        votes[proposalId][msg.sender] = Vote({
            voter: msg.sender,
            proposalId: proposalId,
            votingPower: votingPower,
            support: support,
            timestamp: block.timestamp,
            comment: comment
        });
        
        proposalVoters[proposalId].push(msg.sender);
        proposal.totalVoters++;
        
        if (support) {
            proposal.votesFor += votingPower;
        } else {
            proposal.votesAgainst += votingPower;
        }
        
        member.votescast++;
        
        emit VoteCast(proposalId, msg.sender, support, votingPower);
    }
    
    /**
     * @dev Execute proposal
     */
    function executeProposal(uint256 proposalId) external nonReentrant {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.ACTIVE, "Proposal not active");
        require(block.timestamp > proposal.endTime, "Voting not ended");
        require(!proposal.executed, "Already executed");
        
        bool quorumReached = proposal.totalVoters >= proposal.quorumRequired;
        bool passed = quorumReached && proposal.votesFor > proposal.votesAgainst;
        
        proposal.status = passed ? ProposalStatus.PASSED : ProposalStatus.REJECTED;
        proposal.executed = true;
        
        emit ProposalExecuted(proposalId, passed);
    }
    
    // ========== VIRTUAL COLLABORATION ==========
    
    /**
     * @dev Schedule virtual collaboration
     */
    function scheduleCollaboration(
        uint256[] memory participatingDAOs,
        string memory topic,
        string memory platform,
        uint256 scheduledTime
    ) external onlyRole(VOTING_FACILITATOR_ROLE) returns (uint256) {
        require(participatingDAOs.length > 0, "No DAOs specified");
        require(scheduledTime > block.timestamp, "Invalid time");
        
        uint256 collaborationId = _nextCollaborationId++;
        
        collaborations[collaborationId] = VirtualCollaboration({
            collaborationId: collaborationId,
            participatingDAOs: participatingDAOs,
            topic: topic,
            platform: platform,
            scheduledTime: scheduledTime,
            participantCount: 0,
            isActive: true
        });
        
        totalCollaborations++;
        
        emit CollaborationScheduled(collaborationId, topic, scheduledTime);
        
        return collaborationId;
    }
    
    // ========== MEMBER MANAGEMENT ==========
    
    /**
     * @dev Initialize new member
     */
    function _initializeMember(address memberAddress, ContributorTier tier) internal {
        members[memberAddress] = GovernanceMember({
            memberAddress: memberAddress,
            tier: tier,
            joinedAt: block.timestamp,
            proposalsCreated: 0,
            votescast: 0,
            votingPower: tierVotingPower[tier],
            contributionScore: 0,
            isActive: true
        });
        
        memberAddresses.push(memberAddress);
        totalMembers++;
        
        _grantRole(SCROLLSOUL_MEMBER_ROLE, memberAddress);
    }
    
    /**
     * @dev Update member tier
     */
    function updateMemberTier(address memberAddress, ContributorTier newTier) 
        external 
        onlyRole(GOVERNANCE_ADMIN_ROLE) 
    {
        require(members[memberAddress].isActive, "Member not active");
        
        members[memberAddress].tier = newTier;
        members[memberAddress].votingPower = tierVotingPower[newTier];
        
        emit TierUpdated(memberAddress, newTier);
    }
    
    /**
     * @dev Calculate voting power
     */
    function _calculateVotingPower(address voter, VoteType voteType) 
        internal 
        view 
        returns (uint256) 
    {
        GovernanceMember memory member = members[voter];
        
        if (voteType == VoteType.SIMPLE_MAJORITY) {
            return 1;
        } else if (voteType == VoteType.WEIGHTED_BY_CONTRIBUTION) {
            return member.votingPower;
        } else if (voteType == VoteType.QUADRATIC) {
            return sqrt(member.votingPower);
        }
        
        return member.votingPower;
    }
    
    /**
     * @dev Square root function for quadratic voting
     */
    function sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @dev Get DAO details
     */
    function getDAO(uint256 daoId) external view returns (ArtistDAO memory) {
        return artistDAOs[daoId];
    }
    
    /**
     * @dev Get proposal details
     */
    function getProposal(uint256 proposalId) external view returns (Proposal memory) {
        return proposals[proposalId];
    }
    
    /**
     * @dev Get DAO proposals
     */
    function getDAOProposals(uint256 daoId) external view returns (uint256[] memory) {
        return daoProposals[daoId];
    }
    
    /**
     * @dev Get member DAOs
     */
    function getMemberDAOs(address member) external view returns (uint256[] memory) {
        return memberDAOs[member];
    }
    
    /**
     * @dev Get member details
     */
    function getMember(address memberAddress) external view returns (GovernanceMember memory) {
        return members[memberAddress];
    }
    
    // ========== ADMIN FUNCTIONS ==========
    
    /**
     * @dev Update tier voting power
     */
    function updateTierVotingPower(ContributorTier tier, uint256 power) 
        external 
        onlyRole(GOVERNANCE_ADMIN_ROLE) 
    {
        tierVotingPower[tier] = power;
    }
    
    /**
     * @dev Pause contract
     */
    function pause() external onlyRole(GOVERNANCE_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyRole(GOVERNANCE_ADMIN_ROLE) {
        _unpause();
    }
}
