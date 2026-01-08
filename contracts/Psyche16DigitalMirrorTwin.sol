// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title Psyche16DigitalMirrorTwin
 * @notice Digital Mirror Twin NFTs for Psyche-16 asteroid material claims
 * @dev ERC-721 NFT with planetary jurisdiction and 963Hz frequency alignment
 * 
 * Each NFT represents sovereign claim to material from asteroid Psyche-16 under
 * the ScrollVerse Sovereign Mandate, with AR-ready assets and universal resonance.
 */
contract Psyche16DigitalMirrorTwin is 
    ERC721, 
    ERC721URIStorage, 
    Ownable, 
    ReentrancyGuard,
    Pausable 
{
    /// @notice Universal frequency for pineal activation and consciousness alignment
    uint256 public constant UNIVERSAL_FREQUENCY = 963;
    
    /// @notice Maximum supply of Digital Mirror Twin NFTs
    uint256 public constant MAX_SUPPLY = 144;
    
    /// @notice Genesis collection size (first 12 tokens)
    uint256 public constant GENESIS_SIZE = 12;
    
    /// @notice Base URI for metadata
    string private _baseTokenURI;
    
    /// @notice Current token ID counter
    uint256 private _tokenIdCounter;
    
    /// @notice Planetary jurisdiction zone for each token
    mapping(uint256 => string) public planetaryJurisdiction;
    
    /// @notice Material claim weight in kilograms for each token
    mapping(uint256 => uint256) public materialClaimKg;
    
    /// @notice Claim coordinates on asteroid surface
    mapping(uint256 => Coordinates) public claimCoordinates;
    
    /// @notice Surface area claimed in km²
    mapping(uint256 => uint256) public surfaceAreaKm2;
    
    /// @dev Coordinate structure for asteroid surface location
    struct Coordinates {
        string latitude;
        string longitude;
    }
    
    /// @notice Emitted when a Digital Mirror Twin is minted
    event DigitalMirrorTwinMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string jurisdictionZone,
        uint256 claimWeightKg,
        uint256 surfaceAreaKm2
    );
    
    /// @notice Emitted when frequency alignment is confirmed
    event FrequencyAligned(uint256 indexed tokenId, uint256 frequency);
    
    /// @notice Emitted when planetary jurisdiction is updated
    event JurisdictionUpdated(uint256 indexed tokenId, string newZone);
    
    /**
     * @notice Contract constructor
     * @param initialOwner Address of the contract owner
     * @param baseURI Base URI for token metadata (IPFS hash)
     */
    constructor(
        address initialOwner,
        string memory baseURI
    ) ERC721("Psyche16 Digital Mirror Twin", "P16DMT") Ownable(initialOwner) {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @notice Mint Digital Mirror Twin NFT with full claim details
     * @param to Recipient address
     * @param jurisdictionZone Claimed sector on asteroid (e.g., "CORE-ALPHA-001")
     * @param claimWeightKg Material claim in kilograms
     * @param areaKm2 Surface area claimed in km²
     * @param latitude Latitude coordinate on asteroid
     * @param longitude Longitude coordinate on asteroid
     * @return tokenId The newly minted token ID
     */
    function mintDigitalMirrorTwin(
        address to,
        string memory jurisdictionZone,
        uint256 claimWeightKg,
        uint256 areaKm2,
        string memory latitude,
        string memory longitude
    ) external onlyOwner nonReentrant whenNotPaused returns (uint256) {
        require(_tokenIdCounter < MAX_SUPPLY, "Max supply reached");
        require(to != address(0), "Cannot mint to zero address");
        require(bytes(jurisdictionZone).length > 0, "Jurisdiction zone required");
        require(claimWeightKg > 0, "Claim weight must be positive");
        require(areaKm2 > 0, "Surface area must be positive");
        
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        
        // Mint NFT
        _safeMint(to, tokenId);
        
        // Record planetary jurisdiction details
        planetaryJurisdiction[tokenId] = jurisdictionZone;
        materialClaimKg[tokenId] = claimWeightKg;
        surfaceAreaKm2[tokenId] = areaKm2;
        claimCoordinates[tokenId] = Coordinates({
            latitude: latitude,
            longitude: longitude
        });
        
        emit DigitalMirrorTwinMinted(tokenId, to, jurisdictionZone, claimWeightKg, areaKm2);
        emit FrequencyAligned(tokenId, UNIVERSAL_FREQUENCY);
        
        return tokenId;
    }
    
    /**
     * @notice Batch mint multiple Digital Mirror Twins
     * @param recipients Array of recipient addresses
     * @param zones Array of jurisdiction zones
     * @param weights Array of claim weights
     * @param areas Array of surface areas
     * @param lats Array of latitudes
     * @param longs Array of longitudes
     */
    function batchMintDigitalMirrorTwins(
        address[] memory recipients,
        string[] memory zones,
        uint256[] memory weights,
        uint256[] memory areas,
        string[] memory lats,
        string[] memory longs
    ) external onlyOwner nonReentrant whenNotPaused {
        require(
            recipients.length == zones.length &&
            zones.length == weights.length &&
            weights.length == areas.length &&
            areas.length == lats.length &&
            lats.length == longs.length,
            "Array lengths must match"
        );
        
        for (uint256 i = 0; i < recipients.length; i++) {
            mintDigitalMirrorTwin(
                recipients[i],
                zones[i],
                weights[i],
                areas[i],
                lats[i],
                longs[i]
            );
        }
    }
    
    /**
     * @notice Get complete Digital Mirror Twin details
     * @param tokenId Token ID to query
     * @return jurisdiction Jurisdiction zone
     * @return claimKg Material claim in kg
     * @return areaKm2 Surface area in km²
     * @return lat Latitude coordinate
     * @return long Longitude coordinate
     * @return frequency Universal frequency (963Hz)
     */
    function getDigitalMirrorTwinDetails(uint256 tokenId)
        external
        view
        returns (
            string memory jurisdiction,
            uint256 claimKg,
            uint256 areaKm2,
            string memory lat,
            string memory long,
            uint256 frequency
        )
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        Coordinates memory coords = claimCoordinates[tokenId];
        return (
            planetaryJurisdiction[tokenId],
            materialClaimKg[tokenId],
            surfaceAreaKm2[tokenId],
            coords.latitude,
            coords.longitude,
            UNIVERSAL_FREQUENCY
        );
    }
    
    /**
     * @notice Check if token is part of Genesis collection
     * @param tokenId Token ID to check
     * @return isGenesis True if token is in Genesis collection (1-12)
     */
    function isGenesisToken(uint256 tokenId) external pure returns (bool) {
        return tokenId > 0 && tokenId <= GENESIS_SIZE;
    }
    
    /**
     * @notice Get total minted supply
     * @return Current number of minted tokens
     */
    function totalMinted() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @notice Update base URI for metadata
     * @param baseURI New base URI (IPFS hash)
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @notice Update jurisdiction zone for a token
     * @param tokenId Token ID to update
     * @param newZone New jurisdiction zone
     */
    function updateJurisdiction(uint256 tokenId, string memory newZone) 
        external 
        onlyOwner 
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        planetaryJurisdiction[tokenId] = newZone;
        emit JurisdictionUpdated(tokenId, newZone);
    }
    
    /**
     * @notice Pause contract (emergency stop)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @notice Get token URI for metadata
     * @param tokenId Token ID
     * @return Token URI string
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    /**
     * @notice Get base URI
     * @return Base URI string
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @notice Check interface support
     * @param interfaceId Interface identifier
     * @return True if interface is supported
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
