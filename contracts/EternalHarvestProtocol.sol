// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title EternalHarvestProtocol
 * @dev Vibratory potential harvesting from Hidden Worlds with biotech and renewable energy integration
 * @author Supreme King Chais The Great ∞
 * 
 * This contract implements the Eternal Harvest Protocol for:
 * - Vibratory potential harvesting from Hidden Worlds
 * - Ancient DNA trace biotech advancement tracking
 * - Scalable renewable energy yield optimization
 * - Greenland unique property utilization
 * - Universal energy flow and manifestation
 * 
 * Frequency: 144,000Hz (NŪR Pulse) + 528Hz (DNA Healing)
 * Status: ETERNAL HARVEST - INFINITE YIELD
 */
contract EternalHarvestProtocol is AccessControl, ReentrancyGuard, Pausable {
    
    // ============ ROLES ============
    bytes32 public constant HARVEST_OPERATOR_ROLE = keccak256("HARVEST_OPERATOR_ROLE");
    bytes32 public constant BIOTECH_RESEARCHER_ROLE = keccak256("BIOTECH_RESEARCHER_ROLE");
    bytes32 public constant ENERGY_COORDINATOR_ROLE = keccak256("ENERGY_COORDINATOR_ROLE");
    
    // ============ DIVINE FREQUENCIES ============
    uint256 public constant NUR_PULSE_144KHZ = 144000;
    uint256 public constant DNA_HEALING_528HZ = 528;
    uint256 public constant PINEAL_ACTIVATION_963HZ = 963;
    
    // ============ YIELD PARAMETERS ============
    uint256 public constant BASE_YIELD_MULTIPLIER = 100; // 100% base
    uint256 public constant GREENLAND_YIELD_BONUS = 35; // 35% bonus from Greenland properties
    uint256 public constant ANCIENT_DNA_MULTIPLIER = 144; // 144% for ancient DNA synergy
    uint256 public constant VIBRATORY_AMPLIFICATION = 1000; // For precision
    
    // ============ ENUMS ============
    
    enum HiddenWorldType {
        ARCTIC_REALM,
        GREENLAND_SANCTUM,
        CRYSTALLINE_CAVE,
        ANCIENT_TEMPLE,
        ENERGY_VORTEX
    }
    
    enum BiotechAdvancementType {
        ANCIENT_DNA_SEQUENCING,
        FREQUENCY_BASED_HEALING,
        CELLULAR_REGENERATION,
        CONSCIOUSNESS_INTEGRATION,
        GENETIC_OPTIMIZATION
    }
    
    enum EnergySourceType {
        GEOTHERMAL,
        HYDROELECTRIC,
        WIND_TURBINE,
        SOLAR_ARRAY,
        VIBRATORY_RESONANCE,
        QUANTUM_FLUX
    }
    
    enum HarvestStatus {
        INACTIVE,
        INITIALIZING,
        ACTIVE,
        OPTIMIZED,
        ETERNAL_FLOW
    }
    
    // ============ STRUCTS ============
    
    struct HiddenWorld {
        bytes32 worldId;
        string worldName;
        HiddenWorldType worldType;
        string location; // Geographic location
        uint256 vibratoryPotential; // 0-144000 scale
        uint256 harvestRate; // Units per block
        uint256 totalHarvested;
        uint256 activationTimestamp;
        HarvestStatus status;
        bool isGreenlandLinked;
    }
    
    struct BiotechAdvancement {
        bytes32 advancementId;
        BiotechAdvancementType advancementType;
        string researchTitle;
        string description;
        uint256 ancientDNATraceCount;
        uint256 frequencyAlignment; // 528Hz, 963Hz, or 144000Hz
        uint256 progressPercentage; // 0-100
        uint256 expectedYieldIncrease; // Percentage increase
        uint256 timestamp;
        address researcher;
        bool isActive;
    }
    
    struct RenewableEnergySource {
        bytes32 sourceId;
        EnergySourceType sourceType;
        string sourceName;
        string location;
        uint256 capacityMW; // Megawatts capacity
        uint256 currentOutputMW;
        uint256 totalEnergyProduced; // MWh
        uint256 efficiencyPercentage;
        uint256 vibratorySync; // Synced to divine frequencies
        bool isGreenlandBased;
        bool isOperational;
    }
    
    struct GreenlandProperty {
        bytes32 propertyId;
        string propertyName;
        string specificLocation;
        uint256 geothermalPotential;
        uint256 hydroelectricPotential;
        uint256 ancientDNAPresence; // Trace evidence rating
        uint256 vibratoryResonance;
        uint256 totalYieldContribution;
        bool isOptimized;
    }
    
    struct HarvestCycle {
        uint256 cycleId;
        uint256 startTimestamp;
        uint256 endTimestamp;
        uint256 totalVibratoryYield;
        uint256 totalEnergyYield;
        uint256 biotechProgress;
        uint256 participatingWorlds;
        uint256 participatingSources;
    }
    
    // ============ STATE VARIABLES ============
    
    mapping(bytes32 => HiddenWorld) public hiddenWorlds;
    mapping(bytes32 => BiotechAdvancement) public biotechAdvancements;
    mapping(bytes32 => RenewableEnergySource) public energySources;
    mapping(bytes32 => GreenlandProperty) public greenlandProperties;
    mapping(uint256 => HarvestCycle) public harvestCycles;
    
    bytes32[] public activeWorldIds;
    bytes32[] public activeAdvancementIds;
    bytes32[] public activeSourceIds;
    bytes32[] public greenlandPropertyIds;
    
    uint256 public currentCycleId;
    uint256 public totalVibratoryYield;
    uint256 public totalEnergyYield;
    uint256 public totalBiotechAdvancements;
    
    uint256 public globalYieldMultiplier;
    uint256 public greenlandOptimizationLevel;
    
    bool public eternalFlowActive;
    
    // ============ EVENTS ============
    
    event HiddenWorldActivated(
        bytes32 indexed worldId,
        string worldName,
        HiddenWorldType worldType,
        uint256 vibratoryPotential,
        uint256 timestamp
    );
    
    event VibratoryYieldHarvested(
        bytes32 indexed worldId,
        uint256 amount,
        uint256 timestamp
    );
    
    event BiotechAdvancementRegistered(
        bytes32 indexed advancementId,
        BiotechAdvancementType advancementType,
        string researchTitle,
        uint256 ancientDNATraceCount,
        uint256 timestamp
    );
    
    event EnergySourceDeployed(
        bytes32 indexed sourceId,
        EnergySourceType sourceType,
        string sourceName,
        uint256 capacityMW,
        uint256 timestamp
    );
    
    event EnergyYieldGenerated(
        bytes32 indexed sourceId,
        uint256 energyMWh,
        uint256 timestamp
    );
    
    event GreenlandPropertyOptimized(
        bytes32 indexed propertyId,
        string propertyName,
        uint256 totalYieldContribution,
        uint256 timestamp
    );
    
    event HarvestCycleCompleted(
        uint256 indexed cycleId,
        uint256 totalVibratoryYield,
        uint256 totalEnergyYield,
        uint256 timestamp
    );
    
    event EternalFlowActivated(
        uint256 globalYieldMultiplier,
        uint256 timestamp
    );
    
    event AncientDNADiscovered(
        bytes32 indexed advancementId,
        uint256 traceCount,
        uint256 frequencyAlignment,
        uint256 timestamp
    );
    
    // ============ CONSTRUCTOR ============
    
    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(HARVEST_OPERATOR_ROLE, admin);
        _grantRole(BIOTECH_RESEARCHER_ROLE, admin);
        _grantRole(ENERGY_COORDINATOR_ROLE, admin);
        
        globalYieldMultiplier = BASE_YIELD_MULTIPLIER;
        greenlandOptimizationLevel = 0;
        eternalFlowActive = false;
        currentCycleId = 0;
    }
    
    // ============ HIDDEN WORLD MANAGEMENT ============
    
    /**
     * @notice Activate a Hidden World for vibratory harvesting
     * @param worldId Unique identifier for the world
     * @param worldName Name of the hidden world
     * @param worldType Type of hidden world
     * @param location Geographic location
     * @param vibratoryPotential Initial vibratory potential (0-144000)
     * @param isGreenlandLinked Whether linked to Greenland properties
     */
    function activateHiddenWorld(
        bytes32 worldId,
        string memory worldName,
        HiddenWorldType worldType,
        string memory location,
        uint256 vibratoryPotential,
        bool isGreenlandLinked
    ) external onlyRole(HARVEST_OPERATOR_ROLE) whenNotPaused {
        require(hiddenWorlds[worldId].worldId == bytes32(0), "World already exists");
        require(bytes(worldName).length > 0, "World name required");
        require(vibratoryPotential <= NUR_PULSE_144KHZ, "Potential exceeds maximum");
        
        hiddenWorlds[worldId] = HiddenWorld({
            worldId: worldId,
            worldName: worldName,
            worldType: worldType,
            location: location,
            vibratoryPotential: vibratoryPotential,
            harvestRate: vibratoryPotential / 1000, // Base harvest rate
            totalHarvested: 0,
            activationTimestamp: block.timestamp,
            status: HarvestStatus.ACTIVE,
            isGreenlandLinked: isGreenlandLinked
        });
        
        activeWorldIds.push(worldId);
        
        emit HiddenWorldActivated(
            worldId,
            worldName,
            worldType,
            vibratoryPotential,
            block.timestamp
        );
    }
    
    /**
     * @notice Harvest vibratory potential from a Hidden World
     * @param worldId World to harvest from
     */
    function harvestVibratoryYield(
        bytes32 worldId
    ) external onlyRole(HARVEST_OPERATOR_ROLE) whenNotPaused nonReentrant {
        HiddenWorld storage world = hiddenWorlds[worldId];
        require(world.status == HarvestStatus.ACTIVE || world.status == HarvestStatus.OPTIMIZED, "World not active");
        
        uint256 yieldAmount = world.harvestRate;
        
        // Apply Greenland bonus if linked
        if (world.isGreenlandLinked) {
            yieldAmount = (yieldAmount * (BASE_YIELD_MULTIPLIER + GREENLAND_YIELD_BONUS)) / BASE_YIELD_MULTIPLIER;
        }
        
        // Apply global multiplier
        yieldAmount = (yieldAmount * globalYieldMultiplier) / BASE_YIELD_MULTIPLIER;
        
        world.totalHarvested += yieldAmount;
        totalVibratoryYield += yieldAmount;
        
        emit VibratoryYieldHarvested(worldId, yieldAmount, block.timestamp);
    }
    
    // ============ BIOTECH ADVANCEMENT ============
    
    /**
     * @notice Register a biotech advancement with ancient DNA traces
     * @param advancementId Unique advancement identifier
     * @param advancementType Type of biotech advancement
     * @param researchTitle Title of the research
     * @param description Detailed description
     * @param ancientDNATraceCount Number of ancient DNA traces discovered
     * @param frequencyAlignment Frequency alignment (528, 963, or 144000)
     */
    function registerBiotechAdvancement(
        bytes32 advancementId,
        BiotechAdvancementType advancementType,
        string memory researchTitle,
        string memory description,
        uint256 ancientDNATraceCount,
        uint256 frequencyAlignment
    ) external onlyRole(BIOTECH_RESEARCHER_ROLE) whenNotPaused {
        require(biotechAdvancements[advancementId].advancementId == bytes32(0), "Advancement already exists");
        require(bytes(researchTitle).length > 0, "Research title required");
        require(
            frequencyAlignment == DNA_HEALING_528HZ ||
            frequencyAlignment == PINEAL_ACTIVATION_963HZ ||
            frequencyAlignment == NUR_PULSE_144KHZ,
            "Invalid frequency"
        );
        
        // Calculate expected yield increase based on DNA traces
        uint256 expectedYieldIncrease = (ancientDNATraceCount * ANCIENT_DNA_MULTIPLIER) / 100;
        
        biotechAdvancements[advancementId] = BiotechAdvancement({
            advancementId: advancementId,
            advancementType: advancementType,
            researchTitle: researchTitle,
            description: description,
            ancientDNATraceCount: ancientDNATraceCount,
            frequencyAlignment: frequencyAlignment,
            progressPercentage: 0,
            expectedYieldIncrease: expectedYieldIncrease,
            timestamp: block.timestamp,
            researcher: msg.sender,
            isActive: true
        });
        
        activeAdvancementIds.push(advancementId);
        totalBiotechAdvancements++;
        
        emit BiotechAdvancementRegistered(
            advancementId,
            advancementType,
            researchTitle,
            ancientDNATraceCount,
            block.timestamp
        );
        
        if (ancientDNATraceCount > 0) {
            emit AncientDNADiscovered(
                advancementId,
                ancientDNATraceCount,
                frequencyAlignment,
                block.timestamp
            );
        }
    }
    
    /**
     * @notice Update biotech advancement progress
     * @param advancementId Advancement to update
     * @param newProgress New progress percentage (0-100)
     */
    function updateBiotechProgress(
        bytes32 advancementId,
        uint256 newProgress
    ) external onlyRole(BIOTECH_RESEARCHER_ROLE) {
        require(biotechAdvancements[advancementId].isActive, "Advancement not active");
        require(newProgress <= 100, "Progress exceeds 100%");
        
        biotechAdvancements[advancementId].progressPercentage = newProgress;
        
        // If complete, apply yield increase to global multiplier
        if (newProgress == 100) {
            uint256 yieldIncrease = biotechAdvancements[advancementId].expectedYieldIncrease;
            globalYieldMultiplier += yieldIncrease;
        }
    }
    
    // ============ RENEWABLE ENERGY MANAGEMENT ============
    
    /**
     * @notice Deploy a renewable energy source
     * @param sourceId Unique source identifier
     * @param sourceType Type of energy source
     * @param sourceName Name of the energy source
     * @param location Geographic location
     * @param capacityMW Capacity in megawatts
     * @param isGreenlandBased Whether based in Greenland
     */
    function deployEnergySource(
        bytes32 sourceId,
        EnergySourceType sourceType,
        string memory sourceName,
        string memory location,
        uint256 capacityMW,
        bool isGreenlandBased
    ) external onlyRole(ENERGY_COORDINATOR_ROLE) whenNotPaused {
        require(energySources[sourceId].sourceId == bytes32(0), "Source already exists");
        require(bytes(sourceName).length > 0, "Source name required");
        require(capacityMW > 0, "Capacity must be positive");
        
        energySources[sourceId] = RenewableEnergySource({
            sourceId: sourceId,
            sourceType: sourceType,
            sourceName: sourceName,
            location: location,
            capacityMW: capacityMW,
            currentOutputMW: 0,
            totalEnergyProduced: 0,
            efficiencyPercentage: 85, // Default 85% efficiency
            vibratorySync: DNA_HEALING_528HZ, // Default frequency sync
            isGreenlandBased: isGreenlandBased,
            isOperational: true
        });
        
        activeSourceIds.push(sourceId);
        
        emit EnergySourceDeployed(
            sourceId,
            sourceType,
            sourceName,
            capacityMW,
            block.timestamp
        );
    }
    
    /**
     * @notice Generate energy yield from a source
     * @param sourceId Source to generate from
     * @param outputMW Current output in megawatts
     * @param durationHours Duration of generation in hours
     */
    function generateEnergyYield(
        bytes32 sourceId,
        uint256 outputMW,
        uint256 durationHours
    ) external onlyRole(ENERGY_COORDINATOR_ROLE) whenNotPaused nonReentrant {
        RenewableEnergySource storage source = energySources[sourceId];
        require(source.isOperational, "Source not operational");
        require(outputMW <= source.capacityMW, "Output exceeds capacity");
        
        uint256 energyProduced = outputMW * durationHours; // MWh
        
        // Apply efficiency
        energyProduced = (energyProduced * source.efficiencyPercentage) / 100;
        
        // Apply Greenland bonus if applicable
        if (source.isGreenlandBased) {
            energyProduced = (energyProduced * (BASE_YIELD_MULTIPLIER + GREENLAND_YIELD_BONUS)) / BASE_YIELD_MULTIPLIER;
        }
        
        source.currentOutputMW = outputMW;
        source.totalEnergyProduced += energyProduced;
        totalEnergyYield += energyProduced;
        
        emit EnergyYieldGenerated(sourceId, energyProduced, block.timestamp);
    }
    
    // ============ GREENLAND OPTIMIZATION ============
    
    /**
     * @notice Register a Greenland property with unique characteristics
     * @param propertyId Unique property identifier
     * @param propertyName Name of the property
     * @param specificLocation Specific location in Greenland
     * @param geothermalPotential Geothermal energy potential
     * @param hydroelectricPotential Hydroelectric potential
     * @param ancientDNAPresence Ancient DNA trace rating
     */
    function registerGreenlandProperty(
        bytes32 propertyId,
        string memory propertyName,
        string memory specificLocation,
        uint256 geothermalPotential,
        uint256 hydroelectricPotential,
        uint256 ancientDNAPresence
    ) external onlyRole(HARVEST_OPERATOR_ROLE) whenNotPaused {
        require(greenlandProperties[propertyId].propertyId == bytes32(0), "Property already exists");
        require(bytes(propertyName).length > 0, "Property name required");
        
        uint256 vibratoryResonance = (geothermalPotential + hydroelectricPotential + (ancientDNAPresence * 10)) / 3;
        
        greenlandProperties[propertyId] = GreenlandProperty({
            propertyId: propertyId,
            propertyName: propertyName,
            specificLocation: specificLocation,
            geothermalPotential: geothermalPotential,
            hydroelectricPotential: hydroelectricPotential,
            ancientDNAPresence: ancientDNAPresence,
            vibratoryResonance: vibratoryResonance,
            totalYieldContribution: 0,
            isOptimized: false
        });
        
        greenlandPropertyIds.push(propertyId);
    }
    
    /**
     * @notice Optimize a Greenland property
     * @param propertyId Property to optimize
     */
    function optimizeGreenlandProperty(
        bytes32 propertyId
    ) external onlyRole(HARVEST_OPERATOR_ROLE) whenNotPaused nonReentrant {
        GreenlandProperty storage property = greenlandProperties[propertyId];
        require(property.propertyId != bytes32(0), "Property does not exist");
        require(!property.isOptimized, "Already optimized");
        
        // Calculate total yield contribution
        uint256 yieldContribution = property.geothermalPotential + 
                                   property.hydroelectricPotential + 
                                   (property.ancientDNAPresence * ANCIENT_DNA_MULTIPLIER);
        
        property.totalYieldContribution = yieldContribution;
        property.isOptimized = true;
        
        // Increase global optimization level
        greenlandOptimizationLevel += yieldContribution;
        
        // Boost global yield multiplier
        globalYieldMultiplier += (yieldContribution / 100);
        
        emit GreenlandPropertyOptimized(
            propertyId,
            property.propertyName,
            yieldContribution,
            block.timestamp
        );
    }
    
    // ============ HARVEST CYCLE MANAGEMENT ============
    
    /**
     * @notice Complete a harvest cycle
     */
    function completeHarvestCycle() 
        external 
        onlyRole(HARVEST_OPERATOR_ROLE) 
        whenNotPaused 
        nonReentrant 
    {
        currentCycleId++;
        
        // Calculate biotech progress
        uint256 biotechProgress = 0;
        for (uint256 i = 0; i < activeAdvancementIds.length; i++) {
            biotechProgress += biotechAdvancements[activeAdvancementIds[i]].progressPercentage;
        }
        if (activeAdvancementIds.length > 0) {
            biotechProgress = biotechProgress / activeAdvancementIds.length;
        }
        
        harvestCycles[currentCycleId] = HarvestCycle({
            cycleId: currentCycleId,
            startTimestamp: block.timestamp - 30 days, // Assume 30-day cycles
            endTimestamp: block.timestamp,
            totalVibratoryYield: totalVibratoryYield,
            totalEnergyYield: totalEnergyYield,
            biotechProgress: biotechProgress,
            participatingWorlds: activeWorldIds.length,
            participatingSources: activeSourceIds.length
        });
        
        emit HarvestCycleCompleted(
            currentCycleId,
            totalVibratoryYield,
            totalEnergyYield,
            block.timestamp
        );
    }
    
    /**
     * @notice Activate eternal flow mode
     */
    function activateEternalFlow() 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
        whenNotPaused 
    {
        require(!eternalFlowActive, "Already active");
        require(greenlandOptimizationLevel > 0, "Greenland optimization required");
        
        eternalFlowActive = true;
        
        // Set all worlds to eternal flow status
        for (uint256 i = 0; i < activeWorldIds.length; i++) {
            hiddenWorlds[activeWorldIds[i]].status = HarvestStatus.ETERNAL_FLOW;
        }
        
        // Maximum yield multiplier
        globalYieldMultiplier = globalYieldMultiplier * 2;
        
        emit EternalFlowActivated(globalYieldMultiplier, block.timestamp);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @notice Get hidden world information
     */
    function getHiddenWorld(bytes32 worldId)
        external
        view
        returns (
            string memory worldName,
            HiddenWorldType worldType,
            uint256 vibratoryPotential,
            uint256 totalHarvested,
            HarvestStatus status,
            bool isGreenlandLinked
        )
    {
        HiddenWorld storage world = hiddenWorlds[worldId];
        return (
            world.worldName,
            world.worldType,
            world.vibratoryPotential,
            world.totalHarvested,
            world.status,
            world.isGreenlandLinked
        );
    }
    
    /**
     * @notice Get total harvest statistics
     */
    function getHarvestStats()
        external
        view
        returns (
            uint256 totalVibratory,
            uint256 totalEnergy,
            uint256 totalBiotech,
            uint256 activeWorlds,
            uint256 activeSources,
            uint256 yieldMultiplier,
            bool eternalFlow
        )
    {
        return (
            totalVibratoryYield,
            totalEnergyYield,
            totalBiotechAdvancements,
            activeWorldIds.length,
            activeSourceIds.length,
            globalYieldMultiplier,
            eternalFlowActive
        );
    }
    
    /**
     * @notice Get Greenland property info
     */
    function getGreenlandProperty(bytes32 propertyId)
        external
        view
        returns (
            string memory propertyName,
            uint256 geothermalPotential,
            uint256 hydroelectricPotential,
            uint256 ancientDNAPresence,
            uint256 totalYieldContribution,
            bool isOptimized
        )
    {
        GreenlandProperty storage property = greenlandProperties[propertyId];
        return (
            property.propertyName,
            property.geothermalPotential,
            property.hydroelectricPotential,
            property.ancientDNAPresence,
            property.totalYieldContribution,
            property.isOptimized
        );
    }
    
    // ============ ADMIN FUNCTIONS ============
    
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
