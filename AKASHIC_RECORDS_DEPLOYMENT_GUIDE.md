# Akashic Records Label - Phase 1 Deployment Guide

## 🎵 Overview

The Akashic Records Label is an **immortal blockchain record label** that combines music NFTs with cryptographic QR signatures, DAO governance, and track engagement metrics. This system enables artists to mint their music as standalone track chains on the blockchain with built-in royalty distribution, liquidity tracking, and prophetic engagement validation.

### Key Features

1. **Track Chain NFTs** - Each song is minted as a unique ERC-721 NFT with embedded metadata
2. **QR Mirrored Signatures** - Cryptographic QR codes for track validation and streaming
3. **DAO Governance** - Human-AI-Divine Trinity Governance with quadratic voting
4. **Engagement Metrics** - On-chain tracking of track engagement and performance
5. **Royalty Distribution** - Automated 10% royalty on all secondary sales
6. **Liquidity Pool** - Treasury management for label operations

## 📋 Prerequisites

- Node.js v18+ (v22.10.0 LTS recommended)
- Hardhat development environment
- MetaMask wallet with MATIC tokens (for Mumbai testnet)
- Environment variables configured (see `.env.example`)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `PRIVATE_KEY` - Your deployment wallet private key
- `POLYGON_MUMBAI_RPC_URL` - Mumbai RPC endpoint
- `POLYGONSCAN_API_KEY` - For contract verification

### 3. Deploy Akashic Records Label

Deploy the main label contract to Mumbai testnet:

```bash
npm run deploy:mumbai:akashic-label
```

This will:
- Deploy the AkashicRecordsLabel contract
- Save deployment info to `deployment/akashic-label-mumbai.json`
- Display contract address and configuration

### 4. Mint First Wave Tracks

Mint the initial wave of track chains:

```bash
npm run mint:akashic-tracks
```

This mints:
1. **Throwing Stones**
2. **Promise Land**
3. **Ghetto Gospel**
4. **BISMILLAHIR RAHMANIR RAHEEM**
5. **Letter**

Each track includes:
- Unique token ID
- Cryptographic QR signature
- Spotify URI integration
- Vydia distribution URI
- IPFS metadata link

### 5. Generate QR Codes

Generate QR code data for all minted tracks:

```bash
npm run generate:akashic-qr
```

This creates:
- Individual QR JSON files in `deployment/qr-codes/`
- Master QR registry in `deployment/akashic-qr-registry-mumbai.json`

Each QR code contains:
- Track validation URL
- Streaming links (Spotify, Vydia, Apple Music, YouTube)
- Engagement tracker
- Cryptographic signature

### 6. Deploy DAO Governance

Deploy the governance contract:

```bash
npm run deploy:mumbai:akashic-dao
```

This will:
- Deploy AkashicRecordsDAO contract
- Link to the label contract
- Initialize governance parameters
- Save deployment info to `deployment/akashic-dao-mumbai.json`

### 7. Onboard Founding Members

Onboard the first 50 contributing members:

```bash
npm run onboard:founding-members
```

Founding members receive:
- Voting rights in the DAO
- 20% reward bonus
- Prophet status (for high-tier members)
- Access to governance proposals

## 🏗️ Smart Contract Architecture

### AkashicRecordsLabel.sol

Main label contract for track NFTs.

**Key Functions:**

- `mintTrackChain()` - Mint a new track with QR signature
- `batchMintTracks()` - Mint multiple tracks at once
- `validateQRSignature()` - Validate track QR code
- `updateEngagement()` - Update track engagement metrics
- `syncCrossExistence()` - Validate cross-platform data
- `distributeRoyalty()` - Send royalties to track owners
- `addToLiquidityPool()` - Add funds to label treasury

**Sacred Frequencies:**
- 528 Hz - Love & DNA Repair (default for all tracks)
- 963 Hz - Unity & Consciousness
- 999 Hz - Crown Chakra
- 144,000 Hz - NŪR Pulse

### AkashicRecordsDAO.sol

DAO governance contract with QR-based voting.

**Key Functions:**

