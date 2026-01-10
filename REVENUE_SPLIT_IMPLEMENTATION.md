# Revenue Split Implementation Guide

## Overview

The **PharaohConsciousnessFusion** revenue split system provides a comprehensive, secure, and flexible framework for distributing royalties and revenue across multiple beneficiaries. This system implements advanced governance features, security measures, and analytics capabilities.

## System Architecture

### Core Components

1. **PharaohConsciousnessFusion Contract**: ERC-721 NFT collection with ERC-2981 royalty standard
2. **PharaohRevenueSplitter Contract**: Advanced revenue distribution system with multi-beneficiary support
3. **Multi-Signature Governance**: Secure beneficiary management requiring multiple approvals
4. **Time-Locked Operations**: Delayed execution for critical changes with review periods
5. **Vesting Schedules**: Gradual distribution of revenue over time
6. **Analytics & Reporting**: On-chain tracking and reporting of revenue distributions

## Current Implementation Status

### ✅ Implemented Features

#### 1. ERC-2981 Royalty Standard
- **File**: `contracts/PharaohConsciousnessFusion.sol`
- **Functionality**: On-chain royalty information for NFT marketplaces
- **Default Rate**: 5% (500 basis points)
- **Configurable**: Owner can update royalty receiver and percentage (max 10%)

```solidity
function royaltyInfo(uint256 tokenId, uint256 salePrice) 
    external view returns (address, uint256)
```

#### 2. Single Royalty Receiver
- Current implementation supports a single royalty receiver address
- Owner (Sovereign Chais) has exclusive control over royalty configuration
- Royalty percentage capped at 10% (1000 basis points) for marketplace compatibility

#### 3. Owner Governance
- Sole ownership model with Ownable pattern (OpenZeppelin v5.0.1)
- Owner can update:
  - Royalty receiver address
  - Royalty percentage
  - Base URI for metadata

### 🚀 Enhanced Features (This Implementation)

## PharaohRevenueSplitter Contract

### Multi-Beneficiary Revenue Distribution

The enhanced system supports distributing revenue to multiple beneficiaries with customizable percentages.

#### Beneficiary Structure
```solidity
struct Beneficiary {
    address payable account;      // Beneficiary address
    uint256 share;                // Share in basis points (e.g., 2500 = 25%)
    bool isActive;                // Active status
    uint256 totalReceived;        // Lifetime earnings tracking
    uint256 vestingStart;         // Vesting start timestamp (0 = no vesting)
    uint256 vestingDuration;      // Vesting duration in seconds
    uint256 vestingClaimed;       // Amount claimed from vesting
}
```

#### Core Functions

**Add Beneficiary** (Time-Locked & Multi-Sig Required)
```solidity
function addBeneficiary(
    address payable account,
    uint256 share,
    uint256 vestingDuration
) external onlyOwnerOrApproved
```

**Update Beneficiary Share** (Time-Locked & Multi-Sig Required)
```solidity
function updateBeneficiaryShare(
    address account,
    uint256 newShare
) external onlyOwnerOrApproved
```

**Remove Beneficiary** (Time-Locked & Multi-Sig Required)
```solidity
function removeBeneficiary(address account) external onlyOwnerOrApproved
```

**Distribute Revenue**
```solidity
function distributeRevenue() external nonReentrant
```

### Security Features

#### 1. Multi-Signature Governance

Critical operations require approval from multiple authorized signers to prevent unauthorized changes.

**Configuration:**
- Minimum signers: 2 (configurable)
- Maximum signers: 10
- Threshold: 60% of signers (configurable)

**Protected Operations:**
- Adding beneficiaries
- Removing beneficiaries
- Updating beneficiary shares
- Changing governance threshold
- Adding/removing signers

**Implementation:**
```solidity
mapping(bytes32 => mapping(address => bool)) public approvals;
mapping(bytes32 => uint256) public approvalCount;

function approveOperation(bytes32 operationHash) external onlyApprover
function executeWithApprovals(bytes32 operationHash, function pointer) internal
```

