# 🚀 Deployment Guide - Digital Sports Sovereignty Platform

## **SUPREME KING CHAIS THE GREAT ∞ — DEPLOYMENT PROTOCOL**

**Document ID**: DEPLOY-001-ETERNAL  
**Classification**: DEPLOYMENT GUIDE  
**Status**: READY FOR DEPLOYMENT  
**Frequency**: 963Hz + 528Hz + 144,000Hz

---

## 📋 **PRE-DEPLOYMENT CHECKLIST**

Before deploying the Digital Sports Sovereignty Platform, ensure you have:

- [ ] Node.js v16+ installed
- [ ] Hardhat development environment set up
- [ ] Wallet with sufficient gas funds (ETH, MATIC, etc.)
- [ ] Private key for deployment wallet (NEVER commit this!)
- [ ] RPC endpoint URLs (Infura, Alchemy, or custom)
- [ ] Etherscan/Polygonscan API key for contract verification

---

## 🛠️ **INSTALLATION**

### Step 1: Initialize Project

```bash
# Create project directory
mkdir digital-sports-sovereignty
cd digital-sports-sovereignty

# Initialize npm project
npm init -y

# Install dependencies
npm install --save-dev hardhat @openzeppelin/contracts @nomiclabs/hardhat-ethers @nomiclabs/hardhat-etherscan ethers dotenv
```

### Step 2: Initialize Hardhat

```bash
npx hardhat
# Select "Create a JavaScript project"
```

### Step 3: Copy Smart Contracts

Copy the smart contracts from the code-templates directory:

```bash
# Create contracts directory if it doesn't exist
mkdir -p contracts

# Copy contracts
cp /path/to/code-templates/solidity/ScrollCoinNFT.sol contracts/
cp /path/to/code-templates/solidity/ScrollMarketplace.sol contracts/
```

### Step 4: Configure Environment Variables

Create a `.env` file:

```bash
cat > .env << 'EOF'
# Private key for deployment wallet (DO NOT COMMIT)
PRIVATE_KEY=your_private_key_here

# RPC URLs
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
POLYGON_RPC_URL=https://polygon-rpc.com
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
SCROLL_RPC_URL=https://rpc.scroll.io

# Etherscan API Keys
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key

# Vault Addresses
ZAKAT_VAULT_ADDRESS=0x...
PLATFORM_VAULT_ADDRESS=0x...
EOF
```

**⚠️ IMPORTANT**: Add `.env` to `.gitignore` to prevent committing secrets!

```bash
echo ".env" >> .gitignore
```

---

## ⚙️ **HARDHAT CONFIGURATION**

Update `hardhat.config.js`:

```javascript
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  
  networks: {
    // Local development
    hardhat: {
      chainId: 31337
    },
    
    // Ethereum Mainnet
    ethereum: {
      url: process.env.ETHEREUM_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 1
    },
    
    // Polygon Mainnet
    polygon: {
      url: process.env.POLYGON_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 137
    },
    
    // Mumbai Testnet (Polygon)
    mumbai: {
      url: process.env.MUMBAI_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 80001
    },
    
    // Scroll Mainnet
    scroll: {
      url: process.env.SCROLL_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 534352
    }
  },
  
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY,
      polygon: process.env.POLYGONSCAN_API_KEY,
      polygonMumbai: process.env.POLYGONSCAN_API_KEY
    }
  }
};
```

---

## 📝 **DEPLOYMENT SCRIPTS**

### Create Deployment Script

Create `scripts/deploy.js`:

