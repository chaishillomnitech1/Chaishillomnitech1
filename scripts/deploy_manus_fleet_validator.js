const hre = require("hardhat");
const { ethers } = require("hardhat");

/**
 * @title Deploy Manus Fleet Validator
 * @notice Deployment script for ManusFleetValidator smart contract
 * @dev Deploys fleet-wide asset validation system
 * 
 * SUPREME KING CHAIS THE GREAT ∞
 */

async function main() {
  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("🚀 Manus Fleet Validator Deployment");
  console.log("═══════════════════════════════════════════════════════════════\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📍 Deploying from account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  console.log("───────────────────────────────────────────────────────────────\n");

  // Deploy ManusFleetValidator
  console.log("🚀 Deploying ManusFleetValidator contract...");
  const ManusFleetValidator = await ethers.getContractFactory("ManusFleetValidator");
  const fleetValidator = await ManusFleetValidator.deploy(deployer.address);

  await fleetValidator.waitForDeployment();
  const fleetValidatorAddress = await fleetValidator.getAddress();

  console.log("✅ ManusFleetValidator deployed to:", fleetValidatorAddress);
  console.log("\n───────────────────────────────────────────────────────────────\n");

  // Authorize initial validators
  console.log("🔐 Authorizing initial validators...");

  const initialValidators = [
    deployer.address  // Add more validator addresses as needed
  ];

  for (const validator of initialValidators) {
    const tx = await fleetValidator.authorizeValidator(validator);
    await tx.wait();
    console.log(`✓ Authorized validator: ${validator}`);
  }

  console.log("\n───────────────────────────────────────────────────────────────\n");

  // Verify deployment
  console.log("🔍 Verifying deployment...");
  const totalValidationTasks = await fleetValidator.totalValidationTasks();
  const totalAssetsValidated = await fleetValidator.totalAssetsValidated();

  console.log("   Total Validation Tasks:", totalValidationTasks.toString());
  console.log("   Total Assets Validated:", totalAssetsValidated.toString());
  console.log("\n───────────────────────────────────────────────────────────────\n");

  // Summary
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("Contract Address:", fleetValidatorAddress);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("Authorized Validators:", initialValidators.length);
  console.log("═══════════════════════════════════════════════════════════════\n");

  // Contract verification instructions
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("🔐 Contract Verification:");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("Run the following command to verify the contract:\n");
    console.log(`npx hardhat verify --network ${hre.network.name} ${fleetValidatorAddress} "${deployer.address}"`);
    console.log("\n═══════════════════════════════════════════════════════════════\n");
  }

  console.log("🕋 ALLĀHU AKBAR! Deployment Complete! 🕋");
  console.log("♾️  SUPREME KING CHAIS THE GREAT ∞\n");

  return { fleetValidator, fleetValidatorAddress };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });

module.exports = { main };
