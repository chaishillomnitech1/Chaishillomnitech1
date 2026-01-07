/**
 * @title Deploy Imperial Perpetuity Engine Suite
 * @notice Deploys the complete Imperial Perpetuity infrastructure
 * @dev Deploys ImperialPerpetuityEngine, ImperialBalanceSheet, and ThroneFrequencyBroadcast
 */

const hre = require("hardhat");

async function main() {
  console.log("🕋 ═══════════════════════════════════════════════════════════════ 🕋");
  console.log("   IMPERIAL PERPETUITY ENGINE DEPLOYMENT");
  console.log("   Supreme King Chais The Great ∞");
  console.log("   Frequency: 528Hz + 963Hz + 999Hz + 144,000Hz");
  console.log("🕋 ═══════════════════════════════════════════════════════════════ 🕋\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📡 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Define addresses (replace with actual addresses or use deployer for testing)
  const treasuryAddress = process.env.TREASURY_ADDRESS || deployer.address;
  const zakatVaultAddress = process.env.ZAKAT_VAULT_ADDRESS || deployer.address;

  console.log("🏛️  Treasury Address:", treasuryAddress);
  console.log("🕌 Zakat Vault Address:", zakatVaultAddress);
  console.log("");

  // ============ Deploy ImperialPerpetuityEngine ============
  console.log("⚡ Deploying ImperialPerpetuityEngine...");
  const ImperialPerpetuityEngine = await hre.ethers.getContractFactory("ImperialPerpetuityEngine");
  const perpetuityEngine = await ImperialPerpetuityEngine.deploy(
    deployer.address,
    treasuryAddress,
    zakatVaultAddress
  );
  await perpetuityEngine.waitForDeployment();
  const perpetuityEngineAddress = await perpetuityEngine.getAddress();
  console.log("✅ ImperialPerpetuityEngine deployed to:", perpetuityEngineAddress);
  console.log("");

  // ============ Deploy ImperialBalanceSheet ============
  console.log("📊 Deploying ImperialBalanceSheet...");
  const ImperialBalanceSheet = await hre.ethers.getContractFactory("ImperialBalanceSheet");
  const balanceSheet = await ImperialBalanceSheet.deploy(deployer.address);
  await balanceSheet.waitForDeployment();
  const balanceSheetAddress = await balanceSheet.getAddress();
  console.log("✅ ImperialBalanceSheet deployed to:", balanceSheetAddress);
  console.log("");

  // ============ Deploy ThroneFrequencyBroadcast ============
  console.log("📡 Deploying ThroneFrequencyBroadcast...");
  const ThroneFrequencyBroadcast = await hre.ethers.getContractFactory("ThroneFrequencyBroadcast");
  const throneBroadcast = await ThroneFrequencyBroadcast.deploy(deployer.address);
  await throneBroadcast.waitForDeployment();
  const throneBroadcastAddress = await throneBroadcast.getAddress();
  console.log("✅ ThroneFrequencyBroadcast deployed to:", throneBroadcastAddress);
  console.log("");

  // ============ Configure Integration ============
  console.log("🔧 Configuring Integration...");
  
  // Authorize balance sheet to report to perpetuity engine
  console.log("   → Authorizing BalanceSheet as reporter...");
  const authTx = await balanceSheet.setReporterAuthorization(perpetuityEngineAddress, true);
  await authTx.wait();
  console.log("   ✓ BalanceSheet authorized");

  // Activate eternal broadcast
  console.log("   → Activating eternal 963Hz broadcast...");
  const broadcastTx = await throneBroadcast.activateEternalBroadcast();
  await broadcastTx.wait();
  console.log("   ✓ Eternal broadcast activated at 963Hz");

  console.log("");

  // ============ Display Deployment Summary ============
  console.log("🕋 ═══════════════════════════════════════════════════════════════ 🕋");
  console.log("   DEPLOYMENT COMPLETE - IMPERIAL PERPETUITY ENGINE");
  console.log("🕋 ═══════════════════════════════════════════════════════════════ 🕋\n");

  console.log("📋 DEPLOYED CONTRACTS:");
  console.log("─────────────────────────────────────────────────────────────────");
  console.log("ImperialPerpetuityEngine:   ", perpetuityEngineAddress);
  console.log("ImperialBalanceSheet:       ", balanceSheetAddress);
  console.log("ThroneFrequencyBroadcast:   ", throneBroadcastAddress);
  console.log("─────────────────────────────────────────────────────────────────\n");

  console.log("🔑 CONFIGURATION:");
  console.log("─────────────────────────────────────────────────────────────────");
  console.log("Treasury Address:           ", treasuryAddress);
  console.log("Zakat Vault Address:        ", zakatVaultAddress);
  console.log("Zakat Percentage:            7.77%");
  console.log("Primary Frequency:           963 Hz (Divine Consciousness)");
  console.log("Supporting Frequencies:      528 Hz, 999 Hz, 144,000 Hz");
  console.log("─────────────────────────────────────────────────────────────────\n");

  console.log("✨ STATUS:");
  console.log("─────────────────────────────────────────────────────────────────");
  console.log("Eternal Broadcast:           ACTIVE");
  console.log("Self-Sustaining Systems:     OPERATIONAL");
  console.log("Zakat Flow:                  ENABLED (7.77%)");
  console.log("Infinite Feedback Loop:      READY");
  console.log("─────────────────────────────────────────────────────────────────\n");

  // ============ Save Deployment Info ============
  const deploymentInfo = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      ImperialPerpetuityEngine: perpetuityEngineAddress,
      ImperialBalanceSheet: balanceSheetAddress,
      ThroneFrequencyBroadcast: throneBroadcastAddress
    },
    configuration: {
      treasuryAddress,
      zakatVaultAddress,
      zakatPercentage: "7.77%",
      frequencies: {
        primary: "963 Hz",
        supporting: ["528 Hz", "999 Hz", "144,000 Hz"]
      }
    },
    status: {
      eternalBroadcast: "ACTIVE",
      selfSustaining: "OPERATIONAL",
      zakatFlow: "ENABLED",
      feedbackLoop: "READY"
    }
  };

  const fs = require("fs");
  const path = require("path");
  
  const deploymentDir = path.join(__dirname, "..", "eternal_archive", "PROTOCOLS");
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }
  
  const deploymentFile = path.join(
    deploymentDir,
    `imperial_perpetuity_deployment_${hre.network.name}_${Date.now()}.json`
  );
  
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to:", deploymentFile);
  console.log("");

  console.log("🕋 ═══════════════════════════════════════════════════════════════ 🕋");
  console.log("   ALLĀHU AKBAR! DEPLOYMENT SEALED IN ETERNITY");
  console.log("   ∞ SUPREME KING CHAIS THE GREAT ∞");
  console.log("🕋 ═══════════════════════════════════════════════════════════════ 🕋\n");

  // Return addresses for verification
  return {
    ImperialPerpetuityEngine: perpetuityEngineAddress,
    ImperialBalanceSheet: balanceSheetAddress,
    ThroneFrequencyBroadcast: throneBroadcastAddress
  };
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

module.exports = main;
