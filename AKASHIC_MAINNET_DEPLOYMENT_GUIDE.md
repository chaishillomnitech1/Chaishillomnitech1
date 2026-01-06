# Akashic Records Label - Polygon Mainnet Deployment Guide

## 📋 Overview

This guide provides step-by-step instructions for deploying the Akashic Records Label ecosystem to Polygon mainnet. The deployment includes:

1. **AkashicRecordsLabel** - NFT contract for the music catalog (26+ tracks)
2. **AkashicTreasuryVault** - Treasury management with automated Zakat routing (7.77%)
3. **AkashicRecordsDAO** - Governance contract with quadratic voting

## 🎯 Deployment Objectives

- Deploy immutable NFT repository for Genesis Drop catalog (26+ tracks)
- Activate DAO governance with 50 founding members
- Distribute 144,000 genesis $AKASHIC governance tokens
- Implement ERC-2981 royalty standard with divine revenue allocation:
  - 70% Artists
  - 15% Treasury
  - 7.77% Zakat (automated)
  - 7.23% Operations
- Pin metadata to IPFS with Arweave redundancy
- Optimize for gas efficiency on Polygon mainnet

## 🔧 Prerequisites

### Environment Setup

1. **Node.js & npm**: Version 14+ required
   ```bash
   node --version
   npm --version
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

   Required variables:
   ```env
   PRIVATE_KEY=your_deployer_private_key_here
   POLYGON_MAINNET_RPC_URL=https://polygon-rpc.com
   POLYGONSCAN_API_KEY=your_polygonscan_api_key_here
   
   # Optional: Custom addresses
   AKASHIC_BASE_URI=ipfs://QmYourIPFSHash/
   ROYALTY_RECIPIENT_ADDRESS=0xYourAddress
   ZAKAT_RECIPIENT_ADDRESS=0xZakatRecipientAddress
   OPERATIONS_ADDRESS=0xOperationsAddress
   ```

### Wallet Requirements

- **MATIC Balance**: Minimum 50 MATIC recommended for deployment and initial operations
- **Deployer Wallet**: Secure wallet with sufficient funds
- **Multi-sig Recommended**: For treasury and admin operations

### Pre-Deployment Checklist

- [ ] Smart contracts reviewed and audited
- [ ] Test deployment on Mumbai testnet completed
- [ ] All test suites passing
- [ ] Environment variables configured
- [ ] MATIC balance confirmed
- [ ] Backup private keys securely stored
- [ ] Metadata prepared for IPFS upload

## 📦 Deployment Steps

### Option 1: Complete Suite Deployment (Recommended)

Deploy all contracts in one transaction sequence:

```bash
npm run deploy:polygon:akashic-suite
```

This will:
1. Deploy AkashicRecordsLabel
2. Deploy AkashicTreasuryVault
3. Deploy AkashicRecordsDAO
4. Configure relationships between contracts
5. Save deployment addresses to `deployment/` directory

### Option 2: Individual Contract Deployment

Deploy contracts one at a time:

#### Step 1: Deploy Label Contract

```bash
npm run deploy:polygon:akashic-label
```

**Expected Output**:
- Contract address saved to `deployment/akashic-label-polygon.json`
- Total supply: 0 (before minting)
- Frequencies: 528Hz, 963Hz, 999Hz, 144000Hz

#### Step 2: Deploy Treasury Vault

```bash
npm run deploy:polygon:akashic-treasury
```

**Expected Output**:
- Contract address saved to `deployment/akashic-treasury-polygon.json`
- Revenue allocation percentages verified
- Zakat recipient configured

#### Step 3: Deploy DAO

```bash
npm run deploy:polygon:akashic-dao
```

**Expected Output**:
- Contract address saved to `deployment/akashic-dao-polygon.json`
- Max founding members: 50
- Quorum percentage: 10%

## 🎵 Post-Deployment Steps

### 1. Verify Contracts on PolygonScan

After deployment, verify each contract:

```bash
# Verify Label
npx hardhat verify --network polygon <LABEL_ADDRESS> "ipfs://QmHash/" "<ROYALTY_RECIPIENT>" "<TREASURY_VAULT_ADDRESS>"

# Verify Treasury Vault
npx hardhat verify --network polygon <VAULT_ADDRESS> "<LABEL_ADDRESS>" "<ZAKAT_RECIPIENT>" "<OPERATIONS_ADDRESS>"

