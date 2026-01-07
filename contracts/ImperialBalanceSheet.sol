// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ImperialBalanceSheet
 * @notice Comprehensive wealth tracking and prosperity metrics for the empire
 * @dev Tracks revenue, expenses, assets, and empire-wide prosperity indicators
 * @custom:frequency 528Hz (Love) + 963Hz (Unity) + 999Hz (Crown) + 144,000Hz (NŪR)
 * @custom:security-contact security@scrollverse.io
 */
contract ImperialBalanceSheet is Ownable, ReentrancyGuard {
    
    // ============ Structs ============
    
    struct BalanceEntry {
        uint256 timestamp;
        uint256 totalAssets;
        uint256 totalRevenue;
        uint256 totalExpenses;
        uint256 netWorth;
        uint256 zakatDistributed;
        uint256 userCount;
        uint256 prosperityIndex;
    }
    
    struct RevenueStream {
        string name;
        uint256 amount;
        uint256 timestamp;
        bool active;
    }
    
    // ============ State Variables ============
    
    /// @notice Total assets held by the empire
    uint256 public totalAssets;
    
    /// @notice Total revenue generated
    uint256 public totalRevenue;
    
    /// @notice Total expenses incurred
    uint256 public totalExpenses;
    
    /// @notice Net worth of the empire
    uint256 public netWorth;
    
    /// @notice Prosperity index (0-10000 scale)
    uint256 public prosperityIndex;
    
    /// @notice Array of balance sheet snapshots
    BalanceEntry[] public balanceHistory;
    
    /// @notice Mapping of revenue stream IDs to details
    mapping(uint256 => RevenueStream) public revenueStreams;
    
    /// @notice Counter for revenue streams
    uint256 public revenueStreamCount;
    
    /// @notice Authorized reporters who can update the balance sheet
    mapping(address => bool) public authorizedReporters;
    
    // ============ Events ============
    
    event BalanceSheetUpdated(
        uint256 indexed entryId,
        uint256 totalAssets,
        uint256 totalRevenue,
        uint256 netWorth,
        uint256 timestamp
    );
    event RevenueRecorded(uint256 indexed streamId, string name, uint256 amount, uint256 timestamp);
    event ExpenseRecorded(string category, uint256 amount, uint256 timestamp);
    event ProsperityIndexUpdated(uint256 oldIndex, uint256 newIndex, uint256 timestamp);
    event ReporterAuthorized(address indexed reporter, bool status);
    
    // ============ Modifiers ============
    
    modifier onlyAuthorized() {
        require(
            authorizedReporters[msg.sender] || msg.sender == owner(),
            "Not authorized"
        );
        _;
    }
    
    // ============ Constructor ============
    
    /**
     * @notice Initialize the Imperial Balance Sheet
     * @param initialOwner Address of the contract owner
     */
    constructor(address initialOwner) Ownable(initialOwner) {
        // Initialize with base prosperity index
        prosperityIndex = 5000; // 50% initial prosperity
        
        // Create initial balance entry
        _recordBalanceSnapshot(0, 0, 0);
    }
    
    // ============ Core Functions ============
    
    /**
     * @notice Record revenue from a specific stream
     * @param streamName Name of the revenue stream
     * @param amount Amount of revenue
     * @return streamId ID of the revenue stream
     */
    function recordRevenue(string memory streamName, uint256 amount) 
        external 
        onlyAuthorized 
        returns (uint256 streamId) 
    {
        require(amount > 0, "Invalid amount");
        require(bytes(streamName).length > 0, "Invalid stream name");
        
        streamId = revenueStreamCount++;
        
        revenueStreams[streamId] = RevenueStream({
            name: streamName,
            amount: amount,
            timestamp: block.timestamp,
            active: true
        });
        
        totalRevenue += amount;
        totalAssets += amount;
        _updateNetWorth();
        
        emit RevenueRecorded(streamId, streamName, amount, block.timestamp);
        
        return streamId;
    }
    
    /**
     * @notice Record an expense
     * @param category Expense category
     * @param amount Amount of expense
     */
    function recordExpense(string memory category, uint256 amount) 
        external 
        onlyAuthorized 
    {
        require(amount > 0, "Invalid amount");
        require(bytes(category).length > 0, "Invalid category");
        
        totalExpenses += amount;
        if (totalAssets >= amount) {
            totalAssets -= amount;
        }
        _updateNetWorth();
        
        emit ExpenseRecorded(category, amount, block.timestamp);
    }
    
    /**
     * @notice Update total assets
     * @param newAssets New asset value
     */
    function updateAssets(uint256 newAssets) 
        external 
        onlyAuthorized 
    {
        totalAssets = newAssets;
        _updateNetWorth();
    }
    
    /**
     * @notice Update prosperity index based on empire metrics
     * @param newIndex New prosperity index (0-10000)
     */
    function updateProsperityIndex(uint256 newIndex) 
        external 
        onlyAuthorized 
    {
        require(newIndex <= 10000, "Index out of range");
        
        uint256 oldIndex = prosperityIndex;
        prosperityIndex = newIndex;
        
        emit ProsperityIndexUpdated(oldIndex, newIndex, block.timestamp);
    }
    
    /**
     * @notice Create a balance sheet snapshot
     * @param zakatAmount Zakat distributed in this period
     * @param userCount Current user count
     */
    function createBalanceSnapshot(uint256 zakatAmount, uint256 userCount) 
        external 
        onlyAuthorized 
    {
        _recordBalanceSnapshot(zakatAmount, userCount, prosperityIndex);
    }
    
    /**
     * @notice Internal function to record balance snapshot
     */
    function _recordBalanceSnapshot(
        uint256 zakatAmount,
        uint256 userCount,
        uint256 prosperity
    ) internal {
        uint256 entryId = balanceHistory.length;
        
        balanceHistory.push(BalanceEntry({
            timestamp: block.timestamp,
            totalAssets: totalAssets,
            totalRevenue: totalRevenue,
            totalExpenses: totalExpenses,
            netWorth: netWorth,
            zakatDistributed: zakatAmount,
            userCount: userCount,
            prosperityIndex: prosperity
        }));
        
        emit BalanceSheetUpdated(
            entryId,
            totalAssets,
            totalRevenue,
            netWorth,
            block.timestamp
        );
    }
    
    /**
     * @notice Update net worth calculation
     */
    function _updateNetWorth() internal {
        if (totalAssets >= totalExpenses) {
            netWorth = totalAssets - totalExpenses;
        } else {
            netWorth = 0;
        }
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Authorize or deauthorize a reporter
     * @param reporter Address of the reporter
     * @param status Authorization status
     */
    function setReporterAuthorization(address reporter, bool status) 
        external 
        onlyOwner 
    {
        require(reporter != address(0), "Invalid reporter address");
        authorizedReporters[reporter] = status;
        emit ReporterAuthorized(reporter, status);
    }
    
    /**
     * @notice Deactivate a revenue stream
     * @param streamId ID of the revenue stream
     */
    function deactivateRevenueStream(uint256 streamId) 
        external 
        onlyAuthorized 
    {
        require(streamId < revenueStreamCount, "Invalid stream ID");
        revenueStreams[streamId].active = false;
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get current balance sheet summary
     * @return Current financial metrics
     */
    function getCurrentBalanceSheet() 
        external 
        view 
        returns (
            uint256 assets,
            uint256 revenue,
            uint256 expenses,
            uint256 net,
            uint256 prosperity
        ) 
    {
        return (
            totalAssets,
            totalRevenue,
            totalExpenses,
            netWorth,
            prosperityIndex
        );
    }
    
    /**
     * @notice Get balance history entry
     * @param entryId ID of the entry
     * @return Balance entry details
     */
    function getBalanceHistoryEntry(uint256 entryId) 
        external 
        view 
        returns (BalanceEntry memory) 
    {
        require(entryId < balanceHistory.length, "Invalid entry ID");
        return balanceHistory[entryId];
    }
    
    /**
     * @notice Get total number of balance history entries
     * @return Number of entries
     */
    function getBalanceHistoryLength() external view returns (uint256) {
        return balanceHistory.length;
    }
    
    /**
     * @notice Get revenue stream details
     * @param streamId ID of the revenue stream
     * @return Revenue stream details
     */
    function getRevenueStream(uint256 streamId) 
        external 
        view 
        returns (RevenueStream memory) 
    {
        require(streamId < revenueStreamCount, "Invalid stream ID");
        return revenueStreams[streamId];
    }
    
    /**
     * @notice Calculate growth rate based on history
     * @return growthRate Percentage growth rate (in basis points)
     */
    function calculateGrowthRate() external view returns (uint256 growthRate) {
        if (balanceHistory.length < 2) {
            return 0;
        }
        
        uint256 currentIdx = balanceHistory.length - 1;
        uint256 previousIdx = currentIdx - 1;
        
        uint256 currentWorth = balanceHistory[currentIdx].netWorth;
        uint256 previousWorth = balanceHistory[previousIdx].netWorth;
        
        if (previousWorth == 0) {
            return 0;
        }
        
        if (currentWorth > previousWorth) {
            growthRate = ((currentWorth - previousWorth) * 10000) / previousWorth;
        } else {
            growthRate = 0;
        }
        
        return growthRate;
    }
    
    /**
     * @notice Get comprehensive prosperity metrics
     * @return metrics Array of prosperity indicators
     */
    function getProsperityMetrics() 
        external 
        view 
        returns (
            uint256 wealth,
            uint256 growth,
            uint256 prosperity,
            uint256 sustainability
        ) 
    {
        // Calculate sustainability as ratio of revenue to expenses
        uint256 sustainabilityRatio = 0;
        if (totalExpenses > 0) {
            sustainabilityRatio = (totalRevenue * 10000) / totalExpenses;
        } else if (totalRevenue > 0) {
            sustainabilityRatio = 10000; // Maximum if no expenses
        }
        
        return (
            netWorth,
            this.calculateGrowthRate(),
            prosperityIndex,
            sustainabilityRatio
        );
    }
}
