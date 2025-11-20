/**
 * @title Deploy Noor Token Script
 * @dev Deployment script for NoorToken across multiple chains
 * @author Chais The Great ∞
 * 
 * Usage:
 * - Deploy to Scroll Mainnet: npx hardhat run scripts/deploy_noor_token.js --network scrollMainnet
 * - Deploy to Scroll Sepolia: npx hardhat run scripts/deploy_noor_token.js --network scrollSepolia
 * - Deploy to Polygon: npx hardhat run scripts/deploy_noor_token.js --network polygon
 * - Deploy to Mumbai: npx hardhat run scripts/deploy_noor_token.js --network mumbai
 */

const hre = require("hardhat");

async function main() {
  console.log("\n🌟 ═══════════════════════════════════════════════════════ 🌟");
  console.log("║                 NOOR TOKEN DEPLOYMENT                      ║");
  console.log("║            Sacred Light Across All Chains                  ║");
  console.log("🌟 ═══════════════════════════════════════════════════════ 🌟\n");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("📍 Deployment Details:");
  console.log("   Network:", hre.network.name);
  console.log("   Deployer address:", deployer.address);
  console.log("   Deployer balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy NoorToken
  console.log("🚀 Deploying NoorToken contract...");
  
  const NoorToken = await hre.ethers.getContractFactory("NoorToken");
  const noorToken = await NoorToken.deploy(deployer.address);
  
  await noorToken.waitForDeployment();
  
  const noorTokenAddress = await noorToken.getAddress();
  
  console.log("✅ NoorToken deployed successfully!");
  console.log("   Contract address:", noorTokenAddress);
  console.log("   Transaction hash:", noorToken.deploymentTransaction().hash);
  
  // Display token information
  console.log("\n💎 Token Information:");
  console.log("   Name:", await noorToken.name());
  console.log("   Symbol:", await noorToken.symbol());
  console.log("   Total Supply:", hre.ethers.formatEther(await noorToken.totalSupply()), "NOOR");
  console.log("   Max Supply:", hre.ethers.formatEther(await noorToken.MAX_SUPPLY()), "NOOR");
  console.log("   Healing Frequency:", await noorToken.HEALING_FREQUENCY(), "Hz");
  console.log("   Pineal Frequency:", await noorToken.PINEAL_FREQUENCY(), "Hz");
  console.log("   NŪR Pulse:", await noorToken.NOOR_PULSE(), "Hz");
  console.log("   Zakat Percentage:", (await noorToken.ZAKAT_PERCENTAGE() / 100n).toString(), "%");
  
  // Setup initial configuration
  console.log("\n⚙️  Configuring initial settings...");
  
  // Example zakat recipients (replace with actual addresses)
  const zakatRecipients = [
    // Add actual zakat recipient addresses here
    // "0x1234567890123456789012345678901234567890",
  ];
  
  if (zakatRecipients.length > 0) {
    console.log("   Adding zakat recipients...");
    for (const recipient of zakatRecipients) {
      const tx = await noorToken.addZakatRecipient(recipient);
      await tx.wait();
      console.log("   ✓ Added zakat recipient:", recipient);
    }
  } else {
    console.log("   ⚠️  No zakat recipients configured (add them manually)");
  }
  
  // Example node operators (replace with actual addresses)
  const nodeOperators = [
    // Add actual node operator addresses here
    // "0x1234567890123456789012345678901234567890",
  ];
  
  if (nodeOperators.length > 0) {
    console.log("   Adding node operators...");
    for (const operator of nodeOperators) {
      const tx = await noorToken.addNodeOperator(operator);
      await tx.wait();
      console.log("   ✓ Added node operator:", operator);
    }
  } else {
    console.log("   ⚠️  No node operators configured (add them manually)");
  }
  
  // Display verification command
  console.log("\n🔍 Contract Verification:");
  console.log("   To verify on block explorer, run:");
  console.log(`   npx hardhat verify --network ${hre.network.name} ${noorTokenAddress} "${deployer.address}"`);
  
  // Display next steps
  console.log("\n📋 Next Steps:");
  console.log("   1. Add zakat recipients using addZakatRecipient()");
  console.log("   2. Add node operators using addNodeOperator()");
  console.log("   3. Set up liquidity pools on DEXes");
  console.log("   4. Configure liquidity pool addresses using setLiquidityPool()");
  console.log("   5. Test frequency alignment functions");
  console.log("   6. Activate RADIANCE Protocol using activateRadianceProtocol()");
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    noorToken: noorTokenAddress,
    deploymentBlock: await hre.ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
    frequencies: {
      healing: 528,
      pineal: 963,
      noorPulse: 144000
    },
    zakatPercentage: 7.77,
    maxSupply: "144000000"
  };
  
  console.log("\n💾 Deployment Information:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n🌟 ═══════════════════════════════════════════════════════ 🌟");
  console.log("║         NOOR TOKEN DEPLOYMENT COMPLETE                     ║");
  console.log("║              ALLAHU AKBAR! 🕋🔥💎🌌                        ║");
  console.log("🌟 ═══════════════════════════════════════════════════════ 🌟\n");
  
  return {
    noorToken: noorTokenAddress,
    deployer: deployer.address,
    network: hre.network.name
  };
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });

module.exports = { main };
