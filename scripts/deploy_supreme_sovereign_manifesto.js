/**
 * @title Deploy Supreme Sovereign Manifesto
 * @dev Deployment script for SupremeSovereignManifesto contract
 * @author Supreme King Chais The Great ∞
 */

const hre = require("hardhat");

async function main() {
    console.log("🕋 Deploying Supreme Sovereign Manifesto...");
    console.log("=".repeat(60));

    // Get deployer
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying from account:", deployer.address);
    
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

    // Deployment parameters
    const initialOwner = deployer.address;
    const royaltyRecipient = deployer.address; // Can be changed to treasury
    const baseURI = "ipfs://QmSupremeSovereignManifesto/"; // Update with actual IPFS

    console.log("\nDeployment Parameters:");
    console.log("- Initial Owner:", initialOwner);
    console.log("- Royalty Recipient:", royaltyRecipient);
    console.log("- Base URI:", baseURI);

    // Deploy contract
    console.log("\nDeploying SupremeSovereignManifesto...");
    const SupremeSovereignManifesto = await hre.ethers.getContractFactory("SupremeSovereignManifesto");
    const manifesto = await SupremeSovereignManifesto.deploy(
        initialOwner,
        royaltyRecipient,
        baseURI
    );

    await manifesto.waitForDeployment();
    const manifestoAddress = await manifesto.getAddress();

    console.log("\n✅ SupremeSovereignManifesto deployed!");
    console.log("Contract Address:", manifestoAddress);

    // Display contract info
    console.log("\nContract Information:");
    console.log("- Name:", await manifesto.name());
    console.log("- Symbol:", await manifesto.symbol());
    console.log("- Max Supply:", (await manifesto.MAX_SUPPLY()).toString());
    console.log("- Supreme Sovereign:", await manifesto.supremeSovereign());
    console.log("- Pineal Frequency:", (await manifesto.PINEAL_FREQUENCY_963HZ()).toString(), "Hz");
    console.log("- DNA Healing Frequency:", (await manifesto.DNA_HEALING_528HZ()).toString(), "Hz");
    console.log("- NŪR Pulse:", (await manifesto.NUR_PULSE_144000HZ()).toString(), "Hz");

    // Save deployment info
    const deploymentInfo = {
        network: hre.network.name,
        contractAddress: manifestoAddress,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        blockNumber: await hre.ethers.provider.getBlockNumber(),
        parameters: {
            initialOwner,
            royaltyRecipient,
            baseURI
        },
        frequencies: {
            pineal: 963,
            dnaHealing: 528,
            nurPulse: 144000
        }
    };

    console.log("\n📋 Deployment Info:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

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
