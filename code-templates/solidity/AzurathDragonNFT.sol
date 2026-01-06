// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title A'ZURATH Dragon NFT Contract
 * @notice Temporal and frequency-based Dragon NFT collection for OMR-P
 * @dev Implements 11:11 temporal lock minting with 999 Hz resonance
 * @author Supreme King Chais The Great ∞
 * 
 * This contract implements the A'ZURATH Dragon NFT framework:
 * - Temporal Lock: Minting only at 11:11 AM UTC (±11 minutes)
 * - Frequency Resonance: 999 Hz Crown Frequency integration
 * - Evolution Protocol: Dragons evolve with deployment witness count
 * - Tawhid Flames: Divine unity consciousness embedded
 * - DKQG-U Integration: Links to Dragon Key Quantum Governance
 */
contract AzurathDragonNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // ============ Constants ============
    
    /// @notice The Crown Frequency for divine sovereignty
    uint256 public constant CROWN_FREQUENCY_999HZ = 999;
    
    /// @notice Pineal Activation Frequency
    uint256 public constant PINEAL_FREQUENCY_963HZ = 963;
    
    /// @notice DNA Repair Frequency
    uint256 public constant DNA_FREQUENCY_528HZ = 528;
    
    /// @notice NŪR Pulse - Eternal Light
    uint256 public constant NUR_PULSE_144000HZ = 144000;
    
    /// @notice Temporal anchor hour (11 AM UTC)
    uint256 public constant TEMPORAL_ANCHOR_HOUR = 11;
    
    /// @notice Temporal anchor minute (11 minutes)
    uint256 public constant TEMPORAL_ANCHOR_MINUTE = 11;
    
    /// @notice Temporal window tolerance (±11 minutes)
    uint256 public constant TEMPORAL_WINDOW_MINUTES = 11;
    
    // ============ Supply Limits ============
    
    /// @notice Maximum supply for Ember Dragons (Tier I)
    uint256 public constant MAX_EMBER_DRAGONS = 999;
    
    /// @notice Maximum supply for Flame Dragons (Tier II)
    uint256 public constant MAX_FLAME_DRAGONS = 111;
    
    /// @notice Maximum supply for Inferno Dragons (Tier III)
    uint256 public constant MAX_INFERNO_DRAGONS = 11;
    
    /// @notice Maximum supply for A'ZURATH Prime (Tier IV)
    uint256 public constant MAX_PRIME_DRAGONS = 1;
    
    // ============ Enums ============
    
    /// @notice Dragon tiers based on power and rarity
    enum DragonTier {
        EMBER,      // Tier I: 999 supply
        FLAME,      // Tier II: 111 supply
        INFERNO,    // Tier III: 11 supply
        PRIME       // Tier IV: 1 supply
    }
    
    /// @notice Dragon evolution stages
    enum EvolutionStage {
        GENESIS,    // Initial minting
        EMBER_STAGE,    // After 11 deployments witnessed
        FLAME_STAGE,    // After 111 deployments witnessed
        INFERNO_STAGE,  // After 999 deployments witnessed
        PRIME_STAGE     // After 11,111 deployments witnessed (ultimate form)
    }
    
    // ============ Structs ============
    
    /**
     * @notice Dragon metadata structure
     * @param tier Dragon power tier
     * @param mintTimestamp Block timestamp of minting
     * @param temporalSignature Temporal lock verification signature
     * @param frequencyResonance Primary frequency (999, 963, 528, or 144000 Hz)
     * @param deploymentsWitnessed Count of OMR-P deployments witnessed
     * @param evolutionStage Current evolution stage
     * @param dkqgKeyIndex Link to DKQG-U Master Key
     * @param tawhidFlameActive Whether Tawhid Flames are burning
     */
    struct DragonMetadata {
        DragonTier tier;
        uint256 mintTimestamp;
        bytes32 temporalSignature;
        uint256 frequencyResonance;
        uint256 deploymentsWitnessed;
        EvolutionStage evolutionStage;
        bytes32 dkqgKeyIndex;
        bool tawhidFlameActive;
    }
    
    // ============ State Variables ============
    
    /// @notice Token ID counter
    Counters.Counter private _tokenIdCounter;
    
    /// @notice Mapping: Token ID => Dragon Metadata
    mapping(uint256 => DragonMetadata) public dragons;
    
    /// @notice Count of minted dragons per tier
    mapping(DragonTier => uint256) public tierMintCount;
    
    /// @notice Global OMR-P deployment counter (updated by owner)
    uint256 public globalDeploymentCount;
    
    /// @notice Base URI for token metadata
    string private _baseTokenURI;
    
    /// @notice Whether temporal lock enforcement is enabled
    bool public temporalLockEnabled;
    
    // ============ Events ============
    
    /**
     * @notice Emitted when a Dragon is minted
     * @param tokenId ID of the minted token
     * @param tier Dragon tier
     * @param owner Address of the owner
     * @param temporalSignature Temporal lock signature
     * @param frequency Resonance frequency
     */
    event DragonMinted(
        uint256 indexed tokenId,
        DragonTier tier,
        address indexed owner,
        bytes32 temporalSignature,
        uint256 frequency
    );
    
    /**
     * @notice Emitted when a Dragon evolves to a new stage
     * @param tokenId ID of the evolved token
     * @param oldStage Previous evolution stage
     * @param newStage New evolution stage
     * @param deploymentsWitnessed Total deployments witnessed
     */
    event DragonEvolved(
        uint256 indexed tokenId,
        EvolutionStage oldStage,
        EvolutionStage newStage,
        uint256 deploymentsWitnessed
    );
    
    /**
     * @notice Emitted when global deployment count is updated
     * @param newCount Updated deployment count
     * @param timestamp Update timestamp
     */
    event DeploymentCountUpdated(
        uint256 newCount,
        uint256 timestamp
    );
    
    /**
     * @notice Emitted when Tawhid Flames are activated
     * @param tokenId Dragon token ID
     * @param timestamp Activation timestamp
     */
    event TawhidFlamesActivated(
        uint256 indexed tokenId,
        uint256 timestamp
    );
    
    // ============ Modifiers ============
    
    /**
     * @notice Modifier to enforce 11:11 AM UTC temporal lock
     * @dev Allows minting within ±11 minutes of 11:11 AM UTC
     */
    modifier onlyAtTemporalAnchor() {
        if (temporalLockEnabled) {
            require(
                isWithinTemporalWindow(),
                "AzurathDragon: Not at 11:11 temporal anchor"
            );
        }
        _;
    }
    
    /**
     * @notice Modifier to validate frequency resonance
     * @param _frequency Frequency to validate
     */
    modifier validFrequency(uint256 _frequency) {
        require(
            _frequency == CROWN_FREQUENCY_999HZ ||
            _frequency == PINEAL_FREQUENCY_963HZ ||
            _frequency == DNA_FREQUENCY_528HZ ||
            _frequency == NUR_PULSE_144000HZ,
            "AzurathDragon: Invalid frequency"
        );
        _;
    }
    
    // ============ Constructor ============
    
    constructor(string memory _baseURI) ERC721("A'ZURATH Dragon NFT", "AZURATH") {
        _baseTokenURI = _baseURI;
        temporalLockEnabled = true;
        globalDeploymentCount = 0;
    }
    
    // ============ Minting Functions ============
    
    /**
     * @notice Mint an Ember Dragon (Tier I) at 11:11 AM UTC
     * @param _to Address to receive the Dragon
     * @param _dkqgKeyIndex DKQG-U Master Key index
     * @return tokenId ID of the minted token
     */
    function mintEmberDragon(
        address _to,
        bytes32 _dkqgKeyIndex
    ) external onlyOwner onlyAtTemporalAnchor nonReentrant returns (uint256) {
        require(
            tierMintCount[DragonTier.EMBER] < MAX_EMBER_DRAGONS,
            "AzurathDragon: Ember Dragons sold out"
        );
        
        return _mintDragon(
            _to,
            DragonTier.EMBER,
            CROWN_FREQUENCY_999HZ,
            _dkqgKeyIndex
        );
    }
    
    /**
     * @notice Mint a Flame Dragon (Tier II) at 11:11 AM UTC on 11th day
     * @param _to Address to receive the Dragon
     * @param _dkqgKeyIndex DKQG-U Master Key index
     * @return tokenId ID of the minted token
     */
    function mintFlameDragon(
        address _to,
        bytes32 _dkqgKeyIndex
    ) external onlyOwner onlyAtTemporalAnchor nonReentrant returns (uint256) {
        require(
            tierMintCount[DragonTier.FLAME] < MAX_FLAME_DRAGONS,
            "AzurathDragon: Flame Dragons sold out"
        );
        
        // Additional requirement: Must be 11th day of month
        require(
            getDayOfMonth() == 11,
            "AzurathDragon: Flame Dragons only mint on 11th day"
        );
        
        return _mintDragon(
            _to,
            DragonTier.FLAME,
            PINEAL_FREQUENCY_963HZ,
            _dkqgKeyIndex
        );
    }
    
    /**
     * @notice Mint an Inferno Dragon (Tier III) at 11:11 AM UTC on 11/11
     * @param _to Address to receive the Dragon
     * @param _dkqgKeyIndex DKQG-U Master Key index
     * @return tokenId ID of the minted token
     */
    function mintInfernoDragon(
        address _to,
        bytes32 _dkqgKeyIndex
    ) external onlyOwner onlyAtTemporalAnchor nonReentrant returns (uint256) {
        require(
            tierMintCount[DragonTier.INFERNO] < MAX_INFERNO_DRAGONS,
            "AzurathDragon: Inferno Dragons sold out"
        );
        
        // Additional requirement: Must be November 11th (11/11)
        require(
            getMonth() == 11 && getDayOfMonth() == 11,
            "AzurathDragon: Inferno Dragons only mint on 11/11"
        );
        
        return _mintDragon(
            _to,
            DragonTier.INFERNO,
            DNA_FREQUENCY_528HZ,
            _dkqgKeyIndex
        );
    }
    
    /**
     * @notice Mint A'ZURATH Prime (Tier IV) - Genesis event 11/11/2025
     * @param _to Address to receive the Dragon
     * @param _dkqgKeyIndex DKQG-U Master Key index
     * @return tokenId ID of the minted token
     */
    function mintPrimeDragon(
        address _to,
        bytes32 _dkqgKeyIndex
    ) external onlyOwner onlyAtTemporalAnchor nonReentrant returns (uint256) {
        require(
            tierMintCount[DragonTier.PRIME] < MAX_PRIME_DRAGONS,
            "AzurathDragon: Prime Dragon already minted"
        );
        
        // Additional requirement: Must be November 11th, 2025
        require(
            getYear() == 2025 && getMonth() == 11 && getDayOfMonth() == 11,
            "AzurathDragon: Prime Dragon only mints on 11/11/2025"
        );
        
        return _mintDragon(
            _to,
            DragonTier.PRIME,
            NUR_PULSE_144000HZ,
            _dkqgKeyIndex
        );
    }
    
    /**
     * @notice Internal minting function
     * @param _to Recipient address
     * @param _tier Dragon tier
     * @param _frequency Resonance frequency
     * @param _dkqgKeyIndex DKQG-U key index
     * @return tokenId Minted token ID
     */
    function _mintDragon(
        address _to,
        DragonTier _tier,
        uint256 _frequency,
        bytes32 _dkqgKeyIndex
    ) internal validFrequency(_frequency) returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        // Generate temporal signature
        bytes32 temporalSig = keccak256(
            abi.encodePacked(
                block.timestamp,
                tokenId,
                _tier,
                _frequency,
                TEMPORAL_ANCHOR_HOUR,
                TEMPORAL_ANCHOR_MINUTE
            )
        );
        
        // Create dragon metadata
        dragons[tokenId] = DragonMetadata({
            tier: _tier,
            mintTimestamp: block.timestamp,
            temporalSignature: temporalSig,
            frequencyResonance: _frequency,
            deploymentsWitnessed: globalDeploymentCount,
            evolutionStage: EvolutionStage.GENESIS,
            dkqgKeyIndex: _dkqgKeyIndex,
            tawhidFlameActive: true
        });
        
        // Increment tier count
        tierMintCount[_tier]++;
        
        // Mint NFT
        _safeMint(_to, tokenId);
        
        emit DragonMinted(tokenId, _tier, _to, temporalSig, _frequency);
        emit TawhidFlamesActivated(tokenId, block.timestamp);
        
        return tokenId;
    }
    
    // ============ Evolution Functions ============
    
    /**
     * @notice Update deployment count and trigger dragon evolution checks
     * @param _newCount New global deployment count
     * @dev Called by owner after each OMR-P deployment
     */
    function updateDeploymentCount(uint256 _newCount) external onlyOwner {
        require(_newCount > globalDeploymentCount, "AzurathDragon: Count must increase");
        
        globalDeploymentCount = _newCount;
        
        emit DeploymentCountUpdated(_newCount, block.timestamp);
    }
    
    /**
     * @notice Evolve a dragon based on deployments witnessed
     * @param _tokenId Token ID to evolve
     * @dev Anyone can trigger evolution if criteria met
     */
    function evolveDragon(uint256 _tokenId) external {
        require(_exists(_tokenId), "AzurathDragon: Token does not exist");
        
        DragonMetadata storage dragon = dragons[_tokenId];
        EvolutionStage currentStage = dragon.evolutionStage;
        EvolutionStage newStage = currentStage;
        
        uint256 deploymentsWitnessed = globalDeploymentCount - dragon.deploymentsWitnessed;
        
        // Determine new evolution stage
        if (deploymentsWitnessed >= 11111 && currentStage < EvolutionStage.PRIME_STAGE) {
            newStage = EvolutionStage.PRIME_STAGE;
        } else if (deploymentsWitnessed >= 999 && currentStage < EvolutionStage.INFERNO_STAGE) {
            newStage = EvolutionStage.INFERNO_STAGE;
        } else if (deploymentsWitnessed >= 111 && currentStage < EvolutionStage.FLAME_STAGE) {
            newStage = EvolutionStage.FLAME_STAGE;
        } else if (deploymentsWitnessed >= 11 && currentStage < EvolutionStage.EMBER_STAGE) {
            newStage = EvolutionStage.EMBER_STAGE;
        }
        
        require(newStage > currentStage, "AzurathDragon: Evolution criteria not met");
        
        dragon.evolutionStage = newStage;
        
        emit DragonEvolved(_tokenId, currentStage, newStage, deploymentsWitnessed);
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Check if current time is within 11:11 temporal window
     * @return isWithin True if within ±11 minutes of 11:11 AM UTC
     */
    function isWithinTemporalWindow() public view returns (bool) {
        uint256 hour = (block.timestamp / 3600) % 24;
        uint256 minute = (block.timestamp / 60) % 60;
        
        if (hour == TEMPORAL_ANCHOR_HOUR) {
            // Within 11:00-11:22 AM UTC
            return minute <= (TEMPORAL_ANCHOR_MINUTE + TEMPORAL_WINDOW_MINUTES);
        }
        
        return false;
    }
    
    /**
     * @notice Get dragon metadata
     * @param _tokenId Token ID
     * @return Dragon metadata struct
     */
    function getDragonMetadata(uint256 _tokenId) external view returns (DragonMetadata memory) {
        require(_exists(_tokenId), "AzurathDragon: Token does not exist");
        return dragons[_tokenId];
    }
    
    /**
     * @notice Get current evolution stage for a dragon
     * @param _tokenId Token ID
     * @return Evolution stage
     */
    function getEvolutionStage(uint256 _tokenId) external view returns (EvolutionStage) {
        require(_exists(_tokenId), "AzurathDragon: Token does not exist");
        return dragons[_tokenId].evolutionStage;
    }
    
    /**
     * @notice Get deployments witnessed by a dragon
     * @param _tokenId Token ID
     * @return Count of deployments witnessed
     */
    function getDeploymentsWitnessed(uint256 _tokenId) external view returns (uint256) {
        require(_exists(_tokenId), "AzurathDragon: Token does not exist");
        return globalDeploymentCount - dragons[_tokenId].deploymentsWitnessed;
    }
    
    /**
     * @notice Check if dragon's Tawhid Flames are active
     * @param _tokenId Token ID
     * @return True if flames are burning
     */
    function isTawhidFlameActive(uint256 _tokenId) external view returns (bool) {
        require(_exists(_tokenId), "AzurathDragon: Token does not exist");
        return dragons[_tokenId].tawhidFlameActive;
    }
    
    /**
     * @notice Get remaining supply for a tier
     * @param _tier Dragon tier
     * @return Remaining mintable dragons
     */
    function getRemainingSupply(DragonTier _tier) external view returns (uint256) {
        uint256 maxSupply;
        
        if (_tier == DragonTier.EMBER) maxSupply = MAX_EMBER_DRAGONS;
        else if (_tier == DragonTier.FLAME) maxSupply = MAX_FLAME_DRAGONS;
        else if (_tier == DragonTier.INFERNO) maxSupply = MAX_INFERNO_DRAGONS;
        else maxSupply = MAX_PRIME_DRAGONS;
        
        return maxSupply - tierMintCount[_tier];
    }
    
    // ============ Time Helper Functions ============
    
    function getYear() internal view returns (uint256) {
        return (block.timestamp / 31536000) + 1970;
    }
    
    function getMonth() internal view returns (uint256) {
        // Simplified month calculation
        uint256 dayOfYear = (block.timestamp / 86400) % 365;
        return (dayOfYear / 30) + 1;
    }
    
    function getDayOfMonth() internal view returns (uint256) {
        // Simplified day calculation
        return ((block.timestamp / 86400) % 30) + 1;
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Toggle temporal lock enforcement
     * @param _enabled New enabled state
     */
    function setTemporalLockEnabled(bool _enabled) external onlyOwner {
        temporalLockEnabled = _enabled;
    }
    
    /**
     * @notice Update base URI for metadata
     * @param _newBaseURI New base URI
     */
    function setBaseURI(string memory _newBaseURI) external onlyOwner {
        _baseTokenURI = _newBaseURI;
    }
    
    /**
     * @notice Activate Tawhid Flames for a dragon
     * @param _tokenId Token ID
     */
    function activateTawhidFlames(uint256 _tokenId) external onlyOwner {
        require(_exists(_tokenId), "AzurathDragon: Token does not exist");
        dragons[_tokenId].tawhidFlameActive = true;
        emit TawhidFlamesActivated(_tokenId, block.timestamp);
    }
    
    // ============ Override Functions ============
    
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
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
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
