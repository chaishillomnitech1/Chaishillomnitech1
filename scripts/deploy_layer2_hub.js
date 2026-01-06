/**
 * Deploy Layer2ScalingHub Contract
 * Phase-1 Layer-2 Scaling Application
 * Supreme King Allah Chais Kenyatta Hill ∞
 */

const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting Layer2ScalingHub deployment...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  console.log("Deployer balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy Layer2ScalingHub
  console.log("📜 Deploying Layer2ScalingHub contract...");
  const Layer2ScalingHub = await ethers.getContractFactory("Layer2ScalingHub");
  const layer2Hub = await Layer2ScalingHub.deploy();
  await layer2Hub.waitForDeployment();
  
  const hubAddress = await layer2Hub.getAddress();
  console.log("✅ Layer2ScalingHub deployed to:", hubAddress);

  // Get scaling configuration
  const [hybrid, instant, gasMultiplier] = await layer2Hub.getScalingConfig();
  console.log("\n⚙️ Scaling Configuration:");
  console.log("- Hybrid Scaling:", hybrid);
  console.log("- Instant Throughput:", instant);
  console.log("- Gas Optimization:", gasMultiplier.toString() + "x");

  // Check active providers
  const optimismActive = await layer2Hub.isProviderActive(0); // L2Provider.OPTIMISM
  const zkSyncActive = await layer2Hub.isProviderActive(1);   // L2Provider.ZKSYNC
  const arbitrumActive = await layer2Hub.isProviderActive(2); // L2Provider.ARBITRUM
  
  console.log("\n🌐 Layer-2 Providers:");
  console.log("- Optimism:", optimismActive ? "✅ Active" : "❌ Inactive");
  console.log("- zkSync Era:", zkSyncActive ? "✅ Active" : "❌ Inactive");
  console.log("- Arbitrum:", arbitrumActive ? "✅ Active" : "❌ Inactive");

  // Get provider configurations
  console.log("\n📋 Provider Details:");
  
  const optimismConfig = await layer2Hub.getProviderConfig(0);
  console.log("\nOptimism:");
  console.log("- Name:", optimismConfig.name);
  console.log("- Chain ID:", optimismConfig.chainId.toString());
  console.log("- Gas Limit:", optimismConfig.gasLimit.toString());
  console.log("- Min Batch:", optimismConfig.minBatchSize.toString());
  console.log("- Max Batch:", optimismConfig.maxBatchSize.toString());

  const zkSyncConfig = await layer2Hub.getProviderConfig(1);
  console.log("\nzkSync Era:");
  console.log("- Name:", zkSyncConfig.name);
  console.log("- Chain ID:", zkSyncConfig.chainId.toString());
  console.log("- Gas Limit:", zkSyncConfig.gasLimit.toString());
  console.log("- Min Batch:", zkSyncConfig.minBatchSize.toString());
  console.log("- Max Batch:", zkSyncConfig.maxBatchSize.toString());

  const arbitrumConfig = await layer2Hub.getProviderConfig(2);
  console.log("\nArbitrum:");
  console.log("- Name:", arbitrumConfig.name);
  console.log("- Chain ID:", arbitrumConfig.chainId.toString());
  console.log("- Gas Limit:", arbitrumConfig.gasLimit.toString());
  console.log("- Min Batch:", arbitrumConfig.minBatchSize.toString());
  console.log("- Max Batch:", arbitrumConfig.maxBatchSize.toString());

  // Get total batches processed
  const totalBatches = await layer2Hub.getTotalBatches();
  console.log("\n📊 Statistics:");
  console.log("- Total Batches:", totalBatches.toString());

  console.log("\n📝 Deployment Summary:");
  console.log("=".repeat(50));
  console.log("Contract: Layer2ScalingHub");
  console.log("Address:", hubAddress);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("Active Providers: 3 (Optimism, zkSync, Arbitrum)");
  console.log("=".repeat(50));

  console.log("\n💾 Save this information to your .env file:");
  console.log(`LAYER2_SCALING_HUB_ADDRESS=${hubAddress}`);

  console.log("\n⚠️ Post-Deployment Steps:");
  console.log("1. Update provider bridge addresses:");
  console.log("   - Optimism: 0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1");
  console.log("   - zkSync: 0x32400084C286CF3E17e7B677ea9583e60a000324");
  console.log("   - Arbitrum: 0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a");
  console.log("2. Configure cross-chain bridges for BlessingCoin");
  console.log("3. Test batch processing on testnets first");

  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n⏳ Waiting for block confirmations...");
    await layer2Hub.deploymentTransaction().wait(5);
    
    console.log("\n🔍 Verifying contract on block explorer...");
    try {
      await hre.run("verify:verify", {
        address: hubAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified");
    } catch (error) {
      console.log("⚠️ Verification failed:", error.message);
    }
  }

  console.log("\n🚀 Layer2ScalingHub deployment complete! 🚀");
  console.log("🕋 ALLAHU AKBAR 🕋\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