# Verify DAO
npx hardhat verify --network polygon <DAO_ADDRESS> "<LABEL_ADDRESS>"
```

### 2. Prepare and Upload Metadata

```bash
# Generate metadata files
npm run prepare:ipfs-metadata

# Upload to IPFS using Pinata, NFT.Storage, or Web3.Storage
# Follow instructions in scripts/prepare_ipfs_metadata.js
```

**IPFS Services**:
- [Pinata](https://pinata.cloud) - Recommended for reliability
- [NFT.Storage](https://nft.storage) - Free, backed by Protocol Labs
- [Web3.Storage](https://web3.storage) - Alternative option

**Arweave Backup**:
```bash
# Install Bundlr
npm install -g @bundlr-network/client

# Upload to Arweave
bundlr upload ./nft-assets/akashic-records --currency matic
```

### 3. Update Contract Base URI

After uploading to IPFS, update the base URI:

```javascript
// Using Hardhat console
npx hardhat console --network polygon

const label = await ethers.getContractAt("AkashicRecordsLabel", "<LABEL_ADDRESS>");
await label.setBaseURI("ipfs://QmYourActualHash/");
```

### 4. Mint Genesis Drop Catalog

Mint the 26 genesis tracks:

```bash
npm run mint:genesis-drop
```

**Tracks Included**:
1. Throwing Stones
2. Promise Land
3. Ghetto Gospel
4. BISMILLAHIR RAHMANIR RAHEEM
5. Divine Frequencies
6. 528Hz Love Resonance
7. NŪR Pulse Activation
8. Akashic Awakening
9. Sovereign Anthem
10. Trinity Harmony
... (26 total)

### 5. Register Track Artists in Treasury

After minting, register artists for royalty allocation:

```javascript
// Batch register artists
const vault = await ethers.getContractAt("AkashicTreasuryVault", "<VAULT_ADDRESS>");
const tokenIds = [0, 1, 2, 3, ...]; // All token IDs
const artists = ["<ARTIST_ADDRESS>", ...]; // Corresponding artist addresses

await vault.batchRegisterTrackArtists(tokenIds, artists);
```

### 6. Distribute Genesis Tokens & Onboard DAO Members

Onboard 50 founding members and distribute 144,000 $AKASHIC tokens:

```bash
npm run distribute:genesis-tokens
```

**Token Distribution**:
- 1 Sovereign: 5,000 tokens
- 4 Prophets: 4,000 tokens each
- 10 Core: 3,000 tokens each
- 15 Contributors: 2,000 tokens each
- 20 Community: 1,500 tokens each

**Total**: 144,000 genesis tokens

### 7. Grant Roles and Permissions

```javascript
const dao = await ethers.getContractAt("AkashicRecordsDAO", "<DAO_ADDRESS>");
const vault = await ethers.getContractAt("AkashicTreasuryVault", "<VAULT_ADDRESS>");

// Grant DAO governance role to trusted addresses
const GOVERNANCE_ROLE = await dao.GOVERNANCE_ROLE();
await dao.grantRole(GOVERNANCE_ROLE, "<TRUSTED_ADDRESS>");

// Grant distributor role in vault
const DISTRIBUTOR_ROLE = await vault.DISTRIBUTOR_ROLE();
await vault.grantRole(DISTRIBUTOR_ROLE, "<DISTRIBUTOR_ADDRESS>");
```

## 🧪 Testing

### Test Deployed Contracts

```bash
# Run full test suite
npm run test:akashic-all

# Test individual contracts
npm run test:akashic-label
npm run test:akashic-dao
npm run test:akashic-treasury
```

### Manual Verification Checklist

- [ ] Label contract deployed and verified
- [ ] Treasury vault deployed and verified
- [ ] DAO deployed and verified
- [ ] Label treasury set to vault address
- [ ] All 26 genesis tracks minted
- [ ] Track artists registered in vault
- [ ] Metadata uploaded to IPFS
- [ ] Metadata backed up to Arweave
- [ ] Base URI updated in contract
- [ ] 50 founding members onboarded
- [ ] 144,000 tokens distributed
- [ ] Roles and permissions configured
- [ ] Test revenue allocation (small amount)
- [ ] Test Zakat auto-distribution
- [ ] Test DAO proposal creation
- [ ] Test quadratic voting

## 💰 Revenue Allocation Testing

Send a test transaction to verify revenue allocation:

```javascript
const vault = await ethers.getContractAt("AkashicTreasuryVault", "<VAULT_ADDRESS>");

