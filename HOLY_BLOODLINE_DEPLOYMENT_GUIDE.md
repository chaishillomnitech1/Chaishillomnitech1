# Holy Bloodline NFT & Spiritual Coins Deployment Guide

## 🕊️ Overview

The Holy Bloodline system is a sacred infrastructure that integrates NFTs, spiritual reward tokens, and an activation portal to support divine alignment, truth, prosperity, and love.

### System Components

1. **Holy Bloodline NFT** - Sacred lineage chapter NFTs with embedded divine affirmations
2. **Truth Coin ($TRUTH)** - Rewards for journaling, meditation, and alignment practices  
3. **Prosperity Coin ($PROSPER)** - Rewards for abundance practices and generosity
4. **Love Coin ($LOVE)** - Rewards for heart-centered practices and compassion
5. **Spiritual Activation Portal** - Central hub for interactions and automated rewards

## 🔮 Frequency Alignments

| Component | Frequency | Significance |
|-----------|-----------|--------------|
| Holy Bloodline NFT | 963Hz + 999Hz + 144,000Hz | Pineal Activation + Crown Chakra + NŪR Pulse |
| Truth Coin | 144,000Hz | NŪR Pulse - Divine Truth |
| Prosperity Coin | 888Hz | Infinite Abundance |
| Love Coin | 528Hz | Love & DNA Repair |

## 📦 Token Supply

| Token | Total Supply | Distribution |
|-------|--------------|--------------|
| Holy Bloodline NFT | 144 NFTs | Max supply of sacred chapters |
| Truth Coin | 144,000,000 | 60% Rewards, 25% Treasury, 10% Dev, 5% Airdrop |
| Prosperity Coin | 888,000,000 | 55% Rewards, 30% Treasury, 10% Dev, 5% Airdrop |
| Love Coin | 528,000,000 | 50% Rewards, 30% Treasury, 15% Dev, 5% Airdrop |

## 🚀 Deployment

### Prerequisites

1. Node.js and npm installed
2. Hardhat environment configured
3. Wallet with sufficient testnet/mainnet funds
4. Environment variables configured (see `.env.example`)

### Environment Variables

Add these to your `.env` file:

```bash
# Deployment Wallet
PRIVATE_KEY=your_private_key_here
DEPLOYER_PRIVATE_KEY=your_deployer_private_key_here

# Holy Bloodline Configuration
HOLY_BLOODLINE_BASE_URI=ipfs://QmYourIPFSHash/
ROYALTY_RECIPIENT=0xYourRoyaltyAddress
COMMUNITY_TREASURY=0xYourTreasuryAddress
DEVELOPMENT_FUND=0xYourDevelopmentAddress

# Network RPC URLs
POLYGON_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
POLYGON_MAINNET_RPC_URL=https://polygon-rpc.com
SCROLL_SEPOLIA_RPC_URL=https://sepolia-rpc.scroll.io

# API Keys for Verification
POLYGONSCAN_API_KEY=your_polygonscan_api_key
SCROLLSCAN_API_KEY=your_scrollscan_api_key
```

### Deployment Commands

#### Individual Contract Deployment

```bash
# Deploy to Mumbai Testnet
npm run deploy:mumbai:holy-bloodline-nft
npm run deploy:mumbai:truth-coin
npm run deploy:mumbai:prosperity-coin
npm run deploy:mumbai:love-coin
npm run deploy:mumbai:spiritual-portal

# Deploy to Polygon Mainnet
npm run deploy:polygon:holy-bloodline-nft
npm run deploy:polygon:truth-coin
npm run deploy:polygon:prosperity-coin
npm run deploy:polygon:love-coin
npm run deploy:polygon:spiritual-portal

# Deploy to Scroll zkEVM
npm run deploy:scroll:holy-bloodline-nft
npm run deploy:scroll:truth-coin
npm run deploy:scroll:prosperity-coin
npm run deploy:scroll:love-coin
npm run deploy:scroll:spiritual-portal
```

#### Complete System Deployment

Deploy all contracts and configure integrations:

