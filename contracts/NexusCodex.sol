// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title NexusCodex
 * @notice Central registry and knowledge base for ScrollVerse governance
 * @dev Stores critical governance documents and contract references
 * 
 * SUPREME KING CHAIS THE GREAT ∞
 */
contract NexusCodex is AccessControl {
    bytes32 public constant CODEX_ADMIN_ROLE = keccak256("CODEX_ADMIN_ROLE");
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");

    struct Document {
        string name;
        string ipfsHash;
        uint256 version;
        uint256 timestamp;
        address author;
        bool isActive;
    }

    struct ContractReference {
        string name;
        address contractAddress;
        uint256 deploymentBlock;
        string category;
        bool isActive;
    }

    mapping(bytes32 => Document) public documents;
    mapping(bytes32 => ContractReference) public contracts;
    
    bytes32[] public documentIds;
    bytes32[] public contractIds;

    event DocumentAdded(bytes32 indexed documentId, string name, string ipfsHash);
    event DocumentUpdated(bytes32 indexed documentId, uint256 newVersion);
    event ContractRegistered(bytes32 indexed contractId, string name, address contractAddress);

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(CODEX_ADMIN_ROLE, admin);
    }

    function addDocument(
        string memory name,
        string memory ipfsHash
    ) external onlyRole(CODEX_ADMIN_ROLE) returns (bytes32) {
        bytes32 docId = keccak256(abi.encodePacked(name, block.timestamp));
        
        documents[docId] = Document({
            name: name,
            ipfsHash: ipfsHash,
            version: 1,
            timestamp: block.timestamp,
            author: msg.sender,
            isActive: true
        });

        documentIds.push(docId);

        emit DocumentAdded(docId, name, ipfsHash);
        
        return docId;
    }

    function registerContract(
        string memory name,
        address contractAddress,
        string memory category
    ) external onlyRole(CODEX_ADMIN_ROLE) returns (bytes32) {
        bytes32 contractId = keccak256(abi.encodePacked(name, contractAddress));
        
        contracts[contractId] = ContractReference({
            name: name,
            contractAddress: contractAddress,
            deploymentBlock: block.number,
            category: category,
            isActive: true
        });

        contractIds.push(contractId);

        emit ContractRegistered(contractId, name, contractAddress);
        
        return contractId;
    }

    function getDocument(bytes32 docId) external view returns (Document memory) {
        return documents[docId];
    }

    function getContract(bytes32 contractId) external view returns (ContractReference memory) {
        return contracts[contractId];
    }

    function getAllDocuments() external view returns (bytes32[] memory) {
        return documentIds;
    }

    function getAllContracts() external view returns (bytes32[] memory) {
        return contractIds;
    }
}
