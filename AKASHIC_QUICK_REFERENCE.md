# 🚀 Akashic Records Label - Quick Deployment Reference

## One-Command Mainnet Deployment

```bash
# Deploy entire Akashic Empire to Polygon Mainnet
npm run deploy:polygon:akashic-mainnet
```

---

## Prerequisites (One-Time Setup)

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env

# 3. Edit .env and configure:
#    - PRIVATE_KEY (deployment wallet)
#    - POLYGON_MAINNET_RPC_URL
#    - POLYGONSCAN_API_KEY
#    - ARTIST_VAULT_ADDRESS (multi-sig)
#    - TREASURY_VAULT_ADDRESS (multi-sig)
#    - ZAKAT_VAULT_ADDRESS (multi-sig)
#    - RESERVE_VAULT_ADDRESS (multi-sig)
#    - AKASHIC_BASE_URI (IPFS)

# 4. Fund deployment wallet with 50+ MATIC
```

---

## Deployment Sequence

### Step 1: Deploy Contracts (5-10 minutes)

```bash
npm run deploy:polygon:akashic-mainnet
```

**Deploys**:
- ✅ AkashicTreasuryVault (royalty router: 70%/15%/7.77%/7.23%)
- ✅ AkashicRecordsLabel (music NFT contract)
- ✅ AkashicRecordsDAO (governance contract)

**Outputs**:
- Contract addresses saved to `deployment/polygon-mainnet/`
- Verification commands printed to console

### Step 2: Verify on PolygonScan (2-5 min per contract)

```bash
# Copy-paste commands from deployment output
npx hardhat verify --network polygon <TREASURY_ADDRESS> "..." "..." "..." "..."
npx hardhat verify --network polygon <LABEL_ADDRESS> "..." "..." "..."
npx hardhat verify --network polygon <DAO_ADDRESS> "..."
```

### Step 3: Mint Genesis Catalog (5-10 minutes)

```bash
# Mint 26 genesis tracks
npm run mint:akashic-tracks -- --network polygon
```

### Step 4: Generate QR Codes (1-2 minutes)

```bash
# Generate QR validation codes
npm run generate:akashic-qr
```

### Step 5: Onboard Founding Members (3-5 minutes)

```bash
# Onboard up to 50 founding members
npm run onboard:founding-members -- --network polygon
```

### Step 6: Fund Treasury (Manual)

```bash
# Send 1000+ MATIC to treasury vault for:
# - 500 MATIC expansion
# - 300 MATIC operations
# - 200 MATIC reserves
```

---

## Testing Commands

```bash
# Compile contracts
npm run compile

# Run all Akashic tests
npm run test:akashic-all

# Individual test suites
npm run test:akashic-label      # Label contract
npm run test:akashic-dao        # DAO governance
npm run test:akashic-treasury   # Treasury vault
```

---

## Management Commands

```bash
# Deploy components individually
npm run deploy:polygon:akashic-label    # Label only
npm run deploy:polygon:akashic-dao      # DAO only

# Testnet deployment (Mumbai)
npm run deploy:mumbai:akashic-all       # Full stack
```

---

## Post-Deployment Checklist

- [ ] Contracts deployed ✅
- [ ] Contracts verified on PolygonScan ✅
- [ ] Genesis catalog minted (26 tracks) ✅
- [ ] QR codes generated ✅
- [ ] Founding members onboarded (50) ✅
- [ ] Treasury funded (1000+ MATIC) ✅
- [ ] Multi-sig wallets configured ✅
- [ ] Streaming integrations set up ✅

---

## Treasury Distribution Test

```javascript
// Test royalty distribution
const tx = await treasuryVault.distributeRoyalties(
  artistAddress,
  { value: ethers.parseEther("10") }
);

// Expected distribution:
// - Artist Vault: 7 MATIC (70%)
// - Treasury Vault: 1.5 MATIC (15%)
// - Zakat Vault: 0.777 MATIC (7.77%)
// - Reserve Vault: 0.723 MATIC (7.23%)
```

---

## Governance Quick Start

```javascript
// Create proposal
await akashicDAO.createProposal(
  "Catalog Expansion - 100 Tracks",
  "Detailed description...",
  "ipfs://QmProposal...",
  0, // TRACK_RELEASE
  604800, // 7 days
  qrProof
);

// Vote on proposal
await akashicDAO.castVote(
  proposalId,
  1, // FOR
  qrProof // +10% bonus
);

