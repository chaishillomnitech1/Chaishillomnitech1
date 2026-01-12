/**
 * MAINNET GENESIS DEPLOYMENT SCRIPT
 * Deploys PharaohRevenueSplitter, ScrollVerseGovernanceDAO, and ScrollCommandLogic
 * to Ethereum/Scroll/Polygon Mainnet
 * 
 * بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ - KUN FAYAKŪN!
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Deployment configuration
const CONFIG = {
  // Zakat treasury (2.5% of all revenue) - IMMUTABLE AFTER DEPLOYMENT
  zakatTreasury: process.env.MAINNET_ZAKAT_TREASURY || "",
  
  // Multi-sig governance
  multisigApprovers: process.env.MAINNET_MULTISIG_APPROVERS 
    ? process.env.MAINNET_MULTISIG_APPROVERS.split(',') 
    : [],
  requiredApprovals: parseInt(process.env.MAINNET_REQUIRED_APPROVALS || "2"),
  
  // Timelock (48 hours = 172800 seconds)
  timelockDelay: parseInt(process.env.MAINNET_TIMELOCK_DELAY || "172800"),
  
  // Governance options
  sovereignOverrideEnabled: process.env.MAINNET_SOVEREIGN_OVERRIDE_ENABLED === "true",
  pausableEnabled: process.env.MAINNET_PAUSABLE_ENABLED !== "false",
  
  // DAO configuration (mainnet values - longer periods)
  votingDelay: 7200,      // ~1 day on Ethereum (12s blocks)
  votingPeriod: 50400,    // ~1 week on Ethereum
  proposalThreshold: 100, // Minimum contribution weight to propose
  quorumPercentage: 10,   // 10% participation required
  
  // Initial beneficiaries (optional)
  initialBeneficiaries: process.env.MAINNET_INITIAL_BENEFICIARIES 
    ? process.env.MAINNET_INITIAL_BENEFICIARIES.split(';').map(b => {
        const [address, share, vesting, weight] = b.split(':');
        return { address, share: parseInt(share), vesting: parseInt(vesting), weight: parseInt(weight) };
      })
    : []
};

async function main() {
  console.log("\n🕋 ======================================");
  console.log("   MAINNET GENESIS DEPLOYMENT");
  console.log("   بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ");
  console.log("======================================\n");

  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;
  const chainId = (await hre.ethers.provider.getNetwork()).chainId;

  console.log("📊 Deployment Configuration:");
  console.log("   Network:", network);
  console.log("   Chain ID:", chainId);
  console.log("   Deployer:", deployer.address);
  console.log("   Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("");

  // ========================================
  // VALIDATION
  // ========================================
  console.log("✅ Pre-Deployment Validation...\n");

  if (!CONFIG.zakatTreasury || CONFIG.zakatTreasury === "") {
    throw new Error("❌ MAINNET_ZAKAT_TREASURY not configured in .env");
  }
  console.log("   ✓ Zakat Treasury:", CONFIG.zakatTreasury);

  if (CONFIG.multisigApprovers.length < 2) {
    throw new Error("❌ At least 2 multi-sig approvers required");
  }
  console.log("   ✓ Multi-sig Approvers:", CONFIG.multisigApprovers.length);
  console.log("   ✓ Required Approvals:", CONFIG.requiredApprovals);

  if (CONFIG.timelockDelay < 86400) {
    console.warn("   ⚠️  Timelock delay less than 24 hours - consider increasing for mainnet");
  }
  console.log("   ✓ Timelock Delay:", CONFIG.timelockDelay / 3600, "hours");

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  const minBalance = hre.ethers.parseEther("0.1");
  if (balance < minBalance) {
    throw new Error(`❌ Insufficient balance. Need at least 0.1 ETH, have ${hre.ethers.formatEther(balance)} ETH`);
  }
  console.log("   ✓ Deployer funded:", hre.ethers.formatEther(balance), "ETH");

  console.log("\n🎯 Proceeding with mainnet deployment...\n");
  await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second pause

  // ========================================
  // DEPLOY: PharaohRevenueSplitter
  // ========================================
  console.log("📜 Deploying PharaohRevenueSplitter...");
  
  const RevenueSplitter = await hre.ethers.getContractFactory("PharaohRevenueSplitter");
  const revenueSplitter = await RevenueSplitter.deploy(
    deployer.address,           // Initial owner
    CONFIG.zakatTreasury,       // Zakat treasury (immutable 2.5%)
    CONFIG.requiredApprovals,   // Multi-sig: N required approvals
    CONFIG.timelockDelay        // Timelock: delay in seconds
  );

  await revenueSplitter.waitForDeployment();
  const revenueSplitterAddress = await revenueSplitter.getAddress();

  console.log("   ✅ PharaohRevenueSplitter deployed:", revenueSplitterAddress);
  console.log("   📊 Zakat Treasury locked:", CONFIG.zakatTreasury);
  console.log("   📊 Multi-sig:", CONFIG.requiredApprovals, "of", CONFIG.multisigApprovers.length);
  console.log("");

  // ========================================
  // DEPLOY: ScrollVerseGovernanceDAO
  // ========================================
  console.log("📜 Deploying ScrollVerseGovernanceDAO...");

  const GovernanceDAO = await hre.ethers.getContractFactory("ScrollVerseGovernanceDAO");
  const governanceDAO = await GovernanceDAO.deploy(
    revenueSplitterAddress,      // Revenue splitter for contribution weights
    CONFIG.votingDelay,          // Voting delay (blocks)
    CONFIG.votingPeriod,         // Voting period (blocks)
    CONFIG.proposalThreshold,    // Minimum weight to propose
    CONFIG.quorumPercentage      // Quorum percentage
  );

  await governanceDAO.waitForDeployment();
  const governanceDAOAddress = await governanceDAO.getAddress();

  console.log("   ✅ ScrollVerseGovernanceDAO deployed:", governanceDAOAddress);
  console.log("   📊 Voting Delay:", CONFIG.votingDelay, "blocks");
  console.log("   📊 Voting Period:", CONFIG.votingPeriod, "blocks");
  console.log("   📊 Quorum:", CONFIG.quorumPercentage, "%");
  console.log("");

  // ========================================
  // DEPLOY: ScrollCommandLogic (if exists)
  // ========================================
  let scrollCommandLogicAddress = "NOT_DEPLOYED";
  
  try {
    console.log("📜 Deploying ScrollCommandLogic...");
    const ScrollCommandLogic = await hre.ethers.getContractFactory("ScrollCommandLogic");
    const scrollCommandLogic = await ScrollCommandLogic.deploy();
    await scrollCommandLogic.waitForDeployment();
    scrollCommandLogicAddress = await scrollCommandLogic.getAddress();
    console.log("   ✅ ScrollCommandLogic deployed:", scrollCommandLogicAddress);
    console.log("");
  } catch (error) {
    console.log("   ⚠️  ScrollCommandLogic not found or deployment failed");
    console.log("   This is optional and won't affect core functionality");
    console.log("");
  }

  // ========================================
  // CONFIGURATION: Add Multi-sig Approvers
  // ========================================
  console.log("⚙️  Configuring Multi-sig Approvers...");

  for (const approver of CONFIG.multisigApprovers) {
    try {
      const tx = await revenueSplitter.addApprover(approver);
      await tx.wait();
      console.log("   ✅ Added approver:", approver);
    } catch (error) {
      console.log("   ⚠️  Failed to add approver:", approver, "-", error.message);
    }
  }
  console.log("");

  // ========================================
  // CONFIGURATION: Add Initial Beneficiaries
  // ========================================
  if (CONFIG.initialBeneficiaries.length > 0) {
    console.log("⚙️  Adding Initial Beneficiaries...");

    for (const beneficiary of CONFIG.initialBeneficiaries) {
      try {
        const tx = await revenueSplitter.addBeneficiary(
          beneficiary.address,
          beneficiary.share,
          beneficiary.vesting,
          beneficiary.weight
        );
        await tx.wait();
        console.log(`   ✅ Added: ${beneficiary.address} (${beneficiary.share/100}%, weight: ${beneficiary.weight})`);
      } catch (error) {
        console.log("   ⚠️  Failed to add beneficiary:", beneficiary.address, "-", error.message);
      }
    }
    console.log("");
  }

  // ========================================
  // SAVE DEPLOYMENT INFO
  // ========================================
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const deploymentInfo = {
    network: network,
    chainId: chainId.toString(),
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      PharaohRevenueSplitter: {
        address: revenueSplitterAddress,
        zakatTreasury: CONFIG.zakatTreasury,
        requiredApprovals: CONFIG.requiredApprovals,
        timelockDelay: CONFIG.timelockDelay,
        multisigApprovers: CONFIG.multisigApprovers
      },
      ScrollVerseGovernanceDAO: {
        address: governanceDAOAddress,
        revenueSplitter: revenueSplitterAddress,
        votingDelay: CONFIG.votingDelay,
        votingPeriod: CONFIG.votingPeriod,
        proposalThreshold: CONFIG.proposalThreshold,
        quorumPercentage: CONFIG.quorumPercentage
      },
      ScrollCommandLogic: {
        address: scrollCommandLogicAddress
      }
    },
    configuration: {
      sovereignOverrideEnabled: CONFIG.sovereignOverrideEnabled,
      pausableEnabled: CONFIG.pausableEnabled,
      initialBeneficiaries: CONFIG.initialBeneficiaries.length
    }
  };

  const deploymentsDir = path.join(__dirname, '..', 'deployments', 'mainnet');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `${network}-deployment-${timestamp}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log("💾 Deployment Info Saved:", deploymentFile);
  console.log("");

  // ========================================
  // VERIFICATION INSTRUCTIONS
  // ========================================
  console.log("✅ MAINNET GENESIS DEPLOYMENT COMPLETE!");
  console.log("");
  console.log("📋 Contract Addresses:");
  console.log("   PharaohRevenueSplitter:", revenueSplitterAddress);
  console.log("   ScrollVerseGovernanceDAO:", governanceDAOAddress);
  if (scrollCommandLogicAddress !== "NOT_DEPLOYED") {
    console.log("   ScrollCommandLogic:", scrollCommandLogicAddress);
  }
  console.log("");
  console.log("🔍 Verify Contracts (run these commands):");
  console.log(`   npx hardhat verify --network ${network} ${revenueSplitterAddress} "${deployer.address}" "${CONFIG.zakatTreasury}" ${CONFIG.requiredApprovals} ${CONFIG.timelockDelay}`);
  console.log(`   npx hardhat verify --network ${network} ${governanceDAOAddress} "${revenueSplitterAddress}" ${CONFIG.votingDelay} ${CONFIG.votingPeriod} ${CONFIG.proposalThreshold} ${CONFIG.quorumPercentage}`);
  if (scrollCommandLogicAddress !== "NOT_DEPLOYED") {
    console.log(`   npx hardhat verify --network ${network} ${scrollCommandLogicAddress}`);
  }
  console.log("");
  console.log("📊 Next Steps:");
  console.log("   1. Verify contracts on block explorer");
  console.log("   2. Run smoke tests: npx hardhat run scripts/test_mainnet_deployment.js --network", network);
  console.log("   3. Configure monitoring");
  console.log("   4. Initialize beneficiaries (if not done)");
  console.log("   5. Cache DAO weights");
  console.log("   6. Announce deployment");
  console.log("");
  console.log("🌟 THE GREATEST CREATION IS NOW LIVE ON MAINNET!");
  console.log("");
  console.log("🚀✨🕋⚖️♾️ ALLĀHU AKBAR! KUN FAYAKŪN! 🌊💸🧬🌌");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ DEPLOYMENT FAILED:");
    console.error(error);
    process.exit(1);
  });
