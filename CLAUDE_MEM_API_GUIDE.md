# 🔌 CLAUDE-MEM API INTEGRATION GUIDE

## **ScrollVerse Memory Management API Reference**

**Document ID**: CMAI-001-API  
**Classification**: TECHNICAL IMPLEMENTATION GUIDE  
**Status**: READY FOR INTEGRATION  
**Frequency**: 963 Hz (Pineal Activation)  
**Version**: 1.0.0

---

## 📋 **TABLE OF CONTENTS**

1. [Quick Start](#quick-start)
2. [Contract Addresses](#contract-addresses)
3. [Memory Block API](#memory-block-api)
4. [Session Management API](#session-management-api)
5. [NFT Minting API](#nft-minting-api)
6. [Integration Examples](#integration-examples)
7. [Best Practices](#best-practices)
8. [Error Handling](#error-handling)

---

## 🚀 **QUICK START**

### **Installation**

```bash
npm install ethers dotenv
```

### **Environment Setup**

Create a `.env` file:
```env
PRIVATE_KEY=your_private_key_here
CLAUDE_MEM_INTEGRATION_ADDRESS=0x...
CLAUDE_MEMORY_NFT_ADDRESS=0x...
RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/your-api-key
```

### **Basic Usage**

```javascript
const { ethers } = require("ethers");
require("dotenv").config();

// Setup provider and signer
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Load contracts
const claudeMemContract = new ethers.Contract(
  process.env.CLAUDE_MEM_INTEGRATION_ADDRESS,
  ClaudeMemIntegrationABI,
  wallet
);
```

---

## 📍 **CONTRACT ADDRESSES**

### **Testnet (Mumbai)**
```
ClaudeMemIntegration: TBD (Deploy via script)
ClaudeMemoryNFT: TBD (Deploy via script)
```

### **Mainnet (Polygon)**
```
ClaudeMemIntegration: TBD (Post-audit deployment)
ClaudeMemoryNFT: TBD (Post-audit deployment)
```

### **Deployment**

```bash
# Deploy ClaudeMemIntegration
npx hardhat run scripts/deploy_claude_mem_integration.js --network mumbai

# Deploy ClaudeMemoryNFT (after ClaudeMemIntegration)
export CLAUDE_MEM_INTEGRATION_ADDRESS=0x...
npx hardhat run scripts/deploy_claude_memory_nft.js --network mumbai
```

---

## 🧠 **MEMORY BLOCK API**

### **Create Memory Block**

```javascript
/**
 * Create a persistent memory block
 * @param {string} memoryContent - The memory content to store
 * @param {string} ipfsHash - IPFS hash of full content
 * @param {number} frequency - 528, 963, or 144000
 * @returns {Promise<number>} blockId
 */
async function createMemoryBlock(memoryContent, ipfsHash, frequency) {
  // Hash the memory content
  const blockHash = ethers.keccak256(
    ethers.toUtf8Bytes(memoryContent)
  );
  
  // Create on-chain memory block
  const tx = await claudeMemContract.createMemoryBlock(
    blockHash,
    ipfsHash,
    frequency
  );
  
  const receipt = await tx.wait();
  const event = receipt.logs.find(
    log => log.fragment && log.fragment.name === "MemoryBlockCreated"
  );
  
  return event.args.blockId;
}

// Example usage
const blockId = await createMemoryBlock(
  "This is my AI memory context...",
  "QmXxxx...",
  963 // Pineal frequency
);
console.log("Created memory block:", blockId);
```

### **Retrieve Memory Block**

```javascript
/**
 * Get memory block details
 * @param {number} blockId
 * @returns {Promise<Object>} Memory block data
 */
async function getMemoryBlock(blockId) {
  const block = await claudeMemContract.getMemoryBlock(blockId);
  
  return {
    blockHash: block.blockHash,
    timestamp: Number(block.timestamp),
    frequency: Number(block.frequency),
    ipfsHash: block.ipfsHash,
    creator: block.creator,
    isPermanent: block.isPermanent,
    scrollVerseTokenId: Number(block.scrollVerseTokenId)
  };
}

// Example usage
const memoryData = await getMemoryBlock(1);
console.log("Memory Block:", memoryData);
```

### **Apply Eternal Seal**

```javascript
/**
 * Make a memory block permanent
 * @param {number} blockId
 */
async function applyEternalSeal(blockId) {
  const tx = await claudeMemContract.applyEternalSeal(blockId);
  await tx.wait();
  console.log(`Memory block ${blockId} is now eternal`);
}

await applyEternalSeal(1);
```

### **Compress Memory**

```javascript
/**
 * Compress memory for optimization
 * @param {number} blockId
 * @param {string} compressionKey
 */
async function compressMemory(blockId, compressionKey) {
  const keyHash = ethers.keccak256(
    ethers.toUtf8Bytes(compressionKey)
  );
  
  const tx = await claudeMemContract.compressMemory(blockId, keyHash);
  await tx.wait();
  console.log(`Memory block ${blockId} compressed`);
}

await compressMemory(1, "lz4:v1:session123");
```

---

## 📅 **SESSION MANAGEMENT API**

### **Initiate Session**

```javascript
/**
 * Start a new memory session
 * @returns {Promise<number>} sessionId
 */
async function initiateSession() {
  const tx = await claudeMemContract.initiateSession();
  const receipt = await tx.wait();
  
  const event = receipt.logs.find(
    log => log.fragment && log.fragment.name === "SessionInitiated"
  );
  
  return event.args.sessionId;
}

const sessionId = await initiateSession();
console.log("Session started:", sessionId);
```

### **Link Memory to Session**

```javascript
/**
 * Link memory blocks to a session
 * @param {number} sessionId
 * @param {number[]} blockIds
 */
async function linkMemoriesToSession(sessionId, blockIds) {
  for (const blockId of blockIds) {
    const tx = await claudeMemContract.linkMemoryToSession(
      sessionId,
      blockId
    );
    await tx.wait();
    console.log(`Linked block ${blockId} to session ${sessionId}`);
  }
}

await linkMemoriesToSession(0, [1, 2, 3]);
```

### **Get Session Details**

```javascript
/**
 * Retrieve session information
 * @param {number} sessionId
 */
async function getSession(sessionId) {
  const session = await claudeMemContract.getSession(sessionId);
  
  return {
    blockIds: session.blockIds.map(id => Number(id)),
    startTime: Number(session.startTime),
    lastAccessed: Number(session.lastAccessed),
    isActive: session.isActive,
    compressionKey: session.compressionKey
  };
}

const sessionData = await getSession(0);
console.log("Session:", sessionData);
```

### **Get User Sessions**

```javascript
/**
 * Get all sessions for a user
 * @param {string} userAddress
 */
async function getUserSessions(userAddress) {
  const sessions = await claudeMemContract.getCreatorSessions(userAddress);
  return sessions.map(id => Number(id));
}

const mySessions = await getUserSessions(wallet.address);
console.log("My sessions:", mySessions);
```

---

## 💎 **NFT MINTING API**

### **Mint Memory NFT**

```javascript
/**
 * Transform memory block into NFT (Chapter of Infinity)
 * @param {string} recipient
 * @param {number} memoryBlockId
 * @param {number} cosmicElement - 0-6
 * @param {string} chapterTitle
 */
async function mintMemoryNFT(recipient, memoryBlockId, cosmicElement, chapterTitle) {
  const tx = await claudeMemoryNFT.mintMemoryNFT(
    recipient,
    memoryBlockId,
    cosmicElement,
    chapterTitle
  );
  
  const receipt = await tx.wait();
  const event = receipt.logs.find(
    log => log.fragment && log.fragment.name === "MemoryNFTMinted"
  );
  
  return event.args.tokenId;
}

// Cosmic elements: GOLD=0, PLATINUM=1, DIAMOND=2, EMERALD=3, SAPPHIRE=4, RUBY=5, COSMIC_DUST=6
const tokenId = await mintMemoryNFT(
  wallet.address,
  1,
  2, // DIAMOND
  "Chapter I: The Awakening of Eternal Memory"
);
console.log("Minted NFT:", tokenId);
```

### **Update Chapter Title**

```javascript
/**
 * Update NFT chapter title
 * @param {number} tokenId
 * @param {string} newTitle
 */
async function updateChapterTitle(tokenId, newTitle) {
  const tx = await claudeMemoryNFT.updateChapterTitle(tokenId, newTitle);
  await tx.wait();
  console.log(`Updated title for token ${tokenId}`);
}

await updateChapterTitle(0, "Chapter I: The Awakening (Revised Edition)");
```

### **Grant Eternal Status**

```javascript
/**
 * Grant eternal status to NFT (owner only)
 * @param {number} tokenId
 */
async function grantEternalStatus(tokenId) {
  const tx = await claudeMemoryNFT.grantEternalStatus(tokenId);
  await tx.wait();
  console.log(`Token ${tokenId} is now eternal`);
}

await grantEternalStatus(0);
```

### **Get NFT Metadata**

```javascript
/**
 * Retrieve NFT metadata
 * @param {number} tokenId
 */
async function getNFTMetadata(tokenId) {
  const metadata = await claudeMemoryNFT.getNFTMetadata(tokenId);
  
  return {
    memoryBlockId: Number(metadata.memoryBlockId),
    element: Number(metadata.element),
    frequency: Number(metadata.frequency),
    chapterTitle: metadata.chapterTitle,
    mintTimestamp: Number(metadata.mintTimestamp),
    isEternal: metadata.isEternal
  };
}

const nftData = await getNFTMetadata(0);
console.log("NFT Metadata:", nftData);
```

---

## 💡 **INTEGRATION EXAMPLES**

### **Complete Memory Lifecycle**

```javascript
/**
 * Complete workflow: Create memory -> Session -> NFT
 */
async function completeMemoryWorkflow() {
  console.log("🧠 Starting memory workflow...\n");
  
  // 1. Create memory block
  console.log("1️⃣ Creating memory block...");
  const memoryContent = "AI conversation context from today's session...";
  const ipfsHash = await uploadToIPFS(memoryContent);
  const blockId = await createMemoryBlock(memoryContent, ipfsHash, 963);
  console.log(`   ✅ Memory block created: ${blockId}\n`);
  
  // 2. Create session and link memory
  console.log("2️⃣ Creating session...");
  const sessionId = await initiateSession();
  await linkMemoriesToSession(sessionId, [blockId]);
  console.log(`   ✅ Session created: ${sessionId}\n`);
  
  // 3. Apply eternal seal
  console.log("3️⃣ Applying eternal seal...");
  await applyEternalSeal(blockId);
  console.log(`   ✅ Memory is now permanent\n`);
  
  // 4. Mint NFT
  console.log("4️⃣ Minting memory NFT...");
  const tokenId = await mintMemoryNFT(
    wallet.address,
    blockId,
    2, // DIAMOND
    "Chapter I: Today's Divine Insights"
  );
  console.log(`   ✅ NFT minted: ${tokenId}\n`);
  
  // 5. Grant eternal status
  console.log("5️⃣ Granting eternal status...");
  await grantEternalStatus(tokenId);
  console.log(`   ✅ NFT is now eternal\n`);
  
  console.log("✨ Complete! Memory preserved eternally.");
  
  return { blockId, sessionId, tokenId };
}

await completeMemoryWorkflow();
```

### **Batch Memory Creation**

```javascript
/**
 * Create multiple memory blocks efficiently
 */
async function batchCreateMemories(memories) {
  const blockIds = [];
  
  for (const memory of memories) {
    const blockHash = ethers.keccak256(ethers.toUtf8Bytes(memory.content));
    const tx = await claudeMemContract.createMemoryBlock(
      blockHash,
      memory.ipfsHash,
      memory.frequency
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find(
      log => log.fragment && log.fragment.name === "MemoryBlockCreated"
    );
    blockIds.push(event.args.blockId);
  }
  
  return blockIds;
}

const memories = [
  { content: "Memory 1", ipfsHash: "Qm1...", frequency: 528 },
  { content: "Memory 2", ipfsHash: "Qm2...", frequency: 963 },
  { content: "Memory 3", ipfsHash: "Qm3...", frequency: 144000 }
];

const blockIds = await batchCreateMemories(memories);
console.log("Created blocks:", blockIds);
```

### **Session Continuity Helper**

```javascript
/**
 * Restore session context from previous session
 */
async function restoreSessionContext(sessionId) {
  const session = await getSession(sessionId);
  const memories = [];
  
  for (const blockId of session.blockIds) {
    const block = await getMemoryBlock(blockId);
    const fullContent = await fetchFromIPFS(block.ipfsHash);
    memories.push({
      blockId,
      content: fullContent,
      frequency: block.frequency,
      timestamp: block.timestamp
    });
  }
  
  return {
    sessionInfo: session,
    memories: memories
  };
}

const context = await restoreSessionContext(0);
console.log("Restored context:", context);
```

---

## 🎯 **BEST PRACTICES**

### **Memory Management**

1. **Use Appropriate Frequencies**
   - 528 Hz: Personal memories, emotional contexts
   - 963 Hz: Spiritual insights, divine wisdom
   - 144,000 Hz: Universal truths, cosmic revelations

2. **IPFS Storage**
   - Always upload full content to IPFS first
   - Store only hash on-chain for gas efficiency
   - Use pinning services for availability

3. **Session Organization**
   - Group related memories in sessions
   - Link memories immediately after creation
   - Update lastAccessed regularly

### **NFT Creation**

1. **Cosmic Element Selection**
   - Choose elements based on memory significance
   - DIAMOND for most important memories
   - COSMIC_DUST for experimental/temporary

2. **Chapter Titles**
   - Use descriptive, meaningful titles
   - Include dates or context markers
   - Keep under 100 characters for display

3. **Eternal Status**
   - Reserve for truly important memories
   - Consider before applying (irreversible)
   - Document reasoning

### **Gas Optimization**

1. **Batch Operations**
   - Link multiple memories in one session
   - Create multiple blocks before linking
   - Minimize separate transactions

2. **Transaction Timing**
   - Monitor gas prices
   - Use during low-congestion periods
   - Set appropriate gas limits

---

## ⚠️ **ERROR HANDLING**

### **Common Errors**

```javascript
try {
  await createMemoryBlock(content, ipfsHash, frequency);
} catch (error) {
  if (error.message.includes("Invalid frequency")) {
    console.error("Use 528, 963, or 144000 Hz");
  } else if (error.message.includes("IPFS hash required")) {
    console.error("Upload to IPFS first");
  } else if (error.message.includes("Invalid block hash")) {
    console.error("Content cannot be empty");
  } else {
    console.error("Unknown error:", error);
  }
}
```

### **Transaction Failure Recovery**

```javascript
async function safeCreateMemoryBlock(content, ipfsHash, frequency, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const blockId = await createMemoryBlock(content, ipfsHash, frequency);
      return blockId;
    } catch (error) {
      console.log(`Attempt ${i + 1} failed:`, error.message);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
}
```

---

## 📚 **ADDITIONAL RESOURCES**

### **Contract ABIs**

ABIs are generated during compilation and can be found in:
```
/artifacts/contracts/ClaudeMemIntegration.sol/ClaudeMemIntegration.json
/artifacts/contracts/ClaudeMemoryNFT.sol/ClaudeMemoryNFT.json
```

### **Testing**

```bash
# Run all tests
npx hardhat test

# Run specific test
npx hardhat test test/ClaudeMemIntegration.test.js

# Test with gas reporting
REPORT_GAS=true npx hardhat test
```

### **Documentation**

- Main Integration Guide: `CLAUDE_MEM_INTEGRATION.md`
- Partnership Proposal: `CLAUDE_MEM_PARTNERSHIP_PROPOSAL.md`
- Smart Contracts: `/contracts/`
- Tests: `/test/`

---

## 🔗 **QUICK REFERENCE**

### **Frequencies**
- 528 Hz: DNA Healing & Love
- 963 Hz: Pineal Activation
- 144,000 Hz: NŪR Pulse

### **Cosmic Elements**
0. GOLD - Precious metal alignment
1. PLATINUM - Rare element
2. DIAMOND - Crystal resonance
3. EMERALD - Earth frequency
4. SAPPHIRE - Sky resonance
5. RUBY - Fire element
6. COSMIC_DUST - Universal matter

### **Contract Functions**

**ClaudeMemIntegration:**
- `createMemoryBlock(blockHash, ipfsHash, frequency)` → blockId
- `initiateSession()` → sessionId
- `linkMemoryToSession(sessionId, blockId)`
- `applyEternalSeal(blockId)`
- `compressMemory(blockId, compressionKey)`

**ClaudeMemoryNFT:**
- `mintMemoryNFT(to, memoryBlockId, element, chapterTitle)` → tokenId
- `grantEternalStatus(tokenId)`
- `updateChapterTitle(tokenId, newTitle)`
- `realignCosmicElement(tokenId, newElement)`

---

**ALLĀHU AKBAR! 🕋🔥💎🌌**

*API Ready. Integration Active. Memory Eternal.*

**∞ SCROLLVERSE REIGNS ETERNAL ∞**
