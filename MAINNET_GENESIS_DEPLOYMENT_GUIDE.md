# 🕋 MAINNET GENESIS DEPLOYMENT GUIDE

## بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ - KUN FAYAKŪN! ✅

**The Ultimate Transition: Testnet → Mainnet Genesis**

---

## 🎯 OVERVIEW

This guide walks you through the complete transition from Scroll Testnet validation to **Ethereum/Scroll Mainnet Genesis Deployment** for the **ScrollVerse Shared Prosperity Protocol**.

**Target Networks:**
- ✅ Ethereum Mainnet (Primary)
- ✅ Scroll Mainnet (L2 Scaling)
- ✅ Polygon Mainnet (Multi-chain expansion)

**Deployment Artifacts:**
- PharaohRevenueSplitter (Revenue distribution + 2.5% Zakat)
- ScrollVerseGovernanceDAO (Contribution-weighted governance)
- ScrollCommandLogic (Protocol orchestration)

---

## 📋 PRE-REQUISITES CHECKLIST

### ✅ Testnet Validation Complete
- [ ] 30-day testnet validation completed
- [ ] All functionality tests passed (Week 1-4 protocol)
- [ ] Gas optimization verified
- [ ] Multi-sig governance tested
- [ ] DAO proposals executed successfully
- [ ] Vesting schedules validated
- [ ] Zakat calculations confirmed (2.5%)
- [ ] Event emissions verified on block explorers

### ✅ Security Audit Complete
- [ ] Professional security audit completed (OpenZeppelin/Trail of Bits)
- [ ] All critical findings addressed
- [ ] Re-audit passed (if required)
- [ ] Final audit report published
- [ ] Bug bounty program completed (4 weeks minimum)
- [ ] No critical vulnerabilities outstanding

### ✅ Mainnet Preparation
- [ ] Mainnet Zakat treasury wallet created
- [ ] Multi-sig approver wallets configured
- [ ] Initial beneficiaries identified
- [ ] Governance parameters finalized
- [ ] Deployment wallet funded (minimum requirements below)
- [ ] RPC endpoints configured for mainnet
- [ ] API keys obtained for contract verification

---

## 💰 FUNDING REQUIREMENTS

### Ethereum Mainnet
**Minimum Required**: 0.5 ETH
**Recommended**: 1.0 ETH

**Breakdown:**
- Contract deployment: ~0.15 ETH (3 contracts)
- Contract verification: ~0.01 ETH
- Initial transactions: ~0.05 ETH
- Buffer for gas spikes: ~0.29 ETH

### Scroll Mainnet
**Minimum Required**: 0.1 ETH
**Recommended**: 0.3 ETH

**Breakdown:**
- Contract deployment: ~0.03 ETH (cheaper L2 gas)
- Contract verification: ~0.005 ETH
- Initial transactions: ~0.015 ETH
- Buffer: ~0.25 ETH

### Polygon Mainnet
**Minimum Required**: 50 MATIC (~$30-50 USD)
**Recommended**: 100 MATIC

**Breakdown:**
- Contract deployment: ~15 MATIC
- Contract verification: ~2 MATIC
- Initial transactions: ~3 MATIC
- Buffer: ~80 MATIC

---

## 🔧 ENVIRONMENT CONFIGURATION

### Step 1: Create Mainnet `.env` File

Create `.env.mainnet` with the following:

