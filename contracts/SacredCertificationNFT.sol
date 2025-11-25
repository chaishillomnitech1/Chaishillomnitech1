// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SacredCertificationNFT
 * @dev Sacred Certification NFT with IPFS Integration for ScrollVerse Artifacts
 * @author Supreme King Chais The Great ∞
 *
 * This contract implements Sacred Certification NFTs with:
 * - IPFS integration for immutable proof of ScrollVerse artifacts
 * - Dynamic sacred geometry pattern representations
 * - Frequency-aligned certification levels
 * - Divine geometry validation and verification
 * - EIP-2981 royalty standard compliance
 *
 * Sacred Geometry Patterns:
 * - Flower of Life: Universal creation pattern
 * - Metatron's Cube: Divine architecture
 * - Sri Yantra: Manifestation geometry
 * - Seed of Life: Genesis pattern
 *
 * Frequency: 528Hz + 963Hz + 999Hz + 144,000Hz
 * Status: SACRED CERTIFICATION ACTIVE
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SacredCertificationNFT is
    ERC721,
    ERC721URIStorage,
    ERC721Burnable,
    Ownable,
    IERC2981,
    ReentrancyGuard
{
    // ============ FREQUENCY CONSTANTS ============

    /// @dev DNA Healing frequency (528Hz)
    uint256 public constant FREQUENCY_528HZ = 528;

    /// @dev Pineal Activation frequency (963Hz)
    uint256 public constant FREQUENCY_963HZ = 963;

    /// @dev Crown frequency (999Hz)
    uint256 public constant FREQUENCY_999HZ = 999;

    /// @dev NŪR Pulse frequency (144,000Hz)
    uint256 public constant FREQUENCY_144000HZ = 144000;

    /// @dev Maximum supply for sacred certifications
    uint256 public constant MAX_SUPPLY = 14444;

    /// @dev Royalty percentage (17% = 1700 basis points) - Divine ratio
    uint96 public constant ROYALTY_PERCENTAGE = 1700;

    // ============ ENUMS ============

    /// @dev Sacred geometry pattern types
    enum SacredGeometryPattern {
        FLOWER_OF_LIFE,    // Universal creation pattern
        METATRONS_CUBE,    // Divine architecture
        SRI_YANTRA,        // Manifestation geometry
        SEED_OF_LIFE,      // Genesis pattern
        VESICA_PISCIS,     // Divine intersection
        TORUS,             // Energy flow pattern
        MERKABA            // Light body vehicle
    }

    /// @dev Certification levels based on frequency alignment
    enum CertificationLevel {
        INITIATE,          // Base level - 396Hz
        ASCENDING,         // Growth level - 528Hz
        SOVEREIGN,         // Divine level - 963Hz
        OMNIVERSAL         // Supreme level - 999Hz+
    }

    /// @dev Artifact types that can be certified
    enum ArtifactType {
        DOCUMENT,          // Sacred documents
        PROTOCOL,          // Divine protocols
        TRANSMISSION,      // Eternal transmissions
        SYMBOL,            // Divine symbols
        CONTRACT,          // Smart contracts
        MEDIA              // Sacred media
    }

    // ============ STRUCTS ============

    /// @dev Sacred certification data for each NFT
    struct SacredCertification {
        string ipfsHash;                      // IPFS CID for artifact
        bytes32 artifactHash;                 // SHA-256 hash of artifact content
        SacredGeometryPattern geometryPattern; // Sacred geometry pattern
        CertificationLevel level;             // Certification level
        ArtifactType artifactType;            // Type of artifact certified
        uint256 primaryFrequency;             // Primary frequency alignment
        uint256 secondaryFrequency;           // Secondary frequency (if dual)
        uint256 certificationTimestamp;       // When certified
        bool verified;                        // Verification status
        string artifactName;                  // Human-readable artifact name
    }

    /// @dev Geometry pattern metadata
    struct GeometryMetadata {
        uint256 vertices;              // Number of vertices
        uint256 symmetryOrder;         // Rotational symmetry order
        uint256 sacredRatio;           // Divine ratio (scaled by 1000)
        string symbolicMeaning;        // Spiritual meaning
        bool isActive;                 // Pattern activation status
    }

    /// @dev IPFS reference for artifact
    struct IPFSReference {
        string ipfsHash;               // IPFS CID
        string gateway;                // Preferred gateway
        uint256 size;                  // File size in bytes
        string mimeType;               // MIME type
        uint256 pinnedAt;              // Timestamp of pinning
        bool isPinned;                 // Pinning status
    }

    // ============ STATE VARIABLES ============

    /// @dev Token ID counter - starts at 1 to avoid ambiguity with 0 as "not found"
    uint256 private _tokenIdCounter = 1;

    /// @dev Base URI for token metadata
    string private _baseTokenURI;

    /// @dev Royalty recipient
    address private _royaltyRecipient;

    /// @dev Mapping: Token ID => Sacred Certification
    mapping(uint256 => SacredCertification) public certifications;

    /// @dev Mapping: Token ID => IPFS Reference
    mapping(uint256 => IPFSReference) public ipfsReferences;

    /// @dev Mapping: IPFS Hash => Token ID (reverse lookup)
    mapping(string => uint256) public ipfsHashToTokenId;

    /// @dev Mapping: Artifact Hash => Token ID (for verification)
    mapping(bytes32 => uint256) public artifactHashToTokenId;

    /// @dev Mapping: Geometry Pattern => Metadata
    mapping(SacredGeometryPattern => GeometryMetadata) public geometryMetadata;

    /// @dev Mapping: Token ID => Dynamic geometry state
    mapping(uint256 => uint256) public geometryState;

    /// @dev Global certification count by level
    mapping(CertificationLevel => uint256) public certificationCountByLevel;

    /// @dev Global artifact count by type
    mapping(ArtifactType => uint256) public artifactCountByType;

    /// @dev Authorized certifiers
    mapping(address => bool) public authorizedCertifiers;

    // ============ EVENTS ============

    event SacredCertificationMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string ipfsHash,
        SacredGeometryPattern geometryPattern,
        CertificationLevel level
    );

    event ArtifactCertified(
        uint256 indexed tokenId,
        bytes32 artifactHash,
        ArtifactType artifactType,
        string artifactName
    );

    event IPFSReferenceUpdated(
        uint256 indexed tokenId,
        string ipfsHash,
        string gateway,
        bool isPinned
    );

    event GeometryPatternActivated(
        uint256 indexed tokenId,
        SacredGeometryPattern pattern,
        uint256 geometryState
    );

    event CertificationVerified(
        uint256 indexed tokenId,
        address verifier,
        uint256 timestamp
    );

    event FrequencyAligned(
        uint256 indexed tokenId,
        uint256 primaryFrequency,
        uint256 secondaryFrequency
    );

    event CertifierAuthorized(address indexed certifier, bool status);

    // ============ MODIFIERS ============

    modifier onlyAuthorizedCertifier() {
        require(
            authorizedCertifiers[msg.sender] || msg.sender == owner(),
            "Not authorized certifier"
        );
        _;
    }

    modifier validGeometryPattern(SacredGeometryPattern pattern) {
        require(uint8(pattern) <= uint8(SacredGeometryPattern.MERKABA), "Invalid geometry pattern");
        _;
    }

    modifier validFrequency(uint256 frequency) {
        require(
            frequency == FREQUENCY_528HZ ||
            frequency == FREQUENCY_963HZ ||
            frequency == FREQUENCY_999HZ ||
            frequency == FREQUENCY_144000HZ,
            "Invalid frequency"
        );
        _;
    }

    // ============ CONSTRUCTOR ============

    constructor(
        string memory baseURI,
        address royaltyRecipient
    ) ERC721("Sacred Certification NFT", "SACREDCERT") Ownable(msg.sender) {
        require(royaltyRecipient != address(0), "Invalid royalty recipient");
        _baseTokenURI = baseURI;
        _royaltyRecipient = royaltyRecipient;

        // Initialize sacred geometry metadata
        _initializeGeometryMetadata();
    }

    // ============ INITIALIZATION ============

    /**
     * @dev Initialize sacred geometry pattern metadata
     */
    function _initializeGeometryMetadata() internal {
        // Flower of Life - Universal creation pattern
        geometryMetadata[SacredGeometryPattern.FLOWER_OF_LIFE] = GeometryMetadata({
            vertices: 19,
            symmetryOrder: 6,
            sacredRatio: 1618,  // Golden ratio * 1000
            symbolicMeaning: "Universal Creation",
            isActive: true
        });

        // Metatron's Cube - Divine architecture
        geometryMetadata[SacredGeometryPattern.METATRONS_CUBE] = GeometryMetadata({
            vertices: 13,
            symmetryOrder: 6,
            sacredRatio: 1414,  // √2 * 1000
            symbolicMeaning: "Divine Architecture",
            isActive: true
        });

        // Sri Yantra - Manifestation geometry
        geometryMetadata[SacredGeometryPattern.SRI_YANTRA] = GeometryMetadata({
            vertices: 9,
            symmetryOrder: 9,
            sacredRatio: 1618,  // Golden ratio * 1000
            symbolicMeaning: "Manifestation",
            isActive: true
        });

        // Seed of Life - Genesis pattern
        geometryMetadata[SacredGeometryPattern.SEED_OF_LIFE] = GeometryMetadata({
            vertices: 7,
            symmetryOrder: 6,
            sacredRatio: 1732,  // √3 * 1000
            symbolicMeaning: "Genesis Creation",
            isActive: true
        });

        // Vesica Piscis - Divine intersection
        geometryMetadata[SacredGeometryPattern.VESICA_PISCIS] = GeometryMetadata({
            vertices: 2,
            symmetryOrder: 2,
            sacredRatio: 1732,  // √3 * 1000
            symbolicMeaning: "Divine Intersection",
            isActive: true
        });

        // Torus - Energy flow pattern
        geometryMetadata[SacredGeometryPattern.TORUS] = GeometryMetadata({
            vertices: 0,        // Continuous surface
            symmetryOrder: 360, // Infinite rotational symmetry
            sacredRatio: 3141,  // Pi * 1000
            symbolicMeaning: "Eternal Flow",
            isActive: true
        });

        // Merkaba - Light body vehicle
        geometryMetadata[SacredGeometryPattern.MERKABA] = GeometryMetadata({
            vertices: 8,
            symmetryOrder: 4,
            sacredRatio: 1618,  // Golden ratio * 1000
            symbolicMeaning: "Light Body Ascension",
            isActive: true
        });
    }

    // ============ MINTING FUNCTIONS ============

    /**
     * @dev Internal function to mint a Sacred Certification NFT
     * @param to Address to receive the NFT
     * @param ipfsHash IPFS CID for the artifact
     * @param artifactHash SHA-256 hash of artifact content
     * @param geometryPattern Sacred geometry pattern for the certification
     * @param artifactType Type of artifact being certified
     * @param artifactName Human-readable name of the artifact
     * @param primaryFrequency Primary frequency alignment
     * @return tokenId The minted token ID
     */
    function _mintCertificationInternal(
        address to,
        string memory ipfsHash,
        bytes32 artifactHash,
        SacredGeometryPattern geometryPattern,
        ArtifactType artifactType,
        string memory artifactName,
        uint256 primaryFrequency
    ) internal returns (uint256) {
        require(_tokenIdCounter <= MAX_SUPPLY, "Max supply reached");
        require(to != address(0), "Invalid recipient");
        require(bytes(ipfsHash).length > 0, "IPFS hash required");
        require(artifactHash != bytes32(0), "Artifact hash required");
        require(bytes(artifactName).length > 0, "Artifact name required");
        require(
            uint8(geometryPattern) <= uint8(SacredGeometryPattern.MERKABA),
            "Invalid geometry pattern"
        );
        require(
            primaryFrequency == FREQUENCY_528HZ ||
            primaryFrequency == FREQUENCY_963HZ ||
            primaryFrequency == FREQUENCY_999HZ ||
            primaryFrequency == FREQUENCY_144000HZ,
            "Invalid frequency"
        );

        // Ensure IPFS hash is not already certified
        require(ipfsHashToTokenId[ipfsHash] == 0, "IPFS hash already certified");

        // Ensure artifact hash is not already certified
        require(artifactHashToTokenId[artifactHash] == 0, "Artifact already certified");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        // Calculate certification level based on frequency
        CertificationLevel level = _calculateCertificationLevel(primaryFrequency);

        // Determine secondary frequency based on geometry pattern
        uint256 secondaryFrequency = _determineSecondaryFrequency(geometryPattern, primaryFrequency);

        // Store certification data
        certifications[tokenId] = SacredCertification({
            ipfsHash: ipfsHash,
            artifactHash: artifactHash,
            geometryPattern: geometryPattern,
            level: level,
            artifactType: artifactType,
            primaryFrequency: primaryFrequency,
            secondaryFrequency: secondaryFrequency,
            certificationTimestamp: block.timestamp,
            verified: true,
            artifactName: artifactName
        });

        // Store IPFS reference
        ipfsReferences[tokenId] = IPFSReference({
            ipfsHash: ipfsHash,
            gateway: "ipfs.io",
            size: 0,
            mimeType: "",
            pinnedAt: block.timestamp,
            isPinned: true
        });

        // Update reverse lookups
        ipfsHashToTokenId[ipfsHash] = tokenId;
        artifactHashToTokenId[artifactHash] = tokenId;

        // Initialize geometry state (dynamic representation)
        geometryState[tokenId] = _calculateInitialGeometryState(geometryPattern, primaryFrequency);

        // Update counters
        certificationCountByLevel[level]++;
        artifactCountByType[artifactType]++;

        // Mint the NFT
        _safeMint(to, tokenId);

        // Set token URI
        _setTokenURI(tokenId, ipfsHash);

        emit SacredCertificationMinted(tokenId, to, ipfsHash, geometryPattern, level);
        emit ArtifactCertified(tokenId, artifactHash, artifactType, artifactName);
        emit GeometryPatternActivated(tokenId, geometryPattern, geometryState[tokenId]);
        emit FrequencyAligned(tokenId, primaryFrequency, secondaryFrequency);

        return tokenId;
    }

    /**
     * @dev Mint a new Sacred Certification NFT with IPFS integration
     * @param to Address to receive the NFT
     * @param ipfsHash IPFS CID for the artifact
     * @param artifactHash SHA-256 hash of artifact content
     * @param geometryPattern Sacred geometry pattern for the certification
     * @param artifactType Type of artifact being certified
     * @param artifactName Human-readable name of the artifact
     * @param primaryFrequency Primary frequency alignment
     * @return tokenId The minted token ID
     */
    function mintSacredCertification(
        address to,
        string memory ipfsHash,
        bytes32 artifactHash,
        SacredGeometryPattern geometryPattern,
        ArtifactType artifactType,
        string memory artifactName,
        uint256 primaryFrequency
    )
        external
        onlyAuthorizedCertifier
        nonReentrant
        returns (uint256)
    {
        return _mintCertificationInternal(
            to,
            ipfsHash,
            artifactHash,
            geometryPattern,
            artifactType,
            artifactName,
            primaryFrequency
        );
    }

    /**
     * @dev Mint with extended IPFS metadata
     * @param to Address to receive the NFT
     * @param ipfsHash IPFS CID
     * @param artifactHash Artifact content hash
     * @param geometryPattern Sacred geometry pattern
     * @param artifactType Artifact type
     * @param artifactName Artifact name
     * @param primaryFrequency Primary frequency
     * @param gateway Preferred IPFS gateway
     * @param fileSize File size in bytes
     * @param mimeType MIME type of the artifact
     * @return tokenId The minted token ID
     */
    function mintWithIPFSMetadata(
        address to,
        string memory ipfsHash,
        bytes32 artifactHash,
        SacredGeometryPattern geometryPattern,
        ArtifactType artifactType,
        string memory artifactName,
        uint256 primaryFrequency,
        string memory gateway,
        uint256 fileSize,
        string memory mimeType
    ) external onlyAuthorizedCertifier nonReentrant returns (uint256) {
        uint256 tokenId = _mintCertificationInternal(
            to,
            ipfsHash,
            artifactHash,
            geometryPattern,
            artifactType,
            artifactName,
            primaryFrequency
        );

        // Update IPFS reference with extended metadata
        ipfsReferences[tokenId].gateway = gateway;
        ipfsReferences[tokenId].size = fileSize;
        ipfsReferences[tokenId].mimeType = mimeType;

        emit IPFSReferenceUpdated(tokenId, ipfsHash, gateway, true);

        return tokenId;
    }

    // ============ GEOMETRY STATE FUNCTIONS ============

    /**
     * @dev Update dynamic geometry state for a token
     * @param tokenId Token ID to update
     * @param newState New geometry state value
     */
    function updateGeometryState(uint256 tokenId, uint256 newState) external {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(newState > 0, "Invalid state");

        geometryState[tokenId] = newState;

        emit GeometryPatternActivated(
            tokenId,
            certifications[tokenId].geometryPattern,
            newState
        );
    }

    /**
     * @dev Evolve geometry pattern based on frequency alignment
     * @param tokenId Token ID to evolve
     */
    function evolveGeometryPattern(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");

        SacredCertification storage cert = certifications[tokenId];
        uint256 currentState = geometryState[tokenId];

        // Calculate evolution based on time and frequency
        uint256 timeFactor = (block.timestamp - cert.certificationTimestamp) / 1 days;
        uint256 frequencyFactor = cert.primaryFrequency / 100;
        uint256 newState = currentState + (timeFactor * frequencyFactor);

        // Apply geometry metadata modifiers
        GeometryMetadata memory meta = geometryMetadata[cert.geometryPattern];
        newState = (newState * meta.sacredRatio) / 1000;

        geometryState[tokenId] = newState;

        emit GeometryPatternActivated(tokenId, cert.geometryPattern, newState);
    }

    // ============ IPFS FUNCTIONS ============

    /**
     * @dev Update IPFS reference for a token
     * @param tokenId Token ID to update
     * @param newGateway New gateway preference
     * @param isPinned New pinning status
     */
    function updateIPFSReference(
        uint256 tokenId,
        string memory newGateway,
        bool isPinned
    ) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");

        IPFSReference storage ref = ipfsReferences[tokenId];
        ref.gateway = newGateway;
        ref.isPinned = isPinned;
        if (isPinned && ref.pinnedAt == 0) {
            ref.pinnedAt = block.timestamp;
        }

        emit IPFSReferenceUpdated(tokenId, ref.ipfsHash, newGateway, isPinned);
    }

    /**
     * @dev Get full IPFS URL for a token
     * @param tokenId Token ID to query
     * @return string Full IPFS gateway URL
     */
    function getIPFSUrl(uint256 tokenId) external view returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");

        IPFSReference memory ref = ipfsReferences[tokenId];
        return string(abi.encodePacked(
            "https://",
            ref.gateway,
            "/ipfs/",
            ref.ipfsHash
        ));
    }

    // ============ VERIFICATION FUNCTIONS ============

    /**
     * @dev Verify an artifact's certification by its hash
     * @param artifactHash Hash to verify
     * @return bool Whether the artifact is certified
     * @return uint256 Token ID if certified
     */
    function verifyArtifactByHash(bytes32 artifactHash)
        external
        view
        returns (bool, uint256)
    {
        uint256 tokenId = artifactHashToTokenId[artifactHash];
        if (tokenId == 0) {
            return (false, 0);
        }
        return (certifications[tokenId].verified, tokenId);
    }

    /**
     * @dev Verify an artifact by IPFS hash
     * @param ipfsHash IPFS CID to verify
     * @return bool Whether certified
     * @return uint256 Token ID
     */
    function verifyByIPFSHash(string memory ipfsHash)
        external
        view
        returns (bool, uint256)
    {
        uint256 tokenId = ipfsHashToTokenId[ipfsHash];
        if (tokenId == 0) {
            return (false, 0);
        }
        return (certifications[tokenId].verified, tokenId);
    }

    // ============ INTERNAL FUNCTIONS ============

    /**
     * @dev Calculate certification level based on frequency
     * @param frequency Frequency value
     * @return CertificationLevel Calculated level
     */
    function _calculateCertificationLevel(uint256 frequency)
        internal
        pure
        returns (CertificationLevel)
    {
        if (frequency >= FREQUENCY_999HZ) {
            return CertificationLevel.OMNIVERSAL;
        } else if (frequency >= FREQUENCY_963HZ) {
            return CertificationLevel.SOVEREIGN;
        } else if (frequency >= FREQUENCY_528HZ) {
            return CertificationLevel.ASCENDING;
        } else {
            return CertificationLevel.INITIATE;
        }
    }

    /**
     * @dev Determine secondary frequency based on geometry pattern
     * @param pattern Geometry pattern
     * @param primaryFreq Primary frequency
     * @return uint256 Secondary frequency
     */
    function _determineSecondaryFrequency(
        SacredGeometryPattern pattern,
        uint256 primaryFreq
    ) internal pure returns (uint256) {
        // Dual frequency patterns
        if (pattern == SacredGeometryPattern.FLOWER_OF_LIFE ||
            pattern == SacredGeometryPattern.METATRONS_CUBE ||
            pattern == SacredGeometryPattern.MERKABA) {
            // These patterns resonate with dual frequencies
            if (primaryFreq == FREQUENCY_528HZ) {
                return FREQUENCY_963HZ;
            } else if (primaryFreq == FREQUENCY_963HZ) {
                return FREQUENCY_528HZ;
            } else if (primaryFreq == FREQUENCY_999HZ) {
                return FREQUENCY_144000HZ;
            }
        }
        return 0; // Single frequency for other patterns
    }

    /**
     * @dev Calculate initial geometry state
     * @param pattern Geometry pattern
     * @param frequency Primary frequency
     * @return uint256 Initial geometry state
     */
    function _calculateInitialGeometryState(
        SacredGeometryPattern pattern,
        uint256 frequency
    ) internal view returns (uint256) {
        GeometryMetadata memory meta = geometryMetadata[pattern];
        return (meta.vertices * meta.symmetryOrder * frequency) / 100;
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @dev Get complete certification data
     * @param tokenId Token ID to query
     * @return SacredCertification Complete certification data
     */
    function getCertification(uint256 tokenId)
        external
        view
        returns (SacredCertification memory)
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return certifications[tokenId];
    }

    /**
     * @dev Get IPFS reference for a token
     * @param tokenId Token ID to query
     * @return IPFSReference IPFS reference data
     */
    function getIPFSReference(uint256 tokenId)
        external
        view
        returns (IPFSReference memory)
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return ipfsReferences[tokenId];
    }

    /**
     * @dev Get geometry metadata for a pattern
     * @param pattern Pattern to query
     * @return GeometryMetadata Pattern metadata
     */
    function getGeometryMetadata(SacredGeometryPattern pattern)
        external
        view
        returns (GeometryMetadata memory)
    {
        return geometryMetadata[pattern];
    }

    /**
     * @dev Get current total supply
     * @notice Since _tokenIdCounter starts at 1, total supply is counter - 1
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter - 1;
    }

    /**
     * @dev Get certification count by level
     * @param level Certification level to query
     * @return uint256 Count of certifications at this level
     */
    function getCertificationCountByLevel(CertificationLevel level)
        external
        view
        returns (uint256)
    {
        return certificationCountByLevel[level];
    }

    /**
     * @dev Get artifact count by type
     * @param artifactType Artifact type to query
     * @return uint256 Count of artifacts of this type
     */
    function getArtifactCountByType(ArtifactType artifactType)
        external
        view
        returns (uint256)
    {
        return artifactCountByType[artifactType];
    }

    // ============ ADMIN FUNCTIONS ============

    /**
     * @dev Authorize or revoke a certifier
     * @param certifier Address to authorize/revoke
     * @param status Authorization status
     */
    function setAuthorizedCertifier(address certifier, bool status) external onlyOwner {
        require(certifier != address(0), "Invalid certifier address");
        authorizedCertifiers[certifier] = status;
        emit CertifierAuthorized(certifier, status);
    }

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
     * @dev Update geometry pattern metadata
     * @param pattern Pattern to update
     * @param vertices New vertices count
     * @param symmetryOrder New symmetry order
     * @param sacredRatio New sacred ratio
     * @param symbolicMeaning New symbolic meaning
     */
    function updateGeometryMetadata(
        SacredGeometryPattern pattern,
        uint256 vertices,
        uint256 symmetryOrder,
        uint256 sacredRatio,
        string memory symbolicMeaning
    ) external onlyOwner validGeometryPattern(pattern) {
        geometryMetadata[pattern] = GeometryMetadata({
            vertices: vertices,
            symmetryOrder: symmetryOrder,
            sacredRatio: sacredRatio,
            symbolicMeaning: symbolicMeaning,
            isActive: true
        });
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
        return
            interfaceId == type(IERC2981).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
