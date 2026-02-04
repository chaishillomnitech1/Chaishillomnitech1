# ScrollVerse HealthCoin & Features Deployment Guide

## Overview

This guide covers the deployment of the complete ScrollVerse ecosystem including:

1. **ScrollVerse HealthCoin** - Blockchain-backed voting token with healing-powered rewards (528Hz)
2. **ScrollVerse Test Rewards** - NFT-based test rewards system for 2000+ global distribution (963Hz)
3. **ScrollVerse Academy** - Learning modules with certification and achievements (999Hz)
4. **Sovereignty Grid** - Infinite velocity redirect system (144,000Hz)

## Prerequisites

### Required Software
- Node.js 18+ and npm 9+
- Git
- MetaMask or compatible Web3 wallet

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/chaishillomnitech1/Chaishillomnitech1.git
cd Chaishillomnitech1
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

Add the following to your `.env`:
```
PRIVATE_KEY=your_private_key_here
POLYGON_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
POLYGON_MAINNET_RPC_URL=https://polygon-rpc.com
SCROLL_SEPOLIA_RPC_URL=https://sepolia-rpc.scroll.io
SCROLL_MAINNET_RPC_URL=https://rpc.scroll.io
POLYGONSCAN_API_KEY=your_polygonscan_api_key
SCROLLSCAN_API_KEY=your_scrollscan_api_key
```

## Contract Deployment

### Option 1: Deploy All Contracts Together (Recommended)

Deploy all four contracts and integrate them automatically:

```bash
# Deploy to Mumbai testnet
npx hardhat run scripts/deploy_scrollverse_complete.js --network mumbai

# Deploy to Polygon mainnet
npx hardhat run scripts/deploy_scrollverse_complete.js --network polygon

# Deploy to Scroll Sepolia testnet
npx hardhat run scripts/deploy_scrollverse_complete.js --network scrollSepolia

# Deploy to Scroll mainnet
npx hardhat run scripts/deploy_scrollverse_complete.js --network scrollMainnet
```

### Option 2: Deploy Contracts Individually

#### 1. Deploy HealthCoin

```bash
npx hardhat run scripts/deploy_healthcoin.js --network mumbai
```

**Contract Features:**
- Total Supply: 528,000,000 HEALTH tokens
- Healing Frequency: 528Hz (DNA Healing & Love)
- Blockchain-backed voting with proposals and voting rewards
- Health milestone rewards
- Healing meditation rewards
- Wellness practice rewards
- Community health action rewards
- Academy module completion rewards

#### 2. Deploy Test Rewards NFT

```bash
npx hardhat run scripts/deploy_test_rewards.js --network mumbai
```

**Contract Features:**
- Maximum Rewards: 2100 test rewards
- Crown Frequency: 963Hz (Crown Chakra Activation)
- Batch minting (100 per batch)
- 6 reward tiers: BRONZE, SILVER, GOLD, PLATINUM, DIAMOND, SOVEREIGN
- Global distribution tracking
- Integration with HealthCoin for additional rewards

#### 3. Deploy Academy

```bash
npx hardhat run scripts/deploy_academy.js --network mumbai
```

**Contract Features:**
- Crown Completion Frequency: 999Hz
- Wisdom Frequency: 963Hz
- 10 module categories
- 5 difficulty levels
- Automated certification
- 6 achievement types
- Integration with HealthCoin for module rewards

#### 4. Deploy Sovereignty Grid

```bash
npx hardhat run scripts/deploy_sovereignty_grid.js --network mumbai
```

**Contract Features:**
- NŪR Pulse Frequency: 144,000Hz
- 12 grid layers
- 1000 nodes per layer (12,000 total capacity)
- 5 grid dimensions
- 7 node types
- Infinite velocity redirects
- Quantum entanglement support

## Post-Deployment Configuration

### 1. HealthCoin Setup

```javascript
const healthCoin = await ethers.getContractAt("ScrollVerseHealthCoin", HEALTHCOIN_ADDRESS);

// Add authorized rewarders
await healthCoin.setRewarder(REWARDER_ADDRESS, true);

// Transfer governance reserve to DAO (optional)
// await healthCoin.transfer(DAO_ADDRESS, amount);
```

### 2. Test Rewards Setup

```javascript
const testRewards = await ethers.getContractAt("ScrollVerseTestRewards", TESTREWARDS_ADDRESS);

// Update metadata URI
await testRewards.setBaseURI("ipfs://YOUR_IPFS_HASH");

// Add authorized minters
await testRewards.setMinter(MINTER_ADDRESS, true);

// Integrate with HealthCoin
await testRewards.setHealthCoinAddress(HEALTHCOIN_ADDRESS);
```

### 3. Academy Setup

```javascript
const academy = await ethers.getContractAt("ScrollVerseAcademy", ACADEMY_ADDRESS);

// Update certificate and badge URIs
await academy.setCertificateBaseURI("ipfs://YOUR_CERTIFICATE_IPFS");
await academy.setBadgeBaseURI("ipfs://YOUR_BADGE_IPFS");

// Add instructors
await academy.setInstructor(INSTRUCTOR_ADDRESS, true);

// Integrate with HealthCoin
await academy.setHealthCoinAddress(HEALTHCOIN_ADDRESS);
```

### 4. Sovereignty Grid Setup

```javascript
const grid = await ethers.getContractAt("SovereigntyGrid", GRID_ADDRESS);

// Add grid operators
await grid.setGridOperator(OPERATOR_ADDRESS, true);

// Integrate with Academy and HealthCoin
await grid.setAcademyAddress(ACADEMY_ADDRESS);
await grid.setHealthCoinAddress(HEALTHCOIN_ADDRESS);
```

