// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ScrollVerseTestRewards
 * @dev NFT-based test rewards system with 2000+ global distribution
 * @author Supreme King Chais The Great ∞
 * 
 * This contract implements the 2000+ Test Rewards Structure with:
 * - ERC-721 NFT standard for reward certificates
 * - Batch minting capability for 2000+ rewards
 * - Global distribution tracking
 * - Reward tiers and achievement levels
 * - Integration with HealthCoin rewards
 * - IPFS metadata storage
 * 
 * Total Rewards: 2000+ test rewards for global distribution
 * Frequency: 963Hz (Crown Chakra Activation)
 * Status: GLOBAL TEST REWARDS DISTRIBUTION ACTIVE
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ScrollVerseTestRewards is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable, ReentrancyGuard {
    
    // ============ FREQUENCY CONSTANTS ============
    
    /// @dev Crown chakra activation frequency (963Hz)
    uint256 public constant CROWN_FREQUENCY_963HZ = 963;
    
    /// @dev NŪR pulse frequency (144,000Hz)
    uint256 public constant NUR_PULSE_FREQUENCY = 144000;
    
    // ============ REWARD CONSTANTS ============
    
    /// @dev Maximum number of test rewards
    uint256 public constant MAX_TEST_REWARDS = 2100;
    
    /// @dev Batch mint size limit
    uint256 public constant BATCH_MINT_LIMIT = 100;
    
    // ============ REWARD TIERS ============
    
    enum RewardTier {
        BRONZE,      // Entry level
        SILVER,      // Intermediate
        GOLD,        // Advanced
        PLATINUM,    // Expert
        DIAMOND,     // Master
        SOVEREIGN    // Legendary
    }
    
    // ============ STRUCTS ============
    
    /// @dev Test reward details
    struct TestReward {
        uint256 tokenId;
        address recipient;
        RewardTier tier;
        string testType;
        uint256 score;
        uint256 timestamp;
        string metadataURI;
        bool claimed;
    }
    
    /// @dev Batch distribution record
    struct BatchDistribution {
        uint256 batchId;
        uint256 startTokenId;
        uint256 endTokenId;
        uint256 recipientCount;
        uint256 timestamp;
        string distributionType;
    }
    
    // ============ STATE VARIABLES ============
    
    /// @dev Token ID counter
    uint256 private _tokenIdCounter;
    
    /// @dev Batch distribution counter
    uint256 private _batchIdCounter;
    
    /// @dev Mapping: Token ID => Test Reward
    mapping(uint256 => TestReward) public testRewards;
    
    /// @dev Mapping: Address => Reward Count by Tier
    mapping(address => mapping(RewardTier => uint256)) public rewardCountByTier;
    
    /// @dev Mapping: Address => Total Rewards
    mapping(address => uint256) public totalRewardsReceived;
    
    /// @dev Mapping: Address => Total Score
    mapping(address => uint256) public totalScore;
    
    /// @dev Mapping: Batch ID => Batch Distribution
    mapping(uint256 => BatchDistribution) public batchDistributions;
    
    /// @dev Mapping: Address => Minter Status
    mapping(address => bool) public isMinter;
    
    /// @dev Base URI for metadata
    string public baseMetadataURI;
    
    /// @dev HealthCoin contract address (optional integration)
    address public healthCoinAddress;
    
    /// @dev Total rewards distributed
    uint256 public totalRewardsDistributed;
    
    /// @dev Global distribution active
    bool public globalDistributionActive;
    
    // ============ EVENTS ============
    
    event TestRewardMinted(
        uint256 indexed tokenId, 
        address indexed recipient, 
        RewardTier tier, 
        string testType, 
        uint256 score
    );
    event BatchRewardsDistributed(
        uint256 indexed batchId, 
        uint256 startTokenId, 
        uint256 endTokenId, 
        uint256 recipientCount
    );
    event RewardClaimed(uint256 indexed tokenId, address indexed claimer);
    event MinterUpdated(address indexed minter, bool status);
    event BaseURIUpdated(string newBaseURI);
    event HealthCoinIntegrated(address indexed healthCoin);
    event GlobalDistributionStatusChanged(bool active);
    event RewardTierUpgraded(uint256 indexed tokenId, RewardTier oldTier, RewardTier newTier);
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        address initialOwner,
        string memory _baseMetadataURI
    ) ERC721("ScrollVerse Test Rewards", "SVTR") Ownable(initialOwner) {
        baseMetadataURI = _baseMetadataURI;
        globalDistributionActive = true;
        isMinter[initialOwner] = true;
    }
    
    // ============ MODIFIERS ============
    
    modifier onlyMinter() {
        require(isMinter[msg.sender] || msg.sender == owner(), "Not authorized minter");
        _;
    }
    
    modifier whenGlobalDistributionActive() {
        require(globalDistributionActive, "Global distribution not active");
        _;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Set minter status
     * @param minter Address to update
     * @param status New minter status
     */
    function setMinter(address minter, bool status) external onlyOwner {
        require(minter != address(0), "Invalid address");
        isMinter[minter] = status;
        emit MinterUpdated(minter, status);
    }
    
    /**
     * @dev Update base metadata URI
     * @param newBaseURI New base URI
     */
    function setBaseURI(string memory newBaseURI) external onlyOwner {
        baseMetadataURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }
    
    /**
     * @dev Integrate with HealthCoin contract
     * @param _healthCoinAddress HealthCoin contract address
     */
    function setHealthCoinAddress(address _healthCoinAddress) external onlyOwner {
        require(_healthCoinAddress != address(0), "Invalid address");
        healthCoinAddress = _healthCoinAddress;
        emit HealthCoinIntegrated(_healthCoinAddress);
    }
    
    /**
     * @dev Enable or disable global distribution
     * @param active New status
     */
    function setGlobalDistributionActive(bool active) external onlyOwner {
        globalDistributionActive = active;
        emit GlobalDistributionStatusChanged(active);
    }
    
    // ============ MINTING FUNCTIONS ============
    
    /**
     * @dev Mint a single test reward NFT
     * @param recipient Address to receive the reward
     * @param tier Reward tier
     * @param testType Type of test completed
     * @param score Test score achieved
     * @param metadataURI Token metadata URI
     */
    function mintTestReward(
        address recipient,
        RewardTier tier,
        string memory testType,
        uint256 score,
        string memory metadataURI
    ) public onlyMinter nonReentrant whenGlobalDistributionActive returns (uint256) {
        require(recipient != address(0), "Invalid recipient");
        require(totalRewardsDistributed < MAX_TEST_REWARDS, "Max rewards reached");
        require(bytes(testType).length > 0, "Test type required");
        
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;
        
        _safeMint(recipient, newTokenId);
        _setTokenURI(newTokenId, metadataURI);
        
        // Store test reward details
        testRewards[newTokenId] = TestReward({
            tokenId: newTokenId,
            recipient: recipient,
            tier: tier,
            testType: testType,
            score: score,
            timestamp: block.timestamp,
            metadataURI: metadataURI,
            claimed: true // Auto-claimed on mint
        });
        
        // Update recipient stats
        rewardCountByTier[recipient][tier]++;
        totalRewardsReceived[recipient]++;
        totalScore[recipient] += score;
        totalRewardsDistributed++;
        
        emit TestRewardMinted(newTokenId, recipient, tier, testType, score);
        
        return newTokenId;
    }
    
    /**
     * @dev Batch mint test rewards for global distribution
     * @param recipients Array of recipient addresses
     * @param tiers Array of reward tiers
     * @param testTypes Array of test types
     * @param scores Array of scores
     * @param metadataURIs Array of metadata URIs
     * @param distributionType Type of distribution (e.g., "Global Launch", "Regional", etc.)
     */
    function batchMintTestRewards(
        address[] memory recipients,
        RewardTier[] memory tiers,
        string[] memory testTypes,
        uint256[] memory scores,
        string[] memory metadataURIs,
        string memory distributionType
    ) external onlyMinter nonReentrant whenGlobalDistributionActive returns (uint256) {
        uint256 recipientCount = recipients.length;
        require(recipientCount > 0, "No recipients");
        require(recipientCount <= BATCH_MINT_LIMIT, "Batch size too large");
        require(recipientCount == tiers.length, "Tiers length mismatch");
        require(recipientCount == testTypes.length, "Test types length mismatch");
        require(recipientCount == scores.length, "Scores length mismatch");
        require(recipientCount == metadataURIs.length, "Metadata URIs length mismatch");
        require(totalRewardsDistributed + recipientCount <= MAX_TEST_REWARDS, "Would exceed max rewards");
        
        _batchIdCounter++;
        uint256 batchId = _batchIdCounter;
        uint256 startTokenId = _tokenIdCounter + 1;
        
        for (uint256 i = 0; i < recipientCount; i++) {
            mintTestReward(
                recipients[i],
                tiers[i],
                testTypes[i],
                scores[i],
                metadataURIs[i]
            );
        }
        
        uint256 endTokenId = _tokenIdCounter;
        
        // Record batch distribution
        batchDistributions[batchId] = BatchDistribution({
            batchId: batchId,
            startTokenId: startTokenId,
            endTokenId: endTokenId,
            recipientCount: recipientCount,
            timestamp: block.timestamp,
            distributionType: distributionType
        });
        
        emit BatchRewardsDistributed(batchId, startTokenId, endTokenId, recipientCount);
        
        return batchId;
    }
    
    /**
     * @dev Mint 2000+ test rewards for global launch
     * This function can be called multiple times with different batches
     * @param recipients Array of recipient addresses (up to 100 per call)
     * @param tier Default tier for all recipients in this batch
     * @param testType Test type for this batch
     * @param defaultScore Default score for recipients
     */
    function mintGlobalLaunchBatch(
        address[] memory recipients,
        RewardTier tier,
        string memory testType,
        uint256 defaultScore
    ) external onlyMinter nonReentrant whenGlobalDistributionActive returns (uint256) {
        uint256 recipientCount = recipients.length;
        require(recipientCount > 0 && recipientCount <= BATCH_MINT_LIMIT, "Invalid batch size");
        require(totalRewardsDistributed + recipientCount <= MAX_TEST_REWARDS, "Would exceed max rewards");
        
        RewardTier[] memory tiers = new RewardTier[](recipientCount);
        string[] memory testTypes = new string[](recipientCount);
        uint256[] memory scores = new uint256[](recipientCount);
        string[] memory metadataURIs = new string[](recipientCount);
        
        for (uint256 i = 0; i < recipientCount; i++) {
            tiers[i] = tier;
            testTypes[i] = testType;
            scores[i] = defaultScore;
            metadataURIs[i] = string(abi.encodePacked(baseMetadataURI, "/", _toString(_tokenIdCounter + i + 1), ".json"));
        }
        
        return batchMintTestRewards(
            recipients,
            tiers,
            testTypes,
            scores,
            metadataURIs,
            "Global Launch 2000+"
        );
    }
    
    // ============ UPGRADE FUNCTIONS ============
    
    /**
     * @dev Upgrade reward tier for exceptional performance
     * @param tokenId Token ID to upgrade
     * @param newTier New reward tier
     */
    function upgradeRewardTier(uint256 tokenId, RewardTier newTier) external onlyMinter {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        TestReward storage reward = testRewards[tokenId];
        RewardTier oldTier = reward.tier;
        require(newTier > oldTier, "Can only upgrade to higher tier");
        
        address recipient = reward.recipient;
        
        // Update tier counts
        rewardCountByTier[recipient][oldTier]--;
        rewardCountByTier[recipient][newTier]++;
        
        reward.tier = newTier;
        
        emit RewardTierUpgraded(tokenId, oldTier, newTier);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get test reward details
     * @param tokenId Token ID
     */
    function getTestReward(uint256 tokenId) external view returns (TestReward memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return testRewards[tokenId];
    }
    
    /**
     * @dev Get user's reward statistics
     * @param user User address
     */
    function getUserRewardStats(address user) 
        external 
        view 
        returns (
            uint256 totalRewards,
            uint256 userTotalScore,
            uint256 bronze,
            uint256 silver,
            uint256 gold,
            uint256 platinum,
            uint256 diamond,
            uint256 sovereign
        ) 
    {
        return (
            totalRewardsReceived[user],
            totalScore[user],
            rewardCountByTier[user][RewardTier.BRONZE],
            rewardCountByTier[user][RewardTier.SILVER],
            rewardCountByTier[user][RewardTier.GOLD],
            rewardCountByTier[user][RewardTier.PLATINUM],
            rewardCountByTier[user][RewardTier.DIAMOND],
            rewardCountByTier[user][RewardTier.SOVEREIGN]
        );
    }
    
    /**
     * @dev Get batch distribution details
     * @param batchId Batch ID
     */
    function getBatchDistribution(uint256 batchId) external view returns (BatchDistribution memory) {
        return batchDistributions[batchId];
    }
    
    /**
     * @dev Get current token count
     */
    function currentTokenId() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @dev Get remaining rewards available
     */
    function remainingRewards() external view returns (uint256) {
        return MAX_TEST_REWARDS - totalRewardsDistributed;
    }
    
    /**
     * @dev Convert uint to string
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
    
    // ============ REQUIRED OVERRIDES ============
    
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }
    
    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
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
