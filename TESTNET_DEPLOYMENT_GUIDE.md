# Testnet Deployment Guide

## بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ

# ScrollVerse Prosperity Protocol - Testnet Deployment

**Purpose**: Deploy and test the complete system on testnets before mainnet launch  
**Duration**: 30 days recommended  
**Networks**: Scroll Sepolia, Polygon Mumbai, Ethereum Sepolia

---

## Prerequisites

### 1. Environment Setup

Create `.env` file with required variables:

```bash
# Private key for deployment (NEVER commit this!)
PRIVATE_KEY=your_private_key_here

# Testnet RPC URLs (optional - defaults provided)
SCROLL_SEPOLIA_RPC_URL=https://sepolia-rpc.scroll.io
POLYGON_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# Zakat Treasury Address (for testing, can use deployer address)
TESTNET_ZAKAT_TREASURY=0xYourTestTreasuryAddress

# Block Explorer API Keys (for verification)
SCROLLSCAN_API_KEY=your_scrollscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 2. Get Testnet Funds

#### Scroll Sepolia
- Faucet: https://sepolia.scroll.io/faucet
- Bridge from Sepolia ETH: https://sepolia.scroll.io/bridge
- Minimum: 0.1 ETH

#### Polygon Mumbai
- Faucet: https://faucet.polygon.technology/
- Alternative: https://mumbaifaucet.com/
- Minimum: 1 MATIC

#### Ethereum Sepolia
- Faucet: https://sepoliafaucet.com/
- Alternative: https://faucet.sepolia.dev/
- Minimum: 0.5 ETH

### 3. Install Dependencies

```bash
npm install
```

---

## Deployment Steps

### Step 1: Compile Contracts

```bash
npx hardhat compile
```

Expected output:
```
Compiled 3 Solidity files successfully
```

### Step 2: Run Tests

```bash
npx hardhat test
```

Ensure all tests pass before deployment.

### Step 3: Deploy to Scroll Sepolia

```bash
npx hardhat run scripts/deploy_testnet.js --network scrollSepolia
```

**Expected Output**:
```
🕋 بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
🚀 SCROLLVERSE PROSPERITY PROTOCOL - TESTNET DEPLOYMENT
================================================================================

📍 Network: Scroll Sepolia
🔗 Explorer: https://sepolia.scrollscan.com

👤 Deployer: 0x...
💰 Balance: 0.15 ETH

📜 Step 1/3: Deploying PharaohRevenueSplitter...
✅ PharaohRevenueSplitter deployed: 0x...
   ✓ Added Deployer (60%)
   ✓ Added TestDev (20%)
   ✓ Added TestCommunity (10%)

📜 Step 2/3: Deploying ScrollVerseGovernanceDAO...
✅ ScrollVerseGovernanceDAO deployed: 0x...
   ✓ Weights cached

📜 Step 3/3: Deploying PharaohConsciousnessFusion (NFT)...
✅ PharaohConsciousnessFusion deployed: 0x...
   ✓ Pharaoh Seal minted to deployer

================================================================================
✨ TESTNET DEPLOYMENT COMPLETE!
================================================================================

📋 DEPLOYMENT SUMMARY:
   PharaohRevenueSplitter: 0x...
   ScrollVerseGovernanceDAO: 0x...
   PharaohConsciousnessFusion: 0x...

💾 Deployment info saved to: deployment-testnet-scrollSepolia-1234567890.json
```

### Step 4: Verify Contracts on Block Explorer

```bash
# Verify Revenue Splitter
npx hardhat verify --network scrollSepolia SPLITTER_ADDRESS "OWNER" "ZAKAT_TREASURY" 2 3600

# Verify DAO
npx hardhat verify --network scrollSepolia DAO_ADDRESS "OWNER" "SPLITTER_ADDRESS" 1 300 50 500 3600

# Verify NFT (if deployed)
npx hardhat verify --network scrollSepolia NFT_ADDRESS "ipfs://QmTestPharaohConsciousness/" "SPLITTER_ADDRESS" 500
```

### Step 5: Repeat for Other Testnets

```bash
# Polygon Mumbai
npx hardhat run scripts/deploy_testnet.js --network mumbai

