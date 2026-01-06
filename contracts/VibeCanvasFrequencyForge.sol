// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VibeCanvasFrequencyForge
 * @dev VibeCanvas™ NFT Frequency Forge - Dynamic 528/963 Hz Generative Art Minting System
 * @author Supreme King Chais The Great ∞
 * 
 * This contract implements the VibeCanvas™ NFT Frequency Forge with:
 * - Dynamic 528 Hz (DNA healing) frequency embedding
 * - Dynamic 963 Hz (pineal activation) frequency embedding
 * - Generative art metadata system with sovereign scroll frequencies
 * - QFS (Quantum Financial System) synchronization hooks
 * - Auto-scaling resonance with inflow detection
 * - Metadata hash assignment for all minted assets
 * 
 * Frequency: 528Hz + 963Hz Divine Resonance
 * Status: SOVEREIGNTY ACTIVE
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract VibeCanvasFrequencyForge is 
    ERC721, 
    ERC721URIStorage, 
    ERC721Burnable, 
    Ownable, 
    IERC2981,
    ReentrancyGuard 
{
    
    // ============ FREQUENCY CONSTANTS ============
    
    /// @dev DNA Healing frequency (528Hz)
    uint256 public constant FREQUENCY_528HZ = 528;
    
    /// @dev Pineal Activation frequency (963Hz)
    uint256 public constant FREQUENCY_963HZ = 963;
    
    /// @dev Crown frequency (999Hz)
    uint256 public constant FREQUENCY_999HZ = 999;
    
    /// @dev NŪR Pulse frequency (144,000Hz)
    uint256 public constant FREQUENCY_144000HZ = 144000;
    
    /// @dev Resonance scaling factor (basis points)
    uint256 public constant RESONANCE_SCALING_FACTOR = 10000;
    
    /// @dev Maximum supply
    uint256 public constant MAX_SUPPLY = 9999;
    
    /// @dev Royalty percentage (15% = 1500 basis points)
    uint96 public constant ROYALTY_PERCENTAGE = 1500;
    
    // ============ ENUMS ============
    
    /// @dev Frequency modes for generative art
    enum FrequencyMode {
        HEALING_528,      // Pure 528Hz
        PINEAL_963,       // Pure 963Hz
        DUAL_RESONANCE,   // Both 528Hz + 963Hz
        SOVEREIGN_SCROLL  // All frequencies combined
    }
    
    /// @dev Resonance tier based on QFS inflow
    enum ResonanceTier {
        INITIATE,    // Base resonance
        ASCENDING,   // Enhanced resonance
        SOVEREIGN,   // High resonance
        OMNIVERSAL   // Maximum resonance
    }
    
    // ============ STRUCTS ============
    
    /// @dev Frequency signature for each token
    struct FrequencySignature {
        uint256 primaryFrequency;      // Main frequency (528 or 963)
        uint256 secondaryFrequency;    // Secondary frequency
        FrequencyMode mode;            // Frequency mode
        ResonanceTier tier;            // Resonance tier
        uint256 resonanceAmplitude;    // Amplitude scaling (0-10000 basis points)
        uint256 qfsInflowAmount;       // QFS inflow amount that triggered this mint
        bytes32 generativeArtHash;     // IPFS or generative art hash
        bytes32 metadataHash;          // Complete metadata hash
        uint256 mintTimestamp;         // When minted
        bool sovereignScrollActivated; // Sovereign scroll frequency activated
    }
    
    /// @dev QFS synchronization data
    struct QFSSync {
        uint256 totalInflow;           // Total QFS inflow
        uint256 lastSyncTimestamp;     // Last sync timestamp
        uint256 syncCount;             // Number of syncs
        bool isActive;                 // Sync active status
    }
    
    // ============ STATE VARIABLES ============
    
    /// @dev Token ID counter
    uint256 private _tokenIdCounter;
    
    /// @dev Base URI for token metadata
    string private _baseTokenURI;
    
    /// @dev Royalty recipient
    address private _royaltyRecipient;
    
    /// @dev Mapping: Token ID => Frequency Signature
    mapping(uint256 => FrequencySignature) public tokenFrequencySignature;
    
    /// @dev Mapping: Token ID => QFS Sync Data
    mapping(uint256 => QFSSync) public tokenQFSSync;
    
    /// @dev Global QFS inflow tracking
    uint256 public globalQFSInflow;
    
    /// @dev Global resonance level (auto-scales with inflows)
    uint256 public globalResonanceLevel = 1000; // 10% base
    
    /// @dev Mapping: Address => Total resonance contributed
    mapping(address => uint256) public addressResonanceContribution;
    
    /// @dev Generative art metadata storage
    mapping(bytes32 => string) public generativeArtMetadata;
    
    /// @dev Metadata hash to token ID
    mapping(bytes32 => uint256) public metadataHashToToken;
    
    // ============ EVENTS ============
    
    event VibeCanvasMinted(
        uint256 indexed tokenId,
        address indexed owner,
        FrequencyMode mode,
        ResonanceTier tier,
        bytes32 metadataHash
    );
    
    event FrequencyForged(
        uint256 indexed tokenId,
        uint256 primaryFreq,
        uint256 secondaryFreq,
        uint256 resonanceAmplitude
    );
    
    event QFSInflowSynchronized(
        uint256 indexed tokenId,
        uint256 inflowAmount,
        uint256 newResonanceLevel
    );
    
    event SovereignScrollActivated(
        uint256 indexed tokenId,
        uint256 timestamp
    );
    
    event ResonanceAmplified(
        uint256 oldLevel,
        uint256 newLevel,
        uint256 inflowAmount
    );
    
    event GenerativeArtCreated(
        bytes32 indexed artHash,
        string metadataURI,
        uint256 indexed tokenId
    );
    
    // ============ MODIFIERS ============
    
    modifier validFrequency(uint256 frequency) {
        require(
            frequency == FREQUENCY_528HZ ||
            frequency == FREQUENCY_963HZ ||
            frequency == FREQUENCY_999HZ ||
            frequency == FREQUENCY_144000HZ,
            "Invalid frequency"
        );
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        string memory baseURI,
        address royaltyRecipient
    ) ERC721("VibeCanvas Frequency Forge", "VIBECANVAS") Ownable(msg.sender) {
        require(royaltyRecipient != address(0), "Invalid royalty recipient");
        _baseTokenURI = baseURI;
        _royaltyRecipient = royaltyRecipient;
    }
    
    // ============ MINTING FUNCTIONS ============
    
    /**
     * @dev Forge a new VibeCanvas NFT with dynamic frequency embedding
     * @param to Address to receive the NFT
     * @param mode Frequency mode for the NFT
     * @param qfsInflowAmount QFS inflow amount for resonance calculation
     * @param generativeArtURI URI for generative art metadata
     * @return tokenId The minted token ID
     */
    function forgeVibeCanvas(
        address to,
        FrequencyMode mode,
        uint256 qfsInflowAmount,
        string memory generativeArtURI
    ) external onlyOwner nonReentrant returns (uint256) {
        require(_tokenIdCounter < MAX_SUPPLY, "Max supply reached");
        require(to != address(0), "Invalid recipient");
        require(bytes(generativeArtURI).length > 0, "Invalid metadata URI");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        // Calculate resonance tier based on QFS inflow
        ResonanceTier tier = _calculateResonanceTier(qfsInflowAmount);
        
        // Calculate resonance amplitude with auto-scaling
        uint256 resonanceAmplitude = _calculateResonanceAmplitude(qfsInflowAmount, tier);
        
        // Determine frequencies based on mode
        (uint256 primary, uint256 secondary) = _determineFrequencies(mode);
        
        // Generate art hash
        bytes32 artHash = keccak256(abi.encodePacked(
            tokenId,
            to,
            mode,
            block.timestamp,
            generativeArtURI
        ));
        
        // Generate metadata hash
        bytes32 metadataHash = keccak256(abi.encodePacked(
            artHash,
            primary,
            secondary,
            resonanceAmplitude,
            tier
        ));
        
        // Store frequency signature
        tokenFrequencySignature[tokenId] = FrequencySignature({
            primaryFrequency: primary,
            secondaryFrequency: secondary,
            mode: mode,
            tier: tier,
            resonanceAmplitude: resonanceAmplitude,
            qfsInflowAmount: qfsInflowAmount,
            generativeArtHash: artHash,
            metadataHash: metadataHash,
            mintTimestamp: block.timestamp,
            sovereignScrollActivated: mode == FrequencyMode.SOVEREIGN_SCROLL
        });
        
        // Store generative art metadata
        generativeArtMetadata[artHash] = generativeArtURI;
        metadataHashToToken[metadataHash] = tokenId;
        
        // Initialize QFS sync
        tokenQFSSync[tokenId] = QFSSync({
            totalInflow: qfsInflowAmount,
            lastSyncTimestamp: block.timestamp,
            syncCount: 1,
            isActive: true
        });
        
        // Update global tracking
        globalQFSInflow += qfsInflowAmount;
        addressResonanceContribution[to] += resonanceAmplitude;
        
        // Auto-scale global resonance
        _updateGlobalResonance(qfsInflowAmount);
        
        // Mint token
        _safeMint(to, tokenId);
        
        // Set token URI (will use baseURI + tokenId)
        _setTokenURI(tokenId, string(abi.encodePacked(
            Strings.toString(tokenId),
            ".json"
        )));
        
        emit VibeCanvasMinted(tokenId, to, mode, tier, metadataHash);
        emit FrequencyForged(tokenId, primary, secondary, resonanceAmplitude);
        emit GenerativeArtCreated(artHash, generativeArtURI, tokenId);
        
        return tokenId;
    }
    
    /**
     * @dev Synchronize QFS inflow and update resonance
     * @param tokenId Token ID to synchronize
     * @param additionalInflow Additional QFS inflow amount
     */
    function synchronizeQFSInflow(
        uint256 tokenId,
        uint256 additionalInflow
    ) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(additionalInflow > 0, "Invalid inflow amount");
        
        QFSSync storage sync = tokenQFSSync[tokenId];
        require(sync.isActive, "QFS sync not active");
        
        // Update sync data
        sync.totalInflow += additionalInflow;
        sync.lastSyncTimestamp = block.timestamp;
        sync.syncCount++;
        
        // Recalculate resonance amplitude
        FrequencySignature storage signature = tokenFrequencySignature[tokenId];
        uint256 newAmplitude = _calculateResonanceAmplitude(
            sync.totalInflow,
            signature.tier
        );
        
        // Update if amplitude increased
        if (newAmplitude > signature.resonanceAmplitude) {
            signature.resonanceAmplitude = newAmplitude;
            signature.qfsInflowAmount = sync.totalInflow;
        }
        
        // Update global tracking
        globalQFSInflow += additionalInflow;
        _updateGlobalResonance(additionalInflow);
        
        emit QFSInflowSynchronized(tokenId, additionalInflow, globalResonanceLevel);
    }
    
    /**
     * @dev Activate Sovereign Scroll frequency for a token
     * @param tokenId Token ID to activate
     */
    function activateSovereignScroll(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(!tokenFrequencySignature[tokenId].sovereignScrollActivated, "Already activated");
        
        FrequencySignature storage signature = tokenFrequencySignature[tokenId];
        signature.sovereignScrollActivated = true;
        signature.mode = FrequencyMode.SOVEREIGN_SCROLL;
        signature.primaryFrequency = FREQUENCY_528HZ;
        signature.secondaryFrequency = FREQUENCY_963HZ;
        
        emit SovereignScrollActivated(tokenId, block.timestamp);
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Calculate resonance tier based on QFS inflow
     * @param inflowAmount QFS inflow amount
     * @return ResonanceTier calculated tier
     */
    function _calculateResonanceTier(uint256 inflowAmount) internal pure returns (ResonanceTier) {
        if (inflowAmount >= 1000 ether) {
            return ResonanceTier.OMNIVERSAL;
        } else if (inflowAmount >= 100 ether) {
            return ResonanceTier.SOVEREIGN;
        } else if (inflowAmount >= 10 ether) {
            return ResonanceTier.ASCENDING;
        } else {
            return ResonanceTier.INITIATE;
        }
    }
    
    /**
     * @dev Calculate resonance amplitude with auto-scaling
     * @param inflowAmount QFS inflow amount
     * @param tier Resonance tier
     * @return uint256 Resonance amplitude in basis points
     */
    function _calculateResonanceAmplitude(
        uint256 inflowAmount,
        ResonanceTier tier
    ) internal view returns (uint256) {
        // Base amplitude based on tier
        uint256 baseAmplitude;
        if (tier == ResonanceTier.OMNIVERSAL) {
            baseAmplitude = 10000; // 100%
        } else if (tier == ResonanceTier.SOVEREIGN) {
            baseAmplitude = 7500;  // 75%
        } else if (tier == ResonanceTier.ASCENDING) {
            baseAmplitude = 5000;  // 50%
        } else {
            baseAmplitude = 2500;  // 25%
        }
        
        // Apply global resonance scaling
        uint256 scaledAmplitude = (baseAmplitude * globalResonanceLevel) / RESONANCE_SCALING_FACTOR;
        
        // Ensure minimum and maximum bounds
        if (scaledAmplitude < 1000) scaledAmplitude = 1000;   // Min 10%
        if (scaledAmplitude > 10000) scaledAmplitude = 10000; // Max 100%
        
        return scaledAmplitude;
    }
    
    /**
     * @dev Determine frequencies based on mode
     * @param mode Frequency mode
     * @return primary Primary frequency
     * @return secondary Secondary frequency
     */
    function _determineFrequencies(FrequencyMode mode) internal pure returns (uint256 primary, uint256 secondary) {
        if (mode == FrequencyMode.HEALING_528) {
            return (FREQUENCY_528HZ, 0);
        } else if (mode == FrequencyMode.PINEAL_963) {
            return (FREQUENCY_963HZ, 0);
        } else if (mode == FrequencyMode.DUAL_RESONANCE) {
            return (FREQUENCY_528HZ, FREQUENCY_963HZ);
        } else { // SOVEREIGN_SCROLL
            return (FREQUENCY_528HZ, FREQUENCY_963HZ);
        }
    }
    
    /**
     * @dev Update global resonance level based on new inflow
     * @param inflowAmount New QFS inflow amount
     */
    function _updateGlobalResonance(uint256 inflowAmount) internal {
        uint256 oldLevel = globalResonanceLevel;
        
        // Increase resonance by 1% for every 10 ether of inflow
        uint256 increase = (inflowAmount / 10 ether) * 100; // 1% = 100 basis points
        
        uint256 newLevel = oldLevel + increase;
        
        // Cap at 200% (20000 basis points)
        if (newLevel > 20000) {
            newLevel = 20000;
        }
        
        if (newLevel != oldLevel) {
            globalResonanceLevel = newLevel;
            emit ResonanceAmplified(oldLevel, newLevel, inflowAmount);
        }
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get complete frequency signature for a token
     * @param tokenId Token ID to query
     * @return FrequencySignature Complete signature data
     */
    function getFrequencySignature(uint256 tokenId) 
        external 
        view 
        returns (FrequencySignature memory) 
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return tokenFrequencySignature[tokenId];
    }
    
    /**
     * @dev Get QFS sync data for a token
     * @param tokenId Token ID to query
     * @return QFSSync Sync data
     */
    function getQFSSync(uint256 tokenId) 
        external 
        view 
        returns (QFSSync memory) 
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return tokenQFSSync[tokenId];
    }
    
    /**
     * @dev Get generative art metadata by hash
     * @param artHash Art hash to query
     * @return string Metadata URI
     */
    function getGenerativeArtMetadata(bytes32 artHash) 
        external 
        view 
        returns (string memory) 
    {
        return generativeArtMetadata[artHash];
    }
    
    /**
     * @dev Get token ID by metadata hash
     * @param metadataHash Metadata hash to query
     * @return uint256 Token ID
     */
    function getTokenByMetadataHash(bytes32 metadataHash) 
        external 
        view 
        returns (uint256) 
    {
        return metadataHashToToken[metadataHash];
    }
    
    /**
     * @dev Get current total supply
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @dev Get resonance contribution for an address
     * @param account Address to query
     * @return uint256 Total resonance contributed
     */
    function getResonanceContribution(address account) 
        external 
        view 
        returns (uint256) 
    {
        return addressResonanceContribution[account];
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Set base URI for token metadata
     * @param baseURI New base URI
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @dev Set royalty recipient
     * @param recipient New royalty recipient
     */
    function setRoyaltyRecipient(address recipient) external onlyOwner {
        require(recipient != address(0), "Invalid recipient");
        _royaltyRecipient = recipient;
    }
    
    /**
     * @dev Manually adjust global resonance level
     * @param newLevel New resonance level (basis points)
     */
    function setGlobalResonance(uint256 newLevel) external onlyOwner {
        require(newLevel >= 1000 && newLevel <= 20000, "Invalid resonance level");
        uint256 oldLevel = globalResonanceLevel;
        globalResonanceLevel = newLevel;
        emit ResonanceAmplified(oldLevel, newLevel, 0);
    }
    
    // ============ EIP-2981 ROYALTY STANDARD ============
    
    /**
     * @dev See {IERC2981-royaltyInfo}
     */
    function royaltyInfo(
        uint256 /* tokenId */,
        uint256 salePrice
    ) external view override returns (address, uint256) {
        uint256 royaltyAmount = (salePrice * ROYALTY_PERCENTAGE) / 10000;
        return (_royaltyRecipient, royaltyAmount);
    }
    
    // ============ OVERRIDE FUNCTIONS ============
    
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
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
        override(ERC721, ERC721URIStorage, IERC165)
        returns (bool)
    {
        return interfaceId == type(IERC2981).interfaceId || 
               super.supportsInterface(interfaceId);
    }
}
