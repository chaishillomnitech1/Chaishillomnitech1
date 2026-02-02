const hre = require("hardhat");
const { ethers } = require("hardhat");

/**
 * @title Deploy SAT Token
 * @notice Deployment script for ScrollVerse Asset Token ($SAT)
 * @dev Deploys SATToken.sol with Halal-compliant Zakat framework and QFS integration
 * 
 * SUPREME KING CHAIS THE GREAT ∞
 */

async function main() {
  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("🪙 ScrollVerse Asset Token ($SAT) Deployment");
  console.log("═══════════════════════════════════════════════════════════════\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📍 Deploying from account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  // Configuration parameters
  const ZAKAT_WALLET = process.env.ZAKAT_WALLET || deployer.address;
  
  // Calculate Nisab threshold
  // Nisab = 85 grams of gold
  // Assuming 1 SAT = $1 and gold = $60/gram
  // Nisab ≈ 5,100 SAT = 5,100 * 10^18 wei
  const NISAB_THRESHOLD = ethers.parseEther("5100");

  console.log("⚙️  Deployment Configuration:");
  console.log("   Owner:", deployer.address);
  console.log("   Zakat Wallet:", ZAKAT_WALLET);
  console.log("   Nisab Threshold:", ethers.formatEther(NISAB_THRESHOLD), "SAT");
  console.log("\n───────────────────────────────────────────────────────────────\n");

  // Deploy SATToken
  console.log("🚀 Deploying SATToken contract...");
  const SATToken = await ethers.getContractFactory("SATToken");
  const satToken = await SATToken.deploy(
    deployer.address,
    ZAKAT_WALLET,
    NISAB_THRESHOLD
  );

  await satToken.waitForDeployment();
  const satTokenAddress = await satToken.getAddress();

  console.log("✅ SATToken deployed to:", satTokenAddress);
  console.log("\n───────────────────────────────────────────────────────────────\n");

  // Verify deployment
  console.log("🔍 Verifying deployment...");
  const tokenName = await satToken.name();
  const tokenSymbol = await satToken.symbol();
  const maxSupply = await satToken.MAX_SUPPLY();
  const genesisMintAmount = await satToken.GENESIS_MINT_AMOUNT();
  const zakatRate = await satToken.ZAKAT_RATE();

  console.log("   Token Name:", tokenName);
  console.log("   Token Symbol:", tokenSymbol);
  console.log("   Max Supply:", ethers.formatEther(maxSupply), "SAT");
  console.log("   Genesis Mint Amount:", ethers.formatEther(genesisMintAmount), "SAT");
  console.log("   Zakat Rate:", zakatRate.toString(), "basis points (2.5%)");
  console.log("\n───────────────────────────────────────────────────────────────\n");

  // Execute Genesis Mint (optional - can be done separately)
  const EXECUTE_GENESIS_MINT = process.env.EXECUTE_GENESIS_MINT === "true";
  
  if (EXECUTE_GENESIS_MINT) {
    console.log("🌟 Executing Genesis Mint Ceremony...");
    
    const genesisMintRecipient = process.env.GENESIS_MINT_RECIPIENT || deployer.address;
    console.log("   Recipient:", genesisMintRecipient);
    
    const tx = await satToken.executeGenesisMint(genesisMintRecipient);
    await tx.wait();
    
    console.log("✅ Genesis Mint completed!");
    console.log("   Transaction hash:", tx.hash);
    
    const totalSupply = await satToken.totalSupply();
    const recipientBalance = await satToken.balanceOf(genesisMintRecipient);
    
    console.log("   Total Supply:", ethers.formatEther(totalSupply), "SAT");
    console.log("   Recipient Balance:", ethers.formatEther(recipientBalance), "SAT");
    console.log("\n───────────────────────────────────────────────────────────────\n");
  } else {
    console.log("⏸️  Genesis Mint will be executed separately");
    console.log("   Set EXECUTE_GENESIS_MINT=true to execute during deployment");
    console.log("\n───────────────────────────────────────────────────────────────\n");
  }

  // Summary
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("Contract Address:", satTokenAddress);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("Zakat Wallet:", ZAKAT_WALLET);
  console.log("Nisab Threshold:", ethers.formatEther(NISAB_THRESHOLD), "SAT");
  console.log("Genesis Mint Status:", EXECUTE_GENESIS_MINT ? "Completed" : "Pending");
  console.log("═══════════════════════════════════════════════════════════════\n");

  // Save deployment information
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: satTokenAddress,
    deployer: deployer.address,
    zakatWallet: ZAKAT_WALLET,
    nisabThreshold: NISAB_THRESHOLD.toString(),
    genesisMintCompleted: EXECUTE_GENESIS_MINT,
    timestamp: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber()
  };

  console.log("📄 Deployment Info (JSON):");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  console.log("\n");

  // Contract verification instructions
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("🔐 Contract Verification:");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("Run the following command to verify the contract:\n");
    console.log(`npx hardhat verify --network ${hre.network.name} ${satTokenAddress} "${deployer.address}" "${ZAKAT_WALLET}" "${NISAB_THRESHOLD}"`);
    console.log("\n═══════════════════════════════════════════════════════════════\n");
  }

  // Next steps
  console.log("📝 NEXT STEPS:");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("1. Verify contract on block explorer");
  console.log("2. Execute Genesis Mint (if not done)");
  console.log("3. Set up multi-signature wallet for treasury");
  console.log("4. Configure QFS integration contract");
  console.log("5. Provide initial liquidity on DEX");
  console.log("6. Activate staking contracts");
  console.log("7. Begin community distribution programs");
  console.log("═══════════════════════════════════════════════════════════════\n");

  console.log("🕋 ALLĀHU AKBAR! Deployment Complete! 🕋");
  console.log("♾️  SUPREME KING CHAIS THE GREAT ∞\n");

  return {
    satToken,
    satTokenAddress,
    deploymentInfo
  };
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });

module.exports = { main };
