// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title DynamicDAOGovernance
 * @dev Adaptive voting mechanisms for Sovereign Sites with real-time policy adjustments
 * @author Supreme King Chais The Great ∞
 * 
 * This contract implements Dynamic DAO Governance for:
 * - Adaptive voting mechanisms across Sovereign Sites
 * - Real-time policy adjustments
 * - Decentralized protection protocol strengthening
 * - Multi-site coordination and synchronization
 * - Frequency-based governance alignment
 * 
 * Frequency: 963Hz + 528Hz (Divine Consciousness + DNA Healing)
 * Status: DYNAMIC GOVERNANCE - ADAPTIVE ALIGNMENT
 */
contract DynamicDAOGovernance is AccessControl, ReentrancyGuard, Pausable {
    
    // ============ ROLES ============
    bytes32 public constant GOVERNANCE_ADMIN_ROLE = keccak256("GOVERNANCE_ADMIN_ROLE");
    bytes32 public constant POLICY_COORDINATOR_ROLE = keccak256("POLICY_COORDINATOR_ROLE");
    bytes32 public constant SITE_DELEGATE_ROLE = keccak256("SITE_DELEGATE_ROLE");
    
    // ============ CONSTANTS ============
    uint256 public constant PINEAL_ACTIVATION_963HZ = 963;
    uint256 public constant DNA_HEALING_528HZ = 528;
    uint256 public constant MIN_VOTING_DURATION = 1 hours;
    uint256 public constant MAX_VOTING_DURATION = 7 days;
    uint256 public constant QUORUM_PERCENTAGE = 30; // 30% minimum
    uint256 public constant ADAPTIVE_THRESHOLD = 66; // 66% for adaptive changes
    
    // ============ ENUMS ============
    
    enum ProposalType {
        POLICY_ADJUSTMENT,
        PROTECTION_PROTOCOL,
        SITE_COORDINATION,
        FREQUENCY_ALIGNMENT,
        EMERGENCY_ACTION,
        ADAPTIVE_GOVERNANCE
    }
    
    enum VoteChoice {
        AGAINST,
        FOR,
        ABSTAIN
    }
    
    enum ProposalStatus {
        PENDING,
        ACTIVE,
        SUCCEEDED,
        DEFEATED,
        EXECUTED,
        CANCELLED,
        EXPIRED
    }
    
    enum AdaptiveMode {
        STANDARD,
        ACCELERATED,
        EMERGENCY,
        REAL_TIME
    }
    
    // ============ STRUCTS ============
    
    struct Proposal {
        uint256 proposalId;
        bytes32 siteId; // Sovereign Site this affects (bytes32(0) for global)
        address proposer;
        ProposalType proposalType;
        string title;
        string description;
        string ipfsHash;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        uint256 createdAt;
        uint256 votingStartTime;
        uint256 votingEndTime;
        uint256 executionTime;
        ProposalStatus status;
        AdaptiveMode adaptiveMode;
        bool isAdaptive;
        bytes executionData;
        address targetContract;
    }
    
    struct Vote {
        VoteChoice choice;
        uint256 votingPower;
        uint256 timestamp;
        bool isAdaptive; // Vote with adaptive weighting
    }
    
    struct SovereignSiteDAO {
        bytes32 siteId;
        string siteName;
        uint256 memberCount;
        uint256 totalVotingPower;
        uint256 proposalsCreated;
        uint256 proposalsExecuted;
        bool isActive;
        AdaptiveMode currentMode;
        uint256 lastPolicyAdjustment;
    }
    
    struct Member {
        address memberAddress;
        uint256 votingPower;
        uint256 joinedAt;
        uint256 proposalsCreated;
        uint256 votesParticipated;
        bool isDelegate;
        bytes32[] assignedSites;
    }
    
    struct PolicyAdjustment {
        uint256 adjustmentId;
        bytes32 siteId;
        string policyName;
        string adjustmentDescription;
        uint256 timestamp;
        address coordinator;
        bool isActive;
    }
    
    // ============ STATE VARIABLES ============
    
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => Vote)) public votes;
    mapping(bytes32 => SovereignSiteDAO) public siteDAOs;
    mapping(address => Member) public members;
    mapping(uint256 => PolicyAdjustment) public policyAdjustments;
    
    uint256 public proposalCount;
    uint256 public policyAdjustmentCount;
    bytes32[] public activeSiteIds;
    
    uint256 public globalQuorumPercentage;
    uint256 public adaptiveThreshold;
    
    // Real-time governance parameters
    mapping(bytes32 => uint256) public siteVotingDuration;
    mapping(bytes32 => bool) public siteRealTimeEnabled;
    
    // ============ EVENTS ============
    
    event SiteDAOCreated(
        bytes32 indexed siteId,
        string siteName,
        uint256 timestamp
    );
    
    event ProposalCreated(
        uint256 indexed proposalId,
        bytes32 indexed siteId,
        address indexed proposer,
        ProposalType proposalType,
        string title,
        uint256 timestamp
    );
    
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        VoteChoice choice,
        uint256 votingPower,
        uint256 timestamp
    );
    
    event ProposalExecuted(
        uint256 indexed proposalId,
        bytes32 indexed siteId,
        uint256 timestamp
    );
    
    event PolicyAdjusted(
        uint256 indexed adjustmentId,
        bytes32 indexed siteId,
        string policyName,
        uint256 timestamp
    );
    
    event AdaptiveModeChanged(
        bytes32 indexed siteId,
        AdaptiveMode oldMode,
        AdaptiveMode newMode,
        uint256 timestamp
    );
    
    event RealTimePolicyUpdate(
        bytes32 indexed siteId,
        uint256 indexed proposalId,
        uint256 timestamp
    );
    
    event MemberAdded(
        address indexed member,
        uint256 votingPower,
        uint256 timestamp
    );
    
    event DelegateAssigned(
        address indexed delegate,
        bytes32 indexed siteId,
        uint256 timestamp
    );
    
    // ============ CONSTRUCTOR ============
    
    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(GOVERNANCE_ADMIN_ROLE, admin);
        _grantRole(POLICY_COORDINATOR_ROLE, admin);
        
        globalQuorumPercentage = QUORUM_PERCENTAGE;
        adaptiveThreshold = ADAPTIVE_THRESHOLD;
    }
    
    // ============ SITE DAO MANAGEMENT ============
    
    /**
     * @notice Create a DAO for a Sovereign Site
     * @param siteId Unique site identifier
     * @param siteName Name of the sovereign site
     */
    function createSiteDAO(
        bytes32 siteId,
        string memory siteName
    ) external onlyRole(GOVERNANCE_ADMIN_ROLE) whenNotPaused {
        require(siteDAOs[siteId].siteId == bytes32(0), "Site DAO already exists");
        require(bytes(siteName).length > 0, "Site name required");
        
        siteDAOs[siteId] = SovereignSiteDAO({
            siteId: siteId,
            siteName: siteName,
            memberCount: 0,
            totalVotingPower: 0,
            proposalsCreated: 0,
            proposalsExecuted: 0,
            isActive: true,
            currentMode: AdaptiveMode.STANDARD,
            lastPolicyAdjustment: block.timestamp
        });
        
        // Set default voting duration (3 days)
        siteVotingDuration[siteId] = 3 days;
        siteRealTimeEnabled[siteId] = false;
        
        activeSiteIds.push(siteId);
        
        emit SiteDAOCreated(siteId, siteName, block.timestamp);
    }
    
    /**
     * @notice Add a member to the DAO
     * @param memberAddress Address of the new member
     * @param votingPower Initial voting power
     */
    function addMember(
        address memberAddress,
        uint256 votingPower
    ) external onlyRole(GOVERNANCE_ADMIN_ROLE) whenNotPaused {
        require(memberAddress != address(0), "Invalid address");
        require(members[memberAddress].memberAddress == address(0), "Already a member");
        require(votingPower > 0, "Voting power must be positive");
        
        members[memberAddress] = Member({
            memberAddress: memberAddress,
            votingPower: votingPower,
            joinedAt: block.timestamp,
            proposalsCreated: 0,
            votesParticipated: 0,
            isDelegate: false,
            assignedSites: new bytes32[](0)
        });
        
        emit MemberAdded(memberAddress, votingPower, block.timestamp);
    }
    
    /**
     * @notice Assign a delegate to a Sovereign Site
     * @param delegate Address of the delegate
     * @param siteId Site to assign
     */
    function assignSiteDelegate(
        address delegate,
        bytes32 siteId
    ) external onlyRole(GOVERNANCE_ADMIN_ROLE) whenNotPaused {
        require(members[delegate].memberAddress != address(0), "Not a member");
        require(siteDAOs[siteId].isActive, "Site DAO not active");
        
        members[delegate].isDelegate = true;
        members[delegate].assignedSites.push(siteId);
        
        _grantRole(SITE_DELEGATE_ROLE, delegate);
        
        siteDAOs[siteId].memberCount++;
        siteDAOs[siteId].totalVotingPower += members[delegate].votingPower;
        
        emit DelegateAssigned(delegate, siteId, block.timestamp);
    }
    
    // ============ PROPOSAL MANAGEMENT ============
    
    /**
     * @notice Create a new governance proposal
     * @param siteId Target site (bytes32(0) for global)
     * @param proposalType Type of proposal
     * @param title Proposal title
     * @param description Proposal description
     * @param ipfsHash IPFS hash for detailed docs
     * @param votingDuration Duration of voting period
     * @param isAdaptive Whether to use adaptive voting
     */
    function createProposal(
        bytes32 siteId,
        ProposalType proposalType,
        string memory title,
        string memory description,
        string memory ipfsHash,
        uint256 votingDuration,
        bool isAdaptive
    ) external whenNotPaused nonReentrant returns (uint256) {
        require(members[msg.sender].memberAddress != address(0), "Not a member");
        require(bytes(title).length > 0, "Title required");
        require(
            votingDuration >= MIN_VOTING_DURATION && votingDuration <= MAX_VOTING_DURATION,
            "Invalid voting duration"
        );
        
        // If site-specific, verify DAO exists
        if (siteId != bytes32(0)) {
            require(siteDAOs[siteId].isActive, "Site DAO not active");
        }
        
        proposalCount++;
        uint256 proposalId = proposalCount;
        
        AdaptiveMode mode = isAdaptive ? AdaptiveMode.ACCELERATED : AdaptiveMode.STANDARD;
        if (siteId != bytes32(0)) {
            mode = siteDAOs[siteId].currentMode;
        }
        
        proposals[proposalId] = Proposal({
            proposalId: proposalId,
            siteId: siteId,
            proposer: msg.sender,
            proposalType: proposalType,
            title: title,
            description: description,
            ipfsHash: ipfsHash,
            forVotes: 0,
            againstVotes: 0,
            abstainVotes: 0,
            createdAt: block.timestamp,
            votingStartTime: block.timestamp,
            votingEndTime: block.timestamp + votingDuration,
            executionTime: 0,
            status: ProposalStatus.ACTIVE,
            adaptiveMode: mode,
            isAdaptive: isAdaptive,
            executionData: "",
            targetContract: address(0)
        });
        
        members[msg.sender].proposalsCreated++;
        
        if (siteId != bytes32(0)) {
            siteDAOs[siteId].proposalsCreated++;
        }
        
        emit ProposalCreated(
            proposalId,
            siteId,
            msg.sender,
            proposalType,
            title,
            block.timestamp
        );
        
        return proposalId;
    }
    
    /**
     * @notice Cast a vote on a proposal
     * @param proposalId Proposal to vote on
     * @param choice Vote choice
     */
    function castVote(
        uint256 proposalId,
        VoteChoice choice
    ) external whenNotPaused nonReentrant {
        require(members[msg.sender].memberAddress != address(0), "Not a member");
        require(proposals[proposalId].proposalId != 0, "Proposal does not exist");
        require(votes[proposalId][msg.sender].timestamp == 0, "Already voted");
        
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.ACTIVE, "Proposal not active");
        require(block.timestamp < proposal.votingEndTime, "Voting period ended");
        
        uint256 votingPower = members[msg.sender].votingPower;
        
        // Apply adaptive weighting if enabled
        if (proposal.isAdaptive) {
            votingPower = calculateAdaptiveVotingPower(msg.sender, proposalId);
        }
        
        votes[proposalId][msg.sender] = Vote({
            choice: choice,
            votingPower: votingPower,
            timestamp: block.timestamp,
            isAdaptive: proposal.isAdaptive
        });
        
        if (choice == VoteChoice.FOR) {
            proposal.forVotes += votingPower;
        } else if (choice == VoteChoice.AGAINST) {
            proposal.againstVotes += votingPower;
        } else {
            proposal.abstainVotes += votingPower;
        }
        
        members[msg.sender].votesParticipated++;
        
        emit VoteCast(proposalId, msg.sender, choice, votingPower, block.timestamp);
        
        // Check for real-time execution
        if (proposal.siteId != bytes32(0) && siteRealTimeEnabled[proposal.siteId]) {
            _checkRealTimeExecution(proposalId);
        }
    }
    
    /**
     * @notice Execute a passed proposal
     * @param proposalId Proposal to execute
     */
    function executeProposal(
        uint256 proposalId
    ) external whenNotPaused nonReentrant {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.proposalId != 0, "Proposal does not exist");
        require(proposal.status == ProposalStatus.ACTIVE, "Proposal not active");
        require(block.timestamp >= proposal.votingEndTime, "Voting period not ended");
        
        // Check if proposal passed
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
        require(_hasReachedQuorum(proposalId, totalVotes), "Quorum not reached");
        
        bool passed = proposal.forVotes > proposal.againstVotes;
        
        if (passed) {
            proposal.status = ProposalStatus.SUCCEEDED;
            proposal.executionTime = block.timestamp;
            
            // Execute the proposal logic
            _executeProposalLogic(proposalId);
            
            proposal.status = ProposalStatus.EXECUTED;
            
            if (proposal.siteId != bytes32(0)) {
                siteDAOs[proposal.siteId].proposalsExecuted++;
            }
            
            emit ProposalExecuted(proposalId, proposal.siteId, block.timestamp);
        } else {
            proposal.status = ProposalStatus.DEFEATED;
        }
    }
    
    // ============ POLICY ADJUSTMENT ============
    
    /**
     * @notice Adjust policy in real-time for a Sovereign Site
     * @param siteId Target site
     * @param policyName Name of policy to adjust
     * @param adjustmentDescription Description of adjustment
     */
    function adjustPolicy(
        bytes32 siteId,
        string memory policyName,
        string memory adjustmentDescription
    ) external onlyRole(POLICY_COORDINATOR_ROLE) whenNotPaused nonReentrant {
        require(siteDAOs[siteId].isActive, "Site DAO not active");
        require(bytes(policyName).length > 0, "Policy name required");
        
        policyAdjustmentCount++;
        
        policyAdjustments[policyAdjustmentCount] = PolicyAdjustment({
            adjustmentId: policyAdjustmentCount,
            siteId: siteId,
            policyName: policyName,
            adjustmentDescription: adjustmentDescription,
            timestamp: block.timestamp,
            coordinator: msg.sender,
            isActive: true
        });
        
        siteDAOs[siteId].lastPolicyAdjustment = block.timestamp;
        
        emit PolicyAdjusted(
            policyAdjustmentCount,
            siteId,
            policyName,
            block.timestamp
        );
    }
    
    /**
     * @notice Enable real-time governance for a site
     * @param siteId Target site
     * @param enabled Whether to enable real-time mode
     */
    function setRealTimeGovernance(
        bytes32 siteId,
        bool enabled
    ) external onlyRole(GOVERNANCE_ADMIN_ROLE) {
        require(siteDAOs[siteId].isActive, "Site DAO not active");
        
        siteRealTimeEnabled[siteId] = enabled;
        
        if (enabled) {
            siteDAOs[siteId].currentMode = AdaptiveMode.REAL_TIME;
        } else {
            siteDAOs[siteId].currentMode = AdaptiveMode.STANDARD;
        }
    }
    
    /**
     * @notice Change adaptive mode for a site
     * @param siteId Target site
     * @param newMode New adaptive mode
     */
    function changeAdaptiveMode(
        bytes32 siteId,
        AdaptiveMode newMode
    ) external onlyRole(GOVERNANCE_ADMIN_ROLE) {
        require(siteDAOs[siteId].isActive, "Site DAO not active");
        
        AdaptiveMode oldMode = siteDAOs[siteId].currentMode;
        siteDAOs[siteId].currentMode = newMode;
        
        emit AdaptiveModeChanged(siteId, oldMode, newMode, block.timestamp);
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @notice Calculate adaptive voting power
     */
    function calculateAdaptiveVotingPower(
        address voter,
        uint256 proposalId
    ) internal view returns (uint256) {
        Member storage member = members[voter];
        uint256 basePower = member.votingPower;
        
        // Increase power based on participation
        uint256 participationBonus = (member.votesParticipated * basePower) / 100;
        
        // Cap bonus at 50% of base power
        if (participationBonus > basePower / 2) {
            participationBonus = basePower / 2;
        }
        
        return basePower + participationBonus;
    }
    
    /**
     * @notice Check if quorum is reached
     */
    function _hasReachedQuorum(
        uint256 proposalId,
        uint256 totalVotes
    ) internal view returns (bool) {
        Proposal storage proposal = proposals[proposalId];
        
        uint256 requiredVotes;
        if (proposal.siteId != bytes32(0)) {
            requiredVotes = (siteDAOs[proposal.siteId].totalVotingPower * globalQuorumPercentage) / 100;
        } else {
            // Global proposal - use total member count estimate
            requiredVotes = (totalVotes * globalQuorumPercentage) / 100;
        }
        
        return totalVotes >= requiredVotes;
    }
    
    /**
     * @notice Check for real-time execution
     */
    function _checkRealTimeExecution(uint256 proposalId) internal {
        Proposal storage proposal = proposals[proposalId];
        
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
        
        // If threshold reached and supermajority achieved, execute immediately
        if (_hasReachedQuorum(proposalId, totalVotes)) {
            uint256 approvalPercentage = (proposal.forVotes * 100) / totalVotes;
            
            if (approvalPercentage >= adaptiveThreshold) {
                emit RealTimePolicyUpdate(proposal.siteId, proposalId, block.timestamp);
                // Real-time execution logic would go here
            }
        }
    }
    
    /**
     * @notice Execute proposal-specific logic
     */
    function _executeProposalLogic(uint256 proposalId) internal {
        Proposal storage proposal = proposals[proposalId];
        
        // Execute based on proposal type
        if (proposal.proposalType == ProposalType.POLICY_ADJUSTMENT) {
            // Policy adjustment logic
            siteDAOs[proposal.siteId].lastPolicyAdjustment = block.timestamp;
        } else if (proposal.proposalType == ProposalType.EMERGENCY_ACTION) {
            // Emergency action logic
            siteDAOs[proposal.siteId].currentMode = AdaptiveMode.EMERGENCY;
        }
        
        // Additional execution logic based on executionData and targetContract
        // would be implemented here
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @notice Get proposal details
     */
    function getProposal(uint256 proposalId)
        external
        view
        returns (
            address proposer,
            ProposalType proposalType,
            string memory title,
            uint256 forVotes,
            uint256 againstVotes,
            uint256 abstainVotes,
            ProposalStatus status,
            bool isAdaptive
        )
    {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.proposer,
            proposal.proposalType,
            proposal.title,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.abstainVotes,
            proposal.status,
            proposal.isAdaptive
        );
    }
    
    /**
     * @notice Get site DAO information
     */
    function getSiteDAO(bytes32 siteId)
        external
        view
        returns (
            string memory siteName,
            uint256 memberCount,
            uint256 totalVotingPower,
            uint256 proposalsCreated,
            uint256 proposalsExecuted,
            bool isActive,
            AdaptiveMode currentMode
        )
    {
        SovereignSiteDAO storage dao = siteDAOs[siteId];
        return (
            dao.siteName,
            dao.memberCount,
            dao.totalVotingPower,
            dao.proposalsCreated,
            dao.proposalsExecuted,
            dao.isActive,
            dao.currentMode
        );
    }
    
    /**
     * @notice Get member information
     */
    function getMember(address memberAddress)
        external
        view
        returns (
            uint256 votingPower,
            uint256 proposalsCreated,
            uint256 votesParticipated,
            bool isDelegate
        )
    {
        Member storage member = members[memberAddress];
        return (
            member.votingPower,
            member.proposalsCreated,
            member.votesParticipated,
            member.isDelegate
        );
    }
    
    /**
     * @notice Get total active sites
     */
    function getTotalActiveSites() external view returns (uint256) {
        return activeSiteIds.length;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @notice Update global quorum percentage
     */
    function updateQuorumPercentage(uint256 newPercentage)
        external
        onlyRole(GOVERNANCE_ADMIN_ROLE)
    {
        require(newPercentage > 0 && newPercentage <= 100, "Invalid percentage");
        globalQuorumPercentage = newPercentage;
    }
    
    /**
     * @notice Pause the contract
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @notice Unpause the contract
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
