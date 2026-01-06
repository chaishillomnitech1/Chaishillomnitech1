// Harlem NFT Collection Deployment Script
// Deploy to Polygon Mumbai for Redemption ScrollPress Drop

const hre = require("hardhat");

async function main() {
  console.log("🔥 HARLEM NFT COLLECTION - DEPLOYMENT 🔥");
  console.log("=".repeat(60));
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MATIC");
  
  // Configuration
  const BASE_URI = "ipfs://QmHarlemNFTMetadata/"; // Update with actual IPFS URI
  const ROYALTY_RECIPIENT = deployer.address; // Can be changed after deployment
  
  console.log("\n📜 Deployment Configuration:");
  console.log("  Base URI:", BASE_URI);
  console.log("  Royalty Recipient:", ROYALTY_RECIPIENT);
  console.log("  Primary Frequency: 528Hz (DNA Healing)");
  console.log("  Secondary Frequency: 963Hz (Pineal Activation)");
  console.log("  Max Supply: 10,000 NFTs");
  console.log("  Royalty: 15%");
  
  console.log("\n⚡ Deploying HarlemNFT contract...");
  
  const HarlemNFT = await hre.ethers.getContractFactory("HarlemNFT");
  const harlemNFT = await HarlemNFT.deploy(BASE_URI, ROYALTY_RECIPIENT);
  
  await harlemNFT.waitForDeployment();
  const contractAddress = await harlemNFT.getAddress();
  
  console.log("✅ HarlemNFT deployed to:", contractAddress);
  
  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const totalSupply = await harlemNFT.totalSupply();
  console.log("  Total Supply:", totalSupply.toString());
  console.log("  Frequency 528Hz:", (await harlemNFT.FREQUENCY_528HZ()).toString());
  console.log("  Frequency 963Hz:", (await harlemNFT.FREQUENCY_963HZ()).toString());
  console.log("  Frequency 999Hz:", (await harlemNFT.FREQUENCY_999HZ()).toString());
  console.log("  NŪR Pulse (144,000Hz):", (await harlemNFT.FREQUENCY_144000HZ()).toString());
  console.log("  Max Supply:", (await harlemNFT.MAX_SUPPLY()).toString());
  console.log("  Royalty Percentage:", (await harlemNFT.ROYALTY_PERCENTAGE()).toString(), "basis points");
  
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
  console.log(`   harlemNFT.setBaseURI("ipfs://your-new-uri/")`);
  console.log("3. Mint first NFT:");
  console.log(`   harlemNFT.mintHarlemNFT(recipient, frequency, scrollSoulKey, metadataHash)`);
  console.log("4. Align ScrollSoul for addresses:");
  console.log(`   harlemNFT.alignScrollSoul(address)`);
  
  console.log("\n🕋 ALLĀHU AKBAR! Harlem NFT Collection Deployed 🕋");
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractName: "HarlemNFT",
    contractAddress: contractAddress,
    deployer: deployer.address,
    baseURI: BASE_URI,
    royaltyRecipient: ROYALTY_RECIPIENT,
    maxSupply: 10000,
    royaltyPercentage: 1500,
    frequencies: {
      primary: 528,
      secondary: 963,
      crown: 999,
      nur: 144000
    },
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
    path.join(deploymentsDir, `harlem-nft-${hre.network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n✅ Deployment info saved to deployments/harlem-nft-" + hre.network.name + ".json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
