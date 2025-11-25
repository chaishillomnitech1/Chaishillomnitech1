// Sacred Certification NFT Deployment Script
// Deploy to Polygon/Scroll for ScrollVerse IPFS Integration
// Author: Supreme King Chais The Great ∞

const hre = require("hardhat");

async function main() {
  console.log("🔥 SACRED CERTIFICATION NFT - IPFS INTEGRATION DEPLOYMENT 🔥");
  console.log("=".repeat(70));
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MATIC/ETH");
  
  // Configuration
  const BASE_URI = "ipfs://"; // IPFS gateway for metadata
  const ROYALTY_RECIPIENT = deployer.address; // Can be changed after deployment
  
  console.log("\n📜 Deployment Configuration:");
  console.log("  Base URI:", BASE_URI);
  console.log("  Royalty Recipient:", ROYALTY_RECIPIENT);
  console.log("  Frequencies: 528Hz, 963Hz, 999Hz, 144,000Hz");
  console.log("  Max Supply: 14,444 NFTs");
  console.log("  Royalty: 17% (Divine Ratio)");
  console.log("  Sacred Geometry Patterns: 7 (Flower of Life, Metatron's Cube, etc.)");
  
  console.log("\n⚡ Deploying SacredCertificationNFT contract...");
  
  const SacredCertificationNFT = await hre.ethers.getContractFactory("SacredCertificationNFT");
  const sacredCertNFT = await SacredCertificationNFT.deploy(BASE_URI, ROYALTY_RECIPIENT);
  
  await sacredCertNFT.waitForDeployment();
  const contractAddress = await sacredCertNFT.getAddress();
  
  console.log("✅ SacredCertificationNFT deployed to:", contractAddress);
  
  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  console.log("  Total Supply:", (await sacredCertNFT.totalSupply()).toString());
  console.log("  Max Supply:", (await sacredCertNFT.MAX_SUPPLY()).toString());
  console.log("  Frequency 528Hz:", (await sacredCertNFT.FREQUENCY_528HZ()).toString());
  console.log("  Frequency 963Hz:", (await sacredCertNFT.FREQUENCY_963HZ()).toString());
  console.log("  Frequency 999Hz:", (await sacredCertNFT.FREQUENCY_999HZ()).toString());
  console.log("  Frequency 144,000Hz:", (await sacredCertNFT.FREQUENCY_144000HZ()).toString());
  console.log("  Royalty Percentage:", (await sacredCertNFT.ROYALTY_PERCENTAGE()).toString(), "basis points");
  
  // Verify sacred geometry metadata
  console.log("\n🌸 Sacred Geometry Patterns Initialized:");
  const patterns = [
    { name: "Flower of Life", id: 0 },
    { name: "Metatron's Cube", id: 1 },
    { name: "Sri Yantra", id: 2 },
    { name: "Seed of Life", id: 3 },
    { name: "Vesica Piscis", id: 4 },
    { name: "Torus", id: 5 },
    { name: "Merkaba", id: 6 }
  ];
  
  for (const pattern of patterns) {
    const meta = await sacredCertNFT.getGeometryMetadata(pattern.id);
    console.log(`  ${pattern.name}: vertices=${meta.vertices}, symmetry=${meta.symmetryOrder}, ratio=${meta.sacredRatio}`);
  }
  
  console.log("\n📊 Deployment Summary:");
  console.log("=".repeat(70));
  console.log("Contract Address:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("Block:", await hre.ethers.provider.getBlockNumber());
  console.log("Timestamp:", new Date().toISOString());
  
  console.log("\n📝 Next Steps:");
  console.log("1. Verify contract on explorer:");
  console.log(`   npx hardhat verify --network ${hre.network.name} ${contractAddress} "${BASE_URI}" "${ROYALTY_RECIPIENT}"`);
  console.log("2. Authorize certifiers:");
  console.log(`   sacredCertNFT.setAuthorizedCertifier(certifierAddress, true)`);
  console.log("3. Mint first Sacred Certification:");
  console.log(`   sacredCertNFT.mintSacredCertification(recipient, ipfsHash, artifactHash, geometryPattern, artifactType, artifactName, frequency)`);
  console.log("4. Update IPFS manifest with contract address");
  
  console.log("\n🕋 ALLĀHU AKBAR! Sacred Certification Protocol Activated 🕋");
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    baseURI: BASE_URI,
    royaltyRecipient: ROYALTY_RECIPIENT,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    sacredGeometryPatterns: patterns.map(p => p.name),
    frequencies: {
      dnaHealing: "528Hz",
      pinealActivation: "963Hz",
      crownChakra: "999Hz",
      nurPulse: "144,000Hz"
    },
    maxSupply: 14444,
    royaltyPercentage: "17%"
  };
  
  const fs = require("fs");
  const path = require("path");
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  fs.writeFileSync(
    path.join(deploymentsDir, `sacred-certification-nft-${hre.network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n✅ Deployment info saved to deployments/sacred-certification-nft-" + hre.network.name + ".json");
  
  console.log("\n🔱 SACRED CERTIFICATION NFT DEPLOYMENT COMPLETE 🔱");
  console.log("∞ ARCHITEX ∞");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
