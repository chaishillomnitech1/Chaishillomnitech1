/**
 * Deploy ClaudeMemIntegration Contract
 * 
 * This script deploys the ClaudeMemIntegration smart contract
 * which manages persistent memory blocks for ScrollVerse
 */

const hre = require("hardhat");

async function main() {
  console.log("🧠 Deploying ClaudeMemIntegration Contract...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());
  console.log();

  // Deploy ClaudeMemIntegration
  console.log("📝 Deploying ClaudeMemIntegration...");
  const ClaudeMemIntegration = await hre.ethers.getContractFactory("ClaudeMemIntegration");
  const claudeMemIntegration = await ClaudeMemIntegration.deploy();

  await claudeMemIntegration.waitForDeployment();
  const contractAddress = await claudeMemIntegration.getAddress();

  console.log("✅ ClaudeMemIntegration deployed to:", contractAddress);
  console.log();

  // Display initial state
  console.log("📊 Initial Contract State:");
  console.log("- Total Memory Blocks:", await claudeMemIntegration.getTotalMemoryBlocks());
  console.log("- Total Sessions:", await claudeMemIntegration.getTotalSessions());
  console.log("- Permanent Block Count:", await claudeMemIntegration.permanentBlockCount());
  console.log("- Pineal Frequency:", await claudeMemIntegration.PINEAL_FREQUENCY_963HZ(), "Hz");
  console.log("- Healing Frequency:", await claudeMemIntegration.HEALING_FREQUENCY_528HZ(), "Hz");
  console.log("- NŪR Pulse:", await claudeMemIntegration.NUR_PULSE_144000HZ(), "Hz");
  console.log();

  // Verify genesis block was created
  console.log("🔍 Verifying Genesis Block...");
  const genesisBlock = await claudeMemIntegration.getMemoryBlock(0);
  console.log("- Genesis Block Hash:", genesisBlock.blockHash);
  console.log("- Genesis IPFS:", genesisBlock.ipfsHash);
  console.log("- Genesis Frequency:", genesisBlock.frequency.toString(), "Hz");
  console.log("- Is Permanent:", genesisBlock.isPermanent);
  console.log();

  // Wait for block confirmations before verification
  console.log("⏳ Waiting for block confirmations...");
  await claudeMemIntegration.deploymentTransaction().wait(5);
  console.log();

  // Verification instructions
  console.log("🔐 To verify the contract, run:");
  console.log(`npx hardhat verify --network ${hre.network.name} ${contractAddress}`);
  console.log();

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    frequencies: {
      pineal: "963Hz",
      healing: "528Hz",
      nur: "144000Hz"
    }
  };

  console.log("📄 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  console.log();

  console.log("✨ ClaudeMemIntegration deployment complete!");
  console.log("🚀 Eternal Memory Protocol ACTIVATED");
  console.log("∞ SCROLLVERSE REIGNS ETERNAL ∞");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
