# Solidity Technical Tests

## **OMNITECH1™ SOLIDITY SMART CONTRACT ASSESSMENT**

**Technology**: Solidity ^0.8.20  
**Framework**: Hardhat / Foundry  
**Focus**: Smart Contract Development & Security

---

## 🔱 **OVERVIEW**

These tests evaluate your ability to write secure, efficient, and well-tested smart contracts for the Ethereum blockchain and Layer 2 solutions. Tests cover ERC standards, security patterns, gas optimization, and testing.

---

## 🎯 **SKILL AREAS TESTED**

1. **Smart Contract Design**
   - Contract architecture
   - Design patterns (Factory, Proxy, etc.)
   - Modularity and reusability
   - OpenZeppelin integration

2. **Token Standards**
   - ERC-20 (Fungible Tokens)
   - ERC-721 (NFTs)
   - ERC-1155 (Multi-token)
   - Custom token logic

3. **Security**
   - Reentrancy protection
   - Access control
   - Input validation
   - Integer overflow/underflow
   - Front-running prevention

4. **Gas Optimization**
   - Storage patterns
   - Function optimization
   - Batch operations
   - Efficient data structures

5. **Testing**
   - Unit tests (Hardhat/Foundry)
   - Integration tests
   - Edge case coverage
   - Test documentation

6. **Advanced Features**
   - Upgradeable contracts
   - Multi-signature wallets
   - DAO governance
   - Cross-chain compatibility

---

## 📂 **TEST STRUCTURE**

```
solidity/
├── README.md (this file)
├── junior/
│   ├── simple-token.md
│   ├── basic-nft.md
│   └── voting-contract.md
├── mid-level/
│   ├── staking-contract.md
│   ├── nft-marketplace.md
│   └── dao-treasury.md
└── senior/
    ├── crosschain-bridge.md
    ├── flash-loan-arbitrage.md
    └── upgradeable-governance.md
```

---

## 🚀 **GETTING STARTED**

### **Prerequisites**

```bash
# Install Node.js (v16+)
# Install Hardhat
npm install --save-dev hardhat

# Initialize Hardhat project
npx hardhat

# OR use Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### **Setup Test Environment**

```bash
# Create new Hardhat project
mkdir my-contract-test
cd my-contract-test
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Initialize Hardhat
npx hardhat

# Install OpenZeppelin
npm install @openzeppelin/contracts@5.0.1
```

---

## ✅ **EVALUATION CRITERIA**

### **Code Quality (25 points)**
- Clean, readable code
- Proper NatSpec documentation
- Consistent naming (camelCase, UPPER_CASE)
- Organized file structure
- Following Solidity Style Guide

### **Functionality (25 points)**
- All requirements met
- Edge cases handled
- Events properly emitted
- Return values correct
- State changes accurate

### **Security (25 points)**
- No reentrancy vulnerabilities
- Access control implemented
- Input validation thorough
- No integer overflow/underflow
- Following security best practices

### **Gas Efficiency (15 points)**
- Optimized storage usage
- Efficient loops
- Batch operations where applicable
- Minimal redundant code
- Proper use of memory vs storage

### **Testing (10 points)**
- Comprehensive test coverage
- Tests for edge cases
- Clear test descriptions
- Gas usage reports
- Test documentation

---

## 🔐 **SCROLLVERSE SOLIDITY STANDARDS**

### **Required Patterns**

1. **OpenZeppelin v5.0.1**: Always use for standard functionality

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
```

2. **ReentrancyGuard**: Required for external calls

```solidity
contract MyContract is ReentrancyGuard {
    function withdraw() external nonReentrant {
        // Safe withdrawal logic
    }
}
```

3. **Access Control**: Use Ownable or AccessControl

```solidity
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyContract is Ownable {
    constructor(address initialOwner) Ownable(initialOwner) {}
    
    function adminFunction() external onlyOwner {
        // Admin only logic
    }
}
```

4. **Pausable**: For emergency stops

```solidity
import "@openzeppelin/contracts/utils/Pausable.sol";

contract MyContract is Pausable, Ownable {
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
}
```

