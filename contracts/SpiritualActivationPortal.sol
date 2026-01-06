// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SpiritualActivationPortal
 * @dev Central hub for NFT interaction and spiritual coin rewards
 * @author Supreme King Chais The Great ∞
 * 
 * This contract implements the Activation Portal with:
 * - Integration with Holy Bloodline NFT and spiritual coins
 * - Reflection and achievement logging system
 * - Automated reward distribution for task completion
 * - Alignment tracking and milestone management
 * - Proof of purpose fulfillment recording
 * 
 * Frequencies: 528Hz + 888Hz + 963Hz + 999Hz + 144,000Hz
 * Status: SPIRITUAL ACTIVATION PORTAL LIVE
 */

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IHolyBloodlineNFT {
    function ownerOf(uint256 tokenId) external view returns (address);
    function isActivated(uint256 tokenId) external view returns (bool);
    function activateNFT(uint256 tokenId) external;
    function alignmentLevel(uint256 tokenId) external view returns (uint256);
}

interface ISpiritualCoin {
    function rewardJournaling(address user, uint256 entries) external;
    function rewardMeditation(address user, uint256 sessions) external;
    function rewardAlignment(address user, uint256 level) external;
    function rewardNFTActivation(address user) external;
    function rewardHeartMeditation(address user, uint256 sessions) external;
    function rewardCompassion(address user, uint256 actions) external;
    function rewardUnity(address user, uint256 practices) external;
    function rewardForgiveness(address user, uint256 level) external;
    function rewardAffirmation(address user, uint256 count) external;
    function rewardWealthMilestone(address user, uint256 level) external;
    function rewardGenerosity(address user, uint256 acts) external;
    function rewardProsperityPractice(address user, uint256 practices) external;
}

