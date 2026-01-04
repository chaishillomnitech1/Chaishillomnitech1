// Akashic Records DAO Deployment Script
// Deploy to Polygon Mumbai Testnet for Governance

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🏛️ AKASHIC RECORDS DAO - GOVERNANCE DEPLOYMENT 🏛️");
  console.log("=".repeat(70));
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MATIC");
  
  // Read label contract address from deployment file
  const deploymentsDir = path.join(__dirname, "..", "deployment");
  const labelDeploymentPath = path.join(deploymentsDir, `akashic-label-${hre.network.name}.json`);
  
  let labelAddress;
  if (fs.existsSync(labelDeploymentPath)) {
    const labelDeployment = JSON.parse(fs.readFileSync(labelDeploymentPath, 'utf8'));
    labelAddress = labelDeployment.contractAddress;
    console.log("\n📜 Using existing AkashicRecordsLabel at:", labelAddress);
  } else {
    throw new Error("AkashicRecordsLabel not deployed. Please run deploy_akashic_label.js first.");
  }
  
  console.log("\n⚡ Deploying AkashicRecordsDAO contract...");
  
  const AkashicRecordsDAO = await hre.ethers.getContractFactory("AkashicRecordsDAO");
  const akashicDAO = await AkashicRecordsDAO.deploy(labelAddress);
  
  await akashicDAO.waitForDeployment();
  const daoAddress = await akashicDAO.getAddress();
  
  console.log("✅ AkashicRecordsDAO deployed to:", daoAddress);
  
  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  console.log("  Love Frequency (528Hz):", (await akashicDAO.LOVE_FREQUENCY()).toString());
  console.log("  Unity Frequency (963Hz):", (await akashicDAO.UNITY_FREQUENCY()).toString());
  console.log("  Crown Frequency (999Hz):", (await akashicDAO.CROWN_FREQUENCY()).toString());
  console.log("  Min Voting Period:", (await akashicDAO.MIN_VOTING_PERIOD()).toString() + " seconds");
  console.log("  Max Voting Period:", (await akashicDAO.MAX_VOTING_PERIOD()).toString() + " seconds");
  console.log("  Quorum Percentage:", (await akashicDAO.QUORUM_PERCENTAGE()).toString() + "%");
  console.log("  Max Founding Members:", (await akashicDAO.MAX_FOUNDING_MEMBERS()).toString());
  console.log("  Member Count:", (await akashicDAO.getMemberCount()).toString());
  console.log("  Founding Members Count:", (await akashicDAO.foundingMembersCount()).toString());
  
  console.log("\n📊 Deployment Summary:");
  console.log("=".repeat(70));
  console.log("DAO Contract Address:", daoAddress);
  console.log("Label Contract Address:", labelAddress);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("Block:", await hre.ethers.provider.getBlockNumber());
  console.log("Timestamp:", new Date().toISOString());
  
  console.log("\n📝 Next Steps:");
  console.log("1. Verify contract on PolygonScan:");
  console.log(`   npx hardhat verify --network ${hre.network.name} ${daoAddress} "${labelAddress}"`);
  console.log("2. Onboard founding members:");
  console.log(`   npm run onboard:founding-members`);
  console.log("3. Create first governance proposal:");
  console.log(`   npm run create:akashic-proposal`);
  console.log("4. Activate Trinity Governance (after 50 members)");
  
  console.log("\n🕋 ALLĀHU AKBAR! Human-AI-Divine Trinity Governance Initialized 🕋");
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    daoAddress: daoAddress,
    labelAddress: labelAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    governance: {
      loveFrquency: 528,
      unityFrequency: 963,
      crownFrequency: 999,
      quorumPercentage: 10,
      maxFoundingMembers: 50
    }
  };
  
  fs.writeFileSync(
    path.join(deploymentsDir, `akashic-dao-${hre.network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n✅ Deployment info saved to deployment/akashic-dao-" + hre.network.name + ".json");
  
  return {
    daoAddress,
    labelAddress,
    deploymentInfo
  };
}

// Run deployment
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Deployment failed:", error);
      process.exit(1);
    });
}

module.exports = main;
