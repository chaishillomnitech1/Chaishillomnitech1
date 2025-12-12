/**
 * @title VibeCanvas Frequency Forge Deployment Script
 * @dev Deploy VibeCanvas™ NFT Frequency Forge to Polygon Mumbai Testnet
 * @author Supreme King Chais The Great ∞
 * 
 * This script deploys the VibeCanvas Frequency Forge contract with:
 * - 528 Hz + 963 Hz frequency embedding
 * - QFS synchronization capabilities
 * - Auto-scaling resonance mechanism
 * - Metadata hash assignment system
 */

const hre = require("hardhat");

async function main() {
  console.log("🔥 VibeCanvas™ Frequency Forge Deployment 🔥");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Frequency: 528Hz + 963Hz Divine Resonance");
  console.log("Network:", hre.network.name);
  console.log("Timestamp:", new Date().toISOString());
  console.log("");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MATIC");
  console.log("");

  // Configuration
  const BASE_URI = "https://scrollverse-nft-metadata.vercel.app/vibecanvas/";
  const ROYALTY_RECIPIENT = deployer.address; // Set to sovereign wallet in production
  
  console.log("📋 Deployment Configuration:");
  console.log("  Base URI:", BASE_URI);
  console.log("  Royalty Recipient:", ROYALTY_RECIPIENT);
  console.log("");

  // Deploy VibeCanvas Frequency Forge
  console.log("🚀 Deploying VibeCanvas Frequency Forge...");
  
  const VibeCanvasFrequencyForge = await hre.ethers.getContractFactory("VibeCanvasFrequencyForge");
  const vibeCanvas = await VibeCanvasFrequencyForge.deploy(BASE_URI, ROYALTY_RECIPIENT);
  
  await vibeCanvas.waitForDeployment();
  const vibeCanvasAddress = await vibeCanvas.getAddress();
  
  console.log("✅ VibeCanvas Frequency Forge deployed to:", vibeCanvasAddress);
  console.log("");

  // Verify deployment
  console.log("🔍 Verifying deployment...");
  
  const totalSupply = await vibeCanvas.totalSupply();
  const globalResonance = await vibeCanvas.globalResonanceLevel();
  const maxSupply = await vibeCanvas.MAX_SUPPLY();
  
  console.log("  Total Supply:", totalSupply.toString());
  console.log("  Global Resonance Level:", globalResonance.toString(), "basis points");
  console.log("  Max Supply:", maxSupply.toString());
  console.log("  Frequency 528Hz:", await vibeCanvas.FREQUENCY_528HZ());
  console.log("  Frequency 963Hz:", await vibeCanvas.FREQUENCY_963HZ());
  console.log("");

  // Display deployment summary
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📜 DEPLOYMENT SUMMARY");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");
  console.log("Contract: VibeCanvas Frequency Forge");
  console.log("Address:", vibeCanvasAddress);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("");
  
  console.log("🎨 Features:");
  console.log("  ✓ 528 Hz DNA Healing Frequency");
  console.log("  ✓ 963 Hz Pineal Activation Frequency");
  console.log("  ✓ QFS Synchronization Hooks");
  console.log("  ✓ Auto-Scaling Resonance");
  console.log("  ✓ Metadata Hash Assignment");
  console.log("  ✓ Generative Art System");
  console.log("  ✓ 15% Perpetual Royalties");
  console.log("");

  // Verification command
  console.log("📝 To verify on Polygonscan:");
  console.log(`npx hardhat verify --network ${hre.network.name} ${vibeCanvasAddress} "${BASE_URI}" "${ROYALTY_RECIPIENT}"`);
  console.log("");

  // Next steps
  console.log("🎯 Next Steps:");
  console.log("  1. Verify contract on Polygonscan");
  console.log("  2. Set up metadata server at base URI");
  console.log("  3. Configure QFS synchronization oracle");
  console.log("  4. Mint first VibeCanvas NFT with frequency forge");
  console.log("  5. Test frequency alignment and resonance scaling");
  console.log("");
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🕋 ALLAHU AKBAR! DEPLOYMENT COMPLETE 🕋");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");
  console.log("Signature: ∞ ARCHITEX ∞");
  console.log("Frequency: 528Hz + 963Hz SEALED");
  console.log("Status: SOVEREIGNTY ACTIVE");
  console.log("");

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractName: "VibeCanvasFrequencyForge",
    address: vibeCanvasAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    baseURI: BASE_URI,
    royaltyRecipient: ROYALTY_RECIPIENT,
    frequencies: {
      healing: "528Hz",
      pineal: "963Hz",
      crown: "999Hz",
      nur: "144000Hz"
    },
    features: [
      "Dynamic Frequency Embedding",
      "QFS Synchronization",
      "Auto-Scaling Resonance",
      "Generative Art System",
      "Metadata Hash Assignment"
    ]
  };

  console.log("💾 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
