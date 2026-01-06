# Phase-1 Quick Start Guide

**Supreme King Allah Chais Kenyatta Hill ∞**

---

## 🚀 5-Minute Deployment

### Prerequisites
```bash
node --version  # v16+
npm --version   # v8+
```

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your private key and RPC URLs
```

### 3. Deploy Contracts
```bash
# Deploy to Polygon Mumbai (testnet)
npx hardhat run scripts/deploy_divine_logic_gate.js --network mumbai
npx hardhat run scripts/deploy_blessing_coin.js --network mumbai
npx hardhat run scripts/deploy_layer2_hub.js --network mumbai

# Save the deployed addresses to .env
```

### 4. Verify Deployment
```bash
npx hardhat run scripts/verify_phase1_deployment.js --network mumbai
```

---

## 📋 Contract Cheat Sheet

### DivineLogicGate

**Key Functions:**
```solidity
// Sync quantum alignment to specific frequency
synchronizeQuantumAlignment(963) // 963 Hz

// Align user to frequency
alignAddressResonance(userAddress, 528) // 528 Hz

// Validate transaction
validateSovereignTransaction(from, to, amount)

// Record block state
recordBlockQuantumState()
```

**Frequencies:**
- `528` - Healing (DNA repair)
- `888` - Empathy (cosmic resonance)
- `963` - Pineal (divine connection)
- `999` - Crown (Tawhid flames)
- `144000` - NŪR Pulse (supreme consciousness)

---

### BlessingCoin

**Key Functions:**
```solidity
// Configure Layer-2
configureLayer2Rollup("Optimism", true)

// Execute batch distribution
executeScrollDrop([addr1, addr2], [100e18, 200e18], batchId)

// Set airdrop merkle root
setAirdropMerkleRoot(merkleRoot)
setAirdropActive(true)

// User claims airdrop
claimAirdrop(amount, merkleProof)

// Distribute single blessing
distributeBlessing(recipient, amount)
```

**Token Info:**
- Name: BlessingCoin
- Symbol: BLESS
- Decimals: 18
- Initial Supply: 1,000,000,000 BLESS

---

### Layer2ScalingHub

**Key Functions:**
```solidity
// Configure provider
configureProvider(0, providerConfig) // 0 = Optimism

// Process batch
processBatch(0, transactions, merkleRoot)

// Enable hybrid scaling
setHybridScaling(true)
setInstantThroughputMode(true)

// Configure bridge
configureBridge(0, bridgeAddress) // 0 = Native
```

**Providers:**
- `0` - Optimism (Chain ID: 10)
- `1` - zkSync Era (Chain ID: 324)
- `2` - Arbitrum One (Chain ID: 42161)
- `3` - Base
- `4` - Polygon zkEVM

---

## 🎨 Frontend Integration

### Install Frontend Dependencies
```bash
npm install ethers react
```

### Import Component
```javascript
import BlessingCoinDApp from './components/BlessingCoinDApp';
import './components/BlessingCoinDApp.css';

function App() {
  return <BlessingCoinDApp />;
}
```

### Configure Contracts
```javascript
// src/config.js
export const CONTRACTS = {
  DIVINE_LOGIC_GATE: process.env.REACT_APP_DIVINE_LOGIC_GATE_ADDRESS,
  BLESSING_COIN: process.env.REACT_APP_BLESSING_COIN_ADDRESS,
  LAYER2_HUB: process.env.REACT_APP_LAYER2_HUB_ADDRESS
};
```

---

## 🔧 Common Tasks

### Align User to Frequency
```javascript
const divineLogicGate = await ethers.getContractAt("DivineLogicGate", ADDRESS);
await divineLogicGate.alignAddressResonance(userAddress, 888); // 888 Hz empathy
```

### Execute ScrollDrop Airdrop
```javascript
const blessingCoin = await ethers.getContractAt("BlessingCoin", ADDRESS);

// Prepare batch
const recipients = [addr1, addr2, addr3];
const amounts = [100e18, 200e18, 300e18]; // in wei
const batchId = 1;

// Execute
await blessingCoin.executeScrollDrop(recipients, amounts, batchId);
```

### Configure Layer-2 Provider
```javascript
const layer2Hub = await ethers.getContractAt("Layer2ScalingHub", ADDRESS);

const config = {
  name: "Optimism",
  bridgeAddress: "0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1",
  chainId: 10,
  enabled: true,
  gasLimit: 8000000,
  minBatchSize: 10,
  maxBatchSize: 100
};

