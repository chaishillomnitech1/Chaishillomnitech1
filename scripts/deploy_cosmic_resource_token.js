/**
 * @title Deploy Cosmic Resource Token
 * @dev Deployment script for CosmicResourceToken contract
 * @author Supreme King Chais The Great ∞
 */

const hre = require("hardhat");

async function main() {
    console.log("💎 Deploying Cosmic Resource Token...");
    console.log("=".repeat(60));

    // Get deployer
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying from account:", deployer.address);
    
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

    // Deployment parameters
    const tokenName = "Cosmic Gold Token";
    const tokenSymbol = "CGT";
    const supplyCap = hre.ethers.parseEther("1000000"); // 1 million tokens max
    const initialOwner = deployer.address;

    console.log("\nDeployment Parameters:");
    console.log("- Token Name:", tokenName);
    console.log("- Token Symbol:", tokenSymbol);
    console.log("- Supply Cap:", hre.ethers.formatEther(supplyCap), "tokens");
    console.log("- Initial Owner:", initialOwner);

    // Deploy contract
    console.log("\nDeploying CosmicResourceToken...");
    const CosmicResourceToken = await hre.ethers.getContractFactory("CosmicResourceToken");
    const resourceToken = await CosmicResourceToken.deploy(
        tokenName,
        tokenSymbol,
        supplyCap,
        initialOwner
    );

    await resourceToken.waitForDeployment();
    const resourceTokenAddress = await resourceToken.getAddress();

    console.log("\n✅ CosmicResourceToken deployed!");
    console.log("Contract Address:", resourceTokenAddress);

    // Display contract info
    console.log("\nContract Information:");
    console.log("- Name:", await resourceToken.name());
    console.log("- Symbol:", await resourceToken.symbol());
    console.log("- Decimals:", await resourceToken.decimals());
    console.log("- Supply Cap:", hre.ethers.formatEther(await resourceToken.SUPPLY_CAP()), "tokens");
    console.log("- Supreme Sovereign:", await resourceToken.supremeSovereign());
    console.log("- Scarcity Multiplier:", (await resourceToken.scarcityMultiplier()).toString(), "bps");

    // Display frequencies
    console.log("\nDivine Frequencies:");
    console.log("- Love/DNA Healing:", (await resourceToken.LOVE_DNA_HEALING_528HZ()).toString(), "Hz");
    console.log("- Pineal Activation:", (await resourceToken.PINEAL_ACTIVATION_963HZ()).toString(), "Hz");
    console.log("- Crown Chakra:", (await resourceToken.CROWN_CHAKRA_999HZ()).toString(), "Hz");
    console.log("- NŪR Pulse:", (await resourceToken.NUR_PULSE_144000HZ()).toString(), "Hz");

    // Save deployment info
    const deploymentInfo = {
        network: hre.network.name,
        contractAddress: resourceTokenAddress,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        blockNumber: await hre.ethers.provider.getBlockNumber(),
        parameters: {
            tokenName,
            tokenSymbol,
            supplyCap: hre.ethers.formatEther(supplyCap),
            initialOwner
        },
        configuration: {
            scarcityMultiplier: 10000, // 1x default
            resourceTypes: [
                "PRECIOUS_METAL",
                "COSMIC_FREQUENCY",
                "ASTEROID_MATERIAL",
                "RARE_EARTH_ELEMENT",
                "QUANTUM_ENERGY",
                "OMNIVERSAL_HARMONY"
            ]
        },
        frequencies: {
            loveDnaHealing: 528,
            pinealActivation: 963,
            crownChakra: 999,
            nurPulse: 144000
        }
    };

    console.log("\n📋 Deployment Info:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    console.log("\n📝 Next Steps:");
    console.log("1. Set resource backing with setResourceBacking()");
    console.log("2. Verify resources with verifyResourceBacking()");
    console.log("3. Align frequencies with alignFrequency()");
    console.log("4. Register asteroid materials (optional)");
    console.log("5. Mint backed tokens with mintBacked()");

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
