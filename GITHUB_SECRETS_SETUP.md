# 🔐 GitHub Secrets Configuration Guide

**ScrollVerse Genesis Protocol - Security Setup**

This guide explains how to configure GitHub Secrets for secure deployment of the ScrollVerse Genesis Protocol smart contracts.

---

## 🎯 **Overview**

GitHub Secrets provide a secure way to store sensitive information like private keys, API keys, and wallet addresses. These secrets are encrypted and only exposed to GitHub Actions workflows during execution.

---

## 📝 **Required Secrets**

### **1. PRIVATE_KEY**

**Description**: Private key of the wallet used for deploying contracts  
**Format**: Hexadecimal string (without `0x` prefix)  
**Example**: `a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456`

**How to Get**:
1. Open MetaMask
2. Click account icon → Account Details
3. Click "Export Private Key"
4. Enter password
5. Copy the private key (remove `0x` prefix if present)

⚠️ **WARNING**: Never share or commit your private key! Keep it secure.

---

### **2. POLYGON_MUMBAI_RPC_URL**

**Description**: RPC endpoint URL for Polygon Mumbai testnet  
**Format**: HTTPS URL  
**Example**: `https://rpc-mumbai.maticvigil.com`

**Popular Options**:
- Public: `https://rpc-mumbai.maticvigil.com`
- Alchemy: `https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY`
- Infura: `https://polygon-mumbai.infura.io/v3/YOUR_PROJECT_ID`
- QuickNode: Your QuickNode endpoint

