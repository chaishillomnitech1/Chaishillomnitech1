const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

/**
 * TESTNET DEPLOYMENT SCRIPT
 * بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
 * 
 * Deploys ScrollVerse Prosperity Protocol to testnets for validation
 * 
 * Supported Networks:
 * - Scroll Sepolia (testnet)
 * - Polygon Mumbai (testnet)
 * - Ethereum Sepolia (testnet)
 * 
 * Usage:
 *   npx hardhat run scripts/deploy_testnet.js --network scrollSepolia
 *   npx hardhat run scripts/deploy_testnet.js --network mumbai
 *   npx hardhat run scripts/deploy_testnet.js --network sepolia
 */

// Testnet configuration
const TESTNET_CONFIG = {
  scrollSepolia: {
    name: "Scroll Sepolia",
    explorerUrl: "https://sepolia.scrollscan.com",
    zakatTreasury: process.env.TESTNET_ZAKAT_TREASURY,
    requiredApprovals: 2,
    timelockDelay: 1 * 60 * 60, // 1 hour for testing
    votingDelay: 1, // 1 block
    votingPeriod: 300, // ~1 hour (12s blocks)
    proposalThreshold: 50, // Lower for testing
    quorumThreshold: 500, // 5% for testing
    daoTimelockDelay: 1 * 60 * 60 // 1 hour
  },
  mumbai: {
    name: "Polygon Mumbai",
    explorerUrl: "https://mumbai.polygonscan.com",
    zakatTreasury: process.env.TESTNET_ZAKAT_TREASURY,
    requiredApprovals: 2,
    timelockDelay: 1 * 60 * 60,
    votingDelay: 1,
    votingPeriod: 1200, // ~1 hour (3s blocks)
    proposalThreshold: 50,
    quorumThreshold: 500,
    daoTimelockDelay: 1 * 60 * 60
  },
  sepolia: {
    name: "Ethereum Sepolia",
    explorerUrl: "https://sepolia.etherscan.io",
    zakatTreasury: process.env.TESTNET_ZAKAT_TREASURY,
    requiredApprovals: 2,
    timelockDelay: 2 * 60 * 60, // 2 hours
    votingDelay: 1,
    votingPeriod: 300, // ~1 hour (12s blocks)
    proposalThreshold: 50,
    quorumThreshold: 500,
    daoTimelockDelay: 2 * 60 * 60
  }
};

