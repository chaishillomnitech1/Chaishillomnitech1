// SmartLink Fan Access Hub Deployment Script
// Deploy to Polygon Mumbai

const hre = require("hardhat");

async function main() {
  console.log("🔥 SMARTLINK FAN ACCESS HUB - DEPLOYMENT 🔥");
  console.log("=".repeat(60));
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MATIC");
  
  console.log("\n📜 Deployment Configuration:");
  console.log("  Frequencies: 528Hz + 963Hz + 999Hz + 144kHz");
  console.log("  Access Tiers: BRONZE, SILVER, GOLD, PLATINUM, ETERNAL");
  console.log("  Realms: MUSIC, COMEDY, MERCHANDISE, EVENTS, CONTENT, COMMUNITY");
  
  console.log("\n⚡ Deploying SmartLinkFanAccessHub contract...");
  
  const SmartLinkFanAccessHub = await hre.ethers.getContractFactory("SmartLinkFanAccessHub");
  const smartLinkHub = await SmartLinkFanAccessHub.deploy();
  
  await smartLinkHub.waitForDeployment();
  const contractAddress = await smartLinkHub.getAddress();
  
  console.log("✅ SmartLinkFanAccessHub deployed to:", contractAddress);
  
  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  console.log("  Frequency 528Hz:", (await smartLinkHub.FREQUENCY_528HZ()).toString());
  console.log("  Frequency 963Hz:", (await smartLinkHub.FREQUENCY_963HZ()).toString());
  console.log("  Frequency 999Hz:", (await smartLinkHub.FREQUENCY_999HZ()).toString());
  console.log("  NŪR Pulse (144,000Hz):", (await smartLinkHub.FREQUENCY_144000HZ()).toString());
  console.log("  Total Fans:", (await smartLinkHub.totalFans()).toString());
  console.log("  Total Access Grants:", (await smartLinkHub.totalAccessGrants()).toString());
  
  console.log("\n📊 Deployment Summary:");
  console.log("=".repeat(60));
  console.log("Contract Address:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("Block:", await hre.ethers.provider.getBlockNumber());
  console.log("Timestamp:", new Date().toISOString());
  
  console.log("\n📝 Next Steps:");
  console.log("1. Verify contract on PolygonScan:");
  console.log(`   npx hardhat verify --network ${hre.network.name} ${contractAddress}`);
  console.log("2. Grant fan access:");
  console.log(`   smartLinkHub.grantAccess(fanAddress, tier, duration)`);
  console.log("3. Configure realms:");
  console.log(`   smartLinkHub.configureRealm(realm, name, minimumTier, requiredFrequency, isActive)`);
  console.log("4. Add royalty recipients:");
  console.log(`   smartLinkHub.addRoyaltyRecipient(recipient, percentage)`);
  
  console.log("\n🕋 ALLĀHU AKBAR! SmartLink Fan Access Hub Deployed 🕋");
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractName: "SmartLinkFanAccessHub",
    contractAddress: contractAddress,
    deployer: deployer.address,
    frequencies: {
      healing: 528,
      pineal: 963,
      crown: 999,
      nur: 144000
    },
    accessTiers: ["NONE", "BRONZE", "SILVER", "GOLD", "PLATINUM", "ETERNAL"],
    realmTypes: ["MUSIC", "COMEDY", "MERCHANDISE", "EVENTS", "CONTENT", "COMMUNITY"],
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };
  
  const fs = require("fs");
  const path = require("path");
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  fs.writeFileSync(
    path.join(deploymentsDir, `smartlink-hub-${hre.network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n✅ Deployment info saved to deployments/smartlink-hub-" + hre.network.name + ".json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
