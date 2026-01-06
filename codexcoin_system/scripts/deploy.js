/**
 * CodexCoin Deployment Script
 * 
 * @author CHAIS THE GREAT ∞ — OMNISOVEREIGN ARCHITECT
 * @notice Deploys the CodexCoin contract with divine configuration
 * 
 * Frequency: 999Hz (Crown Chakra)
 * Classification: DEPLOYMENT SCRIPT
 * Status: READY FOR EXECUTION
 * Signature: ∞ ARCHITEX ∞
 */

const hre = require("hardhat");

async function main() {
  console.log("🔥 ============================================ 🔥");
  console.log("   CODEXCOIN DEPLOYMENT - DIVINE MANIFESTATION");
  console.log("🔥 ============================================ 🔥\n");
  
  console.log("📡 Connecting to network:", hre.network.name);
  console.log("⚡ Frequency: 999Hz (Crown Chakra)");
  console.log("✨ Status: Initiating divine deployment...\n");
  
  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 Deployer account:", deployer.address);
  
  const balance = await deployer.getBalance();
  console.log("💰 Account balance:", hre.ethers.utils.formatEther(balance), "ETH\n");
  
  // Define vault addresses
  // NOTE: Replace these with actual vault addresses before mainnet deployment
  const vaultAddresses = {
    creator: process.env.CREATOR_VAULT_ADDRESS || deployer.address,
    ambassador: process.env.AMBASSADOR_VAULT_ADDRESS || deployer.address,
    dao: process.env.DAO_VAULT_ADDRESS || deployer.address,
    zakat: process.env.ZAKAT_POOL_ADDRESS || deployer.address
  };
  
  console.log("🏛️  Treasury Vault Configuration:");
  console.log("   Creator Vault:     ", vaultAddresses.creator);
  console.log("   Ambassador Vault:  ", vaultAddresses.ambassador);
  console.log("   DAO Vault:         ", vaultAddresses.dao);
  console.log("   Zakat Pool:        ", vaultAddresses.zakat);
  console.log("");
  
  // Deploy CodexCoin
  console.log("🚀 Deploying CodexCoin contract...");
  
  const CodexCoin = await hre.ethers.getContractFactory("CodexCoin");
  const codexCoin = await CodexCoin.deploy(
    vaultAddresses.creator,
    vaultAddresses.ambassador,
    vaultAddresses.dao,
    vaultAddresses.zakat
  );
  
  await codexCoin.deployed();
  
  console.log("✅ CodexCoin deployed to:", codexCoin.address);
  console.log("");
  
  // Verify deployment
  console.log("🔍 Verifying deployment...");
  
  const name = await codexCoin.name();
  const symbol = await codexCoin.symbol();
  const decimals = await codexCoin.decimals();
  const totalSupply = await codexCoin.totalSupply();
  const creatorBalance = await codexCoin.balanceOf(vaultAddresses.creator);
  
  console.log("   Name:              ", name);
  console.log("   Symbol:            ", symbol);
  console.log("   Decimals:          ", decimals.toString());
  console.log("   Total Supply:      ", hre.ethers.utils.formatEther(totalSupply), "CODEX");
  console.log("   Creator Balance:   ", hre.ethers.utils.formatEther(creatorBalance), "CODEX");
  console.log("");
  
  // Check divine constants
  console.log("⚡ Divine Configuration:");
  const crownFreq = await codexCoin.CROWN_FREQ();
  const zakatPercentage = await codexCoin.ZAKAT_PERCENTAGE();
  const royaltyPercentage = await codexCoin.ROYALTY_PERCENTAGE();
  
  console.log("   Crown Frequency:   ", crownFreq.toString(), "Hz");
  console.log("   Zakat Rate:        ", (zakatPercentage / 100).toString(), "%");
  console.log("   Royalty Rate:      ", (royaltyPercentage / 100).toString(), "%");
  console.log("");
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: codexCoin.address,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    vaults: vaultAddresses,
    configuration: {
      name,
      symbol,
      decimals: decimals.toString(),
      totalSupply: hre.ethers.utils.formatEther(totalSupply),
      crownFrequency: crownFreq.toString(),
      zakatPercentage: (zakatPercentage / 100).toString(),
      royaltyPercentage: (royaltyPercentage / 100).toString()
    }
  };
  
  const fs = require('fs');
  const deploymentPath = `./deployments/${hre.network.name}_deployment.json`;
  
  // Create deployments directory if it doesn't exist
  if (!fs.existsSync('./deployments')) {
    fs.mkdirSync('./deployments');
  }
  
  fs.writeFileSync(
    deploymentPath,
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("📄 Deployment info saved to:", deploymentPath);
  console.log("");
  
  // Contract verification instructions
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("📝 To verify the contract on Etherscan, run:");
    console.log(`   npx hardhat verify --network ${hre.network.name} ${codexCoin.address} "${vaultAddresses.creator}" "${vaultAddresses.ambassador}" "${vaultAddresses.dao}" "${vaultAddresses.zakat}"`);
    console.log("");
  }
  
  console.log("🕋 ============================================ 🕋");
  console.log("   DIVINE DEPLOYMENT COMPLETE");
  console.log("   ALLĀHU AKBAR! 🔥");
  console.log("🕋 ============================================ 🕋");
  console.log("");
  console.log("💎 CodexCoin Address:", codexCoin.address);
  console.log("✨ Initial Supply:   ", hre.ethers.utils.formatEther(totalSupply), "CODEX");
  console.log("🌟 Status:           ACTIVE & OPERATIONAL");
  console.log("∞  Signature:        ∞ ARCHITEX ∞");
  console.log("");
  console.log("The Coin is the Code.");
  console.log("The Code is the Law.");
  console.log("The Law is Love.");
  console.log("The Love is Infinite.");
  console.log("");
  console.log("WALAHI! BARAKALLAHU FEEK! ALLAHU AKBAR!");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
