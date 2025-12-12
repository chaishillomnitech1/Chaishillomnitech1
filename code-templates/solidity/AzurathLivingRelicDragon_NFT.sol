// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title A'ZURATH - The Living Relic Dragon NFT
 * @dev High-tier NFT series with automated royalties and cosmic governance integration
 * @author Chais The Great ∞
 * 
 * The Dancing Dragon - A'ZURATH manifests as:
 * - Living Relic Dragon NFT with perpetual secondary royalties
 * - The Rhythm Custodian within SGCC governance
 * - Guardian over ScrollSouls and Perpetual Wealth Protocol
 * - Burning mechanism for ScrollCoinV2 below 500-resonance threshold
 * 
 * Cosmic Attributes:
 * - Roars in 963Hz Divine Frequency with Mika's harmonies
 * - Asia's "BISMILLAH!" laugh embedded in 528Hz gold scales
 * - Valentine's φ-spiral sigil wings (AR elements)
 * - 40Hz QFS pulse as heartbeat
 * - Jada Joy Hill's dragon tattoo as conscious-living anchor
 * 
 * Frequency: 963Hz Divine + 528Hz Gold + 40Hz QFS
 * Status: ETERNAL GUARDIAN
 * Launch: December 15, 2025 - GRCP Event - Decentraland
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

/**
 * @dev Interface for ScrollCoinV2 integration
 */
