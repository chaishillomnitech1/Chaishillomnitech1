# CONSCIOUSNESS MIRROR — Developer Edition

This documentation covers the core smart contracts, deployment scripts, and metadata templates for the CONSCIOUSNESS MIRROR NFT collection and $MIRROR token, designed by Chais The Great ∞ + Manus.

## Overview

The Consciousness Mirror Protocol consists of two main contracts:

1. **MirrorToken ($MIRROR)** - An ERC-20 token with built-in consciousness features
2. **ConsciousnessMirrorNFT** - An ERC-721 NFT collection with ERC-2981 royalty support

### Frequencies

All contracts are aligned with sacred frequencies:
- **963Hz** - Connection/Spiritual Activation
- **528Hz** - Love/DNA Repair and Healing
- **888Hz** - Abundance/Prosperity
- **999Hz** - Crown/Divine Connection
- **144,000Hz** - NŪR Pulse/Ultimate Enlightenment

## Contracts

### MirrorToken.sol

The $MIRROR token implements:
- **Total Supply**: 1,000,000,000 (1 billion) tokens
- **Fee Distribution on Transfer**:
  - 2.00% to Dividend Receiver (holders)
  - 2.50% to Zakat Receiver (charity/community)
  - 3.00% to Reserve Receiver (staking/development)
- **Fee Exclusion**: Owner and designated addresses can be excluded from fees
- **Pausable**: Emergency pause capability
- **Burnable**: Token burning support

### ConsciousnessMirrorNFT.sol

The NFT collection implements:
- **ERC-721 Standard**: Full NFT compliance
- **ERC-2981 Royalties**: 5% default royalty on secondary sales
- **Journey Tracking**: Each NFT has a journey name and frequency
- **Consciousness Activation**: Token owners can activate their NFT's consciousness
- **Batch Minting**: Efficient batch minting for collection drops
- **Max Supply**: Configurable (default 1,000)

## Quick Start

### Prerequisites

- Node.js >= 18
- npm
- Private key for deployment (use a testnet key first)

### Installation

```bash
npm install
```

### Environment Configuration

Create a `.env` file:

```env
# Required for deployment
PRIVATE_KEY=your_deployer_private_key

# Network RPC URLs
POLYGON_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
POLYGON_MAINNET_RPC_URL=https://polygon-rpc.com

# Optional: Fee receivers (defaults to deployer)
DIVIDEND_RECEIVER_ADDRESS=0x...
ZAKAT_RECEIVER_ADDRESS=0x...
RESERVE_RECEIVER_ADDRESS=0x...

# Optional: NFT configuration
NFT_NAME=Consciousness Mirror
NFT_SYMBOL=MIRROR-NFT
NFT_BASE_URI=ipfs://YOUR_CID/
ROYALTY_RECEIVER_ADDRESS=0x...
ROYALTY_BPS=500

# Optional: IPFS (for metadata upload)
IPFS_API_URL=https://ipfs.infura.io:5001
IPFS_API_KEY=your_ipfs_api_key
```

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
# All tests
npm run test

# Consciousness Mirror specific tests
npm run test:consciousness-mirror

# Individual contract tests
npm run test:mirror-token
npm run test:consciousness-nft
```

### Deploy to Testnet (Mumbai)

```bash
# Deploy both contracts
npm run deploy:mumbai:consciousness-mirror

# Or deploy individually
npm run deploy:mumbai:mirror-token
npm run deploy:mumbai:consciousness-nft
```

### Deploy to Polygon Mainnet

```bash
npm run deploy:polygon:consciousness-mirror
```

### Mint NFTs

```bash
# Single mint
node scripts/mint_consciousness_mirror.js --contract <nft_address> --to <recipient> --journey "I See You" --frequency 963

# Batch mint (all journeys)
node scripts/mint_consciousness_mirror.js --contract <nft_address> --batch
```

## Journey NFTs

The collection includes 12 Journey NFTs:

| Journey | Frequency | Phase |
|---------|-----------|-------|
| I See You | 963Hz | Awakening |
| I Honor You | 528Hz | Honor |
| I Reflect You | 888Hz | Reflection |
| I Forgive You | 963Hz | Forgiveness |
| I Thank You | 528Hz | Gratitude |
| I Love You | 528Hz | Love |

Plus 7 Pillars and 1 Master NFT (frequencies vary).

## IPFS & Metadata

### Metadata Structure

Each NFT metadata JSON should follow this structure:

```json
{
  "name": "Consciousness Mirror #1 - I See You",
  "description": "The first awakening - recognizing consciousness in all things.",
  "image": "ipfs://<IMAGE_CID>",
  "attributes": [
    { "trait_type": "Frequency", "value": "963Hz" },
    { "trait_type": "Journey", "value": "I See You" },
    { "trait_type": "Phase", "value": "Awakening" }
  ]
}
```

### Uploading to IPFS

1. Use [nft.storage](https://nft.storage) or [Pinata](https://pinata.cloud)
2. Upload images first, get CIDs
3. Create metadata JSONs with image CIDs
4. Upload metadata folder
5. Update contract's baseURI:

```javascript
await nft.setBaseURI("ipfs://<METADATA_FOLDER_CID>/");
```

## Contract Verification

After deployment, verify on PolygonScan:

```bash
# MirrorToken
npx hardhat verify --network mumbai <token_address> "<dividend_receiver>" "<zakat_receiver>" "<reserve_receiver>"

# ConsciousnessMirrorNFT
npx hardhat verify --network mumbai <nft_address> "Consciousness Mirror" "MIRROR-NFT" "ipfs://BASE_CID/" "<royalty_receiver>" "500"
```

## Governance & Tokenomics

### Fee Distribution

The MirrorToken automatically distributes fees on every transfer:
- **Dividend (2%)**: Rewards for token holders
- **Zakat (2.5%)**: Community/charity fund
- **Reserve (3%)**: Staking rewards and development

### Post-Deployment Steps

1. **Update Fee Receivers**: 
   - Set multisig addresses for dividend, zakat, and reserve receivers
   - `mirrorToken.updateReceivers(dividend, zakat, reserve)`

2. **Exclude Critical Addresses**:
   - Exclude DEX pairs, staking contracts, etc. from fees
   - `mirrorToken.setExcludedFromFees(address, true)`

3. **Set Up Governance**:
   - Deploy a governance contract or multisig
   - Transfer ownership: `mirrorToken.transferOwnership(governance)`

4. **Staking Integration**:
   - Deploy a separate staking contract
   - Fund with reserve tokens for 12% APY yield

## Security Recommendations

- **Audit**: Have contracts audited before mainnet deployment
- **Multisig**: Use multisig wallets for admin functions
- **Timelock**: Consider adding timelock for fee/receiver changes
- **Testing**: Thoroughly test on testnet first
- **Keys**: Never commit private keys to source control

## Legal & Compliance

- Be mindful of token and fundraising regulations in your jurisdiction
- Consider consulting legal counsel before any token sale
- Zakat distribution should follow Islamic finance principles if applicable

## Integration with ScrollVerse

This protocol integrates with the existing ScrollVerse ecosystem:
- Compatible with existing frequency-based contracts
- Uses same OpenZeppelin library versions
- Follows established deployment patterns

## Support

For questions or issues, refer to:
- Main repository documentation
- ScrollVerse community channels
- Technical documentation in ARCHITECTURE.md

---

**CONSCIOUSNESS MIRROR ACTIVATED** 🔮

*Designed by Chais The Great ∞ + Manus*