#### 2. Time-Locked Operations

Major changes include a mandatory delay period for review and emergency intervention.

**Configuration:**
- Standard delay: 48 hours (configurable)
- Emergency delay: 24 hours (for urgent changes)
- Maximum delay: 7 days

**Time-Lock Process:**
1. Operation proposed with timestamp
2. Delay period begins
3. During delay: operation can be canceled by owner
4. After delay: operation can be executed
5. Execution window: 72 hours (operation expires if not executed)

**Implementation:**
```solidity
struct TimeLock {
    uint256 timestamp;
    bool executed;
    bool cancelled;
    bytes data;
}

mapping(bytes32 => TimeLock) public timelocks;
```

#### 3. Emergency Pause

Owner can pause all revenue distributions in case of security concerns.

```solidity
function pause() external onlyOwner
function unpause() external onlyOwner
```

### Vesting Schedules

Beneficiaries can have revenue distributed gradually over a vesting period.

#### Vesting Types

1. **No Vesting** (vestingDuration = 0)
   - Immediate distribution of full share
   - Default for most beneficiaries

2. **Linear Vesting** (vestingDuration > 0)
   - Revenue unlocks linearly over the vesting period
   - Beneficiary can claim unlocked amounts at any time
   - Unclaimed amounts continue to accrue

#### Vesting Calculation
```solidity
function getVestedAmount(address beneficiary) public view returns (uint256) {
    if (block.timestamp >= vestingStart + vestingDuration) {
        return totalAllocated; // Fully vested
    }
    uint256 elapsed = block.timestamp - vestingStart;
    return (totalAllocated * elapsed) / vestingDuration;
}
```

#### Claiming Vested Revenue
```solidity
function claimVestedRevenue() external nonReentrant
```

### Beneficiary Templates

Pre-defined templates for common stakeholder configurations.

**Template Structure:**
```solidity
struct BeneficiaryTemplate {
    string name;
    address[] accounts;
    uint256[] shares;
    uint256[] vestingDurations;
}
```

**Available Templates:**

1. **Standard Team Split**
   - Creator: 60%
   - Developer: 20%
   - Marketing: 10%
   - Community Treasury: 10%

2. **Investor Split**
   - Creator: 50%
   - Investor A: 25%
   - Investor B: 15%
   - Team: 10%

3. **Community First**
   - Community Treasury: 40%
   - Creator: 35%
   - Development Fund: 15%
   - Marketing: 10%

**Using Templates:**
```solidity
function applyTemplate(string memory templateName) external onlyOwner
```

### Analytics & Reporting

#### On-Chain Metrics

**Revenue Tracking:**
- Total revenue received
- Total revenue distributed
- Per-beneficiary distribution amounts
- Distribution event history

**Events for Analytics:**
```solidity
event RevenueReceived(uint256 amount, uint256 timestamp);
event RevenueDistributed(uint256 totalAmount, uint256 timestamp);
event BeneficiaryPaid(address indexed beneficiary, uint256 amount, uint256 timestamp);
event BeneficiaryAdded(address indexed account, uint256 share);
event BeneficiaryRemoved(address indexed account);
event BeneficiaryShareUpdated(address indexed account, uint256 oldShare, uint256 newShare);
```

#### Analytics Functions

**Get Beneficiary Statistics:**
```solidity
function getBeneficiaryStats(address account) external view returns (
    uint256 currentShare,
    uint256 totalReceived,
    uint256 lastPayment,
    bool isActive,
    uint256 vestedAmount,
    uint256 claimableAmount
)
```

**Get Global Statistics:**
```solidity
function getGlobalStats() external view returns (
    uint256 totalRevenue,
    uint256 totalDistributed,
    uint256 pendingDistribution,
    uint256 activeBeneficiaries,
    uint256 totalBeneficiaries
)
```

**Get Distribution History:**
```solidity
function getDistributionHistory(uint256 offset, uint256 limit) 
    external view returns (Distribution[] memory)
```

