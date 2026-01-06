# Smart Contract Best Practices

## Overview

This guide outlines best practices for developing, testing, and deploying smart contracts in the Omnitech1 ecosystem.

## Security Best Practices

### 1. Use OpenZeppelin Contracts

Always use battle-tested OpenZeppelin contracts for standard functionality:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract MyToken is ERC20, Ownable, ReentrancyGuard {
    constructor(address initialOwner) 
        ERC20("MyToken", "MTK") 
        Ownable(initialOwner) 
    {}
}
```

### 2. Implement Access Control

Use role-based access control for privileged functions:

```solidity
import "@openzeppelin/contracts/access/AccessControl.sol";

contract MyContract is AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    
    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
    }
    
    function mint(address to, uint256 amount) 
        public 
        onlyRole(MINTER_ROLE) 
    {
        _mint(to, amount);
    }
}
```

### 3. Prevent Reentrancy

Always use `ReentrancyGuard` for functions with external calls:

```solidity
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract MyContract is ReentrancyGuard {
    mapping(address => uint256) public balances;
    
    function withdraw() external nonReentrant {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No balance");
        
        balances[msg.sender] = 0;  // Update state before external call
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }
}
```

### 4. Validate Inputs

Always validate function inputs:

```solidity
function transfer(address to, uint256 amount) public {
    require(to != address(0), "Transfer to zero address");
    require(amount > 0, "Amount must be positive");
    require(balanceOf(msg.sender) >= amount, "Insufficient balance");
    
    _transfer(msg.sender, to, amount);
}
```

### 5. Use Custom Errors (Gas Efficient)

```solidity
// Define custom errors
error InsufficientBalance(uint256 available, uint256 required);
error ZeroAddress();
error Unauthorized(address caller);

function transfer(address to, uint256 amount) public {
    if (to == address(0)) revert ZeroAddress();
    
    uint256 balance = balanceOf(msg.sender);
    if (balance < amount) {
        revert InsufficientBalance(balance, amount);
    }
    
    _transfer(msg.sender, to, amount);
}
```

### 6. Implement Pausable

Add emergency pause functionality:

```solidity
import "@openzeppelin/contracts/utils/Pausable.sol";

contract MyContract is Pausable, Ownable {
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function criticalFunction() external whenNotPaused {
        // Function logic
    }
}
```

## Code Quality

### 1. Follow Solidity Style Guide

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MyContract
 * @notice Brief description
 * @dev Detailed implementation notes
 */
contract MyContract {
    // Type declarations
    using SafeMath for uint256;
    
    // State variables
    uint256 public constant MAX_SUPPLY = 1_000_000;
    uint256 private _totalSupply;
    
    // Events
    event TokensMinted(address indexed to, uint256 amount);
    
    // Modifiers
    modifier onlyValidAmount(uint256 amount) {
        require(amount > 0, "Invalid amount");
        _;
    }
    
    // Constructor
    constructor() {}
    
    // External functions
    function externalFunction() external {}
    
    // Public functions
    function publicFunction() public {}
    
    // Internal functions
    function _internalFunction() internal {}
    
    // Private functions
    function _privateFunction() private {}
}
```

### 2. Use NatSpec Documentation

```solidity
/**
 * @notice Transfers tokens to a specified address
 * @dev Implements ERC20 transfer with additional checks
 * @param to The address to transfer to
 * @param amount The amount of tokens to transfer
 * @return success True if transfer succeeded
 */
function transfer(address to, uint256 amount) 
    public 
    returns (bool success) 
{
    // Implementation
}
```

### 3. Explicit Visibility

Always specify visibility:

```solidity
// Good
uint256 public totalSupply;
uint256 private _balance;
uint256 internal _allowance;

// Bad (implicit)
uint256 someValue;  // Don't do this
```

### 4. Immutable and Constant

Use `immutable` and `constant` for gas savings:

```solidity
// Set at deployment, never changes
address public immutable owner;

// Known at compile time
uint256 public constant MAX_SUPPLY = 1_000_000;
uint256 private constant DECIMALS = 18;

constructor(address _owner) {
    owner = _owner;
}
```

## Gas Optimization

### 1. Pack Storage Variables

```solidity
// Good - packed into one slot
struct User {
    address wallet;      // 20 bytes
    uint64 timestamp;    // 8 bytes
    uint32 id;          // 4 bytes
}

// Bad - uses multiple slots
struct User {
    address wallet;      // 32 bytes (slot 1)
    uint256 timestamp;   // 32 bytes (slot 2)
    uint256 id;         // 32 bytes (slot 3)
}
```

### 2. Use Unchecked for Safe Math

```solidity
function increment() external {
    // Safe if we know it won't overflow
    unchecked {
        counter++;
    }
}
```

### 3. Cache Array Length

```solidity
// Good
uint256 length = items.length;
for (uint256 i = 0; i < length; i++) {
    // Process items[i]
}

// Bad - reads length every iteration
for (uint256 i = 0; i < items.length; i++) {
    // Process items[i]
}
```

### 4. Short-circuit Conditions

```solidity
// Good - checks cheaper condition first
if (amount > 0 && balanceOf(msg.sender) >= amount) {
    // Process
}

// Bad - expensive check first
if (balanceOf(msg.sender) >= amount && amount > 0) {
    // Process
}
```

