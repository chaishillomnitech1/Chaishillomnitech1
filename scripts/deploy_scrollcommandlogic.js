const hre = require("hardhat");

async function main() {
    console.log("🕋 DEPLOYING SCROLLCOMMANDLOGIC CONTRACT 🕋");
    console.log("==============================================");
    console.log("ALLĀHU AKBAR! 🔥💎🌌");
    console.log("");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());
    console.log("");

    // Deploy ScrollCommandLogic
    console.log("📜 Deploying ScrollCommandLogic...");
    const ScrollCommandLogic = await hre.ethers.getContractFactory("ScrollCommandLogic");
    const scrollCommandLogic = await ScrollCommandLogic.deploy();

    await scrollCommandLogic.deployed();

    console.log("✅ ScrollCommandLogic deployed to:", scrollCommandLogic.address);
    console.log("");
    
    // Display key constants
    console.log("📊 Contract Configuration:");
    console.log("- MIN_GUARDIAN_RESONANCE:", (await scrollCommandLogic.MIN_GUARDIAN_RESONANCE()).toString());
    console.log("- MAX_DRAGONS:", (await scrollCommandLogic.MAX_DRAGONS()).toString());
    console.log("- PROPOSAL_APPROVAL_THRESHOLD:", (await scrollCommandLogic.PROPOSAL_APPROVAL_THRESHOLD()).toString(), "%");
    console.log("");
    
    console.log("🎵 Frequency Constants:");
    console.log("- FREQUENCY_528HZ:", (await scrollCommandLogic.FREQUENCY_528HZ()).toString(), "Hz (Healing)");
    console.log("- FREQUENCY_963HZ:", (await scrollCommandLogic.FREQUENCY_963HZ()).toString(), "Hz (Divine)");
    console.log("- FREQUENCY_999HZ:", (await scrollCommandLogic.FREQUENCY_999HZ()).toString(), "Hz (Crown)");
    console.log("- FREQUENCY_144000HZ:", (await scrollCommandLogic.FREQUENCY_144000HZ()).toString(), "Hz (NŪR Pulse)");
    console.log("");

    console.log("🔥 Valid Commands:");
    console.log("- I ACCEPT");
    console.log("- I AM PRESENT");
    console.log("- I RESONATE");
    console.log("- I MANIFEST");
    console.log("- KUN FAYAKUN");
    console.log("");

    console.log("🌟 Initial State:");
    console.log("- Protocol Active:", await scrollCommandLogic.isProtocolActive());
    console.log("- Legacy Affirmed:", await scrollCommandLogic.legacyAffirmed());
    console.log("- Total Guardians:", (await scrollCommandLogic.totalGuardians()).toString());
    console.log("- Total Dragons:", (await scrollCommandLogic.totalDragons()).toString());
    console.log("");

    console.log("==============================================");
    console.log("✨ DEPLOYMENT COMPLETE - SCROLLVERSE ACTIVATED ✨");
    console.log("==============================================");
    console.log("");
    console.log("📝 Next Steps:");
    console.log("1. Affirm legacy protocols: scrollCommandLogic.affirmLegacy()");
    console.log("2. Register Guardians with resonance >= 500");
    console.log("3. Assign Dragon NFTs to eligible Guardians");
    console.log("4. Enable command execution for governance");
    console.log("");
    console.log("🔱 Contract Address:", scrollCommandLogic.address);
    console.log("");

    // Save deployment info
    const fs = require("fs");
    const deploymentInfo = {
        network: hre.network.name,
        contractAddress: scrollCommandLogic.address,
        deployer: deployer.address,
        deploymentTime: new Date().toISOString(),
        blockNumber: scrollCommandLogic.deployTransaction.blockNumber,
        transactionHash: scrollCommandLogic.deployTransaction.hash,
    };

    const deploymentPath = `./deployment/scrollcommandlogic-${hre.network.name}.json`;
    fs.mkdirSync("./deployment", { recursive: true });
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    
    console.log("💾 Deployment info saved to:", deploymentPath);
    console.log("");

    // Verification command
    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
        console.log("🔍 To verify contract on Etherscan:");
        console.log(`npx hardhat verify --network ${hre.network.name} ${scrollCommandLogic.address}`);
        console.log("");
    }

    console.log("∞ ARCHITEX ∞");
    console.log("SUPREME KING CHAIS THE GREAT");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
