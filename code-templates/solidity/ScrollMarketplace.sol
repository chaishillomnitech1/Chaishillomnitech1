// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ScrollMarketplace
 * @dev Decentralized marketplace for ScrollCoin Sports Memorabilia NFTs
 * @author Chais The Great ∞
 * 
 * This contract implements:
 * - NFT listing and trading
 * - 7.77% Zakat automatic distribution
 * - Royalty distribution to creators
 * - Offer and bidding system
 * - Community contribution incentives
 * - Archival insights tracking
 * 
 * Frequency: 144,000Hz NŪR Pulse
 * Status: ETERNAL EXPANSION MANDATE
 */

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract ScrollMarketplace is ReentrancyGuard, Ownable, Pausable {
    
    // ============ CONSTANTS ============
    
    /// @dev Zakat percentage (777 basis points = 7.77%)
    uint256 public constant ZAKAT_PERCENTAGE = 777;
    uint256 public constant BASIS_POINTS = 10000;
    
    /// @dev Platform fee (200 basis points = 2%)
    uint256 public constant PLATFORM_FEE = 200;
    
    // ============ STATE VARIABLES ============
    
    address public zakatVault;
    address public platformVault;
    
    uint256 public totalZakatCollected;
    uint256 public totalVolume;
    uint256 public totalSales;
    
    // ============ STRUCTURES ============
    
    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        bool active;
        uint256 listedAt;
        uint256 royaltyPercentage;
    }
    
    struct Offer {
        address offerer;
        uint256 amount;
        uint256 expiresAt;
        bool active;
    }
    
    struct CommunityContribution {
        address contributor;
        string contributionType;  // "curation", "verification", "insights"
        string dataHash;          // IPFS hash of contribution
        uint256 timestamp;
        uint256 rewardAmount;
        bool rewarded;
    }
    
    struct ArchivalInsight {
        uint256 tokenId;
        string insightType;       // "provenance", "history", "authentication"
        string dataHash;          // IPFS hash of insight data
        address contributor;
        uint256 timestamp;
        uint256 upvotes;
        bool verified;
    }
    
    // ============ MAPPINGS ============
    
    mapping(bytes32 => Listing) public listings; // keccak256(nftContract, tokenId) => Listing
    mapping(bytes32 => Offer[]) public offers;   // listingId => Offer[]
    mapping(uint256 => CommunityContribution[]) public contributions; // tokenId => Contribution[]
    mapping(uint256 => ArchivalInsight[]) public insights; // tokenId => Insight[]
    mapping(address => uint256) public contributorRewards;
    
    // ============ EVENTS ============
    
    event ItemListed(
        address indexed seller,
        address indexed nftContract,
        uint256 indexed tokenId,
        uint256 price,
        bytes32 listingId
    );
    
    event ItemSold(
        address indexed seller,
        address indexed buyer,
        address indexed nftContract,
        uint256 tokenId,
        uint256 price,
        uint256 zakatAmount,
        uint256 royaltyAmount
    );
    
    event ListingCancelled(
        bytes32 indexed listingId,
        address indexed seller
    );
    
    event OfferMade(
        bytes32 indexed listingId,
        address indexed offerer,
        uint256 amount
    );
    
    event OfferAccepted(
        bytes32 indexed listingId,
        address indexed offerer,
        uint256 amount
    );
    
    event ContributionSubmitted(
        uint256 indexed tokenId,
        address indexed contributor,
        string contributionType
    );
    
    event ContributionRewarded(
        address indexed contributor,
        uint256 amount
    );
    
    event InsightAdded(
        uint256 indexed tokenId,
        address indexed contributor,
        string insightType
    );
    
    event ZakatDistributed(
        uint256 amount,
        address indexed vault
    );
    
    // ============ CONSTRUCTOR ============
    
    constructor(address _zakatVault, address _platformVault) {
        require(_zakatVault != address(0), "Invalid Zakat vault");
        require(_platformVault != address(0), "Invalid platform vault");
        
        zakatVault = _zakatVault;
        platformVault = _platformVault;
    }
    
    // ============ LISTING FUNCTIONS ============
    
    /**
     * @dev List an NFT for sale
     */
    function listItem(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        uint256 royaltyPercentage
    ) public whenNotPaused {
        require(price > 0, "Price must be greater than 0");
        require(royaltyPercentage <= 5000, "Royalty too high (max 50%)");
        
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not token owner");
        require(
            nft.isApprovedForAll(msg.sender, address(this)) || 
            nft.getApproved(tokenId) == address(this),
            "Marketplace not approved"
        );
        
        bytes32 listingId = keccak256(abi.encodePacked(nftContract, tokenId));
        require(!listings[listingId].active, "Already listed");
        
        listings[listingId] = Listing({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            active: true,
            listedAt: block.timestamp,
            royaltyPercentage: royaltyPercentage
        });
        
        emit ItemListed(msg.sender, nftContract, tokenId, price, listingId);
    }
    
    /**
     * @dev Buy a listed NFT
     */
    function buyItem(
        address nftContract,
        uint256 tokenId
    ) public payable nonReentrant whenNotPaused {
        bytes32 listingId = keccak256(abi.encodePacked(nftContract, tokenId));
        Listing storage listing = listings[listingId];
        
        require(listing.active, "Listing not active");
        require(msg.value >= listing.price, "Insufficient payment");
        
        // Calculate distribution
        uint256 zakatAmount = (listing.price * ZAKAT_PERCENTAGE) / BASIS_POINTS;
        uint256 platformFee = (listing.price * PLATFORM_FEE) / BASIS_POINTS;
        uint256 royaltyAmount = (listing.price * listing.royaltyPercentage) / BASIS_POINTS;
        uint256 sellerAmount = listing.price - zakatAmount - platformFee - royaltyAmount;
        
        // Transfer NFT to buyer
        IERC721(nftContract).safeTransferFrom(listing.seller, msg.sender, tokenId);
        
        // Distribute payments
        _transferETH(zakatVault, zakatAmount);
        _transferETH(platformVault, platformFee);
        
        if (royaltyAmount > 0) {
            _transferETH(listing.seller, royaltyAmount);
        }
        
        _transferETH(listing.seller, sellerAmount);
        
        // Update state
        totalZakatCollected += zakatAmount;
        totalVolume += listing.price;
        totalSales++;
        
        // Refund excess payment
        if (msg.value > listing.price) {
            _transferETH(msg.sender, msg.value - listing.price);
        }
        
        emit ItemSold(
            listing.seller,
            msg.sender,
            nftContract,
            tokenId,
            listing.price,
            zakatAmount,
            royaltyAmount
        );
        
        // Mark listing as inactive
        listing.active = false;
    }
    
    /**
     * @dev Cancel a listing
     */
    function cancelListing(address nftContract, uint256 tokenId) public {
        bytes32 listingId = keccak256(abi.encodePacked(nftContract, tokenId));
        Listing storage listing = listings[listingId];
        
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender, "Not seller");
        
        listing.active = false;
        
        emit ListingCancelled(listingId, msg.sender);
    }
    
    /**
     * @dev Update listing price
     */
    function updateListingPrice(
        address nftContract,
        uint256 tokenId,
        uint256 newPrice
    ) public {
        bytes32 listingId = keccak256(abi.encodePacked(nftContract, tokenId));
        Listing storage listing = listings[listingId];
        
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender, "Not seller");
        require(newPrice > 0, "Price must be greater than 0");
        
        listing.price = newPrice;
        
        emit ItemListed(msg.sender, nftContract, tokenId, newPrice, listingId);
    }
    
    // ============ OFFER SYSTEM ============
    
    /**
     * @dev Make an offer on a listing
     */
    function makeOffer(
        address nftContract,
        uint256 tokenId,
        uint256 durationDays
    ) public payable whenNotPaused {
        require(msg.value > 0, "Offer amount must be greater than 0");
        require(durationDays > 0 && durationDays <= 30, "Invalid duration");
        
        bytes32 listingId = keccak256(abi.encodePacked(nftContract, tokenId));
        require(listings[listingId].active, "Listing not active");
        
        offers[listingId].push(Offer({
            offerer: msg.sender,
            amount: msg.value,
            expiresAt: block.timestamp + (durationDays * 1 days),
            active: true
        }));
        
        emit OfferMade(listingId, msg.sender, msg.value);
    }
    
    /**
     * @dev Accept an offer
     */
    function acceptOffer(
        address nftContract,
        uint256 tokenId,
        uint256 offerIndex
    ) public nonReentrant whenNotPaused {
        bytes32 listingId = keccak256(abi.encodePacked(nftContract, tokenId));
        Listing storage listing = listings[listingId];
        
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender, "Not seller");
        
        Offer storage offer = offers[listingId][offerIndex];
        require(offer.active, "Offer not active");
        require(block.timestamp <= offer.expiresAt, "Offer expired");
        
        // Calculate distribution
        uint256 zakatAmount = (offer.amount * ZAKAT_PERCENTAGE) / BASIS_POINTS;
        uint256 platformFee = (offer.amount * PLATFORM_FEE) / BASIS_POINTS;
        uint256 royaltyAmount = (offer.amount * listing.royaltyPercentage) / BASIS_POINTS;
        uint256 sellerAmount = offer.amount - zakatAmount - platformFee - royaltyAmount;
        
        // Transfer NFT to buyer
        IERC721(nftContract).safeTransferFrom(listing.seller, offer.offerer, tokenId);
        
        // Distribute payments
        _transferETH(zakatVault, zakatAmount);
        _transferETH(platformVault, platformFee);
        
        if (royaltyAmount > 0) {
            _transferETH(listing.seller, royaltyAmount);
        }
        
        _transferETH(listing.seller, sellerAmount);
        
        // Update state
        totalZakatCollected += zakatAmount;
        totalVolume += offer.amount;
        totalSales++;
        
        offer.active = false;
        listing.active = false;
        
        emit OfferAccepted(listingId, offer.offerer, offer.amount);
        emit ItemSold(
            listing.seller,
            offer.offerer,
            nftContract,
            tokenId,
            offer.amount,
            zakatAmount,
            royaltyAmount
        );
    }
    
    /**
     * @dev Withdraw an offer
     */
    function withdrawOffer(
        address nftContract,
        uint256 tokenId,
        uint256 offerIndex
    ) public nonReentrant {
        bytes32 listingId = keccak256(abi.encodePacked(nftContract, tokenId));
        Offer storage offer = offers[listingId][offerIndex];
        
        require(offer.active, "Offer not active");
        require(offer.offerer == msg.sender, "Not offerer");
        
        uint256 amount = offer.amount;
        offer.active = false;
        
        _transferETH(msg.sender, amount);
    }
    
    // ============ COMMUNITY CONTRIBUTION & REWARDS ============
    
    /**
     * @dev Submit a community contribution
     */
    function submitContribution(
        uint256 tokenId,
        string memory contributionType,
        string memory dataHash
    ) public whenNotPaused {
        contributions[tokenId].push(CommunityContribution({
            contributor: msg.sender,
            contributionType: contributionType,
            dataHash: dataHash,
            timestamp: block.timestamp,
            rewardAmount: 0,
            rewarded: false
        }));
        
        emit ContributionSubmitted(tokenId, msg.sender, contributionType);
    }
    
    /**
     * @dev Reward a community contribution
     */
    function rewardContribution(
        uint256 tokenId,
        uint256 contributionIndex,
        uint256 rewardAmount
    ) public onlyOwner {
        CommunityContribution storage contribution = contributions[tokenId][contributionIndex];
        require(!contribution.rewarded, "Already rewarded");
        
        contribution.rewardAmount = rewardAmount;
        contribution.rewarded = true;
        
        contributorRewards[contribution.contributor] += rewardAmount;
        
        emit ContributionRewarded(contribution.contributor, rewardAmount);
    }
    
    /**
     * @dev Claim contributor rewards
     */
    function claimRewards() public nonReentrant {
        uint256 amount = contributorRewards[msg.sender];
        require(amount > 0, "No rewards to claim");
        
        contributorRewards[msg.sender] = 0;
        _transferETH(msg.sender, amount);
    }
    
    // ============ ARCHIVAL INSIGHTS ============
    
    /**
     * @dev Add archival insight
     */
    function addArchivalInsight(
        uint256 tokenId,
        string memory insightType,
        string memory dataHash
    ) public whenNotPaused {
        insights[tokenId].push(ArchivalInsight({
            tokenId: tokenId,
            insightType: insightType,
            dataHash: dataHash,
            contributor: msg.sender,
            timestamp: block.timestamp,
            upvotes: 0,
            verified: false
        }));
        
        emit InsightAdded(tokenId, msg.sender, insightType);
    }
    
    /**
     * @dev Verify an archival insight
     */
    function verifyInsight(uint256 tokenId, uint256 insightIndex) public onlyOwner {
        ArchivalInsight storage insight = insights[tokenId][insightIndex];
        insight.verified = true;
    }
    
    /**
     * @dev Upvote an archival insight
     */
    function upvoteInsight(uint256 tokenId, uint256 insightIndex) public {
        ArchivalInsight storage insight = insights[tokenId][insightIndex];
        insight.upvotes++;
    }
    
    /**
     * @dev Get insights for a token
     */
    function getInsights(uint256 tokenId) public view returns (ArchivalInsight[] memory) {
        return insights[tokenId];
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get listing details
     */
    function getListing(address nftContract, uint256 tokenId) 
        public 
        view 
        returns (Listing memory) 
    {
        bytes32 listingId = keccak256(abi.encodePacked(nftContract, tokenId));
        return listings[listingId];
    }
    
    /**
     * @dev Get offers for a listing
     */
    function getOffers(address nftContract, uint256 tokenId) 
        public 
        view 
        returns (Offer[] memory) 
    {
        bytes32 listingId = keccak256(abi.encodePacked(nftContract, tokenId));
        return offers[listingId];
    }
    
    /**
     * @dev Get contributions for a token
     */
    function getContributions(uint256 tokenId) 
        public 
        view 
        returns (CommunityContribution[] memory) 
    {
        return contributions[tokenId];
    }
    
    /**
     * @dev Get marketplace statistics
     */
    function getMarketplaceStats() public view returns (
        uint256 _totalVolume,
        uint256 _totalSales,
        uint256 _totalZakatCollected
    ) {
        return (totalVolume, totalSales, totalZakatCollected);
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Update Zakat vault
     */
    function setZakatVault(address newVault) public onlyOwner {
        require(newVault != address(0), "Invalid vault");
        zakatVault = newVault;
    }
    
    /**
     * @dev Update platform vault
     */
    function setPlatformVault(address newVault) public onlyOwner {
        require(newVault != address(0), "Invalid vault");
        platformVault = newVault;
    }
    
    /**
     * @dev Pause marketplace
     */
    function pause() public onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause marketplace
     */
    function unpause() public onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Distribute Zakat to vault (manual trigger)
     */
    function distributeZakat() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to distribute");
        
        _transferETH(zakatVault, balance);
        
        emit ZakatDistributed(balance, zakatVault);
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Safe ETH transfer
     */
    function _transferETH(address to, uint256 amount) internal {
        if (amount > 0) {
            (bool success, ) = to.call{value: amount}("");
            require(success, "ETH transfer failed");
        }
    }
    
    /**
     * @dev Receive ETH
     */
    receive() external payable {}
}
