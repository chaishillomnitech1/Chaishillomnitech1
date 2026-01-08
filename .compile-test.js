const { ethers } = require("hardhat");

async function main() {
  console.log("Testing compilation of new contracts...");
  
  try {
    console.log("Compiling SovereignShieldProtocol...");
    const SovereignShield = await ethers.getContractFactory("SovereignShieldProtocol");
    console.log("✓ SovereignShieldProtocol compiled successfully");
    
    console.log("Compiling DynamicDAOGovernance...");
    const DynamicDAO = await ethers.getContractFactory("DynamicDAOGovernance");
    console.log("✓ DynamicDAOGovernance compiled successfully");
    
    console.log("Compiling EternalHarvestProtocol...");
    const EternalHarvest = await ethers.getContractFactory("EternalHarvestProtocol");
    console.log("✓ EternalHarvestProtocol compiled successfully");
    
    console.log("\n🎉 All new contracts compiled successfully!");
  } catch (error) {
    console.error("❌ Compilation error:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
