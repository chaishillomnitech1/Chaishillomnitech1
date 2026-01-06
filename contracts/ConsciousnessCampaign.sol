// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title ConsciousnessCampaign
 * @dev Manages consciousness campaign scheduling with Infinite Potential and Ω.267 protocol alignment
 * 
 * @notice CONSCIOUSNESS CAMPAIGN PROTOCOL
 * 
 * This contract manages:
 * - Incremental consciousness campaign launches starting Week 2
 * - Infinite Potential focus and cultural resonance tracking
 * - Ω.267 protocol amplification integration
 * - Global consciousness synchronization
 * - Campaign metrics and impact measurement
 * 
 * Frequency: 963Hz (Pineal) + 528Hz (DNA) + 144000Hz (NŪR Pulse)
 * 
 * ALLĀHU AKBAR! 🕋✨💎🌌
 */
contract ConsciousnessCampaign is AccessControl, ReentrancyGuard, Pausable {
    
    // ========== ROLES ==========
    bytes32 public constant CAMPAIGN_ADMIN_ROLE = keccak256("CAMPAIGN_ADMIN_ROLE");
    bytes32 public constant CONSCIOUSNESS_GUIDE_ROLE = keccak256("CONSCIOUSNESS_GUIDE_ROLE");
    bytes32 public constant OMEGA_PROTOCOL_ROLE = keccak256("OMEGA_PROTOCOL_ROLE");
    
    // ========== CONSTANTS ==========
    uint256 public constant PINEAL_FREQUENCY = 963;
    uint256 public constant DNA_FREQUENCY = 528;
    uint256 public constant NUR_PULSE_FREQUENCY = 144000;
    uint256 public constant OMEGA_PROTOCOL_267 = 267;
    
    uint256 public constant WEEK_IN_SECONDS = 7 days;
    uint256 public constant CAMPAIGN_LAUNCH_WEEK = 2;
    
    // ========== ENUMS ==========
    
    enum CampaignType {
        INFINITE_POTENTIAL,
        CULTURAL_RESONANCE,
        GLOBAL_CONSCIOUSNESS,
        COSMIC_SCALABILITY,
        OMEGA_AMPLIFICATION
    }
    
    enum CampaignStatus {
        SCHEDULED,
        ACTIVE,
        PAUSED,
        COMPLETED,
        CANCELLED
    }
    
    enum ResonanceLevel {
        LOCAL,
        REGIONAL,
        NATIONAL,
        CONTINENTAL,
        GLOBAL
    }
    
    // ========== STRUCTS ==========
    
    struct Campaign {
        uint256 campaignId;
        string name;
        string description;
        CampaignType campaignType;
        uint256 launchWeek;
        uint256 launchTimestamp;
        uint256 duration;
        CampaignStatus status;
        ResonanceLevel resonanceLevel;
        uint256 omegaAmplification;
        uint256 participantCount;
        uint256 consciousnessScore;
        uint256 culturalImpact;
        bool isInfinitePotential;
        address creator;
        uint256 createdAt;
    }
    
    struct ConsciousnessMetrics {
        uint256 totalParticipants;
        uint256 globalResonance;
        uint256 infinitePotentialScore;
        uint256 culturalResonanceScore;
        uint256 omegaAmplificationLevel;
        uint256 lastUpdated;
    }
    
    struct OmegaProtocolConfig {
        uint256 baseAmplification;
        uint256 resonanceMultiplier;
        uint256 culturalFactor;
        uint256 cosmicScalability;
        bool isActive;
    }
    
    struct WeeklySchedule {
        uint256 weekNumber;
        uint256[] scheduledCampaigns;
        uint256 totalLaunches;
        uint256 aggregateImpact;
    }
    
    // ========== STATE VARIABLES ==========
    
    // Campaign tracking
    mapping(uint256 => Campaign) public campaigns;
    uint256[] public campaignIds;
    uint256 public totalCampaigns;
    uint256 private _nextCampaignId;
    
    // Weekly scheduling
    mapping(uint256 => WeeklySchedule) public weeklySchedules;
    uint256 public currentWeek;
    uint256 public deploymentTimestamp;
    
    // Consciousness metrics
    mapping(uint256 => ConsciousnessMetrics) public campaignMetrics;
    ConsciousnessMetrics public globalMetrics;
    
    // Omega protocol
    OmegaProtocolConfig public omegaProtocol;
    
    // Participant tracking
    mapping(uint256 => mapping(address => bool)) public campaignParticipants;
    mapping(address => uint256[]) public userCampaigns;
    mapping(address => uint256) public userConsciousnessScore;
    
    // Infinite Potential tracking
    mapping(uint256 => bool) public infinitePotentialCampaigns;
    uint256 public totalInfinitePotentialCampaigns;
    
    // ========== EVENTS ==========
    
    event CampaignCreated(uint256 indexed campaignId, string name, CampaignType campaignType, uint256 launchWeek);
    event CampaignLaunched(uint256 indexed campaignId, uint256 timestamp, ResonanceLevel resonanceLevel);
    event CampaignCompleted(uint256 indexed campaignId, uint256 participantCount, uint256 consciousnessScore);
    event ParticipantJoined(uint256 indexed campaignId, address indexed participant, uint256 timestamp);
    event ConsciousnessUpdated(uint256 indexed campaignId, uint256 consciousnessScore, uint256 culturalImpact);
    event OmegaAmplification(uint256 indexed campaignId, uint256 amplificationLevel, uint256 timestamp);
    event WeeklyLaunchScheduled(uint256 weekNumber, uint256 campaignId);
    event InfinitePotentialActivated(uint256 indexed campaignId, uint256 timestamp);
    
    // ========== CONSTRUCTOR ==========
    
    constructor(address initialOwner) {
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(CAMPAIGN_ADMIN_ROLE, initialOwner);
        _grantRole(CONSCIOUSNESS_GUIDE_ROLE, initialOwner);
        _grantRole(OMEGA_PROTOCOL_ROLE, initialOwner);
        
        _nextCampaignId = 1;
        deploymentTimestamp = block.timestamp;
        currentWeek = 1;
        
        // Initialize Omega Protocol with Ω.267 configuration
        omegaProtocol = OmegaProtocolConfig({
            baseAmplification: 267,
            resonanceMultiplier: 1000,
            culturalFactor: 500,
            cosmicScalability: 10000,
            isActive: true
        });
    }
    
    // ========== CAMPAIGN MANAGEMENT ==========
    
    /**
     * @dev Create new consciousness campaign
     */
    function createCampaign(
        string memory name,
        string memory description,
        CampaignType campaignType,
        uint256 launchWeek,
        uint256 duration,
        ResonanceLevel resonanceLevel,
        bool isInfinitePotential
    ) external onlyRole(CAMPAIGN_ADMIN_ROLE) returns (uint256) {
        require(bytes(name).length > 0, "Name required");
        require(launchWeek >= CAMPAIGN_LAUNCH_WEEK, "Must launch Week 2 or later");
        require(duration > 0, "Duration must be positive");
        
        uint256 campaignId = _nextCampaignId++;
        uint256 launchTimestamp = deploymentTimestamp + (launchWeek * WEEK_IN_SECONDS);
        
        campaigns[campaignId] = Campaign({
            campaignId: campaignId,
            name: name,
            description: description,
            campaignType: campaignType,
            launchWeek: launchWeek,
            launchTimestamp: launchTimestamp,
            duration: duration,
            status: CampaignStatus.SCHEDULED,
            resonanceLevel: resonanceLevel,
            omegaAmplification: omegaProtocol.baseAmplification,
            participantCount: 0,
            consciousnessScore: 0,
            culturalImpact: 0,
            isInfinitePotential: isInfinitePotential,
            creator: msg.sender,
            createdAt: block.timestamp
        });
        
        campaignIds.push(campaignId);
        totalCampaigns++;
        
        // Schedule for weekly launch
        weeklySchedules[launchWeek].scheduledCampaigns.push(campaignId);
        weeklySchedules[launchWeek].totalLaunches++;
        
        if (isInfinitePotential) {
            infinitePotentialCampaigns[campaignId] = true;
            totalInfinitePotentialCampaigns++;
        }
        
        emit CampaignCreated(campaignId, name, campaignType, launchWeek);
        emit WeeklyLaunchScheduled(launchWeek, campaignId);
        
        return campaignId;
    }
    
    /**
     * @dev Launch campaign
     */
    function launchCampaign(uint256 campaignId) external onlyRole(CAMPAIGN_ADMIN_ROLE) {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.status == CampaignStatus.SCHEDULED, "Invalid status");
        require(block.timestamp >= campaign.launchTimestamp, "Too early to launch");
        
        campaign.status = CampaignStatus.ACTIVE;
        
        // Apply Omega amplification
        if (campaign.isInfinitePotential) {
            campaign.omegaAmplification = omegaProtocol.baseAmplification * omegaProtocol.resonanceMultiplier / 100;
            emit InfinitePotentialActivated(campaignId, block.timestamp);
        }
        
        emit CampaignLaunched(campaignId, block.timestamp, campaign.resonanceLevel);
    }
    
    /**
     * @dev Join campaign as participant
     */
    function joinCampaign(uint256 campaignId) external whenNotPaused {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.status == CampaignStatus.ACTIVE, "Campaign not active");
        require(!campaignParticipants[campaignId][msg.sender], "Already joined");
        
        campaignParticipants[campaignId][msg.sender] = true;
        userCampaigns[msg.sender].push(campaignId);
        campaign.participantCount++;
        
        // Update consciousness metrics
        campaignMetrics[campaignId].totalParticipants++;
        globalMetrics.totalParticipants++;
        
        // Increase user consciousness score
        userConsciousnessScore[msg.sender] += 100;
        
        emit ParticipantJoined(campaignId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Complete campaign
     */
    function completeCampaign(uint256 campaignId) external onlyRole(CAMPAIGN_ADMIN_ROLE) {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.status == CampaignStatus.ACTIVE, "Campaign not active");
        
        campaign.status = CampaignStatus.COMPLETED;
        
        // Calculate final consciousness score
        uint256 finalScore = _calculateConsciousnessScore(campaignId);
        campaign.consciousnessScore = finalScore;
        
        emit CampaignCompleted(campaignId, campaign.participantCount, finalScore);
    }
    
    // ========== CONSCIOUSNESS TRACKING ==========
    
    /**
     * @dev Update consciousness metrics
     */
    function updateConsciousnessMetrics(
        uint256 campaignId,
        uint256 infinitePotentialScore,
        uint256 culturalResonanceScore
    ) external onlyRole(CONSCIOUSNESS_GUIDE_ROLE) {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.status == CampaignStatus.ACTIVE, "Campaign not active");
        
        ConsciousnessMetrics storage metrics = campaignMetrics[campaignId];
        metrics.infinitePotentialScore = infinitePotentialScore;
        metrics.culturalResonanceScore = culturalResonanceScore;
        metrics.lastUpdated = block.timestamp;
        
        // Calculate cultural impact
        uint256 culturalImpact = _calculateCulturalImpact(
            campaign.participantCount,
            culturalResonanceScore,
            uint256(campaign.resonanceLevel)
        );
        campaign.culturalImpact = culturalImpact;
        
        // Update global metrics
        globalMetrics.infinitePotentialScore += infinitePotentialScore;
        globalMetrics.culturalResonanceScore += culturalResonanceScore;
        globalMetrics.lastUpdated = block.timestamp;
        
        emit ConsciousnessUpdated(campaignId, infinitePotentialScore, culturalImpact);
    }
    
    /**
     * @dev Apply Omega protocol amplification
     */
    function applyOmegaAmplification(uint256 campaignId) external onlyRole(OMEGA_PROTOCOL_ROLE) {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.status == CampaignStatus.ACTIVE, "Campaign not active");
        require(omegaProtocol.isActive, "Omega protocol inactive");
        
        // Calculate amplification level
        uint256 amplificationLevel = _calculateOmegaAmplification(
            campaign.participantCount,
            campaign.culturalImpact,
            uint256(campaign.resonanceLevel)
        );
        
        campaign.omegaAmplification = amplificationLevel;
        campaignMetrics[campaignId].omegaAmplificationLevel = amplificationLevel;
        globalMetrics.omegaAmplificationLevel += amplificationLevel;
        
        emit OmegaAmplification(campaignId, amplificationLevel, block.timestamp);
    }
    
    // ========== CALCULATION FUNCTIONS ==========
    
    /**
     * @dev Calculate consciousness score
     */
    function _calculateConsciousnessScore(uint256 campaignId) internal view returns (uint256) {
        Campaign memory campaign = campaigns[campaignId];
        ConsciousnessMetrics memory metrics = campaignMetrics[campaignId];
        
        uint256 participantFactor = campaign.participantCount * 100;
        uint256 resonanceFactor = uint256(campaign.resonanceLevel) * 1000;
        uint256 potentialFactor = metrics.infinitePotentialScore;
        uint256 culturalFactor = metrics.culturalResonanceScore;
        
        return (participantFactor + resonanceFactor + potentialFactor + culturalFactor) / 4;
    }
    
    /**
     * @dev Calculate cultural impact
     */
    function _calculateCulturalImpact(
        uint256 participantCount,
        uint256 culturalResonance,
        uint256 resonanceLevel
    ) internal pure returns (uint256) {
        return (participantCount * culturalResonance * (resonanceLevel + 1)) / 100;
    }
    
    /**
     * @dev Calculate Omega amplification
     */
    function _calculateOmegaAmplification(
        uint256 participantCount,
        uint256 culturalImpact,
        uint256 resonanceLevel
    ) internal view returns (uint256) {
        uint256 baseAmp = omegaProtocol.baseAmplification;
        uint256 multiplier = omegaProtocol.resonanceMultiplier;
        uint256 culturalFactor = omegaProtocol.culturalFactor;
        
        uint256 participantBonus = participantCount * 10;
        uint256 culturalBonus = (culturalImpact * culturalFactor) / 1000;
        uint256 resonanceBonus = resonanceLevel * multiplier;
        
        return baseAmp + participantBonus + culturalBonus + resonanceBonus;
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @dev Get campaign details
     */
    function getCampaign(uint256 campaignId) external view returns (Campaign memory) {
        return campaigns[campaignId];
    }
    
    /**
     * @dev Get campaign metrics
     */
    function getCampaignMetrics(uint256 campaignId) external view returns (ConsciousnessMetrics memory) {
        return campaignMetrics[campaignId];
    }
    
    /**
     * @dev Get weekly schedule
     */
    function getWeeklySchedule(uint256 weekNumber) external view returns (WeeklySchedule memory) {
        return weeklySchedules[weekNumber];
    }
    
    /**
     * @dev Get user campaigns
     */
    function getUserCampaigns(address user) external view returns (uint256[] memory) {
        return userCampaigns[user];
    }
    
    /**
     * @dev Get current week number
     */
    function getCurrentWeek() public view returns (uint256) {
        return ((block.timestamp - deploymentTimestamp) / WEEK_IN_SECONDS) + 1;
    }
    
    /**
     * @dev Check if campaign is infinite potential
     */
    function isInfinitePotentialCampaign(uint256 campaignId) external view returns (bool) {
        return infinitePotentialCampaigns[campaignId];
    }
    
    // ========== ADMIN FUNCTIONS ==========
    
    /**
     * @dev Update Omega protocol configuration
     */
    function updateOmegaProtocol(
        uint256 baseAmplification,
        uint256 resonanceMultiplier,
        uint256 culturalFactor,
        uint256 cosmicScalability
    ) external onlyRole(OMEGA_PROTOCOL_ROLE) {
        omegaProtocol.baseAmplification = baseAmplification;
        omegaProtocol.resonanceMultiplier = resonanceMultiplier;
        omegaProtocol.culturalFactor = culturalFactor;
        omegaProtocol.cosmicScalability = cosmicScalability;
    }
    
    /**
     * @dev Pause contract
     */
    function pause() external onlyRole(CAMPAIGN_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyRole(CAMPAIGN_ADMIN_ROLE) {
        _unpause();
    }
}
