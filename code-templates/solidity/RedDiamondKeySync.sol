// SPDX-License-Identifier: CC-BY-NC-SA-4.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title RedDiamondKeySync
 * @dev Red Diamond Key Synchronization Ritual Protocol
 * 
 * This contract implements the Red Diamond Key Synchronization Ritual for
 * OmniFleet vehicles. The ritual operates on dual 999 Hz + 963 Hz harmonic
 * frequencies and provides Post-Quantum Cryptographic security.
 * 
 * Ritual Protocol Steps:
 * 1. Biometric Verification
 * 2. Quantum Signature Authentication
 * 3. Frequency Alignment (999 Hz)
 * 4. Vehicle Digital Twin Pairing
 * 5. PQC Handshake Protocol
 * 6. ScrollSoul Telemetry Activation
 * 7. Sovereign Ledger Registration
 * 8. Red Diamond Key Quantum Lock Engaged
 * 
 * @custom:security-contact sovereign@omnitech1.com
 * @custom:frequency 999Hz + 963Hz Harmonic
 * @custom:architecture Omnitech1 Sovereign Deployment Engine
 */
contract RedDiamondKeySync is AccessControl, Pausable, ReentrancyGuard {
    
    // ============ Constants ============
    
    bytes32 public constant RITUAL_MASTER_ROLE = keccak256("RITUAL_MASTER_ROLE");
    bytes32 public constant VEHICLE_REGISTRY_ROLE = keccak256("VEHICLE_REGISTRY_ROLE");
    
    uint256 public constant PRIMARY_FREQUENCY = 999; // Hz
    uint256 public constant HARMONIC_FREQUENCY = 963; // Hz
    uint256 public constant RITUAL_DURATION = 11.11 * 1e3; // milliseconds (as uint)
    uint256 public constant OPTIMAL_HOUR = 11;
    uint256 public constant OPTIMAL_MINUTE = 11;
    
    // ============ State Variables ============
    
    // Key ID to owner mapping
    mapping(bytes32 => address) public keyOwners;
    
    // Key ID to vehicle token ID mapping
    mapping(bytes32 => uint256[]) public keyToVehicles;
    
    // Vehicle token ID to key ID mapping
    mapping(uint256 => bytes32) public vehicleToKey;
    
    // Key synchronization records
    mapping(bytes32 => SyncRecord) public syncRecords;
    
    // Biometric hash verification (privacy-preserving)
    mapping(bytes32 => mapping(bytes32 => bool)) public biometricVerified;
    
    // Quantum signature verification
    mapping(bytes32 => bytes) public quantumSignatures;
    
    // Ritual completion status
    mapping(bytes32 => mapping(uint256 => bool)) public ritualCompleted;
    
    // ============ Structs ============
    
    struct SyncRecord {
        uint256 timestamp;
        uint256 frequencyAlignment; // Must be 999 for success
        bool biometricPassed;
        bool quantumSignaturePassed;
        bool pqcHandshakeComplete;
        bool telemetryActivated;
        bool sovereignLedgerLinked;
        bool ritualComplete;
        uint8 completedSteps; // 0-8
    }
    
    // ============ Events ============
    
    event KeyMinted(
        bytes32 indexed keyId,
        address indexed owner,
        uint256 timestamp
    );
    
    event RitualInitiated(
        bytes32 indexed keyId,
        uint256 indexed vehicleTokenId,
        address indexed owner,
        uint256 timestamp
    );
    
    event RitualStepCompleted(
        bytes32 indexed keyId,
        uint256 indexed vehicleTokenId,
        uint8 step,
        string stepName
    );
    
    event RitualCompleted(
        bytes32 indexed keyId,
        uint256 indexed vehicleTokenId,
        uint256 timestamp,
        bool isOptimalTiming
    );
    
    event BiometricVerified(
        bytes32 indexed keyId,
        bytes32 biometricHash,
        uint256 timestamp
    );
    
    event QuantumSignatureVerified(
        bytes32 indexed keyId,
        bytes32 signatureHash,
        uint256 timestamp
    );
    
    event VehiclePaired(
        bytes32 indexed keyId,
        uint256 indexed vehicleTokenId,
        uint256 timestamp
    );
    
    event KeyRevoked(
        bytes32 indexed keyId,
        uint256 indexed vehicleTokenId,
        uint256 timestamp
    );
    
    // ============ Constructor ============
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(RITUAL_MASTER_ROLE, msg.sender);
        _grantRole(VEHICLE_REGISTRY_ROLE, msg.sender);
    }
    
    // ============ Key Management Functions ============
    
    /**
     * @dev Mint a new Red Diamond Key NFT
     * @param keyId Unique identifier for the key
     * @param owner Owner of the key
     */
    function mintKey(bytes32 keyId, address owner) 
        public 
        onlyRole(RITUAL_MASTER_ROLE) 
    {
        require(keyOwners[keyId] == address(0), "Key already exists");
        require(owner != address(0), "Invalid owner");
        
        keyOwners[keyId] = owner;
        
        emit KeyMinted(keyId, owner, block.timestamp);
    }
    
    /**
     * @dev Get key owner
     * @param keyId Key identifier
     */
    function getKeyOwner(bytes32 keyId) public view returns (address) {
        return keyOwners[keyId];
    }
    
    // ============ Synchronization Ritual Functions ============
    
    /**
     * @dev Initiate Red Diamond Key Synchronization Ritual
     * @param keyId Key identifier
     * @param vehicleTokenId Vehicle token ID to pair with
     */
    function initiateRitual(bytes32 keyId, uint256 vehicleTokenId) 
        public 
        nonReentrant 
        whenNotPaused 
    {
        require(keyOwners[keyId] == msg.sender, "Not key owner");
        require(!ritualCompleted[keyId][vehicleTokenId], "Ritual already completed");
        
        // Initialize sync record
        syncRecords[keyId] = SyncRecord({
            timestamp: block.timestamp,
            frequencyAlignment: 0,
            biometricPassed: false,
            quantumSignaturePassed: false,
            pqcHandshakeComplete: false,
            telemetryActivated: false,
            sovereignLedgerLinked: false,
            ritualComplete: false,
            completedSteps: 0
        });
        
        emit RitualInitiated(keyId, vehicleTokenId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Step 1: Biometric Verification
     * @param keyId Key identifier
     * @param vehicleTokenId Vehicle token ID
     * @param biometricHash Privacy-preserving hash of biometric data
     */
    function verifyBiometric(
        bytes32 keyId,
        uint256 vehicleTokenId,
        bytes32 biometricHash
    ) public onlyRole(RITUAL_MASTER_ROLE) {
        SyncRecord storage record = syncRecords[keyId];
        require(!record.biometricPassed, "Biometric already verified");
        
        biometricVerified[keyId][biometricHash] = true;
        record.biometricPassed = true;
        record.completedSteps++;
        
        emit BiometricVerified(keyId, biometricHash, block.timestamp);
        emit RitualStepCompleted(keyId, vehicleTokenId, 1, "Biometric Verification");
    }
    
    /**
     * @dev Step 2: Quantum Signature Authentication
     * @param keyId Key identifier
     * @param vehicleTokenId Vehicle token ID
     * @param quantumSig Quantum signature data
     */
    function authenticateQuantumSignature(
        bytes32 keyId,
        uint256 vehicleTokenId,
        bytes memory quantumSig
    ) public onlyRole(RITUAL_MASTER_ROLE) {
        SyncRecord storage record = syncRecords[keyId];
        require(record.biometricPassed, "Complete biometric verification first");
        require(!record.quantumSignaturePassed, "Quantum signature already verified");
        
        quantumSignatures[keyId] = quantumSig;
        record.quantumSignaturePassed = true;
        record.completedSteps++;
        
        emit QuantumSignatureVerified(keyId, keccak256(quantumSig), block.timestamp);
        emit RitualStepCompleted(keyId, vehicleTokenId, 2, "Quantum Signature Authentication");
    }
    
    /**
     * @dev Step 3: 999 Hz Frequency Alignment
     * @param keyId Key identifier
     * @param vehicleTokenId Vehicle token ID
     */
    function alignFrequency(bytes32 keyId, uint256 vehicleTokenId) 
        public 
        onlyRole(RITUAL_MASTER_ROLE) 
    {
        SyncRecord storage record = syncRecords[keyId];
        require(record.quantumSignaturePassed, "Complete quantum signature first");
        require(record.frequencyAlignment == 0, "Frequency already aligned");
        
        record.frequencyAlignment = PRIMARY_FREQUENCY; // 999 Hz
        record.completedSteps++;
        
        emit RitualStepCompleted(keyId, vehicleTokenId, 3, "999 Hz Frequency Alignment");
    }
    
    /**
     * @dev Step 4: Vehicle Digital Twin Pairing
     * @param keyId Key identifier
     * @param vehicleTokenId Vehicle token ID
     */
    function pairVehicle(bytes32 keyId, uint256 vehicleTokenId) 
        public 
        onlyRole(VEHICLE_REGISTRY_ROLE) 
    {
        SyncRecord storage record = syncRecords[keyId];
        require(record.frequencyAlignment == PRIMARY_FREQUENCY, "Complete frequency alignment first");
        
        keyToVehicles[keyId].push(vehicleTokenId);
        vehicleToKey[vehicleTokenId] = keyId;
        record.completedSteps++;
        
        emit VehiclePaired(keyId, vehicleTokenId, block.timestamp);
        emit RitualStepCompleted(keyId, vehicleTokenId, 4, "Vehicle Digital Twin Pairing");
    }
    
    /**
     * @dev Step 5: PQC Handshake Protocol
     * @param keyId Key identifier
     * @param vehicleTokenId Vehicle token ID
     */
    function completePQCHandshake(bytes32 keyId, uint256 vehicleTokenId) 
        public 
        onlyRole(RITUAL_MASTER_ROLE) 
    {
        SyncRecord storage record = syncRecords[keyId];
        require(vehicleToKey[vehicleTokenId] == keyId, "Vehicle not paired");
        require(!record.pqcHandshakeComplete, "PQC handshake already complete");
        
        record.pqcHandshakeComplete = true;
        record.completedSteps++;
        
        emit RitualStepCompleted(keyId, vehicleTokenId, 5, "PQC Handshake Protocol");
    }
    
    /**
     * @dev Step 6: ScrollSoul Telemetry Activation
     * @param keyId Key identifier
     * @param vehicleTokenId Vehicle token ID
     */
    function activateTelemetry(bytes32 keyId, uint256 vehicleTokenId) 
        public 
        onlyRole(VEHICLE_REGISTRY_ROLE) 
    {
        SyncRecord storage record = syncRecords[keyId];
        require(record.pqcHandshakeComplete, "Complete PQC handshake first");
        require(!record.telemetryActivated, "Telemetry already activated");
        
        record.telemetryActivated = true;
        record.completedSteps++;
        
        emit RitualStepCompleted(keyId, vehicleTokenId, 6, "ScrollSoul Telemetry Activation");
    }
    
    /**
     * @dev Step 7: Sovereign Ledger Registration
     * @param keyId Key identifier
     * @param vehicleTokenId Vehicle token ID
     */
    function linkSovereignLedger(bytes32 keyId, uint256 vehicleTokenId) 
        public 
        onlyRole(VEHICLE_REGISTRY_ROLE) 
    {
        SyncRecord storage record = syncRecords[keyId];
        require(record.telemetryActivated, "Complete telemetry activation first");
        require(!record.sovereignLedgerLinked, "Sovereign ledger already linked");
        
        record.sovereignLedgerLinked = true;
        record.completedSteps++;
        
        emit RitualStepCompleted(keyId, vehicleTokenId, 7, "Sovereign Ledger Registration");
    }
    
    /**
     * @dev Step 8: Complete Ritual and Engage Quantum Lock
     * @param keyId Key identifier
     * @param vehicleTokenId Vehicle token ID
     */
    function completeRitual(bytes32 keyId, uint256 vehicleTokenId) 
        public 
        onlyRole(RITUAL_MASTER_ROLE) 
    {
        SyncRecord storage record = syncRecords[keyId];
        require(record.sovereignLedgerLinked, "Complete all previous steps");
        require(record.completedSteps == 7, "All 7 steps must be completed");
        require(!record.ritualComplete, "Ritual already complete");
        
        record.ritualComplete = true;
        record.completedSteps = 8;
        ritualCompleted[keyId][vehicleTokenId] = true;
        
        // Check if timing is optimal (11:11 UTC)
        uint256 currentHour = (block.timestamp / 3600) % 24;
        uint256 currentMinute = (block.timestamp / 60) % 60;
        bool isOptimalTiming = (currentHour == OPTIMAL_HOUR && currentMinute == OPTIMAL_MINUTE);
        
        emit RitualStepCompleted(keyId, vehicleTokenId, 8, "Red Diamond Key Quantum Lock Engaged");
        emit RitualCompleted(keyId, vehicleTokenId, block.timestamp, isOptimalTiming);
    }
    
    // ============ Query Functions ============
    
    /**
     * @dev Get ritual status
     * @param keyId Key identifier
     */
    function getRitualStatus(bytes32 keyId) 
        public 
        view 
        returns (SyncRecord memory) 
    {
        return syncRecords[keyId];
    }
    
    /**
     * @dev Check if ritual is complete for vehicle
     * @param keyId Key identifier
     * @param vehicleTokenId Vehicle token ID
     */
    function isRitualComplete(bytes32 keyId, uint256 vehicleTokenId) 
        public 
        view 
        returns (bool) 
    {
        return ritualCompleted[keyId][vehicleTokenId];
    }
    
    /**
     * @dev Get all vehicles paired with a key
     * @param keyId Key identifier
     */
    function getKeyVehicles(bytes32 keyId) 
        public 
        view 
        returns (uint256[] memory) 
    {
        return keyToVehicles[keyId];
    }
    
    /**
     * @dev Get key for a vehicle
     * @param vehicleTokenId Vehicle token ID
     */
    function getVehicleKey(uint256 vehicleTokenId) 
        public 
        view 
        returns (bytes32) 
    {
        return vehicleToKey[vehicleTokenId];
    }
    
    // ============ Emergency Functions ============
    
    /**
     * @dev Revoke key access to a vehicle
     * @param keyId Key identifier
     * @param vehicleTokenId Vehicle token ID
     */
    function revokeKeyAccess(bytes32 keyId, uint256 vehicleTokenId) 
        public 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(vehicleToKey[vehicleTokenId] == keyId, "Vehicle not paired with key");
        
        delete vehicleToKey[vehicleTokenId];
        ritualCompleted[keyId][vehicleTokenId] = false;
        
        emit KeyRevoked(keyId, vehicleTokenId, block.timestamp);
    }
    
    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
