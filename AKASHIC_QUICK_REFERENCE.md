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