```bash
# ============================================
# MAINNET DEPLOYMENT CONFIGURATION
# ============================================

# CRITICAL: Use a FRESH wallet for mainnet deployment
# NEVER reuse testnet private keys on mainnet
PRIVATE_KEY=your_mainnet_private_key_here

# ============================================
# ZAKAT TREASURY (IMMUTABLE - SET CAREFULLY)
# ============================================
# This address will receive 2.5% of all revenue distributions
# CANNOT be changed after deployment
MAINNET_ZAKAT_TREASURY=0xYourMainnetZakatTreasuryAddress

# ============================================
# RPC ENDPOINTS (Mainnet)
# ============================================
# Ethereum Mainnet
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# Scroll Mainnet
SCROLL_MAINNET_RPC_URL=https://rpc.scroll.io

# Polygon Mainnet
POLYGON_MAINNET_RPC_URL=https://polygon-rpc.com

# ============================================
# API KEYS FOR CONTRACT VERIFICATION
# ============================================
ETHERSCAN_API_KEY=your_etherscan_api_key
SCROLLSCAN_API_KEY=your_scrollscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key

# ============================================
# GOVERNANCE CONFIGURATION
# ============================================
# Multi-sig approver addresses (comma-separated)
MAINNET_MULTISIG_APPROVERS=0xApprover1,0xApprover2,0xApprover3

# Number of required approvals (N-of-M)
MAINNET_REQUIRED_APPROVALS=2

# Timelock delay in seconds (48 hours recommended)
MAINNET_TIMELOCK_DELAY=172800

# ============================================
# INITIAL BENEFICIARIES (Optional)
# ============================================
# Format: address:shareInBasisPoints:vestingDuration:contributionWeight
# Example: 0x123...:3000:31536000:100 (30%, 1 year vesting, weight 100)
MAINNET_INITIAL_BENEFICIARIES=

# ============================================
# DEPLOYMENT OPTIONS
# ============================================
# Enable sovereign override initially (can be disabled later)
MAINNET_SOVEREIGN_OVERRIDE_ENABLED=true

# Enable contract pausing capability
MAINNET_PAUSABLE_ENABLED=true

# ============================================
# NETWORK SELECTION
# ============================================
# Primary deployment network (ethereum | scrollMainnet | polygon)
PRIMARY_NETWORK=ethereum

# Enable multi-chain deployment
DEPLOY_TO_SCROLL=true
DEPLOY_TO_POLYGON=true
```

### Step 2: Get Mainnet RPC URLs

**Free/Paid Options:**

✅ **Alchemy** (Recommended)
- Website: https://www.alchemy.com/
- Free tier: 300M compute units/month
- Networks: Ethereum, Polygon
- Sign up → Create app → Copy HTTP URL

✅ **Infura**
- Website: https://infura.io/
- Free tier: 100K requests/day
- Networks: Ethereum, Polygon
- Sign up → Create project → Copy endpoint

✅ **QuickNode**
- Website: https://www.quicknode.com/
- Networks: Ethereum, Polygon, Scroll
- Trial available

✅ **Scroll Public RPC**
- Mainnet: https://rpc.scroll.io
- Free, but rate-limited

### Step 3: Get API Keys for Verification

✅ **Etherscan**
- URL: https://etherscan.io/myapikey
- Sign in → API Keys → Create new key
- Free tier: 5 requests/second

✅ **Scrollscan**
- URL: https://scrollscan.com/myapikey
- Sign in → API Keys → Create new key

✅ **Polygonscan**
- URL: https://polygonscan.com/myapikey
- Sign in → API Keys → Create new key

---

## 🚀 DEPLOYMENT EXECUTION

### Phase 1: Final Pre-Deployment Validation

Run the comprehensive validation script:

```bash
# Load mainnet environment
source .env.mainnet

# Run pre-deployment validation
npx hardhat run scripts/validate_mainnet_readiness.js
```

**Expected Output:**
```
✅ Solidity version: 0.8.20
✅ All contracts compile successfully
✅ Test suite: 80/80 tests passing
✅ Security audit: PASSED
✅ Mainnet wallet balance: 1.25 ETH
✅ Zakat treasury address: Valid
✅ Multi-sig approvers: 3 addresses configured
✅ RPC endpoints: All reachable
✅ API keys: Configured

🎯 MAINNET DEPLOYMENT: READY
```

### Phase 2: Deploy to Ethereum Mainnet

```bash
# Deploy PharaohRevenueSplitter, DAO, and ScrollCommandLogic
npx hardhat run scripts/deploy_mainnet.js --network ethereum

# Expected duration: 5-10 minutes
```

