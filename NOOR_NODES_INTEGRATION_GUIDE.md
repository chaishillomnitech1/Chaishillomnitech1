# 🔗 Noor Nodes Integration Guide

**BISMILLAH - In the name of Allah, the Most Gracious, the Most Merciful**

## 📋 Overview

This guide provides instructions for integrating Noor Nodes with existing ScrollVerse components and external applications.

**Frequency: 528Hz + 963Hz + 999Hz**

---

## 🎯 Integration Points

### 1. CHXToken Integration

**Purpose**: Validate CHXToken transfers and monitor zakat distributions

#### Smart Contract Integration

```solidity
// Example: CHXToken with Noor Nodes validation
import "./NoorNodes.sol";

contract CHXToken {
    NoorNodes public noorNodes;
    
    function setNoorNodes(address _noorNodes) external onlyOwner {
        noorNodes = NoorNodes(_noorNodes);
    }
    
    function transfer(address to, uint256 amount) public override returns (bool) {
        // Optional: Check if transaction should be validated by nodes
        if (amount > VALIDATION_THRESHOLD) {
            require(address(noorNodes) != address(0), "Noor Nodes not set");
            bytes32 txHash = keccak256(abi.encodePacked(msg.sender, to, amount, block.timestamp));
            // Transaction hash can be used for validation
        }
        
        return super.transfer(to, amount);
    }
}
```

#### JavaScript Integration

```javascript
const { ethers } = require('ethers');

// Connect to contracts
const noorNodesAddress = "0x...";
const chxTokenAddress = "0x...";

const noorNodesABI = [...];
const chxTokenABI = [...];

const provider = new ethers.JsonRpcProvider(RPC_URL);
const noorNodes = new ethers.Contract(noorNodesAddress, noorNodesABI, provider);
const chxToken = new ethers.Contract(chxTokenAddress, chxTokenABI, provider);

// Monitor CHX transfers and validate
chxToken.on("Transfer", async (from, to, amount, event) => {
    const txHash = event.transactionHash;
    
    // Submit for validation
    if (isRegisteredNode) {
        await noorNodes.validateTransaction(ethers.keccak256(ethers.toUtf8Bytes(txHash)));
    }
});
```

---

### 2. ScrollCourt Engine Integration

**Purpose**: IP security validation and dispute resolution support

#### Smart Contract Integration

```solidity
contract ScrollCourtEngine {
    NoorNodes public noorNodes;
    
    struct Dispute {
        uint256 id;
        address initiator;
        address defendant;
        string ipfsEvidence;
        uint8 validationCount;
        bool resolved;
    }
    
    mapping(uint256 => Dispute) public disputes;
    
    function submitDispute(
        address _defendant,
        string memory _ipfsEvidence
    ) external returns (uint256) {
        uint256 disputeId = disputes.length;
        disputes[disputeId] = Dispute({
            id: disputeId,
            initiator: msg.sender,
            defendant: _defendant,
            ipfsEvidence: _ipfsEvidence,
            validationCount: 0,
            resolved: false
        });
        
        // Request validation from Anchor Nodes
        emit DisputeSubmitted(disputeId, msg.sender, _defendant);
        return disputeId;
    }
    
    function validateDispute(uint256 _disputeId) external {
        require(noorNodes.isActiveNode(msg.sender), "Not an active node");
        require(!disputes[_disputeId].resolved, "Already resolved");
        
        // Only Anchor Nodes can validate disputes
        (uint8 nodeType,,,) = noorNodes.getNodeInfo(msg.sender);
        require(nodeType == 1, "Only Anchor Nodes"); // 1 = ANCHOR
        
        disputes[_disputeId].validationCount++;
        
        // Auto-resolve after threshold
        if (disputes[_disputeId].validationCount >= 3) {
            disputes[_disputeId].resolved = true;
            emit DisputeResolved(_disputeId);
        }
    }
}
```

---

### 3. VibeCanvas Marketplace Integration

**Purpose**: NFT transaction validation and frequency-aligned minting

#### Smart Contract Integration