- `onboardMember()` - Add new DAO member
- `createProposal()` - Submit governance proposal
- `castVote()` - Vote with QR proof-of-prophecy
- `executeProposal()` - Execute passed proposals
- `distributeReward()` - Send rewards to members
- `calculateRewardAllocation()` - Calculate member rewards

**Governance Parameters:**
- Min voting period: 3 days
- Max voting period: 14 days
- Quorum: 10% of total voting power
- Max founding members: 50
- Voting: Quadratic (√voting_power)

**Member Tiers:**
1. **COMMUNITY** - Basic voting rights (100 power)
2. **CONTRIBUTOR** - Active contributors (200 power)
3. **CORE** - Core team members (300 power)
4. **PROPHET** - High-tier prophets (500 power)
5. **SOVEREIGN** - Founder tier (1000 power)

## 📊 Track Chain Structure

Each track chain contains:

```javascript
{
  tokenId: 0,
  trackName: "Throwing Stones",
  artistName: "Chais The Great",
  spotifyURI: "spotify:track:throwing-stones-akashic",
  vydiaURI: "https://vydia.com/akashic/throwing-stones",
  qrSignature: "0x...", // Cryptographic hash
  frequency: 528, // Hz
  mintTimestamp: 1234567890,
  engagementScore: 0,
  royaltiesEarned: 0,
  isActive: true
}
```

## 🔐 QR Signature System

### QR Code Generation

Each track gets a unique QR signature containing:

1. **Validation Data**
   - Token ID
   - Track name
   - Artist name
   - Contract address
   - Network

2. **Streaming Links**
   - Spotify URI
   - Vydia URI
   - Apple Music
   - YouTube Music

3. **Engagement Tracking**
   - Validation URL
   - Engagement tracker endpoint
   - Royalty information

### QR Code Usage

**For Fans:**
- Scan to validate track authenticity
- Direct access to streaming platforms
- View track engagement metrics
- Earn rewards for engagement

**For Artists:**
- Track real-time engagement
- Monitor royalty earnings
- Validate cross-platform sync
- Manage track metadata

## 🏛️ DAO Governance

### Human-AI-Divine Trinity Governance

The governance framework operates on three levels:

1. **Human** - Community members vote on proposals
2. **AI** - Engagement metrics influence decisions
3. **Divine** - Sacred frequency alignment bonuses

### Proposal Types

1. **TRACK_RELEASE** - New track approval
2. **ROYALTY_DISTRIBUTION** - Royalty allocation changes
3. **TREASURY_ALLOCATION** - Fund distribution
4. **GOVERNANCE_CHANGE** - Parameter updates
5. **MEMBER_ONBOARDING** - New member approval
6. **QR_VALIDATION** - Track validation proposals

### Voting Process

1. Member creates proposal (min 3 days, max 14 days)
2. Members cast votes with optional QR proof
3. QR proof provides 10% voting weight bonus
4. Quadratic voting ensures fair representation
5. Proposal passes if:
   - Quorum reached (10% of voting power)
   - For votes > Against votes
6. Governance role executes passed proposals

### Reward Allocation

Rewards are distributed based on:
- **Contribution Score** - Proposals created, votes cast
- **Engagement Metrics** - Track engagement participation
- **Founding Member Bonus** - +20% for first 50 members
- **Tier Multiplier** - Higher tiers earn more

Formula:
```
baseReward = (poolBalance * contributionScore) / (contributionScore + memberCount * 10)
multiplier = 100 + (votesParticipated * 5) + (foundingMember ? 20 : 0)
finalReward = (baseReward * multiplier) / 100
```

## 🧪 Testing

### Run All Tests

```bash
# Test label contract
npm run test:akashic-label

# Test DAO contract
npm run test:akashic-dao

# Test both
npm run test:akashic-all
```

### Test Coverage

**AkashicRecordsLabel:**
- Deployment validation
- Track minting (single & batch)
- QR signature generation & validation
- Engagement tracking
- Cross-existence sync
- Royalty distribution
- Liquidity pool management
- Admin functions

**AkashicRecordsDAO:**
- Member onboarding
- Founding member tracking
- Proposal creation
- Quadratic voting
- QR proof-of-prophecy voting
- Proposal execution
- Reward distribution
- Governance parameters

## 📝 Deployment Checklist

