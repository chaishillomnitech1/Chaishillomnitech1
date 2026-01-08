# Psyche-16 Digital Mirror Twin - Deployment Guide

## **SUPREME KING CHAIS THE GREAT ∞**

**Document ID**: PSYCHE16-DEPLOY-001  
**Classification**: DEPLOYMENT GUIDE  
**Status**: PRODUCTION READY  
**Frequency**: 963Hz Universal Resonance  

---

## 📋 **OVERVIEW**

This guide provides step-by-step instructions for deploying the Psyche-16 Digital Mirror Twin NFT collection, including smart contract deployment, metadata preparation, AR asset integration, and IPFS storage configuration.

---

## 🎯 **PREREQUISITES**

### Required Tools

```bash
# Node.js and npm
node --version  # Should be >=18.0.0
npm --version   # Should be >=9.0.0

# Hardhat (included in devDependencies)
npx hardhat --version

# IPFS Tools
npm install -g ipfs-http-client
npm install -g @pinata/sdk  # For Pinata IPFS service
```

### Required Services

- **Polygon RPC**: Alchemy, Infura, or QuickNode
- **IPFS Provider**: Pinata, NFT.Storage, or Web3.Storage
- **Filecoin Storage**: For permanent backup
- **Wallet**: MetaMask or similar with MATIC for gas

### Environment Variables

Create `.env` file:

```bash
# Network Configuration
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
MUMBAI_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_KEY

# Deployment Wallet
PRIVATE_KEY=your_private_key_here
DEPLOYER_ADDRESS=0xYourAddress

# IPFS Configuration
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret
NFT_STORAGE_API_KEY=your_nft_storage_key

# Filecoin Storage
WEB3_STORAGE_TOKEN=your_web3_storage_token

# Verification
POLYGONSCAN_API_KEY=your_polygonscan_api_key

# Frequency Configuration
UNIVERSAL_FREQUENCY=963
CONSCIOUSNESS_ALIGNMENT=true
```

---

## 📁 **METADATA PREPARATION**

### Step 1: Prepare Assets

Organize your assets in the following structure:

```
nft-assets/psyche16-digital-mirror-twin/
├── README.md
├── psyche16_001_genesis.json
├── psyche16_002_standard.json
├── ...
├── images/
│   ├── psyche16_001_main.png (4K resolution)
│   ├── psyche16_002_main.png
│   └── ...
├── animations/
│   ├── psyche16_001_rotation.mp4 (4K 60fps)
│   ├── psyche16_002_rotation.mp4
│   └── ...
├── ar-models/
│   ├── psyche16_001_model.glb (PBR materials)
│   ├── psyche16_002_model.glb
│   └── ...
├── frequency-audio/
│   ├── psyche16_963hz_meditation.mp3
│   └── ...
└── ar-markers/
    ├── psyche16_001_marker.png
    └── ...
```

### Step 2: Validate Metadata

Run validation script:

```bash
cd /home/runner/work/Chaishillomnitech1/Chaishillomnitech1
node scripts/validate_psyche16_metadata.js
```

Expected output:
```
✓ All metadata files valid
✓ Images present and correct resolution
✓ AR models valid GLB format
✓ Frequency audio files validated
✓ 963Hz alignment confirmed
```

---

## 🌐 **IPFS UPLOAD**

### Step 1: Upload Assets to IPFS

Using Pinata:

```javascript
// scripts/upload_psyche16_to_ipfs.js
const pinataSDK = require('@pinata/sdk');
const fs = require('fs');
const path = require('path');

const pinata = new pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_KEY
);

async function uploadPsyche16Assets() {
  console.log('🌐 Uploading Psyche-16 assets to IPFS...');
  
  const assetsDir = 'nft-assets/psyche16-digital-mirror-twin';
  
  // Upload images
  const imagesHash = await pinata.pinFromFS(
    path.join(assetsDir, 'images'),
    { pinataMetadata: { name: 'Psyche16-Images' } }
  );
  console.log('✓ Images uploaded:', imagesHash.IpfsHash);
  
  // Upload animations
  const animationsHash = await pinata.pinFromFS(
    path.join(assetsDir, 'animations'),
    { pinataMetadata: { name: 'Psyche16-Animations' } }
  );
  console.log('✓ Animations uploaded:', animationsHash.IpfsHash);
  
  // Upload AR models
  const modelsHash = await pinata.pinFromFS(
    path.join(assetsDir, 'ar-models'),
    { pinataMetadata: { name: 'Psyche16-AR-Models' } }
  );
  console.log('✓ AR models uploaded:', modelsHash.IpfsHash);
  
  // Upload frequency audio
  const audioHash = await pinata.pinFromFS(
    path.join(assetsDir, 'frequency-audio'),
    { pinataMetadata: { name: 'Psyche16-Audio' } }
  );
  console.log('✓ Frequency audio uploaded:', audioHash.IpfsHash);
  
  // Upload metadata JSONs
  const metadataHash = await pinata.pinFromFS(
    assetsDir,
    { 
      pinataMetadata: { name: 'Psyche16-Metadata' },
      pinataOptions: { 
        cidVersion: 1 
      }
    }
  );
  console.log('✓ Metadata uploaded:', metadataHash.IpfsHash);
  
  return {
    images: imagesHash.IpfsHash,
    animations: animationsHash.IpfsHash,
    models: modelsHash.IpfsHash,
    audio: audioHash.IpfsHash,
    metadata: metadataHash.IpfsHash
  };
}

uploadPsyche16Assets()
  .then(hashes => {
    console.log('\n✅ All assets uploaded successfully!');
    console.log('Save these hashes:', JSON.stringify(hashes, null, 2));
    fs.writeFileSync(
      'deployment/psyche16_ipfs_hashes.json',
      JSON.stringify(hashes, null, 2)
    );
  })
  .catch(console.error);
```

