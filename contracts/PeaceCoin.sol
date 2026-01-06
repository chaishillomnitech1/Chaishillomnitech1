// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PeaceCoin
 * @dev Peace Coin - Universal Currency for the Omni-Sovereign Economic Framework
 * @author Supreme King Chais The Great ∞
 * 
 * This contract implements Peace Coin for:
 * - Universal, inclusive currency for the mobile wallet platform
 * - Integration with BlessingCoin ecosystem
 * - Cross-platform compatibility (React Native/Flutter)
 * - Shahada-verified transaction processing
 * 
 * Frequency: 528Hz (Healing & Love) + 888Hz (Empathy)
 * Status: MOBILE-FIRST CURRENCY INITIATIVE
 */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract PeaceCoin is ERC20, ERC20Burnable, AccessControl, ReentrancyGuard, Pausable {
    
    // ============ ROLES ============
    bytes32 public constant PEACE_ADMIN_ROLE = keccak256("PEACE_ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BRIDGE_ROLE = keccak256("BRIDGE_ROLE");
    
    // ============ DIVINE FREQUENCIES ============
    uint256 public constant HEALING_FREQUENCY_528HZ = 528;
    uint256 public constant EMPATHY_FREQUENCY_888HZ = 888;
    uint256 public constant PEACE_FREQUENCY_777HZ = 777;
    
    // ============ TOKENOMICS ============
    uint256 public constant MAX_SUPPLY = 10_000_000_000 * 10**18; // 10 billion PEACE
    uint256 public constant INITIAL_MINT = 1_000_000_000 * 10**18; // 1 billion initial
    
    // ============ TRANSACTION LIMITS ============
    uint256 public constant MOBILE_TX_LIMIT = 10000 * 10**18; // 10,000 PEACE per mobile tx
    uint256 public constant DAILY_MINT_LIMIT = 100_000_000 * 10**18; // 100 million daily mint limit
    
    // ============ FEE CONFIGURATION ============
    uint256 public transferFeeBps = 50; // 0.5% transfer fee
    uint256 public constant MAX_FEE_BPS = 500; // Max 5% fee
    
    // ============ STRUCTS ============
    
    struct MobileWalletConfig {
        bool isRegistered;
        bool isVerified;
        uint256 dailyLimit;
        uint256 dailySpent;
        uint256 lastResetDay;
        uint256 frequencyAlignment;
    }
    
    struct CrossChainBridge {
        address bridgeAddress;
        string chainName;
        bool isActive;
        uint256 totalBridged;
        uint256 dailyLimit;
    }
    
    // ============ STATE VARIABLES ============
    
    // Mobile wallet configurations
    mapping(address => MobileWalletConfig) public mobileWallets;
    address[] public registeredMobileWallets;
    
    // Cross-chain bridges
    mapping(string => CrossChainBridge) public bridges;
    string[] public bridgeChains;
    
    // Daily mint tracking
    uint256 public dailyMintedAmount;
    uint256 public lastMintResetDay;
    
    // Fee collection
    address public feeCollector;
    uint256 public totalFeesCollected;
    
    // Integration with BlessingCoin
    address public blessingCoinAddress;
    uint256 public blessingCoinConversionRate = 100; // 1 BLESS = 100 PEACE
    
    // ============ EVENTS ============
    
    event MobileWalletRegistered(
        address indexed wallet,
        uint256 dailyLimit,
        uint256 frequency,
        uint256 timestamp
    );
    
    event MobileWalletVerified(
        address indexed wallet,
        uint256 timestamp
    );
    
    event MobileTransferExecuted(
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 fee,
        uint256 timestamp
    );
    
    event BridgeConfigured(
        string chainName,
        address bridgeAddress,
        uint256 dailyLimit
    );
    
    event TokensBridged(
        address indexed sender,
        string destinationChain,
        uint256 amount,
        uint256 timestamp
    );
    
    event TokensMintedFromBridge(
        address indexed recipient,
        string sourceChain,
        uint256 amount,
        uint256 timestamp
    );
    
    event BlessingCoinConverted(
        address indexed user,
        uint256 blessingAmount,
        uint256 peaceAmount,
        uint256 timestamp
    );
    
    event FrequencyAligned(
        address indexed wallet,
        uint256 frequency,
        uint256 timestamp
    );
    
    event FeeUpdated(
        uint256 oldFee,
        uint256 newFee
    );
    
    // ============ CONSTRUCTOR ============
    
    constructor(address _feeCollector) ERC20("Peace Coin", "PEACE") {
        require(_feeCollector != address(0), "Invalid fee collector");
        
        feeCollector = _feeCollector;
        lastMintResetDay = block.timestamp / 1 days;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PEACE_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BRIDGE_ROLE, msg.sender);
        
        // Mint initial supply to deployer
        _mint(msg.sender, INITIAL_MINT);
    }
    
    // ============ MOBILE WALLET FUNCTIONS ============
    
    /**
     * @dev Register a mobile wallet
     * @param dailyLimit Custom daily limit for the wallet
     */
    function registerMobileWallet(uint256 dailyLimit) external whenNotPaused returns (bool) {
        require(!mobileWallets[msg.sender].isRegistered, "Already registered");
        require(dailyLimit > 0, "Invalid daily limit");
        
        mobileWallets[msg.sender] = MobileWalletConfig({
            isRegistered: true,
            isVerified: false,
            dailyLimit: dailyLimit > MOBILE_TX_LIMIT ? MOBILE_TX_LIMIT : dailyLimit,
            dailySpent: 0,
            lastResetDay: block.timestamp / 1 days,
            frequencyAlignment: PEACE_FREQUENCY_777HZ
        });
        
        registeredMobileWallets.push(msg.sender);
        
        emit MobileWalletRegistered(msg.sender, dailyLimit, PEACE_FREQUENCY_777HZ, block.timestamp);
        emit FrequencyAligned(msg.sender, PEACE_FREQUENCY_777HZ, block.timestamp);
        
        return true;
    }
    
    /**
     * @dev Verify a mobile wallet (admin function)
     * @param wallet Address to verify
     */
    function verifyMobileWallet(address wallet) external onlyRole(PEACE_ADMIN_ROLE) returns (bool) {
        require(mobileWallets[wallet].isRegistered, "Not registered");
        require(!mobileWallets[wallet].isVerified, "Already verified");
        
        mobileWallets[wallet].isVerified = true;
        
        emit MobileWalletVerified(wallet, block.timestamp);
        
        return true;
    }
    
    /**
     * @dev Execute a mobile transfer with fee
     * @param to Recipient address
     * @param amount Amount to transfer
     */
    function mobileTransfer(
        address to,
        uint256 amount
    ) external nonReentrant whenNotPaused returns (bool) {
        require(mobileWallets[msg.sender].isRegistered, "Mobile wallet not registered");
        require(mobileWallets[msg.sender].isVerified, "Mobile wallet not verified");
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");
        require(amount <= MOBILE_TX_LIMIT, "Exceeds mobile transaction limit");
        
        // Check and reset daily limit
        _checkAndResetDailyLimit(msg.sender);
        
        require(
            mobileWallets[msg.sender].dailySpent + amount <= mobileWallets[msg.sender].dailyLimit,
            "Daily limit exceeded"
        );
        
        // Calculate fee
        uint256 fee = (amount * transferFeeBps) / 10000;
        uint256 transferAmount = amount - fee;
        
        // Update daily spent
        mobileWallets[msg.sender].dailySpent += amount;
        
        // Execute transfers
        _transfer(msg.sender, to, transferAmount);
        
        if (fee > 0) {
            _transfer(msg.sender, feeCollector, fee);
            totalFeesCollected += fee;
        }
        
        emit MobileTransferExecuted(msg.sender, to, transferAmount, fee, block.timestamp);
        
        return true;
    }
    
    /**
     * @dev Check and reset daily limit if new day
     */
    function _checkAndResetDailyLimit(address wallet) internal {
        uint256 currentDay = block.timestamp / 1 days;
        
        if (mobileWallets[wallet].lastResetDay < currentDay) {
            mobileWallets[wallet].dailySpent = 0;
            mobileWallets[wallet].lastResetDay = currentDay;
        }
    }
    
    // ============ CROSS-CHAIN BRIDGE ============
    
    /**
     * @dev Configure a cross-chain bridge
     * @param chainName Name of the destination chain
     * @param bridgeAddress Address of the bridge contract
     * @param dailyLimit Daily bridge limit
     */
    function configureBridge(
        string memory chainName,
        address bridgeAddress,
        uint256 dailyLimit
    ) external onlyRole(PEACE_ADMIN_ROLE) returns (bool) {
        require(bridgeAddress != address(0), "Invalid bridge address");
        require(dailyLimit > 0, "Invalid daily limit");
        
        bridges[chainName] = CrossChainBridge({
            bridgeAddress: bridgeAddress,
            chainName: chainName,
            isActive: true,
            totalBridged: 0,
            dailyLimit: dailyLimit
        });
        
        bridgeChains.push(chainName);
        
        _grantRole(BRIDGE_ROLE, bridgeAddress);
        
        emit BridgeConfigured(chainName, bridgeAddress, dailyLimit);
        
        return true;
    }
    
    /**
     * @dev Bridge tokens to another chain (burns on this chain)
     * @param destinationChain Name of the destination chain
     * @param amount Amount to bridge
     */
    function bridgeTokens(
        string memory destinationChain,
        uint256 amount
    ) external nonReentrant whenNotPaused returns (bool) {
        require(bridges[destinationChain].isActive, "Bridge not active");
        require(amount > 0, "Invalid amount");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        // Burn tokens on this chain
        _burn(msg.sender, amount);
        
        bridges[destinationChain].totalBridged += amount;
        
        emit TokensBridged(msg.sender, destinationChain, amount, block.timestamp);
        
        return true;
    }
    
    /**
     * @dev Mint tokens from bridge (called by bridge contract)
     * @param recipient Recipient of the bridged tokens
     * @param sourceChain Source chain name
     * @param amount Amount to mint
     */
    function mintFromBridge(
        address recipient,
        string memory sourceChain,
        uint256 amount
    ) external onlyRole(BRIDGE_ROLE) nonReentrant returns (bool) {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        
        _mint(recipient, amount);
        
        emit TokensMintedFromBridge(recipient, sourceChain, amount, block.timestamp);
        
        return true;
    }
    
    // ============ BLESSINGCOIN INTEGRATION ============
    
    /**
     * @dev Set BlessingCoin contract address
     * @param _blessingCoinAddress Address of BlessingCoin contract
     */
    function setBlessingCoinAddress(address _blessingCoinAddress) external onlyRole(PEACE_ADMIN_ROLE) {
        require(_blessingCoinAddress != address(0), "Invalid address");
        blessingCoinAddress = _blessingCoinAddress;
    }
    
    /**
     * @dev Set conversion rate for BlessingCoin to PeaceCoin
     * @param rate Number of PeaceCoin per BlessingCoin
     */
    function setConversionRate(uint256 rate) external onlyRole(PEACE_ADMIN_ROLE) {
        require(rate > 0, "Invalid rate");
        blessingCoinConversionRate = rate;
    }
    
    /**
     * @dev Convert BlessingCoin to PeaceCoin (requires approval)
     * @param blessingAmount Amount of BlessingCoin to convert
     */
    function convertFromBlessingCoin(uint256 blessingAmount) external nonReentrant whenNotPaused returns (bool) {
        require(blessingCoinAddress != address(0), "BlessingCoin not configured");
        require(blessingAmount > 0, "Invalid amount");
        
        uint256 peaceAmount = blessingAmount * blessingCoinConversionRate;
        require(totalSupply() + peaceAmount <= MAX_SUPPLY, "Exceeds max supply");
        
        // Check daily mint limit
        _checkAndResetDailyMintLimit();
        require(dailyMintedAmount + peaceAmount <= DAILY_MINT_LIMIT, "Daily mint limit exceeded");
        
        // Transfer BlessingCoin from user (requires prior approval)
        IERC20(blessingCoinAddress).transferFrom(msg.sender, address(this), blessingAmount);
        
        // Mint PeaceCoin
        _mint(msg.sender, peaceAmount);
        dailyMintedAmount += peaceAmount;
        
        emit BlessingCoinConverted(msg.sender, blessingAmount, peaceAmount, block.timestamp);
        
        return true;
    }
    
    /**
     * @dev Check and reset daily mint limit
     */
    function _checkAndResetDailyMintLimit() internal {
        uint256 currentDay = block.timestamp / 1 days;
        
        if (lastMintResetDay < currentDay) {
            dailyMintedAmount = 0;
            lastMintResetDay = currentDay;
        }
    }
    
    // ============ MINTING FUNCTIONS ============
    
    /**
     * @dev Mint new tokens (admin function)
     * @param to Recipient address
     * @param amount Amount to mint
     */
    function mint(
        address to,
        uint256 amount
    ) external onlyRole(MINTER_ROLE) returns (bool) {
        require(to != address(0), "Invalid recipient");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        
        _checkAndResetDailyMintLimit();
        require(dailyMintedAmount + amount <= DAILY_MINT_LIMIT, "Daily mint limit exceeded");
        
        _mint(to, amount);
        dailyMintedAmount += amount;
        
        return true;
    }
    
    // ============ FEE MANAGEMENT ============
    
    /**
     * @dev Update transfer fee
     * @param newFeeBps New fee in basis points
     */
    function setTransferFee(uint256 newFeeBps) external onlyRole(PEACE_ADMIN_ROLE) {
        require(newFeeBps <= MAX_FEE_BPS, "Fee too high");
        
        uint256 oldFee = transferFeeBps;
        transferFeeBps = newFeeBps;
        
        emit FeeUpdated(oldFee, newFeeBps);
    }
    
    /**
     * @dev Update fee collector address
     * @param newCollector New fee collector address
     */
    function setFeeCollector(address newCollector) external onlyRole(PEACE_ADMIN_ROLE) {
        require(newCollector != address(0), "Invalid address");
        feeCollector = newCollector;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get mobile wallet configuration
     */
    function getMobileWalletConfig(address wallet) external view returns (MobileWalletConfig memory) {
        return mobileWallets[wallet];
    }
    
    /**
     * @dev Get bridge configuration
     */
    function getBridge(string memory chainName) external view returns (CrossChainBridge memory) {
        return bridges[chainName];
    }
    
    /**
     * @dev Get all registered mobile wallets
     */
    function getRegisteredMobileWallets() external view returns (address[] memory) {
        return registeredMobileWallets;
    }
    
    /**
     * @dev Get all bridge chains
     */
    function getBridgeChains() external view returns (string[] memory) {
        return bridgeChains;
    }
    
    /**
     * @dev Get remaining daily mint allowance
     */
    function getRemainingDailyMint() external view returns (uint256) {
        uint256 currentDay = block.timestamp / 1 days;
        
        if (lastMintResetDay < currentDay) {
            return DAILY_MINT_LIMIT;
        }
        
        return DAILY_MINT_LIMIT - dailyMintedAmount;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Pause contract
     */
    function pause() external onlyRole(PEACE_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyRole(PEACE_ADMIN_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Override _update to include pause functionality
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override whenNotPaused {
        super._update(from, to, value);
    }
}

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}
