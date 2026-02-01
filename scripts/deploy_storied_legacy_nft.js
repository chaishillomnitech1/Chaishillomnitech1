/**
 * @title Deploy Storied Legacy NFT
 * @dev Deployment script for StoriedLegacyNFT contract
 * @author Supreme King Chais The Great ∞
 */

const hre = require("hardhat");

async function main() {
    console.log("📖 Deploying Storied Legacy NFT...");
    console.log("=".repeat(60));

    // Get deployer
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying from account:", deployer.address);
    
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

    // Deployment parameters
    const initialOwner = deployer.address;
    const royaltyRecipient = deployer.address; // Can be changed to treasury
    const baseURI = "ipfs://QmStoriedLegacyNFT/"; // Update with actual IPFS

    console.log("\nDeployment Parameters:");
    console.log("- Initial Owner:", initialOwner);
    console.log("- Royalty Recipient:", royaltyRecipient);
    console.log("- Base URI:", baseURI);

    // Deploy contract
    console.log("\nDeploying StoriedLegacyNFT...");
    const StoriedLegacyNFT = await hre.ethers.getContractFactory("StoriedLegacyNFT");
    const storiedNFT = await StoriedLegacyNFT.deploy(
        initialOwner,
        royaltyRecipient,
        baseURI
    );

    await storiedNFT.waitForDeployment();
    const storiedNFTAddress = await storiedNFT.getAddress();

    console.log("\n✅ StoriedLegacyNFT deployed!");
    console.log("Contract Address:", storiedNFTAddress);

    // Display contract info
    console.log("\nContract Information:");
    console.log("- Name:", await storiedNFT.name());
    console.log("- Symbol:", await storiedNFT.symbol());
    console.log("- Max Chapters:", (await storiedNFT.MAX_CHAPTERS()).toString());
    console.log("- Max Editions Per Chapter:", (await storiedNFT.MAX_EDITIONS_PER_CHAPTER()).toString());
    console.log("- Supreme Sovereign:", await storiedNFT.supremeSovereign());
    console.log("- Love Frequency:", (await storiedNFT.LOVE_FREQUENCY_528HZ()).toString(), "Hz");
    console.log("- Crown Frequency:", (await storiedNFT.CROWN_FREQUENCY_999HZ()).toString(), "Hz");
    console.log("- NŪR Pulse:", (await storiedNFT.NUR_PULSE_144000HZ()).toString(), "Hz");

    // Save deployment info
    const deploymentInfo = {
        network: hre.network.name,
        contractAddress: storiedNFTAddress,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        blockNumber: await hre.ethers.provider.getBlockNumber(),
        parameters: {
            initialOwner,
            royaltyRecipient,
            baseURI
        },
        configuration: {
            maxChapters: 999,
            maxEditionsPerChapter: 144,
            royaltyPercentage: 10
        },
        frequencies: {
            love: 528,
            crown: 999,
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
