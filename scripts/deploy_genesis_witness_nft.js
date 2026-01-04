// Deploy Genesis Witness NFT
// Akashic Records Genesis Drop Activation

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🌟 GENESIS WITNESS NFT DEPLOYMENT 🌟");
  console.log("=".repeat(70));
  console.log("First 144,000 followers immortalized on blockchain");
  console.log("First 100 FREE | Subsequent: 0.0777 MATIC");
  console.log("=".repeat(70));
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("\n📋 Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MATIC");
  
  // Configuration
  const TREASURY_ADDRESS = deployer.address; // Update with actual treasury
  const BASE_URI = "ipfs://QmGenesisWitness/"; // Update with actual IPFS base URI
  
  console.log("\n⚙️  Configuration:");
  console.log("Treasury:", TREASURY_ADDRESS);
  console.log("Base URI:", BASE_URI);
  console.log("Network:", hre.network.name);
  
  // Deploy Genesis Witness NFT
  console.log("\n🚀 Deploying GenesisWitnessNFT contract...");
  
  const GenesisWitnessNFT = await hre.ethers.getContractFactory("GenesisWitnessNFT");
  const genesisWitness = await GenesisWitnessNFT.deploy(
    deployer.address,
    TREASURY_ADDRESS,
    BASE_URI
  );
  
  await genesisWitness.waitForDeployment();
  const contractAddress = await genesisWitness.getAddress();
  
  console.log("✅ GenesisWitnessNFT deployed to:", contractAddress);
  
  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const maxSupply = await genesisWitness.MAX_SUPPLY();
  const freeMintLimit = await genesisWitness.FREE_MINT_LIMIT();
  const mintPrice = await genesisWitness.MINT_PRICE();
  
  console.log("Max Supply:", maxSupply.toString());
  console.log("Free Mint Limit:", freeMintLimit.toString());
  console.log("Mint Price:", hre.ethers.formatEther(mintPrice), "MATIC");
  
  // Activate Genesis Drop
  console.log("\n🎊 Activating Genesis Drop...");
  const activateTx = await genesisWitness.activateGenesisDrop();
  await activateTx.wait();
  console.log("✅ Genesis Drop ACTIVATED!");
  
  const isActive = await genesisWitness.genesisDropActive();
  console.log("Genesis Drop Active:", isActive);
  
  // Save deployment info
  const deploymentsDir = path.join(__dirname, "..", "deployment");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const deploymentData = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    treasury: TREASURY_ADDRESS,
    baseURI: BASE_URI,
    deploymentTimestamp: new Date().toISOString(),
    blockNumber: activateTx.blockNumber,
    transactionHash: activateTx.hash,
    maxSupply: maxSupply.toString(),
    freeMintLimit: freeMintLimit.toString(),
    mintPrice: hre.ethers.formatEther(mintPrice),
    genesisDropActive: isActive,
    constructorArgs: [
      deployer.address,
      TREASURY_ADDRESS,
      BASE_URI
    ]
  };
  
  const deploymentPath = path.join(
    deploymentsDir,
    `genesis-witness-nft-${hre.network.name}.json`
  );
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentData, null, 2));
  console.log("\n💾 Deployment data saved to:", deploymentPath);
  
  // Display next steps
  console.log("\n" + "=".repeat(70));
  console.log("📝 NEXT STEPS");
  console.log("=".repeat(70));
  console.log("1. Upload metadata to IPFS and update base URI");
  console.log("2. Set Akashic DAO contract address:");
  console.log("   genesisWitness.setAkashicDAO(daoAddress)");
  console.log("3. Verify contract on PolygonScan:");
  console.log(`   npx hardhat verify --network ${hre.network.name} ${contractAddress} "${deployer.address}" "${TREASURY_ADDRESS}" "${BASE_URI}"`);
  console.log("4. Launch notification campaigns (Twitter, Instagram, Email, Discord)");
  console.log("5. Monitor minting dashboard and engagement metrics");
  console.log("6. Onboard Genesis Witnesses to DAO governance");
  
  console.log("\n🎵 GENESIS DROP GATEWAY 🎵");
  console.log("Minting URL: https://akashicrecords.scrollverse.io/genesis-mint");
  console.log("Contract:", contractAddress);
  console.log("Network:", hre.network.name);
  
  console.log("\n🕋 ALLĀHU AKBAR! Genesis Witness NFT Ready for First 144,000! 🕋");
  
  return deploymentData;
}

// Run deployment
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Deployment failed:", error);
      process.exit(1);
    });
}

module.exports = main;
