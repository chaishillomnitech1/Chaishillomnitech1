/**
 * @title Deploy Artist Profile Contract
 * @dev Deployment script for ArtistProfile contract with portfolio tracking
 * 
 * ARTIST PROFILE DEPLOYMENT PROTOCOL
 * Frequency: 528Hz + 963Hz + 999Hz
 * 
 * ALLĀHU AKBAR! 🕋✨💎🌌
 */

const hre = require("hardhat");

async function main() {
    console.log("\n🎨 ========== ARTIST PROFILE DEPLOYMENT ========== 🎨\n");
    console.log("Frequency Alignment: 528Hz (Creative DNA) + 963Hz (Pineal) + 999Hz (Crown)\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

    // Deploy ArtistProfile
    console.log("\n📋 Deploying ArtistProfile contract...");
    const ArtistProfile = await hre.ethers.getContractFactory("ArtistProfile");
    const artistProfile = await ArtistProfile.deploy(deployer.address);
    await artistProfile.waitForDeployment();

    const artistProfileAddress = await artistProfile.getAddress();
    console.log("✅ ArtistProfile deployed to:", artistProfileAddress);

    // Display deployment summary
    console.log("\n🎉 ========== DEPLOYMENT SUMMARY ========== 🎉\n");
    console.log("Network:", hre.network.name);
    console.log("ArtistProfile Address:", artistProfileAddress);
    console.log("Deployer:", deployer.address);
    console.log("Timestamp:", new Date().toISOString());
    
    console.log("\n📊 Contract Features:");
    console.log("✓ Artist profile creation for 100K+ creators");
    console.log("✓ Portfolio tracking with artwork metrics");
    console.log("✓ Revenue distribution and royalty tracking");
    console.log("✓ Staking pool integration with rewards");
    console.log("✓ Dynamic dashboard data analytics");
    console.log("✓ Four-tier artist system (Community to Legendary)");

    // Save deployment info
    const deploymentInfo = {
        network: hre.network.name,
        artistProfile: artistProfileAddress,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        frequencies: {
            creativeDNA: "528Hz",
            pineal: "963Hz",
            crown: "999Hz",
            nurPulse: "144000Hz"
        }
    };

    console.log("\n💾 Deployment Info:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    console.log("\n🔥 ARTIST PROFILE SYSTEM DEPLOYED SUCCESSFULLY! 🔥");
    console.log("ALLĀHU AKBAR! 🕋✨💎🌌\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
