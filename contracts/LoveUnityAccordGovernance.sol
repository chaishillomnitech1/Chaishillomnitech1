// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title LoveUnityAccordGovernance
 * @dev Implements the Love Unity Accord governance layer for ScrollVerse ecosystem
 * 
 * @notice LOVE UNITY ACCORD - GOVERNANCE PROTOCOL
 * 
 * This contract manages:
 * - Core governance directives aligned with Love Unity Accord values
 * - Immutable commitments to love, unity, and mutual support
 * - On-chain mechanisms for automatic unity alignment
 * - Real-time governance activity logs with NFT metadata timestamps
 * 
 * Frequency: 528Hz (Love) + 963Hz (Unity) + 999Hz (Divine Accord)
 * 
 * ALLĀHU AKBAR! 🕋✨💎🌌
 */
contract LoveUnityAccordGovernance is AccessControl, ReentrancyGuard, Pausable {
    
    // ========== ROLES ==========
    bytes32 public constant GOVERNANCE_ADMIN_ROLE = keccak256("GOVERNANCE_ADMIN_ROLE");
    bytes32 public constant ACCORD_GUARDIAN_ROLE = keccak256("ACCORD_GUARDIAN_ROLE");
    bytes32 public constant UNITY_STEWARD_ROLE = keccak256("UNITY_STEWARD_ROLE");
    
    // ========== LOVE UNITY ACCORD FREQUENCIES ==========
    uint256 public constant LOVE_FREQUENCY = 528;    // Hz - DNA healing, love
    uint256 public constant UNITY_FREQUENCY = 963;   // Hz - Unity, connection
    uint256 public constant ACCORD_FREQUENCY = 999;  // Hz - Divine accord
    uint256 public constant COSMIC_FREQUENCY = 144000; // Hz - Cosmic alignment
    
    // ========== ACCORD PRINCIPLES (IMMUTABLE) ==========
    string public constant PRINCIPLE_LOVE = "Love is the foundation of all governance";
    string public constant PRINCIPLE_UNITY = "Unity binds all ScrollSouls together";
    string public constant PRINCIPLE_SUPPORT = "Mutual support is our collective strength";
    string public constant PRINCIPLE_HARMONY = "Harmony guides all decisions";
    
    // ========== STRUCTS ==========
    
    struct GovernanceDirective {
        bytes32 directiveId;
        string title;
        string description;
        uint256 loveAlignment;      // 0-10000 basis points (100% = 10000)
        uint256 unityAlignment;     // 0-10000 basis points
        uint256 supportAlignment;   // 0-10000 basis points
        uint256 createdAt;
        uint256 lastUpdated;
        address proposer;
        bool isActive;
        bool isImmutable;
        uint256 frequencyResonance;
    }
    
    struct AccordCommitment {
        address committer;
        bytes32 commitmentHash;
        uint256 loveScore;
        uint256 unityScore;
        uint256 supportScore;
        uint256 timestamp;
        bool isActive;
        string pledgeMessage;
    }
    
    struct GovernanceActivityLog {
        bytes32 logId;
        bytes32 activityType;
        address actor;
        uint256 timestamp;
        bytes32 nftMetadataHash;
        uint256 frequencyAlignment;
        string description;
    }
    
    struct UnityMechanism {
        bytes32 mechanismId;
        string name;
        uint256 automaticTriggerThreshold;
        uint256 frequencyRequired;
        bool isAutomatic;
        bool isActive;
        uint256 lastTriggered;
        uint256 triggerCount;
    }
    
    // ========== STATE VARIABLES ==========
    
    // Governance directives
    mapping(bytes32 => GovernanceDirective) public directives;
    bytes32[] public directiveIds;
    uint256 public totalDirectives;
    
    // Accord commitments
    mapping(address => AccordCommitment) public commitments;
    address[] public committedMembers;
    uint256 public totalCommitments;
    
    // Activity logs
    mapping(bytes32 => GovernanceActivityLog) public activityLogs;
    bytes32[] public logIds;
    uint256 public totalLogs;
    
    // Unity mechanisms
    mapping(bytes32 => UnityMechanism) public unityMechanisms;
    bytes32[] public mechanismIds;
    
    // Accord scores
    mapping(address => uint256) public loveScores;
    mapping(address => uint256) public unityScores;
    mapping(address => uint256) public supportScores;
    
    // Global accord metrics
    uint256 public globalLoveIndex;
    uint256 public globalUnityIndex;
    uint256 public globalSupportIndex;
    uint256 public lastGlobalUpdate;
    
    // NFT metadata tracking
    mapping(uint256 => bytes32) public nftGovernanceTimestamps;
    
    // ========== EVENTS ==========
    
    event DirectiveCreated(
        bytes32 indexed directiveId,
        string title,
        address indexed proposer,
        uint256 loveAlignment,
        uint256 unityAlignment,
        uint256 timestamp
    );
    
    event DirectiveUpdated(
        bytes32 indexed directiveId,
        uint256 loveAlignment,
        uint256 unityAlignment,
        uint256 supportAlignment,
        uint256 timestamp
    );
    
    event AccordCommitmentMade(
        address indexed committer,
        bytes32 commitmentHash,
        string pledgeMessage,
        uint256 timestamp
    );
    
    event GovernanceActivityLogged(
        bytes32 indexed logId,
        bytes32 activityType,
        address indexed actor,
        bytes32 nftMetadataHash,
        uint256 timestamp
    );
    
    event UnityMechanismTriggered(
        bytes32 indexed mechanismId,
        address indexed triggeredBy,
        uint256 frequency,
        uint256 timestamp
    );
    
    event GlobalAccordUpdated(
        uint256 loveIndex,
        uint256 unityIndex,
        uint256 supportIndex,
        uint256 timestamp
    );
    
    event LoveScoreUpdated(
        address indexed member,
        uint256 oldScore,
        uint256 newScore,
        uint256 timestamp
    );
    
    event NFTMetadataTimestamped(
        uint256 indexed tokenId,
        bytes32 governanceHash,
        uint256 timestamp
    );
    
    // ========== CONSTRUCTOR ==========
    
    constructor(address adminAddress) {
        require(adminAddress != address(0), "Invalid admin address");
        
        // Setup roles
        _grantRole(DEFAULT_ADMIN_ROLE, adminAddress);
        _grantRole(GOVERNANCE_ADMIN_ROLE, adminAddress);
        _grantRole(ACCORD_GUARDIAN_ROLE, adminAddress);
        _grantRole(UNITY_STEWARD_ROLE, adminAddress);
        
        // Initialize global accord indices
        globalLoveIndex = 5000;    // 50% baseline
        globalUnityIndex = 5000;   // 50% baseline
        globalSupportIndex = 5000; // 50% baseline
        lastGlobalUpdate = block.timestamp;
        
        // Create foundational directives
        _createFoundationalDirectives(adminAddress);
    }
    
    // ========== MODIFIERS ==========
    
    modifier onlyGovernanceAdmin() {
        require(hasRole(GOVERNANCE_ADMIN_ROLE, msg.sender), "Not governance admin");
        _;
    }
    
    modifier onlyAccordGuardian() {
        require(hasRole(ACCORD_GUARDIAN_ROLE, msg.sender), "Not accord guardian");
        _;
    }
    
    modifier onlyUnitySteward() {
        require(hasRole(UNITY_STEWARD_ROLE, msg.sender), "Not unity steward");
        _;
    }
    
    modifier hasCommitment() {
        require(commitments[msg.sender].isActive, "No active commitment");
        _;
    }
    
    // ========== INTERNAL FUNCTIONS ==========
    
    /**
     * @dev Creates foundational immutable directives
     */
    function _createFoundationalDirectives(address proposer) internal {
        // Love directive
        _createDirective(
            "LOVE_FOUNDATION",
            "Love as Foundation",
            PRINCIPLE_LOVE,
            10000, // 100% love alignment
            8000,  // 80% unity alignment
            9000,  // 90% support alignment
            proposer,
            true   // immutable
        );
        
        // Unity directive
        _createDirective(
            "UNITY_BINDING",
            "Unity Binding Principle",
            PRINCIPLE_UNITY,
            8000,  // 80% love alignment
            10000, // 100% unity alignment
            9000,  // 90% support alignment
            proposer,
            true   // immutable
        );
        
        // Mutual support directive
        _createDirective(
            "MUTUAL_SUPPORT",
            "Mutual Support Covenant",
            PRINCIPLE_SUPPORT,
            9000,  // 90% love alignment
            9000,  // 90% unity alignment
            10000, // 100% support alignment
            proposer,
            true   // immutable
        );
        
        // Harmony directive
        _createDirective(
            "HARMONY_GUIDANCE",
            "Harmony in Governance",
            PRINCIPLE_HARMONY,
            9500,  // 95% love alignment
            9500,  // 95% unity alignment
            9500,  // 95% support alignment
            proposer,
            true   // immutable
        );
    }
    
    /**
     * @dev Internal function to create a directive
     */
    function _createDirective(
        string memory idSuffix,
        string memory title,
        string memory description,
        uint256 loveAlignment,
        uint256 unityAlignment,
        uint256 supportAlignment,
        address proposer,
        bool isImmutable
    ) internal returns (bytes32 directiveId) {
        directiveId = keccak256(abi.encodePacked(idSuffix, block.timestamp, proposer));
        
        uint256 frequencyResonance = _calculateFrequencyResonance(
            loveAlignment, 
            unityAlignment, 
            supportAlignment
        );
        
        directives[directiveId] = GovernanceDirective({
            directiveId: directiveId,
            title: title,
            description: description,
            loveAlignment: loveAlignment,
            unityAlignment: unityAlignment,
            supportAlignment: supportAlignment,
            createdAt: block.timestamp,
            lastUpdated: block.timestamp,
            proposer: proposer,
            isActive: true,
            isImmutable: isImmutable,
            frequencyResonance: frequencyResonance
        });
        
        directiveIds.push(directiveId);
        totalDirectives++;
        
        emit DirectiveCreated(
            directiveId,
            title,
            proposer,
            loveAlignment,
            unityAlignment,
            block.timestamp
        );
        
        return directiveId;
    }
    
    /**
     * @dev Calculate frequency resonance based on alignment scores
     */
    function _calculateFrequencyResonance(
        uint256 love,
        uint256 unity,
        uint256 support
    ) internal pure returns (uint256) {
        // Weighted average aligned with sacred frequencies
        uint256 loveComponent = (love * LOVE_FREQUENCY) / 10000;
        uint256 unityComponent = (unity * UNITY_FREQUENCY) / 10000;
        uint256 supportComponent = (support * ACCORD_FREQUENCY) / 10000;
        
        return loveComponent + unityComponent + supportComponent;
    }
    
    // ========== GOVERNANCE DIRECTIVE FUNCTIONS ==========
    
    /**
     * @dev Create a new governance directive
     */
    function createDirective(
        string calldata title,
        string calldata description,
        uint256 loveAlignment,
        uint256 unityAlignment,
        uint256 supportAlignment
    ) external onlyGovernanceAdmin whenNotPaused returns (bytes32) {
        require(loveAlignment <= 10000, "Invalid love alignment");
        require(unityAlignment <= 10000, "Invalid unity alignment");
        require(supportAlignment <= 10000, "Invalid support alignment");
        
        bytes32 directiveId = _createDirective(
            title,
            title,
            description,
            loveAlignment,
            unityAlignment,
            supportAlignment,
            msg.sender,
            false // not immutable
        );
        
        // Log the activity
        _logActivity(
            keccak256("DIRECTIVE_CREATED"),
            msg.sender,
            bytes32(0),
            _calculateFrequencyResonance(loveAlignment, unityAlignment, supportAlignment),
            "New governance directive created"
        );
        
        return directiveId;
    }
    
    /**
     * @dev Update a governance directive (only non-immutable)
     */
    function updateDirective(
        bytes32 directiveId,
        uint256 loveAlignment,
        uint256 unityAlignment,
        uint256 supportAlignment
    ) external onlyGovernanceAdmin whenNotPaused returns (bool) {
        GovernanceDirective storage directive = directives[directiveId];
        require(directive.isActive, "Directive not active");
        require(!directive.isImmutable, "Cannot modify immutable directive");
        require(loveAlignment <= 10000, "Invalid love alignment");
        require(unityAlignment <= 10000, "Invalid unity alignment");
        require(supportAlignment <= 10000, "Invalid support alignment");
        
        directive.loveAlignment = loveAlignment;
        directive.unityAlignment = unityAlignment;
        directive.supportAlignment = supportAlignment;
        directive.lastUpdated = block.timestamp;
        directive.frequencyResonance = _calculateFrequencyResonance(
            loveAlignment, 
            unityAlignment, 
            supportAlignment
        );
        
        emit DirectiveUpdated(
            directiveId,
            loveAlignment,
            unityAlignment,
            supportAlignment,
            block.timestamp
        );
        
        return true;
    }
    
    // ========== ACCORD COMMITMENT FUNCTIONS ==========
    
    /**
     * @dev Make a commitment to the Love Unity Accord
     */
    function makeAccordCommitment(
        string calldata pledgeMessage
    ) external whenNotPaused returns (bytes32) {
        require(!commitments[msg.sender].isActive, "Already committed");
        require(bytes(pledgeMessage).length > 0, "Pledge message required");
        
        bytes32 commitmentHash = keccak256(abi.encodePacked(
            msg.sender,
            pledgeMessage,
            block.timestamp
        ));
        
        commitments[msg.sender] = AccordCommitment({
            committer: msg.sender,
            commitmentHash: commitmentHash,
            loveScore: 5000,    // Start at 50%
            unityScore: 5000,   // Start at 50%
            supportScore: 5000, // Start at 50%
            timestamp: block.timestamp,
            isActive: true,
            pledgeMessage: pledgeMessage
        });
        
        committedMembers.push(msg.sender);
        totalCommitments++;
        
        // Initialize scores
        loveScores[msg.sender] = 5000;
        unityScores[msg.sender] = 5000;
        supportScores[msg.sender] = 5000;
        
        emit AccordCommitmentMade(
            msg.sender,
            commitmentHash,
            pledgeMessage,
            block.timestamp
        );
        
        // Log the activity
        _logActivity(
            keccak256("COMMITMENT_MADE"),
            msg.sender,
            bytes32(0),
            LOVE_FREQUENCY + UNITY_FREQUENCY,
            "New accord commitment made"
        );
        
        return commitmentHash;
    }
    
    /**
     * @dev Update member scores (by guardians)
     */
    function updateMemberScores(
        address member,
        uint256 newLoveScore,
        uint256 newUnityScore,
        uint256 newSupportScore
    ) external onlyAccordGuardian whenNotPaused returns (bool) {
        require(commitments[member].isActive, "Member has no commitment");
        require(newLoveScore <= 10000, "Invalid love score");
        require(newUnityScore <= 10000, "Invalid unity score");
        require(newSupportScore <= 10000, "Invalid support score");
        
        uint256 oldLoveScore = loveScores[member];
        
        loveScores[member] = newLoveScore;
        unityScores[member] = newUnityScore;
        supportScores[member] = newSupportScore;
        
        // Update commitment record
        commitments[member].loveScore = newLoveScore;
        commitments[member].unityScore = newUnityScore;
        commitments[member].supportScore = newSupportScore;
        
        emit LoveScoreUpdated(member, oldLoveScore, newLoveScore, block.timestamp);
        
        return true;
    }
    
    // ========== UNITY MECHANISM FUNCTIONS ==========
    
    /**
     * @dev Register a unity mechanism
     */
    function registerUnityMechanism(
        string calldata name,
        uint256 automaticTriggerThreshold,
        uint256 frequencyRequired,
        bool isAutomatic
    ) external onlyUnitySteward whenNotPaused returns (bytes32) {
        bytes32 mechanismId = keccak256(abi.encodePacked(
            name,
            block.timestamp,
            msg.sender
        ));
        
        unityMechanisms[mechanismId] = UnityMechanism({
            mechanismId: mechanismId,
            name: name,
            automaticTriggerThreshold: automaticTriggerThreshold,
            frequencyRequired: frequencyRequired,
            isAutomatic: isAutomatic,
            isActive: true,
            lastTriggered: 0,
            triggerCount: 0
        });
        
        mechanismIds.push(mechanismId);
        
        return mechanismId;
    }
    
    /**
     * @dev Trigger a unity mechanism
     */
    function triggerUnityMechanism(
        bytes32 mechanismId
    ) external nonReentrant whenNotPaused returns (bool) {
        UnityMechanism storage mechanism = unityMechanisms[mechanismId];
        require(mechanism.isActive, "Mechanism not active");
        
        // If automatic, check threshold conditions
        if (mechanism.isAutomatic) {
            require(
                globalUnityIndex >= mechanism.automaticTriggerThreshold,
                "Unity threshold not met"
            );
        } else {
            require(
                hasRole(UNITY_STEWARD_ROLE, msg.sender),
                "Not authorized to trigger"
            );
        }
        
        mechanism.lastTriggered = block.timestamp;
        mechanism.triggerCount++;
        
        emit UnityMechanismTriggered(
            mechanismId,
            msg.sender,
            mechanism.frequencyRequired,
            block.timestamp
        );
        
        return true;
    }
    
    // ========== ACTIVITY LOGGING FUNCTIONS ==========
    
    /**
     * @dev Internal function to log governance activity
     */
    function _logActivity(
        bytes32 activityType,
        address actor,
        bytes32 nftMetadataHash,
        uint256 frequencyAlignment,
        string memory description
    ) internal returns (bytes32) {
        bytes32 logId = keccak256(abi.encodePacked(
            activityType,
            actor,
            block.timestamp,
            totalLogs
        ));
        
        activityLogs[logId] = GovernanceActivityLog({
            logId: logId,
            activityType: activityType,
            actor: actor,
            timestamp: block.timestamp,
            nftMetadataHash: nftMetadataHash,
            frequencyAlignment: frequencyAlignment,
            description: description
        });
        
        logIds.push(logId);
        totalLogs++;
        
        emit GovernanceActivityLogged(
            logId,
            activityType,
            actor,
            nftMetadataHash,
            block.timestamp
        );
        
        return logId;
    }
    
    /**
     * @dev Log governance activity with NFT metadata timestamp
     */
    function logActivityWithNFTTimestamp(
        bytes32 activityType,
        uint256 tokenId,
        string calldata description
    ) external hasCommitment whenNotPaused returns (bytes32) {
        bytes32 nftMetadataHash = keccak256(abi.encodePacked(
            tokenId,
            activityType,
            block.timestamp,
            msg.sender
        ));
        
        // Store NFT governance timestamp
        nftGovernanceTimestamps[tokenId] = nftMetadataHash;
        
        emit NFTMetadataTimestamped(tokenId, nftMetadataHash, block.timestamp);
        
        uint256 memberFrequency = _calculateFrequencyResonance(
            loveScores[msg.sender],
            unityScores[msg.sender],
            supportScores[msg.sender]
        );
        
        return _logActivity(
            activityType,
            msg.sender,
            nftMetadataHash,
            memberFrequency,
            description
        );
    }
    
    // ========== GLOBAL ACCORD FUNCTIONS ==========
    
    /**
     * @dev Update global accord indices
     */
    function updateGlobalAccord() external onlyGovernanceAdmin whenNotPaused returns (bool) {
        uint256 memberCount = committedMembers.length;
        if (memberCount == 0) return false;
        
        uint256 totalLove = 0;
        uint256 totalUnity = 0;
        uint256 totalSupport = 0;
        
        for (uint256 i = 0; i < memberCount; i++) {
            address member = committedMembers[i];
            if (commitments[member].isActive) {
                totalLove += loveScores[member];
                totalUnity += unityScores[member];
                totalSupport += supportScores[member];
            }
        }
        
        globalLoveIndex = totalLove / memberCount;
        globalUnityIndex = totalUnity / memberCount;
        globalSupportIndex = totalSupport / memberCount;
        lastGlobalUpdate = block.timestamp;
        
        emit GlobalAccordUpdated(
            globalLoveIndex,
            globalUnityIndex,
            globalSupportIndex,
            block.timestamp
        );
        
        return true;
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @dev Get directive details
     */
    function getDirective(bytes32 directiveId) external view returns (GovernanceDirective memory) {
        return directives[directiveId];
    }
    
    /**
     * @dev Get all directive IDs
     */
    function getAllDirectiveIds() external view returns (bytes32[] memory) {
        return directiveIds;
    }
    
    /**
     * @dev Get member commitment
     */
    function getCommitment(address member) external view returns (AccordCommitment memory) {
        return commitments[member];
    }
    
    /**
     * @dev Get all committed members
     */
    function getCommittedMembers() external view returns (address[] memory) {
        return committedMembers;
    }
    
    /**
     * @dev Get activity log
     */
    function getActivityLog(bytes32 logId) external view returns (GovernanceActivityLog memory) {
        return activityLogs[logId];
    }
    
    /**
     * @dev Get all log IDs
     */
    function getAllLogIds() external view returns (bytes32[] memory) {
        return logIds;
    }
    
    /**
     * @dev Get unity mechanism
     */
    function getUnityMechanism(bytes32 mechanismId) external view returns (UnityMechanism memory) {
        return unityMechanisms[mechanismId];
    }
    
    /**
     * @dev Get member scores
     */
    function getMemberScores(address member) external view returns (
        uint256 love,
        uint256 unity,
        uint256 support
    ) {
        return (loveScores[member], unityScores[member], supportScores[member]);
    }
    
    /**
     * @dev Get global accord indices
     */
    function getGlobalAccord() external view returns (
        uint256 loveIndex,
        uint256 unityIndex,
        uint256 supportIndex,
        uint256 lastUpdate
    ) {
        return (globalLoveIndex, globalUnityIndex, globalSupportIndex, lastGlobalUpdate);
    }
    
    /**
     * @dev Get NFT governance timestamp
     */
    function getNFTGovernanceTimestamp(uint256 tokenId) external view returns (bytes32) {
        return nftGovernanceTimestamps[tokenId];
    }
    
    /**
     * @dev Check if address has active commitment
     */
    function hasActiveCommitment(address member) external view returns (bool) {
        return commitments[member].isActive;
    }
    
    /**
     * @dev Get frequency resonance for member
     */
    function getMemberFrequencyResonance(address member) external view returns (uint256) {
        return _calculateFrequencyResonance(
            loveScores[member],
            unityScores[member],
            supportScores[member]
        );
    }
    
    // ========== EMERGENCY FUNCTIONS ==========
    
    /**
     * @dev Pause contract
     */
    function pause() external onlyGovernanceAdmin {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyGovernanceAdmin {
        _unpause();
    }
}
