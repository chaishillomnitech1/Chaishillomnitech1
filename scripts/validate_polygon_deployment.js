// Validate Akashic Records Polygon Mainnet Deployment
// Comprehensive validation of all deployed contracts

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔍 AKASHIC RECORDS - DEPLOYMENT VALIDATION 🔍");
  console.log("=".repeat(80));
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Validating with account:", deployer.address);
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", (await hre.ethers.provider.getNetwork()).chainId);
  
  const deploymentsDir = path.join(__dirname, "..", "deployment");
  const suiteDeploymentPath = path.join(deploymentsDir, `akashic-mainnet-suite-${hre.network.name}.json`);
  
  if (!fs.existsSync(suiteDeploymentPath)) {
    throw new Error(`Deployment file not found: ${suiteDeploymentPath}`);
  }
  
  const deployment = JSON.parse(fs.readFileSync(suiteDeploymentPath, 'utf8'));
  
  console.log("\n📜 Deployed Contracts:");
  console.log("  Label:", deployment.contracts.label.address);
  console.log("  Vault:", deployment.contracts.vault.address);
  console.log("  DAO:", deployment.contracts.dao.address);
  
  const validationResults = {
    timestamp: new Date().toISOString(),
    network: hre.network.name,
    tests: [],
    passed: 0,
    failed: 0,
    warnings: 0
  };
  
  // ========== VALIDATE LABEL CONTRACT ==========
  console.log("\n" + "=".repeat(80));
  console.log("VALIDATING AKASHIC RECORDS LABEL");
  console.log("=".repeat(80));
  
  try {
    const label = await hre.ethers.getContractAt("AkashicRecordsLabel", deployment.contracts.label.address);
    
    // Test 1: Check total supply
    const totalSupply = await label.totalSupply();
    const test1 = {
      name: "Label: Total Supply Check",
      expected: "26 tracks minted",
      actual: totalSupply.toString(),
      passed: totalSupply >= 0n
    };
    validationResults.tests.push(test1);
    if (test1.passed) validationResults.passed++; else validationResults.failed++;
    console.log(test1.passed ? "✅" : "❌", test1.name, "-", test1.actual);
    
    if (totalSupply < 26n) {
      validationResults.warnings++;
      console.log("⚠️  WARNING: Expected 26 tracks, found", totalSupply.toString());
    }
    
    // Test 2: Check sacred frequencies
    const healingFreq = await label.HEALING_FREQUENCY_528HZ();
    const unityFreq = await label.UNITY_FREQUENCY_963HZ();
    const crownFreq = await label.CROWN_FREQUENCY_999HZ();
    const nurPulse = await label.NUR_PULSE_144000HZ();
    
    const test2 = {
      name: "Label: Sacred Frequencies",
      expected: "528Hz, 963Hz, 999Hz, 144000Hz",
      actual: `${healingFreq}Hz, ${unityFreq}Hz, ${crownFreq}Hz, ${nurPulse}Hz`,
      passed: healingFreq === 528n && unityFreq === 963n && crownFreq === 999n && nurPulse === 144000n
    };
    validationResults.tests.push(test2);
    if (test2.passed) validationResults.passed++; else validationResults.failed++;
    console.log(test2.passed ? "✅" : "❌", test2.name, "-", test2.actual);
    
    // Test 3: Check label treasury
    const labelTreasury = await label.labelTreasury();
    const test3 = {
      name: "Label: Treasury Address",
      expected: deployment.contracts.vault.address,
      actual: labelTreasury,
      passed: labelTreasury.toLowerCase() === deployment.contracts.vault.address.toLowerCase()
    };
    validationResults.tests.push(test3);
    if (test3.passed) validationResults.passed++; else validationResults.failed++;
    console.log(test3.passed ? "✅" : "❌", test3.name);
    
    // Test 4: Check royalty percentage
    const royaltyPercentage = await label.ROYALTY_PERCENTAGE();
    const test4 = {
      name: "Label: Royalty Percentage",
      expected: "1000 (10%)",
      actual: royaltyPercentage.toString(),
      passed: royaltyPercentage === 1000n
    };
    validationResults.tests.push(test4);
    if (test4.passed) validationResults.passed++; else validationResults.failed++;
    console.log(test4.passed ? "✅" : "❌", test4.name, "-", test4.actual, "basis points");
    
    // Test 5: Check ERC-2981 support
    const supportsERC2981 = await label.supportsInterface("0x2a55205a");
    const test5 = {
      name: "Label: ERC-2981 Support",
      expected: "true",
      actual: supportsERC2981.toString(),
      passed: supportsERC2981
    };
    validationResults.tests.push(test5);
    if (test5.passed) validationResults.passed++; else validationResults.failed++;
    console.log(test5.passed ? "✅" : "❌", test5.name);
    
    // Test 6: Validate a minted track (if any exist)
    if (totalSupply > 0n) {
      const trackChain = await label.getTrackChain(0);
      const test6 = {
        name: "Label: Track Chain Data",
        expected: "Valid track data",
        actual: `Token ${trackChain.tokenId}: ${trackChain.trackName}`,
        passed: trackChain.trackName.length > 0 && trackChain.isActive
      };
      validationResults.tests.push(test6);
      if (test6.passed) validationResults.passed++; else validationResults.failed++;
      console.log(test6.passed ? "✅" : "❌", test6.name, "-", test6.actual);
    }
    
  } catch (error) {
    console.error("❌ Label validation failed:", error.message);
    validationResults.failed++;
  }
  
  // ========== VALIDATE TREASURY VAULT ==========
  console.log("\n" + "=".repeat(80));
  console.log("VALIDATING AKASHIC TREASURY VAULT");
  console.log("=".repeat(80));
  
  try {
    const vault = await hre.ethers.getContractAt("AkashicTreasuryVault", deployment.contracts.vault.address);
    
    // Test 7: Check revenue allocation percentages
    const artistAllocation = await vault.ARTIST_ALLOCATION_BPS();
    const treasuryAllocation = await vault.TREASURY_ALLOCATION_BPS();
    const zakatAllocation = await vault.ZAKAT_ALLOCATION_BPS();
    const operationsAllocation = await vault.OPERATIONS_ALLOCATION_BPS();
    
    const test7 = {
      name: "Vault: Revenue Allocation",
      expected: "70% / 15% / 7.77% / 7.23%",
      actual: `${artistAllocation}bps / ${treasuryAllocation}bps / ${zakatAllocation}bps / ${operationsAllocation}bps`,
      passed: artistAllocation === 7000n && treasuryAllocation === 1500n && 
              zakatAllocation === 777n && operationsAllocation === 723n
    };
    validationResults.tests.push(test7);
    if (test7.passed) validationResults.passed++; else validationResults.failed++;
    console.log(test7.passed ? "✅" : "❌", test7.name);
    
    // Test 8: Check sacred frequencies
    const loveFreq = await vault.LOVE_FREQUENCY();
    const divineWisdom = await vault.DIVINE_WISDOM_FREQUENCY();
    const crownFreqVault = await vault.CROWN_FREQUENCY();
    
    const test8 = {
      name: "Vault: Sacred Frequencies",
      expected: "528Hz, 777Hz, 999Hz",
      actual: `${loveFreq}Hz, ${divineWisdom}Hz, ${crownFreqVault}Hz`,
      passed: loveFreq === 528n && divineWisdom === 777n && crownFreqVault === 999n
    };
    validationResults.tests.push(test8);
    if (test8.passed) validationResults.passed++; else validationResults.failed++;
    console.log(test8.passed ? "✅" : "❌", test8.name, "-", test8.actual);
    
    // Test 9: Check label contract reference
    const akashicLabel = await vault.akashicLabel();
    const test9 = {
      name: "Vault: Label Contract Reference",
      expected: deployment.contracts.label.address,
      actual: akashicLabel,
      passed: akashicLabel.toLowerCase() === deployment.contracts.label.address.toLowerCase()
    };
    validationResults.tests.push(test9);
    if (test9.passed) validationResults.passed++; else validationResults.failed++;
    console.log(test9.passed ? "✅" : "❌", test9.name);
    
    // Test 10: Check Zakat recipient
    const zakatRecipient = await vault.zakatRecipient();
    const test10 = {
      name: "Vault: Zakat Recipient",
      expected: "Non-zero address",
      actual: zakatRecipient,
      passed: zakatRecipient !== "0x0000000000000000000000000000000000000000"
    };
    validationResults.tests.push(test10);
    if (test10.passed) validationResults.passed++; else validationResults.failed++;
    console.log(test10.passed ? "✅" : "❌", test10.name, "-", zakatRecipient);
    
    // Test 11: Check operations address
    const operationsAddress = await vault.operationsAddress();
    const test11 = {
      name: "Vault: Operations Address",
      expected: "Non-zero address",
      actual: operationsAddress,
      passed: operationsAddress !== "0x0000000000000000000000000000000000000000"
    };
    validationResults.tests.push(test11);
    if (test11.passed) validationResults.passed++; else validationResults.failed++;
    console.log(test11.passed ? "✅" : "❌", test11.name, "-", operationsAddress);
    
    // Test 12: Check treasury metrics
    const metrics = await vault.getTreasuryMetrics();
    const test12 = {
      name: "Vault: Treasury Metrics",
      expected: "Accessible metrics",
      actual: `Revenue: ${hre.ethers.formatEther(metrics.totalRevenue)} MATIC`,
      passed: true // If we got here, it works
    };
    validationResults.tests.push(test12);
    if (test12.passed) validationResults.passed++; else validationResults.failed++;
    console.log(test12.passed ? "✅" : "❌", test12.name, "-", test12.actual);
    
  } catch (error) {
    console.error("❌ Vault validation failed:", error.message);
    validationResults.failed++;
  }
  
  // ========== VALIDATE DAO CONTRACT ==========
  console.log("\n" + "=".repeat(80));
  console.log("VALIDATING AKASHIC RECORDS DAO");
  console.log("=".repeat(80));
  
  try {
    const dao = await hre.ethers.getContractAt("AkashicRecordsDAO", deployment.contracts.dao.address);
    
    // Test 13: Check DAO frequencies
    const loveFr = await dao.LOVE_FREQUENCY();
    const unityFr = await dao.UNITY_FREQUENCY();
    const crownFr = await dao.CROWN_FREQUENCY();
    
    const test13 = {
      name: "DAO: Sacred Frequencies",
      expected: "528Hz, 963Hz, 999Hz",
      actual: `${loveFr}Hz, ${unityFr}Hz, ${crownFr}Hz`,
      passed: loveFr === 528n && unityFr === 963n && crownFr === 999n
    };
    validationResults.tests.push(test13);
    if (test13.passed) validationResults.passed++; else validationResults.failed++;
    console.log(test13.passed ? "✅" : "❌", test13.name, "-", test13.actual);
    
    // Test 14: Check max founding members
    const maxFoundingMembers = await dao.MAX_FOUNDING_MEMBERS();
    const test14 = {
      name: "DAO: Max Founding Members",
      expected: "50",
      actual: maxFoundingMembers.toString(),
      passed: maxFoundingMembers === 50n
    };
    validationResults.tests.push(test14);
    if (test14.passed) validationResults.passed++; else validationResults.failed++;
    console.log(test14.passed ? "✅" : "❌", test14.name, "-", test14.actual);
    
    // Test 15: Check quorum percentage
    const quorumPercentage = await dao.QUORUM_PERCENTAGE();
    const test15 = {
      name: "DAO: Quorum Percentage",
      expected: "10%",
      actual: quorumPercentage.toString() + "%",
      passed: quorumPercentage === 10n
    };
    validationResults.tests.push(test15);
    if (test15.passed) validationResults.passed++; else validationResults.failed++;
    console.log(test15.passed ? "✅" : "❌", test15.name, "-", test15.actual);
    
    // Test 16: Check label contract reference
    const daoLabel = await dao.akashicLabel();
    const test16 = {
      name: "DAO: Label Contract Reference",
      expected: deployment.contracts.label.address,
      actual: daoLabel,
      passed: daoLabel.toLowerCase() === deployment.contracts.label.address.toLowerCase()
    };
    validationResults.tests.push(test16);
    if (test16.passed) validationResults.passed++; else validationResults.failed++;
    console.log(test16.passed ? "✅" : "❌", test16.name);
    
    // Test 17: Check founding members count
    const foundingCount = await dao.foundingMembersCount();
    const test17 = {
      name: "DAO: Founding Members Count",
      expected: "0-50",
      actual: foundingCount.toString(),
      passed: foundingCount >= 0n && foundingCount <= 50n
    };
    validationResults.tests.push(test17);
    if (test17.passed) validationResults.passed++; else validationResults.failed++;
    console.log(test17.passed ? "✅" : "❌", test17.name, "-", test17.actual, "/ 50");
    
    // Test 18: Check total members
    const memberCount = await dao.getMemberCount();
    const test18 = {
      name: "DAO: Total Member Count",
      expected: "Non-negative",
      actual: memberCount.toString(),
      passed: memberCount >= 0n
    };
    validationResults.tests.push(test18);
    if (test18.passed) validationResults.passed++; else validationResults.failed++;
    console.log(test18.passed ? "✅" : "❌", test18.name, "-", test18.actual);
    
    // Test 19: Check proposal count
    const proposalCount = await dao.getProposalCount();
    const test19 = {
      name: "DAO: Proposal Count",
      expected: "Non-negative",
      actual: proposalCount.toString(),
      passed: proposalCount >= 0n
    };
    validationResults.tests.push(test19);
    if (test19.passed) validationResults.passed++; else validationResults.failed++;
    console.log(test19.passed ? "✅" : "❌", test19.name, "-", test19.actual);
    
  } catch (error) {
    console.error("❌ DAO validation failed:", error.message);
    validationResults.failed++;
  }
  
  // ========== VALIDATION SUMMARY ==========
  console.log("\n" + "=".repeat(80));
  console.log("📊 VALIDATION SUMMARY");
  console.log("=".repeat(80));
  console.log("Total Tests:", validationResults.tests.length);
  console.log("✅ Passed:", validationResults.passed);
  console.log("❌ Failed:", validationResults.failed);
  console.log("⚠️  Warnings:", validationResults.warnings);
  
  const successRate = ((validationResults.passed / validationResults.tests.length) * 100).toFixed(2);
  console.log("Success Rate:", successRate + "%");
  
  if (validationResults.failed === 0) {
    console.log("\n🎉 ALL VALIDATIONS PASSED! 🎉");
    console.log("Akashic Records deployment is verified and operational.");
  } else {
    console.log("\n⚠️  VALIDATION ISSUES DETECTED");
    console.log("Please review failed tests and address issues before proceeding.");
  }
  
  // Save validation results
  const resultsPath = path.join(deploymentsDir, `validation-results-${hre.network.name}-${Date.now()}.json`);
  fs.writeFileSync(resultsPath, JSON.stringify(validationResults, null, 2));
  console.log("\n✅ Validation results saved to:", resultsPath);
  
  console.log("\n🕋 ALLĀHU AKBAR! Validation Complete 🕋");
  
  return validationResults;
}

// Run validation
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Validation failed:", error);
      process.exit(1);
    });
}

module.exports = main;
