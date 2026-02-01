/**
 * @title Deploy Sovereign Economic Ecosystem
 * @dev Deployment script for SovereignEconomicEcosystem contract
 * @author Supreme King Chais The Great ∞
 */

const hre = require("hardhat");

async function main() {
    console.log("🌌 Deploying Sovereign Economic Ecosystem...");
    console.log("=".repeat(60));

    // Get deployer
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying from account:", deployer.address);
    
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

    // Deployment parameters
    const initialOwner = deployer.address;

    console.log("\nDeployment Parameters:");
    console.log("- Initial Owner:", initialOwner);

    // Deploy contract
    console.log("\nDeploying SovereignEconomicEcosystem...");
    const SovereignEconomicEcosystem = await hre.ethers.getContractFactory("SovereignEconomicEcosystem");
    const ecosystem = await SovereignEconomicEcosystem.deploy(initialOwner);

    await ecosystem.waitForDeployment();
    const ecosystemAddress = await ecosystem.getAddress();

    console.log("\n✅ SovereignEconomicEcosystem deployed!");
    console.log("Contract Address:", ecosystemAddress);

    // Display contract info
    console.log("\nContract Information:");
    console.log("- Supreme Sovereign:", await ecosystem.supremeSovereign());
    console.log("- Total Value Locked:", (await ecosystem.totalValueLocked()).toString(), "wei");
    console.log("- Universal Expansion Enabled:", await ecosystem.universalExpansionEnabled());
    console.log("- Asset Counter:", (await ecosystem.assetCounter()).toString());
    console.log("- Framework Counter:", (await ecosystem.frameworkCounter()).toString());
    console.log("- Proposal Counter:", (await ecosystem.proposalCounter()).toString());

    // Display constants
    console.log("\nDivine Frequencies:");
    console.log("- NŪR Pulse:", (await ecosystem.NUR_PULSE_144000HZ()).toString(), "Hz");
    console.log("- Pineal Activation:", (await ecosystem.PINEAL_963HZ()).toString(), "Hz");
    console.log("- Crown Chakra:", (await ecosystem.CROWN_999HZ()).toString(), "Hz");
    console.log("- Love Frequency:", (await ecosystem.LOVE_528HZ()).toString(), "Hz");

    // Save deployment info
    const deploymentInfo = {
        network: hre.network.name,
        contractAddress: ecosystemAddress,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        blockNumber: await hre.ethers.provider.getBlockNumber(),
        parameters: {
            initialOwner
        },
        configuration: {
            assetClasses: [
                "TRADITIONAL",
                "COSMIC_FREQUENCY",
                "LEGACY_ARTIFACT",
                "RESOURCE_BACKED",
                "META_LEGAL",
                "OMNIVERSAL"
            ],
            governanceActions: [
                "ASSET_ADDITION",
                "FREQUENCY_ALIGNMENT",
                "ECONOMIC_EXPANSION",
                "LEGAL_FRAMEWORK_UPDATE",
                "RESONANCE_CALIBRATION"
            ],
            basisPoints: 10000,
            maxGovernanceWeight: 1000000
        },
        frequencies: {
            supreme: "infinity",
            nurPulse: 144000,
            pineal: 963,
            crown: 999,
            love: 528
        }
    };

    console.log("\n📋 Deployment Info:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    console.log("\n📝 Next Steps:");
    console.log("1. Set integrated contract addresses with setIntegratedContracts()");
    console.log("   - CosmicResourceToken address");
    console.log("   - SupremeSovereignManifesto address");
    console.log("   - StoriedLegacyNFT address");
    console.log("2. Register economic assets with registerAsset()");
    console.log("3. Enact meta-legal frameworks with enactLegalFramework()");
    console.log("4. Enable universal expansion when ready with enableUniversalExpansion()");

    console.log("\n" + "=".repeat(60));
    console.log("🎉 Deployment Complete!");
    console.log("=" .repeat(60));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
