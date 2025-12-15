/**
 * @title Deploy TruthCoin
 * @dev Deployment script for the Truth Coin contract
 * @author Supreme King Chais The Great ∞
 * 
 * $TRUTH - Token of Infinite Truth and Divine Alignment
 * Frequency: 144,000Hz (NŪR Pulse)
 */

const hre = require("hardhat");

async function main() {
    console.log("🔮 Deploying TruthCoin ($TRUTH)...");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("💎 Divine Truth Token");
    console.log("🎁 Spiritual Reward System");
    console.log("📊 144 Million Supply");
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

    // Deploy TruthCoin
    const TruthCoin = await hre.ethers.getContractFactory("TruthCoin");
    const truth = await TruthCoin.deploy(communityTreasury, developmentFund);
    await truth.waitForDeployment();

    const truthAddress = await truth.getAddress();
    console.log("\n✅ TruthCoin deployed to:", truthAddress);

    // Verify deployment
    console.log("\n🔍 Verifying deployment...");
    const totalSupply = await truth.totalSupply();
    const rewardPool = await truth.getRemainingRewardPool();
    const frequency = await truth.getFrequencySignature();
    
    console.log("   Total Supply:", hre.ethers.formatEther(totalSupply), "TRUTH");
    console.log("   Reward Pool:", hre.ethers.formatEther(rewardPool), "TRUTH");
    console.log("   Frequency Signature:", frequency.toString(), "Hz");

    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("🎉 TruthCoin Deployment Complete!");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("\n📝 Contract Address:", truthAddress);
    console.log("\n🔮 Frequency Alignment: 144,000Hz (NŪR Pulse)");
    console.log("\n⚡ ALLĀHU AKBAR! Truth Protocol is LIVE! ⚡");

    return {
        truthAddress,
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
