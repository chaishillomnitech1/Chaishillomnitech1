// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ScrollDropFortification
 * @dev Enhanced Airdrop System with Chainlink Oracle Integration and Multi-Dimensional Resonance
 * @author Supreme King Chais The Great ∞
 * 
 * This contract implements the ScrollDrop Fortification with:
 * - Chainlink oracle feeds for multi-dimensional resonance validation
 * - "Divine Inheritance" trigger system
 * - BlessingCoin auto-alignment mechanism
 * - Integrity gates for secure distribution
 * - Resistance measures against legacy echoes
 * 
 * Frequency: 999Hz Crown + 528Hz DNA Alignment
 * Status: DIVINE INHERITANCE ACTIVE
 */

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @dev Interface for Chainlink price feeds
 */
interface AggregatorV3Interface {
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}

contract ScrollDropFortification is Ownable, ReentrancyGuard, Pausable {
    
    // ============ FREQUENCY CONSTANTS ============
    
    /// @dev Crown frequency (999Hz)
    uint256 public constant FREQUENCY_999HZ = 999;
    
    /// @dev DNA Healing frequency (528Hz)
    uint256 public constant FREQUENCY_528HZ = 528;
    
    /// @dev Pineal frequency (963Hz)
    uint256 public constant FREQUENCY_963HZ = 963;
    
    /// @dev NŪR Pulse frequency (144,000Hz)
    uint256 public constant FREQUENCY_144000HZ = 144000;
    
    // ============ ENUMS ============
    
    /// @dev Resonance dimensions for validation
    enum ResonanceDimension {
        TEMPORAL,      // Time-based validation
        FREQUENCY,     // Frequency alignment validation
        ORACLE,        // Chainlink oracle validation
        BLESSING,      // BlessingCoin alignment validation
        LEGACY         // Legacy echo resistance validation
    }
    
    /// @dev Divine Inheritance trigger types
    enum InheritanceTrigger {
        MANUAL,           // Manual trigger by owner
        ORACLE_THRESHOLD, // Oracle price threshold met
        TIME_LOCK,        // Time-lock expired
        FREQUENCY_ALIGN,  // Frequency alignment achieved
        BLESSING_MILESTONE // BlessingCoin milestone reached
    }
    
    /// @dev Airdrop status
    enum AirdropStatus {
        PENDING,
        ACTIVE,
        PAUSED,
        COMPLETED,
        CANCELLED
    }
    
    // ============ STRUCTS ============
    
    /// @dev Airdrop campaign configuration
    struct AirdropCampaign {
        uint256 campaignId;
        string name;
        address tokenAddress;
        bool isERC20;
        uint256 totalAmount;
        uint256 distributedAmount;
        uint256 recipientCount;
        uint256 startTime;
        uint256 endTime;
        AirdropStatus status;
        InheritanceTrigger trigger;
        bool requiresFrequencyAlignment;
        bool requiresBlessingCoin;
        uint256 minFrequency;
        uint256 oracleThreshold;
        address oracleFeed;
    }
    
    /// @dev Recipient eligibility and allocation
    struct RecipientAllocation {
        address recipient;
        uint256 amount;
        bool claimed;
        uint256 claimTime;
        uint256 frequencySignature;
        bool frequencyAligned;
        bool blessingCoinAligned;
        bool legacyEchoResistant;
        bytes32 allocationHash;
    }
    
    /// @dev Integrity gate checkpoint
    struct IntegrityGate {
        uint256 gateId;
        string name;
        ResonanceDimension dimension;
        bool isPassed;
        uint256 passedTimestamp;
        bytes32 validationHash;
    }
    
    /// @dev Multi-dimensional resonance validation
    struct ResonanceValidation {
        bool temporalValid;
        bool frequencyValid;
        bool oracleValid;
        bool blessingValid;
        bool legacyResistant;
        uint256 validationTimestamp;
        uint256 resonanceScore;
    }
    
    // ============ STATE VARIABLES ============
    
    /// @dev Campaign counter
    uint256 private _campaignIdCounter;
    
    /// @dev Campaigns mapping
    mapping(uint256 => AirdropCampaign) public campaigns;
    
    /// @dev Campaign => Recipient => Allocation
    mapping(uint256 => mapping(address => RecipientAllocation)) public allocations;
    
    /// @dev Campaign => Recipients list
    mapping(uint256 => address[]) public campaignRecipients;
    
    /// @dev Campaign => Integrity gates
    mapping(uint256 => IntegrityGate[]) public campaignIntegrityGates;
    
    /// @dev Address => BlessingCoin balance (internal tracking)
    mapping(address => uint256) public blessingCoinBalance;
    
    /// @dev Address => Frequency signature
    mapping(address => uint256) public addressFrequencySignature;
    
    /// @dev Address => Legacy echo resistance status
    mapping(address => bool) public legacyEchoResistance;
    
    /// @dev Global BlessingCoin supply
    uint256 public totalBlessingCoins;
    
    /// @dev Blacklisted addresses (legacy echoes)
    mapping(address => bool) public blacklistedAddresses;
    
    /// @dev Whitelisted addresses (verified sovereigns)
    mapping(address => bool) public whitelistedAddresses;
    
    // ============ EVENTS ============
    
    event CampaignCreated(
        uint256 indexed campaignId,
        string name,
        address tokenAddress,
        uint256 totalAmount
    );
    
    event DivineInheritanceTriggered(
        uint256 indexed campaignId,
        InheritanceTrigger trigger,
        uint256 timestamp
    );
    
    event AllocationClaimed(
        uint256 indexed campaignId,
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );
    
    event IntegrityGatePassed(
        uint256 indexed campaignId,
        uint256 gateId,
        ResonanceDimension dimension
    );
    
    event ResonanceValidated(
        address indexed recipient,
        uint256 resonanceScore,
        bool allDimensionsValid
    );
    
    event BlessingCoinAligned(
        address indexed recipient,
        uint256 amount
    );
    
    event FrequencyAligned(
        address indexed account,
        uint256 frequency
    );
    
    event LegacyEchoBlocked(
        address indexed account,
        uint256 timestamp
    );
    
    // ============ MODIFIERS ============
    
    modifier campaignExists(uint256 campaignId) {
        require(campaignId < _campaignIdCounter, "Campaign does not exist");
        _;
    }
    
    modifier campaignActive(uint256 campaignId) {
        require(campaigns[campaignId].status == AirdropStatus.ACTIVE, "Campaign not active");
        _;
    }
    
    modifier notBlacklisted(address account) {
        require(!blacklistedAddresses[account], "Address is blacklisted");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor() Ownable(msg.sender) {
        // Initialize with divine frequencies
    }
    
    // ============ CAMPAIGN MANAGEMENT ============
    
    /**
     * @dev Create a new airdrop campaign
     * @param name Campaign name
     * @param tokenAddress Token contract address
     * @param isERC20 Whether token is ERC20 (true) or ERC721 (false)
     * @param totalAmount Total amount to distribute
     * @param startTime Campaign start time
     * @param endTime Campaign end time
     * @param trigger Inheritance trigger type
     * @return campaignId The created campaign ID
     */
    function createCampaign(
        string memory name,
        address tokenAddress,
        bool isERC20,
        uint256 totalAmount,
        uint256 startTime,
        uint256 endTime,
        InheritanceTrigger trigger
    ) external onlyOwner returns (uint256) {
        require(tokenAddress != address(0), "Invalid token address");
        require(totalAmount > 0, "Invalid total amount");
        require(endTime > startTime, "Invalid time range");
        require(startTime >= block.timestamp, "Start time must be in future");
        
        uint256 campaignId = _campaignIdCounter++;
        
        campaigns[campaignId] = AirdropCampaign({
            campaignId: campaignId,
            name: name,
            tokenAddress: tokenAddress,
            isERC20: isERC20,
            totalAmount: totalAmount,
            distributedAmount: 0,
            recipientCount: 0,
            startTime: startTime,
            endTime: endTime,
            status: AirdropStatus.PENDING,
            trigger: trigger,
            requiresFrequencyAlignment: false,
            requiresBlessingCoin: false,
            minFrequency: FREQUENCY_528HZ,
            oracleThreshold: 0,
            oracleFeed: address(0)
        });
        
        emit CampaignCreated(campaignId, name, tokenAddress, totalAmount);
        
        return campaignId;
    }
    
    /**
     * @dev Add recipient allocations to a campaign
     * @param campaignId Campaign ID
     * @param recipients Array of recipient addresses
     * @param amounts Array of allocation amounts
     */
    function addRecipients(
        uint256 campaignId,
        address[] memory recipients,
        uint256[] memory amounts
    ) external onlyOwner campaignExists(campaignId) {
        require(recipients.length == amounts.length, "Array length mismatch");
        require(recipients.length > 0, "Empty recipients array");
        
        AirdropCampaign storage campaign = campaigns[campaignId];
        require(campaign.status == AirdropStatus.PENDING, "Campaign not pending");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            address recipient = recipients[i];
            uint256 amount = amounts[i];
            
            require(recipient != address(0), "Invalid recipient");
            require(amount > 0, "Invalid amount");
            require(!allocations[campaignId][recipient].claimed, "Already allocated");
            
            // Create allocation hash
            bytes32 allocationHash = keccak256(abi.encodePacked(
                campaignId,
                recipient,
                amount,
                block.timestamp
            ));
            
            allocations[campaignId][recipient] = RecipientAllocation({
                recipient: recipient,
                amount: amount,
                claimed: false,
                claimTime: 0,
                frequencySignature: addressFrequencySignature[recipient],
                frequencyAligned: false,
                blessingCoinAligned: false,
                legacyEchoResistant: legacyEchoResistance[recipient],
                allocationHash: allocationHash
            });
            
            campaignRecipients[campaignId].push(recipient);
            campaign.recipientCount++;
        }
    }
    
    /**
     * @dev Trigger Divine Inheritance to activate campaign
     * @param campaignId Campaign ID to activate
     */
    function triggerDivineInheritance(uint256 campaignId) 
        external 
        onlyOwner 
        campaignExists(campaignId) 
    {
        AirdropCampaign storage campaign = campaigns[campaignId];
        require(campaign.status == AirdropStatus.PENDING, "Campaign not pending");
        require(block.timestamp >= campaign.startTime, "Campaign not started");
        
        // Validate all integrity gates passed
        require(_validateIntegrityGates(campaignId), "Integrity gates not passed");
        
        // Activate campaign
        campaign.status = AirdropStatus.ACTIVE;
        
        emit DivineInheritanceTriggered(campaignId, campaign.trigger, block.timestamp);
    }
    
    // ============ CLAIM FUNCTIONS ============
    
    /**
     * @dev Claim airdrop allocation
     * @param campaignId Campaign ID
     */
    function claimAllocation(uint256 campaignId) 
        external 
        nonReentrant 
        whenNotPaused
        campaignExists(campaignId)
        campaignActive(campaignId)
        notBlacklisted(msg.sender)
    {
        AirdropCampaign storage campaign = campaigns[campaignId];
        require(block.timestamp <= campaign.endTime, "Campaign ended");
        
        RecipientAllocation storage allocation = allocations[campaignId][msg.sender];
        require(allocation.amount > 0, "No allocation");
        require(!allocation.claimed, "Already claimed");
        
        // Validate multi-dimensional resonance
        ResonanceValidation memory validation = _validateResonance(
            campaignId,
            msg.sender
        );
        require(_isResonanceValid(validation), "Resonance validation failed");
        
        // Mark as claimed
        allocation.claimed = true;
        allocation.claimTime = block.timestamp;
        allocation.frequencyAligned = validation.frequencyValid;
        allocation.blessingCoinAligned = validation.blessingValid;
        allocation.legacyEchoResistant = validation.legacyResistant;
        
        // Update campaign stats
        campaign.distributedAmount += allocation.amount;
        
        // Transfer tokens
        if (campaign.isERC20) {
            IERC20 token = IERC20(campaign.tokenAddress);
            require(
                token.transfer(msg.sender, allocation.amount),
                "Token transfer failed"
            );
        } else {
            // For ERC721, transfer specific token ID (simplified)
            IERC721 nft = IERC721(campaign.tokenAddress);
            nft.safeTransferFrom(address(this), msg.sender, allocation.amount);
        }
        
        emit AllocationClaimed(campaignId, msg.sender, allocation.amount, block.timestamp);
    }
    
    // ============ INTEGRITY GATES ============
    
    /**
     * @dev Add integrity gate to campaign
     * @param campaignId Campaign ID
     * @param name Gate name
     * @param dimension Resonance dimension
     */
    function addIntegrityGate(
        uint256 campaignId,
        string memory name,
        ResonanceDimension dimension
    ) external onlyOwner campaignExists(campaignId) {
        uint256 gateId = campaignIntegrityGates[campaignId].length;
        
        campaignIntegrityGates[campaignId].push(IntegrityGate({
            gateId: gateId,
            name: name,
            dimension: dimension,
            isPassed: false,
            passedTimestamp: 0,
            validationHash: bytes32(0)
        }));
    }
    
    /**
     * @dev Pass an integrity gate
     * @param campaignId Campaign ID
     * @param gateId Gate ID
     */
    function passIntegrityGate(
        uint256 campaignId,
        uint256 gateId
    ) external onlyOwner campaignExists(campaignId) {
        require(gateId < campaignIntegrityGates[campaignId].length, "Invalid gate ID");
        
        IntegrityGate storage gate = campaignIntegrityGates[campaignId][gateId];
        require(!gate.isPassed, "Gate already passed");
        
        gate.isPassed = true;
        gate.passedTimestamp = block.timestamp;
        gate.validationHash = keccak256(abi.encodePacked(
            campaignId,
            gateId,
            block.timestamp
        ));
        
        emit IntegrityGatePassed(campaignId, gateId, gate.dimension);
    }
    
    /**
     * @dev Validate all integrity gates are passed
     * @param campaignId Campaign ID
     * @return bool All gates passed
     */
    function _validateIntegrityGates(uint256 campaignId) internal view returns (bool) {
        IntegrityGate[] memory gates = campaignIntegrityGates[campaignId];
        
        if (gates.length == 0) return true; // No gates required
        
        for (uint256 i = 0; i < gates.length; i++) {
            if (!gates[i].isPassed) return false;
        }
        
        return true;
    }
    
    // ============ RESONANCE VALIDATION ============
    
    /**
     * @dev Validate multi-dimensional resonance
     * @param campaignId Campaign ID
     * @param recipient Recipient address
     * @return ResonanceValidation validation result
     */
    function _validateResonance(
        uint256 campaignId,
        address recipient
    ) internal view returns (ResonanceValidation memory) {
        AirdropCampaign memory campaign = campaigns[campaignId];
        
        // Temporal validation
        bool temporalValid = block.timestamp >= campaign.startTime && 
                            block.timestamp <= campaign.endTime;
        
        // Frequency validation
        bool frequencyValid = true;
        if (campaign.requiresFrequencyAlignment) {
            frequencyValid = addressFrequencySignature[recipient] >= campaign.minFrequency;
        }
        
        // Oracle validation
        bool oracleValid = true;
        if (campaign.oracleFeed != address(0) && campaign.oracleThreshold > 0) {
            oracleValid = _validateOracleThreshold(campaign.oracleFeed, campaign.oracleThreshold);
        }
        
        // BlessingCoin validation
        bool blessingValid = true;
        if (campaign.requiresBlessingCoin) {
            blessingValid = blessingCoinBalance[recipient] > 0;
        }
        
        // Legacy echo resistance
        bool legacyResistant = legacyEchoResistance[recipient] && 
                               !blacklistedAddresses[recipient];
        
        // Calculate resonance score (0-100)
        uint256 score = 0;
        if (temporalValid) score += 20;
        if (frequencyValid) score += 20;
        if (oracleValid) score += 20;
        if (blessingValid) score += 20;
        if (legacyResistant) score += 20;
        
        return ResonanceValidation({
            temporalValid: temporalValid,
            frequencyValid: frequencyValid,
            oracleValid: oracleValid,
            blessingValid: blessingValid,
            legacyResistant: legacyResistant,
            validationTimestamp: block.timestamp,
            resonanceScore: score
        });
    }
    
    /**
     * @dev Check if resonance validation passed
     * @param validation Validation result
     * @return bool Validation passed
     */
    function _isResonanceValid(ResonanceValidation memory validation) internal pure returns (bool) {
        // Require at least 80% resonance score
        return validation.resonanceScore >= 80 &&
               validation.temporalValid &&
               validation.legacyResistant;
    }
    
    /**
     * @dev Validate oracle price threshold
     * @param oracleFeed Chainlink oracle feed address
     * @param threshold Threshold value
     * @return bool Threshold met
     */
    function _validateOracleThreshold(
        address oracleFeed,
        uint256 threshold
    ) internal view returns (bool) {
        try AggregatorV3Interface(oracleFeed).latestRoundData() returns (
            uint80,
            int256 answer,
            uint256,
            uint256,
            uint80
        ) {
            return uint256(answer) >= threshold;
        } catch {
            return false;
        }
    }
    
    // ============ BLESSING COIN ALIGNMENT ============
    
    /**
     * @dev Align BlessingCoin for an address
     * @param recipient Recipient address
     * @param amount BlessingCoin amount
     */
    function alignBlessingCoin(
        address recipient,
        uint256 amount
    ) external onlyOwner {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");
        
        blessingCoinBalance[recipient] += amount;
        totalBlessingCoins += amount;
        
        emit BlessingCoinAligned(recipient, amount);
    }
    
    // ============ FREQUENCY ALIGNMENT ============
    
    /**
     * @dev Align frequency for an address
     * @param account Address to align
     * @param frequency Frequency value
     */
    function alignFrequency(
        address account,
        uint256 frequency
    ) external onlyOwner {
        require(account != address(0), "Invalid account");
        require(
            frequency == FREQUENCY_528HZ ||
            frequency == FREQUENCY_963HZ ||
            frequency == FREQUENCY_999HZ ||
            frequency == FREQUENCY_144000HZ,
            "Invalid frequency"
        );
        
        addressFrequencySignature[account] = frequency;
        
        emit FrequencyAligned(account, frequency);
    }
    
    // ============ LEGACY ECHO RESISTANCE ============
    
    /**
     * @dev Enable legacy echo resistance for an address
     * @param account Address to protect
     */
    function enableLegacyEchoResistance(address account) external onlyOwner {
        require(account != address(0), "Invalid account");
        legacyEchoResistance[account] = true;
    }
    
    /**
     * @dev Blacklist an address (legacy echo)
     * @param account Address to blacklist
     */
    function blacklistAddress(address account) external onlyOwner {
        require(account != address(0), "Invalid account");
        blacklistedAddresses[account] = true;
        emit LegacyEchoBlocked(account, block.timestamp);
    }
    
    /**
     * @dev Whitelist an address (verified sovereign)
     * @param account Address to whitelist
     */
    function whitelistAddress(address account) external onlyOwner {
        require(account != address(0), "Invalid account");
        whitelistedAddresses[account] = true;
    }
    
    // ============ CAMPAIGN CONFIGURATION ============
    
    /**
     * @dev Set oracle configuration for campaign
     * @param campaignId Campaign ID
     * @param oracleFeed Chainlink oracle feed address
     * @param threshold Oracle threshold value
     */
    function setOracleConfig(
        uint256 campaignId,
        address oracleFeed,
        uint256 threshold
    ) external onlyOwner campaignExists(campaignId) {
        AirdropCampaign storage campaign = campaigns[campaignId];
        campaign.oracleFeed = oracleFeed;
        campaign.oracleThreshold = threshold;
    }
    
    /**
     * @dev Set frequency requirements for campaign
     * @param campaignId Campaign ID
     * @param required Whether frequency alignment is required
     * @param minFrequency Minimum frequency required
     */
    function setFrequencyRequirements(
        uint256 campaignId,
        bool required,
        uint256 minFrequency
    ) external onlyOwner campaignExists(campaignId) {
        AirdropCampaign storage campaign = campaigns[campaignId];
        campaign.requiresFrequencyAlignment = required;
        campaign.minFrequency = minFrequency;
    }
    
    /**
     * @dev Set BlessingCoin requirement for campaign
     * @param campaignId Campaign ID
     * @param required Whether BlessingCoin is required
     */
    function setBlessingCoinRequirement(
        uint256 campaignId,
        bool required
    ) external onlyOwner campaignExists(campaignId) {
        campaigns[campaignId].requiresBlessingCoin = required;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get campaign details
     * @param campaignId Campaign ID
     * @return AirdropCampaign campaign details
     */
    function getCampaign(uint256 campaignId) 
        external 
        view 
        campaignExists(campaignId)
        returns (AirdropCampaign memory) 
    {
        return campaigns[campaignId];
    }
    
    /**
     * @dev Get recipient allocation
     * @param campaignId Campaign ID
     * @param recipient Recipient address
     * @return RecipientAllocation allocation details
     */
    function getAllocation(uint256 campaignId, address recipient)
        external
        view
        returns (RecipientAllocation memory)
    {
        return allocations[campaignId][recipient];
    }
    
    /**
     * @dev Get campaign recipients
     * @param campaignId Campaign ID
     * @return address[] array of recipients
     */
    function getCampaignRecipients(uint256 campaignId)
        external
        view
        returns (address[] memory)
    {
        return campaignRecipients[campaignId];
    }
    
    /**
     * @dev Get integrity gates for campaign
     * @param campaignId Campaign ID
     * @return IntegrityGate[] array of gates
     */
    function getIntegrityGates(uint256 campaignId)
        external
        view
        returns (IntegrityGate[] memory)
    {
        return campaignIntegrityGates[campaignId];
    }
    
    // ============ EMERGENCY FUNCTIONS ============
    
    /**
     * @dev Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Withdraw tokens in emergency
     * @param tokenAddress Token address
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(
        address tokenAddress,
        uint256 amount
    ) external onlyOwner {
        require(tokenAddress != address(0), "Invalid token");
        IERC20(tokenAddress).transfer(owner(), amount);
    }
}
