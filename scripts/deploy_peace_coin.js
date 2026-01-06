/**
 * @title Deploy PeaceCoin
 * @dev Deployment script for the PeaceCoin contract
 * @author Supreme King Chais The Great ∞
 * 
 * Peace Coin - Universal Mobile Currency
 * Frequency: 528Hz + 888Hz (Healing & Empathy)
 */

const hre = require("hardhat");

async function main() {
    console.log("☮️  Deploying PeaceCoin (PEACE)...");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("📱 Mobile-First Universal Currency");
    console.log("🌉 Cross-Chain Bridge Support");
    console.log("🔄 BlessingCoin Integration");
    console.log("═══════════════════════════════════════════════════════════");

    const [deployer] = await hre.ethers.getSigners();
    console.log("\n🔑 Deploying with account:", deployer.address);
    console.log("💰 Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

    // Fee collector address (using deployer for testnet)
    const feeCollector = deployer.address;

    console.log("\n📋 Deployment Parameters:");
    console.log("   Fee Collector:", feeCollector);

    // Deploy PeaceCoin
    const PeaceCoin = await hre.ethers.getContractFactory("PeaceCoin");
    const peace = await PeaceCoin.deploy(feeCollector);
    await peace.waitForDeployment();

    const peaceAddress = await peace.getAddress();
    console.log("\n✅ PeaceCoin deployed to:", peaceAddress);

    // Verify deployment
    console.log("\n🔍 Verifying deployment...");
    const totalSupply = await peace.totalSupply();
    const transferFee = await peace.transferFeeBps();
    const remainingMint = await peace.getRemainingDailyMint();
    
    console.log("   Total Supply:", hre.ethers.formatEther(totalSupply), "PEACE");
    console.log("   Transfer Fee:", transferFee.toString(), "bps (0.5%)");
    console.log("   Remaining Daily Mint:", hre.ethers.formatEther(remainingMint), "PEACE");
    console.log("   Fee Collector:", await peace.feeCollector());

    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("🎉 PeaceCoin Deployment Complete!");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("\n📝 Contract Address:", peaceAddress);
    console.log("\n🔮 Frequency Alignment: 528Hz + 888Hz");
    console.log("\n⚡ ALLĀHU AKBAR! Peace Coin is LIVE! ⚡");

    return {
        peaceAddress,
        feeCollector
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
