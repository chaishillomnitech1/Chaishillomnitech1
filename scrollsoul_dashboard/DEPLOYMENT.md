# 🕋 Genesis Coin Portal Deployment Guide 🕋

## **SUPREME KING CHAIS THE GREAT ∞ — OMNISOVEREIGN ARCHITECT**

**Document ID**: GCP-DEPLOY-001  
**Classification**: OMNISOVEREIGN DEPLOYMENT  
**Status**: SEALED LAW  
**Frequency**: 963Hz + 528Hz + 144,000Hz  
**Signature**: ∞ ARCHITEX ∞

---

## 🔥 **OVERVIEW**

This guide provides comprehensive instructions for deploying the Genesis Coin Public Portal, ensuring secure integration with the OmniTech1 Sovereign Dashboard.

---

## 📋 **PREREQUISITES**

### Required Software
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: Latest version
- **MetaMask**: Browser extension for Web3 integration

### Required Accounts
- MetaMask wallet with test/mainnet MATIC
- Alchemy/Infura account for RPC access (optional)
- Vercel/Netlify account for hosting (recommended)

---

## 🚀 **INSTALLATION**

### 1. Install Dependencies

```bash
cd scrollsoul_dashboard
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Update `.env` with your configuration:

```env
# Update with your deployed CHXToken address
REACT_APP_CHX_TOKEN_ADDRESS=0xYourCHXTokenAddress

# Configure network (polygon, mumbai, or localhost)
REACT_APP_DEFAULT_NETWORK=polygon
REACT_APP_CHAIN_ID=137
REACT_APP_RPC_URL=https://polygon-rpc.com

# Optional: Custom API endpoints
REACT_APP_API_URL=https://api.scrollverse.com
REACT_APP_WEBSOCKET_URL=wss://ws.scrollverse.com
```

---

## 🔧 **DEVELOPMENT**

### Start Development Server

```bash
npm start
```

The portal will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

---

## 🌐 **DEPLOYMENT**

### Option 1: Deploy to Vercel (Recommended)

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Deploy**:
```bash
vercel deploy --prod
```

3. **Configure Environment Variables** in Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env`

### Option 2: Deploy to Netlify

1. **Install Netlify CLI**:
```bash
npm install -g netlify-cli
```

2. **Build and Deploy**:
```bash
npm run build
netlify deploy --prod --dir=build
```

3. **Configure Environment Variables** in Netlify Dashboard:
   - Go to Site Settings → Build & Deploy → Environment
   - Add all variables from `.env`

### Option 3: Deploy to GitHub Pages

1. **Install gh-pages**:
```bash
npm install --save-dev gh-pages
```

2. **Add deployment scripts to package.json**:
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

3. **Deploy**:
```bash
npm run deploy
```

---

## 🔐 **SECURITY CONFIGURATION**

### 1. Smart Contract Setup

Ensure CHXToken contract is deployed and verified:

```bash
# From root directory
npx hardhat run scripts/deploy_chx_token.js --network polygon
npx hardhat verify --network polygon <CONTRACT_ADDRESS> "<CREATOR_VAULT>" "<AMBASSADOR_VAULT>" "<DAO_VAULT>"
```

### 2. Update Contract Address

Update the deployed contract address in `.env`:

```env
REACT_APP_CHX_TOKEN_ADDRESS=0xYourDeployedAddress
```

### 3. Configure CORS

If using custom API endpoints, ensure CORS is properly configured:

```javascript
// Example API CORS configuration
{
  "origin": ["https://your-portal-domain.com"],
  "methods": ["GET", "POST"],
  "allowedHeaders": ["Content-Type", "Authorization"]
}
```

---

## 🧪 **TESTING**

### Run Tests

```bash
npm test
```

### Test Wallet Connection

1. Open portal in browser
2. Click "Connect Wallet"
3. Approve MetaMask connection
4. Verify wallet address is displayed
5. Check that tokenomics data loads correctly

### Test Real-Time Updates

1. Connect wallet
2. Verify metrics update every 10 seconds
3. Check network node monitor displays active nodes
4. Confirm price chart updates with new data

---

## 📊 **MONITORING & ANALYTICS**

### Real-Time Monitoring

The portal includes built-in real-time monitoring:
- **Active Nodes**: Displays count and health of network nodes
- **Tokenomics**: Live supply, price, and market cap data
- **Network Health**: Visual health indicators and metrics

### Integration with Analytics

To integrate with Google Analytics or similar:

1. **Install analytics package**:
```bash
npm install react-ga4
```

2. **Configure in src/index.js**:
```javascript
import ReactGA from 'react-ga4';
ReactGA.initialize('G-YOUR-TRACKING-ID');
```

---

## 🔄 **UPDATES & MAINTENANCE**

### Update Dependencies

```bash
npm update
npm audit fix
```

### Update Contract Address

If CHXToken contract is redeployed:

1. Update `REACT_APP_CHX_TOKEN_ADDRESS` in `.env`
2. Rebuild and redeploy:
```bash
npm run build
vercel deploy --prod  # or your chosen platform
```

### Monitor Performance

Use Vercel Analytics or similar to monitor:
- Page load times
- Error rates
- User engagement
- Real-time active users

---

## 🛠️ **TROUBLESHOOTING**

### Issue: Wallet Won't Connect

**Solution**:
- Ensure MetaMask is installed and unlocked
- Check that you're on the correct network (Polygon)
- Clear browser cache and try again

### Issue: Contract Data Not Loading

**Solution**:
- Verify contract address in `.env` is correct
- Ensure contract is deployed to the selected network
- Check RPC endpoint is responding

### Issue: Real-Time Updates Not Working

**Solution**:
- Check WebSocket connection in browser console
- Verify API_URL and WEBSOCKET_URL in `.env`
- Ensure no firewall/proxy blocking WebSocket connections

---

## 📚 **ADDITIONAL RESOURCES**

### Documentation
- [CHXToken Contract Documentation](../contracts/CHXToken.sol)
- [React Documentation](https://react.dev/)
- [ethers.js Documentation](https://docs.ethers.org/)
- [Polygon Documentation](https://docs.polygon.technology/)

### Support
- **GitHub Issues**: Report bugs and request features
- **Discord**: Join the ScrollVerse community
- **Twitter**: @chaishill for updates

---

## 📜 **ETERNAL DECLARATION**

**ALLAHU AKBAR! 🕋🔥💎🌌**

The Genesis Coin Portal is sealed under the **Eternal Scroll Codex (ESC-88)**, serving as the divine interface for Genesis Coin (CHXToken) tokenomics and network monitoring.

**The Portal is Sacred.**  
**The Connection is Divine.**  
**The Deployment is Eternal.**

---

**CHAIS THE GREAT ∞ — Forever our creator, forever our compass, forever our source.**

**ALLAHU AKBAR! 🔥🕋🚀♾️❤️🧬💸**

*The Portal is Deployed. The Network is Active. The Future is Now.*

---

**Document Sealed**: November 24, 2025  
**Status**: ACTIVE DEPLOYMENT  
**Frequency**: 963Hz + 528Hz + 144,000Hz  
**Signature**: ∞ ARCHITEX ∞

**WALAHI! BARAKALLAHU FEEK! ALLAHU AKBAR!**
