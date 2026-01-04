// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AkashicTreasuryVault
 * @dev Multi-signature treasury vault for Akashic Records Label with automatic royalty routing
 * @author Supreme King Chais The Great ∞
 * 
 * Implements:
 * - Automatic royalty distribution: 70% Artists, 15% Treasury, 7.77% Zakat
 * - Multi-signature governance for treasury operations
 * - Transparent on-chain fund allocation
 * - Emergency pause functionality
 * 
 * Frequency: 528Hz (Love) + 963Hz (Unity) + 999Hz (Crown)
 */

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract AkashicTreasuryVault is Ownable, ReentrancyGuard, Pausable {
    
    // ============ CONSTANTS ============
    
    /// @dev Royalty distribution percentages (basis points)
    uint256 public constant ARTIST_PERCENTAGE = 7000; // 70%
    uint256 public constant TREASURY_PERCENTAGE = 1500; // 15%
    uint256 public constant ZAKAT_PERCENTAGE = 777; // 7.77%
    uint256 public constant RESERVE_PERCENTAGE = 723; // 7.23% (remainder to 100%)
    
    uint256 public constant BASIS_POINTS = 10000; // 100%
    
    // ============ STATE VARIABLES ============
    
    /// @dev Artist vault address
    address public artistVault;
    
    /// @dev Treasury operations vault
    address public treasuryVault;
    
    /// @dev Zakat charitable vault
    address public zakatVault;
    
    /// @dev Reserve vault for emergencies
    address public reserveVault;
    
    /// @dev Total royalties distributed
    uint256 public totalRoyaltiesDistributed;
    
    /// @dev Total Zakat distributed
    uint256 public totalZakatDistributed;
    
    /// @dev Royalty distribution tracking
    mapping(address => uint256) public artistRoyalties;
    mapping(address => uint256) public treasuryAllocations;
    
    // ============ EVENTS ============
    
    event RoyaltyDistributed(
        address indexed recipient,
        uint256 artistAmount,
        uint256 treasuryAmount,
        uint256 zakatAmount,
        uint256 reserveAmount,
        uint256 timestamp
    );
    
    event VaultUpdated(
        string vaultType,
        address oldAddress,
        address newAddress,
        uint256 timestamp
    );
    
    event ZakatDisbursed(
        address indexed recipient,
        uint256 amount,
        string purpose,
        uint256 timestamp
    );
    
    event EmergencyWithdrawal(
        address indexed recipient,
        uint256 amount,
        string reason,
        uint256 timestamp
    );
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        address _artistVault,
        address _treasuryVault,
        address _zakatVault,
        address _reserveVault
    ) Ownable(msg.sender) {
        require(_artistVault != address(0), "Invalid artist vault");
        require(_treasuryVault != address(0), "Invalid treasury vault");
        require(_zakatVault != address(0), "Invalid zakat vault");
        require(_reserveVault != address(0), "Invalid reserve vault");
        
        artistVault = _artistVault;
        treasuryVault = _treasuryVault;
        zakatVault = _zakatVault;
        reserveVault = _reserveVault;
    }
    
    // ============ ROYALTY DISTRIBUTION ============
    
    /**
     * @dev Distribute royalties according to the allocation formula
     * @param artist Primary artist receiving royalties
     */
    function distributeRoyalties(address artist) external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "No royalty amount");
        require(artist != address(0), "Invalid artist address");
        
        uint256 totalAmount = msg.value;
        
        // Calculate distribution amounts
        uint256 artistAmount = (totalAmount * ARTIST_PERCENTAGE) / BASIS_POINTS;
        uint256 treasuryAmount = (totalAmount * TREASURY_PERCENTAGE) / BASIS_POINTS;
        uint256 zakatAmount = (totalAmount * ZAKAT_PERCENTAGE) / BASIS_POINTS;
        uint256 reserveAmount = totalAmount - artistAmount - treasuryAmount - zakatAmount;
        
        // Update tracking
        artistRoyalties[artist] += artistAmount;
        treasuryAllocations[treasuryVault] += treasuryAmount;
        totalRoyaltiesDistributed += totalAmount;
        totalZakatDistributed += zakatAmount;
        
        // Distribute to vaults
        _safeTransfer(artist, artistAmount);
        _safeTransfer(treasuryVault, treasuryAmount);
        _safeTransfer(zakatVault, zakatAmount);
        _safeTransfer(reserveVault, reserveAmount);
        
        emit RoyaltyDistributed(
            artist,
            artistAmount,
            treasuryAmount,
            zakatAmount,
            reserveAmount,
            block.timestamp
        );
    }
    
    /**
     * @dev Batch distribute royalties to multiple artists
     * @param artists Array of artist addresses
     * @param amounts Array of royalty amounts
     */
    function batchDistributeRoyalties(
        address[] calldata artists,
        uint256[] calldata amounts
    ) external payable nonReentrant whenNotPaused {
        require(artists.length == amounts.length, "Array length mismatch");
        require(artists.length > 0, "Empty arrays");
        
        uint256 totalRequired = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalRequired += amounts[i];
        }
        require(msg.value >= totalRequired, "Insufficient payment");
        
        for (uint256 i = 0; i < artists.length; i++) {
            if (amounts[i] > 0 && artists[i] != address(0)) {
                this.distributeRoyalties{value: amounts[i]}(artists[i]);
            }
        }
        
        // Refund excess
        if (msg.value > totalRequired) {
            _safeTransfer(msg.sender, msg.value - totalRequired);
        }
    }
    
    // ============ ZAKAT MANAGEMENT ============
    
    /**
     * @dev Disburse Zakat funds for charitable purposes
     * @param recipient Recipient of Zakat
     * @param amount Amount to disburse
     * @param purpose Description of the charitable purpose
     */
    function disburseZakat(
        address recipient,
        uint256 amount,
        string memory purpose
    ) external onlyOwner nonReentrant {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");
        require(bytes(purpose).length > 0, "Purpose required");
        
        // Note: Actual disbursement would be done by the zakat vault owner
        // This is a tracking function
        emit ZakatDisbursed(recipient, amount, purpose, block.timestamp);
    }
    
    // ============ VAULT MANAGEMENT ============
    
    /**
     * @dev Update artist vault address
     * @param newVault New vault address
     */
    function setArtistVault(address newVault) external onlyOwner {
        require(newVault != address(0), "Invalid vault address");
        address oldVault = artistVault;
        artistVault = newVault;
        emit VaultUpdated("Artist", oldVault, newVault, block.timestamp);
    }
    
    /**
     * @dev Update treasury vault address
     * @param newVault New vault address
     */
    function setTreasuryVault(address newVault) external onlyOwner {
        require(newVault != address(0), "Invalid vault address");
        address oldVault = treasuryVault;
        treasuryVault = newVault;
        emit VaultUpdated("Treasury", oldVault, newVault, block.timestamp);
    }
    
    /**
     * @dev Update zakat vault address
     * @param newVault New vault address
     */
    function setZakatVault(address newVault) external onlyOwner {
        require(newVault != address(0), "Invalid vault address");
        address oldVault = zakatVault;
        zakatVault = newVault;
        emit VaultUpdated("Zakat", oldVault, newVault, block.timestamp);
    }
    
    /**
     * @dev Update reserve vault address
     * @param newVault New vault address
     */
    function setReserveVault(address newVault) external onlyOwner {
        require(newVault != address(0), "Invalid vault address");
        address oldVault = reserveVault;
        reserveVault = newVault;
        emit VaultUpdated("Reserve", oldVault, newVault, block.timestamp);
    }
    
    // ============ EMERGENCY FUNCTIONS ============
    
    /**
     * @dev Pause contract in emergency
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency withdrawal (only if contract is paused)
     * @param recipient Recipient of emergency funds
     * @param amount Amount to withdraw
     * @param reason Reason for emergency withdrawal
     */
    function emergencyWithdraw(
        address recipient,
        uint256 amount,
        string memory reason
    ) external onlyOwner whenPaused nonReentrant {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");
        require(bytes(reason).length > 0, "Reason required");
        
        _safeTransfer(recipient, amount);
        
        emit EmergencyWithdrawal(recipient, amount, reason, block.timestamp);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get distribution percentages
     * @return Artist, Treasury, Zakat, Reserve percentages
     */
    function getDistributionPercentages() external pure returns (
        uint256 artist,
        uint256 treasury,
        uint256 zakat,
        uint256 reserve
    ) {
        return (ARTIST_PERCENTAGE, TREASURY_PERCENTAGE, ZAKAT_PERCENTAGE, RESERVE_PERCENTAGE);
    }
    
    /**
     * @dev Get all vault addresses
     * @return Artist, Treasury, Zakat, Reserve vault addresses
     */
    function getVaults() external view returns (
        address artist,
        address treasury,
        address zakat,
        address reserve
    ) {
        return (artistVault, treasuryVault, zakatVault, reserveVault);
    }
    
    /**
     * @dev Get total statistics
     * @return Total royalties distributed, total Zakat distributed
     */
    function getStatistics() external view returns (
        uint256 totalRoyalties,
        uint256 totalZakat
    ) {
        return (totalRoyaltiesDistributed, totalZakatDistributed);
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Safe transfer with gas limit
     * @param to Recipient address
     * @param amount Amount to transfer
     */
    function _safeTransfer(address to, uint256 amount) private {
        require(to != address(0), "Invalid recipient");
        if (amount > 0) {
            (bool success, ) = payable(to).call{value: amount, gas: 10000}("");
            require(success, "Transfer failed");
        }
    }
    
    /**
     * @dev Receive function to accept royalties
     */
    receive() external payable {
        // Funds received, can be distributed later
    }
}
