# 🎨 VibeCanvas™ Frequency Forge & ScrollDrop Fortification Deployment Guide 🎨

**Divine Frequency Protocol**: 528Hz + 963Hz + 999Hz  
**Status**: OMEGA PHASE READY  
**Author**: Supreme King Chais The Great ∞

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Contract Deployment](#contract-deployment)
5. [Configuration](#configuration)
6. [Usage Examples](#usage-examples)
7. [Verification](#verification)
8. [Troubleshooting](#troubleshooting)

---

## 🌟 Overview

This guide provides step-by-step instructions for deploying and configuring the VibeCanvas™ NFT Frequency Forge and ScrollDrop Fortification contracts to the Polygon network.

### System Components

1. **VibeCanvas Frequency Forge**: Dynamic NFT minting with frequency embedding
2. **ScrollDrop Fortification**: Enhanced airdrop system with multi-dimensional validation

---

## ✅ Prerequisites

### Required Software
- Node.js v16+ and npm
- Hardhat development environment
- MetaMask or compatible Web3 wallet
- Git

### Required Accounts
- Polygon Mumbai testnet account with MATIC (for testing)
- Polygon mainnet account with MATIC (for production)
- Polygonscan API key (for verification)

### Get Test MATIC
- Mumbai Faucet: https://faucet.polygon.technology/

---

## 🔧 Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/chaishillomnitech1/Chaishillomnitech1.git
cd Chaishillomnitech1
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create `.env` file in project root:

```bash
# Network Configuration
POLYGON_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
POLYGON_MAINNET_RPC_URL=https://polygon-rpc.com

# Private Key (DO NOT SHARE OR COMMIT)
PRIVATE_KEY=your_private_key_here

# API Keys
POLYGONSCAN_API_KEY=your_polygonscan_api_key

# Contract Configuration
ROYALTY_RECIPIENT=0x_your_royalty_wallet_address
BASE_URI=https://scrollverse-nft-metadata.vercel.app/vibecanvas/
```

### 4. Update Hardhat Config
Verify `hardhat.config.js` has correct network settings:

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    mumbai: {
      url: process.env.POLYGON_MUMBAI_RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    },
    polygon: {
      url: process.env.POLYGON_MAINNET_RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: process.env.POLYGONSCAN_API_KEY
  }
};
```

---

## 🚀 Contract Deployment

### Compile Contracts
```bash
npx hardhat compile
```

Expected output:
```
Compiled 10 Solidity files successfully
```

### Deploy to Mumbai Testnet

#### Deploy VibeCanvas Frequency Forge
```bash
npx hardhat run scripts/deploy_vibecanvas_forge.js --network mumbai
```

Expected output:
```
🔥 VibeCanvas™ Frequency Forge Deployment 🔥
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ VibeCanvas Frequency Forge deployed to: 0x...
```

**Save the contract address!**

#### Deploy ScrollDrop Fortification
```bash
npx hardhat run scripts/deploy_scrolldrop_fortification.js --network mumbai
```

Expected output:
```
🔥 ScrollDrop Fortification Deployment 🔥
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ ScrollDrop Fortification deployed to: 0x...
```

**Save the contract address!**

### Deploy to Polygon Mainnet

⚠️ **WARNING**: Deploying to mainnet requires real MATIC and is irreversible. Test thoroughly on Mumbai first!

```bash
# Deploy VibeCanvas
npx hardhat run scripts/deploy_vibecanvas_forge.js --network polygon

# Deploy ScrollDrop
npx hardhat run scripts/deploy_scrolldrop_fortification.js --network polygon
```

---

## ⚙️ Configuration

### VibeCanvas Frequency Forge Configuration

#### 1. Set Base URI (if changed)
```javascript
const vibeCanvas = await ethers.getContractAt(
  "VibeCanvasFrequencyForge",
  VIBECANVAS_ADDRESS
);

await vibeCanvas.setBaseURI("https://new-metadata-uri.com/");
```

#### 2. Set Royalty Recipient (if changed)
```javascript
await vibeCanvas.setRoyaltyRecipient("0x_new_royalty_address");
```

#### 3. Adjust Global Resonance (optional)
```javascript
// Set to 50% (5000 basis points)
await vibeCanvas.setGlobalResonance(5000);
```

### ScrollDrop Fortification Configuration

#### 1. Create Airdrop Campaign
```javascript
const scrollDrop = await ethers.getContractAt(
  "ScrollDropFortification",
  SCROLLDROP_ADDRESS
);

const startTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
const endTime = startTime + 86400 * 30; // 30 days duration

const campaignId = await scrollDrop.createCampaign(
  "Divine Inheritance Q1 2025",
  TOKEN_ADDRESS, // CHXToken or other ERC20
  true, // isERC20
  ethers.parseEther("1000000"), // 1M tokens
  startTime,
  endTime,
  0 // InheritanceTrigger.MANUAL
);
```

#### 2. Configure Chainlink Oracle (optional)
```javascript
const CHAINLINK_MATIC_USD = "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada";
const priceThreshold = ethers.parseUnits("2", 8); // $2.00

await scrollDrop.setOracleConfig(
  campaignId,
  CHAINLINK_MATIC_USD,
  priceThreshold
);
```

#### 3. Set Frequency Requirements
```javascript
await scrollDrop.setFrequencyRequirements(
  campaignId,
  true, // require frequency alignment
  528 // minimum 528Hz
);
```

#### 4. Set BlessingCoin Requirement
```javascript
await scrollDrop.setBlessingCoinRequirement(campaignId, true);
```

#### 5. Add Recipients
```javascript
const recipients = [
  "0xRecipient1Address",
  "0xRecipient2Address",
  "0xRecipient3Address"
];

const amounts = [
  ethers.parseEther("1000"),
  ethers.parseEther("2000"),
  ethers.parseEther("3000")
];

await scrollDrop.addRecipients(campaignId, recipients, amounts);
```

#### 6. Align Frequencies and BlessingCoins
```javascript
// Align frequency for recipient
await scrollDrop.alignFrequency(recipientAddress, 528);

// Align BlessingCoin for recipient
await scrollDrop.alignBlessingCoin(recipientAddress, ethers.parseEther("100"));

// Enable legacy echo resistance
await scrollDrop.enableLegacyEchoResistance(recipientAddress);
```

#### 7. Set Up Integrity Gates
```javascript
// Add temporal gate
await scrollDrop.addIntegrityGate(campaignId, "Temporal Validation", 0);

// Add frequency gate
await scrollDrop.addIntegrityGate(campaignId, "Frequency Alignment", 1);

// Add oracle gate
await scrollDrop.addIntegrityGate(campaignId, "Oracle Validation", 2);

// Pass gates
await scrollDrop.passIntegrityGate(campaignId, 0);
await scrollDrop.passIntegrityGate(campaignId, 1);
await scrollDrop.passIntegrityGate(campaignId, 2);
```

#### 8. Trigger Divine Inheritance
```javascript
// Wait for start time, then trigger
await scrollDrop.triggerDivineInheritance(campaignId);
```

---

## 💡 Usage Examples

### Minting VibeCanvas NFT

#### Example 1: Mint with HEALING_528 Mode
```javascript
const vibeCanvas = await ethers.getContractAt(
  "VibeCanvasFrequencyForge",
  VIBECANVAS_ADDRESS
);

const tx = await vibeCanvas.forgeVibeCanvas(
  recipientAddress,
  0, // FrequencyMode.HEALING_528
  ethers.parseEther("10"), // QFS inflow amount
  "ipfs://QmYourMetadataHash"
);

const receipt = await tx.wait();
console.log("Token minted! TokenId:", receipt.logs[0].args.tokenId);
```

#### Example 2: Mint with SOVEREIGN_SCROLL Mode
```javascript
const tx = await vibeCanvas.forgeVibeCanvas(
  recipientAddress,
  3, // FrequencyMode.SOVEREIGN_SCROLL
  ethers.parseEther("1000"), // High QFS inflow for OMNIVERSAL tier
  "ipfs://QmSovereignScrollMetadata"
);
```

#### Example 3: Synchronize QFS Inflow
```javascript
const tokenId = 0;
const additionalInflow = ethers.parseEther("500");

await vibeCanvas.synchronizeQFSInflow(tokenId, additionalInflow);
```

#### Example 4: Activate Sovereign Scroll
```javascript
// As token owner
const tokenId = 0;
await vibeCanvas.activateSovereignScroll(tokenId);
```

### Claiming from ScrollDrop

```javascript
const scrollDrop = await ethers.getContractAt(
  "ScrollDropFortification",
  SCROLLDROP_ADDRESS
);

// As recipient
const campaignId = 0;
const tx = await scrollDrop.claimAllocation(campaignId);

await tx.wait();
console.log("Allocation claimed successfully!");
```

---

## ✅ Verification

### Verify on Polygonscan

#### VibeCanvas Frequency Forge
```bash
npx hardhat verify --network mumbai \
  VIBECANVAS_ADDRESS \
  "https://scrollverse-nft-metadata.vercel.app/vibecanvas/" \
  "0xROYALTY_RECIPIENT_ADDRESS"
```

#### ScrollDrop Fortification
```bash
npx hardhat verify --network mumbai \
  SCROLLDROP_ADDRESS
```

### Manual Verification

1. Visit Polygonscan:
   - Mumbai: https://mumbai.polygonscan.com
   - Mainnet: https://polygonscan.com

2. Enter contract address

3. Go to "Contract" tab

4. Click "Verify and Publish"

5. Fill in details:
   - Compiler: v0.8.20
   - Optimization: Yes
   - Runs: 200

6. Paste contract source code

7. Submit

---

## 🔍 Testing

### Run Test Suite
```bash
# All tests
npx hardhat test

# Specific contract tests
npx hardhat test test/VibeCanvasFrequencyForge.test.js
npx hardhat test test/ScrollDropFortification.test.js

# With gas reporting
REPORT_GAS=true npx hardhat test
```

### Test Coverage
```bash
npx hardhat coverage
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Compilation Fails
```
Error: Cannot find module '@openzeppelin/contracts'
```
**Solution**: Run `npm install`

#### 2. Deployment Fails - Insufficient Funds
```
Error: insufficient funds for intrinsic transaction cost
```
**Solution**: Get more MATIC from faucet or fund your wallet

#### 3. Transaction Underpriced
```
Error: replacement transaction underpriced
```
**Solution**: Increase gas price in hardhat.config.js:
```javascript
networks: {
  mumbai: {
    url: process.env.POLYGON_MUMBAI_RPC_URL,
    accounts: [process.env.PRIVATE_KEY],
    gasPrice: 30000000000 // 30 gwei
  }
}
```

#### 4. Verification Fails
```
Error: Contract source code already verified
```
**Solution**: Contract is already verified, check Polygonscan

#### 5. Network Connection Issues
```
Error: could not detect network
```
**Solution**: Check RPC URL in .env file, try alternative RPC endpoints

### Getting Help

- **GitHub Issues**: https://github.com/chaishillomnitech1/Chaishillomnitech1/issues
- **Documentation**: See README.md and ARCHITECTURE.md
- **Community**: Check CONTRIBUTING.md for communication channels

---

## 📚 Additional Resources

### Official Documentation
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Polygon Network](https://wiki.polygon.technology/)
- [Chainlink Oracles](https://docs.chain.link/)

### ScrollVerse Docs
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [VAULTBINDER_PROTOCOL.md](./VAULTBINDER_PROTOCOL.md)
- [GETTING_STARTED.md](./GETTING_STARTED.md)

---

## 🔐 Security Best Practices

1. **Never commit private keys** to version control
2. **Use environment variables** for sensitive data
3. **Test thoroughly** on testnet before mainnet
4. **Verify contracts** on Polygonscan after deployment
5. **Use multi-sig wallets** for production deployments
6. **Implement time-locks** for critical operations
7. **Monitor contracts** for unusual activity
8. **Keep dependencies updated** for security patches

---

## 🎯 Post-Deployment Checklist

- [ ] Contracts deployed successfully
- [ ] Contracts verified on Polygonscan
- [ ] Base URI configured correctly
- [ ] Royalty recipients set
- [ ] Test minting works
- [ ] Oracle feeds configured (if using)
- [ ] Airdrop campaigns created
- [ ] Recipients added and configured
- [ ] Integrity gates set up
- [ ] Emergency pause function tested
- [ ] Access control verified
- [ ] Documentation updated with addresses

---

## 🕋 DIVINE SEAL

This deployment guide is sealed under the **VaultBinder™ Protocol** and aligned with **528Hz + 963Hz + 999Hz** divine frequencies.

**Status**: OMEGA PHASE READY  
**Signature**: ∞ ARCHITEX ∞  
**Authentication**: #iam #chais"is"

---

**May your deployments resonate with divine frequency! 🔥🕋🚀**