await layer2Hub.configureProvider(0, config); // 0 = L2Provider.OPTIMISM
```

### Setup Merkle Airdrop
```javascript
const blessingCoin = await ethers.getContractAt("BlessingCoin", ADDRESS);

// Generate merkle tree (use merkletreejs library)
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

const leaves = [
  [user1Address, amount1],
  [user2Address, amount2],
  // ...
].map(([addr, amt]) => keccak256(ethers.solidityPacked(['address', 'uint256'], [addr, amt])));

const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
const root = tree.getHexRoot();

// Set merkle root
await blessingCoin.setAirdropMerkleRoot(root);
await blessingCoin.setAirdropActive(true);

// User claims with proof
const leaf = keccak256(ethers.solidityPacked(['address', 'uint256'], [userAddress, amount]));
const proof = tree.getHexProof(leaf);
await blessingCoin.claimAirdrop(amount, proof);
```

---

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test
```bash
npx hardhat test test/DivineLogicGate.test.js
npx hardhat test test/BlessingCoin.test.js
npx hardhat test test/Layer2ScalingHub.test.js
```

### Local Network Testing
```bash
# Terminal 1: Start local node
npx hardhat node

# Terminal 2: Deploy to local
npx hardhat run scripts/deploy_divine_logic_gate.js --network localhost
npx hardhat run scripts/deploy_blessing_coin.js --network localhost
npx hardhat run scripts/deploy_layer2_hub.js --network localhost
```

---

## 📊 Monitoring

### Check System Status
```bash
# Use verify script
npx hardhat run scripts/verify_phase1_deployment.js --network mumbai
```

### Event Monitoring
```javascript
// Listen to quantum alignment updates
divineLogicGate.on("QuantumAlignmentUpdated", (aligned, resonance, timestamp) => {
  console.log(`Quantum aligned to ${resonance} Hz at ${timestamp}`);
});

// Listen to blessing distributions
blessingCoin.on("BlessingDistributed", (recipient, amount, frequency) => {
  console.log(`${amount} BLESS sent to ${recipient} @ ${frequency} Hz`);
});

// Listen to ScrollDrop executions
blessingCoin.on("ScrollDropExecuted", (batchId, count, total) => {
  console.log(`Batch ${batchId}: ${count} recipients, ${total} BLESS`);
});
```

---

## 🔐 Security Checklist

Before mainnet deployment:

- [ ] Audit all smart contracts
- [ ] Test on testnet thoroughly
- [ ] Verify contract source code on explorer
- [ ] Configure multi-sig for owner operations
- [ ] Set up monitoring and alerts
- [ ] Test emergency procedures
- [ ] Review gas optimization
- [ ] Validate frequency parameters
- [ ] Test Layer-2 bridges
- [ ] Backup deployment keys securely

---

## 🆘 Troubleshooting

### "Insufficient gas" error
```bash
# Increase gas limit in hardhat.config.js
networks: {
  mumbai: {
    gas: 8000000,
    gasPrice: 30000000000
  }
}
```

### "Nonce too high" error
```bash
# Reset account nonce
npx hardhat run scripts/reset_nonce.js --network mumbai
```

### Contract verification failed
```bash
# Manual verification
npx hardhat verify --network mumbai CONTRACT_ADDRESS
```

### Frontend not connecting
```javascript
// Check network in MetaMask matches contract deployment
const chainId = await window.ethereum.request({ method: 'eth_chainId' });
console.log('Connected to chain:', parseInt(chainId, 16));
```

---

## 📞 Support

- **Documentation**: [PHASE1_DEPLOYMENT_GUIDE.md](./PHASE1_DEPLOYMENT_GUIDE.md)
- **Implementation**: [PHASE1_IMPLEMENTATION_SUMMARY.md](./PHASE1_IMPLEMENTATION_SUMMARY.md)
- **Twitter**: [@chaishill](https://x.com/chaishill)
- **GitHub**: [chaishillomnitech1](https://github.com/chaishillomnitech1)

---

## 🕋 Divine Mandate

All operations align with the eternal decree of Supreme King Allah Chais Kenyatta Hill ∞

**Status**: PHASE-1 ACTIVE  
**Frequency**: 528 + 963 + 888 Hz  
**Protocol**: ETERNAL  

🕋 **ALLAHU AKBAR** 🕋

---

*The Eternal Dance is Perfected. The Code is Sealed. The Legacy is Immortal.*
