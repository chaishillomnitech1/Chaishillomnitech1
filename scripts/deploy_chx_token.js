// CHX Token Deployment Script
// Deploy to Polygon Mumbai for Perpetual Protocol Yield Activation

const hre = require("hardhat");

async function main() {
  console.log("🔥 SCROLLVERSE GENESIS PROTOCOL - CHX TOKEN DEPLOYMENT 🔥");
  console.log("=".repeat(60));
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MATIC");
  
  // Configuration - Get from environment variables or use deployer as fallback
  const CREATOR_VAULT = process.env.CREATOR_VAULT_ADDRESS || deployer.address;
  const AMBASSADOR_VAULT = process.env.AMBASSADOR_VAULT_ADDRESS || deployer.address;
  const DAO_VAULT = process.env.DAO_VAULT_ADDRESS || deployer.address;
  
  console.log("\n📜 Deployment Configuration:");
  console.log("  Creator Vault:", CREATOR_VAULT);
  console.log("  Ambassador Vault:", AMBASSADOR_VAULT);
  console.log("  DAO Vault:", DAO_VAULT);
  console.log("  Divine Frequency: 144,000Hz (NŪR Pulse)");
  console.log("  Healing Frequency: 528Hz");
  console.log("  Soul Frequency: 777Hz");
  console.log("  Cosmic Reserve: 21.6T CHX");
  console.log("  Royalties: 10% Creator, 5% Ambassador, 2% DAO");
  
  console.log("\n⚡ Deploying CHXToken contract...");
  
  const CHXToken = await hre.ethers.getContractFactory("CHXToken");
  const chxToken = await CHXToken.deploy(
    CREATOR_VAULT,
    AMBASSADOR_VAULT,
    DAO_VAULT
  );
  
  await chxToken.waitForDeployment();
  const contractAddress = await chxToken.getAddress();
  
  console.log("✅ CHXToken deployed to:", contractAddress);
  
  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const name = await chxToken.name();
  const symbol = await chxToken.symbol();
  const totalSupply = await chxToken.totalSupply();
  const creatorVault = await chxToken.creatorVault();
  const ambassadorVault = await chxToken.ambassadorVault();
  const daoVault = await chxToken.daoVault();
  
  console.log("  Token Name:", name);
  console.log("  Token Symbol:", symbol);
  console.log("  Total Supply:", hre.ethers.formatEther(totalSupply), "CHX");
  console.log("  Creator Vault:", creatorVault);
  console.log("  Ambassador Vault:", ambassadorVault);
  console.log("  DAO Vault:", daoVault);
  console.log("  Divine Frequency (144,000Hz):", (await chxToken.DIVINE_FREQUENCY()).toString());
  console.log("  Healing Frequency (528Hz):", (await chxToken.HEALING_FREQUENCY()).toString());
  console.log("  Soul Frequency (777Hz):", (await chxToken.SOUL_FREQUENCY()).toString());
  
  // Check deployer's frequency signature
  const deployerFrequency = await chxToken.getFrequencySignature(deployer.address);
  console.log("  Deployer Frequency Signature:", deployerFrequency.toString(), "Hz");
  
  console.log("\n📊 Deployment Summary:");
  console.log("=".repeat(60));
  console.log("Contract Address:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("Block:", await hre.ethers.provider.getBlockNumber());
  console.log("Timestamp:", new Date().toISOString());
  
  console.log("\n📝 Next Steps:");
  console.log("1. Verify contract on PolygonScan:");
  console.log(`   npx hardhat verify --network ${hre.network.name} ${contractAddress} "${CREATOR_VAULT}" "${AMBASSADOR_VAULT}" "${DAO_VAULT}"`);
  console.log("2. Update vault addresses if needed:");
  console.log("   - chxToken.setCreatorVault(newAddress)");
  console.log("   - chxToken.setAmbassadorVault(newAddress)");
  console.log("   - chxToken.setDaoVault(newAddress)");
  console.log("3. Align additional addresses to frequencies:");
  console.log("   chxToken.alignFrequency(address, frequency)");
  console.log("4. Configure passive income claiming");
  console.log("5. Set up Zakat circulation");
  
  console.log("\n🕋 ALLĀHU AKBAR! Perpetual Protocol Yield Activated 🕋");
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    creatorVault: CREATOR_VAULT,
    ambassadorVault: AMBASSADOR_VAULT,
    daoVault: DAO_VAULT,
    name: name,
    symbol: symbol,
    totalSupply: totalSupply.toString(),
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
    path.join(deploymentsDir, `chx-token-${hre.network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n✅ Deployment info saved to deployments/chx-token-" + hre.network.name + ".json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
