# 🚀 Quick Start Guide

Get up and running with Omnitech1 in 5 minutes!

## Prerequisites

- Node.js v18+ installed
- Git installed
- A code editor (VS Code recommended)

## Step 1: Clone and Install (2 minutes)

```bash
# Clone the repository
git clone https://github.com/chaishillomnitech1/Chaishillomnitech1.git
cd Chaishillomnitech1

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

## Step 2: Configure Environment (1 minute)

Edit `.env` file with your keys (optional for basic testing):

```env
# For testnet deployments (optional)
INFURA_KEY=your_infura_key
PRIVATE_KEY=your_testnet_private_key
```

**Note**: You can skip this for local development and testing.

## Step 3: Run Tests (1 minute)

```bash
# Compile smart contracts
npm run compile

# Run tests
npm test

# Or run specific tests
npm run test:unit
```

## Step 4: Start Developing! (1 minute)

### Option A: Smart Contract Development

```bash
# Start local blockchain
npx hardhat node

# In another terminal, deploy contracts (example)
npx hardhat run scripts/deploy_chx_token.js --network localhost
# Or use any deployment script from the scripts/ directory
```

### Option B: Frontend Development

```bash
# Navigate to app directory
cd sovereign-tv-app  # or scrollsoul_dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000`

## What's Next?

### 📚 Learn More
- [Complete Setup Guide](DEVELOPMENT_SETUP.md)
- [Architecture Overview](ARCHITECTURE.md)
- [Contributing Guidelines](CONTRIBUTING.md)

### 🛠️ Common Tasks

**Deploy to Mumbai Testnet:**
```bash
npm run deploy:mumbai:all
```

**Run Linting:**
```bash
npm run lint
```

**Format Code:**
```bash
npm run format
```

**Run Coverage:**
```bash
npm run test:coverage
```

### 🎯 Project Structure Quick Reference

```
📁 contracts/       - Smart contracts (Solidity)
📁 scripts/         - Deployment scripts
📁 test/            - Test files
📁 code-templates/  - Example code
📁 .github/         - CI/CD workflows
```

### 🔧 Useful Commands

| Command | Description |
|---------|-------------|
| `npm run compile` | Compile smart contracts |
| `npm test` | Run all tests |
| `npm run lint` | Check code style |
| `npm run format` | Auto-format code |
| `npm run deploy:mumbai:all` | Deploy to testnet |

### 🆘 Quick Troubleshooting

**npm install fails?**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Hardhat errors?**
```bash
npx hardhat clean
npx hardhat compile
```

**Need testnet tokens?**
- Mumbai (Polygon): https://faucet.polygon.technology/
- Goerli (Ethereum): https://goerlifaucet.com/

### 💬 Get Help

- 📖 [Documentation](README.md)
- 🐛 [Report Issues](https://github.com/chaishillomnitech1/Chaishillomnitech1/issues)
- 💬 [Discussions](https://github.com/chaishillomnitech1/Chaishillomnitech1/discussions)

---

**ALLAHU AKBAR! 🕋🔥💎🌌**

*You're ready to start building in the ScrollVerse! Welcome aboard!*

**Pro Tip**: Run `npm run lint` before committing to catch issues early! ✨