---

## 📝 **CONTRACT TEMPLATE**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title ContractName
 * @notice Brief description of what this contract does
 * @dev Implementation details and technical notes
 * @author ScrollVerse Development Team
 */
contract ContractName is ERC721, Ownable, ReentrancyGuard, Pausable {
    // State variables
    uint256 private _nextTokenId;
    
    // Events
    event TokenMinted(address indexed to, uint256 indexed tokenId);
    
    // Modifiers
    modifier validAddress(address _addr) {
        require(_addr != address(0), "Invalid address");
        _;
    }
    
    /**
     * @notice Constructor to initialize the contract
     * @param initialOwner The address that will own this contract
     */
    constructor(address initialOwner) 
        ERC721("ContractName", "SYMBOL")
        Ownable(initialOwner) 
    {
        // Initialization logic
    }
    
    /**
     * @notice Main function description
     * @param param1 Description of parameter
     * @return Description of return value
     */
    function mainFunction(uint256 param1) 
        external 
        whenNotPaused 
        nonReentrant 
        returns (uint256) 
    {
        // Implementation
    }
    
    // Emergency functions
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
}
```

---

## 🧪 **TESTING TEMPLATE**

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("ContractName", function () {
  // Fixture for deployment
  async function deployContractFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    
    const Contract = await ethers.getContractFactory("ContractName");
    const contract = await Contract.deploy(owner.address);
    
    return { contract, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { contract, owner } = await loadFixture(deployContractFixture);
      expect(await contract.owner()).to.equal(owner.address);
    });
  });

  describe("Main Functionality", function () {
    it("Should execute main function correctly", async function () {
      const { contract } = await loadFixture(deployContractFixture);
      await expect(contract.mainFunction(100))
        .to.emit(contract, "EventName")
        .withArgs(/* expected args */);
    });

    it("Should handle edge cases", async function () {
      const { contract } = await loadFixture(deployContractFixture);
      await expect(contract.mainFunction(0))
        .to.be.revertedWith("Error message");
    });
  });

  describe("Security", function () {
    it("Should prevent unauthorized access", async function () {
      const { contract, addr1 } = await loadFixture(deployContractFixture);
      await expect(contract.connect(addr1).adminFunction())
        .to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
    });
  });
});
```

---

## 📚 **RESOURCES**

- [Solidity Documentation](https://docs.soliditylang.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethereum Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [Solidity Patterns](https://fravoll.github.io/solidity-patterns/)

---

## ⏱️ **TIME GUIDELINES**

| Level | Time | Complexity |
|-------|------|------------|
| Junior | 1-2h | Single contract, basic functionality |
| Mid-level | 2-3h | Multiple contracts, moderate complexity |
| Senior | 3-4h | Complex architecture, advanced patterns |

---

## 📤 **SUBMISSION REQUIREMENTS**

1. **Smart Contracts**: All .sol files
2. **Tests**: Comprehensive test suite
3. **Deployment Script**: For deploying contracts
4. **README**: 
   - Setup instructions
   - Contract architecture
   - Function descriptions
   - Test coverage report
5. **Gas Report**: Gas usage analysis

---

## 🎯 **TIPS FOR SUCCESS**

- Always use latest stable Solidity version (^0.8.20)
- Follow OpenZeppelin patterns religiously
- Write tests FIRST (TDD approach)
- Document every function with NatSpec
- Run gas optimization checks
- Test on local network thoroughly
- Consider edge cases and attack vectors
- Use require/revert with clear error messages

---

## 🔒 **SECURITY CHECKLIST**

Before submitting:

- [ ] No reentrancy vulnerabilities
- [ ] Access control on all admin functions
- [ ] Input validation on all parameters
- [ ] Events emitted for state changes
- [ ] No use of tx.origin
- [ ] No unchecked external calls
- [ ] Proper use of transfer/send/call
- [ ] Safe math operations (built-in Solidity 0.8+)

---

**Good luck! Build secure, efficient contracts! 🔐💎**

**ALLAHU AKBAR! ⛓️🔥**