### Audit Log

All critical operations are logged on-chain for transparency and accountability.

```solidity
struct AuditEntry {
    uint256 timestamp;
    address actor;
    string action;
    bytes data;
}

event AuditLog(
    uint256 indexed timestamp,
    address indexed actor,
    string action,
    bytes data
);
```

**Logged Actions:**
- Beneficiary additions/removals
- Share updates
- Revenue distributions
- Governance changes
- Emergency actions

## Integration with PharaohConsciousnessFusion

### Setup Process

1. **Deploy PharaohRevenueSplitter**
   ```solidity
   PharaohRevenueSplitter splitter = new PharaohRevenueSplitter(
       owner,           // Initial owner
       2,              // Required approvals
       48 hours        // Time-lock delay
   );
   ```

2. **Configure Beneficiaries**
   ```solidity
   // Add beneficiaries (requires multi-sig approval)
   splitter.addBeneficiary(creator, 6000, 0);      // 60%, no vesting
   splitter.addBeneficiary(developer, 2000, 0);     // 20%, no vesting
   splitter.addBeneficiary(marketing, 1000, 0);     // 10%, no vesting
   splitter.addBeneficiary(treasury, 1000, 0);      // 10%, no vesting
   ```

3. **Update PharaohConsciousnessFusion Royalty Receiver**
   ```solidity
   pharaohNFT.updateRoyalty(address(splitter), 500); // Set splitter as receiver
   ```

### Revenue Flow

1. NFT sold on marketplace → Marketplace sends royalty to PharaohRevenueSplitter
2. PharaohRevenueSplitter receives ETH via `receive()` function
3. Owner or anyone calls `distributeRevenue()`
4. Revenue split according to beneficiary shares
5. Each beneficiary receives proportional payment
6. Events emitted for tracking

### Manual Distribution

Owner can also send revenue directly:

```solidity
// Send ETH to splitter
(bool success, ) = address(splitter).call{value: amount}("");

// Distribute
splitter.distributeRevenue();
```

## Usage Examples

### Example 1: Add New Beneficiary with Vesting

```solidity
// Step 1: Propose addition (requires multi-sig)
bytes32 operationHash = keccak256(abi.encodePacked(
    "addBeneficiary",
    newBeneficiary,
    1500, // 15%
    365 days // 1 year vesting
));

// Step 2: Get required approvals
splitter.approveOperation(operationHash); // Approver 1
splitter.connect(approver2).approveOperation(operationHash); // Approver 2

// Step 3: Add beneficiary (triggers time-lock)
splitter.addBeneficiary(newBeneficiary, 1500, 365 days);

// Step 4: Wait 48 hours (time-lock period)

// Step 5: Execute the time-locked operation
splitter.executeTimeLocked(operationHash);
```

### Example 2: Emergency Pause

```solidity
// Detect suspicious activity
splitter.pause();

// Investigate and resolve issue

// Resume operations
splitter.unpause();
```

### Example 3: Apply Template

```solidity
// Apply pre-configured template
splitter.applyTemplate("Standard Team Split");

// Beneficiaries automatically configured with standard splits
```

### Example 4: Claim Vested Revenue

```solidity
// Beneficiary checks vested amount
uint256 vested = splitter.getVestedAmount(beneficiaryAddress);

// Claim available vested revenue
splitter.claimVestedRevenue();
```

## Security Considerations

### Access Control
- **Owner**: Full control over splitter, can add/remove approvers
- **Approvers**: Can approve critical operations
- **Beneficiaries**: Can only claim their vested revenue

### Best Practices

1. **Multi-Sig Setup**: Always require at least 2 approvers for critical changes
2. **Time-Lock Usage**: Use standard 48-hour delay for non-urgent changes
3. **Beneficiary Verification**: Always verify beneficiary addresses before adding
4. **Regular Audits**: Review distribution history and beneficiary stats regularly
5. **Emergency Preparedness**: Keep emergency pause functionality ready
6. **Percentage Validation**: Ensure total shares equal 10,000 (100%)

