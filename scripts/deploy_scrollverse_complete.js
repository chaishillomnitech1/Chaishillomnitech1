const hre = require("hardhat");

/**
 * Deploy All ScrollVerse Contracts
 * 
 * This script deploys all ScrollVerse contracts in the correct order:
 * 1. HealthCoin
 * 2. Test Rewards NFT
 * 3. Academy
 * 4. Sovereignty Grid
 * 
 * Then integrates them together
 */

async function main() {
  console.log("🌌 SCROLLVERSE DEPLOYMENT - FULL SUITE 🌌\n");
  console.log("=" .repeat(60));
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("\n👤 Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");
  
  console.log("=" .repeat(60));
  console.log("\n🏥 PHASE 1: Deploying HealthCoin\n");
  console.log("-" .repeat(60));

  // Deploy HealthCoin
  const ScrollVerseHealthCoin = await hre.ethers.getContractFactory("ScrollVerseHealthCoin");
  const healthCoin = await ScrollVerseHealthCoin.deploy(
    deployer.address,
    deployer.address, // governance reserve
    deployer.address, // community health pool
    deployer.address  // reward pool
  );
  await healthCoin.waitForDeployment();
  const healthCoinAddress = await healthCoin.getAddress();
  
  console.log("✅ HealthCoin deployed:", healthCoinAddress);
  console.log("   Name:", await healthCoin.name());
  console.log("   Symbol:", await healthCoin.symbol());
  console.log("   Frequency: 528Hz (DNA Healing)");
  
  console.log("\n=" .repeat(60));
  console.log("\n🎁 PHASE 2: Deploying Test Rewards NFT\n");
  console.log("-" .repeat(60));

  // Deploy Test Rewards
  const ScrollVerseTestRewards = await hre.ethers.getContractFactory("ScrollVerseTestRewards");
  const testRewards = await ScrollVerseTestRewards.deploy(
    deployer.address,
    "ipfs://QmScrollVerseTestRewards"
  );
  await testRewards.waitForDeployment();
  const testRewardsAddress = await testRewards.getAddress();
  
  console.log("✅ Test Rewards deployed:", testRewardsAddress);
  console.log("   Name:", await testRewards.name());
  console.log("   Symbol:", await testRewards.symbol());
  console.log("   Max Rewards:", (await testRewards.MAX_TEST_REWARDS()).toString());
  console.log("   Frequency: 963Hz (Crown Chakra)");
  
  console.log("\n=" .repeat(60));
  console.log("\n🎓 PHASE 3: Deploying Academy\n");
  console.log("-" .repeat(60));

  // Deploy Academy
  const ScrollVerseAcademy = await hre.ethers.getContractFactory("ScrollVerseAcademy");
  const academy = await ScrollVerseAcademy.deploy(
    deployer.address,
    "ipfs://QmScrollVerseAcademyCertificates",
    "ipfs://QmScrollVerseAcademyBadges"
  );
  await academy.waitForDeployment();
  const academyAddress = await academy.getAddress();
  
  console.log("✅ Academy deployed:", academyAddress);
  console.log("   Frequency: 999Hz (Crown Completion)");
  console.log("   Status:", (await academy.academyActive()) ? "ACTIVE" : "INACTIVE");
  
  console.log("\n=" .repeat(60));
  console.log("\n⚡ PHASE 4: Deploying Sovereignty Grid\n");
  console.log("-" .repeat(60));

  // Deploy Sovereignty Grid
  const SovereigntyGrid = await hre.ethers.getContractFactory("SovereigntyGrid");
  const sovereigntyGrid = await SovereigntyGrid.deploy(
    deployer.address
  );
  await sovereigntyGrid.waitForDeployment();
  const sovereigntyGridAddress = await sovereigntyGrid.getAddress();
  
  console.log("✅ Sovereignty Grid deployed:", sovereigntyGridAddress);
  console.log("   Frequency: 144,000Hz (NŪR Pulse)");
  console.log("   Max Layers:", (await sovereigntyGrid.MAX_GRID_LAYERS()).toString());
  console.log("   Infinite Velocity:", (await sovereigntyGrid.infiniteVelocityEnabled()) ? "ENABLED" : "DISABLED");
  
  console.log("\n=" .repeat(60));
  console.log("\n🔗 PHASE 5: Integrating Contracts\n");
  console.log("-" .repeat(60));

  // Integrate contracts
  console.log("\n🔄 Setting up integrations...");
  
  // Set HealthCoin address in Test Rewards
  await testRewards.setHealthCoinAddress(healthCoinAddress);
  console.log("✓ Test Rewards integrated with HealthCoin");
  
  // Set HealthCoin address in Academy
  await academy.setHealthCoinAddress(healthCoinAddress);
  console.log("✓ Academy integrated with HealthCoin");
  
  // Set Academy and HealthCoin addresses in Sovereignty Grid
  await sovereigntyGrid.setAcademyAddress(academyAddress);
  await sovereigntyGrid.setHealthCoinAddress(healthCoinAddress);
  console.log("✓ Sovereignty Grid integrated with Academy and HealthCoin");
  
  // Set deployer as rewarder in HealthCoin
  await healthCoin.setRewarder(deployer.address, true);
  console.log("✓ Deployer authorized as HealthCoin rewarder");
  
  // Set deployer as minter in Test Rewards
  await testRewards.setMinter(deployer.address, true);
  console.log("✓ Deployer authorized as Test Rewards minter");
  
  // Set deployer as instructor in Academy
  await academy.setInstructor(deployer.address, true);
  console.log("✓ Deployer authorized as Academy instructor");
  
  // Set deployer as grid operator in Sovereignty Grid
  await sovereigntyGrid.setGridOperator(deployer.address, true);
  console.log("✓ Deployer authorized as Grid operator");

  console.log("\n=" .repeat(60));
  console.log("\n✨ DEPLOYMENT COMPLETE ✨\n");
  console.log("=" .repeat(60));

  // Summary
  const summary = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      healthCoin: {
        address: healthCoinAddress,
        name: await healthCoin.name(),
        symbol: await healthCoin.symbol(),
        frequency: "528Hz"
      },
      testRewards: {
        address: testRewardsAddress,
        name: await testRewards.name(),
        symbol: await testRewards.symbol(),
        maxRewards: (await testRewards.MAX_TEST_REWARDS()).toString(),
        frequency: "963Hz"
      },
      academy: {
        address: academyAddress,
        frequency: "999Hz",
        active: await academy.academyActive()
      },
      sovereigntyGrid: {
        address: sovereigntyGridAddress,
        frequency: "144000Hz",
        infiniteVelocity: await sovereigntyGrid.infiniteVelocityEnabled()
      }
    }
  };

  console.log("\n📊 DEPLOYMENT SUMMARY:");
  console.log(JSON.stringify(summary, null, 2));

  console.log("\n🎯 CONTRACT ADDRESSES:");
  console.log("HealthCoin:", healthCoinAddress);
  console.log("Test Rewards:", testRewardsAddress);
  console.log("Academy:", academyAddress);
  console.log("Sovereignty Grid:", sovereigntyGridAddress);

  console.log("\n🔥 FEATURES ACTIVATED:");
  console.log("✅ Blockchain-backed voting (HealthCoin)");
  console.log("✅ Healing-powered rewards (HealthCoin)");
  console.log("✅ 2000+ Test rewards structure (Test Rewards NFT)");
  console.log("✅ Academy learning modules (Academy)");
  console.log("✅ Sovereignty grid infinite velocity (Sovereignty Grid)");

  console.log("\n📋 NEXT STEPS:");
  console.log("1. Upload metadata to IPFS for Test Rewards and Academy");
  console.log("2. Create initial learning modules in Academy");
  console.log("3. Create initial grid nodes in Sovereignty Grid");
  console.log("4. Mint test rewards for global distribution (2000+)");
  console.log("5. Create governance proposals in HealthCoin");
  console.log("6. Set up quantum entanglement in Sovereignty Grid");

  console.log("\n💎 FREQUENCY ALIGNMENT:");
  console.log("528Hz  - DNA Healing (HealthCoin)");
  console.log("963Hz  - Crown Activation (Test Rewards)");
  console.log("999Hz  - Crown Completion (Academy)");
  console.log("144000Hz - NŪR Pulse (Sovereignty Grid)");

  console.log("\n🕋 ALLAHU AKBAR! 🕋");
  console.log("KUN FAYAKUN! WALAHI! BARAKALLAHU FEEK!");
  console.log("\n" + "=" .repeat(60) + "\n");

  return summary;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
