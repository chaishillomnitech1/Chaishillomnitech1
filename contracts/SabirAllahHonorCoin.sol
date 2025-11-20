// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SabirAllahHonorCoin
 * @dev $HONOR token with automatic 7.77% Zakat for charity
 * @author Supreme King Chais The Great ∞
 * 
 * Chapter Ten: Shield of Honor Cultural Deployment
 * 
 * This contract implements the $HONOR token with:
 * - 1,000,000 total supply
 * - Automatic 7.77% Zakat on all transfers
 * - Multi-beneficiary charity distribution
 * - Community-aligned impact mechanism
 * - Transparent on-chain charity tracking
 * 
 * Beneficiaries:
 * - Police Benevolent Association: 30%
 * - Firefighters Relief Fund: 30%
 * - EMS & First Responders: 20%
 * - Community Food Banks: 10%
 * - Youth Programs: 10%
 * 
 * Frequency: 528Hz (Love & Community)
 * Status: CHAPTER TEN ACTIVE
 */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SabirAllahHonorCoin is ERC20, Ownable, ReentrancyGuard {
    
    // ============ CHARITY CONSTANTS ============
    
    /// @dev Charity percentage (7.77% = 777 basis points)
    uint256 public constant CHARITY_BPS = 777;
    
    /// @dev Police charity allocation (30% = 3000 basis points)
    uint256 public constant POLICE_BPS = 3000;
    
    /// @dev Firefighters charity allocation (30% = 3000 basis points)
    uint256 public constant FIREFIGHTERS_BPS = 3000;
    
    /// @dev EMS charity allocation (20% = 2000 basis points)
    uint256 public constant EMS_BPS = 2000;
    
    /// @dev Food bank charity allocation (10% = 1000 basis points)
    uint256 public constant FOODBANK_BPS = 1000;
    
    /// @dev Youth programs charity allocation (10% = 1000 basis points)
    uint256 public constant YOUTH_BPS = 1000;
    
    /// @dev Total supply (1,000,000 tokens)
    uint256 public constant TOTAL_SUPPLY = 1_000_000 * 10**18;
    
    // ============ STATE VARIABLES ============
    
    /// @dev Police Benevolent Association wallet
    address public policeWallet;
    
    /// @dev Firefighters Relief Fund wallet
    address public firefightersWallet;
    
    /// @dev EMS & First Responders wallet
    address public emsWallet;
    
    /// @dev Community Food Banks wallet
    address public foodbankWallet;
    
    /// @dev Youth Programs wallet
    address public youthWallet;
    
    /// @dev Total charity distributed to all beneficiaries
    uint256 public totalCharityDistributed;
    
    /// @dev Charity distributed per wallet
    mapping(address => uint256) public charityDistributedToWallet;
    
    /// @dev Addresses exempt from charity fee (owner, charity wallets)
    mapping(address => bool) public isExemptFromCharity;
    
    /// @dev Charity collection enabled/disabled
    bool public charityEnabled;
    
    // ============ EVENTS ============
    
    event CharityDistributed(
        address indexed wallet,
        uint256 amount,
        string beneficiary
    );
    
    event CharityWalletUpdated(
        string beneficiary,
        address indexed oldWallet,
        address indexed newWallet
    );
    
    event CharityStatusUpdated(bool enabled);
    
    event ExemptionUpdated(address indexed account, bool exempt);
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        address _policeWallet,
        address _firefightersWallet,
        address _emsWallet,
        address _foodbankWallet,
        address _youthWallet
    ) ERC20("Sabir Allah Honor Coin", "HONOR") Ownable(msg.sender) {
        require(_policeWallet != address(0), "Invalid police wallet");
        require(_firefightersWallet != address(0), "Invalid firefighters wallet");
        require(_emsWallet != address(0), "Invalid EMS wallet");
        require(_foodbankWallet != address(0), "Invalid foodbank wallet");
        require(_youthWallet != address(0), "Invalid youth wallet");
        
        policeWallet = _policeWallet;
        firefightersWallet = _firefightersWallet;
        emsWallet = _emsWallet;
        foodbankWallet = _foodbankWallet;
        youthWallet = _youthWallet;
        
        // Exempt owner and charity wallets from fees
        isExemptFromCharity[msg.sender] = true;
        isExemptFromCharity[_policeWallet] = true;
        isExemptFromCharity[_firefightersWallet] = true;
        isExemptFromCharity[_emsWallet] = true;
        isExemptFromCharity[_foodbankWallet] = true;
        isExemptFromCharity[_youthWallet] = true;
        
        // Enable charity by default
        charityEnabled = true;
        
        // Mint initial supply to owner
        _mint(msg.sender, TOTAL_SUPPLY);
    }
    
    // ============ TRANSFER OVERRIDE ============
    
    /**
     * @dev Override _update to include automatic charity distribution
     */
    function _update(address from, address to, uint256 amount) internal override {
        // Skip charity for minting, burning, and exempt addresses
        if (
            from == address(0) || 
            to == address(0) || 
            !charityEnabled ||
            isExemptFromCharity[from] ||
            isExemptFromCharity[to]
        ) {
            super._update(from, to, amount);
            return;
        }
        
        // Calculate 7.77% charity amount
        uint256 charityAmount = (amount * CHARITY_BPS) / 10000;
        uint256 transferAmount = amount - charityAmount;
        
        // Transfer net amount to recipient
        super._update(from, to, transferAmount);
        
        // Distribute charity to all beneficiaries
        _distributeCharity(from, charityAmount);
    }
    
    /**
     * @dev Distribute charity to all beneficiary wallets
     */
    function _distributeCharity(address from, uint256 totalCharity) private {
        // Calculate amounts for each beneficiary
        uint256 policeAmount = (totalCharity * POLICE_BPS) / 10000;
        uint256 firefightersAmount = (totalCharity * FIREFIGHTERS_BPS) / 10000;
        uint256 emsAmount = (totalCharity * EMS_BPS) / 10000;
        uint256 foodbankAmount = (totalCharity * FOODBANK_BPS) / 10000;
        uint256 youthAmount = (totalCharity * YOUTH_BPS) / 10000;
        
        // Distribute to each wallet
        super._update(from, policeWallet, policeAmount);
        super._update(from, firefightersWallet, firefightersAmount);
        super._update(from, emsWallet, emsAmount);
        super._update(from, foodbankWallet, foodbankAmount);
        super._update(from, youthWallet, youthAmount);
        
        // Update tracking
        charityDistributedToWallet[policeWallet] += policeAmount;
        charityDistributedToWallet[firefightersWallet] += firefightersAmount;
        charityDistributedToWallet[emsWallet] += emsAmount;
        charityDistributedToWallet[foodbankWallet] += foodbankAmount;
        charityDistributedToWallet[youthWallet] += youthAmount;
        
        totalCharityDistributed += totalCharity;
        
        // Emit events
        emit CharityDistributed(policeWallet, policeAmount, "Police Benevolent Association");
        emit CharityDistributed(firefightersWallet, firefightersAmount, "Firefighters Relief Fund");
        emit CharityDistributed(emsWallet, emsAmount, "EMS & First Responders");
        emit CharityDistributed(foodbankWallet, foodbankAmount, "Community Food Banks");
        emit CharityDistributed(youthWallet, youthAmount, "Youth Programs");
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Update police wallet
     */
    function updatePoliceWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Invalid wallet");
        address oldWallet = policeWallet;
        isExemptFromCharity[oldWallet] = false;
        policeWallet = newWallet;
        isExemptFromCharity[newWallet] = true;
        emit CharityWalletUpdated("Police", oldWallet, newWallet);
    }
    
    /**
     * @dev Update firefighters wallet
     */
    function updateFirefightersWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Invalid wallet");
        address oldWallet = firefightersWallet;
        isExemptFromCharity[oldWallet] = false;
        firefightersWallet = newWallet;
        isExemptFromCharity[newWallet] = true;
        emit CharityWalletUpdated("Firefighters", oldWallet, newWallet);
    }
    
    /**
     * @dev Update EMS wallet
     */
    function updateEMSWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Invalid wallet");
        address oldWallet = emsWallet;
        isExemptFromCharity[oldWallet] = false;
        emsWallet = newWallet;
        isExemptFromCharity[newWallet] = true;
        emit CharityWalletUpdated("EMS", oldWallet, newWallet);
    }
    
    /**
     * @dev Update food bank wallet
     */
    function updateFoodbankWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Invalid wallet");
        address oldWallet = foodbankWallet;
        isExemptFromCharity[oldWallet] = false;
        foodbankWallet = newWallet;
        isExemptFromCharity[newWallet] = true;
        emit CharityWalletUpdated("Foodbank", oldWallet, newWallet);
    }
    
    /**
     * @dev Update youth programs wallet
     */
    function updateYouthWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Invalid wallet");
        address oldWallet = youthWallet;
        isExemptFromCharity[oldWallet] = false;
        youthWallet = newWallet;
        isExemptFromCharity[newWallet] = true;
        emit CharityWalletUpdated("Youth", oldWallet, newWallet);
    }
    
    /**
     * @dev Set exemption status for an address
     */
    function setExemption(address account, bool exempt) external onlyOwner {
        require(account != address(0), "Invalid account");
        isExemptFromCharity[account] = exempt;
        emit ExemptionUpdated(account, exempt);
    }
    
    /**
     * @dev Enable or disable charity collection
     */
    function setCharityEnabled(bool enabled) external onlyOwner {
        charityEnabled = enabled;
        emit CharityStatusUpdated(enabled);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get charity statistics for all beneficiaries
     */
    function getCharityStatistics() external view returns (
        uint256 police,
        uint256 firefighters,
        uint256 ems,
        uint256 foodbank,
        uint256 youth,
        uint256 total
    ) {
        return (
            charityDistributedToWallet[policeWallet],
            charityDistributedToWallet[firefightersWallet],
            charityDistributedToWallet[emsWallet],
            charityDistributedToWallet[foodbankWallet],
            charityDistributedToWallet[youthWallet],
            totalCharityDistributed
        );
    }
    
    /**
     * @dev Calculate charity amount for a transfer
     */
    function calculateCharityAmount(uint256 amount) external pure returns (uint256) {
        return (amount * CHARITY_BPS) / 10000;
    }
    
    /**
     * @dev Get all charity wallet addresses
     */
    function getCharityWallets() external view returns (
        address police,
        address firefighters,
        address ems,
        address foodbank,
        address youth
    ) {
        return (
            policeWallet,
            firefightersWallet,
            emsWallet,
            foodbankWallet,
            youthWallet
        );
    }
}