**What Happens:**
1. **PharaohRevenueSplitter** deployment
   - Zakat treasury locked in (2.5% immutable)
   - Multi-sig approvers configured
   - Timelock delay set (48 hours)
   - Initial beneficiaries added (if configured)

2. **ScrollVerseGovernanceDAO** deployment
   - Links to revenue splitter for weights
   - Proposal parameters set
   - Quorum threshold configured

3. **ScrollCommandLogic** deployment
   - Protocol orchestration enabled
   - Integration hooks configured

4. **Verification** (automatic)
   - Contracts verified on Etherscan
   - Source code published
   - ABI made public

**Deployment Artifacts Saved:**
- `deployments/mainnet/ethereum-deployment-{timestamp}.json`
- Contains: Addresses, transaction hashes, deployer, gas used

### Phase 3: Deploy to Scroll Mainnet (Optional)

```bash
# Deploy to Scroll L2
npx hardhat run scripts/deploy_mainnet.js --network scrollMainnet

# Expected duration: 3-5 minutes (faster on L2)
```

**Benefits of Scroll Deployment:**
- Lower gas fees (~90% cheaper)
- Faster transaction finality
- Same security guarantees
- Cross-chain bridge available

### Phase 4: Deploy to Polygon Mainnet (Optional)

```bash
# Deploy to Polygon
npx hardhat run scripts/deploy_mainnet.js --network polygon

# Expected duration: 2-4 minutes
```

**Benefits of Polygon Deployment:**
- Very low gas fees (~95% cheaper)
- Sub-second transactions
- Large DeFi ecosystem
- Broad wallet support

### Phase 5: Verify Deployments

```bash
# Verify all contracts on all networks
npx hardhat run scripts/verify_all_mainnet.js

# Manual verification (if auto-verify fails)
npx hardhat verify --network ethereum <REVENUE_SPLITTER_ADDRESS> <CONSTRUCTOR_ARGS>
npx hardhat verify --network scrollMainnet <DAO_ADDRESS> <CONSTRUCTOR_ARGS>
npx hardhat verify --network polygon <COMMAND_LOGIC_ADDRESS> <CONSTRUCTOR_ARGS>
```

---

## 📊 POST-DEPLOYMENT VERIFICATION

### Step 1: Check Contracts on Block Explorers

**Ethereum:**
- Explorer: https://etherscan.io/
- Search for deployed addresses
- Verify: ✅ Verified source code, ✅ Contract creation successful

**Scroll:**
- Explorer: https://scrollscan.com/
- Verify: ✅ Contracts deployed, ✅ Transaction success

**Polygon:**
- Explorer: https://polygonscan.com/
- Verify: ✅ Contracts live, ✅ Verification status

### Step 2: Test Core Functionality

```bash
# Run mainnet smoke tests (READ-ONLY, no gas)
npx hardhat run scripts/test_mainnet_deployment.js --network ethereum
```

**Tests Run:**
- ✅ Revenue splitter configuration check
- ✅ Zakat treasury address verification
- ✅ Multi-sig approver count
- ✅ Timelock delay setting
- ✅ DAO voting power calculation
- ✅ Beneficiary enumeration
- ✅ Pause status check

### Step 3: Initialize Contracts

```bash
# Add initial beneficiaries (if not done in deployment)
npx hardhat run scripts/initialize_mainnet_beneficiaries.js --network ethereum

# Cache initial DAO weights
npx hardhat run scripts/cache_dao_weights.js --network ethereum

# Optional: Add test revenue for validation
npx hardhat run scripts/add_test_revenue.js --network ethereum
```

### Step 4: Configure Monitoring

Set up real-time monitoring:

```bash
# Start event listener
npm run monitor:mainnet

# Configure alerts (Tenderly/OpenZeppelin Defender)
npx hardhat run scripts/setup_monitoring.js
```

**Events to Monitor:**
- `RevenueReceived` - New revenue arrivals
- `RevenueDistributed` - Distribution executions
- `ZakatContributed` - Zakat treasury payments
- `BeneficiaryAdded` - New beneficiaries
- `ProposalCreated` - New DAO proposals
- `VoteCast` - Governance votes
- `Paused/Unpaused` - Emergency actions

