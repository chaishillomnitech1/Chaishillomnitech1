// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SovereigntyGrid
 * @dev Infinite velocity redirect system for ScrollVerse ecosystem
 * @author Supreme King Chais The Great ∞
 * 
 * This contract implements the Sovereignty Grid with:
 * - Infinite velocity redirect mechanism
 * - Grid node management and activation
 * - Multi-dimensional routing capabilities
 * - Energy flow tracking and optimization
 * - Integration with Academy and HealthCoin
 * - Quantum entanglement simulation
 * 
 * Total Grid Nodes: Unlimited expandable network
 * Frequency: 144,000Hz (NŪR Pulse - Divine Activation)
 * Status: SOVEREIGNTY GRID INFINITE VELOCITY ACTIVE
 */

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SovereigntyGrid is Ownable, ReentrancyGuard {
    
    // ============ FREQUENCY CONSTANTS ============
    
    /// @dev NŪR pulse frequency (144,000Hz) - Divine activation
    uint256 public constant NUR_PULSE_FREQUENCY = 144000;
    
    /// @dev Infinite velocity constant
    uint256 public constant INFINITE_VELOCITY = type(uint256).max;
    
    /// @dev Speed of light (symbolic, for quantum calculations)
    uint256 public constant SPEED_OF_LIGHT = 299792458;
    
    // ============ GRID CONSTANTS ============
    
    /// @dev Maximum nodes per grid layer
    uint256 public constant MAX_NODES_PER_LAYER = 1000;
    
    /// @dev Maximum grid layers
    uint256 public constant MAX_GRID_LAYERS = 12;
    
    /// @dev Redirect velocity multiplier
    uint256 public constant VELOCITY_MULTIPLIER = 963;
    
    // ============ ENUMS ============
    
    enum NodeType {
        ENTRY_PORTAL,
        REDIRECT_HUB,
        AMPLIFIER_NODE,
        QUANTUM_GATE,
        HEALING_STATION,
        LEARNING_NEXUS,
        SOVEREIGNTY_ANCHOR
    }
    
    enum GridDimension {
        PHYSICAL,
        DIGITAL,
        CONSCIOUSNESS,
        QUANTUM,
        ETHEREAL
    }
    
    enum RedirectStatus {
        INACTIVE,
        ACTIVE,
        ACCELERATING,
        INFINITE_VELOCITY,
        QUANTUM_ENTANGLED
    }
    
    // ============ STRUCTS ============
    
    /// @dev Grid node structure
    struct GridNode {
        uint256 nodeId;
        NodeType nodeType;
        GridDimension dimension;
        uint256 layer;
        uint256 energyLevel;
        uint256 redirectCount;
        uint256 totalVelocity;
        bool active;
        address controller;
        uint256 activatedAt;
        string locationURI;
    }
    
    /// @dev Redirect record
    struct RedirectRecord {
        uint256 redirectId;
        address initiator;
        uint256 sourceNodeId;
        uint256 targetNodeId;
        GridDimension dimension;
        uint256 velocity;
        RedirectStatus status;
        uint256 timestamp;
        bytes32 dataHash;
    }
    
    /// @dev Velocity path
    struct VelocityPath {
        uint256 pathId;
        uint256[] nodeSequence;
        uint256 totalVelocity;
        uint256 energyRequired;
        bool infiniteVelocityAchieved;
        uint256 createdAt;
    }
    
    /// @dev Grid layer
    struct GridLayer {
        uint256 layerId;
        uint256 nodeCount;
        uint256 totalEnergy;
        uint256 totalRedirects;
        bool active;
    }
    
    // ============ STATE VARIABLES ============
    
    /// @dev Node counter
    uint256 private _nodeIdCounter;
    
    /// @dev Redirect counter
    uint256 private _redirectIdCounter;
    
    /// @dev Path counter
    uint256 private _pathIdCounter;
    
    /// @dev Mapping: Node ID => Grid Node
    mapping(uint256 => GridNode) public nodes;
    
    /// @dev Mapping: Redirect ID => Redirect Record
    mapping(uint256 => RedirectRecord) public redirects;
    
    /// @dev Mapping: Path ID => Velocity Path
    mapping(uint256 => VelocityPath) public paths;
    
    /// @dev Mapping: Layer ID => Grid Layer
    mapping(uint256 => GridLayer) public layers;
    
    /// @dev Mapping: Dimension => Node IDs
    mapping(GridDimension => uint256[]) public nodesByDimension;
    
    /// @dev Mapping: Address => Node IDs
    mapping(address => uint256[]) public nodesByController;
    
    /// @dev Mapping: Address => Grid Operator Status
    mapping(address => bool) public isGridOperator;
    
    /// @dev Mapping: Address => Total Redirects Initiated
    mapping(address => uint256) public redirectsByUser;
    
    /// @dev Mapping: Address => Infinite Velocity Achieved
    mapping(address => bool) public infiniteVelocityAchieved;
    
    /// @dev Academy contract address
    address public academyAddress;
    
    /// @dev HealthCoin contract address
    address public healthCoinAddress;
    
    /// @dev Total grid energy
    uint256 public totalGridEnergy;
    
    /// @dev Total redirects processed
    uint256 public totalRedirectsProcessed;
    
    /// @dev Grid active status
    bool public gridActive;
    
    /// @dev Infinite velocity mode enabled
    bool public infiniteVelocityEnabled;
    
    // ============ EVENTS ============
    
    event GridNodeCreated(
        uint256 indexed nodeId,
        NodeType nodeType,
        GridDimension dimension,
        uint256 layer,
        address controller
    );
    event GridNodeActivated(uint256 indexed nodeId, address activator);
    event RedirectExecuted(
        uint256 indexed redirectId,
        address indexed initiator,
        uint256 sourceNodeId,
        uint256 targetNodeId,
        uint256 velocity,
        RedirectStatus status
    );
    event InfiniteVelocityAchieved(address indexed user, uint256 redirectId);
    event VelocityPathCreated(uint256 indexed pathId, uint256 nodeCount, uint256 totalVelocity);
    event GridEnergyUpdated(uint256 nodeId, uint256 newEnergyLevel);
    event GridOperatorUpdated(address indexed operator, bool status);
    event GridStatusChanged(bool active);
    event InfiniteVelocityModeChanged(bool enabled);
    event QuantumEntanglementEstablished(uint256 node1, uint256 node2);
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        address initialOwner
    ) Ownable(initialOwner) {
        gridActive = true;
        infiniteVelocityEnabled = true;
        isGridOperator[initialOwner] = true;
        
        // Initialize base layers
        for (uint256 i = 1; i <= MAX_GRID_LAYERS; i++) {
            layers[i] = GridLayer({
                layerId: i,
                nodeCount: 0,
                totalEnergy: 0,
                totalRedirects: 0,
                active: true
            });
        }
    }
    
    // ============ MODIFIERS ============
    
    modifier onlyGridOperator() {
        require(isGridOperator[msg.sender] || msg.sender == owner(), "Not authorized grid operator");
        _;
    }
    
    modifier whenGridActive() {
        require(gridActive, "Grid not active");
        _;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Set grid operator status
     * @param operator Address to update
     * @param status New operator status
     */
    function setGridOperator(address operator, bool status) external onlyOwner {
        require(operator != address(0), "Invalid address");
        isGridOperator[operator] = status;
        emit GridOperatorUpdated(operator, status);
    }
    
    /**
     * @dev Enable or disable grid
     * @param active New status
     */
    function setGridActive(bool active) external onlyOwner {
        gridActive = active;
        emit GridStatusChanged(active);
    }
    
    /**
     * @dev Enable or disable infinite velocity mode
     * @param enabled New status
     */
    function setInfiniteVelocityEnabled(bool enabled) external onlyOwner {
        infiniteVelocityEnabled = enabled;
        emit InfiniteVelocityModeChanged(enabled);
    }
    
    /**
     * @dev Set Academy contract address
     * @param _academyAddress Academy contract address
     */
    function setAcademyAddress(address _academyAddress) external onlyOwner {
        require(_academyAddress != address(0), "Invalid address");
        academyAddress = _academyAddress;
    }
    
    /**
     * @dev Set HealthCoin contract address
     * @param _healthCoinAddress HealthCoin contract address
     */
    function setHealthCoinAddress(address _healthCoinAddress) external onlyOwner {
        require(_healthCoinAddress != address(0), "Invalid address");
        healthCoinAddress = _healthCoinAddress;
    }
    
    // ============ GRID NODE FUNCTIONS ============
    
    /**
     * @dev Create a new grid node
     * @param nodeType Type of node
     * @param dimension Grid dimension
     * @param layer Grid layer (1-12)
     * @param initialEnergy Initial energy level
     * @param locationURI URI for node location data
     */
    function createGridNode(
        NodeType nodeType,
        GridDimension dimension,
        uint256 layer,
        uint256 initialEnergy,
        string memory locationURI
    ) external onlyGridOperator whenGridActive returns (uint256) {
        require(layer > 0 && layer <= MAX_GRID_LAYERS, "Invalid layer");
        require(layers[layer].nodeCount < MAX_NODES_PER_LAYER, "Layer full");
        
        _nodeIdCounter++;
        uint256 newNodeId = _nodeIdCounter;
        
        nodes[newNodeId] = GridNode({
            nodeId: newNodeId,
            nodeType: nodeType,
            dimension: dimension,
            layer: layer,
            energyLevel: initialEnergy,
            redirectCount: 0,
            totalVelocity: 0,
            active: false,
            controller: msg.sender,
            activatedAt: 0,
            locationURI: locationURI
        });
        
        nodesByDimension[dimension].push(newNodeId);
        nodesByController[msg.sender].push(newNodeId);
        layers[layer].nodeCount++;
        
        emit GridNodeCreated(newNodeId, nodeType, dimension, layer, msg.sender);
        
        return newNodeId;
    }
    
    /**
     * @dev Activate a grid node
     * @param nodeId Node ID to activate
     */
    function activateGridNode(uint256 nodeId) external onlyGridOperator whenGridActive {
        require(nodes[nodeId].nodeId != 0, "Node does not exist");
        require(!nodes[nodeId].active, "Already active");
        
        nodes[nodeId].active = true;
        nodes[nodeId].activatedAt = block.timestamp;
        
        emit GridNodeActivated(nodeId, msg.sender);
    }
    
    /**
     * @dev Update grid node energy
     * @param nodeId Node ID
     * @param energyDelta Energy change (can be negative via type casting)
     * @param increase True to increase, false to decrease
     */
    function updateNodeEnergy(uint256 nodeId, uint256 energyDelta, bool increase) 
        external 
        onlyGridOperator 
    {
        require(nodes[nodeId].nodeId != 0, "Node does not exist");
        
        GridNode storage node = nodes[nodeId];
        uint256 layer = node.layer;
        
        if (increase) {
            node.energyLevel += energyDelta;
            totalGridEnergy += energyDelta;
            layers[layer].totalEnergy += energyDelta;
        } else {
            require(node.energyLevel >= energyDelta, "Insufficient energy");
            node.energyLevel -= energyDelta;
            totalGridEnergy -= energyDelta;
            layers[layer].totalEnergy -= energyDelta;
        }
        
        emit GridEnergyUpdated(nodeId, node.energyLevel);
    }
    
    // ============ REDIRECT FUNCTIONS ============
    
    /**
     * @dev Execute infinite velocity redirect
     * @param sourceNodeId Source node ID
     * @param targetNodeId Target node ID
     * @param dimension Redirect dimension
     * @param dataHash Hash of redirect data
     */
    function executeRedirect(
        uint256 sourceNodeId,
        uint256 targetNodeId,
        GridDimension dimension,
        bytes32 dataHash
    ) external whenGridActive nonReentrant returns (uint256) {
        require(nodes[sourceNodeId].active, "Source node not active");
        require(nodes[targetNodeId].active, "Target node not active");
        require(sourceNodeId != targetNodeId, "Cannot redirect to same node");
        
        _redirectIdCounter++;
        uint256 redirectId = _redirectIdCounter;
        
        // Calculate velocity based on node properties
        uint256 velocity = _calculateRedirectVelocity(sourceNodeId, targetNodeId);
        
        RedirectStatus status = velocity >= SPEED_OF_LIGHT 
            ? RedirectStatus.INFINITE_VELOCITY 
            : RedirectStatus.ACTIVE;
        
        redirects[redirectId] = RedirectRecord({
            redirectId: redirectId,
            initiator: msg.sender,
            sourceNodeId: sourceNodeId,
            targetNodeId: targetNodeId,
            dimension: dimension,
            velocity: velocity,
            status: status,
            timestamp: block.timestamp,
            dataHash: dataHash
        });
        
        // Update node stats
        nodes[sourceNodeId].redirectCount++;
        nodes[sourceNodeId].totalVelocity += velocity;
        nodes[targetNodeId].redirectCount++;
        
        // Update layer stats
        layers[nodes[sourceNodeId].layer].totalRedirects++;
        
        // Update user stats
        redirectsByUser[msg.sender]++;
        totalRedirectsProcessed++;
        
        emit RedirectExecuted(
            redirectId,
            msg.sender,
            sourceNodeId,
            targetNodeId,
            velocity,
            status
        );
        
        // Check for infinite velocity achievement
        if (status == RedirectStatus.INFINITE_VELOCITY && !infiniteVelocityAchieved[msg.sender]) {
            infiniteVelocityAchieved[msg.sender] = true;
            emit InfiniteVelocityAchieved(msg.sender, redirectId);
        }
        
        return redirectId;
    }
    
    /**
     * @dev Calculate redirect velocity
     * @param sourceNodeId Source node ID
     * @param targetNodeId Target node ID
     */
    function _calculateRedirectVelocity(uint256 sourceNodeId, uint256 targetNodeId) 
        internal 
        view 
        returns (uint256) 
    {
        GridNode storage sourceNode = nodes[sourceNodeId];
        GridNode storage targetNode = nodes[targetNodeId];
        
        // Base velocity from energy levels
        uint256 baseVelocity = (sourceNode.energyLevel + targetNode.energyLevel) * VELOCITY_MULTIPLIER;
        
        // Dimension bonus
        if (sourceNode.dimension == targetNode.dimension) {
            baseVelocity *= 2;
        }
        
        // Layer differential bonus (higher layers = more velocity)
        uint256 layerBonus = (sourceNode.layer + targetNode.layer) * 1000;
        baseVelocity += layerBonus;
        
        // Infinite velocity mode check
        if (infiniteVelocityEnabled && baseVelocity > SPEED_OF_LIGHT) {
            return INFINITE_VELOCITY;
        }
        
        return baseVelocity;
    }
    
    /**
     * @dev Create velocity path through multiple nodes
     * @param nodeIds Array of node IDs forming the path
     */
    function createVelocityPath(uint256[] memory nodeIds) 
        external 
        whenGridActive 
        returns (uint256) 
    {
        require(nodeIds.length >= 2, "Path requires at least 2 nodes");
        require(nodeIds.length <= 12, "Path too long");
        
        // Validate all nodes exist and are active
        uint256 totalVelocity = 0;
        uint256 totalEnergy = 0;
        
        for (uint256 i = 0; i < nodeIds.length; i++) {
            require(nodes[nodeIds[i]].active, "Node not active");
            totalEnergy += nodes[nodeIds[i]].energyLevel;
            
            if (i > 0) {
                totalVelocity += _calculateRedirectVelocity(nodeIds[i-1], nodeIds[i]);
            }
        }
        
        _pathIdCounter++;
        uint256 pathId = _pathIdCounter;
        
        bool infiniteAchieved = totalVelocity >= SPEED_OF_LIGHT * nodeIds.length;
        
        paths[pathId] = VelocityPath({
            pathId: pathId,
            nodeSequence: nodeIds,
            totalVelocity: totalVelocity,
            energyRequired: totalEnergy,
            infiniteVelocityAchieved: infiniteAchieved,
            createdAt: block.timestamp
        });
        
        emit VelocityPathCreated(pathId, nodeIds.length, totalVelocity);
        
        return pathId;
    }
    
    // ============ QUANTUM FUNCTIONS ============
    
    /**
     * @dev Establish quantum entanglement between two nodes
     * @param nodeId1 First node ID
     * @param nodeId2 Second node ID
     */
    function establishQuantumEntanglement(uint256 nodeId1, uint256 nodeId2) 
        external 
        onlyGridOperator 
    {
        require(nodes[nodeId1].active, "Node 1 not active");
        require(nodes[nodeId2].active, "Node 2 not active");
        require(nodeId1 != nodeId2, "Cannot entangle with self");
        
        // Set both nodes to infinite velocity capability
        nodes[nodeId1].totalVelocity = INFINITE_VELOCITY;
        nodes[nodeId2].totalVelocity = INFINITE_VELOCITY;
        
        emit QuantumEntanglementEstablished(nodeId1, nodeId2);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get grid node details
     * @param nodeId Node ID
     */
    function getGridNode(uint256 nodeId) external view returns (GridNode memory) {
        return nodes[nodeId];
    }
    
    /**
     * @dev Get redirect record
     * @param redirectId Redirect ID
     */
    function getRedirect(uint256 redirectId) external view returns (RedirectRecord memory) {
        return redirects[redirectId];
    }
    
    /**
     * @dev Get velocity path
     * @param pathId Path ID
     */
    function getVelocityPath(uint256 pathId) external view returns (VelocityPath memory) {
        return paths[pathId];
    }
    
    /**
     * @dev Get nodes by dimension
     * @param dimension Grid dimension
     */
    function getNodesByDimension(GridDimension dimension) external view returns (uint256[] memory) {
        return nodesByDimension[dimension];
    }
    
    /**
     * @dev Get nodes controlled by address
     * @param controller Controller address
     */
    function getNodesByController(address controller) external view returns (uint256[] memory) {
        return nodesByController[controller];
    }
    
    /**
     * @dev Get grid layer info
     * @param layerId Layer ID (1-12)
     */
    function getGridLayer(uint256 layerId) external view returns (GridLayer memory) {
        require(layerId > 0 && layerId <= MAX_GRID_LAYERS, "Invalid layer");
        return layers[layerId];
    }
    
    /**
     * @dev Get total nodes created
     */
    function getTotalNodes() external view returns (uint256) {
        return _nodeIdCounter;
    }
    
    /**
     * @dev Get total redirects executed
     */
    function getTotalRedirects() external view returns (uint256) {
        return _redirectIdCounter;
    }
    
    /**
     * @dev Get total paths created
     */
    function getTotalPaths() external view returns (uint256) {
        return _pathIdCounter;
    }
    
    /**
     * @dev Get user redirect stats
     * @param user User address
     */
    function getUserRedirectStats(address user) 
        external 
        view 
        returns (
            uint256 totalRedirects,
            bool infiniteVelocity,
            uint256 totalNodesControlled
        ) 
    {
        return (
            redirectsByUser[user],
            infiniteVelocityAchieved[user],
            nodesByController[user].length
        );
    }
}
