// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title ArtistProfile
 * @dev Manages artist profiles with portfolio tracking and blockchain-linked metrics
 * 
 * @notice ARTIST PROFILE PROTOCOL
 * 
 * This contract manages:
 * - Artist profile creation and management for 100K+ creators
 * - Portfolio tracking with artwork activity metrics
 * - Revenue distribution and royalty tracking
 * - Staking pool integration
 * - Dynamic dashboard data for real-time analytics
 * 
 * Frequency: 528Hz (Creative DNA) + 963Hz (Pineal Activation) + 999Hz (Crown Chakra)
 * 
 * ALLĀHU AKBAR! 🕋✨💎🌌
 */
contract ArtistProfile is AccessControl, ReentrancyGuard, Pausable {
    
    // ========== ROLES ==========
    bytes32 public constant ARTIST_ADMIN_ROLE = keccak256("ARTIST_ADMIN_ROLE");
    bytes32 public constant PORTFOLIO_MANAGER_ROLE = keccak256("PORTFOLIO_MANAGER_ROLE");
    bytes32 public constant REVENUE_DISTRIBUTOR_ROLE = keccak256("REVENUE_DISTRIBUTOR_ROLE");
    
    // ========== CONSTANTS ==========
    uint256 public constant CREATIVE_DNA_FREQUENCY = 528;
    uint256 public constant PINEAL_FREQUENCY = 963;
    uint256 public constant CROWN_FREQUENCY = 999;
    uint256 public constant NUR_PULSE_FREQUENCY = 144000;
    
    uint256 public constant MAX_ARTWORKS_PER_PROFILE = 10000;
    uint256 public constant MIN_STAKING_AMOUNT = 1 ether;
    
    // ========== ENUMS ==========
    
    enum ArtistTier {
        COMMUNITY,      // 0-99 artworks
        CREATOR,        // 100-999 artworks
        MASTER,         // 1000-9999 artworks
        LEGENDARY       // 10000+ artworks
    }
    
    enum ArtworkStatus {
        DRAFT,
        PUBLISHED,
        SOLD,
        ARCHIVED
    }
    
    // ========== STRUCTS ==========
    
    struct Profile {
        address artistAddress;
        string name;
        string bio;
        string profileImageURI;
        string websiteURI;
        uint256 createdAt;
        uint256 lastUpdated;
        ArtistTier tier;
        uint256 totalArtworks;
        uint256 totalRevenue;
        uint256 totalRoyalties;
        uint256 stakedAmount;
        uint256 reputationScore;
        bool isVerified;
        bool isActive;
    }
    
    struct Artwork {
        uint256 artworkId;
        address artist;
        string title;
        string description;
        string artworkURI;
        string metadataURI;
        uint256 createdAt;
        uint256 mintedAt;
        uint256 price;
        uint256 royaltyPercentage;
        ArtworkStatus status;
        uint256 views;
        uint256 likes;
        uint256 sales;
        uint256 totalRevenue;
    }
    
    struct RevenueMetrics {
        uint256 totalEarned;
        uint256 totalRoyalties;
        uint256 totalSales;
        uint256 averagePrice;
        uint256 lastPaymentTimestamp;
        uint256 pendingWithdrawal;
    }
    
    struct PortfolioMetrics {
        uint256 totalArtworks;
        uint256 publishedArtworks;
        uint256 soldArtworks;
        uint256 totalViews;
        uint256 totalLikes;
        uint256 averageRating;
        uint256 followerCount;
        uint256 collaborationCount;
    }
    
    struct StakingInfo {
        uint256 amount;
        uint256 startTime;
        uint256 lastClaimTime;
        uint256 rewardsEarned;
        uint256 lockPeriod;
        bool isActive;
    }
    
    // ========== STATE VARIABLES ==========
    
    // Artist profiles
    mapping(address => Profile) public profiles;
    mapping(address => bool) public isArtist;
    address[] public artistAddresses;
    uint256 public totalArtists;
    
    // Artworks
    mapping(uint256 => Artwork) public artworks;
    mapping(address => uint256[]) public artistArtworks;
    uint256 public totalArtworks;
    uint256 private _nextArtworkId;
    
    // Revenue tracking
    mapping(address => RevenueMetrics) public revenueMetrics;
    mapping(address => uint256) public pendingWithdrawals;
    
    // Portfolio metrics
    mapping(address => PortfolioMetrics) public portfolioMetrics;
    
    // Staking
    mapping(address => StakingInfo) public stakingInfo;
    uint256 public totalStaked;
    uint256 public stakingRewardRate = 500; // 5% annual in basis points
    
    // Reputation and verification
    mapping(address => uint256) public reputationScores;
    mapping(address => bool) public verifiedArtists;
    
    // ========== EVENTS ==========
    
    event ProfileCreated(address indexed artist, string name, uint256 timestamp);
    event ProfileUpdated(address indexed artist, uint256 timestamp);
    event ArtworkAdded(uint256 indexed artworkId, address indexed artist, string title, uint256 timestamp);
    event ArtworkUpdated(uint256 indexed artworkId, ArtworkStatus status, uint256 timestamp);
    event RevenueRecorded(address indexed artist, uint256 amount, uint256 timestamp);
    event RoyaltyRecorded(address indexed artist, uint256 artworkId, uint256 amount, uint256 timestamp);
    event Staked(address indexed artist, uint256 amount, uint256 timestamp);
    event Unstaked(address indexed artist, uint256 amount, uint256 timestamp);
    event RewardsClaimed(address indexed artist, uint256 amount, uint256 timestamp);
    event WithdrawalProcessed(address indexed artist, uint256 amount, uint256 timestamp);
    event ArtistVerified(address indexed artist, uint256 timestamp);
    event TierUpdated(address indexed artist, ArtistTier newTier, uint256 timestamp);
    
    // ========== CONSTRUCTOR ==========
    
    constructor(address initialOwner) {
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(ARTIST_ADMIN_ROLE, initialOwner);
        _grantRole(PORTFOLIO_MANAGER_ROLE, initialOwner);
        _grantRole(REVENUE_DISTRIBUTOR_ROLE, initialOwner);
        
        _nextArtworkId = 1;
    }
    
    // ========== PROFILE MANAGEMENT ==========
    
    /**
     * @dev Create artist profile
     */
    function createProfile(
        string memory name,
        string memory bio,
        string memory profileImageURI,
        string memory websiteURI
    ) external whenNotPaused {
        require(!isArtist[msg.sender], "Profile already exists");
        require(bytes(name).length > 0, "Name required");
        
        profiles[msg.sender] = Profile({
            artistAddress: msg.sender,
            name: name,
            bio: bio,
            profileImageURI: profileImageURI,
            websiteURI: websiteURI,
            createdAt: block.timestamp,
            lastUpdated: block.timestamp,
            tier: ArtistTier.COMMUNITY,
            totalArtworks: 0,
            totalRevenue: 0,
            totalRoyalties: 0,
            stakedAmount: 0,
            reputationScore: 100,
            isVerified: false,
            isActive: true
        });
        
        isArtist[msg.sender] = true;
        artistAddresses.push(msg.sender);
        totalArtists++;
        
        emit ProfileCreated(msg.sender, name, block.timestamp);
    }
    
    /**
     * @dev Update artist profile
     */
    function updateProfile(
        string memory name,
        string memory bio,
        string memory profileImageURI,
        string memory websiteURI
    ) external {
        require(isArtist[msg.sender], "Profile does not exist");
        
        Profile storage profile = profiles[msg.sender];
        profile.name = name;
        profile.bio = bio;
        profile.profileImageURI = profileImageURI;
        profile.websiteURI = websiteURI;
        profile.lastUpdated = block.timestamp;
        
        emit ProfileUpdated(msg.sender, block.timestamp);
    }
    
    // ========== ARTWORK MANAGEMENT ==========
    
    /**
     * @dev Add artwork to portfolio
     */
    function addArtwork(
        string memory title,
        string memory description,
        string memory artworkURI,
        string memory metadataURI,
        uint256 price,
        uint256 royaltyPercentage
    ) external returns (uint256) {
        require(isArtist[msg.sender], "Not an artist");
        require(bytes(title).length > 0, "Title required");
        require(royaltyPercentage <= 10000, "Invalid royalty");
        
        uint256 artworkId = _nextArtworkId++;
        
        artworks[artworkId] = Artwork({
            artworkId: artworkId,
            artist: msg.sender,
            title: title,
            description: description,
            artworkURI: artworkURI,
            metadataURI: metadataURI,
            createdAt: block.timestamp,
            mintedAt: 0,
            price: price,
            royaltyPercentage: royaltyPercentage,
            status: ArtworkStatus.DRAFT,
            views: 0,
            likes: 0,
            sales: 0,
            totalRevenue: 0
        });
        
        artistArtworks[msg.sender].push(artworkId);
        totalArtworks++;
        
        profiles[msg.sender].totalArtworks++;
        portfolioMetrics[msg.sender].totalArtworks++;
        
        _updateArtistTier(msg.sender);
        
        emit ArtworkAdded(artworkId, msg.sender, title, block.timestamp);
        
        return artworkId;
    }
    
    /**
     * @dev Publish artwork
     */
    function publishArtwork(uint256 artworkId) external {
        Artwork storage artwork = artworks[artworkId];
        require(artwork.artist == msg.sender, "Not artwork owner");
        require(artwork.status == ArtworkStatus.DRAFT, "Already published");
        
        artwork.status = ArtworkStatus.PUBLISHED;
        artwork.mintedAt = block.timestamp;
        
        portfolioMetrics[msg.sender].publishedArtworks++;
        
        emit ArtworkUpdated(artworkId, ArtworkStatus.PUBLISHED, block.timestamp);
    }
    
    // ========== REVENUE TRACKING ==========
    
    /**
     * @dev Record artwork sale revenue
     */
    function recordRevenue(
        address artist,
        uint256 artworkId,
        uint256 amount
    ) external onlyRole(REVENUE_DISTRIBUTOR_ROLE) {
        require(isArtist[artist], "Not an artist");
        
        Artwork storage artwork = artworks[artworkId];
        artwork.sales++;
        artwork.totalRevenue += amount;
        artwork.status = ArtworkStatus.SOLD;
        
        profiles[artist].totalRevenue += amount;
        revenueMetrics[artist].totalEarned += amount;
        revenueMetrics[artist].totalSales++;
        revenueMetrics[artist].pendingWithdrawal += amount;
        
        portfolioMetrics[artist].soldArtworks++;
        
        pendingWithdrawals[artist] += amount;
        
        emit RevenueRecorded(artist, amount, block.timestamp);
    }
    
    /**
     * @dev Record royalty payment
     */
    function recordRoyalty(
        address artist,
        uint256 artworkId,
        uint256 amount
    ) external onlyRole(REVENUE_DISTRIBUTOR_ROLE) {
        require(isArtist[artist], "Not an artist");
        
        profiles[artist].totalRoyalties += amount;
        revenueMetrics[artist].totalRoyalties += amount;
        revenueMetrics[artist].pendingWithdrawal += amount;
        
        pendingWithdrawals[artist] += amount;
        
        emit RoyaltyRecorded(artist, artworkId, amount, block.timestamp);
    }
    
    /**
     * @dev Withdraw pending revenue
     */
    function withdrawRevenue() external nonReentrant {
        require(isArtist[msg.sender], "Not an artist");
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No pending withdrawal");
        
        pendingWithdrawals[msg.sender] = 0;
        revenueMetrics[msg.sender].pendingWithdrawal = 0;
        revenueMetrics[msg.sender].lastPaymentTimestamp = block.timestamp;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit WithdrawalProcessed(msg.sender, amount, block.timestamp);
    }
    
    // ========== STAKING ==========
    
    /**
     * @dev Stake tokens for rewards
     */
    function stake(uint256 lockPeriod) external payable {
        require(isArtist[msg.sender], "Not an artist");
        require(msg.value >= MIN_STAKING_AMOUNT, "Insufficient stake");
        require(lockPeriod >= 30 days, "Lock period too short");
        
        StakingInfo storage staking = stakingInfo[msg.sender];
        
        if (staking.isActive) {
            _claimStakingRewards(msg.sender);
        }
        
        staking.amount += msg.value;
        staking.startTime = block.timestamp;
        staking.lastClaimTime = block.timestamp;
        staking.lockPeriod = lockPeriod;
        staking.isActive = true;
        
        profiles[msg.sender].stakedAmount += msg.value;
        totalStaked += msg.value;
        
        emit Staked(msg.sender, msg.value, block.timestamp);
    }
    
    /**
     * @dev Unstake tokens
     */
    function unstake() external nonReentrant {
        StakingInfo storage staking = stakingInfo[msg.sender];
        require(staking.isActive, "No active stake");
        require(block.timestamp >= staking.startTime + staking.lockPeriod, "Lock period not ended");
        
        _claimStakingRewards(msg.sender);
        
        uint256 amount = staking.amount;
        staking.amount = 0;
        staking.isActive = false;
        
        profiles[msg.sender].stakedAmount = 0;
        totalStaked -= amount;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit Unstaked(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @dev Claim staking rewards
     */
    function claimStakingRewards() external {
        require(isArtist[msg.sender], "Not an artist");
        _claimStakingRewards(msg.sender);
    }
    
    /**
     * @dev Internal function to calculate and distribute staking rewards
     */
    function _claimStakingRewards(address artist) internal {
        StakingInfo storage staking = stakingInfo[artist];
        require(staking.isActive, "No active stake");
        
        uint256 timeStaked = block.timestamp - staking.lastClaimTime;
        uint256 rewards = (staking.amount * stakingRewardRate * timeStaked) / (365 days * 10000);
        
        if (rewards > 0) {
            staking.rewardsEarned += rewards;
            staking.lastClaimTime = block.timestamp;
            
            pendingWithdrawals[artist] += rewards;
            
            emit RewardsClaimed(artist, rewards, block.timestamp);
        }
    }
    
    // ========== PORTFOLIO METRICS ==========
    
    /**
     * @dev Update artwork views
     */
    function incrementViews(uint256 artworkId) external {
        artworks[artworkId].views++;
        portfolioMetrics[artworks[artworkId].artist].totalViews++;
    }
    
    /**
     * @dev Update artwork likes
     */
    function incrementLikes(uint256 artworkId) external {
        artworks[artworkId].likes++;
        portfolioMetrics[artworks[artworkId].artist].totalLikes++;
    }
    
    // ========== ARTIST VERIFICATION ==========
    
    /**
     * @dev Verify artist
     */
    function verifyArtist(address artist) external onlyRole(ARTIST_ADMIN_ROLE) {
        require(isArtist[artist], "Not an artist");
        
        profiles[artist].isVerified = true;
        verifiedArtists[artist] = true;
        
        emit ArtistVerified(artist, block.timestamp);
    }
    
    // ========== TIER MANAGEMENT ==========
    
    /**
     * @dev Update artist tier based on artwork count
     */
    function _updateArtistTier(address artist) internal {
        uint256 artworkCount = profiles[artist].totalArtworks;
        ArtistTier newTier;
        
        if (artworkCount >= 10000) {
            newTier = ArtistTier.LEGENDARY;
        } else if (artworkCount >= 1000) {
            newTier = ArtistTier.MASTER;
        } else if (artworkCount >= 100) {
            newTier = ArtistTier.CREATOR;
        } else {
            newTier = ArtistTier.COMMUNITY;
        }
        
        if (profiles[artist].tier != newTier) {
            profiles[artist].tier = newTier;
            emit TierUpdated(artist, newTier, block.timestamp);
        }
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @dev Get artist profile
     */
    function getProfile(address artist) external view returns (Profile memory) {
        return profiles[artist];
    }
    
    /**
     * @dev Get artwork details
     */
    function getArtwork(uint256 artworkId) external view returns (Artwork memory) {
        return artworks[artworkId];
    }
    
    /**
     * @dev Get artist artworks
     */
    function getArtistArtworks(address artist) external view returns (uint256[] memory) {
        return artistArtworks[artist];
    }
    
    /**
     * @dev Get revenue metrics
     */
    function getRevenueMetrics(address artist) external view returns (RevenueMetrics memory) {
        return revenueMetrics[artist];
    }
    
    /**
     * @dev Get portfolio metrics
     */
    function getPortfolioMetrics(address artist) external view returns (PortfolioMetrics memory) {
        return portfolioMetrics[artist];
    }
    
    /**
     * @dev Get staking info
     */
    function getStakingInfo(address artist) external view returns (StakingInfo memory) {
        return stakingInfo[artist];
    }
    
    /**
     * @dev Get pending staking rewards
     */
    function getPendingRewards(address artist) external view returns (uint256) {
        StakingInfo memory staking = stakingInfo[artist];
        if (!staking.isActive) return 0;
        
        uint256 timeStaked = block.timestamp - staking.lastClaimTime;
        return (staking.amount * stakingRewardRate * timeStaked) / (365 days * 10000);
    }
    
    // ========== ADMIN FUNCTIONS ==========
    
    /**
     * @dev Pause contract
     */
    function pause() external onlyRole(ARTIST_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyRole(ARTIST_ADMIN_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Update staking reward rate
     */
    function updateStakingRewardRate(uint256 newRate) external onlyRole(ARTIST_ADMIN_ROLE) {
        require(newRate <= 2000, "Rate too high"); // Max 20%
        stakingRewardRate = newRate;
    }
    
    /**
     * @dev Receive ETH
     */
    receive() external payable {}
}
