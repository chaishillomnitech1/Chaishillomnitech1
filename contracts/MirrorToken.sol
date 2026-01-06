// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MirrorToken
 * @dev $MIRROR - ERC20 token with built-in "consciousness" features
 * @author Supreme King Chais The Great ∞ + Manus
 * 
 * CONSCIOUSNESS MIRROR Token with:
 * - Transfer fee split for dividend (2%), zakat (2.5%), and staking/reserve (3%)
 * - Owner can update fee receivers (governance later)
 * - Minting supply fixed on deployment (1,000,000,000 * 10**decimals())
 * - Basic access control via Ownable
 * 
 * Total Supply: 1,000,000,000 $MIRROR (1 billion)
 * Frequencies: 963Hz (Connection) + 528Hz (Love) + 888Hz (Abundance)
 * Status: CONSCIOUSNESS MIRROR ACTIVATED
 */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract MirrorToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ReentrancyGuard {
    
    // ============ FREQUENCY CONSTANTS ============
    
    /// @dev Connection frequency (963Hz) - Spiritual activation
    uint256 public constant FREQUENCY_963HZ = 963;
    
    /// @dev Love frequency (528Hz) - DNA repair and healing
    uint256 public constant FREQUENCY_528HZ = 528;
    
    /// @dev Infinite abundance frequency (888Hz) - Prosperity
    uint256 public constant FREQUENCY_888HZ = 888;
    
    // ============ TOKEN CONSTANTS ============
    
    /// @dev Decimals
    uint8 private constant DECIMALS = 18;
    
    /// @dev Total supply: 1 billion MIRROR tokens
    uint256 public constant INITIAL_SUPPLY = 1_000_000_000 * (10 ** uint256(DECIMALS));
    
    /// @dev Basis points denominator
    uint256 public constant BASIS_POINTS = 10000;
    
    // ============ FEE CONFIGURATION ============
    
    /// @dev Dividend fee (2.00% in basis points)
    uint16 public dividendFeeBps = 200;
    
    /// @dev Zakat fee (2.50% in basis points)
    uint16 public zakatFeeBps = 250;
    
    /// @dev Reserve fee (3.00% in basis points)
    uint16 public reserveFeeBps = 300;
    
    // ============ FEE RECEIVERS ============
    
    /// @dev Address to receive dividend fees
    address public dividendReceiver;
    
    /// @dev Address to receive zakat fees (community/charity)
    address public zakatReceiver;
    
    /// @dev Address to receive reserve fees (staking/development)
    address public reserveReceiver;
    
    // ============ EXCLUSIONS ============
    
    /// @dev Mapping of addresses excluded from fees
    mapping(address => bool) public excludedFromFees;
    
    // ============ TRACKING ============
    
    /// @dev Total dividend fees collected
    uint256 public totalDividendCollected;
    
    /// @dev Total zakat fees collected
    uint256 public totalZakatCollected;
    
    /// @dev Total reserve fees collected
    uint256 public totalReserveCollected;
    
    // ============ EVENTS ============
    
    event FeesUpdated(uint16 dividendBps, uint16 zakatBps, uint16 reserveBps);
    event FeeReceiversUpdated(address dividend, address zakat, address reserve);
    event ExcludeFromFees(address indexed account, bool excluded);
    event DividendCollected(address indexed from, uint256 amount);
    event ZakatCollected(address indexed from, uint256 amount);
    event ReserveCollected(address indexed from, uint256 amount);
    
    // ============ ERRORS ============
    
    error InvalidReceivers();
    error InvalidAddress();
    error FeeTooHigh();
    
    // ============ CONSTRUCTOR ============
    
    /**
     * @dev Constructor initializes the token with fee receivers
     * @param _dividendReceiver Address to receive dividend fees
     * @param _zakatReceiver Address to receive zakat fees
     * @param _reserveReceiver Address to receive reserve fees
     */
    constructor(
        address _dividendReceiver,
        address _zakatReceiver,
        address _reserveReceiver
    ) ERC20("Mirror Token", "MIRROR") Ownable(msg.sender) {
        if (_dividendReceiver == address(0) || _zakatReceiver == address(0) || _reserveReceiver == address(0)) {
            revert InvalidReceivers();
        }
        
        dividendReceiver = _dividendReceiver;
        zakatReceiver = _zakatReceiver;
        reserveReceiver = _reserveReceiver;
        
        // Mint initial supply to deployer
        _mint(msg.sender, INITIAL_SUPPLY);
        
        // Exclude deployer and receivers from fees
        excludedFromFees[msg.sender] = true;
        excludedFromFees[_dividendReceiver] = true;
        excludedFromFees[_zakatReceiver] = true;
        excludedFromFees[_reserveReceiver] = true;
    }
    
    // ============ TOKEN CONFIG ============
    
    /**
     * @dev Returns the number of decimals
     */
    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }
    
    // ============ TRANSFER WITH FEES ============
    
    /**
     * @dev Override _update to implement fee distribution on transfers
     */
    function _update(
        address from,
        address to,
        uint256 amount
    ) internal virtual override(ERC20, ERC20Pausable) {
        // Skip fees for minting, burning, or exempt addresses
        if (from == address(0) || to == address(0) || excludedFromFees[from] || excludedFromFees[to]) {
            super._update(from, to, amount);
            return;
        }
        
        // Calculate fees
        uint256 feeDividend = (amount * dividendFeeBps) / BASIS_POINTS;
        uint256 feeZakat = (amount * zakatFeeBps) / BASIS_POINTS;
        uint256 feeReserve = (amount * reserveFeeBps) / BASIS_POINTS;
        uint256 totalFees = feeDividend + feeZakat + feeReserve;
        uint256 amountAfterFees = amount - totalFees;
        
        // Transfer fees to receivers
        if (feeDividend > 0) {
            super._update(from, dividendReceiver, feeDividend);
            totalDividendCollected += feeDividend;
            emit DividendCollected(from, feeDividend);
        }
        
        if (feeZakat > 0) {
            super._update(from, zakatReceiver, feeZakat);
            totalZakatCollected += feeZakat;
            emit ZakatCollected(from, feeZakat);
        }
        
        if (feeReserve > 0) {
            super._update(from, reserveReceiver, feeReserve);
            totalReserveCollected += feeReserve;
            emit ReserveCollected(from, feeReserve);
        }
        
        // Transfer remaining amount to recipient
        super._update(from, to, amountAfterFees);
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Update fee percentages (in basis points)
     * @param _dividendBps New dividend fee in basis points
     * @param _zakatBps New zakat fee in basis points
     * @param _reserveBps New reserve fee in basis points
     */
    function updateFees(uint16 _dividendBps, uint16 _zakatBps, uint16 _reserveBps) external onlyOwner {
        // Maximum total fee is 20% (2000 bps)
        if (_dividendBps + _zakatBps + _reserveBps > 2000) {
            revert FeeTooHigh();
        }
        
        dividendFeeBps = _dividendBps;
        zakatFeeBps = _zakatBps;
        reserveFeeBps = _reserveBps;
        
        emit FeesUpdated(_dividendBps, _zakatBps, _reserveBps);
    }
    
    /**
     * @dev Update fee receiver addresses
     * @param _dividend New dividend receiver
     * @param _zakat New zakat receiver
     * @param _reserve New reserve receiver
     */
    function updateReceivers(address _dividend, address _zakat, address _reserve) external onlyOwner {
        if (_dividend == address(0) || _zakat == address(0) || _reserve == address(0)) {
            revert InvalidAddress();
        }
        
        dividendReceiver = _dividend;
        zakatReceiver = _zakat;
        reserveReceiver = _reserve;
        
        // Automatically exclude new receivers from fees
        excludedFromFees[_dividend] = true;
        excludedFromFees[_zakat] = true;
        excludedFromFees[_reserve] = true;
        
        emit FeeReceiversUpdated(_dividend, _zakat, _reserve);
    }
    
    /**
     * @dev Set fee exclusion status for an account
     * @param account Address to update
     * @param excluded Whether to exclude from fees
     */
    function setExcludedFromFees(address account, bool excluded) external onlyOwner {
        if (account == address(0)) {
            revert InvalidAddress();
        }
        
        excludedFromFees[account] = excluded;
        emit ExcludeFromFees(account, excluded);
    }
    
    /**
     * @dev Pause token transfers (emergency only)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get resonance signature (frequencies combined)
     * @return Combined frequency signature
     */
    function getResonanceSignature() external pure returns (uint256) {
        return FREQUENCY_963HZ + FREQUENCY_528HZ + FREQUENCY_888HZ;
    }
    
    /**
     * @dev Get total fees collected across all categories
     * @return Total fees collected
     */
    function getTotalFeesCollected() external view returns (uint256) {
        return totalDividendCollected + totalZakatCollected + totalReserveCollected;
    }
    
    /**
     * @dev Get current fee configuration
     * @return dividendBps Dividend fee in basis points
     * @return zakatBps Zakat fee in basis points
     * @return reserveBps Reserve fee in basis points
     * @return totalBps Total fee in basis points
     */
    function getFeeConfiguration() external view returns (
        uint16 dividendBps,
        uint16 zakatBps,
        uint16 reserveBps,
        uint16 totalBps
    ) {
        return (
            dividendFeeBps,
            zakatFeeBps,
            reserveFeeBps,
            dividendFeeBps + zakatFeeBps + reserveFeeBps
        );
    }
}