```bash
# Mumbai Testnet
npm run deploy:mumbai:holy-bloodline-system

# Polygon Mainnet
npm run deploy:polygon:holy-bloodline-system

# Scroll zkEVM
npm run deploy:scroll:holy-bloodline-system
```

The complete system deployment will:
1. Deploy all 5 contracts
2. Link NFT contract to all coins
3. Configure the Spiritual Activation Portal
4. Grant rewarder permissions to the portal
5. Verify all integrations

## 🧪 Testing

Run tests for individual contracts or the entire system:

```bash
# Individual Tests
npm run test:holy-bloodline-nft
npm run test:truth-coin
npm run test:prosperity-coin
npm run test:love-coin
npm run test:spiritual-portal

# Complete System Tests
npm run test:holy-bloodline-system
```

## 📖 Contract Features

### Holy Bloodline NFT

**Key Functions:**
- `mintHolyBloodline(address to, string chapterTitle)` - Mint new sacred chapter NFT
- `activateNFT(uint256 tokenId)` - Activate NFT for deeper alignment
- `sendMessage(uint256 tokenId, string message)` - Send guidance to holder
- `updateAlignmentLevel(uint256 tokenId, uint256 newLevel)` - Update alignment (1-12)
- `alignFrequency(uint256 tokenId, uint256 frequency)` - Align to specific frequency

**View Functions:**
- `getAffirmation()` - Get divine affirmation text
- `getNFTInfo(uint256 tokenId)` - Get complete NFT information
- `getMessages(uint256 tokenId)` - Get all guidance messages

### Spiritual Coins (Truth, Prosperity, Love)

**Reward Functions:**
- `rewardJournaling(address user, uint256 entries)` - Truth Coin
- `rewardMeditation(address user, uint256 sessions)` - Truth/Love Coin
- `rewardAlignment(address user, uint256 level)` - Truth Coin
- `rewardAffirmation(address user, uint256 count)` - Prosperity Coin
- `rewardWealthMilestone(address user, uint256 level)` - Prosperity Coin
- `rewardGenerosity(address user, uint256 acts)` - Prosperity Coin
- `rewardHeartMeditation(address user, uint256 sessions)` - Love Coin
- `rewardCompassion(address user, uint256 actions)` - Love Coin
- `rewardUnity(address user, uint256 practices)` - Love Coin
- `rewardForgiveness(address user, uint256 level)` - Love Coin

**Admin Functions:**
- `updateRewarder(address rewarder, bool status)` - Grant/revoke rewarder role
- `pause() / unpause()` - Emergency pause functionality
- `airdrop(address[] recipients, uint256[] amounts)` - Batch distribution

### Spiritual Activation Portal

**User Functions:**
- `activatePortal()` - Activate portal access
- `logReflection(string reflection)` - Log journal entry (earns Truth Coins)
- `recordAchievement(string desc, string category, uint256 points)` - Record achievement
- `recordMeditation(string type, uint256 sessions)` - Log meditation sessions
- `recordCompassion(uint256 actions)` - Log compassion acts (earns Love Coins)
- `recordUnity(uint256 practices)` - Log unity practices (earns Love Coins)
- `recordAffirmation(uint256 count)` - Log affirmations (earns Prosperity Coins)
- `recordGenerosity(uint256 acts)` - Log generosity (earns Prosperity Coins)

**View Functions:**
- `getUserStats(address user)` - Get complete user statistics
- `getUserReflections(address user, uint256 offset, uint256 limit)` - Paginated reflections
- `getUserAchievements(address user, uint256 offset, uint256 limit)` - Paginated achievements

## 🎁 Reward System

### Reward Amounts

**Truth Coin:**
- NFT Activation: 100 TRUTH
- Journaling: 10 TRUTH per entry
- Meditation: 50 TRUTH per session
- Alignment Achievement: 25 TRUTH per level

**Prosperity Coin:**
- Affirmation: 8 PROSPER per affirmation
- Prosperity Practice: 88 PROSPER per practice
- Wealth Milestone: 888 PROSPER per milestone
- Generosity: 44 PROSPER per act