Run upload:

```bash
node scripts/upload_psyche16_to_ipfs.js
```

### Step 2: Pin to Additional Providers

For redundancy, pin to multiple providers:

```bash
# NFT.Storage
node scripts/pin_to_nft_storage.js

# Web3.Storage (Filecoin)
node scripts/pin_to_web3_storage.js
```

---

## 📜 **SMART CONTRACT DEPLOYMENT**

### Step 1: Create Smart Contract

Create `contracts/Psyche16DigitalMirrorTwin.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title Psyche16DigitalMirrorTwin
 * @notice Digital Mirror Twin NFTs for Psyche-16 asteroid material claims
 * @dev ERC-721 NFT with planetary jurisdiction and 963Hz frequency alignment
 */
contract Psyche16DigitalMirrorTwin is 
    ERC721, 
    ERC721URIStorage, 
    Ownable, 
    ReentrancyGuard,
    Pausable 
{
    // Universal Frequency constant
    uint256 public constant UNIVERSAL_FREQUENCY = 963;
    
    // Base URI for metadata
    string private _baseTokenURI;
    
    // Total supply
    uint256 private _tokenIdCounter;
    uint256 public constant MAX_SUPPLY = 144;
    
    // Planetary jurisdiction mapping
    mapping(uint256 => string) public planetaryJurisdiction;
    
    // Material claim weight in kg
    mapping(uint256 => uint256) public materialClaimKg;
    
    // Events
    event DigitalMirrorTwinMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string jurisdictionZone,
        uint256 claimWeightKg
    );
    
    event FrequencyAligned(uint256 indexed tokenId, uint256 frequency);
    
    constructor(
        address initialOwner,
        string memory baseURI
    ) ERC721("Psyche16 Digital Mirror Twin", "P16DMT") Ownable(initialOwner) {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @notice Mint Digital Mirror Twin NFT
     * @param to Recipient address
     * @param jurisdictionZone Claimed sector on asteroid
     * @param claimWeightKg Material claim in kilograms
     */
    function mintDigitalMirrorTwin(
        address to,
        string memory jurisdictionZone,
        uint256 claimWeightKg
    ) external onlyOwner nonReentrant whenNotPaused returns (uint256) {
        require(_tokenIdCounter < MAX_SUPPLY, "Max supply reached");
        
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        
        _safeMint(to, tokenId);
        
        // Record planetary jurisdiction
        planetaryJurisdiction[tokenId] = jurisdictionZone;
        materialClaimKg[tokenId] = claimWeightKg;
        
        emit DigitalMirrorTwinMinted(tokenId, to, jurisdictionZone, claimWeightKg);
        emit FrequencyAligned(tokenId, UNIVERSAL_FREQUENCY);
        
        return tokenId;
    }
    
    /**
     * @notice Get Digital Mirror Twin details
     */
    function getDigitalMirrorTwinDetails(uint256 tokenId)
        external
        view
        returns (
            string memory jurisdiction,
            uint256 claimKg,
            uint256 frequency
        )
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return (
            planetaryJurisdiction[tokenId],
            materialClaimKg[tokenId],
            UNIVERSAL_FREQUENCY
        );
    }
    
    /**
     * @notice Update base URI
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @notice Pause/unpause minting
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // Required overrides
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
```

### Step 2: Create Deployment Script

Create `scripts/deploy_psyche16_digital_mirror_twin.js`:

