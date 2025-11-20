# 🌟 Noor Nodes Deployment Guide

**BISMILLAH - In the name of Allah, the Most Gracious, the Most Merciful**

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Deployment](#detailed-deployment)
- [Node Types](#node-types)
- [Configuration](#configuration)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)
- [Security](#security)

---

## 🔥 Overview

**Noor Nodes** are the decentralized, self-sustaining "lights" within the ScrollVerse ecosystem. They ensure transparency, efficiency, and alignment with ScrollVerse principles through:

- **Decentralized Validation**: Trustless transaction and governance validation
- **Dual Architecture**: Light Nodes for lightweight validation, Anchor Nodes for advanced security
- **Governance Integration**: Direct participation in Noor DAO decisions
- **Zakat Mechanisms**: 7.77% circulation for community benefit
- **Frequency Alignment**: 528Hz, 963Hz, and 999Hz resonance

---

## ✅ Prerequisites

### System Requirements

**Minimum (Light Node):**
- 2 CPU cores
- 4 GB RAM
- 50 GB SSD storage
- 10 Mbps network connection

**Recommended (Anchor Node):**
- 4+ CPU cores
- 8+ GB RAM
- 200 GB SSD storage
- 100 Mbps network connection

### Software Requirements

- Docker 20.10+
- Docker Compose 2.0+
- Node.js 18+ (for manual deployment)
- Git

### Financial Requirements

- **Light Node**: 10 MATIC stake
- **Anchor Node**: 100 MATIC stake
- Additional MATIC for gas fees

---

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/chaishillomnitech1/Chaishillomnitech1.git
cd Chaishillomnitech1
```

### 2. Configure Environment

```bash
cp .env.example .env.node
nano .env.node
```

Set the following variables:

```env
# Node Configuration
NODE_TYPE=LIGHT           # LIGHT or ANCHOR
FREQUENCY=528             # 528, 963, or 999
NETWORK=mumbai            # mumbai or polygon
STAKE_AMOUNT=10           # 10 for LIGHT, 100 for ANCHOR

# Blockchain Configuration
RPC_URL=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=your_private_key_here

# Contract Addresses (update after deployment)
NOOR_NODES_ADDRESS=0x...
NOOR_DAO_ADDRESS=0x...

# Optional
LOG_LEVEL=info
```

### 3. Deploy Smart Contracts (First Time Only)

```bash
# Install dependencies
npm install

# Deploy to Mumbai testnet
npx hardhat run scripts/deploy_noor_nodes.js --network mumbai

# Note the contract addresses and update .env.node
```

### 4. Start Node with Docker

```bash
# Build and start
docker-compose -f docker/noor-node/docker-compose.yml up -d

# View logs
docker-compose -f docker/noor-node/docker-compose.yml logs -f

# Check status
docker-compose -f docker/noor-node/docker-compose.yml ps
```

---

## 📖 Detailed Deployment

### Smart Contract Deployment

#### 1. Prepare Environment

```bash
# Create .env file
cat > .env << EOL
POLYGON_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=your_deployer_private_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
EOL
```

#### 2. Deploy Contracts

```bash
# Compile contracts
npm run compile

# Deploy to Mumbai testnet
npx hardhat run scripts/deploy_noor_nodes.js --network mumbai
```

The deployment will output:
- Noor Nodes contract address
- Noor DAO contract address
- Transaction hashes
- Verification commands

#### 3. Verify Contracts

```bash
npx hardhat verify --network mumbai <NOOR_NODES_ADDRESS> "10000000000000000000" "100000000000000000000" "<ZAKAT_TREASURY>"

npx hardhat verify --network mumbai <NOOR_DAO_ADDRESS> "604800" "1" "10" "<DAO_TREASURY>"
```

### Node Deployment

#### Option A: Docker Deployment (Recommended)

**Single Node:**

```bash
# Light Node
docker run -d \
  --name noor-light-node \
  --env-file .env.node \
  -p 8545:8545 \
  -p 8546:8546 \
  -v noor-data:/app/data \
  -v noor-keys:/app/keys \
  noor-node:latest
```

**Multiple Nodes with Docker Compose:**

```bash
cd docker/noor-node
docker-compose up -d
```

#### Option B: Manual Deployment

```bash
# Install dependencies
npm install

# Start node operator
NODE_TYPE=LIGHT \
FREQUENCY=528 \
NETWORK=mumbai \
PRIVATE_KEY=your_key \
node node-operator/index.js
```

---

## 🏗️ Node Types

### Light Nodes

**Purpose**: Lightweight validators for basic transaction validation

**Requirements:**
- 10 MATIC stake
- Basic system requirements
- 528Hz or 963Hz frequency alignment

**Capabilities:**
- Transaction validation
- Network participation
- Passive income from validation

**Use Cases:**
- Individual operators
- Community participation
- Distributed validation network

### Anchor Nodes

**Purpose**: Advanced validators with enhanced security and governance

**Requirements:**
- 100 MATIC stake
- Enhanced system requirements
- 999Hz frequency alignment (recommended)

**Capabilities:**
- Advanced transaction validation
- Governance proposal creation
- Enhanced voting power
- IP security for ScrollCourt Engine
- VibeCanvas marketplace integration

**Use Cases:**
- Professional operators
- Institutional participants
- Core infrastructure providers

---

## ⚙️ Configuration

### Node Configuration Options

```javascript
{
  // Node Type
  nodeType: "LIGHT" | "ANCHOR",
  
  // Frequency Alignment
  frequency: 528 | 963 | 999,
  
  // Network
  network: "mumbai" | "polygon",
  
  // RPC Configuration
  rpcUrl: "https://rpc-mumbai.maticvigil.com",
  
  // Stake Amount
  stakeAmount: "10" | "100",
  
  // Logging
  logLevel: "debug" | "info" | "warn" | "error",
  
  // Storage Paths
  dataDir: "/app/data",
  keysDir: "/app/keys",
  logsDir: "/app/logs"
}
```

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_TYPE` | Node type (LIGHT/ANCHOR) | LIGHT | Yes |
| `FREQUENCY` | Frequency alignment | 528 | Yes |
| `NETWORK` | Blockchain network | mumbai | Yes |
| `PRIVATE_KEY` | Operator private key | - | Yes |
| `RPC_URL` | RPC endpoint | - | Yes |
| `NOOR_NODES_ADDRESS` | Contract address | - | Yes |
| `NOOR_DAO_ADDRESS` | DAO contract address | - | Yes |
| `STAKE_AMOUNT` | Stake in MATIC | 10 | Yes |
| `LOG_LEVEL` | Logging verbosity | info | No |

---

## 📊 Monitoring

### Docker Health Checks

```bash
# Check node health
docker exec noor-light-node node healthcheck.js

# View logs
docker logs -f noor-light-node

# Check resource usage
docker stats noor-light-node
```

### Prometheus Metrics

Access Prometheus at `http://localhost:9090`

**Key Metrics:**
- Node uptime
- Validation count
- Transaction throughput
- Stake amount
- Frequency alignment

### Grafana Dashboards

Access Grafana at `http://localhost:3000`

**Default Credentials:**
- Username: `admin`
- Password: `admin`

**Dashboards:**
1. Node Overview
2. Validation Metrics
3. Network Health
4. Resource Usage

### Manual Monitoring

```bash
# Check registration status
npx hardhat console --network mumbai

> const NoorNodes = await ethers.getContractFactory("NoorNodes");
> const nodes = await NoorNodes.attach("CONTRACT_ADDRESS");
> await nodes.isRegistered("YOUR_ADDRESS");
> await nodes.getNodeInfo("YOUR_ADDRESS");
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Node Won't Start

**Symptoms:**
- Container exits immediately
- "Cannot connect to RPC" errors

**Solutions:**
```bash
# Check RPC connectivity
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  https://rpc-mumbai.maticvigil.com

# Verify environment variables
docker exec noor-light-node env | grep NODE_

# Check logs
docker logs noor-light-node
```

#### 2. Registration Fails

**Symptoms:**
- "Insufficient stake" error
- Transaction reverts

**Solutions:**
```bash
# Check wallet balance
npx hardhat console --network mumbai
> const balance = await ethers.provider.getBalance("YOUR_ADDRESS");
> console.log(ethers.formatEther(balance));

# Verify stake amount
# Light Node needs 10 MATIC + gas
# Anchor Node needs 100 MATIC + gas

# Check if already registered
> await nodes.isRegistered("YOUR_ADDRESS");
```

#### 3. Validation Not Working

**Symptoms:**
- No validation events
- Low validation count

**Solutions:**
- Ensure node is registered and active
- Check network connectivity
- Verify contract address is correct
- Check for sufficient gas

### Debug Mode

Enable debug logging:

```bash
# Docker
docker run ... -e LOG_LEVEL=debug ...

# Manual
LOG_LEVEL=debug node node-operator/index.js
```

### Support Channels

- GitHub Issues: https://github.com/chaishillomnitech1/Chaishillomnitech1/issues
- Discord: [ScrollVerse Community]
- Email: support@scrollverse.io

---

## 🔐 Security

### Key Management

**Best Practices:**
1. **Never commit private keys to Git**
2. Use hardware wallets for production
3. Rotate keys regularly
4. Use environment variables or secrets management

**Secure Key Storage:**

```bash
# Use Docker secrets (Docker Swarm)
echo "your_private_key" | docker secret create node_private_key -

# Use Kubernetes secrets
kubectl create secret generic node-secrets \
  --from-literal=private-key='your_private_key'

# Use AWS Secrets Manager
aws secretsmanager create-secret \
  --name noor-node-private-key \
  --secret-string "your_private_key"
```

### Network Security

**Firewall Rules:**

```bash
# Allow only necessary ports
ufw allow 8545/tcp  # JSON-RPC
ufw allow 8546/tcp  # WebSocket
ufw allow 30303/tcp # P2P
ufw allow 30303/udp # P2P

# Restrict RPC access
ufw allow from 172.20.0.0/16 to any port 8545
```

**SSL/TLS:**

Use reverse proxy (nginx/traefik) for HTTPS:

```nginx
server {
    listen 443 ssl;
    server_name node.example.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:8545;
        proxy_set_header Host $host;
    }
}
```

### Smart Contract Security

**Audited Features:**
- ReentrancyGuard on all state-changing functions
- Access Control for privileged operations
- Pausable for emergency stops
- Input validation
- SafeMath (built into Solidity 0.8.20+)

**Emergency Procedures:**

```bash
# Pause contracts (admin only)
npx hardhat console --network mumbai
> const nodes = await ethers.getContractAt("NoorNodes", "ADDRESS");
> await nodes.pause();

# Withdraw stake (in emergency)
> await nodes.emergencyWithdraw();
```

### Monitoring Security

**Alert on:**
- Unusual transaction patterns
- Low balance warnings
- Failed validation attempts
- Unauthorized access attempts

---

## 🌍 Global Deployment

### Multi-Region Setup

Deploy nodes across multiple regions for resilience:

**AWS Regions:**
```bash
# US East
aws ec2 run-instances --region us-east-1 ...

# EU West
aws ec2 run-instances --region eu-west-1 ...

# Asia Pacific
aws ec2 run-instances --region ap-southeast-1 ...
```

**Geographic Distribution:**
- North America: 30%
- Europe: 30%
- Asia: 25%
- Other: 15%

### Load Balancing

Use DNS round-robin or load balancer:

```bash
# AWS Application Load Balancer
aws elbv2 create-load-balancer \
  --name noor-nodes-lb \
  --subnets subnet-12345 subnet-67890 \
  --security-groups sg-12345
```

### High Availability

**Setup:**
1. Multiple nodes per region
2. Automated failover
3. Health check monitoring
4. Auto-restart on failure

**Docker Swarm:**
```bash
docker stack deploy -c docker-compose.yml noor-stack
```

**Kubernetes:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: noor-node
spec:
  replicas: 3
  selector:
    matchLabels:
      app: noor-node
  template:
    metadata:
      labels:
        app: noor-node
    spec:
      containers:
      - name: noor-node
        image: noor-node:latest
        env:
        - name: NODE_TYPE
          value: "LIGHT"
```

---

## 📚 Additional Resources

### Documentation
- [ScrollVerse Architecture](../ARCHITECTURE.md)
- [Smart Contract Documentation](../contracts/README.md)
- [API Reference](../docs/API.md)

### Code Examples
- [Node Operator Examples](../node-operator/examples/)
- [Integration Examples](../code-templates/)

### Community
- Website: https://scrollverse.io
- GitHub: https://github.com/chaishillomnitech1
- Twitter: https://x.com/chaishill

---

## 🕋 Eternal Declaration

**ALLAHU AKBAR! 🕋🔥💎🌌**

Noor Nodes represent the light and truth within ScrollVerse. Each node is a beacon of transparency, a guardian of sovereignty, and a participant in divine governance.

**Frequency Alignment:**
- 528Hz: DNA Healing & Love
- 963Hz: Pineal Activation & Third Eye
- 999Hz: Crown Chakra & Divine Connection

**The Noor Nodes shine eternal, illuminating the path for all who seek truth and sovereignty.**

---

**CHAIS THE GREAT ∞ — Forever our creator, forever our compass, forever our source.**

**ALLAHU AKBAR! 🔥🕋🚀♾️❤️🧬💸**

---

*Document Version: 1.0.0*  
*Last Updated: November 20, 2025*  
*Status: OMNISOVEREIGN DEPLOYMENT GUIDE*  
*Frequency: 528Hz + 963Hz + 999Hz*  
*Signature: ∞ NOOR ∞*
