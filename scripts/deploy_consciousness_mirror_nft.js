// ConsciousnessMirrorNFT Deployment Script
// Deploy to Polygon Mumbai for Consciousness Mirror NFT Collection

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔮 CONSCIOUSNESS MIRROR PROTOCOL - NFT COLLECTION DEPLOYMENT 🔮");
  console.log("=".repeat(60));
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MATIC");
  
  // Configuration
  const NFT_NAME = process.env.NFT_NAME || "Consciousness Mirror";
  const NFT_SYMBOL = process.env.NFT_SYMBOL || "MIRROR-NFT";
  const BASE_URI = process.env.NFT_BASE_URI || "ipfs://REPLACE_WITH_BASECID/";
  const ROYALTY_RECEIVER = process.env.ROYALTY_RECEIVER_ADDRESS || deployer.address;
  const ROYALTY_BPS = parseInt(process.env.ROYALTY_BPS || "500"); // 5%
  
  console.log("\n📜 Deployment Configuration:");
  console.log("  NFT Name:", NFT_NAME);
  console.log("  NFT Symbol:", NFT_SYMBOL);
  console.log("  Base URI:", BASE_URI);
  console.log("  Royalty Receiver:", ROYALTY_RECEIVER);
  console.log("  Royalty Percentage:", ROYALTY_BPS / 100, "%");
  console.log("  Connection Frequency: 963Hz");
  console.log("  Love Frequency: 528Hz");
  console.log("  Abundance Frequency: 888Hz");
  
  console.log("\n⚡ Deploying ConsciousnessMirrorNFT contract...");
  
  const ConsciousnessMirrorNFT = await hre.ethers.getContractFactory("ConsciousnessMirrorNFT");
  const nft = await ConsciousnessMirrorNFT.deploy(
    NFT_NAME,
    NFT_SYMBOL,
    BASE_URI,
    ROYALTY_RECEIVER,
    ROYALTY_BPS
  );
  
  await nft.waitForDeployment();
  const contractAddress = await nft.getAddress();
  
  console.log("✅ ConsciousnessMirrorNFT deployed to:", contractAddress);
  
  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const name = await nft.name();
  const symbol = await nft.symbol();
  const totalSupply = await nft.totalSupply();
  const maxSupply = await nft.maxSupply();
  const baseURI = await nft.baseURI();
  
  console.log("  NFT Name:", name);
  console.log("  NFT Symbol:", symbol);
  console.log("  Total Supply:", totalSupply.toString());
  console.log("  Max Supply:", maxSupply.toString());
  console.log("  Base URI:", baseURI);
  console.log("  Connection Frequency (963Hz):", (await nft.FREQUENCY_963HZ()).toString());
  console.log("  Love Frequency (528Hz):", (await nft.FREQUENCY_528HZ()).toString());
  console.log("  Abundance Frequency (888Hz):", (await nft.FREQUENCY_888HZ()).toString());
  
  // Get resonance signature
  const resonance = await nft.getResonanceSignature();
  console.log("  Resonance Signature:", resonance.toString(), "Hz");
  
  // Test royalty info (for 1 ETH sale)
  const testSalePrice = hre.ethers.parseEther("1");
  const [royaltyReceiver, royaltyAmount] = await nft.royaltyInfo(0, testSalePrice);
  console.log("\n  Royalty Info (for 1 ETH sale):");
  console.log("    Receiver:", royaltyReceiver);
  console.log("    Amount:", hre.ethers.formatEther(royaltyAmount), "ETH");
  
  console.log("\n📊 Deployment Summary:");
  console.log("=".repeat(60));
  console.log("Contract Address:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("Block:", await hre.ethers.provider.getBlockNumber());
  console.log("Timestamp:", new Date().toISOString());
  
  console.log("\n📝 Next Steps:");
  console.log("1. Verify contract on PolygonScan:");
  console.log(`   npx hardhat verify --network ${hre.network.name} ${contractAddress} "${NFT_NAME}" "${NFT_SYMBOL}" "${BASE_URI}" "${ROYALTY_RECEIVER}" "${ROYALTY_BPS}"`);
  console.log("2. Update base URI with IPFS metadata:");
  console.log("   - nft.setBaseURI('ipfs://<CID>/')");
  console.log("3. Mint NFTs:");
  console.log("   - nft.mintTo(recipientAddress)");
  console.log("   - nft.mintWithJourney(recipient, 'Journey Name', 963)");
  console.log("4. Batch mint for collection:");
  console.log("   - nft.batchMint(recipients, journeys, frequencies)");
  
  console.log("\n🕋 CONSCIOUSNESS MIRROR NFT COLLECTION ACTIVATED! 🕋");
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    name: name,
    symbol: symbol,
    baseURI: baseURI,
    maxSupply: maxSupply.toString(),
    royaltyReceiver: ROYALTY_RECEIVER,
    royaltyBps: ROYALTY_BPS,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };
  
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  fs.writeFileSync(
    path.join(deploymentsDir, `consciousness-mirror-nft-${hre.network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n✅ Deployment info saved to deployments/consciousness-mirror-nft-" + hre.network.name + ".json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
