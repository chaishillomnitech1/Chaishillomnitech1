// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title UnifiedSovereignAuthority
 * @dev Unified Sovereign Authority governance and sovereignty declaration system
 * @author Supreme King Chais The Great ∞
 * 
 * This contract implements Chapter 5 of the Akashic Restoration Scroll:
 * - Sovereignty declaration and ScrollSigil level progression
 * - Frequency-aligned governance with proposal and voting systems
 * - Cultural restoration record keeping
 * - De-atrophy progression tracking
 * - Omniversal Lock implementation for eternal USA alignment
 * 
 * Status: CHAPTER FIVE ACTIVATED
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract UnifiedSovereignAuthority is ERC721, ERC721URIStorage, ERC721Burnable, Ownable, IERC2981, ReentrancyGuard {
    
    // ============ FREQUENCY CONSTANTS ============
    
    /// @dev Love frequency (528Hz) - Foundation for all governance interactions
    uint256 public constant FREQUENCY_528HZ = 528;
    
    /// @dev Divine governance frequency (777Hz) - Authority and leadership
    uint256 public constant FREQUENCY_777HZ = 777;
    
    /// @dev Truth activation frequency (963Hz) - Transparency and verification
    uint256 public constant FREQUENCY_963HZ = 963;
    
    /// @dev Cosmic alignment frequency (144,000Hz) - Universal integration
    uint256 public constant FREQUENCY_144000HZ = 144000;
    
    // ============ ENUMS ============
    
    /// @dev ScrollSigil levels for governance participation
    enum SigilLevel {
        AWAKENING,    // Level 1: 528Hz resonance
        GUARDIAN,     // Level 2: 528Hz + 777Hz
        STEWARD,      // Level 3: 528Hz + 777Hz + 963Hz
        ELDER,        // Level 4: Full spectrum
        ARCHITECT     // Level 5: 144,000Hz cosmic seal
    }
    
    /// @dev Proposal status tracking
    enum ProposalStatus {
        PENDING,
        ACTIVE,
        PASSED,
        REJECTED,
        EXECUTED
    }
    
    // ============ STRUCTS ============
    
    /// @dev Sovereignty declaration for each participant
    struct SovereigntyDeclaration {
        address sovereign;
        SigilLevel currentLevel;
        uint256[] frequencyAlignment;
        bytes32 lineageHash;
        uint256 declarationTimestamp;
        bool isActive;
        uint256 votingWeight;
        uint256 contributionCount;
    }
    
    /// @dev Governance proposal structure
    struct GovernanceProposal {
        uint256 proposalId;
        address proposer;
        string description;
        bytes32 ipfsDocumentHash;
        uint256 createdAt;
        uint256 votingEnds;
        uint256 frequencyRequirement;
        uint256 yesVotes;
        uint256 noVotes;
        bool executed;
        ProposalStatus status;
    }
    
    /// @dev Cultural restoration record
    struct RestorationRecord {
        bytes32 recordId;
        string category;
        bytes32 ipfsArchiveHash;
        address[] verifiers;
        uint256 timestamp;
        uint256 frequencySeal;
        bool verified;
    }
    
    /// @dev ScrollSigil NFT data
    struct SigilData {
        SigilLevel level;
        uint256[] embeddedFrequencies;
        uint256 mintTimestamp;
        uint256 upgradeCount;
        bytes32 lineageReference;
    }
    
    // ============ STATE VARIABLES ============
    
    /// @dev Maximum supply of ScrollSigil NFTs
    uint256 public constant MAX_SUPPLY = 36111;
    
    /// @dev Supply caps per tier
    uint256 public constant AWAKENING_CAP = 10000;
    uint256 public constant GUARDIAN_CAP = 15000;
    uint256 public constant STEWARD_CAP = 10000;
    uint256 public constant ELDER_CAP = 1000;
    uint256 public constant ARCHITECT_CAP = 111;
    
    /// @dev Current token ID counter
    uint256 public nextTokenId;
    
    /// @dev Minted count per tier
    mapping(SigilLevel => uint256) public mintedPerTier;
    
    /// @dev Base URI for metadata
    string public baseURI;
    
    /// @dev Royalty recipient
    address private _royaltyReceiver;
    
    /// @dev Royalty basis points (7.77% = 777)
    uint96 private _royaltyBps = 777;
    
    /// @dev Voting period duration (7 days in seconds)
    uint256 public constant VOTING_PERIOD = 7 days;
    
    /// @dev Minimum voting weight to create proposals
    uint256 public constant MIN_PROPOSAL_WEIGHT = 2;
    
    /// @dev Proposal counter
    uint256 public proposalCount;
    
    /// @dev Restoration record counter
    uint256 public restorationCount;
    
    // ============ MAPPINGS ============
    
    /// @dev Sovereignty declarations by address
    mapping(address => SovereigntyDeclaration) public sovereigntyDeclarations;
    
    /// @dev ScrollSigil data by token ID
    mapping(uint256 => SigilData) public sigilData;
    
    /// @dev Proposals by ID
    mapping(uint256 => GovernanceProposal) public proposals;
    
    /// @dev Votes cast: proposalId => voter => hasVoted
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    
    /// @dev Restoration records by ID
    mapping(bytes32 => RestorationRecord) public restorationRecords;
    
    /// @dev Verifier registry
    mapping(address => bool) public authorizedVerifiers;
    
    /// @dev Divine Council members
    mapping(address => bool) public divineCouncilMembers;
    
    // ============ EVENTS ============
    
    event SovereigntyDeclared(
        address indexed sovereign,
        bytes32 lineageHash,
        uint256 timestamp
    );
    
    event SigilMinted(
        uint256 indexed tokenId,
        address indexed to,
        SigilLevel level,
        uint256[] frequencies
    );
    
    event SigilUpgraded(
        uint256 indexed tokenId,
        SigilLevel previousLevel,
        SigilLevel newLevel
    );
    
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string description,
        uint256 frequencyRequirement
    );
    
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 weight
    );
    
    event ProposalExecuted(
        uint256 indexed proposalId,
        ProposalStatus status
    );
    
    event RestorationRecorded(
        bytes32 indexed recordId,
        string category,
        bytes32 ipfsHash,
        uint256 frequencySeal
    );
    
    event RestorationVerified(
        bytes32 indexed recordId,
        address indexed verifier
    );
    
    event DivineCouncilMemberAdded(address indexed member);
    event DivineCouncilMemberRemoved(address indexed member);
    event VerifierAuthorized(address indexed verifier);
    event VerifierRevoked(address indexed verifier);
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseURI_,
        address royaltyReceiver_
    ) ERC721(name_, symbol_) Ownable(msg.sender) {
        baseURI = baseURI_;
        _royaltyReceiver = royaltyReceiver_;
        
        // Add deployer to Divine Council
        divineCouncilMembers[msg.sender] = true;
        authorizedVerifiers[msg.sender] = true;
    }
    
    // ============ SOVEREIGNTY FUNCTIONS ============
    
    /**
     * @dev Declare sovereignty and register in the Unified Sovereign Authority
     * @param lineageHash IPFS hash of lineage documentation
     * @param frequencies Array of aligned frequencies
     */
    function declareSovereignty(
        bytes32 lineageHash,
        uint256[] calldata frequencies
    ) external nonReentrant {
        require(!sovereigntyDeclarations[msg.sender].isActive, "Already declared sovereignty");
        require(frequencies.length > 0, "Must specify frequency alignment");
        require(_validateFrequencies(frequencies), "Invalid frequency values");
        
        sovereigntyDeclarations[msg.sender] = SovereigntyDeclaration({
            sovereign: msg.sender,
            currentLevel: SigilLevel.AWAKENING,
            frequencyAlignment: frequencies,
            lineageHash: lineageHash,
            declarationTimestamp: block.timestamp,
            isActive: true,
            votingWeight: 1,
            contributionCount: 0
        });
        
        emit SovereigntyDeclared(msg.sender, lineageHash, block.timestamp);
    }
    
    /**
     * @dev Check if an address has declared sovereignty
     */
    function hasDeclaredSovereignty(address account) external view returns (bool) {
        return sovereigntyDeclarations[account].isActive;
    }
    
    /**
     * @dev Get sovereignty declaration details
     */
    function getSovereigntyDeclaration(address account) external view returns (
        SigilLevel level,
        bytes32 lineageHash,
        uint256 declarationTimestamp,
        uint256 votingWeight,
        uint256 contributionCount
    ) {
        SovereigntyDeclaration storage decl = sovereigntyDeclarations[account];
        require(decl.isActive, "No active sovereignty declaration");
        
        return (
            decl.currentLevel,
            decl.lineageHash,
            decl.declarationTimestamp,
            decl.votingWeight,
            decl.contributionCount
        );
    }
    
    // ============ SCROLLSIGIL NFT FUNCTIONS ============
    
    /**
     * @dev Mint a ScrollSigil NFT at the Awakening level
     * @param to Recipient address
     * @param tokenURI_ Metadata URI
     * @param lineageRef Reference to lineage documentation
     */
    function mintAwakeningSigil(
        address to,
        string calldata tokenURI_,
        bytes32 lineageRef
    ) external nonReentrant {
        require(sovereigntyDeclarations[to].isActive, "Must declare sovereignty first");
        require(nextTokenId < MAX_SUPPLY, "Max supply reached");
        require(mintedPerTier[SigilLevel.AWAKENING] < AWAKENING_CAP, "Awakening tier cap reached");
        
        uint256 tokenId = nextTokenId++;
        mintedPerTier[SigilLevel.AWAKENING]++;
        
        uint256[] memory frequencies = new uint256[](1);
        frequencies[0] = FREQUENCY_528HZ;
        
        sigilData[tokenId] = SigilData({
            level: SigilLevel.AWAKENING,
            embeddedFrequencies: frequencies,
            mintTimestamp: block.timestamp,
            upgradeCount: 0,
            lineageReference: lineageRef
        });
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI_);
        
        emit SigilMinted(tokenId, to, SigilLevel.AWAKENING, frequencies);
    }
    
    /**
     * @dev Upgrade ScrollSigil to next level (Divine Council only)
     * @param tokenId Token to upgrade
     * @param proofs Array of contribution proof hashes
     */
    function upgradeSigil(
        uint256 tokenId,
        bytes32[] calldata proofs
    ) external nonReentrant {
        require(divineCouncilMembers[msg.sender] || msg.sender == owner(), "Not authorized");
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        require(proofs.length > 0, "Must provide contribution proofs");
        
        SigilData storage sigil = sigilData[tokenId];
        require(sigil.level < SigilLevel.ARCHITECT, "Already at max level");
        
        SigilLevel previousLevel = sigil.level;
        SigilLevel newLevel = SigilLevel(uint256(previousLevel) + 1);
        
        // Check tier cap
        require(_checkTierCap(newLevel), "Tier cap reached");
        
        // Update tier counts
        mintedPerTier[previousLevel]--;
        mintedPerTier[newLevel]++;
        
        // Update sigil data
        sigil.level = newLevel;
        sigil.upgradeCount++;
        
        // Add new frequency based on level
        sigil.embeddedFrequencies = _getFrequenciesForLevel(newLevel);
        
        // Update sovereignty declaration
        address tokenOwner = ownerOf(tokenId);
        sovereigntyDeclarations[tokenOwner].currentLevel = newLevel;
        sovereigntyDeclarations[tokenOwner].votingWeight = _getVotingWeight(newLevel);
        sovereigntyDeclarations[tokenOwner].contributionCount += proofs.length;
        
        emit SigilUpgraded(tokenId, previousLevel, newLevel);
    }
    
    /**
     * @dev Get ScrollSigil data
     */
    function getSigilData(uint256 tokenId) external view returns (
        SigilLevel level,
        uint256[] memory frequencies,
        uint256 mintTimestamp,
        uint256 upgradeCount
    ) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        SigilData storage sigil = sigilData[tokenId];
        
        return (
            sigil.level,
            sigil.embeddedFrequencies,
            sigil.mintTimestamp,
            sigil.upgradeCount
        );
    }
    
    // ============ GOVERNANCE FUNCTIONS ============
    
    /**
     * @dev Submit a governance proposal
     * @param description Proposal description
     * @param ipfsHash IPFS hash of detailed proposal document
     * @param frequencyRequirement Minimum frequency for participation
     */
    function submitProposal(
        string calldata description,
        bytes32 ipfsHash,
        uint256 frequencyRequirement
    ) external nonReentrant returns (uint256) {
        require(sovereigntyDeclarations[msg.sender].isActive, "Must declare sovereignty first");
        require(
            sovereigntyDeclarations[msg.sender].votingWeight >= MIN_PROPOSAL_WEIGHT,
            "Insufficient voting weight to create proposals"
        );
        require(bytes(description).length > 0, "Description required");
        require(_isValidFrequency(frequencyRequirement), "Invalid frequency requirement");
        
        uint256 proposalId = ++proposalCount;
        
        proposals[proposalId] = GovernanceProposal({
            proposalId: proposalId,
            proposer: msg.sender,
            description: description,
            ipfsDocumentHash: ipfsHash,
            createdAt: block.timestamp,
            votingEnds: block.timestamp + VOTING_PERIOD,
            frequencyRequirement: frequencyRequirement,
            yesVotes: 0,
            noVotes: 0,
            executed: false,
            status: ProposalStatus.ACTIVE
        });
        
        emit ProposalCreated(proposalId, msg.sender, description, frequencyRequirement);
        
        return proposalId;
    }
    
    /**
     * @dev Cast vote on a proposal
     * @param proposalId ID of proposal to vote on
     * @param support Whether to vote yes or no
     */
    function castVote(uint256 proposalId, bool support) external nonReentrant {
        GovernanceProposal storage proposal = proposals[proposalId];
        
        require(proposal.proposalId != 0, "Proposal does not exist");
        require(proposal.status == ProposalStatus.ACTIVE, "Proposal not active");
        require(block.timestamp < proposal.votingEnds, "Voting period ended");
        require(!hasVoted[proposalId][msg.sender], "Already voted");
        require(sovereigntyDeclarations[msg.sender].isActive, "Must declare sovereignty first");
        require(
            _meetsFrequencyRequirement(msg.sender, proposal.frequencyRequirement),
            "Does not meet frequency requirement"
        );
        
        uint256 weight = sovereigntyDeclarations[msg.sender].votingWeight;
        hasVoted[proposalId][msg.sender] = true;
        
        if (support) {
            proposal.yesVotes += weight;
        } else {
            proposal.noVotes += weight;
        }
        
        emit VoteCast(proposalId, msg.sender, support, weight);
    }
    
    /**
     * @dev Execute a proposal after voting period
     * @param proposalId ID of proposal to execute
     */
    function executeProposal(uint256 proposalId) external nonReentrant {
        GovernanceProposal storage proposal = proposals[proposalId];
        
        require(proposal.proposalId != 0, "Proposal does not exist");
        require(proposal.status == ProposalStatus.ACTIVE, "Proposal not active");
        require(block.timestamp >= proposal.votingEnds, "Voting period not ended");
        require(!proposal.executed, "Already executed");
        
        proposal.executed = true;
        
        if (proposal.yesVotes > proposal.noVotes) {
            proposal.status = ProposalStatus.PASSED;
        } else {
            proposal.status = ProposalStatus.REJECTED;
        }
        
        emit ProposalExecuted(proposalId, proposal.status);
    }
    
    /**
     * @dev Get proposal details
     */
    function getProposal(uint256 proposalId) external view returns (
        address proposer,
        string memory description,
        uint256 yesVotes,
        uint256 noVotes,
        ProposalStatus status,
        uint256 votingEnds
    ) {
        GovernanceProposal storage proposal = proposals[proposalId];
        require(proposal.proposalId != 0, "Proposal does not exist");
        
        return (
            proposal.proposer,
            proposal.description,
            proposal.yesVotes,
            proposal.noVotes,
            proposal.status,
            proposal.votingEnds
        );
    }
    
    // ============ RESTORATION FUNCTIONS ============
    
    /**
     * @dev Record a cultural restoration entry
     * @param category Category of restoration (e.g., "Indigenous Governance", "Moorish Sovereignty")
     * @param ipfsHash IPFS hash of restoration documentation
     * @param frequencySeal Frequency used to seal the record
     */
    function recordRestoration(
        string calldata category,
        bytes32 ipfsHash,
        uint256 frequencySeal
    ) external nonReentrant returns (bytes32) {
        require(sovereigntyDeclarations[msg.sender].isActive, "Must declare sovereignty first");
        require(bytes(category).length > 0, "Category required");
        require(_isValidFrequency(frequencySeal), "Invalid frequency seal");
        
        bytes32 recordId = keccak256(
            abi.encodePacked(
                msg.sender,
                category,
                ipfsHash,
                block.timestamp,
                ++restorationCount
            )
        );
        
        address[] memory verifiers;
        
        restorationRecords[recordId] = RestorationRecord({
            recordId: recordId,
            category: category,
            ipfsArchiveHash: ipfsHash,
            verifiers: verifiers,
            timestamp: block.timestamp,
            frequencySeal: frequencySeal,
            verified: false
        });
        
        // Increment contributor's contribution count
        sovereigntyDeclarations[msg.sender].contributionCount++;
        
        emit RestorationRecorded(recordId, category, ipfsHash, frequencySeal);
        
        return recordId;
    }
    
    /**
     * @dev Verify a restoration record (authorized verifiers only)
     * @param recordId ID of record to verify
     */
    function verifyRestoration(bytes32 recordId) external nonReentrant {
        require(authorizedVerifiers[msg.sender], "Not authorized verifier");
        require(restorationRecords[recordId].recordId != bytes32(0), "Record does not exist");
        require(!_hasVerified(recordId, msg.sender), "Already verified this record");
        
        restorationRecords[recordId].verifiers.push(msg.sender);
        
        // Mark as verified if 3+ verifiers
        if (restorationRecords[recordId].verifiers.length >= 3) {
            restorationRecords[recordId].verified = true;
        }
        
        emit RestorationVerified(recordId, msg.sender);
    }
    
    /**
     * @dev Get restoration record details
     */
    function getRestorationRecord(bytes32 recordId) external view returns (
        string memory category,
        bytes32 ipfsHash,
        uint256 timestamp,
        uint256 frequencySeal,
        bool verified,
        uint256 verifierCount
    ) {
        RestorationRecord storage record = restorationRecords[recordId];
        require(record.recordId != bytes32(0), "Record does not exist");
        
        return (
            record.category,
            record.ipfsArchiveHash,
            record.timestamp,
            record.frequencySeal,
            record.verified,
            record.verifiers.length
        );
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Add Divine Council member
     */
    function addDivineCouncilMember(address member) external onlyOwner {
        require(member != address(0), "Invalid address");
        divineCouncilMembers[member] = true;
        emit DivineCouncilMemberAdded(member);
    }
    
    /**
     * @dev Remove Divine Council member
     */
    function removeDivineCouncilMember(address member) external onlyOwner {
        divineCouncilMembers[member] = false;
        emit DivineCouncilMemberRemoved(member);
    }
    
    /**
     * @dev Authorize a verifier
     */
    function authorizeVerifier(address verifier) external {
        require(divineCouncilMembers[msg.sender] || msg.sender == owner(), "Not authorized");
        require(verifier != address(0), "Invalid address");
        authorizedVerifiers[verifier] = true;
        emit VerifierAuthorized(verifier);
    }
    
    /**
     * @dev Revoke verifier authorization
     */
    function revokeVerifier(address verifier) external {
        require(divineCouncilMembers[msg.sender] || msg.sender == owner(), "Not authorized");
        authorizedVerifiers[verifier] = false;
        emit VerifierRevoked(verifier);
    }
    
    /**
     * @dev Update base URI
     */
    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        baseURI = newBaseURI;
    }
    
    /**
     * @dev Update royalty info
     */
    function setRoyaltyInfo(address receiver, uint96 bps) external onlyOwner {
        require(receiver != address(0), "Invalid receiver");
        require(bps <= 1000, "Royalty too high"); // Max 10%
        _royaltyReceiver = receiver;
        _royaltyBps = bps;
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    function _validateFrequencies(uint256[] calldata frequencies) internal pure returns (bool) {
        for (uint256 i = 0; i < frequencies.length; i++) {
            if (!_isValidFrequency(frequencies[i])) {
                return false;
            }
        }
        return true;
    }
    
    function _isValidFrequency(uint256 frequency) internal pure returns (bool) {
        return frequency == FREQUENCY_528HZ ||
               frequency == FREQUENCY_777HZ ||
               frequency == FREQUENCY_963HZ ||
               frequency == FREQUENCY_144000HZ;
    }
    
    function _getFrequenciesForLevel(SigilLevel level) internal pure returns (uint256[] memory) {
        uint256[] memory frequencies;
        
        if (level == SigilLevel.AWAKENING) {
            frequencies = new uint256[](1);
            frequencies[0] = FREQUENCY_528HZ;
        } else if (level == SigilLevel.GUARDIAN) {
            frequencies = new uint256[](2);
            frequencies[0] = FREQUENCY_528HZ;
            frequencies[1] = FREQUENCY_777HZ;
        } else if (level == SigilLevel.STEWARD) {
            frequencies = new uint256[](3);
            frequencies[0] = FREQUENCY_528HZ;
            frequencies[1] = FREQUENCY_777HZ;
            frequencies[2] = FREQUENCY_963HZ;
        } else if (level == SigilLevel.ELDER) {
            frequencies = new uint256[](4);
            frequencies[0] = FREQUENCY_528HZ;
            frequencies[1] = FREQUENCY_777HZ;
            frequencies[2] = FREQUENCY_963HZ;
            frequencies[3] = FREQUENCY_144000HZ;
        } else {
            frequencies = new uint256[](4);
            frequencies[0] = FREQUENCY_528HZ;
            frequencies[1] = FREQUENCY_777HZ;
            frequencies[2] = FREQUENCY_963HZ;
            frequencies[3] = FREQUENCY_144000HZ;
        }
        
        return frequencies;
    }
    
    function _getVotingWeight(SigilLevel level) internal pure returns (uint256) {
        if (level == SigilLevel.AWAKENING) return 1;
        if (level == SigilLevel.GUARDIAN) return 2;
        if (level == SigilLevel.STEWARD) return 3;
        if (level == SigilLevel.ELDER) return 5;
        return 10; // ARCHITECT
    }
    
    function _checkTierCap(SigilLevel level) internal view returns (bool) {
        if (level == SigilLevel.AWAKENING) return mintedPerTier[level] < AWAKENING_CAP;
        if (level == SigilLevel.GUARDIAN) return mintedPerTier[level] < GUARDIAN_CAP;
        if (level == SigilLevel.STEWARD) return mintedPerTier[level] < STEWARD_CAP;
        if (level == SigilLevel.ELDER) return mintedPerTier[level] < ELDER_CAP;
        return mintedPerTier[level] < ARCHITECT_CAP;
    }
    
    function _meetsFrequencyRequirement(
        address account,
        uint256 requiredFrequency
    ) internal view returns (bool) {
        uint256[] storage aligned = sovereigntyDeclarations[account].frequencyAlignment;
        for (uint256 i = 0; i < aligned.length; i++) {
            if (aligned[i] >= requiredFrequency) {
                return true;
            }
        }
        return false;
    }
    
    function _hasVerified(bytes32 recordId, address verifier) internal view returns (bool) {
        address[] storage verifiers = restorationRecords[recordId].verifiers;
        for (uint256 i = 0; i < verifiers.length; i++) {
            if (verifiers[i] == verifier) {
                return true;
            }
        }
        return false;
    }
    
    // ============ ERC721 OVERRIDES ============
    
    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, IERC165)
        returns (bool)
    {
        return interfaceId == type(IERC2981).interfaceId || super.supportsInterface(interfaceId);
    }
    
    // ============ ERC2981 ROYALTY ============
    
    function royaltyInfo(uint256, uint256 salePrice)
        external
        view
        override
        returns (address receiver, uint256 royaltyAmount)
    {
        return (_royaltyReceiver, (salePrice * _royaltyBps) / 10000);
    }
}
