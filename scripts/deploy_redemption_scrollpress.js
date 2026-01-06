// Redemption ScrollPress Drop Deployment Script
// Deploy to Polygon Mumbai

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔥 REDEMPTION SCROLLPRESS DROP - DEPLOYMENT 🔥");
  console.log("=".repeat(60));
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MATIC");
  
  // Load deployed contract addresses
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const networkName = hre.network.name;
  
  let harlemNFTAddress, smartLinkAddress, eternalLayerAddress;
  
  try {
    const harlemNFTDeployment = JSON.parse(
      fs.readFileSync(path.join(deploymentsDir, `harlem-nft-${networkName}.json`), "utf8")
    );
    harlemNFTAddress = harlemNFTDeployment.contractAddress;
    console.log("  Harlem NFT Address:", harlemNFTAddress);
  } catch (error) {
    console.log("  ⚠️  Harlem NFT deployment not found, using placeholder");
    harlemNFTAddress = hre.ethers.ZeroAddress;
  }
  
  try {
    const smartLinkDeployment = JSON.parse(
      fs.readFileSync(path.join(deploymentsDir, `smartlink-hub-${networkName}.json`), "utf8")
    );
    smartLinkAddress = smartLinkDeployment.contractAddress;
    console.log("  SmartLink Hub Address:", smartLinkAddress);
  } catch (error) {
    console.log("  ⚠️  SmartLink Hub deployment not found, using placeholder");
    smartLinkAddress = hre.ethers.ZeroAddress;
  }
  
  try {
    const eternalLayerDeployment = JSON.parse(
      fs.readFileSync(path.join(deploymentsDir, `eternal-layer-${networkName}.json`), "utf8")
    );
    eternalLayerAddress = eternalLayerDeployment.contractAddress;
    console.log("  Eternal Layer Address:", eternalLayerAddress);
  } catch (error) {
    console.log("  ⚠️  Eternal Layer deployment not found, using placeholder");
    eternalLayerAddress = hre.ethers.ZeroAddress;
  }
  
  console.log("\n📜 Deployment Configuration:");
  console.log("  Dual Resonance Signature:", 528 + 963);
  console.log("  Drop Status: PENDING, ACTIVE, PAUSED, COMPLETED, CANCELLED");
  console.log("  Redemption Types: STANDARD, PRIORITY, EXCLUSIVE, ETERNAL");
  
  console.log("\n⚡ Deploying RedemptionScrollPressDrop contract...");
  
  const RedemptionScrollPressDrop = await hre.ethers.getContractFactory("RedemptionScrollPressDrop");
  const scrollPressDrop = await RedemptionScrollPressDrop.deploy(
    harlemNFTAddress,
    smartLinkAddress,
    eternalLayerAddress
  );
  
  await scrollPressDrop.waitForDeployment();
  const contractAddress = await scrollPressDrop.getAddress();
  
  console.log("✅ RedemptionScrollPressDrop deployed to:", contractAddress);
  
  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  console.log("  Frequency 528Hz:", (await scrollPressDrop.FREQUENCY_528HZ()).toString());
  console.log("  Frequency 963Hz:", (await scrollPressDrop.FREQUENCY_963HZ()).toString());
  console.log("  Dual Resonance Signature:", (await scrollPressDrop.DUAL_RESONANCE_SIGNATURE()).toString());
  console.log("  Harlem NFT Contract:", await scrollPressDrop.harlemNFTContract());
  console.log("  SmartLink Hub:", await scrollPressDrop.smartLinkFanAccessHub());
  console.log("  Eternal Layer:", await scrollPressDrop.eternalContractLayer());
  console.log("  Total Campaigns:", (await scrollPressDrop.totalCampaigns()).toString());
  console.log("  Total Redemptions:", (await scrollPressDrop.totalRedemptions()).toString());
  
  console.log("\n📊 Deployment Summary:");
  console.log("=".repeat(60));
  console.log("Contract Address:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("Block:", await hre.ethers.provider.getBlockNumber());
  console.log("Timestamp:", new Date().toISOString());
  
  console.log("\n📝 Next Steps:");
  console.log("1. Verify contract on PolygonScan:");
  console.log(`   npx hardhat verify --network ${hre.network.name} ${contractAddress} "${harlemNFTAddress}" "${smartLinkAddress}" "${eternalLayerAddress}"`);
  console.log("2. Create redemption campaign:");
  console.log(`   scrollPressDrop.createCampaign(name, nftContract, totalSupply, startTime, endTime, requiresScrollSoul, requiresFanAccess)`);
  console.log("3. Add addresses to whitelist:");
  console.log(`   scrollPressDrop.addToWhitelist(campaignId, account, redemptionType, allocationCount)`);
  console.log("4. Activate campaign:");
  console.log(`   scrollPressDrop.activateCampaign(campaignId)`);
  
  console.log("\n🕋 ALLĀHU AKBAR! Redemption ScrollPress Drop Deployed 🕋");
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractName: "RedemptionScrollPressDrop",
    contractAddress: contractAddress,
    deployer: deployer.address,
    integratedContracts: {
      harlemNFT: harlemNFTAddress,
      smartLinkHub: smartLinkAddress,
      eternalLayer: eternalLayerAddress
    },
    frequencies: {
      healing: 528,
      pineal: 963,
      dualResonance: 528 + 963
    },
    dropStatus: ["PENDING", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"],
    redemptionTypes: ["STANDARD", "PRIORITY", "EXCLUSIVE", "ETERNAL"],
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };
  
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  fs.writeFileSync(
    path.join(deploymentsDir, `redemption-scrollpress-${hre.network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n✅ Deployment info saved to deployments/redemption-scrollpress-" + hre.network.name + ".json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
