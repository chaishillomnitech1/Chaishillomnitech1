/**
 * Deploy DivineLogicGate Contract
 * Phase-1 Code Synchronization
 * Supreme King Allah Chais Kenyatta Hill ∞
 */

const hre = require("hardhat");

async function main() {
  console.log("🕋 Starting DivineLogicGate deployment...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  console.log("Deployer balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy DivineLogicGate
  console.log("📜 Deploying DivineLogicGate contract...");
  const DivineLogicGate = await ethers.getContractFactory("DivineLogicGate");
  const divineLogicGate = await DivineLogicGate.deploy();
  await divineLogicGate.waitForDeployment();
  
  const gateAddress = await divineLogicGate.getAddress();
  console.log("✅ DivineLogicGate deployed to:", gateAddress);

  // Get initial system status
  const [aligned, resonance, vaultBinder, validated] = await divineLogicGate.getSystemStatus();
  console.log("\n📊 Initial System Status:");
  console.log("- Quantum Aligned:", aligned);
  console.log("- Current Resonance:", resonance.toString(), "Hz");
  console.log("- VaultBinder Active:", vaultBinder);
  console.log("- Total Validated:", validated.toString());

  // Record initial quantum state
  console.log("\n🔮 Recording initial block quantum state...");
  const tx = await divineLogicGate.recordBlockQuantumState();
  await tx.wait();
  console.log("✅ Block quantum state recorded");

  // Set deployer as sovereign address
  console.log("\n👑 Setting deployer as sovereign address...");
  const tx2 = await divineLogicGate.setSovereignStatus(deployer.address, true);
  await tx2.wait();
  console.log("✅ Deployer sovereign status granted");

  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const isSovereign = await divineLogicGate.isSovereignAddress(deployer.address);
  const deployerResonance = await divineLogicGate.getAddressResonance(deployer.address);
  console.log("- Deployer is sovereign:", isSovereign);
  console.log("- Deployer resonance:", deployerResonance.toString(), "Hz");

  console.log("\n📝 Deployment Summary:");
  console.log("=".repeat(50));
  console.log("Contract: DivineLogicGate");
  console.log("Address:", gateAddress);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("=".repeat(50));

  console.log("\n💾 Save this information to your .env file:");
  console.log(`DIVINE_LOGIC_GATE_ADDRESS=${gateAddress}`);

  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n⏳ Waiting for block confirmations...");
    await divineLogicGate.deploymentTransaction().wait(5);
    
    console.log("\n🔍 Verifying contract on block explorer...");
    try {
      await hre.run("verify:verify", {
        address: gateAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified");
    } catch (error) {
      console.log("⚠️ Verification failed:", error.message);
    }
  }

  console.log("\n🔥 DivineLogicGate deployment complete! 🔥");
  console.log("🕋 ALLAHU AKBAR 🕋\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
