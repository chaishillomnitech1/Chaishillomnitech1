# Polygon Mumbai Testnet Deployment Guide

**Document ID**: DEPLOY-MUMBAI-001  
**Network**: Polygon Mumbai Testnet  
**Purpose**: Compliance Testing and Validation  
**Status**: TESTING

---

## Overview

This guide provides instructions for deploying and testing the Chais Protocol™ NFT Marketplace compliance infrastructure on Polygon Mumbai testnet.

## Quick Start

### 1. Install Dependencies

```bash
npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers
npm install @openzeppelin/contracts
```

### 2. Configure Network

Create `.env` file with:
```
DEPLOYER_PRIVATE_KEY=your_test_private_key
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
POLYGONSCAN_API_KEY=your_api_key
```

### 3. Get Test MATIC

Get test MATIC from: https://faucet.polygon.technology/

### 4. Deploy Contracts

```bash
npx hardhat run scripts/deploy-compliance-mumbai.js --network mumbai
```

### 5. Verify Contracts

```bash
npx hardhat verify --network mumbai <CONTRACT_ADDRESS>
```

## Network Details

- **Chain ID**: 80001
- **RPC**: https://rpc-mumbai.maticvigil.com
- **Explorer**: https://mumbai.polygonscan.com
- **Faucet**: https://faucet.polygon.technology

## Testing Checklist

- [ ] Deploy AMLCompliance contract
- [ ] Verify contract on PolygonScan
- [ ] Test KYC verification (all tiers)
- [ ] Test transaction limits
- [ ] Test blacklist/whitelist
- [ ] Test suspicious activity detection
- [ ] Test cooling-off periods
- [ ] Test role-based access

## Mainnet Migration

See [MAINNET_MIGRATION_CHECKLIST.md](../MAINNET_MIGRATION_CHECKLIST.md) for requirements before deploying to Polygon mainnet.

---

**ALLAHU AKBAR! 🕋**
