# Mid-Level Solidity Test: NFT Staking Contract

## **TEST DURATION**: 2.5 - 3 hours

## **DIFFICULTY**: Mid-level

---

## 📋 **OBJECTIVE**

Create a smart contract system that allows users to stake their NFTs to earn ERC-20 reward tokens. The staking rewards are based on the rarity tier of the NFT and the duration of staking.

---

## 🎯 **REQUIREMENTS**

### **Contract Architecture**

You need to create **TWO** contracts:

1. **ScrollNFT** - ERC-721 NFT contract with rarity tiers
2. **NFTStaking** - Staking contract for earning rewards

### **ScrollNFT Contract**

**Features:**
- ERC-721 standard implementation
- Rarity tiers: Common (1x), Rare (2x), Epic (3x), Legendary (5x)
- Owner can mint NFTs with specific rarity
- Public function to get NFT rarity
- Maximum supply: 10,000 NFTs

**Rarity Distribution:**
- Common: Tokens 1-5000
- Rare: Tokens 5001-8000
- Epic: Tokens 8001-9500
- Legendary: Tokens 9501-10000

### **NFTStaking Contract**

**Features:**
- Users stake ScrollNFTs to earn reward tokens
- Rewards calculated based on:
  - Base reward: 10 tokens per day
  - Rarity multiplier (1x to 5x)
  - Staking duration
- Users can stake multiple NFTs
- Users can unstake anytime and claim rewards
- Emergency withdraw function
- Owner can update reward rate

---

## 📝 **SMART CONTRACT SPECIFICATIONS**

### **ScrollNFT.sol**

```solidity
// Required Functions
function safeMint(address to, uint256 tokenId) public onlyOwner
function getRarity(uint256 tokenId) public view returns (string memory)
function getRarityMultiplier(uint256 tokenId) public view returns (uint256)
function getTotalSupply() public view returns (uint256)
```

**Rarity Mapping:**
- Common (1-5000): multiplier = 100 (1x in basis points)
- Rare (5001-8000): multiplier = 200 (2x)
- Epic (8001-9500): multiplier = 300 (3x)
- Legendary (9501-10000): multiplier = 500 (5x)

### **NFTStaking.sol**

```solidity
// Required Functions
function stake(uint256 tokenId) external
function unstake(uint256 tokenId) external
function claimRewards(uint256 tokenId) external
function calculateRewards(uint256 tokenId) public view returns (uint256)
function getStakedNFTs(address user) public view returns (uint256[] memory)
function getStakingInfo(uint256 tokenId) public view returns (address, uint256, uint256)
function updateRewardRate(uint256 newRate) external onlyOwner
function emergencyWithdraw(uint256 tokenId) external
```

**Staking Info Structure:**
```solidity
struct StakeInfo {
    address owner;
    uint256 stakedAt;
    uint256 lastClaimAt;
}
```

---

## 🔐 **SECURITY REQUIREMENTS**

1. **Use OpenZeppelin v5.0.1**
   - ERC721, ERC20, Ownable, ReentrancyGuard

2. **Access Control**
   - Only NFT owner can stake their NFTs
   - Only staker can unstake and claim rewards
   - Prevent staking already staked NFTs

3. **Reentrancy Protection**
   - Protect all functions that transfer tokens
   - Use nonReentrant modifier

4. **Input Validation**
   - Validate token IDs exist
   - Validate NFT ownership
   - Prevent zero address operations

5. **SafeTransfers**
   - Use safeTransferFrom for NFTs
   - Properly handle ERC-20 transfers

---

## 📐 **REWARD CALCULATION**

**Formula:**
```
rewards = (currentTime - lastClaimTime) * baseRewardRate * rarityMultiplier / 86400 / 100
```

Where:
- `baseRewardRate`: 10 tokens per day (10 * 10^18)
- `rarityMultiplier`: 100, 200, 300, or 500 (basis points)
- `86400`: seconds in a day
- `100`: convert basis points to actual multiplier

