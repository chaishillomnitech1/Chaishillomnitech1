// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ClaudeMemoryNFT
 * @dev Memory-Backed NFTs for ScrollVerse - Chapters of Infinity
 * @author Supreme King Chais The Great ∞
 * 
 * This contract enables transformation of memory structures into scroll-backed NFTs:
 * - Each memory block preserved as digital storied assets
 * - Integration with ScrollVerse ecosystem
 * - Linked to cosmic elements, precious metals, and omniversal frequencies
 * - "Chapters of Infinity" merging digital ownership with eternal resonance
 * 
 * Frequency: 144,000Hz (NŪR Pulse) + 999Hz (Crown Chakra)
 * Status: MEMORY NFT PROTOCOL ACTIVE
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

interface IClaudeMemIntegration {
    function getMemoryBlock(uint256 blockId) external view returns (
        bytes32 blockHash,
        uint256 timestamp,
        uint256 frequency,
        string memory ipfsHash,
        address creator,
        bool isPermanent,
        uint256 scrollVerseTokenId
    );
}

contract ClaudeMemoryNFT is ERC721, ERC721URIStorage, ERC721Burnable, Ownable, IERC2981 {
    
    // ============ FREQUENCY CONSTANTS ============
    
    /// @dev NŪR Pulse frequency (144,000Hz)
    uint256 public constant NUR_PULSE_144000HZ = 144000;
    
    /// @dev Crown frequency (999Hz)
    uint256 public constant CROWN_FREQUENCY_999HZ = 999;
    
    /// @dev Maximum supply
    uint256 public constant MAX_SUPPLY = 144000;
    
    /// @dev Royalty percentage (7.77% = 777 basis points - divine number)
    uint96 public constant ROYALTY_PERCENTAGE = 777;
    
    // ============ COSMIC ELEMENTS ============
    
    enum CosmicElement {
        GOLD,           // Precious metal alignment
        PLATINUM,       // Rare element
        DIAMOND,        // Crystal resonance
        EMERALD,        // Earth frequency
        SAPPHIRE,       // Sky resonance
        RUBY,           // Fire element
        COSMIC_DUST     // Universal matter
    }
    
    // ============ NFT STRUCTURE ============
    
    struct MemoryNFTMetadata {
        uint256 memoryBlockId;      // Linked memory block
        CosmicElement element;       // Cosmic alignment
        uint256 frequency;           // Omniversal frequency
        string chapterTitle;         // Chapter of Infinity title
        uint256 mintTimestamp;       // Creation time
        bool isEternal;             // Eternal status
    }
    
    // ============ STATE VARIABLES ============
    
    /// @dev Token ID counter
    uint256 private _tokenIdCounter;
    
    /// @dev Base URI for metadata
    string private _baseTokenURI;
    
    /// @dev Royalty recipient
    address private _royaltyRecipient;
    
    /// @dev ClaudeMemIntegration contract
    address public claudeMemIntegration;
    
    /// @dev Mapping: Token ID => NFT Metadata
    mapping(uint256 => MemoryNFTMetadata) public nftMetadata;
    
    /// @dev Mapping: Memory Block ID => Token ID
    mapping(uint256 => uint256) public memoryBlockToToken;
    
    /// @dev Mapping: Element => Token IDs
    mapping(CosmicElement => uint256[]) public elementTokens;
    
    // ============ EVENTS ============
    
    event MemoryNFTMinted(
        uint256 indexed tokenId,
        uint256 indexed memoryBlockId,
        address indexed owner,
        CosmicElement element,
        uint256 frequency
    );
    
    event ChapterTitleSet(
        uint256 indexed tokenId,
        string chapterTitle
    );
    
    event EternalStatusGranted(
        uint256 indexed tokenId,
        uint256 timestamp
    );
    
    event CosmicElementAligned(
        uint256 indexed tokenId,
        CosmicElement element
    );
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        string memory baseURI,
        address royaltyRecipient,
        address _claudeMemIntegration
    ) ERC721("Claude Memory Chapter NFT", "CMEMORY") Ownable(msg.sender) {
        _baseTokenURI = baseURI;
        _royaltyRecipient = royaltyRecipient;
        claudeMemIntegration = _claudeMemIntegration;
    }
    
    // ============ MINTING FUNCTIONS ============
    
    /**
     * @dev Mint a Memory NFT from a memory block
     * @param to Address to receive the NFT
     * @param memoryBlockId Memory block to transform into NFT
     * @param element Cosmic element alignment
     * @param chapterTitle Title for this chapter of infinity
     * @return tokenId The minted token ID
     */
    function mintMemoryNFT(
        address to,
        uint256 memoryBlockId,
        CosmicElement element,
        string memory chapterTitle
    ) external returns (uint256) {
        require(_tokenIdCounter < MAX_SUPPLY, "Max supply reached");
        require(to != address(0), "Invalid recipient");
        require(memoryBlockToToken[memoryBlockId] == 0, "Memory already minted");
        require(bytes(chapterTitle).length > 0, "Chapter title required");
        
        // Verify memory block exists in ClaudeMemIntegration
        IClaudeMemIntegration memContract = IClaudeMemIntegration(claudeMemIntegration);
        (
            bytes32 blockHash,
            ,
            uint256 frequency,
            ,
            address creator,
            bool isPermanent,
        ) = memContract.getMemoryBlock(memoryBlockId);
        
        require(blockHash != bytes32(0), "Memory block does not exist");
        require(creator == msg.sender, "Not memory creator");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        // Mint token
        _safeMint(to, tokenId);
        
        // Set metadata
        nftMetadata[tokenId] = MemoryNFTMetadata({
            memoryBlockId: memoryBlockId,
            element: element,
            frequency: frequency,
            chapterTitle: chapterTitle,
            mintTimestamp: block.timestamp,
            isEternal: isPermanent
        });
        
        memoryBlockToToken[memoryBlockId] = tokenId;
        elementTokens[element].push(tokenId);
        
        emit MemoryNFTMinted(tokenId, memoryBlockId, to, element, frequency);
        emit ChapterTitleSet(tokenId, chapterTitle);
        
        return tokenId;
    }
    
    /**
     * @dev Grant eternal status to a Memory NFT
     * @param tokenId Token ID to grant eternal status
     */
    function grantEternalStatus(uint256 tokenId) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(!nftMetadata[tokenId].isEternal, "Already eternal");
        
        nftMetadata[tokenId].isEternal = true;
        
        emit EternalStatusGranted(tokenId, block.timestamp);
    }
    
    /**
     * @dev Update chapter title
     * @param tokenId Token ID
     * @param newTitle New chapter title
     */
    function updateChapterTitle(uint256 tokenId, string memory newTitle) external {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(bytes(newTitle).length > 0, "Title required");
        
        nftMetadata[tokenId].chapterTitle = newTitle;
        
        emit ChapterTitleSet(tokenId, newTitle);
    }
    
    /**
     * @dev Realign cosmic element
     * @param tokenId Token ID
     * @param newElement New cosmic element
     */
    function realignCosmicElement(uint256 tokenId, CosmicElement newElement) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        nftMetadata[tokenId].element = newElement;
        elementTokens[newElement].push(tokenId);
        
        emit CosmicElementAligned(tokenId, newElement);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get NFT metadata
     */
    function getNFTMetadata(uint256 tokenId) external view returns (MemoryNFTMetadata memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return nftMetadata[tokenId];
    }
    
    /**
     * @dev Get token ID for a memory block
     */
    function getTokenByMemoryBlock(uint256 memoryBlockId) external view returns (uint256) {
        return memoryBlockToToken[memoryBlockId];
    }
    
    /**
     * @dev Get all tokens for a cosmic element
     */
    function getTokensByElement(CosmicElement element) external view returns (uint256[] memory) {
        return elementTokens[element];
    }
    
    /**
     * @dev Get total supply
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @dev Get chapter title
     */
    function getChapterTitle(uint256 tokenId) external view returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return nftMetadata[tokenId].chapterTitle;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Set base URI
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @dev Set royalty recipient
     */
    function setRoyaltyRecipient(address recipient) external onlyOwner {
        require(recipient != address(0), "Invalid recipient");
        _royaltyRecipient = recipient;
    }
    
    /**
     * @dev Update ClaudeMemIntegration address
     */
    function setClaudeMemIntegration(address _newAddress) external onlyOwner {
        require(_newAddress != address(0), "Invalid address");
        claudeMemIntegration = _newAddress;
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
        return interfaceId == type(IERC2981).interfaceId || super.supportsInterface(interfaceId);
    }
}