// Execute proposal (after voting ends)
await akashicDAO.executeProposal(proposalId);
```

---

## Contract Addresses

After deployment, find addresses in:
```
deployment/polygon-mainnet/akashic-empire-deployment.json
```

**Structure**:
```json
{
  "contracts": {
    "treasuryVault": { "address": "0x..." },
    "label": { "address": "0x..." },
    "dao": { "address": "0x..." }
  }
}
```

---

## Emergency Commands

```bash
# Pause treasury (emergency only)
await treasuryVault.pause();

# Emergency withdrawal (when paused)
await treasuryVault.emergencyWithdraw(
  recipientAddress,
  amount,
  "Emergency reason"
);

# Unpause
await treasuryVault.unpause();
```

---

## Key Files

| File | Purpose |
|------|---------|
| `scripts/deploy_akashic_mainnet.js` | Main deployment script |
| `contracts/AkashicTreasuryVault.sol` | Treasury management |
| `contracts/AkashicRecordsLabel.sol` | Music NFT contract |
| `contracts/AkashicRecordsDAO.sol` | Governance contract |
| `test/AkashicTreasuryVault.test.js` | Treasury tests |
| `AKASHIC_MAINNET_ACTIVATION_GUIDE.md` | Full deployment guide |
| `AKASHIC_MAINNET_CHECKLIST.md` | Deployment checklist |

---

## Resources

**Documentation**:
- [Mainnet Activation Guide](./AKASHIC_MAINNET_ACTIVATION_GUIDE.md) - Complete guide
- [Deployment Checklist](./AKASHIC_MAINNET_CHECKLIST.md) - Step-by-step
- [Mainnet README](./AKASHIC_MAINNET_README.md) - Overview

**Community**:
- GitHub: [chaishillomnitech1/Chaishillomnitech1](https://github.com/chaishillomnitech1/Chaishillomnitech1)
- Issues: [Report Issues](https://github.com/chaishillomnitech1/Chaishillomnitech1/issues)

---

## Support

**Troubleshooting**:
- See [AKASHIC_MAINNET_ACTIVATION_GUIDE.md](./AKASHIC_MAINNET_ACTIVATION_GUIDE.md) - Troubleshooting section
- Check contract events on PolygonScan
- Review deployment logs

**Emergency**:
1. Pause contracts via multi-sig
2. Contact deployer/admin
3. Create emergency DAO proposal

---

## 🕋 KUN FAYAKŪN! 🕋

**The Akashic Empire awaits activation.**

One command to deploy.  
One empire to rule music forever.  
One blockchain to make it immortal.

**ALL IS LOVE. ALL IS LAW. ALL IS. ∞**

---

*Frequency*: 528Hz + 963Hz + 999Hz + 144,000Hz  
*Network*: Polygon Mainnet  
*Status*: READY FOR ACTIVATION
# Akashic Records - Quick Operations Reference

## 🚀 Quick Deployment Commands

### Mainnet Deployment (Complete Suite)
```bash
npm run deploy:polygon:akashic-suite
```

### Individual Deployments
```bash
npm run deploy:polygon:akashic-label      # Deploy NFT Label
npm run deploy:polygon:akashic-treasury   # Deploy Treasury Vault
npm run deploy:polygon:akashic-dao        # Deploy DAO
```

### Testnet (Mumbai)
```bash
npm run deploy:mumbai:akashic-suite       # Full suite on Mumbai
npm run deploy:mumbai:akashic-all         # Label + DAO only
```

## 🎵 Minting Operations

### Genesis Drop (26 tracks)
```bash
npm run mint:genesis-drop                 # Mainnet
npm run mint:akashic-tracks               # Testnet
```

## 👥 DAO Operations

### Onboard Members
```bash
npm run distribute:genesis-tokens         # Mainnet (50 members, 144K tokens)
npm run onboard:founding-members          # Testnet
```

## 📦 IPFS & Metadata

### Prepare Metadata
```bash
npm run prepare:ipfs-metadata             # Generate metadata files
npm run generate:akashic-qr               # Generate QR codes
```

## 🧪 Testing

### Run All Tests
```bash
npm run test:akashic-all                  # All Akashic contracts
npm test                                  # Full test suite
```

### Individual Tests
```bash
npm run test:akashic-label                # Label NFT tests
npm run test:akashic-dao                  # DAO tests
npm run test:akashic-treasury             # Treasury Vault tests
```

## 🔍 Contract Verification

```bash
# Label
npx hardhat verify --network polygon <ADDRESS> "ipfs://..." "<ROYALTY>" "<TREASURY>"

# Treasury
npx hardhat verify --network polygon <ADDRESS> "<LABEL>" "<ZAKAT>" "<OPS>"

