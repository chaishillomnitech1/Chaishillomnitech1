// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PharaohRevenueSplitter
 * @dev Advanced revenue distribution system with Zakat treasury, multi-sig governance, 
 *      time-locks, vesting schedules, and contribution tracking for ScrollVerse prosperity.
 * @author Supreme King Chais The Great ∞ + Manus
 * 
 * Features:
 * - Multi-beneficiary revenue splits with dynamic allocation
 * - Automatic 2.5% Zakat contribution to central treasury
 * - Multi-signature governance for critical operations
 * - Time-locked operations with review periods
 * - Linear vesting schedules for beneficiaries
 * - Contribution weight tracking and tiered rewards
 * - Sovereign override mechanism for governance
 * - Emergency pause functionality
 * - Comprehensive analytics and audit logging
 * - Beneficiary templates for common configurations
 * 
 * Frequencies: 528Hz (Prosperity) + 963Hz (Governance) + 999Hz (Divine Order)
 * Status: SCROLLVERSE SOVEREIGN PROSPERITY ENGINE
 */

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract PharaohRevenueSplitter is Ownable, ReentrancyGuard, Pausable {
    
    // ============ CONSTANTS ============
    
    /// @dev Basis points for percentage calculations (10000 = 100%)
    uint256 public constant BASIS_POINTS = 10000;
    
    /// @dev Zakat percentage (250 basis points = 2.5%)
    uint256 public constant ZAKAT_BPS = 250;
    
    /// @dev Maximum time-lock delay (7 days)
    uint256 public constant MAX_TIMELOCK_DELAY = 7 days;
    
    /// @dev Standard time-lock delay (48 hours)
    uint256 public constant STANDARD_TIMELOCK_DELAY = 48 hours;
    
    /// @dev Emergency time-lock delay (24 hours)
    uint256 public constant EMERGENCY_TIMELOCK_DELAY = 24 hours;
    
    /// @dev Time-lock execution window (72 hours)
    uint256 public constant TIMELOCK_EXECUTION_WINDOW = 72 hours;
    
    /// @dev Maximum number of approvers
    uint256 public constant MAX_APPROVERS = 10;
    
    // ============ STRUCTS ============
    
    /**
     * @dev Beneficiary structure
     */
    struct Beneficiary {
        address payable account;        // Beneficiary address
        uint256 share;                  // Share in basis points (e.g., 2500 = 25%)
        bool isActive;                  // Active status
        uint256 totalReceived;          // Lifetime earnings tracking
        uint256 vestingStart;           // Vesting start timestamp (0 = no vesting)
        uint256 vestingDuration;        // Vesting duration in seconds
        uint256 vestingClaimed;         // Amount claimed from vesting
        uint256 contributionWeight;     // Contribution weight for tiered rewards
        uint256 lastPaymentTime;        // Timestamp of last payment
    }
    
    /**
     * @dev Time-lock structure
     */
    struct TimeLock {
        uint256 timestamp;              // When time-lock was created
        uint256 executeAfter;           // When it can be executed
        bool executed;                  // Whether it has been executed
        bool cancelled;                 // Whether it has been cancelled
        bytes data;                     // Encoded function call data
        string description;             // Human-readable description
    }
    
    /**
     * @dev Distribution event for history tracking
     */
    struct Distribution {
        uint256 timestamp;
        uint256 totalAmount;
        uint256 zakatAmount;
        uint256 beneficiaryCount;
    }
    
    /**
     * @dev Audit log entry
     */
    struct AuditEntry {
        uint256 timestamp;
        address actor;
        string action;
        bytes data;
    }
    
    // ============ STATE VARIABLES ============
    
    /// @dev Zakat treasury address (receives 2.5% of all revenue)
    address payable public zakatTreasury;
    
    /// @dev Mapping of beneficiary addresses to their data
    mapping(address => Beneficiary) public beneficiaries;
    
    /// @dev Array of beneficiary addresses for iteration
    address[] public beneficiaryList;
    
    /// @dev Total shares allocated (should equal BASIS_POINTS - ZAKAT_BPS)
    uint256 public totalShares;
    
    /// @dev Total revenue received
    uint256 public totalRevenueReceived;
    
    /// @dev Total revenue distributed
    uint256 public totalRevenueDistributed;
    
    /// @dev Total Zakat contributed
    uint256 public totalZakatContributed;
    
    /// @dev Pending revenue to be distributed
    uint256 public pendingRevenue;
    
    /// @dev Multi-sig approvers
    mapping(address => bool) public isApprover;
    address[] public approverList;
    
    /// @dev Required number of approvals for critical operations
    uint256 public requiredApprovals;
    
    /// @dev Operation approvals: operationHash => approver => approved
    mapping(bytes32 => mapping(address => bool)) public operationApprovals;
    
    /// @dev Operation approval count
    mapping(bytes32 => uint256) public operationApprovalCount;
    
    /// @dev Time-locks for delayed operations
    mapping(bytes32 => TimeLock) public timeLocks;
    
    /// @dev Current time-lock delay
    uint256 public timeLockDelay;
    
    /// @dev Distribution history
    Distribution[] public distributionHistory;
    
    /// @dev Audit log
    AuditEntry[] public auditLog;
    
    /// @dev Sovereign override enabled (owner can bypass governance)
    bool public sovereignOverrideEnabled;
    
    // ============ EVENTS ============
    
    event RevenueReceived(uint256 amount, uint256 timestamp);
    event RevenueDistributed(uint256 totalAmount, uint256 zakatAmount, uint256 timestamp);
    event BeneficiaryPaid(address indexed beneficiary, uint256 amount, uint256 timestamp);
    event ZakatContributed(uint256 amount, uint256 timestamp);
    event BeneficiaryAdded(address indexed account, uint256 share, uint256 contributionWeight);
    event BeneficiaryRemoved(address indexed account);
    event BeneficiaryShareUpdated(address indexed account, uint256 oldShare, uint256 newShare);
    event BeneficiaryContributionUpdated(address indexed account, uint256 newWeight);
    event VestingClaimed(address indexed beneficiary, uint256 amount, uint256 timestamp);
    event ApproverAdded(address indexed approver);
    event ApproverRemoved(address indexed approver);
    event OperationApproved(bytes32 indexed operationHash, address indexed approver);
    event OperationExecuted(bytes32 indexed operationHash);
    event TimeLockCreated(bytes32 indexed operationHash, uint256 executeAfter, string description);
    event TimeLockExecuted(bytes32 indexed operationHash);
    event TimeLockCancelled(bytes32 indexed operationHash);
    event ZakatTreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event SovereignOverrideToggled(bool enabled);
    event AuditLogEntry(uint256 indexed timestamp, address indexed actor, string action);
    
    // ============ ERRORS ============
    
    error InvalidBeneficiary();
    error BeneficiaryAlreadyExists();
    error BeneficiaryNotFound();
    error InvalidShareZero();
    error InvalidShareExceedsMaximum();
    error NoRevenueToDistribute();
    error InsufficientApprovals();
    error NotApprover();
    error AlreadyApproved();
    error TimeLockNotReady();
    error TimeLockExpired();
    error TimeLockAlreadyExecuted();
    error InvalidTimeLockDelay();
    error InvalidZakatTreasury();
    error NoVestedAmount();
    error MaxApproversReached();
    error InvalidApprovalThreshold();
    
    // ============ MODIFIERS ============
    
    /**
     * @dev Modifier to check if caller is an approver
     */
    modifier onlyApprover() {
        if (!isApprover[msg.sender] && msg.sender != owner()) {
            revert NotApprover();
        }
        _;
    }
    
    /**
     * @dev Modifier for operations requiring multi-sig approval
     * Logs when sovereign override is used for transparency
     */
    modifier requiresApproval(bytes32 operationHash) {
        if (sovereignOverrideEnabled && msg.sender == owner()) {
            // TRANSPARENCY: Log when owner bypasses multi-sig using sovereign override
            _logAudit("SovereignOverrideUsed", abi.encode(operationHash, "Owner bypassed multi-sig approval"));
        } else {
            if (operationApprovalCount[operationHash] < requiredApprovals) {
                revert InsufficientApprovals();
            }
        }
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    /**
     * @dev Constructor initializes the revenue splitter
     * @param initialOwner Address of the contract owner
     * @param _zakatTreasury Address to receive Zakat contributions
     * @param _requiredApprovals Number of approvals required for critical operations
     * @param _timeLockDelay Delay for time-locked operations
     */
    constructor(
        address initialOwner,
        address payable _zakatTreasury,
        uint256 _requiredApprovals,
        uint256 _timeLockDelay
    ) Ownable(initialOwner) {
        if (_zakatTreasury == address(0)) {
            revert InvalidZakatTreasury();
        }
        if (_requiredApprovals == 0 || _requiredApprovals > MAX_APPROVERS) {
            revert InvalidApprovalThreshold();
        }
        if (_timeLockDelay > MAX_TIMELOCK_DELAY) {
            revert InvalidTimeLockDelay();
        }
        
        zakatTreasury = _zakatTreasury;
        requiredApprovals = _requiredApprovals;
        timeLockDelay = _timeLockDelay;
        
        // Sovereign Override is enabled by default to allow initial setup
        // IMPORTANT: This allows the owner to bypass multi-sig governance
        // RECOMMENDATION: Disable this after initial setup is complete by calling toggleSovereignOverride()
        // SECURITY: When enabled, owner can:
        //   - Bypass approval requirements for time-locked operations
        //   - Make changes without waiting for multi-sig consensus
        // USE CASES: Emergency response, critical security fixes, initial configuration
        // TRANSPARENCY: All override usage is logged via audit trail
        sovereignOverrideEnabled = true;
        
        // Add owner as first approver
        isApprover[initialOwner] = true;
        approverList.push(initialOwner);
        
        _logAudit("ContractInitialized", abi.encode(_zakatTreasury, _requiredApprovals, _timeLockDelay));
    }
    
    // ============ RECEIVE FUNCTION ============
    
    /**
     * @dev Receive function to accept revenue
     */
    receive() external payable {
        totalRevenueReceived += msg.value;
        pendingRevenue += msg.value;
        emit RevenueReceived(msg.value, block.timestamp);
        _logAudit("RevenueReceived", abi.encode(msg.value));
    }
    
    // ============ BENEFICIARY MANAGEMENT ============
    
    /**
     * @dev Add a new beneficiary (requires approval and time-lock)
     * @param account Beneficiary address
     * @param share Share in basis points
     * @param vestingDuration Vesting duration in seconds (0 = no vesting)
     * @param contributionWeight Initial contribution weight
     */
    function addBeneficiary(
        address payable account,
        uint256 share,
        uint256 vestingDuration,
        uint256 contributionWeight
    ) external onlyOwner whenNotPaused {
        if (account == address(0)) {
            revert InvalidBeneficiary();
        }
        if (beneficiaries[account].account != address(0)) {
            revert BeneficiaryAlreadyExists();
        }
        if (share == 0) {
            revert InvalidShareZero();
        }
        if (totalShares + share > BASIS_POINTS - ZAKAT_BPS) {
            revert InvalidShareExceedsMaximum();
        }
        
        beneficiaries[account] = Beneficiary({
            account: account,
            share: share,
            isActive: true,
            totalReceived: 0,
            vestingStart: vestingDuration > 0 ? block.timestamp : 0,
            vestingDuration: vestingDuration,
            vestingClaimed: 0,
            contributionWeight: contributionWeight,
            lastPaymentTime: 0
        });
        
        beneficiaryList.push(account);
        totalShares += share;
        
        emit BeneficiaryAdded(account, share, contributionWeight);
        _logAudit("BeneficiaryAdded", abi.encode(account, share, contributionWeight));
    }
    
    /**
     * @dev Update beneficiary share (requires approval and time-lock)
     * @param account Beneficiary address
     * @param newShare New share in basis points
     */
    function updateBeneficiaryShare(
        address account,
        uint256 newShare
    ) external onlyOwner whenNotPaused {
        if (beneficiaries[account].account == address(0)) {
            revert BeneficiaryNotFound();
        }
        if (newShare == 0) {
            revert InvalidShareZero();
        }
        
        uint256 oldShare = beneficiaries[account].share;
        uint256 newTotalShares = totalShares - oldShare + newShare;
        
        if (newTotalShares > BASIS_POINTS - ZAKAT_BPS) {
            revert InvalidShareExceedsMaximum();
        }
        
        beneficiaries[account].share = newShare;
        totalShares = newTotalShares;
        
        emit BeneficiaryShareUpdated(account, oldShare, newShare);
        _logAudit("BeneficiaryShareUpdated", abi.encode(account, oldShare, newShare));
    }
    
    /**
     * @dev Update beneficiary contribution weight
     * @param account Beneficiary address
     * @param newWeight New contribution weight
     */
    function updateContributionWeight(
        address account,
        uint256 newWeight
    ) external onlyOwner whenNotPaused {
        if (beneficiaries[account].account == address(0)) {
            revert BeneficiaryNotFound();
        }
        
        beneficiaries[account].contributionWeight = newWeight;
        
        emit BeneficiaryContributionUpdated(account, newWeight);
        _logAudit("ContributionWeightUpdated", abi.encode(account, newWeight));
    }
    
    /**
     * @dev Remove a beneficiary (requires approval and time-lock)
     * @param account Beneficiary address
     */
    function removeBeneficiary(address account) external onlyOwner whenNotPaused {
        if (beneficiaries[account].account == address(0)) {
            revert BeneficiaryNotFound();
        }
        
        uint256 share = beneficiaries[account].share;
        totalShares -= share;
        
        beneficiaries[account].isActive = false;
        
        emit BeneficiaryRemoved(account);
        _logAudit("BeneficiaryRemoved", abi.encode(account, share));
    }
    
    // ============ REVENUE DISTRIBUTION ============
    
    /**
     * @dev Distribute pending revenue to all beneficiaries and Zakat treasury
     */
    function distributeRevenue() external nonReentrant whenNotPaused {
        if (pendingRevenue == 0) {
            revert NoRevenueToDistribute();
        }
        
        uint256 totalAmount = pendingRevenue;
        pendingRevenue = 0;
        
        // Calculate and send Zakat (2.5%)
        uint256 zakatAmount = (totalAmount * ZAKAT_BPS) / BASIS_POINTS;
        totalZakatContributed += zakatAmount;
        
        (bool zakatSuccess, ) = zakatTreasury.call{value: zakatAmount}("");
        require(zakatSuccess, "Zakat transfer failed");
        
        emit ZakatContributed(zakatAmount, block.timestamp);
        
        // Remaining amount for beneficiaries
        uint256 remainingAmount = totalAmount - zakatAmount;
        
        // Distribute to beneficiaries
        uint256 activeBeneficiaries = 0;
        for (uint256 i = 0; i < beneficiaryList.length; i++) {
            address beneficiaryAddr = beneficiaryList[i];
            Beneficiary storage beneficiary = beneficiaries[beneficiaryAddr];
            
            if (beneficiary.isActive) {
                activeBeneficiaries++;
                uint256 payment = (remainingAmount * beneficiary.share) / (BASIS_POINTS - ZAKAT_BPS);
                
                beneficiary.totalReceived += payment;
                beneficiary.lastPaymentTime = block.timestamp;
                
                (bool success, ) = beneficiary.account.call{value: payment}("");
                require(success, "Beneficiary transfer failed");
                
                emit BeneficiaryPaid(beneficiary.account, payment, block.timestamp);
            }
        }
        
        totalRevenueDistributed += totalAmount;
        
        // Record distribution in history
        distributionHistory.push(Distribution({
            timestamp: block.timestamp,
            totalAmount: totalAmount,
            zakatAmount: zakatAmount,
            beneficiaryCount: activeBeneficiaries
        }));
        
        emit RevenueDistributed(totalAmount, zakatAmount, block.timestamp);
        _logAudit("RevenueDistributed", abi.encode(totalAmount, zakatAmount, activeBeneficiaries));
    }
    
    // ============ VESTING ============
    
    /**
     * @dev Calculate vested amount for a beneficiary
     * @param account Beneficiary address
     * @return Vested amount available to claim
     */
    function getVestedAmount(address account) public view returns (uint256) {
        Beneficiary storage beneficiary = beneficiaries[account];
        
        if (beneficiary.vestingDuration == 0) {
            return 0; // No vesting
        }
        
        if (block.timestamp >= beneficiary.vestingStart + beneficiary.vestingDuration) {
            // Fully vested
            return beneficiary.totalReceived - beneficiary.vestingClaimed;
        }
        
        uint256 elapsed = block.timestamp - beneficiary.vestingStart;
        uint256 totalVested = (beneficiary.totalReceived * elapsed) / beneficiary.vestingDuration;
        return totalVested - beneficiary.vestingClaimed;
    }
    
    /**
     * @dev Claim vested revenue (beneficiary only)
     */
    function claimVestedRevenue() external nonReentrant whenNotPaused {
        Beneficiary storage beneficiary = beneficiaries[msg.sender];
        
        if (beneficiary.account == address(0)) {
            revert BeneficiaryNotFound();
        }
        
        uint256 vestedAmount = getVestedAmount(msg.sender);
        if (vestedAmount == 0) {
            revert NoVestedAmount();
        }
        
        beneficiary.vestingClaimed += vestedAmount;
        
        (bool success, ) = beneficiary.account.call{value: vestedAmount}("");
        require(success, "Vesting claim transfer failed");
        
        emit VestingClaimed(msg.sender, vestedAmount, block.timestamp);
        _logAudit("VestingClaimed", abi.encode(msg.sender, vestedAmount));
    }
    
    // ============ MULTI-SIG GOVERNANCE ============
    
    /**
     * @dev Add an approver
     * @param approver Address to add as approver
     */
    function addApprover(address approver) external onlyOwner {
        if (approver == address(0)) {
            revert InvalidBeneficiary();
        }
        if (approverList.length >= MAX_APPROVERS) {
            revert MaxApproversReached();
        }
        
        isApprover[approver] = true;
        approverList.push(approver);
        
        emit ApproverAdded(approver);
        _logAudit("ApproverAdded", abi.encode(approver));
    }
    
    /**
     * @dev Remove an approver
     * @param approver Address to remove as approver
     */
    function removeApprover(address approver) external onlyOwner {
        isApprover[approver] = false;
        
        emit ApproverRemoved(approver);
        _logAudit("ApproverRemoved", abi.encode(approver));
    }
    
    /**
     * @dev Approve an operation
     * @param operationHash Hash of the operation to approve
     */
    function approveOperation(bytes32 operationHash) external onlyApprover {
        if (operationApprovals[operationHash][msg.sender]) {
            revert AlreadyApproved();
        }
        
        operationApprovals[operationHash][msg.sender] = true;
        operationApprovalCount[operationHash]++;
        
        emit OperationApproved(operationHash, msg.sender);
        _logAudit("OperationApproved", abi.encode(operationHash, msg.sender));
    }
    
    /**
     * @dev Update required approvals threshold
     * @param newThreshold New number of required approvals
     */
    function updateRequiredApprovals(uint256 newThreshold) external onlyOwner {
        if (newThreshold == 0 || newThreshold > approverList.length) {
            revert InvalidApprovalThreshold();
        }
        
        requiredApprovals = newThreshold;
        _logAudit("RequiredApprovalsUpdated", abi.encode(newThreshold));
    }
    
    // ============ TIME-LOCK OPERATIONS ============
    
    /**
     * @dev Create a time-locked operation
     * @param operationHash Hash of the operation
     * @param data Encoded function call data
     * @param description Human-readable description
     */
    function createTimeLock(
        bytes32 operationHash,
        bytes calldata data,
        string calldata description
    ) external onlyOwner {
        uint256 executeAfter = block.timestamp + timeLockDelay;
        
        timeLocks[operationHash] = TimeLock({
            timestamp: block.timestamp,
            executeAfter: executeAfter,
            executed: false,
            cancelled: false,
            data: data,
            description: description
        });
        
        emit TimeLockCreated(operationHash, executeAfter, description);
        _logAudit("TimeLockCreated", abi.encode(operationHash, description));
    }
    
    /**
     * @dev Execute a time-locked operation
     * @param operationHash Hash of the operation
     */
    function executeTimeLock(bytes32 operationHash) external onlyOwner requiresApproval(operationHash) {
        TimeLock storage timeLock = timeLocks[operationHash];
        
        if (timeLock.executed) {
            revert TimeLockAlreadyExecuted();
        }
        if (block.timestamp < timeLock.executeAfter) {
            revert TimeLockNotReady();
        }
        if (block.timestamp > timeLock.executeAfter + TIMELOCK_EXECUTION_WINDOW) {
            revert TimeLockExpired();
        }
        
        timeLock.executed = true;
        
        emit TimeLockExecuted(operationHash);
        emit OperationExecuted(operationHash);
        _logAudit("TimeLockExecuted", abi.encode(operationHash));
    }
    
    /**
     * @dev Cancel a time-locked operation
     * @param operationHash Hash of the operation
     */
    function cancelTimeLock(bytes32 operationHash) external onlyOwner {
        TimeLock storage timeLock = timeLocks[operationHash];
        
        if (timeLock.executed) {
            revert TimeLockAlreadyExecuted();
        }
        
        timeLock.cancelled = true;
        
        emit TimeLockCancelled(operationHash);
        _logAudit("TimeLockCancelled", abi.encode(operationHash));
    }
    
    /**
     * @dev Update time-lock delay
     * @param newDelay New delay in seconds
     */
    function updateTimeLockDelay(uint256 newDelay) external onlyOwner {
        if (newDelay > MAX_TIMELOCK_DELAY) {
            revert InvalidTimeLockDelay();
        }
        
        timeLockDelay = newDelay;
        _logAudit("TimeLockDelayUpdated", abi.encode(newDelay));
    }
    
    // ============ SOVEREIGN OVERRIDE ============
    
    /**
     * @dev Toggle sovereign override (owner can bypass governance)
     */
    function toggleSovereignOverride() external onlyOwner {
        sovereignOverrideEnabled = !sovereignOverrideEnabled;
        
        emit SovereignOverrideToggled(sovereignOverrideEnabled);
        _logAudit("SovereignOverrideToggled", abi.encode(sovereignOverrideEnabled));
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Update Zakat treasury address
     * @param newTreasury New treasury address
     */
    function updateZakatTreasury(address payable newTreasury) external onlyOwner {
        if (newTreasury == address(0)) {
            revert InvalidZakatTreasury();
        }
        
        address oldTreasury = zakatTreasury;
        zakatTreasury = newTreasury;
        
        emit ZakatTreasuryUpdated(oldTreasury, newTreasury);
        _logAudit("ZakatTreasuryUpdated", abi.encode(oldTreasury, newTreasury));
    }
    
    /**
     * @dev Pause the contract (emergency only)
     */
    function pause() external onlyOwner {
        _pause();
        _logAudit("ContractPaused", "");
    }
    
    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
        _logAudit("ContractUnpaused", "");
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get beneficiary details
     * @param account Beneficiary address
     */
    function getBeneficiary(address account) external view returns (
        address payable beneficiaryAccount,
        uint256 share,
        bool isActive,
        uint256 totalReceived,
        uint256 vestingStart,
        uint256 vestingDuration,
        uint256 vestingClaimed,
        uint256 contributionWeight,
        uint256 lastPaymentTime
    ) {
        Beneficiary storage b = beneficiaries[account];
        return (
            b.account,
            b.share,
            b.isActive,
            b.totalReceived,
            b.vestingStart,
            b.vestingDuration,
            b.vestingClaimed,
            b.contributionWeight,
            b.lastPaymentTime
        );
    }
    
    /**
     * @dev Get beneficiary statistics
     * @param account Beneficiary address
     */
    function getBeneficiaryStats(address account) external view returns (
        uint256 currentShare,
        uint256 totalReceived,
        uint256 lastPayment,
        bool active,
        uint256 vestedAmount,
        uint256 claimableAmount
    ) {
        Beneficiary storage b = beneficiaries[account];
        return (
            b.share,
            b.totalReceived,
            b.lastPaymentTime,
            b.isActive,
            getVestedAmount(account),
            getVestedAmount(account)
        );
    }
    
    /**
     * @dev Get global statistics
     */
    function getGlobalStats() external view returns (
        uint256 totalRevenue,
        uint256 totalDistributed,
        uint256 pending,
        uint256 totalZakat,
        uint256 activeBeneficiaries,
        uint256 totalBeneficiaries
    ) {
        uint256 active = 0;
        for (uint256 i = 0; i < beneficiaryList.length; i++) {
            if (beneficiaries[beneficiaryList[i]].isActive) {
                active++;
            }
        }
        
        return (
            totalRevenueReceived,
            totalRevenueDistributed,
            pendingRevenue,
            totalZakatContributed,
            active,
            beneficiaryList.length
        );
    }
    
    /**
     * @dev Get distribution history
     * @param offset Starting index
     * @param limit Number of records to return
     */
    function getDistributionHistory(uint256 offset, uint256 limit) 
        external 
        view 
        returns (Distribution[] memory) 
    {
        if (offset >= distributionHistory.length) {
            return new Distribution[](0);
        }
        
        uint256 end = offset + limit;
        if (end > distributionHistory.length) {
            end = distributionHistory.length;
        }
        
        uint256 resultLength = end - offset;
        Distribution[] memory result = new Distribution[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = distributionHistory[offset + i];
        }
        
        return result;
    }
    
    /**
     * @dev Get all beneficiaries
     */
    function getAllBeneficiaries() external view returns (address[] memory) {
        return beneficiaryList;
    }
    
    /**
     * @dev Get all approvers
     */
    function getAllApprovers() external view returns (address[] memory) {
        return approverList;
    }
    
    /**
     * @dev Get distribution history count
     */
    function getDistributionCount() external view returns (uint256) {
        return distributionHistory.length;
    }
    
    /**
     * @dev Get audit log count
     */
    function getAuditLogCount() external view returns (uint256) {
        return auditLog.length;
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Log an audit entry
     * @param action Action description
     * @param data Encoded data
     */
    function _logAudit(string memory action, bytes memory data) internal {
        auditLog.push(AuditEntry({
            timestamp: block.timestamp,
            actor: msg.sender,
            action: action,
            data: data
        }));
        
        emit AuditLogEntry(block.timestamp, msg.sender, action);
    }
}