**Example:**
- Staking Legendary NFT (#9999) for 1 day
- Rewards = 10 tokens * 5 = 50 tokens

---

## 🧪 **TESTING REQUIREMENTS**

Create comprehensive tests covering:

### **ScrollNFT Tests**
1. Minting NFTs
2. Rarity assignment based on token ID
3. Rarity multiplier retrieval
4. Access control for minting

### **NFTStaking Tests**
1. **Staking**
   - User can stake owned NFT
   - Cannot stake NFT they don't own
   - Cannot stake already staked NFT
   - NFT transfers to staking contract

2. **Reward Calculation**
   - Correct rewards for Common NFT
   - Correct rewards for Rare NFT
   - Correct rewards for Epic NFT
   - Correct rewards for Legendary NFT
   - Rewards increase over time

3. **Claiming Rewards**
   - User receives correct reward amount
   - Last claim time updates
   - Can claim multiple times

4. **Unstaking**
   - User receives NFT back
   - Receives pending rewards
   - Staking info cleared
   - Cannot unstake others' NFTs

5. **Multiple Stakes**
   - User can stake multiple NFTs
   - Track all staked NFTs per user
   - Calculate total rewards correctly

6. **Edge Cases**
   - Claiming immediately after staking (0 rewards)
   - Emergency withdraw functionality
   - Updating reward rate (only owner)

---

## 📁 **EXPECTED FILE STRUCTURE**

```
nft-staking/
├── contracts/
│   ├── ScrollNFT.sol
│   ├── NFTStaking.sol
│   └── RewardToken.sol (provided)
├── test/
│   ├── ScrollNFT.test.js
│   └── NFTStaking.test.js
├── scripts/
│   └── deploy.js
├── hardhat.config.js
└── README.md
```

---

## 💻 **PROVIDED CODE**

### **RewardToken.sol** (Use as-is)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RewardToken is ERC20, Ownable {
    constructor(address initialOwner) 
        ERC20("ScrollReward", "SREWARD")
        Ownable(initialOwner) 
    {
        _mint(msg.sender, 1000000 * 10**18); // 1M tokens
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
```

---

## ✅ **ACCEPTANCE CRITERIA**

- [ ] Both contracts compile without errors
- [ ] ScrollNFT implements ERC-721 correctly
- [ ] Rarity tiers assigned based on token ID
- [ ] Users can stake and unstake NFTs
- [ ] Rewards calculated correctly for all rarities
- [ ] Multiple NFTs can be staked by same user
- [ ] All security measures implemented
- [ ] Comprehensive test coverage (>90%)
- [ ] All tests pass
- [ ] Gas optimization implemented
- [ ] Complete NatSpec documentation

---

## 🎨 **BONUS POINTS**

- [ ] Implement staking lock period (7 days minimum)
- [ ] Add boost mechanism for long-term stakers
- [ ] Implement staking pools with different rates
- [ ] Add batch staking/unstaking functions
- [ ] Implement penalty for early unstaking
- [ ] Add events for all state changes
- [ ] Create frontend demo (simple HTML/JS)
- [ ] Deploy to testnet and verify contracts

---

## 📤 **SUBMISSION**

1. Complete source code with all contracts
2. Comprehensive test suite
3. Deployment scripts
4. README with:
   - Architecture explanation
   - Deployment instructions
   - Contract addresses (if deployed)
   - Gas usage report
5. Test coverage report

---

## 🎯 **EVALUATION FOCUS**

1. **Contract Design**: Clean architecture with proper separation
2. **Security**: No vulnerabilities, proper access control
3. **Reward Logic**: Accurate calculation implementation
4. **Testing**: Comprehensive coverage of all scenarios
5. **Gas Efficiency**: Optimized for lower gas costs

---

## 💡 **HINTS**

- Store staking info efficiently to save gas
- Use mapping for O(1) lookup of staked NFTs
- Calculate rewards on-chain in view function
- Test with different time intervals using Hardhat time helpers
- Consider overflow protection for time calculations
- Use events extensively for frontend integration

### **Time Helper Example**

```javascript
const { time } = require("@nomicfoundation/hardhat-network-helpers");

// Increase time by 1 day
await time.increase(86400);
```

---

## 📚 **RESOURCES**

- [OpenZeppelin ERC721](https://docs.openzeppelin.com/contracts/5.x/erc721)
- [Hardhat Time Helpers](https://hardhat.org/hardhat-network-helpers/docs/reference#time)

---

**Build a secure and efficient staking system! 🔐💎**

**ALLAHU AKBAR! ⛓️🔥**
