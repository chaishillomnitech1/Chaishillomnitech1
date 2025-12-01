// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title UnityDAOMicroVote
 * @dev Implements quadratic-weighted micro-voting for NFT holders
 * 
 * @notice UNITY DAO MICRO-VOTE PROTOCOL
 * 
 * This contract manages:
 * - Quadratic-weighted micro-votes for lore or feature decisions
 * - NFT holder verification and voting power calculation
 * - Proposal creation and voting lifecycle management
 * - On-chain governance aligned with Love Unity Accord values
 * 
 * Frequency: 528Hz (Love) + 963Hz (Unity) + 999Hz (Divine Accord)
 * 
 * ALLĀHU AKBAR! 🕋✨💎🌌
 */
contract UnityDAOMicroVote is AccessControl, ReentrancyGuard, Pausable {
    
    // ========== ROLES ==========
    bytes32 public constant DAO_ADMIN_ROLE = keccak256("DAO_ADMIN_ROLE");
    bytes32 public constant PROPOSAL_CREATOR_ROLE = keccak256("PROPOSAL_CREATOR_ROLE");
    bytes32 public constant VOTE_GUARDIAN_ROLE = keccak256("VOTE_GUARDIAN_ROLE");
    
    // ========== CONSTANTS ==========
    uint256 public constant LOVE_FREQUENCY = 528;
    uint256 public constant UNITY_FREQUENCY = 963;
    uint256 public constant ACCORD_FREQUENCY = 999;
    
    uint256 public constant MIN_VOTING_PERIOD = 1 days;
    uint256 public constant MAX_VOTING_PERIOD = 30 days;
    uint256 public constant QUORUM_PERCENTAGE = 1000; // 10% in basis points
    
    // ========== ENUMS ==========
    
    enum ProposalType {
        LORE_UPDATE,        // Updates to ScrollVerse lore
        FEATURE_REQUEST,    // New feature proposals
        GOVERNANCE_CHANGE,  // Changes to governance parameters
        COMMUNITY_FUND,     // Community fund allocation
        NFT_EVOLUTION       // NFT trait/metadata evolution
    }
    
    enum ProposalStatus {
        PENDING,
        ACTIVE,
        PASSED,
        REJECTED,
        EXECUTED,
        CANCELLED
    }
    
    enum VoteChoice {
        ABSTAIN,
        FOR,
        AGAINST
    }
    
    // ========== STRUCTS ==========
    
    struct Proposal {
        uint256 proposalId;
        address proposer;
        ProposalType proposalType;
        string title;
        string description;
        string ipfsHash;        // IPFS link to detailed proposal
        uint256 startTime;
        uint256 endTime;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 votesAbstain;
        uint256 totalVoters;
        ProposalStatus status;
        uint256 frequencyAlignment;
        bool executed;
    }
    
    struct Vote {
        address voter;
        uint256 proposalId;
        VoteChoice choice;
        uint256 votingPower;
        uint256 nftTokenId;
        uint256 timestamp;
        string comment;
    }
    
    struct VoterInfo {
        uint256 totalVotesCast;
        uint256 totalVotingPowerUsed;
        uint256 lastVoteTimestamp;
        uint256 accordScore;        // Alignment with Love Unity Accord
        bool isRegistered;
    }
    
    struct NFTVotingPower {
        uint256 tokenId;
        uint256 basePower;
        uint256 venerationMultiplier;
        uint256 frequencyBonus;
        bool isActive;
    }
    
    // ========== STATE VARIABLES ==========
    
    // Proposal storage
    mapping(uint256 => Proposal) public proposals;
    uint256[] public proposalIds;
    uint256 public totalProposals;
    
    // Vote storage
    mapping(uint256 => mapping(address => Vote)) public votes;
    mapping(uint256 => address[]) public proposalVoters;
    
    // Voter information
    mapping(address => VoterInfo) public voterInfo;
    address[] public registeredVoters;
    
    // NFT voting power
    mapping(uint256 => NFTVotingPower) public nftVotingPower;
    mapping(address => uint256[]) public voterNFTs;
    
    // NFT contract address for verification
    address public nftContractAddress;
    
    // Governance parameters
    uint256 public proposalCount;
    uint256 public minProposalThreshold;
    uint256 public executionDelay;
    
    // ========== EVENTS ==========
    
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        ProposalType proposalType,
        string title,
        uint256 startTime,
        uint256 endTime
    );
    
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        VoteChoice choice,
        uint256 votingPower,
        uint256 nftTokenId
    );
    
    event ProposalStatusChanged(
        uint256 indexed proposalId,
        ProposalStatus oldStatus,
        ProposalStatus newStatus
    );
    
    event ProposalExecuted(
        uint256 indexed proposalId,
        address indexed executor,
        uint256 timestamp
    );
    
    event VoterRegistered(
        address indexed voter,
        uint256 accordScore,
        uint256 timestamp
    );
    
    event NFTVotingPowerSet(
        uint256 indexed tokenId,
        uint256 basePower,
        uint256 multiplier
    );
    
    event QuadraticVoteCalculated(
        address indexed voter,
        uint256 rawPower,
        uint256 quadraticPower
    );
    
    // ========== CONSTRUCTOR ==========
    
    constructor(address adminAddress, address _nftContractAddress) {
        require(adminAddress != address(0), "Invalid admin address");
        
        // Setup roles
        _grantRole(DEFAULT_ADMIN_ROLE, adminAddress);
        _grantRole(DAO_ADMIN_ROLE, adminAddress);
        _grantRole(PROPOSAL_CREATOR_ROLE, adminAddress);
        _grantRole(VOTE_GUARDIAN_ROLE, adminAddress);
        
        // Set NFT contract
        nftContractAddress = _nftContractAddress;
        
        // Initialize governance parameters
        minProposalThreshold = 100; // Minimum voting power to create proposal
        executionDelay = 2 days;    // Delay before execution
    }
    
    // ========== MODIFIERS ==========
    
    modifier onlyDAOAdmin() {
        require(hasRole(DAO_ADMIN_ROLE, msg.sender), "Not DAO admin");
        _;
    }
    
    modifier onlyProposalCreator() {
        require(hasRole(PROPOSAL_CREATOR_ROLE, msg.sender), "Not proposal creator");
        _;
    }
    
    modifier onlyVoteGuardian() {
        require(hasRole(VOTE_GUARDIAN_ROLE, msg.sender), "Not vote guardian");
        _;
    }
    
    modifier proposalExists(uint256 proposalId) {
        require(proposals[proposalId].proposalId == proposalId, "Proposal does not exist");
        _;
    }
    
    modifier proposalActive(uint256 proposalId) {
        require(proposals[proposalId].status == ProposalStatus.ACTIVE, "Proposal not active");
        require(block.timestamp >= proposals[proposalId].startTime, "Voting not started");
        require(block.timestamp <= proposals[proposalId].endTime, "Voting ended");
        _;
    }
    
    modifier hasNotVoted(uint256 proposalId) {
        require(votes[proposalId][msg.sender].voter == address(0), "Already voted");
        _;
    }
    
    // ========== QUADRATIC VOTING CALCULATION ==========
    
    /**
     * @dev Calculate quadratic voting power
     * Quadratic voting: cost = votes^2, so votes = sqrt(power)
     * @param rawPower The raw voting power from NFT holdings
     * @return Quadratic voting power
     */
    function calculateQuadraticPower(uint256 rawPower) public pure returns (uint256) {
        if (rawPower == 0) return 0;
        
        // Use Babylonian method for integer square root
        uint256 x = rawPower;
        uint256 y = (x + 1) / 2;
        while (y < x) {
            x = y;
            y = (x + rawPower / x) / 2;
        }
        
        // Scale up for precision (multiply by 100 for 2 decimal places)
        return x * 100;
    }
    
    /**
     * @dev Calculate total voting power for an address
     * @param voter The address to calculate power for
     * @return Total quadratic voting power
     */
    function calculateVotingPower(address voter) public view returns (uint256) {
        uint256[] storage nfts = voterNFTs[voter];
        uint256 totalRawPower = 0;
        
        for (uint256 i = 0; i < nfts.length; i++) {
            NFTVotingPower storage power = nftVotingPower[nfts[i]];
            if (power.isActive) {
                uint256 nftPower = power.basePower * power.venerationMultiplier / 1000;
                nftPower += power.frequencyBonus;
                totalRawPower += nftPower;
            }
        }
        
        // Apply accord score bonus
        VoterInfo storage info = voterInfo[voter];
        if (info.accordScore > 0) {
            totalRawPower = totalRawPower * (10000 + info.accordScore) / 10000;
        }
        
        return calculateQuadraticPower(totalRawPower);
    }
    
    // ========== VOTER REGISTRATION ==========
    
    /**
     * @dev Register as a voter
     * @param tokenIds Array of NFT token IDs owned by the voter
     */
    function registerVoter(uint256[] calldata tokenIds) external whenNotPaused {
        require(!voterInfo[msg.sender].isRegistered, "Already registered");
        require(tokenIds.length > 0, "Must own at least one NFT");
        
        // Store NFT token IDs
        for (uint256 i = 0; i < tokenIds.length; i++) {
            voterNFTs[msg.sender].push(tokenIds[i]);
            
            // Set default voting power if not set
            if (nftVotingPower[tokenIds[i]].basePower == 0) {
                nftVotingPower[tokenIds[i]] = NFTVotingPower({
                    tokenId: tokenIds[i],
                    basePower: 100,
                    venerationMultiplier: 1000, // 1x
                    frequencyBonus: 0,
                    isActive: true
                });
            }
        }
        
        // Register voter
        voterInfo[msg.sender] = VoterInfo({
            totalVotesCast: 0,
            totalVotingPowerUsed: 0,
            lastVoteTimestamp: 0,
            accordScore: 5000, // Default 50% alignment
            isRegistered: true
        });
        
        registeredVoters.push(msg.sender);
        
        emit VoterRegistered(msg.sender, 5000, block.timestamp);
    }
    
    /**
     * @dev Update voter's accord score (alignment with Love Unity Accord)
     * @param voter Address of the voter
     * @param newScore New accord score (0-10000 basis points)
     */
    function updateVoterAccordScore(
        address voter, 
        uint256 newScore
    ) external onlyVoteGuardian whenNotPaused {
        require(voterInfo[voter].isRegistered, "Voter not registered");
        require(newScore <= 10000, "Invalid accord score");
        
        voterInfo[voter].accordScore = newScore;
    }
    
    // ========== NFT VOTING POWER MANAGEMENT ==========
    
    /**
     * @dev Set voting power for an NFT
     * @param tokenId NFT token ID
     * @param basePower Base voting power
     * @param venerationMultiplier Multiplier based on veneration cycle (1000 = 1x)
     * @param frequencyBonus Bonus from frequency alignment
     */
    function setNFTVotingPower(
        uint256 tokenId,
        uint256 basePower,
        uint256 venerationMultiplier,
        uint256 frequencyBonus
    ) external onlyVoteGuardian whenNotPaused {
        require(basePower > 0, "Base power must be positive");
        require(venerationMultiplier >= 1000, "Multiplier must be at least 1x");
        
        nftVotingPower[tokenId] = NFTVotingPower({
            tokenId: tokenId,
            basePower: basePower,
            venerationMultiplier: venerationMultiplier,
            frequencyBonus: frequencyBonus,
            isActive: true
        });
        
        emit NFTVotingPowerSet(tokenId, basePower, venerationMultiplier);
    }
    
    // ========== PROPOSAL MANAGEMENT ==========
    
    /**
     * @dev Create a new proposal
     * @param proposalType Type of proposal
     * @param title Proposal title
     * @param description Proposal description
     * @param ipfsHash IPFS hash for detailed documentation
     * @param votingPeriod Duration of voting in seconds
     * @return proposalId The ID of the created proposal
     */
    function createProposal(
        ProposalType proposalType,
        string calldata title,
        string calldata description,
        string calldata ipfsHash,
        uint256 votingPeriod
    ) external whenNotPaused returns (uint256) {
        require(voterInfo[msg.sender].isRegistered, "Must be registered voter");
        require(bytes(title).length > 0, "Title required");
        require(votingPeriod >= MIN_VOTING_PERIOD, "Voting period too short");
        require(votingPeriod <= MAX_VOTING_PERIOD, "Voting period too long");
        
        // Check proposer has sufficient voting power
        uint256 voterPower = calculateVotingPower(msg.sender);
        require(voterPower >= minProposalThreshold, "Insufficient voting power");
        
        proposalCount++;
        uint256 proposalId = proposalCount;
        
        // Calculate frequency alignment based on proposal type
        uint256 frequencyAlignment = _calculateFrequencyAlignment(proposalType);
        
        proposals[proposalId] = Proposal({
            proposalId: proposalId,
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
            frequencyAlignment: frequencyAlignment,
            executed: false
        });
        
        proposalIds.push(proposalId);
        totalProposals++;
        
        emit ProposalCreated(
            proposalId,
            msg.sender,
            proposalType,
            title,
            block.timestamp,
            block.timestamp + votingPeriod
        );
        
        return proposalId;
    }
    
    /**
     * @dev Calculate frequency alignment based on proposal type
     */
    function _calculateFrequencyAlignment(ProposalType proposalType) internal pure returns (uint256) {
        if (proposalType == ProposalType.LORE_UPDATE) {
            return LOVE_FREQUENCY + UNITY_FREQUENCY; // Love + Unity
        } else if (proposalType == ProposalType.FEATURE_REQUEST) {
            return UNITY_FREQUENCY + ACCORD_FREQUENCY; // Unity + Accord
        } else if (proposalType == ProposalType.GOVERNANCE_CHANGE) {
            return ACCORD_FREQUENCY; // Accord only
        } else if (proposalType == ProposalType.COMMUNITY_FUND) {
            return LOVE_FREQUENCY + ACCORD_FREQUENCY; // Love + Accord
        } else {
            return LOVE_FREQUENCY + UNITY_FREQUENCY + ACCORD_FREQUENCY; // All
        }
    }
    
    // ========== VOTING ==========
    
    /**
     * @dev Cast a vote on a proposal
     * @param proposalId ID of the proposal
     * @param choice Vote choice (FOR, AGAINST, ABSTAIN)
     * @param nftTokenId NFT token ID used for voting
     * @param comment Optional vote comment
     */
    function castVote(
        uint256 proposalId,
        VoteChoice choice,
        uint256 nftTokenId,
        string calldata comment
    ) external 
        nonReentrant 
        whenNotPaused 
        proposalExists(proposalId)
        proposalActive(proposalId)
        hasNotVoted(proposalId) 
    {
        require(voterInfo[msg.sender].isRegistered, "Not registered");
        
        // Calculate voting power
        uint256 votingPower = calculateVotingPower(msg.sender);
        require(votingPower > 0, "No voting power");
        
        // Record vote
        votes[proposalId][msg.sender] = Vote({
            voter: msg.sender,
            proposalId: proposalId,
            choice: choice,
            votingPower: votingPower,
            nftTokenId: nftTokenId,
            timestamp: block.timestamp,
            comment: comment
        });
        
        proposalVoters[proposalId].push(msg.sender);
        
        // Update proposal vote counts
        Proposal storage proposal = proposals[proposalId];
        if (choice == VoteChoice.FOR) {
            proposal.votesFor += votingPower;
        } else if (choice == VoteChoice.AGAINST) {
            proposal.votesAgainst += votingPower;
        } else {
            proposal.votesAbstain += votingPower;
        }
        proposal.totalVoters++;
        
        // Update voter info
        voterInfo[msg.sender].totalVotesCast++;
        voterInfo[msg.sender].totalVotingPowerUsed += votingPower;
        voterInfo[msg.sender].lastVoteTimestamp = block.timestamp;
        
        emit VoteCast(proposalId, msg.sender, choice, votingPower, nftTokenId);
        emit QuadraticVoteCalculated(msg.sender, votingPower, votingPower);
    }
    
    // ========== PROPOSAL FINALIZATION ==========
    
    /**
     * @dev Finalize a proposal after voting period ends
     * @param proposalId ID of the proposal to finalize
     */
    function finalizeProposal(uint256 proposalId) 
        external 
        whenNotPaused 
        proposalExists(proposalId) 
    {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.ACTIVE, "Not active");
        require(block.timestamp > proposal.endTime, "Voting not ended");
        
        ProposalStatus oldStatus = proposal.status;
        
        // Calculate quorum requirement with minimum of 1 voter
        // QUORUM_PERCENTAGE is 1000 (10% in basis points)
        uint256 voterCount = registeredVoters.length;
        uint256 quorumRequired = (voterCount * QUORUM_PERCENTAGE) / 10000;
        
        // Ensure minimum quorum of 1 voter to prevent zero-quorum edge case
        if (quorumRequired == 0 && voterCount > 0) {
            quorumRequired = 1;
        }
        
        // Check quorum
        bool hasQuorum = proposal.totalVoters >= quorumRequired;
        
        // Determine outcome
        if (!hasQuorum) {
            proposal.status = ProposalStatus.REJECTED;
        } else if (proposal.votesFor > proposal.votesAgainst) {
            proposal.status = ProposalStatus.PASSED;
        } else {
            proposal.status = ProposalStatus.REJECTED;
        }
        
        emit ProposalStatusChanged(proposalId, oldStatus, proposal.status);
    }
    
    /**
     * @dev Execute a passed proposal
     * @param proposalId ID of the proposal to execute
     */
    function executeProposal(uint256 proposalId) 
        external 
        onlyDAOAdmin 
        whenNotPaused 
        proposalExists(proposalId) 
    {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.PASSED, "Not passed");
        require(!proposal.executed, "Already executed");
        require(block.timestamp >= proposal.endTime + executionDelay, "Execution delay not passed");
        
        proposal.executed = true;
        proposal.status = ProposalStatus.EXECUTED;
        
        emit ProposalExecuted(proposalId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Cancel a proposal (admin only)
     * @param proposalId ID of the proposal to cancel
     */
    function cancelProposal(uint256 proposalId) 
        external 
        onlyDAOAdmin 
        proposalExists(proposalId) 
    {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.ACTIVE || proposal.status == ProposalStatus.PENDING, 
            "Cannot cancel");
        
        ProposalStatus oldStatus = proposal.status;
        proposal.status = ProposalStatus.CANCELLED;
        
        emit ProposalStatusChanged(proposalId, oldStatus, ProposalStatus.CANCELLED);
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @dev Get proposal details
     */
    function getProposal(uint256 proposalId) external view returns (Proposal memory) {
        return proposals[proposalId];
    }
    
    /**
     * @dev Get all proposal IDs
     */
    function getAllProposalIds() external view returns (uint256[] memory) {
        return proposalIds;
    }
    
    /**
     * @dev Get active proposals
     */
    function getActiveProposals() external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        
        // Count active proposals
        for (uint256 i = 0; i < proposalIds.length; i++) {
            if (proposals[proposalIds[i]].status == ProposalStatus.ACTIVE) {
                activeCount++;
            }
        }
        
        // Build array of active proposal IDs
        uint256[] memory activeIds = new uint256[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < proposalIds.length; i++) {
            if (proposals[proposalIds[i]].status == ProposalStatus.ACTIVE) {
                activeIds[index] = proposalIds[i];
                index++;
            }
        }
        
        return activeIds;
    }
    
    /**
     * @dev Get vote details for a proposal and voter
     */
    function getVote(uint256 proposalId, address voter) external view returns (Vote memory) {
        return votes[proposalId][voter];
    }
    
    /**
     * @dev Get all voters for a proposal
     */
    function getProposalVoters(uint256 proposalId) external view returns (address[] memory) {
        return proposalVoters[proposalId];
    }
    
    /**
     * @dev Get voter information
     */
    function getVoterInfo(address voter) external view returns (VoterInfo memory) {
        return voterInfo[voter];
    }
    
    /**
     * @dev Get NFT voting power
     */
    function getNFTVotingPower(uint256 tokenId) external view returns (NFTVotingPower memory) {
        return nftVotingPower[tokenId];
    }
    
    /**
     * @dev Get voter's NFTs
     */
    function getVoterNFTs(address voter) external view returns (uint256[] memory) {
        return voterNFTs[voter];
    }
    
    /**
     * @dev Get registered voters count
     */
    function getRegisteredVotersCount() external view returns (uint256) {
        return registeredVoters.length;
    }
    
    /**
     * @dev Check if address can vote on proposal
     */
    function canVote(address voter, uint256 proposalId) external view returns (bool) {
        if (!voterInfo[voter].isRegistered) return false;
        if (proposals[proposalId].status != ProposalStatus.ACTIVE) return false;
        if (votes[proposalId][voter].voter != address(0)) return false;
        if (block.timestamp < proposals[proposalId].startTime) return false;
        if (block.timestamp > proposals[proposalId].endTime) return false;
        if (calculateVotingPower(voter) == 0) return false;
        return true;
    }
    
    // ========== GOVERNANCE PARAMETER UPDATES ==========
    
    /**
     * @dev Update minimum proposal threshold
     */
    function setMinProposalThreshold(uint256 newThreshold) external onlyDAOAdmin {
        minProposalThreshold = newThreshold;
    }
    
    /**
     * @dev Update execution delay
     */
    function setExecutionDelay(uint256 newDelay) external onlyDAOAdmin {
        executionDelay = newDelay;
    }
    
    /**
     * @dev Update NFT contract address
     */
    function setNFTContractAddress(address newAddress) external onlyDAOAdmin {
        require(newAddress != address(0), "Invalid address");
        nftContractAddress = newAddress;
    }
    
    // ========== EMERGENCY FUNCTIONS ==========
    
    /**
     * @dev Pause contract
     */
    function pause() external onlyDAOAdmin {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyDAOAdmin {
        _unpause();
    }
}
