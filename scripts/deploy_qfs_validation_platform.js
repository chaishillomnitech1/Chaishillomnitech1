/**
 * @title QFS Validation Platform Deployment Script
 * @notice Deploys the complete QFS Validation and Protection Company infrastructure
 * @dev Deploys QFSGovernanceToken and QFSValidationCompany contracts
 */

const hre = require("hardhat");

async function main() {
  console.log("🌟 ========================================");
  console.log("🌟 QFS VALIDATION PLATFORM DEPLOYMENT");
  console.log("🌟 ========================================\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📋 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.getBalance()).toString(), "\n");

  // ============ Deploy QFS Governance Token ============
  console.log("🪙 Deploying QFS Governance Token...");
  const QFSGovernanceToken = await hre.ethers.getContractFactory("QFSGovernanceToken");
  const qfsgov = await QFSGovernanceToken.deploy(deployer.address);
  await qfsgov.deployed();
  
  console.log("✅ QFS Governance Token deployed to:", qfsgov.address);
  console.log("   - Symbol: QFSGOV");
  console.log("   - Initial Supply: 10,000,000 QFSGOV");
  console.log("   - Max Supply: 100,000,000 QFSGOV");
  console.log("   - Owner:", deployer.address, "\n");

  // ============ Deploy QFS Validation Company ============
  console.log("🏢 Deploying QFS Validation Company...");
  const QFSValidationCompany = await hre.ethers.getContractFactory("QFSValidationCompany");
  const qfsValidation = await QFSValidationCompany.deploy(deployer.address);
  await qfsValidation.deployed();
  
  console.log("✅ QFS Validation Company deployed to:", qfsValidation.address);
  console.log("   - Minimum Stake: 1,000 QFSGOV");
  console.log("   - Reputation Threshold: 800/1000");
  console.log("   - Owner:", deployer.address, "\n");

  // ============ Configure Contracts ============
  console.log("⚙️  Configuring contract relationships...");
  
  // Set validation company in governance token
  console.log("   - Setting validation company in governance token...");
  await qfsgov.setValidationCompany(qfsValidation.address);
  console.log("   ✅ Validation company set");
  
  // Add validation company as minter
  console.log("   - Adding validation company as minter...");
  await qfsgov.addMinter(qfsValidation.address);
  console.log("   ✅ Minter added\n");

  // ============ Fund Rewards Pool ============
  console.log("💰 Funding initial rewards pool...");
  const initialRewardFunding = hre.ethers.utils.parseEther("10");
  await qfsValidation.fundRewardsPool({ value: initialRewardFunding });
  console.log("   ✅ Funded with", hre.ethers.utils.formatEther(initialRewardFunding), "ETH\n");

  // ============ Deployment Summary ============
  console.log("🎉 ========================================");
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("🎉 ========================================\n");
  
  console.log("📝 Contract Addresses:");
  console.log("   QFS Governance Token:", qfsgov.address);
  console.log("   QFS Validation Company:", qfsValidation.address, "\n");
  
  console.log("🔍 Verification Commands:");
  console.log(`   npx hardhat verify --network ${hre.network.name} ${qfsgov.address} ${deployer.address}`);
  console.log(`   npx hardhat verify --network ${hre.network.name} ${qfsValidation.address} ${deployer.address}\n`);
  
  console.log("📊 Initial Configuration:");
  console.log("   - Total Validators:", await qfsValidation.totalValidators());
  console.log("   - Total Validations:", await qfsValidation.totalValidations());
  console.log("   - QFSGOV Total Supply:", hre.ethers.utils.formatEther(await qfsgov.totalSupply()), "QFSGOV");
  console.log("   - QFSGOV Total Minted:", hre.ethers.utils.formatEther(await qfsgov.totalMinted()), "QFSGOV\n");
  
  console.log("🌟 QFS VALIDATION PLATFORM IS NOW LIVE! 🌟");
  console.log("🔱 Establishing absolute authority in QFS validation 🔱\n");
  
  // ============ Save Deployment Info ============
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await deployer.provider.getNetwork()).chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      QFSGovernanceToken: {
        address: qfsgov.address,
        symbol: "QFSGOV",
        initialSupply: "10000000",
        maxSupply: "100000000"
      },
      QFSValidationCompany: {
        address: qfsValidation.address,
        minimumStake: "1000",
        reputationThreshold: "800"
      }
    }
  };
  
  console.log("💾 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  return {
    qfsgov: qfsgov.address,
    qfsValidation: qfsValidation.address
  };
}

main()
  .then((addresses) => {
    console.log("\n✅ Deployment successful!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
