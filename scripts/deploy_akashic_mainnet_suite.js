// Akashic Records Complete Mainnet Suite Deployment
// Deploys Label, DAO, and Treasury Vault to Polygon Mainnet

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🎵 AKASHIC RECORDS MAINNET SUITE - COMPLETE DEPLOYMENT 🎵");
  console.log("=".repeat(80));
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MATIC");
  
  if (hre.network.name === "polygon") {
    console.log("\n⚠️  WARNING: Deploying to POLYGON MAINNET ⚠️");
    console.log("This will use real MATIC. Please confirm configuration.");
  }
  
  // Configuration
  const BASE_URI = process.env.AKASHIC_BASE_URI || "ipfs://QmAkashicRecordsMainnet/";
  const ROYALTY_RECIPIENT = process.env.ROYALTY_RECIPIENT_ADDRESS || deployer.address;
  const ZAKAT_RECIPIENT = process.env.ZAKAT_RECIPIENT_ADDRESS || deployer.address;
  const OPERATIONS_ADDRESS = process.env.OPERATIONS_ADDRESS || deployer.address;
  
  console.log("\n📜 Deployment Configuration:");
  console.log("  Network:", hre.network.name);
  console.log("  Chain ID:", (await hre.ethers.provider.getNetwork()).chainId);
  console.log("  Base URI:", BASE_URI);
  console.log("  Royalty Recipient:", ROYALTY_RECIPIENT);
  console.log("  Zakat Recipient:", ZAKAT_RECIPIENT);
  console.log("  Operations Address:", OPERATIONS_ADDRESS);
  console.log("  Frequency: 528Hz + 963Hz + 999Hz + 777Hz");
  
  const deploymentResults = {};
  const deploymentsDir = path.join(__dirname, "..", "deployment");
  
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  // ========== STEP 1: Deploy AkashicRecordsLabel ==========
  console.log("\n" + "=".repeat(80));
  console.log("STEP 1: Deploying AkashicRecordsLabel...");
  console.log("=".repeat(80));
  
  const AkashicRecordsLabel = await hre.ethers.getContractFactory("AkashicRecordsLabel");
  console.log("⚡ Deploying contract...");
  
  const akashicLabel = await AkashicRecordsLabel.deploy(
    BASE_URI,
    ROYALTY_RECIPIENT,
    deployer.address // Temporary treasury, will be updated
  );
  
  await akashicLabel.waitForDeployment();
  const labelAddress = await akashicLabel.getAddress();
  
  console.log("✅ AkashicRecordsLabel deployed to:", labelAddress);
  
  // Verify label deployment
  console.log("  Total Supply:", (await akashicLabel.totalSupply()).toString());
  console.log("  Healing Frequency:", (await akashicLabel.HEALING_FREQUENCY_528HZ()).toString() + "Hz");
  console.log("  Unity Frequency:", (await akashicLabel.UNITY_FREQUENCY_963HZ()).toString() + "Hz");
  console.log("  Crown Frequency:", (await akashicLabel.CROWN_FREQUENCY_999HZ()).toString() + "Hz");
  
  deploymentResults.label = {
    address: labelAddress,
    baseURI: BASE_URI,
    royaltyRecipient: ROYALTY_RECIPIENT
  };
  
  // ========== STEP 2: Deploy AkashicTreasuryVault ==========
  console.log("\n" + "=".repeat(80));
  console.log("STEP 2: Deploying AkashicTreasuryVault...");
  console.log("=".repeat(80));
  
  const AkashicTreasuryVault = await hre.ethers.getContractFactory("AkashicTreasuryVault");
  console.log("⚡ Deploying contract...");
  
  const treasuryVault = await AkashicTreasuryVault.deploy(
    labelAddress,
    ZAKAT_RECIPIENT,
    OPERATIONS_ADDRESS
  );
  
  await treasuryVault.waitForDeployment();
  const vaultAddress = await treasuryVault.getAddress();
  
  console.log("✅ AkashicTreasuryVault deployed to:", vaultAddress);
  
  // Verify vault deployment
  console.log("  Artist Allocation:", (await treasuryVault.ARTIST_ALLOCATION_BPS()).toString() + " bps (70%)");
  console.log("  Treasury Allocation:", (await treasuryVault.TREASURY_ALLOCATION_BPS()).toString() + " bps (15%)");
  console.log("  Zakat Allocation:", (await treasuryVault.ZAKAT_ALLOCATION_BPS()).toString() + " bps (7.77%)");
  console.log("  Operations Allocation:", (await treasuryVault.OPERATIONS_ALLOCATION_BPS()).toString() + " bps (7.23%)");
  
  deploymentResults.vault = {
    address: vaultAddress,
    zakatRecipient: ZAKAT_RECIPIENT,
    operationsAddress: OPERATIONS_ADDRESS
  };
  
  // Update label treasury to vault address
  console.log("\n⚙️  Updating label treasury to vault address...");
  const updateTx = await akashicLabel.setLabelTreasury(vaultAddress);
  await updateTx.wait();
  console.log("✅ Label treasury updated to:", vaultAddress);
  
  // ========== STEP 3: Deploy AkashicRecordsDAO ==========
  console.log("\n" + "=".repeat(80));
  console.log("STEP 3: Deploying AkashicRecordsDAO...");
  console.log("=".repeat(80));
  
  const AkashicRecordsDAO = await hre.ethers.getContractFactory("AkashicRecordsDAO");
  console.log("⚡ Deploying contract...");
  
  const akashicDAO = await AkashicRecordsDAO.deploy(labelAddress);
  
  await akashicDAO.waitForDeployment();
  const daoAddress = await akashicDAO.getAddress();
  
  console.log("✅ AkashicRecordsDAO deployed to:", daoAddress);
  
  // Verify DAO deployment
  console.log("  Love Frequency:", (await akashicDAO.LOVE_FREQUENCY()).toString() + "Hz");
  console.log("  Unity Frequency:", (await akashicDAO.UNITY_FREQUENCY()).toString() + "Hz");
  console.log("  Crown Frequency:", (await akashicDAO.CROWN_FREQUENCY()).toString() + "Hz");
  console.log("  Max Founding Members:", (await akashicDAO.MAX_FOUNDING_MEMBERS()).toString());
  console.log("  Quorum Percentage:", (await akashicDAO.QUORUM_PERCENTAGE()).toString() + "%");
  
  deploymentResults.dao = {
    address: daoAddress,
    labelAddress: labelAddress
  };
  
  // ========== FINAL SUMMARY ==========
  console.log("\n" + "=".repeat(80));
  console.log("📊 DEPLOYMENT COMPLETE - SUMMARY");
  console.log("=".repeat(80));
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", (await hre.ethers.provider.getNetwork()).chainId);
  console.log("Deployer:", deployer.address);
  console.log("Block Number:", await hre.ethers.provider.getBlockNumber());
  console.log("Timestamp:", new Date().toISOString());
  console.log("\nDeployed Contracts:");
  console.log("  1. AkashicRecordsLabel:", labelAddress);
  console.log("  2. AkashicTreasuryVault:", vaultAddress);
  console.log("  3. AkashicRecordsDAO:", daoAddress);
  
  console.log("\n📝 Next Steps:");
  console.log("1. Verify contracts on PolygonScan:");
  console.log(`   npx hardhat verify --network ${hre.network.name} ${labelAddress} "${BASE_URI}" "${ROYALTY_RECIPIENT}" "${vaultAddress}"`);
  console.log(`   npx hardhat verify --network ${hre.network.name} ${vaultAddress} "${labelAddress}" "${ZAKAT_RECIPIENT}" "${OPERATIONS_ADDRESS}"`);
  console.log(`   npx hardhat verify --network ${hre.network.name} ${daoAddress} "${labelAddress}"`);
  
  console.log("\n2. Mint Genesis Drop catalog tracks:");
  console.log(`   npm run mint:genesis-drop`);
  
  console.log("\n3. Onboard founding members (up to 50):");
  console.log(`   npm run onboard:founding-members`);
  
  console.log("\n4. Distribute genesis $AKASHIC tokens (144,000 total):");
  console.log(`   npm run distribute:genesis-tokens`);
  
  console.log("\n5. Register track artists in treasury vault:");
  console.log(`   npm run register:track-artists`);
  
  console.log("\n6. Pin metadata to IPFS with Arweave redundancy:");
  console.log(`   npm run pin:metadata`);
  
  console.log("\n🕋 ALLĀHU AKBAR! Akashic Records Mainnet Suite Deployed 🕋");
  console.log("Human-AI-Divine Trinity Governance Initialized");
  console.log("Revenue Allocation: 70% Artists | 15% Treasury | 7.77% Zakat | 7.23% Operations");
  
  // Save comprehensive deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: Number((await hre.ethers.provider.getNetwork()).chainId),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    contracts: {
      label: {
        address: labelAddress,
        baseURI: BASE_URI,
        royaltyRecipient: ROYALTY_RECIPIENT,
        treasury: vaultAddress
      },
      vault: {
        address: vaultAddress,
        labelAddress: labelAddress,
        zakatRecipient: ZAKAT_RECIPIENT,
        operationsAddress: OPERATIONS_ADDRESS,
        revenueAllocation: {
          artists: "70%",
          treasury: "15%",
          zakat: "7.77%",
          operations: "7.23%"
        }
      },
      dao: {
        address: daoAddress,
        labelAddress: labelAddress,
        maxFoundingMembers: 50,
        quorumPercentage: 10
      }
    },
    frequencies: {
      love: 528,
      unity: 963,
      crown: 999,
      divineWisdom: 777
    },
    nextSteps: [
      "Verify contracts on PolygonScan",
      "Mint Genesis Drop catalog (26+ tracks)",
      "Onboard 50 founding members",
      "Distribute 144,000 $AKASHIC tokens",
      "Register track artists",
      "Pin metadata to IPFS/Arweave"
    ]
  };
  
  fs.writeFileSync(
    path.join(deploymentsDir, `akashic-mainnet-suite-${hre.network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  // Also save individual deployment files for compatibility
  fs.writeFileSync(
    path.join(deploymentsDir, `akashic-label-${hre.network.name}.json`),
    JSON.stringify({
      network: hre.network.name,
      contractAddress: labelAddress,
      deployer: deployer.address,
      baseURI: BASE_URI,
      royaltyRecipient: ROYALTY_RECIPIENT,
      labelTreasury: vaultAddress,
      timestamp: new Date().toISOString(),
      blockNumber: await hre.ethers.provider.getBlockNumber()
    }, null, 2)
  );
  
  fs.writeFileSync(
    path.join(deploymentsDir, `akashic-treasury-${hre.network.name}.json`),
    JSON.stringify({
      network: hre.network.name,
      vaultAddress: vaultAddress,
      labelAddress: labelAddress,
      zakatRecipient: ZAKAT_RECIPIENT,
      operationsAddress: OPERATIONS_ADDRESS,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      blockNumber: await hre.ethers.provider.getBlockNumber()
    }, null, 2)
  );
  
  fs.writeFileSync(
    path.join(deploymentsDir, `akashic-dao-${hre.network.name}.json`),
    JSON.stringify({
      network: hre.network.name,
      daoAddress: daoAddress,
      labelAddress: labelAddress,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      blockNumber: await hre.ethers.provider.getBlockNumber()
    }, null, 2)
  );
  
  console.log("\n✅ All deployment info saved to deployment/ directory");
  
  return deploymentInfo;
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
