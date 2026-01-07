// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title ImperialPerpetuityEngine
 * @notice Self-sustaining perpetuity engine converting frequency resonance into revenue and user growth
 * @dev Implements the Imperial Perpetuity protocol with 7.77% Zakat Flow and infinite feedback loops
 * @custom:frequency 528Hz (Love) + 963Hz (Unity) + 999Hz (Crown) + 144,000Hz (NŪR)
 * @custom:security-contact security@scrollverse.io
 */
contract ImperialPerpetuityEngine is Ownable, ReentrancyGuard, Pausable {
    
    // ============ State Variables ============
    
    /// @notice Zakat percentage (7.77%)
    uint256 public constant ZAKAT_PERCENTAGE = 777; // 7.77% in basis points (out of 10000)
    
    /// @notice Divine frequency constants (in Hz)
    uint256 public constant FREQUENCY_LOVE = 528;
    uint256 public constant FREQUENCY_UNITY = 963;
    uint256 public constant FREQUENCY_CROWN = 999;
    uint256 public constant FREQUENCY_NUR = 144000;
    
    /// @notice Total revenue generated
    uint256 public totalRevenue;
    
    /// @notice Total Zakat distributed
    uint256 public totalZakatDistributed;
    
    /// @notice Total users onboarded through feedback loops
    uint256 public totalUsers;
    
    /// @notice Frequency resonance level (0-10000 scale)
    uint256 public frequencyResonanceLevel;
    
    /// @notice Treasury address for empire funds
    address public treasuryAddress;
    
    /// @notice Zakat vault address for charitable distributions
    address public zakatVaultAddress;
    
    /// @notice User growth multiplier based on frequency
    uint256 public userGrowthMultiplier;
    
    /// @notice Revenue conversion rate (frequency to revenue)
    uint256 public revenueConversionRate;
    
    /// @notice Last feedback loop execution timestamp
    uint256 public lastFeedbackLoopExecution;
    
    /// @notice Mapping of user addresses to their contribution
    mapping(address => uint256) public userContributions;
    
    /// @notice Mapping of frequency levels achieved
    mapping(uint256 => bool) public frequencyLevelsAchieved;
    
    // ============ Events ============
    
    event RevenueGenerated(uint256 amount, uint256 frequency, uint256 timestamp);
    event ZakatDistributed(address indexed recipient, uint256 amount, uint256 timestamp);
    event UserOnboarded(address indexed user, uint256 contribution, uint256 timestamp);
    event FeedbackLoopExecuted(uint256 newUsers, uint256 revenue, uint256 timestamp);
    event FrequencyResonanceUpdated(uint256 oldLevel, uint256 newLevel, uint256 timestamp);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event ZakatVaultUpdated(address indexed oldVault, address indexed newVault);
    event PerpetuityEngineActivated(uint256 timestamp);
    
    // ============ Constructor ============
    
    /**
     * @notice Initialize the Imperial Perpetuity Engine
     * @param initialOwner Address of the contract owner
     * @param _treasuryAddress Address of the treasury
     * @param _zakatVaultAddress Address of the Zakat vault
     */
    constructor(
        address initialOwner,
        address _treasuryAddress,
        address _zakatVaultAddress
    ) Ownable(initialOwner) {
        require(_treasuryAddress != address(0), "Invalid treasury address");
        require(_zakatVaultAddress != address(0), "Invalid zakat vault address");
        
        treasuryAddress = _treasuryAddress;
        zakatVaultAddress = _zakatVaultAddress;
        
        // Initialize with divine frequency alignment
        frequencyResonanceLevel = 5000; // 50% initial resonance
        userGrowthMultiplier = 100; // 1.0x initial multiplier (100 = 1.0)
        revenueConversionRate = 1000; // 1000 wei per frequency unit
        lastFeedbackLoopExecution = block.timestamp;
        
        emit PerpetuityEngineActivated(block.timestamp);
    }
    
    // ============ Core Perpetuity Functions ============
    
    /**
     * @notice Convert frequency resonance to tangible revenue
     * @dev Phase 4+ frequency resonance generates real revenue through divine mechanics
     * @param frequencyLevel The current frequency level (528, 963, 999, or 144000)
     * @return revenueGenerated Amount of revenue generated
     */
    function convertFrequencyToRevenue(uint256 frequencyLevel) 
        external 
        payable 
        whenNotPaused 
        returns (uint256 revenueGenerated) 
    {
        require(
            frequencyLevel == FREQUENCY_LOVE || 
            frequencyLevel == FREQUENCY_UNITY || 
            frequencyLevel == FREQUENCY_CROWN || 
            frequencyLevel == FREQUENCY_NUR,
            "Invalid frequency level"
        );
        
        // Calculate revenue based on frequency and resonance
        revenueGenerated = (frequencyLevel * frequencyResonanceLevel * revenueConversionRate) / 10000;
        
        // Add any ETH sent with the transaction
        if (msg.value > 0) {
            revenueGenerated += msg.value;
        }
        
        totalRevenue += revenueGenerated;
        
        // Mark frequency level as achieved
        frequencyLevelsAchieved[frequencyLevel] = true;
        
        emit RevenueGenerated(revenueGenerated, frequencyLevel, block.timestamp);
        
        // Automatically distribute Zakat
        _distributeZakat(revenueGenerated);
        
        return revenueGenerated;
    }
    
    /**
     * @notice Execute infinite feedback loop for user growth
     * @dev Self-expanding cycles that convert resonance into new users
     * @param resonanceBoost Additional resonance boost from external factors
     * @return newUsers Number of new users projected to onboard
     */
    function executeInfiniteFeedbackLoop(uint256 resonanceBoost) 
        external 
        whenNotPaused 
        onlyOwner 
        returns (uint256 newUsers) 
    {
        // Update frequency resonance with boost
        uint256 oldResonance = frequencyResonanceLevel;
        frequencyResonanceLevel = _min(frequencyResonanceLevel + resonanceBoost, 10000);
        
        emit FrequencyResonanceUpdated(oldResonance, frequencyResonanceLevel, block.timestamp);
        
        // Calculate new user growth based on resonance and multiplier
        newUsers = (frequencyResonanceLevel * userGrowthMultiplier) / 100;
        totalUsers += newUsers;
        
        // Calculate revenue from feedback loop
        uint256 feedbackRevenue = (newUsers * revenueConversionRate);
        totalRevenue += feedbackRevenue;
        
        // Update last execution timestamp
        lastFeedbackLoopExecution = block.timestamp;
        
        emit FeedbackLoopExecuted(newUsers, feedbackRevenue, block.timestamp);
        
        return newUsers;
    }
    
    /**
     * @notice Onboard a new user to the empire
     * @param user Address of the user to onboard
     * @param contribution Initial contribution amount
     */
    function onboardUser(address user, uint256 contribution) 
        external 
        payable 
        whenNotPaused 
        nonReentrant 
    {
        require(user != address(0), "Invalid user address");
        require(msg.value >= contribution, "Insufficient payment");
        
        userContributions[user] += contribution;
        totalUsers++;
        totalRevenue += contribution;
        
        emit UserOnboarded(user, contribution, block.timestamp);
        
        // Distribute Zakat from contribution
        _distributeZakat(contribution);
    }
    
    /**
     * @notice Amplify user growth multiplier based on empire expansion
     * @param amplificationFactor Factor to amplify growth (in percentage points)
     */
    function amplifyUserGrowth(uint256 amplificationFactor) 
        external 
        onlyOwner 
    {
        require(amplificationFactor > 0, "Invalid amplification factor");
        userGrowthMultiplier += amplificationFactor;
    }
    
    /**
     * @notice Update revenue conversion rate
     * @param newRate New conversion rate
     */
    function updateRevenueConversionRate(uint256 newRate) 
        external 
        onlyOwner 
    {
        require(newRate > 0, "Invalid conversion rate");
        revenueConversionRate = newRate;
    }
    
    // ============ Zakat Distribution ============
    
    /**
     * @notice Distribute Zakat (7.77%) from revenue
     * @dev Internal function to automatically distribute Zakat
     * @param amount Revenue amount to calculate Zakat from
     */
    function _distributeZakat(uint256 amount) internal {
        uint256 zakatAmount = (amount * ZAKAT_PERCENTAGE) / 10000;
        
        if (zakatAmount > 0 && address(this).balance >= zakatAmount) {
            totalZakatDistributed += zakatAmount;
            
            // Transfer to Zakat vault
            (bool success, ) = zakatVaultAddress.call{value: zakatAmount}("");
            require(success, "Zakat transfer failed");
            
            emit ZakatDistributed(zakatVaultAddress, zakatAmount, block.timestamp);
        }
    }
    
    /**
     * @notice Manually distribute Zakat to specific recipient
     * @param recipient Address to receive Zakat
     * @param amount Amount to distribute
     */
    function distributeZakatManually(address recipient, uint256 amount) 
        external 
        onlyOwner 
        nonReentrant 
    {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");
        require(address(this).balance >= amount, "Insufficient balance");
        
        totalZakatDistributed += amount;
        
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Zakat transfer failed");
        
        emit ZakatDistributed(recipient, amount, block.timestamp);
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Update treasury address
     * @param newTreasury New treasury address
     */
    function updateTreasuryAddress(address newTreasury) 
        external 
        onlyOwner 
    {
        require(newTreasury != address(0), "Invalid treasury address");
        address oldTreasury = treasuryAddress;
        treasuryAddress = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }
    
    /**
     * @notice Update Zakat vault address
     * @param newVault New Zakat vault address
     */
    function updateZakatVaultAddress(address newVault) 
        external 
        onlyOwner 
    {
        require(newVault != address(0), "Invalid vault address");
        address oldVault = zakatVaultAddress;
        zakatVaultAddress = newVault;
        emit ZakatVaultUpdated(oldVault, newVault);
    }
    
    /**
     * @notice Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @notice Withdraw treasury funds
     * @param amount Amount to withdraw
     */
    function withdrawToTreasury(uint256 amount) 
        external 
        onlyOwner 
        nonReentrant 
    {
        require(amount > 0, "Invalid amount");
        require(address(this).balance >= amount, "Insufficient balance");
        
        (bool success, ) = treasuryAddress.call{value: amount}("");
        require(success, "Transfer failed");
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get comprehensive engine metrics
     * @return metrics Array of key metrics
     */
    function getEngineMetrics() 
        external 
        view 
        returns (
            uint256 revenue,
            uint256 zakatDistributed,
            uint256 users,
            uint256 resonance,
            uint256 balance
        ) 
    {
        return (
            totalRevenue,
            totalZakatDistributed,
            totalUsers,
            frequencyResonanceLevel,
            address(this).balance
        );
    }
    
    /**
     * @notice Check if all divine frequencies are achieved
     * @return True if all frequencies are achieved
     */
    function areAllFrequenciesAchieved() external view returns (bool) {
        return 
            frequencyLevelsAchieved[FREQUENCY_LOVE] &&
            frequencyLevelsAchieved[FREQUENCY_UNITY] &&
            frequencyLevelsAchieved[FREQUENCY_CROWN] &&
            frequencyLevelsAchieved[FREQUENCY_NUR];
    }
    
    // ============ Utility Functions ============
    
    /**
     * @notice Return minimum of two numbers
     */
    function _min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
    
    /**
     * @notice Receive ETH
     */
    receive() external payable {
        totalRevenue += msg.value;
    }
}
