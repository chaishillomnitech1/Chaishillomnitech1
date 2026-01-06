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
