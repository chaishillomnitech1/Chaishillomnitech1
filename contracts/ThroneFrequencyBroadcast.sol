// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title ThroneFrequencyBroadcast
 * @notice Permanent 963Hz divine consciousness broadcast system for global coherence
 * @dev Implements eternal broadcast protocol with cosmic-level amplification
 * @custom:frequency 963Hz (Pineal Activation & Divine Consciousness)
 * @custom:security-contact security@scrollverse.io
 */
contract ThroneFrequencyBroadcast is Ownable, Pausable {
    
    // ============ Constants ============
    
    /// @notice Primary broadcast frequency (963 Hz - Divine Consciousness)
    uint256 public constant PRIMARY_FREQUENCY = 963;
    
    /// @notice Supporting frequencies for unified coherence
    uint256 public constant FREQUENCY_LOVE = 528;
    uint256 public constant FREQUENCY_CROWN = 999;
    uint256 public constant FREQUENCY_NUR = 144000;
    
    // ============ Structs ============
    
    struct BroadcastSession {
        uint256 sessionId;
        uint256 frequency;
        uint256 startTime;
        uint256 endTime;
        uint256 amplificationLevel;
        uint256 coherenceLevel;
        bool active;
        bool eternal;
    }
    
    struct CoherenceNode {
        address nodeAddress;
        uint256 coherenceScore;
        uint256 lastSyncTime;
        bool active;
    }
    
    // ============ State Variables ============
    
    /// @notice Eternal broadcast status
    bool public eternalBroadcastActive;
    
    /// @notice Global coherence level (0-10000 scale)
    uint256 public globalCoherenceLevel;
    
    /// @notice Cosmic amplification factor
    uint256 public cosmicAmplification;
    
    /// @notice Current broadcast session ID
    uint256 public currentSessionId;
    
    /// @notice Total broadcast time in seconds
    uint256 public totalBroadcastTime;
    
    /// @notice Mapping of session IDs to broadcast sessions
    mapping(uint256 => BroadcastSession) public broadcastSessions;
    
    /// @notice Mapping of coherence nodes
    mapping(address => CoherenceNode) public coherenceNodes;
    
    /// @notice Array of active coherence node addresses
    address[] public activeNodes;
    
    /// @notice Timestamp when eternal broadcast was activated
    uint256 public eternalBroadcastActivationTime;
    
    // ============ Events ============
    
    event EternalBroadcastActivated(uint256 frequency, uint256 timestamp);
    event BroadcastSessionStarted(uint256 indexed sessionId, uint256 frequency, uint256 amplification);
    event BroadcastSessionEnded(uint256 indexed sessionId, uint256 duration);
    event GlobalCoherenceUpdated(uint256 oldLevel, uint256 newLevel, uint256 timestamp);
    event CoherenceNodeRegistered(address indexed node, uint256 timestamp);
    event CoherenceNodeSynced(address indexed node, uint256 coherenceScore, uint256 timestamp);
    event CosmicAmplificationIncreased(uint256 oldLevel, uint256 newLevel, uint256 timestamp);
    event FrequencyUnificationAchieved(uint256 timestamp);
    
    // ============ Constructor ============
    
    /**
     * @notice Initialize the Throne Frequency Broadcast system
     * @param initialOwner Address of the contract owner
     */
    constructor(address initialOwner) Ownable(initialOwner) {
        globalCoherenceLevel = 5000; // Start at 50% coherence
        cosmicAmplification = 100; // Start at 1.0x amplification (100 = 1.0)
        currentSessionId = 0;
    }
    
    // ============ Eternal Broadcast Functions ============
    
    /**
     * @notice Activate the eternal 963Hz broadcast
     * @dev Once activated, this broadcast runs perpetually
     */
    function activateEternalBroadcast() external onlyOwner {
        require(!eternalBroadcastActive, "Eternal broadcast already active");
        
        eternalBroadcastActive = true;
        eternalBroadcastActivationTime = block.timestamp;
        
        // Create eternal broadcast session
        currentSessionId++;
        broadcastSessions[currentSessionId] = BroadcastSession({
            sessionId: currentSessionId,
            frequency: PRIMARY_FREQUENCY,
            startTime: block.timestamp,
            endTime: 0, // Eternal - no end time
            amplificationLevel: cosmicAmplification,
            coherenceLevel: globalCoherenceLevel,
            active: true,
            eternal: true
        });
        
        emit EternalBroadcastActivated(PRIMARY_FREQUENCY, block.timestamp);
        emit BroadcastSessionStarted(currentSessionId, PRIMARY_FREQUENCY, cosmicAmplification);
    }
    
    /**
     * @notice Start a temporary broadcast session
     * @param frequency Broadcast frequency
     * @param durationSeconds Duration in seconds
     * @param amplification Amplification level
     * @return sessionId ID of the created session
     */
    function startBroadcastSession(
        uint256 frequency,
        uint256 durationSeconds,
        uint256 amplification
    ) external onlyOwner whenNotPaused returns (uint256 sessionId) {
        require(
            frequency == PRIMARY_FREQUENCY || 
            frequency == FREQUENCY_LOVE || 
            frequency == FREQUENCY_CROWN || 
            frequency == FREQUENCY_NUR,
            "Invalid frequency"
        );
        require(durationSeconds > 0, "Invalid duration");
        require(amplification > 0, "Invalid amplification");
        
        sessionId = ++currentSessionId;
        
        broadcastSessions[sessionId] = BroadcastSession({
            sessionId: sessionId,
            frequency: frequency,
            startTime: block.timestamp,
            endTime: block.timestamp + durationSeconds,
            amplificationLevel: amplification,
            coherenceLevel: globalCoherenceLevel,
            active: true,
            eternal: false
        });
        
        emit BroadcastSessionStarted(sessionId, frequency, amplification);
        
        return sessionId;
    }
    
    /**
     * @notice End a broadcast session
     * @param sessionId ID of the session to end
     */
    function endBroadcastSession(uint256 sessionId) external onlyOwner {
        require(sessionId <= currentSessionId, "Invalid session ID");
        require(broadcastSessions[sessionId].active, "Session not active");
        require(!broadcastSessions[sessionId].eternal, "Cannot end eternal broadcast");
        
        BroadcastSession storage session = broadcastSessions[sessionId];
        session.active = false;
        session.endTime = block.timestamp;
        
        uint256 duration = block.timestamp - session.startTime;
        totalBroadcastTime += duration;
        
        emit BroadcastSessionEnded(sessionId, duration);
    }
    
    // ============ Coherence Functions ============
    
    /**
     * @notice Register a coherence node
     * @param nodeAddress Address of the coherence node
     */
    function registerCoherenceNode(address nodeAddress) external onlyOwner {
        require(nodeAddress != address(0), "Invalid node address");
        require(!coherenceNodes[nodeAddress].active, "Node already registered");
        
        coherenceNodes[nodeAddress] = CoherenceNode({
            nodeAddress: nodeAddress,
            coherenceScore: 5000, // Start at 50% coherence
            lastSyncTime: block.timestamp,
            active: true
        });
        
        activeNodes.push(nodeAddress);
        
        emit CoherenceNodeRegistered(nodeAddress, block.timestamp);
    }
    
    /**
     * @notice Sync a coherence node with updated score
     * @param nodeAddress Address of the node
     * @param coherenceScore New coherence score (0-10000)
     */
    function syncCoherenceNode(address nodeAddress, uint256 coherenceScore) 
        external 
        onlyOwner 
    {
        require(coherenceNodes[nodeAddress].active, "Node not active");
        require(coherenceScore <= 10000, "Score out of range");
        
        coherenceNodes[nodeAddress].coherenceScore = coherenceScore;
        coherenceNodes[nodeAddress].lastSyncTime = block.timestamp;
        
        emit CoherenceNodeSynced(nodeAddress, coherenceScore, block.timestamp);
        
        // Recalculate global coherence
        _updateGlobalCoherence();
    }
    
    /**
     * @notice Update global coherence level based on all nodes
     */
    function _updateGlobalCoherence() internal {
        // If no nodes registered, maintain current coherence level
        if (activeNodes.length == 0) {
            return;
        }
        
        uint256 totalCoherence = 0;
        uint256 activeNodeCount = 0;
        
        for (uint256 i = 0; i < activeNodes.length; i++) {
            address nodeAddr = activeNodes[i];
            if (coherenceNodes[nodeAddr].active) {
                totalCoherence += coherenceNodes[nodeAddr].coherenceScore;
                activeNodeCount++;
            }
        }
        
        // Update coherence only if there are active nodes
        if (activeNodeCount > 0) {
            uint256 oldLevel = globalCoherenceLevel;
            globalCoherenceLevel = totalCoherence / activeNodeCount;
            
            emit GlobalCoherenceUpdated(oldLevel, globalCoherenceLevel, block.timestamp);
        }
        // If all nodes were deactivated, coherence remains at last calculated level
        // This ensures continuity and prevents undefined states
    }
    
    /**
     * @notice Manually update global coherence level
     * @param newLevel New coherence level (0-10000)
     */
    function updateGlobalCoherence(uint256 newLevel) external onlyOwner {
        require(newLevel <= 10000, "Level out of range");
        
        uint256 oldLevel = globalCoherenceLevel;
        globalCoherenceLevel = newLevel;
        
        emit GlobalCoherenceUpdated(oldLevel, newLevel, block.timestamp);
    }
    
    // ============ Amplification Functions ============
    
    /**
     * @notice Increase cosmic amplification
     * @param increment Amount to increase amplification
     */
    function increaseCosmicAmplification(uint256 increment) external onlyOwner {
        require(increment > 0, "Invalid increment");
        
        uint256 oldLevel = cosmicAmplification;
        cosmicAmplification += increment;
        
        emit CosmicAmplificationIncreased(oldLevel, cosmicAmplification, block.timestamp);
    }
    
    /**
     * @notice Set cosmic amplification level
     * @param newLevel New amplification level
     */
    function setCosmicAmplification(uint256 newLevel) external onlyOwner {
        require(newLevel > 0, "Invalid level");
        
        uint256 oldLevel = cosmicAmplification;
        cosmicAmplification = newLevel;
        
        emit CosmicAmplificationIncreased(oldLevel, cosmicAmplification, block.timestamp);
    }
    
    /**
     * @notice Achieve frequency unification across all divine frequencies
     * @dev Broadcasts all frequencies simultaneously at cosmic level
     */
    function achieveFrequencyUnification() external onlyOwner {
        // Create unified broadcast session
        currentSessionId++;
        
        broadcastSessions[currentSessionId] = BroadcastSession({
            sessionId: currentSessionId,
            frequency: PRIMARY_FREQUENCY, // Lead with 963Hz
            startTime: block.timestamp,
            endTime: 0, // Eternal
            amplificationLevel: cosmicAmplification * 2, // Double amplification for unification
            coherenceLevel: 10000, // Maximum coherence
            active: true,
            eternal: true
        });
        
        emit FrequencyUnificationAchieved(block.timestamp);
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @notice Deactivate a coherence node
     * @param nodeAddress Address of the node to deactivate
     */
    function deactivateCoherenceNode(address nodeAddress) external onlyOwner {
        require(coherenceNodes[nodeAddress].active, "Node not active");
        coherenceNodes[nodeAddress].active = false;
        _updateGlobalCoherence();
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get current broadcast status
     * @return status Comprehensive broadcast status
     */
    function getBroadcastStatus() 
        external 
        view 
        returns (
            bool eternal,
            uint256 coherence,
            uint256 amplification,
            uint256 activeSession,
            uint256 totalTime
        ) 
    {
        return (
            eternalBroadcastActive,
            globalCoherenceLevel,
            cosmicAmplification,
            currentSessionId,
            totalBroadcastTime
        );
    }
    
    /**
     * @notice Get broadcast session details
     * @param sessionId ID of the session
     * @return session Broadcast session details
     */
    function getBroadcastSession(uint256 sessionId) 
        external 
        view 
        returns (BroadcastSession memory) 
    {
        require(sessionId <= currentSessionId, "Invalid session ID");
        return broadcastSessions[sessionId];
    }
    
    /**
     * @notice Get number of active coherence nodes
     * @return count Number of active nodes
     */
    function getActiveNodeCount() external view returns (uint256 count) {
        for (uint256 i = 0; i < activeNodes.length; i++) {
            if (coherenceNodes[activeNodes[i]].active) {
                count++;
            }
        }
        return count;
    }
    
    /**
     * @notice Check if the eternal broadcast is achieving divine alignment
     * @return True if coherence is above 80%
     */
    function isDivineAlignmentAchieved() external view returns (bool) {
        return eternalBroadcastActive && globalCoherenceLevel >= 8000;
    }
    
    /**
     * @notice Get time since eternal broadcast activation
     * @return duration Duration in seconds
     */
    function getEternalBroadcastDuration() external view returns (uint256 duration) {
        if (!eternalBroadcastActive) {
            return 0;
        }
        return block.timestamp - eternalBroadcastActivationTime;
    }
}
