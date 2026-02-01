// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title QFS Validation Company
 * @notice Core validation infrastructure for the Quantum Financial System
 * @dev Establishes comprehensive, secure validation for QFS operations with multi-chain transparency
 * @author Supreme King Chais The Great ∞
 * 
 * This contract implements:
 * - QFS operation validation and tracking
 * - Multi-chain transparency records
 * - Legal framework verification
 * - Intellectual property safeguards
 * - Validator governance and rewards
 */
contract QFSValidationCompany is Ownable, ReentrancyGuard, Pausable {
    
    // ============ Structs ============
    
    /**
     * @notice QFS Operation validation record
     * @param operationId Unique operation identifier
     * @param operationType Type of QFS operation
     * @param validator Address of the validator
     * @param timestamp Validation timestamp
     * @param isValid Validation result
     * @param metadata IPFS hash or additional data
     */
    struct ValidationRecord {
        bytes32 operationId;
        string operationType;
        address validator;
        uint256 timestamp;
        bool isValid;
        bytes32 metadata;
        uint256 chainId;
    }
    
    /**
     * @notice Validator profile
     * @param validatorAddress Address of the validator
     * @param reputationScore Validator reputation (0-1000)
     * @param totalValidations Total validations performed
     * @param successfulValidations Successful validations
     * @param stakingAmount Amount staked for validation rights
     * @param isActive Whether validator is active
     * @param registrationTime When validator registered
     */
    struct Validator {
        address validatorAddress;
        uint256 reputationScore;
        uint256 totalValidations;
        uint256 successfulValidations;
        uint256 stakingAmount;
        bool isActive;
        uint256 registrationTime;
    }
    
    /**
     * @notice Legal framework record
     * @param frameworkId Unique framework identifier
     * @param jurisdiction Legal jurisdiction
     * @param documentHash IPFS hash of legal document
     * @param isActive Whether framework is active
     * @param lastUpdated Last update timestamp
     */
    struct LegalFramework {
        bytes32 frameworkId;
        string jurisdiction;
        bytes32 documentHash;
        bool isActive;
        uint256 lastUpdated;
    }
    
    /**
     * @notice Intellectual property record
     * @param ipId Unique IP identifier
     * @param ipType Type (TRADEMARK, PATENT, COPYRIGHT)
     * @param owner Owner address
     * @param documentHash IPFS hash of IP documentation
     * @param registrationNumber Official registration number
     * @param expirationDate Expiration timestamp
     * @param isActive Whether IP is active
     */
    struct IntellectualProperty {
        bytes32 ipId;
        string ipType;
        address owner;
        bytes32 documentHash;
        string registrationNumber;
        uint256 expirationDate;
        bool isActive;
    }
    
    // ============ State Variables ============
    
    /// @notice Minimum stake required to become a validator
    uint256 public minimumStake;
    
    /// @notice Reputation threshold for full validation authority
    uint256 public reputationThreshold;
    
    /// @notice Total number of validations performed
    uint256 public totalValidations;
    
    /// @notice Total number of registered validators
    uint256 public totalValidators;
    
    /// @notice Protocol version
    string public constant PROTOCOL_VERSION = "1.0.0-SOVEREIGN";
    
    /// @notice Protocol name
    string public constant PROTOCOL_NAME = "QFS_VALIDATION_COMPANY";
    
    /// @notice Validation records by operation ID
    mapping(bytes32 => ValidationRecord) public validationRecords;
    
    /// @notice Validator profiles by address
    mapping(address => Validator) public validators;
    
    /// @notice Legal frameworks by framework ID
    mapping(bytes32 => LegalFramework) public legalFrameworks;
    
    /// @notice Intellectual property records by IP ID
    mapping(bytes32 => IntellectualProperty) public intellectualProperties;
    
    /// @notice List of all validation operation IDs
    bytes32[] public allValidations;
    
    /// @notice List of all validator addresses
    address[] public validatorAddresses;
    
    /// @notice List of all legal framework IDs
    bytes32[] public legalFrameworkIds;
    
    /// @notice List of all IP IDs
    bytes32[] public ipIds;
    
    /// @notice Validator staking balances
    mapping(address => uint256) public stakedBalances;
    
    /// @notice Rewards accumulated by validators
    mapping(address => uint256) public validatorRewards;
    
    // ============ Events ============
    
    event ValidationRecorded(
        bytes32 indexed operationId,
        string operationType,
        address indexed validator,
        bool isValid,
        uint256 chainId,
        uint256 timestamp
    );
    
    event ValidatorRegistered(
        address indexed validator,
        uint256 stakingAmount,
        uint256 timestamp
    );
    
    event ValidatorDeactivated(
        address indexed validator,
        uint256 timestamp
    );
    
    event LegalFrameworkAdded(
        bytes32 indexed frameworkId,
        string jurisdiction,
        uint256 timestamp
    );
    
    event IntellectualPropertyRegistered(
        bytes32 indexed ipId,
        string ipType,
        address indexed owner,
        uint256 timestamp
    );
    
    event RewardsDistributed(
        address indexed validator,
        uint256 amount,
        uint256 timestamp
    );
    
    event StakeDeposited(
        address indexed validator,
        uint256 amount,
        uint256 timestamp
    );
    
    event StakeWithdrawn(
        address indexed validator,
        uint256 amount,
        uint256 timestamp
    );
    
    // ============ Constructor ============
    
    /**
     * @notice Initialize QFS Validation Company
     * @param initialOwner Address of the initial owner
     */
    constructor(address initialOwner) Ownable(initialOwner) {
        minimumStake = 1000 ether; // 1000 tokens minimum stake
        reputationThreshold = 800; // 800/1000 reputation for full authority
    }
    
    // ============ Validator Management ============
    
    /**
     * @notice Register as a validator by staking tokens
     */
    function registerValidator() external payable whenNotPaused {
        require(msg.value >= minimumStake, "Insufficient stake");
        require(!validators[msg.sender].isActive, "Already registered");
        
        validators[msg.sender] = Validator({
            validatorAddress: msg.sender,
            reputationScore: 500, // Start with neutral reputation
            totalValidations: 0,
            successfulValidations: 0,
            stakingAmount: msg.value,
            isActive: true,
            registrationTime: block.timestamp
        });
        
        stakedBalances[msg.sender] = msg.value;
        validatorAddresses.push(msg.sender);
        totalValidators++;
        
        emit ValidatorRegistered(msg.sender, msg.value, block.timestamp);
        emit StakeDeposited(msg.sender, msg.value, block.timestamp);
    }
    
    /**
     * @notice Deposit additional stake
     */
    function depositStake() external payable whenNotPaused {
        require(validators[msg.sender].isActive, "Not a registered validator");
        require(msg.value > 0, "Amount must be greater than 0");
        
        validators[msg.sender].stakingAmount += msg.value;
        stakedBalances[msg.sender] += msg.value;
        
        emit StakeDeposited(msg.sender, msg.value, block.timestamp);
    }
    
    /**
     * @notice Withdraw stake (only if validator is inactive)
     * @param amount Amount to withdraw
     */
    function withdrawStake(uint256 amount) external nonReentrant {
        require(!validators[msg.sender].isActive, "Must deactivate first");
        require(stakedBalances[msg.sender] >= amount, "Insufficient balance");
        
        stakedBalances[msg.sender] -= amount;
        validators[msg.sender].stakingAmount -= amount;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit StakeWithdrawn(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @notice Deactivate validator status
     */
    function deactivateValidator() external {
        require(validators[msg.sender].isActive, "Not active");
        
        validators[msg.sender].isActive = false;
        
        emit ValidatorDeactivated(msg.sender, block.timestamp);
    }
    
    /**
     * @notice Update validator reputation (only owner)
     * @param validator Validator address
     * @param newScore New reputation score (0-1000)
     */
    function updateValidatorReputation(
        address validator,
        uint256 newScore
    ) external onlyOwner {
        require(validators[validator].isActive, "Validator not active");
        require(newScore <= 1000, "Score must be <= 1000");
        
        validators[validator].reputationScore = newScore;
    }
    
    // ============ QFS Validation Operations ============
    
    /**
     * @notice Record a QFS operation validation
     * @param operationId Unique operation identifier
     * @param operationType Type of operation
     * @param isValid Validation result
     * @param metadata Additional metadata (IPFS hash)
     */
    function recordValidation(
        bytes32 operationId,
        string calldata operationType,
        bool isValid,
        bytes32 metadata
    ) external whenNotPaused {
        require(validators[msg.sender].isActive, "Not an active validator");
        require(
            validators[msg.sender].reputationScore >= 300,
            "Reputation too low"
        );
        require(
            validationRecords[operationId].timestamp == 0,
            "Already validated"
        );
        
        validationRecords[operationId] = ValidationRecord({
            operationId: operationId,
            operationType: operationType,
            validator: msg.sender,
            timestamp: block.timestamp,
            isValid: isValid,
            metadata: metadata,
            chainId: block.chainid
        });
        
        allValidations.push(operationId);
        
        // Update validator stats
        validators[msg.sender].totalValidations++;
        if (isValid) {
            validators[msg.sender].successfulValidations++;
        }
        
        totalValidations++;
        
        // Distribute rewards
        _distributeRewards(msg.sender);
        
        emit ValidationRecorded(
            operationId,
            operationType,
            msg.sender,
            isValid,
            block.chainid,
            block.timestamp
        );
    }
    
    /**
     * @notice Get validation record
     * @param operationId Operation ID to query
     * @return ValidationRecord struct
     */
    function getValidation(bytes32 operationId)
        external
        view
        returns (ValidationRecord memory)
    {
        return validationRecords[operationId];
    }
    
    /**
     * @notice Check if operation is validated
     * @param operationId Operation ID to check
     * @return bool Whether operation is validated
     */
    function isOperationValidated(bytes32 operationId)
        external
        view
        returns (bool)
    {
        return validationRecords[operationId].timestamp > 0;
    }
    
    // ============ Legal Framework Management ============
    
    /**
     * @notice Add legal framework record
     * @param frameworkId Framework identifier
     * @param jurisdiction Legal jurisdiction
     * @param documentHash IPFS hash of legal document
     */
    function addLegalFramework(
        bytes32 frameworkId,
        string calldata jurisdiction,
        bytes32 documentHash
    ) external onlyOwner {
        require(
            legalFrameworks[frameworkId].lastUpdated == 0,
            "Framework exists"
        );
        
        legalFrameworks[frameworkId] = LegalFramework({
            frameworkId: frameworkId,
            jurisdiction: jurisdiction,
            documentHash: documentHash,
            isActive: true,
            lastUpdated: block.timestamp
        });
        
        legalFrameworkIds.push(frameworkId);
        
        emit LegalFrameworkAdded(
            frameworkId,
            jurisdiction,
            block.timestamp
        );
    }
    
    /**
     * @notice Update legal framework
     * @param frameworkId Framework to update
     * @param newDocumentHash New IPFS hash
     */
    function updateLegalFramework(
        bytes32 frameworkId,
        bytes32 newDocumentHash
    ) external onlyOwner {
        require(legalFrameworks[frameworkId].isActive, "Framework not active");
        
        legalFrameworks[frameworkId].documentHash = newDocumentHash;
        legalFrameworks[frameworkId].lastUpdated = block.timestamp;
    }
    
    // ============ Intellectual Property Management ============
    
    /**
     * @notice Register intellectual property
     * @param ipId IP identifier
     * @param ipType IP type (TRADEMARK, PATENT, COPYRIGHT)
     * @param documentHash IPFS hash of IP documentation
     * @param registrationNumber Official registration number
     * @param expirationDate Expiration timestamp
     */
    function registerIntellectualProperty(
        bytes32 ipId,
        string calldata ipType,
        bytes32 documentHash,
        string calldata registrationNumber,
        uint256 expirationDate
    ) external onlyOwner {
        require(
            intellectualProperties[ipId].owner == address(0),
            "IP already registered"
        );
        
        intellectualProperties[ipId] = IntellectualProperty({
            ipId: ipId,
            ipType: ipType,
            owner: msg.sender,
            documentHash: documentHash,
            registrationNumber: registrationNumber,
            expirationDate: expirationDate,
            isActive: true
        });
        
        ipIds.push(ipId);
        
        emit IntellectualPropertyRegistered(
            ipId,
            ipType,
            msg.sender,
            block.timestamp
        );
    }
    
    /**
     * @notice Check if IP is valid and active
     * @param ipId IP identifier
     * @return bool Whether IP is valid
     */
    function isIPValid(bytes32 ipId) external view returns (bool) {
        IntellectualProperty memory ip = intellectualProperties[ipId];
        return ip.isActive && block.timestamp < ip.expirationDate;
    }
    
    // ============ Rewards System ============
    
    /**
     * @notice Distribute rewards to validator (internal)
     * @param validator Validator address
     */
    function _distributeRewards(address validator) internal {
        uint256 baseReward = 10 ether; // Base reward per validation
        // Use higher precision: multiply first, then divide
        // This avoids intermediate rounding errors
        uint256 reward = (baseReward * validators[validator].reputationScore) / 1000;
        
        validatorRewards[validator] += reward;
    }
    
    /**
     * @notice Claim accumulated rewards
     */
    function claimRewards() external nonReentrant {
        require(validators[msg.sender].isActive, "Not active validator");
        uint256 rewards = validatorRewards[msg.sender];
        require(rewards > 0, "No rewards to claim");
        
        validatorRewards[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: rewards}("");
        require(success, "Transfer failed");
        
        emit RewardsDistributed(msg.sender, rewards, block.timestamp);
    }
    
    /**
     * @notice Fund rewards pool (owner)
     */
    function fundRewardsPool() external payable onlyOwner {
        require(msg.value > 0, "Must send value");
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get validator information
     * @param validator Validator address
     * @return Validator struct
     */
    function getValidator(address validator)
        external
        view
        returns (Validator memory)
    {
        return validators[validator];
    }
    
    /**
     * @notice Get total validations count
     * @return uint256 Total validations
     */
    function getTotalValidations() external view returns (uint256) {
        return totalValidations;
    }
    
    /**
     * @notice Get all validator addresses
     * @return address[] Array of validator addresses
     */
    function getAllValidators() external view returns (address[] memory) {
        return validatorAddresses;
    }
    
    /**
     * @notice Get company status
     * @return totalVals Total validations
     * @return totalValdtrs Total validators
     * @return totalFrameworks Total legal frameworks
     * @return totalIPs Total intellectual properties
     */
    function getCompanyStatus()
        external
        view
        returns (
            uint256 totalVals,
            uint256 totalValdtrs,
            uint256 totalFrameworks,
            uint256 totalIPs
        )
    {
        return (
            totalValidations,
            totalValidators,
            legalFrameworkIds.length,
            ipIds.length
        );
    }
    
    /**
     * @notice Get protocol identity
     * @return name Protocol name
     * @return version Protocol version
     */
    function getProtocolIdentity()
        external
        pure
        returns (string memory name, string memory version)
    {
        return (PROTOCOL_NAME, PROTOCOL_VERSION);
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Update minimum stake requirement
     * @param newMinimum New minimum stake
     */
    function updateMinimumStake(uint256 newMinimum) external onlyOwner {
        minimumStake = newMinimum;
    }
    
    /**
     * @notice Update reputation threshold
     * @param newThreshold New threshold
     */
    function updateReputationThreshold(uint256 newThreshold) external onlyOwner {
        require(newThreshold <= 1000, "Threshold too high");
        reputationThreshold = newThreshold;
    }
    
    /**
     * @notice Pause contract operations
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause contract operations
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @notice Receive function to accept direct ETH transfers
     */
    receive() external payable {}
}