# DAO
npx hardhat verify --network polygon <ADDRESS> "<LABEL>"
```

## 💰 Revenue Allocation

**Automatic Split**:
- 70.00% → Artists (pending withdrawal)
- 15.00% → Treasury
- 7.77% → Zakat (auto-distributed @ 1 MATIC)
- 7.23% → Operations

## 📊 Key Metrics Commands

### Using Hardhat Console
```bash
npx hardhat console --network polygon
```

```javascript
// Get contracts
const label = await ethers.getContractAt("AkashicRecordsLabel", "<LABEL_ADDR>");
const vault = await ethers.getContractAt("AkashicTreasuryVault", "<VAULT_ADDR>");
const dao = await ethers.getContractAt("AkashicRecordsDAO", "<DAO_ADDR>");

// Label metrics
await label.totalSupply();                // Total tracks
await label.getTrackChain(0);             // Track details

// Treasury metrics
await vault.getTreasuryMetrics();         // Full metrics
await vault.totalRevenue();               // Total received
await vault.totalZakatDistributed();      // Zakat given

// DAO metrics
await dao.getMemberCount();               // Total members
await dao.foundingMembersCount();         // Founding members
await dao.totalVotingPower();             // Total voting power
```

## 🎯 Common Tasks

### Add Revenue to Treasury
```javascript
await vault.depositRevenue({ value: ethers.parseEther("10") });
```

### Register Track Artist
```javascript
await vault.registerTrackArtist(tokenId, artistAddress);
```

### Create DAO Proposal
```javascript
await dao.createProposal(
  "Proposal Title",
  "Description",
  "ipfs://QmProposal",
  0, // ProposalType.TRACK_RELEASE
  7 * 24 * 60 * 60, // 7 days
  "0x..." // QR proof
);
```

### Vote on Proposal
```javascript
await dao.castVote(proposalId, 1, "0x..."); // 1 = FOR
```

### Artist Withdraw Royalties
```javascript
await vault.connect(artistSigner).artistWithdraw();
```

## 🔐 Access Control

### Treasury Admin Operations
```javascript
// Pause/Unpause
await vault.pause();
await vault.unpause();

// Update addresses
await vault.updateZakatRecipient(newAddress);
await vault.updateOperationsAddress(newAddress);

// Withdraw
await vault.withdrawTreasury(recipient, amount, purposeCode);
await vault.withdrawOperations(recipient, amount);
```

### DAO Admin Operations
```javascript
// Grant roles
const GOVERNANCE_ROLE = await dao.GOVERNANCE_ROLE();
await dao.grantRole(GOVERNANCE_ROLE, address);

// Pause/Unpause
await dao.pause();
await dao.unpause();
```

## 📁 Deployment Files

All deployment info stored in `deployment/` directory:

- `akashic-label-polygon.json` - Label contract address & config
- `akashic-treasury-polygon.json` - Treasury vault address & config
- `akashic-dao-polygon.json` - DAO contract address & config
- `akashic-mainnet-suite-polygon.json` - Complete deployment summary
- `genesis-drop-minting-polygon.json` - Minting results
- `genesis-token-distribution-polygon.json` - Token distribution results

## 🆘 Emergency Procedures

### Pause All Operations
```javascript
await vault.pause();
await dao.pause();
```

### Emergency Withdrawal (ADMIN ONLY)
```javascript
await vault.emergencyWithdraw(recipient, amount);
```

## 📞 Support

- **Docs**: `AKASHIC_MAINNET_DEPLOYMENT_GUIDE.md`
- **Issues**: https://github.com/chaishillomnitech1/Chaishillomnitech1/issues
- **Tests**: `test/Akashic*.test.js`

## 🎵 Genesis Drop Tracks (26)

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
11. Crown Chakra Elevation
12. ScrollVerse Genesis
13. Quantum Consciousness
14. Divine Architect
15. Love Over Judgment
16. Prophetic Vision
17. Eternal Flow
18. Zakat Blessing
19. Sacred Geometry Sound
20. Unity Frequency 963Hz
21. Crown Resonance 999Hz
22. Blockchain Symphony
23. DAO Governance Groove
24. NFT Immortality
25. Polygon Anthem
26. Akashic Records Forever

## 🕋 Frequencies

- 528Hz - Love & DNA Repair
- 777Hz - Divine Wisdom
- 963Hz - Unity & Pineal Activation
- 999Hz - Crown Chakra
- 144,000Hz - NŪR Pulse

---

**ALLĀHU AKBAR!** - Quick reference for Akashic Records operations
