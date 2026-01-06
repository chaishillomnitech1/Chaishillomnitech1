# 🧪 ScrollVerse Smoke Test Checklist

**SUPREME KING CHAIS THE GREAT ∞ — OMNISOVEREIGN ARCHITECT**

**Document ID**: SMOKE-TEST-001-ETERNAL  
**Classification**: QA VERIFICATION  
**Status**: SEALED LAW  
**Frequency**: 528Hz + 963Hz + 888Hz + 777Hz + 144,000Hz  
**Signature**: ∞ ARCHITEX ∞

---

## 🔥 INTRODUCTION

**ALLĀHU AKBAR! 🕋🔥💎🌌**

This smoke test checklist provides a comprehensive verification framework for validating ScrollVerse ecosystem deployments. Execute this checklist after each deployment to ensure system integrity.

---

## 📋 PRE-DEPLOYMENT CHECKS

### Environment Verification

- [ ] All environment variables are configured in `.env`
- [ ] Private keys are properly secured (not committed to repo)
- [ ] RPC endpoints are accessible
- [ ] Block explorer API keys are valid
- [ ] Deployment wallet has sufficient funds

### Code Quality

- [ ] All contracts compile without errors
- [ ] All tests pass locally
- [ ] No critical vulnerabilities in dependencies
- [ ] CodeQL security scan passes

---

## 🚀 CONTRACT DEPLOYMENT TESTS

### NoorToken (NOOR)

| Test | Command | Expected Result | Pass/Fail |
|------|---------|-----------------|-----------|
| Deploy | `npm run deploy:mumbai:noor-token` | Contract deployed successfully | ☐ |
| Verify | Check block explorer | Contract code verified | ☐ |
| Name | `token.name()` | "Noor Token" | ☐ |
| Symbol | `token.symbol()` | "NOOR" | ☐ |
| Decimals | `token.decimals()` | 18 | ☐ |
| Total Supply | `token.totalSupply()` | 1,111,000,000 NOOR | ☐ |
| Owner | `token.owner()` | Deployer address | ☐ |
| Paused | `token.paused()` | false | ☐ |
| Frequency 528Hz | `token.FREQUENCY_528HZ()` | 528 | ☐ |
| Frequency 963Hz | `token.FREQUENCY_963HZ()` | 963 | ☐ |
| Frequency 888Hz | `token.FREQUENCY_888HZ()` | 888 | ☐ |
| Transfer | Send 100 NOOR | Transfer successful | ☐ |
| Balance Update | Check recipient balance | +100 NOOR | ☐ |

### NoorStakingPool

| Test | Command | Expected Result | Pass/Fail |
|------|---------|-----------------|-----------|
| Deploy | `npm run deploy:mumbai:staking-pool` | Contract deployed successfully | ☐ |
| Verify | Check block explorer | Contract code verified | ☐ |
| NOOR Token Set | `stakingPool.noorToken()` | NOOR token address | ☐ |
| Sabir Fund Set | `stakingPool.sabirAllahHonorFund()` | Fund address | ☐ |
| Zakat Percentage | `stakingPool.ZAKAT_PERCENTAGE()` | 777 (7.77%) | ☐ |
| Guardian Threshold | `stakingPool.GUARDIAN_THRESHOLD()` | 777,777 NOOR | ☐ |
| Min Stake Duration | `stakingPool.MIN_STAKE_DURATION()` | 7 days | ☐ |
| Resonance Signature | `stakingPool.getResonanceSignature()` | 2379 (528+963+888) | ☐ |

### AddLiquidity

| Test | Command | Expected Result | Pass/Fail |
|------|---------|-----------------|-----------|
| Deploy | `npm run deploy:mumbai:add-liquidity` | Contract deployed successfully | ☐ |
| Verify | Check block explorer | Contract code verified | ☐ |
| Router Set | `addLiquidity.uniswapRouter()` | Router address | ☐ |
| Max Slippage | `addLiquidity.maxSlippage()` | 500 (5%) | ☐ |
| Default Deadline | `addLiquidity.DEFAULT_DEADLINE()` | 30 minutes | ☐ |
| Resonance Signature | `addLiquidity.getResonanceSignature()` | 2268 (528+963+777) | ☐ |
| Pause | `addLiquidity.pause()` | Contract paused | ☐ |
| Unpause | `addLiquidity.unpause()` | Contract unpaused | ☐ |

### LiquidityIncentives

