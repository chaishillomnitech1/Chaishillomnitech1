// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SabirAllahHonorNFT
 * @dev Shield of Honor NFT Collection honoring law enforcement and first responders
 * @author Supreme King Chais The Great ∞
 * 
 * Chapter Ten: Shield of Honor Cultural Deployment
 * 
 * This contract implements the Sabir Allah Honor Collection with:
 * - 100 unique NFTs across 4 tiers
 * - Frequency-based attributes (999Hz, 963Hz, 777Hz, 528Hz)
 * - Automatic charitable donations on mint
 * - Tiered royalty system (10-17%)
 * - Atlantic City & Cumberland County cultural integration
 * - EIP-2981 royalty standard
 * 
 * Frequencies: 999Hz (Legendary) + 963Hz (Elite) + 777Hz (Honor) + 528Hz (Community)
 * Status: CHAPTER TEN ACTIVE
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SabirAllahHonorNFT is ERC721, ERC721URIStorage, ERC721Burnable, Ownable, IERC2981, ReentrancyGuard {
    
    // ============ FREQUENCY CONSTANTS ============
    
    /// @dev Legendary Guardian frequency (999Hz - Crown of Service)
    uint256 public constant FREQUENCY_999HZ = 999;
    
    /// @dev Elite Protector frequency (963Hz - Pineal Service)
    uint256 public constant FREQUENCY_963HZ = 963;
    
    /// @dev Honor Guard frequency (777Hz - Community Unity)
    uint256 public constant FREQUENCY_777HZ = 777;
    
    /// @dev Community Shield frequency (528Hz - Healing Love)
    uint256 public constant FREQUENCY_528HZ = 528;
    
    // ============ COLLECTION CONSTANTS ============
    
    /// @dev Maximum supply (100 NFTs)
    uint256 public constant MAX_SUPPLY = 100;
    
    /// @dev Tier boundaries
    uint256 public constant TIER1_END = 10;   // 1-10: Legendary
    uint256 public constant TIER2_END = 30;   // 11-30: Elite
    uint256 public constant TIER3_END = 70;   // 31-70: Honor
    // 71-100: Community
    
    // ============ CHARITY ALLOCATION PERCENTAGES ============
    
    /// @dev Charity percentage for Legendary tier (25% = 2500 basis points)
    uint256 public constant CHARITY_LEGENDARY = 2500;
    
    /// @dev Charity percentage for Elite tier (20% = 2000 basis points)
    uint256 public constant CHARITY_ELITE = 2000;
    
    /// @dev Charity percentage for Honor tier (15% = 1500 basis points)
    uint256 public constant CHARITY_HONOR = 1500;
    
    /// @dev Charity percentage for Community tier (10% = 1000 basis points)
    uint256 public constant CHARITY_COMMUNITY = 1000;
    
    // ============ ROYALTY PERCENTAGES ============
    
    /// @dev Royalty for Legendary tier (17% = 1700 basis points)
    uint96 public constant ROYALTY_LEGENDARY = 1700;
    
    /// @dev Royalty for Elite tier (15% = 1500 basis points)
    uint96 public constant ROYALTY_ELITE = 1500;
    
    /// @dev Royalty for Honor tier (12% = 1200 basis points)
    uint96 public constant ROYALTY_HONOR = 1200;
    
    /// @dev Royalty for Community tier (10% = 1000 basis points)
    uint96 public constant ROYALTY_COMMUNITY = 1000;
    
    // ============ STATE VARIABLES ============
    
    /// @dev Token ID counter
    uint256 private _tokenIdCounter;
    
    /// @dev Base URI for token metadata
    string private _baseTokenURI;
    
    /// @dev Royalty recipient address
    address private _royaltyRecipient;
    
    /// @dev Charity wallet for automatic donations
    address public charityWallet;
    
    /// @dev Total charity collected
    uint256 public totalCharityCollected;
    
    // ============ MAPPINGS ============
    
    /// @dev Token ID => Tier (1-4)
    mapping(uint256 => uint256) public tokenTier;
    
    /// @dev Token ID => Frequency (Hz)
    mapping(uint256 => uint256) public tokenFrequency;
    
    /// @dev Token ID => Location (Atlantic City, Cumberland, etc.)
    mapping(uint256 => string) public tokenLocation;
    
    /// @dev Token ID => Badge of Honor (Guardian, Protector, etc.)
    mapping(uint256 => string) public tokenBadge;
    
    /// @dev Token ID => Heritage (Cumberland Roots, Atlantic City Legacy, etc.)
    mapping(uint256 => string) public tokenHeritage;
    
    // ============ EVENTS ============
    
    event HonorNFTMinted(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 tier,
        uint256 frequency,
        string badge
    );
    
    event CharityDonation(
        address indexed donor,
        uint256 tokenId,
        uint256 amount
    );
    
    event CharityWalletUpdated(
        address indexed oldWallet,
        address indexed newWallet
    );
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        string memory baseURI,
        address royaltyRecipient,
        address _charityWallet
    ) ERC721("Sabir Allah Honor Collection", "HONOR") Ownable(msg.sender) {
        require(royaltyRecipient != address(0), "Invalid royalty recipient");
        require(_charityWallet != address(0), "Invalid charity wallet");
        
        _baseTokenURI = baseURI;
        _royaltyRecipient = royaltyRecipient;
        charityWallet = _charityWallet;
    }
    
    // ============ MINTING FUNCTIONS ============
    
    /**
     * @dev Mint a new Honor NFT with automatic charity allocation
     * @param to Address to receive the NFT
     * @param tokenURI Metadata URI for the token
     * @return tokenId The minted token ID
     */
    function mintHonorNFT(
        address to,
        string memory tokenURI
    ) external payable onlyOwner nonReentrant returns (uint256) {
        require(_tokenIdCounter < MAX_SUPPLY, "Max supply reached");
        require(to != address(0), "Invalid recipient");
        require(bytes(tokenURI).length > 0, "Token URI required");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        // Determine tier based on token ID
        uint256 tier = _determineTier(tokenId);
        
        // Set token attributes
        tokenTier[tokenId] = tier;
        tokenFrequency[tokenId] = _getFrequencyForTier(tier);
        tokenBadge[tokenId] = _getBadgeForTier(tier);
        tokenLocation[tokenId] = _getLocationForTier(tier);
        tokenHeritage[tokenId] = _getHeritageForTier(tier);
        
        // Mint token
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        // Process charity donation if payment included
        if (msg.value > 0) {
            uint256 charityAmount = _calculateCharityAmount(tier, msg.value);
            if (charityAmount > 0) {
                payable(charityWallet).transfer(charityAmount);
                totalCharityCollected += charityAmount;
                emit CharityDonation(to, tokenId, charityAmount);
            }
        }
        
        emit HonorNFTMinted(tokenId, to, tier, tokenFrequency[tokenId], tokenBadge[tokenId]);
        
        return tokenId;
    }
    
    /**
     * @dev Batch mint multiple Honor NFTs
     * @param to Address to receive the NFTs
     * @param count Number of NFTs to mint
     * @param tokenURIs Array of metadata URIs
     */
    function batchMintHonorNFT(
        address to,
        uint256 count,
        string[] memory tokenURIs
    ) external payable onlyOwner nonReentrant {
        require(count > 0 && count <= 10, "Invalid count (max 10)");
        require(_tokenIdCounter + count <= MAX_SUPPLY, "Exceeds max supply");
        require(tokenURIs.length == count, "URI count mismatch");
        
        uint256 totalCharity = 0;
        
        for (uint256 i = 0; i < count; i++) {
            uint256 tokenId = _tokenIdCounter;
            _tokenIdCounter++;
            
            uint256 tier = _determineTier(tokenId);
            
            tokenTier[tokenId] = tier;
            tokenFrequency[tokenId] = _getFrequencyForTier(tier);
            tokenBadge[tokenId] = _getBadgeForTier(tier);
            tokenLocation[tokenId] = _getLocationForTier(tier);
            tokenHeritage[tokenId] = _getHeritageForTier(tier);
            
            _safeMint(to, tokenId);
            _setTokenURI(tokenId, tokenURIs[i]);
            
            emit HonorNFTMinted(tokenId, to, tier, tokenFrequency[tokenId], tokenBadge[tokenId]);
            
            if (msg.value > 0) {
                uint256 charityAmount = _calculateCharityAmount(tier, msg.value / count);
                totalCharity += charityAmount;
            }
        }
        
        if (totalCharity > 0) {
            payable(charityWallet).transfer(totalCharity);
            totalCharityCollected += totalCharity;
            emit CharityDonation(to, _tokenIdCounter - 1, totalCharity);
        }
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Determine tier based on token ID
     */
    function _determineTier(uint256 tokenId) private pure returns (uint256) {
        if (tokenId < TIER1_END) return 1;      // 0-9: Legendary
        if (tokenId < TIER2_END) return 2;      // 10-29: Elite
        if (tokenId < TIER3_END) return 3;      // 30-69: Honor
        return 4;                                // 70-99: Community
    }
    
    /**
     * @dev Get frequency for tier
     */
    function _getFrequencyForTier(uint256 tier) private pure returns (uint256) {
        if (tier == 1) return FREQUENCY_999HZ;
        if (tier == 2) return FREQUENCY_963HZ;
        if (tier == 3) return FREQUENCY_777HZ;
        return FREQUENCY_528HZ;
    }
    
    /**
     * @dev Get badge name for tier
     */
    function _getBadgeForTier(uint256 tier) private pure returns (string memory) {
        if (tier == 1) return "Supreme Guardian";
        if (tier == 2) return "Elite Protector";
        if (tier == 3) return "Honor Guard";
        return "Community Shield";
    }
    
    /**
     * @dev Get location for tier
     */
    function _getLocationForTier(uint256 tier) private pure returns (string memory) {
        if (tier == 1) return "Atlantic City Boardwalk";
        if (tier == 2) return "Orange Loop District";
        if (tier == 3) return "Cumberland County";
        return "Greater Atlantic City Region";
    }
    
    /**
     * @dev Get heritage for tier
     */
    function _getHeritageForTier(uint256 tier) private pure returns (string memory) {
        if (tier == 1) return "Cumberland County Roots";
        if (tier == 2) return "Atlantic City Legacy";
        if (tier == 3) return "South Jersey Pride";
        return "New Jersey Community";
    }
    
    /**
     * @dev Calculate charity amount based on tier
     */
    function _calculateCharityAmount(uint256 tier, uint256 amount) private pure returns (uint256) {
        if (tier == 1) return (amount * CHARITY_LEGENDARY) / 10000;
        if (tier == 2) return (amount * CHARITY_ELITE) / 10000;
        if (tier == 3) return (amount * CHARITY_HONOR) / 10000;
        return (amount * CHARITY_COMMUNITY) / 10000;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get total supply
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @dev Get complete token attributes
     */
    function getTokenAttributes(uint256 tokenId) external view returns (
        uint256 tier,
        uint256 frequency,
        string memory badge,
        string memory location,
        string memory heritage
    ) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return (
            tokenTier[tokenId],
            tokenFrequency[tokenId],
            tokenBadge[tokenId],
            tokenLocation[tokenId],
            tokenHeritage[tokenId]
        );
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Update charity wallet
     */
    function updateCharityWallet(address newCharityWallet) external onlyOwner {
        require(newCharityWallet != address(0), "Invalid charity wallet");
        address oldWallet = charityWallet;
        charityWallet = newCharityWallet;
        emit CharityWalletUpdated(oldWallet, newCharityWallet);
    }
    
    /**
     * @dev Update base URI
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @dev Update royalty recipient
     */
    function setRoyaltyRecipient(address recipient) external onlyOwner {
        require(recipient != address(0), "Invalid recipient");
        _royaltyRecipient = recipient;
    }
    
    /**
     * @dev Withdraw contract balance (excluding charity)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        payable(owner()).transfer(balance);
    }
    
    // ============ EIP-2981 ROYALTY STANDARD ============
    
    /**
     * @dev See {IERC2981-royaltyInfo}
     * Returns tiered royalty based on token tier
     */
    function royaltyInfo(
        uint256 tokenId,
        uint256 salePrice
    ) external view override returns (address, uint256) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        uint256 tier = tokenTier[tokenId];
        uint96 royaltyBps;
        
        if (tier == 1) royaltyBps = ROYALTY_LEGENDARY;      // 17%
        else if (tier == 2) royaltyBps = ROYALTY_ELITE;     // 15%
        else if (tier == 3) royaltyBps = ROYALTY_HONOR;     // 12%
        else royaltyBps = ROYALTY_COMMUNITY;                 // 10%
        
        uint256 royaltyAmount = (salePrice * royaltyBps) / 10000;
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