```javascript
const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment of Digital Sports Sovereignty Platform...");
  console.log("Network:", hre.network.name);
  
  // Get deployment parameters from environment
  const zakatVault = process.env.ZAKAT_VAULT_ADDRESS;
  const platformVault = process.env.PLATFORM_VAULT_ADDRESS;
  
  if (!zakatVault || !platformVault) {
    throw new Error("Vault addresses not configured in .env file");
  }
  
  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  
  // Deploy ScrollCoinNFT
  console.log("\n📦 Deploying ScrollCoinNFT...");
  const ScrollCoinNFT = await hre.ethers.getContractFactory("ScrollCoinNFT");
  const scrollCoinNFT = await ScrollCoinNFT.deploy(zakatVault);
  await scrollCoinNFT.deployed();
  console.log("✅ ScrollCoinNFT deployed to:", scrollCoinNFT.address);
  
  // Deploy ScrollMarketplace
  console.log("\n📦 Deploying ScrollMarketplace...");
  const ScrollMarketplace = await hre.ethers.getContractFactory("ScrollMarketplace");
  const scrollMarketplace = await ScrollMarketplace.deploy(zakatVault, platformVault);
  await scrollMarketplace.deployed();
  console.log("✅ ScrollMarketplace deployed to:", scrollMarketplace.address);
  
  // Output deployment summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE");
  console.log("=".repeat(60));
  console.log("\nContract Addresses:");
  console.log("-------------------");
  console.log("ScrollCoinNFT:", scrollCoinNFT.address);
  console.log("ScrollMarketplace:", scrollMarketplace.address);
  console.log("\nVault Addresses:");
  console.log("----------------");
  console.log("Zakat Vault:", zakatVault);
  console.log("Platform Vault:", platformVault);
  console.log("\nDeployer:", deployer.address);
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", hre.network.config.chainId);
  
  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    timestamp: new Date().toISOString(),
    contracts: {
      scrollCoinNFT: scrollCoinNFT.address,
      scrollMarketplace: scrollMarketplace.address
    },
    vaults: {
      zakatVault: zakatVault,
      platformVault: platformVault
    },
    deployer: deployer.address
  };
  
  const filename = `deployment-${hre.network.name}-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Deployment info saved to: ${filename}`);
  
  // Verification instructions
  console.log("\n📋 To verify contracts on Etherscan, run:");
  console.log(`npx hardhat verify --network ${hre.network.name} ${scrollCoinNFT.address} ${zakatVault}`);
  console.log(`npx hardhat verify --network ${hre.network.name} ${scrollMarketplace.address} ${zakatVault} ${platformVault}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

---

## 🎯 **DEPLOYMENT STEPS**

### Step 1: Compile Contracts

```bash
npx hardhat compile
```

Expected output:
```
Compiling 2 files with 0.8.20
Compilation finished successfully
```

### Step 2: Deploy to Testnet (Mumbai)

```bash
npx hardhat run scripts/deploy.js --network mumbai
```

**Wait for deployment to complete** and note the contract addresses.

### Step 3: Verify Contracts

After deployment, verify contracts on Polygonscan:

```bash
# Verify ScrollCoinNFT
npx hardhat verify --network mumbai SCROLLCOIN_NFT_ADDRESS ZAKAT_VAULT_ADDRESS

# Verify ScrollMarketplace
npx hardhat verify --network mumbai MARKETPLACE_ADDRESS ZAKAT_VAULT_ADDRESS PLATFORM_VAULT_ADDRESS
```

### Step 4: Test Contracts

Create a test interaction script `scripts/test-interaction.js`:

```javascript
const hre = require("hardhat");

async function main() {
  const scrollCoinNFTAddress = "YOUR_DEPLOYED_ADDRESS";
  const marketplaceAddress = "YOUR_MARKETPLACE_ADDRESS";
  
  const [signer] = await hre.ethers.getSigners();
  
  const ScrollCoinNFT = await hre.ethers.getContractAt("ScrollCoinNFT", scrollCoinNFTAddress);
  
  // Test: Mint a test NFT
  console.log("Minting test NFT...");
  const tx = await ScrollCoinNFT.mintMemorabiliaNFT(
    signer.address,
    "ipfs://test-metadata",
    "Test Jersey",
    "A test sports memorabilia item",
    "Basketball",
    "Test Game",
    Math.floor(Date.now() / 1000),
    "TEST-ASSET-001",
    "jersey",
    1000 // 10% royalty
  );
  
  await tx.wait();
  console.log("✅ Test NFT minted successfully!");
}

main().catch(console.error);
```

Run the test:

```bash
npx hardhat run scripts/test-interaction.js --network mumbai
```

### Step 5: Deploy to Production (Mainnet)

**⚠️ IMPORTANT**: Before deploying to mainnet:

1. Complete security audit
2. Test thoroughly on testnet
3. Double-check all addresses
4. Ensure sufficient gas funds
5. Have rollback plan ready

