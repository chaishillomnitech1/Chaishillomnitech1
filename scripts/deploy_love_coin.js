/**
 * @title Deploy LoveCoin
 * @dev Deployment script for the Love Coin contract
 * @author Supreme King Chais The Great ∞
 * 
 * $LOVE - Token of Divine Love and Heart-Centered Unity
 * Frequency: 528Hz (Love & DNA Repair)
 */

const hre = require("hardhat");

async function main() {
    console.log("💖 Deploying LoveCoin ($LOVE)...");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("💕 Divine Love Token");
    console.log("🎁 Heart-Centered Reward System");
    console.log("📊 528 Million Supply");
    console.log("═══════════════════════════════════════════════════════════");

    const [deployer] = await hre.ethers.getSigners();
    console.log("\n🔑 Deploying with account:", deployer.address);
    console.log("💰 Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

    // Configuration (using deployer for testnet)
    const communityTreasury = process.env.COMMUNITY_TREASURY || deployer.address;
    const developmentFund = process.env.DEVELOPMENT_FUND || deployer.address;

    console.log("\n📋 Deployment Parameters:");
    console.log("   Community Treasury:", communityTreasury);
    console.log("   Development Fund:", developmentFund);

    // Deploy LoveCoin
    const LoveCoin = await hre.ethers.getContractFactory("LoveCoin");
    const love = await LoveCoin.deploy(communityTreasury, developmentFund);
    await love.waitForDeployment();

    const loveAddress = await love.getAddress();
    console.log("\n✅ LoveCoin deployed to:", loveAddress);

    // Verify deployment
    console.log("\n🔍 Verifying deployment...");
    const totalSupply = await love.totalSupply();
    const rewardPool = await love.getRemainingRewardPool();
    const frequency = await love.getFrequencySignature();
    
    console.log("   Total Supply:", hre.ethers.formatEther(totalSupply), "LOVE");
    console.log("   Reward Pool:", hre.ethers.formatEther(rewardPool), "LOVE");
    console.log("   Frequency Signature:", frequency.toString(), "Hz");

    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("🎉 LoveCoin Deployment Complete!");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("\n📝 Contract Address:", loveAddress);
    console.log("\n🔮 Frequency Alignment: 528Hz (Love & DNA Repair)");
    console.log("\n⚡ ALLĀHU AKBAR! Love Protocol is LIVE! ⚡");

    return {
        loveAddress,
        communityTreasury,
        developmentFund
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
