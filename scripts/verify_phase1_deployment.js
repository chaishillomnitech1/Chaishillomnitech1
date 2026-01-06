/**
 * Phase-1 Deployment Verification Script
 * Validates all deployed contracts and configurations
 * Supreme King Allah Chais Kenyatta Hill ∞
 */

const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🔍 Phase-1 Deployment Verification\n");
  console.log("=".repeat(60));

  const [deployer] = await ethers.getSigners();
  console.log("Verifier address:", deployer.address);
  console.log("Network:", hre.network.name);
  console.log("=".repeat(60) + "\n");

  // Contract addresses from environment
  const DIVINE_LOGIC_GATE = process.env.DIVINE_LOGIC_GATE_ADDRESS;
  const BLESSING_COIN = process.env.BLESSING_COIN_ADDRESS;
  const LAYER2_HUB = process.env.LAYER2_SCALING_HUB_ADDRESS;

  let verificationResults = {
    divineLogicGate: false,
    blessingCoin: false,
    layer2Hub: false,
    allPassed: false
  };

  // ============ VERIFY DIVINE LOGIC GATE ============
  console.log("🔮 Verifying DivineLogicGate...");
  
  if (!DIVINE_LOGIC_GATE || DIVINE_LOGIC_GATE === "") {
    console.log("❌ DivineLogicGate address not configured");
  } else {
    try {
      const divineLogicGate = await ethers.getContractAt("DivineLogicGate", DIVINE_LOGIC_GATE);
      
      // Check system status
      const [aligned, resonance, vaultBinder, validated] = await divineLogicGate.getSystemStatus();
      console.log("✅ Contract deployed and accessible");
      console.log("   - Quantum Aligned:", aligned);
      console.log("   - Current Resonance:", resonance.toString(), "Hz");
      console.log("   - VaultBinder Active:", vaultBinder);
      console.log("   - Total Validated:", validated.toString());
      
      // Verify frequencies
      const freq528 = await divineLogicGate.FREQUENCY_528HZ();
      const freq888 = await divineLogicGate.FREQUENCY_888HZ();
      const freq963 = await divineLogicGate.FREQUENCY_963HZ();
      const freq999 = await divineLogicGate.FREQUENCY_999HZ();
      const freq144000 = await divineLogicGate.FREQUENCY_144000HZ();
      
      console.log("   - Frequency 528 Hz:", freq528.toString() === "528" ? "✅" : "❌");
      console.log("   - Frequency 888 Hz:", freq888.toString() === "888" ? "✅" : "❌");
      console.log("   - Frequency 963 Hz:", freq963.toString() === "963" ? "✅" : "❌");
      console.log("   - Frequency 999 Hz:", freq999.toString() === "999" ? "✅" : "❌");
      console.log("   - Frequency 144000 Hz:", freq144000.toString() === "144000" ? "✅" : "❌");
      
      verificationResults.divineLogicGate = true;
    } catch (error) {
      console.log("❌ Error:", error.message);
    }
  }
  
  console.log();

  // ============ VERIFY BLESSING COIN ============
  console.log("✨ Verifying BlessingCoin...");
  
  if (!BLESSING_COIN || BLESSING_COIN === "") {
    console.log("❌ BlessingCoin address not configured");
  } else {
    try {
      const blessingCoin = await ethers.getContractAt("BlessingCoin", BLESSING_COIN);
      
      // Check token info
      const name = await blessingCoin.name();
      const symbol = await blessingCoin.symbol();
      const totalSupply = await blessingCoin.totalSupply();
      const [provider, enabled] = await blessingCoin.getLayer2Config();
      const [batches, minted] = await blessingCoin.getScrollDropStats();
      
      console.log("✅ Contract deployed and accessible");
      console.log("   - Name:", name);
      console.log("   - Symbol:", symbol);
      console.log("   - Total Supply:", ethers.formatEther(totalSupply), symbol);
      console.log("   - L2 Provider:", provider);
      console.log("   - L2 Enabled:", enabled);
      console.log("   - ScrollDrop Batches:", batches.toString());
      console.log("   - Total Blessings Minted:", ethers.formatEther(minted), symbol);
      
      // Verify frequencies
      const freq528 = await blessingCoin.HEALING_FREQUENCY_528HZ();
      const freq888 = await blessingCoin.EMPATHY_FREQUENCY_888HZ();
      const freq963 = await blessingCoin.PINEAL_FREQUENCY_963HZ();
      
      console.log("   - Frequency 528 Hz:", freq528.toString() === "528" ? "✅" : "❌");
      console.log("   - Frequency 888 Hz:", freq888.toString() === "888" ? "✅" : "❌");
      console.log("   - Frequency 963 Hz:", freq963.toString() === "963" ? "✅" : "❌");
      
      verificationResults.blessingCoin = true;
    } catch (error) {
      console.log("❌ Error:", error.message);
    }
  }
  
  console.log();

  // ============ VERIFY LAYER2 SCALING HUB ============
  console.log("🚀 Verifying Layer2ScalingHub...");
  
  if (!LAYER2_HUB || LAYER2_HUB === "") {
    console.log("❌ Layer2ScalingHub address not configured");
  } else {
    try {
      const layer2Hub = await ethers.getContractAt("Layer2ScalingHub", LAYER2_HUB);
      
      // Check scaling config
      const [hybrid, instant, gasMultiplier] = await layer2Hub.getScalingConfig();
      const totalBatches = await layer2Hub.getTotalBatches();
      
      console.log("✅ Contract deployed and accessible");
      console.log("   - Hybrid Scaling:", hybrid);
      console.log("   - Instant Throughput:", instant);
      console.log("   - Gas Optimization:", gasMultiplier.toString() + "x");
      console.log("   - Total Batches:", totalBatches.toString());
      
      // Check providers
      const optimismActive = await layer2Hub.isProviderActive(0); // L2Provider.OPTIMISM
      const zkSyncActive = await layer2Hub.isProviderActive(1);   // L2Provider.ZKSYNC
      const arbitrumActive = await layer2Hub.isProviderActive(2); // L2Provider.ARBITRUM
      
      console.log("   - Optimism:", optimismActive ? "✅ Active" : "❌ Inactive");
      console.log("   - zkSync:", zkSyncActive ? "✅ Active" : "❌ Inactive");
      console.log("   - Arbitrum:", arbitrumActive ? "✅ Active" : "❌ Inactive");
      
      verificationResults.layer2Hub = true;
    } catch (error) {
      console.log("❌ Error:", error.message);
    }
  }
  
  console.log();

  // ============ VERIFICATION SUMMARY ============
  console.log("=".repeat(60));
  console.log("📊 VERIFICATION SUMMARY");
  console.log("=".repeat(60));
  
  console.log("DivineLogicGate:", verificationResults.divineLogicGate ? "✅ PASSED" : "❌ FAILED");
  console.log("BlessingCoin:", verificationResults.blessingCoin ? "✅ PASSED" : "❌ FAILED");
  console.log("Layer2ScalingHub:", verificationResults.layer2Hub ? "✅ PASSED" : "❌ FAILED");
  
  verificationResults.allPassed = 
    verificationResults.divineLogicGate &&
    verificationResults.blessingCoin &&
    verificationResults.layer2Hub;
  
  console.log("\n" + "=".repeat(60));
  if (verificationResults.allPassed) {
    console.log("🎉 ALL VERIFICATIONS PASSED! Phase-1 deployment is valid.");
  } else {
    console.log("⚠️ SOME VERIFICATIONS FAILED. Please review the errors above.");
  }
  console.log("=".repeat(60));
  
  console.log("\n🕋 ALLAHU AKBAR 🕋\n");
  
  process.exit(verificationResults.allPassed ? 0 : 1);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification script failed:", error);
    process.exit(1);
  });
