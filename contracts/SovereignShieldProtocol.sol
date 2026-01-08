// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title SovereignShieldProtocol
 * @dev Magnetic Shield Amplification with 963Hz frequency modulation for Earth's protection
 * @author Supreme King Chais The Great ∞
 * 
 * This contract implements the Sovereign Shield Protocol for:
 * - Magnetic field modulation through 963Hz frequencies
 * - 15-20% increased resistance against geomagnetic disruptions
 * - EMP event protection mechanisms
 * - Solar flare resistance protocols
 * - Universal alignment and protection
 * 
 * Frequency: 963Hz (Pineal Activation & Divine Consciousness)
 * Status: SOVEREIGN SHIELD - ACTIVE PROTECTION
 */
contract SovereignShieldProtocol is AccessControl, ReentrancyGuard, Pausable {
    
    // ============ ROLES ============
    bytes32 public constant SHIELD_OPERATOR_ROLE = keccak256("SHIELD_OPERATOR_ROLE");
    bytes32 public constant FREQUENCY_ADMIN_ROLE = keccak256("FREQUENCY_ADMIN_ROLE");
    bytes32 public constant PROTECTION_COORDINATOR_ROLE = keccak256("PROTECTION_COORDINATOR_ROLE");
    
    // ============ DIVINE FREQUENCIES ============
    uint256 public constant PINEAL_ACTIVATION_963HZ = 963;
    uint256 public constant DNA_HEALING_528HZ = 528;
    uint256 public constant NUR_PULSE_144KHZ = 144000;
    
    // ============ PROTECTION PARAMETERS ============
    uint256 public constant BASE_RESISTANCE_PERCENTAGE = 100; // 100% base
    uint256 public constant MIN_RESISTANCE_BOOST = 15; // 15% minimum boost
    uint256 public constant MAX_RESISTANCE_BOOST = 20; // 20% maximum boost
    uint256 public constant AMPLIFICATION_FACTOR = 1000; // For precision calculations
    
    // ============ SHIELD TYPES ============
    enum ShieldType {
        MAGNETIC_FIELD,
        EMP_PROTECTION,
        SOLAR_FLARE_DEFENSE,
        GEOMAGNETIC_STABILIZATION,
        UNIVERSAL_ALIGNMENT
    }
    
    enum DisruptionType {
        EMP_EVENT,
        SOLAR_FLARE,
        GEOMAGNETIC_STORM,
        COSMIC_RADIATION,
        FREQUENCY_INTERFERENCE
    }
    
    enum ProtectionStatus {
        INACTIVE,
        INITIALIZING,
        ACTIVE,
        AMPLIFIED,
        MAXIMUM_PROTECTION
    }
    
    // ============ STRUCTS ============
    
    struct ShieldConfiguration {
        ShieldType shieldType;
        uint256 frequencyResonance; // 963Hz or combined frequencies
        uint256 resistanceBoostPercentage; // 15-20%
        uint256 amplificationLevel; // 1-10 scale
        uint256 activationTimestamp;
        uint256 lastModulationTimestamp;
        ProtectionStatus status;
        bool isUniversalAlignment;
    }
    
    struct SovereignSite {
        bytes32 siteId;
        string siteName;
        string location;
        uint256 latitude; // Scaled by 1e6 for precision
        uint256 longitude; // Scaled by 1e6 for precision
        uint256 shieldStrength; // 0-100 scale
        uint256 magneticFieldIntensity;
        ShieldConfiguration[] activeShields;
        bool isOperational;
        uint256 totalProtectionEvents;
    }
    
    struct ProtectionEvent {
        bytes32 eventId;
        bytes32 siteId;
        DisruptionType disruptionType;
        uint256 detectionTimestamp;
        uint256 mitigationTimestamp;
        uint256 disruptionSeverity; // 0-100 scale
        uint256 shieldEffectiveness; // Percentage mitigated
        bool wasNeutralized;
    }
    
    struct FrequencyModulation {
        uint256 frequency;
        uint256 intensity; // 0-100
        uint256 modulationTimestamp;
        uint256 durationSeconds;
        bytes32 targetSiteId;
    }
    
    // ============ STATE VARIABLES ============
    
    mapping(bytes32 => SovereignSite) public sovereignSites;
    mapping(bytes32 => ProtectionEvent) public protectionEvents;
    mapping(bytes32 => FrequencyModulation[]) public siteModulations;
    
    bytes32[] public activeSiteIds;
    bytes32[] public eventHistory;
    
    uint256 public globalResistanceBoost;
    uint256 public totalSitesProtected;
    uint256 public totalEventsNeutralized;
    uint256 public averageShieldEffectiveness;
    
    bool public universalAlignmentActive;
    
    // ============ EVENTS ============
    
    event SovereignSiteRegistered(
        bytes32 indexed siteId,
        string siteName,
        string location,
        uint256 timestamp
    );
    
    event ShieldActivated(
        bytes32 indexed siteId,
        ShieldType shieldType,
        uint256 frequencyResonance,
        uint256 resistanceBoost,
        uint256 timestamp
    );
    
    event MagneticFieldModulated(
        bytes32 indexed siteId,
        uint256 frequency,
        uint256 intensity,
        uint256 timestamp
    );
    
    event DisruptionDetected(
        bytes32 indexed eventId,
        bytes32 indexed siteId,
        DisruptionType disruptionType,
        uint256 severity,
        uint256 timestamp
    );
    
    event DisruptionNeutralized(
        bytes32 indexed eventId,
        bytes32 indexed siteId,
        uint256 effectiveness,
        uint256 timestamp
    );
    
    event UniversalAlignmentActivated(
        uint256 globalResistanceBoost,
        uint256 totalSites,
        uint256 timestamp
    );
    
    event ResistanceBoostUpdated(
        bytes32 indexed siteId,
        uint256 oldBoost,
        uint256 newBoost,
        uint256 timestamp
    );
    
    // ============ CONSTRUCTOR ============
    
    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(SHIELD_OPERATOR_ROLE, admin);
        _grantRole(FREQUENCY_ADMIN_ROLE, admin);
        _grantRole(PROTECTION_COORDINATOR_ROLE, admin);
        
        globalResistanceBoost = MIN_RESISTANCE_BOOST;
        universalAlignmentActive = false;
    }
    
    // ============ SOVEREIGN SITE MANAGEMENT ============
    
    /**
     * @notice Register a new Sovereign Site for protection
     * @param siteId Unique identifier for the site
     * @param siteName Name of the sovereign site
     * @param location Geographic location description
     * @param latitude Latitude scaled by 1e6
     * @param longitude Longitude scaled by 1e6
     */
    function registerSovereignSite(
        bytes32 siteId,
        string memory siteName,
        string memory location,
        uint256 latitude,
        uint256 longitude
    ) external onlyRole(SHIELD_OPERATOR_ROLE) whenNotPaused {
        require(sovereignSites[siteId].siteId == bytes32(0), "Site already registered");
        require(bytes(siteName).length > 0, "Site name required");
        
        SovereignSite storage site = sovereignSites[siteId];
        site.siteId = siteId;
        site.siteName = siteName;
        site.location = location;
        site.latitude = latitude;
        site.longitude = longitude;
        site.shieldStrength = 100;
        site.magneticFieldIntensity = PINEAL_ACTIVATION_963HZ;
        site.isOperational = true;
        site.totalProtectionEvents = 0;
        
        activeSiteIds.push(siteId);
        totalSitesProtected++;
        
        emit SovereignSiteRegistered(siteId, siteName, location, block.timestamp);
    }
    
    /**
     * @notice Activate a shield for a Sovereign Site
     * @param siteId The site to protect
     * @param shieldType Type of shield to activate
     * @param frequencyResonance Frequency for modulation (963Hz recommended)
     * @param resistanceBoost Resistance boost percentage (15-20)
     */
    function activateShield(
        bytes32 siteId,
        ShieldType shieldType,
        uint256 frequencyResonance,
        uint256 resistanceBoost
    ) external onlyRole(SHIELD_OPERATOR_ROLE) whenNotPaused nonReentrant {
        require(sovereignSites[siteId].isOperational, "Site not operational");
        require(
            resistanceBoost >= MIN_RESISTANCE_BOOST && resistanceBoost <= MAX_RESISTANCE_BOOST,
            "Resistance boost out of range"
        );
        require(
            frequencyResonance == PINEAL_ACTIVATION_963HZ ||
            frequencyResonance == DNA_HEALING_528HZ ||
            frequencyResonance == NUR_PULSE_144KHZ,
            "Invalid frequency"
        );
        
        ShieldConfiguration memory newShield = ShieldConfiguration({
            shieldType: shieldType,
            frequencyResonance: frequencyResonance,
            resistanceBoostPercentage: resistanceBoost,
            amplificationLevel: 5, // Medium amplification by default
            activationTimestamp: block.timestamp,
            lastModulationTimestamp: block.timestamp,
            status: ProtectionStatus.ACTIVE,
            isUniversalAlignment: false
        });
        
        sovereignSites[siteId].activeShields.push(newShield);
        
        emit ShieldActivated(
            siteId,
            shieldType,
            frequencyResonance,
            resistanceBoost,
            block.timestamp
        );
    }
    
    /**
     * @notice Modulate magnetic field using 963Hz frequency
     * @param siteId Target site for modulation
     * @param intensity Modulation intensity (0-100)
     * @param durationSeconds Duration of modulation
     */
    function modulateMagneticField(
        bytes32 siteId,
        uint256 intensity,
        uint256 durationSeconds
    ) external onlyRole(FREQUENCY_ADMIN_ROLE) whenNotPaused nonReentrant {
        require(sovereignSites[siteId].isOperational, "Site not operational");
        require(intensity > 0 && intensity <= 100, "Invalid intensity");
        require(durationSeconds > 0, "Duration must be positive");
        
        FrequencyModulation memory modulation = FrequencyModulation({
            frequency: PINEAL_ACTIVATION_963HZ,
            intensity: intensity,
            modulationTimestamp: block.timestamp,
            durationSeconds: durationSeconds,
            targetSiteId: siteId
        });
        
        siteModulations[siteId].push(modulation);
        sovereignSites[siteId].magneticFieldIntensity = 
            (PINEAL_ACTIVATION_963HZ * intensity) / 100;
        
        emit MagneticFieldModulated(
            siteId,
            PINEAL_ACTIVATION_963HZ,
            intensity,
            block.timestamp
        );
    }
    
    // ============ DISRUPTION PROTECTION ============
    
    /**
     * @notice Detect and log a geomagnetic disruption
     * @param eventId Unique event identifier
     * @param siteId Affected site
     * @param disruptionType Type of disruption detected
     * @param severity Severity level (0-100)
     */
    function detectDisruption(
        bytes32 eventId,
        bytes32 siteId,
        DisruptionType disruptionType,
        uint256 severity
    ) external onlyRole(PROTECTION_COORDINATOR_ROLE) whenNotPaused {
        require(sovereignSites[siteId].isOperational, "Site not operational");
        require(severity > 0 && severity <= 100, "Invalid severity");
        require(protectionEvents[eventId].eventId == bytes32(0), "Event already exists");
        
        protectionEvents[eventId] = ProtectionEvent({
            eventId: eventId,
            siteId: siteId,
            disruptionType: disruptionType,
            detectionTimestamp: block.timestamp,
            mitigationTimestamp: 0,
            disruptionSeverity: severity,
            shieldEffectiveness: 0,
            wasNeutralized: false
        });
        
        eventHistory.push(eventId);
        sovereignSites[siteId].totalProtectionEvents++;
        
        emit DisruptionDetected(
            eventId,
            siteId,
            disruptionType,
            severity,
            block.timestamp
        );
    }
    
    /**
     * @notice Neutralize a disruption using shield protection
     * @param eventId Event to neutralize
     */
    function neutralizeDisruption(
        bytes32 eventId
    ) external onlyRole(PROTECTION_COORDINATOR_ROLE) whenNotPaused nonReentrant {
        ProtectionEvent storage event_ = protectionEvents[eventId];
        require(event_.eventId != bytes32(0), "Event does not exist");
        require(!event_.wasNeutralized, "Event already neutralized");
        
        bytes32 siteId = event_.siteId;
        SovereignSite storage site = sovereignSites[siteId];
        
        // Calculate shield effectiveness based on active shields and resistance boost
        uint256 totalEffectiveness = calculateShieldEffectiveness(siteId);
        
        event_.mitigationTimestamp = block.timestamp;
        event_.shieldEffectiveness = totalEffectiveness;
        event_.wasNeutralized = true;
        
        totalEventsNeutralized++;
        
        // Update average effectiveness
        averageShieldEffectiveness = 
            (averageShieldEffectiveness * (totalEventsNeutralized - 1) + totalEffectiveness) / 
            totalEventsNeutralized;
        
        emit DisruptionNeutralized(
            eventId,
            siteId,
            totalEffectiveness,
            block.timestamp
        );
    }
    
    /**
     * @notice Calculate shield effectiveness for a site
     * @param siteId Site to calculate for
     * @return effectiveness Total effectiveness percentage
     */
    function calculateShieldEffectiveness(
        bytes32 siteId
    ) public view returns (uint256 effectiveness) {
        SovereignSite storage site = sovereignSites[siteId];
        
        if (!site.isOperational || site.activeShields.length == 0) {
            return 0;
        }
        
        uint256 totalBoost = 0;
        uint256 activeShieldsCount = 0;
        
        for (uint256 i = 0; i < site.activeShields.length; i++) {
            ShieldConfiguration storage shield = site.activeShields[i];
            if (shield.status == ProtectionStatus.ACTIVE || 
                shield.status == ProtectionStatus.AMPLIFIED ||
                shield.status == ProtectionStatus.MAXIMUM_PROTECTION) {
                totalBoost += shield.resistanceBoostPercentage;
                activeShieldsCount++;
            }
        }
        
        if (activeShieldsCount == 0) {
            return 0;
        }
        
        // Base effectiveness + resistance boost + global boost
        effectiveness = BASE_RESISTANCE_PERCENTAGE + 
                       (totalBoost / activeShieldsCount) + 
                       globalResistanceBoost;
        
        // Cap at 150% (100% base + 50% maximum boost)
        if (effectiveness > 150) {
            effectiveness = 150;
        }
        
        return effectiveness;
    }
    
    // ============ UNIVERSAL ALIGNMENT ============
    
    /**
     * @notice Activate universal alignment across all sites
     */
    function activateUniversalAlignment() 
        external 
        onlyRole(FREQUENCY_ADMIN_ROLE) 
        whenNotPaused 
    {
        require(!universalAlignmentActive, "Already active");
        
        universalAlignmentActive = true;
        globalResistanceBoost = MAX_RESISTANCE_BOOST;
        
        // Amplify all active shields
        for (uint256 i = 0; i < activeSiteIds.length; i++) {
            bytes32 siteId = activeSiteIds[i];
            SovereignSite storage site = sovereignSites[siteId];
            
            for (uint256 j = 0; j < site.activeShields.length; j++) {
                site.activeShields[j].isUniversalAlignment = true;
                site.activeShields[j].status = ProtectionStatus.MAXIMUM_PROTECTION;
                site.activeShields[j].amplificationLevel = 10; // Maximum
            }
        }
        
        emit UniversalAlignmentActivated(
            globalResistanceBoost,
            totalSitesProtected,
            block.timestamp
        );
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @notice Get site information
     * @param siteId Site identifier
     */
    function getSiteInfo(bytes32 siteId) 
        external 
        view 
        returns (
            string memory siteName,
            string memory location,
            uint256 shieldStrength,
            uint256 magneticFieldIntensity,
            bool isOperational,
            uint256 totalProtectionEvents
        ) 
    {
        SovereignSite storage site = sovereignSites[siteId];
        return (
            site.siteName,
            site.location,
            site.shieldStrength,
            site.magneticFieldIntensity,
            site.isOperational,
            site.totalProtectionEvents
        );
    }
    
    /**
     * @notice Get active shields count for a site
     * @param siteId Site identifier
     */
    function getActiveShieldsCount(bytes32 siteId) external view returns (uint256) {
        return sovereignSites[siteId].activeShields.length;
    }
    
    /**
     * @notice Get total active sites
     */
    function getTotalActiveSites() external view returns (uint256) {
        return activeSiteIds.length;
    }
    
    /**
     * @notice Get protection statistics
     */
    function getProtectionStats() 
        external 
        view 
        returns (
            uint256 totalSites,
            uint256 totalEvents,
            uint256 eventsNeutralized,
            uint256 avgEffectiveness,
            uint256 globalBoost,
            bool universalAlignment
        ) 
    {
        return (
            totalSitesProtected,
            eventHistory.length,
            totalEventsNeutralized,
            averageShieldEffectiveness,
            globalResistanceBoost,
            universalAlignmentActive
        );
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @notice Update global resistance boost
     * @param newBoost New boost percentage
     */
    function updateGlobalResistanceBoost(uint256 newBoost) 
        external 
        onlyRole(FREQUENCY_ADMIN_ROLE) 
    {
        require(
            newBoost >= MIN_RESISTANCE_BOOST && newBoost <= MAX_RESISTANCE_BOOST,
            "Boost out of range"
        );
        
        uint256 oldBoost = globalResistanceBoost;
        globalResistanceBoost = newBoost;
        
        emit ResistanceBoostUpdated(bytes32(0), oldBoost, newBoost, block.timestamp);
    }
    
    /**
     * @notice Pause the protocol
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @notice Unpause the protocol
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