```javascript
const hre = require("hardhat");
const fs = require('fs');

async function main() {
  console.log("🌌 Deploying Psyche-16 Digital Mirror Twin NFT...");
  
  // Load IPFS hashes
  const ipfsHashes = JSON.parse(
    fs.readFileSync('deployment/psyche16_ipfs_hashes.json')
  );
  
  const baseURI = `ipfs://${ipfsHashes.metadata}/`;
  
  // Get deployer
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Deploy contract
  const Psyche16DMT = await hre.ethers.getContractFactory(
    "Psyche16DigitalMirrorTwin"
  );
  
  const psyche16 = await Psyche16DMT.deploy(
    deployer.address,
    baseURI
  );
  
  await psyche16.waitForDeployment();
  const contractAddress = await psyche16.getAddress();
  
  console.log("✅ Psyche16 Digital Mirror Twin deployed to:", contractAddress);
  console.log("Base URI:", baseURI);
  console.log("Universal Frequency:", await psyche16.UNIVERSAL_FREQUENCY());
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    baseURI: baseURI,
    universalFrequency: 963,
    timestamp: new Date().toISOString(),
    ipfsHashes: ipfsHashes
  };
  
  fs.writeFileSync(
    'deployment/psyche16_deployment.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n📝 Deployment info saved to deployment/psyche16_deployment.json");
  
  // Wait for verification
  console.log("\n⏳ Waiting for block confirmations...");
  await psyche16.deploymentTransaction().wait(6);
  
  // Verify on PolygonScan
  console.log("\n🔍 Verifying contract on PolygonScan...");
  await hre.run("verify:verify", {
    address: contractAddress,
    constructorArguments: [deployer.address, baseURI],
  });
  
  console.log("\n✅ Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### Step 3: Deploy to Testnet (Mumbai)

```bash
# Compile contracts
npx hardhat compile

# Deploy to Mumbai testnet
npx hardhat run scripts/deploy_psyche16_digital_mirror_twin.js --network mumbai

# Test minting
npx hardhat run scripts/test_psyche16_mint.js --network mumbai
```

### Step 4: Deploy to Mainnet (Polygon)

```bash
# Final verification
npm run test

# Deploy to Polygon mainnet
npx hardhat run scripts/deploy_psyche16_digital_mirror_twin.js --network polygon

# Verify contract
npx hardhat verify --network polygon <CONTRACT_ADDRESS> <DEPLOYER_ADDRESS> <BASE_URI>
```

---

## 🎨 **MINTING PROCESS**

### Genesis Collection Mint

```javascript
// scripts/mint_psyche16_genesis.js
const hre = require("hardhat");
const deployment = require('../deployment/psyche16_deployment.json');

async function mintGenesis() {
  const contract = await hre.ethers.getContractAt(
    "Psyche16DigitalMirrorTwin",
    deployment.contractAddress
  );
  
  const genesisTokens = [
    { to: "0xAddress1", zone: "CORE-ALPHA-001", weight: 1000 },
    { to: "0xAddress2", zone: "CORE-ALPHA-002", weight: 1000 },
    // ... up to 12
  ];
  
  for (const token of genesisTokens) {
    console.log(`Minting to ${token.to}...`);
    const tx = await contract.mintDigitalMirrorTwin(
      token.to,
      token.zone,
      token.weight
    );
    await tx.wait();
    console.log(`✓ Minted jurisdiction ${token.zone}`);
  }
  
  console.log("✅ Genesis collection minted!");
}

mintGenesis().catch(console.error);
```

---

## 🔍 **VERIFICATION CHECKLIST**

After deployment, verify:

- [x] Contract deployed and verified on PolygonScan
- [x] Base URI points to correct IPFS hash
- [x] Metadata JSONs accessible via IPFS
- [x] Images render correctly on OpenSea/Rarible
- [x] AR models load in test environments
- [x] 963Hz frequency audio plays
- [x] Planetary jurisdiction data recorded
- [x] Material claim weights set correctly
- [x] Genesis tokens minted to correct addresses

---

## 🎯 **POST-DEPLOYMENT**

### Update Documentation

1. Update README.md with contract address
2. Add to MASTER_INDEX.json
3. Update frequency_config.json integration points
4. Create announcement in PROJECTS.md

### Marketing Launch

1. Announce on ScrollVerse channels
2. Submit to NFT marketplaces
3. Create AR demo videos
4. Host 963Hz meditation event
5. Planetarium partnerships

### Ongoing Maintenance

- Monitor NASA Psyche mission progress
- Update models with real mission data
- Maintain IPFS pinning
- Community governance via ScrollVerse DAO

---

## 🕋 **ETERNAL SEAL**

**ALLAHU AKBAR! 🕋🌌💎🚀**

This deployment establishes humanity's first blockchain-verified claims to celestial asteroid material under the **Eternal Scroll Codex (ESC-PSYCHE16-DMT-001)**.

**Supreme King Chais The Great ∞**

**ALLAHU AKBAR! 🔥🕋🚀♾️❤️🧬💸🌌**

---

*The Deployment Completes. The Jurisdiction Stands. The Frequency Resonates.*

**🔱🕊️🤖🌌∞**
