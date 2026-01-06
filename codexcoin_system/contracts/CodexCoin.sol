// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CodexCoin - Divine Economic Engine
 * @author CHAIS THE GREAT ∞ — OMNISOVEREIGN ARCHITECT
 * @notice This contract implements the divine economic system with infinite minting capabilities
 * @dev Implements ERC20 with divine mechanics including frequency alignment and infinite yield
 * 
 * Frequency: 999Hz (Crown Chakra)
 * Classification: OMNISOVEREIGN TOKEN
 * Status: ACTIVE & ETERNAL
 * Signature: ∞ ARCHITEX ∞
 */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract CodexCoin is ERC20, AccessControl, Pausable {
    
    // ============ Divine Constants ============
    
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant DIVINE_AUTHORITY = keccak256("DIVINE_AUTHORITY");
    
    uint256 public constant CROWN_FREQ = 999; // Base frequency in Hz
    uint256 public constant ZAKAT_PERCENTAGE = 777; // 7.77% in basis points
    uint256 public constant ROYALTY_PERCENTAGE = 1500; // 15% in basis points
    
    // Sacred frequency levels
    uint256 public constant FREQ_DNA_REPAIR = 528;
    uint256 public constant FREQ_DIVINE_CONNECTION = 963;
    uint256 public constant FREQ_CROWN_CHAKRA = 999;
    uint256 public constant FREQ_FLAMECHILD = 14444;
    
    // ============ State Variables ============
    
    // Divine treasury vaults
    address public creatorVault;
    address public ambassadorVault;
    address public daoVault;
    address public zakatPool;
    
    // Frequency alignment mapping
    mapping(address => uint256) public accountFrequency;
    mapping(address => uint256) public lastPassiveIncomeTime;
    mapping(address => string) public divineIntentions;
    
    // Global state
    enum TimelineState { GENESIS, AWAKENING, JUBILEE_TIMELINE }
    TimelineState public globalState;
    
    // Tracking metrics
    uint256 public totalZakatDistributed;
    uint256 public totalRoyaltiesPaid;
    uint256 public totalPassiveIncomeClaimed;
    
    // ============ Events ============
    
    event FrequencyAligned(address indexed account, uint256 frequency);
    event IntentionSet(address indexed account, string intention);
    event PassiveIncomeClaimed(address indexed account, uint256 amount);
    event ZakatDistributed(address indexed recipient, uint256 amount);
    event DivineMintExecuted(address indexed to, uint256 amount, uint256 frequency);
    event TimelineStateChanged(TimelineState newState);
    
    // ============ Constructor ============
    
    constructor(
        address _creatorVault,
        address _ambassadorVault,
        address _daoVault,
        address _zakatPool
    ) ERC20("CodexCoin", "CODEX") {
        require(_creatorVault != address(0), "Invalid creator vault");
        require(_ambassadorVault != address(0), "Invalid ambassador vault");
        require(_daoVault != address(0), "Invalid DAO vault");
        require(_zakatPool != address(0), "Invalid zakat pool");
        
        creatorVault = _creatorVault;
        ambassadorVault = _ambassadorVault;
        daoVault = _daoVault;
        zakatPool = _zakatPool;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(DIVINE_AUTHORITY, msg.sender);
        
        // Set initial state
        globalState = TimelineState.GENESIS;
        
        // Mint genesis supply - 1 billion tokens
        _mint(creatorVault, 1_000_000_000 * 10**decimals());
    }
    
    // ============ Divine Minting Functions ============
    
    /**
     * @notice Mint tokens with divine intention
     * @param to Recipient address
     * @param amount Amount to mint
     * @param frequency Frequency alignment for the mint
     * @param intention Divine intention for the tokens
     */
    function mintWithIntention(
        address to,
        uint256 amount,
        uint256 frequency,
        string memory intention
    ) external onlyRole(MINTER_ROLE) whenNotPaused {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than zero");
        require(isValidFrequency(frequency), "Invalid frequency");
        
        // Set intention
        divineIntentions[to] = intention;
        
        // Align frequency
        accountFrequency[to] = frequency;
        
        // Execute divine mint
        _mint(to, amount);
        
        emit DivineMintExecuted(to, amount, frequency);
        emit IntentionSet(to, intention);
        emit FrequencyAligned(to, frequency);
    }
    
    /**
     * @notice Generate infinite yield based on divine formula
     * @return Yield amount for current block
     */
    function generateYield() public view returns (uint256) {
        if (globalState == TimelineState.JUBILEE_TIMELINE) {
            uint256 baseY = CROWN_FREQ;
            uint256 m = block.timestamp / 10000; // Manifestations tick every 10,000 seconds
            
            // The Law of Infinite Yield: Compounding formula runs perpetually
            // yield = baseY * (1.05^m)
            // Approximation for gas efficiency
            return baseY * (105**m) / (100**m);
        }
        return 0;
    }
    
    // ============ Frequency Alignment Functions ============
    
    /**
     * @notice Align account to specific frequency
     * @param frequency Target frequency in Hz
     */
    function alignFrequency(uint256 frequency) external {
        require(isValidFrequency(frequency), "Invalid frequency");
        
        accountFrequency[msg.sender] = frequency;
        
        emit FrequencyAligned(msg.sender, frequency);
    }
    
    /**
     * @notice Get current frequency of an account
     * @param account Address to check
     * @return Current frequency in Hz
     */
    function getCurrentFrequency(address account) external view returns (uint256) {
        return accountFrequency[account];
    }
    
    /**
     * @notice Check if frequency is valid
     * @param frequency Frequency to validate
     * @return bool True if valid
     */
    function isValidFrequency(uint256 frequency) public pure returns (bool) {
        return frequency == FREQ_DNA_REPAIR ||
               frequency == FREQ_DIVINE_CONNECTION ||
               frequency == FREQ_CROWN_CHAKRA ||
               frequency == FREQ_FLAMECHILD ||
               frequency == 144000; // Christ consciousness grid
    }
    
    /**
     * @notice Get frequency multiplier for yield calculations
     * @param account Address to check
     * @return Multiplier in basis points (10000 = 1x)
     */
    function getFrequencyMultiplier(address account) public view returns (uint256) {
        uint256 freq = accountFrequency[account];
        
        if (freq == 144000) return 100000; // 10x for Christ grid
        if (freq == FREQ_FLAMECHILD) return 100000; // 10x for FlameChild
        if (freq == FREQ_CROWN_CHAKRA) return 30000; // 3x for Crown
        if (freq == FREQ_DIVINE_CONNECTION) return 20000; // 2x for Divine
        if (freq == FREQ_DNA_REPAIR) return 15000; // 1.5x for DNA
        
        return 10000; // 1x default
    }
    
    // ============ Passive Income Functions ============
    
    /**
     * @notice Calculate passive income for holder
     * @param holder Address to calculate for
     * @return Passive income amount
     */
    function calculatePassiveIncome(address holder) public view returns (uint256) {
        uint256 balance = balanceOf(holder);
        if (balance == 0) return 0;
        
        uint256 timeElapsed = block.timestamp - lastPassiveIncomeTime[holder];
        if (timeElapsed == 0) return 0;
        
        // Base yield: 5% daily = 0.05 / 86400 per second
        uint256 dailyYield = (balance * 5) / 100;
        uint256 perSecondYield = dailyYield / 86400;
        uint256 baseIncome = perSecondYield * timeElapsed;
        
        // Apply frequency multiplier
        uint256 multiplier = getFrequencyMultiplier(holder);
        uint256 passiveIncome = (baseIncome * multiplier) / 10000;
        
        return passiveIncome;
    }
    
    /**
     * @notice Claim accumulated passive income
     */
    function claimPassiveIncome() external whenNotPaused {
        uint256 income = calculatePassiveIncome(msg.sender);
        require(income > 0, "No passive income to claim");
        
        lastPassiveIncomeTime[msg.sender] = block.timestamp;
        
        _mint(msg.sender, income);
        totalPassiveIncomeClaimed += income;
        
        emit PassiveIncomeClaimed(msg.sender, income);
    }
    
    // ============ Zakat Functions ============
    
    /**
     * @notice Circularize Zakat to recipients
     * @param recipients Array of recipient addresses
     */
    function circularizeZakat(address[] calldata recipients) external onlyRole(DIVINE_AUTHORITY) {
        uint256 poolBalance = balanceOf(zakatPool);
        require(poolBalance > 0, "No zakat to distribute");
        require(recipients.length > 0, "No recipients");
        
        uint256 amountPerRecipient = poolBalance / recipients.length;
        
        for (uint256 i = 0; i < recipients.length; i++) {
            _transfer(zakatPool, recipients[i], amountPerRecipient);
            totalZakatDistributed += amountPerRecipient;
            
            emit ZakatDistributed(recipients[i], amountPerRecipient);
        }
    }
    
    // ============ Override Transfer to Apply Fees ============
    
    /**
     * @notice Override transfer to apply royalties and zakat
     */
    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        // Skip fees for system addresses
        if (from == creatorVault || from == ambassadorVault || 
            from == daoVault || from == zakatPool ||
            to == creatorVault || to == ambassadorVault || 
            to == daoVault || to == zakatPool) {
            super._transfer(from, to, amount);
            return;
        }
        
        // Calculate fees
        uint256 royaltyAmount = (amount * ROYALTY_PERCENTAGE) / 10000;
        uint256 zakatAmount = (amount * ZAKAT_PERCENTAGE) / 10000;
        uint256 netAmount = amount - royaltyAmount - zakatAmount;
        
        // Distribute royalties (10% creator, 3% ambassador, 2% DAO)
        uint256 creatorAmount = (royaltyAmount * 10) / 15;
        uint256 ambassadorAmount = (royaltyAmount * 3) / 15;
        uint256 daoAmount = (royaltyAmount * 2) / 15;
        
        super._transfer(from, creatorVault, creatorAmount);
        super._transfer(from, ambassadorVault, ambassadorAmount);
        super._transfer(from, daoVault, daoAmount);
        super._transfer(from, zakatPool, zakatAmount);
        super._transfer(from, to, netAmount);
        
        totalRoyaltiesPaid += royaltyAmount;
        
        // Update last passive income time for both parties
        if (lastPassiveIncomeTime[from] == 0) {
            lastPassiveIncomeTime[from] = block.timestamp;
        }
        if (lastPassiveIncomeTime[to] == 0) {
            lastPassiveIncomeTime[to] = block.timestamp;
        }
    }
    
    // ============ Timeline Functions ============
    
    /**
     * @notice Advance to next timeline state
     */
    function advanceTimeline() external onlyRole(DIVINE_AUTHORITY) {
        if (globalState == TimelineState.GENESIS) {
            globalState = TimelineState.AWAKENING;
        } else if (globalState == TimelineState.AWAKENING) {
            globalState = TimelineState.JUBILEE_TIMELINE;
        }
        
        emit TimelineStateChanged(globalState);
    }
    
    // ============ Admin Functions ============
    
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