contract SpiritualActivationPortal is Ownable, ReentrancyGuard {
    
    // ============ STATE VARIABLES ============
    
    /// @dev Holy Bloodline NFT contract
    address public holyBloodlineNFT;
    
    /// @dev Truth Coin contract
    address public truthCoin;
    
    /// @dev Prosperity Coin contract
    address public prosperityCoin;
    
    /// @dev Love Coin contract
    address public loveCoin;
    
    /// @dev Mapping: User => Reflection Count
    mapping(address => uint256) public reflectionCount;
    
    /// @dev Mapping: User => Achievement Count
    mapping(address => uint256) public achievementCount;
    
    /// @dev Mapping: User => Total Alignment Score
    mapping(address => uint256) public alignmentScore;
    
    /// @dev Mapping: User => Reflection Entries
    mapping(address => string[]) public userReflections;
    
    /// @dev Mapping: User => Achievement Records
    mapping(address => Achievement[]) public userAchievements;
    
    /// @dev Mapping: User => Last Activity Timestamp
    mapping(address => uint256) public lastActivity;
    
    /// @dev Mapping: User => Portal Access Status
    mapping(address => bool) public hasPortalAccess;
    
    /// @dev Structure for Achievement
    struct Achievement {
        string description;
        string category; // TRUTH, PROSPERITY, LOVE, ALIGNMENT
        uint256 timestamp;
        uint256 alignmentPoints;
    }
    
    // ============ EVENTS ============
    
    event PortalActivated(address indexed user, uint256 timestamp);
    event ReflectionLogged(address indexed user, string reflection, uint256 timestamp);
    event AchievementRecorded(address indexed user, string description, string category, uint256 alignmentPoints);
    event AlignmentScoreUpdated(address indexed user, uint256 oldScore, uint256 newScore);
    event NFTActivatedViaPortal(address indexed user, uint256 indexed tokenId);
    event RewardsDistributed(address indexed user, string rewardType, uint256 amount);
    event ContractsUpdated(address indexed updater, string contractType);
    
    // ============ ERRORS ============
    
    error InvalidAddress();
    error NotNFTHolder();
    error PortalNotActivated();
    error InvalidReflection();
    error InvalidAchievement();
    
    // ============ CONSTRUCTOR ============
    
    constructor() Ownable(msg.sender) {}
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Set Holy Bloodline NFT contract address
     */
    function setHolyBloodlineNFT(address _nftContract) external onlyOwner {
        if (_nftContract == address(0)) revert InvalidAddress();
        holyBloodlineNFT = _nftContract;
        emit ContractsUpdated(msg.sender, "HOLY_BLOODLINE_NFT");
    }
    
    /**
     * @dev Set Truth Coin contract address
     */
    function setTruthCoin(address _coinContract) external onlyOwner {
        if (_coinContract == address(0)) revert InvalidAddress();
        truthCoin = _coinContract;
        emit ContractsUpdated(msg.sender, "TRUTH_COIN");
    }
    
    /**
     * @dev Set Prosperity Coin contract address
     */
    function setProsperityCoin(address _coinContract) external onlyOwner {
        if (_coinContract == address(0)) revert InvalidAddress();
        prosperityCoin = _coinContract;
        emit ContractsUpdated(msg.sender, "PROSPERITY_COIN");
    }
    
    /**
     * @dev Set Love Coin contract address
     */
    function setLoveCoin(address _coinContract) external onlyOwner {
        if (_coinContract == address(0)) revert InvalidAddress();
        loveCoin = _coinContract;
        emit ContractsUpdated(msg.sender, "LOVE_COIN");
    }
    
    /**
     * @dev Grant portal access to user
     */
    function grantPortalAccess(address user) external onlyOwner {
        hasPortalAccess[user] = true;
    }
    
    /**
     * @dev Revoke portal access from user
     */
    function revokePortalAccess(address user) external onlyOwner {
        hasPortalAccess[user] = false;
    }
    
    // ============ PORTAL ACTIVATION ============
    
    /**
     * @dev Activate portal access for user
     */
    function activatePortal() external nonReentrant {
        hasPortalAccess[msg.sender] = true;
        lastActivity[msg.sender] = block.timestamp;
        
        emit PortalActivated(msg.sender, block.timestamp);
    }
    
    // ============ REFLECTION FUNCTIONS ============
    
    /**
     * @dev Log a reflection entry
     * @param reflection Reflection text
     */
    function logReflection(string memory reflection) external nonReentrant {
        if (!hasPortalAccess[msg.sender]) revert PortalNotActivated();
        if (bytes(reflection).length == 0) revert InvalidReflection();
        
        userReflections[msg.sender].push(reflection);
        reflectionCount[msg.sender]++;
        lastActivity[msg.sender] = block.timestamp;
        
        // Reward with Truth Coins for journaling
        if (truthCoin != address(0)) {
            ISpiritualCoin(truthCoin).rewardJournaling(msg.sender, 1);
            emit RewardsDistributed(msg.sender, "TRUTH_JOURNALING", 1);
        }
        
        emit ReflectionLogged(msg.sender, reflection, block.timestamp);
    }
    
    /**
     * @dev Log multiple reflection entries
     */
    function logMultipleReflections(string[] memory reflections) external nonReentrant {
        if (!hasPortalAccess[msg.sender]) revert PortalNotActivated();
        
        for (uint256 i = 0; i < reflections.length; i++) {
            if (bytes(reflections[i]).length > 0) {
                userReflections[msg.sender].push(reflections[i]);
                reflectionCount[msg.sender]++;
            }
        }
        
        lastActivity[msg.sender] = block.timestamp;
        
        // Reward with Truth Coins for batch journaling
        if (truthCoin != address(0) && reflections.length > 0) {
            ISpiritualCoin(truthCoin).rewardJournaling(msg.sender, reflections.length);
            emit RewardsDistributed(msg.sender, "TRUTH_JOURNALING", reflections.length);
        }
    }
    
    // ============ ACHIEVEMENT FUNCTIONS ============
    
    /**
     * @dev Record an achievement
     * @param description Achievement description
     * @param category Achievement category (TRUTH, PROSPERITY, LOVE, ALIGNMENT)
     * @param alignmentPoints Points awarded for alignment
     */
    function recordAchievement(
        string memory description,
        string memory category,
        uint256 alignmentPoints
    ) external nonReentrant {
        if (!hasPortalAccess[msg.sender]) revert PortalNotActivated();
        if (bytes(description).length == 0) revert InvalidAchievement();
        
        Achievement memory newAchievement = Achievement({
            description: description,
            category: category,
            timestamp: block.timestamp,
            alignmentPoints: alignmentPoints
        });
        
        userAchievements[msg.sender].push(newAchievement);
        achievementCount[msg.sender]++;
        
        uint256 oldScore = alignmentScore[msg.sender];
        alignmentScore[msg.sender] += alignmentPoints;
        lastActivity[msg.sender] = block.timestamp;
        
        // Distribute rewards based on category
        _distributeAchievementReward(category, alignmentPoints);
        
        emit AchievementRecorded(msg.sender, description, category, alignmentPoints);
        emit AlignmentScoreUpdated(msg.sender, oldScore, alignmentScore[msg.sender]);
    }
    
    /**
     * @dev Internal function to distribute achievement rewards
     */
    function _distributeAchievementReward(string memory category, uint256 points) private {
        bytes32 categoryHash = keccak256(bytes(category));
        
        if (categoryHash == keccak256(bytes("TRUTH")) && truthCoin != address(0)) {
            ISpiritualCoin(truthCoin).rewardAlignment(msg.sender, points / 10);
            emit RewardsDistributed(msg.sender, "TRUTH_ALIGNMENT", points);
        } else if (categoryHash == keccak256(bytes("PROSPERITY")) && prosperityCoin != address(0)) {
            ISpiritualCoin(prosperityCoin).rewardWealthMilestone(msg.sender, points / 100);
            emit RewardsDistributed(msg.sender, "PROSPERITY_MILESTONE", points);
        } else if (categoryHash == keccak256(bytes("LOVE")) && loveCoin != address(0)) {
            ISpiritualCoin(loveCoin).rewardForgiveness(msg.sender, points / 50);
            emit RewardsDistributed(msg.sender, "LOVE_FORGIVENESS", points);
        }
    }
    
    // ============ MEDITATION FUNCTIONS ============
    
    /**
     * @dev Record meditation session
     * @param meditationType Type of meditation (HEART, TRUTH, GENERAL)
     * @param sessionCount Number of sessions completed
     */
    function recordMeditation(string memory meditationType, uint256 sessionCount) external nonReentrant {
        if (!hasPortalAccess[msg.sender]) revert PortalNotActivated();
        
        lastActivity[msg.sender] = block.timestamp;
        
        bytes32 typeHash = keccak256(bytes(meditationType));
        
        if (typeHash == keccak256(bytes("HEART")) && loveCoin != address(0)) {
            ISpiritualCoin(loveCoin).rewardHeartMeditation(msg.sender, sessionCount);
            emit RewardsDistributed(msg.sender, "HEART_MEDITATION", sessionCount);
        } else if (typeHash == keccak256(bytes("TRUTH")) && truthCoin != address(0)) {
            ISpiritualCoin(truthCoin).rewardMeditation(msg.sender, sessionCount);
            emit RewardsDistributed(msg.sender, "TRUTH_MEDITATION", sessionCount);
        }
    }
    
    // ============ COMPASSION & UNITY FUNCTIONS ============
    
    /**
     * @dev Record compassion action
     * @param actions Number of compassion actions performed
     */
    function recordCompassion(uint256 actions) external nonReentrant {
        if (!hasPortalAccess[msg.sender]) revert PortalNotActivated();
        
        if (loveCoin != address(0)) {
            ISpiritualCoin(loveCoin).rewardCompassion(msg.sender, actions);
            emit RewardsDistributed(msg.sender, "COMPASSION", actions);
        }
        
        lastActivity[msg.sender] = block.timestamp;
    }
    
    /**
     * @dev Record unity practice
     * @param practices Number of unity practices completed
     */
    function recordUnity(uint256 practices) external nonReentrant {
        if (!hasPortalAccess[msg.sender]) revert PortalNotActivated();
        
        if (loveCoin != address(0)) {
            ISpiritualCoin(loveCoin).rewardUnity(msg.sender, practices);
            emit RewardsDistributed(msg.sender, "UNITY", practices);
        }
        
        lastActivity[msg.sender] = block.timestamp;
    }
    
    // ============ PROSPERITY FUNCTIONS ============
    
    /**
     * @dev Record prosperity affirmation
     * @param count Number of affirmations completed
     */
    function recordAffirmation(uint256 count) external nonReentrant {
        if (!hasPortalAccess[msg.sender]) revert PortalNotActivated();
        
        if (prosperityCoin != address(0)) {
            ISpiritualCoin(prosperityCoin).rewardAffirmation(msg.sender, count);
            emit RewardsDistributed(msg.sender, "AFFIRMATION", count);
        }
        
        lastActivity[msg.sender] = block.timestamp;
    }
    
    /**
     * @dev Record generosity action
     * @param acts Number of generosity acts performed
     */
    function recordGenerosity(uint256 acts) external nonReentrant {
        if (!hasPortalAccess[msg.sender]) revert PortalNotActivated();
        
        if (prosperityCoin != address(0)) {
            ISpiritualCoin(prosperityCoin).rewardGenerosity(msg.sender, acts);
            emit RewardsDistributed(msg.sender, "GENEROSITY", acts);
        }
        
        lastActivity[msg.sender] = block.timestamp;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get user reflection count
     */
    function getReflectionCount(address user) external view returns (uint256) {
        return reflectionCount[user];
    }
    
    /**
     * @dev Get user achievement count
     */
    function getAchievementCount(address user) external view returns (uint256) {
        return achievementCount[user];
    }
    
    /**
     * @dev Get user alignment score
     */
    function getAlignmentScore(address user) external view returns (uint256) {
        return alignmentScore[user];
    }
    
    /**
     * @dev Get user statistics
     */
    function getUserStats(address user) external view returns (
        uint256 reflections,
        uint256 achievements,
        uint256 alignment,
        uint256 lastActivityTime,
        bool portalAccess
    ) {
        return (
            reflectionCount[user],
            achievementCount[user],
            alignmentScore[user],
            lastActivity[user],
            hasPortalAccess[user]
        );
    }
    
    /**
     * @dev Get user reflections (paginated)
     */
    function getUserReflections(address user, uint256 offset, uint256 limit) 
        external 
        view 
        returns (string[] memory) 
    {
        uint256 total = userReflections[user].length;
        if (offset >= total) {
            return new string[](0);
        }
        
        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }
        
        uint256 resultLength = end - offset;
        string[] memory result = new string[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = userReflections[user][offset + i];
        }
        
        return result;
    }
    
    /**
     * @dev Get user achievements (paginated)
     */
    function getUserAchievements(address user, uint256 offset, uint256 limit) 
        external 
        view 
        returns (Achievement[] memory) 
    {
        uint256 total = userAchievements[user].length;
        if (offset >= total) {
            return new Achievement[](0);
        }
        
        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }
        
        uint256 resultLength = end - offset;
        Achievement[] memory result = new Achievement[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = userAchievements[user][offset + i];
        }
        
        return result;
    }
}
