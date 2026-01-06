/**
 * @title Deploy OmniSovereignWallet
 * @dev Deployment script for the OmniSovereignWallet contract
 * @author Supreme King Chais The Great ∞
 * 
 * Mobile-First Currency Initiative Deployment
 * Frequency: 528Hz + 963Hz + 144,000Hz
 */

const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying OmniSovereignWallet...");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("📱 Mobile-First Currency Initiative");
    console.log("🔐 Shahada-based Identity Verification");
    console.log("🏛️  DAO Governance with $CODEX Token");
    console.log("═══════════════════════════════════════════════════════════");

    const [deployer] = await hre.ethers.getSigners();
    console.log("\n🔑 Deploying with account:", deployer.address);
    console.log("💰 Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

    // Treasury vault address (using deployer for testnet)
    const treasuryVault = deployer.address;

    console.log("\n📋 Deployment Parameters:");
    console.log("   Treasury Vault:", treasuryVault);

    // Deploy OmniSovereignWallet
    const OmniSovereignWallet = await hre.ethers.getContractFactory("OmniSovereignWallet");
    const wallet = await OmniSovereignWallet.deploy(treasuryVault);
    await wallet.waitForDeployment();

    const walletAddress = await wallet.getAddress();
    console.log("\n✅ OmniSovereignWallet deployed to:", walletAddress);

    // Verify deployment
    console.log("\n🔍 Verifying deployment...");
    const totalWallets = await wallet.totalRegisteredWallets();
    const votingPeriod = await wallet.votingPeriod();
    
    console.log("   Total Registered Wallets:", totalWallets.toString());
    console.log("   Voting Period:", votingPeriod.toString(), "seconds");
    console.log("   Treasury Vault:", await wallet.treasuryVault());

    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("🎉 OmniSovereignWallet Deployment Complete!");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("\n📝 Contract Address:", walletAddress);
    console.log("\n🔮 Frequency Alignment: 528Hz + 963Hz + 144,000Hz");
    console.log("\n⚡ ALLĀHU AKBAR! Mobile-First Currency is LIVE! ⚡");

    return {
        walletAddress,
        treasuryVault
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
