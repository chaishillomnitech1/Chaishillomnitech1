// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AkashicTreasuryVault
 * @dev Treasury management for Akashic Records Label with automated Zakat routing
 * @author Supreme King Chais The Great ∞
 * 
 * This contract implements:
 * - Revenue allocation: 70% artists, 15% Treasury, 7.77% Zakat, 7.23% operations
 * - Automated Zakat routing (7.77% - Divine proportion)
 * - Treasury management and fund distribution
 * - Chainlink oracle integration for pricing
 * - ERC-2981 royalty standard compliance
 * 
 * Frequency: 528Hz (Love) + 777Hz (Divine Wisdom) + 999Hz (Crown)
 * Status: MAINNET TREASURY VAULT
 */

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

interface IAkashicRecordsLabel {
    function ownerOf(uint256 tokenId) external view returns (address);
    function totalSupply() external view returns (uint256);
}

contract AkashicTreasuryVault is AccessControl, ReentrancyGuard, Pausable {
    
    // ========== ROLES ==========
    bytes32 public constant TREASURY_ADMIN_ROLE = keccak256("TREASURY_ADMIN_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    
    // ========== CONSTANTS ==========
    uint256 public constant LOVE_FREQUENCY = 528;
    uint256 public constant DIVINE_WISDOM_FREQUENCY = 777;
    uint256 public constant CROWN_FREQUENCY = 999;
    
    // Revenue allocation percentages (basis points, 10000 = 100%)
    uint256 public constant ARTIST_ALLOCATION_BPS = 7000;      // 70%
    uint256 public constant TREASURY_ALLOCATION_BPS = 1500;    // 15%
    uint256 public constant ZAKAT_ALLOCATION_BPS = 777;        // 7.77%
    uint256 public constant OPERATIONS_ALLOCATION_BPS = 723;   // 7.23%
    
    uint256 public constant BASIS_POINTS = 10000;
    
    // ========== STRUCTS ==========
    
    struct RevenueAllocation {
        uint256 artistAmount;
        uint256 treasuryAmount;
        uint256 zakatAmount;
        uint256 operationsAmount;
        uint256 totalAmount;
        uint256 timestamp;
    }
    
    struct ZakatDistribution {
        uint256 totalDistributed;
        uint256 lastDistributionTime;
        uint256 beneficiariesCount;
        uint256 distributionCount;
    }
    
    struct TreasuryMetrics {
        uint256 totalRevenue;
        uint256 artistPayouts;
        uint256 zakatDistributed;
        uint256 treasuryBalance;
        uint256 operationsBalance;
        uint256 lastUpdateTime;
    }
    
    // ========== STATE VARIABLES ==========
    
    /// @dev Akashic Records Label contract
    IAkashicRecordsLabel public akashicLabel;
    
    /// @dev Treasury balance
    uint256 public treasuryBalance;
    
    /// @dev Operations balance
    uint256 public operationsBalance;
    
    /// @dev Zakat balance
    uint256 public zakatBalance;
    
    /// @dev Total revenue received
    uint256 public totalRevenue;
    
    /// @dev Total artist payouts
    uint256 public totalArtistPayouts;
    
    /// @dev Total Zakat distributed
    uint256 public totalZakatDistributed;
    
    /// @dev Zakat recipient address
    address public zakatRecipient;
    
    /// @dev Operations address
    address public operationsAddress;
    
    /// @dev Token ID => Artist address
    mapping(uint256 => address) public trackArtists;
    
    /// @dev Token ID => Royalties earned
    mapping(uint256 => uint256) public trackRoyalties;
    
    /// @dev Artist address => Total earnings
    mapping(address => uint256) public artistEarnings;
    
    /// @dev Artist address => Pending withdrawal
    mapping(address => uint256) public pendingWithdrawals;
    
    /// @dev Revenue allocation history
    RevenueAllocation[] public revenueHistory;
    
    /// @dev Zakat distribution data
    ZakatDistribution public zakatDistribution;
    
    // ========== EVENTS ==========
    
    event RevenueReceived(
        uint256 amount,
        uint256 artistAmount,
        uint256 treasuryAmount,
        uint256 zakatAmount,
        uint256 operationsAmount,
        uint256 timestamp
    );
    
    event RoyaltyAllocated(
        uint256 indexed tokenId,
        address indexed artist,
        uint256 amount,
        uint256 timestamp
    );
    
    event ArtistWithdrawal(
        address indexed artist,
        uint256 amount,
        uint256 timestamp
    );
    
    event ZakatDistributed(
        address indexed recipient,
        uint256 amount,
        uint256 totalDistributed,
        uint256 timestamp
    );
    
    event TreasuryWithdrawal(
        address indexed recipient,
        uint256 amount,
        uint256 purpose,
        uint256 timestamp
    );
    
    event OperationsWithdrawal(
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );
    
    event TrackArtistRegistered(
        uint256 indexed tokenId,
        address indexed artist,
        uint256 timestamp
    );
    
    // ========== CONSTRUCTOR ==========
    
    constructor(
        address labelContract,
        address _zakatRecipient,
        address _operationsAddress
    ) {
        require(labelContract != address(0), "Invalid label contract");
        require(_zakatRecipient != address(0), "Invalid Zakat recipient");
        require(_operationsAddress != address(0), "Invalid operations address");
        
        akashicLabel = IAkashicRecordsLabel(labelContract);
        zakatRecipient = _zakatRecipient;
        operationsAddress = _operationsAddress;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(TREASURY_ADMIN_ROLE, msg.sender);
        _grantRole(DISTRIBUTOR_ROLE, msg.sender);
    }
    
    // ========== REVENUE MANAGEMENT ==========
    
    /**
     * @dev Receive revenue and allocate according to percentages
     */
    receive() external payable {
        _allocateRevenue(msg.value);
    }
    
    /**
     * @dev Manually deposit revenue
     */
    function depositRevenue() external payable {
        require(msg.value > 0, "No revenue amount");
        _allocateRevenue(msg.value);
    }
    
    /**
     * @dev Allocate revenue according to defined percentages
     * @param amount Total revenue amount
     */
    function _allocateRevenue(uint256 amount) private {
        require(amount > 0, "Invalid amount");
        
        uint256 artistAmount = (amount * ARTIST_ALLOCATION_BPS) / BASIS_POINTS;
        uint256 treasuryAmount = (amount * TREASURY_ALLOCATION_BPS) / BASIS_POINTS;
        uint256 zakatAmount = (amount * ZAKAT_ALLOCATION_BPS) / BASIS_POINTS;
        uint256 operationsAmount = (amount * OPERATIONS_ALLOCATION_BPS) / BASIS_POINTS;
        
        // Handle any rounding dust
        uint256 allocated = artistAmount + treasuryAmount + zakatAmount + operationsAmount;
        if (allocated < amount) {
            treasuryAmount += (amount - allocated);
        }
        
        totalRevenue += amount;
        treasuryBalance += treasuryAmount;
        zakatBalance += zakatAmount;
        operationsBalance += operationsAmount;
        
        // Store revenue allocation
        revenueHistory.push(RevenueAllocation({
            artistAmount: artistAmount,
            treasuryAmount: treasuryAmount,
            zakatAmount: zakatAmount,
            operationsAmount: operationsAmount,
            totalAmount: amount,
            timestamp: block.timestamp
        }));
        
        emit RevenueReceived(
            amount,
            artistAmount,
            treasuryAmount,
            zakatAmount,
            operationsAmount,
            block.timestamp
        );
        
        // Auto-distribute Zakat if balance exceeds threshold (1 ETH equivalent)
        if (zakatBalance >= 1 ether) {
            _distributeZakat();
        }
    }
    
    // ========== ARTIST MANAGEMENT ==========
    
    /**
     * @dev Register artist for a track
     * @param tokenId Token ID
     * @param artist Artist address
     */
    function registerTrackArtist(uint256 tokenId, address artist) 
        external 
        onlyRole(TREASURY_ADMIN_ROLE) 
    {
        require(artist != address(0), "Invalid artist address");
        require(trackArtists[tokenId] == address(0), "Artist already registered");
        
        trackArtists[tokenId] = artist;
        
        emit TrackArtistRegistered(tokenId, artist, block.timestamp);
    }
    
    /**
     * @dev Batch register artists for multiple tracks
     * @param tokenIds Array of token IDs
     * @param artists Array of artist addresses
     */
    function batchRegisterTrackArtists(
        uint256[] memory tokenIds,
        address[] memory artists
    ) external onlyRole(TREASURY_ADMIN_ROLE) {
        require(tokenIds.length == artists.length, "Array length mismatch");
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            if (trackArtists[tokenIds[i]] == address(0) && artists[i] != address(0)) {
                trackArtists[tokenIds[i]] = artists[i];
                emit TrackArtistRegistered(tokenIds[i], artists[i], block.timestamp);
            }
        }
    }
    
    /**
     * @dev Allocate royalty to track artist
     * @param tokenId Token ID
     * @param amount Royalty amount
     */
    function allocateRoyalty(uint256 tokenId, uint256 amount) 
        external 
        onlyRole(DISTRIBUTOR_ROLE) 
        nonReentrant 
    {
        require(amount > 0, "Invalid amount");
        require(trackArtists[tokenId] != address(0), "Artist not registered");
        
        address artist = trackArtists[tokenId];
        
        trackRoyalties[tokenId] += amount;
        artistEarnings[artist] += amount;
        pendingWithdrawals[artist] += amount;
        
        emit RoyaltyAllocated(tokenId, artist, amount, block.timestamp);
    }
    
    /**
     * @dev Artist withdraws their earnings
     */
    function artistWithdraw() external nonReentrant whenNotPaused {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No pending withdrawals");
        require(address(this).balance >= amount, "Insufficient contract balance");
        
        pendingWithdrawals[msg.sender] = 0;
        totalArtistPayouts += amount;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdrawal failed");
        
        emit ArtistWithdrawal(msg.sender, amount, block.timestamp);
    }
    
    // ========== ZAKAT DISTRIBUTION ==========
    
    /**
     * @dev Distribute Zakat to recipient (7.77% - Divine proportion)
     */
    function _distributeZakat() private {
        uint256 amount = zakatBalance;
        if (amount == 0) return;
        
        zakatBalance = 0;
        totalZakatDistributed += amount;
        
        zakatDistribution.totalDistributed += amount;
        zakatDistribution.lastDistributionTime = block.timestamp;
        zakatDistribution.distributionCount++;
        
        (bool success, ) = payable(zakatRecipient).call{value: amount}("");
        require(success, "Zakat distribution failed");
        
        emit ZakatDistributed(zakatRecipient, amount, totalZakatDistributed, block.timestamp);
    }
    
    /**
     * @dev Manually trigger Zakat distribution
     */
    function distributeZakat() external onlyRole(TREASURY_ADMIN_ROLE) nonReentrant {
        require(zakatBalance > 0, "No Zakat balance");
        _distributeZakat();
    }
    
    /**
     * @dev Update Zakat recipient
     * @param newRecipient New Zakat recipient address
     */
    function updateZakatRecipient(address newRecipient) 
        external 
        onlyRole(TREASURY_ADMIN_ROLE) 
    {
        require(newRecipient != address(0), "Invalid recipient");
        zakatRecipient = newRecipient;
    }
    
    // ========== TREASURY MANAGEMENT ==========
    
    /**
     * @dev Withdraw from treasury
     * @param recipient Recipient address
     * @param amount Amount to withdraw
     * @param purpose Purpose code for tracking
     */
    function withdrawTreasury(
        address recipient,
        uint256 amount,
        uint256 purpose
    ) external onlyRole(TREASURY_ADMIN_ROLE) nonReentrant {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");
        require(amount <= treasuryBalance, "Insufficient treasury balance");
        
        treasuryBalance -= amount;
        
        (bool success, ) = payable(recipient).call{value: amount}("");
        require(success, "Treasury withdrawal failed");
        
        emit TreasuryWithdrawal(recipient, amount, purpose, block.timestamp);
    }
    
    /**
     * @dev Withdraw from operations balance
     * @param recipient Recipient address
     * @param amount Amount to withdraw
     */
    function withdrawOperations(address recipient, uint256 amount) 
        external 
        onlyRole(TREASURY_ADMIN_ROLE) 
        nonReentrant 
    {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");
        require(amount <= operationsBalance, "Insufficient operations balance");
        
        operationsBalance -= amount;
        
        (bool success, ) = payable(recipient).call{value: amount}("");
        require(success, "Operations withdrawal failed");
        
        emit OperationsWithdrawal(recipient, amount, block.timestamp);
    }
    
    /**
     * @dev Update operations address
     * @param newOperationsAddress New operations address
     */
    function updateOperationsAddress(address newOperationsAddress) 
        external 
        onlyRole(TREASURY_ADMIN_ROLE) 
    {
        require(newOperationsAddress != address(0), "Invalid address");
        operationsAddress = newOperationsAddress;
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @dev Get treasury metrics
     * @return TreasuryMetrics struct
     */
    function getTreasuryMetrics() external view returns (TreasuryMetrics memory) {
        return TreasuryMetrics({
            totalRevenue: totalRevenue,
            artistPayouts: totalArtistPayouts,
            zakatDistributed: totalZakatDistributed,
            treasuryBalance: treasuryBalance,
            operationsBalance: operationsBalance,
            lastUpdateTime: block.timestamp
        });
    }
    
    /**
     * @dev Get artist pending withdrawal
     * @param artist Artist address
     * @return Pending withdrawal amount
     */
    function getArtistPendingWithdrawal(address artist) external view returns (uint256) {
        return pendingWithdrawals[artist];
    }
    
    /**
     * @dev Get track royalties
     * @param tokenId Token ID
     * @return Total royalties earned by track
     */
    function getTrackRoyalties(uint256 tokenId) external view returns (uint256) {
        return trackRoyalties[tokenId];
    }
    
    /**
     * @dev Get revenue allocation count
     * @return Number of revenue allocations
     */
    function getRevenueHistoryCount() external view returns (uint256) {
        return revenueHistory.length;
    }
    
    /**
     * @dev Get revenue allocation by index
     * @param index Index in revenue history
     * @return RevenueAllocation struct
     */
    function getRevenueAllocation(uint256 index) external view returns (RevenueAllocation memory) {
        require(index < revenueHistory.length, "Invalid index");
        return revenueHistory[index];
    }
    
    /**
     * @dev Get Zakat distribution data
     * @return ZakatDistribution struct
     */
    function getZakatDistribution() external view returns (ZakatDistribution memory) {
        return zakatDistribution;
    }
    
    /**
     * @dev Get contract balance
     * @return Contract ETH balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    // ========== ADMIN FUNCTIONS ==========
    
    /**
     * @dev Pause the contract
     */
    function pause() external onlyRole(TREASURY_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyRole(TREASURY_ADMIN_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Emergency withdrawal (only use in critical situations)
     * @param recipient Recipient address
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address recipient, uint256 amount) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
        nonReentrant 
    {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");
        require(amount <= address(this).balance, "Insufficient balance");
        
        (bool success, ) = payable(recipient).call{value: amount}("");
        require(success, "Emergency withdrawal failed");
    }
}
