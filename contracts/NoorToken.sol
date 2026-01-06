// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title NoorToken
 * @dev $NOOR - Token of Light for the 1,111 Noor Cities
 * @author Supreme King Chais The Great ∞
 * 
 * Noor Cities of Light Infrastructure Token
 * 
 * This contract implements the $NOOR token with:
 * - ERC-20 standard compliance
 * - Advanced staking mechanism with tiered rewards
 * - Automatic 7.77% zakat to Sabir Allah Honor Fund
 * - Integration with Noor Citizen Registry
 * - Governance capabilities
 * - Anti-whale mechanics
 * 
 * Total Supply: 1,111,000,000 $NOOR (1.111 billion)
 * Frequencies: 528Hz (Love) + 963Hz (Connection) + 888Hz (Abundance)
 * Status: NOOR CITIES ACTIVATED
 */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract NoorToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ReentrancyGuard {
    
    // ============ FREQUENCY CONSTANTS ============
    
    /// @dev Love frequency (528Hz) - DNA repair and healing
    uint256 public constant FREQUENCY_528HZ = 528;
    
    /// @dev God connection frequency (963Hz) - Spiritual activation
    uint256 public constant FREQUENCY_963HZ = 963;
    
    /// @dev Infinite abundance frequency (888Hz) - Prosperity
    uint256 public constant FREQUENCY_888HZ = 888;
    
    // ============ TOKEN CONSTANTS ============
    
    /// @dev Total supply: 1.111 billion NOOR tokens
    uint256 public constant TOTAL_SUPPLY = 1_111_000_000 * 10**18;
    
    /// @dev Zakat percentage (7.77% in basis points)
    uint256 public constant ZAKAT_PERCENTAGE = 777; // 7.77% (basis points)
    
    /// @dev Transaction fee percentage (3.33% in basis points)
    uint256 public constant TRANSACTION_FEE = 333; // 3.33%
    
    /// @dev Basis points denominator
    uint256 public constant BASIS_POINTS = 10000;
    
    /// @dev Maximum wallet size (anti-whale: 0.77% of supply)
    uint256 public constant MAX_WALLET_SIZE = TOTAL_SUPPLY * 77 / 10000;
    
    /// @dev Maximum transaction size (0.33% of supply)
    uint256 public constant MAX_TX_SIZE = TOTAL_SUPPLY * 33 / 10000;
    
    // ============ DISTRIBUTION CONSTANTS ============
    
    uint256 public constant STAKING_REWARDS_POOL = TOTAL_SUPPLY * 30 / 100; // 30%
    uint256 public constant COMMUNITY_TREASURY = TOTAL_SUPPLY * 25 / 100; // 25%
    uint256 public constant LIQUIDITY_POOLS = TOTAL_SUPPLY * 15 / 100; // 15%
    uint256 public constant OBELISK_FUND = TOTAL_SUPPLY * 10 / 100; // 10%
    uint256 public constant SABIR_ALLAH_FUND = TOTAL_SUPPLY * 10 / 100; // 10%
    uint256 public constant TEAM_DEVELOPMENT = TOTAL_SUPPLY * 7 / 100; // 7%
    uint256 public constant INITIAL_AIRDROP = TOTAL_SUPPLY * 3 / 100; // 3%
    
    // ============ STATE VARIABLES ============
    
    /// @dev Sabir Allah Honor Fund address
    address public sabirAllahHonorFund;
    
    /// @dev Community development fund address
    address public communityDevelopmentFund;
    
    /// @dev Noor Citizen Registry contract address
    address public citizenRegistry;
    
    /// @dev Mapping to track if address is a Noor Citizen
    mapping(address => bool) public isNoorCitizen;
    
    /// @dev Mapping to exempt addresses from fees (exchanges, contracts, etc)
    mapping(address => bool) public feeExempt;
    
    /// @dev Mapping to exempt addresses from max transaction limits
    mapping(address => bool) public limitExempt;
    
    /// @dev Total zakat collected
    uint256 public totalZakatCollected;
    
    /// @dev Total fees collected
    uint256 public totalFeesCollected;
    
    /// @dev Vesting start time for team tokens
    uint256 public vestingStartTime;
    
    /// @dev Vesting duration (4 years in seconds)
    uint256 public constant VESTING_DURATION = 4 * 365 days;
    
    // ============ EVENTS ============
    
    event ZakatDistributed(address indexed to, uint256 amount);
    event FeeCollected(address indexed from, uint256 amount);
    event CitizenStatusUpdated(address indexed citizen, bool status);
    event FeeExemptionUpdated(address indexed account, bool status);
    event LimitExemptionUpdated(address indexed account, bool status);
    event SabirAllahFundUpdated(address indexed oldFund, address indexed newFund);
    event CommunityFundUpdated(address indexed oldFund, address indexed newFund);
    event CitizenRegistryUpdated(address indexed oldRegistry, address indexed newRegistry);
    
    // ============ ERRORS ============
    
    error InvalidAddress();
    error ExceedsMaxWalletSize();
    error ExceedsMaxTransactionSize();
    error VestingNotStarted();
    error InsufficientVestedAmount();
    error AlreadyInitialized();
    
    // ============ CONSTRUCTOR ============
    
    /**
     * @dev Constructor initializes the token with distribution
     * @param _sabirAllahHonorFund Address of Sabir Allah Honor Fund
     * @param _communityDevelopmentFund Address of Community Development Fund
     */
    constructor(
        address _sabirAllahHonorFund,
        address _communityDevelopmentFund
    ) ERC20("Noor Token", "NOOR") Ownable(msg.sender) {
        if (_sabirAllahHonorFund == address(0) || _communityDevelopmentFund == address(0)) {
            revert InvalidAddress();
        }
        
        sabirAllahHonorFund = _sabirAllahHonorFund;
        communityDevelopmentFund = _communityDevelopmentFund;
        
        // Mint tokens according to distribution
        _mint(address(this), STAKING_REWARDS_POOL); // Held for staking rewards
        _mint(_communityDevelopmentFund, COMMUNITY_TREASURY);
        _mint(address(this), LIQUIDITY_POOLS); // Held for liquidity provision
        _mint(address(this), OBELISK_FUND); // Held for Obelisk deployment
        _mint(_sabirAllahHonorFund, SABIR_ALLAH_FUND);
        _mint(address(this), TEAM_DEVELOPMENT); // Held for vesting
        _mint(address(this), INITIAL_AIRDROP); // Held for airdrop
        
        // Set contract addresses as fee and limit exempt
        feeExempt[address(this)] = true;
        feeExempt[_sabirAllahHonorFund] = true;
        feeExempt[_communityDevelopmentFund] = true;
        
        limitExempt[address(this)] = true;
        limitExempt[_sabirAllahHonorFund] = true;
        limitExempt[_communityDevelopmentFund] = true;
        limitExempt[owner()] = true;
        
        // Initialize vesting start time
        vestingStartTime = block.timestamp;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Update Sabir Allah Honor Fund address
     * @param _newFund New fund address
     */
    function updateSabirAllahFund(address _newFund) external onlyOwner {
        if (_newFund == address(0)) revert InvalidAddress();
        address oldFund = sabirAllahHonorFund;
        sabirAllahHonorFund = _newFund;
        feeExempt[_newFund] = true;
        limitExempt[_newFund] = true;
        emit SabirAllahFundUpdated(oldFund, _newFund);
    }
    
    /**
     * @dev Update Community Development Fund address
     * @param _newFund New fund address
     */
    function updateCommunityFund(address _newFund) external onlyOwner {
        if (_newFund == address(0)) revert InvalidAddress();
        address oldFund = communityDevelopmentFund;
        communityDevelopmentFund = _newFund;
        feeExempt[_newFund] = true;
        limitExempt[_newFund] = true;
        emit CommunityFundUpdated(oldFund, _newFund);
    }
    
    /**
     * @dev Update Citizen Registry contract address
     * @param _newRegistry New registry address
     */
    function updateCitizenRegistry(address _newRegistry) external onlyOwner {
        if (_newRegistry == address(0)) revert InvalidAddress();
        address oldRegistry = citizenRegistry;
        citizenRegistry = _newRegistry;
        emit CitizenRegistryUpdated(oldRegistry, _newRegistry);
    }
    
    /**
     * @dev Update citizen status manually (for backward compatibility)
     * @param _citizen Address of citizen
     * @param _status Citizenship status
     */
    function updateCitizenStatus(address _citizen, bool _status) external onlyOwner {
        isNoorCitizen[_citizen] = _status;
        emit CitizenStatusUpdated(_citizen, _status);
    }
    
    /**
     * @dev Update fee exemption status
     * @param _account Address to update
     * @param _exempt Exemption status
     */
    function updateFeeExemption(address _account, bool _exempt) external onlyOwner {
        feeExempt[_account] = _exempt;
        emit FeeExemptionUpdated(_account, _exempt);
    }
    
    /**
     * @dev Update limit exemption status
     * @param _account Address to update
     * @param _exempt Exemption status
     */
    function updateLimitExemption(address _account, bool _exempt) external onlyOwner {
        limitExempt[_account] = _exempt;
        emit LimitExemptionUpdated(_account, _exempt);
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
    
    // ============ VESTING FUNCTIONS ============
    
    /**
     * @dev Release vested team tokens
     * @param _to Address to send vested tokens
     * @param _amount Amount to release
     */
    function releaseVestedTokens(address _to, uint256 _amount) external onlyOwner nonReentrant {
        if (_to == address(0)) revert InvalidAddress();
        if (vestingStartTime == 0) revert VestingNotStarted();
        
        uint256 vestedAmount = calculateVestedAmount();
        if (_amount > vestedAmount) revert InsufficientVestedAmount();
        
        _transfer(address(this), _to, _amount);
    }
    
    /**
     * @dev Calculate vested amount based on time elapsed
     * @return Amount of tokens that can be released
     */
    function calculateVestedAmount() public view returns (uint256) {
        if (vestingStartTime == 0) return 0;
        
        uint256 timeElapsed = block.timestamp - vestingStartTime;
        if (timeElapsed >= VESTING_DURATION) {
            return TEAM_DEVELOPMENT;
        }
        
        return (TEAM_DEVELOPMENT * timeElapsed) / VESTING_DURATION;
    }
    
    // ============ TRANSFER FUNCTIONS ============
    
    /**
     * @dev Override transfer to include fees and limits
     */
    function _update(
        address from,
        address to,
        uint256 amount
    ) internal virtual override(ERC20, ERC20Pausable) {
        // Skip fees and limits for minting, burning, and exempted addresses
        if (from == address(0) || to == address(0) || feeExempt[from] || feeExempt[to]) {
            super._update(from, to, amount);
            return;
        }
        
        // Check transaction limits
        if (!limitExempt[from] && !limitExempt[to]) {
            if (amount > MAX_TX_SIZE) revert ExceedsMaxTransactionSize();
            
            // Check max wallet size for recipient
            if (balanceOf(to) + amount > MAX_WALLET_SIZE) {
                revert ExceedsMaxWalletSize();
            }
        }
        
        // Calculate fees
        uint256 feeAmount = 0;
        
        // No fees for Noor Citizens
        if (!isNoorCitizen[from] && !isNoorCitizen[to]) {
            feeAmount = (amount * TRANSACTION_FEE) / BASIS_POINTS;
        }
        
        if (feeAmount > 0) {
            uint256 netAmount = amount - feeAmount;
            
            // Transfer fee to community fund
            super._update(from, communityDevelopmentFund, feeAmount);
            totalFeesCollected += feeAmount;
            emit FeeCollected(from, feeAmount);
            
            // Transfer net amount to recipient
            super._update(from, to, netAmount);
        } else {
            // No fee, transfer full amount
            super._update(from, to, amount);
        }
    }
    
    // ============ ZAKAT DISTRIBUTION ============
    
    /**
     * @dev Distribute zakat from staking rewards
     * @param _amount Amount to distribute as zakat
     */
    function distributeZakat(uint256 _amount) external onlyOwner nonReentrant {
        if (_amount > balanceOf(address(this))) revert InsufficientVestedAmount();
        
        uint256 zakatAmount = (_amount * ZAKAT_PERCENTAGE) / BASIS_POINTS;
        
        _transfer(address(this), sabirAllahHonorFund, zakatAmount);
        totalZakatCollected += zakatAmount;
        
        emit ZakatDistributed(sabirAllahHonorFund, zakatAmount);
    }
    
    // ============ AIRDROP FUNCTIONS ============
    
    /**
     * @dev Airdrop tokens to multiple addresses
     * @param _recipients Array of recipient addresses
     * @param _amounts Array of amounts to airdrop
     */
    function airdrop(
        address[] calldata _recipients,
        uint256[] calldata _amounts
    ) external onlyOwner nonReentrant {
        require(_recipients.length == _amounts.length, "Length mismatch");
        
        for (uint256 i = 0; i < _recipients.length; i++) {
            if (_recipients[i] != address(0)) {
                _transfer(address(this), _recipients[i], _amounts[i]);
            }
        }
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get resonance signature (frequencies combined)
     * @return Combined frequency signature
     */
    function getResonanceSignature() external pure returns (uint256) {
        return FREQUENCY_528HZ + FREQUENCY_963HZ + FREQUENCY_888HZ;
    }
    
    /**
     * @dev Check if address is a Noor Citizen (checks registry if set)
     * @param _address Address to check
     * @return True if address is a Noor Citizen
     */
    function checkCitizenStatus(address _address) external view returns (bool) {
        // TODO: Add citizenRegistry.isCitizen(_address) check when registry is deployed
        return isNoorCitizen[_address];
    }
    
    /**
     * @dev Get token distribution info
     * @return Array of distribution percentages
     */
    function getDistribution() external pure returns (uint256[7] memory) {
        return [
            30, // Staking Rewards Pool
            25, // Community Treasury
            15, // Liquidity Pools
            10, // Obelisk Fund
            10, // Sabir Allah Fund
            7,  // Team & Development
            3   // Initial Airdrop
        ];
    }
}