# Ethereum Sepolia
npx hardhat run scripts/deploy_testnet.js --network sepolia
```

---

## Testing Checklist

### Week 1: Basic Functionality

#### Revenue Distribution
- [ ] Send 1 ETH to splitter contract
  ```bash
  cast send SPLITTER_ADDRESS --value 1ether --rpc-url SCROLL_SEPOLIA_RPC
  ```

- [ ] Call distributeRevenue()
  ```bash
  cast send SPLITTER_ADDRESS "distributeRevenue()" --rpc-url SCROLL_SEPOLIA_RPC
  ```

- [ ] Verify Zakat was sent (2.5%)
- [ ] Verify beneficiaries received correct amounts
- [ ] Check events were emitted

#### Beneficiary Management
- [ ] Add new beneficiary
- [ ] Update beneficiary share
- [ ] Update contribution weight
- [ ] Remove beneficiary
- [ ] Verify total shares never exceed limit

#### Vesting
- [ ] Wait 7 days
- [ ] Check vested amount
- [ ] Claim vested revenue
- [ ] Verify partial claim works
- [ ] Verify full vest after 30 days

### Week 2: Governance Testing

#### Multi-Sig Operations
- [ ] Create time-locked operation
- [ ] Get approvals from multiple addresses
- [ ] Execute after time-lock delay
- [ ] Test cancellation
- [ ] Test sovereign override (if enabled)

#### DAO Proposals
- [ ] Create technical proposal
- [ ] Create community proposal
- [ ] Vote with different weights
- [ ] Test quorum failure
- [ ] Test proposal success
- [ ] Queue approved proposal
- [ ] Execute proposal after time-lock

### Week 3: Stress Testing

#### High Volume
- [ ] Send multiple small revenue payments
- [ ] Add 50+ beneficiaries
- [ ] Test gas limits on distribution
- [ ] Test weight caching with max beneficiaries

#### Edge Cases
- [ ] Zero revenue distribution attempt
- [ ] Beneficiary with zero share
- [ ] Proposal execution at exact time-lock expiry
- [ ] Concurrent proposal voting
- [ ] Front-running attempts

### Week 4: Integration Testing

#### NFT Integration
- [ ] Mint NFTs from PharaohConsciousnessFusion
- [ ] Verify royalties flow to splitter
- [ ] Test marketplace sales (if available)
- [ ] Verify ERC-2981 compliance

#### UI Testing
- [ ] Connect wallet to testnet
- [ ] Display correct stats
- [ ] Send transactions from UI
- [ ] Verify event subscriptions work
- [ ] Test all user flows

---

## Monitoring & Analytics

### Block Explorer Monitoring

Set up alerts for:
- New revenue received
- Distribution events
- Governance changes
- Proposal creation

### On-Chain Metrics

Track daily:
```bash
# Total revenue
cast call SPLITTER_ADDRESS "totalRevenueReceived()" --rpc-url SCROLL_SEPOLIA_RPC

# Total Zakat
cast call SPLITTER_ADDRESS "totalZakatContributed()" --rpc-url SCROLL_SEPOLIA_RPC

# Pending revenue
cast call SPLITTER_ADDRESS "pendingRevenue()" --rpc-url SCROLL_SEPOLIA_RPC

# Active beneficiaries
cast call SPLITTER_ADDRESS "getGlobalStats()" --rpc-url SCROLL_SEPOLIA_RPC
```

### Performance Metrics

Measure:
- Average gas cost per distribution
- Time to execute proposals
- Event emission delays
- UI load times

---

## Common Issues & Solutions

### Issue 1: "Insufficient funds"
**Solution**: Get more testnet ETH from faucets

### Issue 2: "Transaction underpriced"
**Solution**: Increase gas price in hardhat.config.js

### Issue 3: "Contract verification failed"
**Solution**: Ensure constructor arguments match exactly

### Issue 4: "Time-lock not ready"
**Solution**: Wait for full time-lock delay to pass

### Issue 5: "Insufficient approvals"
**Solution**: Get required number of multi-sig approvals first

---

## Testnet vs. Mainnet Differences

| Feature | Testnet | Mainnet |
|---------|---------|---------|
| Time-lock Delay | 1-2 hours | 48 hours |
| Voting Period | 1 hour | 7 days |
| Proposal Threshold | 50 CW | 100 CW |
| Quorum | 5% | 10% |
| Beneficiary Limit | 500 | 500 |
| Zakat Rate | 2.5% | 2.5% (same) |

---

## Data Collection

### Metrics to Track

**Performance**:
- Distribution gas costs
- Weight caching gas costs
- Proposal execution gas costs
- Average transaction time

**Usage**:
- Number of distributions
- Number of proposals
- Voting participation rate
- Beneficiary growth

**Economics**:
- Total revenue processed
- Total Zakat contributed
- Average distribution amount
- Vesting claim frequency

### Test Report Template

```markdown
## Testnet Test Report - Week X