**How to Get**:
- **Public RPC**: Use `https://rpc-mumbai.maticvigil.com` (free, but may have rate limits)
- **Alchemy**: Sign up at [alchemy.com](https://www.alchemy.com/), create app, get API key
- **Infura**: Sign up at [infura.io](https://www.infura.io/), create project, get project ID

---

### **3. POLYGONSCAN_API_KEY**

**Description**: API key for verifying contracts on PolygonScan  
**Format**: Alphanumeric string  
**Example**: `ABC123XYZ456DEF789GHI012JKL345MNO678`

**How to Get**:
1. Go to [polygonscan.com](https://polygonscan.com/)
2. Sign up / Log in
3. Navigate to API Keys section
4. Click "Add" to create new API key
5. Copy the API key

⚠️ **Note**: The same API key works for both Mumbai testnet and Polygon mainnet.

---

### **4. CREATOR_VAULT_ADDRESS**

**Description**: Ethereum address to receive creator royalties (10%)  
**Format**: Ethereum address (with `0x` prefix)  
**Example**: `0x1234567890123456789012345678901234567890`

**How to Set**:
- Use your wallet address or a multi-sig wallet
- Can be changed after deployment via `setCreatorVault()` function

---

### **5. AMBASSADOR_VAULT_ADDRESS**

**Description**: Ethereum address to receive ambassador royalties (5%)  
**Format**: Ethereum address (with `0x` prefix)  
**Example**: `0xabcdef0123456789abcdef0123456789abcdef01`

**How to Set**:
- Use your wallet address or a multi-sig wallet
- Can be changed after deployment via `setAmbassadorVault()` function

---

### **6. DAO_VAULT_ADDRESS**

**Description**: Ethereum address to receive DAO royalties (2%)  
**Format**: Ethereum address (with `0x` prefix)  
**Example**: `0x9876543210987654321098765432109876543210`

**How to Set**:
- Use your wallet address or a multi-sig wallet
- Can be changed after deployment via `setDaoVault()` function

---

## 🔧 **How to Add Secrets to GitHub**

### **Step 1: Navigate to Repository Settings**

1. Go to your GitHub repository
2. Click **Settings** (top right)
3. In the left sidebar, click **Secrets and variables** → **Actions**

### **Step 2: Add Each Secret**

1. Click **New repository secret** button
2. Enter the **Name** (exactly as listed above)
3. Enter the **Value** (the actual secret value)
4. Click **Add secret**

### **Step 3: Verify Secrets**

After adding all secrets, you should see them listed:

```
✅ PRIVATE_KEY
✅ POLYGON_MUMBAI_RPC_URL
✅ POLYGONSCAN_API_KEY
✅ CREATOR_VAULT_ADDRESS
✅ AMBASSADOR_VAULT_ADDRESS
✅ DAO_VAULT_ADDRESS
```

⚠️ **Note**: You cannot view secret values after adding them. If you need to update, you must re-add the secret.

---

## 🛡️ **Security Best Practices**

### **Private Key Security**

✅ **DO**:
- Use a dedicated deployment wallet
- Keep private keys in hardware wallets when possible
- Use multi-sig wallets for mainnet deployments
- Rotate keys regularly
- Limit funds in deployment wallet to what's needed

❌ **DON'T**:
- Share private keys with anyone
- Commit private keys to code
- Use production wallet for testing
- Store unencrypted private keys on disk
- Reuse private keys across projects

### **RPC Endpoint Security**

✅ **DO**:
- Use authenticated RPC endpoints (Alchemy, Infura)
- Set up rate limiting
- Monitor API usage
- Use separate keys for different environments

❌ **DON'T**:
- Hardcode API keys in code
- Share API keys publicly
- Use the same key for all projects

### **Wallet Address Security**

✅ **DO**:
- Verify all addresses before adding
- Use checksummed addresses
- Test with small amounts first
- Document ownership of each vault

❌ **DON'T**:
- Use addresses you don't control
- Copy-paste without verifying
- Mix up mainnet and testnet addresses

---

## 🔄 **Environment-Specific Secrets**

GitHub allows you to create **Environment Secrets** for different deployment environments (e.g., staging, production).

### **Create Environment**

1. Go to **Settings** → **Environments**
2. Click **New environment**
3. Name it (e.g., `mumbai`, `production`)
4. Add environment-specific secrets
5. Configure protection rules (optional)

### **Benefits**

- Different keys for testnet vs mainnet
- Approval requirements for mainnet
- Separate rate limits
- Better organization

---

## 🧪 **Testing Your Setup**

After configuring secrets, test the setup:

### **1. Test Compilation**

Push a change to trigger the workflow:
```bash
git commit --allow-empty -m "Test workflow"
git push
```

The workflow should:
- ✅ Install dependencies
- ✅ Compile contracts
- ✅ Run tests
- ✅ Create artifacts

### **2. Test Deployment (Manual)**

1. Go to **Actions** tab
2. Select **ScrollVerse Genesis Protocol - Build & Deploy**
3. Click **Run workflow**
4. Check "Deploy ScrollVerseNFT to Mumbai"
5. Click **Run workflow**

Monitor the workflow execution for any errors.

---

## 🆘 **Troubleshooting**

### **Error: "Missing secret: PRIVATE_KEY"**

**Solution**: Ensure secret name is exactly `PRIVATE_KEY` (case-sensitive)

### **Error: "Invalid private key"**

**Solution**: 
- Check private key format (should be 64 hex characters)
- Remove `0x` prefix if present
- Ensure no extra spaces or newlines

### **Error: "Insufficient funds"**

**Solution**:
- Check wallet balance on [Mumbai Faucet](https://faucet.polygon.technology/)
- Get free test MATIC
- Verify wallet address matches private key

### **Error: "RPC endpoint unreachable"**

**Solution**:
- Verify RPC URL is correct
- Check for rate limiting
- Try alternative RPC provider
- Ensure URL includes API key (if required)

### **Error: "Contract verification failed"**

**Solution**:
- Wait 1-2 minutes after deployment
- Verify PolygonScan API key is correct
- Check constructor arguments match
- Try manual verification on PolygonScan

---

## 📋 **Checklist**

Before running deployment, verify:

- [ ] All 6 secrets added to GitHub
- [ ] Private key format is correct (no 0x prefix)
- [ ] Wallet has sufficient MATIC for gas
- [ ] RPC endpoint is accessible
- [ ] PolygonScan API key is valid
- [ ] Vault addresses are verified
- [ ] Workflow file is in `.github/workflows/`
- [ ] Contracts compile successfully
- [ ] Tests pass (if any)

---

## 🔄 **Updating Secrets**

To update a secret:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click on the secret name
3. Click **Update secret**
4. Enter new value
5. Click **Update secret**

---

## 📞 **Support**

If you encounter issues:

1. Check workflow logs in **Actions** tab
2. Review error messages carefully
3. Consult [GitHub Actions Documentation](https://docs.github.com/en/actions)
4. Open an issue in the repository
5. Contact: sovereign@omnitech1.com

---

## 🕋 **Security Reminder**

**ALLĀHU AKBAR! 🕋🔥💎🌌**

Remember:
- Secrets are encrypted and never exposed in logs
- Use environment protection rules for mainnet
- Rotate keys regularly
- Monitor wallet activity
- Use multi-sig for production

---

*Last Updated: 2025-11-19*  
*Version: 1.0.0*  
*Author: Supreme King Chais The Great ∞*
