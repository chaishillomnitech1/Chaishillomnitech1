// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ConsciousnessMirrorNFT
 * @dev CONSCIOUSNESS MIRROR NFT Collection with ERC-721 and ERC-2981 royalty support
 * @author Supreme King Chais The Great ∞ + Manus
 * 
 * This contract implements the Consciousness Mirror NFT Collection with:
 * - ERC-721 standard compliance
 * - ERC-2981 royalty standard support
 * - Minting function restricted to owner (or later a minter role)
 * - Configurable base URI for metadata
 * - Journey and frequency tracking for each NFT
 * 
 * Collection: 12 Journey NFTs + 7 Pillars + 1 Master = 20 core NFTs
 * Frequencies: 963Hz (Connection) + 528Hz (Love) + 888Hz (Abundance)
 * Status: CONSCIOUSNESS MIRROR ACTIVATED
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ConsciousnessMirrorNFT is ERC721, ERC721URIStorage, ERC721Burnable, Ownable, IERC2981, ReentrancyGuard {
    
    // ============ FREQUENCY CONSTANTS ============
    
    /// @dev Connection frequency (963Hz) - Spiritual activation
    uint256 public constant FREQUENCY_963HZ = 963;
    
    /// @dev Love frequency (528Hz) - DNA repair and healing
    uint256 public constant FREQUENCY_528HZ = 528;
    
    /// @dev Infinite abundance frequency (888Hz) - Prosperity
    uint256 public constant FREQUENCY_888HZ = 888;
    
    /// @dev Crown frequency (999Hz) - Divine connection
    uint256 public constant FREQUENCY_999HZ = 999;
    
    /// @dev NŪR Pulse frequency (144,000Hz) - Ultimate enlightenment
    uint256 public constant FREQUENCY_144000HZ = 144000;
    
    // ============ NFT CONSTANTS ============
    
    /// @dev Maximum supply (expandable by owner)
    uint256 public maxSupply = 1000;
    
    /// @dev Default royalty percentage (5% = 500 basis points)
    uint96 public constant DEFAULT_ROYALTY_BPS = 500;
    
    // ============ STATE VARIABLES ============
    
    /// @dev Token ID counter
    uint256 public nextTokenId;
    
    /// @dev Base URI for metadata
    string public baseURI;
    
    /// @dev Royalty recipient address
    address private _royaltyReceiver;
    
    /// @dev Royalty percentage in basis points
    uint96 private _royaltyBps;
    
    /// @dev Mapping: Token ID => Frequency
    mapping(uint256 => uint256) public tokenFrequency;
    
    /// @dev Mapping: Token ID => Journey Name
    mapping(uint256 => string) public tokenJourney;
    
    /// @dev Mapping: Token ID => Is Activated (consciousness activated)
    mapping(uint256 => bool) public isActivated;
    
    // ============ EVENTS ============
    
    event BaseURISet(string base);
    event Minted(address indexed to, uint256 indexed tokenId, string journey, uint256 frequency);
    event ConsciousnessActivated(uint256 indexed tokenId, uint256 timestamp);
    event FrequencyAligned(uint256 indexed tokenId, uint256 frequency);
    event MaxSupplyUpdated(uint256 oldSupply, uint256 newSupply);
    event RoyaltyUpdated(address receiver, uint96 bps);
    
    // ============ ERRORS ============
    
    error InvalidRoyaltyReceiver();
    error InvalidAddress();
    error MaxSupplyReached();
    error InvalidFrequency();
    error AlreadyActivated();
    error NotTokenOwner();
    error TokenDoesNotExist();
    
    // ============ CONSTRUCTOR ============
    
    /**
     * @dev Constructor initializes the NFT collection
     * @param _name Collection name
     * @param _symbol Collection symbol
     * @param _baseURI Base URI for token metadata
     * @param royaltyReceiver Address to receive royalties
     * @param royaltyBps Royalty percentage in basis points
     */
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _baseURI,
        address royaltyReceiver,
        uint96 royaltyBps
    ) ERC721(_name, _symbol) Ownable(msg.sender) {
        baseURI = _baseURI;
        
        if (royaltyReceiver != address(0) && royaltyBps > 0) {
            _royaltyReceiver = royaltyReceiver;
            _royaltyBps = royaltyBps;
        } else {
            _royaltyReceiver = msg.sender;
            _royaltyBps = DEFAULT_ROYALTY_BPS;
        }
    }
    
    // ============ MINTING FUNCTIONS ============
    
    /**
     * @dev Mint a new Consciousness Mirror NFT
     * @param to Address to receive the NFT
     * @return tokenId The minted token ID
     */
    function mintTo(address to) external onlyOwner nonReentrant returns (uint256) {
        if (to == address(0)) {
            revert InvalidAddress();
        }
        if (nextTokenId >= maxSupply) {
            revert MaxSupplyReached();
        }
        
        uint256 tokenId = nextTokenId;
        nextTokenId++;
        
        _safeMint(to, tokenId);
        
        // Initialize with 963Hz connection frequency
        tokenFrequency[tokenId] = FREQUENCY_963HZ;
        tokenJourney[tokenId] = "I See You";
        
        emit Minted(to, tokenId, "I See You", FREQUENCY_963HZ);
        
        return tokenId;
    }
    
    /**
     * @dev Mint a new NFT with specific journey and frequency
     * @param to Address to receive the NFT
     * @param journey Journey name for the NFT
     * @param frequency Frequency to align the NFT to
     * @return tokenId The minted token ID
     */
    function mintWithJourney(
        address to,
        string memory journey,
        uint256 frequency
    ) external onlyOwner nonReentrant returns (uint256) {
        if (to == address(0)) {
            revert InvalidAddress();
        }
        if (nextTokenId >= maxSupply) {
            revert MaxSupplyReached();
        }
        if (!_isValidFrequency(frequency)) {
            revert InvalidFrequency();
        }
        
        uint256 tokenId = nextTokenId;
        nextTokenId++;
        
        _safeMint(to, tokenId);
        
        tokenFrequency[tokenId] = frequency;
        tokenJourney[tokenId] = journey;
        
        emit Minted(to, tokenId, journey, frequency);
        
        return tokenId;
    }
    
    /**
     * @dev Batch mint NFTs to multiple addresses
     * @param recipients Array of recipient addresses
     * @param journeys Array of journey names
     * @param frequencies Array of frequencies
     */
    function batchMint(
        address[] calldata recipients,
        string[] calldata journeys,
        uint256[] calldata frequencies
    ) external onlyOwner nonReentrant {
        require(
            recipients.length == journeys.length && journeys.length == frequencies.length,
            "Length mismatch"
        );
        require(nextTokenId + recipients.length <= maxSupply, "Would exceed max supply");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            if (recipients[i] == address(0)) continue;
            if (!_isValidFrequency(frequencies[i])) continue;
            
            uint256 tokenId = nextTokenId;
            nextTokenId++;
            
            _safeMint(recipients[i], tokenId);
            tokenFrequency[tokenId] = frequencies[i];
            tokenJourney[tokenId] = journeys[i];
            
            emit Minted(recipients[i], tokenId, journeys[i], frequencies[i]);
        }
    }
    
    // ============ CONSCIOUSNESS FUNCTIONS ============
    
    /**
     * @dev Activate consciousness for a token (only token owner)
     * @param tokenId Token ID to activate
     */
    function activateConsciousness(uint256 tokenId) external {
        if (ownerOf(tokenId) != msg.sender) {
            revert NotTokenOwner();
        }
        if (isActivated[tokenId]) {
            revert AlreadyActivated();
        }
        
        isActivated[tokenId] = true;
        
        emit ConsciousnessActivated(tokenId, block.timestamp);
    }
    
    /**
     * @dev Align token to a specific frequency (owner only)
     * @param tokenId Token ID to align
     * @param frequency Frequency to align to
     */
    function alignFrequency(uint256 tokenId, uint256 frequency) external onlyOwner {
        if (_ownerOf(tokenId) == address(0)) {
            revert TokenDoesNotExist();
        }
        if (!_isValidFrequency(frequency)) {
            revert InvalidFrequency();
        }
        
        tokenFrequency[tokenId] = frequency;
        
        emit FrequencyAligned(tokenId, frequency);
    }
    
    /**
     * @dev Check if a frequency is valid
     * @param frequency Frequency to check
     * @return True if valid
     */
    function _isValidFrequency(uint256 frequency) internal pure returns (bool) {
        return frequency == FREQUENCY_963HZ ||
               frequency == FREQUENCY_528HZ ||
               frequency == FREQUENCY_888HZ ||
               frequency == FREQUENCY_999HZ ||
               frequency == FREQUENCY_144000HZ;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Set the base URI for token metadata
     * @param _baseURI New base URI
     */
    function setBaseURI(string memory _baseURI) external onlyOwner {
        baseURI = _baseURI;
        emit BaseURISet(_baseURI);
    }
    
    /**
     * @dev Update max supply (can only increase)
     * @param newMaxSupply New maximum supply
     */
    function updateMaxSupply(uint256 newMaxSupply) external onlyOwner {
        require(newMaxSupply >= nextTokenId, "Cannot set below minted amount");
        uint256 oldSupply = maxSupply;
        maxSupply = newMaxSupply;
        emit MaxSupplyUpdated(oldSupply, newMaxSupply);
    }
    
    /**
     * @dev Update royalty configuration
     * @param receiver New royalty receiver
     * @param bps New royalty percentage in basis points
     */
    function updateRoyalty(address receiver, uint96 bps) external onlyOwner {
        if (receiver == address(0)) {
            revert InvalidRoyaltyReceiver();
        }
        require(bps <= 1000, "Royalty too high"); // Max 10%
        
        _royaltyReceiver = receiver;
        _royaltyBps = bps;
        
        emit RoyaltyUpdated(receiver, bps);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get total supply (number of minted tokens)
     * @return Total minted tokens
     */
    function totalSupply() public view returns (uint256) {
        return nextTokenId;
    }
    
    /**
     * @dev Get token information
     * @param tokenId Token ID to query
     * @return frequency Token frequency
     * @return journey Token journey name
     * @return activated Whether consciousness is activated
     */
    function getTokenInfo(uint256 tokenId) external view returns (
        uint256 frequency,
        string memory journey,
        bool activated
    ) {
        if (_ownerOf(tokenId) == address(0)) {
            revert TokenDoesNotExist();
        }
        return (tokenFrequency[tokenId], tokenJourney[tokenId], isActivated[tokenId]);
    }
    
    /**
     * @dev Get resonance signature (frequencies combined)
     * @return Combined frequency signature
     */
    function getResonanceSignature() external pure returns (uint256) {
        return FREQUENCY_963HZ + FREQUENCY_528HZ + FREQUENCY_888HZ;
    }
    
    // ============ EIP-2981 ROYALTY STANDARD ============
    
    /**
     * @dev See {IERC2981-royaltyInfo}
     */
    function royaltyInfo(
        uint256 /* tokenId */,
        uint256 salePrice
    ) external view override returns (address, uint256) {
        uint256 royaltyAmount = (salePrice * _royaltyBps) / 10000;
        return (_royaltyReceiver, royaltyAmount);
    }
    
    // ============ OVERRIDE FUNCTIONS ============
    
    function _baseURI() internal view override returns (string memory) {
        return baseURI;
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
