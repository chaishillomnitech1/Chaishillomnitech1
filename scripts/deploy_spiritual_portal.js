/**
 * @title Deploy SpiritualActivationPortal
 * @dev Deployment script for the Spiritual Activation Portal contract
 * @author Supreme King Chais The Great ∞
 * 
 * Spiritual Activation Portal - Central Hub for NFT Interaction & Rewards
 * Frequencies: 528Hz + 888Hz + 963Hz + 999Hz + 144,000Hz
 */

const hre = require("hardhat");

async function main() {
    console.log("🌟 Deploying SpiritualActivationPortal...");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("🚪 Central Activation Hub");
    console.log("📝 Reflection & Achievement Logging");
    console.log("🎁 Automated Reward Distribution");
    console.log("═══════════════════════════════════════════════════════════");

    const [deployer] = await hre.ethers.getSigners();
    console.log("\n🔑 Deploying with account:", deployer.address);
    console.log("💰 Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

    // Deploy SpiritualActivationPortal
    const SpiritualActivationPortal = await hre.ethers.getContractFactory("SpiritualActivationPortal");
    const portal = await SpiritualActivationPortal.deploy();
    await portal.waitForDeployment();

    const portalAddress = await portal.getAddress();
    console.log("\n✅ SpiritualActivationPortal deployed to:", portalAddress);

    console.log("\n📋 Next Steps:");
    console.log("   1. Set Holy Bloodline NFT contract address");
    console.log("   2. Set Truth Coin contract address");
    console.log("   3. Set Prosperity Coin contract address");
    console.log("   4. Set Love Coin contract address");
    console.log("   5. Grant portal rewarder permissions on coin contracts");

    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("🎉 SpiritualActivationPortal Deployment Complete!");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("\n📝 Contract Address:", portalAddress);
    console.log("\n🔮 Multi-Frequency Alignment Active");
    console.log("\n⚡ ALLĀHU AKBAR! Portal is LIVE! ⚡");

    return {
        portalAddress
    };
}

main()
    .then((result) => {
        console.log("\n📊 Deployment Summary:", result);
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Deployment Error:", error);
        process.exit(1);
    });