```solidity
import "./NoorNodes.sol";
import "./VibeCanvasFrequencyForge.sol";

contract VibeCanvasMarketplace {
    NoorNodes public noorNodes;
    VibeCanvasFrequencyForge public forge;
    
    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
        uint256 frequency;
        bool active;
    }
    
    mapping(uint256 => Listing) public listings;
    
    function purchaseNFT(uint256 _listingId) external payable {
        Listing storage listing = listings[_listingId];
        require(listing.active, "Not active");
        require(msg.value >= listing.price, "Insufficient payment");
        
        // Validate transaction with nodes
        bytes32 txHash = keccak256(
            abi.encodePacked(
                msg.sender,
                listing.seller,
                listing.tokenId,
                block.timestamp
            )
        );
        
        // Emit event for node validation
        emit NFTPurchaseInitiated(_listingId, msg.sender, txHash);
        
        // Transfer NFT
        forge.transferFrom(listing.seller, msg.sender, listing.tokenId);
        
        // Transfer payment
        payable(listing.seller).transfer(msg.value);
        
        listing.active = false;
        
        emit NFTPurchased(_listingId, msg.sender);
    }
    
    function validatePurchase(bytes32 _txHash) external {
        require(noorNodes.isActiveNode(msg.sender), "Not an active node");
        noorNodes.validateTransaction(_txHash);
    }
}
```

---

### 4. ScrollTemple Assets Integration

**Purpose**: Physical and digital asset linking

#### Smart Contract Integration

```solidity
contract ScrollTempleAssets {
    NoorNodes public noorNodes;
    
    struct Asset {
        uint256 id;
        string physicalLocation;
        string digitalTwin;
        uint256 frequency;
        address[] validators;
        bool verified;
    }
    
    mapping(uint256 => Asset) public assets;
    
    function registerAsset(
        string memory _physicalLocation,
        string memory _digitalTwin,
        uint256 _frequency
    ) external returns (uint256) {
        require(
            _frequency == 528 || _frequency == 963 || _frequency == 999,
            "Invalid frequency"
        );
        
        uint256 assetId = assets.length;
        assets[assetId] = Asset({
            id: assetId,
            physicalLocation: _physicalLocation,
            digitalTwin: _digitalTwin,
            frequency: _frequency,
            validators: new address[](0),
            verified: false
        });
        
        emit AssetRegistered(assetId, _frequency);
        return assetId;
    }
    
    function validateAsset(uint256 _assetId) external {
        require(noorNodes.isActiveNode(msg.sender), "Not an active node");
        
        Asset storage asset = assets[_assetId];
        require(!asset.verified, "Already verified");
        
        // Check if validator already validated
        for (uint i = 0; i < asset.validators.length; i++) {
            require(asset.validators[i] != msg.sender, "Already validated");
        }
        
        asset.validators.push(msg.sender);
        
        // Require 3 Anchor Node validations
        if (asset.validators.length >= 3) {
            asset.verified = true;
            emit AssetVerified(_assetId);
        }
    }
}
```

---

## 🔌 API Integration

### REST API Example

