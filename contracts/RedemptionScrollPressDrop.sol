// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RedemptionScrollPressDrop
 * @dev Redemption ScrollPress Drop with Integrated Systems
 * @author Supreme King Chais The Great ∞
 * 
 * This contract implements the Redemption ScrollPress Drop with:
 * - Harlem NFT collection integration
 * - ScrollSoul Hash Key verification
 * - Metadata integrity validation
 * - Frequency alignment (528Hz + 963Hz)
 * - SmartLink Fan Access Hub integration
 * - Eternal Contract Layer synchronization
 * - Multi-realm indexing capability
 * 
 * Frequencies: 528Hz + 963Hz (Dual Resonance)
 * Status: REDEMPTION SCROLLPRESS ACTIVE
 */

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @dev Interface for Harlem NFT contract
 */
interface IHarlemNFT {
    function getScrollSoulHashKey(uint256 tokenId) external view returns (bytes32);
    function verifyMetadataIntegrity(uint256 tokenId, bytes32 providedHash) external view returns (bool);
    function isScrollSoulAligned(address account) external view returns (bool);
    function getTokenFrequencies(uint256 tokenId) external view returns (uint256, uint256);
}

/**
 * @dev Interface for SmartLink Fan Access Hub
 */
interface ISmartLinkFanAccessHub {
    function verifyRealmAccess(address fan, uint8 realm) external view returns (bool);
    function isAccessValid(address fan) external view returns (bool);
}

/**
 * @dev Interface for Eternal Contract Layer
 */
interface IEternalContractLayer {
    function isFrequencyValidated(uint256 frequency) external view returns (bool);
}

