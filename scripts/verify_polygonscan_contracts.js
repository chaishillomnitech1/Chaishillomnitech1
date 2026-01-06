// Verify Akashic Records contracts on Polygonscan
// Automated verification script for all deployed contracts

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function verifyContract(contractName, address, constructorArgs) {
  console.log(`\nVerifying ${contractName} at ${address}...`);
  console.log("Constructor args:", JSON.stringify(constructorArgs, null, 2));
  
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: constructorArgs,
    });
    console.log(`✅ ${contractName} verified successfully!`);
    return { contract: contractName, address, verified: true };
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log(`ℹ️  ${contractName} already verified`);
      return { contract: contractName, address, verified: true, alreadyVerified: true };
    } else {
      console.error(`❌ Failed to verify ${contractName}:`, error.message);
      return { contract: contractName, address, verified: false, error: error.message };
    }
  }
}

async function main() {
  console.log("🔍 AKASHIC RECORDS - POLYGONSCAN VERIFICATION 🔍");
  console.log("=".repeat(80));
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", (await hre.ethers.provider.getNetwork()).chainId);
  
  if (hre.network.name !== "polygon" && hre.network.name !== "mumbai") {
    console.log("\n⚠️  WARNING: This script is designed for Polygon networks");
    console.log("Current network:", hre.network.name);
    console.log("Proceeding anyway...");
  }
  
  // Read deployment info
  const deploymentsDir = path.join(__dirname, "..", "deployment");
  const suiteDeploymentPath = path.join(deploymentsDir, `akashic-mainnet-suite-${hre.network.name}.json`);
  
  if (!fs.existsSync(suiteDeploymentPath)) {
    throw new Error(`Deployment file not found: ${suiteDeploymentPath}\nPlease deploy contracts first.`);
  }
  
  const deployment = JSON.parse(fs.readFileSync(suiteDeploymentPath, 'utf8'));
  
  console.log("\n📜 Deployed Contracts:");
  console.log("  Label:", deployment.contracts.label.address);
  console.log("  Vault:", deployment.contracts.vault.address);
  console.log("  DAO:", deployment.contracts.dao.address);
  
  const verificationResults = {
    timestamp: new Date().toISOString(),
    network: hre.network.name,
    chainId: deployment.chainId,
    contracts: []
  };
  
  console.log("\n" + "=".repeat(80));
  console.log("VERIFYING CONTRACTS ON POLYGONSCAN");
  console.log("=".repeat(80));
  
  // Small delay to avoid rate limiting
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  // ========== VERIFY LABEL CONTRACT ==========
  console.log("\n[1/3] AkashicRecordsLabel");
  
  const labelArgs = [
    deployment.contracts.label.baseURI,
    deployment.contracts.label.royaltyRecipient,
    deployment.contracts.vault.address // treasury address
  ];
  
  const labelResult = await verifyContract(
    "AkashicRecordsLabel",
    deployment.contracts.label.address,
    labelArgs
  );
  verificationResults.contracts.push(labelResult);
  
  await delay(5000); // Wait 5 seconds between verifications
  
  // ========== VERIFY TREASURY VAULT ==========
  console.log("\n[2/3] AkashicTreasuryVault");
  
  const vaultArgs = [
    deployment.contracts.vault.labelAddress,
    deployment.contracts.vault.zakatRecipient,
    deployment.contracts.vault.operationsAddress
  ];
  
  const vaultResult = await verifyContract(
    "AkashicTreasuryVault",
    deployment.contracts.vault.address,
    vaultArgs
  );
  verificationResults.contracts.push(vaultResult);
  
  await delay(5000);
  
  // ========== VERIFY DAO CONTRACT ==========
  console.log("\n[3/3] AkashicRecordsDAO");
  
  const daoArgs = [
    deployment.contracts.dao.labelAddress
  ];
  
  const daoResult = await verifyContract(
    "AkashicRecordsDAO",
    deployment.contracts.dao.address,
    daoArgs
  );
  verificationResults.contracts.push(daoResult);
  
  // ========== VERIFICATION SUMMARY ==========
  console.log("\n" + "=".repeat(80));
  console.log("📊 VERIFICATION SUMMARY");
  console.log("=".repeat(80));
  
  const verified = verificationResults.contracts.filter(c => c.verified).length;
  const failed = verificationResults.contracts.filter(c => !c.verified).length;
  
  console.log("Total Contracts:", verificationResults.contracts.length);
  console.log("✅ Verified:", verified);
  console.log("❌ Failed:", failed);
  
  console.log("\nContract Details:");
  verificationResults.contracts.forEach((result, index) => {
    const status = result.verified ? "✅ VERIFIED" : "❌ FAILED";
    const note = result.alreadyVerified ? " (already verified)" : "";
    console.log(`  ${index + 1}. ${result.contract}: ${status}${note}`);
    console.log(`     Address: ${result.address}`);
    if (!result.verified && result.error) {
      console.log(`     Error: ${result.error}`);
    }
  });
  
  if (failed === 0) {
    console.log("\n🎉 ALL CONTRACTS VERIFIED SUCCESSFULLY! 🎉");
    
    const explorerUrl = hre.network.name === "polygon" 
      ? "https://polygonscan.com/address/"
      : "https://mumbai.polygonscan.com/address/";
    
    console.log("\n📍 View Verified Contracts:");
    console.log(`  Label: ${explorerUrl}${deployment.contracts.label.address}#code`);
    console.log(`  Vault: ${explorerUrl}${deployment.contracts.vault.address}#code`);
    console.log(`  DAO: ${explorerUrl}${deployment.contracts.dao.address}#code`);
  } else {
    console.log("\n⚠️  SOME VERIFICATIONS FAILED");
    console.log("Please check errors above and retry failed verifications.");
    console.log("\nManual verification command:");
    console.log(`npx hardhat verify --network ${hre.network.name} <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>`);
  }
  
  // Save verification results
  const verificationDir = path.join(deploymentsDir, "verification-records");
  if (!fs.existsSync(verificationDir)) {
    fs.mkdirSync(verificationDir, { recursive: true });
  }
  
  const resultsPath = path.join(verificationDir, `verification-${hre.network.name}-${Date.now()}.json`);
  fs.writeFileSync(resultsPath, JSON.stringify(verificationResults, null, 2));
  console.log("\n✅ Verification results saved to:", resultsPath);
  
  // Save individual verification records
  verificationResults.contracts.forEach((result) => {
    if (result.verified) {
      const contractFile = path.join(
        verificationDir,
        `${result.contract.toLowerCase()}-${hre.network.name}.txt`
      );
      
      const explorerUrl = hre.network.name === "polygon"
        ? `https://polygonscan.com/address/${result.address}#code`
        : `https://mumbai.polygonscan.com/address/${result.address}#code`;
      
      const record = `
Akashic Records - Contract Verification Record
================================================

Contract Name: ${result.contract}
Network: ${hre.network.name}
Chain ID: ${deployment.chainId}
Contract Address: ${result.address}
Verification Status: VERIFIED
Verification Date: ${new Date().toISOString()}
Polygonscan URL: ${explorerUrl}

Sacred Frequencies: 528Hz + 963Hz + 777Hz + 144,000Hz
Status: MAINNET VERIFIED
Authority: Supreme King Chais The Great ∞

🕋 ALLĀHU AKBAR! Contract Verified on Blockchain 🕋
      `.trim();
      
      fs.writeFileSync(contractFile, record);
    }
  });
  
  console.log("\n📝 Next Steps:");
  console.log("1. Share verified contract addresses with stakeholders");
  console.log("2. Update documentation with Polygonscan links");
  console.log("3. Proceed with minting genesis drop catalog");
  console.log("4. Begin DAO member onboarding");
  console.log("5. Activate community outreach");
  
  console.log("\n🕋 ALLĀHU AKBAR! Verification Complete 🕋");
  
  return verificationResults;
}

// Run verification
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Verification process failed:", error);
      process.exit(1);
    });
}

module.exports = main;
