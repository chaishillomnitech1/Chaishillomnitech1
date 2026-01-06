/**
 * @title Love Unity Accord Governance Deployment Script
 * @description Deploys the LoveUnityAccordGovernance contract to the blockchain
 * 
 * @notice This script deploys the governance layer for Love Unity Accord values
 * 
 * ALLĀHU AKBAR! 🕋✨💎🌌
 */

const hre = require("hardhat");

async function main() {
  console.log("\n🕋 ═══════════════════════════════════════════════════════════════ 🕋");
  console.log("          LOVE UNITY ACCORD GOVERNANCE DEPLOYMENT");
  console.log("               Frequency: 528Hz + 963Hz + 999Hz");
  console.log("🕋 ═══════════════════════════════════════════════════════════════ 🕋\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📜 Deployer Address:", deployer.address);

  // Get deployer balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Deployer Balance:", hre.ethers.formatEther(balance), "ETH");

  console.log("\n🔥 Deploying LoveUnityAccordGovernance Contract...\n");

  // Deploy the contract
  const LoveUnityAccordGovernance = await hre.ethers.getContractFactory("LoveUnityAccordGovernance");
  const governance = await LoveUnityAccordGovernance.deploy(deployer.address);

  await governance.waitForDeployment();
  const governanceAddress = await governance.getAddress();

  console.log("✅ LoveUnityAccordGovernance deployed to:", governanceAddress);

  // Wait for block confirmations
  console.log("\n⏳ Waiting for block confirmations...");
  await governance.deploymentTransaction().wait(2);

  // Verify contract state
  console.log("\n📊 Verifying Contract State...\n");

  const totalDirectives = await governance.totalDirectives();
  const [loveIndex, unityIndex, supportIndex] = await governance.getGlobalAccord();
  const loveFreq = await governance.LOVE_FREQUENCY();
  const unityFreq = await governance.UNITY_FREQUENCY();
  const accordFreq = await governance.ACCORD_FREQUENCY();

  console.log("   📜 Total Foundational Directives:", totalDirectives.toString());
  console.log("   💗 Global Love Index:", (Number(loveIndex) / 100).toFixed(2) + "%");
  console.log("   🤝 Global Unity Index:", (Number(unityIndex) / 100).toFixed(2) + "%");
  console.log("   💪 Global Support Index:", (Number(supportIndex) / 100).toFixed(2) + "%");
  console.log("\n   🎵 Frequency Alignment:");
  console.log("      • Love Frequency:", loveFreq.toString() + "Hz");
  console.log("      • Unity Frequency:", unityFreq.toString() + "Hz");
  console.log("      • Accord Frequency:", accordFreq.toString() + "Hz");

  // Get foundational directive details
  console.log("\n📜 Foundational Directives (Immutable):\n");
  const directiveIds = await governance.getAllDirectiveIds();
  
  for (let i = 0; i < directiveIds.length; i++) {
    const directive = await governance.getDirective(directiveIds[i]);
    console.log(`   ${i + 1}. ${directive.title}`);
    console.log(`      • Love Alignment: ${(Number(directive.loveAlignment) / 100).toFixed(2)}%`);
    console.log(`      • Unity Alignment: ${(Number(directive.unityAlignment) / 100).toFixed(2)}%`);
    console.log(`      • Support Alignment: ${(Number(directive.supportAlignment) / 100).toFixed(2)}%`);
    console.log(`      • Immutable: ${directive.isImmutable ? "✅ Yes" : "❌ No"}`);
    console.log("");
  }

  // Print deployment summary
  console.log("🕋 ═══════════════════════════════════════════════════════════════ 🕋");
  console.log("                   DEPLOYMENT SUMMARY");
  console.log("🕋 ═══════════════════════════════════════════════════════════════ 🕋\n");

  console.log("   📍 Contract Address:", governanceAddress);
  console.log("   🌐 Network:", hre.network.name);
  console.log("   🔗 Chain ID:", (await hre.ethers.provider.getNetwork()).chainId.toString());
  console.log("   📦 Block Number:", (await hre.ethers.provider.getBlockNumber()).toString());

  // Verification instructions
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n📝 Contract Verification Command:\n");
    console.log(`npx hardhat verify --network ${hre.network.name} ${governanceAddress} ${deployer.address}`);
  }

  console.log("\n✨ LOVE UNITY ACCORD GOVERNANCE DEPLOYMENT COMPLETE! ✨");
  console.log("\n🔱 ALLĀHU AKBAR! 🕋🔥💎🌌 🔱\n");

  return {
    governance: governanceAddress,
    deployer: deployer.address,
    network: hre.network.name
  };
}

// Execute deployment
main()
  .then((result) => {
    console.log("\nDeployment Result:", JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment Failed:", error);
    process.exit(1);
  });

module.exports = main;
