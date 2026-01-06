/**
 * @title Deploy Sabir Allah Honor Collection
 * @dev Deployment script for Shield of Honor NFT and Token contracts
 * @author Supreme King Chais The Great ∞
 * 
 * Chapter Ten: Shield of Honor Cultural Deployment
 */

const hre = require("hardhat");

async function main() {
  console.log("🛡️  CHAPTER TEN: SHIELD OF HONOR DEPLOYMENT 🛡️\n");
  console.log("BISMILLAH - In the name of the Divine\n");
  
  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString(), "\n");

  // ============ CONFIGURATION ============
  
  // NFT Configuration
  const NFT_BASE_URI = "ipfs://QmYOUR_IPFS_HASH/"; // Update with actual IPFS CID
  const ROYALTY_RECIPIENT = deployer.address; // Update with actual royalty recipient
  
  // Charity wallet addresses (UPDATE THESE WITH ACTUAL ADDRESSES)
  const CHARITY_WALLET = deployer.address; // Main charity distribution wallet
  const POLICE_WALLET = deployer.address;
  const FIREFIGHTERS_WALLET = deployer.address;
  const EMS_WALLET = deployer.address;
  const FOODBANK_WALLET = deployer.address;
  const YOUTH_WALLET = deployer.address;
  
  console.log("Configuration:");
  console.log("- NFT Base URI:", NFT_BASE_URI);
  console.log("- Royalty Recipient:", ROYALTY_RECIPIENT);
  console.log("- Charity Wallet:", CHARITY_WALLET);
  console.log("");

  // ============ DEPLOY NFT CONTRACT ============
  
  console.log("📜 Deploying SabirAllahHonorNFT contract...");
  const SabirAllahHonorNFT = await hre.ethers.getContractFactory("SabirAllahHonorNFT");
  const honorNFT = await SabirAllahHonorNFT.deploy(
    NFT_BASE_URI,
    ROYALTY_RECIPIENT,
    CHARITY_WALLET
  );
  
  await honorNFT.waitForDeployment();
  const nftAddress = await honorNFT.getAddress();
  console.log("✅ SabirAllahHonorNFT deployed to:", nftAddress);
  console.log("");

  // ============ DEPLOY TOKEN CONTRACT ============
  
  console.log("💰 Deploying SabirAllahHonorCoin contract...");
  const SabirAllahHonorCoin = await hre.ethers.getContractFactory("SabirAllahHonorCoin");
  const honorCoin = await SabirAllahHonorCoin.deploy(
    POLICE_WALLET,
    FIREFIGHTERS_WALLET,
    EMS_WALLET,
    FOODBANK_WALLET,
    YOUTH_WALLET
  );
  
  await honorCoin.waitForDeployment();
  const coinAddress = await honorCoin.getAddress();
  console.log("✅ SabirAllahHonorCoin deployed to:", coinAddress);
  console.log("");

  // ============ VERIFY DEPLOYMENT ============
  
  console.log("🔍 Verifying deployment...");
  
  // NFT verification
  const nftName = await honorNFT.name();
  const nftSymbol = await honorNFT.symbol();
  const nftMaxSupply = await honorNFT.MAX_SUPPLY();
  const nftTotalSupply = await honorNFT.totalSupply();
  
  console.log("NFT Contract Details:");
  console.log("- Name:", nftName);
  console.log("- Symbol:", nftSymbol);
  console.log("- Max Supply:", nftMaxSupply.toString());
  console.log("- Total Supply:", nftTotalSupply.toString());
  console.log("");
  
  // Token verification
  const coinName = await honorCoin.name();
  const coinSymbol = await honorCoin.symbol();
  const coinTotalSupply = await honorCoin.totalSupply();
  const coinCharityEnabled = await honorCoin.charityEnabled();
  
  console.log("Token Contract Details:");
  console.log("- Name:", coinName);
  console.log("- Symbol:", coinSymbol);
  console.log("- Total Supply:", hre.ethers.formatEther(coinTotalSupply), "HONOR");
  console.log("- Charity Enabled:", coinCharityEnabled);
  console.log("");

  // ============ DEPLOYMENT SUMMARY ============
  
  console.log("🎉 DEPLOYMENT COMPLETE 🎉\n");
  console.log("═══════════════════════════════════════════════════════");
  console.log("CHAPTER TEN: SHIELD OF HONOR DEPLOYMENT SUMMARY");
  console.log("═══════════════════════════════════════════════════════");
  console.log("");
  console.log("📋 Contract Addresses:");
  console.log("- SabirAllahHonorNFT:", nftAddress);
  console.log("- SabirAllahHonorCoin:", coinAddress);
  console.log("");
  console.log("🔧 Configuration:");
  console.log("- Network:", hre.network.name);
  console.log("- Deployer:", deployer.address);
  console.log("- NFT Base URI:", NFT_BASE_URI);
  console.log("- Royalty Recipient:", ROYALTY_RECIPIENT);
  console.log("");
  console.log("💎 NFT Collection:");
  console.log("- Total Supply: 100 NFTs");
  console.log("- Tier 1 (0-9): Legendary Guardians - 999 Hz");
  console.log("- Tier 2 (10-29): Elite Protectors - 963 Hz");
  console.log("- Tier 3 (30-69): Honor Guard - 777 Hz");
  console.log("- Tier 4 (70-99): Community Shield - 528 Hz");
  console.log("");
  console.log("💰 Token Economics:");
  console.log("- Total Supply: 1,000,000 $HONOR");
  console.log("- Charity Rate: 7.77% on all transfers");
  console.log("- Beneficiaries: Police, Firefighters, EMS, Food Banks, Youth Programs");
  console.log("");
  console.log("🛡️ Charity Wallets:");
  console.log("- Police (30%):", POLICE_WALLET);
  console.log("- Firefighters (30%):", FIREFIGHTERS_WALLET);
  console.log("- EMS (20%):", EMS_WALLET);
  console.log("- Food Banks (10%):", FOODBANK_WALLET);
  console.log("- Youth Programs (10%):", YOUTH_WALLET);
  console.log("");
  console.log("📝 Next Steps:");
  console.log("1. Verify contracts on PolygonScan:");
  console.log(`   npx hardhat verify --network ${hre.network.name} ${nftAddress} "${NFT_BASE_URI}" "${ROYALTY_RECIPIENT}" "${CHARITY_WALLET}"`);
  console.log(`   npx hardhat verify --network ${hre.network.name} ${coinAddress} "${POLICE_WALLET}" "${FIREFIGHTERS_WALLET}" "${EMS_WALLET}" "${FOODBANK_WALLET}" "${YOUTH_WALLET}"`);
  console.log("");
  console.log("2. Update NFT metadata with contract address");
  console.log("3. Configure OpenSea collection");
  console.log("4. Begin minting process");
  console.log("5. Announce launch to community");
  console.log("");
  console.log("═══════════════════════════════════════════════════════");
  console.log("ALLĀHU AKBAR! 🕋✨🛡️");
  console.log("The Shield of Honor is deployed.");
  console.log("═══════════════════════════════════════════════════════");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
