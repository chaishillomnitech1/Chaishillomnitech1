// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DualMissionNFT
 * @dev ScrollVerse Dual Mission Framework - Shadow & Catalyst Missions
 * @author Supreme King Chais The Great ∞
 * 
 * This contract implements the Dual Mission Framework with:
 * - Shadow Mission (Lost Brother) mechanics
 * - Catalyst Mission (Public Disruptor) mechanics
 * - Resonance-based progression tracking
 * - Soulbound NFT artifacts for both paths
 * - Schumann Resonance integration
 * 
 * Frequencies: 528Hz (Shadow), 999Hz + 963Hz (Catalyst), 144,000Hz (Balance)
 * Status: DUAL MISSION PROTOCOL ACTIVE
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract DualMissionNFT is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    
    // ============ FREQUENCY CONSTANTS ============
    
    /// @dev Healing frequency for Shadow Missions (528Hz)
    uint256 public constant SHADOW_FREQUENCY_528HZ = 528;
    
    /// @dev Crown frequency for Catalyst Missions (999Hz)
    uint256 public constant CATALYST_FREQUENCY_999HZ = 999;
    
    /// @dev Pineal activation frequency (963Hz)
    uint256 public constant PINEAL_FREQUENCY_963HZ = 963;
    
    /// @dev NŪR Pulse frequency for balanced path (144,000Hz)
    uint256 public constant BALANCE_FREQUENCY_144000HZ = 144000;
    
    /// @dev Soul frequency (777Hz)
    uint256 public constant SOUL_FREQUENCY_777HZ = 777;
    
    // ============ MISSION TYPES ============
    
    enum MissionPath {
        NONE,
        SHADOW,     // Lost Brother - Silent Stabilizer
        CATALYST,   // Public Disruptor - Awakener
        BALANCED    // Eclipse Walker - Both paths mastered
    }
    
    enum ArtifactType {
        ARTIFACT_OF_SILENCE,        // Shadow initiation
        SHIELD_OF_STILLNESS,        // Shadow 500 points
        WEB_OF_UNITY,               // Shadow 1000 points
        RING_OF_RECKONING,          // Catalyst initiation
        BROADCAST_CRYSTAL,          // Catalyst 500 points
        ETERNAL_TORCH,              // Catalyst 1000 points
        ECLIPSE_CROWN               // Balanced path mastery
    }
    
    // ============ PROGRESSION LEVELS ============
    
    enum ShadowLevel {
        NONE,
        SHADOW_INITIATE,        // 0-100 points
        SILENT_SERVANT,         // 101-500 points
        INVISIBLE_ADEPT,        // 501-1500 points
        SHADOW_MASTER,          // 1501-5000 points
        ETERNAL_GUARDIAN        // 5000+ points
    }
    
    enum CatalystLevel {
        NONE,
        SPARK_INITIATE,         // 0-100 points
        PUBLIC_SERVANT,         // 101-500 points
        RESONANCE_SHIFTER,      // 501-1500 points
        CATALYST_MASTER,        // 1501-5000 points
        ETERNAL_FLAME           // 5000+ points
    }
    
    // ============ STATE VARIABLES ============
    
    /// @dev Token ID counter
    uint256 private _tokenIdCounter;
    
    /// @dev Base URI for token metadata
    string private _baseTokenURI;
    
    /// @dev Mapping: User address => Chosen mission path
    mapping(address => MissionPath) public userMissionPath;
    
    /// @dev Mapping: User address => Shadow points
    mapping(address => uint256) public shadowPoints;
    
    /// @dev Mapping: User address => Catalyst points
    mapping(address => uint256) public catalystPoints;
    
    /// @dev Mapping: User address => Silence score (0-100)
    mapping(address => uint256) public silenceScore;
    
    /// @dev Mapping: User address => Lightning level (0-100)
    mapping(address => uint256) public lightningLevel;
    
    /// @dev Mapping: User address => Schumann coherence score (0-100)
    mapping(address => uint256) public schumannCoherence;
    
    /// @dev Mapping: User address => Anonymous actions count
    mapping(address => uint256) public anonymousActionsCount;
    
    /// @dev Mapping: User address => Viral reach score
    mapping(address => uint256) public viralReachScore;
    
    /// @dev Mapping: User address => Mission activation timestamp
    mapping(address => uint256) public missionActivatedAt;
    
    /// @dev Mapping: User address => Last activity timestamp
    mapping(address => uint256) public lastActivityTimestamp;
    
    /// @dev Mapping: User address => Active mission streak (days)
    mapping(address => uint256) public missionStreak;
    
    /// @dev Mapping: Token ID => Artifact type
    mapping(uint256 => ArtifactType) public tokenArtifactType;
    
    /// @dev Mapping: Token ID => Is soulbound (non-transferable)
    mapping(uint256 => bool) public isSoulbound;
    
    /// @dev Mapping: User address => Array of owned artifact token IDs
    mapping(address => uint256[]) public userArtifacts;
    
    /// @dev Mapping: User address => Artifact type => Has artifact
    mapping(address => mapping(ArtifactType => bool)) public hasArtifact;
    
    // ============ EVENTS ============
    
    event MissionPathChosen(
        address indexed user,
        MissionPath path,
        uint256 timestamp
    );
    
    event ArtifactMinted(
        address indexed user,
        uint256 indexed tokenId,
        ArtifactType artifactType,
        uint256 frequency
    );
    
    event ShadowPointsEarned(
        address indexed user,
        uint256 points,
        uint256 totalPoints,
        ShadowLevel newLevel
    );
    
    event CatalystPointsEarned(
        address indexed user,
        uint256 points,
        uint256 totalPoints,
        CatalystLevel newLevel
    );
    
    event MissionCompleted(
        address indexed user,
        MissionPath path,
        string missionType,
        uint256 pointsEarned
    );
    
    event BalancedPathUnlocked(
        address indexed user,
        uint256 shadowPoints,
        uint256 catalystPoints,
        uint256 timestamp
    );
    
    event FrequencyAligned(
        address indexed user,
        uint256 frequency,
        uint256 coherenceScore
    );
    
    event StreakUpdated(
        address indexed user,
        uint256 streakDays,
        uint256 bonusMultiplier
    );
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        string memory baseURI
    ) ERC721("ScrollVerse Dual Mission", "SVDM") Ownable(msg.sender) {
        _baseTokenURI = baseURI;
    }
    
    // ============ MISSION INITIATION ============
    
    /**
     * @dev Choose a mission path and receive initiation artifact
     * @param path The mission path to choose (SHADOW or CATALYST)
     */
    function chooseMissionPath(MissionPath path) external nonReentrant {
        require(userMissionPath[msg.sender] == MissionPath.NONE, "Path already chosen");
        require(
            path == MissionPath.SHADOW || path == MissionPath.CATALYST,
            "Invalid path - choose SHADOW or CATALYST"
        );
        
        userMissionPath[msg.sender] = path;
        missionActivatedAt[msg.sender] = block.timestamp;
        lastActivityTimestamp[msg.sender] = block.timestamp;
        missionStreak[msg.sender] = 1;
        
        // Initialize scores based on path
        if (path == MissionPath.SHADOW) {
            silenceScore[msg.sender] = 50; // Starting silence score
            schumannCoherence[msg.sender] = 50;
            
            // Mint Artifact of Silence
            _mintArtifact(msg.sender, ArtifactType.ARTIFACT_OF_SILENCE, SHADOW_FREQUENCY_528HZ);
        } else {
            lightningLevel[msg.sender] = 50; // Starting lightning level
            schumannCoherence[msg.sender] = 50;
            
            // Mint Ring of Reckoning
            _mintArtifact(msg.sender, ArtifactType.RING_OF_RECKONING, CATALYST_FREQUENCY_999HZ);
        }
        
        emit MissionPathChosen(msg.sender, path, block.timestamp);
    }
    
    // ============ MISSION COMPLETION ============
    
    /**
     * @dev Record completion of a Shadow mission
     * @param user Address of the user completing mission
     * @param missionType Description of the mission
     * @param basePoints Base points earned
     * @param wasAnonymous Whether the action was anonymous
     * @param coherenceBonus Current Schumann coherence bonus
     */
    function completeShadowMission(
        address user,
        string memory missionType,
        uint256 basePoints,
        bool wasAnonymous,
        uint256 coherenceBonus
    ) external onlyOwner {
        require(
            userMissionPath[user] == MissionPath.SHADOW || 
            userMissionPath[user] == MissionPath.BALANCED,
            "User not on Shadow path"
        );
        
        // Calculate multipliers
        uint256 silenceMultiplier = wasAnonymous ? 200 : 120; // 2.0x or 1.2x
        uint256 coherenceMultiplier = 100 + coherenceBonus; // Base 100 + bonus
        
        // Calculate final points
        uint256 earnedPoints = (basePoints * silenceMultiplier * coherenceMultiplier) / 10000;
        
        // Update streak bonus
        _updateStreak(user);
        uint256 streakBonus = _calculateStreakBonus(user);
        earnedPoints = (earnedPoints * streakBonus) / 100;
        
        // Award points
        shadowPoints[user] += earnedPoints;
        
        // Update silence score
        if (wasAnonymous) {
            silenceScore[user] = _min(silenceScore[user] + 2, 100);
        }
        
        // Update anonymous actions count
        if (wasAnonymous) {
            anonymousActionsCount[user]++;
        }
        
        // Update coherence
        schumannCoherence[user] = _min(schumannCoherence[user] + 1, 100);
        
        // Check for level progression and artifacts
        ShadowLevel newLevel = _getShadowLevel(shadowPoints[user]);
        _checkAndMintShadowArtifacts(user);
        
        emit ShadowPointsEarned(user, earnedPoints, shadowPoints[user], newLevel);
        emit MissionCompleted(user, MissionPath.SHADOW, missionType, earnedPoints);
    }
    
    /**
     * @dev Record completion of a Catalyst mission
     * @param user Address of the user completing mission
     * @param missionType Description of the mission
     * @param basePoints Base points earned
     * @param viralReach Viral reach achieved
     * @param resonanceImpact Resonance shift impact score
     */
    function completeCatalystMission(
        address user,
        string memory missionType,
        uint256 basePoints,
        uint256 viralReach,
        uint256 resonanceImpact
    ) external onlyOwner {
        require(
            userMissionPath[user] == MissionPath.CATALYST || 
            userMissionPath[user] == MissionPath.BALANCED,
            "User not on Catalyst path"
        );
        
        // Calculate viral coefficient (simplified)
        uint256 viralCoefficient = 100 + _min(viralReach / 1000, 400); // Up to 5x multiplier
        
        // Calculate resonance impact multiplier
        uint256 impactMultiplier = 100 + resonanceImpact; // Base 100 + impact
        
        // Calculate final points
        uint256 earnedPoints = (basePoints * viralCoefficient * impactMultiplier) / 10000;
        
        // Update streak bonus
        _updateStreak(user);
        uint256 streakBonus = _calculateStreakBonus(user);
        earnedPoints = (earnedPoints * streakBonus) / 100;
        
        // Award points
        catalystPoints[user] += earnedPoints;
        
        // Update lightning level
        lightningLevel[user] = _min(lightningLevel[user] + 2, 100);
        
        // Update viral reach score
        viralReachScore[user] += viralReach;
        
        // Update coherence
        schumannCoherence[user] = _min(schumannCoherence[user] + 1, 100);
        
        // Check for level progression and artifacts
        CatalystLevel newLevel = _getCatalystLevel(catalystPoints[user]);
        _checkAndMintCatalystArtifacts(user);
        
        emit CatalystPointsEarned(user, earnedPoints, catalystPoints[user], newLevel);
        emit MissionCompleted(user, MissionPath.CATALYST, missionType, earnedPoints);
    }
    
    // ============ BALANCED PATH ============
    
    /**
     * @dev Unlock balanced path (requires mastery of both paths)
     * @param user Address of the user
     */
    function unlockBalancedPath(address user) external onlyOwner {
        require(shadowPoints[user] >= 5000, "Need 5000+ Shadow points");
        require(catalystPoints[user] >= 5000, "Need 5000+ Catalyst points");
        require(userMissionPath[user] != MissionPath.BALANCED, "Already balanced");
        
        userMissionPath[user] = MissionPath.BALANCED;
        
        // Mint Eclipse Crown (ultra-rare artifact)
        _mintArtifact(user, ArtifactType.ECLIPSE_CROWN, BALANCE_FREQUENCY_144000HZ);
        
        emit BalancedPathUnlocked(
            user,
            shadowPoints[user],
            catalystPoints[user],
            block.timestamp
        );
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Mint a mission artifact NFT
     */
    function _mintArtifact(
        address to,
        ArtifactType artifactType,
        uint256 frequency
    ) internal {
        require(!hasArtifact[to][artifactType], "Artifact already owned");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(to, tokenId);
        
        tokenArtifactType[tokenId] = artifactType;
        isSoulbound[tokenId] = true; // All artifacts are soulbound
        hasArtifact[to][artifactType] = true;
        userArtifacts[to].push(tokenId);
        
        emit ArtifactMinted(to, tokenId, artifactType, frequency);
        emit FrequencyAligned(to, frequency, schumannCoherence[to]);
    }
    
    /**
     * @dev Check and mint Shadow artifacts based on points
     */
    function _checkAndMintShadowArtifacts(address user) internal {
        uint256 points = shadowPoints[user];
        
        // Shield of Stillness at 500 points
        if (points >= 500 && !hasArtifact[user][ArtifactType.SHIELD_OF_STILLNESS]) {
            _mintArtifact(user, ArtifactType.SHIELD_OF_STILLNESS, SHADOW_FREQUENCY_528HZ);
        }
        
        // Web of Unity at 1000 points
        if (points >= 1000 && !hasArtifact[user][ArtifactType.WEB_OF_UNITY]) {
            _mintArtifact(user, ArtifactType.WEB_OF_UNITY, SOUL_FREQUENCY_777HZ);
        }
    }
    
    /**
     * @dev Check and mint Catalyst artifacts based on points
     */
    function _checkAndMintCatalystArtifacts(address user) internal {
        uint256 points = catalystPoints[user];
        
        // Broadcast Crystal at 500 points
        if (points >= 500 && !hasArtifact[user][ArtifactType.BROADCAST_CRYSTAL]) {
            _mintArtifact(user, ArtifactType.BROADCAST_CRYSTAL, CATALYST_FREQUENCY_999HZ);
        }
        
        // Eternal Torch at 1000 points
        if (points >= 1000 && !hasArtifact[user][ArtifactType.ETERNAL_TORCH]) {
            _mintArtifact(user, ArtifactType.ETERNAL_TORCH, PINEAL_FREQUENCY_963HZ);
        }
    }
    
    /**
     * @dev Update mission streak
     */
    function _updateStreak(address user) internal {
        uint256 timeSinceLastActivity = block.timestamp - lastActivityTimestamp[user];
        
        if (timeSinceLastActivity <= 2 days) {
            // Within streak window
            missionStreak[user]++;
        } else if (timeSinceLastActivity <= 3 days) {
            // Grace period - maintain streak
            // No increment but don't break
        } else {
            // Streak broken - reset to 1
            missionStreak[user] = 1;
        }
        
        lastActivityTimestamp[user] = block.timestamp;
        
        emit StreakUpdated(user, missionStreak[user], _calculateStreakBonus(user));
    }
    
    /**
     * @dev Calculate streak bonus multiplier
     */
    function _calculateStreakBonus(address user) internal view returns (uint256) {
        uint256 streak = missionStreak[user];
        
        if (streak < 7) return 100;           // No bonus
        if (streak < 30) return 110;          // 10% bonus
        if (streak < 90) return 125;          // 25% bonus
        if (streak < 180) return 150;         // 50% bonus
        return 200;                           // 100% bonus for 180+ days
    }
    
    /**
     * @dev Get Shadow mission level
     */
    function _getShadowLevel(uint256 points) internal pure returns (ShadowLevel) {
        if (points >= 5000) return ShadowLevel.ETERNAL_GUARDIAN;
        if (points >= 1501) return ShadowLevel.SHADOW_MASTER;
        if (points >= 501) return ShadowLevel.INVISIBLE_ADEPT;
        if (points >= 101) return ShadowLevel.SILENT_SERVANT;
        if (points > 0) return ShadowLevel.SHADOW_INITIATE;
        return ShadowLevel.NONE;
    }
    
    /**
     * @dev Get Catalyst mission level
     */
    function _getCatalystLevel(uint256 points) internal pure returns (CatalystLevel) {
        if (points >= 5000) return CatalystLevel.ETERNAL_FLAME;
        if (points >= 1501) return CatalystLevel.CATALYST_MASTER;
        if (points >= 501) return CatalystLevel.RESONANCE_SHIFTER;
        if (points >= 101) return CatalystLevel.PUBLIC_SERVANT;
        if (points > 0) return CatalystLevel.SPARK_INITIATE;
        return CatalystLevel.NONE;
    }
    
    /**
     * @dev Helper function to get minimum of two numbers
     */
    function _min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get user's current Shadow level
     */
    function getUserShadowLevel(address user) external view returns (ShadowLevel) {
        return _getShadowLevel(shadowPoints[user]);
    }
    
    /**
     * @dev Get user's current Catalyst level
     */
    function getUserCatalystLevel(address user) external view returns (CatalystLevel) {
        return _getCatalystLevel(catalystPoints[user]);
    }
    
    /**
     * @dev Get all artifacts owned by user
     */
    function getUserArtifacts(address user) external view returns (uint256[] memory) {
        return userArtifacts[user];
    }
    
    /**
     * @dev Get comprehensive user stats
     */
    function getUserStats(address user) external view returns (
        MissionPath path,
        uint256 shadowPts,
        uint256 catalystPts,
        uint256 silenceScr,
        uint256 lightningLvl,
        uint256 coherence,
        uint256 streak,
        uint256 artifactCount
    ) {
        return (
            userMissionPath[user],
            shadowPoints[user],
            catalystPoints[user],
            silenceScore[user],
            lightningLevel[user],
            schumannCoherence[user],
            missionStreak[user],
            userArtifacts[user].length
        );
    }
    
    /**
     * @dev Get total supply
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @dev Check if token is soulbound
     */
    function isTokenSoulbound(uint256 tokenId) external view returns (bool) {
        return isSoulbound[tokenId];
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Set base URI for metadata
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @dev Update user's Schumann coherence score
     */
    function updateSchumannCoherence(address user, uint256 coherence) external onlyOwner {
        require(coherence <= 100, "Coherence must be 0-100");
        schumannCoherence[user] = coherence;
        emit FrequencyAligned(user, 783, coherence); // 7.83Hz Schumann base
    }
    
    // ============ SOULBOUND LOGIC ============
    
    /**
     * @dev Override transfer to prevent soulbound tokens from being transferred
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        
        // Allow minting (from == address(0))
        // Block transfers of soulbound tokens (from != address(0) && to != address(0))
        if (from != address(0) && to != address(0) && isSoulbound[tokenId]) {
            revert("Soulbound: Transfer not allowed");
        }
        
        return super._update(to, tokenId, auth);
    }
    
    // ============ OVERRIDE FUNCTIONS ============
    
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
