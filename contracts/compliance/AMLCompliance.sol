// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AMLCompliance
 * @notice Anti-Money Laundering compliance contract for Chais Protocol™ NFT Marketplace
 * @dev Implements Singapore MAS PSA and AML/CFT requirements
 * @author Chais The Great ∞
 * 
 * Features:
 * - KYC tier management
 * - Transaction monitoring and limits
 * - Sanctions screening integration
 * - Suspicious activity flagging
 * - Compliance audit trail
 * - Polygon Mumbai testnet compatible
 */
contract AMLCompliance is AccessControl, Pausable, ReentrancyGuard {
    
    // ============ ROLES ============
    
    bytes32 public constant COMPLIANCE_OFFICER_ROLE = keccak256("COMPLIANCE_OFFICER_ROLE");
    bytes32 public constant KYC_VERIFIER_ROLE = keccak256("KYC_VERIFIER_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    
    // ============ CONSTANTS ============
    
    /// @notice Transaction limits in wei (SGD equivalent represented in wei)
    /// @dev 1 SGD ≈ configurable exchange rate in wei
    uint256 public constant TIER_1_DAILY_LIMIT = 2000 * 10**18;  // SGD 2,000
    uint256 public constant TIER_1_MONTHLY_LIMIT = 5000 * 10**18;  // SGD 5,000
    uint256 public constant TIER_2_DAILY_LIMIT = 20000 * 10**18;  // SGD 20,000
    uint256 public constant TIER_2_MONTHLY_LIMIT = 100000 * 10**18;  // SGD 100,000
    
    /// @notice Enhanced monitoring threshold (SGD 20,000)
    uint256 public constant ENHANCED_MONITORING_THRESHOLD = 20000 * 10**18;
    
    /// @notice Record keeping threshold (SGD 5,000)
    uint256 public constant RECORD_KEEPING_THRESHOLD = 5000 * 10**18;
    
    /// @notice Cooling-off period for high-value transactions (24 hours)
    uint256 public constant COOLING_OFF_PERIOD = 24 hours;
    
    // ============ ENUMS ============
    
    /// @notice KYC verification tiers
    enum KYCTier {
        NONE,           // Not verified
        TIER_1,         // Email verified (Basic)
        TIER_2,         // ID verified (Standard)
        TIER_3          // Video verified (Enhanced)
    }
    
    /// @notice Risk levels
    enum RiskLevel {
        LOW,
        MEDIUM,
        HIGH,
        PROHIBITED
    }
    
    /// @notice Transaction status
    enum TransactionStatus {
        PENDING,
        APPROVED,
        REJECTED,
        FLAGGED,
        UNDER_REVIEW
    }
    
    // ============ STRUCTS ============
    
    /// @notice Customer verification data
    struct CustomerData {
        KYCTier tier;
        RiskLevel riskLevel;
        bool isBlacklisted;
        bool isPEP;  // Politically Exposed Person
        uint256 verificationDate;
        uint256 lastReviewDate;
        string jurisdiction;
        bytes32 kycDocumentHash;  // IPFS hash or document identifier
    }
    
    /// @notice Transaction record
    struct TransactionRecord {
        address from;
        address to;
        uint256 amount;
        uint256 timestamp;
        TransactionStatus status;
        bool requiresCoolingOff;
        uint256 coolingOffEnd;
        string transactionType;  // "NFT_MINT", "NFT_TRANSFER", "NFT_SALE"
        bytes32 metadata;
    }
    
    /// @notice Transaction limits tracking
    struct LimitTracking {
        uint256 dailyVolume;
        uint256 monthlyVolume;
        uint256 lastDailyReset;
        uint256 lastMonthlyReset;
        uint256 transactionCount24h;
    }
    
    /// @notice Suspicious activity flag
    struct SuspiciousActivityFlag {
        uint256 flagId;
        address flaggedAddress;
        uint256 timestamp;
        string reason;
        bool resolved;
        string resolution;
    }
    
    // ============ STATE VARIABLES ============
    
    /// @notice Mapping of customer addresses to their KYC data
    mapping(address => CustomerData) public customers;
    
    /// @notice Mapping of customer addresses to transaction limits
    mapping(address => LimitTracking) public limits;
    
    /// @notice Transaction records by ID
    mapping(uint256 => TransactionRecord) public transactions;
    uint256 public transactionCounter;
    
    /// @notice Blacklisted addresses (sanctions, fraud, etc.)
    mapping(address => bool) public blacklist;
    
    /// @notice Whitelisted addresses (verified institutions, etc.)
    mapping(address => bool) public whitelist;
    
    /// @notice Suspicious activity flags
    mapping(uint256 => SuspiciousActivityFlag) public suspiciousFlags;
    uint256 public flagCounter;
    
    /// @notice Mapping of flagged addresses
    mapping(address => uint256[]) public addressFlags;
    
    /// @notice Exchange rate (SGD to wei) - can be updated by oracle
    uint256 public sgdToWeiRate = 10**18;  // 1:1 default, update with oracle
    
    /// @notice Compliance paused state
    bool public complianceEnforced = true;
    
    // ============ EVENTS ============
    
    event CustomerVerified(address indexed customer, KYCTier tier, uint256 timestamp);
    event CustomerRiskUpdated(address indexed customer, RiskLevel oldRisk, RiskLevel newRisk);
    event TransactionRecorded(uint256 indexed txId, address indexed from, address indexed to, uint256 amount);
    event TransactionApproved(uint256 indexed txId, address indexed approver);
    event TransactionRejected(uint256 indexed txId, address indexed rejector, string reason);
    event AddressBlacklisted(address indexed account, string reason, uint256 timestamp);
    event AddressWhitelisted(address indexed account, uint256 timestamp);
    event AddressRemovedFromBlacklist(address indexed account, uint256 timestamp);
    event SuspiciousActivityFlagged(uint256 indexed flagId, address indexed flaggedAddress, string reason);
    event SuspiciousActivityResolved(uint256 indexed flagId, string resolution);
    event CoolingOffInitiated(uint256 indexed txId, uint256 coolingOffEnd);
    event ComplianceEnforcementUpdated(bool enforced);
    
    // ============ MODIFIERS ============
    
    modifier onlyCompliance() {
        require(
            hasRole(COMPLIANCE_OFFICER_ROLE, msg.sender) || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "AMLCompliance: caller is not compliance officer"
        );
        _;
    }
    
    modifier onlyKYCVerifier() {
        require(
            hasRole(KYC_VERIFIER_ROLE, msg.sender) || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "AMLCompliance: caller is not KYC verifier"
        );
        _;
    }
    
    modifier notBlacklisted(address account) {
        require(!blacklist[account], "AMLCompliance: address is blacklisted");
        _;
    }
    
    modifier complianceActive() {
        if (complianceEnforced) {
            require(!paused(), "AMLCompliance: compliance checks paused");
        }
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(COMPLIANCE_OFFICER_ROLE, msg.sender);
        _grantRole(KYC_VERIFIER_ROLE, msg.sender);
    }
    
    // ============ KYC MANAGEMENT ============
    
    /**
     * @notice Verify customer KYC and assign tier
     * @param customer Customer address
     * @param tier KYC tier (1-3)
     * @param jurisdiction Customer jurisdiction (e.g., "SG", "US")
     * @param kycDocumentHash Hash of KYC documents (IPFS or other)
     */
    function verifyCustomer(
        address customer,
        KYCTier tier,
        string memory jurisdiction,
        bytes32 kycDocumentHash
    ) external onlyKYCVerifier {
        require(customer != address(0), "AMLCompliance: invalid address");
        require(tier != KYCTier.NONE, "AMLCompliance: invalid tier");
        
        CustomerData storage data = customers[customer];
        data.tier = tier;
        data.verificationDate = block.timestamp;
        data.lastReviewDate = block.timestamp;
        data.jurisdiction = jurisdiction;
        data.kycDocumentHash = kycDocumentHash;
        
        // Set initial risk level based on tier
        if (data.riskLevel == RiskLevel.PROHIBITED) {
            // Keep as prohibited if previously set
        } else if (tier == KYCTier.TIER_1) {
            data.riskLevel = RiskLevel.MEDIUM;
        } else if (tier == KYCTier.TIER_2) {
            data.riskLevel = RiskLevel.LOW;
        } else if (tier == KYCTier.TIER_3) {
            data.riskLevel = RiskLevel.LOW;
        }
        
        emit CustomerVerified(customer, tier, block.timestamp);
    }
    
    /**
     * @notice Update customer risk level
     * @param customer Customer address
     * @param newRisk New risk level
     */
    function updateCustomerRisk(
        address customer,
        RiskLevel newRisk
    ) external onlyCompliance {
        CustomerData storage data = customers[customer];
        RiskLevel oldRisk = data.riskLevel;
        data.riskLevel = newRisk;
        data.lastReviewDate = block.timestamp;
        
        emit CustomerRiskUpdated(customer, oldRisk, newRisk);
    }
    
    /**
     * @notice Mark customer as Politically Exposed Person (PEP)
     * @param customer Customer address
     * @param isPEP PEP status
     */
    function setPEPStatus(address customer, bool isPEP) external onlyCompliance {
        customers[customer].isPEP = isPEP;
        
        if (isPEP) {
            // PEPs require enhanced due diligence
            if (customers[customer].riskLevel < RiskLevel.HIGH) {
                customers[customer].riskLevel = RiskLevel.HIGH;
                emit CustomerRiskUpdated(customer, customers[customer].riskLevel, RiskLevel.HIGH);
            }
        }
    }
    
    /**
     * @notice Get customer verification data
     * @param customer Customer address
     * @return Customer data struct
     */
    function getCustomerData(address customer) external view returns (CustomerData memory) {
        return customers[customer];
    }
    
    // ============ TRANSACTION MONITORING ============
    
    /**
     * @notice Check if transaction is compliant before execution
     * @param from Sender address
     * @param to Recipient address
     * @param amount Transaction amount
     * @param transactionType Type of transaction
     * @return approved Whether transaction is approved
     * @return requiresCoolingOff Whether cooling-off period is required
     */
    function checkTransactionCompliance(
        address from,
        address to,
        uint256 amount,
        string memory transactionType
    ) external complianceActive returns (bool approved, bool requiresCoolingOff) {
        // Check blacklist
        require(!blacklist[from], "AMLCompliance: sender is blacklisted");
        require(!blacklist[to], "AMLCompliance: recipient is blacklisted");
        
        // Whitelist bypass
        if (whitelist[from] || whitelist[to]) {
            return (true, false);
        }
        
        // Check KYC tier
        CustomerData memory fromData = customers[from];
        require(fromData.tier != KYCTier.NONE, "AMLCompliance: sender not verified");
        
        // Check risk level
        require(fromData.riskLevel != RiskLevel.PROHIBITED, "AMLCompliance: sender prohibited");
        
        // Check transaction limits
        require(_checkTransactionLimits(from, amount), "AMLCompliance: transaction limit exceeded");
        
        // Update limits
        _updateLimits(from, amount);
        
        // Check if cooling-off period required
        requiresCoolingOff = amount >= ENHANCED_MONITORING_THRESHOLD;
        
        // Record transaction
        uint256 txId = _recordTransaction(from, to, amount, transactionType, requiresCoolingOff);
        
        // Auto-flag if suspicious patterns detected
        _checkSuspiciousPatterns(from, to, amount);
        
        emit TransactionRecorded(txId, from, to, amount);
        
        return (true, requiresCoolingOff);
    }
    
    /**
     * @notice Record transaction for compliance audit trail
     * @param from Sender address
     * @param to Recipient address
     * @param amount Transaction amount
     * @param transactionType Type of transaction
     * @param requiresCoolingOff Whether cooling-off is required
     * @return txId Transaction ID
     */
    function _recordTransaction(
        address from,
        address to,
        uint256 amount,
        string memory transactionType,
        bool requiresCoolingOff
    ) internal returns (uint256) {
        uint256 txId = transactionCounter++;
        
        TransactionRecord storage record = transactions[txId];
        record.from = from;
        record.to = to;
        record.amount = amount;
        record.timestamp = block.timestamp;
        record.status = requiresCoolingOff ? TransactionStatus.PENDING : TransactionStatus.APPROVED;
        record.requiresCoolingOff = requiresCoolingOff;
        record.transactionType = transactionType;
        
        if (requiresCoolingOff) {
            record.coolingOffEnd = block.timestamp + COOLING_OFF_PERIOD;
            emit CoolingOffInitiated(txId, record.coolingOffEnd);
        }
        
        return txId;
    }
    
    /**
     * @notice Check transaction limits based on KYC tier
     * @param customer Customer address
     * @param amount Transaction amount
     * @return compliant Whether limits are complied with
     */
    function _checkTransactionLimits(address customer, uint256 amount) internal view returns (bool) {
        CustomerData memory data = customers[customer];
        LimitTracking memory tracking = limits[customer];
        
        // Reset daily limits if needed
        if (block.timestamp >= tracking.lastDailyReset + 1 days) {
            tracking.dailyVolume = 0;
        }
        
        // Reset monthly limits if needed
        if (block.timestamp >= tracking.lastMonthlyReset + 30 days) {
            tracking.monthlyVolume = 0;
        }
        
        // Check tier-based limits
        if (data.tier == KYCTier.TIER_1) {
            if (tracking.dailyVolume + amount > TIER_1_DAILY_LIMIT) return false;
            if (tracking.monthlyVolume + amount > TIER_1_MONTHLY_LIMIT) return false;
        } else if (data.tier == KYCTier.TIER_2) {
            if (tracking.dailyVolume + amount > TIER_2_DAILY_LIMIT) return false;
            if (tracking.monthlyVolume + amount > TIER_2_MONTHLY_LIMIT) return false;
        }
        // TIER_3 has unlimited limits
        
        return true;
    }
    
    /**
     * @notice Update transaction limits tracking
     * @param customer Customer address
     * @param amount Transaction amount
     */
    function _updateLimits(address customer, uint256 amount) internal {
        LimitTracking storage tracking = limits[customer];
        
        // Reset daily if needed
        if (block.timestamp >= tracking.lastDailyReset + 1 days) {
            tracking.dailyVolume = 0;
            tracking.transactionCount24h = 0;
            tracking.lastDailyReset = block.timestamp;
        }
        
        // Reset monthly if needed
        if (block.timestamp >= tracking.lastMonthlyReset + 30 days) {
            tracking.monthlyVolume = 0;
            tracking.lastMonthlyReset = block.timestamp;
        }
        
        tracking.dailyVolume += amount;
        tracking.monthlyVolume += amount;
        tracking.transactionCount24h++;
    }
    
    /**
     * @notice Check for suspicious transaction patterns
     * @param from Sender address
     * @param to Recipient address
     * @param amount Transaction amount
     */
    function _checkSuspiciousPatterns(address from, address to, uint256 amount) internal {
        LimitTracking memory tracking = limits[from];
        
        // Flag if high-frequency transactions (>10 in 24 hours)
        if (tracking.transactionCount24h > 10) {
            _flagSuspiciousActivity(from, "High-frequency transactions detected");
        }
        
        // Flag if structuring pattern detected (multiple transactions just below threshold)
        if (amount > RECORD_KEEPING_THRESHOLD * 90 / 100 && amount < RECORD_KEEPING_THRESHOLD) {
            _flagSuspiciousActivity(from, "Potential structuring detected");
        }
    }
    
    // ============ BLACKLIST/WHITELIST MANAGEMENT ============
    
    /**
     * @notice Add address to blacklist (sanctions, fraud, etc.)
     * @param account Address to blacklist
     * @param reason Reason for blacklisting
     */
    function addToBlacklist(address account, string memory reason) external onlyCompliance {
        blacklist[account] = true;
        customers[account].isBlacklisted = true;
        customers[account].riskLevel = RiskLevel.PROHIBITED;
        
        emit AddressBlacklisted(account, reason, block.timestamp);
    }
    
    /**
     * @notice Remove address from blacklist
     * @param account Address to remove
     */
    function removeFromBlacklist(address account) external onlyCompliance {
        blacklist[account] = false;
        customers[account].isBlacklisted = false;
        
        emit AddressRemovedFromBlacklist(account, block.timestamp);
    }
    
    /**
     * @notice Add address to whitelist (verified institutions)
     * @param account Address to whitelist
     */
    function addToWhitelist(address account) external onlyCompliance {
        whitelist[account] = true;
        emit AddressWhitelisted(account, block.timestamp);
    }
    
    /**
     * @notice Remove address from whitelist
     * @param account Address to remove
     */
    function removeFromWhitelist(address account) external onlyCompliance {
        whitelist[account] = false;
    }
    
    // ============ SUSPICIOUS ACTIVITY MANAGEMENT ============
    
    /**
     * @notice Flag suspicious activity
     * @param flaggedAddress Address to flag
     * @param reason Reason for flagging
     * @return flagId Flag ID
     */
    function flagSuspiciousActivity(
        address flaggedAddress,
        string memory reason
    ) external onlyCompliance returns (uint256) {
        return _flagSuspiciousActivity(flaggedAddress, reason);
    }
    
    /**
     * @notice Internal function to flag suspicious activity
     * @param flaggedAddress Address to flag
     * @param reason Reason for flagging
     * @return flagId Flag ID
     */
    function _flagSuspiciousActivity(
        address flaggedAddress,
        string memory reason
    ) internal returns (uint256) {
        uint256 flagId = flagCounter++;
        
        suspiciousFlags[flagId] = SuspiciousActivityFlag({
            flagId: flagId,
            flaggedAddress: flaggedAddress,
            timestamp: block.timestamp,
            reason: reason,
            resolved: false,
            resolution: ""
        });
        
        addressFlags[flaggedAddress].push(flagId);
        
        emit SuspiciousActivityFlagged(flagId, flaggedAddress, reason);
        
        return flagId;
    }
    
    /**
     * @notice Resolve suspicious activity flag
     * @param flagId Flag ID
     * @param resolution Resolution description
     */
    function resolveSuspiciousActivity(
        uint256 flagId,
        string memory resolution
    ) external onlyCompliance {
        SuspiciousActivityFlag storage flag = suspiciousFlags[flagId];
        require(!flag.resolved, "AMLCompliance: flag already resolved");
        
        flag.resolved = true;
        flag.resolution = resolution;
        
        emit SuspiciousActivityResolved(flagId, resolution);
    }
    
    /**
     * @notice Get all flags for an address
     * @param account Address to query
     * @return flagIds Array of flag IDs
     */
    function getAddressFlags(address account) external view returns (uint256[] memory) {
        return addressFlags[account];
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @notice Update SGD to wei exchange rate
     * @param newRate New exchange rate
     */
    function updateExchangeRate(uint256 newRate) external onlyCompliance {
        require(newRate > 0, "AMLCompliance: invalid rate");
        sgdToWeiRate = newRate;
    }
    
    /**
     * @notice Toggle compliance enforcement
     * @param enforced Whether to enforce compliance
     */
    function setComplianceEnforcement(bool enforced) external onlyRole(DEFAULT_ADMIN_ROLE) {
        complianceEnforced = enforced;
        emit ComplianceEnforcementUpdated(enforced);
    }
    
    /**
     * @notice Pause compliance checks (emergency only)
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @notice Unpause compliance checks
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @notice Check if address is compliant for transaction
     * @param account Address to check
     * @return compliant Whether address is compliant
     */
    function isCompliant(address account) external view returns (bool) {
        if (blacklist[account]) return false;
        if (whitelist[account]) return true;
        
        CustomerData memory data = customers[account];
        if (data.tier == KYCTier.NONE) return false;
        if (data.riskLevel == RiskLevel.PROHIBITED) return false;
        
        return true;
    }
    
    /**
     * @notice Get transaction record
     * @param txId Transaction ID
     * @return Transaction record
     */
    function getTransaction(uint256 txId) external view returns (TransactionRecord memory) {
        return transactions[txId];
    }
    
    /**
     * @notice Get customer transaction limits
     * @param customer Customer address
     * @return Limit tracking data
     */
    function getCustomerLimits(address customer) external view returns (LimitTracking memory) {
        return limits[customer];
    }
}