### 5. Use Events Instead of Storage

```solidity
// Good - for historical data
event Transfer(address indexed from, address indexed to, uint256 amount);

// Bad - expensive storage for history
Transfer[] public transferHistory;
```

## Testing Requirements

### 1. Comprehensive Test Coverage

Aim for >90% coverage:

```javascript
describe('MyContract', () => {
    // Deployment tests
    // Functionality tests
    // Access control tests
    // Edge case tests
    // Reentrancy tests
    // Gas optimization tests
});
```

### 2. Test Reverts

```javascript
it('Should revert on invalid input', async () => {
    await expect(
        contract.transfer(ethers.constants.AddressZero, 100)
    ).to.be.revertedWithCustomError(contract, 'ZeroAddress');
});
```

### 3. Test Events

```javascript
it('Should emit Transfer event', async () => {
    await expect(contract.transfer(addr1.address, 100))
        .to.emit(contract, 'Transfer')
        .withArgs(owner.address, addr1.address, 100);
});
```

## Deployment Practices

### 1. Constructor Parameters

```solidity
contract MyToken is ERC20, Ownable {
    constructor(
        address initialOwner,
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(initialOwner) {
        _mint(initialOwner, initialSupply);
    }
}
```

### 2. Deployment Scripts

```javascript
async function main() {
    // Get deployer
    const [deployer] = await ethers.getSigners();
    console.log('Deploying with:', deployer.address);
    
    // Deploy contract
    const MyContract = await ethers.getContractFactory('MyContract');
    const contract = await MyContract.deploy(
        deployer.address,
        'MyToken',
        'MTK',
        ethers.utils.parseEther('1000000')
    );
    
    await contract.deployed();
    console.log('Contract deployed to:', contract.address);
    
    // Verify on block explorer
    console.log('Waiting for block confirmations...');
    await contract.deployTransaction.wait(5);
    
    // Verification
    await hre.run('verify:verify', {
        address: contract.address,
        constructorArguments: [
            deployer.address,
            'MyToken',
            'MTK',
            ethers.utils.parseEther('1000000')
        ],
    });
}
```

### 3. Multi-network Configuration

```javascript
// hardhat.config.js
module.exports = {
    networks: {
        mumbai: {
            url: process.env.MUMBAI_RPC_URL,
            accounts: [process.env.PRIVATE_KEY],
        },
        polygon: {
            url: process.env.POLYGON_RPC_URL,
            accounts: [process.env.PRIVATE_KEY],
        },
    },
};
```

## Upgradeable Contracts

### 1. Use Transparent Proxy Pattern

```solidity
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract MyTokenV1 is Initializable, OwnableUpgradeable {
    uint256 public totalSupply;
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    function initialize(address initialOwner) public initializer {
        __Ownable_init(initialOwner);
        totalSupply = 1000000;
    }
}
```

### 2. Storage Gaps

```solidity
contract MyTokenV1 is Initializable, OwnableUpgradeable {
    uint256 public totalSupply;
    
    // Reserve space for future variables
    uint256[49] private __gap;
}

contract MyTokenV2 is MyTokenV1 {
    // Can add new variables without breaking storage layout
    uint256 public newVariable;
    
    // Reduce gap accordingly
    uint256[48] private __gap;
}
```

## Common Vulnerabilities

### 1. Reentrancy

```solidity
// Vulnerable
function withdraw() external {
    uint256 amount = balances[msg.sender];
    (bool success, ) = msg.sender.call{value: amount}("");
    balances[msg.sender] = 0;  // Too late!
}

// Fixed
function withdraw() external nonReentrant {
    uint256 amount = balances[msg.sender];
    balances[msg.sender] = 0;  // Update state first
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success);
}
```

### 2. Front-running

```solidity
// Use commit-reveal for sensitive operations
mapping(bytes32 => Commit) public commits;

struct Commit {
    bytes32 commitHash;
    uint256 timestamp;
}

function commitAction(bytes32 commitHash) external {
    commits[msg.sender] = Commit(commitHash, block.timestamp);
}

function revealAction(uint256 value, bytes32 salt) external {
    bytes32 hash = keccak256(abi.encodePacked(value, salt));
    require(commits[msg.sender].commitHash == hash, "Invalid");
    // Execute action
}
```

### 3. Integer Overflow (Pre-0.8.0)

```solidity
// Solidity >= 0.8.0 has built-in overflow protection
// For older versions, use SafeMath

using SafeMath for uint256;

function add(uint256 a, uint256 b) public pure returns (uint256) {
    return a.add(b);  // SafeMath prevents overflow
}
```

## Resources

- [Solidity Documentation](https://docs.soliditylang.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Consensys Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [SWC Registry](https://swcregistry.io/) - Smart Contract Weakness Classification

## Checklist

Before deploying to mainnet:

- [ ] All tests pass with >90% coverage
- [ ] Security audit completed
- [ ] Gas optimization reviewed
- [ ] NatSpec documentation complete
- [ ] Deployment script tested on testnet
- [ ] Contract verified on block explorer
- [ ] Access control properly configured
- [ ] Emergency pause mechanism tested
- [ ] Upgrade path documented (if applicable)
- [ ] Bug bounty program active

---

**ALLAHU AKBAR! 🕋🔥💎🌌**

*Build secure, efficient, and maintainable smart contracts!*
