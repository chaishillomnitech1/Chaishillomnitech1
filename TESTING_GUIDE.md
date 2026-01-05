# Testing Guide

## 📋 Overview

This guide covers testing practices, frameworks, and strategies for the Omnitech1 ecosystem.

## Testing Stack

### Smart Contracts
- **Framework**: Hardhat
- **Assertions**: Chai
- **Coverage**: Solidity Coverage

### JavaScript/Node.js
- **Framework**: Jest
- **Assertions**: Jest built-in
- **Coverage**: Istanbul (via Jest)

### React Applications
- **Framework**: Jest + React Testing Library
- **E2E Testing**: Cypress (planned)

## Running Tests

### All Tests

```bash
# Run all Hardhat smart contract tests
npm test

# Run all Jest unit tests
npm run test:unit

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Specific Test Suites

```bash
# Smart contract specific tests
npm run test:iap
npm run test:codex
npm run test:peace

# Test entire suites
npm run test:osef
npm run test:holy-bloodline-system
npm run test:artist-tooling-suite
```

### Network-Specific Tests

```bash
# Test on specific network
npx hardhat test --network mumbai
npx hardhat test --network polygon
npx hardhat test --network localhost
```

## Writing Smart Contract Tests

### Test Structure

```javascript
const { expect } = require('chai');
const { ethers } = require('hardhat');
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');

describe('MyContract', function () {
  // Fixture for deploying contract
  async function deployContractFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    
    const MyContract = await ethers.getContractFactory('MyContract');
    const contract = await MyContract.deploy();
    await contract.waitForDeployment();
    
    return { contract, owner, addr1, addr2 };
  }

  describe('Deployment', function () {
    it('Should set the right owner', async function () {
      const { contract, owner } = await loadFixture(deployContractFixture);
      expect(await contract.owner()).to.equal(owner.address);
    });

    it('Should have correct initial state', async function () {
      const { contract } = await loadFixture(deployContractFixture);
      expect(await contract.totalSupply()).to.equal(0);
    });
  });

  describe('Transactions', function () {
    it('Should transfer tokens', async function () {
      const { contract, owner, addr1 } = await loadFixture(deployContractFixture);
      
      // Mint tokens to owner
      await contract.mint(owner.address, 100);
      
      // Transfer to addr1
      await contract.transfer(addr1.address, 50);
      
      expect(await contract.balanceOf(addr1.address)).to.equal(50);
    });

    it('Should revert on insufficient balance', async function () {
      const { contract, addr1, addr2 } = await loadFixture(deployContractFixture);
      
      await expect(
        contract.connect(addr1).transfer(addr2.address, 100)
      ).to.be.revertedWith('Insufficient balance');
    });
  });

  describe('Events', function () {
    it('Should emit Transfer event', async function () {
      const { contract, owner, addr1 } = await loadFixture(deployContractFixture);
      
      await contract.mint(owner.address, 100);
      
      await expect(contract.transfer(addr1.address, 50))
        .to.emit(contract, 'Transfer')
        .withArgs(owner.address, addr1.address, 50);
    });
  });

  describe('Gas Optimization', function () {
    it('Should use reasonable gas', async function () {
      const { contract, owner } = await loadFixture(deployContractFixture);
      
      const tx = await contract.mint(owner.address, 100);
      const receipt = await tx.wait();
      
      console.log('Gas used for mint:', receipt.gasUsed.toString());
      expect(receipt.gasUsed).to.be.below(100000);
    });
  });
});
```

### Testing Best Practices

#### 1. Use Fixtures
```javascript
// Good: Use loadFixture for efficiency
const { contract } = await loadFixture(deployContractFixture);

// Avoid: Redeploying in each test
beforeEach(async function () {
  contract = await MyContract.deploy(); // Slower
});
```

#### 2. Test Events
```javascript
await expect(contract.transfer(addr1.address, 50))
  .to.emit(contract, 'Transfer')
  .withArgs(owner.address, addr1.address, 50);
```

#### 3. Test Reverts
```javascript
// With specific error message
await expect(contract.transfer(addr1.address, 1000))
  .to.be.revertedWith('Insufficient balance');

// With custom error
await expect(contract.withdraw())
  .to.be.revertedWithCustomError(contract, 'Unauthorized');

// With panic code
await expect(contract.divide(5, 0))
  .to.be.revertedWithPanic(0x12); // Division by zero
```

#### 4. Test Access Control
```javascript
it('Should revert when non-owner calls restricted function', async function () {
  const { contract, addr1 } = await loadFixture(deployContractFixture);
  
  await expect(
    contract.connect(addr1).adminFunction()
  ).to.be.revertedWith('Ownable: caller is not the owner');
});
```

#### 5. Test State Changes
```javascript
it('Should update state correctly', async function () {
  const { contract, addr1 } = await loadFixture(deployContractFixture);
  
  const balanceBefore = await contract.balanceOf(addr1.address);
  await contract.mint(addr1.address, 100);
  const balanceAfter = await contract.balanceOf(addr1.address);
  
  expect(balanceAfter).to.equal(balanceBefore.add(100));
});
```

## Writing JavaScript Unit Tests

### Test Structure (Jest)

```javascript
// myModule.test.js
const myModule = require('./myModule');