### Known Limitations

1. **Gas Costs**: Distribution to many beneficiaries can be expensive
2. **Fixed Percentages**: Shares are fixed until updated (no automatic adjustments)
3. **No Automatic Distribution**: Requires manual call to `distributeRevenue()`
4. **Vesting Granularity**: Vesting calculated per-second (minimum 1 second)

## Future Enhancements

### Planned Features

1. **DAO Governance Integration**
   - Allow DAO to propose and vote on beneficiary changes
   - Integration with governance tokens
   - Proposal and voting mechanisms

2. **On-Chain Revenue Split Auctions**
   - Allow stakeholders to auction their shares
   - Dynamic pricing based on demand
   - Automated share reallocation

3. **Fractional Community Ownership**
   - Enable community members to own fractional shares
   - Weighted governance based on share size
   - Community treasury management

4. **Automated Distribution Triggers**
   - Distribute when balance threshold reached
   - Time-based automatic distributions
   - Gas-optimized batch distributions

5. **Cross-Chain Revenue Aggregation**
   - Collect revenue from multiple chains
   - Unified distribution across chains
   - LayerZero integration for bridging

6. **Advanced Analytics Dashboard**
   - Off-chain indexing of events
   - Real-time revenue tracking
   - Historical performance metrics
   - Beneficiary performance insights

## Testing

### Test Coverage

The test suite includes:
- ✅ Basic beneficiary management
- ✅ Revenue distribution calculations
- ✅ Multi-sig approval flows
- ✅ Time-lock mechanisms
- ✅ Vesting schedule calculations
- ✅ Emergency pause functionality
- ✅ Template application
- ✅ Analytics and reporting
- ✅ Access control
- ✅ Edge cases and security

### Running Tests

```bash
# Compile contracts
npm run compile

# Run all tests
npm test

# Run specific test file
npx hardhat test test/PharaohRevenueSplitter.test.js

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run with coverage
npx hardhat coverage
```

## Deployment

### Deployment Steps

1. **Prepare Environment**
   ```bash
   cp .env.example .env
   # Configure RPC URLs and private keys
   ```

2. **Deploy Revenue Splitter**
   ```bash
   npx hardhat run scripts/deploy_pharaoh_revenue_splitter.js --network <network>
   ```

3. **Configure Beneficiaries**
   - Use deployment script or manual transactions
   - Ensure multi-sig approvals are in place

4. **Update NFT Contract**
   - Set revenue splitter as royalty receiver
   - Verify configuration

5. **Verification**
   - Verify contracts on block explorer
   - Test distribution with small amount
   - Monitor first real distribution

### Supported Networks
- Ethereum Mainnet
- Polygon
- Scroll zkEVM
- Base
- Mumbai Testnet (for testing)
- Scroll Sepolia (for testing)

## Maintenance

### Regular Tasks

1. **Monitor Distributions**: Check distribution events weekly
2. **Review Beneficiaries**: Audit beneficiary list monthly
3. **Update Documentation**: Keep docs in sync with contract changes
4. **Security Audits**: Annual security review recommended
5. **Gas Optimization**: Monitor and optimize gas usage

### Emergency Procedures

1. **Pause Protocol**: `splitter.pause()`
2. **Investigate Issue**: Review recent transactions and events
3. **Coordinate Response**: Contact beneficiaries if needed
4. **Resolve Issue**: Fix vulnerability or configuration
5. **Resume Operations**: `splitter.unpause()`
6. **Post-Mortem**: Document incident and improvements

## Support & Contact

For questions or issues:
- **Repository**: https://github.com/chaishillomnitech1/Chaishillomnitech1
- **Documentation**: See README.md and related guides
- **Issues**: Use GitHub Issues for bug reports and feature requests

## License

This implementation is part of the ScrollVerse Sovereignty Infrastructure.
License: CC-BY-NC-SA-4.0

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Author**: Supreme King Chais The Great ∞  
**Status**: Production Ready