// Deposit 10 MATIC
await vault.depositRevenue({ value: ethers.parseEther("10") });

// Check allocations
const metrics = await vault.getTreasuryMetrics();
console.log("Treasury Balance:", ethers.formatEther(metrics.treasuryBalance));
console.log("Operations Balance:", ethers.formatEther(metrics.operationsBalance));

// Check Zakat (should auto-distribute if > 1 MATIC)
const zakatDistribution = await vault.getZakatDistribution();
console.log("Zakat Distributed:", ethers.formatEther(zakatDistribution.totalDistributed));
```

## 📊 Monitoring & Analytics

### Track Key Metrics

1. **Label Metrics**:
   - Total tracks minted
   - Engagement scores
   - Royalties earned per track

2. **Treasury Metrics**:
   - Total revenue received
   - Artist payouts
   - Zakat distributed
   - Treasury balance

3. **DAO Metrics**:
   - Total members
   - Active proposals
   - Voting participation
   - Total voting power

### Setup Monitoring Tools

- **The Graph**: Index contract events for analytics
- **Dune Analytics**: Create dashboards for metrics
- **Tenderly**: Monitor transactions and alerts

## 🔒 Security Best Practices

1. **Multi-sig Wallet**: Use Gnosis Safe for treasury admin operations
2. **Timelock**: Consider adding timelock for critical operations
3. **Access Control**: Regularly audit role assignments
4. **Emergency Procedures**: Document pause/unpause procedures
5. **Backup Keys**: Store private keys securely in multiple locations

## 🆘 Troubleshooting

### Common Issues

**Issue**: "Insufficient funds for gas"
- **Solution**: Ensure deployer wallet has at least 50 MATIC

**Issue**: "Contract already deployed"
- **Solution**: Check `deployment/` directory for existing addresses

**Issue**: "IPFS hash not resolving"
- **Solution**: Verify pinning service and wait for propagation

**Issue**: "Transaction failed: Revert"
- **Solution**: Check contract state and requirements in error message

### Support Contacts

- **Technical Support**: [GitHub Issues](https://github.com/chaishillomnitech1/Chaishillomnitech1/issues)
- **Community**: Discord/Telegram (to be announced)

## 📝 Post-Launch Checklist

- [ ] Announce deployment on social media
- [ ] Create first DAO proposal
- [ ] Distribute initial rewards to founding members
- [ ] Set up community channels (Discord, Telegram)
- [ ] Launch marketing campaign for Genesis Drop
- [ ] Create artist onboarding guide
- [ ] Set up royalty distribution schedule
- [ ] Monitor first Zakat distribution
- [ ] Gather community feedback
- [ ] Plan Phase 2 features

## 🎯 Success Criteria

Deployment is successful when:
- ✅ All contracts verified on PolygonScan
- ✅ 26 genesis tracks minted and visible
- ✅ 50 founding members onboarded
- ✅ First DAO proposal created and voted on
- ✅ Revenue allocation tested and verified
- ✅ Zakat auto-distribution functional
- ✅ Metadata accessible via IPFS
- ✅ Community engagement initiated

## 🕋 Final Notes

**ALLĀHU AKBAR!** 

This deployment represents the immortalization of Chais The Great's music catalog on the blockchain, with divine revenue allocation ensuring artists, community, and charitable giving are all honored.

**Frequencies**: 528Hz (Love) + 963Hz (Unity) + 999Hz (Crown) + 777Hz (Divine Wisdom) + 144,000Hz (NŪR Pulse)

**Revenue Allocation**:
- 70% Artists - Honoring creators
- 15% Treasury - Sustainable growth
- 7.77% Zakat - Divine charity
- 7.23% Operations - Infrastructure

**May this deployment bring prosperity, unity, and healing to all who engage with these sacred frequencies.**

---

**Document Version**: 1.0.0  
**Last Updated**: 2026-01-04  
**Status**: Ready for Mainnet Deployment  
**Contact**: Supreme King Chais The Great ∞
