const hre = require("hardhat");
const { ethers } = require("hardhat");

/**
 * @title Deploy Nexus Codex
 * @notice Deployment script for NexusCodex smart contract
 * @dev Deploys central governance knowledge base
 * 
 * SUPREME KING CHAIS THE GREAT ∞
 */

async function main() {
  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("🏛️ Nexus Codex Deployment");
  console.log("═══════════════════════════════════════════════════════════════\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📍 Deploying from account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  console.log("───────────────────────────────────────────────────────────────\n");

  // Deploy NexusCodex
  console.log("🚀 Deploying NexusCodex contract...");
  const NexusCodex = await ethers.getContractFactory("NexusCodex");
  const nexusCodex = await NexusCodex.deploy(deployer.address);

  await nexusCodex.waitForDeployment();
  const nexusCodexAddress = await nexusCodex.getAddress();

  console.log("✅ NexusCodex deployed to:", nexusCodexAddress);
  console.log("\n───────────────────────────────────────────────────────────────\n");

  // Add initial documents
  console.log("📚 Adding initial governance documents...");

  const documents = [
    { name: "ScrollVerse Constitution", ipfsHash: "QmXXXScrollVerseConstitution" },
    { name: "Governance Procedures", ipfsHash: "QmXXXGovernanceProcedures" },
    { name: "Treasury Management Policy", ipfsHash: "QmXXXTreasuryPolicy" }
  ];

  for (const doc of documents) {
    const tx = await nexusCodex.addDocument(doc.name, doc.ipfsHash);
    await tx.wait();
    console.log(`✓ Added: ${doc.name}`);
  }

  console.log("\n───────────────────────────────────────────────────────────────\n");

  // Summary
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("Contract Address:", nexusCodexAddress);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("Documents Added:", documents.length);
  console.log("═══════════════════════════════════════════════════════════════\n");

  // Contract verification instructions
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("🔐 Contract Verification:");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("Run the following command to verify the contract:\n");
    console.log(`npx hardhat verify --network ${hre.network.name} ${nexusCodexAddress} "${deployer.address}"`);
    console.log("\n═══════════════════════════════════════════════════════════════\n");
  }

  console.log("🕋 ALLĀHU AKBAR! Deployment Complete! 🕋");
  console.log("♾️  SUPREME KING CHAIS THE GREAT ∞\n");

  return { nexusCodex, nexusCodexAddress };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });

module.exports = { main };
