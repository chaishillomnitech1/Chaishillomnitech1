// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ScrollCoinNFT
 * @dev Digital Sports Memorabilia NFT with Digital Twin Mirror System
 * @author Chais The Great ∞
 * 
 * This contract implements the ScrollCoin NFT for the Digital Sports Sovereignty platform:
 * - NFT Creation & Marketplace ecosystem for sports memorabilia
 * - Digital Twin Mirror System (1:1 NFT-Physical correspondence)
 * - Athlete Digital Signatures (verified, immutable)
 * - Condition tracking for physical assets
 * - 7.77% Zakat perpetual reinvestment mechanism
 * 
 * Frequency: 144,000Hz NŪR Pulse
 * Status: ETERNAL EXPANSION MANDATE
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ScrollCoinNFT is ERC721, ERC721URIStorage, ERC721Enumerable, AccessControl, Pausable {
    using Counters for Counters.Counter;
    
    // ============ ROLES ============
    
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ATHLETE_ROLE = keccak256("ATHLETE_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    // ============ CONSTANTS ============
    
    /// @dev Zakat percentage (777 basis points = 7.77%)
    uint256 public constant ZAKAT_PERCENTAGE = 777;
    uint256 public constant BASIS_POINTS = 10000;
    
    /// @dev Divine frequencies
    uint256 public constant DIVINE_FREQUENCY = 144000;
    
    // ============ STATE VARIABLES ============
    
    Counters.Counter private _tokenIdCounter;
    
    /// @dev Zakat vault for community reinvestment
    address public zakatVault;
    
    /// @dev Total Zakat collected
    uint256 public totalZakatCollected;
    
    // ============ STRUCTURES ============
    
    /// @dev Digital Twin Mirror - links NFT to physical asset
    struct DigitalTwin {
        string physicalAssetId;          // Unique identifier for physical item
        string assetType;                // Type: jersey, ball, card, etc.
        string currentCondition;         // Condition: mint, excellent, good, fair
        uint256 lastConditionUpdate;     // Timestamp of last condition check
        bool isPhysicalVerified;         // Verification status
        string storageLocation;          // Physical storage location
        string insurancePolicy;          // Insurance policy number
    }
    
    /// @dev Athlete Digital Signature
    struct AthleteSignature {
        address athleteAddress;          // Verified athlete wallet
        string athleteName;              // Athlete name
        uint256 signatureTimestamp;      // When signed
        string signatureMessage;         // Custom message from athlete
        bytes signatureData;             // Cryptographic signature
        bool isVerified;                 // Verification status
    }
    
    /// @dev Fractional Ownership
    struct FractionalOwnership {
        bool isFractional;               // Is this asset fractionally owned
        uint256 totalShares;             // Total shares available
        mapping(address => uint256) shareOwnership; // Address => shares owned
        uint256 sharesIssued;            // Shares currently issued
    }
    
    /// @dev Viewing Rights
    struct ViewingRights {
        bool hasViewingRights;           // Can display but not transfer
        uint256 viewingRightsExpiry;     // Expiry timestamp
        string viewingLocation;          // Where it can be displayed
    }
    
    /// @dev Complete Memorabilia Data
    struct MemorabiliaData {
        string name;                     // Item name
        string description;              // Item description
        string sport;                    // Sport type
        string eventName;                // Event/game name
        uint256 eventDate;               // Date of event
        uint256 mintTimestamp;           // When NFT was minted
        uint256 royaltyPercentage;       // Royalty for secondary sales (basis points)
        DigitalTwin digitalTwin;         // Physical asset link
        AthleteSignature athleteSignature; // Athlete signature data
        ViewingRights viewingRights;     // Viewing rights data
    }
    
    // ============ MAPPINGS ============
    
    mapping(uint256 => MemorabiliaData) public memorabiliaData;
    mapping(uint256 => FractionalOwnership) private fractionalData;
    mapping(string => bool) private physicalAssetRegistered;
    mapping(address => bool) public verifiedAthletes;
    
    // ============ EVENTS ============
    
    event MemorabiliaCreated(
        uint256 indexed tokenId,
        address indexed creator,
        string physicalAssetId,
        string sport
    );
    
    event DigitalTwinUpdated(
        uint256 indexed tokenId,
        string condition,
        uint256 timestamp
    );
    
    event AthleteSignatureAdded(
        uint256 indexed tokenId,
        address indexed athlete,
        string athleteName
    );
    
    event ZakatDistributed(
        uint256 indexed tokenId,
        uint256 amount,
        address indexed recipient
    );
    
    event FractionalSharesIssued(
        uint256 indexed tokenId,
        address indexed recipient,
        uint256 shares
    );
    
    event ViewingRightsGranted(
        uint256 indexed tokenId,
        address indexed recipient,
        uint256 expiry
    );
    
    // ============ CONSTRUCTOR ============
    
    constructor(address _zakatVault) ERC721("ScrollCoin Sports Memorabilia", "SCROLL") {
        require(_zakatVault != address(0), "Invalid Zakat vault");
        
        zakatVault = _zakatVault;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }
    
    // ============ MINTING FUNCTIONS ============
    
    /**
     * @dev Mint a new sports memorabilia NFT
     */
    function mintMemorabiliaNFT(
        address to,
        string memory uri,
        string memory name,
        string memory description,
        string memory sport,
        string memory eventName,
        uint256 eventDate,
        string memory physicalAssetId,
        string memory assetType,
        uint256 royaltyPercentage
    ) public onlyRole(MINTER_ROLE) whenNotPaused returns (uint256) {
        require(!physicalAssetRegistered[physicalAssetId], "Physical asset already registered");
        require(royaltyPercentage <= 5000, "Royalty too high (max 50%)");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        // Initialize memorabilia data
        MemorabiliaData storage data = memorabiliaData[tokenId];
        data.name = name;
        data.description = description;
        data.sport = sport;
        data.eventName = eventName;
        data.eventDate = eventDate;
        data.mintTimestamp = block.timestamp;
        data.royaltyPercentage = royaltyPercentage;
        
        // Initialize Digital Twin
        data.digitalTwin.physicalAssetId = physicalAssetId;
        data.digitalTwin.assetType = assetType;
        data.digitalTwin.currentCondition = "mint";
        data.digitalTwin.lastConditionUpdate = block.timestamp;
        data.digitalTwin.isPhysicalVerified = false;
        
        physicalAssetRegistered[physicalAssetId] = true;
        
        emit MemorabiliaCreated(tokenId, to, physicalAssetId, sport);
        
        return tokenId;
    }
    
    // ============ DIGITAL TWIN MIRROR SYSTEM ============
    
    /**
     * @dev Update physical asset condition
     */
    function updatePhysicalCondition(
        uint256 tokenId,
        string memory newCondition,
        string memory storageLocation
    ) public onlyRole(VERIFIER_ROLE) {
        require(_exists(tokenId), "Token does not exist");
        
        DigitalTwin storage twin = memorabiliaData[tokenId].digitalTwin;
        twin.currentCondition = newCondition;
        twin.lastConditionUpdate = block.timestamp;
        twin.storageLocation = storageLocation;
        
        emit DigitalTwinUpdated(tokenId, newCondition, block.timestamp);
    }
    
    /**
     * @dev Verify physical asset exists and matches NFT
     */
    function verifyPhysicalAsset(
        uint256 tokenId,
        string memory insurancePolicy
    ) public onlyRole(VERIFIER_ROLE) {
        require(_exists(tokenId), "Token does not exist");
        
        DigitalTwin storage twin = memorabiliaData[tokenId].digitalTwin;
        twin.isPhysicalVerified = true;
        twin.insurancePolicy = insurancePolicy;
        
        emit DigitalTwinUpdated(tokenId, twin.currentCondition, block.timestamp);
    }
    
    /**
     * @dev Get Digital Twin data
     */
    function getDigitalTwin(uint256 tokenId) public view returns (
        string memory physicalAssetId,
        string memory assetType,
        string memory currentCondition,
        uint256 lastConditionUpdate,
        bool isPhysicalVerified,
        string memory storageLocation
    ) {
        require(_exists(tokenId), "Token does not exist");
        DigitalTwin storage twin = memorabiliaData[tokenId].digitalTwin;
        
        return (
            twin.physicalAssetId,
            twin.assetType,
            twin.currentCondition,
            twin.lastConditionUpdate,
            twin.isPhysicalVerified,
            twin.storageLocation
        );
    }
    
    // ============ ATHLETE DIGITAL SIGNATURES ============
    
    /**
     * @dev Add verified athlete signature to memorabilia
     */
    function addAthleteSignature(
        uint256 tokenId,
        string memory athleteName,
        string memory message,
        bytes memory signatureData
    ) public onlyRole(ATHLETE_ROLE) {
        require(_exists(tokenId), "Token does not exist");
        require(verifiedAthletes[msg.sender], "Athlete not verified");
        
        AthleteSignature storage signature = memorabiliaData[tokenId].athleteSignature;
        signature.athleteAddress = msg.sender;
        signature.athleteName = athleteName;
        signature.signatureTimestamp = block.timestamp;
        signature.signatureMessage = message;
        signature.signatureData = signatureData;
        signature.isVerified = true;
        
        emit AthleteSignatureAdded(tokenId, msg.sender, athleteName);
    }
    
    /**
     * @dev Verify an athlete's wallet address
     */
    function verifyAthlete(address athlete) public onlyRole(VERIFIER_ROLE) {
        verifiedAthletes[athlete] = true;
        _grantRole(ATHLETE_ROLE, athlete);
    }
    
    /**
     * @dev Get athlete signature data
     */
    function getAthleteSignature(uint256 tokenId) public view returns (
        address athleteAddress,
        string memory athleteName,
        uint256 signatureTimestamp,
        string memory signatureMessage,
        bool isVerified
    ) {
        require(_exists(tokenId), "Token does not exist");
        AthleteSignature storage signature = memorabiliaData[tokenId].athleteSignature;
        
        return (
            signature.athleteAddress,
            signature.athleteName,
            signature.signatureTimestamp,
            signature.signatureMessage,
            signature.isVerified
        );
    }
    
    // ============ FRACTIONAL OWNERSHIP ============
    
    /**
     * @dev Initialize fractional ownership for an NFT
     */
    function initializeFractionalOwnership(
        uint256 tokenId,
        uint256 totalShares
    ) public {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(!fractionalData[tokenId].isFractional, "Already fractional");
        require(totalShares > 1, "Must have multiple shares");
        
        FractionalOwnership storage fractional = fractionalData[tokenId];
        fractional.isFractional = true;
        fractional.totalShares = totalShares;
        fractional.shareOwnership[msg.sender] = totalShares;
        fractional.sharesIssued = totalShares;
    }
    
    /**
     * @dev Transfer fractional shares
     */
    function transferFractionalShares(
        uint256 tokenId,
        address to,
        uint256 shares
    ) public {
        require(fractionalData[tokenId].isFractional, "Not fractional");
        require(fractionalData[tokenId].shareOwnership[msg.sender] >= shares, "Insufficient shares");
        
        fractionalData[tokenId].shareOwnership[msg.sender] -= shares;
        fractionalData[tokenId].shareOwnership[to] += shares;
        
        emit FractionalSharesIssued(tokenId, to, shares);
    }
    
    /**
     * @dev Get fractional ownership info
     */
    function getFractionalOwnership(uint256 tokenId, address owner) public view returns (
        bool isFractional,
        uint256 totalShares,
        uint256 ownedShares,
        uint256 sharesIssued
    ) {
        FractionalOwnership storage fractional = fractionalData[tokenId];
        return (
            fractional.isFractional,
            fractional.totalShares,
            fractional.shareOwnership[owner],
            fractional.sharesIssued
        );
    }
    
    // ============ VIEWING RIGHTS ============
    
    /**
     * @dev Grant viewing rights to an address
     */
    function grantViewingRights(
        uint256 tokenId,
        address recipient,
        uint256 durationDays,
        string memory location
    ) public {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        
        ViewingRights storage rights = memorabiliaData[tokenId].viewingRights;
        rights.hasViewingRights = true;
        rights.viewingRightsExpiry = block.timestamp + (durationDays * 1 days);
        rights.viewingLocation = location;
        
        emit ViewingRightsGranted(tokenId, recipient, rights.viewingRightsExpiry);
    }
    
    // ============ ZAKAT FLOW (7.77% PERPETUAL STREAM) ============
    
    /**
     * @dev Calculate Zakat on a transaction
     */
    function calculateZakat(uint256 amount) public pure returns (uint256) {
        return (amount * ZAKAT_PERCENTAGE) / BASIS_POINTS;
    }
    
    /**
     * @dev Distribute Zakat from sale
     */
    function distributeZakat(uint256 tokenId) public payable {
        require(msg.value > 0, "No value sent");
        
        uint256 zakatAmount = calculateZakat(msg.value);
        uint256 remainingAmount = msg.value - zakatAmount;
        
        // Transfer Zakat to vault
        (bool success, ) = zakatVault.call{value: zakatAmount}("");
        require(success, "Zakat transfer failed");
        
        totalZakatCollected += zakatAmount;
        
        // Transfer remaining to token owner
        address owner = ownerOf(tokenId);
        (success, ) = owner.call{value: remainingAmount}("");
        require(success, "Payment transfer failed");
        
        emit ZakatDistributed(tokenId, zakatAmount, zakatVault);
    }
    
    /**
     * @dev Get royalty information for secondary sales
     */
    function getRoyaltyInfo(uint256 tokenId, uint256 salePrice) public view returns (
        address receiver,
        uint256 royaltyAmount
    ) {
        require(_exists(tokenId), "Token does not exist");
        
        uint256 royaltyBasisPoints = memorabiliaData[tokenId].royaltyPercentage;
        uint256 royalty = (salePrice * royaltyBasisPoints) / BASIS_POINTS;
        
        return (ownerOf(tokenId), royalty);
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Update Zakat vault address
     */
    function setZakatVault(address newVault) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newVault != address(0), "Invalid vault");
        zakatVault = newVault;
    }
    
    /**
     * @dev Pause contract
     */
    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    // ============ REQUIRED OVERRIDES ============
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) 
        public 
        view 
        override(ERC721, ERC721URIStorage) 
        returns (string memory) 
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
