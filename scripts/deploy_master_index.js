/**
 * @title Master Index Deployment Script
 * @notice Deploys the MasterIndex smart contract for universal knowledge vault searchability
 * 
 * **SUPREME KING CHAIS THE GREAT ∞ — OMNISOVEREIGN ARCHITECT**
 * 
 * Frequency: 963Hz + 528Hz + 999Hz + 144,000Hz
 * Classification: OMNISOVEREIGN DEPLOYMENT
 * Status: ACTIVE
 */

const hre = require("hardhat");

async function main() {
    console.log("🕋 MASTER INDEX DEPLOYMENT INITIATED 🕋");
    console.log("=" .repeat(60));
    console.log("");
    
    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("📡 Deploying from account:", deployer.address);
    
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");
    console.log("");
    
    // Deploy MasterIndex contract
    console.log("🚀 Deploying MasterIndex contract...");
    const MasterIndex = await hre.ethers.getContractFactory("MasterIndex");
    const masterIndex = await MasterIndex.deploy(deployer.address);
    
    await masterIndex.waitForDeployment();
    const masterIndexAddress = await masterIndex.getAddress();
    
    console.log("✅ MasterIndex deployed to:", masterIndexAddress);
    console.log("");
    
    // Verify deployment
    console.log("🔍 Verifying deployment...");
    const documentCount = await masterIndex.documentCount();
    const categoryCount = await masterIndex.categoryCount();
    
    console.log("📊 Initial State:");
    console.log("  - Document Count:", documentCount.toString());
    console.log("  - Category Count:", categoryCount.toString());
    console.log("  - Owner:", await masterIndex.owner());
    console.log("");
    
    // Create initial categories
    console.log("📁 Creating initial categories...");
    
    const categories = [
        {
            name: "Sacred Protocols",
            description: "Divine operating procedures and sacred frameworks"
        },
        {
            name: "Smart Contracts",
            description: "Blockchain contracts and token systems"
        },
        {
            name: "Documentation",
            description: "Technical documentation and guides"
        },
        {
            name: "Transmissions",
            description: "Divine transmissions and eternal records"
        },
        {
            name: "Deployment Guides",
            description: "Deployment and integration specifications"
        },
        {
            name: "Sacred Symbols",
            description: "Frequency encodings and divine signatures"
        },
        {
            name: "Media Integration",
            description: "Multimedia and broadcast systems"
        },
        {
            name: "NFT Collections",
            description: "Non-fungible token specifications and metadata"
        },
        {
            name: "AI Integration",
            description: "Artificial intelligence systems and protocols"
        },
        {
            name: "Infinite Narrative",
            description: "Eternal story and legacy documentation"
        }
    ];
    
    for (const category of categories) {
        const tx = await masterIndex.createCategory(category.name, category.description);
        await tx.wait();
        console.log(`  ✅ Created: ${category.name}`);
    }
    
    console.log("");
    console.log("🎯 Deployment Summary");
    console.log("=" .repeat(60));
    console.log("Contract Address:", masterIndexAddress);
    console.log("Network:", hre.network.name);
    console.log("Deployer:", deployer.address);
    console.log("Categories Created:", categories.length);
    console.log("");
    
    // Save deployment info
    const deploymentInfo = {
        network: hre.network.name,
        contractAddress: masterIndexAddress,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        frequency: "963Hz + 528Hz + 999Hz + 144,000Hz",
        classification: "OMNISOVEREIGN KNOWLEDGE VAULT",
        categories: categories.map(c => c.name),
        signature: "∞ ARCHITEX ∞"
    };
    
    console.log("📜 DEPLOYMENT COMPLETE");
    console.log("=" .repeat(60));
    console.log("");
    console.log("🔥 ALLĀHU AKBAR! 🔥");
    console.log("");
    console.log("Master Index is now active for universal searchability");
    console.log("across all ScrollVerse transmissions, slides, and assets.");
    console.log("");
    console.log("∞ ARCHITEX ∞");
    console.log("");
    
    // Return deployment info for verification
    return deploymentInfo;
}

// Execute deployment
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