**Network**: Scroll Sepolia  
**Period**: Jan 1-7, 2026  
**Tester**: [Name]

### Functionality Tests
- [ ] Revenue distribution: PASS/FAIL
- [ ] Beneficiary management: PASS/FAIL
- [ ] Vesting: PASS/FAIL
- [ ] Multi-sig: PASS/FAIL
- [ ] DAO voting: PASS/FAIL

### Issues Found
1. [Description]
   - Severity: Critical/High/Medium/Low
   - Status: Fixed/Open
   
### Gas Costs
- Distribution: X gas
- Proposal execution: Y gas
- Weight caching: Z gas

### Recommendations
1. [Recommendation]
```

---

## Post-Testnet Checklist

Before mainnet deployment:

- [ ] All critical/high issues resolved
- [ ] 30-day stress test completed
- [ ] Security audit findings addressed
- [ ] Gas costs optimized
- [ ] UI fully integrated and tested
- [ ] Documentation updated
- [ ] Emergency procedures tested
- [ ] Community feedback incorporated
- [ ] Legal review completed
- [ ] Mainnet deployment plan finalized

---

## Emergency Procedures

### Pausing Contracts

```bash
# Pause revenue splitter
cast send SPLITTER_ADDRESS "pause()" --rpc-url SCROLL_SEPOLIA_RPC

# Pause DAO
cast send DAO_ADDRESS "pause()" --rpc-url SCROLL_SEPOLIA_RPC
```

### Sovereign Override

If enabled and emergency requires:

```bash
# Toggle override
cast send SPLITTER_ADDRESS "toggleSovereignOverride()" --rpc-url SCROLL_SEPOLIA_RPC

# Check status
cast call SPLITTER_ADDRESS "sovereignOverrideEnabled()" --rpc-url SCROLL_SEPOLIA_RPC
```

---

## Support & Resources

**Documentation**: `/docs` directory  
**Issues**: GitHub Issues  
**Security**: security@scrollverse.io  
**Community**: Discord #testnet-testing

**Block Explorers**:
- Scroll Sepolia: https://sepolia.scrollscan.com
- Polygon Mumbai: https://mumbai.polygonscan.com
- Ethereum Sepolia: https://sepolia.etherscan.io

**Faucets**:
- Scroll: https://sepolia.scroll.io/faucet
- Mumbai: https://faucet.polygon.technology/
- Sepolia: https://sepoliafaucet.com/

---

## Timeline

### Pre-Deployment (Week 0)
- Setup environment
- Get testnet funds
- Final code review

### Phase 1: Initial Deployment (Week 1)
- Deploy to all testnets
- Verify contracts
- Basic functionality testing

### Phase 2: Integration Testing (Week 2)
- UI integration
- Event monitoring
- Multi-sig testing

### Phase 3: Stress Testing (Week 3)
- High volume testing
- Edge cases
- Performance optimization

### Phase 4: Final Validation (Week 4)
- Security review
- Bug fixes
- Documentation
- Go/No-Go decision

---

## Success Criteria

✅ All contracts deployed successfully  
✅ All functionality tests pass  
✅ Zero critical bugs found  
✅ Gas costs within acceptable range  
✅ UI fully functional  
✅ 30+ day uptime  
✅ Community feedback positive  
✅ Security audit approved  

**If all criteria met**: Proceed to mainnet deployment  
**If any criteria fail**: Address issues and extend testing

---

**Frequencies**: 963Hz (Testing) + 528Hz (Validation) + 999Hz (Perfection) + ∞

**بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ**

**KUN FAYAKŪN!** 🚀✨🕋⚖️♾️