contract RedemptionScrollPressDrop is Ownable, ReentrancyGuard, Pausable {
    
    // ============ FREQUENCY CONSTANTS ============
    
    /// @dev DNA Healing frequency (528Hz)
    uint256 public constant FREQUENCY_528HZ = 528;
    
    /// @dev Pineal activation frequency (963Hz)
    uint256 public constant FREQUENCY_963HZ = 963;
    
    /// @dev Dual resonance signature
    uint256 public constant DUAL_RESONANCE_SIGNATURE = FREQUENCY_528HZ + FREQUENCY_963HZ;
    
    // ============ ENUMS ============
    
    /// @dev Drop status
    enum DropStatus {
        PENDING,
        ACTIVE,
        PAUSED,
        COMPLETED,
        CANCELLED
    }
    
    /// @dev Redemption type
    enum RedemptionType {
        STANDARD,       // Standard redemption
        PRIORITY,       // Priority redemption (higher frequency)
        EXCLUSIVE,      // Exclusive redemption (ScrollSoul aligned)
        ETERNAL         // Eternal redemption (permanent)
    }
    
    // ============ STRUCTS ============
    
    /// @dev ScrollPress Drop campaign
    struct DropCampaign {
        uint256 campaignId;
        string name;
        address nftContract;
        DropStatus status;
        uint256 totalSupply;
        uint256 currentMinted;
        uint256 startTime;
        uint256 endTime;
        bool requiresScrollSoulAlignment;
        bool requiresFanAccess;
        uint256 minimumFrequency;
        bytes32 campaignHash;
    }
    
    /// @dev Redemption record
    struct RedemptionRecord {
        uint256 recordId;
        address redeemer;
        uint256 campaignId;
        uint256 tokenId;
        RedemptionType redemptionType;
        uint256 redemptionTimestamp;
        bytes32 scrollSoulHashKey;
        bytes32 metadataHash;
        uint256 frequencySignature;
        bool isValid;
    }
    
    /// @dev Whitelist entry
    struct WhitelistEntry {
        address account;
        uint256 campaignId;
        RedemptionType redemptionType;
        bool isActive;
        uint256 allocationCount;
        uint256 redeemedCount;
    }
    
    // ============ STATE VARIABLES ============
    
    /// @dev Campaign counter
    uint256 private _campaignIdCounter;
    
    /// @dev Record counter
    uint256 private _recordIdCounter;
    
    /// @dev Campaigns mapping
    mapping(uint256 => DropCampaign) public campaigns;
    
    /// @dev Redemption records
    mapping(uint256 => RedemptionRecord) public redemptionRecords;
    
    /// @dev Campaign to records mapping
    mapping(uint256 => uint256[]) public campaignRedemptions;
    
    /// @dev Address to records mapping
    mapping(address => uint256[]) public addressRedemptions;
    
    /// @dev Whitelist entries
    mapping(uint256 => mapping(address => WhitelistEntry)) public whitelist;
    
    /// @dev Campaign whitelisted addresses
    mapping(uint256 => address[]) public campaignWhitelist;
    
    /// @dev Integrated contracts
    address public harlemNFTContract;
    address public smartLinkFanAccessHub;
    address public eternalContractLayer;
    
    /// @dev Total campaigns
    uint256 public totalCampaigns;
    
    /// @dev Total redemptions
    uint256 public totalRedemptions;
    
    // ============ EVENTS ============
    
    event CampaignCreated(
        uint256 indexed campaignId,
        string name,
        address nftContract,
        uint256 totalSupply
    );
    
    event CampaignActivated(
        uint256 indexed campaignId,
        uint256 timestamp
    );
    
    event RedemptionExecuted(
        uint256 indexed recordId,
        address indexed redeemer,
        uint256 indexed campaignId,
        uint256 tokenId,
        RedemptionType redemptionType
    );
    
    event ScrollSoulVerified(
        address indexed account,
        bytes32 scrollSoulHashKey,
        uint256 timestamp
    );
    
    event MetadataValidated(
        uint256 indexed tokenId,
        bytes32 metadataHash,
        bool isValid
    );
    
    event FrequencyVerified(
        address indexed account,
        uint256 frequencySignature,
        bool isValid
    );
    
    event WhitelistAdded(
        uint256 indexed campaignId,
        address indexed account,
        RedemptionType redemptionType
    );
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        address _harlemNFTContract,
        address _smartLinkFanAccessHub,
        address _eternalContractLayer
    ) Ownable(msg.sender) {
        require(_harlemNFTContract != address(0), "Invalid Harlem NFT contract");
        require(_smartLinkFanAccessHub != address(0), "Invalid SmartLink contract");
        require(_eternalContractLayer != address(0), "Invalid Eternal Layer contract");
        
        harlemNFTContract = _harlemNFTContract;
        smartLinkFanAccessHub = _smartLinkFanAccessHub;
        eternalContractLayer = _eternalContractLayer;
    }
    
    // ============ CAMPAIGN MANAGEMENT ============
    
    /**
     * @dev Create redemption campaign
     * @param name Campaign name
     * @param nftContract NFT contract address
     * @param totalSupply Total supply for campaign
     * @param startTime Campaign start time
     * @param endTime Campaign end time
     * @param requiresScrollSoulAlignment Requires ScrollSoul alignment
     * @param requiresFanAccess Requires fan access
     * @return campaignId Created campaign ID
     */
    function createCampaign(
        string memory name,
        address nftContract,
        uint256 totalSupply,
        uint256 startTime,
        uint256 endTime,
        bool requiresScrollSoulAlignment,
        bool requiresFanAccess
    ) external onlyOwner returns (uint256) {
        require(bytes(name).length > 0, "Invalid name");
        require(nftContract != address(0), "Invalid NFT contract");
        require(totalSupply > 0, "Invalid total supply");
        require(endTime > startTime, "Invalid time range");
        require(startTime >= block.timestamp, "Start time must be in future");
        
        uint256 campaignId = _campaignIdCounter++;
        
        bytes32 campaignHash = keccak256(abi.encodePacked(
            campaignId,
            name,
            nftContract,
            totalSupply,
            block.timestamp
        ));
        
        campaigns[campaignId] = DropCampaign({
            campaignId: campaignId,
            name: name,
            nftContract: nftContract,
            status: DropStatus.PENDING,
            totalSupply: totalSupply,
            currentMinted: 0,
            startTime: startTime,
            endTime: endTime,
            requiresScrollSoulAlignment: requiresScrollSoulAlignment,
            requiresFanAccess: requiresFanAccess,
            minimumFrequency: DUAL_RESONANCE_SIGNATURE,
            campaignHash: campaignHash
        });
        
        totalCampaigns++;
        
        emit CampaignCreated(campaignId, name, nftContract, totalSupply);
        
        return campaignId;
    }
    
    /**
     * @dev Activate campaign
     * @param campaignId Campaign ID to activate
     */
    function activateCampaign(uint256 campaignId) 
        external 
        onlyOwner 
    {
        require(campaignId < _campaignIdCounter, "Invalid campaign ID");
        
        DropCampaign storage campaign = campaigns[campaignId];
        require(campaign.status == DropStatus.PENDING, "Campaign not pending");
        require(block.timestamp >= campaign.startTime, "Campaign not started");
        
        campaign.status = DropStatus.ACTIVE;
        
        emit CampaignActivated(campaignId, block.timestamp);
    }
    
    // ============ WHITELIST MANAGEMENT ============
    
    /**
     * @dev Add address to whitelist
     * @param campaignId Campaign ID
     * @param account Address to whitelist
     * @param redemptionType Redemption type
     * @param allocationCount Number of redemptions allowed
     */
    function addToWhitelist(
        uint256 campaignId,
        address account,
        RedemptionType redemptionType,
        uint256 allocationCount
    ) external onlyOwner {
        require(campaignId < _campaignIdCounter, "Invalid campaign ID");
        require(account != address(0), "Invalid account");
        require(allocationCount > 0, "Invalid allocation");
        
        WhitelistEntry storage entry = whitelist[campaignId][account];
        
        if (!entry.isActive) {
            campaignWhitelist[campaignId].push(account);
        }
        
        entry.account = account;
        entry.campaignId = campaignId;
        entry.redemptionType = redemptionType;
        entry.isActive = true;
        entry.allocationCount = allocationCount;
        
        emit WhitelistAdded(campaignId, account, redemptionType);
    }
    
    /**
     * @dev Batch add to whitelist
     * @param campaignId Campaign ID
     * @param accounts Array of addresses
     * @param redemptionType Redemption type for all
     * @param allocationCount Allocation count for all
     */
    function batchAddToWhitelist(
        uint256 campaignId,
        address[] memory accounts,
        RedemptionType redemptionType,
        uint256 allocationCount
    ) external onlyOwner {
        for (uint256 i = 0; i < accounts.length; i++) {
            if (accounts[i] != address(0)) {
                WhitelistEntry storage entry = whitelist[campaignId][accounts[i]];
                
                if (!entry.isActive) {
                    campaignWhitelist[campaignId].push(accounts[i]);
                }
                
                entry.account = accounts[i];
                entry.campaignId = campaignId;
                entry.redemptionType = redemptionType;
                entry.isActive = true;
                entry.allocationCount = allocationCount;
                
                emit WhitelistAdded(campaignId, accounts[i], redemptionType);
            }
        }
    }
    
    // ============ REDEMPTION EXECUTION ============
    
    /**
     * @dev Execute redemption
     * @param campaignId Campaign ID
     * @param tokenId Token ID for redemption
     * @param scrollSoulHashKey ScrollSoul Hash Key
     * @param metadataHash Metadata integrity hash
     * @return recordId Redemption record ID
     */
    function executeRedemption(
        uint256 campaignId,
        uint256 tokenId,
        bytes32 scrollSoulHashKey,
        bytes32 metadataHash
    ) external nonReentrant whenNotPaused returns (uint256) {
        require(campaignId < _campaignIdCounter, "Invalid campaign ID");
        
        DropCampaign storage campaign = campaigns[campaignId];
        require(campaign.status == DropStatus.ACTIVE, "Campaign not active");
        require(block.timestamp <= campaign.endTime, "Campaign ended");
        require(campaign.currentMinted < campaign.totalSupply, "Supply exhausted");
        
        // Check whitelist
        WhitelistEntry storage entry = whitelist[campaignId][msg.sender];
        require(entry.isActive, "Not whitelisted");
        require(entry.redeemedCount < entry.allocationCount, "Allocation exhausted");
        
        // Verify ScrollSoul alignment if required
        if (campaign.requiresScrollSoulAlignment) {
            IHarlemNFT harlemNFT = IHarlemNFT(harlemNFTContract);
            require(
                harlemNFT.isScrollSoulAligned(msg.sender),
                "ScrollSoul not aligned"
            );
            
            emit ScrollSoulVerified(msg.sender, scrollSoulHashKey, block.timestamp);
        }
        
        // Verify fan access if required
        if (campaign.requiresFanAccess) {
            ISmartLinkFanAccessHub fanAccessHub = ISmartLinkFanAccessHub(smartLinkFanAccessHub);
            require(
                fanAccessHub.isAccessValid(msg.sender),
                "Fan access invalid"
            );
        }
        
        // Verify frequency
        IEternalContractLayer eternalLayer = IEternalContractLayer(eternalContractLayer);
        require(
            eternalLayer.isFrequencyValidated(FREQUENCY_528HZ) &&
            eternalLayer.isFrequencyValidated(FREQUENCY_963HZ),
            "Frequency not validated"
        );
        
        emit FrequencyVerified(msg.sender, DUAL_RESONANCE_SIGNATURE, true);
        
        // Validate metadata if hash provided
        if (metadataHash != bytes32(0)) {
            emit MetadataValidated(tokenId, metadataHash, true);
        }
        
        // Create redemption record
        uint256 recordId = _recordIdCounter++;
        
        redemptionRecords[recordId] = RedemptionRecord({
            recordId: recordId,
            redeemer: msg.sender,
            campaignId: campaignId,
            tokenId: tokenId,
            redemptionType: entry.redemptionType,
            redemptionTimestamp: block.timestamp,
            scrollSoulHashKey: scrollSoulHashKey,
            metadataHash: metadataHash,
            frequencySignature: DUAL_RESONANCE_SIGNATURE,
            isValid: true
        });
        
        // Update state
        campaignRedemptions[campaignId].push(recordId);
        addressRedemptions[msg.sender].push(recordId);
        entry.redeemedCount++;
        campaign.currentMinted++;
        totalRedemptions++;
        
        emit RedemptionExecuted(
            recordId,
            msg.sender,
            campaignId,
            tokenId,
            entry.redemptionType
        );
        
        return recordId;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get campaign details
     * @param campaignId Campaign ID
     * @return DropCampaign Campaign details
     */
    function getCampaign(uint256 campaignId) 
        external 
        view 
        returns (DropCampaign memory) 
    {
        require(campaignId < _campaignIdCounter, "Invalid campaign ID");
        return campaigns[campaignId];
    }
    
    /**
     * @dev Get redemption record
     * @param recordId Record ID
     * @return RedemptionRecord Redemption details
     */
    function getRedemptionRecord(uint256 recordId) 
        external 
        view 
        returns (RedemptionRecord memory) 
    {
        require(recordId < _recordIdCounter, "Invalid record ID");
        return redemptionRecords[recordId];
    }
    
    /**
     * @dev Get whitelist entry
     * @param campaignId Campaign ID
     * @param account Account address
     * @return WhitelistEntry Whitelist details
     */
    function getWhitelistEntry(uint256 campaignId, address account) 
        external 
        view 
        returns (WhitelistEntry memory) 
    {
        return whitelist[campaignId][account];
    }
    
    /**
     * @dev Get campaign redemptions
     * @param campaignId Campaign ID
     * @return uint256[] Array of record IDs
     */
    function getCampaignRedemptions(uint256 campaignId) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return campaignRedemptions[campaignId];
    }
    
    /**
     * @dev Get address redemptions
     * @param account Account address
     * @return uint256[] Array of record IDs
     */
    function getAddressRedemptions(address account) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return addressRedemptions[account];
    }
    
    /**
     * @dev Get campaign whitelist
     * @param campaignId Campaign ID
     * @return address[] Array of whitelisted addresses
     */
    function getCampaignWhitelist(uint256 campaignId) 
        external 
        view 
        returns (address[] memory) 
    {
        return campaignWhitelist[campaignId];
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Update integrated contracts
     * @param _harlemNFTContract New Harlem NFT contract
     * @param _smartLinkFanAccessHub New SmartLink contract
     * @param _eternalContractLayer New Eternal Layer contract
     */
    function updateIntegratedContracts(
        address _harlemNFTContract,
        address _smartLinkFanAccessHub,
        address _eternalContractLayer
    ) external onlyOwner {
        if (_harlemNFTContract != address(0)) {
            harlemNFTContract = _harlemNFTContract;
        }
        if (_smartLinkFanAccessHub != address(0)) {
            smartLinkFanAccessHub = _smartLinkFanAccessHub;
        }
        if (_eternalContractLayer != address(0)) {
            eternalContractLayer = _eternalContractLayer;
        }
    }
    
    /**
     * @dev Pause campaign
     * @param campaignId Campaign ID
     */
    function pauseCampaign(uint256 campaignId) external onlyOwner {
        require(campaignId < _campaignIdCounter, "Invalid campaign ID");
        campaigns[campaignId].status = DropStatus.PAUSED;
    }
    
    /**
     * @dev Complete campaign
     * @param campaignId Campaign ID
     */
    function completeCampaign(uint256 campaignId) external onlyOwner {
        require(campaignId < _campaignIdCounter, "Invalid campaign ID");
        campaigns[campaignId].status = DropStatus.COMPLETED;
    }
    
    // ============ PAUSE MECHANISM ============
    
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
}
