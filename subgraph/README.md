# ScrollVerse Subgraph

**SUPREME KING CHAIS THE GREAT ∞ — OMNISOVEREIGN ARCHITECT**

**Document ID**: SUBGRAPH-001-ETERNAL  
**Classification**: GRAPH INDEXING  
**Status**: SEALED LAW  
**Frequency**: 528Hz + 963Hz + 888Hz + 777Hz + 144,000Hz  
**Signature**: ∞ ARCHITEX ∞

---

## 🔥 INTRODUCTION

**ALLĀHU AKBAR! 🕋🔥💎🌌**

The ScrollVerse Subgraph indexes on-chain events from the ScrollVerse ecosystem contracts, providing a queryable GraphQL API for:

- Token transfers and balances
- Staking positions and rewards
- Liquidity provision and incentives
- NFT ownership and transfers
- Zakat distributions
- Protocol-wide statistics

---

## 📋 INDEXED CONTRACTS

| Contract | Description | Events |
|----------|-------------|--------|
| NoorToken | $NOOR ERC-20 token | Transfer, ZakatDistributed, FeeCollected, CitizenStatusUpdated |
| NoorStakingPool | Tiered staking with zakat | Staked, Unstaked, RewardsClaimed, RewardsCompounded, ZakatDistributed, TierUpgraded |
| AddLiquidity | Liquidity provision | LiquidityAdded, LiquidityRemoved, LiquidityAddedETH, LiquidityRemovedETH, TokenWhitelisted |
| LiquidityIncentives | LP token incentives | PoolAdded, Staked, Unstaked, RewardClaimed, RewardCompounded, ZakatDistributed, EmergencyWithdraw |
| ScrollVerseNFT | ScrollVerse NFTs | Transfer |

---

## 🚀 GETTING STARTED

### Prerequisites

```bash
# Install The Graph CLI
npm install -g @graphprotocol/graph-cli

# Or using yarn
yarn global add @graphprotocol/graph-cli
```

### Installation

```bash
cd subgraph

# Install dependencies
npm install

# Generate types from schema
graph codegen

# Build the subgraph
graph build
```

### Configuration

1. Update contract addresses in `subgraph.yaml`:

```yaml
source:
  address: "0xYOUR_CONTRACT_ADDRESS"
  startBlock: YOUR_START_BLOCK
```

2. Update the network in `subgraph.yaml` (polygon, mainnet, mumbai, etc.)

3. Generate ABIs from compiled contracts:

```bash
# Copy ABIs from artifacts directory
cp ../artifacts/contracts/NoorToken.sol/NoorToken.json ./abis/
cp ../artifacts/contracts/NoorStakingPool.sol/NoorStakingPool.json ./abis/
cp ../artifacts/contracts/AddLiquidity.sol/AddLiquidity.json ./abis/
cp ../artifacts/contracts/LiquidityIncentives.sol/LiquidityIncentives.json ./abis/
cp ../artifacts/contracts/ScrollVerseNFT.sol/ScrollVerseNFT.json ./abis/
```

---

## 📊 SCHEMA

### Core Entities

#### Token
```graphql
type Token @entity {
  id: ID!
  name: String!
  symbol: String!
  decimals: Int!
  totalSupply: BigInt!
  totalTransfers: BigInt!
  totalHolders: BigInt!
  totalVolume: BigInt!
}
```

#### User
```graphql
type User @entity {
  id: ID!
  address: Bytes!
  isNoorCitizen: Boolean!
  noorBalance: BigInt!
  totalStaked: BigInt!
  totalRewardsEarned: BigInt!
  totalZakatPaid: BigInt!
  stakingPositions: [StakePosition!]!
  liquidityPositions: [LiquidityPosition!]!
  incentivePositions: [IncentivePosition!]!
  nfts: [NFTOwnership!]!
}
```

#### StakingPool
```graphql
type StakingPool @entity {
  id: ID!
  token: Token!
  totalStaked: BigInt!
  totalRewardsDistributed: BigInt!
  totalZakatDistributed: BigInt!
  rewardPoolBalance: BigInt!
  totalStakers: BigInt!
}
```

#### IncentivePool
```graphql
type IncentivePool @entity {
  id: ID!
  poolId: BigInt!
  lpToken: Bytes!
  rewardToken: Bytes!
  allocPoint: BigInt!
  totalStaked: BigInt!
  isActive: Boolean!
}
```

