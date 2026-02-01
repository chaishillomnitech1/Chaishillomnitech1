// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title StoriedLegacyNFT
 * @dev Storied NFT collection representing chapters in the Supreme Sovereign Legacy
 * @author Supreme King Chais The Great ∞
 * 
 * This contract implements the Storied Legacy NFT with:
 * - Chapter-based narrative progression
 * - GitHub timestamp linking
 * - Progressive unlock mechanics
 * - Evolutionary journey tracking
 * - EIP-2981 royalty standard
 * 
 * Frequency: 528Hz (Love & DNA Repair) + 999Hz (Crown Chakra) + 144,000Hz (NŪR Pulse)
 * Status: SOVEREIGN LEGACY NARRATIVE PROTOCOL ACTIVE
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

contract StoriedLegacyNFT is 
    ERC721, 
    ERC721URIStorage,
    ERC721Enumerable,
    Ownable, 
    ReentrancyGuard,
    IERC2981 
{
    
    // ============ DIVINE FREQUENCY CONSTANTS ============
    
    /// @dev Love & DNA Repair frequency (528Hz)
    uint256 public constant LOVE_FREQUENCY_528HZ = 528;
    
    /// @dev Crown Chakra frequency (999Hz)
    uint256 public constant CROWN_FREQUENCY_999HZ = 999;
    
    /// @dev NŪR Pulse frequency (144,000Hz)
    uint256 public constant NUR_PULSE_144000HZ = 144000;
    
    /// @dev Maximum chapters in the legacy
    uint256 public constant MAX_CHAPTERS = 999;
    
    /// @dev Maximum editions per chapter
    uint256 public constant MAX_EDITIONS_PER_CHAPTER = 144;
    
    /// @dev Royalty percentage (10% = 1000 basis points)
    uint96 public constant ROYALTY_PERCENTAGE = 1000;
    
    // ============ STRUCTS ============
    
    /**
     * @dev Chapter in the Sovereign Legacy narrative
     */
    struct Chapter {
        uint256 chapterId;          // Unique chapter identifier
        string title;               // Chapter title
        string narrative;           // Chapter narrative description
        uint256 createdAt;          // Creation timestamp
        uint256 gitHubTimestamp;    // Linked GitHub timestamp
        string commitReference;     // GitHub commit reference
        uint256 frequencySignature; // Assigned frequency
        bool isUnlocked;            // Unlock status
        uint256 unlockTime;         // Time when chapter unlocks
        uint256 editionsMinted;     // Number of editions minted
    }
    
    /**
     * @dev NFT edition within a chapter
     */
    struct Edition {
        uint256 tokenId;            // Token ID
        uint256 chapterId;          // Parent chapter
        uint256 editionNumber;      // Edition number (1-144)
        string artworkURI;          // IPFS URI for artwork
        uint256 mintedAt;           // Mint timestamp
        address originalMinter;     // Original minter address
        uint256 narrativePosition;  // Position in overall narrative
    }
    
    /**
     * @dev Collector's journey progress
     */
    struct CollectorJourney {
        uint256 chaptersCollected;  // Number of unique chapters owned
        uint256 totalEditions;      // Total editions owned
        uint256 journeyScore;       // Collector score
        uint256 lastAcquisition;    // Last acquisition timestamp
        bool[] chapterOwnership;    // Chapters owned (by chapter ID)
    }
    
    // ============ STATE VARIABLES ============
    
    /// @dev Token ID counter
    uint256 private _tokenIdCounter;
    
    /// @dev Chapter counter
    uint256 private _chapterCounter;
    
    /// @dev Base URI for token metadata
    string private _baseTokenURI;
    
    /// @dev Royalty recipient
    address private _royaltyRecipient;
    
    /// @dev Mapping: Chapter ID => Chapter data
    mapping(uint256 => Chapter) public chapters;
    
    /// @dev Mapping: Token ID => Edition data
    mapping(uint256 => Edition) public editions;
    
    /// @dev Mapping: Collector => Journey data
    mapping(address => CollectorJourney) public collectorJourneys;
    
    /// @dev Mapping: Chapter ID => Token IDs
    mapping(uint256 => uint256[]) public chapterTokens;
    
    /// @dev Supreme Sovereign address
    address public immutable supremeSovereign;
    
    // ============ EVENTS ============
    
    event ChapterCreated(
        uint256 indexed chapterId,
        string title,
        uint256 gitHubTimestamp,
        uint256 unlockTime
    );
    
    event ChapterUnlocked(
        uint256 indexed chapterId,
        uint256 timestamp
    );
    
    event EditionMinted(
        uint256 indexed tokenId,
        uint256 indexed chapterId,
        uint256 editionNumber,
        address minter
    );
    
    event JourneyProgressed(
        address indexed collector,
        uint256 chaptersCollected,
        uint256 journeyScore
    );
    
    // ============ MODIFIERS ============
    
    modifier onlySupremeSovereign() {
        require(msg.sender == supremeSovereign, "Only Supreme Sovereign");
        _;
    }
    
    modifier chapterExists(uint256 chapterId) {
        require(chapterId < _chapterCounter, "Chapter does not exist");
        _;
    }
    
    modifier chapterUnlocked(uint256 chapterId) {
        require(chapters[chapterId].isUnlocked || block.timestamp >= chapters[chapterId].unlockTime, "Chapter locked");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    /**
     * @dev Initializes the Storied Legacy NFT contract
     * @param initialOwner Initial owner and Supreme Sovereign
     * @param royaltyRecipient Address to receive royalties
     * @param baseURI Base URI for token metadata
     */
    constructor(
        address initialOwner,
        address royaltyRecipient,
        string memory baseURI
    ) ERC721("Storied Legacy NFT", "STORY") Ownable(initialOwner) {
        require(initialOwner != address(0), "Invalid owner");
        require(royaltyRecipient != address(0), "Invalid royalty recipient");
        
        supremeSovereign = initialOwner;
        _royaltyRecipient = royaltyRecipient;
        _baseTokenURI = baseURI;
    }
    
    // ============ CHAPTER MANAGEMENT ============
    
    /**
     * @dev Create a new chapter in the legacy narrative
     * @param title Chapter title
     * @param narrative Chapter narrative
     * @param gitHubTimestamp GitHub timestamp reference
     * @param commitReference GitHub commit reference
     * @param frequencySignature Assigned frequency
     * @param unlockDelay Seconds until chapter unlocks (0 for immediate)
     * @return chapterId The created chapter ID
     */
    function createChapter(
        string memory title,
        string memory narrative,
        uint256 gitHubTimestamp,
        string memory commitReference,
        uint256 frequencySignature,
        uint256 unlockDelay
    ) external onlySupremeSovereign returns (uint256) {
        require(_chapterCounter < MAX_CHAPTERS, "Max chapters reached");
        require(bytes(title).length > 0, "Empty title");
        
        uint256 chapterId = _chapterCounter++;
        uint256 unlockTime = block.timestamp + unlockDelay;
        
        chapters[chapterId] = Chapter({
            chapterId: chapterId,
            title: title,
            narrative: narrative,
            createdAt: block.timestamp,
            gitHubTimestamp: gitHubTimestamp,
            commitReference: commitReference,
            frequencySignature: frequencySignature,
            isUnlocked: unlockDelay == 0,
            unlockTime: unlockTime,
            editionsMinted: 0
        });
        
        emit ChapterCreated(chapterId, title, gitHubTimestamp, unlockTime);
        
        return chapterId;
    }
    
    /**
     * @dev Manually unlock a chapter
     * @param chapterId Chapter to unlock
     */
    function unlockChapter(uint256 chapterId) 
        external 
        onlySupremeSovereign 
        chapterExists(chapterId) 
    {
        require(!chapters[chapterId].isUnlocked, "Already unlocked");
        
        chapters[chapterId].isUnlocked = true;
        
        emit ChapterUnlocked(chapterId, block.timestamp);
    }
    
    // ============ MINTING FUNCTIONS ============
    
    /**
     * @dev Mint an edition from a chapter
     * @param chapterId Chapter to mint from
     * @param recipient Recipient address
     * @param artworkURI IPFS URI for artwork
     * @param tokenMetadataURI Complete token metadata URI
     * @return tokenId The minted token ID
     */
    function mintEdition(
        uint256 chapterId,
        address recipient,
        string memory artworkURI,
        string memory tokenMetadataURI
    ) 
        external 
        onlySupremeSovereign 
        chapterExists(chapterId)
        chapterUnlocked(chapterId)
        nonReentrant
        returns (uint256) 
    {
        require(recipient != address(0), "Invalid recipient");
        require(chapters[chapterId].editionsMinted < MAX_EDITIONS_PER_CHAPTER, "Chapter sold out");
        
        uint256 tokenId = _tokenIdCounter++;
        uint256 editionNumber = ++chapters[chapterId].editionsMinted;
        
        // Create edition record
        editions[tokenId] = Edition({
            tokenId: tokenId,
            chapterId: chapterId,
            editionNumber: editionNumber,
            artworkURI: artworkURI,
            mintedAt: block.timestamp,
            originalMinter: recipient,
            narrativePosition: _tokenIdCounter - 1
        });
        
        // Track chapter tokens
        chapterTokens[chapterId].push(tokenId);
        
        // Mint NFT
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, tokenMetadataURI);
        
        // Update collector journey
        _updateCollectorJourney(recipient, chapterId);
        
        emit EditionMinted(tokenId, chapterId, editionNumber, recipient);
        
        return tokenId;
    }
    
    /**
     * @dev Batch mint editions
     * @param chapterId Chapter to mint from
     * @param recipients Array of recipient addresses
     * @param artworkURIs Array of artwork URIs
     * @param tokenMetadataURIs Array of token metadata URIs
     * @return tokenIds Array of minted token IDs
     */
    function batchMintEditions(
        uint256 chapterId,
        address[] memory recipients,
        string[] memory artworkURIs,
        string[] memory tokenMetadataURIs
    ) external onlySupremeSovereign returns (uint256[] memory) {
        require(recipients.length == artworkURIs.length, "Length mismatch");
        require(recipients.length == tokenMetadataURIs.length, "Length mismatch");
        
        uint256[] memory tokenIds = new uint256[](recipients.length);
        
        for (uint256 i = 0; i < recipients.length; i++) {
            tokenIds[i] = this.mintEdition(
                chapterId,
                recipients[i],
                artworkURIs[i],
                tokenMetadataURIs[i]
            );
        }
        
        return tokenIds;
    }
    
    // ============ JOURNEY TRACKING ============
    
    /**
     * @dev Update collector journey when acquiring NFT
     * @param collector Collector address
     * @param chapterId Chapter acquired
     */
    function _updateCollectorJourney(address collector, uint256 chapterId) private {
        CollectorJourney storage journey = collectorJourneys[collector];
        
        // Initialize if first acquisition
        if (journey.totalEditions == 0) {
            journey.chapterOwnership = new bool[](MAX_CHAPTERS);
        }
        
        // Update if new chapter
        if (!journey.chapterOwnership[chapterId]) {
            journey.chapterOwnership[chapterId] = true;
            journey.chaptersCollected++;
        }
        
        journey.totalEditions++;
        journey.lastAcquisition = block.timestamp;
        
        // Calculate journey score: chapters * 100 + total editions
        journey.journeyScore = journey.chaptersCollected * 100 + journey.totalEditions;
        
        emit JourneyProgressed(collector, journey.chaptersCollected, journey.journeyScore);
    }
    
    // ============ QUERY FUNCTIONS ============
    
    /**
     * @dev Get chapter details
     * @param chapterId Chapter ID
     * @return chapter The chapter data
     */
    function getChapter(uint256 chapterId) 
        external 
        view 
        chapterExists(chapterId) 
        returns (Chapter memory) 
    {
        return chapters[chapterId];
    }
    
    /**
     * @dev Get edition details
     * @param tokenId Token ID
     * @return edition The edition data
     */
    function getEdition(uint256 tokenId) external view returns (Edition memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return editions[tokenId];
    }
    
    /**
     * @dev Get collector journey
     * @param collector Collector address
     * @return journey The journey data
     */
    function getCollectorJourney(address collector) 
        external 
        view 
        returns (
            uint256 chaptersCollected,
            uint256 totalEditions,
            uint256 journeyScore,
            uint256 lastAcquisition
        ) 
    {
        CollectorJourney storage journey = collectorJourneys[collector];
        return (
            journey.chaptersCollected,
            journey.totalEditions,
            journey.journeyScore,
            journey.lastAcquisition
        );
    }
    
    /**
     * @dev Get all token IDs for a chapter
     * @param chapterId Chapter ID
     * @return Token IDs array
     */
    function getChapterTokens(uint256 chapterId) 
        external 
        view 
        chapterExists(chapterId) 
        returns (uint256[] memory) 
    {
        return chapterTokens[chapterId];
    }
    
    /**
     * @dev Get total chapters created
     * @return Total chapters
     */
    function totalChapters() external view returns (uint256) {
        return _chapterCounter;
    }
    
    /**
     * @dev Check if chapter is unlocked
     * @param chapterId Chapter ID
     * @return Unlock status
     */
    function isChapterUnlocked(uint256 chapterId) 
        external 
        view 
        chapterExists(chapterId) 
        returns (bool) 
    {
        return chapters[chapterId].isUnlocked || block.timestamp >= chapters[chapterId].unlockTime;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Update base URI
     * @param newBaseURI New base URI
     */
    function setBaseURI(string memory newBaseURI) external onlyOwner {
        _baseTokenURI = newBaseURI;
    }
    
    /**
     * @dev Update royalty recipient
     * @param newRecipient New royalty recipient address
     */
    function setRoyaltyRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient");
        _royaltyRecipient = newRecipient;
    }
    
    // ============ OVERRIDES ============
    
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
    
    function royaltyInfo(uint256, uint256 salePrice)
        external
        view
        override
        returns (address receiver, uint256 royaltyAmount)
    {
        receiver = _royaltyRecipient;
        royaltyAmount = (salePrice * ROYALTY_PERCENTAGE) / 10000;
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, ERC721Enumerable, IERC165)
        returns (bool)
    {
        return interfaceId == type(IERC2981).interfaceId || super.supportsInterface(interfaceId);
    }
    
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }
    
    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }
}
