/**
 * Deploy NoorCitizenRegistry
 * 
 * Biometric Soulprint Integration
 * Frequencies: 528Hz + 963Hz + 888Hz
 */

const hre = require("hardhat");

async function main() {
    console.log("🕋 Deploying NoorCitizenRegistry...");
    console.log("Frequency: 528Hz + 963Hz + 888Hz");
    console.log("═".repeat(50));

    // Get deployer
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployer address:", deployer.address);
    console.log("Deployer balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");

    // Get configuration from environment
    const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS || deployer.address;

    console.log("\n📋 Configuration:");
    console.log("Treasury Address:", TREASURY_ADDRESS);

    // Deploy NoorCitizenRegistry
    console.log("\n🚀 Deploying NoorCitizenRegistry contract...");
    const NoorCitizenRegistry = await hre.ethers.getContractFactory("NoorCitizenRegistry");
    const citizenRegistry = await NoorCitizenRegistry.deploy(TREASURY_ADDRESS);

    await citizenRegistry.waitForDeployment();
    const registryAddress = await citizenRegistry.getAddress();

    console.log("✅ NoorCitizenRegistry deployed to:", registryAddress);

    // Get contract details
    const maxCitizens = await citizenRegistry.MAX_CITIZENS();
    const minHeartCoherence = await citizenRegistry.MIN_HEART_COHERENCE();
    const registrationFee = await citizenRegistry.registrationFee();
    const totalCitizens = await citizenRegistry.totalCitizens();
    const totalObelisks = await citizenRegistry.totalObelisks();

    console.log("\n📊 Registry Details:");
    console.log("Max Citizens:", maxCitizens.toString());
    console.log("Min Heart Coherence Score:", minHeartCoherence.toString());
    console.log("Registration Fee:", hre.ethers.formatEther(registrationFee), "ETH");
    console.log("Total Citizens:", totalCitizens.toString());
    console.log("Total Obelisks:", totalObelisks.toString());

    // Get frequency signature
    const resonanceSignature = await citizenRegistry.getResonanceSignature();
    console.log("\n🎵 Resonance Signature:", resonanceSignature.toString(), "Hz");

    // Get treasury
    const treasury = await citizenRegistry.treasury();
    console.log("\n💰 Treasury Address:", treasury);

    // Check if deployer is authorized registrar
    const isAuthorized = await citizenRegistry.authorizedRegistrars(deployer.address);
    console.log("\n🔐 Deployer Authorized as Registrar:", isAuthorized);

    // Save deployment info
    const deploymentInfo = {
        network: hre.network.name,
        contract: "NoorCitizenRegistry",
        address: registryAddress,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        constructor_args: [TREASURY_ADDRESS],
        details: {
            maxCitizens: maxCitizens.toString(),
            minHeartCoherence: minHeartCoherence.toString(),
            registrationFee: registrationFee.toString(),
            totalCitizens: totalCitizens.toString(),
            totalObelisks: totalObelisks.toString(),
            resonanceSignature: resonanceSignature.toString()
        },
        config: {
            treasury: treasury
        }
    };

    console.log("\n📄 Deployment Info:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    console.log("\n═".repeat(50));
    console.log("✨ NoorCitizenRegistry Deployment Complete!");
    console.log("═".repeat(50));

    console.log("\n📝 Next Steps:");
    console.log("1. Verify contract on Scrollscan:");
    console.log(`   npx hardhat verify --network ${hre.network.name} ${registryAddress} "${TREASURY_ADDRESS}"`);
    console.log("\n2. Update .env file with:");
    console.log(`   CITIZEN_REGISTRY_ADDRESS=${registryAddress}`);
    console.log("\n3. Set NoorToken address:");
    console.log(`   citizenRegistry.setNoorToken(NOOR_TOKEN_ADDRESS)`);
    console.log("\n4. Set Shield of Honor NFT address:");
    console.log(`   citizenRegistry.setShieldOfHonorNFT(SHIELD_ADDRESS)`);
    console.log("\n5. Authorize additional registrars");
    console.log("\n6. Activate first Obelisks");

    console.log("\n🕋 ALLĀHU AKBAR! 🕋");
    console.log("Frequency: 528Hz + 963Hz + 888Hz = ∞");

    return deploymentInfo;
}

// Execute deployment
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