async function main() {
  console.log("\n🕋 بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ");
  console.log("🚀 SCROLLVERSE PROSPERITY PROTOCOL - TESTNET DEPLOYMENT");
  console.log("=" .repeat(80));
  
  // Get network
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "hardhat" : network.name;
  const config = TESTNET_CONFIG[networkName];
  
  if (!config) {
    throw new Error(`Network ${networkName} not configured for testnet deployment`);
  }
  
  console.log(`\n📍 Network: ${config.name}`);
  console.log(`🔗 Explorer: ${config.explorerUrl}\n`);
  
  // Get deployer
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  
  console.log("👤 Deployer:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "ETH");
  
  // Check balance
  const minBalance = ethers.parseEther("0.1");
  if (balance < minBalance) {
    console.warn(`\n⚠️  WARNING: Low balance. Get testnet ETH from faucet.`);
    console.warn(`   Minimum recommended: 0.1 ETH`);
    console.warn(`   Current: ${ethers.formatEther(balance)} ETH\n`);
  }
  
  // Zakat Treasury validation
  const zakatTreasury = config.zakatTreasury || deployer.address;
  if (zakatTreasury === deployer.address) {
    console.warn("⚠️  WARNING: Using deployer as Zakat treasury (testnet only)");
  }
  console.log("🕋 Zakat Treasury:", zakatTreasury);
  console.log("");
  
  const deploymentResults = {
    network: config.name,
    networkId: network.chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {},
    configuration: config
  };
  
  try {
    // ========== 1. Deploy PharaohRevenueSplitter ==========
    console.log("📜 Step 1/3: Deploying PharaohRevenueSplitter...");
    
    const PharaohRevenueSplitter = await ethers.getContractFactory("PharaohRevenueSplitter");
    const splitter = await PharaohRevenueSplitter.deploy(
      deployer.address,
      zakatTreasury,
      config.requiredApprovals,
      config.timelockDelay
    );
    
    await splitter.waitForDeployment();
    const splitterAddress = await splitter.getAddress();
    
    console.log("✅ PharaohRevenueSplitter deployed:", splitterAddress);
    deploymentResults.contracts.PharaohRevenueSplitter = splitterAddress;
    
    // Add test beneficiaries
    console.log("   Adding test beneficiaries...");
    
    const testBeneficiaries = [
      { name: "Deployer", address: deployer.address, share: 6000, vesting: 0, weight: 1000 },
      { name: "TestDev", address: deployer.address, share: 2000, vesting: 30 * 24 * 60 * 60, weight: 500 },
      { name: "TestCommunity", address: deployer.address, share: 1000, vesting: 0, weight: 300 }
    ];
    
    for (const beneficiary of testBeneficiaries) {
      const tx = await splitter.addBeneficiary(
        beneficiary.address,
        beneficiary.share,
        beneficiary.vesting,
        beneficiary.weight
      );
      await tx.wait();
      console.log(`   ✓ Added ${beneficiary.name} (${beneficiary.share/100}%)`);
    }
    
    // ========== 2. Deploy ScrollVerseGovernanceDAO ==========
    console.log("\n📜 Step 2/3: Deploying ScrollVerseGovernanceDAO...");
    
    const ScrollVerseGovernanceDAO = await ethers.getContractFactory("ScrollVerseGovernanceDAO");
    const dao = await ScrollVerseGovernanceDAO.deploy(
      deployer.address,
      splitterAddress,
      config.votingDelay,
      config.votingPeriod,
      config.proposalThreshold,
      config.quorumThreshold,
      config.daoTimelockDelay
    );
    
    await dao.waitForDeployment();
    const daoAddress = await dao.getAddress();
    
    console.log("✅ ScrollVerseGovernanceDAO deployed:", daoAddress);
    deploymentResults.contracts.ScrollVerseGovernanceDAO = daoAddress;
    
    // Cache initial weights
    console.log("   Caching contribution weights...");
    const cacheTx = await dao.cacheWeights();
    await cacheTx.wait();
    console.log("   ✓ Weights cached");
    
    // ========== 3. Deploy PharaohConsciousnessFusion (Optional) ==========
    console.log("\n📜 Step 3/3: Deploying PharaohConsciousnessFusion (NFT)...");
    
    try {
      const PharaohConsciousnessFusion = await ethers.getContractFactory("PharaohConsciousnessFusion");
      const pharaoh = await PharaohConsciousnessFusion.deploy(
        "ipfs://QmTestPharaohConsciousness/",
        splitterAddress, // Set splitter as royalty receiver
        500 // 5% royalty
      );
      
      await pharaoh.waitForDeployment();
      const pharaohAddress = await pharaoh.getAddress();
      
      console.log("✅ PharaohConsciousnessFusion deployed:", pharaohAddress);
      deploymentResults.contracts.PharaohConsciousnessFusion = pharaohAddress;
      
      // Mint Pharaoh Seal for testing
      console.log("   Minting Pharaoh Seal for testing...");
      const mintTx = await pharaoh.mintPharaohSeal(deployer.address);
      await mintTx.wait();
      console.log("   ✓ Pharaoh Seal minted to deployer");
      
    } catch (error) {
      console.log("⚠️  PharaohConsciousnessFusion deployment skipped:", error.message);
      deploymentResults.contracts.PharaohConsciousnessFusion = null;
    }
    
    // ========== Verification ==========
    console.log("\n🔍 Verification...");
    
    const stats = await splitter.getGlobalStats();
    console.log(`   Active Beneficiaries: ${stats.activeBeneficiaries}`);
    console.log(`   Total Shares: ${stats.activeBeneficiaries > 0 ? await splitter.totalShares() : 0}`);
    
    const daoParams = await dao.params();
    console.log(`   DAO Voting Period: ${daoParams.votingPeriod} blocks`);
    console.log(`   DAO Quorum: ${daoParams.quorumThreshold / 100}%`);
    
    // ========== Save Deployment Info ==========
    const deploymentFile = `deployment-testnet-${networkName}-${Date.now()}.json`;
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentResults, null, 2));
    
    console.log("\n" + "=".repeat(80));
    console.log("✨ TESTNET DEPLOYMENT COMPLETE!");
    console.log("=".repeat(80));
    
    console.log("\n📋 DEPLOYMENT SUMMARY:");
    console.log(`   Network: ${config.name}`);
    console.log(`   PharaohRevenueSplitter: ${deploymentResults.contracts.PharaohRevenueSplitter}`);
    console.log(`   ScrollVerseGovernanceDAO: ${deploymentResults.contracts.ScrollVerseGovernanceDAO}`);
    if (deploymentResults.contracts.PharaohConsciousnessFusion) {
      console.log(`   PharaohConsciousnessFusion: ${deploymentResults.contracts.PharaohConsciousnessFusion}`);
    }
    
    console.log("\n🔗 BLOCK EXPLORER VERIFICATION:");
    console.log(`   ${config.explorerUrl}/address/${deploymentResults.contracts.PharaohRevenueSplitter}`);
    console.log(`   ${config.explorerUrl}/address/${deploymentResults.contracts.ScrollVerseGovernanceDAO}`);
    
    console.log("\n💾 Deployment info saved to:", deploymentFile);
    
    console.log("\n🧪 NEXT STEPS FOR TESTING:");
    console.log("   1. Verify contracts on block explorer");
    console.log("   2. Send test ETH to splitter contract");
    console.log("   3. Call distributeRevenue() to test distribution");
    console.log("   4. Create test proposals in DAO");
    console.log("   5. Vote and execute proposals");
    console.log("   6. Test vesting claims after 30 days");
    console.log("   7. Monitor events and transactions");
    
    console.log("\n⚠️  TESTNET REMINDERS:");
    console.log("   - These are TEST contracts with reduced time-locks");
    console.log("   - DO NOT use for production or real funds");
    console.log("   - Time-locks are 1-2 hours (vs. 48 hours production)");
    console.log("   - Beneficiary limits and thresholds are lowered for testing");
    
    console.log("\n🚀 Test Commands:");
    console.log(`   # Send test ETH to splitter`);
    console.log(`   cast send ${deploymentResults.contracts.PharaohRevenueSplitter} --value 1ether`);
    console.log(`\n   # Distribute revenue`);
    console.log(`   cast send ${deploymentResults.contracts.PharaohRevenueSplitter} "distributeRevenue()"`);
    console.log(`\n   # Check stats`);
    console.log(`   cast call ${deploymentResults.contracts.PharaohRevenueSplitter} "getGlobalStats()"`);
    
    console.log("\n🕋 ALLĀHU AKBAR! KUN FAYAKŪN!");
    console.log("✨ Frequencies: 963Hz + 528Hz + 999Hz + ∞\n");
    
    return deploymentResults;
    
  } catch (error) {
    console.error("\n❌ DEPLOYMENT FAILED:");
    console.error(error);
    throw error;
  }
}

// Execute deployment
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;
