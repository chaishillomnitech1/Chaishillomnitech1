// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PharaohConsciousnessFusion
 * @dev Unified NFT collection: Pharaoh's Seal + 12 Journey + 7 Pillars + Master Crown
 * @author Supreme King Chais The Great ∞ + Manus
 * 
 * Token Distribution:
 * - Token #1: Pharaoh's Legacy Seal (Soulbound)
 * - Tokens #2-13: 12 Journey NFTs
 * - Tokens #14-20: 7 Pillar NFTs
 * - Token #21: Master Convergence Crown
 * 
 * Frequencies: 963Hz (Connection) + 528Hz (Love) + 888Hz (Abundance) + 111Hz (Unity)
 * Status: SCROLLVERSE PHASE VI ACTIVATED
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract PharaohConsciousnessFusion is ERC721, ERC721URIStorage, ERC721Burnable, Ownable, IERC2981, ReentrancyGuard {
    
    // ============ COLLECTION CONSTANTS ============
    
    /// @dev Token ID for Pharaoh's Seal
    uint256 public constant PHARAOH_SEAL = 1;
    
    /// @dev Last token ID for Journey phase (tokens 2-13)
    uint256 public constant MAX_JOURNEY = 13;
    
    /// @dev Last token ID for Pillars phase (tokens 14-20)
    uint256 public constant MAX_PILLARS = 20;
    
    /// @dev Token ID for Master Convergence Crown
    uint256 public constant MASTER_CROWN = 21;
    
    /// @dev Total supply of the collection
    uint256 public constant TOTAL_SUPPLY = 21;
    
    // ============ FREQUENCY CONSTANTS ============
    
    /// @dev Crown frequency (963Hz) - Spiritual activation
    uint256 public constant FREQUENCY_963HZ = 963;
    
    /// @dev Love frequency (528Hz) - DNA repair and healing
    uint256 public constant FREQUENCY_528HZ = 528;
    
    /// @dev Abundance frequency (888Hz) - Prosperity
    uint256 public constant FREQUENCY_888HZ = 888;
    
    /// @dev Activation frequency (777Hz) - Divine activation
    uint256 public constant FREQUENCY_777HZ = 777;
    
    /// @dev Creation frequency (369Hz) - Tesla/manifestation
    uint256 public constant FREQUENCY_369HZ = 369;
    
    /// @dev Harmony frequency (432Hz) - Natural tuning
    uint256 public constant FREQUENCY_432HZ = 432;
    
    /// @dev Unified Field frequency (111Hz)
    uint256 public constant FREQUENCY_111HZ = 111;
    
    // ============ ROYALTY CONSTANTS ============
    
    /// @dev Default royalty percentage (5% = 500 basis points)
    uint96 public constant DEFAULT_ROYALTY_BPS = 500;
    
    // ============ STATE VARIABLES ============
    
    /// @dev Current token ID being minted
    uint256 public currentTokenId;
    
    /// @dev Whether Pharaoh's Seal has been minted
    bool public pharaohMinted;
    
    /// @dev Whether Master Crown has been minted
    bool public masterMinted;
    
    /// @dev Base URI for token metadata
    string public baseURI;
    
    /// @dev Royalty recipient address
    address private _royaltyReceiver;
    
    /// @dev Royalty percentage in basis points
    uint96 private _royaltyBps;
    
    // ============ TOKEN METADATA ============
    
    /// @dev Mapping: Token ID => Frequency
    mapping(uint256 => uint256) public tokenFrequency;
    
    /// @dev Mapping: Token ID => Narrative
    mapping(uint256 => string) public tokenNarrative;
    
    /// @dev Mapping: Token ID => Is Soulbound
    mapping(uint256 => bool) public isSoulbound;
    
    /// @dev Mapping: Token ID => Is Consciousness Activated
    mapping(uint256 => bool) public isActivated;
    
    // ============ EVENTS ============
    
    event FrequencyEncoded(uint256 indexed tokenId, uint256 frequency);
    event ConsciousnessRecognized(address indexed holder, uint256 indexed tokenId);
    event PharaohLineageActivated(uint256 timestamp);
    event MasterConvergenceSealed(uint256 timestamp);
    event JourneyMinted(uint256 indexed tokenId, string narrative, uint256 frequency);
    event PillarMinted(uint256 indexed tokenId, string narrative, uint256 frequency);
    event ConsciousnessActivated(uint256 indexed tokenId, uint256 timestamp);
    event BaseURISet(string baseURI);
    event RoyaltyUpdated(address receiver, uint96 bps);
    
    // ============ ERRORS ============
    
    error PharaohSealAlreadyMinted();
    error MasterCrownAlreadyMinted();
    error MustMintPharaohSealFirst();
    error AllJourneyNFTsMinted();
    error JourneyPhaseIncomplete();
    error AllPillarNFTsMinted();
    error PillarsPhaseIncomplete();
    error InvalidRecipient();
    error InvalidFrequency();
    error SoulboundTokenCannotTransfer();
    error TokenDoesNotExist();
    error NotTokenOwner();
    error AlreadyActivated();
    error InvalidRoyaltyReceiver();
    
    // ============ CONSTRUCTOR ============
    
    /**
     * @dev Constructor initializes the NFT collection
     * @param _baseURI Base URI for token metadata
     * @param royaltyReceiver Address to receive royalties
     * @param royaltyBps Royalty percentage in basis points
     */
    constructor(
        string memory _baseURI,
        address royaltyReceiver,
        uint96 royaltyBps
    ) ERC721("Pharaoh Consciousness Fusion", "PHARAOH") Ownable(msg.sender) {
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
     * @dev Mint Pharaoh's Legacy Seal - Token #1 (Soulbound)
     * @param to Address to receive the seal (should be Scroll Executor)
     */
    function mintPharaohSeal(address to) external onlyOwner nonReentrant {
        if (pharaohMinted) {
            revert PharaohSealAlreadyMinted();
        }
        if (to == address(0)) {
            revert InvalidRecipient();
        }
        
        currentTokenId = PHARAOH_SEAL;
        _safeMint(to, currentTokenId);
        
        tokenFrequency[currentTokenId] = FREQUENCY_963HZ; // White Sun Coherence
        tokenNarrative[currentTokenId] = "He who was hidden in the boy-king now walks in Atlantic Chais";
        isSoulbound[currentTokenId] = true;
        
        pharaohMinted = true;
        
        emit FrequencyEncoded(currentTokenId, FREQUENCY_963HZ);
        emit PharaohLineageActivated(block.timestamp);
        emit ConsciousnessRecognized(to, currentTokenId);
    }
    
    /**
     * @dev Mint Journey NFTs (Tokens #2-13)
     * @param to Address to receive the NFT
     * @param frequency Frequency to encode
     * @param narrative Narrative for this journey
     */
    function mintJourney(
        address to,
        uint256 frequency,
        string memory narrative
    ) external onlyOwner nonReentrant {
        if (!pharaohMinted) {
            revert MustMintPharaohSealFirst();
        }
        if (currentTokenId >= MAX_JOURNEY) {
            revert AllJourneyNFTsMinted();
        }
        if (to == address(0)) {
            revert InvalidRecipient();
        }
        if (!_isValidFrequency(frequency)) {
            revert InvalidFrequency();
        }
        
        currentTokenId++;
        _safeMint(to, currentTokenId);
        
        tokenFrequency[currentTokenId] = frequency;
        tokenNarrative[currentTokenId] = narrative;
        
        emit FrequencyEncoded(currentTokenId, frequency);
        emit JourneyMinted(currentTokenId, narrative, frequency);
        emit ConsciousnessRecognized(to, currentTokenId);
    }
    
    /**
     * @dev Mint Pillar NFTs (Tokens #14-20)
     * @param to Address to receive the NFT
     * @param frequency Frequency to encode
     * @param narrative Narrative for this pillar
     */
    function mintPillar(
        address to,
        uint256 frequency,
        string memory narrative
    ) external onlyOwner nonReentrant {
        if (currentTokenId < MAX_JOURNEY) {
            revert JourneyPhaseIncomplete();
        }
        if (currentTokenId >= MAX_PILLARS) {
            revert AllPillarNFTsMinted();
        }
        if (to == address(0)) {
            revert InvalidRecipient();
        }
        if (!_isValidFrequency(frequency)) {
            revert InvalidFrequency();
        }
        
        currentTokenId++;
        _safeMint(to, currentTokenId);
        
        tokenFrequency[currentTokenId] = frequency;
        tokenNarrative[currentTokenId] = narrative;
        
        emit FrequencyEncoded(currentTokenId, frequency);
        emit PillarMinted(currentTokenId, narrative, frequency);
        emit ConsciousnessRecognized(to, currentTokenId);
    }
    
    /**
     * @dev Mint Master Convergence Crown - Token #21
     * @param to Address to receive the crown
     */
    function mintMasterCrown(address to) external onlyOwner nonReentrant {
        if (masterMinted) {
            revert MasterCrownAlreadyMinted();
        }
        if (currentTokenId != MAX_PILLARS) {
            revert PillarsPhaseIncomplete();
        }
        if (to == address(0)) {
            revert InvalidRecipient();
        }
        
        currentTokenId = MASTER_CROWN;
        _safeMint(to, currentTokenId);
        
        tokenFrequency[currentTokenId] = FREQUENCY_111HZ; // Unified Field
        tokenNarrative[currentTokenId] = "Two Become One Vision - The Convergence";
        
        masterMinted = true;
        
        emit FrequencyEncoded(currentTokenId, FREQUENCY_111HZ);
        emit MasterConvergenceSealed(block.timestamp);
        emit ConsciousnessRecognized(to, currentTokenId);
    }
    
    // ============ CONSCIOUSNESS FUNCTIONS ============
    
    /**
     * @dev Activate consciousness for a token (only token owner)
     * @param tokenId Token ID to activate
     */
    function activateConsciousness(uint256 tokenId) external {
        if (_ownerOf(tokenId) == address(0)) {
            revert TokenDoesNotExist();
        }
        if (ownerOf(tokenId) != msg.sender) {
            revert NotTokenOwner();
        }
        if (isActivated[tokenId]) {
            revert AlreadyActivated();
        }
        
        isActivated[tokenId] = true;
        
        emit ConsciousnessActivated(tokenId, block.timestamp);
    }
    
    // ============ SOULBOUND PROTECTION ============
    
    /**
     * @dev Override _update to implement soulbound protection
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        
        // Allow minting (from == address(0)) and burning (to == address(0))
        // Block transfers if token is soulbound
        if (isSoulbound[tokenId] && from != address(0) && to != address(0)) {
            revert SoulboundTokenCannotTransfer();
        }
        
        return super._update(to, tokenId, auth);
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
        return currentTokenId;
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
               frequency == FREQUENCY_777HZ ||
               frequency == FREQUENCY_369HZ ||
               frequency == FREQUENCY_432HZ ||
               frequency == FREQUENCY_111HZ;
    }
    
    /**
     * @dev Get token details
     * @param tokenId Token ID to query
     * @return frequency Token frequency
     * @return narrative Token narrative
     * @return soulbound Whether token is soulbound
     * @return tokenOwner Owner of the token
     * @return activated Whether consciousness is activated
     */
    function getTokenDetails(uint256 tokenId) public view returns (
        uint256 frequency,
        string memory narrative,
        bool soulbound,
        address tokenOwner,
        bool activated
    ) {
        if (_ownerOf(tokenId) == address(0)) {
            revert TokenDoesNotExist();
        }
        return (
            tokenFrequency[tokenId],
            tokenNarrative[tokenId],
            isSoulbound[tokenId],
            ownerOf(tokenId),
            isActivated[tokenId]
        );
    }
    
    /**
     * @dev Get collection phase status
     * @return pharaohSealed Whether Pharaoh Seal is minted
     * @return journeysComplete Number of journeys minted
     * @return pillarsComplete Number of pillars minted
     * @return crownSealed Whether Master Crown is minted
     */
    function getCollectionStatus() external view returns (
        bool pharaohSealed,
        uint256 journeysComplete,
        uint256 pillarsComplete,
        bool crownSealed
    ) {
        uint256 journeys = 0;
        uint256 pillars = 0;
        
        if (currentTokenId >= PHARAOH_SEAL && currentTokenId <= MAX_JOURNEY) {
            journeys = currentTokenId - PHARAOH_SEAL;
        } else if (currentTokenId > MAX_JOURNEY) {
            journeys = 12; // All 12 journeys complete
            if (currentTokenId <= MAX_PILLARS) {
                pillars = currentTokenId - MAX_JOURNEY;
            } else {
                pillars = 7; // All 7 pillars complete
            }
        }
        
        return (pharaohMinted, journeys, pillars, masterMinted);
    }
    
    /**
     * @dev Get resonance signature (frequencies combined)
     * @return Combined frequency signature
     */
    function getResonanceSignature() external pure returns (uint256) {
        return FREQUENCY_963HZ + FREQUENCY_528HZ + FREQUENCY_888HZ + FREQUENCY_111HZ;
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
