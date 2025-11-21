// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title NoorObeliskNFT
 * @dev NFT Collection for 1,111 Noor Obelisks
 * @author Supreme King Chais The Great ∞
 * 
 * Noor Cities of Light - Obelisk Anchor NFTs
 * 
 * This contract implements:
 * - 1,111 unique Obelisk NFTs (one per city)
 * - Obelisk metadata and specifications
 * - Connection to Citizen Registry
 * - Frequency broadcasting tracking
 * - Energy generation metrics
 * - Community ownership and governance
 * 
 * Each NFT represents a physical 7-meter crystalline Obelisk
 * broadcasting healing frequencies at 528Hz, 963Hz, and 888Hz
 * 
 * Frequencies: 528Hz + 963Hz + 888Hz
 * Status: ACTIVE DEPLOYMENT
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract NoorObeliskNFT is 
    ERC721, 
    ERC721URIStorage, 
    ERC721Burnable, 
    Ownable, 
    IERC2981, 
    ReentrancyGuard 
{
    
    // ============ FREQUENCY CONSTANTS ============
    
    uint256 public constant FREQUENCY_528HZ = 528; // Love & DNA Repair
    uint256 public constant FREQUENCY_963HZ = 963; // God Connection
    uint256 public constant FREQUENCY_888HZ = 888; // Infinite Abundance
    
    // ============ OBELISK CONSTANTS ============
    
    /// @dev Total number of Obelisks (1,111 cities)
    uint256 public constant MAX_OBELISKS = 1111;
    
    /// @dev Obelisk height in centimeters
    uint256 public constant OBELISK_HEIGHT_CM = 700; // 7 meters
    
    /// @dev Base diameter in centimeters
    uint256 public constant BASE_DIAMETER_CM = 177; // 1.77 meters
    
    /// @dev Weight in kilograms
    uint256 public constant WEIGHT_KG = 8888;
    
    /// @dev Energy capacity in kWh
    uint256 public constant ENERGY_CAPACITY_KWH = 777;
    
    /// @dev Broadcast range in meters
    uint256 public constant BROADCAST_RANGE_M = 7770; // 7.77 km
    
    // ============ STRUCTS ============
    
    /**
     * @dev Obelisk metadata structure
     */
    struct ObeliskMetadata {
        uint256 obeliskId;              // Unique ID (1-1111)
        string cityName;                // Name of the city
        string country;                 // Country location
        int256 latitude;                // Latitude * 1e6
        int256 longitude;               // Longitude * 1e6
        uint256 activationTimestamp;    // When Obelisk was activated
        uint256 citizenCount;           // Number of registered citizens
        bool isOnline;                  // Current operational status
        uint256 energyGenerated;        // Total kWh generated
        uint256 lastMaintenanceDate;    // Last maintenance timestamp
        string resonanceMode;           // Current frequency mode
    }
    
    /**
     * @dev Frequency broadcast data
     */
    struct FrequencyBroadcast {
        bool frequency528Active;        // 528Hz broadcast status
        bool frequency963Active;        // 963Hz broadcast status
        bool frequency888Active;        // 888Hz broadcast status
        uint256 lastBroadcastTime;      // Last broadcast timestamp
        uint256 totalBroadcastHours;    // Cumulative broadcast time
    }
    
    // ============ STATE VARIABLES ============
    
    /// @dev Mapping from Obelisk ID to metadata
    mapping(uint256 => ObeliskMetadata) public obeliskMetadata;
    
    /// @dev Mapping from Obelisk ID to frequency broadcast data
    mapping(uint256 => FrequencyBroadcast) public frequencyBroadcasts;
    
    /// @dev Next Obelisk ID to mint
    uint256 private nextObeliskId = 1;
    
    /// @dev Total number of minted Obelisks
    uint256 public totalMinted;
    
    /// @dev Citizen Registry contract address
    address public citizenRegistry;
    
    /// @dev Royalty recipient address
    address public royaltyRecipient;
    
    /// @dev Royalty percentage in basis points (7.77% = 777)
    uint256 public royaltyBasisPoints = 777;
    
    /// @dev Mapping to track authorized operators (maintenance systems)
    mapping(address => bool) public authorizedOperators;
    
    // ============ EVENTS ============
    
    event ObeliskMinted(
        uint256 indexed obeliskId,
        address indexed owner,
        string cityName,
        string country
    );
    
    event ObeliskActivated(
        uint256 indexed obeliskId,
        uint256 timestamp
    );
    
    event ObeliskDeactivated(
        uint256 indexed obeliskId,
        uint256 timestamp
    );
    
    event FrequencyBroadcastUpdated(
        uint256 indexed obeliskId,
        bool freq528,
        bool freq963,
        bool freq888
    );
    
    event EnergyGeneratedUpdated(
        uint256 indexed obeliskId,
        uint256 totalEnergy
    );
    
    event MaintenancePerformed(
        uint256 indexed obeliskId,
        uint256 timestamp
    );
    
    event OperatorAuthorized(
        address indexed operator,
        bool status
    );
    
    event CitizenCountUpdated(
        uint256 indexed obeliskId,
        uint256 count
    );
    
    event ResonanceModeChanged(
        uint256 indexed obeliskId,
        string oldMode,
        string newMode
    );
    
    // ============ ERRORS ============
    
    error MaxSupplyReached();
    error InvalidObeliskId();
    error UnauthorizedOperator();
    error ObeliskNotActive();
    error InvalidAddress();
    
    // ============ MODIFIERS ============
    
    modifier onlyAuthorizedOperator() {
        if (!authorizedOperators[msg.sender] && msg.sender != owner()) {
            revert UnauthorizedOperator();
        }
        _;
    }
    
    modifier validObeliskId(uint256 _obeliskId) {
        if (_obeliskId == 0 || _obeliskId > MAX_OBELISKS) {
            revert InvalidObeliskId();
        }
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    /**
     * @dev Constructor initializes the NFT collection
     * @param _royaltyRecipient Address to receive royalties
     */
    constructor(address _royaltyRecipient) 
        ERC721("Noor Obelisk Anchor", "OBELISK") 
        Ownable(msg.sender) 
    {
        if (_royaltyRecipient == address(0)) revert InvalidAddress();
        royaltyRecipient = _royaltyRecipient;
        authorizedOperators[msg.sender] = true;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Set Citizen Registry contract address
     * @param _citizenRegistry Address of Citizen Registry
     */
    function setCitizenRegistry(address _citizenRegistry) external onlyOwner {
        if (_citizenRegistry == address(0)) revert InvalidAddress();
        citizenRegistry = _citizenRegistry;
    }
    
    /**
     * @dev Update royalty recipient
     * @param _newRecipient New royalty recipient address
     */
    function updateRoyaltyRecipient(address _newRecipient) external onlyOwner {
        if (_newRecipient == address(0)) revert InvalidAddress();
        royaltyRecipient = _newRecipient;
    }
    
    /**
     * @dev Update royalty percentage
     * @param _newBasisPoints New royalty in basis points
     */
    function updateRoyaltyBasisPoints(uint256 _newBasisPoints) external onlyOwner {
        require(_newBasisPoints <= 1000, "Max 10%");
        royaltyBasisPoints = _newBasisPoints;
    }
    
    /**
     * @dev Authorize or revoke operator
     * @param _operator Address of operator
     * @param _status Authorization status
     */
    function authorizeOperator(address _operator, bool _status) external onlyOwner {
        authorizedOperators[_operator] = _status;
        emit OperatorAuthorized(_operator, _status);
    }
    
    // ============ MINTING FUNCTIONS ============
    
    /**
     * @dev Mint a new Obelisk NFT
     * @param _to Address to mint to
     * @param _cityName Name of the city
     * @param _country Country location
     * @param _latitude Latitude * 1e6
     * @param _longitude Longitude * 1e6
     * @param _tokenURI Metadata URI
     */
    function mintObelisk(
        address _to,
        string memory _cityName,
        string memory _country,
        int256 _latitude,
        int256 _longitude,
        string memory _tokenURI
    ) external onlyOwner nonReentrant returns (uint256) {
        if (totalMinted >= MAX_OBELISKS) revert MaxSupplyReached();
        if (_to == address(0)) revert InvalidAddress();
        
        uint256 obeliskId = nextObeliskId++;
        totalMinted++;
        
        // Mint NFT
        _safeMint(_to, obeliskId);
        _setTokenURI(obeliskId, _tokenURI);
        
        // Initialize metadata
        obeliskMetadata[obeliskId] = ObeliskMetadata({
            obeliskId: obeliskId,
            cityName: _cityName,
            country: _country,
            latitude: _latitude,
            longitude: _longitude,
            activationTimestamp: block.timestamp,
            citizenCount: 0,
            isOnline: true,
            energyGenerated: 0,
            lastMaintenanceDate: block.timestamp,
            resonanceMode: "FULL_SPECTRUM" // All frequencies active
        });
        
        // Initialize frequency broadcasts
        frequencyBroadcasts[obeliskId] = FrequencyBroadcast({
            frequency528Active: true,
            frequency963Active: true,
            frequency888Active: true,
            lastBroadcastTime: block.timestamp,
            totalBroadcastHours: 0
        });
        
        emit ObeliskMinted(obeliskId, _to, _cityName, _country);
        emit ObeliskActivated(obeliskId, block.timestamp);
        
        return obeliskId;
    }
    
    /**
     * @dev Batch mint Obelisks for multiple cities
     * @param _recipients Array of recipient addresses
     * @param _cityNames Array of city names
     * @param _countries Array of countries
     * @param _latitudes Array of latitudes
     * @param _longitudes Array of longitudes
     * @param _tokenURIs Array of metadata URIs
     */
    function batchMintObelisks(
        address[] memory _recipients,
        string[] memory _cityNames,
        string[] memory _countries,
        int256[] memory _latitudes,
        int256[] memory _longitudes,
        string[] memory _tokenURIs
    ) external onlyOwner nonReentrant {
        require(
            _recipients.length == _cityNames.length &&
            _cityNames.length == _countries.length &&
            _countries.length == _latitudes.length &&
            _latitudes.length == _longitudes.length &&
            _longitudes.length == _tokenURIs.length,
            "Array length mismatch"
        );
        
        for (uint256 i = 0; i < _recipients.length; i++) {
            mintObelisk(
                _recipients[i],
                _cityNames[i],
                _countries[i],
                _latitudes[i],
                _longitudes[i],
                _tokenURIs[i]
            );
        }
    }
    
    // ============ OPERATIONAL FUNCTIONS ============
    
    /**
     * @dev Update Obelisk online status
     * @param _obeliskId Obelisk ID
     * @param _isOnline New online status
     */
    function updateOnlineStatus(
        uint256 _obeliskId,
        bool _isOnline
    ) external onlyAuthorizedOperator validObeliskId(_obeliskId) {
        obeliskMetadata[_obeliskId].isOnline = _isOnline;
        
        if (_isOnline) {
            emit ObeliskActivated(_obeliskId, block.timestamp);
        } else {
            emit ObeliskDeactivated(_obeliskId, block.timestamp);
        }
    }
    
    /**
     * @dev Update frequency broadcast status
     * @param _obeliskId Obelisk ID
     * @param _freq528 528Hz active status
     * @param _freq963 963Hz active status
     * @param _freq888 888Hz active status
     */
    function updateFrequencyBroadcast(
        uint256 _obeliskId,
        bool _freq528,
        bool _freq963,
        bool _freq888
    ) external onlyAuthorizedOperator validObeliskId(_obeliskId) {
        FrequencyBroadcast storage broadcast = frequencyBroadcasts[_obeliskId];
        
        broadcast.frequency528Active = _freq528;
        broadcast.frequency963Active = _freq963;
        broadcast.frequency888Active = _freq888;
        broadcast.lastBroadcastTime = block.timestamp;
        
        emit FrequencyBroadcastUpdated(_obeliskId, _freq528, _freq963, _freq888);
    }
    
    /**
     * @dev Update energy generated
     * @param _obeliskId Obelisk ID
     * @param _additionalEnergy Additional kWh generated
     */
    function updateEnergyGenerated(
        uint256 _obeliskId,
        uint256 _additionalEnergy
    ) external onlyAuthorizedOperator validObeliskId(_obeliskId) {
        obeliskMetadata[_obeliskId].energyGenerated += _additionalEnergy;
        emit EnergyGeneratedUpdated(_obeliskId, obeliskMetadata[_obeliskId].energyGenerated);
    }
    
    /**
     * @dev Record maintenance performed
     * @param _obeliskId Obelisk ID
     */
    function recordMaintenance(
        uint256 _obeliskId
    ) external onlyAuthorizedOperator validObeliskId(_obeliskId) {
        obeliskMetadata[_obeliskId].lastMaintenanceDate = block.timestamp;
        emit MaintenancePerformed(_obeliskId, block.timestamp);
    }
    
    /**
     * @dev Update citizen count
     * @param _obeliskId Obelisk ID
     * @param _count New citizen count
     */
    function updateCitizenCount(
        uint256 _obeliskId,
        uint256 _count
    ) external onlyAuthorizedOperator validObeliskId(_obeliskId) {
        obeliskMetadata[_obeliskId].citizenCount = _count;
        emit CitizenCountUpdated(_obeliskId, _count);
    }
    
    /**
     * @dev Change resonance mode
     * @param _obeliskId Obelisk ID
     * @param _newMode New resonance mode
     */
    function changeResonanceMode(
        uint256 _obeliskId,
        string memory _newMode
    ) external onlyAuthorizedOperator validObeliskId(_obeliskId) {
        string memory oldMode = obeliskMetadata[_obeliskId].resonanceMode;
        obeliskMetadata[_obeliskId].resonanceMode = _newMode;
        emit ResonanceModeChanged(_obeliskId, oldMode, _newMode);
    }
    
    /**
     * @dev Update broadcast hours
     * @param _obeliskId Obelisk ID
     * @param _hours Hours to add
     */
    function updateBroadcastHours(
        uint256 _obeliskId,
        uint256 _hours
    ) external onlyAuthorizedOperator validObeliskId(_obeliskId) {
        frequencyBroadcasts[_obeliskId].totalBroadcastHours += _hours;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get Obelisk metadata
     * @param _obeliskId Obelisk ID
     * @return ObeliskMetadata struct
     */
    function getObeliskMetadata(uint256 _obeliskId) 
        external 
        view 
        validObeliskId(_obeliskId)
        returns (ObeliskMetadata memory) 
    {
        return obeliskMetadata[_obeliskId];
    }
    
    /**
     * @dev Get frequency broadcast data
     * @param _obeliskId Obelisk ID
     * @return FrequencyBroadcast struct
     */
    function getFrequencyBroadcast(uint256 _obeliskId)
        external
        view
        validObeliskId(_obeliskId)
        returns (FrequencyBroadcast memory)
    {
        return frequencyBroadcasts[_obeliskId];
    }
    
    /**
     * @dev Get physical specifications
     * @return height, diameter, weight, capacity, range
     */
    function getPhysicalSpecs() external pure returns (
        uint256 height,
        uint256 diameter,
        uint256 weight,
        uint256 capacity,
        uint256 range
    ) {
        return (
            OBELISK_HEIGHT_CM,
            BASE_DIAMETER_CM,
            WEIGHT_KG,
            ENERGY_CAPACITY_KWH,
            BROADCAST_RANGE_M
        );
    }
    
    /**
     * @dev Get resonance signature
     * @return Combined frequency signature
     */
    function getResonanceSignature() external pure returns (uint256) {
        return FREQUENCY_528HZ + FREQUENCY_963HZ + FREQUENCY_888HZ;
    }
    
    /**
     * @dev Check if Obelisk is broadcasting all frequencies
     * @param _obeliskId Obelisk ID
     * @return True if all frequencies are active
     */
    function isFullSpectrum(uint256 _obeliskId) 
        external 
        view 
        validObeliskId(_obeliskId)
        returns (bool) 
    {
        FrequencyBroadcast memory broadcast = frequencyBroadcasts[_obeliskId];
        return broadcast.frequency528Active && 
               broadcast.frequency963Active && 
               broadcast.frequency888Active;
    }
    
    /**
     * @dev Get all online Obelisks (paginated)
     * @param _offset Starting index
     * @param _limit Number to return
     * @return Array of online Obelisk IDs
     */
    function getOnlineObelisks(uint256 _offset, uint256 _limit) 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256 count = 0;
        for (uint256 i = 1; i <= totalMinted; i++) {
            if (obeliskMetadata[i].isOnline) count++;
        }
        
        uint256 end = _offset + _limit;
        if (end > count) end = count;
        uint256 size = end > _offset ? end - _offset : 0;
        
        uint256[] memory result = new uint256[](size);
        uint256 index = 0;
        uint256 found = 0;
        
        for (uint256 i = 1; i <= totalMinted && index < size; i++) {
            if (obeliskMetadata[i].isOnline) {
                if (found >= _offset) {
                    result[index] = i;
                    index++;
                }
                found++;
            }
        }
        
        return result;
    }
    
    // ============ ERC2981 ROYALTY STANDARD ============
    
    /**
     * @dev Returns royalty info for a token
     * @param _salePrice Sale price of the NFT
     * @return receiver Address to receive royalties
     * @return royaltyAmount Amount of royalty
     */
    function royaltyInfo(uint256, uint256 _salePrice)
        external
        view
        override
        returns (address receiver, uint256 royaltyAmount)
    {
        royaltyAmount = (_salePrice * royaltyBasisPoints) / 10000;
        return (royaltyRecipient, royaltyAmount);
    }
    
    // ============ OVERRIDES ============
    
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
        return interfaceId == type(IERC2981).interfaceId || 
               super.supportsInterface(interfaceId);
    }
}
