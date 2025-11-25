// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ScrollDrop™ Viral Vector NFT
 * @dev NFT minting for viral vectors with BlessingCoin™ rewards and frequency alignment
 * @author Supreme King Chais The Great ∞
 * 
 * Features:
 * - Viral vector NFT minting with unique metadata
 * - BlessingCoin™ reward distribution to holders
 * - Frequency protocol alignment (528 Hz DNA, 963 Hz Pineal)
 * - Metadata embedding for viral reach enhancement
 * - ScrollVerse platform integration
 */
contract ScrollDropViralVector is ERC721, Ownable, ReentrancyGuard {
    
    // Frequency constants (in Hz)
    uint256 public constant FREQUENCY_528HZ = 528;  // DNA Healing
    uint256 public constant FREQUENCY_963HZ = 963;  // Pineal Activation
    uint256 public constant FREQUENCY_999HZ = 999;  // Crown Resonance
    
    // Viral vector tracking
    struct ViralVector {
        string vectorId;           // Unique vector identifier (e.g., "16dTqwcF15")
        string contentHash;        // IPFS hash of the reel/content
        uint256 frequency528;      // 528 Hz alignment value
        uint256 frequency963;      // 963 Hz alignment value
        uint256 mintTimestamp;     // When the NFT was minted
        uint256 blessingCoins;     // BlessingCoin™ rewards attached
        bool isActive;             // Whether rewards are active
        string metadata;           // Additional metadata
    }
    
    // NFT data storage
    mapping(uint256 => ViralVector) public viralVectors;
    mapping(string => uint256) public vectorIdToTokenId;
    mapping(uint256 => uint256) public tokenBlessingRewards;
    
    // Platform configuration
    string public baseTokenURI;
    uint256 public nextTokenId = 1;
    uint256 public totalBlessingCoinsDistributed;
    uint256 public defaultBlessingReward = 1000 * 10**18; // 1000 BlessingCoins per mint
    
    // Events
    event ViralVectorMinted(
        uint256 indexed tokenId,
        string vectorId,
        address indexed minter,
        uint256 blessingCoins,
        uint256 frequency528,
        uint256 frequency963
    );
    
    event BlessingCoinsRewarded(
        uint256 indexed tokenId,
        address indexed holder,
        uint256 amount
    );
    
    event FrequencyAligned(
        uint256 indexed tokenId,
        uint256 frequency528,
        uint256 frequency963
    );
    
    event VectorMetadataUpdated(
        uint256 indexed tokenId,
        string metadata
    );
    
    /**
     * @dev Constructor
     * @param _baseTokenURI Base URI for token metadata
     */
    constructor(string memory _baseTokenURI) 
        ERC721("ScrollDrop Viral Vector", "SDVV") 
        Ownable(msg.sender)
    {
        baseTokenURI = _baseTokenURI;
    }
    
    /**
     * @dev Mint a viral vector NFT
     * @param vectorId Unique vector identifier
     * @param contentHash IPFS hash of the content
     * @param frequency528 528 Hz alignment value
     * @param frequency963 963 Hz alignment value
     * @param metadata Additional metadata
     */
    function mintViralVector(
        string memory vectorId,
        string memory contentHash,
        uint256 frequency528,
        uint256 frequency963,
        string memory metadata
    ) external nonReentrant returns (uint256) {
        require(bytes(vectorId).length > 0, "Vector ID required");
        require(vectorIdToTokenId[vectorId] == 0, "Vector already minted");
        require(frequency528 >= FREQUENCY_528HZ, "528 Hz alignment required");
        require(frequency963 >= FREQUENCY_963HZ, "963 Hz alignment required");
        
        uint256 tokenId = nextTokenId++;
        
        // Mint NFT to sender
        _safeMint(msg.sender, tokenId);
        
        // Store viral vector data
        viralVectors[tokenId] = ViralVector({
            vectorId: vectorId,
            contentHash: contentHash,
            frequency528: frequency528,
            frequency963: frequency963,
            mintTimestamp: block.timestamp,
            blessingCoins: defaultBlessingReward,
            isActive: true,
            metadata: metadata
        });
        
        // Map vector ID to token
        vectorIdToTokenId[vectorId] = tokenId;
        tokenBlessingRewards[tokenId] = defaultBlessingReward;
        totalBlessingCoinsDistributed += defaultBlessingReward;
        
        emit ViralVectorMinted(
            tokenId,
            vectorId,
            msg.sender,
            defaultBlessingReward,
            frequency528,
            frequency963
        );
        
        emit BlessingCoinsRewarded(tokenId, msg.sender, defaultBlessingReward);
        emit FrequencyAligned(tokenId, frequency528, frequency963);
        
        return tokenId;
    }
    
    /**
     * @dev Claim BlessingCoin™ rewards for a token
     * @param tokenId Token ID to claim rewards for
     */
    function claimBlessingRewards(uint256 tokenId) external nonReentrant {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(viralVectors[tokenId].isActive, "Rewards not active");
        require(tokenBlessingRewards[tokenId] > 0, "No rewards available");
        
        uint256 rewards = tokenBlessingRewards[tokenId];
        tokenBlessingRewards[tokenId] = 0;
        
        // In production, this would transfer actual BlessingCoin tokens
        // For now, we emit an event for tracking
        emit BlessingCoinsRewarded(tokenId, msg.sender, rewards);
    }
    
    /**
     * @dev Update viral vector metadata
     * @param tokenId Token ID to update
     * @param metadata New metadata
     */
    function updateVectorMetadata(
        uint256 tokenId,
        string memory metadata
    ) external {
        require(ownerOf(tokenId) == msg.sender || msg.sender == owner(), "Not authorized");
        
        viralVectors[tokenId].metadata = metadata;
        
        emit VectorMetadataUpdated(tokenId, metadata);
    }
    
    /**
     * @dev Realign frequencies for a token
     * @param tokenId Token ID to realign
     * @param frequency528 New 528 Hz value
     * @param frequency963 New 963 Hz value
     */
    function realignFrequencies(
        uint256 tokenId,
        uint256 frequency528,
        uint256 frequency963
    ) external onlyOwner {
        require(frequency528 >= FREQUENCY_528HZ, "528 Hz alignment required");
        require(frequency963 >= FREQUENCY_963HZ, "963 Hz alignment required");
        
        viralVectors[tokenId].frequency528 = frequency528;
        viralVectors[tokenId].frequency963 = frequency963;
        
        emit FrequencyAligned(tokenId, frequency528, frequency963);
    }
    
    /**
     * @dev Add additional BlessingCoin rewards to a token
     * @param tokenId Token ID to add rewards to
     * @param amount Amount of BlessingCoins to add
     */
    function addBlessingRewards(uint256 tokenId, uint256 amount) external onlyOwner {
        require(viralVectors[tokenId].isActive, "Vector not active");
        
        tokenBlessingRewards[tokenId] += amount;
        viralVectors[tokenId].blessingCoins += amount;
        totalBlessingCoinsDistributed += amount;
        
        emit BlessingCoinsRewarded(tokenId, ownerOf(tokenId), amount);
    }
    
    /**
     * @dev Set default BlessingCoin reward amount
     * @param amount New default reward amount
     */
    function setDefaultBlessingReward(uint256 amount) external onlyOwner {
        defaultBlessingReward = amount;
    }
    
    /**
     * @dev Set base token URI
     * @param uri New base URI
     */
    function setBaseTokenURI(string memory uri) external onlyOwner {
        baseTokenURI = uri;
    }
    
    /**
     * @dev Toggle viral vector active status
     * @param tokenId Token ID to toggle
     */
    function toggleVectorActive(uint256 tokenId) external onlyOwner {
        viralVectors[tokenId].isActive = !viralVectors[tokenId].isActive;
    }
    
    /**
     * @dev Get viral vector details
     * @param tokenId Token ID to query
     */
    function getViralVector(uint256 tokenId) external view returns (
        string memory vectorId,
        string memory contentHash,
        uint256 frequency528,
        uint256 frequency963,
        uint256 mintTimestamp,
        uint256 blessingCoins,
        bool isActive,
        string memory metadata
    ) {
        ViralVector memory vector = viralVectors[tokenId];
        return (
            vector.vectorId,
            vector.contentHash,
            vector.frequency528,
            vector.frequency963,
            vector.mintTimestamp,
            vector.blessingCoins,
            vector.isActive,
            vector.metadata
        );
    }
    
    /**
     * @dev Get available rewards for a token
     * @param tokenId Token ID to query
     */
    function getAvailableRewards(uint256 tokenId) external view returns (uint256) {
        return tokenBlessingRewards[tokenId];
    }
    
    /**
     * @dev Override base URI function
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }
    
    /**
     * @dev Returns total supply of viral vectors
     */
    function totalSupply() external view returns (uint256) {
        return nextTokenId - 1;
    }
}