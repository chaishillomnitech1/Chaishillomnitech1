const hre = require("hardhat");

/**
 * Deploy ScrollVerse Test Rewards Contract
 * 
 * This script deploys the Test Rewards NFT contract for 2000+ global distribution
 */

async function main() {
  console.log("🎁 Deploying ScrollVerse Test Rewards...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy ScrollVerseTestRewards
  console.log("📝 Deploying ScrollVerseTestRewards contract...");
  
  const ScrollVerseTestRewards = await hre.ethers.getContractFactory("ScrollVerseTestRewards");
  
  // Set up base metadata URI (update with your IPFS/Arweave gateway)
  const baseMetadataURI = "ipfs://QmScrollVerseTestRewards";
  
  const testRewards = await ScrollVerseTestRewards.deploy(
    deployer.address,
    baseMetadataURI
  );

  await testRewards.waitForDeployment();
  const testRewardsAddress = await testRewards.getAddress();

  console.log("✅ ScrollVerseTestRewards deployed to:", testRewardsAddress);

  // Get contract info
  const name = await testRewards.name();
  const symbol = await testRewards.symbol();
  const maxRewards = await testRewards.MAX_TEST_REWARDS();
  const crownFrequency = await testRewards.CROWN_FREQUENCY_963HZ();
  const globalDistributionActive = await testRewards.globalDistributionActive();

  console.log("\n📊 NFT Collection Information:");
  console.log("Name:", name);
  console.log("Symbol:", symbol);
  console.log("Max Test Rewards:", maxRewards.toString());
  console.log("Crown Frequency:", crownFrequency.toString(), "Hz");
  console.log("Global Distribution:", globalDistributionActive ? "ACTIVE ✅" : "INACTIVE ❌");

  console.log("\n🎯 Contract Address:");
  console.log("Test Rewards NFT:", testRewardsAddress);
  console.log("Base Metadata URI:", baseMetadataURI);

  console.log("\n💎 Deployment Summary:");
  console.log("- Test Rewards NFT deployed successfully");
  console.log("- Maximum capacity: 2100 rewards");
  console.log("- Global distribution: ACTIVE");
  console.log("- Batch minting: ENABLED (100 per batch)");
  console.log("- 963Hz Crown Chakra Frequency: ALIGNED");
  console.log("- Reward tiers: BRONZE, SILVER, GOLD, PLATINUM, DIAMOND, SOVEREIGN");

  console.log("\n📋 Next Steps:");
  console.log("1. Upload metadata to IPFS/Arweave");
  console.log("2. Update base URI with setBaseURI()");
  console.log("3. Add authorized minters using setMinter()");
  console.log("4. Prepare recipient addresses for batch minting");
  console.log("5. Execute global launch batch minting (2000+ rewards)");
  console.log("6. Integrate with HealthCoin for additional rewards");

  console.log("\n🚀 Example Batch Mint Command:");
  console.log("await testRewards.mintGlobalLaunchBatch(");
  console.log("  [address1, address2, ...], // recipients (max 100)");
  console.log("  0, // RewardTier.BRONZE");
  console.log("  'Global Launch Test', // test type");
  console.log("  100 // default score");
  console.log(")");

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contract: "ScrollVerseTestRewards",
    address: testRewardsAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    baseMetadataURI,
    maxRewards: maxRewards.toString(),
    crownFrequency: crownFrequency.toString(),
    globalDistributionActive
  };

  console.log("\n📄 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  return testRewardsAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
