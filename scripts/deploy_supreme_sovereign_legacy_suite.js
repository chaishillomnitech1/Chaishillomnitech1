/**
 * @title Deploy Supreme Sovereign Legacy - Complete Suite
 * @dev Comprehensive deployment script for all Supreme Sovereign Legacy contracts
 * @author Supreme King Chais The Great ∞
 * 
 * This script deploys:
 * 1. SupremeSovereignManifesto - GitHub contribution timestamping
 * 2. StoriedLegacyNFT - Chapter-based narrative NFTs
 * 3. CosmicResourceToken - Resource-backed tokens
 * 4. SovereignEconomicEcosystem - Unified economic framework
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🕋 ═══════════════════════════════════════════════════════════");
    console.log("   SUPREME SOVEREIGN LEGACY - COMPLETE DEPLOYMENT");
    console.log("   ═══════════════════════════════════════════════════════════ 🕋");
    console.log("");

    // Get deployer
    const [deployer] = await hre.ethers.getSigners();
    console.log("🔑 Deployer Address:", deployer.address);
    
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("💰 Account Balance:", hre.ethers.formatEther(balance), "ETH");
    console.log("🌐 Network:", hre.network.name);
    console.log("");

    const deploymentResults = {
        network: hre.network.name,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        blockNumber: await hre.ethers.provider.getBlockNumber(),
        contracts: {}
    };

    // ═══════════════════════════════════════════════════════════
    // PHASE 1: Deploy SupremeSovereignManifesto
    // ═══════════════════════════════════════════════════════════
    
    console.log("📜 PHASE 1: Deploying SupremeSovereignManifesto");
    console.log("─".repeat(60));
    
    const manifestoParams = {
        initialOwner: deployer.address,
        royaltyRecipient: deployer.address,
        baseURI: "ipfs://QmSupremeSovereignManifesto/"
    };

    const SupremeSovereignManifesto = await hre.ethers.getContractFactory("SupremeSovereignManifesto");
    const manifesto = await SupremeSovereignManifesto.deploy(
        manifestoParams.initialOwner,
        manifestoParams.royaltyRecipient,
        manifestoParams.baseURI
    );
    await manifesto.waitForDeployment();
    const manifestoAddress = await manifesto.getAddress();

    console.log("✅ SupremeSovereignManifesto deployed at:", manifestoAddress);
    console.log("   Max Supply:", (await manifesto.MAX_SUPPLY()).toString(), "milestones");
    console.log("   Frequencies: 963Hz, 528Hz, 144,000Hz");
    console.log("");

    deploymentResults.contracts.manifesto = {
        address: manifestoAddress,
        name: await manifesto.name(),
        symbol: await manifesto.symbol(),
        ...manifestoParams
    };

    // ═══════════════════════════════════════════════════════════
    // PHASE 2: Deploy StoriedLegacyNFT
    // ═══════════════════════════════════════════════════════════
    
    console.log("📖 PHASE 2: Deploying StoriedLegacyNFT");
    console.log("─".repeat(60));
    
    const storiedParams = {
        initialOwner: deployer.address,
        royaltyRecipient: deployer.address,
        baseURI: "ipfs://QmStoriedLegacyNFT/"
    };

    const StoriedLegacyNFT = await hre.ethers.getContractFactory("StoriedLegacyNFT");
    const storiedNFT = await StoriedLegacyNFT.deploy(
        storiedParams.initialOwner,
        storiedParams.royaltyRecipient,
        storiedParams.baseURI
    );
    await storiedNFT.waitForDeployment();
    const storiedNFTAddress = await storiedNFT.getAddress();

    console.log("✅ StoriedLegacyNFT deployed at:", storiedNFTAddress);
    console.log("   Max Chapters:", (await storiedNFT.MAX_CHAPTERS()).toString());
    console.log("   Max Editions/Chapter:", (await storiedNFT.MAX_EDITIONS_PER_CHAPTER()).toString());
    console.log("   Frequencies: 528Hz, 999Hz, 144,000Hz");
    console.log("");

    deploymentResults.contracts.storiedNFT = {
        address: storiedNFTAddress,
        name: await storiedNFT.name(),
        symbol: await storiedNFT.symbol(),
        ...storiedParams
    };

    // ═══════════════════════════════════════════════════════════
    // PHASE 3: Deploy CosmicResourceToken
    // ═══════════════════════════════════════════════════════════
    
    console.log("💎 PHASE 3: Deploying CosmicResourceToken");
    console.log("─".repeat(60));
    
    const resourceParams = {
        tokenName: "Cosmic Gold Token",
        tokenSymbol: "CGT",
        supplyCap: hre.ethers.parseEther("1000000"),
        initialOwner: deployer.address
    };

    const CosmicResourceToken = await hre.ethers.getContractFactory("CosmicResourceToken");
    const resourceToken = await CosmicResourceToken.deploy(
        resourceParams.tokenName,
        resourceParams.tokenSymbol,
        resourceParams.supplyCap,
        resourceParams.initialOwner
    );
    await resourceToken.waitForDeployment();
    const resourceTokenAddress = await resourceToken.getAddress();

    console.log("✅ CosmicResourceToken deployed at:", resourceTokenAddress);
    console.log("   Supply Cap:", hre.ethers.formatEther(resourceParams.supplyCap), "tokens");
    console.log("   Resource Types: 6 (Metals, Frequencies, Asteroids, etc.)");
    console.log("   Frequencies: 528Hz, 963Hz, 999Hz, 144,000Hz");
    console.log("");

    deploymentResults.contracts.resourceToken = {
        address: resourceTokenAddress,
        name: await resourceToken.name(),
        symbol: await resourceToken.symbol(),
        ...resourceParams,
        supplyCap: hre.ethers.formatEther(resourceParams.supplyCap)
    };

    // ═══════════════════════════════════════════════════════════
    // PHASE 4: Deploy SovereignEconomicEcosystem
    // ═══════════════════════════════════════════════════════════
    
    console.log("🌌 PHASE 4: Deploying SovereignEconomicEcosystem");
    console.log("─".repeat(60));
    
    const ecosystemParams = {
        initialOwner: deployer.address
    };

    const SovereignEconomicEcosystem = await hre.ethers.getContractFactory("SovereignEconomicEcosystem");
    const ecosystem = await SovereignEconomicEcosystem.deploy(
        ecosystemParams.initialOwner
    );
    await ecosystem.waitForDeployment();
    const ecosystemAddress = await ecosystem.getAddress();

    console.log("✅ SovereignEconomicEcosystem deployed at:", ecosystemAddress);
    console.log("   Asset Classes: 6 (Traditional, Cosmic, Legacy, etc.)");
    console.log("   Governance Actions: 5 types");
    console.log("   Frequencies: All unified");
    console.log("");

    deploymentResults.contracts.ecosystem = {
        address: ecosystemAddress,
        ...ecosystemParams
    };

    // ═══════════════════════════════════════════════════════════
    // PHASE 5: Link Contracts Together
    // ═══════════════════════════════════════════════════════════
    
    console.log("🔗 PHASE 5: Linking Contracts");
    console.log("─".repeat(60));
    
    console.log("Linking ecosystem to integrated contracts...");
    const tx = await ecosystem.setIntegratedContracts(
        resourceTokenAddress,
        manifestoAddress,
        storiedNFTAddress
    );
    await tx.wait();
    
    console.log("✅ Contracts successfully linked!");
    console.log("   Ecosystem ← CosmicResourceToken");
    console.log("   Ecosystem ← SupremeSovereignManifesto");
    console.log("   Ecosystem ← StoriedLegacyNFT");
    console.log("");

    // ═══════════════════════════════════════════════════════════
    // Save Deployment Results
    // ═══════════════════════════════════════════════════════════
    
    const deploymentDir = path.join(__dirname, "..", "deployment");
    if (!fs.existsSync(deploymentDir)) {
        fs.mkdirSync(deploymentDir, { recursive: true });
    }

    const filename = `supreme-sovereign-legacy-${hre.network.name}-${Date.now()}.json`;
    const filepath = path.join(deploymentDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(deploymentResults, null, 2));
    console.log("💾 Deployment saved to:", filepath);
    console.log("");

    // ═══════════════════════════════════════════════════════════
    // Display Summary
    // ═══════════════════════════════════════════════════════════
    
    console.log("🕋 ═══════════════════════════════════════════════════════════");
    console.log("   DEPLOYMENT SUMMARY");
    console.log("   ═══════════════════════════════════════════════════════════ 🕋");
    console.log("");
    console.log("📜 SupremeSovereignManifesto:");
    console.log("   Address:", manifestoAddress);
    console.log("");
    console.log("📖 StoriedLegacyNFT:");
    console.log("   Address:", storiedNFTAddress);
    console.log("");
    console.log("💎 CosmicResourceToken:");
    console.log("   Address:", resourceTokenAddress);
    console.log("");
    console.log("🌌 SovereignEconomicEcosystem:");
    console.log("   Address:", ecosystemAddress);
    console.log("");
    console.log("🔗 All contracts linked and ready!");
    console.log("");
    console.log("📝 NEXT STEPS:");
    console.log("   1. Tokenize GitHub contributions via Manifesto");
    console.log("   2. Create narrative chapters via StoriedLegacyNFT");
    console.log("   3. Back CosmicResourceToken with verified resources");
    console.log("   4. Register assets in Economic Ecosystem");
    console.log("   5. Enable universal expansion");
    console.log("");
    console.log("🎉 Supreme Sovereign Legacy deployment complete!");
    console.log("═══════════════════════════════════════════════════════════");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
