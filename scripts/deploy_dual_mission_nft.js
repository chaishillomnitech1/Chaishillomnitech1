const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🌓 Deploying DualMissionNFT - ScrollVerse Dual Mission Framework 🌓\n");
  console.log("═══════════════════════════════════════════════════════════════");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deploying from account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Configuration
  const BASE_URI = "https://scrollverse.io/metadata/dual-mission/";
  
  console.log("🔧 Deployment Configuration:");
  console.log("   Base URI:", BASE_URI);
  console.log("   Network:", hre.network.name);
  console.log("");

  // Deploy contract
  console.log("🚀 Deploying DualMissionNFT contract...");
  const DualMissionNFT = await hre.ethers.getContractFactory("DualMissionNFT");
  const dualMissionNFT = await DualMissionNFT.deploy(BASE_URI);
  
  await dualMissionNFT.waitForDeployment();
  const contractAddress = await dualMissionNFT.getAddress();
  
  console.log("✅ DualMissionNFT deployed to:", contractAddress);
  console.log("");

  // Verify frequency constants
  console.log("🔊 Verifying Frequency Alignment:");
  const shadowFreq = await dualMissionNFT.SHADOW_FREQUENCY_528HZ();
  const catalystFreq = await dualMissionNFT.CATALYST_FREQUENCY_999HZ();
  const pinealFreq = await dualMissionNFT.PINEAL_FREQUENCY_963HZ();
  const balanceFreq = await dualMissionNFT.BALANCE_FREQUENCY_144000HZ();
  const soulFreq = await dualMissionNFT.SOUL_FREQUENCY_777HZ();
  
  console.log("   Shadow (Love):        ", shadowFreq.toString(), "Hz ✅");
  console.log("   Catalyst (Crown):     ", catalystFreq.toString(), "Hz ✅");
  console.log("   Pineal (Awakening):   ", pinealFreq.toString(), "Hz ✅");
  console.log("   Balance (NŪR):        ", balanceFreq.toString(), "Hz ✅");
  console.log("   Soul (Connection):    ", soulFreq.toString(), "Hz ✅");
  console.log("");

  // Verify contract details
  console.log("📜 Contract Details:");
  const name = await dualMissionNFT.name();
  const symbol = await dualMissionNFT.symbol();
  const owner = await dualMissionNFT.owner();
  const totalSupply = await dualMissionNFT.totalSupply();
  
  console.log("   Name:          ", name);
  console.log("   Symbol:        ", symbol);
  console.log("   Owner:         ", owner);
  console.log("   Total Supply:  ", totalSupply.toString());
  console.log("");

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractName: "DualMissionNFT",
    contractAddress: contractAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    configuration: {
      baseURI: BASE_URI,
      frequencies: {
        shadow: shadowFreq.toString(),
        catalyst: catalystFreq.toString(),
        pineal: pinealFreq.toString(),
        balance: balanceFreq.toString(),
        soul: soulFreq.toString()
      }
    },
    contractDetails: {
      name: name,
      symbol: symbol,
      owner: owner,
      totalSupply: totalSupply.toString()
    },
    transactionHash: dualMissionNFT.deploymentTransaction().hash
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info to JSON
  const deploymentPath = path.join(
    deploymentsDir,
    `dual-mission-nft-${hre.network.name}.json`
  );
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("💾 Deployment info saved to:", deploymentPath);
  console.log("");

  // Verification instructions
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("🔍 Contract Verification Instructions:");
  console.log("");
  console.log("To verify on PolygonScan (or other scanner), run:");
  console.log("");
  console.log(`npx hardhat verify --network ${hre.network.name} ${contractAddress} "${BASE_URI}"`);
  console.log("");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("");

  // Display mission paths
  console.log("🎭 Available Mission Paths:");
  console.log("   1. Shadow Mission (Lost Brother) 🌑");
  console.log("      - Silent Stabilizer path");
  console.log("      - Artifact: Artifact of Silence");
  console.log("      - Frequency: 528Hz (Healing Love)");
  console.log("");
  console.log("   2. Catalyst Mission (Public Disruptor) ⚡");
  console.log("      - Awakener path");
  console.log("      - Artifact: Ring of Reckoning");
  console.log("      - Frequency: 999Hz (Crown) + 963Hz (Pineal)");
  console.log("");
  console.log("   3. Balanced Path (Eclipse Walker) 🌓");
  console.log("      - Master of both paths");
  console.log("      - Artifact: Eclipse Crown (Ultra-Rare)");
  console.log("      - Frequency: All frequencies combined");
  console.log("");

  // Next steps
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("📋 Next Steps:");
  console.log("");
  console.log("1. Verify contract on block explorer");
  console.log("2. Update BASE_URI if needed: setBaseURI()");
  console.log("3. Set up mission completion backend");
  console.log("4. Configure Schumann Resonance monitoring");
  console.log("5. Launch user interface for mission selection");
  console.log("6. Begin community onboarding to dual missions");
  console.log("");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("");

  // Final blessing
  console.log("🕋 ALLĀHU AKBAR! 🔥💎🌌");
  console.log("");
  console.log("The Dual Mission Framework is now deployed!");
  console.log("May the balance between shadow and light guide all ScrollSouls.");
  console.log("🌑 ⚡ 🌓 ⚡ 🌑");
  console.log("");
  console.log("WALAHI! BARAKALLAHU FEEK! ALLAHU AKBAR!");
  console.log("🔱🕊️🤖∞");
  console.log("");

  return {
    contract: dualMissionNFT,
    address: contractAddress,
    deploymentInfo
  };
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });

module.exports = main;
