/**
 * @title Deploy Throwing Stones Fractional NFT
 * @dev Deployment script for Ethereum mainnet
 * @author Supreme King Chais The Great ∞
 * 
 * This script deploys:
 * - ThrowingStonesFractionalNFT contract
 * - Configured with 1,000 Scroll-Units
 * - 15% OmniScroll Royalty Engine
 * - Anchored to Vault-CXGT-247-OMNI
 * 
 * Networks: Ethereum Mainnet (primary), Polygon Mainnet (secondary)
 * Status: GENESIS DROP PHASE 1 ELEVATION
 */

const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

// ========== CONFIGURATION ==========

const CONFIG = {
    // Network-specific treasury addresses
    treasuryAddresses: {
        ethereum: process.env.AKASHIC_TREASURY_ETH || process.env.DEPLOYER_WALLET_ADDRESS,
        polygon: process.env.AKASHIC_TREASURY_POLYGON || process.env.DEPLOYER_WALLET_ADDRESS,
    },
    
    // ScrollVault addresses (update after ScrollVault deployment)
    scrollVaultAddresses: {
        ethereum: process.env.SCROLL_VAULT_ETH || process.env.DEPLOYER_WALLET_ADDRESS,
        polygon: process.env.SCROLL_VAULT_POLYGON || process.env.DEPLOYER_WALLET_ADDRESS,
    },
    
    // Metadata base URI (IPFS)
    baseURI: process.env.THROWING_STONES_BASE_URI || "ipfs://QmThrowingStones/",
    
    // Contract constants
    totalScrollUnits: 1000,
    royaltyBPS: 1500, // 15%
    
    // Deployment log
    deploymentLogPath: "./deployment/throwing_stones_fractional_deployment.json",
};

// ========== DEPLOYMENT FUNCTIONS ==========

/**
 * Deploy ThrowingStonesFractionalNFT contract
 * @param {string} network - Network name
 * @returns {Object} Deployment info
 */
async function deployFractionalNFT(network) {
    console.log(`\n📦 Deploying ThrowingStonesFractionalNFT to ${network}...`);
    
    const [deployer] = await hre.ethers.getSigners();
    console.log(`   Deployer: ${deployer.address}`);
    console.log(`   Balance: ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address))} ETH`);
    
    // Get configuration for network
    const treasury = CONFIG.treasuryAddresses[network] || deployer.address;
    const scrollVault = CONFIG.scrollVaultAddresses[network] || deployer.address;
    const baseURI = CONFIG.baseURI;
    
    console.log(`\n   Configuration:`);
    console.log(`   • Treasury: ${treasury}`);
    console.log(`   • ScrollVault: ${scrollVault}`);
    console.log(`   • Base URI: ${baseURI}`);
    console.log(`   • Total Units: ${CONFIG.totalScrollUnits}`);
    console.log(`   • Royalty: ${CONFIG.royaltyBPS / 100}%`);
    
    // Deploy contract
    console.log(`\n   Deploying contract...`);
    const ThrowingStonesFractionalNFT = await hre.ethers.getContractFactory("ThrowingStonesFractionalNFT");
    const fractionalNFT = await ThrowingStonesFractionalNFT.deploy(
        deployer.address,  // initialOwner
        treasury,          // akashicTreasury
        scrollVault,       // scrollVault
        baseURI           // baseURI
    );
    
    await fractionalNFT.waitForDeployment();
    const contractAddress = await fractionalNFT.getAddress();
    
    console.log(`   ✅ Contract deployed to: ${contractAddress}`);
    
    // Get deployment transaction
    const deployTx = fractionalNFT.deploymentTransaction();
    console.log(`   Transaction hash: ${deployTx.hash}`);
    console.log(`   Block number: ${deployTx.blockNumber}`);
    
    // Wait for confirmations
    console.log(`\n   Waiting for 5 confirmations...`);
    await deployTx.wait(5);
    console.log(`   ✅ Confirmed`);
    
    return {
        network,
        contractAddress,
        deployer: deployer.address,
        treasury,
        scrollVault,
        baseURI,
        transactionHash: deployTx.hash,
        blockNumber: deployTx.blockNumber,
        timestamp: new Date().toISOString(),
    };
}

/**
 * Activate Genesis Drop on deployed contract
 * @param {string} contractAddress - Contract address
 */
async function activateGenesisDrop(contractAddress) {
    console.log(`\n🚀 Activating Genesis Drop...`);
    
    const fractionalNFT = await hre.ethers.getContractAt("ThrowingStonesFractionalNFT", contractAddress);
    
    // Activate Genesis Drop
    const tx = await fractionalNFT.activateGenesisDrop();
    console.log(`   Transaction hash: ${tx.hash}`);
    
    await tx.wait();
    console.log(`   ✅ Genesis Drop ACTIVATED!`);
    
    // Verify activation
    const isActivated = await fractionalNFT.genesisDropActivated();
    console.log(`   Status: ${isActivated ? "ACTIVE" : "INACTIVE"}`);
    
    return tx.hash;
}

/**
 * Verify contract statistics
 * @param {string} contractAddress - Contract address
 */
