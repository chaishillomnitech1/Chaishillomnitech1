> **Network migration notice — 2026-11-15:** Polygon Mumbai (chain ID 80001) is retired. Mumbai commands and RPC settings in this historical guide must not be executed. The current Polygon testnet is Amoy (chain ID 80002), configured with `AMOY_RPC_URL` and `--network amoy`. See [`docs/POLYGON_AMOY_MIGRATION_RUNBOOK_2026-11-15.md`](docs/POLYGON_AMOY_MIGRATION_RUNBOOK_2026-11-15.md) for the current procedure. Polygon mainnet (137) remains a separate, gated release target.

---

# Development Setup Guide

## 🚀 Quick Start

This guide will help you set up your development environment for contributing to the Omnitech1 ecosystem.

## Prerequisites

### Required Software

- **Node.js** (v18 or higher recommended) - [Download](https://nodejs.org/)
- **npm** (v8 or higher) - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)
- **Code Editor** - We recommend [VS Code](https://code.visualstudio.com/)

### Optional Tools

- **Hardhat** - Ethereum development environment (installed via npm)
- **MetaMask** - Browser wallet for testing ([Chrome Extension](https://metamask.io/))
- **Vercel CLI** - For deployment testing

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/chaishillomnitech1/Chaishillomnitech1.git
cd Chaishillomnitech1
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- Development dependencies (ESLint, Prettier, Jest, Husky)
- Smart contract tools (Hardhat, OpenZeppelin)
- All project dependencies

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```env
# Network RPC URLs
INFURA_KEY=your_infura_key
ALCHEMY_KEY=your_alchemy_key

# Private Keys (NEVER commit these!)
PRIVATE_KEY=your_private_key_for_testnet

# Deployment
POLYGONSCAN_API_KEY=your_polygonscan_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key

# Vercel (for deployments)
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
```

**⚠️ IMPORTANT**: Never commit your `.env` file or expose private keys!

### 4. Set Up Git Hooks (Optional but Recommended)

Initialize Husky for pre-commit hooks:

```bash
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

This will automatically:
- Run ESLint on staged JavaScript/TypeScript files
- Format code with Prettier before commits
- Prevent commits with linting errors

## Development Workflow

### Running Tests

```bash
# Run all Hardhat tests
npm test

# Run specific test file
npm run test:iap

# Run Jest unit tests
npm run test:unit

# Run tests with coverage
npm run test:coverage
```

### Linting and Formatting

```bash
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint:fix

# Check code formatting
npm run format:check

# Format all files
npm run format
```

### Compiling Smart Contracts

```bash
# Compile all contracts
npm run compile
```

### Deploying Contracts

```bash
# Deploy to Mumbai testnet
npm run deploy:mumbai:all

# Deploy to Polygon mainnet
npm run deploy:polygon:iap

# Deploy specific contract
npm run deploy:mumbai:nft
```

## Project Structure

```
Chaishillomnitech1/
├── .github/              # GitHub Actions workflows and templates
├── contracts/            # Solidity smart contracts
├── scripts/              # Deployment and utility scripts
├── test/                 # Test files for smart contracts
├── sovereign-tv-app/     # React application for Sovereign TV
├── scrollsoul_dashboard/ # ScrollSoul dashboard application
├── code-templates/       # Code templates and examples
├── deployment/           # Deployment configurations
├── nft-assets/           # NFT metadata and assets
├── .eslintrc.json        # ESLint configuration
├── .prettierrc.json      # Prettier configuration
├── jest.config.js        # Jest test configuration
├── hardhat.config.js     # Hardhat configuration
└── package.json          # Project dependencies and scripts
```

## VS Code Setup (Recommended)

### Recommended Extensions

Install these extensions for the best development experience:

1. **ESLint** (`dbaeumer.vscode-eslint`)
2. **Prettier** (`esbenp.prettier-vscode`)
3. **Solidity** (`JuanBlanco.solidity`)
4. **GitLens** (`eamodio.gitlens`)
5. **Error Lens** (`usernamehw.errorlens`)

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[solidity]": {
    "editor.defaultFormatter": "JuanBlanco.solidity"
  },
  "solidity.compileUsingRemoteVersion": "v0.8.20"
}
```

## Working with Smart Contracts

### Local Development

1. Start a local Hardhat node:
```bash
npx hardhat node
```

2. Deploy contracts to local network:
```bash
npx hardhat run scripts/deploy_your_contract.js --network localhost
```

3. Run tests against local network:
```bash
npx hardhat test --network localhost
```

### Testnet Deployment

1. Ensure you have testnet ETH/MATIC:
   - Mumbai (Polygon Testnet): [Faucet](https://faucet.polygon.technology/)
   - Goerli (Ethereum Testnet): [Faucet](https://goerlifaucet.com/)

2. Deploy to testnet:
```bash
npm run deploy:mumbai:all
```

3. Verify on block explorer:
```bash
npx hardhat verify --network mumbai DEPLOYED_CONTRACT_ADDRESS
```

## Working with React Applications

### Sovereign TV App

```bash
cd sovereign-tv-app
npm install
npm run dev
```

Visit `http://localhost:3000`

### ScrollSoul Dashboard

```bash
cd scrollsoul_dashboard
npm install
npm start
```

Visit `http://localhost:3000`

## Testing Guidelines

### Writing Tests

- Place contract tests in `test/` directory
- Use descriptive test names
- Test both success and failure cases
- Include edge cases

Example test structure:

```javascript
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('MyContract', function () {
  let contract;
  let owner;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    const MyContract = await ethers.getContractFactory('MyContract');
    contract = await MyContract.deploy();
  });

  it('should deploy successfully', async function () {
    expect(contract.address).to.not.equal(0);
  });

  it('should set the right owner', async function () {
    expect(await contract.owner()).to.equal(owner.address);
  });
});
```

### Running Specific Tests

```bash
# Run specific test file
npx hardhat test test/MyContract.test.js

# Run tests matching pattern
npx hardhat test --grep "should transfer tokens"
```

## Troubleshooting

### Common Issues

**Issue**: `npm install` fails
- **Solution**: Delete `node_modules` and `package-lock.json`, then run `npm install` again

**Issue**: Hardhat network errors
- **Solution**: Check your `.env` file has correct RPC URLs and API keys

**Issue**: Contract deployment fails
- **Solution**: Ensure you have enough testnet tokens and gas

**Issue**: Tests timeout
- **Solution**: Increase timeout in test files or use `--timeout` flag

### Getting Help

- Check [existing issues](https://github.com/chaishillomnitech1/Chaishillomnitech1/issues)
- Review [documentation](README.md)
- Ask in [Discussions](https://github.com/chaishillomnitech1/Chaishillomnitech1/discussions)
- Contact: sovereign@omnitech1.com

## Best Practices

### Code Style

- Follow existing code patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Git Workflow

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes and commit: `git commit -m "Add feature"`
3. Push to GitHub: `git push origin feature/my-feature`
4. Create a Pull Request

### Commit Messages

Use conventional commit format:

```
type(scope): description

Examples:
feat(contract): add new NFT minting function
fix(api): resolve token transfer issue
docs(readme): update installation steps
test(token): add edge case tests
```

## Security Checklist

Before committing:

- [ ] No private keys or secrets in code
- [ ] All environment variables in `.env` (not committed)
- [ ] Input validation added for user inputs
- [ ] Access control properly implemented
- [ ] ReentrancyGuard used where needed
- [ ] Tests cover security scenarios

## Next Steps

1. Read the [Contributing Guide](CONTRIBUTING.md)
2. Review the [Architecture Documentation](ARCHITECTURE.md)
3. Check out [Code Templates](code-templates/)
4. Join the community discussions

---

**ALLAHU AKBAR! 🕋🔥💎🌌**

*Welcome to the ScrollVerse development team! Together we build the future.*