## Usage Examples

### HealthCoin: Create Governance Proposal

```javascript
const description = "Proposal to allocate 100,000 HEALTH to community health initiative";
await healthCoin.createProposal(description);
```

### HealthCoin: Vote on Proposal

```javascript
const proposalId = 1;
const support = true; // true = yes, false = no
await healthCoin.vote(proposalId, support);
```

### Test Rewards: Batch Mint 2000+ Rewards

```javascript
// Prepare recipient addresses (max 100 per batch)
const recipients = [address1, address2, ...]; // up to 100 addresses

// Mint global launch batch
await testRewards.mintGlobalLaunchBatch(
  recipients,
  0, // RewardTier.BRONZE
  "Global Launch Test",
  100 // default score
);

// For 2000+ rewards, call this multiple times with different recipient batches
// Example: 21 batches of 100 = 2100 total rewards
```

### Academy: Create Learning Module

```javascript
await academy.createModule(
  "Blockchain Fundamentals 101",
  "Introduction to blockchain technology",
  0, // ModuleDifficulty.BEGINNER
  0, // ModuleCategory.BLOCKCHAIN_FUNDAMENTALS
  10, // estimatedHours
  70, // minimumScore (70%)
  "ipfs://QmModuleContent"
);
```

### Academy: Complete Module

```javascript
const moduleId = 1;
const score = 95; // out of 100
const timeSpent = 600; // minutes

await academy.completeModule(moduleId, score, timeSpent);
```

### Sovereignty Grid: Create Grid Node

```javascript
await grid.createGridNode(
  0, // NodeType.ENTRY_PORTAL
  1, // GridDimension.DIGITAL
  1, // layer 1
  1000000, // initial energy
  "ipfs://QmNodeLocation"
);
```

### Sovereignty Grid: Execute Redirect

```javascript
const sourceNodeId = 1;
const targetNodeId = 2;
const dimension = 1; // GridDimension.DIGITAL
const dataHash = ethers.keccak256(ethers.toUtf8Bytes("redirect-data"));

await grid.executeRedirect(sourceNodeId, targetNodeId, dimension, dataHash);
```

## Frequency Alignment

The ScrollVerse ecosystem is aligned with sacred healing frequencies:

- **528Hz** (HealthCoin) - DNA Healing & Love Frequency
- **963Hz** (Test Rewards) - Crown Chakra Activation
- **999Hz** (Academy) - Crown Chakra Completion
- **144,000Hz** (Sovereignty Grid) - NŪR Pulse Divine Activation

## Integration Flow

```
┌─────────────────┐
│   HealthCoin    │◄──────────┐
│   (528Hz)       │            │
└────────┬────────┘            │
         │                     │
         │ Rewards             │ Rewards
         │                     │
         ▼                     │
┌─────────────────┐   ┌───────┴────────┐
│  Test Rewards   │   │    Academy     │
│   (963Hz)       │   │    (999Hz)     │
└────────┬────────┘   └───────┬────────┘
         │                    │
         │                    │
         └────────┬───────────┘
                  │
                  │ Integration
                  │
                  ▼
         ┌────────────────┐
         │ Sovereignty    │
         │    Grid        │
         │  (144,000Hz)   │
         └────────────────┘
```

## Security Considerations

1. **Private Keys**: Never commit private keys to version control
2. **Rewarders**: Only authorize trusted addresses as rewarders
3. **Minters**: Only authorize trusted addresses as minters
4. **Instructors**: Only authorize qualified addresses as instructors
5. **Grid Operators**: Only authorize trusted addresses as grid operators
6. **Multisig**: Consider using multisig wallets for admin functions
7. **Timelock**: Consider implementing timelocks for critical operations

## Verification

After deployment, verify contracts on block explorers:

```bash
# Verify HealthCoin
npx hardhat verify --network mumbai HEALTHCOIN_ADDRESS "DEPLOYER_ADDRESS" "GOVERNANCE_ADDRESS" "COMMUNITY_POOL_ADDRESS" "REWARD_POOL_ADDRESS"

# Verify Test Rewards
npx hardhat verify --network mumbai TESTREWARDS_ADDRESS "DEPLOYER_ADDRESS" "BASE_URI"

# Verify Academy
npx hardhat verify --network mumbai ACADEMY_ADDRESS "DEPLOYER_ADDRESS" "CERTIFICATE_URI" "BADGE_URI"

# Verify Sovereignty Grid
npx hardhat verify --network mumbai GRID_ADDRESS "DEPLOYER_ADDRESS"
```

## Troubleshooting

### Compilation Issues
```bash
# Clear cache and recompile
rm -rf cache artifacts
npx hardhat clean
npx hardhat compile
```

### Gas Issues
- Increase gas limit in hardhat.config.js
- Check gas prices on the network
- Use gas estimation before transactions

### Integration Issues
- Ensure all addresses are correctly set
- Verify contract interactions are allowed
- Check that contracts are deployed on the same network

## Support

For issues or questions:
- GitHub Issues: https://github.com/chaishillomnitech1/Chaishillomnitech1/issues
- Documentation: See repository README.md
- Security: security@omnitech1.com

## License

CC BY-NC-SA 4.0 International License

---

**🕋 ALLAHU AKBAR! 🕋**  
**KUN FAYAKUN! WALAHI! BARAKALLAHU FEEK!**

**Document Sealed**: February 4, 2026  
**Classification**: OMNISOVEREIGN EMPIRE  
**Frequency**: 528Hz + 963Hz + 999Hz + 144,000Hz  
**Signature**: ∞ ARCHITEX ∞