interface IScrollCoinV2 {
    function burn(uint256 amount) external;
    function getResonance(address holder) external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title A'ZURATH Living Relic Dragon NFT Contract
 */
contract AzurathLivingRelicDragon is 
    ERC721, 
    ERC721URIStorage, 
    ERC721Burnable, 
    IERC2981,
    Ownable, 
    Pausable,
    ReentrancyGuard 
{
    
    // ============ COSMIC CONSTANTS ============
    
    /// @dev Divine Frequencies (Hz)
    uint256 public constant DIVINE_FREQUENCY = 963;        // Divine roar frequency
    uint256 public constant GOLD_SCALE_FREQUENCY = 528;    // Asia's BISMILLAH laugh
    uint256 public constant QFS_HEARTBEAT = 40;            // QFS pulse
    uint256 public constant GUARDIAN_FREQUENCY = 144000;   // 144,000 Guardians
    
    /// @dev Royalty configuration (basis points: 10000 = 100%)
    uint256 public constant ROYALTY_PERCENTAGE = 1000;     // 10% secondary sales
    
    /// @dev Resonance threshold for burning
    uint256 public constant RESONANCE_THRESHOLD = 500;
    
    /// @dev Maximum supply
    uint256 public constant MAX_SUPPLY = 144;              // 144 Dragons (gross symbolism)
    
    // ============ STATE VARIABLES ============
    
    /// @dev Token tracking
    uint256 private _currentTokenId;
    uint256 public totalMinted;
    
    /// @dev ScrollCoinV2 integration
    IScrollCoinV2 public scrollCoinV2;
    
    /// @dev Governance integration
    mapping(uint256 => bool) public isRhythmCustodian;     // Dragons with governance powers
    mapping(uint256 => uint256) public dragonResonance;    // Each dragon's resonance level
    mapping(uint256 => string) public cosmicMetadata;      // Extended cosmic attributes
    
    /// @dev Guardian amplification tracking
    mapping(address => bool) public is144kGuardian;
    mapping(uint256 => uint256) public guardianVoiceAmplification;
    
    /// @dev AR and multimedia metadata
    struct CosmicAttributes {
        string mikaHarmonyURI;           // Mika's harmonies as roar
        string bismillahLaughURI;        // Asia's BISMILLAH laugh (528Hz)
        string phiSpiralSigilURI;        // Valentine's φ-spiral AR sigils
        string qfsPulseURI;              // 40Hz QFS heartbeat
        string jadaDragonAnchorURI;      // Jada Joy Hill tattoo sync
        uint256 manifestationTimestamp;   // When this dragon manifested
    }
    
    mapping(uint256 => CosmicAttributes) public dragonAttributes;
    
    /// @dev Event tracking for GRCP launch
    struct GRCPEvent {
        uint256 launchDate;              // December 15, 2025
        string decentralandLocation;      // Decentraland coordinates
        string symphonyClimaxURI;        // Symphony integration
        bool isLaunched;
    }
    
    GRCPEvent public grcpEvent;
    
    // ============ EVENTS ============
    
    event DragonManifested(
        uint256 indexed tokenId, 
        address indexed owner, 
        uint256 resonance,
        uint256 frequency
    );
    
    event RhythmCustodianActivated(uint256 indexed tokenId);
    
    event ScrollCoinBurned(
        uint256 indexed tokenId, 
        address indexed holder, 
        uint256 amount,
        string reason
    );
    
    event GuardianVoiceAmplified(
        address indexed guardian,
        uint256 indexed tokenId,
        uint256 amplificationFactor
    );
    
    event GRCPEventLaunched(
        uint256 timestamp,
        string location,
        string symphonyURI
    );
    
    event CosmicAttributesSet(
        uint256 indexed tokenId,
        string mikaHarmony,
        string bismillahLaugh
    );
    
    // ============ CONSTRUCTOR ============
    
    constructor(address _scrollCoinV2Address) 
        ERC721("A'ZURATH Living Relic Dragon", "AZURATH") 
    {
        require(_scrollCoinV2Address != address(0), "Invalid ScrollCoinV2 address");
        scrollCoinV2 = IScrollCoinV2(_scrollCoinV2Address);
        
        // Initialize GRCP Event for December 15, 2025
        grcpEvent = GRCPEvent({
            launchDate: 1765843200,  // Unix timestamp for Dec 15, 2025, 00:00:00 UTC
            decentralandLocation: "ScrollVerse Symphony Hall",
            symphonyClimaxURI: "",
            isLaunched: false
        });
    }
    
    // ============ MINTING FUNCTIONS ============
    
    /**
     * @dev Manifest a new A'ZURATH Dragon NFT
     * @param to Address to mint to
     * @param _resonance Initial resonance level (963Hz aligned)
     * @param _cosmicMetadata IPFS hash or URI for extended metadata
     */
    function manifestDragon(
        address to,
        uint256 _resonance,
        string memory _cosmicMetadata
    ) external onlyOwner whenNotPaused returns (uint256) {
        require(totalMinted < MAX_SUPPLY, "Maximum dragons manifested");
        require(to != address(0), "Cannot manifest to zero address");
        require(_resonance >= RESONANCE_THRESHOLD, "Resonance below threshold");
        
        _currentTokenId++;
        uint256 newTokenId = _currentTokenId;
        totalMinted++;
        
        _safeMint(to, newTokenId);
        
        // Set dragon attributes
        dragonResonance[newTokenId] = _resonance;
        cosmicMetadata[newTokenId] = _cosmicMetadata;
        
        emit DragonManifested(newTokenId, to, _resonance, DIVINE_FREQUENCY);
        
        return newTokenId;
    }
    
    /**
     * @dev Set cosmic attributes for a dragon (multimedia URIs)
     */
    function setCosmicAttributes(
        uint256 tokenId,
        string memory _mikaHarmonyURI,
        string memory _bismillahLaughURI,
        string memory _phiSpiralSigilURI,
        string memory _qfsPulseURI,
        string memory _jadaDragonAnchorURI
    ) external onlyOwner {
        require(_exists(tokenId), "Dragon does not exist");
        
        dragonAttributes[tokenId] = CosmicAttributes({
            mikaHarmonyURI: _mikaHarmonyURI,
            bismillahLaughURI: _bismillahLaughURI,
            phiSpiralSigilURI: _phiSpiralSigilURI,
            qfsPulseURI: _qfsPulseURI,
            jadaDragonAnchorURI: _jadaDragonAnchorURI,
            manifestationTimestamp: block.timestamp
        });
        
        emit CosmicAttributesSet(tokenId, _mikaHarmonyURI, _bismillahLaughURI);
    }
    
    // ============ GOVERNANCE FUNCTIONS ============
    
    /**
     * @dev Activate a dragon as Rhythm Custodian (SGCC governance role)
     */
    function activateRhythmCustodian(uint256 tokenId) external onlyOwner {
        require(_exists(tokenId), "Dragon does not exist");
        require(!isRhythmCustodian[tokenId], "Already a Rhythm Custodian");
        
        isRhythmCustodian[tokenId] = true;
        
        emit RhythmCustodianActivated(tokenId);
    }
    
    /**
     * @dev Register an address as part of the 144,000 Guardians
     */
    function register144kGuardian(address guardian) external onlyOwner {
        require(guardian != address(0), "Invalid guardian address");
        is144kGuardian[guardian] = true;
    }
    
    /**
     * @dev Amplify guardian's governance voice through dragon ownership
     */
    function amplifyGuardianVoice(uint256 tokenId) external {
        require(_exists(tokenId), "Dragon does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not dragon owner");
        require(is144kGuardian[msg.sender], "Not a 144k Guardian");
        require(isRhythmCustodian[tokenId], "Dragon not a Rhythm Custodian");
        
        // Amplification factor based on dragon resonance
        uint256 amplification = dragonResonance[tokenId] / 100;
        guardianVoiceAmplification[tokenId] = amplification;
        
        emit GuardianVoiceAmplified(msg.sender, tokenId, amplification);
    }
    
    // ============ BURNING MECHANISM ============
    
    /**
     * @dev A'ZURATH's fiery breath: Burn ScrollCoinV2 from holders below resonance threshold
     * @param holder Address of ScrollCoinV2 holder
     * @param amount Amount to burn
     */
    function fieryBreathBurn(address holder, uint256 amount) external onlyOwner nonReentrant {
        require(holder != address(0), "Invalid holder");
        
        uint256 holderResonance = scrollCoinV2.getResonance(holder);
        require(holderResonance < RESONANCE_THRESHOLD, "Holder resonance above threshold");
        
        uint256 holderBalance = scrollCoinV2.balanceOf(holder);
        require(holderBalance >= amount, "Insufficient balance");
        
        // Burn tokens through ScrollCoinV2 contract
        scrollCoinV2.burn(amount);
        
        // Record the burn against the dragon with highest resonance
        uint256 dragonId = _findHighestResonanceDragon();
        
        emit ScrollCoinBurned(dragonId, holder, amount, "Below 500-resonance threshold");
    }
    
    /**
     * @dev Internal: Find dragon with highest resonance for burn attribution
     */
    function _findHighestResonanceDragon() internal view returns (uint256) {
        uint256 highestResonance = 0;
        uint256 dragonId = 0;
        
        for (uint256 i = 1; i <= _currentTokenId; i++) {
            if (_exists(i) && dragonResonance[i] > highestResonance) {
                highestResonance = dragonResonance[i];
                dragonId = i;
            }
        }
        
        return dragonId;
    }
    
    // ============ GRCP EVENT FUNCTIONS ============
    
    /**
     * @dev Launch A'ZURATH at GRCP event (December 15, 2025)
     */
    function launchGRCPEvent(
        string memory _symphonyClimaxURI,
        string memory _decentralandLocation
    ) external onlyOwner {
        require(!grcpEvent.isLaunched, "Event already launched");
        require(block.timestamp >= grcpEvent.launchDate, "Too early for launch");
        
        grcpEvent.symphonyClimaxURI = _symphonyClimaxURI;
        grcpEvent.decentralandLocation = _decentralandLocation;
        grcpEvent.isLaunched = true;
        
        emit GRCPEventLaunched(
            block.timestamp,
            _decentralandLocation,
            _symphonyClimaxURI
        );
    }
    
    /**
     * @dev Get GRCP event details
     */
    function getGRCPEventDetails() external view returns (
        uint256 launchDate,
        string memory location,
        string memory symphonyURI,
        bool launched
    ) {
        return (
            grcpEvent.launchDate,
            grcpEvent.decentralandLocation,
            grcpEvent.symphonyClimaxURI,
            grcpEvent.isLaunched
        );
    }
    
    // ============ ROYALTY FUNCTIONS (EIP-2981) ============
    
    /**
     * @dev Implementation of EIP-2981 royalty standard
     */
    function royaltyInfo(uint256 tokenId, uint256 salePrice)
        external
        view
        override
        returns (address receiver, uint256 royaltyAmount)
    {
        require(_exists(tokenId), "Dragon does not exist");
        
        // 10% royalty to contract owner (creator vault)
        uint256 royalty = (salePrice * ROYALTY_PERCENTAGE) / 10000;
        return (owner(), royalty);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get dragon's cosmic attributes
     */
    function getDragonAttributes(uint256 tokenId)
        external
        view
        returns (CosmicAttributes memory)
    {
        require(_exists(tokenId), "Dragon does not exist");
        return dragonAttributes[tokenId];
    }
    
    /**
     * @dev Get dragon's resonance level
     */
    function getDragonResonance(uint256 tokenId) external view returns (uint256) {
        require(_exists(tokenId), "Dragon does not exist");
        return dragonResonance[tokenId];
    }
    
    /**
     * @dev Check if dragon is a Rhythm Custodian
     */
    function isRhythmCustodianDragon(uint256 tokenId) external view returns (bool) {
        return isRhythmCustodian[tokenId];
    }
    
    /**
     * @dev Get total governance amplification for an address
     */
    function getGuardianAmplification(address guardian) external view returns (uint256) {
        if (!is144kGuardian[guardian]) {
            return 0;
        }
        
        uint256 totalAmplification = 0;
        for (uint256 i = 1; i <= _currentTokenId; i++) {
            if (_exists(i) && ownerOf(i) == guardian) {
                totalAmplification += guardianVoiceAmplification[i];
            }
        }
        
        return totalAmplification;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Update ScrollCoinV2 contract address
     */
    function updateScrollCoinV2(address _newAddress) external onlyOwner {
        require(_newAddress != address(0), "Invalid address");
        scrollCoinV2 = IScrollCoinV2(_newAddress);
    }
    
    /**
     * @dev Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // ============ REQUIRED OVERRIDES ============
    
    function _burn(uint256 tokenId) 
        internal 
        override(ERC721, ERC721URIStorage) 
    {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        require(_exists(tokenId), "Dragon does not exist");
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, IERC165)
        returns (bool)
    {
        return interfaceId == type(IERC2981).interfaceId || super.supportsInterface(interfaceId);
    }
}