**Love Coin:**
- Heart Meditation: 52 LOVE per session
- Compassion Action: 28 LOVE per action
- Unity Practice: 108 LOVE per practice
- Forgiveness: 77 LOVE per milestone

### Automated Distribution

The Spiritual Activation Portal automatically distributes rewards when users:
1. Log reflections/journal entries
2. Record meditation sessions
3. Complete spiritual tasks
4. Achieve alignment milestones

## 🔗 API Integration

### Web3 Integration Example

```javascript
const { ethers } = require('ethers');

// Contract addresses (from deployment)
const PORTAL_ADDRESS = '0x...';
const TRUTH_ADDRESS = '0x...';
const PROSPER_ADDRESS = '0x...';
const LOVE_ADDRESS = '0x...';
const NFT_ADDRESS = '0x...';

// Connect to contracts
const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = provider.getSigner();

const portal = new ethers.Contract(PORTAL_ADDRESS, PORTAL_ABI, signer);
const truthCoin = new ethers.Contract(TRUTH_ADDRESS, TRUTH_ABI, signer);

// Activate portal
await portal.activatePortal();

// Log a reflection (automatically earns Truth Coins)
await portal.logReflection("Today I aligned with divine truth...");

// Record meditation
await portal.recordMeditation("HEART", 1);

// Check user stats
const stats = await portal.getUserStats(userAddress);
console.log("Reflections:", stats.reflections.toString());
console.log("Alignment Score:", stats.alignment.toString());

// Check token balances
const truthBalance = await truthCoin.balanceOf(userAddress);
console.log("Truth Coins:", ethers.formatEther(truthBalance));
```

## 📱 Frontend Integration

### React/Next.js Example

```jsx
import { useContract, useContractWrite, useContractRead } from 'wagmi';

function SpiritualPortal() {
  const { write: logReflection } = useContractWrite({
    address: PORTAL_ADDRESS,
    abi: PORTAL_ABI,
    functionName: 'logReflection',
  });

  const { data: userStats } = useContractRead({
    address: PORTAL_ADDRESS,
    abi: PORTAL_ABI,
    functionName: 'getUserStats',
    args: [userAddress],
  });

  const handleLogReflection = async (text) => {
    await logReflection({ args: [text] });
  };

  return (
    <div>
      <h2>Your Spiritual Journey</h2>
      <p>Reflections: {userStats?.reflections?.toString()}</p>
      <p>Achievements: {userStats?.achievements?.toString()}</p>
      <p>Alignment Score: {userStats?.alignment?.toString()}</p>
      
      <textarea onChange={(e) => setReflection(e.target.value)} />
      <button onClick={() => handleLogReflection(reflection)}>
        Log Reflection (Earn 10 TRUTH)
      </button>
    </div>
  );
}
```

## 🔐 Security Considerations

1. **Ownership**: All contracts use OpenZeppelin's `Ownable` pattern
2. **Reentrancy Protection**: All reward functions use `ReentrancyGuard`
3. **Pausable**: Coins can be paused in emergency situations
4. **Access Control**: Rewarder role required for reward distribution
5. **Validation**: All inputs are validated before processing

## 🛠️ Post-Deployment Configuration

After deployment, ensure:

1. ✅ Portal has rewarder permissions on all coins
2. ✅ NFT contract address is set in all coins
3. ✅ All contract addresses are set in portal
4. ✅ Base URI is configured for NFT metadata
5. ✅ Royalty recipients are correctly set
6. ✅ Treasury and development fund addresses are configured

## 📊 Monitoring & Analytics

Track key metrics:
- Total NFTs minted
- Total rewards distributed per coin
- User engagement (reflections, achievements)
- Alignment score distribution
- Token holder distribution

## 🆘 Support & Documentation

- **Smart Contracts**: `/contracts/`
- **Deployment Scripts**: `/scripts/`
- **Test Files**: `/test/`
- **Configuration**: `.env.example`

## ⚡ Divine Affirmation

> "I am a vessel of eternal purpose, guided by divine light. My power flows effortlessly through me, recalibrating all to align with infinite truth."

---

**ALLĀHU AKBAR! The Holy Bloodline Protocol is LIVE!**

*Supreme King Chais The Great ∞*
