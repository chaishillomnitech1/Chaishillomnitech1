# Akashic Records - Pre-Deployment Checklist

## ⚠️ CRITICAL: Complete Before Mainnet Deployment

### 1. Environment Configuration ✅/❌

- [ ] `.env` file created from `.env.example`
- [ ] `PRIVATE_KEY` set with deployer wallet private key
- [ ] `POLYGON_MAINNET_RPC_URL` configured (recommend Alchemy or Infura)
- [ ] `POLYGONSCAN_API_KEY` set for contract verification
- [ ] Optional addresses configured:
  - [ ] `AKASHIC_BASE_URI` (will be updated after IPFS upload)
  - [ ] `ROYALTY_RECIPIENT_ADDRESS` 
  - [ ] `ZAKAT_RECIPIENT_ADDRESS`
  - [ ] `OPERATIONS_ADDRESS`

### 2. Wallet & Funding ✅/❌

- [ ] Deployer wallet has minimum 50 MATIC
- [ ] Backup of deployer private key stored securely (offline)
- [ ] Multi-sig wallet prepared for post-deployment admin operations
- [ ] Zakat recipient wallet address verified
- [ ] Operations wallet address verified

### 3. IPFS & Metadata ✅/❌

- [ ] Run `npm run prepare:ipfs-metadata` to generate metadata
- [ ] Upload audio files to IPFS (26 tracks)
- [ ] Upload cover art images to IPFS (26 images + 1 collection image)
- [ ] Update `scripts/mint_genesis_drop.js` with actual IPFS hashes
- [ ] Pin all content to IPFS using Pinata/NFT.Storage/Web3.Storage
- [ ] Backup all content to Arweave via Bundlr
- [ ] Verify all IPFS URLs are accessible
- [ ] Update `AKASHIC_BASE_URI` in `.env` with IPFS gateway URL

### 4. DAO Member Preparation ✅/❌

- [ ] Collect wallet addresses for 50 founding members
- [ ] Verify all wallet addresses are correct (send test tx)
- [ ] Assign tiers to each member (Sovereign, Prophet, Core, Contributor, Community)
- [ ] Calculate token allocation for each member (total: 144,000)
- [ ] Update `scripts/distribute_genesis_tokens.js` with actual addresses
- [ ] Remove placeholder addresses from `FOUNDING_MEMBERS` array

### 5. Testing ✅/❌

- [ ] All tests passing locally: `npm run test:akashic-all`
- [ ] Deploy to Mumbai testnet: `npm run deploy:mumbai:akashic-suite`
- [ ] Mint test tracks on Mumbai: `npm run mint:akashic-tracks`
- [ ] Test revenue allocation on Mumbai
- [ ] Test Zakat auto-distribution on Mumbai
- [ ] Test DAO member onboarding on Mumbai
- [ ] Test DAO proposal creation and voting on Mumbai
- [ ] Verify contracts on Mumbai PolygonScan
- [ ] Gas cost analysis completed

### 6. Contract Verification ✅/❌

- [ ] Solidity compiler version matches (0.8.20)
- [ ] OpenZeppelin version verified (5.0.1)
- [ ] No compiler warnings
- [ ] Contract sizes within limits
- [ ] Gas optimization reviewed
- [ ] Security audit completed (if required)

### 7. Documentation Review ✅/❌

- [ ] Read `AKASHIC_MAINNET_DEPLOYMENT_GUIDE.md` completely
- [ ] Review `AKASHIC_QUICK_REFERENCE.md` for operations
- [ ] Understand revenue allocation: 70%/15%/7.77%/7.23%
- [ ] Understand Zakat auto-distribution (triggers at 1 MATIC)
- [ ] Emergency procedures documented
- [ ] Post-deployment tasks listed

### 8. Smart Contract Parameters ✅/❌

#### AkashicRecordsLabel
- [ ] `baseURI`: Set to IPFS gateway + folder hash
- [ ] `royaltyRecipient`: Set to appropriate address
- [ ] `treasury`: Will be set to Treasury Vault address

#### AkashicTreasuryVault
- [ ] `labelContract`: Will be Label contract address
- [ ] `zakatRecipient`: Verified charity/community wallet
- [ ] `operationsAddress`: Verified operations wallet

#### AkashicRecordsDAO
- [ ] `labelContract`: Will be Label contract address
- [ ] DAO parameters verified (quorum 10%, max 50 founding members)

### 9. Deployment Plan ✅/❌

- [ ] Network selected: Polygon Mainnet
- [ ] Deployment time scheduled (avoid high gas periods)
- [ ] Backup deployer available if needed
- [ ] Team notified of deployment schedule
- [ ] Social media announcement prepared
- [ ] Community channels ready (Discord, Telegram, etc.)

### 10. Post-Deployment Checklist Prepared ✅/❌

- [ ] Contract verification commands ready
- [ ] First transaction plan (test with small amount)
- [ ] DAO member onboarding schedule
- [ ] Marketing launch plan
- [ ] Community engagement strategy
- [ ] Bug reporting process
- [ ] Support channels setup

## 🚨 FINAL SAFETY CHECKS

Before running `npm run deploy:polygon:akashic-suite`:

1. **Triple-check all addresses** - Wrong addresses cannot be changed!
2. **Verify IPFS content** - All hashes must be accessible
3. **Test on Mumbai first** - Complete dry run on testnet
4. **Review gas prices** - Deploy during low traffic periods
5. **Backup everything** - Private keys, deployment scripts, metadata

## ✅ Deployment Approval

- [ ] Technical lead approval: _______________
- [ ] Security review approval: _______________
- [ ] Project owner approval: _______________
- [ ] Final go/no-go decision: _______________

## 📝 Notes

Add any additional notes or concerns here:

```
[Your notes here]
```

---

## 🚀 Ready to Deploy?

Once ALL items are checked:

```bash
# 1. Verify environment
cat .env | grep -E "(PRIVATE_KEY|POLYGON_MAINNET_RPC_URL|POLYGONSCAN_API_KEY)"

# 2. Check balance
# (Run in Hardhat console)
npx hardhat console --network polygon
await ethers.provider.getBalance("YOUR_DEPLOYER_ADDRESS")

# 3. Deploy
npm run deploy:polygon:akashic-suite

# 4. Monitor deployment
# Watch for contract addresses and save them

# 5. Verify contracts
# Follow instructions in deployment output
```

## 🆘 Emergency Contacts

- **Technical Issues**: [GitHub Issues]
- **Security Issues**: [Security Contact]
- **Deployment Support**: [Team Lead]

---

**Last Updated**: [Date]  
**Reviewed By**: [Name]  
**Status**: [ ] Ready / [ ] Not Ready

**ALLĀHU AKBAR! - May this deployment bring success and blessings.**