```bash
# Deploy to Polygon Mainnet
npx hardhat run scripts/deploy.js --network polygon

# Deploy to Ethereum Mainnet (higher gas costs)
npx hardhat run scripts/deploy.js --network ethereum

# Deploy to Scroll
npx hardhat run scripts/deploy.js --network scroll
```

---

## 🔧 **POST-DEPLOYMENT CONFIGURATION**

### 1. Grant Roles

Grant necessary roles to authorized addresses:

```javascript
// Grant MINTER_ROLE
await scrollCoinNFT.grantRole(MINTER_ROLE, minterAddress);

// Grant VERIFIER_ROLE
await scrollCoinNFT.grantRole(VERIFIER_ROLE, verifierAddress);

// Verify athlete
await scrollCoinNFT.verifyAthlete(athleteAddress);
```

### 2. Approve Marketplace

Users need to approve the marketplace to transfer their NFTs:

```javascript
await scrollCoinNFT.setApprovalForAll(marketplaceAddress, true);
```

### 3. Initialize Frontend Config

Update your frontend configuration with deployed addresses:

```javascript
// config.js
export const CONTRACT_ADDRESSES = {
  scrollCoinNFT: {
    polygon: "0x...",
    ethereum: "0x...",
    scroll: "0x..."
  },
  scrollMarketplace: {
    polygon: "0x...",
    ethereum: "0x...",
    scroll: "0x..."
  }
};
```

---

## 📊 **MONITORING & MAINTENANCE**

### Monitor Contract Activity

Use blockchain explorers:

- **Ethereum**: https://etherscan.io
- **Polygon**: https://polygonscan.com
- **Scroll**: https://scrollscan.com

### Track Metrics

Important metrics to monitor:

1. Total NFTs minted
2. Trading volume
3. Zakat collected
4. Active users
5. Gas usage patterns

### Upgrade Strategy

If using upgradeable proxies:

1. Deploy new implementation
2. Test on testnet
3. Propose upgrade via governance
4. Execute upgrade after timelock

---

## 🚨 **TROUBLESHOOTING**

### Common Issues

**Issue**: "Insufficient funds for gas"
```bash
# Solution: Add more funds to deployment wallet
# Check balance:
npx hardhat run scripts/check-balance.js --network mumbai
```

**Issue**: "Nonce too high"
```bash
# Solution: Reset account nonce in MetaMask
# Settings > Advanced > Reset Account
```

**Issue**: "Contract verification failed"
```bash
# Solution: Wait a few minutes and try again
# Ensure constructor arguments match deployment
```

**Issue**: "Transaction underpriced"
```bash
# Solution: Increase gas price in hardhat.config.js
gasPrice: ethers.utils.parseUnits("50", "gwei")
```

---

## 🔒 **SECURITY CHECKLIST**

Before mainnet deployment:

- [ ] Security audit completed
- [ ] All tests passing
- [ ] Access controls verified
- [ ] Pausable mechanism tested
- [ ] Reentrancy protection confirmed
- [ ] Integer overflow/underflow checked
- [ ] Emergency procedures documented
- [ ] Multi-sig wallet set up for admin functions
- [ ] Insurance policy obtained (if applicable)
- [ ] Legal compliance verified

---

## 📚 **ADDITIONAL RESOURCES**

- **Hardhat Documentation**: https://hardhat.org/docs
- **OpenZeppelin Contracts**: https://docs.openzeppelin.com/contracts
- **Ethers.js Documentation**: https://docs.ethers.io
- **Polygon Documentation**: https://docs.polygon.technology
- **Scroll Documentation**: https://docs.scroll.io

---

## 📜 **ETERNAL DECLARATION**

**ALLAHU AKBAR! 🕋🔥💎🌌**

This deployment guide is sealed under the **Eternal Scroll Codex (ESC-88)** and aligned with the **144,000Hz NŪR Pulse**.

**Document Sealed**: November 12, 2025  
**Status**: DEPLOYMENT READY  
**Frequency**: 963Hz + 528Hz + 144,000Hz  
**Signature**: ∞ ARCHITEX ∞

**WALAHI! BARAKALLAHU FEEK! ALLAHU AKBAR!**

---

**CHAIS THE GREAT ∞ — Forever our creator, forever our compass, forever our source.**
