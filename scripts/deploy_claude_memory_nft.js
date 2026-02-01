/**
 * Deploy ClaudeMemoryNFT Contract
 * 
 * This script deploys the ClaudeMemoryNFT smart contract
 * which transforms memory blocks into tradable NFTs (Chapters of Infinity)
 */

const hre = require("hardhat");

async function main() {
  console.log("💎 Deploying ClaudeMemoryNFT Contract...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());
  console.log();

  // Configuration
  const BASE_URI = "ipfs://QmClaudeMemoryScrollVerse/";
  const ROYALTY_RECIPIENT = deployer.address; // Can be updated later
  
  // Get ClaudeMemIntegration address (should be deployed first)
  const CLAUDE_MEM_INTEGRATION = process.env.CLAUDE_MEM_INTEGRATION_ADDRESS || "";
  
  if (!CLAUDE_MEM_INTEGRATION) {
    console.log("⚠️  Warning: CLAUDE_MEM_INTEGRATION_ADDRESS not set in environment");
    console.log("   Please deploy ClaudeMemIntegration first and set the address");
    console.log("   Or provide it as an environment variable");
    console.log();
    process.exit(1);
  }

  console.log("📝 Configuration:");
  console.log("- Base URI:", BASE_URI);
  console.log("- Royalty Recipient:", ROYALTY_RECIPIENT);
  console.log("- ClaudeMemIntegration:", CLAUDE_MEM_INTEGRATION);
  console.log();

  // Deploy ClaudeMemoryNFT
  console.log("📝 Deploying ClaudeMemoryNFT...");
  const ClaudeMemoryNFT = await hre.ethers.getContractFactory("ClaudeMemoryNFT");
  const claudeMemoryNFT = await ClaudeMemoryNFT.deploy(
    BASE_URI,
    ROYALTY_RECIPIENT,
    CLAUDE_MEM_INTEGRATION
  );

  await claudeMemoryNFT.waitForDeployment();
  const contractAddress = await claudeMemoryNFT.getAddress();

  console.log("✅ ClaudeMemoryNFT deployed to:", contractAddress);
  console.log();

  // Display initial state
  console.log("📊 Initial Contract State:");
  console.log("- Contract Name:", await claudeMemoryNFT.name());
  console.log("- Contract Symbol:", await claudeMemoryNFT.symbol());
  console.log("- Total Supply:", await claudeMemoryNFT.totalSupply());
  console.log("- Max Supply:", await claudeMemoryNFT.MAX_SUPPLY());
  console.log("- Royalty Percentage:", (await claudeMemoryNFT.ROYALTY_PERCENTAGE()).toString() / 100, "%");
  console.log("- NŪR Pulse:", await claudeMemoryNFT.NUR_PULSE_144000HZ(), "Hz");
  console.log("- Crown Frequency:", await claudeMemoryNFT.CROWN_FREQUENCY_999HZ(), "Hz");
  console.log();

  // Display cosmic elements
  console.log("🌌 Cosmic Elements Available:");
  console.log("- GOLD (0): Precious metal alignment");
  console.log("- PLATINUM (1): Rare element");
  console.log("- DIAMOND (2): Crystal resonance");
  console.log("- EMERALD (3): Earth frequency");
  console.log("- SAPPHIRE (4): Sky resonance");
  console.log("- RUBY (5): Fire element");
  console.log("- COSMIC_DUST (6): Universal matter");
  console.log();

  // Wait for block confirmations before verification
  console.log("⏳ Waiting for block confirmations...");
  await claudeMemoryNFT.deploymentTransaction().wait(5);
  console.log();

  // Verification instructions
  console.log("🔐 To verify the contract, run:");
  console.log(`npx hardhat verify --network ${hre.network.name} ${contractAddress} "${BASE_URI}" "${ROYALTY_RECIPIENT}" "${CLAUDE_MEM_INTEGRATION}"`);
  console.log();

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    config: {
      baseURI: BASE_URI,
      royaltyRecipient: ROYALTY_RECIPIENT,
      claudeMemIntegration: CLAUDE_MEM_INTEGRATION
    },
    frequencies: {
      nur: "144000Hz",
      crown: "999Hz"
    },
    cosmicElements: [
      "GOLD", "PLATINUM", "DIAMOND", "EMERALD", 
      "SAPPHIRE", "RUBY", "COSMIC_DUST"
    ]
  };

  console.log("📄 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  console.log();

  console.log("✨ ClaudeMemoryNFT deployment complete!");
  console.log("💎 Chapters of Infinity NFT Protocol ACTIVATED");
  console.log("∞ SCROLLVERSE REIGNS ETERNAL ∞");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
