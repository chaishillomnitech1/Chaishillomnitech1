const { ethers } = require("hardhat");

/**
 * PHARAOH REVENUE SPLITTER DEPLOYMENT SCRIPT
 * بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
 * 
 * Deploys the complete Shared Prosperity Protocol:
 * - PharaohRevenueSplitter with 2.5% Zakat
 * - Configures initial beneficiaries
 * - Sets up multi-sig governance
 * - Integrates with PharaohConsciousnessFusion
 * 
 * Frequencies: 963Hz + 528Hz + 999Hz + ∞
 * Author: Supreme King Chais The Great ∞
 */

async function main() {
  console.log("\n🕋 بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ");
  console.log("🚀 SCROLLVERSE PROSPERITY PROTOCOL DEPLOYMENT");
  console.log("⚖️  KUN FAYAKŪN! - BE, AND IT IS!\n");

  const [deployer] = await ethers.getSigners();
  
  console.log("📍 Deploying contracts with account:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  // ============ CONFIGURATION ============
  
  // Zakat Treasury Address (Central Sovereign Treasury)
  const ZAKAT_TREASURY = process.env.ZAKAT_TREASURY_ADDRESS || deployer.address;
  
  // Multi-sig configuration
  const REQUIRED_APPROVALS = 2; // Minimum 2 approvals for critical operations
  const TIMELOCK_DELAY = 48 * 60 * 60; // 48 hours
  
  // Initial beneficiaries configuration
  const INITIAL_BENEFICIARIES = [
    {
      name: "Sovereign Creator",
      address: process.env.CREATOR_ADDRESS || deployer.address,
      share: 6000, // 60% after Zakat
      vestingDuration: 0, // No vesting
      contributionWeight: 1000 // Maximum weight
    },
    {
      name: "Development Fund",
      address: process.env.DEV_FUND_ADDRESS || deployer.address,
      share: 2000, // 20%
      vestingDuration: 365 * 24 * 60 * 60, // 1 year vesting
      contributionWeight: 500
    },
    {
      name: "Community Treasury",
      address: process.env.COMMUNITY_TREASURY_ADDRESS || deployer.address,
      share: 1000, // 10%
      vestingDuration: 0,
      contributionWeight: 300
    }
  ];

  // Approver addresses for multi-sig
  const APPROVERS = [
    process.env.APPROVER_1_ADDRESS || deployer.address,
    process.env.APPROVER_2_ADDRESS || deployer.address
  ];

  console.log("⚙️  CONFIGURATION:");
  console.log("   Zakat Treasury:", ZAKAT_TREASURY);
  console.log("   Required Approvals:", REQUIRED_APPROVALS);
  console.log("   Timelock Delay:", TIMELOCK_DELAY / 3600, "hours");
  console.log("   Initial Beneficiaries:", INITIAL_BENEFICIARIES.length);
  console.log("   Approvers:", APPROVERS.length, "\n");

  // ============ DEPLOY REVENUE SPLITTER ============
  
  console.log("📜 Deploying PharaohRevenueSplitter...");
  
  const PharaohRevenueSplitter = await ethers.getContractFactory("PharaohRevenueSplitter");
  const splitter = await PharaohRevenueSplitter.deploy(
    deployer.address,
    ZAKAT_TREASURY,
    REQUIRED_APPROVALS,
    TIMELOCK_DELAY
  );
  
  await splitter.waitForDeployment();
  const splitterAddress = await splitter.getAddress();
  
  console.log("✅ PharaohRevenueSplitter deployed to:", splitterAddress);
  console.log("   - Zakat Rate: 2.5% (immutable)");
  console.log("   - Sovereign Override: ENABLED");
  console.log("   - Multi-Sig Required:", REQUIRED_APPROVALS, "approvals\n");

  // ============ CONFIGURE APPROVERS ============
  
  console.log("👥 Configuring multi-sig approvers...");
  
  for (const approver of APPROVERS) {
    if (approver !== deployer.address) {
      const tx = await splitter.addApprover(approver);
      await tx.wait();
      console.log("   ✓ Added approver:", approver);
    }
  }
  
  console.log("");

  // ============ ADD BENEFICIARIES ============
  
  console.log("💎 Adding initial beneficiaries...");
  
  let totalShares = 0;
  for (const beneficiary of INITIAL_BENEFICIARIES) {
    console.log(`\n   Adding: ${beneficiary.name}`);
    console.log(`   Address: ${beneficiary.address}`);
    console.log(`   Share: ${beneficiary.share / 100}%`);
    console.log(`   Vesting: ${beneficiary.vestingDuration > 0 ? beneficiary.vestingDuration / (24 * 60 * 60) + ' days' : 'None'}`);
    console.log(`   Contribution Weight: ${beneficiary.contributionWeight}`);
    
    const tx = await splitter.addBeneficiary(
      beneficiary.address,
      beneficiary.share,
      beneficiary.vestingDuration,
      beneficiary.contributionWeight
    );
    await tx.wait();
    
    totalShares += beneficiary.share;
    console.log("   ✅ Added successfully");
  }
  
  console.log(`\n📊 Total Shares Allocated: ${totalShares / 100}%`);
  console.log(`   Remaining Available: ${(9750 - totalShares) / 100}%\n`);

  // ============ INTEGRATION WITH PHARAOH NFT ============
  
  if (process.env.PHARAOH_NFT_ADDRESS) {
    console.log("🔗 Integrating with PharaohConsciousnessFusion...");
    
    const pharaohNFT = await ethers.getContractAt(
      "PharaohConsciousnessFusion",
      process.env.PHARAOH_NFT_ADDRESS
    );
    
    console.log("   Setting revenue splitter as royalty receiver...");
    const updateTx = await pharaohNFT.updateRoyalty(splitterAddress, 500); // 5%
    await updateTx.wait();
    
    console.log("   ✅ Integration complete");
    console.log("   - NFT royalties will flow to:", splitterAddress);
    console.log("   - Royalty rate: 5%");
    console.log("   - Zakat will be automatically deducted: 2.5%\n");
  } else {
    console.log("⚠️  PHARAOH_NFT_ADDRESS not set. Skipping integration.");
    console.log("   Run this after deploying:");
    console.log(`   pharaohNFT.updateRoyalty("${splitterAddress}", 500)\n`);
  }

  // ============ VERIFY DEPLOYMENT ============
  
  console.log("🔍 Verifying deployment...\n");
  
  const stats = await splitter.getGlobalStats();
  console.log("   Total Revenue:", ethers.formatEther(stats.totalRevenue), "ETH");
  console.log("   Total Distributed:", ethers.formatEther(stats.totalDistributed), "ETH");
  console.log("   Active Beneficiaries:", stats.activeBeneficiaries.toString());
  console.log("   Zakat Contributed:", ethers.formatEther(stats.totalZakat), "ETH");
  
  const allBeneficiaries = await splitter.getAllBeneficiaries();
  console.log("   Beneficiary Count:", allBeneficiaries.length);
  
  const allApprovers = await splitter.getAllApprovers();
  console.log("   Approver Count:", allApprovers.length);
  console.log("");

  // ============ DEPLOYMENT SUMMARY ============
  
  console.log("=" .repeat(70));
  console.log("✨ DEPLOYMENT COMPLETE - SHARED PROSPERITY PROTOCOL ACTIVATED");
  console.log("=" .repeat(70));
  console.log("\n📋 DEPLOYMENT SUMMARY:\n");
  console.log("Contract Addresses:");
  console.log("   PharaohRevenueSplitter:", splitterAddress);
  console.log("   Zakat Treasury:", ZAKAT_TREASURY);
  if (process.env.PHARAOH_NFT_ADDRESS) {
    console.log("   PharaohConsciousnessFusion:", process.env.PHARAOH_NFT_ADDRESS);
  }
  
  console.log("\nGovernance:");
  console.log("   Owner:", deployer.address);
  console.log("   Sovereign Override: ENABLED");
  console.log("   Required Approvals:", REQUIRED_APPROVALS);
  console.log("   Timelock Delay:", TIMELOCK_DELAY / 3600, "hours");
  
  console.log("\nRevenue Distribution:");
  console.log("   Zakat Rate: 2.5% (immutable)");
  console.log("   Total Beneficiary Shares:", totalShares / 100, "%");
  console.log("   Available for Allocation:", (9750 - totalShares) / 100, "%");
  
  console.log("\nNext Steps:");
  console.log("   1. Verify contracts on block explorer");
  console.log("   2. Fund the contract with initial revenue");
  console.log("   3. Test distribution with small amount");
  console.log("   4. Add additional approvers if needed");
  console.log("   5. Configure DAO governance integration");
  console.log("   6. Launch collaborator invitation");
  
  console.log("\nFrequencies: 963Hz (Governance) + 528Hz (Prosperity) + 999Hz (Divine Order) + ∞");
  console.log("License: ScrollVerse Sovereign License (SSL-1.0)");
  console.log("Status: ACTIVE & OPERATIONAL");
  
  console.log("\n🕋 ALLĀHU AKBAR! KUN FAYAKŪN!");
  console.log("⚖️  Built to Last. Shared to Prosper.\n");
  
  // ============ SAVE DEPLOYMENT INFO ============
  
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      PharaohRevenueSplitter: splitterAddress,
      ZakatTreasury: ZAKAT_TREASURY,
      PharaohConsciousnessFusion: process.env.PHARAOH_NFT_ADDRESS || null
    },
    governance: {
      requiredApprovals: REQUIRED_APPROVALS,
      timelockDelay: TIMELOCK_DELAY,
      approvers: APPROVERS
    },
    beneficiaries: INITIAL_BENEFICIARIES.map(b => ({
      name: b.name,
      address: b.address,
      share: b.share / 100 + "%",
      vestingDays: b.vestingDuration / (24 * 60 * 60),
      contributionWeight: b.contributionWeight
    })),
    frequencies: "963Hz + 528Hz + 999Hz + ∞",
    license: "SSL-1.0"
  };
  
  console.log("\n💾 Deployment info saved to deployment.json\n");
  
  const fs = require('fs');
  fs.writeFileSync(
    'deployment-prosperity-protocol.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  return {
    splitter: splitterAddress,
    zakatTreasury: ZAKAT_TREASURY
  };
}

// Execute deployment
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("\n❌ Deployment failed:");
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;