---

## 🎛️ MAINNET OPERATIONS

### Revenue Distribution

```bash
# Distribute accumulated revenue
npx hardhat run scripts/distribute_mainnet_revenue.js --network ethereum
```

**What Happens:**
1. 2.5% → Zakat treasury (immutable)
2. 97.5% → Beneficiaries (by share %)
3. Vesting schedules applied
4. Events emitted
5. Stats updated

### Governance Operations

```bash
# Create a proposal
npx hardhat run scripts/create_proposal.js --network ethereum

# Vote on proposal
npx hardhat run scripts/vote_on_proposal.js --network ethereum

# Execute approved proposal
npx hardhat run scripts/execute_proposal.js --network ethereum
```

### Beneficiary Management

**Adding a beneficiary requires multi-sig approval:**

```bash
# Step 1: Initiate beneficiary addition
npx hardhat run scripts/initiate_add_beneficiary.js --network ethereum

# Step 2: Approvers approve (N-of-M required)
npx hardhat run scripts/approve_operation.js --network ethereum

# Step 3: Execute after timelock delay (48 hours)
npx hardhat run scripts/execute_add_beneficiary.js --network ethereum
```

### Emergency Procedures

**Pause Protocol (if critical issue discovered):**

```bash
# Pause all operations
npx hardhat run scripts/emergency_pause.js --network ethereum

# Unpause after issue resolved
npx hardhat run scripts/unpause.js --network ethereum
```

---

## 🔒 SECURITY BEST PRACTICES

### Multi-Sig Wallet Management

**Recommended Setup:**
- Use Gnosis Safe or similar multi-sig wallet
- Distribute keys across: 
  - Sovereign owner (you)
  - Trusted technical advisor
  - Legal representative
  - Community representative (optional)

**Configuration:**
- 2-of-3 for routine operations
- 3-of-4 for critical changes (Zakat treasury, beneficiary removal)

### Private Key Security

✅ **DO:**
- Use hardware wallets (Ledger, Trezor)
- Store backup seed phrases in multiple secure locations
- Use different keys for deployment vs. operations
- Enable MFA on all exchange/wallet accounts

❌ **DON'T:**
- Store private keys in plain text
- Reuse testnet keys on mainnet
- Share keys via email/chat
- Use keys on untrusted computers

### Access Control

**Sovereign Override:**
- Disable after initial setup period (recommended: 30 days post-deployment)
- Only enable for emergency situations
- Log all override usage on-chain

**Pausable:**
- Keep enabled for first 90 days
- Establish clear emergency response procedures
- Document pause/unpause criteria

---

## 📈 LAUNCH STRATEGY

### Week 1: Genesis Period (Days 1-7)

**Objectives:**
- Validate mainnet deployment
- Begin revenue accumulation
- Monitor for issues

**Actions:**
- [ ] Deploy to all target networks
- [ ] Verify contracts on block explorers
- [ ] Run smoke tests
- [ ] Configure monitoring
- [ ] Add initial beneficiaries
- [ ] Announce deployment to team

### Week 2: Soft Launch (Days 8-14)

**Objectives:**
- Execute first revenue distribution
- Test governance with test proposals
- Build confidence

**Actions:**
- [ ] Distribute first revenue batch
- [ ] Create test governance proposal
- [ ] Vote and execute proposal
- [ ] Monitor gas costs
- [ ] Optimize if needed
- [ ] Document any issues

### Week 3: Public Announcement (Days 15-21)

**Objectives:**
- Announce to community
- Invite first collaborators
- Begin DAO activation

**Actions:**
- [ ] Publish announcement
- [ ] Send collaborator invitations (use COLLABORATOR_INVITATION.md)
- [ ] Onboard first 10 contributors
- [ ] Add beneficiaries for contributors
- [ ] Execute first real governance proposals

### Week 4: Full Activation (Days 22-30)

**Objectives:**
- Scale to 100 collaborators
- Establish regular operations
- Transfer to community governance

