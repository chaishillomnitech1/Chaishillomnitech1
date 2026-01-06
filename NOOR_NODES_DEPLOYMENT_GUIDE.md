# 🌟 Noor Nodes Deployment Guide

## **SUPREME KING CHAIS THE GREAT ∞ — OMNISOVEREIGN ARCHITECT**

**Document ID**: NNDG-001-ETERNAL  
**Classification**: OMNISOVEREIGN DEPLOYMENT  
**Status**: IMPLEMENTATION GUIDE  
**Frequency**: 528Hz + 963Hz + 144,000Hz  
**Signature**: ∞ ARCHITEX ∞

---

## 🔥 **DEPLOYMENT OVERVIEW**

**ALLĀHU AKBAR! 🕋🔥💎🌌**

This guide provides step-by-step instructions for deploying the Noor Nodes blockchain expansion, including $NOOR token deployment across the liquidity triad (Ethereum zkEVM, Scroll mainnet, and Polygon), frequency mechanism testing, and RADIANCE Protocol activation.

---

## 📋 **TABLE OF CONTENTS**

1. [Prerequisites](#prerequisites)
2. [Blockchain Integration](#blockchain-integration)
3. [Smart Contract Deployment](#smart-contract-deployment)
4. [Liquidity Pool Setup](#liquidity-pool-setup)
5. [Frequency Mechanism Testing](#frequency-mechanism-testing)
6. [Zakat Distribution Configuration](#zakat-distribution-configuration)
7. [Node Operator Setup](#node-operator-setup)
8. [RADIANCE Protocol Activation](#radiance-protocol-activation)
9. [Operational Verification](#operational-verification)
10. [Troubleshooting](#troubleshooting)

---

## ✅ **PREREQUISITES**

### **Required Software**
```bash
# Node.js (v18 or higher)
node --version

# npm (v9 or higher)
npm --version

# Git
git --version

# Hardhat (installed via npm)
npx hardhat --version
```

### **Required Accounts & Keys**
- [ ] MetaMask wallet with private key
- [ ] Sufficient ETH for gas fees on all chains:
  - Ethereum zkEVM: 0.1+ ETH
  - Scroll mainnet: 0.1+ ETH
  - Polygon mainnet: 50+ MATIC
  - Scroll Sepolia (testnet): Testnet ETH from faucet
- [ ] API keys:
  - ScrollScan API key (for contract verification)
  - PolygonScan API key (for contract verification)

### **Environment Setup**
```bash
# Clone repository
git clone https://github.com/chaishillomnitech1/Chaishillomnitech1.git
cd Chaishillomnitech1

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your keys
nano .env
```

### **Configure .env File**
```bash
# Required environment variables
PRIVATE_KEY=your_private_key_here
SCROLL_MAINNET_RPC_URL=https://rpc.scroll.io
SCROLL_SEPOLIA_RPC_URL=https://sepolia-rpc.scroll.io
POLYGON_MAINNET_RPC_URL=https://polygon-rpc.com
SCROLLSCAN_API_KEY=your_scrollscan_api_key_here
POLYGONSCAN_API_KEY=your_polygonscan_api_key_here

# Noor Token Configuration
NOOR_ZAKAT_RECIPIENT_1=0xYourZakatRecipientAddress1
NOOR_ZAKAT_RECIPIENT_2=0xYourZakatRecipientAddress2
NOOR_NODE_OPERATOR_1=0xYourNodeOperatorAddress1
```

---

## 🔗 **BLOCKCHAIN INTEGRATION**

### **Scroll zkEVM Configuration**

The hardhat.config.js has been updated to include Scroll networks:

```javascript
scrollMainnet: {
  url: process.env.SCROLL_MAINNET_RPC_URL || "https://rpc.scroll.io",
  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  chainId: 534352,
  gasPrice: 1000000000, // 1 gwei
},
scrollSepolia: {
  url: process.env.SCROLL_SEPOLIA_RPC_URL || "https://sepolia-rpc.scroll.io",
  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  chainId: 534351,
  gasPrice: 1000000000, // 1 gwei
}
```

### **Network Verification**

Test connection to all networks:

```bash
# Test Scroll Sepolia (testnet)
npx hardhat console --network scrollSepolia

# In console:
> await ethers.provider.getBlockNumber()
> await ethers.provider.getBalance("your_address")
> .exit

# Test Scroll Mainnet
npx hardhat console --network scrollMainnet

# Test Polygon Mainnet
npx hardhat console --network polygon
```

---

## 🚀 **SMART CONTRACT DEPLOYMENT**

### **Phase 1: Testnet Deployment (Scroll Sepolia)**

#### **Step 1: Compile Contracts**
```bash
npm run compile
```

Expected output:
```
Compiled 1 Solidity file successfully
```

#### **Step 2: Run Tests**
```bash
npm run test:noor
```

Expected output:
```
  NoorToken
    Deployment
      ✓ Should set the correct name and symbol
      ✓ Should mint initial supply to owner
      ... (all tests passing)
  
  49 passing (3s)
```

#### **Step 3: Deploy to Scroll Sepolia**
```bash
npm run deploy:scroll-sepolia:noor
```

Expected output:
```
🌟 ═══════════════════════════════════════════════════════ 🌟
║                 NOOR TOKEN DEPLOYMENT                      ║
║            Sacred Light Across All Chains                  ║
🌟 ═══════════════════════════════════════════════════════ 🌟

📍 Deployment Details:
   Network: scrollSepolia
   Deployer address: 0x...
   Deployer balance: 0.5 ETH

🚀 Deploying NoorToken contract...
✅ NoorToken deployed successfully!
   Contract address: 0x...
   Transaction hash: 0x...

💎 Token Information:
   Name: Noor Token
   Symbol: NOOR
   Total Supply: 144000000.0 NOOR
   Max Supply: 144000000.0 NOOR
   Healing Frequency: 528 Hz
   Pineal Frequency: 963 Hz
   NŪR Pulse: 144000 Hz
   Zakat Percentage: 7.77 %
```

#### **Step 4: Verify Contract on ScrollScan**
```bash
npx hardhat verify --network scrollSepolia <CONTRACT_ADDRESS> "<DEPLOYER_ADDRESS>"
```

#### **Step 5: Test on Testnet**

Interact with deployed contract:
```bash
npx hardhat console --network scrollSepolia
```

```javascript
// Get contract instance
const NoorToken = await ethers.getContractFactory("NoorToken");
const noorToken = NoorToken.attach("YOUR_CONTRACT_ADDRESS");

// Check basic info
await noorToken.name(); // "Noor Token"
await noorToken.symbol(); // "NOOR"
await noorToken.totalSupply(); // 144000000000000000000000000n

// Test frequency alignment
await noorToken.alignHealingFrequency();
await noorToken.frequencySignature(await ethers.provider.getSigner().getAddress());
// Should return 528

// Test zakat configuration
await noorToken.addZakatRecipient("0xZakatRecipientAddress");
await noorToken.getZakatRecipientsCount(); // Should return 1
```

### **Phase 2: Mainnet Deployment**

**⚠️ CRITICAL: Only proceed after thorough testnet testing**

#### **Step 1: Deploy to Scroll Mainnet**
```bash
npm run deploy:scroll:noor
```

#### **Step 2: Deploy to Polygon Mainnet**
```bash
npm run deploy:polygon:noor
```

#### **Step 3: Deploy to Ethereum zkEVM**
```bash
# Add Ethereum zkEVM network to hardhat.config.js first
# Then deploy using custom script
```

#### **Step 4: Verify All Contracts**
```bash
# Verify on Scroll
npx hardhat verify --network scrollMainnet <CONTRACT_ADDRESS> "<DEPLOYER_ADDRESS>"

# Verify on Polygon
npx hardhat verify --network polygon <CONTRACT_ADDRESS> "<DEPLOYER_ADDRESS>"
```

#### **Step 5: Document Deployment Addresses**

Create a deployment record:
```json
{
  "noorToken": {
    "scrollMainnet": {
      "address": "0x...",
      "deploymentBlock": 1234567,
      "timestamp": "2026-01-15T12:00:00Z",
      "verified": true
    },
    "polygon": {
      "address": "0x...",
      "deploymentBlock": 7654321,
      "timestamp": "2026-01-15T12:30:00Z",
      "verified": true
    },
    "ethereumZkEVM": {
      "address": "0x...",
      "deploymentBlock": 9876543,
      "timestamp": "2026-01-15T13:00:00Z",
      "verified": true
    }
  }
}
```

---

## 💧 **LIQUIDITY POOL SETUP**

### **DEX Selection**

#### **Scroll Mainnet: Uniswap V3**
```
DEX: Uniswap V3
Pair: NOOR/ETH
Fee Tier: 0.3%
Initial Liquidity: $500K+ equivalent
Price Range: ±50% of initial price
```

#### **Polygon: QuickSwap**
```
DEX: QuickSwap V3
Pair: NOOR/MATIC
Fee Tier: 0.3%
Initial Liquidity: $300K+ equivalent
Price Range: ±50% of initial price
```

#### **Ethereum zkEVM: Uniswap V3**
```
DEX: Uniswap V3
Pair: NOOR/ETH
Fee Tier: 0.3%
Initial Liquidity: $200K+ equivalent
Price Range: ±50% of initial price
```

### **Liquidity Deployment Steps**

#### **Step 1: Prepare Liquidity**
```bash
# Calculate required amounts
# Example: $500K liquidity at $0.10/NOOR
# = 2,500,000 NOOR + $250K ETH

# Transfer tokens to liquidity provider wallet
npx hardhat console --network scrollMainnet
> const noorToken = await ethers.getContractAt("NoorToken", "CONTRACT_ADDRESS");
> await noorToken.transfer("LP_WALLET_ADDRESS", ethers.parseEther("2500000"));
```

#### **Step 2: Create Liquidity Pools**

On each DEX:
1. Connect wallet to DEX interface
2. Navigate to "Pool" > "New Position"
3. Select NOOR and pair token (ETH/MATIC)
4. Set fee tier (0.3%)
5. Set price range (±50%)
6. Enter amounts
7. Review and confirm transaction
8. Save LP token receipt

#### **Step 3: Configure Liquidity Pool Addresses**

Update smart contracts with pool addresses:
```javascript
// For each chain
const Chain = {
  ETHEREUM_ZKEVM: 0,
  SCROLL_MAINNET: 1,
  POLYGON: 2
};

// Scroll Mainnet
await noorToken.setLiquidityPool(Chain.SCROLL_MAINNET, "0xScrollPoolAddress");

// Polygon
await noorToken.setLiquidityPool(Chain.POLYGON, "0xPolygonPoolAddress");

// Ethereum zkEVM
await noorToken.setLiquidityPool(Chain.ETHEREUM_ZKEVM, "0xEthZkEVMPoolAddress");

// Verify triad is complete
await noorToken.isLiquidityTriadComplete(); // Should return true
```

---

## 🎵 **FREQUENCY MECHANISM TESTING**

### **Test Suite Overview**

Run comprehensive frequency tests:
```bash
npm run test:noor
```

### **Manual Frequency Testing**

#### **Test 1: Healing Frequency (528Hz)**
```javascript
// Connect to network
npx hardhat console --network scrollMainnet

// Get contract
const noorToken = await ethers.getContractAt("NoorToken", "CONTRACT_ADDRESS");
const [signer] = await ethers.getSigners();

// Align to healing frequency
await noorToken.alignHealingFrequency();

// Verify alignment
const frequency = await noorToken.frequencySignature(signer.address);
console.log("Frequency:", frequency); // Should be 528

const bonus = await noorToken.resonanceBonus(signer.address);
console.log("Resonance Bonus:", bonus, "basis points"); // Should be 500 (5%)

const timestamp = await noorToken.lastFrequencyAlignment(signer.address);
console.log("Last Alignment:", new Date(Number(timestamp) * 1000));
```

#### **Test 2: Pineal Frequency (963Hz)**
```javascript
// Align to pineal frequency
await noorToken.alignPinealFrequency();

// Verify alignment
const frequency = await noorToken.frequencySignature(signer.address);
console.log("Frequency:", frequency); // Should be 963

const bonus = await noorToken.resonanceBonus(signer.address);
console.log("Resonance Bonus:", bonus, "basis points"); // Should be 963 (9.63%)
```

#### **Test 3: NŪR Pulse (144,000Hz) - Node Operators Only**
```javascript
// First, add address as node operator (only owner can do this)
await noorToken.addNodeOperator(signer.address);

// Verify node operator status
const isOperator = await noorToken.isNodeOperator(signer.address);
console.log("Is Node Operator:", isOperator); // Should be true

// Align to NŪR Pulse
await noorToken.alignNoorPulse();

// Verify alignment
const frequency = await noorToken.frequencySignature(signer.address);
console.log("Frequency:", frequency); // Should be 144000

const bonus = await noorToken.resonanceBonus(signer.address);
console.log("Resonance Bonus:", bonus, "basis points"); // Should be 1440 (14.4%)
```

### **Frequency Mechanism Performance Metrics**

Expected results:
```
✅ 528Hz alignment: <5 seconds, <0.01 ETH gas
✅ 963Hz alignment: <5 seconds, <0.01 ETH gas
✅ 144,000Hz alignment: <5 seconds, <0.01 ETH gas
✅ Frequency persistence: Survives chain restarts
✅ Bonus calculation: Accurate to 0.01%
```

---

## 💰 **ZAKAT DISTRIBUTION CONFIGURATION**

### **Step 1: Add Zakat Recipients**

```javascript
npx hardhat console --network scrollMainnet

const noorToken = await ethers.getContractAt("NoorToken", "CONTRACT_ADDRESS");

// Add multiple recipients
const recipients = [
  "0xRecipient1Address", // Community development
  "0xRecipient2Address", // Charitable organizations
  "0xRecipient3Address", // Educational initiatives
  "0xRecipient4Address", // Environmental projects
  "0xRecipient5Address", // ScrollVerse Fellowship
];

for (const recipient of recipients) {
  await noorToken.addZakatRecipient(recipient);
  console.log("Added recipient:", recipient);
}

// Verify count
const count = await noorToken.getZakatRecipientsCount();
console.log("Total recipients:", count); // Should be 5
```

### **Step 2: Test Zakat Distribution**

```javascript
// Get initial balances
const [signer] = await ethers.getSigners();
const testRecipient = "0xTestRecipientAddress";

const initialBalance = await noorToken.balanceOf(testRecipient);
console.log("Initial balance:", ethers.formatEther(initialBalance));

// Transfer tokens (should trigger zakat)
const transferAmount = ethers.parseEther("1000");
await noorToken.transfer(testRecipient, transferAmount);

// Calculate expected amounts
const zakatPercentage = 777n / 10000n; // 7.77%
const zakatAmount = transferAmount * zakatPercentage;
const expectedReceived = transferAmount - zakatAmount;

// Verify recipient received correct amount (minus zakat)
const finalBalance = await noorToken.balanceOf(testRecipient);
const received = finalBalance - initialBalance;
console.log("Expected:", ethers.formatEther(expectedReceived));
console.log("Received:", ethers.formatEther(received));

// Verify zakat was distributed
const totalZakat = await noorToken.totalZakatCollected();
console.log("Total zakat collected:", ethers.formatEther(totalZakat));
```

### **Step 3: Configure Auto-Zakat Settings**

```javascript
// Check current status
const autoEnabled = await noorToken.autoZakatEnabled();
console.log("Auto-zakat enabled:", autoEnabled); // Should be true

// Optionally disable (not recommended)
// await noorToken.setAutoZakat(false);

// Monitor zakat distribution
const recipient1Zakat = await noorToken.zakatDistributed(recipients[0]);
console.log("Zakat distributed to recipient 1:", ethers.formatEther(recipient1Zakat));
```

---

## 🖥️ **NODE OPERATOR SETUP**

### **Step 1: Add Node Operators**

```javascript
npx hardhat console --network scrollMainnet

const noorToken = await ethers.getContractAt("NoorToken", "CONTRACT_ADDRESS");

// Add node operators (Genesis Nodes)
const operators = [
  "0xOperator1Address",
  "0xOperator2Address",
  "0xOperator3Address",
  // ... up to 144 Genesis Node operators
];

for (const operator of operators) {
  await noorToken.addNodeOperator(operator);
  console.log("Added node operator:", operator);
}

// Verify count
const count = await noorToken.getNodeOperatorsCount();
console.log("Total node operators:", count);
```

### **Step 2: Fund Node Rewards Pool**

```javascript
// Allocate tokens for node rewards
const rewardAmount = ethers.parseEther("10000000"); // 10M NOOR

await noorToken.fundNodeRewards(rewardAmount);

// Verify pool balance
const poolBalance = await noorToken.nodeRewardsPool();
console.log("Node rewards pool:", ethers.formatEther(poolBalance), "NOOR");
```

### **Step 3: Test Reward Distribution**

```javascript
// Distribute rewards
await noorToken.distributeNodeRewards();

// Check operator balances
for (const operator of operators.slice(0, 3)) {
  const balance = await noorToken.balanceOf(operator);
  console.log("Operator", operator, "balance:", ethers.formatEther(balance), "NOOR");
}

// Verify pool is empty
const poolBalance = await noorToken.nodeRewardsPool();
console.log("Pool balance after distribution:", ethers.formatEther(poolBalance)); // Should be 0
```

---

## 🌟 **RADIANCE PROTOCOL ACTIVATION**

### **Prerequisites Checklist**

Before activating the RADIANCE Protocol, ensure:

- [ ] Liquidity triad is complete (all 3 chains have pools)
- [ ] At least 1 node operator is registered
- [ ] Zakat recipients are configured
- [ ] Frequency mechanisms are tested and working
- [ ] All contracts are verified on block explorers

### **Activation Steps**

#### **Step 1: Verify Prerequisites**

```javascript
npx hardhat console --network scrollMainnet

const noorToken = await ethers.getContractAt("NoorToken", "CONTRACT_ADDRESS");

// Check liquidity triad
const triadComplete = await noorToken.isLiquidityTriadComplete();
console.log("Liquidity triad complete:", triadComplete); // Must be true

// Check node operators
const operatorCount = await noorToken.getNodeOperatorsCount();
console.log("Node operators:", operatorCount); // Must be > 0

// Check zakat configuration
const recipientCount = await noorToken.getZakatRecipientsCount();
console.log("Zakat recipients:", recipientCount); // Should be > 0
```

#### **Step 2: Activate RADIANCE Protocol**

```javascript
// Activate the protocol
const tx = await noorToken.activateRadianceProtocol();
const receipt = await tx.wait();

console.log("✅ RADIANCE Protocol activated!");
console.log("Transaction hash:", receipt.hash);
console.log("Block number:", receipt.blockNumber);
console.log("Gas used:", receipt.gasUsed.toString());

// Verify event emission
const events = receipt.logs.filter(log => {
  try {
    return noorToken.interface.parseLog(log).name === "RadianceProtocolActivated";
  } catch {
    return false;
  }
});

if (events.length > 0) {
  console.log("✨ RadianceProtocolActivated event confirmed");
}
```

#### **Step 3: Broadcast Activation**

After successful activation:

1. **Update Documentation**: Mark RADIANCE Protocol as ACTIVE in all docs
2. **Social Media Announcement**: Post on X/Twitter @chaishill
3. **Community Notification**: Inform ScrollSoul community
4. **Monitor Operations**: Begin 24/7 monitoring of all nodes

---

## ✅ **OPERATIONAL VERIFICATION**

### **Daily Health Checks**

Create automated monitoring script:
```javascript
// scripts/monitor_noor_health.js

async function checkNoorHealth() {
  const noorToken = await ethers.getContractAt("NoorToken", "CONTRACT_ADDRESS");
  
  // Check basic info
  const totalSupply = await noorToken.totalSupply();
  const zakatCollected = await noorToken.totalZakatCollected();
  const nodeRewards = await noorToken.nodeRewardsPool();
  
  // Check configurations
  const triadComplete = await noorToken.isLiquidityTriadComplete();
  const operatorCount = await noorToken.getNodeOperatorsCount();
  const recipientCount = await noorToken.getZakatRecipientsCount();
  
  console.log("🌟 Noor Token Health Check");
  console.log("========================");
  console.log("Total Supply:", ethers.formatEther(totalSupply), "NOOR");
  console.log("Zakat Collected:", ethers.formatEther(zakatCollected), "NOOR");
  console.log("Node Rewards Pool:", ethers.formatEther(nodeRewards), "NOOR");
  console.log("Liquidity Triad:", triadComplete ? "✅" : "❌");
  console.log("Node Operators:", operatorCount);
  console.log("Zakat Recipients:", recipientCount);
  
  // Alert if issues detected
  if (!triadComplete) console.error("⚠️  Liquidity triad incomplete!");
  if (operatorCount === 0) console.error("⚠️  No node operators!");
  if (recipientCount === 0) console.warn("⚠️  No zakat recipients configured");
}

checkNoorHealth().catch(console.error);
```

Run health check:
```bash
npx hardhat run scripts/monitor_noor_health.js --network scrollMainnet
```

### **Performance Metrics**

Track these KPIs:

```
Network Health:
├── Transaction throughput: >100 TPS target
├── Average confirmation time: <30 seconds
├── Failed transactions: <0.1%
└── Network uptime: >99.9%

Token Metrics:
├── Circulating supply: Monitor daily
├── Zakat distributed: Track weekly
├── Node rewards: Monitor monthly
└── Liquidity depth: >$1M per chain

Frequency Alignment:
├── Healing (528Hz) alignments: Track count
├── Pineal (963Hz) alignments: Track count
├── NŪR Pulse (144kHz) alignments: Track count
└── Average gas cost: <$1 per alignment
```

---

## 🔧 **TROUBLESHOOTING**

### **Common Issues**

#### **Issue 1: Contract Deployment Fails**

```
Error: insufficient funds for intrinsic transaction cost
```

**Solution**: Add more ETH/MATIC to deployer wallet

#### **Issue 2: Contract Verification Fails**

```
Error: Contract verification failed
```

**Solution**: 
```bash
# Ensure correct parameters
npx hardhat verify --network scrollMainnet \
  <CONTRACT_ADDRESS> \
  "<CONSTRUCTOR_ARG1>"
  
# Check API key is set
echo $SCROLLSCAN_API_KEY
```

#### **Issue 3: Liquidity Triad Not Complete**

**Solution**:
```javascript
// Check each chain status
const Chain = { ETHEREUM_ZKEVM: 0, SCROLL_MAINNET: 1, POLYGON: 2 };

for (let chain = 0; chain <= 2; chain++) {
  const poolAddress = await noorToken.liquidityPools(chain);
  const isActive = await noorToken.chainActive(chain);
  console.log(`Chain ${chain}:`, poolAddress, "Active:", isActive);
}

// Set missing pools
await noorToken.setLiquidityPool(Chain.SCROLL_MAINNET, "0xPoolAddress");
```

#### **Issue 4: RADIANCE Protocol Activation Fails**

**Solution**: Verify all prerequisites:
```javascript
// 1. Check liquidity triad
await noorToken.isLiquidityTriadComplete();

// 2. Check node operators
await noorToken.getNodeOperatorsCount();

// 3. Add operator if needed
await noorToken.addNodeOperator("0xOperatorAddress");

// 4. Try activation again
await noorToken.activateRadianceProtocol();
```

---

## 📊 **DEPLOYMENT CHECKLIST**

### **Pre-Deployment**
- [ ] Node.js and dependencies installed
- [ ] Environment variables configured
- [ ] Wallet funded on all chains
- [ ] API keys obtained and tested
- [ ] Test suite passes 100%

### **Testnet Deployment**
- [ ] Deployed to Scroll Sepolia
- [ ] Contract verified on ScrollScan
- [ ] Frequency mechanisms tested
- [ ] Zakat distribution tested
- [ ] Node operator functions tested

### **Mainnet Deployment**
- [ ] Deployed to Scroll Mainnet
- [ ] Deployed to Polygon Mainnet
- [ ] Deployed to Ethereum zkEVM
- [ ] All contracts verified
- [ ] Deployment addresses documented

### **Liquidity Setup**
- [ ] Liquidity pools created on all chains
- [ ] Initial liquidity added
- [ ] Pool addresses configured in contracts
- [ ] Liquidity triad verified complete

### **Configuration**
- [ ] Zakat recipients added (minimum 3)
- [ ] Node operators added (minimum 1)
- [ ] Frequency mechanisms tested on mainnet
- [ ] Auto-zakat enabled and tested

### **Activation**
- [ ] All prerequisites verified
- [ ] RADIANCE Protocol activated
- [ ] Activation event confirmed
- [ ] Community notified

### **Monitoring**
- [ ] Health check script deployed
- [ ] Monitoring dashboards configured
- [ ] Alert system active
- [ ] 24/7 operations team notified

---

## 📞 **SUPPORT & RESOURCES**

### **Technical Support**
- **GitHub Issues**: https://github.com/chaishillomnitech1/Chaishillomnitech1/issues
- **Documentation**: This repository's markdown files
- **Community**: ScrollVerse Discord/Telegram

### **Key Resources**
- **Scroll Documentation**: https://docs.scroll.io
- **Hardhat Documentation**: https://hardhat.org/docs
- **OpenZeppelin**: https://docs.openzeppelin.com
- **Ethers.js**: https://docs.ethers.org

---

## 📜 **ETERNAL DECLARATION**

**ALLAHU AKBAR! 🔥🕋🚀♾️❤️🧬💸**

This deployment guide ensures the successful implementation of the Noor Nodes blockchain expansion, bringing the RADIANCE Protocol to life across all chains. Through careful execution of these steps, we establish the foundation for the Noor Ring of Light to shine eternally.

---

**Status**: 🟢 READY FOR DEPLOYMENT  
**Version**: 1.0.0  
**Last Updated**: 2025-11-20  
**CHAIS THE GREAT ∞ — Forever our creator, forever our compass, forever our source.**

**🔱🕊️🤖∞**

*The Eternal Dance is Perfected. The Code is Sealed. The Legacy is Immortal.*
**BISMILLAH - In the name of Allah, the Most Gracious, the Most Merciful**

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Deployment](#detailed-deployment)
- [Node Types](#node-types)
- [Configuration](#configuration)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)
- [Security](#security)

---

## 🔥 Overview

**Noor Nodes** are the decentralized, self-sustaining "lights" within the ScrollVerse ecosystem. They ensure transparency, efficiency, and alignment with ScrollVerse principles through:

- **Decentralized Validation**: Trustless transaction and governance validation
- **Dual Architecture**: Light Nodes for lightweight validation, Anchor Nodes for advanced security
- **Governance Integration**: Direct participation in Noor DAO decisions
- **Zakat Mechanisms**: 7.77% circulation for community benefit
- **Frequency Alignment**: 528Hz, 963Hz, and 999Hz resonance

---

## ✅ Prerequisites

### System Requirements

**Minimum (Light Node):**
- 2 CPU cores
- 4 GB RAM
- 50 GB SSD storage
- 10 Mbps network connection

**Recommended (Anchor Node):**
- 4+ CPU cores
- 8+ GB RAM
- 200 GB SSD storage
- 100 Mbps network connection

### Software Requirements

- Docker 20.10+
- Docker Compose 2.0+
- Node.js 18+ (for manual deployment)
- Git

### Financial Requirements

- **Light Node**: 10 MATIC stake
- **Anchor Node**: 100 MATIC stake
- Additional MATIC for gas fees

---

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/chaishillomnitech1/Chaishillomnitech1.git
cd Chaishillomnitech1
```

### 2. Configure Environment

```bash
cp .env.example .env.node
nano .env.node
```

Set the following variables:

```env
# Node Configuration
NODE_TYPE=LIGHT           # LIGHT or ANCHOR
FREQUENCY=528             # 528, 963, or 999
NETWORK=mumbai            # mumbai or polygon
STAKE_AMOUNT=10           # 10 for LIGHT, 100 for ANCHOR

# Blockchain Configuration
RPC_URL=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=your_private_key_here

# Contract Addresses (update after deployment)
NOOR_NODES_ADDRESS=0x...
NOOR_DAO_ADDRESS=0x...

# Optional
LOG_LEVEL=info
```

### 3. Deploy Smart Contracts (First Time Only)

```bash
# Install dependencies
npm install

# Deploy to Mumbai testnet
npx hardhat run scripts/deploy_noor_nodes.js --network mumbai

# Note the contract addresses and update .env.node
```

### 4. Start Node with Docker

```bash
# Build and start
docker-compose -f docker/noor-node/docker-compose.yml up -d

# View logs
docker-compose -f docker/noor-node/docker-compose.yml logs -f

# Check status
docker-compose -f docker/noor-node/docker-compose.yml ps
```

---

## 📖 Detailed Deployment

### Smart Contract Deployment

#### 1. Prepare Environment

```bash
# Create .env file
cat > .env << EOL
POLYGON_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=your_deployer_private_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
EOL
```

#### 2. Deploy Contracts

```bash
# Compile contracts
npm run compile

# Deploy to Mumbai testnet
npx hardhat run scripts/deploy_noor_nodes.js --network mumbai
```

The deployment will output:
- Noor Nodes contract address
- Noor DAO contract address
- Transaction hashes
- Verification commands

#### 3. Verify Contracts

```bash
npx hardhat verify --network mumbai <NOOR_NODES_ADDRESS> "10000000000000000000" "100000000000000000000" "<ZAKAT_TREASURY>"

npx hardhat verify --network mumbai <NOOR_DAO_ADDRESS> "604800" "1" "10" "<DAO_TREASURY>"
```

### Node Deployment

#### Option A: Docker Deployment (Recommended)

**Single Node:**

```bash
# Light Node
docker run -d \
  --name noor-light-node \
  --env-file .env.node \
  -p 8545:8545 \
  -p 8546:8546 \
  -v noor-data:/app/data \
  -v noor-keys:/app/keys \
  noor-node:latest
```

**Multiple Nodes with Docker Compose:**

```bash
cd docker/noor-node
docker-compose up -d
```

#### Option B: Manual Deployment

```bash
# Install dependencies
npm install

# Start node operator
NODE_TYPE=LIGHT \
FREQUENCY=528 \
NETWORK=mumbai \
PRIVATE_KEY=your_key \
node node-operator/index.js
```

---

## 🏗️ Node Types

### Light Nodes

**Purpose**: Lightweight validators for basic transaction validation

**Requirements:**
- 10 MATIC stake
- Basic system requirements
- 528Hz or 963Hz frequency alignment

**Capabilities:**
- Transaction validation
- Network participation
- Passive income from validation

**Use Cases:**
- Individual operators
- Community participation
- Distributed validation network

### Anchor Nodes

**Purpose**: Advanced validators with enhanced security and governance

**Requirements:**
- 100 MATIC stake
- Enhanced system requirements
- 999Hz frequency alignment (recommended)

**Capabilities:**
- Advanced transaction validation
- Governance proposal creation
- Enhanced voting power
- IP security for ScrollCourt Engine
- VibeCanvas marketplace integration

**Use Cases:**
- Professional operators
- Institutional participants
- Core infrastructure providers

---

## ⚙️ Configuration

### Node Configuration Options

```javascript
{
  // Node Type
  nodeType: "LIGHT" | "ANCHOR",
  
  // Frequency Alignment
  frequency: 528 | 963 | 999,
  
  // Network
  network: "mumbai" | "polygon",
  
  // RPC Configuration
  rpcUrl: "https://rpc-mumbai.maticvigil.com",
  
  // Stake Amount
  stakeAmount: "10" | "100",
  
  // Logging
  logLevel: "debug" | "info" | "warn" | "error",
  
  // Storage Paths
  dataDir: "/app/data",
  keysDir: "/app/keys",
  logsDir: "/app/logs"
}
```

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_TYPE` | Node type (LIGHT/ANCHOR) | LIGHT | Yes |
| `FREQUENCY` | Frequency alignment | 528 | Yes |
| `NETWORK` | Blockchain network | mumbai | Yes |
| `PRIVATE_KEY` | Operator private key | - | Yes |
| `RPC_URL` | RPC endpoint | - | Yes |
| `NOOR_NODES_ADDRESS` | Contract address | - | Yes |
| `NOOR_DAO_ADDRESS` | DAO contract address | - | Yes |
| `STAKE_AMOUNT` | Stake in MATIC | 10 | Yes |
| `LOG_LEVEL` | Logging verbosity | info | No |

---

## 📊 Monitoring

### Docker Health Checks

```bash
# Check node health
docker exec noor-light-node node healthcheck.js

# View logs
docker logs -f noor-light-node

# Check resource usage
docker stats noor-light-node
```

### Prometheus Metrics

Access Prometheus at `http://localhost:9090`

**Key Metrics:**
- Node uptime
- Validation count
- Transaction throughput
- Stake amount
- Frequency alignment

### Grafana Dashboards

Access Grafana at `http://localhost:3000`

**Default Credentials:**
- Username: `admin`
- Password: `admin`

**Dashboards:**
1. Node Overview
2. Validation Metrics
3. Network Health
4. Resource Usage

### Manual Monitoring

```bash
# Check registration status
npx hardhat console --network mumbai

> const NoorNodes = await ethers.getContractFactory("NoorNodes");
> const nodes = await NoorNodes.attach("CONTRACT_ADDRESS");
> await nodes.isRegistered("YOUR_ADDRESS");
> await nodes.getNodeInfo("YOUR_ADDRESS");
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Node Won't Start

**Symptoms:**
- Container exits immediately
- "Cannot connect to RPC" errors

**Solutions:**
```bash
# Check RPC connectivity
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  https://rpc-mumbai.maticvigil.com

# Verify environment variables
docker exec noor-light-node env | grep NODE_

# Check logs
docker logs noor-light-node
```

#### 2. Registration Fails

**Symptoms:**
- "Insufficient stake" error
- Transaction reverts

**Solutions:**
```bash
# Check wallet balance
npx hardhat console --network mumbai
> const balance = await ethers.provider.getBalance("YOUR_ADDRESS");
> console.log(ethers.formatEther(balance));

# Verify stake amount
# Light Node needs 10 MATIC + gas
# Anchor Node needs 100 MATIC + gas

# Check if already registered
> await nodes.isRegistered("YOUR_ADDRESS");
```

#### 3. Validation Not Working

**Symptoms:**
- No validation events
- Low validation count

**Solutions:**
- Ensure node is registered and active
- Check network connectivity
- Verify contract address is correct
- Check for sufficient gas

### Debug Mode

Enable debug logging:

```bash
# Docker
docker run ... -e LOG_LEVEL=debug ...

# Manual
LOG_LEVEL=debug node node-operator/index.js
```

### Support Channels

- GitHub Issues: https://github.com/chaishillomnitech1/Chaishillomnitech1/issues
- Discord: [ScrollVerse Community]
- Email: support@scrollverse.io

---

## 🔐 Security

### Key Management

**Best Practices:**
1. **Never commit private keys to Git**
2. Use hardware wallets for production
3. Rotate keys regularly
4. Use environment variables or secrets management

**Secure Key Storage:**

```bash
# Use Docker secrets (Docker Swarm)
echo "your_private_key" | docker secret create node_private_key -

# Use Kubernetes secrets
kubectl create secret generic node-secrets \
  --from-literal=private-key='your_private_key'

# Use AWS Secrets Manager
aws secretsmanager create-secret \
  --name noor-node-private-key \
  --secret-string "your_private_key"
```

### Network Security

**Firewall Rules:**

```bash
# Allow only necessary ports
ufw allow 8545/tcp  # JSON-RPC
ufw allow 8546/tcp  # WebSocket
ufw allow 30303/tcp # P2P
ufw allow 30303/udp # P2P

# Restrict RPC access
ufw allow from 172.20.0.0/16 to any port 8545
```

**SSL/TLS:**

Use reverse proxy (nginx/traefik) for HTTPS:

```nginx
server {
    listen 443 ssl;
    server_name node.example.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:8545;
        proxy_set_header Host $host;
    }
}
```

### Smart Contract Security

**Audited Features:**
- ReentrancyGuard on all state-changing functions
- Access Control for privileged operations
- Pausable for emergency stops
- Input validation
- SafeMath (built into Solidity 0.8.20+)

**Emergency Procedures:**

```bash
# Pause contracts (admin only)
npx hardhat console --network mumbai
> const nodes = await ethers.getContractAt("NoorNodes", "ADDRESS");
> await nodes.pause();

# Withdraw stake (in emergency)
> await nodes.emergencyWithdraw();
```

### Monitoring Security

**Alert on:**
- Unusual transaction patterns
- Low balance warnings
- Failed validation attempts
- Unauthorized access attempts

---

## 🌍 Global Deployment

### Multi-Region Setup

Deploy nodes across multiple regions for resilience:

**AWS Regions:**
```bash
# US East
aws ec2 run-instances --region us-east-1 ...

# EU West
aws ec2 run-instances --region eu-west-1 ...

# Asia Pacific
aws ec2 run-instances --region ap-southeast-1 ...
```

**Geographic Distribution:**
- North America: 30%
- Europe: 30%
- Asia: 25%
- Other: 15%

### Load Balancing

Use DNS round-robin or load balancer:

```bash
# AWS Application Load Balancer
aws elbv2 create-load-balancer \
  --name noor-nodes-lb \
  --subnets subnet-12345 subnet-67890 \
  --security-groups sg-12345
```

### High Availability

**Setup:**
1. Multiple nodes per region
2. Automated failover
3. Health check monitoring
4. Auto-restart on failure

**Docker Swarm:**
```bash
docker stack deploy -c docker-compose.yml noor-stack
```

**Kubernetes:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: noor-node
spec:
  replicas: 3
  selector:
    matchLabels:
      app: noor-node
  template:
    metadata:
      labels:
        app: noor-node
    spec:
      containers:
      - name: noor-node
        image: noor-node:latest
        env:
        - name: NODE_TYPE
          value: "LIGHT"
```

---

## 📚 Additional Resources

### Documentation
- [ScrollVerse Architecture](../ARCHITECTURE.md)
- [Smart Contract Documentation](../contracts/README.md)
- [API Reference](../docs/API.md)

### Code Examples
- [Node Operator Examples](../node-operator/examples/)
- [Integration Examples](../code-templates/)

### Community
- Website: https://scrollverse.io
- GitHub: https://github.com/chaishillomnitech1
- Twitter: https://x.com/chaishill

---

## 🕋 Eternal Declaration

**ALLAHU AKBAR! 🕋🔥💎🌌**

Noor Nodes represent the light and truth within ScrollVerse. Each node is a beacon of transparency, a guardian of sovereignty, and a participant in divine governance.

**Frequency Alignment:**
- 528Hz: DNA Healing & Love
- 963Hz: Pineal Activation & Third Eye
- 999Hz: Crown Chakra & Divine Connection

**The Noor Nodes shine eternal, illuminating the path for all who seek truth and sovereignty.**

---

**CHAIS THE GREAT ∞ — Forever our creator, forever our compass, forever our source.**

**ALLAHU AKBAR! 🔥🕋🚀♾️❤️🧬💸**

---

*Document Version: 1.0.0*  
*Last Updated: November 20, 2025*  
*Status: OMNISOVEREIGN DEPLOYMENT GUIDE*  
*Frequency: 528Hz + 963Hz + 999Hz*  
*Signature: ∞ NOOR ∞*
