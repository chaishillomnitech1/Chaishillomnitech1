# 🔥 SCROLLSOUL INVOCATION EXAMPLES 🔥

## **Sample Code and Integration Patterns**

**Document ID**: SCROLLSOUL-EXAMPLES-001  
**Classification**: DEVELOPER DOCUMENTATION  
**Status**: ACTIVE  
**Last Updated**: 2025-11-16

---

## 📋 **TABLE OF CONTENTS**

1. [Web3.js Examples](#web3js-examples)
2. [Ethers.js Examples](#ethersjs-examples)
3. [Python Web3.py Examples](#python-web3py-examples)
4. [Smart Contract Integration](#smart-contract-integration)
5. [Backend API Examples](#backend-api-examples)
6. [Frontend React Examples](#frontend-react-examples)
7. [Testing Examples](#testing-examples)

---

## 🌐 **WEB3.JS EXAMPLES**

### **Basic Activation**

```javascript
const Web3 = require('web3');
const web3 = new Web3('https://mainnet.infura.io/v3/YOUR_INFURA_KEY');

// ScrollSoul Activation Contract ABI (simplified)
const abi = [
  {
    "inputs": [
      {"name": "_command", "type": "string"},
      {"name": "_intentionHash", "type": "bytes32"},
      {"name": "_deploymentId", "type": "bytes32"}
    ],
    "name": "activateScrollSoul",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const contractAddress = '0x...'; // ScrollSoul contract address
const contract = new web3.eth.Contract(abi, contractAddress);

async function activateScrollSoul(userAddress, privateKey) {
  const command = "I ACCEPT";
  const intention = "Manifesting abundance for the ScrollVerse community";
  const intentionHash = web3.utils.keccak256(intention);
  
  // Get current deployment ID from contract
  const deploymentId = await contract.methods.currentDeploymentId().call();
  
  // Check if within activation window
  const isActive = await contract.methods.isWithinActiveWindow().call();
  if (!isActive) {
    throw new Error("Activation window is not open");
  }
  
  // Build transaction
  const tx = contract.methods.activateScrollSoul(
    command,
    intentionHash,
    deploymentId
  );
  
  const gas = await tx.estimateGas({ from: userAddress });
  const gasPrice = await web3.eth.getGasPrice();
  
  const data = tx.encodeABI();
  const nonce = await web3.eth.getTransactionCount(userAddress);
  
  const signedTx = await web3.eth.accounts.signTransaction(
    {
      to: contractAddress,
      data,
      gas,
      gasPrice,
      nonce
    },
    privateKey
  );
  
  const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  console.log('Activation successful! TX:', receipt.transactionHash);
  
  return receipt;
}

// Usage
const userAddress = '0xYourAddress';
const privateKey = '0xYourPrivateKey';

activateScrollSoul(userAddress, privateKey)
  .then(() => console.log('ScrollSoul activated!'))
  .catch(err => console.error('Activation failed:', err));
```

---

### **Check Timing Precision**

```javascript
async function getTimingScore(actualTime, deploymentId) {
  const deployment = await contract.methods.getDeploymentEvent(deploymentId).call();
  const targetTime = deployment.deploymentTime;
  
  const timeDiff = Math.abs(actualTime - targetTime);
  const maxWindow = 11 * 60; // 11 minutes in seconds
  
  if (timeDiff >= maxWindow) return 0;
  
  const score = 1000 - Math.floor((timeDiff * 1000) / maxWindow);
  return score;
}

// Example usage
const currentTimestamp = Math.floor(Date.now() / 1000);
const deploymentId = '0x...';
const score = await getTimingScore(currentTimestamp, deploymentId);
console.log(`Your timing precision score: ${score}/1000`);
```

---

### **Batch Check User Stats**

```javascript
async function getUserStats(userAddress) {
  const activationCount = await contract.methods.getUserParticipationCount(userAddress).call();
  const resonancePoints = await contract.methods.getUserResonancePoints(userAddress).call();
  
  return {
    activations: activationCount,
    points: resonancePoints,
    averageScore: activationCount > 0 ? resonancePoints / activationCount : 0
  };
}

// Usage
const stats = await getUserStats('0xUserAddress');
console.log(`Activations: ${stats.activations}`);
console.log(`Total Points: ${stats.points}`);
console.log(`Average Score: ${stats.averageScore.toFixed(2)}`);
```

---

## ⚡ **ETHERS.JS EXAMPLES**

### **Connect with MetaMask**

```javascript
const { ethers } = require('ethers');

// Connect to MetaMask
const provider = new ethers.providers.Web3Provider(window.ethereum);
await provider.send("eth_requestAccounts", []);
const signer = provider.getSigner();
const userAddress = await signer.getAddress();

// Contract setup
const contractAddress = '0x...';
const abi = [...]; // ScrollSoul ABI
const contract = new ethers.Contract(contractAddress, abi, signer);

// Activate
async function activate(command, intention) {
  const intentionHash = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(intention)
  );
  const deploymentId = await contract.currentDeploymentId();
  
  const tx = await contract.activateScrollSoul(
    command,
    intentionHash,
    deploymentId
  );
  
  console.log('Transaction sent:', tx.hash);
  const receipt = await tx.wait();
  console.log('Activation confirmed in block:', receipt.blockNumber);
  
  return receipt;
}

// Usage
activate("I RESONATE", "Unity and abundance")
  .then(receipt => console.log('Success!', receipt))
  .catch(err => console.error('Error:', err));
```

---

### **Listen for Activation Events**

```javascript
// Listen for ScrollSoulActivated events
contract.on("ScrollSoulActivated", (user, deploymentId, command, timestamp, precision) => {
  console.log(`
    🔥 New Activation Detected!
    User: ${user}
    Command: ${command}
    Timing Precision: ${precision}/1000
    Timestamp: ${new Date(timestamp * 1000).toISOString()}
  `);
});

// Listen for NFT issuance
contract.on("RecognitionNFTIssued", (user, nftId, deploymentId) => {
  console.log(`
    🎁 Recognition NFT Issued!
    User: ${user}
    NFT ID: ${nftId}
    Deployment: ${deploymentId}
  `);
});
```

---

## 🐍 **PYTHON WEB3.PY EXAMPLES**

### **Basic Activation Script**

```python
from web3 import Web3
import time

# Connect to provider
w3 = Web3(Web3.HTTPProvider('https://mainnet.infura.io/v3/YOUR_KEY'))

# Contract setup
contract_address = '0x...'
abi = [...]  # ScrollSoul ABI
contract = w3.eth.contract(address=contract_address, abi=abi)

def activate_scrollsoul(account, private_key, command, intention):
    """Activate ScrollSoul with given command and intention."""
    
    # Hash intention
    intention_hash = w3.keccak(text=intention)
    
    # Get current deployment ID
    deployment_id = contract.functions.currentDeploymentId().call()
    
    # Check activation window
    is_active = contract.functions.isWithinActiveWindow().call()
    if not is_active:
        raise Exception("Activation window is not open")
    
    # Build transaction
    tx = contract.functions.activateScrollSoul(
        command,
        intention_hash,
        deployment_id
    ).build_transaction({
        'from': account,
        'nonce': w3.eth.get_transaction_count(account),
        'gas': 200000,
        'gasPrice': w3.eth.gas_price
    })
    
    # Sign and send
    signed_tx = w3.eth.account.sign_transaction(tx, private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    
    print(f"Transaction sent: {tx_hash.hex()}")
    
    # Wait for receipt
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    print(f"Activation confirmed in block {tx_receipt['blockNumber']}")
    
    return tx_receipt

# Usage
account = '0xYourAddress'
private_key = '0xYourPrivateKey'

receipt = activate_scrollsoul(
    account, 
    private_key, 
    "I MANIFEST", 
    "Abundance for all ScrollSouls"
)
```

---

### **Automated Scheduler**

```python
import schedule
import datetime

def check_and_activate():
    """Check if it's 11:11 UTC and activate if window is open."""
    now = datetime.datetime.utcnow()
    
    # Check if within activation window (11:00-11:22 UTC)
    if now.hour == 11 and 0 <= now.minute <= 22:
        try:
            is_active = contract.functions.isWithinActiveWindow().call()
            if is_active:
                print(f"Activation window open at {now.isoformat()}")
                activate_scrollsoul(
                    account,
                    private_key,
                    "I ACCEPT",
                    "Daily alignment with ScrollVerse mission"
                )
            else:
                print("Window not yet opened by contract owner")
        except Exception as e:
            print(f"Activation failed: {e}")

# Schedule check every minute during the window
schedule.every(1).minutes.do(check_and_activate)

# Run scheduler
while True:
    schedule.run_pending()
    time.sleep(30)
```

---

## 🔗 **SMART CONTRACT INTEGRATION**

### **Integrate with Your Own Contract**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IScrollSoulActivation {
    function activateScrollSoul(
        string memory _command,
        bytes32 _intentionHash,
        bytes32 _deploymentId
    ) external;
    
    function getUserResonancePoints(address _user) external view returns (uint256);
    function isWithinActiveWindow() external view returns (bool);
}

contract MyDApp {
    IScrollSoulActivation public scrollSoulContract;
    
    constructor(address _scrollSoulAddress) {
        scrollSoulContract = IScrollSoulActivation(_scrollSoulAddress);
    }
    
    /**
     * @notice Allow users to activate through your DApp
     */
    function activateThroughDApp(
        string memory command,
        bytes32 intentionHash,
        bytes32 deploymentId
    ) external {
        require(
            scrollSoulContract.isWithinActiveWindow(),
            "Window not open"
        );
        
        // Forward activation to ScrollSoul contract
        scrollSoulContract.activateScrollSoul(
            command,
            intentionHash,
            deploymentId
        );
        
        // Your custom logic here
        // e.g., reward users, update internal state, etc.
    }
    
    /**
     * @notice Check if user is an active ScrollSoul participant
     */
    function isActiveScrollSoul(address user) public view returns (bool) {
        uint256 points = scrollSoulContract.getUserResonancePoints(user);
        return points > 0;
    }
    
    /**
     * @notice Gate features based on ScrollSoul participation
     */
    modifier onlyScrollSouls() {
        require(
            isActiveScrollSoul(msg.sender),
            "Must be active ScrollSoul"
        );
        _;
    }
}
```

---

## 🖥️ **BACKEND API EXAMPLES**

### **Node.js Express API**

```javascript
const express = require('express');
const { ethers } = require('ethers');

const app = express();
app.use(express.json());

// Setup provider and contract
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  abi,
  provider
);

// Check activation window status
app.get('/api/activation/status', async (req, res) => {
  try {
    const isActive = await contract.isWithinActiveWindow();
    const deploymentId = await contract.currentDeploymentId();
    const deployment = await contract.getDeploymentEvent(deploymentId);
    
    res.json({
      isActive,
      deploymentId,
      deploymentTime: deployment.deploymentTime.toString(),
      windowStart: deployment.windowStart.toString(),
      windowEnd: deployment.windowEnd.toString(),
      activationCount: deployment.activationCount.toString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user stats
app.get('/api/user/:address/stats', async (req, res) => {
  try {
    const { address } = req.params;
    
    const activations = await contract.getUserParticipationCount(address);
    const points = await contract.getUserResonancePoints(address);
    
    res.json({
      address,
      totalActivations: activations.toString(),
      resonancePoints: points.toString(),
      averageScore: activations > 0 ? points / activations : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    // This would require indexing events or maintaining off-chain database
    // Placeholder implementation
    res.json({
      message: "Leaderboard coming soon",
      hint: "Index ScrollSoulActivated events for complete leaderboard"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('ScrollSoul API running on port 3000');
});
```

---

## ⚛️ **FRONTEND REACT EXAMPLES**

### **Activation Button Component**

```jsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const ScrollSoulActivator = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [command, setCommand] = useState('I ACCEPT');
  const [intention, setIntention] = useState('');
  const [status, setStatus] = useState('');
  
  const commands = [
    'I ACCEPT',
    'I AM PRESENT',
    'I RESONATE',
    'I MANIFEST',
    'KUN FAYAKUN'
  ];
  
  useEffect(() => {
    checkActivationWindow();
    const interval = setInterval(checkActivationWindow, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);
  
  const checkActivationWindow = async () => {
    // Check if window is active
    // Update countdown to next 11:11
    const now = new Date();
    const next1111 = new Date(now);
    next1111.setUTCHours(11, 11, 0, 0);
    if (now.getUTCHours() > 11 || (now.getUTCHours() === 11 && now.getUTCMinutes() > 22)) {
      next1111.setUTCDate(next1111.getUTCDate() + 1);
    }
    const timeUntil = next1111 - now;
    setCountdown(Math.floor(timeUntil / 1000));
  };
  
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        setIsConnected(true);
        setStatus('Wallet connected!');
      } catch (error) {
        setStatus('Failed to connect wallet');
      }
    } else {
      setStatus('Please install MetaMask');
    }
  };
  
  const activate = async () => {
    if (!isConnected) {
      setStatus('Please connect wallet first');
      return;
    }
    
    try {
      setStatus('Activating...');
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      
      const intentionHash = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(intention)
      );
      const deploymentId = await contract.currentDeploymentId();
      
      const tx = await contract.activateScrollSoul(
        command,
        intentionHash,
        deploymentId
      );
      
      setStatus('Transaction sent! Waiting for confirmation...');
      await tx.wait();
      setStatus('🎉 ScrollSoul Activated! Check your wallet for Recognition NFT.');
    } catch (error) {
      setStatus(`Activation failed: ${error.message}`);
    }
  };
  
  return (
    <div className="scrollsoul-activator">
      <h2>🔥 ScrollSoul Activation 🔥</h2>
      
      <div className="countdown">
        <h3>Next 11:11 UTC in:</h3>
        <div className="timer">
          {countdown !== null && (
            <span>{Math.floor(countdown / 3600)}h {Math.floor((countdown % 3600) / 60)}m {countdown % 60}s</span>
          )}
        </div>
      </div>
      
      {!isConnected ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <>
          <div className="command-selector">
            <label>Choose Activation Command:</label>
            <select value={command} onChange={(e) => setCommand(e.target.value)}>
              {commands.map(cmd => (
                <option key={cmd} value={cmd}>{cmd}</option>
              ))}
            </select>
          </div>
          
          <div className="intention-input">
            <label>Your Intention:</label>
            <textarea
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              placeholder="What are you manifesting?"
              rows={3}
            />
          </div>
          
          <button 
            onClick={activate} 
            disabled={!isActive || !intention}
            className="activate-button"
          >
            Activate ScrollSoul
          </button>
        </>
      )}
      
      <div className="status">
        {status && <p>{status}</p>}
      </div>
    </div>
  );
};

export default ScrollSoulActivator;
```

---

## 🧪 **TESTING EXAMPLES**

### **Hardhat Test Suite**

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("ScrollSoulActivation", function () {
  let contract;
  let owner;
  let user1;
  let user2;
  
  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    const ScrollSoul = await ethers.getContractFactory("ScrollSoulActivation");
    contract = await ScrollSoul.deploy("https://scrollverse.io/nft/");
    await contract.deployed();
  });
  
  describe("Deployment Scheduling", function () {
    it("Should schedule a deployment correctly", async function () {
      const deploymentId = ethers.utils.id("DEPLOYMENT_001");
      const deploymentTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      
      await expect(contract.scheduleDeployment(deploymentId, deploymentTime))
        .to.emit(contract, "DeploymentScheduled")
        .withArgs(deploymentId, deploymentTime, deploymentTime - 660, deploymentTime + 660);
      
      const deployment = await contract.getDeploymentEvent(deploymentId);
      expect(deployment.deploymentTime).to.equal(deploymentTime);
      expect(deployment.isActive).to.be.false;
    });
  });
  
  describe("ScrollSoul Activation", function () {
    let deploymentId;
    let deploymentTime;
    
    beforeEach(async function () {
      deploymentId = ethers.utils.id("TEST_DEPLOYMENT");
      deploymentTime = await time.latest() + 100;
      await contract.scheduleDeployment(deploymentId, deploymentTime);
    });
    
    it("Should allow activation within window", async function () {
      // Open window
      await time.increaseTo(deploymentTime - 600);
      await contract.openActivationWindow(deploymentId);
      
      // Move to exact 11:11 moment
      await time.increaseTo(deploymentTime);
      
      // Activate
      const command = "I ACCEPT";
      const intention = "Test intention";
      const intentionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(intention));
      
      await expect(contract.connect(user1).activateScrollSoul(command, intentionHash, deploymentId))
        .to.emit(contract, "ScrollSoulActivated")
        .withArgs(user1.address, deploymentId, command, deploymentTime, 1000);
      
      // Check activation record
      const activation = await contract.getUserActivation(user1.address, deploymentId);
      expect(activation.isActivated).to.be.true;
      expect(activation.command).to.equal(command);
      expect(activation.timingPrecision).to.equal(1000); // Perfect timing
    });
    
    it("Should reject activation outside window", async function () {
      const command = "I ACCEPT";
      const intentionHash = ethers.utils.id("Test");
      
      await expect(
        contract.connect(user1).activateScrollSoul(command, intentionHash, deploymentId)
      ).to.be.revertedWith("ScrollSoul: Activation window not open");
    });
    
    it("Should reject duplicate activation", async function () {
      await time.increaseTo(deploymentTime - 600);
      await contract.openActivationWindow(deploymentId);
      await time.increaseTo(deploymentTime);
      
      const command = "I ACCEPT";
      const intentionHash = ethers.utils.id("Test");
      
      // First activation
      await contract.connect(user1).activateScrollSoul(command, intentionHash, deploymentId);
      
      // Second activation should fail
      await expect(
        contract.connect(user1).activateScrollSoul(command, intentionHash, deploymentId)
      ).to.be.revertedWith("ScrollSoul: Already activated for this deployment");
    });
    
    it("Should calculate timing precision correctly", async function () {
      await time.increaseTo(deploymentTime - 600);
      await contract.openActivationWindow(deploymentId);
      
      // Activate 5 minutes late
      await time.increaseTo(deploymentTime + 300);
      
      const command = "I RESONATE";
      const intentionHash = ethers.utils.id("Test");
      
      await contract.connect(user1).activateScrollSoul(command, intentionHash, deploymentId);
      
      const activation = await contract.getUserActivation(user1.address, deploymentId);
      // Should be less than 1000 due to timing offset
      expect(activation.timingPrecision).to.be.lt(1000);
      expect(activation.timingPrecision).to.be.gt(0);
    });
  });
  
  describe("Recognition NFTs", function () {
    it("Should issue recognition NFT to participant", async function () {
      const deploymentId = ethers.utils.id("NFT_TEST");
      const deploymentTime = await time.latest() + 100;
      
      await contract.scheduleDeployment(deploymentId, deploymentTime);
      await time.increaseTo(deploymentTime - 600);
      await contract.openActivationWindow(deploymentId);
      await time.increaseTo(deploymentTime);
      
      // Activate
      await contract.connect(user1).activateScrollSoul(
        "I MANIFEST",
        ethers.utils.id("Test"),
        deploymentId
      );
      
      // Issue NFT
      await expect(contract.issueRecognitionNFT(user1.address, deploymentId))
        .to.emit(contract, "RecognitionNFTIssued")
        .withArgs(user1.address, 0, deploymentId);
      
      // Check NFT ownership
      expect(await contract.ownerOf(0)).to.equal(user1.address);
      
      // Check activation record updated
      const activation = await contract.getUserActivation(user1.address, deploymentId);
      expect(activation.recognitionNFTId).to.equal(0);
    });
  });
});
```

---

## 📝 **INTEGRATION CHECKLIST**

- [ ] Install required dependencies (web3.js, ethers.js, etc.)
- [ ] Get contract address and ABI from deployment
- [ ] Set up RPC provider (Infura, Alchemy, etc.)
- [ ] Implement wallet connection (MetaMask, WalletConnect)
- [ ] Add activation window checking logic
- [ ] Create user interface for command selection
- [ ] Implement intention input and hashing
- [ ] Handle transaction signing and sending
- [ ] Listen for confirmation events
- [ ] Display recognition NFT to users
- [ ] Show user stats and leaderboard
- [ ] Add error handling and user feedback
- [ ] Test on testnet before mainnet
- [ ] Document your integration

---

**For more examples and support, visit:**
- GitHub: https://github.com/chaishillomnitech1/Chaishillomnitech1
- Documentation: [SCROLLSOUL_ACTIVATION_GUIDE.md](../SCROLLSOUL_ACTIVATION_GUIDE.md)
- Discord: Coming soon

**ALLĀHU AKBAR! 🕋🔥💎🌌**

**🔱🕊️🤖∞**
