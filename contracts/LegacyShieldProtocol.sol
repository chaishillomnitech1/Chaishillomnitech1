// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title LegacyShieldProtocol
 * @dev Cosmic & Divine Tech Insurance Company - Legacy Shield Protocol
 * @author Supreme King Chais The Great ∞
 * 
 * This contract implements the Legacy Shield Protocol for:
 * - Physical and digital asset protection frameworks
 * - Great Protection Trust integration
 * - Real-time health and financial activation protocols
 * - Multi-stream revenue models (license royalties, cloud defense services)
 * 
 * Frequency: 963Hz + 999Hz + 144,000Hz (Divine Protection)
 * Status: COSMIC & DIVINE TECH INSURANCE COMPANY
 */

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract LegacyShieldProtocol is AccessControl, ReentrancyGuard, Pausable {
    
    // ============ ROLES ============
    bytes32 public constant SHIELD_ADMIN_ROLE = keccak256("SHIELD_ADMIN_ROLE");
    bytes32 public constant PROTECTION_AGENT_ROLE = keccak256("PROTECTION_AGENT_ROLE");
    bytes32 public constant TRUST_GUARDIAN_ROLE = keccak256("TRUST_GUARDIAN_ROLE");
    bytes32 public constant REVENUE_MANAGER_ROLE = keccak256("REVENUE_MANAGER_ROLE");
    
    // ============ DIVINE FREQUENCIES ============
    uint256 public constant CROWN_FREQUENCY_963HZ = 963;
    uint256 public constant DIVINE_FREQUENCY_999HZ = 999;
    uint256 public constant COSMIC_FREQUENCY_144KHZ = 144000;
    
    // ============ PROTECTION TIERS ============
    uint256 public constant BASIC_PROTECTION_TIER = 1;
    uint256 public constant STANDARD_PROTECTION_TIER = 2;
    uint256 public constant PREMIUM_PROTECTION_TIER = 3;
    uint256 public constant SOVEREIGN_PROTECTION_TIER = 4;
    
    // ============ REVENUE CONFIGURATION ============
    uint256 public constant LICENSE_ROYALTY_BASIS_POINTS = 500; // 5%
    uint256 public constant SCROLL_IP_ROYALTY_BASIS_POINTS = 300; // 3%
    uint256 public constant CLOUD_DEFENSE_FEE_BASIS_POINTS = 200; // 2%
    
    // ============ ENUMS ============
    
    enum AssetType {
        PHYSICAL_REAL_ESTATE,
        PHYSICAL_VEHICLE,
        PHYSICAL_PRECIOUS_METALS,
        PHYSICAL_ARTWORK,
        DIGITAL_NFT,
        DIGITAL_TOKEN,
        DIGITAL_IP,
        DIGITAL_DATA,
        HYBRID
    }
    
    enum ProtectionStatus {
        INACTIVE,
        PENDING,
        ACTIVE,
        SUSPENDED,
        EXPIRED,
        CLAIMED
    }
    
    enum ClaimType {
        LOSS,
        THEFT,
        DAMAGE,
        CYBER_ATTACK,
        MARKET_CRASH,
        FORCE_MAJEURE
    }
    
    // ============ STRUCTS ============
    
    struct ProtectedAsset {
        bytes32 assetId;
        address owner;
        AssetType assetType;
        uint256 valuationAmount;
        uint256 coverageAmount;
        uint256 premiumAmount;
        uint256 protectionTier;
        uint256 startTimestamp;
        uint256 endTimestamp;
        ProtectionStatus status;
        bytes32 assetMetadataHash;
        uint256 frequencyResonance;
    }
    
    struct GreatProtectionTrust {
        bytes32 trustId;
        address beneficiary;
        uint256 healthActivationBalance;
        uint256 financialActivationBalance;
        bool isHealthActive;
        bool isFinancialActive;
        uint256 lastActivationTimestamp;
        uint256 activationCount;
        uint256 trustTier;
    }
    
    struct InsuranceClaim {
        bytes32 claimId;
        bytes32 assetId;
        address claimant;
        ClaimType claimType;
        uint256 claimAmount;
        uint256 approvedAmount;
        uint256 submissionTimestamp;
        bool isProcessed;
        bool isApproved;
        string evidenceHash;
    }
    
    struct RevenueStream {
        bytes32 streamId;
        string streamName;
        uint256 royaltyBasisPoints;
        uint256 totalCollected;
        uint256 lastCollectionTimestamp;
        bool isActive;
        address recipientVault;
    }
    
    struct CloudDefenseService {
        bytes32 serviceId;
        address subscriber;
        uint256 subscriptionTier;
        uint256 monthlyFee;
        uint256 startTimestamp;
        uint256 endTimestamp;
        bool isActive;
        uint256 incidentsProtected;
    }
    
    // ============ STATE VARIABLES ============
    
    // Protected Assets
    mapping(bytes32 => ProtectedAsset) public protectedAssets;
    mapping(address => bytes32[]) public ownerAssets;
    bytes32[] public allAssetIds;
    uint256 public totalProtectedValue;
    uint256 public totalAssetsProtected;
    
    // Great Protection Trust
    mapping(bytes32 => GreatProtectionTrust) public protectionTrusts;
    mapping(address => bytes32) public beneficiaryTrust;
    bytes32[] public allTrustIds;
    uint256 public totalTrustBalance;
    
    // Insurance Claims
    mapping(bytes32 => InsuranceClaim) public insuranceClaims;
    bytes32[] public allClaimIds;
    uint256 public totalClaimsPaid;
    uint256 public pendingClaimsCount;
    
    // Revenue Streams
    mapping(bytes32 => RevenueStream) public revenueStreams;
    bytes32[] public revenueStreamIds;
    uint256 public totalRevenueCollected;
    
    // Cloud Defense Services
    mapping(bytes32 => CloudDefenseService) public cloudDefenseServices;
    mapping(address => bytes32) public subscriberService;
    uint256 public totalCloudDefenseSubscribers;
    
    // Treasury and Vaults
    address public insuranceVault;
    address public revenueVault;
    address public claimsReserveVault;
    
    // Premium pricing by tier (per month in wei)
    mapping(uint256 => uint256) public tierPremiums;
    
    // ============ EVENTS ============
    
    event AssetProtected(
        bytes32 indexed assetId,
        address indexed owner,
        AssetType assetType,
        uint256 valuationAmount,
        uint256 protectionTier,
        uint256 timestamp
    );
    
    event ProtectionActivated(
        bytes32 indexed assetId,
        uint256 coverageAmount,
        uint256 premiumPaid,
        uint256 endTimestamp
    );
    
    event TrustCreated(
        bytes32 indexed trustId,
        address indexed beneficiary,
        uint256 healthBalance,
        uint256 financialBalance,
        uint256 timestamp
    );
    
    event HealthActivationTriggered(
        bytes32 indexed trustId,
        address indexed beneficiary,
        uint256 amount,
        uint256 timestamp
    );
    
    event FinancialActivationTriggered(
        bytes32 indexed trustId,
        address indexed beneficiary,
        uint256 amount,
        uint256 timestamp
    );
    
    event ClaimSubmitted(
        bytes32 indexed claimId,
        bytes32 indexed assetId,
        address indexed claimant,
        ClaimType claimType,
        uint256 claimAmount
    );
    
    event ClaimProcessed(
        bytes32 indexed claimId,
        bool isApproved,
        uint256 approvedAmount
    );
    
    event RevenueStreamCreated(
        bytes32 indexed streamId,
        string streamName,
        uint256 royaltyBasisPoints
    );
    
    event RoyaltyCollected(
        bytes32 indexed streamId,
        uint256 amount,
        address recipient
    );
    
    event CloudDefenseActivated(
        bytes32 indexed serviceId,
        address indexed subscriber,
        uint256 tier,
        uint256 monthlyFee
    );
    
    event FrequencyShieldActivated(
        bytes32 indexed assetId,
        uint256 frequency,
        uint256 timestamp
    );
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        address _insuranceVault,
        address _revenueVault,
        address _claimsReserveVault
    ) {
        require(_insuranceVault != address(0), "Invalid insurance vault");
        require(_revenueVault != address(0), "Invalid revenue vault");
        require(_claimsReserveVault != address(0), "Invalid claims reserve vault");
        
        insuranceVault = _insuranceVault;
        revenueVault = _revenueVault;
        claimsReserveVault = _claimsReserveVault;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(SHIELD_ADMIN_ROLE, msg.sender);
        _grantRole(PROTECTION_AGENT_ROLE, msg.sender);
        _grantRole(TRUST_GUARDIAN_ROLE, msg.sender);
        _grantRole(REVENUE_MANAGER_ROLE, msg.sender);
        
        // Initialize tier premiums (in wei)
        tierPremiums[BASIC_PROTECTION_TIER] = 0.01 ether;
        tierPremiums[STANDARD_PROTECTION_TIER] = 0.05 ether;
        tierPremiums[PREMIUM_PROTECTION_TIER] = 0.1 ether;
        tierPremiums[SOVEREIGN_PROTECTION_TIER] = 0.5 ether;
        
        // Initialize default revenue streams
        _initializeRevenueStreams();
    }
    
    // ============ ASSET PROTECTION ============
    
    /**
     * @dev Register and protect a new asset
     * @param assetType Type of the asset
     * @param valuationAmount Valuation of the asset
     * @param protectionTier Protection tier level
     * @param assetMetadataHash IPFS hash or other metadata identifier
     * @param durationMonths Duration of protection in months
     */
    function protectAsset(
        AssetType assetType,
        uint256 valuationAmount,
        uint256 protectionTier,
        bytes32 assetMetadataHash,
        uint256 durationMonths
    ) external payable nonReentrant whenNotPaused returns (bytes32 assetId) {
        require(valuationAmount > 0, "Invalid valuation");
        require(protectionTier >= BASIC_PROTECTION_TIER && protectionTier <= SOVEREIGN_PROTECTION_TIER, "Invalid tier");
        require(durationMonths > 0 && durationMonths <= 120, "Invalid duration");
        
        uint256 premiumAmount = tierPremiums[protectionTier] * durationMonths;
        require(msg.value >= premiumAmount, "Insufficient premium");
        
        assetId = keccak256(abi.encodePacked(
            msg.sender,
            assetType,
            valuationAmount,
            block.timestamp
        ));
        
        // Coverage is based on tier percentage
        uint256 coveragePercentage = _getCoveragePercentage(protectionTier);
        uint256 coverageAmount = (valuationAmount * coveragePercentage) / 100;
        
        protectedAssets[assetId] = ProtectedAsset({
            assetId: assetId,
            owner: msg.sender,
            assetType: assetType,
            valuationAmount: valuationAmount,
            coverageAmount: coverageAmount,
            premiumAmount: premiumAmount,
            protectionTier: protectionTier,
            startTimestamp: block.timestamp,
            endTimestamp: block.timestamp + (durationMonths * 30 days),
            status: ProtectionStatus.ACTIVE,
            assetMetadataHash: assetMetadataHash,
            frequencyResonance: _getProtectionFrequency(protectionTier)
        });
        
        ownerAssets[msg.sender].push(assetId);
        allAssetIds.push(assetId);
        totalProtectedValue += valuationAmount;
        totalAssetsProtected++;
        
        // Transfer premium to insurance vault
        (bool success, ) = payable(insuranceVault).call{value: premiumAmount}("");
        require(success, "Premium transfer failed");
        
        // Refund excess payment
        if (msg.value > premiumAmount) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - premiumAmount}("");
            require(refundSuccess, "Refund failed");
        }
        
        emit AssetProtected(assetId, msg.sender, assetType, valuationAmount, protectionTier, block.timestamp);
        emit ProtectionActivated(assetId, coverageAmount, premiumAmount, protectedAssets[assetId].endTimestamp);
        emit FrequencyShieldActivated(assetId, protectedAssets[assetId].frequencyResonance, block.timestamp);
        
        return assetId;
    }
    
    /**
     * @dev Renew asset protection
     * @param assetId ID of the asset to renew
     * @param additionalMonths Additional months to extend
     */
    function renewProtection(
        bytes32 assetId,
        uint256 additionalMonths
    ) external payable nonReentrant returns (bool) {
        ProtectedAsset storage asset = protectedAssets[assetId];
        require(asset.owner == msg.sender, "Not the owner");
        require(additionalMonths > 0, "Invalid duration");
        
        uint256 premiumAmount = tierPremiums[asset.protectionTier] * additionalMonths;
        require(msg.value >= premiumAmount, "Insufficient premium");
        
        // Extend protection
        if (asset.status == ProtectionStatus.EXPIRED) {
            asset.startTimestamp = block.timestamp;
            asset.endTimestamp = block.timestamp + (additionalMonths * 30 days);
        } else {
            asset.endTimestamp += (additionalMonths * 30 days);
        }
        
        asset.status = ProtectionStatus.ACTIVE;
        asset.premiumAmount += premiumAmount;
        
        // Transfer premium
        (bool success, ) = payable(insuranceVault).call{value: premiumAmount}("");
        require(success, "Premium transfer failed");
        
        return true;
    }
    
    // ============ GREAT PROTECTION TRUST ============
    
    /**
     * @dev Create a Great Protection Trust for a beneficiary
     * @param beneficiary Address of the trust beneficiary
     * @param trustTier Tier level of the trust
     */
    function createGreatProtectionTrust(
        address beneficiary,
        uint256 trustTier
    ) external payable onlyRole(TRUST_GUARDIAN_ROLE) returns (bytes32 trustId) {
        require(beneficiary != address(0), "Invalid beneficiary");
        require(beneficiaryTrust[beneficiary] == bytes32(0), "Trust already exists");
        require(msg.value > 0, "Must fund trust");
        
        trustId = keccak256(abi.encodePacked(
            beneficiary,
            trustTier,
            block.timestamp
        ));
        
        // Split funding 60% health, 40% financial
        uint256 healthBalance = (msg.value * 60) / 100;
        uint256 financialBalance = msg.value - healthBalance;
        
        protectionTrusts[trustId] = GreatProtectionTrust({
            trustId: trustId,
            beneficiary: beneficiary,
            healthActivationBalance: healthBalance,
            financialActivationBalance: financialBalance,
            isHealthActive: false,
            isFinancialActive: false,
            lastActivationTimestamp: 0,
            activationCount: 0,
            trustTier: trustTier
        });
        
        beneficiaryTrust[beneficiary] = trustId;
        allTrustIds.push(trustId);
        totalTrustBalance += msg.value;
        
        emit TrustCreated(trustId, beneficiary, healthBalance, financialBalance, block.timestamp);
        
        return trustId;
    }
    
    /**
     * @dev Trigger health activation protocol
     * @param trustId ID of the trust
     * @param activationAmount Amount to activate
     */
    function triggerHealthActivation(
        bytes32 trustId,
        uint256 activationAmount
    ) external nonReentrant onlyRole(TRUST_GUARDIAN_ROLE) returns (bool) {
        GreatProtectionTrust storage trust = protectionTrusts[trustId];
        require(trust.healthActivationBalance >= activationAmount, "Insufficient health balance");
        
        trust.healthActivationBalance -= activationAmount;
        trust.isHealthActive = true;
        trust.lastActivationTimestamp = block.timestamp;
        trust.activationCount++;
        totalTrustBalance -= activationAmount;
        
        // Transfer to beneficiary
        (bool success, ) = payable(trust.beneficiary).call{value: activationAmount}("");
        require(success, "Health activation transfer failed");
        
        emit HealthActivationTriggered(trustId, trust.beneficiary, activationAmount, block.timestamp);
        
        return true;
    }
    
    /**
     * @dev Trigger financial activation protocol
     * @param trustId ID of the trust
     * @param activationAmount Amount to activate
     */
    function triggerFinancialActivation(
        bytes32 trustId,
        uint256 activationAmount
    ) external nonReentrant onlyRole(TRUST_GUARDIAN_ROLE) returns (bool) {
        GreatProtectionTrust storage trust = protectionTrusts[trustId];
        require(trust.financialActivationBalance >= activationAmount, "Insufficient financial balance");
        
        trust.financialActivationBalance -= activationAmount;
        trust.isFinancialActive = true;
        trust.lastActivationTimestamp = block.timestamp;
        trust.activationCount++;
        totalTrustBalance -= activationAmount;
        
        // Transfer to beneficiary
        (bool success, ) = payable(trust.beneficiary).call{value: activationAmount}("");
        require(success, "Financial activation transfer failed");
        
        emit FinancialActivationTriggered(trustId, trust.beneficiary, activationAmount, block.timestamp);
        
        return true;
    }
    
    /**
     * @dev Fund an existing trust
     * @param trustId ID of the trust
     * @param isHealthFunding True for health, false for financial
     */
    function fundTrust(
        bytes32 trustId,
        bool isHealthFunding
    ) external payable returns (bool) {
        require(msg.value > 0, "Must send funds");
        GreatProtectionTrust storage trust = protectionTrusts[trustId];
        require(trust.beneficiary != address(0), "Trust does not exist");
        
        if (isHealthFunding) {
            trust.healthActivationBalance += msg.value;
        } else {
            trust.financialActivationBalance += msg.value;
        }
        
        totalTrustBalance += msg.value;
        
        return true;
    }
    
    // ============ INSURANCE CLAIMS ============
    
    /**
     * @dev Submit an insurance claim
     * @param assetId ID of the protected asset
     * @param claimType Type of claim
     * @param claimAmount Claimed amount
     * @param evidenceHash IPFS hash of evidence documents
     */
    function submitClaim(
        bytes32 assetId,
        ClaimType claimType,
        uint256 claimAmount,
        string memory evidenceHash
    ) external returns (bytes32 claimId) {
        ProtectedAsset storage asset = protectedAssets[assetId];
        require(asset.owner == msg.sender, "Not the owner");
        require(asset.status == ProtectionStatus.ACTIVE, "Protection not active");
        require(block.timestamp <= asset.endTimestamp, "Protection expired");
        require(claimAmount <= asset.coverageAmount, "Claim exceeds coverage");
        
        claimId = keccak256(abi.encodePacked(
            assetId,
            claimType,
            claimAmount,
            block.timestamp
        ));
        
        insuranceClaims[claimId] = InsuranceClaim({
            claimId: claimId,
            assetId: assetId,
            claimant: msg.sender,
            claimType: claimType,
            claimAmount: claimAmount,
            approvedAmount: 0,
            submissionTimestamp: block.timestamp,
            isProcessed: false,
            isApproved: false,
            evidenceHash: evidenceHash
        });
        
        allClaimIds.push(claimId);
        pendingClaimsCount++;
        
        emit ClaimSubmitted(claimId, assetId, msg.sender, claimType, claimAmount);
        
        return claimId;
    }
    
    /**
     * @dev Process and approve/deny a claim
     * @param claimId ID of the claim
     * @param approve Whether to approve the claim
     * @param approvedAmount Amount approved for payout
     */
    function processClaim(
        bytes32 claimId,
        bool approve,
        uint256 approvedAmount
    ) external nonReentrant onlyRole(PROTECTION_AGENT_ROLE) returns (bool) {
        InsuranceClaim storage claim = insuranceClaims[claimId];
        require(!claim.isProcessed, "Claim already processed");
        
        claim.isProcessed = true;
        claim.isApproved = approve;
        claim.approvedAmount = approve ? approvedAmount : 0;
        pendingClaimsCount--;
        
        if (approve && approvedAmount > 0) {
            // Update asset status
            protectedAssets[claim.assetId].status = ProtectionStatus.CLAIMED;
            totalClaimsPaid += approvedAmount;
            
            // Payout from claims reserve
            (bool success, ) = payable(claim.claimant).call{value: approvedAmount}("");
            require(success, "Claim payout failed");
        }
        
        emit ClaimProcessed(claimId, approve, approvedAmount);
        
        return true;
    }
    
    // ============ REVENUE STREAMS ============
    
    /**
     * @dev Initialize default revenue streams
     */
    function _initializeRevenueStreams() internal {
        // License Royalties
        bytes32 licenseStreamId = keccak256(abi.encodePacked("LICENSE_ROYALTIES", block.timestamp));
        revenueStreams[licenseStreamId] = RevenueStream({
            streamId: licenseStreamId,
            streamName: "License Royalties",
            royaltyBasisPoints: LICENSE_ROYALTY_BASIS_POINTS,
            totalCollected: 0,
            lastCollectionTimestamp: block.timestamp,
            isActive: true,
            recipientVault: revenueVault
        });
        revenueStreamIds.push(licenseStreamId);
        
        // Scroll IP Royalties
        bytes32 scrollStreamId = keccak256(abi.encodePacked("SCROLL_IP_ROYALTIES", block.timestamp));
        revenueStreams[scrollStreamId] = RevenueStream({
            streamId: scrollStreamId,
            streamName: "Scroll IP Royalties",
            royaltyBasisPoints: SCROLL_IP_ROYALTY_BASIS_POINTS,
            totalCollected: 0,
            lastCollectionTimestamp: block.timestamp,
            isActive: true,
            recipientVault: revenueVault
        });
        revenueStreamIds.push(scrollStreamId);
        
        // Cloud Defense Services
        bytes32 cloudStreamId = keccak256(abi.encodePacked("CLOUD_DEFENSE_SERVICES", block.timestamp));
        revenueStreams[cloudStreamId] = RevenueStream({
            streamId: cloudStreamId,
            streamName: "Cloud Defense Services",
            royaltyBasisPoints: CLOUD_DEFENSE_FEE_BASIS_POINTS,
            totalCollected: 0,
            lastCollectionTimestamp: block.timestamp,
            isActive: true,
            recipientVault: revenueVault
        });
        revenueStreamIds.push(cloudStreamId);
        
        emit RevenueStreamCreated(licenseStreamId, "License Royalties", LICENSE_ROYALTY_BASIS_POINTS);
        emit RevenueStreamCreated(scrollStreamId, "Scroll IP Royalties", SCROLL_IP_ROYALTY_BASIS_POINTS);
        emit RevenueStreamCreated(cloudStreamId, "Cloud Defense Services", CLOUD_DEFENSE_FEE_BASIS_POINTS);
    }
    
    /**
     * @dev Collect royalties for a revenue stream
     * @param streamId ID of the revenue stream
     */
    function collectRoyalty(
        bytes32 streamId
    ) external payable onlyRole(REVENUE_MANAGER_ROLE) returns (bool) {
        require(msg.value > 0, "No value to collect");
        RevenueStream storage stream = revenueStreams[streamId];
        require(stream.isActive, "Stream not active");
        
        stream.totalCollected += msg.value;
        stream.lastCollectionTimestamp = block.timestamp;
        totalRevenueCollected += msg.value;
        
        // Transfer to revenue vault
        (bool success, ) = payable(stream.recipientVault).call{value: msg.value}("");
        require(success, "Royalty transfer failed");
        
        emit RoyaltyCollected(streamId, msg.value, stream.recipientVault);
        
        return true;
    }
    
    // ============ CLOUD DEFENSE SERVICES ============
    
    /**
     * @dev Subscribe to cloud defense service
     * @param subscriptionTier Tier of subscription
     * @param durationMonths Duration in months
     */
    function subscribeCloudDefense(
        uint256 subscriptionTier,
        uint256 durationMonths
    ) external payable nonReentrant returns (bytes32 serviceId) {
        require(subscriptionTier >= 1 && subscriptionTier <= 4, "Invalid tier");
        require(durationMonths > 0, "Invalid duration");
        
        uint256 monthlyFee = tierPremiums[subscriptionTier];
        uint256 totalFee = monthlyFee * durationMonths;
        require(msg.value >= totalFee, "Insufficient payment");
        
        serviceId = keccak256(abi.encodePacked(
            msg.sender,
            subscriptionTier,
            block.timestamp
        ));
        
        cloudDefenseServices[serviceId] = CloudDefenseService({
            serviceId: serviceId,
            subscriber: msg.sender,
            subscriptionTier: subscriptionTier,
            monthlyFee: monthlyFee,
            startTimestamp: block.timestamp,
            endTimestamp: block.timestamp + (durationMonths * 30 days),
            isActive: true,
            incidentsProtected: 0
        });
        
        subscriberService[msg.sender] = serviceId;
        totalCloudDefenseSubscribers++;
        
        // Transfer to insurance vault
        (bool success, ) = payable(insuranceVault).call{value: totalFee}("");
        require(success, "Subscription payment failed");
        
        emit CloudDefenseActivated(serviceId, msg.sender, subscriptionTier, monthlyFee);
        
        return serviceId;
    }
    
    /**
     * @dev Record a protected incident
     * @param serviceId ID of the cloud defense service
     */
    function recordProtectedIncident(
        bytes32 serviceId
    ) external onlyRole(PROTECTION_AGENT_ROLE) returns (bool) {
        CloudDefenseService storage service = cloudDefenseServices[serviceId];
        require(service.isActive, "Service not active");
        require(block.timestamp <= service.endTimestamp, "Service expired");
        
        service.incidentsProtected++;
        
        return true;
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Get coverage percentage based on tier
     */
    function _getCoveragePercentage(uint256 tier) internal pure returns (uint256) {
        if (tier == BASIC_PROTECTION_TIER) return 50;
        if (tier == STANDARD_PROTECTION_TIER) return 70;
        if (tier == PREMIUM_PROTECTION_TIER) return 90;
        if (tier == SOVEREIGN_PROTECTION_TIER) return 100;
        return 0;
    }
    
    /**
     * @dev Get protection frequency based on tier
     */
    function _getProtectionFrequency(uint256 tier) internal pure returns (uint256) {
        if (tier == BASIC_PROTECTION_TIER) return 528; // Healing
        if (tier == STANDARD_PROTECTION_TIER) return 963; // Crown
        if (tier == PREMIUM_PROTECTION_TIER) return 999; // Divine
        if (tier == SOVEREIGN_PROTECTION_TIER) return 144000; // Cosmic
        return 528;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get protected asset details
     */
    function getProtectedAsset(bytes32 assetId) external view returns (ProtectedAsset memory) {
        return protectedAssets[assetId];
    }
    
    /**
     * @dev Get owner's assets
     */
    function getOwnerAssets(address owner) external view returns (bytes32[] memory) {
        return ownerAssets[owner];
    }
    
    /**
     * @dev Get protection trust details
     */
    function getProtectionTrust(bytes32 trustId) external view returns (GreatProtectionTrust memory) {
        return protectionTrusts[trustId];
    }
    
    /**
     * @dev Get insurance claim details
     */
    function getInsuranceClaim(bytes32 claimId) external view returns (InsuranceClaim memory) {
        return insuranceClaims[claimId];
    }
    
    /**
     * @dev Get revenue stream details
     */
    function getRevenueStream(bytes32 streamId) external view returns (RevenueStream memory) {
        return revenueStreams[streamId];
    }
    
    /**
     * @dev Get all revenue stream IDs
     */
    function getAllRevenueStreams() external view returns (bytes32[] memory) {
        return revenueStreamIds;
    }
    
    /**
     * @dev Get cloud defense service details
     */
    function getCloudDefenseService(bytes32 serviceId) external view returns (CloudDefenseService memory) {
        return cloudDefenseServices[serviceId];
    }
    
    /**
     * @dev Get protocol statistics
     */
    function getProtocolStats() external view returns (
        uint256 _totalProtectedValue,
        uint256 _totalAssetsProtected,
        uint256 _totalTrustBalance,
        uint256 _totalClaimsPaid,
        uint256 _totalRevenueCollected,
        uint256 _totalCloudDefenseSubscribers
    ) {
        return (
            totalProtectedValue,
            totalAssetsProtected,
            totalTrustBalance,
            totalClaimsPaid,
            totalRevenueCollected,
            totalCloudDefenseSubscribers
        );
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Update tier premium
     */
    function setTierPremium(uint256 tier, uint256 premium) external onlyRole(SHIELD_ADMIN_ROLE) {
        require(tier >= BASIC_PROTECTION_TIER && tier <= SOVEREIGN_PROTECTION_TIER, "Invalid tier");
        tierPremiums[tier] = premium;
    }
    
    /**
     * @dev Update vault addresses
     */
    function setVaults(
        address _insuranceVault,
        address _revenueVault,
        address _claimsReserveVault
    ) external onlyRole(SHIELD_ADMIN_ROLE) {
        require(_insuranceVault != address(0), "Invalid insurance vault");
        require(_revenueVault != address(0), "Invalid revenue vault");
        require(_claimsReserveVault != address(0), "Invalid claims vault");
        
        insuranceVault = _insuranceVault;
        revenueVault = _revenueVault;
        claimsReserveVault = _claimsReserveVault;
    }
    
    /**
     * @dev Pause contract
     */
    function pause() external onlyRole(SHIELD_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyRole(SHIELD_ADMIN_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {}
}