**Actions:**
- [ ] Onboard remaining collaborators (up to 100)
- [ ] Establish weekly DAO meetings
- [ ] Begin regular revenue distributions
- [ ] Disable sovereign override (if appropriate)
- [ ] Publish first transparency report

### Month 2+: Sustained Operations

**Objectives:**
- Maintain protocol health
- Grow community
- Expand features

**Actions:**
- [ ] Monthly revenue distributions
- [ ] Quarterly governance reviews
- [ ] Bi-annual security audits
- [ ] Continuous documentation updates
- [ ] Feature proposals via DAO
- [ ] Cross-chain expansion (if needed)

---

## 🎯 SUCCESS CRITERIA

### Technical Success
- ✅ All contracts deployed and verified on target networks
- ✅ Zero critical vulnerabilities post-audit
- ✅ 100% test coverage maintained
- ✅ Gas costs within acceptable range (<$50/distribution on Ethereum)
- ✅ Uptime: 99.9%+

### Operational Success
- ✅ First revenue distribution executed successfully
- ✅ Zakat treasury receiving 2.5% accurately
- ✅ Multi-sig governance functioning
- ✅ DAO proposals passing and executing
- ✅ Beneficiaries receiving distributions correctly

### Community Success
- ✅ 100 collaborators onboarded (Month 1)
- ✅ Active DAO participation (10%+ voting on proposals)
- ✅ Regular proposals (1+ per week)
- ✅ Positive community sentiment
- ✅ Growing contributor base

### Financial Success
- ✅ Revenue flowing into protocol
- ✅ Zakat treasury accumulating (minimum $10K Month 1)
- ✅ Beneficiaries satisfied with distributions
- ✅ Protocol self-sustaining (covers gas costs)
- ✅ Treasury growth rate positive

---

## 🛠️ TROUBLESHOOTING

### Deployment Failures

**Issue:** "Insufficient funds for gas"
```bash
# Check wallet balance
npx hardhat run scripts/check_balance.js --network ethereum

# Solution: Add more ETH/MATIC to deployer wallet
```

**Issue:** "Nonce too low"
```bash
# Reset nonce
npx hardhat run scripts/reset_nonce.js --network ethereum
```

**Issue:** "Contract verification failed"
```bash
# Manual verification with flatten
npx hardhat flatten contracts/PharaohRevenueSplitter.sol > flattened.sol
# Then verify manually on Etherscan with flattened source
```

### Operational Issues

**Issue:** "Revenue distribution failing"
```bash
# Check contract balance
npx hardhat run scripts/check_contract_balance.js --network ethereum

# Check beneficiary configuration
npx hardhat run scripts/list_beneficiaries.js --network ethereum

# Check if paused
npx hardhat run scripts/check_pause_status.js --network ethereum
```

**Issue:** "DAO proposal execution failing"
```bash
# Check proposal state
npx hardhat run scripts/get_proposal_state.js --network ethereum <PROPOSAL_ID>

# Check timelock delay passed
npx hardhat run scripts/check_timelock.js --network ethereum <PROPOSAL_ID>
```

**Issue:** "Multi-sig approval stuck"
```bash
# List pending operations
npx hardhat run scripts/list_pending_operations.js --network ethereum

# Check approver count
npx hardhat run scripts/get_operation_approvals.js --network ethereum <OPERATION_ID>
```

### Network Issues

**Issue:** "RPC endpoint not responding"
```bash
# Test RPC connectivity
curl -X POST <YOUR_RPC_URL> \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Solution: Switch to backup RPC (Alchemy → Infura → QuickNode)
```

**Issue:** "Gas price too high"
```bash
# Check current gas price
npx hardhat run scripts/get_gas_price.js --network ethereum

# Solution: Wait for lower gas, or use flashbots for priority
```

---

## 📞 SUPPORT & RESOURCES

### Documentation
- Technical Architecture: `REVENUE_SPLIT_IMPLEMENTATION.md`
- Legal Framework: `SCROLLVERSE_SOVEREIGN_LICENSE.md`
- Security Audit Report: `SECURITY_AUDIT_PREPARATION.md`
- Collaborator Guide: `COLLABORATOR_INVITATION.md`

