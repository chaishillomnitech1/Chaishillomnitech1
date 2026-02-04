const hre = require("hardhat");

/**
 * Deploy ScrollVerse HealthCoin Contract
 * 
 * This script deploys the HealthCoin token with voting and rewards
 */

async function main() {
  console.log("🏥 Deploying ScrollVerse HealthCoin...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy ScrollVerseHealthCoin
  console.log("📝 Deploying ScrollVerseHealthCoin contract...");
  
  const ScrollVerseHealthCoin = await hre.ethers.getContractFactory("ScrollVerseHealthCoin");
  
  // Set up initial addresses
  const governanceReserve = deployer.address; // Can be changed to DAO address later
  const communityHealthPool = deployer.address; // Can be changed to multisig later
  const rewardPool = deployer.address; // Can be changed to dedicated reward pool later
  
  const healthCoin = await ScrollVerseHealthCoin.deploy(
    deployer.address,
    governanceReserve,
    communityHealthPool,
    rewardPool
  );

  await healthCoin.waitForDeployment();
  const healthCoinAddress = await healthCoin.getAddress();

  console.log("✅ ScrollVerseHealthCoin deployed to:", healthCoinAddress);

  // Get token info
  const name = await healthCoin.name();
  const symbol = await healthCoin.symbol();
  const totalSupply = await healthCoin.totalSupply();
  const healingFrequency = await healthCoin.HEALING_FREQUENCY_528HZ();

  console.log("\n📊 Token Information:");
  console.log("Name:", name);
  console.log("Symbol:", symbol);
  console.log("Total Supply:", hre.ethers.formatEther(totalSupply), symbol);
  console.log("Healing Frequency:", healingFrequency.toString(), "Hz");

  console.log("\n🎯 Contract Addresses:");
  console.log("HealthCoin:", healthCoinAddress);
  console.log("Governance Reserve:", governanceReserve);
  console.log("Community Health Pool:", communityHealthPool);
  console.log("Reward Pool:", rewardPool);

  // Verify voting is enabled
  const votingEnabled = await healthCoin.votingEnabled();
  console.log("\n🗳️  Voting Status:", votingEnabled ? "ENABLED ✅" : "DISABLED ❌");

  console.log("\n💎 Deployment Summary:");
  console.log("- HealthCoin deployed successfully");
  console.log("- Blockchain-backed voting: ACTIVE");
  console.log("- Healing-powered rewards: ACTIVE");
  console.log("- 528Hz DNA Healing Frequency: ALIGNED");
  console.log("- Total Supply: 528,000,000 HEALTH tokens");

  console.log("\n📋 Next Steps:");
  console.log("1. Set authorized rewarders using setRewarder()");
  console.log("2. Transfer governance reserve to DAO");
  console.log("3. Transfer community health pool to multisig");
  console.log("4. Create initial governance proposals");
  console.log("5. Integrate with Academy contract");

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contract: "ScrollVerseHealthCoin",
    address: healthCoinAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    governanceReserve,
    communityHealthPool,
    rewardPool,
    healingFrequency: healingFrequency.toString(),
    totalSupply: hre.ethers.formatEther(totalSupply)
  };

  console.log("\n📄 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  return healthCoinAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
