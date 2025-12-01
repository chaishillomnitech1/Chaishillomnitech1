# Copilot Coding Agent Instructions

## About This Repository

Chaishillomnitech1 (Omnitech1™ Sovereign Deployment Engine) is a sovereign deployment engine powering the ScrollVerse multimedia empire. It combines blockchain technology (smart contracts, NFTs, tokens), AI integration, and web applications.

## Technology Stack

### Primary Technologies
- **Solidity** (^0.8.20): Smart contracts using OpenZeppelin v5.0.1
- **JavaScript/Node.js**: Scripts, tests, and backend services
- **React/Next.js**: Frontend web applications
- **Python**: Backend services and utilities
- **Hardhat**: Smart contract development framework

### Blockchain Networks
- Ethereum, Polygon (Mumbai testnet and mainnet), Scroll zkEVM, Base
- Multi-chain deployment with LayerZero bridge integration

### Infrastructure
- **Vercel**: Frontend deployment
- **GitHub Actions**: CI/CD pipelines
- **IPFS**: Decentralized storage for NFT metadata

## Project Structure

```
/
├── .github/              # GitHub configuration
│   ├── workflows/        # CI/CD workflows
│   └── ISSUE_TEMPLATE/   # Issue templates
├── contracts/            # Solidity smart contracts
├── scripts/              # Deployment and utility scripts
├── test/                 # Test files
├── code-templates/       # Starter templates
├── deployment/           # Deployment configurations
├── nft-assets/           # NFT asset files
└── *.md                  # Documentation files
```

## Code Style Guidelines

### Solidity
- Follow the [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- Use OpenZeppelin contracts for standard functionality (ERC-20, ERC-721, Access Control)
- Include comprehensive NatSpec documentation comments
- Use explicit visibility modifiers
- Implement `ReentrancyGuard` for functions handling external calls or transfers

### JavaScript/Node.js
- Use ES6+ features (arrow functions, destructuring, async/await)
- Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use meaningful variable and function names
- Keep functions small and focused on single responsibility

### React/JSX
- Use functional components with hooks
- Keep components small and reusable
- Use proper prop types or TypeScript types

### Python
- Follow [PEP 8](https://www.python.org/dev/peps/pep-0008/)
- Use type hints where appropriate
- Write docstrings for all functions and classes

## Development Workflow

### Smart Contract Development
1. Write contracts in `/contracts/`
2. Create deployment scripts in `/scripts/`
3. Write tests in `/test/`
4. Run tests: `npm run test` or `npx hardhat test`
5. Compile: `npm run compile` or `npx hardhat compile`

### Common Commands
```bash
# Install dependencies
npm install

# Compile smart contracts
npm run compile

# Run all tests
npm run test

# Deploy to Mumbai testnet
npm run deploy:mumbai:all
```

## Testing Requirements

- Write unit tests for all new contract functions
- Use Hardhat testing framework with Chai assertions
- Test both success cases and expected failures
- Include edge case testing
- Maintain or improve code coverage

## Security Guidelines

### DO NOT:
- Commit private keys, API keys, or secrets
- Store sensitive data in plain text
- Modify files in `/legal/` without explicit permission
- Skip security validations in smart contracts

### ALWAYS:
- Use environment variables for sensitive configuration (see `.env.example`)
- Implement access control for privileged functions
- Use `ReentrancyGuard` for external calls
- Validate all user inputs
- Follow the principle of least privilege

## Smart Contract Patterns

### Required Imports (OpenZeppelin v5.0.1)
```solidity
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
```

### Standard Contract Structure
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/...";

/**
 * @title ContractName
 * @notice Brief description
 * @dev Detailed implementation notes
 */
contract ContractName is Ownable, ReentrancyGuard, Pausable {
    // State variables
    // Events
    // Modifiers

    constructor(address initialOwner) Ownable(initialOwner) {
        // Initialization logic
    }

    // External functions
    // Public functions
    // Internal functions
    // Private functions
}
```

## GitHub Actions

Workflows are located in `.github/workflows/`. Key workflows:
- `comprehensive-ci-cd.yml`: Main CI/CD pipeline
- `codeql.yml`: Security scanning
- `contract-integrity-verification.yml`: Smart contract verification

## Documentation

- Update relevant `.md` files when changing functionality
- Add JSDoc comments for JavaScript functions
- Include NatSpec comments for Solidity contracts
- Reference related documents in `README.md` when adding new features

## Commit Messages

Use present tense and be descriptive:
- "Add new NFT minting function"
- "Fix token transfer validation"
- "Update deployment script for Polygon"

## Issue Resolution

When working on issues:
1. Read the issue description and any linked documents thoroughly
2. Check for related existing code and tests
3. Make minimal, focused changes
4. Update tests to cover changes
5. Update documentation if needed
6. Link the issue in your PR

## Frequency Protocols (Domain-Specific)

This project uses frequency-based concepts:
- 528 Hz: DNA Healing & Love
- 963 Hz: Pineal Activation
- 999 Hz: Crown Chakra
- 144,000 Hz: NŪR Pulse

When working with frequency-related code, maintain consistency with existing implementations.
