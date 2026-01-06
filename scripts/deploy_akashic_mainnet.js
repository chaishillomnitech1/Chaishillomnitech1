// Akashic Records Label - Polygon Mainnet Deployment Script
// KUN FAYAKŪN - The Genesis Activation for the Akashic Empire
// Deploys: Label, DAO, Treasury Vault with Zakat routing

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("═".repeat(80));
  console.log("🕋 AKASHIC RECORDS LABEL - MAINNET ACTIVATION 🕋");
  console.log("═".repeat(80));
  console.log("");
  console.log("  KUN FAYAKŪN - BE, AND IT IS!");
  console.log("  Deploying the Akashic Empire to Polygon Mainnet");
  console.log("  Frequency: 528Hz (Love) + 963Hz (Unity) + 999Hz (Crown)");
  console.log("");
  console.log("═".repeat(80));
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("\n📋 Deployment Account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account Balance:", hre.ethers.formatEther(balance), "MATIC");
  
  if (parseFloat(hre.ethers.formatEther(balance)) < 10) {
    console.log("\n⚠️  WARNING: Low MATIC balance. Recommended: 10+ MATIC for mainnet deployment");
    console.log("Please fund your wallet before continuing.");
    process.exit(1);
  }
  
  console.log("\n" + "═".repeat(80));
  console.log("STEP 1: TREASURY VAULT CONFIGURATION");
  console.log("═".repeat(80));
  
  // Treasury wallet addresses - Configure these for production
  const ARTIST_VAULT = process.env.ARTIST_VAULT_ADDRESS || deployer.address;
  const TREASURY_VAULT = process.env.TREASURY_VAULT_ADDRESS || deployer.address;
  const ZAKAT_VAULT = process.env.ZAKAT_VAULT_ADDRESS || deployer.address;
  const RESERVE_VAULT = process.env.RESERVE_VAULT_ADDRESS || deployer.address;
  
  console.log("\n📊 Vault Configuration:");
  console.log("  Artist Vault (70%):", ARTIST_VAULT);
  console.log("  Treasury Vault (15%):", TREASURY_VAULT);
  console.log("  Zakat Vault (7.77%):", ZAKAT_VAULT);
  console.log("  Reserve Vault (7.23%):", RESERVE_VAULT);
  
  if (ARTIST_VAULT === deployer.address) {
    console.log("\n⚠️  WARNING: Using deployer address for vaults.");
    console.log("For production, configure multi-sig wallets in .env:");
    console.log("  - ARTIST_VAULT_ADDRESS");
    console.log("  - TREASURY_VAULT_ADDRESS");
    console.log("  - ZAKAT_VAULT_ADDRESS");
    console.log("  - RESERVE_VAULT_ADDRESS");
  }
  
  // Deploy Treasury Vault
  console.log("\n⚡ Deploying AkashicTreasuryVault...");
  const AkashicTreasuryVault = await hre.ethers.getContractFactory("AkashicTreasuryVault");
  const treasuryVault = await AkashicTreasuryVault.deploy(
    ARTIST_VAULT,
    TREASURY_VAULT,
    ZAKAT_VAULT,
    RESERVE_VAULT
  );
  await treasuryVault.waitForDeployment();
  const treasuryVaultAddress = await treasuryVault.getAddress();
  console.log("✅ Treasury Vault deployed:", treasuryVaultAddress);
  
  console.log("\n" + "═".repeat(80));
  console.log("STEP 2: AKASHIC RECORDS LABEL DEPLOYMENT");
  console.log("═".repeat(80));
  
  // Label configuration
  const BASE_URI = process.env.AKASHIC_BASE_URI || "ipfs://QmAkashicRecordsLabel/";
  const ROYALTY_RECIPIENT = treasuryVaultAddress; // Route royalties through vault
  
  console.log("\n📜 Label Configuration:");
  console.log("  Base URI:", BASE_URI);
  console.log("  Royalty Recipient:", ROYALTY_RECIPIENT);
  console.log("  Royalty Rate: 10% (1000 basis points)");
  
  console.log("\n⚡ Deploying AkashicRecordsLabel...");
  const AkashicRecordsLabel = await hre.ethers.getContractFactory("AkashicRecordsLabel");
  const akashicLabel = await AkashicRecordsLabel.deploy(
    BASE_URI,
    ROYALTY_RECIPIENT,
    treasuryVaultAddress
  );
  await akashicLabel.waitForDeployment();
  const labelAddress = await akashicLabel.getAddress();
  console.log("✅ Label Contract deployed:", labelAddress);
  
  console.log("\n" + "═".repeat(80));
  console.log("STEP 3: DAO GOVERNANCE DEPLOYMENT");
  console.log("═".repeat(80));
  
  console.log("\n⚡ Deploying AkashicRecordsDAO...");
  const AkashicRecordsDAO = await hre.ethers.getContractFactory("AkashicRecordsDAO");
  const akashicDAO = await AkashicRecordsDAO.deploy(labelAddress);
  await akashicDAO.waitForDeployment();
  const daoAddress = await akashicDAO.getAddress();
  console.log("✅ DAO Contract deployed:", daoAddress);
  
  console.log("\n" + "═".repeat(80));
  console.log("STEP 4: VERIFICATION & VALIDATION");
  console.log("═".repeat(80));
  
  // Verify Treasury Vault
  console.log("\n🔍 Verifying Treasury Vault...");
  const percentages = await treasuryVault.getDistributionPercentages();
  console.log("  Artist Allocation:", percentages[0].toString() / 100, "%");
  console.log("  Treasury Allocation:", percentages[1].toString() / 100, "%");
  console.log("  Zakat Allocation:", percentages[2].toString() / 100, "%");
  console.log("  Reserve Allocation:", percentages[3].toString() / 100, "%");
  
  // Verify Label
  console.log("\n🔍 Verifying Label Contract...");
  console.log("  Total Supply:", (await akashicLabel.totalSupply()).toString());
  console.log("  Sacred Frequencies:");
  console.log("    - 528 Hz (Love):", (await akashicLabel.HEALING_FREQUENCY_528HZ()).toString());
  console.log("    - 963 Hz (Unity):", (await akashicLabel.UNITY_FREQUENCY_963HZ()).toString());
  console.log("    - 999 Hz (Crown):", (await akashicLabel.CROWN_FREQUENCY_999HZ()).toString());
  console.log("    - 144,000 Hz (NŪR):", (await akashicLabel.NUR_PULSE_144000HZ()).toString());
  
  // Verify DAO
  console.log("\n🔍 Verifying DAO Contract...");
  console.log("  Member Count:", (await akashicDAO.getMemberCount()).toString());
  console.log("  Founding Members:", (await akashicDAO.foundingMembersCount()).toString() + "/50");
  console.log("  Quorum:", (await akashicDAO.QUORUM_PERCENTAGE()).toString() + "%");
  console.log("  Min Voting Period:", (await akashicDAO.MIN_VOTING_PERIOD()).toString() / 86400, "days");
  console.log("  Max Voting Period:", (await akashicDAO.MAX_VOTING_PERIOD()).toString() / 86400, "days");
  
  console.log("\n" + "═".repeat(80));
  console.log("DEPLOYMENT SUMMARY");
  console.log("═".repeat(80));
  
  const deploymentSummary = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    contracts: {
      treasuryVault: {
        address: treasuryVaultAddress,
        artistVault: ARTIST_VAULT,
        treasuryVault: TREASURY_VAULT,
        zakatVault: ZAKAT_VAULT,
        reserveVault: RESERVE_VAULT
      },
      label: {
        address: labelAddress,
        baseURI: BASE_URI,
        royaltyRecipient: ROYALTY_RECIPIENT
      },
      dao: {
        address: daoAddress,
        labelContract: labelAddress
      }
    },
    frequencies: {
      love: 528,
      unity: 963,
      crown: 999,
      nur: 144000
    },
    royaltyDistribution: {
      artists: "70%",
      treasury: "15%",
      zakat: "7.77%",
      reserve: "7.23%"
    }
  };
  
  console.log("\n📊 Contract Addresses:");
  console.log("  Treasury Vault:", treasuryVaultAddress);
  console.log("  Label Contract:", labelAddress);
  console.log("  DAO Contract:", daoAddress);
  
  console.log("\n🌐 Network:", hre.network.name);
  console.log("📅 Deployed:", new Date().toISOString());
  console.log("📦 Block:", await hre.ethers.provider.getBlockNumber());
  
  // Save deployment info
  const deploymentsDir = path.join(__dirname, "..", "deployment");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const mainnetDir = path.join(deploymentsDir, "polygon-mainnet");
  if (!fs.existsSync(mainnetDir)) {
    fs.mkdirSync(mainnetDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(mainnetDir, "akashic-empire-deployment.json"),
    JSON.stringify(deploymentSummary, null, 2)
  );
  
  console.log("\n✅ Deployment info saved to deployment/polygon-mainnet/akashic-empire-deployment.json");
  
  console.log("\n" + "═".repeat(80));
  console.log("NEXT STEPS");
  console.log("═".repeat(80));
  
  console.log("\n1️⃣  Verify Contracts on PolygonScan:");
  console.log(`   npx hardhat verify --network polygon ${treasuryVaultAddress} "${ARTIST_VAULT}" "${TREASURY_VAULT}" "${ZAKAT_VAULT}" "${RESERVE_VAULT}"`);
  console.log(`   npx hardhat verify --network polygon ${labelAddress} "${BASE_URI}" "${ROYALTY_RECIPIENT}" "${treasuryVaultAddress}"`);
  console.log(`   npx hardhat verify --network polygon ${daoAddress} "${labelAddress}"`);
  
  console.log("\n2️⃣  Mint Genesis Catalog (26 tracks):");
  console.log("   Update scripts/mint_akashic_tracks.js with mainnet addresses");
  console.log("   npm run mint:akashic-tracks -- --network polygon");
  
  console.log("\n3️⃣  Onboard Founding Members (50 max):");
  console.log("   Update scripts/onboard_founding_members.js with member addresses");
  console.log("   npm run onboard:founding-members -- --network polygon");
  
  console.log("\n4️⃣  Fund Treasury for Operations:");
  console.log("   Send initial MATIC to treasury vault for operations");
  console.log("   Recommended: 1000+ MATIC for gas, oracles, and marketing");
  
  console.log("\n5️⃣  Create First DAO Proposal:");
  console.log("   - Catalog Expansion (100 tracks by Month 3)");
  console.log("   - Zakat Round 2 allocation");
  console.log("   - Artist onboarding program");
  
  console.log("\n6️⃣  Configure Streaming Integrations:");
  console.log("   - Connect Spotify API for play tracking");
  console.log("   - Set up Vydia distribution");
  console.log("   - Enable Chainlink oracles for pricing");
  
  console.log("\n" + "═".repeat(80));
  console.log("🕋 KUN FAYAKŪN - THE AKASHIC EMPIRE IS LIVE! 🕋");
  console.log("═".repeat(80));
  console.log("");
  console.log("  The Genesis Catalog is ready for immortalization.");
  console.log("  The DAO awaits its 50 founding prophets.");
  console.log("  The Treasury is configured for eternal abundance.");
  console.log("  Zakat flows automatically to those in need.");
  console.log("");
  console.log("  ALL IS LOVE. ALL IS LAW. ALL IS. ∞");
  console.log("");
  console.log("═".repeat(80));
  
  return deploymentSummary;
}

// Run deployment
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("\n❌ Deployment failed:", error);
      process.exit(1);
    });
}

module.exports = main;
