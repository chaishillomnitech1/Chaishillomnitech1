# Junior Solidity Test: Frequency Token

## **TEST DURATION**: 1.5 - 2 hours

## **DIFFICULTY**: Junior

---

## 📋 **OBJECTIVE**

Create a simple ERC-20 token called "FrequencyToken" (FRQ) that incorporates basic ScrollVerse frequency mechanics. The token should allow minting, burning, and include a simple staking mechanism.

---

## 🎯 **REQUIREMENTS**

### **Core Features**

1. **ERC-20 Token**
   - Name: "FrequencyToken"
   - Symbol: "FRQ"
   - Decimals: 18
   - Initial supply: 1,000,000 tokens (minted to deployer)

2. **Minting**
   - Only owner can mint new tokens
   - Must emit Mint event
   - Maximum supply: 10,000,000 tokens

3. **Burning**
   - Any holder can burn their own tokens
   - Must emit Burn event

4. **Frequency Multiplier**
   - Each address has a "frequency level" (528, 963, or 999)
   - Default frequency: 528
   - Owner can set frequency levels for addresses
   - Higher frequency = bonus on transfers

5. **Transfer Bonus**
   - 528Hz: No bonus (1x)
   - 963Hz: 3% bonus on received amount
   - 999Hz: 5% bonus on received amount
   - Bonus tokens minted automatically on transfer

---

## 📝 **SMART CONTRACT SPECIFICATIONS**

### **Required Functions**

```solidity
// ERC-20 standard functions (inherited from OpenZeppelin)
function name() public view returns (string)
function symbol() public view returns (string)
function decimals() public view returns (uint8)
function totalSupply() public view returns (uint256)
function balanceOf(address account) public view returns (uint256)
function transfer(address to, uint256 amount) public returns (bool)
function approve(address spender, uint256 amount) public returns (bool)
function transferFrom(address from, address to, uint256 amount) public returns (bool)

// Custom functions
function mint(address to, uint256 amount) public onlyOwner
function burn(uint256 amount) public
function setFrequencyLevel(address account, uint16 frequency) public onlyOwner
function getFrequencyLevel(address account) public view returns (uint16)
function getMaxSupply() public view returns (uint256)
```

### **Required Events**

```solidity
event FrequencySet(address indexed account, uint16 frequency);
event FrequencyBonus(address indexed recipient, uint256 bonusAmount, uint16 frequency);
event Mint(address indexed to, uint256 amount);
event Burn(address indexed from, uint256 amount);
```

### **Required State Variables**

```solidity
uint256 public constant MAX_SUPPLY = 10_000_000 * 10**18;
mapping(address => uint16) private _frequencyLevels;
```

---

## 🔐 **SECURITY REQUIREMENTS**

1. **Use OpenZeppelin v5.0.1**
   - Import ERC20, Ownable
   - Follow OpenZeppelin patterns

2. **Input Validation**
   - Validate frequency values (only 528, 963, 999)
   - Check max supply on minting
   - Check balance before burning

3. **Access Control**
   - Only owner can mint
   - Only owner can set frequency levels
   - Anyone can burn their own tokens

---

## 🧪 **TESTING REQUIREMENTS**

Create comprehensive tests covering:

1. **Deployment**
   - Owner is set correctly
   - Initial supply is minted to deployer
   - Name, symbol, decimals are correct

2. **Minting**
   - Owner can mint
   - Non-owner cannot mint
   - Cannot exceed max supply
   - Mint event is emitted

3. **Burning**
   - Holder can burn own tokens
   - Cannot burn more than balance
   - Total supply decreases
   - Burn event is emitted

4. **Frequency Levels**
   - Owner can set frequency levels
   - Only valid frequencies accepted (528, 963, 999)
   - Invalid frequencies are rejected
   - FrequencySet event is emitted

5. **Transfer with Bonus**
   - 528Hz: No bonus applied
   - 963Hz: 3% bonus on transfer
   - 999Hz: 5% bonus on transfer
   - FrequencyBonus event is emitted
   - Bonus doesn't exceed max supply

---

