// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ThrowingStonesFractionalNFT
 * @dev Fractional NFT for "Throwing Stones" track with 1,000 Scroll-Units
 * @author Supreme King Chais The Great ∞
 * 
 * This contract implements:
 * - Fractionalization into 1,000 Scroll-Units
 * - 15% OmniScroll Royalty Engine with automated treasury distribution
 * - Dynamic NFT metadata evolution based on VibeCanvas ecosystem
 * - 369 Vortex Math frequency alignment
 * - Integration with sacred frequencies (528Hz, 432Hz, 963Hz)
 * 
 * Frequencies:
 * - 528Hz: Transformation/DNA Repair
 * - 432Hz: Universal Harmony
 * - 963Hz: Divine Connection
 * 
 * Status: GENESIS DROP PHASE 1 ELEVATION
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

contract ThrowingStonesFractionalNFT is 
    ERC721, 
    ERC721URIStorage, 
    ERC721Burnable,
    Ownable, 
    ReentrancyGuard,
    IERC2981 
{
    
    // ========== SACRED CONSTANTS ==========
    
    /// @dev Total Scroll-Units (fractions)
    uint256 public constant TOTAL_SCROLL_UNITS = 1000;
    
    /// @dev OmniScroll Royalty percentage (15% = 1500 basis points)
    uint96 public constant OMNISCROLL_ROYALTY_BPS = 1500;
    
    /// @dev Sacred Frequencies
    uint256 public constant FREQUENCY_528HZ = 528;  // Transformation/DNA Repair
    uint256 public constant FREQUENCY_432HZ = 432;  // Universal Harmony
    uint256 public constant FREQUENCY_963HZ = 963;  // Divine Connection
    
    /// @dev 369 Vortex Math divine numbers
    uint256 public constant VORTEX_3 = 3;
    uint256 public constant VORTEX_6 = 6;
    uint256 public constant VORTEX_9 = 9;
    
    /// @dev Vault anchor constant
    bytes32 public constant VAULT_ANCHOR = keccak256("VAULT-CXGT-247-OMNI");
    
    // ========== STATE VARIABLES ==========
    
    /// @dev Master NFT token ID (the whole track)
    uint256 public masterTokenId;
    
    /// @dev Current scroll unit counter
    uint256 private _scrollUnitCounter;
    
    /// @dev Total scroll units minted
    uint256 public totalScrollUnitsMinted;
    
    /// @dev Base URI for metadata
    string private _baseTokenURI;
    
    /// @dev Akashic Treasury address for royalties
    address public akashicTreasury;
    
    /// @dev ScrollVault address for eternity-proof ownership
    address public scrollVault;
    
    /// @dev VibeCanvas ecosystem contract
    address public vibeCanvasContract;
    
    /// @dev Total royalties collected
    uint256 public totalRoyaltiesCollected;
    
    /// @dev Genesis Drop activation flag
    bool public genesisDropActivated;
    
    /// @dev Dynamic NFT updates enabled
    bool public dynamicUpdatesEnabled;
    
    // ========== STRUCTS ==========
    
    struct ScrollUnit {
        uint256 unitId;
        address owner;
        uint256 mintTimestamp;
        uint256 primaryFrequency;
        uint256 vortexAlignment;  // 3, 6, or 9
        bytes32 metadataHash;
        bytes32 vibeSignature;
        uint256 evolutionStage;
        bool isActive;
    }
    
    struct FrequencyProfile {
        uint256 freq528Hz;      // Transformation level
        uint256 freq432Hz;      // Harmony level
        uint256 freq963Hz;      // Divine connection level
        uint256 vortexScore;    // 369 Vortex Math score
        uint256 lastUpdate;
    }
    
    struct VibeMetrics {
        uint256 vibeLevel;
        uint256 resonanceScore;
        uint256 communityEngagement;
        uint256 evolutionPoints;
        uint256 lastVibeUpdate;
    }
    
    // ========== MAPPINGS ==========
    
    /// @dev Token ID => Scroll Unit data
    mapping(uint256 => ScrollUnit) public scrollUnits;
    
    /// @dev Token ID => Frequency Profile
    mapping(uint256 => FrequencyProfile) public frequencyProfiles;
    
    /// @dev Token ID => Vibe Metrics
    mapping(uint256 => VibeMetrics) public vibeMetrics;
    
    /// @dev Address => Scroll Units owned count
    mapping(address => uint256) public scrollUnitsOwned;
    
    /// @dev Vortex alignment => Count
    mapping(uint256 => uint256) public vortexDistribution;
    
    // ========== EVENTS ==========
    
    event GenesisDropActivated(uint256 timestamp, address activator);
    
    event ScrollUnitMinted(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 vortexAlignment,
        uint256 primaryFrequency,
        uint256 timestamp
    );
    
    event MetadataEvolved(
        uint256 indexed tokenId,
        uint256 newStage,
        bytes32 newMetadataHash,
        uint256 timestamp
    );
    
    event VibeUpdated(
        uint256 indexed tokenId,
        uint256 vibeLevel,
        uint256 resonanceScore,
        bytes32 vibeSignature,
        uint256 timestamp
    );
    
    event RoyaltyDistributed(
        address indexed treasury,
        uint256 amount,
        uint256 timestamp
    );
    
    event DynamicUpdatesToggled(bool enabled, uint256 timestamp);
    
    // ========== CONSTRUCTOR ==========
    
    constructor(
        address initialOwner,
        address _akashicTreasury,
        address _scrollVault,
        string memory baseURI
    ) ERC721("Throwing Stones Fractional", "TSFRX") Ownable(initialOwner) {
        require(_akashicTreasury != address(0), "Invalid treasury");
        require(_scrollVault != address(0), "Invalid vault");
        
        akashicTreasury = _akashicTreasury;
        scrollVault = _scrollVault;
        _baseTokenURI = baseURI;
        masterTokenId = 0;
        genesisDropActivated = false;
        dynamicUpdatesEnabled = true;
        
        // Initialize master token
        _initializeMasterToken();
    }
    
    // ========== INITIALIZATION ==========
    
    /**
     * @dev Initialize the master token (the complete track)
     */
    function _initializeMasterToken() private {
        masterTokenId = 0;
        _safeMint(owner(), masterTokenId);
        
        scrollUnits[masterTokenId] = ScrollUnit({
            unitId: 0,
            owner: owner(),
            mintTimestamp: block.timestamp,
            primaryFrequency: FREQUENCY_528HZ,
            vortexAlignment: VORTEX_9,
            metadataHash: bytes32(0),
            vibeSignature: bytes32(0),
            evolutionStage: 0,
            isActive: true
        });
        
        _scrollUnitCounter = 1;
    }
    
    // ========== MINTING FUNCTIONS ==========
    
    /**
     * @dev Mint a fractional Scroll-Unit
     * @notice Mints one of 1,000 scroll units with 369 Vortex Math alignment
     */
    function mintScrollUnit() external payable nonReentrant {
        require(genesisDropActivated, "Genesis Drop not active");
        require(totalScrollUnitsMinted < TOTAL_SCROLL_UNITS, "All units minted");
        
        uint256 tokenId = _scrollUnitCounter;
        _scrollUnitCounter++;
        
        // Calculate 369 Vortex alignment based on token ID
        uint256 vortexAlignment = _calculateVortexAlignment(tokenId);
        
        // Select primary frequency based on vortex number
        uint256 primaryFreq = _selectFrequency(vortexAlignment);
        
        // Mint the NFT
        _safeMint(msg.sender, tokenId);
        
        // Record scroll unit data
        scrollUnits[tokenId] = ScrollUnit({
            unitId: tokenId,
            owner: msg.sender,
            mintTimestamp: block.timestamp,
            primaryFrequency: primaryFreq,
            vortexAlignment: vortexAlignment,
            metadataHash: bytes32(0),
            vibeSignature: _generateVibeSignature(tokenId, msg.sender),
            evolutionStage: 0,
            isActive: true
        });
        
        // Initialize frequency profile
        frequencyProfiles[tokenId] = FrequencyProfile({
            freq528Hz: primaryFreq == FREQUENCY_528HZ ? 100 : 33,
            freq432Hz: primaryFreq == FREQUENCY_432HZ ? 100 : 33,
            freq963Hz: primaryFreq == FREQUENCY_963HZ ? 100 : 33,
            vortexScore: _calculateVortexScore(vortexAlignment),
            lastUpdate: block.timestamp
        });
        
        // Initialize vibe metrics
        vibeMetrics[tokenId] = VibeMetrics({
            vibeLevel: 0,
            resonanceScore: 0,
            communityEngagement: 0,
            evolutionPoints: 0,
            lastVibeUpdate: block.timestamp
        });
        
        scrollUnitsOwned[msg.sender]++;
        totalScrollUnitsMinted++;
        vortexDistribution[vortexAlignment]++;
        
        emit ScrollUnitMinted(
            tokenId,
            msg.sender,
            vortexAlignment,
            primaryFreq,
            block.timestamp
        );
    }
    
    /**
     * @dev Batch mint scroll units (admin only)
     * @param recipients Array of recipient addresses
     * @param count Number of units to mint per recipient
     */
    function batchMintScrollUnits(address[] calldata recipients, uint256 count) 
        external 
        onlyOwner 
        nonReentrant 
    {
        require(genesisDropActivated, "Genesis Drop not active");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            for (uint256 j = 0; j < count; j++) {
                if (totalScrollUnitsMinted >= TOTAL_SCROLL_UNITS) break;
                
                uint256 tokenId = _scrollUnitCounter;
                _scrollUnitCounter++;
                
                uint256 vortexAlignment = _calculateVortexAlignment(tokenId);
                uint256 primaryFreq = _selectFrequency(vortexAlignment);
                
                _safeMint(recipients[i], tokenId);
                
                scrollUnits[tokenId] = ScrollUnit({
                    unitId: tokenId,
                    owner: recipients[i],
                    mintTimestamp: block.timestamp,
                    primaryFrequency: primaryFreq,
                    vortexAlignment: vortexAlignment,
                    metadataHash: bytes32(0),
                    vibeSignature: _generateVibeSignature(tokenId, recipients[i]),
                    evolutionStage: 0,
                    isActive: true
                });
                
                frequencyProfiles[tokenId] = FrequencyProfile({
                    freq528Hz: primaryFreq == FREQUENCY_528HZ ? 100 : 33,
                    freq432Hz: primaryFreq == FREQUENCY_432HZ ? 100 : 33,
                    freq963Hz: primaryFreq == FREQUENCY_963HZ ? 100 : 33,
                    vortexScore: _calculateVortexScore(vortexAlignment),
                    lastUpdate: block.timestamp
                });
                
                vibeMetrics[tokenId] = VibeMetrics({
                    vibeLevel: 0,
                    resonanceScore: 0,
                    communityEngagement: 0,
                    evolutionPoints: 0,
                    lastVibeUpdate: block.timestamp
                });
                
                scrollUnitsOwned[recipients[i]]++;
                totalScrollUnitsMinted++;
                vortexDistribution[vortexAlignment]++;
                
                emit ScrollUnitMinted(
                    tokenId,
                    recipients[i],
                    vortexAlignment,
                    primaryFreq,
                    block.timestamp
                );
            }
        }
    }
    
    // ========== 369 VORTEX MATH ==========
    
    /**
     * @dev Calculate 369 Vortex alignment for a token ID
     * @param tokenId Token ID
     * @return Vortex number (3, 6, or 9)
     */
    function _calculateVortexAlignment(uint256 tokenId) private pure returns (uint256) {
        uint256 digitalRoot = _calculateDigitalRoot(tokenId);
        
        if (digitalRoot == 3 || digitalRoot == 6 || digitalRoot == 9) {
            return digitalRoot;
        }
        
        // Map other numbers to vortex numbers
        if (digitalRoot == 1 || digitalRoot == 4 || digitalRoot == 7) {
            return VORTEX_3;
        } else if (digitalRoot == 2 || digitalRoot == 5 || digitalRoot == 8) {
            return VORTEX_6;
        } else {
            return VORTEX_9;
        }
    }
    
    /**
     * @dev Calculate digital root (recursive sum of digits until single digit)
     * @param number Number to calculate digital root for
     * @return Digital root
     */
    function _calculateDigitalRoot(uint256 number) private pure returns (uint256) {
        if (number == 0) return 0;
        if (number % 9 == 0) return 9;
        return number % 9;
    }
    
    /**
     * @dev Calculate vortex score based on alignment
     * @param vortexAlignment Vortex number (3, 6, or 9)
     * @return Vortex score
     */
    function _calculateVortexScore(uint256 vortexAlignment) private pure returns (uint256) {
        if (vortexAlignment == VORTEX_9) return 1000;
        if (vortexAlignment == VORTEX_6) return 666;
        if (vortexAlignment == VORTEX_3) return 369;
        return 0;
    }
    
    /**
     * @dev Select primary frequency based on vortex alignment
     * @param vortexAlignment Vortex number
     * @return Frequency (528, 432, or 963 Hz)
     */
    function _selectFrequency(uint256 vortexAlignment) private pure returns (uint256) {
        if (vortexAlignment == VORTEX_3) return FREQUENCY_432HZ;
        if (vortexAlignment == VORTEX_6) return FREQUENCY_528HZ;
        if (vortexAlignment == VORTEX_9) return FREQUENCY_963HZ;
        return FREQUENCY_528HZ;
    }
    
    /**
     * @dev Generate vibe signature for a token
     * @param tokenId Token ID
     * @param owner Owner address
     * @return Vibe signature hash
     */
    function _generateVibeSignature(uint256 tokenId, address owner) 
        private 
        view 
        returns (bytes32) 
    {
        return keccak256(
            abi.encodePacked(
                tokenId,
                owner,
                block.timestamp,
                VAULT_ANCHOR
            )
        );
    }
    
    // ========== DYNAMIC NFT EVOLUTION ==========
    
    /**
     * @dev Evolve metadata based on VibeCanvas ecosystem
     * @param tokenId Token ID
     * @param newMetadataHash New metadata hash
     */
    function evolveMetadata(uint256 tokenId, bytes32 newMetadataHash) 
        external 
    {
        require(
            msg.sender == vibeCanvasContract || msg.sender == owner(),
            "Not authorized"
        );
        require(dynamicUpdatesEnabled, "Dynamic updates disabled");
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        scrollUnits[tokenId].metadataHash = newMetadataHash;
        scrollUnits[tokenId].evolutionStage++;
        
        emit MetadataEvolved(
            tokenId,
            scrollUnits[tokenId].evolutionStage,
            newMetadataHash,
            block.timestamp
        );
    }
    
    /**
     * @dev Update vibe metrics from VibeCanvas
     * @param tokenId Token ID
     * @param vibeLevel New vibe level
     * @param resonanceScore New resonance score
     * @param engagement Community engagement score
     */
    function updateVibeMetrics(
        uint256 tokenId,
        uint256 vibeLevel,
        uint256 resonanceScore,
        uint256 engagement
    ) external {
        require(
            msg.sender == vibeCanvasContract || msg.sender == owner(),
            "Not authorized"
        );
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        VibeMetrics storage metrics = vibeMetrics[tokenId];
        metrics.vibeLevel = vibeLevel;
        metrics.resonanceScore = resonanceScore;
        metrics.communityEngagement = engagement;
        metrics.evolutionPoints += 1;
        metrics.lastVibeUpdate = block.timestamp;
        
        bytes32 newVibeSignature = keccak256(
            abi.encodePacked(
                tokenId,
                vibeLevel,
                resonanceScore,
                block.timestamp
            )
        );
        
        scrollUnits[tokenId].vibeSignature = newVibeSignature;
        
        emit VibeUpdated(
            tokenId,
            vibeLevel,
            resonanceScore,
            newVibeSignature,
            block.timestamp
        );
    }
    
    // ========== ROYALTY FUNCTIONS ==========
    
    /**
     * @dev ERC-2981 royalty info
     * @param tokenId Token ID
     * @param salePrice Sale price
     * @return receiver Royalty receiver address
     * @return royaltyAmount Royalty amount
     */
    function royaltyInfo(uint256 tokenId, uint256 salePrice)
        external
        view
        override
        returns (address receiver, uint256 royaltyAmount)
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        receiver = akashicTreasury;
        royaltyAmount = (salePrice * OMNISCROLL_ROYALTY_BPS) / 10000;
    }
    
    /**
     * @dev Distribute royalties to treasury
     */
    function distributeRoyalties() external payable nonReentrant {
        require(msg.value > 0, "No royalties to distribute");
        
        totalRoyaltiesCollected += msg.value;
        
        (bool success, ) = payable(akashicTreasury).call{value: msg.value}("");
        require(success, "Royalty distribution failed");
        
        emit RoyaltyDistributed(akashicTreasury, msg.value, block.timestamp);
    }
    
    // ========== ADMIN FUNCTIONS ==========
    
    /**
     * @dev Activate Genesis Drop
     */
    function activateGenesisDrop() external onlyOwner {
        require(!genesisDropActivated, "Already activated");
        genesisDropActivated = true;
        
        emit GenesisDropActivated(block.timestamp, msg.sender);
    }
    
    /**
     * @dev Set VibeCanvas contract address
     * @param _vibeCanvasContract VibeCanvas contract address
     */
    function setVibeCanvasContract(address _vibeCanvasContract) external onlyOwner {
        require(_vibeCanvasContract != address(0), "Invalid address");
        vibeCanvasContract = _vibeCanvasContract;
    }
    
    /**
     * @dev Set Akashic Treasury address
     * @param _treasury Treasury address
     */
    function setAkashicTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury");
        akashicTreasury = _treasury;
    }
    
    /**
     * @dev Set ScrollVault address
     * @param _scrollVault ScrollVault address
     */
    function setScrollVault(address _scrollVault) external onlyOwner {
        require(_scrollVault != address(0), "Invalid vault");
        scrollVault = _scrollVault;
    }
    
    /**
     * @dev Set base URI
     * @param baseURI New base URI
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @dev Toggle dynamic updates
     */
    function toggleDynamicUpdates() external onlyOwner {
        dynamicUpdatesEnabled = !dynamicUpdatesEnabled;
        emit DynamicUpdatesToggled(dynamicUpdatesEnabled, block.timestamp);
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @dev Get scroll unit details
     * @param tokenId Token ID
     * @return Scroll unit struct
     */
    function getScrollUnit(uint256 tokenId) 
        external 
        view 
        returns (ScrollUnit memory) 
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return scrollUnits[tokenId];
    }
    
    /**
     * @dev Get frequency profile
     * @param tokenId Token ID
     * @return Frequency profile struct
     */
    function getFrequencyProfile(uint256 tokenId) 
        external 
        view 
        returns (FrequencyProfile memory) 
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return frequencyProfiles[tokenId];
    }
    
    /**
     * @dev Get vibe metrics
     * @param tokenId Token ID
     * @return Vibe metrics struct
     */
    function getVibeMetrics(uint256 tokenId) 
        external 
        view 
        returns (VibeMetrics memory) 
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return vibeMetrics[tokenId];
    }
    
    /**
     * @dev Get remaining scroll units available
     * @return Remaining units
     */
    function getRemainingUnits() external view returns (uint256) {
        return TOTAL_SCROLL_UNITS - totalScrollUnitsMinted;
    }
    
    /**
     * @dev Get vortex distribution statistics
     * @return vortex3Count, vortex6Count, vortex9Count
     */
    function getVortexDistribution() 
        external 
        view 
        returns (uint256 vortex3Count, uint256 vortex6Count, uint256 vortex9Count) 
    {
        return (
            vortexDistribution[VORTEX_3],
            vortexDistribution[VORTEX_6],
            vortexDistribution[VORTEX_9]
        );
    }
    
    // ========== OVERRIDES ==========
    
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
        override(ERC721, ERC721URIStorage, IERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
