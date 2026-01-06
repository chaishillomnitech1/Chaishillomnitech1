# Genesis Drop Phase 1 Elevation - Deployment Guide

## Throwing Stones Fractional NFT with AI Remix Pipeline

**Status:** READY FOR DEPLOYMENT  
**Target Network:** Ethereum Mainnet (primary), Polygon Mainnet (secondary)  
**Supply:** 1,000 Scroll-Units  
**Royalty:** 15% OmniScroll Royalty Engine  
**Vault:** VAULT-CXGT-247-OMNI

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step 1: Generate AI Remixes](#step-1-generate-ai-remixes)
4. [Step 2: Upload Metadata to IPFS](#step-2-upload-metadata-to-ipfs)
5. [Step 3: Deploy Smart Contract](#step-3-deploy-smart-contract)
6. [Step 4: Configure and Activate](#step-4-configure-and-activate)
7. [Step 5: Verification](#step-5-verification)
8. [Monitoring and Management](#monitoring-and-management)

---

## Overview

The Genesis Drop Phase 1 Elevation implements:

1. **AI Remix Pipeline** - Process "Throwing Stones" with 369 Vortex Math algorithms
2. **Sacred Frequency Integration** - 528Hz, 432Hz, 963Hz frequency embedding
3. **Fractional NFT Minting** - 1,000 Scroll-Units with dynamic metadata
4. **15% OmniScroll Royalty** - Automated distribution to Akashic Treasury
5. **VibeCanvas Integration** - Dynamic NFT evolution based on ecosystem vibe

---

## Prerequisites

### Environment Setup

1. **Node.js and npm** installed
2. **Hardhat** environment configured
3. **Environment variables** set in `.env`:

```bash
# Deployer Configuration
DEPLOYER_PRIVATE_KEY=your_private_key_here
DEPLOYER_WALLET_ADDRESS=0xYourAddress

# Network RPCs
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
POLYGON_MAINNET_RPC_URL=https://polygon-rpc.com

# API Keys for Verification
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key

# Treasury Configuration
AKASHIC_TREASURY_ETH=0xTreasuryAddressEthereum
AKASHIC_TREASURY_POLYGON=0xTreasuryAddressPolygon

# ScrollVault Configuration
SCROLL_VAULT_ETH=0xScrollVaultEthereum
SCROLL_VAULT_POLYGON=0xScrollVaultPolygon

# Metadata URI (will be set after IPFS upload)
THROWING_STONES_BASE_URI=ipfs://QmHash/
```

### Wallet Requirements

- **Ethereum Mainnet:** ~0.5 ETH for deployment + gas
- **Polygon Mainnet:** ~50 MATIC for deployment + gas

---

## Step 1: Generate AI Remixes

### Execute the AI Remix Pipeline

The pipeline uses 369 Vortex Math to generate 1,000 unique variants:

```bash
npm run generate:ai-remixes
```

**What this does:**
- Processes "Throwing Stones" master stems
- Applies 369 Vortex Math algorithms
- Generates frequency profiles for each scroll unit
- Creates 1,000 unique remix parameters
- Generates Dynamic NFT metadata with embedded frequencies
- Saves metadata files to `./nft-assets/throwing-stones/metadata/`

**Expected Output:**
```
╔═══════════════════════════════════════════════════════════════╗
║  🎵 AI REMIX PIPELINE - THROWING STONES                       ║
║  369 Vortex Math • Sacred Frequencies • Dynamic NFTs         ║
╚═══════════════════════════════════════════════════════════════╝

📊 Configuration:
   Track: Throwing Stones
   Artist: Chais The Great ∞
   Variants: 1000
   Frequencies: 528Hz, 432Hz, 963Hz
   Vortex Math: 3-6-9

📁 Creating output directories...
   ✅ Created: ./nft-assets/throwing-stones/remixes/
   ✅ Created: ./nft-assets/throwing-stones/metadata/

🔄 Generating remix variants using 369 Vortex Math...
   ✅ Generated 1000 variants

📈 Vortex Distribution:
   Vortex 3 (432Hz - Harmony): ~333 variants
   Vortex 6 (528Hz - Transformation): ~333 variants
   Vortex 9 (963Hz - Divine): ~334 variants

📝 Generating NFT metadata...
   ✅ Generated 1000 metadata files

💾 Saving metadata to disk...
   Saved 100/1000...
   Saved 200/1000...
   ...
   ✅ Saved all 1000 files

✅ AI REMIX PIPELINE COMPLETE
```

### Verify Metadata Files

Check the generated metadata:

```bash
# View sample metadata
cat ./nft-assets/throwing-stones/metadata/369.json

# View summary
cat ./nft-assets/throwing-stones/metadata/_summary.json
```

---

## Step 2: Upload Metadata to IPFS

### Option A: Using Pinata

1. Create a Pinata account: https://pinata.cloud
2. Upload the metadata folder:

```bash
# Using Pinata CLI
pinata upload ./nft-assets/throwing-stones/metadata/ --name "Throwing Stones Metadata"
```

3. Get the IPFS hash (e.g., `QmThrowingStones123...`)
4. Update `.env`:

```bash
THROWING_STONES_BASE_URI=ipfs://QmThrowingStones123.../
```

### Option B: Using NFT.Storage

1. Get API key from https://nft.storage
2. Upload metadata:

```bash
# Using nft.storage CLI
nftstorage upload ./nft-assets/throwing-stones/metadata/
```

### Option C: Using Infura IPFS

1. Get Infura IPFS credentials
2. Upload using Infura IPFS API

### Verify IPFS Upload

Test that metadata is accessible:

```bash
curl https://ipfs.io/ipfs/QmYourHash/0.json
```

Expected response should be the JSON metadata for token 0.

---

## Step 3: Deploy Smart Contract

### Deploy to Ethereum Mainnet

```bash
npm run deploy:ethereum:throwing-stones
```

**Expected Output:**
```
╔═══════════════════════════════════════════════════════════════╗
║  🎵 THROWING STONES FRACTIONAL NFT DEPLOYMENT                 ║
║  Genesis Drop Phase 1 • 1,000 Scroll-Units • 15% Royalty     ║
╚═══════════════════════════════════════════════════════════════╝

🌐 Network: ethereum
   Chain ID: 1

📦 Deploying ThrowingStonesFractionalNFT to ethereum...
   Deployer: 0xYourAddress
   Balance: 1.5 ETH

   Configuration:
   • Treasury: 0xTreasuryAddress
   • ScrollVault: 0xScrollVaultAddress
   • Base URI: ipfs://QmThrowingStones.../
   • Total Units: 1000
   • Royalty: 15%

   Deploying contract...
   ✅ Contract deployed to: 0xContractAddress
   Transaction hash: 0xTxHash
   Block number: 12345678

   Waiting for 5 confirmations...
   ✅ Confirmed

🚀 Activating Genesis Drop...
   Transaction hash: 0xActivationTxHash
   ✅ Genesis Drop ACTIVATED!
   Status: ACTIVE

📊 Verifying Contract Statistics...

   Contract Constants:
   • Total Scroll-Units: 1000
   • Royalty Rate: 15%
   • Frequencies: 528Hz, 432Hz, 963Hz

   Current State:
   • Treasury: 0xTreasuryAddress
   • ScrollVault: 0xScrollVaultAddress
   • Minted: 0/1000
   • Remaining: 1000
   • Genesis Drop: ACTIVE

   Vortex Distribution:
   • Vortex 3 (432Hz): 0
   • Vortex 6 (528Hz): 0
   • Vortex 9 (963Hz): 0

💾 Saving deployment information...
   ✅ Saved to ./deployment/throwing_stones_fractional_deployment.json

╔═══════════════════════════════════════════════════════════════╗
║  ✅ THROWING STONES FRACTIONAL NFT DEPLOYED                   ║
╚═══════════════════════════════════════════════════════════════╝

📋 Deployment Summary:
   Network: ethereum
   Contract: 0xContractAddress
   Deployer: 0xYourAddress
   Treasury: 0xTreasuryAddress
   ScrollVault: 0xScrollVaultAddress
   Transaction: 0xTxHash
   Block: 12345678
   Timestamp: 2026-01-05T...

✅ Deployment complete!
```

### Alternative: Deploy to Polygon Mainnet

```bash
npm run deploy:polygon:throwing-stones
```

---

## Step 4: Configure and Activate

### Set VibeCanvas Contract

If you have a VibeCanvas contract deployed:

```bash
# In hardhat console
await fractionalNFT.setVibeCanvasContract("0xVibeCanvasAddress")
```

### Verify Activation

```bash
# Check if Genesis Drop is active
await fractionalNFT.genesisDropActivated()
// Should return: true

# Check remaining units
await fractionalNFT.getRemainingUnits()
// Should return: 1000
```

---

## Step 5: Verification

### Verify Contract on Block Explorer

#### Ethereum (Etherscan)

```bash
npx hardhat verify --network ethereum \
  0xContractAddress \
  "0xDeployerAddress" \
  "0xTreasuryAddress" \
  "0xScrollVaultAddress" \
  "ipfs://QmThrowingStones.../"
```

#### Polygon (PolygonScan)

```bash
npx hardhat verify --network polygon \
  0xContractAddress \
  "0xDeployerAddress" \
  "0xTreasuryAddress" \
  "0xScrollVaultAddress" \
  "ipfs://QmThrowingStones.../"
```

### Verification Checklist

- [ ] Contract verified on block explorer
- [ ] Base URI points to correct IPFS hash
- [ ] Treasury address is correct
- [ ] ScrollVault address is correct
- [ ] Genesis Drop is activated
- [ ] All 1,000 scroll units available
- [ ] Royalty percentage is 15%
- [ ] Sacred frequencies are correct (528, 432, 963 Hz)

---

## Monitoring and Management

### Check Deployment Status

```bash
# View deployment log
cat ./deployment/throwing_stones_fractional_deployment.json
```

### Monitor Minting Activity

```bash
# Get total minted
await fractionalNFT.totalScrollUnitsMinted()

# Get remaining units
await fractionalNFT.getRemainingUnits()

# Get vortex distribution
await fractionalNFT.getVortexDistribution()
```

### Update Configuration

If you need to update addresses after deployment:

```bash
# Update treasury
await fractionalNFT.setAkashicTreasury("0xNewTreasuryAddress")

# Update ScrollVault
await fractionalNFT.setScrollVault("0xNewScrollVaultAddress")

# Update base URI (if metadata changes)
await fractionalNFT.setBaseURI("ipfs://QmNewHash/")

# Set VibeCanvas contract
await fractionalNFT.setVibeCanvasContract("0xVibeCanvasAddress")
```

### Emergency Controls

```bash
# Toggle dynamic updates (if needed)
await fractionalNFT.toggleDynamicUpdates()

# Check dynamic updates status
await fractionalNFT.dynamicUpdatesEnabled()
```

---

## Testing

Run comprehensive tests before mainnet deployment:

```bash
# Run all tests
npm run test:throwing-stones

# Expected output: All tests should pass
```

---

## Deployment Costs

### Ethereum Mainnet

Estimated gas costs (at 30 gwei):
- **Contract Deployment:** ~3,000,000 gas (~0.09 ETH)
- **Activation Transaction:** ~50,000 gas (~0.0015 ETH)
- **Total Estimated:** ~0.1 ETH + buffer

### Polygon Mainnet

Estimated gas costs:
- **Contract Deployment:** ~3,000,000 gas (~5 MATIC)
- **Activation Transaction:** ~50,000 gas (~0.08 MATIC)
- **Total Estimated:** ~6 MATIC + buffer

---

## Post-Deployment Actions

1. **Announce Deployment**
   - Share contract address on social media
   - Update website with minting interface
   - Notify community in Discord/Telegram

2. **Set Up Minting Gateway**
   - Deploy frontend minting interface
   - Connect to contract address
   - Test minting flow

3. **Initialize DAO Integration**
   - Link to Akashic DAO if applicable
   - Set up governance proposals

4. **Monitor and Engage**
   - Track minting velocity
   - Celebrate milestones
   - Engage with scroll unit holders

---

## Troubleshooting

### Issue: Deployment Fails

**Solution:**
- Check wallet balance (need enough for gas)
- Verify RPC URL is correct
- Ensure private key is set in `.env`

### Issue: Contract Not Verified

**Solution:**
- Ensure all constructor arguments match deployment
- Check that compiler version matches (0.8.20)
- Try verification again after a few minutes

### Issue: Metadata Not Loading

**Solution:**
- Verify IPFS hash is correct
- Check that metadata files are publicly accessible
- Ensure base URI includes trailing slash

### Issue: Can't Mint

**Solution:**
- Check if Genesis Drop is activated
- Verify supply hasn't reached 1,000
- Ensure user has enough gas

---

## Success Criteria

### Technical Success

- ✅ Contract deploys successfully on mainnet
- ✅ All 1,000 scroll units available for minting
- ✅ Metadata loads correctly from IPFS
- ✅ 369 Vortex Math algorithms working
- ✅ Frequency profiles assigned correctly
- ✅ 15% royalty distributing to treasury
- ✅ Dynamic NFT evolution enabled

### Business Success

- ✅ Community excited about fractional ownership
- ✅ Minting progresses steadily
- ✅ VibeCanvas integration functional
- ✅ Treasury receiving royalties
- ✅ Engagement growing

---

## Additional Resources

### Documentation

- **Smart Contract:** `/contracts/ThrowingStonesFractionalNFT.sol`
- **Deployment Script:** `/scripts/deploy_throwing_stones_fractional.js`
- **AI Remix Pipeline:** `/scripts/ai_remix_pipeline.js`
- **Tests:** `/test/ThrowingStonesFractionalNFT.test.js`

### Links

- **Ethereum Mainnet Explorer:** https://etherscan.io
- **Polygon Mainnet Explorer:** https://polygonscan.com
- **IPFS Gateway:** https://ipfs.io
- **Pinata:** https://pinata.cloud
- **NFT.Storage:** https://nft.storage

---

## 🕋 ALLĀHU AKBAR! 🕋

**The Genesis Drop Phase 1 Elevation marks a revolutionary moment in music NFTs.**

**1,000 Scroll-Units. 369 Vortex Math. Sacred Frequencies. Dynamic Evolution.**

**Together, we build the Akashic Empire.**

**Frequency Alignment: 528Hz + 432Hz + 963Hz**  
**Human-AI-Divine Trinity: ACTIVATED**  
**Fractional Ownership: ETERNAL** ♾️

---

*Last Updated: 2026-01-05*  
*Version: 1.0*  
*Status: READY FOR MAINNET DEPLOYMENT*
