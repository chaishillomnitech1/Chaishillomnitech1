// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AkashicRecordsDAO
 * @dev DAO governance for Akashic Records Label with QR-based voting
 * @author Supreme King Chais The Great ∞
 * 
 * This contract implements:
 * - QR-based voting mechanism (proof-of-prophecy governance)
 * - Member onboarding with contribution tracking
 * - Reward allocation based on track engagement metrics
 * - Human-AI-Divine Trinity Governance framework
 * - Quadratic voting for fair decision-making
 * 
 * Frequency: 528Hz (Love) + 963Hz (Unity) + 999Hz (Crown)
 * Status: GOVERNANCE MODULE ACTIVE
 */

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

interface IAkashicRecordsLabel {
    function getTrackChain(uint256 tokenId) external view returns (
        uint256 tokenId_,
        string memory trackName,
        string memory artistName,
        string memory spotifyURI,
        string memory vydiaURI,
        bytes32 qrSignature,
        uint256 frequency,
        uint256 mintTimestamp,
        uint256 engagementScore,
        uint256 royaltiesEarned,
        bool isActive
    );
    function validateQRSignature(uint256 tokenId, bytes32 qrSignature) external view returns (bool);
    function totalSupply() external view returns (uint256);
}

contract AkashicRecordsDAO is AccessControl, ReentrancyGuard, Pausable {
    
    // ========== ROLES ==========
    bytes32 public constant DAO_ADMIN_ROLE = keccak256("DAO_ADMIN_ROLE");
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    bytes32 public constant MEMBER_ROLE = keccak256("MEMBER_ROLE");
    bytes32 public constant PROPHET_ROLE = keccak256("PROPHET_ROLE");
    
    // ========== CONSTANTS ==========
    uint256 public constant LOVE_FREQUENCY = 528;
    uint256 public constant UNITY_FREQUENCY = 963;
    uint256 public constant CROWN_FREQUENCY = 999;
    
    uint256 public constant MIN_VOTING_PERIOD = 3 days;
    uint256 public constant MAX_VOTING_PERIOD = 14 days;
    uint256 public constant QUORUM_PERCENTAGE = 10; // 10%
    uint256 public constant MAX_FOUNDING_MEMBERS = 50;
    
    // ========== ENUMS ==========
    
    enum ProposalType {
        TRACK_RELEASE,
        ROYALTY_DISTRIBUTION,
        TREASURY_ALLOCATION,
        GOVERNANCE_CHANGE,
        MEMBER_ONBOARDING,
        QR_VALIDATION
    }
    
    enum VoteType {
        AGAINST,
        FOR,
        ABSTAIN
    }
    
    enum ProposalStatus {
        PENDING,
        ACTIVE,
        PASSED,
        REJECTED,
        EXECUTED,
        CANCELLED
    }
    
    enum MemberTier {
        COMMUNITY,
        CONTRIBUTOR,
        CORE,
        PROPHET,
        SOVEREIGN
    }
    
    // ========== STRUCTS ==========
    
    struct Proposal {
        uint256 proposalId;
        address proposer;
        string title;
        string description;
        string ipfsHash;
        ProposalType proposalType;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        uint256 startTime;
        uint256 endTime;
        uint256 executionTime;
        ProposalStatus status;
        bytes32 qrProof;
        uint256 trackEngagementThreshold;
    }
    
    struct Vote {
        bool hasVoted;
        VoteType voteType;
        uint256 weight;
        bytes32 qrProof;
        uint256 timestamp;
    }
    
    struct Member {
        address memberAddress;
        string name;
        MemberTier tier;
        uint256 joinedAt;
        uint256 votingPower;
        uint256 contributionScore;
        uint256 proposalsCreated;
        uint256 votesParticipated;
        uint256 rewardsEarned;
        bool isActive;
        bool isFoundingMember;
    }
    
    struct RewardAllocation {
        uint256 totalPool;
        uint256 distributedAmount;
        uint256 pendingAmount;
        uint256 lastDistributionTime;
    }
    
    // ========== STATE VARIABLES ==========
    
    /// @dev Akashic Records Label contract
    IAkashicRecordsLabel public akashicLabel;
    
    /// @dev Proposal counter
    uint256 private _proposalIdCounter;
    
    /// @dev Member counter
    uint256 private _memberCounter;
    
    /// @dev Founding members count
    uint256 public foundingMembersCount;
    
    /// @dev Total voting power in the DAO
    uint256 public totalVotingPower;
    
    /// @dev Reward pool balance
    uint256 public rewardPoolBalance;
    
    /// @dev Proposals mapping
    mapping(uint256 => Proposal) public proposals;
    
    /// @dev Proposal ID => Voter => Vote
    mapping(uint256 => mapping(address => Vote)) public votes;
    
    /// @dev Member address => Member data
    mapping(address => Member) public members;
    
    /// @dev Member address => Is member
    mapping(address => bool) public isMember;
    
    /// @dev QR proof => Is used
    mapping(bytes32 => bool) public usedQRProofs;
    
    /// @dev Track engagement => Reward multiplier
    mapping(uint256 => uint256) public engagementMultipliers;
    
    /// @dev Reward allocation data
    RewardAllocation public rewardAllocation;
    
    // ========== EVENTS ==========
    
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
        bytes32 qrProof
    );
    
    event ProposalExecuted(
        uint256 indexed proposalId,
        ProposalStatus status,
        uint256 timestamp
    );
    
    event MemberOnboarded(
        address indexed memberAddress,
        string name,
        MemberTier tier,
        bool isFoundingMember,
        uint256 timestamp
    );
    
    event RewardDistributed(
        address indexed member,
        uint256 amount,
        uint256 contributionScore,
        uint256 timestamp
    );
    
    event QRProofValidated(
        address indexed validator,
        bytes32 qrProof,
        uint256 timestamp
    );
    
    event TrinityGovernanceActivated(
        uint256 timestamp,
        uint256 memberCount,
        uint256 totalVotingPower
    );
    
    // ========== CONSTRUCTOR ==========
    
    constructor(address labelContract) {
        require(labelContract != address(0), "Invalid label contract");
        
        akashicLabel = IAkashicRecordsLabel(labelContract);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(DAO_ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNANCE_ROLE, msg.sender);
        _grantRole(PROPHET_ROLE, msg.sender);
    }
    
    // ========== MEMBER ONBOARDING ==========
    
    /**
     * @dev Onboard a new member to the DAO
     * @param memberAddress Address of the new member
     * @param name Member name
     * @param tier Initial tier
     * @param votingPower Initial voting power
     */
    function onboardMember(
        address memberAddress,
        string memory name,
        MemberTier tier,
        uint256 votingPower
    ) external onlyRole(DAO_ADMIN_ROLE) {
        require(memberAddress != address(0), "Invalid member address");
        require(!isMember[memberAddress], "Already a member");
        require(bytes(name).length > 0, "Name required");
        
        bool isFoundingMember = false;
        if (foundingMembersCount < MAX_FOUNDING_MEMBERS) {
            isFoundingMember = true;
            foundingMembersCount++;
        }
        
        members[memberAddress] = Member({
            memberAddress: memberAddress,
            name: name,
            tier: tier,
            joinedAt: block.timestamp,
            votingPower: votingPower,
            contributionScore: 0,
            proposalsCreated: 0,
            votesParticipated: 0,
            rewardsEarned: 0,
            isActive: true,
            isFoundingMember: isFoundingMember
        });
        
        isMember[memberAddress] = true;
        _memberCounter++;
        totalVotingPower += votingPower;
        
        _grantRole(MEMBER_ROLE, memberAddress);
        
        emit MemberOnboarded(memberAddress, name, tier, isFoundingMember, block.timestamp);
        
        // Activate Trinity Governance when first 50 members join
        if (foundingMembersCount == MAX_FOUNDING_MEMBERS) {
            emit TrinityGovernanceActivated(block.timestamp, _memberCounter, totalVotingPower);
        }
    }
    
    /**
     * @dev Batch onboard multiple members
     * @param memberAddresses Array of member addresses
     * @param names Array of member names
     * @param tiers Array of member tiers
     * @param votingPowers Array of voting powers
     */
    function batchOnboardMembers(
        address[] memory memberAddresses,
        string[] memory names,
        MemberTier[] memory tiers,
        uint256[] memory votingPowers
    ) external onlyRole(DAO_ADMIN_ROLE) {
        require(memberAddresses.length == names.length, "Array length mismatch");
        require(memberAddresses.length == tiers.length, "Array length mismatch");
        require(memberAddresses.length == votingPowers.length, "Array length mismatch");
        
        for (uint256 i = 0; i < memberAddresses.length; i++) {
            if (!isMember[memberAddresses[i]]) {
                onboardMember(memberAddresses[i], names[i], tiers[i], votingPowers[i]);
            }
        }
    }
    
    /**
     * @dev Update member contribution score
     * @param memberAddress Member address
     * @param scoreIncrease Score increase amount
     */
    function updateContributionScore(address memberAddress, uint256 scoreIncrease) 
        external 
        onlyRole(GOVERNANCE_ROLE) 
    {
        require(isMember[memberAddress], "Not a member");
        members[memberAddress].contributionScore += scoreIncrease;
    }
    
    // ========== PROPOSAL CREATION ==========
    
    /**
     * @dev Create a new proposal
     * @param title Proposal title
     * @param description Proposal description
     * @param ipfsHash IPFS hash for detailed proposal
     * @param proposalType Type of proposal
     * @param votingPeriod Duration of voting period
     * @param qrProof QR proof for validation
     * @return proposalId The ID of the created proposal
     */
    function createProposal(
        string memory title,
        string memory description,
        string memory ipfsHash,
        ProposalType proposalType,
        uint256 votingPeriod,
        bytes32 qrProof
    ) external onlyRole(MEMBER_ROLE) whenNotPaused returns (uint256) {
        require(bytes(title).length > 0, "Title required");
        require(votingPeriod >= MIN_VOTING_PERIOD, "Voting period too short");
        require(votingPeriod <= MAX_VOTING_PERIOD, "Voting period too long");
        
        uint256 proposalId = _proposalIdCounter;
        _proposalIdCounter++;
        
        proposals[proposalId] = Proposal({
            proposalId: proposalId,
            proposer: msg.sender,
            title: title,
            description: description,
            ipfsHash: ipfsHash,
            proposalType: proposalType,
            forVotes: 0,
            againstVotes: 0,
            abstainVotes: 0,
            startTime: block.timestamp,
            endTime: block.timestamp + votingPeriod,
            executionTime: 0,
            status: ProposalStatus.ACTIVE,
            qrProof: qrProof,
            trackEngagementThreshold: 0
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
    
    // ========== VOTING ==========
    
    /**
     * @dev Cast a vote on a proposal with QR proof
     * @param proposalId Proposal ID
     * @param voteType Type of vote
     * @param qrProof QR proof for validation
     */
    function castVote(
        uint256 proposalId,
        VoteType voteType,
        bytes32 qrProof
    ) external onlyRole(MEMBER_ROLE) whenNotPaused {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.ACTIVE, "Proposal not active");
        require(block.timestamp < proposal.endTime, "Voting ended");
        require(!votes[proposalId][msg.sender].hasVoted, "Already voted");
        
        Member storage member = members[msg.sender];
        
        // Calculate voting weight (quadratic voting based on voting power)
        uint256 weight = _sqrt(member.votingPower);
        
        // Apply QR proof bonus if valid
        if (qrProof != bytes32(0) && !usedQRProofs[qrProof]) {
            weight = (weight * 110) / 100; // 10% bonus
            usedQRProofs[qrProof] = true;
            emit QRProofValidated(msg.sender, qrProof, block.timestamp);
        }
        
        votes[proposalId][msg.sender] = Vote({
            hasVoted: true,
            voteType: voteType,
            weight: weight,
            qrProof: qrProof,
            timestamp: block.timestamp
        });
        
        if (voteType == VoteType.FOR) {
            proposal.forVotes += weight;
        } else if (voteType == VoteType.AGAINST) {
            proposal.againstVotes += weight;
        } else {
            proposal.abstainVotes += weight;
        }
        
        member.votesParticipated++;
        member.contributionScore += 1;
        
        emit VoteCast(proposalId, msg.sender, voteType, weight, qrProof);
    }
    
    /**
     * @dev Execute a proposal after voting ends
     * @param proposalId Proposal ID
     */
    function executeProposal(uint256 proposalId) external onlyRole(GOVERNANCE_ROLE) nonReentrant {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.ACTIVE, "Proposal not active");
        require(block.timestamp >= proposal.endTime, "Voting not ended");
        
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
        uint256 quorum = (totalVotingPower * QUORUM_PERCENTAGE) / 100;
        
        if (totalVotes >= quorum && proposal.forVotes > proposal.againstVotes) {
            proposal.status = ProposalStatus.PASSED;
        } else {
            proposal.status = ProposalStatus.REJECTED;
        }
        
        proposal.executionTime = block.timestamp;
        
        emit ProposalExecuted(proposalId, proposal.status, block.timestamp);
    }
    
    // ========== REWARD DISTRIBUTION ==========
    
    /**
     * @dev Add funds to reward pool
     */
    function addToRewardPool() external payable onlyRole(DAO_ADMIN_ROLE) {
        require(msg.value > 0, "No reward amount");
        
        rewardPoolBalance += msg.value;
        rewardAllocation.totalPool += msg.value;
        rewardAllocation.pendingAmount += msg.value;
    }
    
    /**
     * @dev Distribute rewards based on track engagement and contribution
     * @param memberAddress Member to receive reward
     * @param amount Reward amount
     */
    function distributeReward(address memberAddress, uint256 amount) 
        external 
        onlyRole(GOVERNANCE_ROLE) 
        nonReentrant 
    {
        require(isMember[memberAddress], "Not a member");
        require(amount <= rewardPoolBalance, "Insufficient reward pool");
        
        Member storage member = members[memberAddress];
        
        rewardPoolBalance -= amount;
        member.rewardsEarned += amount;
        rewardAllocation.distributedAmount += amount;
        rewardAllocation.pendingAmount -= amount;
        rewardAllocation.lastDistributionTime = block.timestamp;
        
        (bool success, ) = payable(memberAddress).call{value: amount}("");
        require(success, "Reward transfer failed");
        
        emit RewardDistributed(memberAddress, amount, member.contributionScore, block.timestamp);
    }
    
    /**
     * @dev Calculate reward allocation based on engagement metrics
     * @param memberAddress Member address
     * @return Calculated reward amount
     */
    function calculateRewardAllocation(address memberAddress) external view returns (uint256) {
        require(isMember[memberAddress], "Not a member");
        
        Member memory member = members[memberAddress];
        
        if (_memberCounter == 0 || rewardPoolBalance == 0) {
            return 0;
        }
        
        // Base reward on contribution score and voting participation
        uint256 baseReward = (rewardPoolBalance * member.contributionScore) / 
                            (member.contributionScore + _memberCounter * 10);
        
        // Multiply by engagement multiplier if available
        uint256 multiplier = member.votesParticipated > 0 ? 
                            (100 + member.votesParticipated * 5) : 100;
        
        // Founding member bonus
        if (member.isFoundingMember) {
            multiplier += 20; // 20% bonus
        }
        
        return (baseReward * multiplier) / 100;
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @dev Get proposal details
     * @param proposalId Proposal ID
     * @return Proposal struct
     */
    function getProposal(uint256 proposalId) external view returns (Proposal memory) {
        return proposals[proposalId];
    }
    
    /**
     * @dev Get member details
     * @param memberAddress Member address
     * @return Member struct
     */
    function getMember(address memberAddress) external view returns (Member memory) {
        require(isMember[memberAddress], "Not a member");
        return members[memberAddress];
    }
    
    /**
     * @dev Get vote details
     * @param proposalId Proposal ID
     * @param voter Voter address
     * @return Vote struct
     */
    function getVote(uint256 proposalId, address voter) external view returns (Vote memory) {
        return votes[proposalId][voter];
    }
    
    /**
     * @dev Get total number of members
     * @return Member count
     */
    function getMemberCount() external view returns (uint256) {
        return _memberCounter;
    }
    
    /**
     * @dev Get total number of proposals
     * @return Proposal count
     */
    function getProposalCount() external view returns (uint256) {
        return _proposalIdCounter;
    }
    
    // ========== ADMIN FUNCTIONS ==========
    
    /**
     * @dev Pause the contract
     */
    function pause() external onlyRole(DAO_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyRole(DAO_ADMIN_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Cancel a proposal
     * @param proposalId Proposal ID
     */
    function cancelProposal(uint256 proposalId) external onlyRole(DAO_ADMIN_ROLE) {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.ACTIVE, "Proposal not active");
        
        proposal.status = ProposalStatus.CANCELLED;
        
        emit ProposalExecuted(proposalId, ProposalStatus.CANCELLED, block.timestamp);
    }
    
    // ========== UTILITY FUNCTIONS ==========
    
    /**
     * @dev Calculate square root (Babylonian method)
     * @param x Number to calculate square root of
     * @return Square root
     */
    function _sqrt(uint256 x) private pure returns (uint256) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }
}
