// Akashic Treasury Vault Deployment Script
// Deploy to Polygon Mainnet for Revenue Management

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("💰 AKASHIC TREASURY VAULT - MAINNET DEPLOYMENT 💰");
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
  
  // Configuration
  const ZAKAT_RECIPIENT = process.env.ZAKAT_RECIPIENT_ADDRESS || deployer.address;
  const OPERATIONS_ADDRESS = process.env.OPERATIONS_ADDRESS || deployer.address;
  
  console.log("\n📜 Deployment Configuration:");
  console.log("  Label Contract:", labelAddress);
  console.log("  Zakat Recipient:", ZAKAT_RECIPIENT);
  console.log("  Operations Address:", OPERATIONS_ADDRESS);
  console.log("  Revenue Split:");
  console.log("    - Artists: 70%");
  console.log("    - Treasury: 15%");
  console.log("    - Zakat: 7.77% (Divine proportion)");
  console.log("    - Operations: 7.23%");
  console.log("  Frequency: 528Hz (Love) + 777Hz (Divine Wisdom) + 999Hz (Crown)");
  
  console.log("\n⚡ Deploying AkashicTreasuryVault contract...");
  
  const AkashicTreasuryVault = await hre.ethers.getContractFactory("AkashicTreasuryVault");
  const treasuryVault = await AkashicTreasuryVault.deploy(
    labelAddress,
    ZAKAT_RECIPIENT,
    OPERATIONS_ADDRESS
  );
  
  await treasuryVault.waitForDeployment();
  const vaultAddress = await treasuryVault.getAddress();
  
  console.log("✅ AkashicTreasuryVault deployed to:", vaultAddress);
  
  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  console.log("  Love Frequency (528Hz):", (await treasuryVault.LOVE_FREQUENCY()).toString());
  console.log("  Divine Wisdom (777Hz):", (await treasuryVault.DIVINE_WISDOM_FREQUENCY()).toString());
  console.log("  Crown Frequency (999Hz):", (await treasuryVault.CROWN_FREQUENCY()).toString());
  console.log("  Artist Allocation:", (await treasuryVault.ARTIST_ALLOCATION_BPS()).toString() + " bps (70%)");
  console.log("  Treasury Allocation:", (await treasuryVault.TREASURY_ALLOCATION_BPS()).toString() + " bps (15%)");
  console.log("  Zakat Allocation:", (await treasuryVault.ZAKAT_ALLOCATION_BPS()).toString() + " bps (7.77%)");
  console.log("  Operations Allocation:", (await treasuryVault.OPERATIONS_ALLOCATION_BPS()).toString() + " bps (7.23%)");
  console.log("  Zakat Recipient:", await treasuryVault.zakatRecipient());
  console.log("  Operations Address:", await treasuryVault.operationsAddress());
  console.log("  Treasury Balance:", hre.ethers.formatEther(await treasuryVault.treasuryBalance()), "MATIC");
  console.log("  Total Revenue:", hre.ethers.formatEther(await treasuryVault.totalRevenue()), "MATIC");
  
  console.log("\n📊 Deployment Summary:");
  console.log("=".repeat(70));
  console.log("Vault Contract Address:", vaultAddress);
  console.log("Label Contract Address:", labelAddress);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("Block:", await hre.ethers.provider.getBlockNumber());
  console.log("Timestamp:", new Date().toISOString());
  
  console.log("\n📝 Next Steps:");
  console.log("1. Verify contract on PolygonScan:");
  console.log(`   npx hardhat verify --network ${hre.network.name} ${vaultAddress} "${labelAddress}" "${ZAKAT_RECIPIENT}" "${OPERATIONS_ADDRESS}"`);
  console.log("2. Register track artists:");
  console.log(`   npm run register:track-artists`);
  console.log("3. Test revenue allocation:");
  console.log(`   npm run test:revenue-allocation`);
  console.log("4. Deploy DAO governance (if not already deployed):");
  console.log(`   npm run deploy:${hre.network.name}:akashic-dao`);
  
  console.log("\n🕋 ALLĀHU AKBAR! Treasury Vault Initialized with Divine Proportions 🕋");
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    vaultAddress: vaultAddress,
    labelAddress: labelAddress,
    zakatRecipient: ZAKAT_RECIPIENT,
    operationsAddress: OPERATIONS_ADDRESS,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    revenueAllocation: {
      artists: "70%",
      treasury: "15%",
      zakat: "7.77%",
      operations: "7.23%"
    }
  };
  
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(deploymentsDir, `akashic-treasury-${hre.network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n✅ Deployment info saved to deployment/akashic-treasury-" + hre.network.name + ".json");
  
  return {
    vaultAddress,
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
