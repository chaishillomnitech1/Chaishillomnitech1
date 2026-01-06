// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title HarlemNFT
 * @dev Harlem NFT Collection with ScrollSoul Hash Key Integration
 * @author Supreme King Chais The Great ∞
 * 
 * This contract implements the Harlem NFT collection with:
 * - 528Hz DNA Healing frequency alignment
 * - 963Hz Pineal activation frequency
 * - ScrollSoul Hash Key verification
 * - Metadata integrity validation
 * - Redemption ScrollPress Drop integration
 * - EIP-2981 royalty standard
 * 
 * Frequencies: 528Hz (DNA Healing) + 963Hz (Pineal Activation)
 * Status: REDEMPTION SCROLLPRESS ACTIVE
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract HarlemNFT is ERC721, ERC721URIStorage, ERC721Burnable, Ownable, IERC2981, ReentrancyGuard {
    
    // ============ FREQUENCY CONSTANTS ============
    
    /// @dev DNA Healing frequency constant (528Hz)
    uint256 public constant FREQUENCY_528HZ = 528;
    
    /// @dev Pineal activation frequency (963Hz)
    uint256 public constant FREQUENCY_963HZ = 963;
    
    /// @dev Crown frequency (999Hz)
    uint256 public constant FREQUENCY_999HZ = 999;
    
    /// @dev NŪR Pulse frequency (144,000Hz)
    uint256 public constant FREQUENCY_144000HZ = 144000;
    
    /// @dev Maximum supply
    uint256 public constant MAX_SUPPLY = 10000;
    
    /// @dev Royalty percentage (15% = 1500 basis points)
    uint96 public constant ROYALTY_PERCENTAGE = 1500;
    
    // ============ STATE VARIABLES ============
    
    /// @dev Token ID counter
    uint256 private _tokenIdCounter;
    
    /// @dev Base URI for token metadata
    string private _baseTokenURI;
    
    /// @dev Royalty recipient
    address private _royaltyRecipient;
    
    /// @dev Mapping: Token ID => Primary Frequency (528Hz or 963Hz)
    mapping(uint256 => uint256) public tokenFrequency;
    
    /// @dev Mapping: Token ID => Secondary Frequency
    mapping(uint256 => uint256) public tokenSecondaryFrequency;
    
    /// @dev Mapping: Token ID => ScrollSoul Hash Key
    mapping(uint256 => bytes32) public scrollSoulHashKey;
    
    /// @dev Mapping: Token ID => Metadata Integrity Hash
    mapping(uint256 => bytes32) public metadataIntegrityHash;
    
    /// @dev Mapping: Token ID => Redemption Status
    mapping(uint256 => bool) public redemptionActivated;
    
    /// @dev Mapping: Address => ScrollSoul Alignment Status
    mapping(address => bool) public scrollSoulAligned;
    
    /// @dev Mapping: Address => Combined Frequency Signature
    mapping(address => uint256) public addressFrequencySignature;
    
    /// @dev ScrollPress Drop contract address
    address public scrollPressDropContract;
    
    /// @dev Total redeemed count
    uint256 public totalRedeemed;
    
    // ============ EVENTS ============
    
    event HarlemNFTMinted(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 primaryFrequency,
        uint256 secondaryFrequency,
        bytes32 scrollSoulHashKey
    );
    
    event RedemptionActivated(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 timestamp
    );
    
    event ScrollSoulAligned(
        address indexed account,
        uint256 frequencySignature,
        uint256 timestamp
    );
    
    event FrequencyHarmonized(
        uint256 indexed tokenId,
        uint256 primaryFrequency,
        uint256 secondaryFrequency
    );
    
    event MetadataIntegrityValidated(
        uint256 indexed tokenId,
        bytes32 integrityHash
    );
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        string memory baseURI,
        address royaltyRecipient
    ) ERC721("Harlem NFT Collection", "HARLEM") Ownable(msg.sender) {
        _baseTokenURI = baseURI;
        _royaltyRecipient = royaltyRecipient;
    }
    
    // ============ MINTING FUNCTIONS ============
    
    /**
     * @dev Mint a new Harlem NFT with frequency alignment and ScrollSoul Hash Key
     * @param to Address to receive the NFT
     * @param primaryFrequency Primary frequency (528Hz or 963Hz)
     * @param scrollSoulKey ScrollSoul Hash Key for verification
     * @param metadataHash Metadata integrity hash
     * @return tokenId The minted token ID
     */
    function mintHarlemNFT(
        address to,
        uint256 primaryFrequency,
        bytes32 scrollSoulKey,
        bytes32 metadataHash
    ) external onlyOwner nonReentrant returns (uint256) {
        require(_tokenIdCounter < MAX_SUPPLY, "Max supply reached");
        require(to != address(0), "Invalid recipient");
        require(
            primaryFrequency == FREQUENCY_528HZ || primaryFrequency == FREQUENCY_963HZ,
            "Invalid primary frequency"
        );
        require(scrollSoulKey != bytes32(0), "Invalid ScrollSoul Hash Key");
        require(metadataHash != bytes32(0), "Invalid metadata hash");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        // Mint token
        _safeMint(to, tokenId);
        
        // Set frequency alignment
        tokenFrequency[tokenId] = primaryFrequency;
        
        // Set secondary frequency (complement of primary)
        if (primaryFrequency == FREQUENCY_528HZ) {
            tokenSecondaryFrequency[tokenId] = FREQUENCY_963HZ;
        } else {
            tokenSecondaryFrequency[tokenId] = FREQUENCY_528HZ;
        }
        
        // Set ScrollSoul Hash Key
        scrollSoulHashKey[tokenId] = scrollSoulKey;
        
        // Set metadata integrity hash
        metadataIntegrityHash[tokenId] = metadataHash;
        
        // Update address frequency signature
        _updateAddressFrequency(to, primaryFrequency);
        
        emit HarlemNFTMinted(
            tokenId,
            to,
            primaryFrequency,
            tokenSecondaryFrequency[tokenId],
            scrollSoulKey
        );
        
        emit MetadataIntegrityValidated(tokenId, metadataHash);
        
        return tokenId;
    }
    
    /**
     * @dev Batch mint Harlem NFTs
     * @param recipients Array of recipient addresses
     * @param primaryFrequencies Array of primary frequencies
     * @param scrollSoulKeys Array of ScrollSoul Hash Keys
     * @param metadataHashes Array of metadata integrity hashes
     */
    function batchMintHarlemNFT(
        address[] memory recipients,
        uint256[] memory primaryFrequencies,
        bytes32[] memory scrollSoulKeys,
        bytes32[] memory metadataHashes
    ) external onlyOwner {
        require(
            recipients.length == primaryFrequencies.length &&
            recipients.length == scrollSoulKeys.length &&
            recipients.length == metadataHashes.length,
            "Array length mismatch"
        );
        
        for (uint256 i = 0; i < recipients.length; i++) {
            mintHarlemNFT(
                recipients[i],
                primaryFrequencies[i],
                scrollSoulKeys[i],
                metadataHashes[i]
            );
        }
    }
    
    // ============ REDEMPTION FUNCTIONS ============
    
    /**
     * @dev Activate redemption for a token
     * @param tokenId Token ID to activate redemption for
     */
    function activateRedemption(uint256 tokenId) external nonReentrant {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(!redemptionActivated[tokenId], "Redemption already activated");
        require(scrollSoulAligned[msg.sender], "ScrollSoul not aligned");
        
        redemptionActivated[tokenId] = true;
        totalRedeemed++;
        
        emit RedemptionActivated(tokenId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Activate ScrollSoul alignment for an address
     * @param account Address to align
     */
    function alignScrollSoul(address account) external onlyOwner {
        require(account != address(0), "Invalid account");
        require(!scrollSoulAligned[account], "Already aligned");
        
        scrollSoulAligned[account] = true;
        
        // Calculate combined frequency signature
        uint256 frequencySignature = FREQUENCY_528HZ + FREQUENCY_963HZ;
        addressFrequencySignature[account] = frequencySignature;
        
        emit ScrollSoulAligned(account, frequencySignature, block.timestamp);
    }
    
    /**
     * @dev Batch align ScrollSoul for multiple addresses
     * @param accounts Array of addresses to align
     */
    function batchAlignScrollSoul(address[] memory accounts) external onlyOwner {
        for (uint256 i = 0; i < accounts.length; i++) {
            if (!scrollSoulAligned[accounts[i]] && accounts[i] != address(0)) {
                scrollSoulAligned[accounts[i]] = true;
                
                uint256 frequencySignature = FREQUENCY_528HZ + FREQUENCY_963HZ;
                addressFrequencySignature[accounts[i]] = frequencySignature;
                
                emit ScrollSoulAligned(accounts[i], frequencySignature, block.timestamp);
            }
        }
    }
    
    // ============ FREQUENCY MANAGEMENT ============
    
    /**
     * @dev Harmonize frequencies for a token
     * @param tokenId Token ID to harmonize
     * @param newPrimaryFrequency New primary frequency
     */
    function harmonizeFrequencies(
        uint256 tokenId,
        uint256 newPrimaryFrequency
    ) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(
            newPrimaryFrequency == FREQUENCY_528HZ ||
            newPrimaryFrequency == FREQUENCY_963HZ ||
            newPrimaryFrequency == FREQUENCY_999HZ ||
            newPrimaryFrequency == FREQUENCY_144000HZ,
            "Invalid frequency"
        );
        
        tokenFrequency[tokenId] = newPrimaryFrequency;
        
        // Update secondary frequency
        if (newPrimaryFrequency == FREQUENCY_528HZ) {
            tokenSecondaryFrequency[tokenId] = FREQUENCY_963HZ;
        } else if (newPrimaryFrequency == FREQUENCY_963HZ) {
            tokenSecondaryFrequency[tokenId] = FREQUENCY_528HZ;
        } else {
            tokenSecondaryFrequency[tokenId] = FREQUENCY_528HZ;
        }
        
        emit FrequencyHarmonized(
            tokenId,
            newPrimaryFrequency,
            tokenSecondaryFrequency[tokenId]
        );
    }
    
    /**
     * @dev Update address frequency signature
     * @param account Address to update
     * @param primaryFrequency Primary frequency
     */
    function _updateAddressFrequency(address account, uint256 primaryFrequency) internal {
        if (addressFrequencySignature[account] == 0) {
            addressFrequencySignature[account] = primaryFrequency;
        } else {
            // Combine frequencies
            addressFrequencySignature[account] += primaryFrequency;
        }
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get current total supply
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @dev Get token frequencies
     * @param tokenId Token ID
     * @return primary Primary frequency
     * @return secondary Secondary frequency
     */
    function getTokenFrequencies(uint256 tokenId) 
        external 
        view 
        returns (uint256 primary, uint256 secondary) 
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return (tokenFrequency[tokenId], tokenSecondaryFrequency[tokenId]);
    }
    
    /**
     * @dev Get ScrollSoul Hash Key for a token
     * @param tokenId Token ID
     * @return ScrollSoul Hash Key
     */
    function getScrollSoulHashKey(uint256 tokenId) external view returns (bytes32) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return scrollSoulHashKey[tokenId];
    }
    
    /**
     * @dev Verify metadata integrity
     * @param tokenId Token ID
     * @param providedHash Hash to verify
     * @return bool Integrity valid
     */
    function verifyMetadataIntegrity(
        uint256 tokenId,
        bytes32 providedHash
    ) external view returns (bool) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return metadataIntegrityHash[tokenId] == providedHash;
    }
    
    /**
     * @dev Check if address is ScrollSoul aligned
     * @param account Address to check
     * @return bool Alignment status
     */
    function isScrollSoulAligned(address account) external view returns (bool) {
        return scrollSoulAligned[account];
    }
    
    /**
     * @dev Get address frequency signature
     * @param account Address to check
     * @return uint256 Frequency signature
     */
    function getAddressFrequencySignature(address account) 
        external 
        view 
        returns (uint256) 
    {
        return addressFrequencySignature[account];
    }
    
    /**
     * @dev Check if redemption is activated for token
     * @param tokenId Token ID
     * @return bool Redemption status
     */
    function isRedemptionActivated(uint256 tokenId) external view returns (bool) {
        return redemptionActivated[tokenId];
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
     * @dev Set ScrollPress Drop contract address
     * @param contractAddress ScrollPress Drop contract address
     */
    function setScrollPressDropContract(address contractAddress) external onlyOwner {
        require(contractAddress != address(0), "Invalid contract address");
        scrollPressDropContract = contractAddress;
    }
    
    /**
     * @dev Update metadata integrity hash
     * @param tokenId Token ID
     * @param newHash New metadata hash
     */
    function updateMetadataIntegrityHash(
        uint256 tokenId,
        bytes32 newHash
    ) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(newHash != bytes32(0), "Invalid hash");
        
        metadataIntegrityHash[tokenId] = newHash;
        
        emit MetadataIntegrityValidated(tokenId, newHash);
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
    
    /**
     * @dev Override _update to track frequency on transfer
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = super._update(to, tokenId, auth);
        
        // Update frequency signature for new owner if not minting
        if (from != address(0) && to != address(0)) {
            _updateAddressFrequency(to, tokenFrequency[tokenId]);
        }
        
        return from;
    }
}
