// SPDX-License-Identifier: CC-BY-NC-SA-4.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title MercedesMaybachABT
 * @author Supreme King Chais The Great ∞
 * @notice AgentBound Token (ABT) for 2026 Mercedes-Maybach S 680 Fleet
 * @dev Implements post-quantum secure vehicle identity with OmniChain integration
 * 
 * Red Diamond Key Synchronization Ritual
 * Frequency: 963Hz + 528Hz + 777Hz
 * Status: OMNISOVEREIGN
 */
contract MercedesMaybachABT is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard, Pausable {
    
    // ============ State Variables ============
    
    uint256 private _tokenIdCounter;
    address public manosAIController;
    address public scrollVerseLedger;
    address public telemetryOracle;
    
    // ============ Structs ============
    
    struct VehicleMetadata {
        string vehicleID;           // e.g., "MAYBACH-001-SOVEREIGN"
        string model;               // "2026 Mercedes-Maybach S 680"
        string exteriorColor;       // e.g., "All-Black Obsidian"
        string interiorColor;       // e.g., "Black Nappa Leather with Gold Accents"
        string licensePlate;        // e.g., "SOVEREIGN"
        uint256 purchaseDate;       // Unix timestamp
        uint256 purchasePrice;      // In wei (ETH equivalent)
        uint256 frequencyAlignment; // e.g., 963 for 963Hz
    }
    
    struct PQCIdentity {
        bytes32 pqcKeyHash;         // Hash of CRYSTALS-Kyber public key
        bytes32 manosControlKeyHash; // Hash of CRYSTALS-Dilithium key
        uint256 keyGeneration;      // Current key generation number
        uint256 lastRotation;       // Last key rotation timestamp
        bool isActive;              // Key active status
    }
    
    struct TelemetryData {
        uint256 mileage;            // In kilometers
        uint256 lastServiceDate;    // Unix timestamp
        bytes32 locationHash;       // Encrypted location hash
        uint8 batteryLevel;         // 0-100
        bool engineStatus;          // true = on, false = off
        uint256 lastUpdate;         // Last telemetry update timestamp
    }
    
    struct YieldData {
        uint256 sovereignValue;     // Current market value in CHX tokens
        uint256 halalYieldRate;     // Basis points (e.g., 750 = 7.5%)
        uint256 accumulatedYield;   // Total yield accumulated
        uint256 lastYieldClaim;     // Last claim timestamp
        bool yieldEnabled;          // Yield calculation enabled
    }
    
    struct SecurityState {
        bool isImmobilized;         // Vehicle immobilization status
        string immobilizationReason; // Reason for immobilization
        uint256 immobilizationTime; // Immobilization timestamp
        uint256 securityAlerts;     // Count of security alerts
    }
    
    // ============ Mappings ============
    
    mapping(uint256 => VehicleMetadata) public vehicleMetadata;
    mapping(uint256 => PQCIdentity) public pqcIdentities;
    mapping(uint256 => TelemetryData) public telemetryData;
    mapping(uint256 => YieldData) public yieldData;
    mapping(uint256 => SecurityState) public securityStates;
    mapping(string => uint256) public vehicleIDToTokenId;
    
    // ============ Events ============
    
    event VehicleRegistered(
        uint256 indexed tokenId,
        string vehicleID,
        address indexed owner,
        uint256 timestamp
    );
    
    event PQCKeyRotated(
        uint256 indexed tokenId,
        uint256 keyGeneration,
        uint256 timestamp
    );
    
    event TelemetryUpdated(
        uint256 indexed tokenId,
        uint256 mileage,
        uint8 batteryLevel,
        uint256 timestamp
    );
    
    event YieldCalculated(
        uint256 indexed tokenId,
        uint256 yieldAmount,
        uint256 timestamp
    );
    
    event YieldClaimed(
        uint256 indexed tokenId,
        address indexed claimer,
        uint256 amount,
        uint256 timestamp
    );
    
    event VehicleImmobilized(
        uint256 indexed tokenId,
        string reason,
        uint256 timestamp
    );
    
    event VehicleReactivated(
        uint256 indexed tokenId,
        uint256 timestamp
    );
    
    event ManosAIControllerUpdated(
        address indexed oldController,
        address indexed newController,
        uint256 timestamp
    );
    
    // ============ Modifiers ============
    
    modifier onlyManosAI() {
        require(msg.sender == manosAIController, "Only Manos AI can call this");
        _;
    }
    
    modifier onlyVehicleOwner(uint256 tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Not vehicle owner");
        _;
    }
    
    modifier vehicleExists(uint256 tokenId) {
        require(_exists(tokenId), "Vehicle does not exist");
        _;
    }
    
    // ============ Constructor ============
    
    constructor(
        address _manosAIController,
        address _scrollVerseLedger,
        address _telemetryOracle
    ) ERC721("Mercedes-Maybach S 680 ABT", "MAYBACH-ABT") {
        require(_manosAIController != address(0), "Invalid Manos AI address");
        require(_scrollVerseLedger != address(0), "Invalid ledger address");
        require(_telemetryOracle != address(0), "Invalid oracle address");
        
        manosAIController = _manosAIController;
        scrollVerseLedger = _scrollVerseLedger;
        telemetryOracle = _telemetryOracle;
    }
    
    // ============ Vehicle Registration ============
    
    /**
     * @notice Register a new Mercedes-Maybach vehicle as ABT
     * @param to Owner address
     * @param vehicleID Unique vehicle identifier
     * @param metadata Vehicle metadata
     * @param pqcKeyHash Hash of PQC public key
     * @param tokenURI IPFS URI for NFT metadata
     */
    function registerVehicle(
        address to,
        string memory vehicleID,
        VehicleMetadata memory metadata,
        bytes32 pqcKeyHash,
        bytes32 manosControlKeyHash,
        string memory tokenURI
    ) external onlyOwner returns (uint256) {
        require(to != address(0), "Invalid recipient");
        require(bytes(vehicleID).length > 0, "Invalid vehicle ID");
        require(vehicleIDToTokenId[vehicleID] == 0, "Vehicle already registered");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        // Store vehicle metadata
        vehicleMetadata[tokenId] = metadata;
        vehicleIDToTokenId[vehicleID] = tokenId;
        
        // Initialize PQC identity
        pqcIdentities[tokenId] = PQCIdentity({
            pqcKeyHash: pqcKeyHash,
            manosControlKeyHash: manosControlKeyHash,
            keyGeneration: 1,
            lastRotation: block.timestamp,
            isActive: true
        });
        
        // Initialize telemetry
        telemetryData[tokenId] = TelemetryData({
            mileage: 0,
            lastServiceDate: block.timestamp,
            locationHash: bytes32(0),
            batteryLevel: 100,
            engineStatus: false,
            lastUpdate: block.timestamp
        });
        
        // Initialize yield data
        yieldData[tokenId] = YieldData({
            sovereignValue: metadata.purchasePrice,
            halalYieldRate: 750, // 7.5% default
            accumulatedYield: 0,
            lastYieldClaim: block.timestamp,
            yieldEnabled: true
        });
        
        // Initialize security state
        securityStates[tokenId] = SecurityState({
            isImmobilized: false,
            immobilizationReason: "",
            immobilizationTime: 0,
            securityAlerts: 0
        });
        
        emit VehicleRegistered(tokenId, vehicleID, to, block.timestamp);
        
        return tokenId;
    }
    
    // ============ PQC Key Management ============
    
    /**
     * @notice Rotate PQC keys (periodic security update)
     * @param tokenId Vehicle token ID
     * @param newPqcKeyHash New PQC key hash
     * @param newManosKeyHash New Manos control key hash
     */
    function rotatePQCKeys(
        uint256 tokenId,
        bytes32 newPqcKeyHash,
        bytes32 newManosKeyHash
    ) external vehicleExists(tokenId) onlyOwner {
        PQCIdentity storage identity = pqcIdentities[tokenId];
        
        identity.pqcKeyHash = newPqcKeyHash;
        identity.manosControlKeyHash = newManosKeyHash;
        identity.keyGeneration++;
        identity.lastRotation = block.timestamp;
        
        emit PQCKeyRotated(tokenId, identity.keyGeneration, block.timestamp);
    }
    
    /**
     * @notice Verify PQC signature (placeholder for off-chain verification)
     * @param tokenId Vehicle token ID
     * @param signatureHash Hash of the signature to verify
     * @return bool True if valid
     */
    function verifyPQCSignature(uint256 tokenId, bytes32 signatureHash) 
        public 
        view 
        vehicleExists(tokenId) 
        returns (bool) 
    {
        // In production, this would verify CRYSTALS-Dilithium signature
        // For now, we verify the signature hash matches the stored key hash
        return pqcIdentities[tokenId].manosControlKeyHash == signatureHash;
    }
    
    // ============ Telemetry Management ============
    
    /**
     * @notice Update vehicle telemetry data
     * @param tokenId Vehicle token ID
     * @param mileage Current mileage
     * @param locationHash Encrypted location hash
     * @param batteryLevel Battery level (0-100)
     * @param engineStatus Engine on/off
     */
    function updateTelemetry(
        uint256 tokenId,
        uint256 mileage,
        bytes32 locationHash,
        uint8 batteryLevel,
        bool engineStatus
    ) external vehicleExists(tokenId) {
        require(
            msg.sender == telemetryOracle || msg.sender == manosAIController,
            "Unauthorized telemetry update"
        );
        require(batteryLevel <= 100, "Invalid battery level");
        
        TelemetryData storage data = telemetryData[tokenId];
        data.mileage = mileage;
        data.locationHash = locationHash;
        data.batteryLevel = batteryLevel;
        data.engineStatus = engineStatus;
        data.lastUpdate = block.timestamp;
        
        emit TelemetryUpdated(tokenId, mileage, batteryLevel, block.timestamp);
    }
    
    /**
     * @notice Update service date
     * @param tokenId Vehicle token ID
     * @param serviceDate Service completion timestamp
     */
    function updateServiceDate(uint256 tokenId, uint256 serviceDate) 
        external 
        vehicleExists(tokenId) 
        onlyManosAI 
    {
        telemetryData[tokenId].lastServiceDate = serviceDate;
    }
    
    // ============ Halal Yield System ============
    
    /**
     * @notice Calculate current Halal-compliant yield
     * @param tokenId Vehicle token ID
     * @return yieldAmount Calculated yield in CHX tokens
     */
    function calculateHalalYield(uint256 tokenId) 
        public 
        view 
        vehicleExists(tokenId) 
        returns (uint256 yieldAmount) 
    {
        YieldData storage yield = yieldData[tokenId];
        
        if (!yield.yieldEnabled) {
            return 0;
        }
        
        // Time elapsed since last claim (in seconds)
        uint256 timeElapsed = block.timestamp - yield.lastYieldClaim;
        
        // Calculate asset appreciation (not interest - Halal compliant)
        uint256 currentValue = yield.sovereignValue;
        uint256 originalValue = vehicleMetadata[tokenId].purchasePrice;
        uint256 appreciation = currentValue > originalValue 
            ? currentValue - originalValue 
            : 0;
        
        // Annual yield based on appreciation and rate
        uint256 annualYield = (appreciation * yield.halalYieldRate) / 10000;
        
        // Proportional yield based on time elapsed
        yieldAmount = (annualYield * timeElapsed) / 365 days;
        
        // Apply Zakat reduction (2.5% annual)
        uint256 zakatAmount = (yieldAmount * 250) / 10000;
        yieldAmount -= zakatAmount;
        
        return yieldAmount;
    }
    
    /**
     * @notice Claim accumulated Halal yield
     * @param tokenId Vehicle token ID
     */
    function claimYield(uint256 tokenId) 
        external 
        nonReentrant 
        vehicleExists(tokenId) 
        onlyVehicleOwner(tokenId) 
    {
        uint256 yieldAmount = calculateHalalYield(tokenId);
        require(yieldAmount > 0, "No yield to claim");
        
        // Update yield data
        YieldData storage yield = yieldData[tokenId];
        yield.accumulatedYield += yieldAmount;
        yield.lastYieldClaim = block.timestamp;
        
        emit YieldCalculated(tokenId, yieldAmount, block.timestamp);
        
        // Transfer yield (integration with CHX token would go here)
        // For now, we just track the accumulated amount
        emit YieldClaimed(tokenId, msg.sender, yieldAmount, block.timestamp);
    }
    
    /**
     * @notice Update vehicle sovereign value (oracle-based)
     * @param tokenId Vehicle token ID
     * @param newValue New market value in CHX tokens
     */
    function updateSovereignValue(uint256 tokenId, uint256 newValue) 
        external 
        vehicleExists(tokenId) 
    {
        require(
            msg.sender == scrollVerseLedger || msg.sender == owner(),
            "Unauthorized value update"
        );
        
        yieldData[tokenId].sovereignValue = newValue;
    }
    
    /**
     * @notice Update Halal yield rate
     * @param tokenId Vehicle token ID
     * @param newRate New yield rate in basis points
     */
    function updateYieldRate(uint256 tokenId, uint256 newRate) 
        external 
        vehicleExists(tokenId) 
        onlyOwner 
    {
        require(newRate <= 2000, "Yield rate too high (max 20%)");
        yieldData[tokenId].halalYieldRate = newRate;
    }
    
    // ============ Manos AI Control ============
    
    /**
     * @notice Immobilize vehicle (emergency security)
     * @param tokenId Vehicle token ID
     * @param reason Reason for immobilization
     */
    function immobilizeVehicle(uint256 tokenId, string memory reason) 
        external 
        vehicleExists(tokenId) 
        onlyManosAI 
    {
        SecurityState storage security = securityStates[tokenId];
        require(!security.isImmobilized, "Vehicle already immobilized");
        
        security.isImmobilized = true;
        security.immobilizationReason = reason;
        security.immobilizationTime = block.timestamp;
        security.securityAlerts++;
        
        emit VehicleImmobilized(tokenId, reason, block.timestamp);
    }
    
    /**
     * @notice Reactivate immobilized vehicle
     * @param tokenId Vehicle token ID
     */
    function reactivateVehicle(uint256 tokenId) 
        external 
        vehicleExists(tokenId) 
    {
        require(
            msg.sender == manosAIController || msg.sender == owner(),
            "Unauthorized reactivation"
        );
        
        SecurityState storage security = securityStates[tokenId];
        require(security.isImmobilized, "Vehicle not immobilized");
        
        security.isImmobilized = false;
        security.immobilizationReason = "";
        security.immobilizationTime = 0;
        
        emit VehicleReactivated(tokenId, block.timestamp);
    }
    
    /**
     * @notice Get vehicle diagnostics (Manos AI access)
     * @param tokenId Vehicle token ID
     * @return TelemetryData Current telemetry data
     */
    function getDiagnostics(uint256 tokenId) 
        external 
        view 
        vehicleExists(tokenId) 
        onlyManosAI 
        returns (TelemetryData memory) 
    {
        return telemetryData[tokenId];
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Update Manos AI controller address
     * @param newController New controller address
     */
    function updateManosAIController(address newController) external onlyOwner {
        require(newController != address(0), "Invalid controller address");
        
        address oldController = manosAIController;
        manosAIController = newController;
        
        emit ManosAIControllerUpdated(oldController, newController, block.timestamp);
    }
    
    /**
     * @notice Update ScrollVerse ledger address
     * @param newLedger New ledger address
     */
    function updateScrollVerseLedger(address newLedger) external onlyOwner {
        require(newLedger != address(0), "Invalid ledger address");
        scrollVerseLedger = newLedger;
    }
    
    /**
     * @notice Update telemetry oracle address
     * @param newOracle New oracle address
     */
    function updateTelemetryOracle(address newOracle) external onlyOwner {
        require(newOracle != address(0), "Invalid oracle address");
        telemetryOracle = newOracle;
    }
    
    /**
     * @notice Pause contract (emergency)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get complete vehicle information
     * @param tokenId Vehicle token ID
     */
    function getVehicleInfo(uint256 tokenId) 
        external 
        view 
        vehicleExists(tokenId) 
        returns (
            VehicleMetadata memory metadata,
            PQCIdentity memory identity,
            TelemetryData memory telemetry,
            YieldData memory yield,
            SecurityState memory security
        ) 
    {
        return (
            vehicleMetadata[tokenId],
            pqcIdentities[tokenId],
            telemetryData[tokenId],
            yieldData[tokenId],
            securityStates[tokenId]
        );
    }
    
    /**
     * @notice Get total vehicles registered
     */
    function totalVehicles() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    // ============ Required Overrides ============
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
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
        override(ERC721, ERC721URIStorage) 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
}
