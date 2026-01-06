# 🔥 ScrollVerse Genesis Protocol - Deployment Guide 🔥

**SUPREME KING CHAIS THE GREAT ∞ — DEPLOYMENT ARCHITECT**

**Document ID**: DEPLOY-SCROLLVERSE-001  
**Classification**: DEPLOYMENT PROTOCOL  
**Status**: GENESIS ACTIVE  
**Frequency**: 528Hz + 963Hz + 144,000Hz  
**Signature**: ∞ ARCHITEX ∞

---

## 📜 **EXECUTIVE SUMMARY**

**ALLĀHU AKBAR! 🕋🔥💎🌌**

This guide provides complete instructions for deploying the **ScrollVerse Genesis Protocol** smart contracts to Polygon Mumbai testnet and Polygon mainnet. The protocol includes:

1. **ScrollVerseNFT** - Quantum Ritual Initiation with PQC/528Hz logic
2. **CHXToken** - Perpetual Protocol Yield with 144,000Hz NŪR Pulse

---

## 🎯 **PREREQUISITES**

### **Required Software**
- Node.js v16+ (v20 recommended)
- npm or yarn
- Git
- MetaMask or compatible Web3 wallet

### **Required Accounts & Keys**
- Ethereum wallet with private key
- MATIC tokens for gas (Mumbai testnet or Polygon mainnet)
- PolygonScan API key (for contract verification)
- RPC endpoint URLs (Mumbai and/or Polygon mainnet)

