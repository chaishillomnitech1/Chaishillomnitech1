// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title XLVIII Blocks Royalty Tagging Contract
 * @notice Manages cryptographic tagging for XLVIII BLOCKS revenue streams
 * @dev Integrates with DKQG-U Master Key for indexing
 * @author Supreme King Chais The Great ∞
 * 
 * This contract implements asset royalty tagging for:
 * - Viking logo apparel revenue streams
 * - Entertainment content royalties
 * - Cannabis product revenue tracking
 * - Automatic DKQG-U Master Key indexing
 */
contract XLVIIIRoyaltyTagging is ERC721Royalty, ReentrancyGuard, Ownable {
    
    // ============ Constants ============
    
    /// @notice Crown frequency for quantum tagging
    uint256 public constant CROWN_FREQUENCY_999HZ = 999;
    
    /// @notice Creator vault address (Supreme King Chais)
    address public immutable CREATOR_VAULT;
    
    /// @notice XLVIII BLOCKS LLC operations vault
    address public immutable LLC_VAULT;
    
    /// @notice ScrollDAO treasury vault
    address public immutable DAO_VAULT;
    
    /// @notice Zakat circulation vault
    address public immutable ZAKAT_VAULT;
    
    // ============ Structs ============
    
    /**
     * @notice Quantum Royalty Tag structure
     * @param productID Unique product identifier
     * @param productCategory Category (Apparel, Entertainment, Cannabis)
     * @param quantumFrequency Frequency signature (999 Hz)
     * @param royaltyPercentage Royalty in basis points (150 = 15%)
     * @param dkqgKeyIndex Index in DKQG-U Master Key
     * @param creatorVault Creator's royalty vault
     * @param isDKQGIndexed Whether indexed in DKQG-U
     * @param creationTimestamp When tag was created
     */
    struct QuantumRoyaltyTag {
        bytes32 productID;
        string productCategory;
        uint256 quantumFrequency;
        uint96 royaltyPercentage;
        bytes32 dkqgKeyIndex;
        address creatorVault;
        bool isDKQGIndexed;
        uint256 creationTimestamp;
    }
    
    /**
     * @notice Revenue distribution breakdown
     * @param productID Product identifier
     * @param totalAmount Total revenue amount
     * @param creatorShare Amount to creator (60%)
     * @param llcShare Amount to LLC (25%)
     * @param daoShare Amount to DAO (10%)
     * @param zakatShare Amount to Zakat (5%)
     * @param timestamp Distribution timestamp
     */
    struct RevenueDistribution {
        bytes32 productID;
        uint256 totalAmount;
        uint256 creatorShare;
        uint256 llcShare;
        uint256 daoShare;
        uint256 zakatShare;
        uint256 timestamp;
    }
    
    // ============ State Variables ============
    
    /// @notice Mapping: Product ID => Quantum Royalty Tag
    mapping(bytes32 => QuantumRoyaltyTag) public royaltyTags;
    
    /// @notice Mapping: Product ID => Total Revenue
    mapping(bytes32 => uint256) public totalRevenue;
    
    /// @notice Mapping: Product ID => Revenue Distribution History
    mapping(bytes32 => RevenueDistribution[]) public revenueHistory;
    
    /// @notice DKQG-U Master Key address
    address public dkqgMasterKey;
    
    /// @notice Total products tagged
    uint256 public totalProductsTagged;
    
    /// @notice Total revenue processed
    uint256 public totalRevenueProcessed;
    
    // ============ Events ============
    
    /**
     * @notice Emitted when product is tagged with quantum royalty
     * @param productID Product identifier
     * @param category Product category
     * @param frequency Quantum frequency (999 Hz)
     * @param dkqgKeyIndex DKQG-U Master Key index
     */
    event QuantumRoyaltyTagged(
        bytes32 indexed productID,
        string category,
        uint256 frequency,
        bytes32 indexed dkqgKeyIndex
    );
    
    /**
     * @notice Emitted when royalty payment is processed
     * @param productID Product identifier
     * @param amount Total royalty amount
     * @param recipient Primary recipient
     * @param timestamp Payment timestamp
     */
    event RoyaltyPaymentProcessed(
        bytes32 indexed productID,
        uint256 amount,
        address indexed recipient,
        uint256 timestamp
    );
    
    /**
     * @notice Emitted when revenue is distributed
     * @param productID Product identifier
     * @param totalAmount Total amount distributed
     * @param creatorShare Creator's share
     * @param llcShare LLC's share
     * @param daoShare DAO's share
     * @param zakatShare Zakat's share
     */
    event RevenueDistributed(
        bytes32 indexed productID,
        uint256 totalAmount,
        uint256 creatorShare,
        uint256 llcShare,
        uint256 daoShare,
        uint256 zakatShare
    );
    
    // ============ Constructor ============
    
    /**
     * @notice Initialize the contract with vault addresses
     * @param _creatorVault Supreme King Chais vault
     * @param _llcVault XLVIII BLOCKS LLC vault
     * @param _daoVault ScrollDAO treasury
     * @param _zakatVault Zakat circulation vault
     * @param _dkqgMasterKey DKQG-U Master Key address
     */
    constructor(
        address _creatorVault,
        address _llcVault,
        address _daoVault,
        address _zakatVault,
        address _dkqgMasterKey
    ) ERC721("XLVIII Blocks Assets", "XLVIII") {
        require(_creatorVault != address(0), "Invalid creator vault");
        require(_llcVault != address(0), "Invalid LLC vault");
        require(_daoVault != address(0), "Invalid DAO vault");
        require(_zakatVault != address(0), "Invalid Zakat vault");
        require(_dkqgMasterKey != address(0), "Invalid DKQG key");
        
        CREATOR_VAULT = _creatorVault;
        LLC_VAULT = _llcVault;
        DAO_VAULT = _daoVault;
        ZAKAT_VAULT = _zakatVault;
        dkqgMasterKey = _dkqgMasterKey;
        
        totalProductsTagged = 0;
        totalRevenueProcessed = 0;
    }
    
    // ============ Main Functions ============
    
    /**
     * @notice Tag a product with 999 Hz quantum royalty signature
     * @param _productID Unique product identifier
     * @param _category Product category (Apparel, Entertainment, Cannabis)
     * @param _royaltyBps Royalty in basis points (150 = 15%)
     * @param _dkqgKeyIndex Index in DKQG-U Master Key
     */
    function tagProductWithQuantumRoyalty(
        bytes32 _productID,
        string memory _category,
        uint96 _royaltyBps,
        bytes32 _dkqgKeyIndex
    ) external onlyOwner {
        require(
            royaltyTags[_productID].creationTimestamp == 0,
            "XLVIII-RT: Product already tagged"
        );
        require(
            bytes(_category).length > 0,
            "XLVIII-RT: Category required"
        );
        require(
            _royaltyBps > 0 && _royaltyBps <= 10000,
            "XLVIII-RT: Invalid royalty percentage"
        );
        
        royaltyTags[_productID] = QuantumRoyaltyTag({
            productID: _productID,
            productCategory: _category,
            quantumFrequency: CROWN_FREQUENCY_999HZ,
            royaltyPercentage: _royaltyBps,
            dkqgKeyIndex: _dkqgKeyIndex,
            creatorVault: CREATOR_VAULT,
            isDKQGIndexed: true,
            creationTimestamp: block.timestamp
        });
        
        totalProductsTagged++;
        
        emit QuantumRoyaltyTagged(
            _productID,
            _category,
            CROWN_FREQUENCY_999HZ,
            _dkqgKeyIndex
        );
    }
    
    /**
     * @notice Process royalty payment for a product
     * @param _productID Product identifier
     * @param _saleAmount Total sale amount
     * @dev Distributes royalty: 60% creator, 25% LLC, 10% DAO, 5% Zakat
     */
    function processRoyaltyPayment(
        bytes32 _productID,
        uint256 _saleAmount
    ) external payable nonReentrant {
        QuantumRoyaltyTag memory tag = royaltyTags[_productID];
        require(
            tag.creationTimestamp != 0,
            "XLVIII-RT: Product not tagged"
        );
        require(
            _saleAmount > 0,
            "XLVIII-RT: Sale amount must be positive"
        );
        require(
            msg.value >= _saleAmount,
            "XLVIII-RT: Insufficient payment"
        );
        
        // Calculate royalty amount
        uint256 royaltyAmount = (_saleAmount * tag.royaltyPercentage) / 10000;
        
        // Distribute royalty (60% creator, 25% LLC, 10% DAO, 5% Zakat)
        uint256 creatorShare = (royaltyAmount * 60) / 100;
        uint256 llcShare = (royaltyAmount * 25) / 100;
        uint256 daoShare = (royaltyAmount * 10) / 100;
        uint256 zakatShare = (royaltyAmount * 5) / 100;
        
        // Transfer royalties
        payable(CREATOR_VAULT).transfer(creatorShare);
        payable(LLC_VAULT).transfer(llcShare);
        payable(DAO_VAULT).transfer(daoShare);
        payable(ZAKAT_VAULT).transfer(zakatShare);
        
        // Update revenue tracking
        totalRevenue[_productID] += _saleAmount;
        totalRevenueProcessed += _saleAmount;
        
        // Store distribution record
        revenueHistory[_productID].push(RevenueDistribution({
            productID: _productID,
            totalAmount: _saleAmount,
            creatorShare: creatorShare,
            llcShare: llcShare,
            daoShare: daoShare,
            zakatShare: zakatShare,
            timestamp: block.timestamp
        }));
        
        emit RoyaltyPaymentProcessed(
            _productID,
            royaltyAmount,
            CREATOR_VAULT,
            block.timestamp
        );
        
        emit RevenueDistributed(
            _productID,
            _saleAmount,
            creatorShare,
            llcShare,
            daoShare,
            zakatShare
        );
    }
    
    /**
     * @notice Batch process multiple royalty payments
     * @param _productIDs Array of product identifiers
     * @param _saleAmounts Array of sale amounts
     */
    function batchProcessRoyalties(
        bytes32[] memory _productIDs,
        uint256[] memory _saleAmounts
    ) external payable nonReentrant {
        require(
            _productIDs.length == _saleAmounts.length,
            "XLVIII-RT: Array length mismatch"
        );
        
        uint256 totalRequired = 0;
        for (uint256 i = 0; i < _saleAmounts.length; i++) {
            totalRequired += _saleAmounts[i];
        }
        
        require(
            msg.value >= totalRequired,
            "XLVIII-RT: Insufficient payment for batch"
        );
        
        for (uint256 i = 0; i < _productIDs.length; i++) {
            _processSingleRoyalty(_productIDs[i], _saleAmounts[i]);
        }
    }
    
    /**
     * @notice Internal function to process single royalty
     * @param _productID Product identifier
     * @param _saleAmount Sale amount
     */
    function _processSingleRoyalty(
        bytes32 _productID,
        uint256 _saleAmount
    ) internal {
        QuantumRoyaltyTag memory tag = royaltyTags[_productID];
        require(tag.creationTimestamp != 0, "XLVIII-RT: Product not tagged");
        
        uint256 royaltyAmount = (_saleAmount * tag.royaltyPercentage) / 10000;
        
        uint256 creatorShare = (royaltyAmount * 60) / 100;
        uint256 llcShare = (royaltyAmount * 25) / 100;
        uint256 daoShare = (royaltyAmount * 10) / 100;
        uint256 zakatShare = (royaltyAmount * 5) / 100;
        
        payable(CREATOR_VAULT).transfer(creatorShare);
        payable(LLC_VAULT).transfer(llcShare);
        payable(DAO_VAULT).transfer(daoShare);
        payable(ZAKAT_VAULT).transfer(zakatShare);
        
        totalRevenue[_productID] += _saleAmount;
        totalRevenueProcessed += _saleAmount;
        
        revenueHistory[_productID].push(RevenueDistribution({
            productID: _productID,
            totalAmount: _saleAmount,
            creatorShare: creatorShare,
            llcShare: llcShare,
            daoShare: daoShare,
            zakatShare: zakatShare,
            timestamp: block.timestamp
        }));
        
        emit RoyaltyPaymentProcessed(
            _productID,
            royaltyAmount,
            CREATOR_VAULT,
            block.timestamp
        );
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Verify product is properly indexed in DKQG-U
     * @param _productID Product identifier
     * @return isIndexed Whether product is indexed in DKQG-U
     */
    function verifyDKQGIndexing(
        bytes32 _productID
    ) external view returns (bool isIndexed) {
        return royaltyTags[_productID].isDKQGIndexed;
    }
    
    /**
     * @notice Get product royalty tag details
     * @param _productID Product identifier
     * @return tag Complete quantum royalty tag
     */
    function getRoyaltyTag(
        bytes32 _productID
    ) external view returns (QuantumRoyaltyTag memory tag) {
        return royaltyTags[_productID];
    }
    
    /**
     * @notice Get total revenue for a product
     * @param _productID Product identifier
     * @return revenue Total revenue generated
     */
    function getProductRevenue(
        bytes32 _productID
    ) external view returns (uint256 revenue) {
        return totalRevenue[_productID];
    }
    
    /**
     * @notice Get revenue distribution history for a product
     * @param _productID Product identifier
     * @return distributions Array of revenue distributions
     */
    function getRevenueHistory(
        bytes32 _productID
    ) external view returns (RevenueDistribution[] memory distributions) {
        return revenueHistory[_productID];
    }
    
    /**
     * @notice Get protocol statistics
     * @return productsTagged Total products tagged
     * @return revenueProcessed Total revenue processed
     * @return crownFreq Crown frequency (999 Hz)
     */
    function getProtocolStats() external view returns (
        uint256 productsTagged,
        uint256 revenueProcessed,
        uint256 crownFreq
    ) {
        return (
            totalProductsTagged,
            totalRevenueProcessed,
            CROWN_FREQUENCY_999HZ
        );
    }
    
    /**
     * @notice Get vault addresses
     * @return creator Creator vault address
     * @return llc LLC vault address
     * @return dao DAO vault address
     * @return zakat Zakat vault address
     */
    function getVaultAddresses() external view returns (
        address creator,
        address llc,
        address dao,
        address zakat
    ) {
        return (
            CREATOR_VAULT,
            LLC_VAULT,
            DAO_VAULT,
            ZAKAT_VAULT
        );
    }
}
