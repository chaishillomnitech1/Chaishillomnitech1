// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ScrollVerseAcademy
 * @dev Academy learning modules with certification and achievements
 * @author Supreme King Chais The Great ∞
 * 
 * This contract implements the ScrollVerse Academy with:
 * - Learning module management and tracking
 * - Module completion certification
 * - Achievement and badge system
 * - Progress tracking per student
 * - Integration with HealthCoin rewards
 * - NFT certificates for completion
 * 
 * Total Modules: Unlimited expandable learning paths
 * Frequency: 999Hz (Crown Chakra Completion)
 * Status: ACADEMY LEARNING ACTIVATION PROTOCOL ACTIVE
 */

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IScrollVerseHealthCoin {
    function rewardAcademyModuleCompletion(address user, uint256 moduleId) external;
}

contract ScrollVerseAcademy is Ownable, ReentrancyGuard {
    
    // ============ FREQUENCY CONSTANTS ============
    
    /// @dev Crown chakra completion frequency (999Hz)
    uint256 public constant CROWN_COMPLETION_FREQUENCY_999HZ = 999;
    
    /// @dev Divine wisdom frequency (963Hz)
    uint256 public constant WISDOM_FREQUENCY_963HZ = 963;
    
    // ============ ENUMS ============
    
    enum ModuleDifficulty {
        BEGINNER,
        INTERMEDIATE,
        ADVANCED,
        EXPERT,
        MASTER
    }
    
    enum ModuleCategory {
        BLOCKCHAIN_FUNDAMENTALS,
        SMART_CONTRACTS,
        WEB3_DEVELOPMENT,
        DEFI_PROTOCOLS,
        NFT_CREATION,
        DAO_GOVERNANCE,
        CONSCIOUSNESS_TECH,
        HEALING_FREQUENCIES,
        SOVEREIGNTY_PRINCIPLES,
        QUANTUM_INTEGRATION
    }
    
    enum AchievementType {
        MODULE_COMPLETION,
        CATEGORY_MASTERY,
        PERFECT_SCORE,
        FAST_LEARNER,
        COMMUNITY_CONTRIBUTOR,
        TEACHING_EXCELLENCE
    }
    
    // ============ STRUCTS ============
    
    /// @dev Learning module structure
    struct LearningModule {
        uint256 moduleId;
        string title;
        string description;
        ModuleDifficulty difficulty;
        ModuleCategory category;
        uint256 estimatedHours;
        uint256 minimumScore;
        string contentURI;
        bool active;
        uint256 createdAt;
        address creator;
    }
    
    /// @dev Module completion record
    struct ModuleCompletion {
        uint256 moduleId;
        address student;
        uint256 score;
        uint256 completedAt;
        uint256 timeSpent; // in minutes
        bool certified;
        string certificateURI;
    }
    
    /// @dev Student achievement
    struct Achievement {
        uint256 achievementId;
        address student;
        AchievementType achievementType;
        string title;
        string description;
        uint256 awardedAt;
        string badgeURI;
    }
    
    /// @dev Student profile
    struct StudentProfile {
        address studentAddress;
        uint256 totalModulesCompleted;
        uint256 totalScore;
        uint256 totalStudyHours;
        uint256 achievementCount;
        uint256 enrolledAt;
        bool active;
    }
    
    // ============ STATE VARIABLES ============
    
    /// @dev Module counter
    uint256 private _moduleIdCounter;
    
    /// @dev Achievement counter
    uint256 private _achievementIdCounter;
    
    /// @dev Mapping: Module ID => Learning Module
    mapping(uint256 => LearningModule) public modules;
    
    /// @dev Mapping: Student => Module ID => Completion
    mapping(address => mapping(uint256 => ModuleCompletion)) public completions;
    
    /// @dev Mapping: Student => Student Profile
    mapping(address => StudentProfile) public students;
    
    /// @dev Mapping: Achievement ID => Achievement
    mapping(uint256 => Achievement) public achievements;
    
    /// @dev Mapping: Student => Achievement IDs
    mapping(address => uint256[]) public studentAchievements;
    
    /// @dev Mapping: Category => Module IDs
    mapping(ModuleCategory => uint256[]) public modulesByCategory;
    
    /// @dev Mapping: Address => Instructor Status
    mapping(address => bool) public isInstructor;
    
    /// @dev HealthCoin contract address
    address public healthCoinAddress;
    
    /// @dev Certificate base URI
    string public certificateBaseURI;
    
    /// @dev Badge base URI
    string public badgeBaseURI;
    
    /// @dev Total students enrolled
    uint256 public totalStudentsEnrolled;
    
    /// @dev Total completions
    uint256 public totalCompletions;
    
    /// @dev Academy active
    bool public academyActive;
    
    // ============ EVENTS ============
    
    event StudentEnrolled(address indexed student, uint256 timestamp);
    event ModuleCreated(uint256 indexed moduleId, string title, ModuleCategory category, ModuleDifficulty difficulty);
    event ModuleCompleted(
        address indexed student, 
        uint256 indexed moduleId, 
        uint256 score, 
        uint256 timeSpent
    );
    event ModuleCertified(address indexed student, uint256 indexed moduleId, string certificateURI);
    event AchievementAwarded(
        address indexed student, 
        uint256 indexed achievementId, 
        AchievementType achievementType
    );
    event InstructorUpdated(address indexed instructor, bool status);
    event HealthCoinIntegrated(address indexed healthCoin);
    event AcademyStatusChanged(bool active);
    event ModuleUpdated(uint256 indexed moduleId, string title);
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        address initialOwner,
        string memory _certificateBaseURI,
        string memory _badgeBaseURI
    ) Ownable(initialOwner) {
        certificateBaseURI = _certificateBaseURI;
        badgeBaseURI = _badgeBaseURI;
        academyActive = true;
        isInstructor[initialOwner] = true;
    }
    
    // ============ MODIFIERS ============
    
    modifier onlyInstructor() {
        require(isInstructor[msg.sender] || msg.sender == owner(), "Not authorized instructor");
        _;
    }
    
    modifier whenAcademyActive() {
        require(academyActive, "Academy not active");
        _;
    }
    
    modifier onlyEnrolled() {
        require(students[msg.sender].active, "Not enrolled");
        _;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Set instructor status
     * @param instructor Address to update
     * @param status New instructor status
     */
    function setInstructor(address instructor, bool status) external onlyOwner {
        require(instructor != address(0), "Invalid address");
        isInstructor[instructor] = status;
        emit InstructorUpdated(instructor, status);
    }
    
    /**
     * @dev Integrate with HealthCoin contract
     * @param _healthCoinAddress HealthCoin contract address
     */
    function setHealthCoinAddress(address _healthCoinAddress) external onlyOwner {
        require(_healthCoinAddress != address(0), "Invalid address");
        healthCoinAddress = _healthCoinAddress;
        emit HealthCoinIntegrated(_healthCoinAddress);
    }
    
    /**
     * @dev Enable or disable academy
     * @param active New status
     */
    function setAcademyActive(bool active) external onlyOwner {
        academyActive = active;
        emit AcademyStatusChanged(active);
    }
    
    /**
     * @dev Update certificate base URI
     * @param newURI New base URI
     */
    function setCertificateBaseURI(string memory newURI) external onlyOwner {
        certificateBaseURI = newURI;
    }
    
    /**
     * @dev Update badge base URI
     * @param newURI New base URI
     */
    function setBadgeBaseURI(string memory newURI) external onlyOwner {
        badgeBaseURI = newURI;
    }
    
    // ============ ENROLLMENT FUNCTIONS ============
    
    /**
     * @dev Enroll student in academy
     */
    function enrollStudent() external whenAcademyActive {
        require(!students[msg.sender].active, "Already enrolled");
        
        students[msg.sender] = StudentProfile({
            studentAddress: msg.sender,
            totalModulesCompleted: 0,
            totalScore: 0,
            totalStudyHours: 0,
            achievementCount: 0,
            enrolledAt: block.timestamp,
            active: true
        });
        
        totalStudentsEnrolled++;
        
        emit StudentEnrolled(msg.sender, block.timestamp);
    }
    
    // ============ MODULE MANAGEMENT FUNCTIONS ============
    
    /**
     * @dev Create a new learning module
     * @param title Module title
     * @param description Module description
     * @param difficulty Module difficulty level
     * @param category Module category
     * @param estimatedHours Estimated completion time
     * @param minimumScore Minimum passing score (out of 100)
     * @param contentURI URI for module content
     */
    function createModule(
        string memory title,
        string memory description,
        ModuleDifficulty difficulty,
        ModuleCategory category,
        uint256 estimatedHours,
        uint256 minimumScore,
        string memory contentURI
    ) external onlyInstructor returns (uint256) {
        require(bytes(title).length > 0, "Title required");
        require(minimumScore <= 100, "Invalid minimum score");
        
        _moduleIdCounter++;
        uint256 newModuleId = _moduleIdCounter;
        
        modules[newModuleId] = LearningModule({
            moduleId: newModuleId,
            title: title,
            description: description,
            difficulty: difficulty,
            category: category,
            estimatedHours: estimatedHours,
            minimumScore: minimumScore,
            contentURI: contentURI,
            active: true,
            createdAt: block.timestamp,
            creator: msg.sender
        });
        
        modulesByCategory[category].push(newModuleId);
        
        emit ModuleCreated(newModuleId, title, category, difficulty);
        
        return newModuleId;
    }
    
    /**
     * @dev Update existing module
     * @param moduleId Module ID
     * @param title New title
     * @param description New description
     * @param contentURI New content URI
     * @param active New active status
     */
    function updateModule(
        uint256 moduleId,
        string memory title,
        string memory description,
        string memory contentURI,
        bool active
    ) external onlyInstructor {
        require(modules[moduleId].moduleId != 0, "Module does not exist");
        
        LearningModule storage module = modules[moduleId];
        module.title = title;
        module.description = description;
        module.contentURI = contentURI;
        module.active = active;
        
        emit ModuleUpdated(moduleId, title);
    }
    
    // ============ COMPLETION FUNCTIONS ============
    
    /**
     * @dev Complete a learning module
     * @param moduleId Module ID
     * @param score Student's score (out of 100)
     * @param timeSpent Time spent in minutes
     */
    function completeModule(
        uint256 moduleId,
        uint256 score,
        uint256 timeSpent
    ) external onlyEnrolled whenAcademyActive nonReentrant {
        require(modules[moduleId].active, "Module not active");
        require(score <= 100, "Invalid score");
        require(completions[msg.sender][moduleId].completedAt == 0, "Already completed");
        
        LearningModule storage module = modules[moduleId];
        StudentProfile storage student = students[msg.sender];
        
        // Record completion
        completions[msg.sender][moduleId] = ModuleCompletion({
            moduleId: moduleId,
            student: msg.sender,
            score: score,
            completedAt: block.timestamp,
            timeSpent: timeSpent,
            certified: false,
            certificateURI: ""
        });
        
        // Update student stats
        student.totalModulesCompleted++;
        student.totalScore += score;
        student.totalStudyHours += timeSpent / 60;
        totalCompletions++;
        
        emit ModuleCompleted(msg.sender, moduleId, score, timeSpent);
        
        // Issue certificate if passing score
        if (score >= module.minimumScore) {
            _issueCertificate(msg.sender, moduleId);
        }
        
        // Reward via HealthCoin if integrated
        if (healthCoinAddress != address(0)) {
            try IScrollVerseHealthCoin(healthCoinAddress).rewardAcademyModuleCompletion(msg.sender, moduleId) {
                // Successfully rewarded
            } catch {
                // Continue even if reward fails
            }
        }
        
        // Check for achievements
        _checkAndAwardAchievements(msg.sender, moduleId, score);
    }
    
    /**
     * @dev Issue certificate for module completion
     * @param student Student address
     * @param moduleId Module ID
     */
    function _issueCertificate(address student, uint256 moduleId) internal {
        string memory certificateURI = string(
            abi.encodePacked(
                certificateBaseURI,
                "/",
                _toString(moduleId),
                "/",
                _toHexString(student),
                ".json"
            )
        );
        
        completions[student][moduleId].certified = true;
        completions[student][moduleId].certificateURI = certificateURI;
        
        emit ModuleCertified(student, moduleId, certificateURI);
    }
    
    // ============ ACHIEVEMENT FUNCTIONS ============
    
    /**
     * @dev Check and award achievements
     * @param student Student address
     * @param moduleId Completed module ID
     * @param score Module score
     */
    function _checkAndAwardAchievements(
        address student,
        uint256 moduleId,
        uint256 score
    ) internal {
        // Perfect score achievement
        if (score == 100) {
            _awardAchievement(
                student,
                AchievementType.PERFECT_SCORE,
                "Perfect Score",
                "Achieved 100% on a module"
            );
        }
        
        // Check for category mastery (completed all modules in a category)
        ModuleCategory category = modules[moduleId].category;
        if (_hasCategoryMastery(student, category)) {
            _awardAchievement(
                student,
                AchievementType.CATEGORY_MASTERY,
                "Category Master",
                string(abi.encodePacked("Mastered ", _categoryToString(category)))
            );
        }
    }
    
    /**
     * @dev Award achievement to student
     * @param student Student address
     * @param achievementType Type of achievement
     * @param title Achievement title
     * @param description Achievement description
     */
    function _awardAchievement(
        address student,
        AchievementType achievementType,
        string memory title,
        string memory description
    ) internal {
        _achievementIdCounter++;
        uint256 achievementId = _achievementIdCounter;
        
        string memory badgeURI = string(
            abi.encodePacked(
                badgeBaseURI,
                "/",
                _toString(uint256(achievementType)),
                ".json"
            )
        );
        
        achievements[achievementId] = Achievement({
            achievementId: achievementId,
            student: student,
            achievementType: achievementType,
            title: title,
            description: description,
            awardedAt: block.timestamp,
            badgeURI: badgeURI
        });
        
        studentAchievements[student].push(achievementId);
        students[student].achievementCount++;
        
        emit AchievementAwarded(student, achievementId, achievementType);
    }
    
    /**
     * @dev Check if student has mastered a category
     * @param student Student address
     * @param category Module category
     */
    function _hasCategoryMastery(address student, ModuleCategory category) internal view returns (bool) {
        uint256[] storage categoryModules = modulesByCategory[category];
        
        for (uint256 i = 0; i < categoryModules.length; i++) {
            uint256 moduleId = categoryModules[i];
            if (!modules[moduleId].active) continue;
            
            if (completions[student][moduleId].completedAt == 0) {
                return false;
            }
            
            if (completions[student][moduleId].score < modules[moduleId].minimumScore) {
                return false;
            }
        }
        
        return categoryModules.length > 0;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get student profile
     * @param student Student address
     */
    function getStudentProfile(address student) external view returns (StudentProfile memory) {
        return students[student];
    }
    
    /**
     * @dev Get module details
     * @param moduleId Module ID
     */
    function getModule(uint256 moduleId) external view returns (LearningModule memory) {
        return modules[moduleId];
    }
    
    /**
     * @dev Get student's module completion
     * @param student Student address
     * @param moduleId Module ID
     */
    function getCompletion(address student, uint256 moduleId) 
        external 
        view 
        returns (ModuleCompletion memory) 
    {
        return completions[student][moduleId];
    }
    
    /**
     * @dev Get student's achievements
     * @param student Student address
     */
    function getStudentAchievements(address student) external view returns (uint256[] memory) {
        return studentAchievements[student];
    }
    
    /**
     * @dev Get modules by category
     * @param category Module category
     */
    function getModulesByCategory(ModuleCategory category) external view returns (uint256[] memory) {
        return modulesByCategory[category];
    }
    
    /**
     * @dev Get total modules created
     */
    function getTotalModules() external view returns (uint256) {
        return _moduleIdCounter;
    }
    
    // ============ UTILITY FUNCTIONS ============
    
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
    
    function _toHexString(address addr) internal pure returns (string memory) {
        bytes memory buffer = new bytes(40);
        for (uint256 i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint256(uint160(addr)) / (2**(8*(19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            buffer[2*i] = _char(hi);
            buffer[2*i+1] = _char(lo);
        }
        return string(abi.encodePacked("0x", string(buffer)));
    }
    
    function _char(bytes1 b) internal pure returns (bytes1) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }
    
    function _categoryToString(ModuleCategory category) internal pure returns (string memory) {
        if (category == ModuleCategory.BLOCKCHAIN_FUNDAMENTALS) return "Blockchain Fundamentals";
        if (category == ModuleCategory.SMART_CONTRACTS) return "Smart Contracts";
        if (category == ModuleCategory.WEB3_DEVELOPMENT) return "Web3 Development";
        if (category == ModuleCategory.DEFI_PROTOCOLS) return "DeFi Protocols";
        if (category == ModuleCategory.NFT_CREATION) return "NFT Creation";
        if (category == ModuleCategory.DAO_GOVERNANCE) return "DAO Governance";
        if (category == ModuleCategory.CONSCIOUSNESS_TECH) return "Consciousness Technology";
        if (category == ModuleCategory.HEALING_FREQUENCIES) return "Healing Frequencies";
        if (category == ModuleCategory.SOVEREIGNTY_PRINCIPLES) return "Sovereignty Principles";
        if (category == ModuleCategory.QUANTUM_INTEGRATION) return "Quantum Integration";
        return "Unknown";
    }
}
