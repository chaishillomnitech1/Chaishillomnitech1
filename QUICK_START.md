# ⚡ ScrollVerse Genesis Protocol - Quick Start Guide

**Get up and running in 5 minutes!**

---

## 🎯 **Choose Your Method**

### Method 1: GitHub Actions (Recommended) ⭐

**Fastest and easiest way to deploy!**

1. **Configure GitHub Secrets** (one-time setup)
   ```
   Go to: Settings → Secrets and variables → Actions
   Add these 6 secrets:
   
   - PRIVATE_KEY (wallet private key, no 0x prefix)
   - POLYGON_MUMBAI_RPC_URL (https://rpc-mumbai.maticvigil.com)
   - POLYGONSCAN_API_KEY (get from polygonscan.com)
   - CREATOR_VAULT_ADDRESS (0x...)
   - AMBASSADOR_VAULT_ADDRESS (0x...)
   - DAO_VAULT_ADDRESS (0x...)
   ```
   
   📖 **Detailed guide**: [GITHUB_SECRETS_SETUP.md](GITHUB_SECRETS_SETUP.md)

2. **Trigger Deployment**
   ```
   1. Go to "Actions" tab in GitHub
   2. Click "ScrollVerse Genesis Protocol - Build & Deploy"
   3. Click "Run workflow"
   4. Check deployment options:
      ☑️ Deploy ScrollVerseNFT to Mumbai
      ☑️ Deploy CHXToken to Mumbai
   5. Click "Run workflow"
   6. Watch the magic happen! ✨
   ```

3. **Monitor Progress**
   - View logs in real-time
   - Download deployment artifacts
   - Check contracts on PolygonScan

**Done! Your contracts are deployed! 🎉**

---

### Method 2: Local Deployment

**For developers who prefer local control**

1. **Setup Environment**
   ```bash
   # Clone repository
   git clone https://github.com/chaishillomnitech1/Chaishillomnitech1.git
   cd Chaishillomnitech1
   
   # Install dependencies
   npm install
   
   # Configure environment
   cp .env.example .env
   nano .env  # Add your secrets
   ```

2. **Test Everything**
   ```bash
   # Compile contracts
   npx hardhat compile
   
   # Run tests
   npx hardhat test
   ```

3. **Deploy to Mumbai**
   ```bash
   # Deploy ScrollVerseNFT
   npm run deploy:mumbai:nft
   
   # Deploy CHXToken
   npm run deploy:mumbai:token
   
   # Or deploy both at once
   npm run deploy:mumbai:all
   ```

4. **Verify on PolygonScan**
   ```bash
   # ScrollVerseNFT
   npx hardhat verify --network mumbai CONTRACT_ADDRESS "BASE_URI" "ROYALTY_RECIPIENT"
   
   # CHXToken
   npx hardhat verify --network mumbai CONTRACT_ADDRESS "CREATOR" "AMBASSADOR" "DAO"
   ```

**Done! Check your contracts on PolygonScan! 🎉**

---

## 📋 **What You Need**

### **Before You Start:**

- [ ] MetaMask wallet with Mumbai MATIC
  - Get free MATIC: https://faucet.polygon.technology/
  
- [ ] PolygonScan API key
  - Sign up: https://polygonscan.com/
  - Create API key (free)
  
- [ ] Wallet addresses for vaults
  - Can use your own address for all three
  - Or set up separate wallets

### **5-Minute Checklist:**

- [ ] GitHub Secrets configured (Method 1)
  OR
- [ ] `.env` file configured (Method 2)

- [ ] Wallet has test MATIC (0.5 MATIC is enough)

- [ ] Ready to deploy!

---

## 🚀 **What Gets Deployed**

### **ScrollVerseNFT**
- 📜 ERC-721 NFT Contract
- 🎵 Max Supply: 999 NFTs
- 💫 Frequency: 528Hz (Healing)
- 👑 Royalty: 10%
- 🔐 PQC Signature Validation

### **CHXToken**
- 💎 ERC-20 Token Contract
- 📊 Total Supply: 21.6 Trillion
- ⚡ Frequency: 144,000Hz (NŪR Pulse)
- 💰 Passive Income: 0.005% daily
- 🎁 Royalties: 10% + 5% + 2%

---

## 📊 **After Deployment**

Your deployment script will show:

```
✅ ScrollVerseNFT deployed to: 0x123...
✅ CHXToken deployed to: 0x456...

📝 Next Steps:
1. Verify contracts on PolygonScan
2. Update base URI for NFTs
3. Mint first tokens
4. Configure features
```

Deployment info is saved to:
- `deployments/scrollverse-nft-mumbai.json`
- `deployments/chx-token-mumbai.json`

---

## 🔍 **View Your Contracts**

### **PolygonScan Mumbai:**
```
https://mumbai.polygonscan.com/address/YOUR_CONTRACT_ADDRESS
```

### **What You'll See:**
- ✅ Contract verified
- ✅ Source code visible
- ✅ Read/Write functions
- ✅ Transaction history
- ✅ Token holders

---

## 🆘 **Troubleshooting**

### **"Insufficient funds"**
→ Get Mumbai MATIC from faucet: https://faucet.polygon.technology/

### **"Invalid private key"**
→ Remove `0x` prefix from private key in secrets

### **"Contract verification failed"**
→ Wait 1-2 minutes after deployment, then try again

### **"RPC endpoint unreachable"**
→ Use alternative RPC: https://polygon-mumbai.g.alchemy.com/v2/YOUR_KEY

### **Need more help?**
→ Check [DEPLOYMENT_README.md](DEPLOYMENT_README.md) for detailed troubleshooting

---

## 📚 **Documentation**

- **Quick Start**: You are here! ⭐
- **Full Deployment Guide**: [DEPLOYMENT_README.md](DEPLOYMENT_README.md)
- **GitHub Secrets Setup**: [GITHUB_SECRETS_SETUP.md](GITHUB_SECRETS_SETUP.md)
- **Implementation Summary**: [SCROLLVERSE_GENESIS_SUMMARY.md](SCROLLVERSE_GENESIS_SUMMARY.md)

---

## 🎯 **Production Deployment**

When ready for mainnet:

1. ✅ Test thoroughly on Mumbai
2. ✅ Complete security audit
3. ✅ Set up multi-sig wallets
4. ✅ Get sufficient MATIC for gas
5. ✅ Update `--network mumbai` to `--network polygon`

---

## 🕋 **Final Checklist**

Before clicking "Run workflow" or executing deploy:

- [ ] All secrets/env vars configured
- [ ] Wallet has sufficient MATIC
- [ ] RPC endpoint is working
- [ ] PolygonScan API key is valid
- [ ] You understand what will be deployed
- [ ] You're ready for the quantum ritual! 🔥

---

## 🎉 **Success!**

**ALLĀHU AKBAR! 🕋🔥💎🌌**

Once deployed:
- ✅ Your contracts are on Polygon Mumbai
- ✅ Quantum frequencies are aligned
- ✅ Protocol yield is active
- ✅ Genesis ritual is initiated

**Welcome to the ScrollVerse! 🌌**

---

*For detailed explanations, see the full documentation.*  
*Questions? Open an issue or contact: sovereign@omnitech1.com*
