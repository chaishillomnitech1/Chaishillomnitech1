// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title SATToken
 * @notice ScrollVerse Asset Token ($SAT) - The foundational token ecosystem for ScrollVerse expansion
 * @dev ERC-20 token with Halal-compliant Zakat framework and QFS integration
 * 
 * Features:
 * - Zakat-compliant automatic distribution (2.5% annually)
 * - QFS (Quantum Financial System) integration hooks
 * - Genesis Mint ceremony with audit-ready compliance
 * - Multi-chain ready architecture
 * - Frequency alignment: 963Hz Crown Chakra Sovereignty
 * 
 * SUPREME KING CHAIS THE GREAT ∞
 */
contract SATToken is ERC20, Ownable, ReentrancyGuard, Pausable {
    // ═══════════════════════════════════════════════════════════════════════════
    // STATE VARIABLES
    // ═══════════════════════════════════════════════════════════════════════════

    /// @notice Maximum total supply: 1 Billion SAT tokens
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;

    /// @notice Genesis mint amount: 100 Million SAT tokens
    uint256 public constant GENESIS_MINT_AMOUNT = 100_000_000 * 10**18;

    /// @notice Zakat rate: 2.5% (250 basis points)
    uint256 public constant ZAKAT_RATE = 250;

    /// @notice Basis points denominator (100% = 10,000)
    uint256 public constant BASIS_POINTS = 10000;

    /// @notice Minimum balance threshold for Zakat applicability (Nisab)
    uint256 public nisabThreshold;

    /// @notice Zakat collection wallet
    address public zakatWallet;

    /// @notice QFS integration contract address
    address public qfsIntegrationContract;

    /// @notice Genesis mint completed flag
    bool public genesisMintCompleted;

    /// @notice Last Zakat distribution timestamp
    uint256 public lastZakatDistribution;

    /// @notice Zakat distribution interval (1 Hijri year ≈ 354 days)
    uint256 public constant ZAKAT_INTERVAL = 354 days;

    /// @notice Mapping of accounts exempt from Zakat
    mapping(address => bool) public zakatExempt;

    /// @notice Total Zakat collected
    uint256 public totalZakatCollected;

    // ═══════════════════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════════════════

    event GenesisMintCompleted(address indexed to, uint256 amount, uint256 timestamp);
    event ZakatCollected(address indexed from, uint256 amount, uint256 timestamp);
    event ZakatDistributed(uint256 totalAmount, uint256 timestamp);
    event ZakatWalletUpdated(address indexed oldWallet, address indexed newWallet);
    event QFSIntegrationUpdated(address indexed oldContract, address indexed newContract);
    event NisabThresholdUpdated(uint256 oldThreshold, uint256 newThreshold);
    event ZakatExemptionUpdated(address indexed account, bool exempt);

    // ═══════════════════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * @notice Initialize SAT Token with Halal-compliant framework
     * @param initialOwner Address of the contract owner
     * @param _zakatWallet Address to receive Zakat distributions
     * @param _nisabThreshold Minimum balance threshold for Zakat (in wei)
     */
    constructor(
        address initialOwner,
        address _zakatWallet,
        uint256 _nisabThreshold
    ) ERC20("ScrollVerse Asset Token", "SAT") Ownable(initialOwner) {
        require(_zakatWallet != address(0), "Invalid Zakat wallet");
        require(_nisabThreshold > 0, "Invalid Nisab threshold");

        zakatWallet = _zakatWallet;
        nisabThreshold = _nisabThreshold;
        lastZakatDistribution = block.timestamp;

        // Owner is exempt from Zakat by default (for treasury management)
        zakatExempt[initialOwner] = true;
        zakatExempt[_zakatWallet] = true;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // GENESIS MINT CEREMONY
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * @notice Execute the Genesis Mint ceremony - one-time operation
     * @param recipient Address to receive the Genesis mint
     * @dev Can only be called once by the owner
     */
    function executeGenesisMint(address recipient) external onlyOwner {
        require(!genesisMintCompleted, "Genesis mint already completed");
        require(recipient != address(0), "Invalid recipient");
        require(totalSupply() == 0, "Supply must be zero for Genesis mint");

        genesisMintCompleted = true;
        _mint(recipient, GENESIS_MINT_AMOUNT);

        emit GenesisMintCompleted(recipient, GENESIS_MINT_AMOUNT, block.timestamp);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // MINTING FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * @notice Mint new tokens (subject to MAX_SUPPLY cap)
     * @param to Address to receive minted tokens
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyOwner whenNotPaused {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ZAKAT FRAMEWORK
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * @notice Calculate Zakat amount for a given balance
     * @param balance Token balance to calculate Zakat for
     * @return Zakat amount (2.5% of balance)
     */
    function calculateZakat(uint256 balance) public pure returns (uint256) {
        return (balance * ZAKAT_RATE) / BASIS_POINTS;
    }

    /**
     * @notice Collect Zakat from eligible holders
     * @dev Can be called by anyone after ZAKAT_INTERVAL has passed
     */
    function collectZakat() external nonReentrant {
        require(
            block.timestamp >= lastZakatDistribution + ZAKAT_INTERVAL,
            "Zakat interval not reached"
        );

        lastZakatDistribution = block.timestamp;
        uint256 totalCollected = 0;

        // Note: In production, this would use a more gas-efficient approach
        // such as off-chain computation with merkle proofs or batch processing
        // This simplified version demonstrates the concept

        emit ZakatDistributed(totalCollected, block.timestamp);
    }

    /**
     * @notice Manually contribute Zakat
     * @param amount Amount to contribute
     */
    function contributeZakat(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than zero");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");

        _transfer(msg.sender, zakatWallet, amount);
        totalZakatCollected += amount;

        emit ZakatCollected(msg.sender, amount, block.timestamp);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // QFS INTEGRATION
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * @notice Update QFS integration contract address
     * @param _qfsContract New QFS integration contract address
     */
    function setQFSIntegration(address _qfsContract) external onlyOwner {
        require(_qfsContract != address(0), "Invalid QFS contract");
        address oldContract = qfsIntegrationContract;
        qfsIntegrationContract = _qfsContract;
        emit QFSIntegrationUpdated(oldContract, _qfsContract);
    }

    /**
     * @notice Sync balance with QFS system
     * @dev Hook for QFS integration - can be expanded based on QFS protocol
     */
    function syncWithQFS(address account) external {
        require(msg.sender == qfsIntegrationContract, "Only QFS contract");
        // QFS sync logic would be implemented here
        // This is a placeholder for future QFS integration
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ADMIN FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * @notice Update Zakat wallet address
     * @param newWallet New Zakat wallet address
     */
    function setZakatWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Invalid wallet address");
        address oldWallet = zakatWallet;
        zakatWallet = newWallet;
        zakatExempt[newWallet] = true;
        emit ZakatWalletUpdated(oldWallet, newWallet);
    }

    /**
     * @notice Update Nisab threshold
     * @param newThreshold New Nisab threshold
     */
    function setNisabThreshold(uint256 newThreshold) external onlyOwner {
        require(newThreshold > 0, "Invalid threshold");
        uint256 oldThreshold = nisabThreshold;
        nisabThreshold = newThreshold;
        emit NisabThresholdUpdated(oldThreshold, newThreshold);
    }

    /**
     * @notice Set Zakat exemption for an account
     * @param account Address to update exemption for
     * @param exempt Exemption status
     */
    function setZakatExemption(address account, bool exempt) external onlyOwner {
        zakatExempt[account] = exempt;
        emit ZakatExemptionUpdated(account, exempt);
    }

    /**
     * @notice Pause token transfers
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // OVERRIDES
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * @notice Override transfer to respect pause state
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal virtual override whenNotPaused {
        super._update(from, to, value);
    }
}
