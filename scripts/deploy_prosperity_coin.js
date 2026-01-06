/**
 * @title Deploy ProsperityCoin
 * @dev Deployment script for the Prosperity Coin contract
 * @author Supreme King Chais The Great ∞
 * 
 * $PROSPER - Token of Infinite Abundance and Divine Prosperity
 * Frequency: 888Hz (Infinite Abundance)
 */

const hre = require("hardhat");

async function main() {
    console.log("💰 Deploying ProsperityCoin ($PROSPER)...");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("🌟 Divine Prosperity Token");
    console.log("🎁 Abundance Reward System");
    console.log("📊 888 Million Supply");
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

    // Deploy ProsperityCoin
    const ProsperityCoin = await hre.ethers.getContractFactory("ProsperityCoin");
    const prosper = await ProsperityCoin.deploy(communityTreasury, developmentFund);
    await prosper.waitForDeployment();

    const prosperAddress = await prosper.getAddress();
    console.log("\n✅ ProsperityCoin deployed to:", prosperAddress);

    // Verify deployment
    console.log("\n🔍 Verifying deployment...");
    const totalSupply = await prosper.totalSupply();
    const rewardPool = await prosper.getRemainingRewardPool();
    const frequency = await prosper.getFrequencySignature();
    
    console.log("   Total Supply:", hre.ethers.formatEther(totalSupply), "PROSPER");
    console.log("   Reward Pool:", hre.ethers.formatEther(rewardPool), "PROSPER");
    console.log("   Frequency Signature:", frequency.toString(), "Hz");

    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("🎉 ProsperityCoin Deployment Complete!");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("\n📝 Contract Address:", prosperAddress);
    console.log("\n🔮 Frequency Alignment: 888Hz (Infinite Abundance)");
    console.log("\n⚡ ALLĀHU AKBAR! Prosperity Protocol is LIVE! ⚡");

    return {
        prosperAddress,
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