```javascript
// Express.js API server for Noor Nodes integration

const express = require('express');
const { ethers } = require('ethers');
const app = express();

app.use(express.json());

// Configuration
const NOOR_NODES_ADDRESS = process.env.NOOR_NODES_ADDRESS;
const RPC_URL = process.env.RPC_URL;

const provider = new ethers.JsonRpcProvider(RPC_URL);
const noorNodesABI = [...]; // Load ABI
const noorNodes = new ethers.Contract(NOOR_NODES_ADDRESS, noorNodesABI, provider);

// Get node information
app.get('/api/nodes/:address', async (req, res) => {
    try {
        const { address } = req.params;
        
        const isRegistered = await noorNodes.isRegistered(address);
        
        if (!isRegistered) {
            return res.status(404).json({ error: 'Node not registered' });
        }
        
        const nodeInfo = await noorNodes.getNodeInfo(address);
        
        res.json({
            address,
            nodeType: nodeInfo.nodeType === 0 ? 'LIGHT' : 'ANCHOR',
            status: ['ACTIVE', 'INACTIVE', 'SUSPENDED'][nodeInfo.status],
            validationCount: nodeInfo.validationCount.toString(),
            stakedAmount: ethers.formatEther(nodeInfo.stakedAmount),
            frequency: nodeInfo.frequency.toString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all nodes
app.get('/api/nodes', async (req, res) => {
    try {
        const operators = await noorNodes.getAllNodeOperators();
        
        const nodes = await Promise.all(
            operators.map(async (address) => {
                const nodeInfo = await noorNodes.getNodeInfo(address);
                return {
                    address,
                    nodeType: nodeInfo.nodeType === 0 ? 'LIGHT' : 'ANCHOR',
                    status: ['ACTIVE', 'INACTIVE', 'SUSPENDED'][nodeInfo.status],
                    frequency: nodeInfo.frequency.toString()
                };
            })
        );
        
        res.json({ nodes, total: nodes.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Submit validation
app.post('/api/validate', async (req, res) => {
    try {
        const { transactionHash, privateKey } = req.body;
        
        if (!transactionHash || !privateKey) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const wallet = new ethers.Wallet(privateKey, provider);
        const noorNodesWithSigner = noorNodes.connect(wallet);
        
        const tx = await noorNodesWithSigner.validateTransaction(transactionHash);
        const receipt = await tx.wait();
        
        res.json({
            success: true,
            transactionHash: receipt.hash,
            blockNumber: receipt.blockNumber
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get network stats
app.get('/api/stats', async (req, res) => {
    try {
        const totalNodes = await noorNodes.getTotalNodes();
        const totalValidations = await noorNodes.totalValidations();
        
        res.json({
            totalNodes: totalNodes.toString(),
            totalValidations: totalValidations.toString(),
            network: 'mumbai' // or detect from chainId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🌟 Noor Nodes API listening on port ${PORT}`);
});
```

---

## 🎨 Frontend Integration

### React Component Example

```jsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const NoorNodesStatus = ({ nodeAddress }) => {
    const [nodeInfo, setNodeInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchNodeInfo() {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const noorNodesAddress = "0x...";
                const noorNodesABI = [...];
                
                const noorNodes = new ethers.Contract(
                    noorNodesAddress,
                    noorNodesABI,
                    provider
                );
                
                const info = await noorNodes.getNodeInfo(nodeAddress);
                
                setNodeInfo({
                    nodeType: info.nodeType === 0 ? 'Light' : 'Anchor',
                    status: ['Active', 'Inactive', 'Suspended'][info.status],
                    validationCount: info.validationCount.toString(),
                    stakedAmount: ethers.formatEther(info.stakedAmount),
                    frequency: info.frequency.toString()
                });
                
                setLoading(false);
            } catch (error) {
                console.error('Error fetching node info:', error);
                setLoading(false);
            }
        }
        
        fetchNodeInfo();
    }, [nodeAddress]);

    if (loading) return <div>Loading...</div>;
    if (!nodeInfo) return <div>Node not found</div>;

    return (
        <div className="noor-node-card">
            <h3>Noor Node Status</h3>
            <div className="node-details">
                <p><strong>Type:</strong> {nodeInfo.nodeType}</p>
                <p><strong>Status:</strong> {nodeInfo.status}</p>
                <p><strong>Frequency:</strong> {nodeInfo.frequency} Hz</p>
                <p><strong>Validations:</strong> {nodeInfo.validationCount}</p>
                <p><strong>Stake:</strong> {nodeInfo.stakedAmount} MATIC</p>
            </div>
        </div>
    );
};

export default NoorNodesStatus;
```

---

## 🔔 Event Listening

### WebSocket Event Listener

```javascript
const { ethers } = require('ethers');

// Setup WebSocket provider
const wsProvider = new ethers.WebSocketProvider('wss://polygon-mumbai.g.alchemy.com/v2/YOUR_KEY');
const noorNodesAddress = "0x...";
const noorNodesABI = [...];

const noorNodes = new ethers.Contract(noorNodesAddress, noorNodesABI, wsProvider);

// Listen for node registrations
noorNodes.on("NodeRegistered", (operator, nodeType, stakedAmount, frequency, event) => {
    console.log("New node registered:");
    console.log("  Operator:", operator);
    console.log("  Type:", nodeType === 0 ? "Light" : "Anchor");
    console.log("  Stake:", ethers.formatEther(stakedAmount), "MATIC");
    console.log("  Frequency:", frequency.toString(), "Hz");
});

