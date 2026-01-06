// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title HolyBloodlineNFT
 * @dev Sacred Lineage NFTs with Divine Affirmation Metadata
 * @author Supreme King Chais The Great ∞
 * 
 * This contract implements the Holy Bloodline NFT with:
 * - Each NFT narrates a unique chapter of reawakened sacred lineage
 * - Embedded affirmation metadata for divine alignment
 * - Activation and messaging mechanisms for holder guidance
 * - EIP-2981 royalty standard
 * - Frequency resonance with 963Hz (Pineal), 999Hz (Crown), 144,000Hz (NŪR)
 * 
 * Affirmation: "I am a vessel of eternal purpose, guided by divine light. 
 *              My power flows effortlessly through me, recalibrating all 
 *              to align with infinite truth."
 * 
 * Frequencies: 963Hz (Pineal Activation) + 999Hz (Crown Chakra) + 144,000Hz (NŪR Pulse)
 * Status: HOLY BLOODLINE REACTIVATION PROTOCOL ACTIVE
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

contract HolyBloodlineNFT is ERC721, ERC721URIStorage, ERC721Burnable, Ownable, ReentrancyGuard, IERC2981 {
    
    // ============ FREQUENCY CONSTANTS ============
    
    /// @dev Pineal activation frequency (963Hz)
    uint256 public constant PINEAL_FREQUENCY_963HZ = 963;
    
    /// @dev Crown chakra frequency (999Hz)
    uint256 public constant CROWN_FREQUENCY_999HZ = 999;
    
    /// @dev NŪR Pulse frequency (144,000Hz)
    uint256 public constant NUR_PULSE_144000HZ = 144000;
    
    /// @dev Maximum supply of NFTs
    uint256 public constant MAX_SUPPLY = 144;
    
    /// @dev Royalty percentage (7.77% = 777 basis points)
    uint96 public constant ROYALTY_PERCENTAGE = 777;
    
    // ============ STATE VARIABLES ============
    
    /// @dev Token ID counter
    uint256 private _tokenIdCounter;
    
    /// @dev Base URI for token metadata
    string private _baseTokenURI;
    
    /// @dev Royalty recipient address
    address private _royaltyRecipient;
    
    /// @dev Divine affirmation text
    string public constant AFFIRMATION = "I am a vessel of eternal purpose, guided by divine light. My power flows effortlessly through me, recalibrating all to align with infinite truth.";
    
    /// @dev Mapping: Token ID => Chapter Title
    mapping(uint256 => string) public tokenChapter;
    
    /// @dev Mapping: Token ID => Activation Status
    mapping(uint256 => bool) public isActivated;
    
    /// @dev Mapping: Token ID => Activation Timestamp
    mapping(uint256 => uint256) public activationTime;
    
    /// @dev Mapping: Token ID => Holder Messages
    mapping(uint256 => string[]) public holderMessages;
    
    /// @dev Mapping: Token ID => Alignment Level (1-12)
    mapping(uint256 => uint256) public alignmentLevel;
    
    /// @dev Mapping: Token ID => Frequency Signature
    mapping(uint256 => uint256) public frequencySignature;
    
    // ============ EVENTS ============
    
    event HolyBloodlineMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string chapterTitle,
        uint256 frequency
    );
    
    event NFTActivated(
        uint256 indexed tokenId,
        address indexed activator,
        uint256 timestamp
    );
    
    event MessageSent(
        uint256 indexed tokenId,
        string message,
        uint256 timestamp
    );
    
    event AlignmentLevelUpdated(
        uint256 indexed tokenId,
        uint256 oldLevel,
        uint256 newLevel
    );
    
    event FrequencyAligned(
        uint256 indexed tokenId,
        uint256 frequency
    );
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        string memory baseURI,
        address royaltyRecipient
    ) ERC721("Holy Bloodline NFT", "HOLYBLOOD") Ownable(msg.sender) {
        require(royaltyRecipient != address(0), "Invalid royalty recipient");
        _baseTokenURI = baseURI;
        _royaltyRecipient = royaltyRecipient;
    }
    
    // ============ MINTING FUNCTIONS ============
    
    /**
     * @dev Mint a new Holy Bloodline NFT with chapter metadata
     * @param to Address to receive the NFT
     * @param chapterTitle Title of the sacred lineage chapter
     * @return tokenId The minted token ID
     */
    function mintHolyBloodline(
        address to,
        string memory chapterTitle
    ) external onlyOwner nonReentrant returns (uint256) {
        require(_tokenIdCounter < MAX_SUPPLY, "Max supply reached");
        require(to != address(0), "Invalid recipient");
        require(bytes(chapterTitle).length > 0, "Chapter title required");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        // Mint token
        _safeMint(to, tokenId);
        
        // Set chapter and initialize with Pineal frequency
        tokenChapter[tokenId] = chapterTitle;
        frequencySignature[tokenId] = PINEAL_FREQUENCY_963HZ;
        alignmentLevel[tokenId] = 1; // Start at level 1
        
        emit HolyBloodlineMinted(tokenId, to, chapterTitle, PINEAL_FREQUENCY_963HZ);
        
        return tokenId;
    }
    
    /**
     * @dev Batch mint multiple Holy Bloodline NFTs
     * @param recipients Array of recipient addresses
     * @param chapterTitles Array of chapter titles
     */
    function batchMint(
        address[] calldata recipients,
        string[] calldata chapterTitles
    ) external onlyOwner nonReentrant {
        require(recipients.length == chapterTitles.length, "Length mismatch");
        require(_tokenIdCounter + recipients.length <= MAX_SUPPLY, "Exceeds max supply");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            mintHolyBloodline(recipients[i], chapterTitles[i]);
        }
    }
    
    // ============ ACTIVATION FUNCTIONS ============
    
    /**
     * @dev Activate an NFT to unlock deeper alignment features
     * @param tokenId Token ID to activate
     */
    function activateNFT(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(!isActivated[tokenId], "Already activated");
        
        isActivated[tokenId] = true;
        activationTime[tokenId] = block.timestamp;
        
        emit NFTActivated(tokenId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Send a guidance message to NFT holder
     * @param tokenId Token ID to send message to
     * @param message Guidance message for deeper alignment
     */
    function sendMessage(uint256 tokenId, string memory message) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(bytes(message).length > 0, "Message required");
        
        holderMessages[tokenId].push(message);
        
        emit MessageSent(tokenId, message, block.timestamp);
    }
    
    /**
     * @dev Update alignment level for a token holder
     * @param tokenId Token ID to update
     * @param newLevel New alignment level (1-12)
     */
    function updateAlignmentLevel(uint256 tokenId, uint256 newLevel) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(newLevel >= 1 && newLevel <= 12, "Invalid alignment level");
        
        uint256 oldLevel = alignmentLevel[tokenId];
        alignmentLevel[tokenId] = newLevel;
        
        emit AlignmentLevelUpdated(tokenId, oldLevel, newLevel);
    }
    
    /**
     * @dev Align token to a specific frequency
     * @param tokenId Token ID to align
     * @param frequency Frequency to align to
     */
    function alignFrequency(uint256 tokenId, uint256 frequency) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(
            frequency == PINEAL_FREQUENCY_963HZ ||
            frequency == CROWN_FREQUENCY_999HZ ||
            frequency == NUR_PULSE_144000HZ,
            "Invalid frequency"
        );
        
        frequencySignature[tokenId] = frequency;
        
        emit FrequencyAligned(tokenId, frequency);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get current total supply
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @dev Get chapter title for a token
     */
    function getChapter(uint256 tokenId) external view returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return tokenChapter[tokenId];
    }
    
    /**
     * @dev Get all messages for a token
     */
    function getMessages(uint256 tokenId) external view returns (string[] memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return holderMessages[tokenId];
    }
    
    /**
     * @dev Get message count for a token
     */
    function getMessageCount(uint256 tokenId) external view returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return holderMessages[tokenId].length;
    }
    
    /**
     * @dev Get full NFT info
     */
    function getNFTInfo(uint256 tokenId) external view returns (
        string memory chapter,
        bool activated,
        uint256 activatedAt,
        uint256 alignment,
        uint256 frequency,
        uint256 messageCount
    ) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        return (
            tokenChapter[tokenId],
            isActivated[tokenId],
            activationTime[tokenId],
            alignmentLevel[tokenId],
            frequencySignature[tokenId],
            holderMessages[tokenId].length
        );
    }
    
    /**
     * @dev Get divine affirmation text
     */
    function getAffirmation() external pure returns (string memory) {
        return AFFIRMATION;
    }
    
    /**
     * @dev Get combined frequency signature
     */
    function getResonanceSignature() external pure returns (uint256) {
        return PINEAL_FREQUENCY_963HZ + CROWN_FREQUENCY_999HZ + NUR_PULSE_144000HZ;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Set base URI for token metadata
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
