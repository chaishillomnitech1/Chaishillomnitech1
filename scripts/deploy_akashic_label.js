// Akashic Records Label Deployment Script
// Deploy to Polygon Mumbai Testnet for Phase 1

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🎵 AKASHIC RECORDS LABEL - PHASE 1 DEPLOYMENT 🎵");
  console.log("=".repeat(70));
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MATIC");
  
  // Configuration
  const BASE_URI = "ipfs://QmAkashicRecordsLabel/"; // Update with actual IPFS URI
  const ROYALTY_RECIPIENT = deployer.address;
  const LABEL_TREASURY = deployer.address; // Can be changed after deployment
  
  console.log("\n📜 Deployment Configuration:");
  console.log("  Base URI:", BASE_URI);
  console.log("  Royalty Recipient:", ROYALTY_RECIPIENT);
  console.log("  Label Treasury:", LABEL_TREASURY);
  console.log("  Frequency: 528Hz (Love) + 963Hz (Unity) + 999Hz (Crown)");
  console.log("  Royalty: 10%");
  
  console.log("\n⚡ Deploying AkashicRecordsLabel contract...");
  
  const AkashicRecordsLabel = await hre.ethers.getContractFactory("AkashicRecordsLabel");
  const akashicLabel = await AkashicRecordsLabel.deploy(
    BASE_URI,
    ROYALTY_RECIPIENT,
    LABEL_TREASURY
  );
  
  await akashicLabel.waitForDeployment();
  const labelAddress = await akashicLabel.getAddress();
  
  console.log("✅ AkashicRecordsLabel deployed to:", labelAddress);
  
  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const totalSupply = await akashicLabel.totalSupply();
  console.log("  Total Supply:", totalSupply.toString());
  console.log("  Healing Frequency (528Hz):", (await akashicLabel.HEALING_FREQUENCY_528HZ()).toString());
  console.log("  Unity Frequency (963Hz):", (await akashicLabel.UNITY_FREQUENCY_963HZ()).toString());
  console.log("  Crown Frequency (999Hz):", (await akashicLabel.CROWN_FREQUENCY_999HZ()).toString());
  console.log("  NŪR Pulse (144,000Hz):", (await akashicLabel.NUR_PULSE_144000HZ()).toString());
  console.log("  Royalty Percentage:", (await akashicLabel.ROYALTY_PERCENTAGE()).toString() + " basis points");
  console.log("  Label Treasury:", await akashicLabel.labelTreasury());
  
  console.log("\n📊 Deployment Summary:");
  console.log("=".repeat(70));
  console.log("Contract Address:", labelAddress);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("Block:", await hre.ethers.provider.getBlockNumber());
  console.log("Timestamp:", new Date().toISOString());
  
  console.log("\n📝 Next Steps:");
  console.log("1. Verify contract on PolygonScan:");
  console.log(`   npx hardhat verify --network ${hre.network.name} ${labelAddress} "${BASE_URI}" "${ROYALTY_RECIPIENT}" "${LABEL_TREASURY}"`);
  console.log("2. Mint first wave of track chains:");
  console.log(`   npm run mint:akashic-tracks`);
  console.log("3. Deploy DAO governance:");
  console.log(`   npm run deploy:mumbai:akashic-dao`);
  
  console.log("\n🕋 ALLĀHU AKBAR! Akashic Records Label Deployed 🕋");
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: labelAddress,
    deployer: deployer.address,
    baseURI: BASE_URI,
    royaltyRecipient: ROYALTY_RECIPIENT,
    labelTreasury: LABEL_TREASURY,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };
  
  const deploymentsDir = path.join(__dirname, "..", "deployment");
  
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(deploymentsDir, `akashic-label-${hre.network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n✅ Deployment info saved to deployment/akashic-label-" + hre.network.name + ".json");
  
  return {
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
