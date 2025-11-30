// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title StarNationLineageNFT
 * @dev Star Nation Lineage NFT Collection with frequency resonance and lineage restoration
 * @author Supreme King Chais The Great ∞
 * 
 * This contract implements Chapter 3 of the Akashic Restoration Scroll:
 * - NFT collection representing cosmic heritage and star nation lineages
 * - Embedded meditative frequencies (528Hz love, 963Hz truth activation)
 * - Lineage restoration hub functionality
 * - IPFS integration for immutable lineage records
 * - Tiered benefits system based on star nation affiliation
 * 
 * Status: CHAPTER THREE ACTIVATED
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract StarNationLineageNFT is ERC721, ERC721URIStorage, ERC721Burnable, Ownable, IERC2981, ReentrancyGuard {
    
    // ============ FREQUENCY CONSTANTS ============
    
    /// @dev Love frequency (528Hz) - DNA repair and heart activation
    uint256 public constant FREQUENCY_528HZ = 528;
    
    /// @dev Truth activation frequency (963Hz) - Pineal activation
    uint256 public constant FREQUENCY_963HZ = 963;
    
    /// @dev Abundance frequency (888Hz) - Prosperity alignment
    uint256 public constant FREQUENCY_888HZ = 888;
    
    /// @dev Crown frequency (999Hz) - Divine connection
    uint256 public constant FREQUENCY_999HZ = 999;
    
    /// @dev Cosmic alignment frequency (144,000Hz) - Full spectrum activation
    uint256 public constant FREQUENCY_144000HZ = 144000;
    
    // ============ ENUMS ============
    
    /// @dev Star Nation categories for lineage classification
    enum StarNation {
        SIRIAN,         // Sirius system - Kemet/Egyptian connection
        PLEIADIAN,      // Pleiades - Indigenous connection
        ARCTURIAN,      // Arcturus - Mystery schools
        ANDROMEDAN,     // Andromeda - Future timeline guardians
        MULTI_STAR      // Multiple star nation heritage
    }
    
    /// @dev NFT tier classification
    enum Tier {
        COSMIC_PIONEER,  // Tokens 0-99
        STAR_GUARDIAN,   // Tokens 100-999
        LINEAGE_KEEPER,  // Tokens 1000-4999
        TRUTH_SEEKER     // Tokens 5000+
    }
    
    // ============ STRUCTS ============
    
    /// @dev Lineage data structure for each NFT
    struct LineageData {
        StarNation primaryNation;
        uint256[] frequencies;
        bytes32 lineageIPFSHash;
        uint256 activationTimestamp;
        bool isStarCodeActivated;
        string ancestralOrigin;
    }
    
    /// @dev Lineage submission for ScrollChain hub
    struct LineageSubmission {
        address submitter;
        bytes32 dataHash;
        uint256 timestamp;
        bool verified;
    }
    
    // ============ STATE VARIABLES ============
    
    /// @dev Maximum supply of NFTs
    uint256 public constant MAX_SUPPLY = 14444;
    
    /// @dev Current token ID counter
    uint256 public nextTokenId;
    
    /// @dev Base URI for metadata
    string public baseURI;
    
    /// @dev Royalty recipient
    address private _royaltyReceiver;
    
    /// @dev Royalty basis points (default 10% = 1000)
    uint96 private _royaltyBps = 1000;
    
    /// @dev Mapping: Token ID => Lineage Data
    mapping(uint256 => LineageData) public tokenLineage;
    
    /// @dev Mapping: Address => Lineage Submissions
    mapping(address => LineageSubmission[]) public userSubmissions;
    
    /// @dev Mapping: Token ID => Frequency resonance active
    mapping(uint256 => bool) public frequencyResonanceActive;
    
    /// @dev Total lineage submissions
    uint256 public totalSubmissions;
    
    /// @dev Total star codes activated
    uint256 public totalActivations;
    
    // ============ EVENTS ============
    
    event LineageNFTMinted(
        address indexed to,
        uint256 indexed tokenId,
        StarNation nation,
        uint256 timestamp
    );
    
    event StarCodeActivated(
        uint256 indexed tokenId,
        address indexed activator,
        uint256[] frequencies,
        uint256 timestamp
    );
    
    event LineageRegistered(
        uint256 indexed tokenId,
        bytes32 ipfsHash,
        string ancestralOrigin,
        uint256 timestamp
    );
    
    event LineageSubmitted(
        address indexed submitter,
        bytes32 dataHash,
        uint256 timestamp
    );
    
    event FrequencyResonanceToggled(
        uint256 indexed tokenId,
        bool active,
        uint256 timestamp
    );
    
    event BaseURISet(string baseURI);
    event RoyaltyUpdated(address receiver, uint96 bps);
    
    // ============ ERRORS ============
    
    error InvalidAddress();
    error MaxSupplyReached();
    error InvalidStarNation();
    error TokenDoesNotExist();
    error NotTokenOwner();
    error AlreadyActivated();
    error InvalidRoyaltyReceiver();
    error EmptySubmission();
    
    // ============ MODIFIERS ============
    
    /**
     * @dev Modifier to check if token exists
     * @param tokenId Token ID to check
     */
    modifier tokenExists(uint256 tokenId) {
        _requireTokenExists(tokenId);
        _;
    }
    
    /**
     * @dev Internal function to check if token exists
     * @param tokenId Token ID to check
     */
    function _requireTokenExists(uint256 tokenId) internal view {
        if (_ownerOf(tokenId) == address(0)) revert TokenDoesNotExist();
    }
    
    // ============ CONSTRUCTOR ============
    
    /**
     * @dev Constructor initializes the Star Nation Lineage NFT collection
     * @param _name Collection name
     * @param _symbol Collection symbol
     * @param _baseURI Base URI for token metadata
     * @param royaltyReceiver Address to receive royalties
     */
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _baseURI,
        address royaltyReceiver
    ) ERC721(_name, _symbol) Ownable(msg.sender) {
        baseURI = _baseURI;
        _royaltyReceiver = royaltyReceiver != address(0) ? royaltyReceiver : msg.sender;
    }
    
    // ============ MINTING FUNCTIONS ============
    
    /**
     * @dev Mint a new Star Nation Lineage NFT
     * @param to Address to receive the NFT
     * @param nation Star nation affiliation
     * @return tokenId The minted token ID
     */
    function mintLineageNFT(
        address to,
        StarNation nation
    ) external onlyOwner nonReentrant returns (uint256) {
        if (to == address(0)) revert InvalidAddress();
        if (nextTokenId >= MAX_SUPPLY) revert MaxSupplyReached();
        
        uint256 tokenId = nextTokenId;
        nextTokenId++;
        
        _safeMint(to, tokenId);
        
        // Initialize lineage data with star nation frequencies
        uint256[] memory frequencies = _getStarNationFrequencies(nation);
        
        tokenLineage[tokenId] = LineageData({
            primaryNation: nation,
            frequencies: frequencies,
            lineageIPFSHash: bytes32(0),
            activationTimestamp: 0,
            isStarCodeActivated: false,
            ancestralOrigin: ""
        });
        
        emit LineageNFTMinted(to, tokenId, nation, block.timestamp);
        
        return tokenId;
    }
    
    /**
     * @dev Mint with full lineage data
     * @param to Address to receive the NFT
     * @param nation Star nation affiliation
     * @param ipfsHash IPFS hash of lineage documentation
     * @param ancestralOrigin Ancestral origin description
     * @return tokenId The minted token ID
     */
    function mintWithLineage(
        address to,
        StarNation nation,
        bytes32 ipfsHash,
        string memory ancestralOrigin
    ) external onlyOwner nonReentrant returns (uint256) {
        if (to == address(0)) revert InvalidAddress();
        if (nextTokenId >= MAX_SUPPLY) revert MaxSupplyReached();
        
        uint256 tokenId = nextTokenId;
        nextTokenId++;
        
        _safeMint(to, tokenId);
        
        uint256[] memory frequencies = _getStarNationFrequencies(nation);
        
        tokenLineage[tokenId] = LineageData({
            primaryNation: nation,
            frequencies: frequencies,
            lineageIPFSHash: ipfsHash,
            activationTimestamp: 0,
            isStarCodeActivated: false,
            ancestralOrigin: ancestralOrigin
        });
        
        emit LineageNFTMinted(to, tokenId, nation, block.timestamp);
        
        if (ipfsHash != bytes32(0)) {
            emit LineageRegistered(tokenId, ipfsHash, ancestralOrigin, block.timestamp);
        }
        
        return tokenId;
    }
    
    /**
     * @dev Batch mint NFTs
     * @param recipients Array of recipient addresses
     * @param nations Array of star nations
     */
    function batchMint(
        address[] calldata recipients,
        StarNation[] calldata nations
    ) external onlyOwner nonReentrant {
        require(recipients.length == nations.length, "Length mismatch");
        require(nextTokenId + recipients.length <= MAX_SUPPLY, "Would exceed max supply");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            if (recipients[i] == address(0)) continue;
            
            uint256 tokenId = nextTokenId;
            nextTokenId++;
            
            _safeMint(recipients[i], tokenId);
            
            uint256[] memory frequencies = _getStarNationFrequencies(nations[i]);
            
            tokenLineage[tokenId] = LineageData({
                primaryNation: nations[i],
                frequencies: frequencies,
                lineageIPFSHash: bytes32(0),
                activationTimestamp: 0,
                isStarCodeActivated: false,
                ancestralOrigin: ""
            });
            
            emit LineageNFTMinted(recipients[i], tokenId, nations[i], block.timestamp);
        }
    }
    
    // ============ STAR CODE ACTIVATION ============
    
    /**
     * @dev Activate star code for a token (only token owner)
     * @param tokenId Token ID to activate
     */
    function activateStarCode(uint256 tokenId) external tokenExists(tokenId) {
        if (ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        if (tokenLineage[tokenId].isStarCodeActivated) revert AlreadyActivated();
        
        tokenLineage[tokenId].isStarCodeActivated = true;
        tokenLineage[tokenId].activationTimestamp = block.timestamp;
        frequencyResonanceActive[tokenId] = true;
        totalActivations++;
        
        emit StarCodeActivated(
            tokenId,
            msg.sender,
            tokenLineage[tokenId].frequencies,
            block.timestamp
        );
        
        emit FrequencyResonanceToggled(tokenId, true, block.timestamp);
    }
    
    /**
     * @dev Toggle frequency resonance for a token
     * @param tokenId Token ID to toggle
     */
    function toggleFrequencyResonance(uint256 tokenId) external tokenExists(tokenId) {
        if (ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        
        bool newState = !frequencyResonanceActive[tokenId];
        frequencyResonanceActive[tokenId] = newState;
        
        emit FrequencyResonanceToggled(tokenId, newState, block.timestamp);
    }
    
    // ============ LINEAGE REGISTRATION ============
    
    /**
     * @dev Register lineage data for a token
     * @param tokenId Token ID to register lineage for
     * @param ipfsHash IPFS hash of lineage documentation
     * @param ancestralOrigin Ancestral origin description
     */
    function registerLineage(
        uint256 tokenId,
        bytes32 ipfsHash,
        string memory ancestralOrigin
    ) external tokenExists(tokenId) {
        if (ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        
        tokenLineage[tokenId].lineageIPFSHash = ipfsHash;
        tokenLineage[tokenId].ancestralOrigin = ancestralOrigin;
        
        emit LineageRegistered(tokenId, ipfsHash, ancestralOrigin, block.timestamp);
    }
    
    /**
     * @dev Submit lineage data to the ScrollChain hub (for non-NFT holders)
     * @param dataHash Hash of the submitted lineage data
     */
    function submitLineageData(bytes32 dataHash) external {
        if (dataHash == bytes32(0)) revert EmptySubmission();
        
        userSubmissions[msg.sender].push(LineageSubmission({
            submitter: msg.sender,
            dataHash: dataHash,
            timestamp: block.timestamp,
            verified: false
        }));
        
        totalSubmissions++;
        
        emit LineageSubmitted(msg.sender, dataHash, block.timestamp);
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Get frequencies associated with a star nation
     * @param nation Star nation enum value
     * @return frequencies Array of frequencies
     */
    function _getStarNationFrequencies(StarNation nation) 
        internal 
        pure 
        returns (uint256[] memory) 
    {
        if (nation == StarNation.SIRIAN) {
            uint256[] memory freqs = new uint256[](2);
            freqs[0] = FREQUENCY_528HZ;
            freqs[1] = FREQUENCY_963HZ;
            return freqs;
        } else if (nation == StarNation.PLEIADIAN) {
            uint256[] memory freqs = new uint256[](2);
            freqs[0] = FREQUENCY_528HZ;
            freqs[1] = FREQUENCY_888HZ;
            return freqs;
        } else if (nation == StarNation.ARCTURIAN) {
            uint256[] memory freqs = new uint256[](2);
            freqs[0] = FREQUENCY_963HZ;
            freqs[1] = FREQUENCY_144000HZ;
            return freqs;
        } else if (nation == StarNation.ANDROMEDAN) {
            uint256[] memory freqs = new uint256[](2);
            freqs[0] = FREQUENCY_999HZ;
            freqs[1] = FREQUENCY_144000HZ;
            return freqs;
        } else {
            // MULTI_STAR - Full spectrum
            uint256[] memory freqs = new uint256[](5);
            freqs[0] = FREQUENCY_528HZ;
            freqs[1] = FREQUENCY_963HZ;
            freqs[2] = FREQUENCY_888HZ;
            freqs[3] = FREQUENCY_999HZ;
            freqs[4] = FREQUENCY_144000HZ;
            return freqs;
        }
    }
    
    /**
     * @dev Determine tier based on token ID
     * @param tokenId Token ID to check
     * @return Tier enum value
     */
    function _getTier(uint256 tokenId) internal pure returns (Tier) {
        if (tokenId < 100) return Tier.COSMIC_PIONEER;
        if (tokenId < 1000) return Tier.STAR_GUARDIAN;
        if (tokenId < 5000) return Tier.LINEAGE_KEEPER;
        return Tier.TRUTH_SEEKER;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get total supply
     * @return Current total supply
     */
    function totalSupply() public view returns (uint256) {
        return nextTokenId;
    }
    
    /**
     * @dev Get token lineage data
     * @param tokenId Token ID to query
     * @return LineageData struct
     */
    function getLineageData(uint256 tokenId) external view returns (LineageData memory) {
        _requireTokenExists(tokenId);
        return tokenLineage[tokenId];
    }
    
    /**
     * @dev Get resonance frequencies for a token
     * @param tokenId Token ID to query
     * @return Array of frequencies
     */
    function getResonanceFrequencies(uint256 tokenId) external view returns (uint256[] memory) {
        _requireTokenExists(tokenId);
        return tokenLineage[tokenId].frequencies;
    }
    
    /**
     * @dev Get token tier
     * @param tokenId Token ID to query
     * @return Tier enum value
     */
    function getTokenTier(uint256 tokenId) external pure returns (Tier) {
        return _getTier(tokenId);
    }
    
    /**
     * @dev Get user's lineage submissions
     * @param user Address to query
     * @return Array of LineageSubmission
     */
    function getUserSubmissions(address user) external view returns (LineageSubmission[] memory) {
        return userSubmissions[user];
    }
    
    /**
     * @dev Calculate combined resonance signature
     * @return Combined frequency value
     */
    function getCosmicResonanceSignature() external pure returns (uint256) {
        return FREQUENCY_528HZ + FREQUENCY_963HZ + FREQUENCY_888HZ + FREQUENCY_999HZ + FREQUENCY_144000HZ;
    }
    
    /**
     * @dev Check if star code is activated
     * @param tokenId Token ID to check
     * @return True if activated
     */
    function isStarCodeActivated(uint256 tokenId) external view returns (bool) {
        _requireTokenExists(tokenId);
        return tokenLineage[tokenId].isStarCodeActivated;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Set base URI for metadata
     * @param _baseURI New base URI
     */
    function setBaseURI(string memory _baseURI) external onlyOwner {
        baseURI = _baseURI;
        emit BaseURISet(_baseURI);
    }
    
    /**
     * @dev Update royalty settings
     * @param receiver New royalty receiver
     * @param bps New royalty basis points
     */
    function updateRoyalty(address receiver, uint96 bps) external onlyOwner {
        if (receiver == address(0)) revert InvalidRoyaltyReceiver();
        require(bps <= 1700, "Royalty too high"); // Max 17%
        
        _royaltyReceiver = receiver;
        _royaltyBps = bps;
        
        emit RoyaltyUpdated(receiver, bps);
    }
    
    /**
     * @dev Verify a lineage submission (admin only)
     * @param user Address of submitter
     * @param index Index of submission
     */
    function verifySubmission(address user, uint256 index) external onlyOwner {
        require(index < userSubmissions[user].length, "Invalid index");
        userSubmissions[user][index].verified = true;
    }
    
    // ============ EIP-2981 ROYALTY ============
    
    /**
     * @dev See {IERC2981-royaltyInfo}
     * @param tokenId Token ID (unused but required by interface)
     * @param salePrice Sale price to calculate royalty from
     */
    function royaltyInfo(
        uint256 tokenId,
        uint256 salePrice
    ) external view override returns (address, uint256) {
        // Tiered royalty based on token ID
        uint96 tierBps = _royaltyBps;
        
        Tier tier = _getTier(tokenId);
        if (tier == Tier.COSMIC_PIONEER) {
            tierBps = 1700; // 17%
        } else if (tier == Tier.STAR_GUARDIAN) {
            tierBps = 1500; // 15%
        } else if (tier == Tier.LINEAGE_KEEPER) {
            tierBps = 1200; // 12%
        } else {
            tierBps = 1000; // 10%
        }
        
        uint256 royaltyAmount = (salePrice * tierBps) / 10000;
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