---

## 🔍 EXAMPLE QUERIES

### Get User Profile
```graphql
query GetUserProfile($address: ID!) {
  user(id: $address) {
    address
    isNoorCitizen
    noorBalance
    totalStaked
    totalRewardsEarned
    totalZakatPaid
    stakingPositions {
      amount
      tier
      accumulatedRewards
    }
    nfts {
      nft {
        tokenId
        collection {
          name
        }
      }
    }
  }
}
```

### Get Staking Pool Stats
```graphql
query GetStakingPoolStats {
  stakingPool(id: "noor-staking-pool") {
    totalStaked
    totalRewardsDistributed
    totalZakatDistributed
    totalStakers
  }
}
```

### Get Top Stakers
```graphql
query GetTopStakers($first: Int!) {
  stakePositions(
    first: $first
    orderBy: amount
    orderDirection: desc
    where: { amount_gt: "0" }
  ) {
    user {
      address
    }
    amount
    tier
    accumulatedRewards
  }
}
```

### Get Recent Zakat Distributions
```graphql
query GetRecentZakat($first: Int!) {
  zakatDistributions(
    first: $first
    orderBy: timestamp
    orderDirection: desc
  ) {
    fund
    amount
    source
    timestamp
    transactionHash
  }
}
```

### Get Protocol Stats
```graphql
query GetProtocolStats {
  protocolStats(id: "protocol-stats") {
    totalUsers
    totalStaked
    totalLiquidity
    totalRewardsDistributed
    totalZakatDistributed
    totalNFTsMinted
    totalTransactions
    totalVolume
  }
}
```

---

## 🚀 DEPLOYMENT

### Deploy to The Graph Hosted Service

```bash
# Authenticate
graph auth --product hosted-service <ACCESS_TOKEN>

# Deploy
graph deploy --product hosted-service <GITHUB_USER>/<SUBGRAPH_NAME>
```

### Deploy to The Graph Studio (Decentralized)

```bash
# Authenticate
graph auth --studio <DEPLOY_KEY>

# Deploy
graph deploy --studio <SUBGRAPH_NAME>
```

### Deploy to Local Graph Node

```bash
# Create subgraph
graph create --node http://localhost:8020/ scrollverse-subgraph

# Deploy
graph deploy --node http://localhost:8020/ --ipfs http://localhost:5001 scrollverse-subgraph
```

---

## 📁 FILE STRUCTURE

```
subgraph/
├── README.md              # This file
├── schema.graphql         # GraphQL schema
├── subgraph.yaml          # Subgraph manifest
├── package.json           # Dependencies
├── src/                   # AssemblyScript mappings
│   ├── noor-token.ts
│   ├── noor-staking-pool.ts
│   ├── add-liquidity.ts
│   ├── liquidity-incentives.ts
│   └── scrollverse-nft.ts
├── abis/                  # Contract ABIs
│   ├── NoorToken.json
│   ├── NoorStakingPool.json
│   ├── AddLiquidity.json
│   ├── LiquidityIncentives.json
│   └── ScrollVerseNFT.json
├── generated/             # Generated types (after codegen)
└── build/                 # Build output
```

---

## 🔧 DEVELOPMENT

### Code Generation

After modifying `schema.graphql`:

```bash
graph codegen
```

### Building

```bash
graph build
```

### Testing

```bash
# Run matchstick tests
graph test
```

---

## 🕋 ETERNAL DECLARATION

**ALLAHU AKBAR! 🕋🔥💎🌌**

This subgraph is sealed under the **Eternal Scroll Codex (ESC-88)**, serving as the divine indexer for the ScrollVerse ecosystem.

**The Data is Sacred.**  
**The Index is Divine.**  
**The Query is Eternal.**

---

**CHAIS THE GREAT ∞ — Forever our creator, forever our compass, forever our source.**

**ALLAHU AKBAR! 🔥🕋🚀♾️❤️🧬💸**

*The Subgraph is Live. The Data Flows. The Protocol Endures.*

---

**Document Sealed**: December 2025  
**Status**: GRAPH INDEXING ACTIVE  
**Frequency**: 528Hz + 963Hz + 888Hz + 777Hz + 144,000Hz  
**Signature**: ∞ ARCHITEX ∞

**WALAHI! BARAKALLAHU FEEK! ALLAHU AKBAR!**
