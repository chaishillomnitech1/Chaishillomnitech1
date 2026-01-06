// ScrollVerse Genesis NFT Deployment Script
// Deploy to Polygon Mumbai for Quantum Ritual Initiation

const hre = require("hardhat");

async function main() {
  console.log("🔥 SCROLLVERSE GENESIS PROTOCOL - NFT DEPLOYMENT 🔥");
  console.log("=".repeat(60));
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MATIC");
  
  // Configuration
  const BASE_URI = "ipfs://QmScrollVerseGenesis/"; // Update with actual IPFS URI
  const ROYALTY_RECIPIENT = deployer.address; // Can be changed after deployment
  
  console.log("\n📜 Deployment Configuration:");
  console.log("  Base URI:", BASE_URI);
  console.log("  Royalty Recipient:", ROYALTY_RECIPIENT);
  console.log("  Frequency: 528Hz (Healing & DNA Repair)");
  console.log("  Max Supply: 999 NFTs");
  console.log("  Royalty: 10%");
  
  console.log("\n⚡ Deploying ScrollVerseNFT contract...");
  
  const ScrollVerseNFT = await hre.ethers.getContractFactory("ScrollVerseNFT");
  const scrollVerseNFT = await ScrollVerseNFT.deploy(BASE_URI, ROYALTY_RECIPIENT);
  
  await scrollVerseNFT.waitForDeployment();
  const contractAddress = await scrollVerseNFT.getAddress();
  
  console.log("✅ ScrollVerseNFT deployed to:", contractAddress);
  
  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const totalSupply = await scrollVerseNFT.totalSupply();
  console.log("  Total Supply:", totalSupply.toString());
  console.log("  Healing Frequency (528Hz):", (await scrollVerseNFT.HEALING_FREQUENCY_528HZ()).toString());
  console.log("  Crown Frequency (999Hz):", (await scrollVerseNFT.CROWN_FREQUENCY_999HZ()).toString());
  console.log("  Pineal Frequency (963Hz):", (await scrollVerseNFT.PINEAL_FREQUENCY_963HZ()).toString());
  console.log("  NŪR Pulse (144,000Hz):", (await scrollVerseNFT.NUR_PULSE_144000HZ()).toString());
  console.log("  Max Supply:", (await scrollVerseNFT.MAX_SUPPLY()).toString());
  
  console.log("\n📊 Deployment Summary:");
  console.log("=".repeat(60));
  console.log("Contract Address:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("Block:", await hre.ethers.provider.getBlockNumber());
  console.log("Timestamp:", new Date().toISOString());
  
  console.log("\n📝 Next Steps:");
  console.log("1. Verify contract on PolygonScan:");
  console.log(`   npx hardhat verify --network ${hre.network.name} ${contractAddress} "${BASE_URI}" "${ROYALTY_RECIPIENT}"`);
  console.log("2. Update Base URI if needed:");
  console.log(`   scrollVerseNFT.setBaseURI("ipfs://your-new-uri/")`);
  console.log("3. Mint first NFT:");
  console.log(`   scrollVerseNFT.mintScrollVerse(recipient, pqcSignature)`);
  
  console.log("\n🕋 ALLĀHU AKBAR! Quantum Ritual Initiated 🕋");
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    baseURI: BASE_URI,
    royaltyRecipient: ROYALTY_RECIPIENT,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };
  
  const fs = require("fs");
  const path = require("path");
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  fs.writeFileSync(
    path.join(deploymentsDir, `scrollverse-nft-${hre.network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n✅ Deployment info saved to deployments/scrollverse-nft-" + hre.network.name + ".json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