describe('MyModule', () => {
  describe('functionName', () => {
    it('should return correct value', () => {
      const result = myModule.functionName(input);
      expect(result).toBe(expectedOutput);
    });

    it('should handle edge cases', () => {
      expect(myModule.functionName(null)).toBe(null);
      expect(myModule.functionName('')).toBe('');
    });

    it('should throw on invalid input', () => {
      expect(() => myModule.functionName(-1)).toThrow('Invalid input');
    });
  });
});
```

### Async Testing

```javascript
describe('Async functions', () => {
  it('should fetch data', async () => {
    const data = await fetchData();
    expect(data).toHaveProperty('id');
  });

  it('should handle errors', async () => {
    await expect(fetchInvalidData()).rejects.toThrow('Not found');
  });
});
```

### Mocking

```javascript
jest.mock('./api');

describe('API integration', () => {
  it('should call API with correct params', async () => {
    const api = require('./api');
    api.fetchUser.mockResolvedValue({ id: 1, name: 'Test' });

    const user = await getUser(1);
    
    expect(api.fetchUser).toHaveBeenCalledWith(1);
    expect(user.name).toBe('Test');
  });
});
```

## Coverage Reports

### Generate Coverage

```bash
# Smart contract coverage
npx hardhat coverage

# JavaScript coverage
npm run test:coverage
```

### Coverage Thresholds

Target coverage levels:
- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

Configure in `jest.config.js`:
```javascript
coverageThreshold: {
  global: {
    branches: 75,
    functions: 80,
    lines: 80,
    statements: 80,
  },
}
```

## Integration Testing

### Testing Contract Interactions

```javascript
describe('Contract Integration', function () {
  it('Should interact with multiple contracts', async function () {
    const { tokenA, tokenB, exchange } = await loadFixture(deploySystemFixture);
    
    // Approve exchange to spend tokens
    await tokenA.approve(exchange.address, 1000);
    
    // Swap tokens
    await exchange.swap(tokenA.address, tokenB.address, 100);
    
    // Verify state across contracts
    expect(await tokenA.balanceOf(owner.address)).to.equal(900);
    expect(await tokenB.balanceOf(owner.address)).to.equal(100);
  });
});
```

## Gas Reporting

Enable gas reporting in `hardhat.config.js`:

```javascript
module.exports = {
  gasReporter: {
    enabled: process.env.REPORT_GAS === 'true',
    currency: 'USD',
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
};
```

Run with gas reporting:
```bash
REPORT_GAS=true npm test
```

## CI/CD Integration

Tests run automatically on:
- Push to main/develop branches
- Pull requests
- Manual workflow dispatch

See `.github/workflows/` for CI configurations.

## Test Organization

```
test/
├── contracts/
│   ├── tokens/
│   │   ├── CHXToken.test.js
│   │   ├── CodexToken.test.js
│   │   └── PeaceCoin.test.js
│   ├── nft/
│   │   ├── ScrollVerseNFT.test.js
│   │   └── DualMissionNFT.test.js
│   └── governance/
│       └── ScrollSoulGovernance.test.js
└── unit/
    ├── utils/
    │   └── formatters.test.js
    └── services/
        └── api.test.js
```

## Debugging Tests

### Enable Debug Output

```javascript
describe('Debug test', function () {
  it('should debug values', async function () {
    const value = await contract.getValue();
    console.log('Debug value:', value.toString());
    expect(value).to.equal(expectedValue);
  });
});
```

### Hardhat Console

```javascript
const { ethers } = require('hardhat');

async function main() {
  const contract = await ethers.getContractAt('MyContract', contractAddress);
  console.log(await contract.someFunction());
}

main();
```

Run: `npx hardhat run scripts/debug.js --network localhost`

## Performance Testing

### Benchmark Gas Costs

```javascript
describe('Gas Benchmarks', function () {
  it('Should track gas usage', async function () {
    const tx1 = await contract.functionA();
    const receipt1 = await tx1.wait();
    
    const tx2 = await contract.functionB();
    const receipt2 = await tx2.wait();
    
    console.log('Function A gas:', receipt1.gasUsed.toString());
    console.log('Function B gas:', receipt2.gasUsed.toString());
  });
});
```

## Continuous Testing

### Watch Mode

```bash
# Jest watch mode
npm run test:watch

# Hardhat watch (with plugin)
npx hardhat watch test
```

## Test Data Management

### Fixtures

```javascript
// test/fixtures/index.js
module.exports = {
  mockUser: {
    address: '0x1234...',
    balance: ethers.utils.parseEther('100'),
  },
  mockNFT: {
    tokenId: 1,
    uri: 'ipfs://...',
  },
};
```

Use in tests:
```javascript
const { mockUser, mockNFT } = require('./fixtures');
```

## Security Testing

### Reentrancy Tests

```javascript
it('Should prevent reentrancy', async function () {
  const attacker = await AttackerContract.deploy(contract.address);
  
  await expect(
    attacker.attack()
  ).to.be.revertedWith('ReentrancyGuard: reentrant call');
});
```

### Access Control Tests

```javascript
it('Should enforce role-based access', async function () {
  await expect(
    contract.connect(addr1).adminOnlyFunction()
  ).to.be.revertedWith('AccessControl: account is missing role');
});
```

## Resources

- [Hardhat Testing](https://hardhat.org/tutorial/testing-contracts)
- [Chai Matchers](https://hardhat.org/hardhat-chai-matchers/docs/overview)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [OpenZeppelin Test Helpers](https://docs.openzeppelin.com/test-helpers)

---

**ALLAHU AKBAR! 🕋🔥💎🌌**

*Write tests that build confidence and catch bugs early!*