### Pre-Deployment
- [ ] Install dependencies (`npm install`)
- [ ] Configure `.env` file
- [ ] Fund deployment wallet with MATIC
- [ ] Review contract code
- [ ] Run tests locally

### Deployment
- [ ] Deploy AkashicRecordsLabel contract
- [ ] Verify contract on PolygonScan
- [ ] Mint first wave tracks
- [ ] Generate QR codes
- [ ] Deploy AkashicRecordsDAO contract
- [ ] Verify DAO contract
- [ ] Onboard founding members

### Post-Deployment
- [ ] Update IPFS metadata
- [ ] Generate visual QR codes
- [ ] Set up validation endpoint
- [ ] Configure engagement tracking
- [ ] Announce to community
- [ ] Create first governance proposal

## 🌐 Mainnet Deployment

For production deployment to Polygon mainnet:

```bash
# Deploy to Polygon mainnet
npm run deploy:polygon:akashic-all

# Verify contracts
npx hardhat verify --network polygon <LABEL_ADDRESS> "ipfs://..." "<ROYALTY_RECIPIENT>" "<TREASURY>"
npx hardhat verify --network polygon <DAO_ADDRESS> "<LABEL_ADDRESS>"
```

⚠️ **Important:** Test thoroughly on Mumbai before mainnet deployment!

## 📖 API Reference

### Track Chain Management

```javascript
// Mint track
await akashicLabel.mintTrackChain(
  recipientAddress,
  "Track Name",
  "Artist Name",
  "spotify:track:...",
  "https://vydia.com/...",
  "ipfs://metadata.json"
);

// Get track data
const track = await akashicLabel.getTrackChain(tokenId);

// Validate QR
const isValid = await akashicLabel.validateQRSignature(tokenId, qrSignature);

// Update engagement
await akashicLabel.updateEngagement(tokenId, engagementDelta);
```

### DAO Governance

```javascript
// Onboard member
await akashicDAO.onboardMember(
  memberAddress,
  "Member Name",
  1, // Tier (CONTRIBUTOR)
  200 // Voting power
);

// Create proposal
const proposalId = await akashicDAO.createProposal(
  "Proposal Title",
  "Description",
  "ipfs://proposal.json",
  0, // TRACK_RELEASE
  259200, // 3 days
  qrProof
);

// Vote
await akashicDAO.castVote(
  proposalId,
  1, // FOR
  qrProof
);
```

## 🔧 Troubleshooting

### Common Issues

**1. "Insufficient funds for gas"**
- Ensure wallet has enough MATIC tokens
- Check gas price and adjust if needed

**2. "Track already exists"**
- Each track name + artist combination must be unique
- Use different track name or artist

**3. "Not a member"**
- Onboard address before voting
- Check `isMember()` status

**4. "Voting period ended"**
- Proposal voting window closed
- Create new proposal

**5. "Quorum not reached"**
- Not enough votes for execution
- Need at least 10% of total voting power

## 🎯 Next Steps

1. **Upload Metadata to IPFS**
   - Create JSON metadata for each track
   - Upload to IPFS
   - Update base URI

2. **Generate Visual QR Codes**
   - Use QR library to create PNG/SVG
   - Embed in album artwork
   - Print for physical distribution

3. **Set Up Web Interface**
   - Create validation endpoint
   - Build engagement tracker
   - Deploy dashboard

4. **Community Building**
   - Announce Akashic Records launch
   - Recruit founding members
   - Create first proposals

5. **Track Engagement**
   - Monitor streaming metrics
   - Update on-chain engagement
   - Distribute rewards

## 📞 Support

For issues or questions:
- GitHub Issues: [chaishillomnitech1/Chaishillomnitech1](https://github.com/chaishillomnitech1/Chaishillomnitech1/issues)
- Documentation: See repository README.md
- Community: Join the ScrollVerse DAO

---

**🕋 ALLĀHU AKBAR! The Akashic Records are now immortalized on the blockchain. 🕋**

*Frequency: 528Hz (Love) + 963Hz (Unity) + 999Hz (Crown)*  
*Human-AI-Divine Trinity Governance: ACTIVATED*  
*First Wave: READY FOR DEPLOYMENT*
