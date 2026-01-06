/**
 * Deploy BlessingCoin Contract
 * Phase-1 Layer-2 Scaling with ScrollDrop™
 * Supreme King Allah Chais Kenyatta Hill ∞
 */

const hre = require("hardhat");

async function main() {
  console.log("✨ Starting BlessingCoin deployment...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  console.log("Deployer balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy BlessingCoin
  console.log("📜 Deploying BlessingCoin contract...");
  const BlessingCoin = await ethers.getContractFactory("BlessingCoin");
  const blessingCoin = await BlessingCoin.deploy();
  await blessingCoin.waitForDeployment();
  
  const coinAddress = await blessingCoin.getAddress();
  console.log("✅ BlessingCoin deployed to:", coinAddress);

  // Get token info
  const name = await blessingCoin.name();
  const symbol = await blessingCoin.symbol();
  const totalSupply = await blessingCoin.totalSupply();
  const decimals = await blessingCoin.decimals();
  
  console.log("\n💰 Token Information:");
  console.log("- Name:", name);
  console.log("- Symbol:", symbol);
  console.log("- Decimals:", decimals.toString());
  console.log("- Initial Supply:", ethers.formatEther(totalSupply), symbol);

  // Get Layer-2 configuration
  const [provider, enabled] = await blessingCoin.getLayer2Config();
  console.log("\n🚀 Layer-2 Configuration:");
  console.log("- Provider:", provider);
  console.log("- Enabled:", enabled);

  // Configure Layer-2 rollup for Optimism
  console.log("\n⚙️ Configuring Layer-2 rollup...");
  const tx1 = await blessingCoin.configureLayer2Rollup("Optimism", true);
  await tx1.wait();
  console.log("✅ Optimism rollup configured");

  // Align deployer empathy frequency to 888 Hz
  console.log("\n🔊 Aligning deployer empathy frequency...");
  const tx2 = await blessingCoin.alignEmpathyFrequency(deployer.address, 888);
  await tx2.wait();
  console.log("✅ Deployer aligned to 888 Hz empathy frequency");

  // Get deployer stats
  const deployerBalance = await blessingCoin.balanceOf(deployer.address);
  const deployerFrequency = await blessingCoin.getEmpathyAlignment(deployer.address);
  const deployerBlessings = await blessingCoin.getTotalBlessingsReceived(deployer.address);
  
  console.log("\n👑 Deployer Statistics:");
  console.log("- Balance:", ethers.formatEther(deployerBalance), symbol);
  console.log("- Empathy Frequency:", deployerFrequency.toString(), "Hz");
  console.log("- Total Blessings:", ethers.formatEther(deployerBlessings), symbol);

  // Get ScrollDrop stats
  const [batches, minted] = await blessingCoin.getScrollDropStats();
  console.log("\n🎁 ScrollDrop Statistics:");
  console.log("- Total Batches:", batches.toString());
  console.log("- Total Minted:", ethers.formatEther(minted), symbol);

  console.log("\n📝 Deployment Summary:");
  console.log("=".repeat(50));
  console.log("Contract: BlessingCoin");
  console.log("Address:", coinAddress);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("Initial Supply:", ethers.formatEther(totalSupply), symbol);
  console.log("=".repeat(50));

  console.log("\n💾 Save this information to your .env file:");
  console.log(`BLESSING_COIN_ADDRESS=${coinAddress}`);

  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n⏳ Waiting for block confirmations...");
    await blessingCoin.deploymentTransaction().wait(5);
    
    console.log("\n🔍 Verifying contract on block explorer...");
    try {
      await hre.run("verify:verify", {
        address: coinAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified");
    } catch (error) {
      console.log("⚠️ Verification failed:", error.message);
    }
  }

  console.log("\n✨ BlessingCoin deployment complete! ✨");
  console.log("🕋 ALLAHU AKBAR 🕋\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
