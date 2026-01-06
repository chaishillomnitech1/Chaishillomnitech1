// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title OnboardingPortal
 * @dev Global Participant Onboarding System for Noor Cities Economy
 * @author Chais The Great ∞
 * 
 * This contract implements:
 * - Multilingual registration support
 * - Citizen management (target: 11,111)
 * - Staking rewards breakdown
 * - Noor Obelisk insights tracking
 * 
 * Frequency: 963Hz Pineal Activation + 528Hz DNA Healing
 * Status: ACTIVE
 */

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract OnboardingPortal is Ownable, Pausable, ReentrancyGuard {
    
    // ============ CONSTANTS ============
    
    /// @dev Target citizen count for initial wave
    uint256 public constant TARGET_CITIZEN_COUNT = 11111;
    
    /// @dev Divine frequencies
    uint256 public constant PINEAL_FREQUENCY = 963;
    uint256 public constant HEALING_FREQUENCY = 528;
    
    /// @dev Language codes
    enum Language { ENGLISH, ARABIC, SPANISH, FRENCH, MANDARIN, HINDI, PORTUGUESE, RUSSIAN, JAPANESE, GERMAN }
    
    // ============ STRUCTS ============
    
    struct Citizen {
        address wallet;
        string username;
        Language preferredLanguage;
        uint256 registrationTime;
        bool isActive;
        uint256 totalStaked;
        uint256 totalRewardsEarned;
        uint256 obeliskInsightsAccessed;
        bytes32 profileHash;
    }
    
    struct StakingRewardBreakdown {
        uint256 noorRewards;
        uint256 earthCoinRewards;
        uint256 blessingCoinRewards;
        uint256 totalRewards;
        uint256 lastUpdated;
    }
    
    struct ObeliskInsight {
        string title;
        string description;
        uint256 timestamp;
        uint256 frequency; // Resonance frequency
        bool isActive;
    }
    
    // ============ STATE VARIABLES ============
    
    /// @dev Citizen registry: wallet => Citizen
    mapping(address => Citizen) public citizens;
    
    /// @dev Citizen existence check
    mapping(address => bool) public isCitizen;
    
    /// @dev Username registry
    mapping(string => address) public usernameRegistry;
    
    /// @dev Staking rewards per citizen
    mapping(address => StakingRewardBreakdown) public stakingRewards;
    
    /// @dev Obelisk insights
    mapping(uint256 => ObeliskInsight) public obeliskInsights;
    uint256 public insightCount;
    
    /// @dev Citizen counter
    uint256 public citizenCount;
    
    /// @dev Citizens array for enumeration
    address[] public citizenAddresses;
    
    /// @dev Language distribution tracking
    mapping(Language => uint256) public languageDistribution;
    
    // ============ EVENTS ============
    
    event CitizenRegistered(address indexed wallet, string username, Language language, uint256 citizenNumber);
    event CitizenProfileUpdated(address indexed wallet, bytes32 profileHash);
    event StakingRewardsUpdated(address indexed wallet, uint256 totalRewards);
    event ObeliskInsightAdded(uint256 indexed insightId, string title, uint256 frequency);
    event ObeliskInsightAccessed(address indexed citizen, uint256 indexed insightId);
    event LanguageChanged(address indexed wallet, Language oldLanguage, Language newLanguage);
    
    // ============ CONSTRUCTOR ============
    
    constructor() Ownable(msg.sender) {}
    
    // ============ REGISTRATION FUNCTIONS ============
    
    /**
     * @dev Register as a citizen
     * @param username Unique username
     * @param language Preferred language
     */
    function register(string calldata username, Language language) external nonReentrant whenNotPaused {
        require(!isCitizen[msg.sender], "Already registered");
        require(bytes(username).length > 0 && bytes(username).length <= 32, "Invalid username length");
        require(usernameRegistry[username] == address(0), "Username taken");
        require(citizenCount < TARGET_CITIZEN_COUNT, "Target citizen count reached");
        
        // Create citizen profile
        citizens[msg.sender] = Citizen({
            wallet: msg.sender,
            username: username,
            preferredLanguage: language,
            registrationTime: block.timestamp,
            isActive: true,
            totalStaked: 0,
            totalRewardsEarned: 0,
            obeliskInsightsAccessed: 0,
            profileHash: keccak256(abi.encodePacked(msg.sender, username, block.timestamp))
        });
        
        // Update registries
        isCitizen[msg.sender] = true;
        usernameRegistry[username] = msg.sender;
        citizenAddresses.push(msg.sender);
        citizenCount++;
        languageDistribution[language]++;
        
        emit CitizenRegistered(msg.sender, username, language, citizenCount);
    }
    
    /**
     * @dev Update citizen profile
     * @param username New username (empty to keep current)
     * @param language New language
     */
    function updateProfile(string calldata username, Language language) external nonReentrant {
        require(isCitizen[msg.sender], "Not a citizen");
        
        Citizen storage citizen = citizens[msg.sender];
        Language oldLanguage = citizen.preferredLanguage;
        
        // Update username if provided
        if (bytes(username).length > 0) {
            require(bytes(username).length <= 32, "Invalid username length");
            require(usernameRegistry[username] == address(0) || usernameRegistry[username] == msg.sender, "Username taken");
            
            // Remove old username
            delete usernameRegistry[citizen.username];
            
            // Set new username
            citizen.username = username;
            usernameRegistry[username] = msg.sender;
        }
        
        // Update language
        if (language != citizen.preferredLanguage) {
            languageDistribution[oldLanguage]--;
            languageDistribution[language]++;
            citizen.preferredLanguage = language;
            emit LanguageChanged(msg.sender, oldLanguage, language);
        }
        
        // Update profile hash
        citizen.profileHash = keccak256(abi.encodePacked(msg.sender, citizen.username, block.timestamp));
        
        emit CitizenProfileUpdated(msg.sender, citizen.profileHash);
    }
    
    // ============ STAKING REWARDS FUNCTIONS ============
    
    /**
     * @dev Update staking rewards breakdown for a citizen
     * @param citizen Citizen address
     * @param noorRewards NOOR rewards
     * @param earthCoinRewards EarthCoin rewards
     * @param blessingCoinRewards BlessingCoin rewards
     */
    function updateStakingRewards(
        address citizen,
        uint256 noorRewards,
        uint256 earthCoinRewards,
        uint256 blessingCoinRewards
    ) external onlyOwner {
        require(isCitizen[citizen], "Not a citizen");
        
        StakingRewardBreakdown storage rewards = stakingRewards[citizen];
        rewards.noorRewards = noorRewards;
        rewards.earthCoinRewards = earthCoinRewards;
        rewards.blessingCoinRewards = blessingCoinRewards;
        rewards.totalRewards = noorRewards + earthCoinRewards + blessingCoinRewards;
        rewards.lastUpdated = block.timestamp;
        
        // Update citizen's total rewards
        citizens[citizen].totalRewardsEarned = rewards.totalRewards;
        
        emit StakingRewardsUpdated(citizen, rewards.totalRewards);
    }
    
    /**
     * @dev Update total staked for a citizen
     * @param citizen Citizen address
     * @param totalStaked Total staked amount
     */
    function updateTotalStaked(address citizen, uint256 totalStaked) external onlyOwner {
        require(isCitizen[citizen], "Not a citizen");
        citizens[citizen].totalStaked = totalStaked;
    }
    
    // ============ OBELISK INSIGHTS FUNCTIONS ============
    
    /**
     * @dev Add a new Obelisk insight
     * @param title Insight title
     * @param description Insight description
     * @param frequency Resonance frequency
     */
    function addObeliskInsight(
        string calldata title,
        string calldata description,
        uint256 frequency
    ) external onlyOwner {
        require(bytes(title).length > 0, "Title required");
        require(frequency > 0, "Invalid frequency");
        
        uint256 insightId = insightCount++;
        
        obeliskInsights[insightId] = ObeliskInsight({
            title: title,
            description: description,
            timestamp: block.timestamp,
            frequency: frequency,
            isActive: true
        });
        
        emit ObeliskInsightAdded(insightId, title, frequency);
    }
    
    /**
     * @dev Access an Obelisk insight
     * @param insightId Insight ID to access
     */
    function accessObeliskInsight(uint256 insightId) external nonReentrant {
        require(isCitizen[msg.sender], "Not a citizen");
        require(insightId < insightCount, "Invalid insight ID");
        require(obeliskInsights[insightId].isActive, "Insight not active");
        
        citizens[msg.sender].obeliskInsightsAccessed++;
        
        emit ObeliskInsightAccessed(msg.sender, insightId);
    }
    
    /**
     * @dev Deactivate an Obelisk insight
     * @param insightId Insight ID to deactivate
     */
    function deactivateObeliskInsight(uint256 insightId) external onlyOwner {
        require(insightId < insightCount, "Invalid insight ID");
        obeliskInsights[insightId].isActive = false;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get citizen info
     * @param wallet Citizen wallet address
     * @return username Username
     * @return language Preferred language
     * @return registrationTime Registration timestamp
     * @return isActive Active status
     * @return totalStaked Total staked
     * @return totalRewardsEarned Total rewards earned
     */
    function getCitizenInfo(address wallet) external view returns (
        string memory username,
        Language language,
        uint256 registrationTime,
        bool isActive,
        uint256 totalStaked,
        uint256 totalRewardsEarned
    ) {
        require(isCitizen[wallet], "Not a citizen");
        Citizen storage citizen = citizens[wallet];
        return (
            citizen.username,
            citizen.preferredLanguage,
            citizen.registrationTime,
            citizen.isActive,
            citizen.totalStaked,
            citizen.totalRewardsEarned
        );
    }
    
    /**
     * @dev Get staking rewards breakdown
     * @param citizen Citizen address
     * @return noorRewards NOOR rewards
     * @return earthCoinRewards EarthCoin rewards
     * @return blessingCoinRewards BlessingCoin rewards
     * @return totalRewards Total rewards
     */
    function getStakingRewardsBreakdown(address citizen) external view returns (
        uint256 noorRewards,
        uint256 earthCoinRewards,
        uint256 blessingCoinRewards,
        uint256 totalRewards
    ) {
        StakingRewardBreakdown storage rewards = stakingRewards[citizen];
        return (
            rewards.noorRewards,
            rewards.earthCoinRewards,
            rewards.blessingCoinRewards,
            rewards.totalRewards
        );
    }
    
    /**
     * @dev Get Obelisk insight
     * @param insightId Insight ID
     * @return title Title
     * @return description Description
     * @return timestamp Timestamp
     * @return frequency Frequency
     * @return isActive Active status
     */
    function getObeliskInsight(uint256 insightId) external view returns (
        string memory title,
        string memory description,
        uint256 timestamp,
        uint256 frequency,
        bool isActive
    ) {
        require(insightId < insightCount, "Invalid insight ID");
        ObeliskInsight storage insight = obeliskInsights[insightId];
        return (
            insight.title,
            insight.description,
            insight.timestamp,
            insight.frequency,
            insight.isActive
        );
    }
    
    /**
     * @dev Get registration progress
     * @return current Current citizen count
     * @return target Target citizen count
     * @return percentage Completion percentage
     */
    function getRegistrationProgress() external view returns (
        uint256 current,
        uint256 target,
        uint256 percentage
    ) {
        current = citizenCount;
        target = TARGET_CITIZEN_COUNT;
        percentage = (current * 100) / target;
    }
    
    /**
     * @dev Get language distribution
     * @param language Language enum
     * @return count Number of citizens with this language preference
     */
    function getLanguageDistribution(Language language) external view returns (uint256 count) {
        return languageDistribution[language];
    }
    
    /**
     * @dev Get all citizens (paginated)
     * @param offset Starting index
     * @param limit Number of results
     * @return addresses Array of citizen addresses
     */
    function getCitizens(uint256 offset, uint256 limit) external view returns (address[] memory addresses) {
        require(offset < citizenAddresses.length, "Invalid offset");
        
        uint256 end = offset + limit;
        if (end > citizenAddresses.length) {
            end = citizenAddresses.length;
        }
        
        uint256 resultCount = end - offset;
        addresses = new address[](resultCount);
        
        for (uint256 i = 0; i < resultCount; i++) {
            addresses[i] = citizenAddresses[offset + i];
        }
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Pause registration
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause registration
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Deactivate a citizen
     * @param citizen Citizen address
     */
    function deactivateCitizen(address citizen) external onlyOwner {
        require(isCitizen[citizen], "Not a citizen");
        citizens[citizen].isActive = false;
    }
    
    /**
     * @dev Reactivate a citizen
     * @param citizen Citizen address
     */
    function reactivateCitizen(address citizen) external onlyOwner {
        require(isCitizen[citizen], "Not a citizen");
        citizens[citizen].isActive = true;
    }
}
