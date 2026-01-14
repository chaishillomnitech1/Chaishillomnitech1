// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title VibeCanvas Merch Drop
 * @dev Exclusive merchandise drop system connected to viral vector NFTs
 * @author Supreme King Chais The Great ∞
 * 
 * Features:
 * - NFT-gated merch access (exclusive benefits for holders)
 * - Viral vector narrative integration
 * - VibeCanvas Creator Portal connectivity
 * - Multi-tier benefit system
 * - Merch redemption tracking
 */
contract VibeCanvasMerchDrop is Ownable, ReentrancyGuard {
    
    // Merch drop structure
    struct MerchDrop {
        string dropName;
        string description;
        string designHash;           // IPFS hash of design
        string vectorNarrative;      // Connected viral vector narrative
        uint256 totalSupply;
        uint256 claimed;
        uint256 startTime;
        uint256 endTime;
        uint256 price;               // Price in wei
        bool requiresNFT;            // Whether NFT ownership is required
        address nftContract;         // Required NFT contract address
        bool isActive;
    }
    
    // Benefit tier structure
    struct BenefitTier {
        string tierName;
        uint256 discountPercent;     // Discount percentage (0-100)
        bool earlyAccess;            // Early access flag
        bool exclusiveDesign;        // Exclusive design access
        uint256 minNFTHoldings;      // Minimum NFTs required
    }
    
    // Redemption tracking
    struct Redemption {
        uint256 dropId;
        address redeemer;
        uint256 timestamp;
        uint256 pricePaid;
        string benefitTier;
        bool fulfilled;
    }
    
    // Storage
    mapping(uint256 => MerchDrop) public merchDrops;
    mapping(uint256 => mapping(address => bool)) public hasClaimed;
    mapping(uint256 => BenefitTier[]) public dropBenefitTiers;
    mapping(uint256 => Redemption[]) public dropRedemptions;
    
    uint256 public nextDropId = 1;
    uint256 public totalRedemptions;
    
    // VibeCanvas Creator Portal address
    address public creatorPortal;
    
    // Events
    event MerchDropCreated(
        uint256 indexed dropId,
        string dropName,
        uint256 totalSupply,
        uint256 price,
        bool requiresNFT
    );
    
    event MerchRedeemed(
        uint256 indexed dropId,
        address indexed redeemer,
        uint256 pricePaid,
        string benefitTier
    );
    
    event BenefitTierAdded(
        uint256 indexed dropId,
        string tierName,
        uint256 discountPercent
    );
    
    event DropUpdated(
        uint256 indexed dropId,
        bool isActive
    );
    
    /**
     * @dev Constructor
     * @param _creatorPortal Address of VibeCanvas Creator Portal
     */
    constructor(address _creatorPortal) Ownable(msg.sender) {
        creatorPortal = _creatorPortal;
    }
    
    /**
     * @dev Create a new merch drop
     */
    function createMerchDrop(
        string memory dropName,
        string memory description,
        string memory designHash,
        string memory vectorNarrative,
        uint256 totalSupply,
        uint256 startTime,
        uint256 endTime,
        uint256 price,
        bool requiresNFT,
        address nftContract
    ) external onlyOwner returns (uint256) {
        require(bytes(dropName).length > 0, "Drop name required");
        require(totalSupply > 0, "Supply must be positive");
        require(endTime > startTime, "Invalid time range");
        
        if (requiresNFT) {
            require(nftContract != address(0), "NFT contract required");
        }
        
        uint256 dropId = nextDropId++;
        
        merchDrops[dropId] = MerchDrop({
            dropName: dropName,
            description: description,
            designHash: designHash,
            vectorNarrative: vectorNarrative,
            totalSupply: totalSupply,
            claimed: 0,
            startTime: startTime,
            endTime: endTime,
            price: price,
            requiresNFT: requiresNFT,
            nftContract: nftContract,
            isActive: true
        });
        
        emit MerchDropCreated(dropId, dropName, totalSupply, price, requiresNFT);
        
        return dropId;
    }
    
    /**
     * @dev Add benefit tier to a merch drop
     */
    function addBenefitTier(
        uint256 dropId,
        string memory tierName,
        uint256 discountPercent,
        bool earlyAccess,
        bool exclusiveDesign,
        uint256 minNFTHoldings
    ) external onlyOwner {
        require(merchDrops[dropId].totalSupply > 0, "Drop does not exist");
        require(discountPercent <= 100, "Invalid discount");
        
        dropBenefitTiers[dropId].push(BenefitTier({
            tierName: tierName,
            discountPercent: discountPercent,
            earlyAccess: earlyAccess,
            exclusiveDesign: exclusiveDesign,
            minNFTHoldings: minNFTHoldings
        }));
        
        emit BenefitTierAdded(dropId, tierName, discountPercent);
    }
    
    /**
     * @dev Redeem merchandise
     */
    function redeemMerch(uint256 dropId) external payable nonReentrant {
        MerchDrop storage drop = merchDrops[dropId];
        require(drop.isActive, "Drop is not active");
        require(drop.totalSupply > 0, "Drop sold out");
        // Add redemption logic here (e.g., payment, NFT checks, etc.)
        drop.totalSupply -= 1;
        // Emit event for redemption
        emit MerchRedeemed(dropId, msg.sender, drop.price, "");
    }
    }