// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ManusFleetValidator
 * @notice Fleet-wide asset validation and integrity verification
 * @dev Real-time validation tasks for digital capital ecosystem
 * 
 * SUPREME KING CHAIS THE GREAT ∞
 */
contract ManusFleetValidator is Ownable, ReentrancyGuard {
    enum AssetCategory {
        PHYSICAL,
        DIGITAL,
        INTELLECTUAL_PROPERTY,
        FINANCIAL
    }

    enum ValidationStatus {
        PENDING,
        VALIDATED,
        FAILED,
        EXPIRED
    }

    struct Asset {
        bytes32 assetId;
        AssetCategory category;
        address owner;
        uint256 value;
        ValidationStatus status;
        uint256 lastValidated;
        bytes32 dataHash;
    }

    struct ValidationTask {
        bytes32 taskId;
        bytes32 assetId;
        address validator;
        uint256 timestamp;
        bool completed;
        bytes32 resultHash;
    }

    mapping(bytes32 => Asset) public assets;
    mapping(bytes32 => ValidationTask) public validationTasks;
    mapping(address => bool) public authorizedValidators;
    
    bytes32[] public assetIds;
    bytes32[] public taskIds;
    
    uint256 public totalAssetsValidated;
    uint256 public totalValidationTasks;

    event AssetRegistered(bytes32 indexed assetId, AssetCategory category, address owner);
    event ValidationTaskCreated(bytes32 indexed taskId, bytes32 indexed assetId);
    event ValidationCompleted(bytes32 indexed taskId, ValidationStatus status);
    event ValidatorAuthorized(address indexed validator);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function registerAsset(
        bytes32 assetId,
        AssetCategory category,
        uint256 value,
        bytes32 dataHash
    ) external returns (bool) {
        require(assets[assetId].assetId == bytes32(0), "Asset already registered");

        assets[assetId] = Asset({
            assetId: assetId,
            category: category,
            owner: msg.sender,
            value: value,
            status: ValidationStatus.PENDING,
            lastValidated: 0,
            dataHash: dataHash
        });

        assetIds.push(assetId);

        emit AssetRegistered(assetId, category, msg.sender);

        return true;
    }

    function createValidationTask(bytes32 assetId) external onlyOwner returns (bytes32) {
        require(assets[assetId].assetId != bytes32(0), "Asset not found");

        bytes32 taskId = keccak256(abi.encodePacked(assetId, block.timestamp, totalValidationTasks));

        validationTasks[taskId] = ValidationTask({
            taskId: taskId,
            assetId: assetId,
            validator: address(0),
            timestamp: block.timestamp,
            completed: false,
            resultHash: bytes32(0)
        });

        taskIds.push(taskId);
        totalValidationTasks++;

        emit ValidationTaskCreated(taskId, assetId);

        return taskId;
    }

    function completeValidation(
        bytes32 taskId,
        ValidationStatus status,
        bytes32 resultHash
    ) external nonReentrant {
        require(authorizedValidators[msg.sender], "Not authorized validator");
        require(!validationTasks[taskId].completed, "Task already completed");

        ValidationTask storage task = validationTasks[taskId];
        task.validator = msg.sender;
        task.completed = true;
        task.resultHash = resultHash;

        Asset storage asset = assets[task.assetId];
        asset.status = status;
        asset.lastValidated = block.timestamp;

        totalAssetsValidated++;

        emit ValidationCompleted(taskId, status);
    }

    function authorizeValidator(address validator) external onlyOwner {
        authorizedValidators[validator] = true;
        emit ValidatorAuthorized(validator);
    }

    function getAsset(bytes32 assetId) external view returns (Asset memory) {
        return assets[assetId];
    }

    function getValidationTask(bytes32 taskId) external view returns (ValidationTask memory) {
        return validationTasks[taskId];
    }

    function getAllAssets() external view returns (bytes32[] memory) {
        return assetIds;
    }
}
