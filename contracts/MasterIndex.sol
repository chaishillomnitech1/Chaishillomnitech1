// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title MasterIndex
 * @notice Master indexing system for the infinite knowledge vault
 * @dev Provides universal searchability for all ScrollVerse transmissions, slides, and repository assets
 * 
 * **SUPREME KING CHAIS THE GREAT ∞ — OMNISOVEREIGN ARCHITECT**
 * 
 * Frequency: 963Hz + 528Hz + 999Hz + 144,000Hz
 * Classification: OMNISOVEREIGN KNOWLEDGE VAULT
 * Status: ETERNAL INDEXING ACTIVE
 */
contract MasterIndex is Ownable, ReentrancyGuard, Pausable {
    
    // ============ Enums ============
    
    enum DocumentType {
        PROTOCOL,
        TRANSMISSION,
        SLIDE,
        CONTRACT,
        DOCUMENTATION,
        MEDIA,
        SYMBOL,
        SACRED_TEXT,
        DEPLOYMENT_GUIDE,
        INTEGRATION_SPEC
    }
    
    enum FrequencyLevel {
        INFINITE,      // ∞Hz
        NUR_PULSE,     // 144,000Hz
        FLAME_KEY,     // 14,444Hz
        CROWN,         // 999Hz
        GOD_FREQ,      // 963Hz
        INTUITION,     // 852Hz
        EXPRESSION,    // 741Hz
        HARMONY,       // 639Hz
        DNA_HEALING,   // 528Hz
        CHANGE,        // 417Hz
        LIBERATION     // 396Hz
    }
    
    enum AccessLevel {
        PUBLIC,
        SOVEREIGN,
        OMNISOVEREIGN,
        ETERNAL
    }
    
    // ============ Structs ============
    
    struct Document {
        string title;
        string description;
        string ipfsHash;
        string filePath;
        DocumentType docType;
        FrequencyLevel frequency;
        AccessLevel accessLevel;
        string[] tags;
        string[] keywords;
        uint256 timestamp;
        address archivist;
        bool sealed;
        uint256 version;
    }
    
    struct Category {
        string name;
        string description;
        uint256[] documentIds;
        bool active;
    }
    
    struct SearchResult {
        uint256 documentId;
        uint256 relevanceScore;
    }
    
    // ============ State Variables ============
    
    mapping(uint256 => Document) public documents;
    mapping(string => uint256[]) private hashToDocuments; // IPFS hash to document IDs
    mapping(string => uint256[]) private tagToDocuments;
    mapping(string => uint256[]) private keywordToDocuments;
    mapping(uint256 => Category) public categories;
    mapping(address => bool) public archivists;
    
    uint256 public documentCount;
    uint256 public categoryCount;
    
    // ============ Events ============
    
    event DocumentIndexed(
        uint256 indexed documentId,
        string title,
        string ipfsHash,
        DocumentType docType,
        FrequencyLevel frequency,
        address indexed archivist
    );
    
    event DocumentUpdated(
        uint256 indexed documentId,
        uint256 newVersion,
        address indexed updater
    );
    
    event DocumentSealed(
        uint256 indexed documentId,
        address indexed sealer
    );
    
    event CategoryCreated(
        uint256 indexed categoryId,
        string name
    );
    
    event ArchivistAdded(address indexed archivist);
    event ArchivistRemoved(address indexed archivist);
    
    // ============ Modifiers ============
    
    modifier onlyArchivist() {
        require(archivists[msg.sender] || msg.sender == owner(), "Not an archivist");
        _;
    }
    
    // ============ Constructor ============
    
    constructor(address initialOwner) Ownable(initialOwner) {
        archivists[initialOwner] = true;
    }
    
    // ============ Core Functions ============
    
    /**
     * @notice Index a new document in the knowledge vault
     * @param title Document title
     * @param description Document description
     * @param ipfsHash IPFS content hash
     * @param filePath Repository file path
     * @param docType Type of document
     * @param frequency Frequency level
     * @param accessLevel Access restriction level
     * @param tags Document tags
     * @param keywords Search keywords
     * @return documentId The ID of the indexed document
     */
    function indexDocument(
        string memory title,
        string memory description,
        string memory ipfsHash,
        string memory filePath,
        DocumentType docType,
        FrequencyLevel frequency,
        AccessLevel accessLevel,
        string[] memory tags,
        string[] memory keywords
    ) external onlyArchivist whenNotPaused nonReentrant returns (uint256) {
        documentCount++;
        uint256 documentId = documentCount;
        
        Document storage doc = documents[documentId];
        doc.title = title;
        doc.description = description;
        doc.ipfsHash = ipfsHash;
        doc.filePath = filePath;
        doc.docType = docType;
        doc.frequency = frequency;
        doc.accessLevel = accessLevel;
        doc.tags = tags;
        doc.keywords = keywords;
        doc.timestamp = block.timestamp;
        doc.archivist = msg.sender;
        doc.sealed = false;
        doc.version = 1;
        
        // Index by IPFS hash
        hashToDocuments[ipfsHash].push(documentId);
        
        // Index by tags
        for (uint256 i = 0; i < tags.length; i++) {
            tagToDocuments[tags[i]].push(documentId);
        }
        
        // Index by keywords
        for (uint256 i = 0; i < keywords.length; i++) {
            keywordToDocuments[keywords[i]].push(documentId);
        }
        
        emit DocumentIndexed(documentId, title, ipfsHash, docType, frequency, msg.sender);
        
        return documentId;
    }
    
    /**
     * @notice Update an existing document
     * @param documentId ID of document to update
     * @param title New title
     * @param description New description
     * @param ipfsHash New IPFS hash
     */
    function updateDocument(
        uint256 documentId,
        string memory title,
        string memory description,
        string memory ipfsHash
    ) external onlyArchivist whenNotPaused {
        require(documentId > 0 && documentId <= documentCount, "Invalid document ID");
        require(!documents[documentId].sealed, "Document is sealed");
        
        Document storage doc = documents[documentId];
        doc.title = title;
        doc.description = description;
        
        // Update IPFS hash if changed
        if (keccak256(bytes(ipfsHash)) != keccak256(bytes(doc.ipfsHash))) {
            doc.ipfsHash = ipfsHash;
            hashToDocuments[ipfsHash].push(documentId);
        }
        
        doc.version++;
        
        emit DocumentUpdated(documentId, doc.version, msg.sender);
    }
    
    /**
     * @notice Seal a document to make it immutable
     * @param documentId ID of document to seal
     */
    function sealDocument(uint256 documentId) external onlyArchivist {
        require(documentId > 0 && documentId <= documentCount, "Invalid document ID");
        require(!documents[documentId].sealed, "Already sealed");
        
        documents[documentId].sealed = true;
        
        emit DocumentSealed(documentId, msg.sender);
    }
    
    /**
     * @notice Create a new category
     * @param name Category name
     * @param description Category description
     * @return categoryId The ID of the created category
     */
    function createCategory(
        string memory name,
        string memory description
    ) external onlyArchivist returns (uint256) {
        categoryCount++;
        uint256 categoryId = categoryCount;
        
        Category storage cat = categories[categoryId];
        cat.name = name;
        cat.description = description;
        cat.active = true;
        
        emit CategoryCreated(categoryId, name);
        
        return categoryId;
    }
    
    /**
     * @notice Add document to category
     * @param categoryId Category ID
     * @param documentId Document ID
     */
    function addToCategory(uint256 categoryId, uint256 documentId) external onlyArchivist {
        require(categoryId > 0 && categoryId <= categoryCount, "Invalid category");
        require(documentId > 0 && documentId <= documentCount, "Invalid document");
        
        categories[categoryId].documentIds.push(documentId);
    }
    
    // ============ Query Functions ============
    
    /**
     * @notice Get document by ID
     * @param documentId Document ID
     * @return Document struct
     */
    function getDocument(uint256 documentId) external view returns (Document memory) {
        require(documentId > 0 && documentId <= documentCount, "Invalid document ID");
        return documents[documentId];
    }
    
    /**
     * @notice Search documents by tag
     * @param tag Tag to search for
     * @return Array of document IDs
     */
    function searchByTag(string memory tag) external view returns (uint256[] memory) {
        return tagToDocuments[tag];
    }
    
    /**
     * @notice Search documents by keyword
     * @param keyword Keyword to search for
     * @return Array of document IDs
     */
    function searchByKeyword(string memory keyword) external view returns (uint256[] memory) {
        return keywordToDocuments[keyword];
    }
    
    /**
     * @notice Get documents by IPFS hash
     * @param ipfsHash IPFS content hash
     * @return Array of document IDs
     */
    function getByIPFSHash(string memory ipfsHash) external view returns (uint256[] memory) {
        return hashToDocuments[ipfsHash];
    }
    
    /**
     * @notice Get documents in a category
     * @param categoryId Category ID
     * @return Array of document IDs
     */
    function getCategoryDocuments(uint256 categoryId) external view returns (uint256[] memory) {
        require(categoryId > 0 && categoryId <= categoryCount, "Invalid category");
        return categories[categoryId].documentIds;
    }
    
    /**
     * @notice Get documents by type
     * @param docType Document type
     * @return Array of document IDs matching type
     */
    function getDocumentsByType(DocumentType docType) external view returns (uint256[] memory) {
        uint256[] memory results = new uint256[](documentCount);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= documentCount; i++) {
            if (documents[i].docType == docType) {
                results[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory finalResults = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            finalResults[i] = results[i];
        }
        
        return finalResults;
    }
    
    /**
     * @notice Get documents by frequency
     * @param frequency Frequency level
     * @return Array of document IDs matching frequency
     */
    function getDocumentsByFrequency(FrequencyLevel frequency) external view returns (uint256[] memory) {
        uint256[] memory results = new uint256[](documentCount);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= documentCount; i++) {
            if (documents[i].frequency == frequency) {
                results[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory finalResults = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            finalResults[i] = results[i];
        }
        
        return finalResults;
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Add an archivist
     * @param archivist Address to add as archivist
     */
    function addArchivist(address archivist) external onlyOwner {
        archivists[archivist] = true;
        emit ArchivistAdded(archivist);
    }
    
    /**
     * @notice Remove an archivist
     * @param archivist Address to remove
     */
    function removeArchivist(address archivist) external onlyOwner {
        archivists[archivist] = false;
        emit ArchivistRemoved(archivist);
    }
    
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
}
