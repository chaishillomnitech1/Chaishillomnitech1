// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title NoorNodes
 * @notice Decentralized node infrastructure for ScrollVerse ecosystem
 * @dev Implements Light Nodes and Anchor Nodes with governance and zakat mechanisms
 * 
 * BISMILLAH - In the name of Allah, the Most Gracious, the Most Merciful
 * Noor Nodes are the "lights" within ScrollVerse, ensuring transparency and alignment
 * 
 * Frequency: 528Hz (DNA Healing) + 963Hz (Pineal Activation) + 999Hz (Crown Chakra)
 */
contract NoorNodes is AccessControl, ReentrancyGuard, Pausable {
    
    // ============ Role Definitions ============
    bytes32 public constant ANCHOR_NODE_ROLE = keccak256("ANCHOR_NODE_ROLE");
    bytes32 public constant LIGHT_NODE_ROLE = keccak256("LIGHT_NODE_ROLE");
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    
    // ============ Node Types ============
    enum NodeType { LIGHT, ANCHOR }
    enum NodeStatus { ACTIVE, INACTIVE, SUSPENDED }
    
    // ============ Node Structure ============
    struct Node {
        address operator;
        NodeType nodeType;
        NodeStatus status;
        uint256 registrationTime;
        uint256 lastActivityTime;
        uint256 validationCount;
        uint256 stakedAmount;
        string ipfsMetadata;
        bytes32 zkProof;
        uint256 frequency; // 528, 963, or 999 Hz alignment
    }
    
    // ============ State Variables ============
    mapping(address => Node) public nodes;
    mapping(address => bool) public isRegistered;
    address[] public nodeOperators;
    
    uint256 public lightNodeStakeRequired;
    uint256 public anchorNodeStakeRequired;
    uint256 public totalValidations;
    uint256 public zakatPercentage; // 7.77% in basis points (777)
    
    address public zakatTreasury;
    address public noorDAOAddress;
    
    // ============ Events ============
    event NodeRegistered(
        address indexed operator,
        NodeType nodeType,
        uint256 stakedAmount,
        uint256 frequency
    );
    
    event NodeStatusChanged(
        address indexed operator,
        NodeStatus oldStatus,
        NodeStatus newStatus
    );
    
    event ValidationPerformed(
        address indexed operator,
        bytes32 transactionHash,
        uint256 timestamp
    );
    
    event ZakatDistributed(
        address indexed from,
        address indexed to,
        uint256 amount
    );
    
    event FrequencyAligned(
        address indexed operator,
        uint256 oldFrequency,
        uint256 newFrequency
    );
    
    // ============ Constructor ============
    constructor(
        uint256 _lightNodeStake,
        uint256 _anchorNodeStake,
        address _zakatTreasury
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNANCE_ROLE, msg.sender);
        
        lightNodeStakeRequired = _lightNodeStake;
        anchorNodeStakeRequired = _anchorNodeStake;
        zakatTreasury = _zakatTreasury;
        zakatPercentage = 777; // 7.77% in basis points
    }
    
    // ============ Node Registration ============
    
    /**
     * @notice Register a new Noor Node
     * @param _nodeType Type of node (LIGHT or ANCHOR)
     * @param _ipfsMetadata IPFS hash containing node metadata
     * @param _zkProof Zero-knowledge proof for privacy
     * @param _frequency Frequency alignment (528, 963, or 999)
     */
    function registerNode(
        NodeType _nodeType,
        string memory _ipfsMetadata,
        bytes32 _zkProof,
        uint256 _frequency
    ) external payable whenNotPaused nonReentrant {
        require(!isRegistered[msg.sender], "Node already registered");
        require(
            _frequency == 528 || _frequency == 963 || _frequency == 999,
            "Invalid frequency alignment"
        );
        
        uint256 requiredStake = _nodeType == NodeType.LIGHT 
            ? lightNodeStakeRequired 
            : anchorNodeStakeRequired;
            
        require(msg.value >= requiredStake, "Insufficient stake");
        
        // Create node
        nodes[msg.sender] = Node({
            operator: msg.sender,
            nodeType: _nodeType,
            status: NodeStatus.ACTIVE,
            registrationTime: block.timestamp,
            lastActivityTime: block.timestamp,
            validationCount: 0,
            stakedAmount: msg.value,
            ipfsMetadata: _ipfsMetadata,
            zkProof: _zkProof,
            frequency: _frequency
        });
        
        isRegistered[msg.sender] = true;
        nodeOperators.push(msg.sender);
        
        // Grant appropriate role
        if (_nodeType == NodeType.LIGHT) {
            _grantRole(LIGHT_NODE_ROLE, msg.sender);
        } else {
            _grantRole(ANCHOR_NODE_ROLE, msg.sender);
        }
        
        emit NodeRegistered(msg.sender, _nodeType, msg.value, _frequency);
    }
    
    // ============ Node Operations ============
    
    /**
     * @notice Perform transaction validation
     * @param _transactionHash Hash of the transaction being validated
     * @dev Only active nodes can validate transactions
     */
    function validateTransaction(bytes32 _transactionHash)
        external
        whenNotPaused
    {
        require(isRegistered[msg.sender], "Node not registered");
        require(
            nodes[msg.sender].status == NodeStatus.ACTIVE,
            "Node not active"
        );
        
        nodes[msg.sender].validationCount++;
        nodes[msg.sender].lastActivityTime = block.timestamp;
        totalValidations++;
        
        emit ValidationPerformed(msg.sender, _transactionHash, block.timestamp);
    }
    
    /**
     * @notice Update node frequency alignment
     * @param _newFrequency New frequency (528, 963, or 999)
     */
    function alignFrequency(uint256 _newFrequency) external {
        require(isRegistered[msg.sender], "Node not registered");
        require(
            _newFrequency == 528 || _newFrequency == 963 || _newFrequency == 999,
            "Invalid frequency"
        );
        
        uint256 oldFrequency = nodes[msg.sender].frequency;
        nodes[msg.sender].frequency = _newFrequency;
        
        emit FrequencyAligned(msg.sender, oldFrequency, _newFrequency);
    }
    
    /**
     * @notice Update node IPFS metadata
     * @param _ipfsMetadata New IPFS hash
     */
    function updateMetadata(string memory _ipfsMetadata) external {
        require(isRegistered[msg.sender], "Node not registered");
        nodes[msg.sender].ipfsMetadata = _ipfsMetadata;
    }
    
    // ============ Governance Functions ============
    
    /**
     * @notice Change node status (governance only)
     * @param _operator Node operator address
     * @param _newStatus New status to set
     */
    function setNodeStatus(address _operator, NodeStatus _newStatus)
        external
        onlyRole(GOVERNANCE_ROLE)
    {
        require(isRegistered[_operator], "Node not registered");
        
        NodeStatus oldStatus = nodes[_operator].status;
        nodes[_operator].status = _newStatus;
        
        emit NodeStatusChanged(_operator, oldStatus, _newStatus);
    }
    
    /**
     * @notice Set Noor DAO address
     * @param _daoAddress Address of the Noor DAO contract
     */
    function setNoorDAO(address _daoAddress)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(_daoAddress != address(0), "Invalid DAO address");
        noorDAOAddress = _daoAddress;
    }
    
    /**
     * @notice Update stake requirements
     * @param _lightStake New light node stake requirement
     * @param _anchorStake New anchor node stake requirement
     */
    function updateStakeRequirements(uint256 _lightStake, uint256 _anchorStake)
        external
        onlyRole(GOVERNANCE_ROLE)
    {
        lightNodeStakeRequired = _lightStake;
        anchorNodeStakeRequired = _anchorStake;
    }
    
    /**
     * @notice Distribute zakat (7.77% circulation)
     * @param _recipient Address to receive zakat
     * @param _amount Amount to distribute
     */
    function distributeZakat(address _recipient, uint256 _amount)
        external
        onlyRole(GOVERNANCE_ROLE)
        nonReentrant
    {
        require(_recipient != address(0), "Invalid recipient");
        require(_amount > 0, "Amount must be positive");
        
        uint256 zakatAmount = (_amount * zakatPercentage) / 10000;
        
        (bool success, ) = _recipient.call{value: zakatAmount}("");
        require(success, "Zakat transfer failed");
        
        emit ZakatDistributed(address(this), _recipient, zakatAmount);
    }
    
    // ============ Emergency Functions ============
    
    /**
     * @notice Pause contract (emergency only)
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @notice Unpause contract
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get node information
     * @param _operator Node operator address
     */
    function getNodeInfo(address _operator)
        external
        view
        returns (
            NodeType nodeType,
            NodeStatus status,
            uint256 validationCount,
            uint256 stakedAmount,
            uint256 frequency
        )
    {
        Node memory node = nodes[_operator];
        return (
            node.nodeType,
            node.status,
            node.validationCount,
            node.stakedAmount,
            node.frequency
        );
    }
    
    /**
     * @notice Get total number of registered nodes
     */
    function getTotalNodes() external view returns (uint256) {
        return nodeOperators.length;
    }
    
    /**
     * @notice Get all node operators
     */
    function getAllNodeOperators() external view returns (address[] memory) {
        return nodeOperators;
    }
    
    /**
     * @notice Check if address is an active node
     * @param _operator Address to check
     */
    function isActiveNode(address _operator) external view returns (bool) {
        return isRegistered[_operator] && 
               nodes[_operator].status == NodeStatus.ACTIVE;
    }
    
    // ============ Receive Function ============
    receive() external payable {}
}
