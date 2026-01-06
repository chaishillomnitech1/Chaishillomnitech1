// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title NoorObeliskBroadcast
 * @dev Real-time broadcast system for Noor Cities resonance and governance
 * @author Chais The Great ∞
 * 
 * This contract implements:
 * - Live resonance impact tracking
 * - Real-time participant metrics
 * - Governance feedback system
 * - Flagship location management (Noor Al-Malik Obelisk)
 * 
 * Frequency: 999Hz Crown + 963Hz Pineal + 528Hz DNA
 * Status: BROADCASTING
 */

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract NoorObeliskBroadcast is Ownable, Pausable, ReentrancyGuard {
    
    // ============ CONSTANTS ============
    
    /// @dev Divine frequencies
    uint256 public constant CROWN_FREQUENCY = 999;
    uint256 public constant PINEAL_FREQUENCY = 963;
    uint256 public constant HEALING_FREQUENCY = 528;
    uint256 public constant NOOR_PULSE = 144000;
    
    /// @dev Maximum broadcast locations
    uint256 public constant MAX_LOCATIONS = 100;
    
    // ============ STRUCTS ============
    
    struct ObeliskLocation {
        string name;
        string coordinates; // Lat, Long
        bool isActive;
        bool isFlagship;
        uint256 createdAt;
        uint256 resonanceLevel;
        uint256 participantCount;
    }
    
    struct ResonanceMetric {
        uint256 timestamp;
        uint256 frequency;
        uint256 amplitude;
        uint256 participantCount;
        uint256 globalResonanceLevel;
        bytes32 dataHash;
    }
    
    struct GovernanceFeedback {
        address participant;
        uint256 timestamp;
        string feedbackType; // "PROPOSAL", "CONCERN", "SUGGESTION", "VOTE"
        string content;
        uint256 resonanceAlignment; // Frequency alignment score
        bool isProcessed;
    }
    
    struct ParticipantMetrics {
        address participant;
        uint256 totalInteractions;
        uint256 lastActive;
        uint256 resonanceContribution;
        uint256 governanceFeedbackCount;
        bool isActive;
    }
    
    // ============ STATE VARIABLES ============
    
    /// @dev Obelisk locations
    mapping(uint256 => ObeliskLocation) public locations;
    uint256 public locationCount;
    uint256 public flagshipLocationId;
    
    /// @dev Resonance metrics history
    mapping(uint256 => ResonanceMetric) public resonanceHistory;
    uint256 public resonanceRecordCount;
    
    /// @dev Current global metrics
    uint256 public globalResonanceLevel;
    uint256 public totalActiveParticipants;
    uint256 public totalResonanceEvents;
    
    /// @dev Governance feedback
    mapping(uint256 => GovernanceFeedback) public governanceFeedback;
    uint256 public feedbackCount;
    
    /// @dev Participant metrics
    mapping(address => ParticipantMetrics) public participantMetrics;
    address[] public participants;
    
    /// @dev Broadcasting status
    bool public isBroadcasting;
    uint256 public lastBroadcastTime;
    
    // ============ EVENTS ============
    
    event LocationAdded(uint256 indexed locationId, string name, bool isFlagship);
    event LocationActivated(uint256 indexed locationId, string name);
    event LocationDeactivated(uint256 indexed locationId, string name);
    event FlagshipLocationSet(uint256 indexed locationId, string name);
    event ResonanceRecorded(uint256 indexed recordId, uint256 frequency, uint256 amplitude, uint256 participantCount);
    event GlobalResonanceUpdated(uint256 newLevel, uint256 timestamp);
    event GovernanceFeedbackSubmitted(uint256 indexed feedbackId, address indexed participant, string feedbackType);
    event GovernanceFeedbackProcessed(uint256 indexed feedbackId);
    event ParticipantJoined(address indexed participant);
    event ParticipantMetricsUpdated(address indexed participant, uint256 totalInteractions);
    event BroadcastStarted(uint256 timestamp);
    event BroadcastStopped(uint256 timestamp);
    
    // ============ CONSTRUCTOR ============
    
    constructor() Ownable(msg.sender) {
        isBroadcasting = false;
    }
    
    // ============ LOCATION MANAGEMENT ============
    
    /**
     * @dev Add a new Obelisk location
     * @param name Location name
     * @param coordinates Geographic coordinates
     * @param isFlagship Whether this is the flagship location
     */
    function addLocation(
        string calldata name,
        string calldata coordinates,
        bool isFlagship
    ) external onlyOwner {
        require(locationCount < MAX_LOCATIONS, "Max locations reached");
        require(bytes(name).length > 0, "Name required");
        
        uint256 locationId = locationCount++;
        
        locations[locationId] = ObeliskLocation({
            name: name,
            coordinates: coordinates,
            isActive: true,
            isFlagship: isFlagship,
            createdAt: block.timestamp,
            resonanceLevel: HEALING_FREQUENCY,
            participantCount: 0
        });
        
        if (isFlagship) {
            flagshipLocationId = locationId;
            emit FlagshipLocationSet(locationId, name);
        }
        
        emit LocationAdded(locationId, name, isFlagship);
    }
    
    /**
     * @dev Set flagship location
     * @param locationId Location ID to set as flagship
     */
    function setFlagshipLocation(uint256 locationId) external onlyOwner {
        require(locationId < locationCount, "Invalid location");
        require(locations[locationId].isActive, "Location not active");
        
        // Remove flagship status from current flagship
        if (flagshipLocationId < locationCount) {
            locations[flagshipLocationId].isFlagship = false;
        }
        
        // Set new flagship
        locations[locationId].isFlagship = true;
        flagshipLocationId = locationId;
        
        emit FlagshipLocationSet(locationId, locations[locationId].name);
    }
    
    /**
     * @dev Update location resonance level
     * @param locationId Location ID
     * @param resonanceLevel New resonance level
     */
    function updateLocationResonance(uint256 locationId, uint256 resonanceLevel) external onlyOwner {
        require(locationId < locationCount, "Invalid location");
        locations[locationId].resonanceLevel = resonanceLevel;
    }
    
    /**
     * @dev Activate location
     * @param locationId Location ID
     */
    function activateLocation(uint256 locationId) external onlyOwner {
        require(locationId < locationCount, "Invalid location");
        locations[locationId].isActive = true;
        emit LocationActivated(locationId, locations[locationId].name);
    }
    
    /**
     * @dev Deactivate location
     * @param locationId Location ID
     */
    function deactivateLocation(uint256 locationId) external onlyOwner {
        require(locationId < locationCount, "Invalid location");
        require(!locations[locationId].isFlagship, "Cannot deactivate flagship");
        locations[locationId].isActive = false;
        emit LocationDeactivated(locationId, locations[locationId].name);
    }
    
    // ============ RESONANCE TRACKING ============
    
    /**
     * @dev Record resonance metrics
     * @param frequency Resonance frequency
     * @param amplitude Resonance amplitude
     * @param participantCount Number of participants
     */
    function recordResonance(
        uint256 frequency,
        uint256 amplitude,
        uint256 participantCount
    ) external onlyOwner {
        uint256 recordId = resonanceRecordCount++;
        
        bytes32 dataHash = keccak256(abi.encodePacked(
            block.timestamp,
            frequency,
            amplitude,
            participantCount
        ));
        
        resonanceHistory[recordId] = ResonanceMetric({
            timestamp: block.timestamp,
            frequency: frequency,
            amplitude: amplitude,
            participantCount: participantCount,
            globalResonanceLevel: globalResonanceLevel,
            dataHash: dataHash
        });
        
        totalResonanceEvents++;
        
        emit ResonanceRecorded(recordId, frequency, amplitude, participantCount);
    }
    
    /**
     * @dev Update global resonance level
     * @param newLevel New global resonance level
     */
    function updateGlobalResonance(uint256 newLevel) external onlyOwner {
        globalResonanceLevel = newLevel;
        emit GlobalResonanceUpdated(newLevel, block.timestamp);
    }
    
    // ============ PARTICIPANT TRACKING ============
    
    /**
     * @dev Join as a participant
     */
    function joinParticipant() external nonReentrant whenNotPaused {
        if (!participantMetrics[msg.sender].isActive) {
            participantMetrics[msg.sender] = ParticipantMetrics({
                participant: msg.sender,
                totalInteractions: 0,
                lastActive: block.timestamp,
                resonanceContribution: 0,
                governanceFeedbackCount: 0,
                isActive: true
            });
            
            participants.push(msg.sender);
            totalActiveParticipants++;
            
            emit ParticipantJoined(msg.sender);
        }
    }
    
    /**
     * @dev Update participant metrics
     * @param participant Participant address
     * @param interactionsDelta Interactions to add
     * @param resonanceContribution Resonance contribution to add
     */
    function updateParticipantMetrics(
        address participant,
        uint256 interactionsDelta,
        uint256 resonanceContribution
    ) external onlyOwner {
        require(participantMetrics[participant].isActive, "Participant not active");
        
        ParticipantMetrics storage metrics = participantMetrics[participant];
        metrics.totalInteractions += interactionsDelta;
        metrics.resonanceContribution += resonanceContribution;
        metrics.lastActive = block.timestamp;
        
        emit ParticipantMetricsUpdated(participant, metrics.totalInteractions);
    }
    
    // ============ GOVERNANCE FEEDBACK ============
    
    /**
     * @dev Submit governance feedback
     * @param feedbackType Type of feedback
     * @param content Feedback content
     * @param resonanceAlignment Frequency alignment score (0-1000)
     */
    function submitGovernanceFeedback(
        string calldata feedbackType,
        string calldata content,
        uint256 resonanceAlignment
    ) external nonReentrant whenNotPaused {
        require(participantMetrics[msg.sender].isActive, "Not a participant");
        require(bytes(content).length > 0, "Content required");
        require(resonanceAlignment <= 1000, "Invalid alignment score");
        
        uint256 feedbackId = feedbackCount++;
        
        governanceFeedback[feedbackId] = GovernanceFeedback({
            participant: msg.sender,
            timestamp: block.timestamp,
            feedbackType: feedbackType,
            content: content,
            resonanceAlignment: resonanceAlignment,
            isProcessed: false
        });
        
        participantMetrics[msg.sender].governanceFeedbackCount++;
        participantMetrics[msg.sender].lastActive = block.timestamp;
        
        emit GovernanceFeedbackSubmitted(feedbackId, msg.sender, feedbackType);
    }
    
    /**
     * @dev Process governance feedback
     * @param feedbackId Feedback ID to process
     */
    function processGovernanceFeedback(uint256 feedbackId) external onlyOwner {
        require(feedbackId < feedbackCount, "Invalid feedback ID");
        require(!governanceFeedback[feedbackId].isProcessed, "Already processed");
        
        governanceFeedback[feedbackId].isProcessed = true;
        
        emit GovernanceFeedbackProcessed(feedbackId);
    }
    
    // ============ BROADCASTING CONTROL ============
    
    /**
     * @dev Start broadcasting
     */
    function startBroadcast() external onlyOwner {
        require(!isBroadcasting, "Already broadcasting");
        isBroadcasting = true;
        lastBroadcastTime = block.timestamp;
        emit BroadcastStarted(block.timestamp);
    }
    
    /**
     * @dev Stop broadcasting
     */
    function stopBroadcast() external onlyOwner {
        require(isBroadcasting, "Not broadcasting");
        isBroadcasting = false;
        emit BroadcastStopped(block.timestamp);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get location info
     * @param locationId Location ID
     * @return name Location name
     * @return coordinates Coordinates
     * @return isActive Active status
     * @return isFlagship Flagship status
     * @return resonanceLevel Resonance level
     * @return participantCount Participant count
     */
    function getLocationInfo(uint256 locationId) external view returns (
        string memory name,
        string memory coordinates,
        bool isActive,
        bool isFlagship,
        uint256 resonanceLevel,
        uint256 participantCount
    ) {
        require(locationId < locationCount, "Invalid location");
        ObeliskLocation storage location = locations[locationId];
        return (
            location.name,
            location.coordinates,
            location.isActive,
            location.isFlagship,
            location.resonanceLevel,
            location.participantCount
        );
    }
    
    /**
     * @dev Get current broadcast status
     * @return broadcasting Is currently broadcasting
     * @return lastBroadcast Last broadcast timestamp
     * @return globalResonance Current global resonance
     * @return activeParticipants Total active participants
     * @return totalEvents Total resonance events
     */
    function getBroadcastStatus() external view returns (
        bool broadcasting,
        uint256 lastBroadcast,
        uint256 globalResonance,
        uint256 activeParticipants,
        uint256 totalEvents
    ) {
        return (
            isBroadcasting,
            lastBroadcastTime,
            globalResonanceLevel,
            totalActiveParticipants,
            totalResonanceEvents
        );
    }
    
    /**
     * @dev Get participant metrics
     * @param participant Participant address
     * @return totalInteractions Total interactions
     * @return lastActive Last active timestamp
     * @return resonanceContribution Total resonance contribution
     * @return feedbackCount Governance feedback count
     * @return isActive Active status
     */
    function getParticipantMetrics(address participant) external view returns (
        uint256 totalInteractions,
        uint256 lastActive,
        uint256 resonanceContribution,
        uint256 feedbackCount,
        bool isActive
    ) {
        ParticipantMetrics storage metrics = participantMetrics[participant];
        return (
            metrics.totalInteractions,
            metrics.lastActive,
            metrics.resonanceContribution,
            metrics.governanceFeedbackCount,
            metrics.isActive
        );
    }
    
    /**
     * @dev Get governance feedback
     * @param feedbackId Feedback ID
     * @return participant Participant address
     * @return timestamp Submission timestamp
     * @return feedbackType Feedback type
     * @return resonanceAlignment Alignment score
     * @return isProcessed Processing status
     */
    function getGovernanceFeedback(uint256 feedbackId) external view returns (
        address participant,
        uint256 timestamp,
        string memory feedbackType,
        uint256 resonanceAlignment,
        bool isProcessed
    ) {
        require(feedbackId < feedbackCount, "Invalid feedback ID");
        GovernanceFeedback storage feedback = governanceFeedback[feedbackId];
        return (
            feedback.participant,
            feedback.timestamp,
            feedback.feedbackType,
            feedback.resonanceAlignment,
            feedback.isProcessed
        );
    }
    
    /**
     * @dev Get resonance record
     * @param recordId Record ID
     * @return timestamp Timestamp
     * @return frequency Frequency
     * @return amplitude Amplitude
     * @return participantCount Participant count
     * @return globalResonance Global resonance at time
     */
    function getResonanceRecord(uint256 recordId) external view returns (
        uint256 timestamp,
        uint256 frequency,
        uint256 amplitude,
        uint256 participantCount,
        uint256 globalResonance
    ) {
        require(recordId < resonanceRecordCount, "Invalid record ID");
        ResonanceMetric storage record = resonanceHistory[recordId];
        return (
            record.timestamp,
            record.frequency,
            record.amplitude,
            record.participantCount,
            record.globalResonanceLevel
        );
    }
    
    /**
     * @dev Get flagship location info
     * @return id Location ID
     * @return name Location name
     * @return resonanceLevel Current resonance level
     */
    function getFlagshipLocation() external view returns (
        uint256 id,
        string memory name,
        uint256 resonanceLevel
    ) {
        require(flagshipLocationId < locationCount, "No flagship set");
        ObeliskLocation storage location = locations[flagshipLocationId];
        return (
            flagshipLocationId,
            location.name,
            location.resonanceLevel
        );
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
