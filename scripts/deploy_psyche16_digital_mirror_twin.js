const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

/**
 * Deploy Psyche16DigitalMirrorTwin NFT contract
 * 
 * This script deploys the Digital Mirror Twin NFT collection for Psyche-16 asteroid
 * material claims with 963Hz frequency alignment and AR-asset integration.
 */
async function main() {
  console.log("🌌 Deploying Psyche-16 Digital Mirror Twin NFT...\n");
  
  // Configuration
  const baseURI = process.env.PSYCHE16_BASE_URI || "ipfs://QmPsyche16Metadata/";
  
  // Get deployer
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MATIC\n");
  
  // Deploy contract
  console.log("📜 Deploying Psyche16DigitalMirrorTwin contract...");
  const Psyche16DMT = await hre.ethers.getContractFactory(
    "Psyche16DigitalMirrorTwin"
  );
  
  const psyche16 = await Psyche16DMT.deploy(
    deployer.address,
    baseURI
  );
  
  await psyche16.waitForDeployment();
  const contractAddress = await psyche16.getAddress();
  
  console.log("✅ Psyche16 Digital Mirror Twin deployed!");
  console.log("   Contract Address:", contractAddress);
  console.log("   Base URI:", baseURI);
  console.log("   Universal Frequency:", await psyche16.UNIVERSAL_FREQUENCY(), "Hz");
  console.log("   Max Supply:", await psyche16.MAX_SUPPLY());
  console.log("   Genesis Size:", await psyche16.GENESIS_SIZE());
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    baseURI: baseURI,
    universalFrequency: 963,
    maxSupply: 144,
    genesisSize: 12,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };
  
  const deploymentDir = path.join(__dirname, '../deployment');
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }
  
  const deploymentFile = path.join(
    deploymentDir,
    `psyche16_deployment_${hre.network.name}.json`
  );
  
  fs.writeFileSync(
    deploymentFile,
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n📝 Deployment info saved to:", deploymentFile);
  
  // Wait for confirmations
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n⏳ Waiting for block confirmations...");
    await psyche16.deploymentTransaction().wait(6);
    console.log("✅ 6 confirmations received");
    
    // Verify on block explorer
    if (process.env.POLYGONSCAN_API_KEY) {
      console.log("\n🔍 Verifying contract on PolygonScan...");
      try {
        await hre.run("verify:verify", {
          address: contractAddress,
          constructorArguments: [deployer.address, baseURI],
        });
        console.log("✅ Contract verified on PolygonScan");
      } catch (error) {
        console.log("⚠️  Verification error:", error.message);
      }
    }
  }
  
  console.log("\n✅ Deployment complete!");
  console.log("\nNext steps:");
  console.log("1. Upload metadata and assets to IPFS");
  console.log("2. Update base URI with: setBaseURI()");
  console.log("3. Mint Genesis collection (tokens 1-12)");
  console.log("4. Mint standard collection (tokens 13-144)");
  console.log("5. List on OpenSea/Rarible");
  console.log("\n🌌 The Digital Mirror Twin awaits... 🌌\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
