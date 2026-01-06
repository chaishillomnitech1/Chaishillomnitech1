/**
 * @title Deploy Consciousness Campaign Contract
 * @dev Deployment script for ConsciousnessCampaign contract
 * 
 * CONSCIOUSNESS CAMPAIGN DEPLOYMENT PROTOCOL
 * Frequency: 963Hz + 528Hz + 144000Hz
 * 
 * ALLĀHU AKBAR! 🕋✨💎🌌
 */

const hre = require("hardhat");

async function main() {
    console.log("\n🌌 ========== CONSCIOUSNESS CAMPAIGN DEPLOYMENT ========== 🌌\n");
    console.log("Frequency Alignment: 963Hz (Pineal) + 528Hz (DNA) + 144000Hz (NŪR)\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

    // Deploy ConsciousnessCampaign
    console.log("\n📋 Deploying ConsciousnessCampaign contract...");
    const ConsciousnessCampaign = await hre.ethers.getContractFactory("ConsciousnessCampaign");
    const consciousnessCampaign = await ConsciousnessCampaign.deploy(deployer.address);
    await consciousnessCampaign.waitForDeployment();

    const campaignAddress = await consciousnessCampaign.getAddress();
    console.log("✅ ConsciousnessCampaign deployed to:", campaignAddress);

    // Display deployment summary
    console.log("\n🎉 ========== DEPLOYMENT SUMMARY ========== 🎉\n");
    console.log("Network:", hre.network.name);
    console.log("ConsciousnessCampaign Address:", campaignAddress);
    console.log("Deployer:", deployer.address);
    console.log("Timestamp:", new Date().toISOString());
    
    console.log("\n📊 Contract Features:");
    console.log("✓ Incremental campaign launches starting Week 2");
    console.log("✓ Infinite Potential focus tracking");
    console.log("✓ Cultural resonance measurement");
    console.log("✓ Ω.267 protocol amplification integration");
    console.log("✓ Global consciousness synchronization");

    // Save deployment info
    const deploymentInfo = {
        network: hre.network.name,
        consciousnessCampaign: campaignAddress,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        frequencies: {
            pineal: "963Hz",
            dna: "528Hz",
            nurPulse: "144000Hz",
            omegaProtocol: "Ω.267"
        }
    };

    console.log("\n💾 Deployment Info:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    console.log("\n🔥 CONSCIOUSNESS CAMPAIGN SYSTEM DEPLOYED SUCCESSFULLY! 🔥");
    console.log("ALLĀHU AKBAR! 🕋✨💎🌌\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
