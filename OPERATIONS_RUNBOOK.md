# 📖 ScrollVerse Operations Runbook

**SUPREME KING CHAIS THE GREAT ∞ — OMNISOVEREIGN ARCHITECT**

**Document ID**: RUNBOOK-001-ETERNAL  
**Classification**: OPERATIONS GUIDE  
**Status**: SEALED LAW  
**Frequency**: 528Hz + 963Hz + 888Hz + 777Hz + 144,000Hz  
**Signature**: ∞ ARCHITEX ∞

---

## 🔥 INTRODUCTION

**ALLĀHU AKBAR! 🕋🔥💎🌌**

This operations runbook provides comprehensive procedures for deploying, operating, and maintaining the ScrollVerse ecosystem. It covers deployment procedures, monitoring, incident response, and maintenance tasks.

---

## 📋 TABLE OF CONTENTS

1. [Deployment Procedures](#deployment-procedures)
2. [Contract Verification](#contract-verification)
3. [Monitoring & Alerts](#monitoring--alerts)
4. [Incident Response](#incident-response)
5. [Maintenance Procedures](#maintenance-procedures)
6. [Emergency Procedures](#emergency-procedures)
7. [Rollback Procedures](#rollback-procedures)
8. [Common Issues & Solutions](#common-issues--solutions)

---

## 🚀 DEPLOYMENT PROCEDURES

### Pre-Deployment Checklist

```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm install

# 3. Compile contracts
npm run compile

# 4. Run tests
npm run test

# 5. Verify environment
cat .env | grep -v KEY  # Check config (don't expose keys)

# 6. Check wallet balance
npx hardhat accounts --network mumbai
```

### Deployment Order

The contracts should be deployed in the following order due to dependencies:

1. **NoorToken** - Base token contract
2. **NoorCitizenRegistry** - Citizen registry (optional, can use ZeroAddress)
3. **NoorStakingPool** - Requires NoorToken address
4. **AddLiquidity** - Requires DEX Router address
5. **LiquidityIncentives** - Requires Sabir Allah Fund address
6. **ScrollVerseNFT** - Independent, can deploy anytime

### Deploy to Mumbai Testnet

```bash
# Deploy NoorToken
npx hardhat run scripts/deploy_noor_token.js --network mumbai

# Deploy NoorStakingPool (set NOOR_TOKEN_ADDRESS in .env first)
npx hardhat run scripts/deploy_staking_pool.js --network mumbai

# Deploy AddLiquidity
npx hardhat run scripts/deploy_add_liquidity.js --network mumbai

# Deploy LiquidityIncentives
npx hardhat run scripts/deploy_liquidity_incentives.js --network mumbai

# Deploy ScrollVerseNFT
npm run deploy:mumbai:nft
```

### Deploy to Polygon Mainnet

```bash
# IMPORTANT: Double-check all addresses before mainnet deployment
# Use a hardware wallet or multi-sig for deployer

# Deploy NoorToken
npx hardhat run scripts/deploy_noor_token.js --network polygon

# Deploy remaining contracts following the same order
# Update .env after each deployment with the new address
```

### Deploy to Scroll zkEVM

```bash
# Deploy to Scroll Sepolia (testnet)
npx hardhat run scripts/deploy_noor_token.js --network scrollSepolia

# Deploy to Scroll Mainnet
npx hardhat run scripts/deploy_noor_token.js --network scrollMainnet
```

---

## ✅ CONTRACT VERIFICATION

### Verify on PolygonScan

```bash
# NoorToken
npx hardhat verify --network mumbai NOOR_TOKEN_ADDRESS \
  "SABIR_ALLAH_FUND_ADDRESS" \
  "COMMUNITY_FUND_ADDRESS"

# NoorStakingPool
npx hardhat verify --network mumbai STAKING_POOL_ADDRESS \
  "NOOR_TOKEN_ADDRESS" \
  "SABIR_ALLAH_FUND_ADDRESS" \
  "CITIZEN_REGISTRY_ADDRESS"

# AddLiquidity
npx hardhat verify --network mumbai ADD_LIQUIDITY_ADDRESS \
  "ROUTER_ADDRESS" \
  "500"

# LiquidityIncentives
npx hardhat verify --network mumbai INCENTIVES_ADDRESS \
  "SABIR_ALLAH_FUND_ADDRESS" \
  "CITIZEN_REGISTRY_ADDRESS" \
  "1000000000000000000" \
  "0"
```

### Verify on ScrollScan

```bash
# Similar to PolygonScan, but use --network scrollSepolia or scroll
npx hardhat verify --network scrollSepolia CONTRACT_ADDRESS ARGS...
```

### Run Verification Scripts

```bash
# Verify Phase 1 deployment
npx hardhat run scripts/verify_phase1_deployment.js --network mumbai

# Verify AddLiquidity
npx hardhat run scripts/verify_add_liquidity.js --network mumbai

# Verify LiquidityIncentives
npx hardhat run scripts/verify_liquidity_incentives.js --network mumbai
```

---

## 📊 MONITORING & ALERTS

### Key Metrics to Monitor

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| Total Staked | Amount of NOOR staked | < 10% of supply |
| Reward Pool Balance | Available rewards | < 1M NOOR |
| Daily Active Users | Unique users per day | < 100 |
| Total Zakat Distributed | Zakat sent to fund | Monitor only |
| Gas Prices | Transaction costs | > 100 gwei |
| Contract Balance | ETH/MATIC in contracts | < 0.1 |

### Monitoring Commands

```bash
# Check staking pool stats
npx hardhat run scripts/check_staking_stats.js --network mumbai

# Check reward pool balance
npx hardhat run scripts/check_reward_pool.js --network mumbai

# Check total stakers
npx hardhat console --network mumbai
> const pool = await ethers.getContractAt("NoorStakingPool", POOL_ADDRESS)
> await pool.getTotalStakers()
```

### Subgraph Monitoring

```bash
# Check subgraph sync status
curl -X POST -H "Content-Type: application/json" \
  -d '{"query": "{ _meta { block { number } } }"}' \
  https://api.thegraph.com/subgraphs/name/scrollverse/scrollverse-mumbai

# Check for indexing errors
# Visit: https://thegraph.com/hosted-service/subgraph/scrollverse/scrollverse-mumbai
```

### Alert Channels

1. **Critical**: Discord + SMS + Email (immediately)
2. **High**: Discord + Email (< 15 minutes)
3. **Medium**: Discord (< 1 hour)
4. **Low**: Daily digest

---

## 🚨 INCIDENT RESPONSE

### Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|----------|
| P0 - Critical | Complete system failure | < 15 min | Contract exploit, funds at risk |
| P1 - High | Major feature broken | < 1 hour | Staking not working, rewards stuck |
| P2 - Medium | Minor feature broken | < 4 hours | UI bugs, slow performance |
| P3 - Low | Cosmetic issues | < 24 hours | Display issues, typos |

### Incident Response Process

1. **Detect**: Automated alerts or user reports
2. **Assess**: Determine severity and impact
3. **Communicate**: Notify stakeholders
4. **Mitigate**: Take immediate action
5. **Resolve**: Fix the root cause
6. **Review**: Post-incident analysis

### Emergency Contacts

| Role | Name | Contact | Escalation |
|------|------|---------|------------|
| On-Call Engineer | TBD | TBD | Primary |
| Tech Lead | TBD | TBD | 15 min no response |
| Project Lead | Chais The Great ∞ | TBD | P0 incidents |

---

## 🔧 MAINTENANCE PROCEDURES

### Daily Tasks

```bash
# Check contract health
npx hardhat run scripts/daily_health_check.js --network mumbai

# Review new transactions
# Check block explorer for unusual activity

# Check subgraph status
# Ensure no indexing errors
```

### Weekly Tasks

```bash
# Review staking metrics
npx hardhat run scripts/weekly_staking_report.js --network mumbai

# Check reward pool balance and top up if needed
# Review gas usage trends
# Review zakat distributions
```

### Monthly Tasks

```bash
# Full system audit
npx hardhat run scripts/monthly_audit.js --network mumbai

# Review and update documentation
# Check for dependency updates
npm audit
npm update

# Review access controls
# Ensure only authorized addresses have admin roles
```

### Fund Reward Pool

```bash
# Connect to staking pool
npx hardhat console --network mumbai
> const pool = await ethers.getContractAt("NoorStakingPool", POOL_ADDRESS)
> const noor = await ethers.getContractAt("NoorToken", NOOR_ADDRESS)

# Check current balance
> await pool.rewardPoolBalance()

# Approve tokens
> await noor.approve(POOL_ADDRESS, ethers.parseEther("1000000"))

# Fund pool
> await pool.fundRewardPool(ethers.parseEther("1000000"))
```

### Add New Incentive Pool

```bash
npx hardhat console --network mumbai
> const incentives = await ethers.getContractAt("LiquidityIncentives", INCENTIVES_ADDRESS)

# Add pool (LP token, reward token, allocation points)
> await incentives.addPool(LP_TOKEN_ADDRESS, REWARD_TOKEN_ADDRESS, 1000)

# Verify pool was added
> await incentives.poolLength()
```

---

## ⚠️ EMERGENCY PROCEDURES

### Pause Contracts

If a security issue is detected, immediately pause affected contracts:

```bash
npx hardhat console --network mumbai

# Pause NoorStakingPool
> const pool = await ethers.getContractAt("NoorStakingPool", POOL_ADDRESS)
> await pool.pause()

# Pause LiquidityIncentives
> const incentives = await ethers.getContractAt("LiquidityIncentives", INCENTIVES_ADDRESS)
> await incentives.pause()

# Pause AddLiquidity
> const liquidity = await ethers.getContractAt("AddLiquidity", LIQUIDITY_ADDRESS)
> await liquidity.pause()
```

### Emergency Token Recovery

If tokens are accidentally sent to contracts:

```bash
npx hardhat console --network mumbai

# Recover ERC20 tokens from AddLiquidity
> const liquidity = await ethers.getContractAt("AddLiquidity", LIQUIDITY_ADDRESS)
> await liquidity.emergencyWithdraw(TOKEN_ADDRESS, AMOUNT)

# Recover ETH from AddLiquidity
> await liquidity.emergencyWithdrawETH()
```

### Unpause After Resolution

```bash
npx hardhat console --network mumbai

# Verify issue is resolved
# Run smoke tests

# Unpause contracts
> await pool.unpause()
> await incentives.unpause()
> await liquidity.unpause()
```

---

## 🔄 ROLLBACK PROCEDURES

### Frontend Rollback

```bash
# Revert to previous deployment on Vercel
vercel rollback --scope=scrollverse

# Or manually deploy previous version
git checkout <previous-commit>
npm run build
vercel deploy --prod
```

### Contract Rollback

Smart contracts cannot be directly rolled back. Options:

1. **Deploy new version**: Deploy fixed contract and migrate users
2. **Upgrade (if upgradeable)**: Deploy new implementation
3. **Pause and communicate**: Pause old contract, deploy new one

### Subgraph Rollback

```bash
# Deploy previous version
git checkout <previous-commit>
cd subgraph
graph deploy --product hosted-service scrollverse/scrollverse-mumbai
```

---

## 🔍 COMMON ISSUES & SOLUTIONS

### Issue: Transaction Reverts

**Symptoms**: Transaction fails with revert error

**Diagnosis**:
```bash
# Check the revert reason
npx hardhat run scripts/debug_transaction.js --network mumbai
```

**Solutions**:
1. Insufficient token approval - Approve tokens first
2. Below minimum stake - Increase stake amount
3. Lock not expired - Wait for lock period
4. Paused contract - Check contract status

### Issue: Subgraph Not Syncing

**Symptoms**: Subgraph stuck at specific block

**Diagnosis**:
```bash
# Check subgraph logs on The Graph dashboard
# Check for handler errors
```

**Solutions**:
1. Fix handler code and redeploy
2. Check RPC endpoint health
3. Contact The Graph support if persistent

### Issue: High Gas Costs

**Symptoms**: Transactions costing more than expected

**Diagnosis**:
```bash
# Check current gas prices
# Review transaction complexity
```

**Solutions**:
1. Wait for lower gas prices
2. Batch transactions if possible
3. Optimize contract code (requires new deployment)

### Issue: Reward Pool Empty

**Symptoms**: Users unable to claim rewards

**Diagnosis**:
```bash
npx hardhat console --network mumbai
> const pool = await ethers.getContractAt("NoorStakingPool", POOL_ADDRESS)
> await pool.rewardPoolBalance()
```

**Solutions**:
1. Fund reward pool immediately
2. Communicate delay to users
3. Implement automatic alerts for low balance

### Issue: User Stake Not Appearing

**Symptoms**: User staked but position not showing

**Diagnosis**:
```bash
npx hardhat console --network mumbai
> const pool = await ethers.getContractAt("NoorStakingPool", POOL_ADDRESS)
> await pool.stakes(USER_ADDRESS)
```

**Solutions**:
1. Verify transaction was confirmed
2. Check subgraph sync status
3. Check if correct contract address is used

---

## 📝 RUNBOOK TEMPLATES

### Deployment Checklist Template

```
Date: _______________
Network: _______________
Deployer: _______________

Pre-Deployment:
[ ] Code reviewed
[ ] Tests passing
[ ] Environment configured
[ ] Wallet funded

Deployment:
[ ] Contract deployed: 0x_______________
[ ] Constructor args verified
[ ] Contract verified on explorer
[ ] Initial configuration set

Post-Deployment:
[ ] Smoke tests passed
[ ] Documentation updated
[ ] Stakeholders notified

Sign-off: _______________
```

### Incident Report Template

```
Incident ID: INC-_______________
Date/Time: _______________
Severity: P___
Status: _______________

Summary:
_______________________________________________

Impact:
_______________________________________________

Root Cause:
_______________________________________________

Resolution:
_______________________________________________

Lessons Learned:
_______________________________________________

Action Items:
[ ] _______________________________________________
[ ] _______________________________________________
```

---

## 🕋 ETERNAL DECLARATION

**ALLAHU AKBAR! 🕋🔥💎🌌**

This operations runbook is sealed under the **Eternal Scroll Codex (ESC-88)**, ensuring the reliable operation of the ScrollVerse ecosystem.

**The Operations are Sacred.**  
**The Procedures are Divine.**  
**The Reliability is Eternal.**

---

**CHAIS THE GREAT ∞ — Forever our creator, forever our compass, forever our source.**

**ALLAHU AKBAR! 🔥🕋🚀♾️❤️🧬💸**

*The System Runs. The Protocol Works. The Empire Endures.*

---

**Document Sealed**: December 2025  
**Status**: OPERATIONS ACTIVE  
**Frequency**: 528Hz + 963Hz + 888Hz + 777Hz + 144,000Hz  
**Signature**: ∞ ARCHITEX ∞

**WALAHI! BARAKALLAHU FEEK! ALLAHU AKBAR!**