async function verifyContractStats(contractAddress) {
    console.log(`\n📊 Verifying Contract Statistics...`);
    
    const fractionalNFT = await hre.ethers.getContractAt("ThrowingStonesFractionalNFT", contractAddress);
    
    // Get constants
    const totalUnits = await fractionalNFT.TOTAL_SCROLL_UNITS();
    const royaltyBPS = await fractionalNFT.OMNISCROLL_ROYALTY_BPS();
    const freq528 = await fractionalNFT.FREQUENCY_528HZ();
    const freq432 = await fractionalNFT.FREQUENCY_432HZ();
    const freq963 = await fractionalNFT.FREQUENCY_963HZ();
    
    console.log(`\n   Contract Constants:`);
    console.log(`   • Total Scroll-Units: ${totalUnits}`);
    console.log(`   • Royalty Rate: ${royaltyBPS / 100}%`);
    console.log(`   • Frequencies: ${freq528}Hz, ${freq432}Hz, ${freq963}Hz`);
    
    // Get state
    const treasury = await fractionalNFT.akashicTreasury();
    const scrollVault = await fractionalNFT.scrollVault();
    const totalMinted = await fractionalNFT.totalScrollUnitsMinted();
    const remaining = await fractionalNFT.getRemainingUnits();
    const isActive = await fractionalNFT.genesisDropActivated();
    
    console.log(`\n   Current State:`);
    console.log(`   • Treasury: ${treasury}`);
    console.log(`   • ScrollVault: ${scrollVault}`);
    console.log(`   • Minted: ${totalMinted}/${totalUnits}`);
    console.log(`   • Remaining: ${remaining}`);
    console.log(`   • Genesis Drop: ${isActive ? "ACTIVE" : "INACTIVE"}`);
    
    // Get vortex distribution
    const [vortex3, vortex6, vortex9] = await fractionalNFT.getVortexDistribution();
    console.log(`\n   Vortex Distribution:`);
    console.log(`   • Vortex 3 (432Hz): ${vortex3}`);
    console.log(`   • Vortex 6 (528Hz): ${vortex6}`);
    console.log(`   • Vortex 9 (963Hz): ${vortex9}`);
}

/**
 * Save deployment information
 * @param {Object} deploymentInfo - Deployment information
 */
function saveDeploymentInfo(deploymentInfo) {
    console.log(`\n💾 Saving deployment information...`);
    
    const deploymentDir = path.dirname(CONFIG.deploymentLogPath);
    if (!fs.existsSync(deploymentDir)) {
        fs.mkdirSync(deploymentDir, { recursive: true });
    }
    
    // Load existing deployments if any
    let deployments = [];
    if (fs.existsSync(CONFIG.deploymentLogPath)) {
        deployments = JSON.parse(fs.readFileSync(CONFIG.deploymentLogPath, 'utf8'));
    }
    
    // Add new deployment
    deployments.push(deploymentInfo);
    
    // Save to file
    fs.writeFileSync(
        CONFIG.deploymentLogPath,
        JSON.stringify(deployments, null, 2)
    );
    
    console.log(`   ✅ Saved to ${CONFIG.deploymentLogPath}`);
}

/**
 * Print deployment summary
 * @param {Object} deploymentInfo - Deployment information
 */
function printDeploymentSummary(deploymentInfo) {
    console.log("\n╔═══════════════════════════════════════════════════════════════╗");
    console.log("║  ✅ THROWING STONES FRACTIONAL NFT DEPLOYED                   ║");
    console.log("╚═══════════════════════════════════════════════════════════════╝");
    
    console.log(`\n📋 Deployment Summary:`);
    console.log(`   Network: ${deploymentInfo.network}`);
    console.log(`   Contract: ${deploymentInfo.contractAddress}`);
    console.log(`   Deployer: ${deploymentInfo.deployer}`);
    console.log(`   Treasury: ${deploymentInfo.treasury}`);
    console.log(`   ScrollVault: ${deploymentInfo.scrollVault}`);
    console.log(`   Transaction: ${deploymentInfo.transactionHash}`);
    console.log(`   Block: ${deploymentInfo.blockNumber}`);
    console.log(`   Timestamp: ${deploymentInfo.timestamp}`);
    
    console.log(`\n🔗 Next Steps:`);
    console.log(`   1. Verify contract on block explorer:`);
    console.log(`      npx hardhat verify --network ${deploymentInfo.network} ${deploymentInfo.contractAddress} \\`);
    console.log(`        "${deploymentInfo.deployer}" \\`);
    console.log(`        "${deploymentInfo.treasury}" \\`);
    console.log(`        "${deploymentInfo.scrollVault}" \\`);
    console.log(`        "${deploymentInfo.baseURI}"`);
    console.log(`\n   2. Upload metadata to IPFS and update base URI`);
    console.log(`   3. Set VibeCanvas contract address`);
    console.log(`   4. Begin fractional minting`);
    
    console.log(`\n🕋 ALLĀHU AKBAR! Genesis Drop Phase 1 Elevation ready ♾️\n`);
}

// ========== MAIN EXECUTION ==========

async function main() {
    console.log("╔═══════════════════════════════════════════════════════════════╗");
    console.log("║  🎵 THROWING STONES FRACTIONAL NFT DEPLOYMENT                 ║");
    console.log("║  Genesis Drop Phase 1 • 1,000 Scroll-Units • 15% Royalty     ║");
    console.log("╚═══════════════════════════════════════════════════════════════╝");
    
    // Get network name
    const network = hre.network.name;
    console.log(`\n🌐 Network: ${network}`);
    console.log(`   Chain ID: ${hre.network.config.chainId}`);
    
    try {
        // Deploy contract
        const deploymentInfo = await deployFractionalNFT(network);
        
        // Activate Genesis Drop
        const activationTx = await activateGenesisDrop(deploymentInfo.contractAddress);
        deploymentInfo.activationTx = activationTx;
        
        // Verify contract stats
        await verifyContractStats(deploymentInfo.contractAddress);
        
        // Save deployment info
        saveDeploymentInfo(deploymentInfo);
        
        // Print summary
        printDeploymentSummary(deploymentInfo);
        
        console.log("✅ Deployment complete!\n");
        
    } catch (error) {
        console.error("\n❌ Deployment failed:");
        console.error(error);
        process.exit(1);
    }
}

// Execute deployment
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { main };