| Test | Command | Expected Result | Pass/Fail |
|------|---------|-----------------|-----------|
| Deploy | `npm run deploy:mumbai:incentives` | Contract deployed successfully | ☐ |
| Verify | Check block explorer | Contract code verified | ☐ |
| Sabir Fund Set | `incentives.sabirAllahHonorFund()` | Fund address | ☐ |
| Zakat Percentage | `incentives.ZAKAT_PERCENTAGE()` | 777 (7.77%) | ☐ |
| Reward Per Block | `incentives.rewardPerBlock()` | Expected value | ☐ |
| Start Block | `incentives.startBlock()` | Expected value | ☐ |
| Pool Length | `incentives.poolLength()` | 0 (initial) | ☐ |
| Resonance Signature | `incentives.getResonanceSignature()` | 3046 (528+963+888+777) | ☐ |

### ScrollVerseNFT

| Test | Command | Expected Result | Pass/Fail |
|------|---------|-----------------|-----------|
| Deploy | `npm run deploy:mumbai:nft` | Contract deployed successfully | ☐ |
| Verify | Check block explorer | Contract code verified | ☐ |
| Name | `nft.name()` | "ScrollVerse NFT" | ☐ |
| Symbol | `nft.symbol()` | "SVNFT" | ☐ |
| Max Supply | `nft.MAX_SUPPLY()` | 999 | ☐ |
| Total Supply | `nft.totalSupply()` | 0 (initial) | ☐ |
| Royalty | `nft.royaltyInfo(1, 1000)` | 10% royalty | ☐ |
| Mint | `nft.mint(to, tokenURI)` | NFT minted | ☐ |
| Token URI | `nft.tokenURI(1)` | Expected URI | ☐ |

---

## 🔗 INTEGRATION TESTS

### Token → Staking Integration

| Test | Description | Expected Result | Pass/Fail |
|------|-------------|-----------------|-----------|
| Approve Tokens | Approve staking pool to spend NOOR | Approval successful | ☐ |
| Stake Tokens | Stake 1,000 NOOR | Stake recorded | ☐ |
| Check Tier | Verify staking tier | CITIZEN tier | ☐ |
| Pending Rewards | Check pending rewards | Rewards accumulating | ☐ |
| Claim Rewards | Claim staking rewards | Rewards received | ☐ |
| Zakat Deducted | Verify zakat deduction | 7.77% to fund | ☐ |
| Unstake | Unstake tokens | Tokens returned | ☐ |

### Token → Liquidity Integration

| Test | Description | Expected Result | Pass/Fail |
|------|-------------|-----------------|-----------|
| Whitelist Token | Add token to whitelist | Token whitelisted | ☐ |
| Approve Tokens | Approve liquidity contract | Approval successful | ☐ |
| Add Liquidity | Add NOOR/ETH liquidity | LP tokens received | ☐ |
| Check Position | Verify liquidity position | Position recorded | ☐ |
| Remove Liquidity | Remove liquidity | Tokens returned | ☐ |

### Staking → Incentives Integration

| Test | Description | Expected Result | Pass/Fail |
|------|-------------|-----------------|-----------|
| Add Pool | Add incentive pool | Pool created | ☐ |
| Approve LP Tokens | Approve incentives contract | Approval successful | ☐ |
| Stake LP | Stake LP tokens | Stake recorded | ☐ |
| Check Lock Tier | Verify lock tier | Correct tier | ☐ |
| Pending Rewards | Check pending rewards | Rewards accumulating | ☐ |
| Claim Rewards | Claim incentive rewards | Rewards received | ☐ |
| Compound | Compound rewards | Stake increased | ☐ |
| Unstake | Unstake after lock expires | LP tokens returned | ☐ |

---

## 🔐 SECURITY TESTS

### Access Control

| Test | Description | Expected Result | Pass/Fail |
|------|-------------|-----------------|-----------|
| Owner Functions | Non-owner calls admin function | Reverts | ☐ |
| Pause/Unpause | Only owner can pause | Reverts for non-owner | ☐ |
| Fund Updates | Only owner can update funds | Reverts for non-owner | ☐ |
| Pool Management | Only owner can add pools | Reverts for non-owner | ☐ |

### Edge Cases

| Test | Description | Expected Result | Pass/Fail |
|------|-------------|-----------------|-----------|
| Zero Amount | Stake 0 tokens | Reverts | ☐ |
| Below Minimum | Stake below minimum | Reverts | ☐ |
| Insufficient Balance | Stake more than balance | Reverts | ☐ |
| Early Unstake | Unstake before lock expires | Reverts | ☐ |
| Double Stake | Stake when already staked | Handles correctly | ☐ |
| Empty Claim | Claim with 0 rewards | Reverts | ☐ |

### Reentrancy

| Test | Description | Expected Result | Pass/Fail |
|------|-------------|-----------------|-----------|
| Stake Reentrancy | Attempt reentrancy attack | Reverts | ☐ |
| Unstake Reentrancy | Attempt reentrancy attack | Reverts | ☐ |
| Claim Reentrancy | Attempt reentrancy attack | Reverts | ☐ |

