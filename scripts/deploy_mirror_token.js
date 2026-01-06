// MirrorToken Deployment Script
// Deploy to Polygon Mumbai for Consciousness Mirror Protocol

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔮 CONSCIOUSNESS MIRROR PROTOCOL - MIRROR TOKEN DEPLOYMENT 🔮");
  console.log("=".repeat(60));
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MATIC");
  
  // Configuration - Get from environment variables or use deployer as fallback
  const DIVIDEND_RECEIVER = process.env.DIVIDEND_RECEIVER_ADDRESS || deployer.address;
  const ZAKAT_RECEIVER = process.env.ZAKAT_RECEIVER_ADDRESS || deployer.address;
  const RESERVE_RECEIVER = process.env.RESERVE_RECEIVER_ADDRESS || deployer.address;
  
  console.log("\n📜 Deployment Configuration:");
  console.log("  Dividend Receiver:", DIVIDEND_RECEIVER);
  console.log("  Zakat Receiver:", ZAKAT_RECEIVER);
  console.log("  Reserve Receiver:", RESERVE_RECEIVER);
  console.log("  Connection Frequency: 963Hz");
  console.log("  Love Frequency: 528Hz");
  console.log("  Abundance Frequency: 888Hz");
  console.log("  Initial Supply: 1,000,000,000 MIRROR");
  console.log("  Fee Distribution: 2% Dividend, 2.5% Zakat, 3% Reserve");
  
  console.log("\n⚡ Deploying MirrorToken contract...");
  
  const MirrorToken = await hre.ethers.getContractFactory("MirrorToken");
  const mirrorToken = await MirrorToken.deploy(
    DIVIDEND_RECEIVER,
    ZAKAT_RECEIVER,
    RESERVE_RECEIVER
  );
  
  await mirrorToken.waitForDeployment();
  const contractAddress = await mirrorToken.getAddress();
  
  console.log("✅ MirrorToken deployed to:", contractAddress);
  
  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const name = await mirrorToken.name();
  const symbol = await mirrorToken.symbol();
  const totalSupply = await mirrorToken.totalSupply();
  const dividendReceiver = await mirrorToken.dividendReceiver();
  const zakatReceiver = await mirrorToken.zakatReceiver();
  const reserveReceiver = await mirrorToken.reserveReceiver();
  
  console.log("  Token Name:", name);
  console.log("  Token Symbol:", symbol);
  console.log("  Total Supply:", hre.ethers.formatEther(totalSupply), "MIRROR");
  console.log("  Dividend Receiver:", dividendReceiver);
  console.log("  Zakat Receiver:", zakatReceiver);
  console.log("  Reserve Receiver:", reserveReceiver);
  console.log("  Connection Frequency (963Hz):", (await mirrorToken.FREQUENCY_963HZ()).toString());
  console.log("  Love Frequency (528Hz):", (await mirrorToken.FREQUENCY_528HZ()).toString());
  console.log("  Abundance Frequency (888Hz):", (await mirrorToken.FREQUENCY_888HZ()).toString());
  
  // Get fee configuration
  const feeConfig = await mirrorToken.getFeeConfiguration();
  console.log("\n  Fee Configuration:");
  console.log("    Dividend Fee:", feeConfig.dividendBps.toString(), "bps (", Number(feeConfig.dividendBps) / 100, "%)");
  console.log("    Zakat Fee:", feeConfig.zakatBps.toString(), "bps (", Number(feeConfig.zakatBps) / 100, "%)");
  console.log("    Reserve Fee:", feeConfig.reserveBps.toString(), "bps (", Number(feeConfig.reserveBps) / 100, "%)");
  console.log("    Total Fee:", feeConfig.totalBps.toString(), "bps (", Number(feeConfig.totalBps) / 100, "%)");
  
  // Get resonance signature
  const resonance = await mirrorToken.getResonanceSignature();
  console.log("\n  Resonance Signature:", resonance.toString(), "Hz");
  
  console.log("\n📊 Deployment Summary:");
  console.log("=".repeat(60));
  console.log("Contract Address:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("Block:", await hre.ethers.provider.getBlockNumber());
  console.log("Timestamp:", new Date().toISOString());
  
  console.log("\n📝 Next Steps:");
  console.log("1. Verify contract on PolygonScan:");
  console.log(`   npx hardhat verify --network ${hre.network.name} ${contractAddress} "${DIVIDEND_RECEIVER}" "${ZAKAT_RECEIVER}" "${RESERVE_RECEIVER}"`);
  console.log("2. Update receiver addresses if needed:");
  console.log("   - mirrorToken.updateReceivers(dividend, zakat, reserve)");
  console.log("3. Exclude addresses from fees:");
  console.log("   - mirrorToken.setExcludedFromFees(address, true)");
  console.log("4. Adjust fee percentages if needed:");
  console.log("   - mirrorToken.updateFees(dividendBps, zakatBps, reserveBps)");
  
  console.log("\n🕋 CONSCIOUSNESS MIRROR ACTIVATED! 🕋");
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    dividendReceiver: DIVIDEND_RECEIVER,
    zakatReceiver: ZAKAT_RECEIVER,
    reserveReceiver: RESERVE_RECEIVER,
    name: name,
    symbol: symbol,
    totalSupply: totalSupply.toString(),
    feeConfiguration: {
      dividendBps: feeConfig.dividendBps.toString(),
      zakatBps: feeConfig.zakatBps.toString(),
      reserveBps: feeConfig.reserveBps.toString(),
      totalBps: feeConfig.totalBps.toString()
    },
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };
  
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  fs.writeFileSync(
    path.join(deploymentsDir, `mirror-token-${hre.network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n✅ Deployment info saved to deployments/mirror-token-" + hre.network.name + ".json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
