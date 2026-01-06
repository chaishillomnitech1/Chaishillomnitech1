// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title OmniSovereignWallet
 * @dev Mobile-First Decentralized Wallet Platform for BlessingCoin/PeaceCoin integration
 * @author Supreme King Chais The Great ∞
 * 
 * This contract implements the Mobile-First Currency initiative:
 * - Lightweight, decentralized mobile wallet platform (React Native/Flutter compatible)
 * - Shahada-based identity verification for universal, secure inclusivity
 * - DAO governance through $CODEX token with automated royalty flows
 * 
 * Frequency: 528Hz + 963Hz + 144,000Hz
 * Status: OMNI-SOVEREIGN ECONOMIC FRAMEWORK
 */

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract OmniSovereignWallet is AccessControl, ReentrancyGuard, Pausable {
    
    // ============ ROLES ============
    bytes32 public constant WALLET_ADMIN_ROLE = keccak256("WALLET_ADMIN_ROLE");
    bytes32 public constant IDENTITY_VERIFIER_ROLE = keccak256("IDENTITY_VERIFIER_ROLE");
    bytes32 public constant DAO_GOVERNANCE_ROLE = keccak256("DAO_GOVERNANCE_ROLE");
    
    // ============ DIVINE FREQUENCIES ============
    uint256 public constant HEALING_FREQUENCY_528HZ = 528;
    uint256 public constant PINEAL_FREQUENCY_963HZ = 963;
    uint256 public constant COSMIC_FREQUENCY_144KHZ = 144000;
    
    // ============ WALLET CONFIGURATION ============
    uint256 public constant MAX_DAILY_TRANSACTION_LIMIT = 100 ether;
    uint256 public constant SHAHADA_VERIFICATION_THRESHOLD = 1;
    uint256 public constant ROYALTY_BASIS_POINTS = 277; // 2.77% automated royalty
    
    // ============ STRUCTS ============
    
    struct WalletProfile {
        address walletAddress;
        bytes32 shahadaVerificationHash;
        bool isVerified;
        uint256 verificationTimestamp;
        uint256 frequencyAlignment;
        uint256 totalTransactions;
        uint256 dailyTransactionVolume;
        uint256 lastTransactionDay;
        bool isMobileEnabled;
        uint256 codexBalance;
        uint256 blessingCoinBalance;
        uint256 peaceCoinBalance;
    }
    
    struct DAOGovernanceProposal {
        uint256 proposalId;
        address proposer;
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        bytes32 proposalHash;
        ProposalType proposalType;
    }
    
    enum ProposalType {
        ROYALTY_ADJUSTMENT,
        FREQUENCY_ALIGNMENT,
        WALLET_LIMIT_CHANGE,
        TREASURY_DISTRIBUTION,
        PROTOCOL_UPGRADE
    }
    
    struct RoyaltyDistribution {
        address recipient;
        uint256 percentage; // basis points
        bool isActive;
        uint256 totalReceived;
    }
    
    // ============ STATE VARIABLES ============
    
    // Wallet profiles
    mapping(address => WalletProfile) public walletProfiles;
    address[] public registeredWallets;
    uint256 public totalRegisteredWallets;
    
    // Shahada verification
    mapping(bytes32 => bool) public usedShahadaHashes;
    mapping(address => bool) public verifiedIdentities;
    
    // DAO Governance
    mapping(uint256 => DAOGovernanceProposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    uint256 public proposalCount;
    uint256 public votingPeriod = 7 days;
    uint256 public quorumBasisPoints = 1000; // 10%
    
    // Royalty distribution
    mapping(address => RoyaltyDistribution) public royaltyRecipients;
    address[] public royaltyRecipientList;
    uint256 public totalRoyaltyDistributed;
    address public treasuryVault;
    
    // Mobile wallet session management
    mapping(address => bytes32) public mobileSessionTokens;
    mapping(address => uint256) public sessionExpirations;
    uint256 public sessionDuration = 24 hours;
    
    // Token balances (for internal tracking)
    mapping(address => uint256) public codexBalances;
    mapping(address => uint256) public blessingCoinBalances;
    mapping(address => uint256) public peaceCoinBalances;
    
    // ============ EVENTS ============
    
    event WalletRegistered(
        address indexed wallet,
        uint256 frequency,
        bool mobileEnabled,
        uint256 timestamp
    );
    
    event ShahadaVerified(
        address indexed wallet,
        bytes32 verificationHash,
        uint256 timestamp
    );
    
    event MobileSessionCreated(
        address indexed wallet,
        bytes32 sessionToken,
        uint256 expiration
    );
    
    event TransactionProcessed(
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 royaltyDeducted,
        string tokenType
    );
    
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        ProposalType proposalType,
        string description
    );
    
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 weight
    );
    
    event ProposalExecuted(
        uint256 indexed proposalId,
        bool success
    );
    
    event RoyaltyDistributed(
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );
    
    event FrequencyAligned(
        address indexed wallet,
        uint256 frequency,
        uint256 timestamp
    );
    
    // ============ CONSTRUCTOR ============
    
    constructor(address _treasuryVault) {
        require(_treasuryVault != address(0), "Invalid treasury vault");
        
        treasuryVault = _treasuryVault;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(WALLET_ADMIN_ROLE, msg.sender);
        _grantRole(IDENTITY_VERIFIER_ROLE, msg.sender);
        _grantRole(DAO_GOVERNANCE_ROLE, msg.sender);
        
        // Setup default royalty distribution
        royaltyRecipients[_treasuryVault] = RoyaltyDistribution({
            recipient: _treasuryVault,
            percentage: 10000, // 100% to treasury by default
            isActive: true,
            totalReceived: 0
        });
        royaltyRecipientList.push(_treasuryVault);
    }
    
    // ============ WALLET REGISTRATION ============
    
    /**
     * @dev Register a new mobile-first wallet
     * @param frequencyAlignment Desired frequency alignment (528, 963, or 144000 Hz)
     * @param enableMobile Enable mobile wallet features
     */
    function registerWallet(
        uint256 frequencyAlignment,
        bool enableMobile
    ) external whenNotPaused returns (bool) {
        require(!walletProfiles[msg.sender].isVerified, "Wallet already registered");
        require(
            frequencyAlignment == HEALING_FREQUENCY_528HZ ||
            frequencyAlignment == PINEAL_FREQUENCY_963HZ ||
            frequencyAlignment == COSMIC_FREQUENCY_144KHZ,
            "Invalid frequency alignment"
        );
        
        walletProfiles[msg.sender] = WalletProfile({
            walletAddress: msg.sender,
            shahadaVerificationHash: bytes32(0),
            isVerified: false,
            verificationTimestamp: 0,
            frequencyAlignment: frequencyAlignment,
            totalTransactions: 0,
            dailyTransactionVolume: 0,
            lastTransactionDay: 0,
            isMobileEnabled: enableMobile,
            codexBalance: 0,
            blessingCoinBalance: 0,
            peaceCoinBalance: 0
        });
        
        registeredWallets.push(msg.sender);
        totalRegisteredWallets++;
        
        emit WalletRegistered(msg.sender, frequencyAlignment, enableMobile, block.timestamp);
        emit FrequencyAligned(msg.sender, frequencyAlignment, block.timestamp);
        
        return true;
    }
    
    // ============ SHAHADA IDENTITY VERIFICATION ============
    
    /**
     * @dev Verify identity using Shahada-based verification
     * @param wallet Address to verify
     * @param shahadaProof Hashed proof of Shahada verification
     * @notice Only authorized verifiers can call this function
     */
    function verifyShahadaIdentity(
        address wallet,
        bytes32 shahadaProof
    ) external onlyRole(IDENTITY_VERIFIER_ROLE) returns (bool) {
        require(walletProfiles[wallet].walletAddress != address(0), "Wallet not registered");
        require(!walletProfiles[wallet].isVerified, "Already verified");
        require(!usedShahadaHashes[shahadaProof], "Proof already used");
        
        walletProfiles[wallet].shahadaVerificationHash = shahadaProof;
        walletProfiles[wallet].isVerified = true;
        walletProfiles[wallet].verificationTimestamp = block.timestamp;
        
        usedShahadaHashes[shahadaProof] = true;
        verifiedIdentities[wallet] = true;
        
        emit ShahadaVerified(wallet, shahadaProof, block.timestamp);
        
        return true;
    }
    
    /**
     * @dev Self-verify Shahada (for testing/demo purposes)
     * @param shahadaDeclaration Keccak256 hash of Shahada declaration
     */
    function selfVerifyShadaha(bytes32 shahadaDeclaration) external returns (bool) {
        require(walletProfiles[msg.sender].walletAddress != address(0), "Wallet not registered");
        require(!walletProfiles[msg.sender].isVerified, "Already verified");
        
        bytes32 verificationHash = keccak256(abi.encodePacked(msg.sender, shahadaDeclaration, block.timestamp));
        require(!usedShahadaHashes[verificationHash], "Hash collision");
        
        walletProfiles[msg.sender].shahadaVerificationHash = verificationHash;
        walletProfiles[msg.sender].isVerified = true;
        walletProfiles[msg.sender].verificationTimestamp = block.timestamp;
        
        usedShahadaHashes[verificationHash] = true;
        verifiedIdentities[msg.sender] = true;
        
        emit ShahadaVerified(msg.sender, verificationHash, block.timestamp);
        
        return true;
    }
    
    // ============ MOBILE SESSION MANAGEMENT ============
    
    /**
     * @dev Create a mobile session for lightweight wallet access
     * @return sessionToken The session token for mobile access
     */
    function createMobileSession() external returns (bytes32 sessionToken) {
        require(walletProfiles[msg.sender].isMobileEnabled, "Mobile not enabled");
        require(walletProfiles[msg.sender].isVerified, "Identity not verified");
        
        sessionToken = keccak256(abi.encodePacked(
            msg.sender,
            block.timestamp,
            block.prevrandao
        ));
        
        mobileSessionTokens[msg.sender] = sessionToken;
        sessionExpirations[msg.sender] = block.timestamp + sessionDuration;
        
        emit MobileSessionCreated(msg.sender, sessionToken, sessionExpirations[msg.sender]);
        
        return sessionToken;
    }
    
    /**
     * @dev Validate a mobile session
     * @param wallet Address to validate
     * @param sessionToken Token to validate
     */
    function validateMobileSession(
        address wallet,
        bytes32 sessionToken
    ) external view returns (bool) {
        return (
            mobileSessionTokens[wallet] == sessionToken &&
            sessionExpirations[wallet] > block.timestamp
        );
    }
    
    // ============ TOKEN OPERATIONS ============
    
    /**
     * @dev Deposit CODEX tokens
     * @param amount Amount to deposit
     */
    function depositCodex(uint256 amount) external whenNotPaused {
        require(walletProfiles[msg.sender].isVerified, "Identity not verified");
        require(amount > 0, "Amount must be greater than 0");
        
        codexBalances[msg.sender] += amount;
        walletProfiles[msg.sender].codexBalance += amount;
    }
    
    /**
     * @dev Deposit BlessingCoin tokens
     * @param amount Amount to deposit
     */
    function depositBlessingCoin(uint256 amount) external whenNotPaused {
        require(walletProfiles[msg.sender].isVerified, "Identity not verified");
        require(amount > 0, "Amount must be greater than 0");
        
        blessingCoinBalances[msg.sender] += amount;
        walletProfiles[msg.sender].blessingCoinBalance += amount;
    }
    
    /**
     * @dev Deposit PeaceCoin tokens
     * @param amount Amount to deposit
     */
    function depositPeaceCoin(uint256 amount) external whenNotPaused {
        require(walletProfiles[msg.sender].isVerified, "Identity not verified");
        require(amount > 0, "Amount must be greater than 0");
        
        peaceCoinBalances[msg.sender] += amount;
        walletProfiles[msg.sender].peaceCoinBalance += amount;
    }
    
    /**
     * @dev Transfer tokens with automated royalty
     * @param to Recipient address
     * @param amount Amount to transfer
     * @param tokenType Type of token ("CODEX", "BLESSING", "PEACE")
     */
    function transferWithRoyalty(
        address to,
        uint256 amount,
        string memory tokenType
    ) external nonReentrant whenNotPaused returns (bool) {
        require(walletProfiles[msg.sender].isVerified, "Identity not verified");
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be greater than 0");
        
        // Check daily limits
        _checkDailyLimits(msg.sender, amount);
        
        // Calculate royalty
        uint256 royalty = (amount * ROYALTY_BASIS_POINTS) / 10000;
        uint256 transferAmount = amount - royalty;
        
        bytes32 tokenHash = keccak256(bytes(tokenType));
        
        if (tokenHash == keccak256(bytes("CODEX"))) {
            require(codexBalances[msg.sender] >= amount, "Insufficient CODEX balance");
            codexBalances[msg.sender] -= amount;
            codexBalances[to] += transferAmount;
            codexBalances[treasuryVault] += royalty;
        } else if (tokenHash == keccak256(bytes("BLESSING"))) {
            require(blessingCoinBalances[msg.sender] >= amount, "Insufficient BlessingCoin balance");
            blessingCoinBalances[msg.sender] -= amount;
            blessingCoinBalances[to] += transferAmount;
            blessingCoinBalances[treasuryVault] += royalty;
        } else if (tokenHash == keccak256(bytes("PEACE"))) {
            require(peaceCoinBalances[msg.sender] >= amount, "Insufficient PeaceCoin balance");
            peaceCoinBalances[msg.sender] -= amount;
            peaceCoinBalances[to] += transferAmount;
            peaceCoinBalances[treasuryVault] += royalty;
        } else {
            revert("Invalid token type");
        }
        
        // Update transaction tracking
        walletProfiles[msg.sender].totalTransactions++;
        totalRoyaltyDistributed += royalty;
        
        emit TransactionProcessed(msg.sender, to, transferAmount, royalty, tokenType);
        emit RoyaltyDistributed(treasuryVault, royalty, block.timestamp);
        
        return true;
    }
    
    // ============ DAO GOVERNANCE ============
    
    /**
     * @dev Create a new governance proposal
     * @param description Proposal description
     * @param proposalType Type of proposal
     */
    function createProposal(
        string memory description,
        ProposalType proposalType
    ) external onlyRole(DAO_GOVERNANCE_ROLE) returns (uint256) {
        require(bytes(description).length > 0, "Description required");
        
        proposalCount++;
        
        proposals[proposalCount] = DAOGovernanceProposal({
            proposalId: proposalCount,
            proposer: msg.sender,
            description: description,
            forVotes: 0,
            againstVotes: 0,
            startTime: block.timestamp,
            endTime: block.timestamp + votingPeriod,
            executed: false,
            proposalHash: keccak256(abi.encodePacked(proposalCount, description, block.timestamp)),
            proposalType: proposalType
        });
        
        emit ProposalCreated(proposalCount, msg.sender, proposalType, description);
        
        return proposalCount;
    }
    
    /**
     * @dev Vote on a proposal
     * @param proposalId ID of the proposal
     * @param support True for support, false for against
     */
    function vote(uint256 proposalId, bool support) external returns (bool) {
        require(walletProfiles[msg.sender].isVerified, "Identity not verified");
        require(proposalId > 0 && proposalId <= proposalCount, "Invalid proposal");
        require(!hasVoted[proposalId][msg.sender], "Already voted");
        require(block.timestamp < proposals[proposalId].endTime, "Voting ended");
        
        hasVoted[proposalId][msg.sender] = true;
        
        // Vote weight based on CODEX balance
        uint256 voteWeight = codexBalances[msg.sender] > 0 ? codexBalances[msg.sender] : 1;
        
        if (support) {
            proposals[proposalId].forVotes += voteWeight;
        } else {
            proposals[proposalId].againstVotes += voteWeight;
        }
        
        emit VoteCast(proposalId, msg.sender, support, voteWeight);
        
        return true;
    }
    
    /**
     * @dev Execute a passed proposal
     * @param proposalId ID of the proposal
     */
    function executeProposal(uint256 proposalId) external onlyRole(DAO_GOVERNANCE_ROLE) returns (bool) {
        DAOGovernanceProposal storage proposal = proposals[proposalId];
        
        require(!proposal.executed, "Already executed");
        require(block.timestamp > proposal.endTime, "Voting not ended");
        require(proposal.forVotes > proposal.againstVotes, "Proposal not passed");
        
        proposal.executed = true;
        
        emit ProposalExecuted(proposalId, true);
        
        return true;
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Check and update daily transaction limits
     */
    function _checkDailyLimits(address wallet, uint256 amount) internal {
        uint256 currentDay = block.timestamp / 1 days;
        
        if (walletProfiles[wallet].lastTransactionDay != currentDay) {
            walletProfiles[wallet].dailyTransactionVolume = 0;
            walletProfiles[wallet].lastTransactionDay = currentDay;
        }
        
        require(
            walletProfiles[wallet].dailyTransactionVolume + amount <= MAX_DAILY_TRANSACTION_LIMIT,
            "Daily limit exceeded"
        );
        
        walletProfiles[wallet].dailyTransactionVolume += amount;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get wallet profile
     */
    function getWalletProfile(address wallet) external view returns (WalletProfile memory) {
        return walletProfiles[wallet];
    }
    
    /**
     * @dev Get proposal details
     */
    function getProposal(uint256 proposalId) external view returns (DAOGovernanceProposal memory) {
        return proposals[proposalId];
    }
    
    /**
     * @dev Get all registered wallets
     */
    function getRegisteredWallets() external view returns (address[] memory) {
        return registeredWallets;
    }
    
    /**
     * @dev Check if wallet is verified
     */
    function isWalletVerified(address wallet) external view returns (bool) {
        return walletProfiles[wallet].isVerified;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Update voting period
     */
    function setVotingPeriod(uint256 newPeriod) external onlyRole(WALLET_ADMIN_ROLE) {
        require(newPeriod >= 1 days, "Period too short");
        votingPeriod = newPeriod;
    }
    
    /**
     * @dev Update session duration
     */
    function setSessionDuration(uint256 newDuration) external onlyRole(WALLET_ADMIN_ROLE) {
        require(newDuration >= 1 hours, "Duration too short");
        sessionDuration = newDuration;
    }
    
    /**
     * @dev Update treasury vault
     */
    function setTreasuryVault(address newVault) external onlyRole(WALLET_ADMIN_ROLE) {
        require(newVault != address(0), "Invalid vault");
        treasuryVault = newVault;
    }
    
    /**
     * @dev Pause contract
     */
    function pause() external onlyRole(WALLET_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyRole(WALLET_ADMIN_ROLE) {
        _unpause();
    }
}