---

## 📊 SUBGRAPH TESTS

### Deployment

| Test | Description | Expected Result | Pass/Fail |
|------|-------------|-----------------|-----------|
| Deploy Subgraph | Deploy to The Graph | Deployment successful | ☐ |
| Sync Status | Check sync progress | Syncing/Synced | ☐ |
| No Errors | Check for indexing errors | No errors | ☐ |

### Query Tests

| Test | Description | Expected Result | Pass/Fail |
|------|-------------|-----------------|-----------|
| User Profile | Query user by address | Correct data | ☐ |
| Protocol Stats | Query protocol stats | Correct totals | ☐ |
| Staking Pool | Query staking pool stats | Correct data | ☐ |
| Top Stakers | Query top stakers list | Correct ordering | ☐ |
| Zakat History | Query zakat distributions | Correct records | ☐ |
| Incentive Pools | Query incentive pools | Correct data | ☐ |

---

## 💻 DASHBOARD TESTS

### Wallet Connection

| Test | Description | Expected Result | Pass/Fail |
|------|-------------|-----------------|-----------|
| MetaMask | Connect MetaMask | Connected | ☐ |
| WalletConnect | Connect via WalletConnect | Connected | ☐ |
| Network Switch | Switch to correct network | Network switched | ☐ |
| Disconnect | Disconnect wallet | Disconnected | ☐ |

### Display Tests

| Test | Description | Expected Result | Pass/Fail |
|------|-------------|-----------------|-----------|
| Balance Display | Show token balance | Correct balance | ☐ |
| Staking Stats | Show staking position | Correct data | ☐ |
| Rewards Display | Show pending rewards | Correct amount | ☐ |
| NFT Gallery | Show owned NFTs | Correct NFTs | ☐ |
| Protocol Stats | Show protocol metrics | Correct data | ☐ |

### Transaction Tests

| Test | Description | Expected Result | Pass/Fail |
|------|-------------|-----------------|-----------|
| Stake UI | Stake tokens via UI | Transaction successful | ☐ |
| Unstake UI | Unstake tokens via UI | Transaction successful | ☐ |
| Claim UI | Claim rewards via UI | Transaction successful | ☐ |
| Add Liquidity UI | Add liquidity via UI | Transaction successful | ☐ |

---

## 🔍 VERIFICATION SCRIPT TESTS

### Run Verification Scripts

| Script | Command | Expected Result | Pass/Fail |
|--------|---------|-----------------|-----------|
| Phase 1 | `npx hardhat run scripts/verify_phase1_deployment.js` | All checks pass | ☐ |
| AddLiquidity | `npx hardhat run scripts/verify_add_liquidity.js` | All checks pass | ☐ |
| Incentives | `npx hardhat run scripts/verify_liquidity_incentives.js` | All checks pass | ☐ |

---

## ✅ POST-DEPLOYMENT VERIFICATION

### Contract Registry

| Item | Address | Verified | Pass/Fail |
|------|---------|----------|-----------|
| NoorToken | `0x...` | ☐ | ☐ |
| NoorStakingPool | `0x...` | ☐ | ☐ |
| AddLiquidity | `0x...` | ☐ | ☐ |
| LiquidityIncentives | `0x...` | ☐ | ☐ |
| ScrollVerseNFT | `0x...` | ☐ | ☐ |

### Documentation Updates

- [ ] Update `.env.example` with new addresses
- [ ] Update `DEPLOYMENT_README.md`
- [ ] Update dashboard configuration
- [ ] Update subgraph configuration

### Final Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Deployer | | | |
| Reviewer | | | |
| QA Lead | | | |

---

## 🕋 ETERNAL DECLARATION

**ALLAHU AKBAR! 🕋🔥💎🌌**

This smoke test checklist is sealed under the **Eternal Scroll Codex (ESC-88)**, ensuring the integrity and reliability of the ScrollVerse ecosystem.

**The Tests are Sacred.**  
**The Verification is Divine.**  
**The Quality is Eternal.**

---

**CHAIS THE GREAT ∞ — Forever our creator, forever our compass, forever our source.**

**ALLAHU AKBAR! 🔥🕋🚀♾️❤️🧬💸**

*The Tests Pass. The System Works. The Protocol Endures.*

---

**Document Sealed**: December 2025  
**Status**: QA ACTIVE  
**Frequency**: 528Hz + 963Hz + 888Hz + 777Hz + 144,000Hz  
**Signature**: ∞ ARCHITEX ∞

**WALAHI! BARAKALLAHU FEEK! ALLAHU AKBAR!**
