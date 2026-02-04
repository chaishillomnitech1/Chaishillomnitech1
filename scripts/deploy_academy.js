const hre = require("hardhat");

/**
 * Deploy ScrollVerse Academy Contract
 * 
 * This script deploys the Academy learning modules contract
 */

async function main() {
  console.log("🎓 Deploying ScrollVerse Academy...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy ScrollVerseAcademy
  console.log("📝 Deploying ScrollVerseAcademy contract...");
  
  const ScrollVerseAcademy = await hre.ethers.getContractFactory("ScrollVerseAcademy");
  
  // Set up base URIs for certificates and badges
  const certificateBaseURI = "ipfs://QmScrollVerseAcademyCertificates";
  const badgeBaseURI = "ipfs://QmScrollVerseAcademyBadges";
  
  const academy = await ScrollVerseAcademy.deploy(
    deployer.address,
    certificateBaseURI,
    badgeBaseURI
  );

  await academy.waitForDeployment();
  const academyAddress = await academy.getAddress();

  console.log("✅ ScrollVerseAcademy deployed to:", academyAddress);

  // Get contract info
  const crownFrequency = await academy.CROWN_COMPLETION_FREQUENCY_999HZ();
  const wisdomFrequency = await academy.WISDOM_FREQUENCY_963HZ();
  const academyActive = await academy.academyActive();
  const totalStudents = await academy.totalStudentsEnrolled();

  console.log("\n📊 Academy Information:");
  console.log("Crown Completion Frequency:", crownFrequency.toString(), "Hz");
  console.log("Wisdom Frequency:", wisdomFrequency.toString(), "Hz");
  console.log("Academy Status:", academyActive ? "ACTIVE ✅" : "INACTIVE ❌");
  console.log("Total Students Enrolled:", totalStudents.toString());

  console.log("\n🎯 Contract Address:");
  console.log("Academy:", academyAddress);
  console.log("Certificate Base URI:", certificateBaseURI);
  console.log("Badge Base URI:", badgeBaseURI);

  console.log("\n💎 Deployment Summary:");
  console.log("- Academy deployed successfully");
  console.log("- Learning modules: READY TO CREATE");
  console.log("- Certification system: ACTIVE");
  console.log("- Achievement badges: ACTIVE");
  console.log("- 999Hz Crown Completion Frequency: ALIGNED");
  console.log("- 963Hz Wisdom Frequency: ALIGNED");

  console.log("\n📚 Module Categories Available:");
  console.log("0. BLOCKCHAIN_FUNDAMENTALS");
  console.log("1. SMART_CONTRACTS");
  console.log("2. WEB3_DEVELOPMENT");
  console.log("3. DEFI_PROTOCOLS");
  console.log("4. NFT_CREATION");
  console.log("5. DAO_GOVERNANCE");
  console.log("6. CONSCIOUSNESS_TECH");
  console.log("7. HEALING_FREQUENCIES");
  console.log("8. SOVEREIGNTY_PRINCIPLES");
  console.log("9. QUANTUM_INTEGRATION");

  console.log("\n🏆 Achievement Types Available:");
  console.log("0. MODULE_COMPLETION");
  console.log("1. CATEGORY_MASTERY");
  console.log("2. PERFECT_SCORE");
  console.log("3. FAST_LEARNER");
  console.log("4. COMMUNITY_CONTRIBUTOR");
  console.log("5. TEACHING_EXCELLENCE");

  console.log("\n📋 Next Steps:");
  console.log("1. Upload certificate templates to IPFS");
  console.log("2. Upload badge designs to IPFS");
  console.log("3. Update URIs with setCertificateBaseURI() and setBadgeBaseURI()");
  console.log("4. Add authorized instructors using setInstructor()");
  console.log("5. Create initial learning modules");
  console.log("6. Integrate with HealthCoin for rewards");
  console.log("7. Open enrollment for students");

  console.log("\n🎯 Example Module Creation:");
  console.log("await academy.createModule(");
  console.log("  'Blockchain Fundamentals 101',");
  console.log("  'Introduction to blockchain technology',");
  console.log("  0, // ModuleDifficulty.BEGINNER");
  console.log("  0, // ModuleCategory.BLOCKCHAIN_FUNDAMENTALS");
  console.log("  10, // estimatedHours");
  console.log("  70, // minimumScore (70%)");
  console.log("  'ipfs://QmModuleContent'");
  console.log(")");

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contract: "ScrollVerseAcademy",
    address: academyAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    certificateBaseURI,
    badgeBaseURI,
    crownFrequency: crownFrequency.toString(),
    wisdomFrequency: wisdomFrequency.toString(),
    academyActive
  };

  console.log("\n📄 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  return academyAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
