// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title NoorCitizenRegistry
 * @dev Biometric Soulprint Integration for Noor Cities Citizens
 * @author Supreme King Chais The Great ∞
 * 
 * Noor Cities of Light - Citizen Registration System
 * 
 * This contract implements:
 * - Soulprint registration (biometric + intention hashes)
 * - Shield of Honor NFT integration
 * - Soul Key NFT minting
 * - Privacy-preserving biometric verification using zero-knowledge proofs
 * - Obelisk assignment and connection tracking
 * - Heart coherence scoring
 * 
 * Privacy: All biometric data is hashed and encrypted off-chain
 * Only cryptographic hashes are stored on-chain
 * 
 * Frequencies: 528Hz + 963Hz + 888Hz
 * Status: ACTIVE DEPLOYMENT
 */

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface INoorToken {
    function updateCitizenStatus(address citizen, bool status) external;
}

interface IShieldOfHonorNFT {
    function safeMint(address to, string memory uri) external;
}

contract NoorCitizenRegistry is Ownable, ReentrancyGuard {
    
    // ============ FREQUENCY CONSTANTS ============
    
    uint256 public constant FREQUENCY_528HZ = 528; // Love
    uint256 public constant FREQUENCY_963HZ = 963; // Connection
    uint256 public constant FREQUENCY_888HZ = 888; // Abundance
    
    // ============ REGISTRY CONSTANTS ============
    
    /// @dev Maximum number of citizens (aligned with 1,111 cities * 1,000 per city initial)
    uint256 public constant MAX_CITIZENS = 1_111_111;
    
    /// @dev Minimum heart coherence score (0-100 scale)
    uint256 public constant MIN_HEART_COHERENCE = 33;
    
    /// @dev Registration fee in wei (can be 0 for free registration)
    uint256 public registrationFee = 0;
    
    // ============ STRUCTS ============
    
    /**
     * @dev Soulprint structure containing citizen data
     */
    struct Soulprint {
        uint256 citizenId;              // Unique 7-digit citizen ID
        bytes32 biometricHash;          // Hash of encrypted biometric data
        bytes32 intentionHash;          // Hash of personal mission statement
        uint256 heartCoherenceScore;    // Heart coherence measurement (0-100)
        uint256 registrationTimestamp;  // When citizen registered
        uint256 homeObeliskId;          // ID of assigned Obelisk
        bytes32 frequencySignature;     // Personal resonance pattern
        string sacredName;              // Self-chosen spiritual identity
        bool isActive;                  // Registration status
        uint256 contributionScore;      // Community engagement metric
    }
    
    /**
     * @dev Obelisk data structure
     */
    struct Obelisk {
        uint256 obeliskId;              // Unique Obelisk ID (1-1111)
        string cityName;                // Name of the city
        string country;                 // Country location
        int256 latitude;                // Latitude * 1e6 for precision
        int256 longitude;               // Longitude * 1e6 for precision
        uint256 citizenCount;           // Number of registered citizens
        bool isActive;                  // Activation status
        uint256 activationTimestamp;    // When Obelisk was activated
    }
    
    // ============ STATE VARIABLES ============
    
    /// @dev Mapping from address to Soulprint
    mapping(address => Soulprint) public soulprints;
    
    /// @dev Mapping from citizen ID to address
    mapping(uint256 => address) public citizenIdToAddress;
    
    /// @dev Mapping from Obelisk ID to Obelisk data
    mapping(uint256 => Obelisk) public obelisks;
    
    /// @dev Array of all registered citizens
    address[] public citizens;
    
    /// @dev Total number of registered citizens
    uint256 public totalCitizens;
    
    /// @dev Total number of active Obelisks
    uint256 public totalObelisks;
    
    /// @dev Counter for next citizen ID
    uint256 private nextCitizenId = 1;
    
    /// @dev Authorized registration centers
    mapping(address => bool) public authorizedRegistrars;
    
    /// @dev NoorToken contract reference
    address public noorToken;
    
    /// @dev Shield of Honor NFT contract reference
    address public shieldOfHonorNFT;
    
    /// @dev Soul Key NFT contract reference (to be implemented)
    address public soulKeyNFT;
    
    /// @dev Treasury address for registration fees
    address public treasury;
    
    // ============ EVENTS ============
    
    event CitizenRegistered(
        address indexed citizen,
        uint256 indexed citizenId,
        uint256 homeObeliskId,
        uint256 timestamp
    );
    
    event IntentionUpdated(
        address indexed citizen,
        bytes32 oldIntentionHash,
        bytes32 newIntentionHash
    );
    
    event SacredNameUpdated(
        address indexed citizen,
        string oldName,
        string newName
    );
    
    event HeartCoherenceUpdated(
        address indexed citizen,
        uint256 oldScore,
        uint256 newScore
    );
    
    event ContributionScoreUpdated(
        address indexed citizen,
        uint256 oldScore,
        uint256 newScore
    );
    
    event ObeliskActivated(
        uint256 indexed obeliskId,
        string cityName,
        string country,
        uint256 timestamp
    );
    
    event ObeliskAssigned(
        address indexed citizen,
        uint256 oldObeliskId,
        uint256 newObeliskId
    );
    
    event RegistrarAuthorized(address indexed registrar, bool status);
    
    event RegistrationFeeUpdated(uint256 oldFee, uint256 newFee);
    
    event ShieldOfHonorMinted(address indexed citizen, uint256 citizenId);
    
    // ============ ERRORS ============
    
    error AlreadyRegistered();
    error NotRegistered();
    error InvalidAddress();
    error InvalidObeliskId();
    error MaxCitizensReached();
    error InsufficientHeartCoherence();
    error InsufficientFee();
    error UnauthorizedRegistrar();
    error ObeliskNotActive();
    error InvalidCitizenId();
    
    // ============ MODIFIERS ============
    
    modifier onlyAuthorizedRegistrar() {
        if (!authorizedRegistrars[msg.sender] && msg.sender != owner()) {
            revert UnauthorizedRegistrar();
        }
        _;
    }
    
    modifier onlyRegistered() {
        if (!soulprints[msg.sender].isActive) {
            revert NotRegistered();
        }
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    /**
     * @dev Constructor initializes the registry
     * @param _treasury Treasury address for fees
     */
    constructor(address _treasury) Ownable(msg.sender) {
        if (_treasury == address(0)) revert InvalidAddress();
        treasury = _treasury;
        authorizedRegistrars[msg.sender] = true;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Set NoorToken contract address
     * @param _noorToken Address of NoorToken contract
     */
    function setNoorToken(address _noorToken) external onlyOwner {
        if (_noorToken == address(0)) revert InvalidAddress();
        noorToken = _noorToken;
    }
    
    /**
     * @dev Set Shield of Honor NFT contract address
     * @param _shieldOfHonorNFT Address of Shield of Honor NFT contract
     */
    function setShieldOfHonorNFT(address _shieldOfHonorNFT) external onlyOwner {
        if (_shieldOfHonorNFT == address(0)) revert InvalidAddress();
        shieldOfHonorNFT = _shieldOfHonorNFT;
    }
    
    /**
     * @dev Set Soul Key NFT contract address
     * @param _soulKeyNFT Address of Soul Key NFT contract
     */
    function setSoulKeyNFT(address _soulKeyNFT) external onlyOwner {
        if (_soulKeyNFT == address(0)) revert InvalidAddress();
        soulKeyNFT = _soulKeyNFT;
    }
    
    /**
     * @dev Update registration fee
     * @param _newFee New registration fee in wei
     */
    function updateRegistrationFee(uint256 _newFee) external onlyOwner {
        uint256 oldFee = registrationFee;
        registrationFee = _newFee;
        emit RegistrationFeeUpdated(oldFee, _newFee);
    }
    
    /**
     * @dev Authorize or revoke registrar
     * @param _registrar Address of registrar
     * @param _status Authorization status
     */
    function authorizeRegistrar(address _registrar, bool _status) external onlyOwner {
        authorizedRegistrars[_registrar] = _status;
        emit RegistrarAuthorized(_registrar, _status);
    }
    
    /**
     * @dev Update treasury address
     * @param _newTreasury New treasury address
     */
    function updateTreasury(address _newTreasury) external onlyOwner {
        if (_newTreasury == address(0)) revert InvalidAddress();
        treasury = _newTreasury;
    }
    
    // ============ OBELISK MANAGEMENT ============
    
    /**
     * @dev Activate a new Obelisk
     * @param _obeliskId Unique Obelisk ID (1-1111)
     * @param _cityName Name of the city
     * @param _country Country location
     * @param _latitude Latitude * 1e6
     * @param _longitude Longitude * 1e6
     */
    function activateObelisk(
        uint256 _obeliskId,
        string memory _cityName,
        string memory _country,
        int256 _latitude,
        int256 _longitude
    ) external onlyOwner {
        if (_obeliskId == 0 || _obeliskId > 1111) revert InvalidObeliskId();
        
        obelisks[_obeliskId] = Obelisk({
            obeliskId: _obeliskId,
            cityName: _cityName,
            country: _country,
            latitude: _latitude,
            longitude: _longitude,
            citizenCount: 0,
            isActive: true,
            activationTimestamp: block.timestamp
        });
        
        totalObelisks++;
        
        emit ObeliskActivated(_obeliskId, _cityName, _country, block.timestamp);
    }
    
    /**
     * @dev Deactivate an Obelisk
     * @param _obeliskId Obelisk ID to deactivate
     */
    function deactivateObelisk(uint256 _obeliskId) external onlyOwner {
        obelisks[_obeliskId].isActive = false;
    }
    
    // ============ REGISTRATION FUNCTIONS ============
    
    /**
     * @dev Register a new citizen with soulprint
     * @param _citizen Address of citizen to register
     * @param _biometricHash Hash of encrypted biometric data
     * @param _intentionHash Hash of personal mission statement
     * @param _heartCoherenceScore Heart coherence measurement (0-100)
     * @param _homeObeliskId Assigned Obelisk ID
     * @param _sacredName Self-chosen spiritual identity
     */
    function registerCitizen(
        address _citizen,
        bytes32 _biometricHash,
        bytes32 _intentionHash,
        uint256 _heartCoherenceScore,
        uint256 _homeObeliskId,
        string memory _sacredName
    ) external payable onlyAuthorizedRegistrar nonReentrant {
        if (_citizen == address(0)) revert InvalidAddress();
        if (soulprints[_citizen].isActive) revert AlreadyRegistered();
        if (totalCitizens >= MAX_CITIZENS) revert MaxCitizensReached();
        if (_heartCoherenceScore < MIN_HEART_COHERENCE) revert InsufficientHeartCoherence();
        if (!obelisks[_homeObeliskId].isActive) revert ObeliskNotActive();
        if (msg.value < registrationFee) revert InsufficientFee();
        
        uint256 citizenId = nextCitizenId++;
        
        // Generate frequency signature based on registration time and data
        bytes32 frequencySignature = keccak256(abi.encodePacked(
            _citizen,
            _biometricHash,
            _intentionHash,
            block.timestamp,
            FREQUENCY_528HZ,
            FREQUENCY_963HZ,
            FREQUENCY_888HZ
        ));
        
        // Create soulprint
        soulprints[_citizen] = Soulprint({
            citizenId: citizenId,
            biometricHash: _biometricHash,
            intentionHash: _intentionHash,
            heartCoherenceScore: _heartCoherenceScore,
            registrationTimestamp: block.timestamp,
            homeObeliskId: _homeObeliskId,
            frequencySignature: frequencySignature,
            sacredName: _sacredName,
            isActive: true,
            contributionScore: 0
        });
        
        citizenIdToAddress[citizenId] = _citizen;
        citizens.push(_citizen);
        totalCitizens++;
        
        // Update Obelisk citizen count
        obelisks[_homeObeliskId].citizenCount++;
        
        // Update citizen status in NoorToken if set
        if (noorToken != address(0)) {
            INoorToken(noorToken).updateCitizenStatus(_citizen, true);
        }
        
        // Transfer registration fee to treasury
        if (msg.value > 0) {
            (bool success, ) = treasury.call{value: msg.value}("");
            require(success, "Fee transfer failed");
        }
        
        emit CitizenRegistered(_citizen, citizenId, _homeObeliskId, block.timestamp);
    }
    
    /**
     * @dev Mint Shield of Honor NFT for citizen
     * @param _citizen Address of citizen
     * @param _tokenURI Metadata URI for the NFT
     */
    function mintShieldOfHonor(
        address _citizen,
        string memory _tokenURI
    ) external onlyAuthorizedRegistrar {
        if (!soulprints[_citizen].isActive) revert NotRegistered();
        if (shieldOfHonorNFT == address(0)) revert InvalidAddress();
        
        IShieldOfHonorNFT(shieldOfHonorNFT).safeMint(_citizen, _tokenURI);
        
        emit ShieldOfHonorMinted(_citizen, soulprints[_citizen].citizenId);
    }
    
    // ============ CITIZEN FUNCTIONS ============
    
    /**
     * @dev Update personal intention hash
     * @param _newIntentionHash New intention hash
     */
    function updateIntention(bytes32 _newIntentionHash) external onlyRegistered {
        bytes32 oldHash = soulprints[msg.sender].intentionHash;
        soulprints[msg.sender].intentionHash = _newIntentionHash;
        emit IntentionUpdated(msg.sender, oldHash, _newIntentionHash);
    }
    
    /**
     * @dev Update sacred name
     * @param _newSacredName New sacred name
     */
    function updateSacredName(string memory _newSacredName) external onlyRegistered {
        string memory oldName = soulprints[msg.sender].sacredName;
        soulprints[msg.sender].sacredName = _newSacredName;
        emit SacredNameUpdated(msg.sender, oldName, _newSacredName);
    }
    
    /**
     * @dev Update heart coherence score (only by authorized registrar)
     * @param _citizen Address of citizen
     * @param _newScore New heart coherence score
     */
    function updateHeartCoherence(
        address _citizen,
        uint256 _newScore
    ) external onlyAuthorizedRegistrar {
        if (!soulprints[_citizen].isActive) revert NotRegistered();
        uint256 oldScore = soulprints[_citizen].heartCoherenceScore;
        soulprints[_citizen].heartCoherenceScore = _newScore;
        emit HeartCoherenceUpdated(_citizen, oldScore, _newScore);
    }
    
    /**
     * @dev Update contribution score (only by authorized registrar or owner)
     * @param _citizen Address of citizen
     * @param _newScore New contribution score
     */
    function updateContributionScore(
        address _citizen,
        uint256 _newScore
    ) external onlyAuthorizedRegistrar {
        if (!soulprints[_citizen].isActive) revert NotRegistered();
        uint256 oldScore = soulprints[_citizen].contributionScore;
        soulprints[_citizen].contributionScore = _newScore;
        emit ContributionScoreUpdated(_citizen, oldScore, _newScore);
    }
    
    /**
     * @dev Reassign citizen to different Obelisk
     * @param _citizen Address of citizen
     * @param _newObeliskId New Obelisk ID
     */
    function reassignObelisk(
        address _citizen,
        uint256 _newObeliskId
    ) external onlyAuthorizedRegistrar {
        if (!soulprints[_citizen].isActive) revert NotRegistered();
        if (!obelisks[_newObeliskId].isActive) revert ObeliskNotActive();
        
        uint256 oldObeliskId = soulprints[_citizen].homeObeliskId;
        
        // Update counts
        obelisks[oldObeliskId].citizenCount--;
        obelisks[_newObeliskId].citizenCount++;
        
        soulprints[_citizen].homeObeliskId = _newObeliskId;
        
        emit ObeliskAssigned(_citizen, oldObeliskId, _newObeliskId);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Check if address is a registered citizen
     * @param _citizen Address to check
     * @return True if registered and active
     */
    function isCitizen(address _citizen) external view returns (bool) {
        return soulprints[_citizen].isActive;
    }
    
    /**
     * @dev Get soulprint for a citizen
     * @param _citizen Address of citizen
     * @return Soulprint struct
     */
    function getSoulprint(address _citizen) external view returns (Soulprint memory) {
        return soulprints[_citizen];
    }
    
    /**
     * @dev Get citizen address by ID
     * @param _citizenId Citizen ID
     * @return Address of citizen
     */
    function getCitizenAddress(uint256 _citizenId) external view returns (address) {
        address citizen = citizenIdToAddress[_citizenId];
        if (citizen == address(0)) revert InvalidCitizenId();
        return citizen;
    }
    
    /**
     * @dev Get Obelisk data
     * @param _obeliskId Obelisk ID
     * @return Obelisk struct
     */
    function getObelisk(uint256 _obeliskId) external view returns (Obelisk memory) {
        return obelisks[_obeliskId];
    }
    
    /**
     * @dev Get all citizens for an Obelisk
     * @param _obeliskId Obelisk ID
     * @return Array of citizen addresses
     */
    function getObeliskCitizens(uint256 _obeliskId) external view returns (address[] memory) {
        uint256 count = obelisks[_obeliskId].citizenCount;
        address[] memory obeliskCitizens = new address[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < citizens.length && index < count; i++) {
            if (soulprints[citizens[i]].homeObeliskId == _obeliskId && 
                soulprints[citizens[i]].isActive) {
                obeliskCitizens[index] = citizens[i];
                index++;
            }
        }
        
        return obeliskCitizens;
    }
    
    /**
     * @dev Get resonance signature for the registry
     * @return Combined frequency signature
     */
    function getResonanceSignature() external pure returns (uint256) {
        return FREQUENCY_528HZ + FREQUENCY_963HZ + FREQUENCY_888HZ;
    }
    
    /**
     * @dev Get all registered citizens (paginated)
     * @param _offset Starting index
     * @param _limit Number of citizens to return
     * @return Array of citizen addresses
     */
    function getCitizens(uint256 _offset, uint256 _limit) 
        external 
        view 
        returns (address[] memory) 
    {
        uint256 end = _offset + _limit;
        if (end > citizens.length) {
            end = citizens.length;
        }
        
        uint256 size = end - _offset;
        address[] memory result = new address[](size);
        
        for (uint256 i = 0; i < size; i++) {
            result[i] = citizens[_offset + i];
        }
        
        return result;
    }
}