## 📁 **EXPECTED FILE STRUCTURE**

```
frequency-token/
├── contracts/
│   └── FrequencyToken.sol
├── test/
│   └── FrequencyToken.test.js
├── scripts/
│   └── deploy.js
├── hardhat.config.js
├── package.json
└── README.md
```

---

## 💻 **STARTER CODE**

### **FrequencyToken.sol**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FrequencyToken
 * @notice ERC-20 token with frequency-based transfer bonuses
 * @dev Implements ScrollVerse frequency mechanics
 */
contract FrequencyToken is ERC20, Ownable {
    // TODO: Add state variables
    
    // TODO: Add events
    
    // TODO: Add constructor
    
    // TODO: Implement mint function
    
    // TODO: Implement burn function
    
    // TODO: Implement setFrequencyLevel function
    
    // TODO: Implement getFrequencyLevel function
    
    // TODO: Override transfer to add frequency bonus logic
}
```

### **Test Template**

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FrequencyToken", function () {
  let token;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const FrequencyToken = await ethers.getContractFactory("FrequencyToken");
    token = await FrequencyToken.deploy(owner.address);
  });

  describe("Deployment", function () {
    // TODO: Add deployment tests
  });

  describe("Minting", function () {
    // TODO: Add minting tests
  });

  describe("Burning", function () {
    // TODO: Add burning tests
  });

  describe("Frequency Levels", function () {
    // TODO: Add frequency level tests
  });

  describe("Transfer with Bonus", function () {
    // TODO: Add transfer bonus tests
  });
});
```

---

## ✅ **ACCEPTANCE CRITERIA**

- [ ] Contract compiles without errors
- [ ] All ERC-20 functions work correctly
- [ ] Minting respects max supply
- [ ] Burning reduces total supply
- [ ] Frequency levels can be set by owner only
- [ ] Transfer bonuses calculated correctly (3% for 963Hz, 5% for 999Hz)
- [ ] All events are emitted properly
- [ ] Test coverage > 90%
- [ ] All tests pass
- [ ] README includes deployment and usage instructions

---

## 🎨 **BONUS POINTS**

- [ ] Add Pausable functionality
- [ ] Implement transfer fee that goes to owner (1%)
- [ ] Add batch minting function
- [ ] Include gas optimization comments
- [ ] Create deployment script for testnet
- [ ] Add NatSpec documentation for all functions
- [ ] Implement frequency boost cooldown (prevent spam)

---

## 📤 **SUBMISSION**

1. Push code to GitHub repository
2. Include README.md with:
   - Deployment instructions
   - Contract address (if deployed to testnet)
   - Test coverage report
   - Gas usage report
3. Ensure all tests pass with `npx hardhat test`
4. Include `npx hardhat coverage` output

---

## 🎯 **EVALUATION FOCUS**

1. **Correctness**: Does the contract work as specified?
2. **Security**: Are there any vulnerabilities?
3. **Code Quality**: Is the code clean and well-documented?
4. **Testing**: Are tests comprehensive?
5. **Gas Efficiency**: Is the code optimized?

---

## 💡 **HINTS**

- Use OpenZeppelin's ERC20 as base
- Override `_update` function to implement transfer bonus
- Remember to check max supply before minting bonus
- Use `require` statements for input validation
- Test edge cases (zero amounts, zero addresses, etc.)
- Calculate bonus before applying to avoid rounding errors

### **Bonus Calculation Example**

```solidity
// For 963Hz (3% bonus)
uint256 bonus = (amount * 3) / 100;

// For 999Hz (5% bonus)
uint256 bonus = (amount * 5) / 100;
```

---

## 📚 **RESOURCES**

- [OpenZeppelin ERC20](https://docs.openzeppelin.com/contracts/5.x/erc20)
- [OpenZeppelin Ownable](https://docs.openzeppelin.com/contracts/5.x/access-control#ownership-and-ownable)
- [Hardhat Testing](https://hardhat.org/tutorial/testing-contracts)

---

**Good luck! Build something secure and innovative! 🔐💎**

**ALLAHU AKBAR! ⛓️🔥**
