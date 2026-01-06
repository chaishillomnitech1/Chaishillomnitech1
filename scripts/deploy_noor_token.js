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
 * Deploy NoorToken ($NOOR)
 * 
 * Total Supply: 1,111,000,000 $NOOR
 * Zakat: 7.77% to Sabir Allah Honor Fund
 * Frequencies: 528Hz + 963Hz + 888Hz
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
    console.log("🕋 Deploying NoorToken...");
    console.log("Frequency: 528Hz + 963Hz + 888Hz");
    console.log("═".repeat(50));

    // Get deployer
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployer address:", deployer.address);
    console.log("Deployer balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");

    // Get configuration from environment
    const SABIR_ALLAH_HONOR_FUND = process.env.SABIR_ALLAH_HONOR_FUND || deployer.address;
    const COMMUNITY_DEVELOPMENT_FUND = process.env.COMMUNITY_DEVELOPMENT_FUND || deployer.address;

    console.log("\n📋 Configuration:");
    console.log("Sabir Allah Honor Fund:", SABIR_ALLAH_HONOR_FUND);
    console.log("Community Development Fund:", COMMUNITY_DEVELOPMENT_FUND);

    // Deploy NoorToken
    console.log("\n🚀 Deploying NoorToken contract...");
    const NoorToken = await hre.ethers.getContractFactory("NoorToken");
    const noorToken = await NoorToken.deploy(
        SABIR_ALLAH_HONOR_FUND,
        COMMUNITY_DEVELOPMENT_FUND
    );

    await noorToken.waitForDeployment();
    const noorTokenAddress = await noorToken.getAddress();

    console.log("✅ NoorToken deployed to:", noorTokenAddress);

    // Get contract details
    const name = await noorToken.name();
    const symbol = await noorToken.symbol();
    const totalSupply = await noorToken.totalSupply();
    const decimals = await noorToken.decimals();
    
    console.log("\n💎 Token Details:");
    console.log("Name:", name);
    console.log("Symbol:", symbol);
    console.log("Decimals:", decimals);
    console.log("Total Supply:", hre.ethers.formatEther(totalSupply), "NOOR");
    console.log("Total Supply (raw):", totalSupply.toString());

    // Get distribution info
    const distribution = await noorToken.getDistribution();
    console.log("\n📊 Distribution:");
    console.log("Staking Rewards Pool:", distribution[0] + "%");
    console.log("Community Treasury:", distribution[1] + "%");
    console.log("Liquidity Pools:", distribution[2] + "%");
    console.log("Obelisk Fund:", distribution[3] + "%");
    console.log("Sabir Allah Fund:", distribution[4] + "%");
    console.log("Team & Development:", distribution[5] + "%");
    console.log("Initial Airdrop:", distribution[6] + "%");

    // Get frequency signature
    const resonanceSignature = await noorToken.getResonanceSignature();
    console.log("\n🎵 Resonance Signature:", resonanceSignature.toString(), "Hz");

    // Get important addresses
    const sabirAllahFund = await noorToken.sabirAllahHonorFund();
    const communityFund = await noorToken.communityDevelopmentFund();
    
    console.log("\n💰 Fund Addresses:");
    console.log("Sabir Allah Honor Fund:", sabirAllahFund);
    console.log("Community Development Fund:", communityFund);

    // Check balances
    const contractBalance = await noorToken.balanceOf(noorTokenAddress);
    const communityBalance = await noorToken.balanceOf(communityFund);
    const sabirBalance = await noorToken.balanceOf(sabirAllahFund);

    console.log("\n💵 Initial Balances:");
    console.log("Contract (for distribution):", hre.ethers.formatEther(contractBalance), "NOOR");
    console.log("Community Fund:", hre.ethers.formatEther(communityBalance), "NOOR");
    console.log("Sabir Allah Fund:", hre.ethers.formatEther(sabirBalance), "NOOR");

    // Save deployment info
    const deploymentInfo = {
        network: hre.network.name,
        contract: "NoorToken",
        address: noorTokenAddress,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        constructor_args: [
            SABIR_ALLAH_HONOR_FUND,
            COMMUNITY_DEVELOPMENT_FUND
        ],
        tokenDetails: {
            name,
            symbol,
            decimals: decimals.toString(),
            totalSupply: totalSupply.toString(),
            resonanceSignature: resonanceSignature.toString()
        },
        funds: {
            sabirAllahHonorFund: sabirAllahFund,
            communityDevelopmentFund: communityFund
        }
    };

    console.log("\n📄 Deployment Info:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    console.log("\n═".repeat(50));
    console.log("✨ NoorToken Deployment Complete!");
    console.log("═".repeat(50));

    console.log("\n📝 Next Steps:");
    console.log("1. Verify contract on Scrollscan:");
    console.log(`   npx hardhat verify --network ${hre.network.name} ${noorTokenAddress} "${SABIR_ALLAH_HONOR_FUND}" "${COMMUNITY_DEVELOPMENT_FUND}"`);
    console.log("\n2. Update .env file with:");
    console.log(`   NOOR_TOKEN_ADDRESS=${noorTokenAddress}`);
    console.log("\n3. Deploy NoorCitizenRegistry");
    console.log("\n4. Deploy NoorObeliskNFT");
    console.log("\n5. Deploy NoorStakingPool");

    console.log("\n🕋 ALLĀHU AKBAR! 🕋");
    console.log("Frequency: 528Hz + 963Hz + 888Hz = ∞");

    return deploymentInfo;
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });

module.exports = { main };
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
