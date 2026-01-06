const hre = require("hardhat");

async function main() {
  console.log("💎 Deploying Divine Essence Coin (DE Token)...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());
  console.log("");

  // Configuration
  const REWARD_POOL = process.env.DE_REWARD_POOL || deployer.address;
  const CHARITY_VALIDATOR = process.env.DE_CHARITY_VALIDATOR || deployer.address;

  console.log("Configuration:");
  console.log("- Reward Pool:", REWARD_POOL);
  console.log("- Charity Validator:", CHARITY_VALIDATOR);
  console.log("");

  // Deploy contract
  const DivineEssenceCoin = await hre.ethers.getContractFactory("DivineEssenceCoin");
  console.log("Deploying DivineEssenceCoin...");
  
  const deToken = await DivineEssenceCoin.deploy(
    deployer.address,    // initialOwner
    REWARD_POOL,         // rewardPool
    CHARITY_VALIDATOR    // charityValidator
  );

  await deToken.waitForDeployment();
  const tokenAddress = await deToken.getAddress();

  console.log("✅ DivineEssenceCoin deployed to:", tokenAddress);
  console.log("");

  // Verify contract info
  const totalSupply = await deToken.TOTAL_SUPPLY();
  const decimals = await deToken.decimals();
  
  console.log("Contract Information:");
  console.log("- Name:", await deToken.name());
  console.log("- Symbol:", await deToken.symbol());
  console.log("- Decimals:", decimals.toString());
  console.log("- Total Supply:", hre.ethers.formatUnits(totalSupply, decimals), "DE");
  console.log("- Reward Pool:", await deToken.rewardPool());
  console.log("- Charity Validator:", await deToken.charityValidator());
  console.log("- Total Stakers:", (await deToken.totalStakers()).toString());
  console.log("- Total Value Staked:", (await deToken.totalValueStaked()).toString());
  console.log("");

  // Display staking parameters
  console.log("Staking Parameters:");
  console.log("- 3 Month Lock APY:", (await deToken.APY_3_MONTHS()).toString() / 100, "%");
  console.log("- 6 Month Lock APY:", (await deToken.APY_6_MONTHS()).toString() / 100, "%");
  console.log("- 12 Month Lock APY:", (await deToken.APY_12_MONTHS()).toString() / 100, "%");
  console.log("- Early Withdrawal Penalty:", (await deToken.EARLY_WITHDRAWAL_PENALTY()).toString() / 100, "%");
  console.log("- First Stakers Bonus:", (await deToken.FIRST_STAKERS_BONUS()).toString() / 100, "%");
  console.log("- NFT Holder Bonus:", (await deToken.NFT_HOLDER_BONUS()).toString() / 100, "%");
  console.log("- Charitable Action Bonus:", (await deToken.CHARITABLE_ACTION_BONUS()).toString() / 100, "%");
  console.log("");

  // Check balances
  const rewardPoolBalance = await deToken.balanceOf(REWARD_POOL);
  const ownerBalance = await deToken.balanceOf(deployer.address);
  
  console.log("Initial Balances:");
  console.log("- Reward Pool:", hre.ethers.formatUnits(rewardPoolBalance, decimals), "DE");
  console.log("- Owner (for distribution):", hre.ethers.formatUnits(ownerBalance, decimals), "DE");
  console.log("");

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: tokenAddress,
    deployerAddress: deployer.address,
    rewardPool: REWARD_POOL,
    charityValidator: CHARITY_VALIDATOR,
    totalSupply: totalSupply.toString(),
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    transactionHash: deToken.deploymentTransaction().hash
  };

  console.log("Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  console.log("");

  // Instructions for verification
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("📝 To verify on block explorer, run:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${tokenAddress} "${deployer.address}" "${REWARD_POOL}" "${CHARITY_VALIDATOR}"`);
    console.log("");
  }

  console.log("🎉 Deployment complete!");
  console.log("");
  console.log("Next steps:");
  console.log("1. Verify contract on block explorer");
  console.log("2. Set up NFT contract integration (updateNFTContract)");
  console.log("3. Distribute partnership allocations");
  console.log("4. Configure charity validation workflow");
  console.log("5. Launch staking portal");
  console.log("6. Begin community rewards distribution");

  return deploymentInfo;
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