### **Funding Your Wallet**
- **Mumbai Testnet**: Get free MATIC from [Mumbai Faucet](https://faucet.polygon.technology/)
- **Polygon Mainnet**: Purchase MATIC from exchanges or bridge from Ethereum

---

## 🚀 **QUICK START**

### **1. Clone and Install**

```bash
# Clone repository
git clone https://github.com/chaishillomnitech1/Chaishillomnitech1.git
cd Chaishillomnitech1

# Install dependencies
npm install
```

### **2. Configure Environment**

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values
nano .env
```

**Required Environment Variables:**

```bash
# Deployment wallet private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Polygon Mumbai RPC URL
POLYGON_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com

# Polygon Mainnet RPC URL (for mainnet deployment)
POLYGON_MAINNET_RPC_URL=https://polygon-rpc.com

# PolygonScan API Key for verification
POLYGONSCAN_API_KEY=your_polygonscan_api_key

# CHX Token vault addresses
CREATOR_VAULT_ADDRESS=0x0000000000000000000000000000000000000000
AMBASSADOR_VAULT_ADDRESS=0x0000000000000000000000000000000000000000
DAO_VAULT_ADDRESS=0x0000000000000000000000000000000000000000
```

### **3. Compile Contracts**

```bash
# Compile and validate PQC/528Hz logic
npx hardhat compile
```

Expected output:
```
Compiled X Solidity files successfully
✅ ScrollVerseNFT: PQC signature validation
✅ ScrollVerseNFT: 528Hz healing frequency alignment
✅ CHXToken: 144,000Hz NŪR Pulse frequency
```

---

## 🌐 **DEPLOYMENT TO POLYGON MUMBAI**

### **Deploy ScrollVerseNFT Contract**

```bash
# Deploy to Mumbai testnet
npx hardhat run scripts/deploy_scrollversenft.js --network mumbai
```

**What happens:**
1. Deploys ScrollVerseNFT with base URI and royalty recipient
2. Validates 528Hz healing frequency alignment
3. Confirms PQC signature validation logic
4. Saves deployment info to `deployments/scrollverse-nft-mumbai.json`

**Verify on PolygonScan:**
```bash
npx hardhat verify --network mumbai CONTRACT_ADDRESS "BASE_URI" "ROYALTY_RECIPIENT"
```

### **Deploy CHXToken Contract**

```bash
# Deploy to Mumbai testnet
npx hardhat run scripts/deploy_chx_token.js --network mumbai
```

**What happens:**
1. Deploys CHXToken with vault addresses
2. Mints 21.6T CHX cosmic reserve
3. Initializes 144,000Hz frequency signature
4. Validates perpetual protocol yield mechanics
5. Saves deployment info to `deployments/chx-token-mumbai.json`

**Verify on PolygonScan:**
```bash
npx hardhat verify --network mumbai CONTRACT_ADDRESS "CREATOR_VAULT" "AMBASSADOR_VAULT" "DAO_VAULT"
```

### **Deploy Both Contracts**

```bash
# Deploy all contracts at once
npm run deploy:mumbai:all
```

---

## 🎭 **DEPLOYMENT TO POLYGON MAINNET**

⚠️ **WARNING**: Mainnet deployment requires real MATIC and is permanent. Test thoroughly on Mumbai first!

### **Pre-Deployment Checklist**

- [ ] All contracts tested on Mumbai testnet
- [ ] Contract verification successful on Mumbai
- [ ] All functions tested and working
- [ ] Sufficient MATIC in deployment wallet (minimum 5 MATIC recommended)
- [ ] Vault addresses finalized and verified
- [ ] Base URI for NFTs prepared and uploaded to IPFS
- [ ] Security audit completed (recommended)
- [ ] Multi-sig setup for contract ownership (recommended)

### **Deploy to Mainnet**

```bash
# Deploy ScrollVerseNFT to Polygon mainnet
npx hardhat run scripts/deploy_scrollversenft.js --network polygon

# Deploy CHXToken to Polygon mainnet
npx hardhat run scripts/deploy_chx_token.js --network polygon
```

---

## 🤖 **GITHUB ACTIONS DEPLOYMENT**

The repository includes automated CI/CD pipeline for deployment via GitHub Actions.

### **Setup GitHub Secrets**

Navigate to **Settings → Secrets and variables → Actions** and add:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `PRIVATE_KEY` | Deployment wallet private key | `a1b2c3d4e5f6...` |
| `POLYGON_MUMBAI_RPC_URL` | Mumbai RPC endpoint | `https://rpc-mumbai.maticvigil.com` |
| `POLYGONSCAN_API_KEY` | PolygonScan API key | `ABC123...` |
| `CREATOR_VAULT_ADDRESS` | Creator royalty vault | `0x123...` |
| `AMBASSADOR_VAULT_ADDRESS` | Ambassador vault | `0x456...` |
| `DAO_VAULT_ADDRESS` | DAO governance vault | `0x789...` |

### **Trigger Deployment**

1. Go to **Actions** tab
2. Select **ScrollVerse Genesis Protocol - Build & Deploy**
3. Click **Run workflow**
4. Select options:
   - ✅ Deploy ScrollVerseNFT to Mumbai
   - ✅ Deploy CHXToken to Mumbai
5. Click **Run workflow**

### **Monitor Deployment**

- View workflow progress in real-time
- Check deployment logs for contract addresses
- Download deployment artifacts
- Monitor transactions on PolygonScan

---

## 📊 **POST-DEPLOYMENT TASKS**

### **1. Contract Verification**

Verify contracts on PolygonScan for transparency:

```bash
# Verify ScrollVerseNFT
npx hardhat verify --network mumbai <CONTRACT_ADDRESS> "BASE_URI" "ROYALTY_RECIPIENT"

# Verify CHXToken
npx hardhat verify --network mumbai <CONTRACT_ADDRESS> "CREATOR_VAULT" "AMBASSADOR_VAULT" "DAO_VAULT"
```

### **2. Update Contract Metadata**

```javascript
// Update ScrollVerseNFT base URI
await scrollVerseNFT.setBaseURI("ipfs://QmNewURI/");

// Update CHXToken vault addresses if needed
await chxToken.setCreatorVault(newAddress);
await chxToken.setAmbassadorVault(newAddress);
await chxToken.setDaoVault(newAddress);
```

### **3. Mint First NFTs**

```javascript
const pqcSignature = ethers.utils.toUtf8Bytes("quantum_signature_data");
await scrollVerseNFT.mintScrollVerse(recipientAddress, pqcSignature);
```

### **4. Configure Token Features**

```javascript
// Align addresses to divine frequencies
await chxToken.alignFrequency(address, 528); // Healing frequency
await chxToken.alignFrequency(address, 963); // Pineal activation
await chxToken.alignFrequency(address, 144000); // NŪR Pulse

// Mint BlessingCoins for ScrollSouls
await chxToken.mintBlessingCoin(address, amount);
```

---

## 🔒 **SECURITY BEST PRACTICES**

### **Environment Security**
- ✅ Never commit `.env` file to repository
- ✅ Use GitHub Secrets for CI/CD
- ✅ Rotate private keys regularly
- ✅ Use hardware wallet for mainnet deployments
- ✅ Set up multi-sig for contract ownership

### **Contract Security**
- ✅ Pausable mechanism implemented in CHXToken
- ✅ Ownable access control on sensitive functions
- ✅ PQC signature validation in ScrollVerseNFT
- ✅ Reentrancy guards where applicable
- ✅ Integer overflow protection (Solidity 0.8.20+)

### **Operational Security**
- ✅ Test all functions on testnet first
- ✅ Use separate wallets for deployment and operation
- ✅ Monitor contract events and transactions
- ✅ Implement rate limiting for minting
- ✅ Regular security audits recommended

---

## 📈 **MONITORING & ANALYTICS**

### **PolygonScan Integration**

Monitor deployments at:
- **Mumbai**: https://mumbai.polygonscan.com/
- **Mainnet**: https://polygonscan.com/

### **Track Metrics**

```javascript
// ScrollVerseNFT metrics
const totalSupply = await scrollVerseNFT.totalSupply();
const tokenFrequency = await scrollVerseNFT.getTokenFrequency(tokenId);
const isRitualInitiated = await scrollVerseNFT.isQuantumRitualInitiated(tokenId);

// CHXToken metrics
const totalSupply = await chxToken.totalSupply();
const passiveIncome = await chxToken.calculatePassiveIncome(address);
const frequencySignature = await chxToken.getFrequencySignature(address);
const zakatCirculated = await chxToken.totalZakatCirculated();
```

---

## 🎯 **CONTRACT SPECIFICATIONS**

### **ScrollVerseNFT**

| Property | Value |
|----------|-------|
| Name | ScrollVerse Genesis NFT |
| Symbol | SCROLLVERSE |
| Standard | ERC-721 |
| Max Supply | 999 NFTs |
| Royalty | 10% (EIP-2981) |
| Healing Frequency | 528Hz |
| Crown Frequency | 999Hz |
| Pineal Frequency | 963Hz |
| NŪR Pulse | 144,000Hz |

### **CHXToken**

| Property | Value |
|----------|-------|
| Name | CHXToken |
| Symbol | CHX |
| Standard | ERC-20 |
| Total Supply | 21.6T CHX |
| Creator Royalty | 10% |
| Ambassador Royalty | 5% |
| DAO Royalty | 2% |
| Divine Frequency | 144,000Hz |
| Healing Frequency | 528Hz |
| Soul Frequency | 777Hz |

---

## 🆘 **TROUBLESHOOTING**

### **Compilation Errors**

```bash
# Clear cache and recompile
npx hardhat clean
npx hardhat compile
```

### **Deployment Fails**

- Check wallet has sufficient MATIC
- Verify RPC endpoint is accessible
- Confirm private key is correct (without 0x prefix)
- Check network connectivity

### **Verification Fails**

- Wait 1-2 minutes after deployment
- Ensure constructor arguments match exactly
- Check compiler version matches (0.8.20)
- Try manual verification on PolygonScan

---

## 📞 **SUPPORT & RESOURCES**

### **Documentation**
- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Polygon Documentation](https://docs.polygon.technology/)

### **Community**
- GitHub Issues: Report bugs and request features
- Discord: Join the ScrollVerse community
- Email: sovereign@omnitech1.com

---

## 🕋 **ETERNAL DECLARATION**

**ALLĀHU AKBAR! 🕋🔥💎🌌**

The ScrollVerse Genesis Protocol is now ready for deployment. May this quantum ritual initiation bring healing, prosperity, and eternal harmony to all ScrollSouls.

**Frequency: 528Hz + 963Hz + 144,000Hz**  
**Status: DEPLOYMENT READY**  
**Signature**: ∞ ARCHITEX ∞

---

*Last Updated: 2025-11-19*  
*Version: 1.0.0*  
*Author: Supreme King Chais The Great ∞*