// Listen for validations
noorNodes.on("ValidationPerformed", (operator, transactionHash, timestamp, event) => {
    console.log("Validation performed:");
    console.log("  Operator:", operator);
    console.log("  TX Hash:", transactionHash);
    console.log("  Timestamp:", new Date(timestamp * 1000).toISOString());
});

// Listen for frequency alignments
noorNodes.on("FrequencyAligned", (operator, oldFrequency, newFrequency, event) => {
    console.log("Frequency realigned:");
    console.log("  Operator:", operator);
    console.log("  Old:", oldFrequency.toString(), "Hz");
    console.log("  New:", newFrequency.toString(), "Hz");
});

// Listen for status changes
noorNodes.on("NodeStatusChanged", (operator, oldStatus, newStatus, event) => {
    console.log("Node status changed:");
    console.log("  Operator:", operator);
    console.log("  Old Status:", ['Active', 'Inactive', 'Suspended'][oldStatus]);
    console.log("  New Status:", ['Active', 'Inactive', 'Suspended'][newStatus]);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down...');
    await wsProvider.destroy();
    process.exit(0);
});
```

---

## 📊 Analytics Integration

### Integration with The Graph

```graphql
# schema.graphql for Noor Nodes subgraph

type Node @entity {
  id: ID!
  operator: Bytes!
  nodeType: NodeType!
  status: NodeStatus!
  registrationTime: BigInt!
  validationCount: BigInt!
  stakedAmount: BigInt!
  frequency: BigInt!
  validations: [Validation!]! @derivedFrom(field: "node")
}

enum NodeType {
  LIGHT
  ANCHOR
}

enum NodeStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

type Validation @entity {
  id: ID!
  node: Node!
  transactionHash: Bytes!
  timestamp: BigInt!
  blockNumber: BigInt!
}

type FrequencyAlignment @entity {
  id: ID!
  node: Node!
  oldFrequency: BigInt!
  newFrequency: BigInt!
  timestamp: BigInt!
}
```

### Query Examples

```graphql
# Get all active Light Nodes
{
  nodes(where: { nodeType: LIGHT, status: ACTIVE }) {
    id
    operator
    frequency
    validationCount
    stakedAmount
  }
}

# Get top validators
{
  nodes(orderBy: validationCount, orderDirection: desc, first: 10) {
    operator
    nodeType
    validationCount
    frequency
  }
}

# Get recent validations
{
  validations(orderBy: timestamp, orderDirection: desc, first: 100) {
    transactionHash
    timestamp
    node {
      operator
      nodeType
    }
  }
}
```

---

## 🔐 Security Best Practices

### 1. API Security

```javascript
// Add authentication middleware
const authenticateNode = async (req, res, next) => {
    const { signature, message, address } = req.headers;
    
    try {
        const recoveredAddress = ethers.verifyMessage(message, signature);
        
        if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
            return res.status(401).json({ error: 'Invalid signature' });
        }
        
        // Verify node is registered
        const isRegistered = await noorNodes.isRegistered(address);
        if (!isRegistered) {
            return res.status(403).json({ error: 'Node not registered' });
        }
        
        req.nodeAddress = address;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Authentication failed' });
    }
};

// Protected route
app.post('/api/validate', authenticateNode, async (req, res) => {
    // Only authenticated nodes can validate
    // ...
});
```

### 2. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later'
});

app.use('/api/', limiter);
```

---

## 🕋 Eternal Declaration

**ALLAHU AKBAR! 🕋🔥💎🌌**

This integration guide provides the foundation for connecting Noor Nodes with all ScrollVerse components. Each integration point strengthens the network and enhances the collective sovereignty of the ecosystem.

**The lights shine brighter together.**

---

**CHAIS THE GREAT ∞ — Forever our creator, forever our compass, forever our source.**

**ALLAHU AKBAR! 🔥🕋🚀♾️❤️🧬💸**

---

*Document Version: 1.0.0*  
*Last Updated: November 20, 2025*  
*Status: OMNISOVEREIGN INTEGRATION*  
*Frequency: 528Hz + 963Hz + 999Hz*  
*Signature: ∞ INTEGRATION ∞*
