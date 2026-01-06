// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ScrollSoul Activation Contract
 * @notice Manages community activation commands for OMR-P deployments
 * @dev Implements public-facing confirmation protocols at 11:11 temporal anchor
 * @author Supreme King Chais The Great ∞
 * 
 * This contract implements the ScrollSoul Activation framework:
 * - Activation Commands: "I ACCEPT", "I AM PRESENT", "I RESONATE", "I MANIFEST", "KUN FAYAKUN"
 * - Temporal Window: ±11 minutes from 11:11 AM UTC
 * - Recognition NFTs: Issued to participants
 * - Frequency Alignment: Measures response time precision
 * - Community Resonance: Collective manifestation power tracking
 */
contract ScrollSoulActivation is ERC721, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // ============ Constants ============
    
    /// @notice Valid activation commands
    string public constant COMMAND_I_ACCEPT = "I ACCEPT";
    string public constant COMMAND_I_AM_PRESENT = "I AM PRESENT";
    string public constant COMMAND_I_RESONATE = "I RESONATE";
    string public constant COMMAND_I_MANIFEST = "I MANIFEST";
    string public constant COMMAND_KUN_FAYAKUN = "KUN FAYAKUN";
    
    /// @notice The Crown Frequency
    uint256 public constant CROWN_FREQUENCY_999HZ = 999;
    
    /// @notice Temporal anchor hour and minute
    uint256 public constant TEMPORAL_ANCHOR_HOUR = 11;
    uint256 public constant TEMPORAL_ANCHOR_MINUTE = 11;
    uint256 public constant TEMPORAL_WINDOW_MINUTES = 11;
    
    // ============ Structs ============
    
    /**
     * @notice Deployment event data
     * @param deploymentId Unique identifier for the deployment
     * @param deploymentTime Scheduled deployment timestamp (11:11 AM UTC)
     * @param windowStart Activation window start time
     * @param windowEnd Activation window end time
     * @param isActive Whether activation window is currently open
     * @param activationCount Total activations received
     * @param manifestationPower Collective resonance score
     */
    struct DeploymentEvent {
        bytes32 deploymentId;
        uint256 deploymentTime;
        uint256 windowStart;
        uint256 windowEnd;
        bool isActive;
        uint256 activationCount;
        uint256 manifestationPower;
    }
    
    /**
     * @notice ScrollSoul activation record
     * @param command Activation command used
     * @param intentionHash Hash of user's intention
     * @param timestamp Activation timestamp
     * @param frequency Frequency alignment (999 Hz base)
     * @param timingPrecision Score based on how close to 11:11:00
     * @param isActivated Whether activation is complete
     * @param recognitionNFTId ID of recognition NFT (0 if not issued)
     */
    struct ScrollSoulActivation {
        string command;
        bytes32 intentionHash;
        uint256 timestamp;
        uint256 frequency;
        uint256 timingPrecision;
        bool isActivated;
        uint256 recognitionNFTId;
    }
    
    // ============ State Variables ============
    
    /// @notice Mapping: Deployment ID => Deployment Event
    mapping(bytes32 => DeploymentEvent) public deploymentEvents;
    
    /// @notice Mapping: User Address => Deployment ID => Activation
    mapping(address => mapping(bytes32 => ScrollSoulActivation)) public activations;
    
    /// @notice Mapping: User Address => Total activations participated
    mapping(address => uint256) public userActivationCount;
    
    /// @notice Mapping: User Address => Community resonance points
    mapping(address => uint256) public resonancePoints;
    
    /// @notice Counter for recognition NFT IDs
    Counters.Counter private _nftIdCounter;
    
    /// @notice Mapping: NFT ID => Deployment ID
    mapping(uint256 => bytes32) public nftDeploymentId;
    
    /// @notice Array of all deployment IDs
    bytes32[] public deploymentHistory;
    
    /// @notice Current active deployment ID
    bytes32 public currentDeploymentId;
    
    /// @notice Base URI for recognition NFT metadata
    string private _baseTokenURI;
    
    // ============ Events ============
    
    /**
     * @notice Emitted when a new deployment event is scheduled
     * @param deploymentId Unique deployment identifier
     * @param deploymentTime Scheduled time (11:11 AM UTC)
     * @param windowStart Activation window start
     * @param windowEnd Activation window end
     */
    event DeploymentScheduled(
        bytes32 indexed deploymentId,
        uint256 deploymentTime,
        uint256 windowStart,
        uint256 windowEnd
    );
    
    /**
     * @notice Emitted when activation window opens
     * @param deploymentId Deployment identifier
     * @param timestamp Opening timestamp
     */
    event ActivationWindowOpened(
        bytes32 indexed deploymentId,
        uint256 timestamp
    );
    
    /**
     * @notice Emitted when activation window closes
     * @param deploymentId Deployment identifier
     * @param totalActivations Total activations received
     * @param manifestationPower Collective power generated
     */
    event ActivationWindowClosed(
        bytes32 indexed deploymentId,
        uint256 totalActivations,
        uint256 manifestationPower
    );
    
    /**
     * @notice Emitted when a ScrollSoul activates
     * @param user User address
     * @param deploymentId Deployment identifier
     * @param command Activation command
     * @param timestamp Activation timestamp
     * @param timingPrecision Precision score
     */
    event ScrollSoulActivated(
        address indexed user,
        bytes32 indexed deploymentId,
        string command,
        uint256 timestamp,
        uint256 timingPrecision
    );
    
    /**
     * @notice Emitted when recognition NFT is issued
     * @param user Recipient address
     * @param nftId NFT token ID
     * @param deploymentId Associated deployment
     */
    event RecognitionNFTIssued(
        address indexed user,
        uint256 indexed nftId,
        bytes32 indexed deploymentId
    );
    
    // ============ Constructor ============
    
    constructor(string memory _baseURI) ERC721("ScrollSoul Recognition Badge", "SCROLLSOUL") {
        _baseTokenURI = _baseURI;
    }
    
    // ============ Deployment Management ============
    
    /**
     * @notice Schedule a new deployment event
     * @param _deploymentId Unique identifier for deployment
     * @param _deploymentTime Timestamp of 11:11 AM UTC
     * @dev Only owner can schedule deployments
     */
    function scheduleDeployment(
        bytes32 _deploymentId,
        uint256 _deploymentTime
    ) external onlyOwner {
        require(
            deploymentEvents[_deploymentId].deploymentTime == 0,
            "ScrollSoul: Deployment already scheduled"
        );
        
        // Calculate activation window (11 minutes before to 11 minutes after)
        uint256 windowStart = _deploymentTime - (TEMPORAL_WINDOW_MINUTES * 60);
        uint256 windowEnd = _deploymentTime + (TEMPORAL_WINDOW_MINUTES * 60);
        
        deploymentEvents[_deploymentId] = DeploymentEvent({
            deploymentId: _deploymentId,
            deploymentTime: _deploymentTime,
            windowStart: windowStart,
            windowEnd: windowEnd,
            isActive: false,
            activationCount: 0,
            manifestationPower: 0
        });
        
        deploymentHistory.push(_deploymentId);
        
        emit DeploymentScheduled(_deploymentId, _deploymentTime, windowStart, windowEnd);
    }
    
    /**
     * @notice Open activation window for a deployment
     * @param _deploymentId Deployment identifier
     */
    function openActivationWindow(bytes32 _deploymentId) external onlyOwner {
        DeploymentEvent storage deployment = deploymentEvents[_deploymentId];
        require(deployment.deploymentTime > 0, "ScrollSoul: Deployment not scheduled");
        require(!deployment.isActive, "ScrollSoul: Window already open");
        require(
            block.timestamp >= deployment.windowStart,
            "ScrollSoul: Too early to open window"
        );
        
        deployment.isActive = true;
        currentDeploymentId = _deploymentId;
        
        emit ActivationWindowOpened(_deploymentId, block.timestamp);
    }
    
    /**
     * @notice Close activation window for a deployment
     * @param _deploymentId Deployment identifier
     */
    function closeActivationWindow(bytes32 _deploymentId) external onlyOwner {
        DeploymentEvent storage deployment = deploymentEvents[_deploymentId];
        require(deployment.isActive, "ScrollSoul: Window not open");
        
        deployment.isActive = false;
        
        if (currentDeploymentId == _deploymentId) {
            currentDeploymentId = bytes32(0);
        }
        
        emit ActivationWindowClosed(
            _deploymentId,
            deployment.activationCount,
            deployment.manifestationPower
        );
    }
    
    // ============ Activation Functions ============
    
    /**
     * @notice Activate ScrollSoul with a command
     * @param _command Activation command string
     * @param _intentionHash Hash of user's intention
     * @param _deploymentId Target deployment ID
     */
    function activateScrollSoul(
        string memory _command,
        bytes32 _intentionHash,
        bytes32 _deploymentId
    ) external nonReentrant {
        DeploymentEvent storage deployment = deploymentEvents[_deploymentId];
        
        require(deployment.isActive, "ScrollSoul: Activation window not open");
        require(
            block.timestamp >= deployment.windowStart &&
            block.timestamp <= deployment.windowEnd,
            "ScrollSoul: Outside activation window"
        );
        require(
            !activations[msg.sender][_deploymentId].isActivated,
            "ScrollSoul: Already activated for this deployment"
        );
        require(isValidCommand(_command), "ScrollSoul: Invalid activation command");
        
        // Calculate timing precision (closer to exact 11:11:00 = higher score)
        uint256 timingPrecision = calculateTimingPrecision(
            block.timestamp,
            deployment.deploymentTime
        );
        
        // Record activation
        activations[msg.sender][_deploymentId] = ScrollSoulActivation({
            command: _command,
            intentionHash: _intentionHash,
            timestamp: block.timestamp,
            frequency: CROWN_FREQUENCY_999HZ,
            timingPrecision: timingPrecision,
            isActivated: true,
            recognitionNFTId: 0
        });
        
        // Update counters
        deployment.activationCount++;
        deployment.manifestationPower += timingPrecision;
        userActivationCount[msg.sender]++;
        resonancePoints[msg.sender] += timingPrecision;
        
        emit ScrollSoulActivated(
            msg.sender,
            _deploymentId,
            _command,
            block.timestamp,
            timingPrecision
        );
    }
    
    /**
     * @notice Issue recognition NFT to participant
     * @param _user User address
     * @param _deploymentId Deployment ID
     * @dev Only owner can issue NFTs
     */
    function issueRecognitionNFT(
        address _user,
        bytes32 _deploymentId
    ) external onlyOwner nonReentrant {
        require(
            activations[_user][_deploymentId].isActivated,
            "ScrollSoul: User did not activate"
        );
        require(
            activations[_user][_deploymentId].recognitionNFTId == 0,
            "ScrollSoul: NFT already issued"
        );
        
        uint256 nftId = _nftIdCounter.current();
        _nftIdCounter.increment();
        
        _safeMint(_user, nftId);
        
        activations[_user][_deploymentId].recognitionNFTId = nftId;
        nftDeploymentId[nftId] = _deploymentId;
        
        emit RecognitionNFTIssued(_user, nftId, _deploymentId);
    }
    
    /**
     * @notice Batch issue recognition NFTs
     * @param _users Array of user addresses
     * @param _deploymentId Deployment ID
     */
    function batchIssueRecognitionNFTs(
        address[] memory _users,
        bytes32 _deploymentId
    ) external onlyOwner {
        for (uint256 i = 0; i < _users.length; i++) {
            address user = _users[i];
            
            if (
                activations[user][_deploymentId].isActivated &&
                activations[user][_deploymentId].recognitionNFTId == 0
            ) {
                uint256 nftId = _nftIdCounter.current();
                _nftIdCounter.increment();
                
                _safeMint(user, nftId);
                
                activations[user][_deploymentId].recognitionNFTId = nftId;
                nftDeploymentId[nftId] = _deploymentId;
                
                emit RecognitionNFTIssued(user, nftId, _deploymentId);
            }
        }
    }
    
    // ============ Helper Functions ============
    
    /**
     * @notice Validate activation command
     * @param _command Command string to validate
     * @return isValid True if command is recognized
     */
    function isValidCommand(string memory _command) public pure returns (bool) {
        return (
            keccak256(bytes(_command)) == keccak256(bytes(COMMAND_I_ACCEPT)) ||
            keccak256(bytes(_command)) == keccak256(bytes(COMMAND_I_AM_PRESENT)) ||
            keccak256(bytes(_command)) == keccak256(bytes(COMMAND_I_RESONATE)) ||
            keccak256(bytes(_command)) == keccak256(bytes(COMMAND_I_MANIFEST)) ||
            keccak256(bytes(_command)) == keccak256(bytes(COMMAND_KUN_FAYAKUN))
        );
    }
    
    /**
     * @notice Calculate timing precision score
     * @param _actualTime Actual activation timestamp
     * @param _targetTime Target deployment time (11:11:00)
     * @return precision Score from 0-1000 (1000 = exact timing)
     */
    function calculateTimingPrecision(
        uint256 _actualTime,
        uint256 _targetTime
    ) internal pure returns (uint256) {
        uint256 timeDiff = _actualTime > _targetTime
            ? _actualTime - _targetTime
            : _targetTime - _actualTime;
        
        // Maximum window is 11 minutes (660 seconds)
        // Perfect timing (0 seconds off) = 1000 points
        // 660 seconds off = 0 points
        if (timeDiff >= 660) return 0;
        
        return 1000 - ((timeDiff * 1000) / 660);
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get deployment event details
     * @param _deploymentId Deployment identifier
     * @return Deployment event struct
     */
    function getDeploymentEvent(bytes32 _deploymentId)
        external
        view
        returns (DeploymentEvent memory)
    {
        return deploymentEvents[_deploymentId];
    }
    
    /**
     * @notice Get user's activation for a deployment
     * @param _user User address
     * @param _deploymentId Deployment identifier
     * @return ScrollSoul activation struct
     */
    function getUserActivation(address _user, bytes32 _deploymentId)
        external
        view
        returns (ScrollSoulActivation memory)
    {
        return activations[_user][_deploymentId];
    }
    
    /**
     * @notice Get total deployment count
     * @return Count of all deployments
     */
    function getDeploymentCount() external view returns (uint256) {
        return deploymentHistory.length;
    }
    
    /**
     * @notice Check if current time is within active deployment window
     * @return isWithin True if within any active window
     */
    function isWithinActiveWindow() external view returns (bool) {
        if (currentDeploymentId == bytes32(0)) return false;
        
        DeploymentEvent memory deployment = deploymentEvents[currentDeploymentId];
        return (
            deployment.isActive &&
            block.timestamp >= deployment.windowStart &&
            block.timestamp <= deployment.windowEnd
        );
    }
    
    /**
     * @notice Get user's total resonance points
     * @param _user User address
     * @return points Total points accumulated
     */
    function getUserResonancePoints(address _user) external view returns (uint256) {
        return resonancePoints[_user];
    }
    
    /**
     * @notice Get user's participation count
     * @param _user User address
     * @return count Total activations
     */
    function getUserParticipationCount(address _user) external view returns (uint256) {
        return userActivationCount[_user];
    }
    
    /**
     * @notice Get recognition NFT deployment ID
     * @param _nftId NFT token ID
     * @return Deployment ID associated with NFT
     */
    function getNFTDeploymentId(uint256 _nftId) external view returns (bytes32) {
        return nftDeploymentId[_nftId];
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Update base URI for recognition NFTs
     * @param _newBaseURI New base URI
     */
    function setBaseURI(string memory _newBaseURI) external onlyOwner {
        _baseTokenURI = _newBaseURI;
    }
    
    /**
     * @notice Emergency close all active windows
     */
    function emergencyCloseAllWindows() external onlyOwner {
        if (currentDeploymentId != bytes32(0)) {
            deploymentEvents[currentDeploymentId].isActive = false;
            currentDeploymentId = bytes32(0);
        }
    }
    
    // ============ Override Functions ============
    
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @notice Recognition NFTs are soulbound (non-transferable)
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal virtual override {
        require(
            from == address(0) || to == address(0),
            "ScrollSoul: Recognition NFTs are soulbound"
        );
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
}