### Block Explorers
- Ethereum: https://etherscan.io/
- Scroll: https://scrollscan.com/
- Polygon: https://polygonscan.com/

### Network Status
- Ethereum: https://ethstats.net/
- Scroll: https://status.scroll.io/
- Polygon: https://status.polygon.technology/

### Community
- Scroll Discord: https://discord.gg/scroll
- Polygon Discord: https://discord.gg/polygon
- Ethereum Stack Exchange: https://ethereum.stackexchange.com/

### Emergency Contacts
- Security Issues: security@scrollverse.io
- Technical Support: dev@scrollverse.io
- Governance Questions: dao@scrollverse.io

---

## ✅ DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] Testnet validation complete (30 days)
- [ ] Security audit complete and published
- [ ] Bug bounty program completed
- [ ] Mainnet wallets created and funded
- [ ] `.env.mainnet` configured
- [ ] RPC endpoints tested
- [ ] API keys obtained
- [ ] Multi-sig approvers confirmed
- [ ] Zakat treasury address confirmed
- [ ] Initial beneficiaries identified (optional)
- [ ] Team notified of deployment schedule

### Deployment Day
- [ ] Final code review
- [ ] Run pre-deployment validation
- [ ] Deploy to Ethereum mainnet
- [ ] Verify on Etherscan
- [ ] Deploy to Scroll mainnet (if enabled)
- [ ] Verify on Scrollscan
- [ ] Deploy to Polygon mainnet (if enabled)
- [ ] Verify on Polygonscan
- [ ] Save deployment artifacts
- [ ] Run smoke tests
- [ ] Initialize contracts
- [ ] Configure monitoring
- [ ] Document deployed addresses

### Post-Deployment
- [ ] Announce to team
- [ ] Update documentation with addresses
- [ ] Monitor for 24 hours
- [ ] Execute test transaction
- [ ] Add initial beneficiaries
- [ ] Cache DAO weights
- [ ] Create test proposal
- [ ] Execute test vote
- [ ] Prepare public announcement
- [ ] Invite collaborators
- [ ] Begin Week 1 operations

### Week 1
- [ ] Daily monitoring
- [ ] First revenue distribution
- [ ] Gas cost analysis
- [ ] Issue log review
- [ ] Team feedback session
- [ ] Documentation updates
- [ ] Security review
- [ ] Performance optimization (if needed)

### Month 1
- [ ] Onboard 100 collaborators
- [ ] Weekly revenue distributions
- [ ] Monthly transparency report
- [ ] Community AMA
- [ ] Governance review
- [ ] Security re-audit (if major changes)
- [ ] Decide on sovereign override status
- [ ] Plan Month 2 roadmap

---

## 🌟 MAINNET GENESIS ACHIEVED

**Congratulations!** You've successfully transitioned from testnet to mainnet.

**What You've Accomplished:**
- ✅ Production-ready smart contracts deployed
- ✅ 2.5% Zakat protocol activated and immutable
- ✅ Multi-sig governance operational
- ✅ Contribution-weighted DAO live
- ✅ Revenue distribution system active
- ✅ Transparent on-chain audit trail
- ✅ Community collaboration framework established
- ✅ Self-sustaining prosperity protocol launched

**Next Steps:**
1. Follow Week 1-4 launch strategy
2. Grow to 100 collaborators
3. Establish regular operations
4. Expand cross-chain (L2s, other mainnets)
5. Build on the foundation

---

**Frequencies Activated**: 963Hz (Manifestation) + 528Hz (Transformation) + 999Hz (Completion) + ∞ (Eternity)

**Status**: ✅ MAINNET GENESIS COMPLETE - THE GREATEST CREATION IS LIVE

**Achievement**: FROM VISION → CODE → TESTNET → MAINNET → INFINITY

🚀✨🕋⚖️♾️ **ALLĀHU AKBAR! KUN FAYAKŪN!** 🌊💸🧬🌌
