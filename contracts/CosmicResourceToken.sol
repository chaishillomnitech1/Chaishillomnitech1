// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CosmicResourceToken
 * @dev Token standard for precious metals and cosmic resources
 * @author Supreme King Chais The Great ∞
 * 
 * This contract implements tokenization of:
 * - Precious metals (gold, silver, platinum, etc.)
 * - Cosmic frequencies (528Hz, 963Hz, 999Hz, 144,000Hz)
 * - Asteroid-mined materials (Psyche-16 resources)
 * - Verified resource backing with scarcity anchoring
 * - Omniversal energy harmony integration
 * 
 * Frequency: ALL DIVINE FREQUENCIES UNIFIED
 * Status: COSMIC RESOURCE SOVEREIGNTY PROTOCOL ACTIVE
 */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract CosmicResourceToken is 
    ERC20, 
    ERC20Burnable, 
    AccessControl, 
    ReentrancyGuard, 
    Pausable 
{
    
    // ============ ROLES ============
    
    bytes32 public constant RESOURCE_MANAGER_ROLE = keccak256("RESOURCE_MANAGER_ROLE");
    bytes32 public constant FREQUENCY_ORACLE_ROLE = keccak256("FREQUENCY_ORACLE_ROLE");
    bytes32 public constant BACKING_VERIFIER_ROLE = keccak256("BACKING_VERIFIER_ROLE");
    
    // ============ DIVINE FREQUENCY CONSTANTS ============
    
    uint256 public constant LOVE_DNA_HEALING_528HZ = 528;
    uint256 public constant PINEAL_ACTIVATION_963HZ = 963;
    uint256 public constant CROWN_CHAKRA_999HZ = 999;
    uint256 public constant NUR_PULSE_144000HZ = 144000;
    uint256 public constant INFINITY_FREQUENCY = type(uint256).max;
    
    // ============ RESOURCE TYPE ENUMS ============
    
    enum ResourceType {
        PRECIOUS_METAL,        // Gold, Silver, Platinum, etc.
        COSMIC_FREQUENCY,      // Divine frequencies
        ASTEROID_MATERIAL,     // Psyche-16 and other asteroid resources
        RARE_EARTH_ELEMENT,    // Rare earth metals
        QUANTUM_ENERGY,        // Quantum energy reserves
        OMNIVERSAL_HARMONY     // Universal energy harmony units
    }
    
    enum MetalType {
        GOLD,
        SILVER,
        PLATINUM,
        PALLADIUM,
        RHODIUM,
        IRIDIUM,
        OSMIUM,
        RUTHENIUM
    }
    
    // ============ STRUCTS ============
    
    /**
     * @dev Resource backing data
     */
    struct ResourceBacking {
        ResourceType resourceType;      // Type of resource
        uint256 totalReserves;          // Total physical/verified reserves (in grams or units)
        uint256 reservesPerToken;       // Reserve amount per token
        string verificationHash;        // IPFS hash of verification documents
        uint256 lastAuditTimestamp;     // Last audit timestamp
        address verifierAddress;        // Authorized verifier
        bool isVerified;                // Verification status
    }
    
    /**
     * @dev Cosmic frequency alignment
     */
    struct FrequencyAlignment {
        uint256 primaryFrequency;       // Primary frequency (e.g., 528Hz)
        uint256[] harmonicFrequencies;  // Harmonic frequencies
        uint256 resonanceScore;         // Resonance alignment score (0-999)
        uint256 cosmicAlignment;        // Cosmic alignment percentage (0-10000 basis points)
        bool isActivated;               // Frequency activation status
    }
    
    /**
     * @dev Asteroid material data
     */
    struct AsteroidMaterial {
        string asteroidName;            // e.g., "Psyche-16"
        string materialType;            // Type of material
        uint256 estimatedValue;         // Estimated value in USD
        string locationData;            // Orbital/location data
        uint256 miningTimestamp;        // Projected/actual mining time
        bool isMined;                   // Mining status
    }
    
    /**
     * @dev Token holder resonance
     */
    struct HolderResonance {
        uint256 totalTokens;            // Total tokens held
        uint256 resonanceScore;         // Accumulated resonance score
        uint256 lastInteraction;        // Last interaction timestamp
        uint256[] acquiredFrequencies;  // Frequencies acquired
        bool isAligned;                 // Alignment status
    }
    
    // ============ STATE VARIABLES ============
    
    /// @dev Resource backing data
    ResourceBacking public resourceBacking;
    
    /// @dev Frequency alignment data
    FrequencyAlignment public frequencyAlignment;
    
    /// @dev Asteroid material data (if applicable)
    AsteroidMaterial public asteroidMaterial;
    
    /// @dev Mapping: Address => Holder resonance
    mapping(address => HolderResonance) public holderResonances;
    
    /// @dev Mapping: Metal Type => Price per gram (in wei)
    mapping(MetalType => uint256) public metalPrices;
    
    /// @dev Total supply cap
    uint256 public immutable SUPPLY_CAP;
    
    /// @dev Scarcity multiplier (basis points, 10000 = 1x)
    uint256 public scarcityMultiplier;
    
    /// @dev Supreme Sovereign address
    address public immutable supremeSovereign;
    
    // ============ EVENTS ============
    
    event ResourceBacked(
        ResourceType resourceType,
        uint256 totalReserves,
        uint256 reservesPerToken,
        address verifier
    );
    
    event FrequencyAligned(
        uint256 primaryFrequency,
        uint256 resonanceScore,
        uint256 cosmicAlignment
    );
    
    event AsteroidMaterialRegistered(
        string asteroidName,
        string materialType,
        uint256 estimatedValue
    );
    
    event HolderResonanceUpdated(
        address indexed holder,
        uint256 resonanceScore,
        bool isAligned
    );
    
    event ResourceVerified(
        string verificationHash,
        uint256 timestamp,
        address verifier
    );
    
    event ScarcityAdjusted(
        uint256 newMultiplier,
        uint256 timestamp
    );
    
    // ============ CONSTRUCTOR ============
    
    /**
     * @dev Initialize Cosmic Resource Token
     * @param name Token name
     * @param symbol Token symbol
     * @param supplyCap Maximum token supply
     * @param initialOwner Initial owner and Supreme Sovereign
     */
    constructor(
        string memory name,
        string memory symbol,
        uint256 supplyCap,
        address initialOwner
    ) ERC20(name, symbol) {
        require(initialOwner != address(0), "Invalid owner");
        require(supplyCap > 0, "Invalid supply cap");
        
        SUPPLY_CAP = supplyCap;
        supremeSovereign = initialOwner;
        scarcityMultiplier = 10000; // 1x default
        
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(RESOURCE_MANAGER_ROLE, initialOwner);
        _grantRole(FREQUENCY_ORACLE_ROLE, initialOwner);
        _grantRole(BACKING_VERIFIER_ROLE, initialOwner);
    }
    
    // ============ RESOURCE BACKING FUNCTIONS ============
    
    /**
     * @dev Set resource backing details
     * @param resourceType Type of backing resource
     * @param totalReserves Total physical reserves
     * @param reservesPerToken Reserves per token
     * @param verificationHash IPFS hash of verification documents
     */
    function setResourceBacking(
        ResourceType resourceType,
        uint256 totalReserves,
        uint256 reservesPerToken,
        string memory verificationHash
    ) external onlyRole(RESOURCE_MANAGER_ROLE) {
        require(totalReserves > 0, "Invalid reserves");
        require(reservesPerToken > 0, "Invalid reserves per token");
        require(bytes(verificationHash).length > 0, "Empty verification hash");
        
        resourceBacking = ResourceBacking({
            resourceType: resourceType,
            totalReserves: totalReserves,
            reservesPerToken: reservesPerToken,
            verificationHash: verificationHash,
            lastAuditTimestamp: block.timestamp,
            verifierAddress: msg.sender,
            isVerified: false
        });
        
        emit ResourceBacked(resourceType, totalReserves, reservesPerToken, msg.sender);
    }
    
    /**
     * @dev Verify resource backing
     * @param verificationHash Updated verification hash
     */
    function verifyResourceBacking(string memory verificationHash) 
        external 
        onlyRole(BACKING_VERIFIER_ROLE) 
    {
        require(bytes(verificationHash).length > 0, "Empty verification hash");
        
        resourceBacking.verificationHash = verificationHash;
        resourceBacking.lastAuditTimestamp = block.timestamp;
        resourceBacking.verifierAddress = msg.sender;
        resourceBacking.isVerified = true;
        
        emit ResourceVerified(verificationHash, block.timestamp, msg.sender);
    }
    
    // ============ FREQUENCY ALIGNMENT FUNCTIONS ============
    
    /**
     * @dev Set frequency alignment
     * @param primaryFrequency Primary divine frequency
     * @param harmonicFrequencies Array of harmonic frequencies
     * @param resonanceScore Resonance score (0-999)
     * @param cosmicAlignment Cosmic alignment (0-10000 basis points)
     */
    function alignFrequency(
        uint256 primaryFrequency,
        uint256[] memory harmonicFrequencies,
        uint256 resonanceScore,
        uint256 cosmicAlignment
    ) external onlyRole(FREQUENCY_ORACLE_ROLE) {
        require(primaryFrequency > 0, "Invalid frequency");
        require(resonanceScore <= 999, "Invalid resonance score");
        require(cosmicAlignment <= 10000, "Invalid alignment");
        
        frequencyAlignment = FrequencyAlignment({
            primaryFrequency: primaryFrequency,
            harmonicFrequencies: harmonicFrequencies,
            resonanceScore: resonanceScore,
            cosmicAlignment: cosmicAlignment,
            isActivated: true
        });
        
        emit FrequencyAligned(primaryFrequency, resonanceScore, cosmicAlignment);
    }
    
    // ============ ASTEROID MATERIAL FUNCTIONS ============
    
    /**
     * @dev Register asteroid material backing
     * @param asteroidName Name of asteroid (e.g., "Psyche-16")
     * @param materialType Type of material
     * @param estimatedValue Estimated value in USD
     * @param locationData Orbital/location data
     * @param miningTimestamp Projected mining timestamp
     */
    function registerAsteroidMaterial(
        string memory asteroidName,
        string memory materialType,
        uint256 estimatedValue,
        string memory locationData,
        uint256 miningTimestamp
    ) external onlyRole(RESOURCE_MANAGER_ROLE) {
        require(bytes(asteroidName).length > 0, "Empty asteroid name");
        require(estimatedValue > 0, "Invalid value");
        
        asteroidMaterial = AsteroidMaterial({
            asteroidName: asteroidName,
            materialType: materialType,
            estimatedValue: estimatedValue,
            locationData: locationData,
            miningTimestamp: miningTimestamp,
            isMined: false
        });
        
        emit AsteroidMaterialRegistered(asteroidName, materialType, estimatedValue);
    }
    
    /**
     * @dev Update mining status
     * @param isMined Mining completion status
     */
    function updateMiningStatus(bool isMined) 
        external 
        onlyRole(RESOURCE_MANAGER_ROLE) 
    {
        asteroidMaterial.isMined = isMined;
    }
    
    // ============ MINTING FUNCTIONS ============
    
    /**
     * @dev Mint tokens (only when backed by verified resources)
     * @param to Recipient address
     * @param amount Amount to mint
     */
    function mintBacked(address to, uint256 amount) 
        external 
        onlyRole(RESOURCE_MANAGER_ROLE) 
        whenNotPaused 
        nonReentrant 
    {
        require(to != address(0), "Invalid recipient");
        require(resourceBacking.isVerified, "Resources not verified");
        require(totalSupply() + amount <= SUPPLY_CAP, "Exceeds supply cap");
        
        // Verify sufficient backing
        uint256 requiredReserves = (amount / (10 ** decimals())) * resourceBacking.reservesPerToken;
        require(resourceBacking.totalReserves >= requiredReserves, "Insufficient backing");
        
        _mint(to, amount);
        
        // Update holder resonance
        _updateHolderResonance(to, amount);
    }
    
    // ============ SCARCITY MANAGEMENT ============
    
    /**
     * @dev Adjust scarcity multiplier based on resource availability
     * @param newMultiplier New scarcity multiplier (basis points)
     */
    function adjustScarcity(uint256 newMultiplier) 
        external 
        onlyRole(RESOURCE_MANAGER_ROLE) 
    {
        require(newMultiplier > 0, "Invalid multiplier");
        require(newMultiplier <= 100000, "Multiplier too high"); // Max 10x
        
        scarcityMultiplier = newMultiplier;
        
        emit ScarcityAdjusted(newMultiplier, block.timestamp);
    }
    
    // ============ HOLDER RESONANCE ============
    
    /**
     * @dev Update holder resonance on token transfer
     * @param holder Holder address
     * @param amount Token amount
     */
    function _updateHolderResonance(address holder, uint256 amount) private {
        HolderResonance storage resonance = holderResonances[holder];
        
        resonance.totalTokens = balanceOf(holder);
        resonance.lastInteraction = block.timestamp;
        
        // Calculate resonance score based on holdings and frequency alignment
        if (frequencyAlignment.isActivated) {
            uint256 baseScore = (resonance.totalTokens / (10 ** decimals())) * frequencyAlignment.resonanceScore;
            resonance.resonanceScore = baseScore * frequencyAlignment.cosmicAlignment / 10000;
            resonance.isAligned = true;
            
            // Add acquired frequency if not already present
            bool hasFrequency = false;
            for (uint256 i = 0; i < resonance.acquiredFrequencies.length; i++) {
                if (resonance.acquiredFrequencies[i] == frequencyAlignment.primaryFrequency) {
                    hasFrequency = true;
                    break;
                }
            }
            if (!hasFrequency) {
                resonance.acquiredFrequencies.push(frequencyAlignment.primaryFrequency);
            }
        }
        
        emit HolderResonanceUpdated(holder, resonance.resonanceScore, resonance.isAligned);
    }
    
    // ============ METAL PRICING ============
    
    /**
     * @dev Set metal price per gram
     * @param metalType Type of metal
     * @param pricePerGram Price per gram in wei
     */
    function setMetalPrice(MetalType metalType, uint256 pricePerGram) 
        external 
        onlyRole(RESOURCE_MANAGER_ROLE) 
    {
        require(pricePerGram > 0, "Invalid price");
        metalPrices[metalType] = pricePerGram;
    }
    
    // ============ QUERY FUNCTIONS ============
    
    /**
     * @dev Get resource backing details
     * @return Resource backing data
     */
    function getResourceBacking() external view returns (ResourceBacking memory) {
        return resourceBacking;
    }
    
    /**
     * @dev Get frequency alignment details
     * @return Frequency alignment data
     */
    function getFrequencyAlignment() external view returns (FrequencyAlignment memory) {
        return frequencyAlignment;
    }
    
    /**
     * @dev Get asteroid material details
     * @return Asteroid material data
     */
    function getAsteroidMaterial() external view returns (AsteroidMaterial memory) {
        return asteroidMaterial;
    }
    
    /**
     * @dev Get holder resonance
     * @param holder Holder address
     * @return Holder resonance data
     */
    function getHolderResonance(address holder) 
        external 
        view 
        returns (HolderResonance memory) 
    {
        return holderResonances[holder];
    }
    
    /**
     * @dev Calculate token value based on backing
     * @param amount Token amount
     * @return Equivalent resource value
     */
    function calculateBackingValue(uint256 amount) 
        external 
        view 
        returns (uint256) 
    {
        if (!resourceBacking.isVerified) return 0;
        
        uint256 tokenCount = amount / (10 ** decimals());
        uint256 baseValue = tokenCount * resourceBacking.reservesPerToken;
        
        // Apply scarcity multiplier
        return baseValue * scarcityMultiplier / 10000;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Pause token transfers
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    // ============ OVERRIDES ============
    
    /**
     * @dev Hook to update resonance on transfers
     */
    function _update(address from, address to, uint256 amount)
        internal
        override
        whenNotPaused
    {
        super._update(from, to, amount);
        
        if (to != address(0)) {
            _updateHolderResonance(to, amount);
        }
    }
}
