// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title SovereignHeirProtocol
 * @dev Implements the Sovereign Heir Protocol for generational wealth management
 * 
 * @notice CHAPTER EIGHT: SOVEREIGN HEIR PROTOCOL
 * 
 * This contract manages:
 * - Dynasty member registration and verification
 * - Generational wealth locks and distribution
 * - Succession protocols and emergency procedures
 * - Not.Academy education integration
 * - Private asset management coordination
 * 
 * Frequency: 963Hz + 528Hz + 999Hz + 144,000Hz
 * Timeline: 1,000-Year ScrollVerse Master Plan
 * 
 * ALLĀHU AKBAR! 🕋✨💎🌌
 */
contract SovereignHeirProtocol is AccessControl, ReentrancyGuard, Pausable {
    
    // ========== ROLES ==========
    bytes32 public constant SOVEREIGN_ROLE = keccak256("SOVEREIGN_ROLE");
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");
    bytes32 public constant HEIR_ROLE = keccak256("HEIR_ROLE");
    bytes32 public constant ACADEMY_ROLE = keccak256("ACADEMY_ROLE");
    
    // ========== FREQUENCIES ==========
    uint256 public constant CROWN_FREQUENCY = 963; // Hz - Sovereign alignment
    uint256 public constant HEALING_FREQUENCY = 528; // Hz - DNA protection
    uint256 public constant DIVINE_FREQUENCY = 999; // Hz - Divine seal
    uint256 public constant COSMIC_FREQUENCY = 144000; // Hz - Cosmic lock
    
    // ========== STRUCTS ==========
    
    struct DynastyMember {
        address memberAddress;
        uint256 generation;
        uint256 birthTimestamp;
        uint256 heirRank;
        bool isActive;
        uint256 wealthAllocation; // Percentage in basis points (10000 = 100%)
        bytes32 educationProofHash;
        uint256 registrationTimestamp;
        uint256 frequencyResonance;
    }
    
    struct WealthVault {
        uint256 totalAssets;
        uint256 generationUnlock;
        uint256 lastDistribution;
        bool emergencyAccessible;
        uint256 frequencyResonance;
        bool isActive;
        uint256 creationTimestamp;
    }
    
    struct SuccessionProtocol {
        address currentSovereign;
        address proposedHeir;
        uint256 transitionTimelock;
        bool emergencySuccession;
        uint256 consensusThreshold; // Basis points
        uint256 approvalCount;
        uint256 proposalTimestamp;
        bool isExecuted;
    }
    
    struct EducationRequirement {
        uint256 minimumCompletionLevel;
        bytes32[] requiredCoursesHash;
        uint256 practicalExperienceYears;
        bool communityEndorsement;
        uint256 frequencyAlignment;
        bool isRequired;
    }
    
    struct PrivateAsset {
        bytes32 assetType; // "aircraft", "estate", "vault", etc.
        bytes32 assetIdentifier;
        uint256 acquisitionTimestamp;
        uint256 generationalOwnership; // Which generation currently controls
        bool isOperational;
        uint256 frequencySeal;
    }
    
    // ========== STATE VARIABLES ==========
    
    // Dynasty tracking
    mapping(address => DynastyMember) public dynastyMembers;
    mapping(uint256 => address[]) public generationMembers; // generation => members
    address[] public allMembers;
    uint256 public currentGeneration;
    uint256 public totalMembers;
    
    // Wealth management
    mapping(bytes32 => WealthVault) public wealthVaults;
    bytes32[] public vaultIds;
    uint256 public totalLockedWealth;
    
    // Succession
    SuccessionProtocol public currentSuccession;
    mapping(address => bool) public hasApprovedSuccession;
    address[] public successionHistory;
    
    // Education
    EducationRequirement public educationRequirement;
    mapping(address => mapping(bytes32 => bool)) public courseCompletion;
    mapping(address => uint256) public educationLevel;
    
    // Assets
    mapping(bytes32 => PrivateAsset) public privateAssets;
    bytes32[] public assetIds;
    
    // Guardian Council
    address[] public guardianCouncil;
    mapping(address => bool) public isGuardian;
    uint256 public guardianThreshold; // Number of guardians needed for emergency actions
    
    // ========== EVENTS ==========
    
    event DynastyMemberRegistered(
        address indexed member,
        uint256 generation,
        uint256 heirRank,
        uint256 timestamp
    );
    
    event WealthLocked(
        bytes32 indexed vaultId,
        uint256 amount,
        uint256 unlockGeneration,
        uint256 frequency
    );
    
    event WealthDistributed(
        bytes32 indexed vaultId,
        uint256 generation,
        uint256 amount,
        uint256 timestamp
    );
    
    event SuccessionInitiated(
        address indexed currentSovereign,
        address indexed proposedHeir,
        uint256 timelockDuration,
        bool isEmergency
    );
    
    event SuccessionApproved(
        address indexed guardian,
        address indexed proposedHeir,
        uint256 approvalCount
    );
    
    event SuccessionExecuted(
        address indexed previousSovereign,
        address indexed newSovereign,
        uint256 timestamp
    );
    
    event EducationCompleted(
        address indexed heir,
        bytes32 courseHash,
        uint256 completionLevel
    );
    
    event PrivateAssetRegistered(
        bytes32 indexed assetId,
        bytes32 assetType,
        uint256 generation,
        uint256 timestamp
    );
    
    event GuardianCouncilUpdated(
        address[] guardians,
        uint256 threshold,
        uint256 timestamp
    );
    
    event EmergencyProtocolActivated(
        address indexed activator,
        bytes32 emergencyCode,
        uint256 timestamp
    );
    
    event FrequencyResonanceUpdated(
        address indexed member,
        uint256 newResonance,
        uint256 timestamp
    );
    
    // ========== CONSTRUCTOR ==========
    
    constructor(address sovereignAddress) {
        require(sovereignAddress != address(0), "Invalid sovereign address");
        
        // Setup roles
        _grantRole(DEFAULT_ADMIN_ROLE, sovereignAddress);
        _grantRole(SOVEREIGN_ROLE, sovereignAddress);
        
        // Initialize first dynasty member
        dynastyMembers[sovereignAddress] = DynastyMember({
            memberAddress: sovereignAddress,
            generation: 1,
            birthTimestamp: block.timestamp,
            heirRank: 1,
            isActive: true,
            wealthAllocation: 10000, // 100%
            educationProofHash: keccak256(abi.encodePacked("FOUNDER")),
            registrationTimestamp: block.timestamp,
            frequencyResonance: DIVINE_FREQUENCY
        });
        
        allMembers.push(sovereignAddress);
        generationMembers[1].push(sovereignAddress);
        currentGeneration = 1;
        totalMembers = 1;
        
        // Initialize succession
        currentSuccession.currentSovereign = sovereignAddress;
        currentSuccession.consensusThreshold = 6666; // 66.66%
        
        // Set default education requirements
        educationRequirement.minimumCompletionLevel = 3; // Crown level
        educationRequirement.practicalExperienceYears = 5;
        educationRequirement.frequencyAlignment = CROWN_FREQUENCY;
        educationRequirement.isRequired = true;
        
        successionHistory.push(sovereignAddress);
        
        emit DynastyMemberRegistered(sovereignAddress, 1, 1, block.timestamp);
    }
    
    // ========== MODIFIERS ==========
    
    modifier onlySovereign() {
        require(hasRole(SOVEREIGN_ROLE, msg.sender), "Not sovereign");
        _;
    }
    
    modifier onlyGuardianOrSovereign() {
        require(
            hasRole(GUARDIAN_ROLE, msg.sender) || hasRole(SOVEREIGN_ROLE, msg.sender),
            "Not guardian or sovereign"
        );
        _;
    }
    
    modifier onlyActiveMember(address member) {
        require(dynastyMembers[member].isActive, "Member not active");
        _;
    }
    
    // ========== DYNASTY MANAGEMENT ==========
    
    /**
     * @dev Register a new dynasty member
     * @param member Address of the new member
     * @param generation Generation number
     * @param heirRank Rank in succession line
     */
    function registerDynastyMember(
        address member,
        uint256 generation,
        uint256 heirRank
    ) external onlySovereign returns (bool) {
        require(member != address(0), "Invalid member address");
        require(!dynastyMembers[member].isActive, "Member already registered");
        require(generation > 0, "Invalid generation");
        require(heirRank > 0, "Invalid heir rank");
        
        dynastyMembers[member] = DynastyMember({
            memberAddress: member,
            generation: generation,
            birthTimestamp: block.timestamp,
            heirRank: heirRank,
            isActive: true,
            wealthAllocation: 0,
            educationProofHash: bytes32(0),
            registrationTimestamp: block.timestamp,
            frequencyResonance: HEALING_FREQUENCY
        });
        
        allMembers.push(member);
        generationMembers[generation].push(member);
        totalMembers++;
        
        // Grant heir role
        _grantRole(HEIR_ROLE, member);
        
        emit DynastyMemberRegistered(member, generation, heirRank, block.timestamp);
        
        return true;
    }
    
    /**
     * @dev Update dynasty member allocation
     * @param member Address of the member
     * @param allocationBasisPoints Allocation in basis points
     */
    function updateWealthAllocation(
        address member,
        uint256 allocationBasisPoints
    ) external onlySovereign onlyActiveMember(member) returns (bool) {
        require(allocationBasisPoints <= 10000, "Allocation exceeds 100%");
        
        dynastyMembers[member].wealthAllocation = allocationBasisPoints;
        
        return true;
    }
    
    /**
     * @dev Update member frequency resonance
     * @param member Address of the member
     * @param resonance New frequency resonance value
     */
    function updateFrequencyResonance(
        address member,
        uint256 resonance
    ) external onlyGuardianOrSovereign onlyActiveMember(member) returns (bool) {
        dynastyMembers[member].frequencyResonance = resonance;
        
        emit FrequencyResonanceUpdated(member, resonance, block.timestamp);
        
        return true;
    }
    
    // ========== WEALTH MANAGEMENT ==========
    
    /**
     * @dev Lock wealth for a specific generation
     * @param unlockGeneration Generation that can access the wealth
     * @param frequency Frequency seal for the vault
     */
    function lockGenerationalWealth(
        uint256 unlockGeneration,
        uint256 frequency
    ) external payable onlySovereign returns (bytes32 vaultId) {
        require(msg.value > 0, "Must lock some wealth");
        require(unlockGeneration > currentGeneration, "Must be future generation");
        require(
            frequency == CROWN_FREQUENCY || 
            frequency == HEALING_FREQUENCY || 
            frequency == DIVINE_FREQUENCY ||
            frequency == COSMIC_FREQUENCY,
            "Invalid frequency"
        );
        
        vaultId = keccak256(abi.encodePacked(
            msg.sender,
            unlockGeneration,
            block.timestamp,
            msg.value
        ));
        
        wealthVaults[vaultId] = WealthVault({
            totalAssets: msg.value,
            generationUnlock: unlockGeneration,
            lastDistribution: 0,
            emergencyAccessible: false,
            frequencyResonance: frequency,
            isActive: true,
            creationTimestamp: block.timestamp
        });
        
        vaultIds.push(vaultId);
        totalLockedWealth += msg.value;
        
        emit WealthLocked(vaultId, msg.value, unlockGeneration, frequency);
        
        return vaultId;
    }
    
    /**
     * @dev Distribute wealth from a vault to the current generation
     * @param vaultId ID of the vault to distribute from
     */
    function distributeDynastyWealth(
        bytes32 vaultId
    ) external nonReentrant onlyGuardianOrSovereign returns (bool) {
        WealthVault storage vault = wealthVaults[vaultId];
        
        require(vault.isActive, "Vault not active");
        require(vault.totalAssets > 0, "Vault empty");
        require(
            currentGeneration >= vault.generationUnlock,
            "Generation lock not reached"
        );
        
        uint256 amount = vault.totalAssets;
        vault.totalAssets = 0;
        vault.lastDistribution = block.timestamp;
        totalLockedWealth -= amount;
        
        // Distribute to active members of current generation
        address[] memory currentGenMembers = generationMembers[currentGeneration];
        uint256 memberCount = currentGenMembers.length;
        
        if (memberCount > 0) {
            uint256 perMemberAmount = amount / memberCount;
            
            for (uint256 i = 0; i < memberCount; i++) {
                address member = currentGenMembers[i];
                if (dynastyMembers[member].isActive) {
                    (bool success, ) = payable(member).call{value: perMemberAmount}("");
                    require(success, "Transfer failed");
                }
            }
        }
        
        emit WealthDistributed(vaultId, currentGeneration, amount, block.timestamp);
        
        return true;
    }
    
    /**
     * @dev Enable emergency access to a vault
     * @param vaultId ID of the vault
     */
    function enableEmergencyAccess(
        bytes32 vaultId
    ) external onlySovereign returns (bool) {
        require(wealthVaults[vaultId].isActive, "Vault not active");
        
        wealthVaults[vaultId].emergencyAccessible = true;
        
        return true;
    }
    
    // ========== SUCCESSION PROTOCOLS ==========
    
    /**
     * @dev Initiate succession to a new sovereign
     * @param newSovereign Address of the proposed heir
     * @param timelockDuration Time before succession can be executed
     * @param isEmergency Whether this is an emergency succession
     */
    function initiateSuccession(
        address newSovereign,
        uint256 timelockDuration,
        bool isEmergency
    ) external onlyGuardianOrSovereign returns (bool) {
        require(newSovereign != address(0), "Invalid heir address");
        require(!currentSuccession.isExecuted, "Succession already in progress");
        require(dynastyMembers[newSovereign].isActive, "Heir not active member");
        
        // Verify education requirements for non-emergency successions
        if (!isEmergency && educationRequirement.isRequired) {
            require(
                educationLevel[newSovereign] >= educationRequirement.minimumCompletionLevel,
                "Education requirements not met"
            );
            require(
                dynastyMembers[newSovereign].frequencyResonance >= CROWN_FREQUENCY,
                "Frequency alignment insufficient"
            );
        }
        
        currentSuccession.proposedHeir = newSovereign;
        currentSuccession.transitionTimelock = block.timestamp + timelockDuration;
        currentSuccession.emergencySuccession = isEmergency;
        currentSuccession.approvalCount = 0;
        currentSuccession.proposalTimestamp = block.timestamp;
        currentSuccession.isExecuted = false;
        
        // Reset approvals
        for (uint256 i = 0; i < guardianCouncil.length; i++) {
            hasApprovedSuccession[guardianCouncil[i]] = false;
        }
        
        emit SuccessionInitiated(
            currentSuccession.currentSovereign,
            newSovereign,
            timelockDuration,
            isEmergency
        );
        
        return true;
    }
    
    /**
     * @dev Approve the proposed succession (guardian vote)
     */
    function approveSuccession() external returns (bool) {
        require(hasRole(GUARDIAN_ROLE, msg.sender), "Not a guardian");
        require(currentSuccession.proposedHeir != address(0), "No succession proposed");
        require(!currentSuccession.isExecuted, "Already executed");
        require(!hasApprovedSuccession[msg.sender], "Already approved");
        
        hasApprovedSuccession[msg.sender] = true;
        currentSuccession.approvalCount++;
        
        emit SuccessionApproved(
            msg.sender,
            currentSuccession.proposedHeir,
            currentSuccession.approvalCount
        );
        
        return true;
    }
    
    /**
     * @dev Execute the succession after timelock and approvals
     */
    function executeSuccession() external nonReentrant returns (bool) {
        require(currentSuccession.proposedHeir != address(0), "No succession proposed");
        require(!currentSuccession.isExecuted, "Already executed");
        require(
            block.timestamp >= currentSuccession.transitionTimelock,
            "Timelock not expired"
        );
        
        // Check if enough guardians approved
        uint256 requiredApprovals = (guardianCouncil.length * currentSuccession.consensusThreshold) / 10000;
        require(
            currentSuccession.approvalCount >= requiredApprovals,
            "Insufficient approvals"
        );
        
        address previousSovereign = currentSuccession.currentSovereign;
        address newSovereign = currentSuccession.proposedHeir;
        
        // Transfer sovereign role
        _revokeRole(SOVEREIGN_ROLE, previousSovereign);
        _grantRole(SOVEREIGN_ROLE, newSovereign);
        
        // Update succession state
        currentSuccession.currentSovereign = newSovereign;
        currentSuccession.isExecuted = true;
        successionHistory.push(newSovereign);
        
        emit SuccessionExecuted(previousSovereign, newSovereign, block.timestamp);
        
        return true;
    }
    
    /**
     * @dev Activate emergency succession protocol
     * @param emergencyCode Verification code for emergency activation
     */
    function activateEmergencySuccession(
        bytes32 emergencyCode
    ) external onlyGuardianOrSovereign returns (bool) {
        // Emergency succession can bypass timelock with guardian consensus
        require(currentSuccession.proposedHeir != address(0), "No heir proposed");
        require(currentSuccession.emergencySuccession, "Not emergency succession");
        
        uint256 requiredApprovals = (guardianCouncil.length * 8000) / 10000; // 80% for emergency
        require(
            currentSuccession.approvalCount >= requiredApprovals,
            "Insufficient emergency approvals"
        );
        
        emit EmergencyProtocolActivated(msg.sender, emergencyCode, block.timestamp);
        
        // Allow immediate execution
        currentSuccession.transitionTimelock = block.timestamp;
        
        return true;
    }
    
    // ========== EDUCATION INTEGRATION ==========
    
    /**
     * @dev Verify and record education completion
     * @param heir Address of the heir
     * @param courseHash Hash of the completed course
     */
    function verifyEducationCompletion(
        address heir,
        bytes32 courseHash
    ) external returns (bool) {
        require(hasRole(ACADEMY_ROLE, msg.sender), "Not authorized academy");
        require(dynastyMembers[heir].isActive, "Heir not active");
        
        courseCompletion[heir][courseHash] = true;
        dynastyMembers[heir].educationProofHash = courseHash;
        educationLevel[heir]++;
        
        emit EducationCompleted(heir, courseHash, educationLevel[heir]);
        
        return true;
    }
    
    /**
     * @dev Update education requirements
     * @param minimumLevel Minimum completion level required
     * @param experienceYears Required years of practical experience
     * @param frequencyAlign Required frequency alignment
     */
    function updateEducationRequirements(
        uint256 minimumLevel,
        uint256 experienceYears,
        uint256 frequencyAlign
    ) external onlySovereign returns (bool) {
        educationRequirement.minimumCompletionLevel = minimumLevel;
        educationRequirement.practicalExperienceYears = experienceYears;
        educationRequirement.frequencyAlignment = frequencyAlign;
        
        return true;
    }
    
    // ========== PRIVATE ASSET MANAGEMENT ==========
    
    /**
     * @dev Register a private asset (aircraft, estate, etc.)
     * @param assetType Type of asset (e.g., "aircraft", "estate")
     * @param assetIdentifier Unique identifier for the asset
     * @param generation Generation that owns the asset
     */
    function registerPrivateAsset(
        bytes32 assetType,
        bytes32 assetIdentifier,
        uint256 generation
    ) external onlySovereign returns (bytes32 assetId) {
        assetId = keccak256(abi.encodePacked(assetType, assetIdentifier, block.timestamp));
        
        privateAssets[assetId] = PrivateAsset({
            assetType: assetType,
            assetIdentifier: assetIdentifier,
            acquisitionTimestamp: block.timestamp,
            generationalOwnership: generation,
            isOperational: true,
            frequencySeal: DIVINE_FREQUENCY
        });
        
        assetIds.push(assetId);
        
        emit PrivateAssetRegistered(assetId, assetType, generation, block.timestamp);
        
        return assetId;
    }
    
    /**
     * @dev Transfer asset ownership to next generation
     * @param assetId ID of the asset
     * @param newGeneration New generation to own the asset
     */
    function transferAssetOwnership(
        bytes32 assetId,
        uint256 newGeneration
    ) external onlySovereign returns (bool) {
        require(privateAssets[assetId].isOperational, "Asset not operational");
        
        privateAssets[assetId].generationalOwnership = newGeneration;
        
        return true;
    }
    
    // ========== GUARDIAN COUNCIL ==========
    
    /**
     * @dev Establish or update the guardian council
     * @param guardians Array of guardian addresses
     * @param threshold Number of guardians needed for emergency actions
     */
    function establishGuardianCouncil(
        address[] calldata guardians,
        uint256 threshold
    ) external onlySovereign returns (bool) {
        require(guardians.length >= 3, "Minimum 3 guardians required");
        require(threshold <= guardians.length, "Threshold too high");
        require(threshold >= 2, "Threshold too low");
        
        // Remove old guardians
        for (uint256 i = 0; i < guardianCouncil.length; i++) {
            _revokeRole(GUARDIAN_ROLE, guardianCouncil[i]);
            isGuardian[guardianCouncil[i]] = false;
        }
        
        // Clear array
        delete guardianCouncil;
        
        // Add new guardians
        for (uint256 i = 0; i < guardians.length; i++) {
            require(guardians[i] != address(0), "Invalid guardian address");
            guardianCouncil.push(guardians[i]);
            _grantRole(GUARDIAN_ROLE, guardians[i]);
            isGuardian[guardians[i]] = true;
        }
        
        guardianThreshold = threshold;
        
        emit GuardianCouncilUpdated(guardians, threshold, block.timestamp);
        
        return true;
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @dev Get dynasty member details
     */
    function getDynastyMember(address member) external view returns (DynastyMember memory) {
        return dynastyMembers[member];
    }
    
    /**
     * @dev Get all members of a generation
     */
    function getGenerationMembers(uint256 generation) external view returns (address[] memory) {
        return generationMembers[generation];
    }
    
    /**
     * @dev Get wealth vault details
     */
    function getWealthVault(bytes32 vaultId) external view returns (WealthVault memory) {
        return wealthVaults[vaultId];
    }
    
    /**
     * @dev Get current succession status
     */
    function getCurrentSuccession() external view returns (SuccessionProtocol memory) {
        return currentSuccession;
    }
    
    /**
     * @dev Get private asset details
     */
    function getPrivateAsset(bytes32 assetId) external view returns (PrivateAsset memory) {
        return privateAssets[assetId];
    }
    
    /**
     * @dev Get guardian council
     */
    function getGuardianCouncil() external view returns (address[] memory) {
        return guardianCouncil;
    }
    
    /**
     * @dev Get all vault IDs
     */
    function getAllVaultIds() external view returns (bytes32[] memory) {
        return vaultIds;
    }
    
    /**
     * @dev Get all asset IDs
     */
    function getAllAssetIds() external view returns (bytes32[] memory) {
        return assetIds;
    }
    
    /**
     * @dev Get succession history
     */
    function getSuccessionHistory() external view returns (address[] memory) {
        return successionHistory;
    }
    
    /**
     * @dev Check if member has completed a course
     */
    function hasCourseCompleted(address heir, bytes32 courseHash) external view returns (bool) {
        return courseCompletion[heir][courseHash];
    }
    
    // ========== EMERGENCY FUNCTIONS ==========
    
    /**
     * @dev Pause contract in emergency
     */
    function pause() external onlySovereign {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlySovereign {
        _unpause();
    }
    
    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {
        totalLockedWealth += msg.value;
    }
}
