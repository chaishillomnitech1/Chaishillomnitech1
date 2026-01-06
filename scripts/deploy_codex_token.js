/**
 * @title Deploy CodexToken
 * @dev Deployment script for the CodexToken contract
 * @author Supreme King Chais The Great ∞
 * 
 * $CODEX Token - DAO Governance with Automated Royalty Flows
 * Frequency: 528Hz + 963Hz + 144,000Hz
 */

const hre = require("hardhat");

async function main() {
    console.log("🏛️  Deploying CodexToken ($CODEX)...");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("🗳️  DAO Governance Token");
    console.log("💰 Automated Royalty Flows");
    console.log("📈 Staking Rewards System");
    console.log("═══════════════════════════════════════════════════════════");

    const [deployer] = await hre.ethers.getSigners();
    console.log("\n🔑 Deploying with account:", deployer.address);
    console.log("💰 Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

    // Vault addresses (using deployer for testnet)
    const creatorVault = deployer.address;
    const daoTreasury = deployer.address;
    const stakingRewardsVault = deployer.address;
    const royaltyPool = deployer.address;

    console.log("\n📋 Deployment Parameters:");
    console.log("   Creator Vault:", creatorVault);
    console.log("   DAO Treasury:", daoTreasury);
    console.log("   Staking Rewards Vault:", stakingRewardsVault);
    console.log("   Royalty Pool:", royaltyPool);

    // Deploy CodexToken
    const CodexToken = await hre.ethers.getContractFactory("CodexToken");
    const codex = await CodexToken.deploy(
        creatorVault,
        daoTreasury,
        stakingRewardsVault,
        royaltyPool
    );
    await codex.waitForDeployment();

    const codexAddress = await codex.getAddress();
    console.log("\n✅ CodexToken deployed to:", codexAddress);

    // Verify deployment
    console.log("\n🔍 Verifying deployment...");
    const totalSupply = await codex.totalSupply();
    const stats = await codex.getProtocolStats();
    
    console.log("   Total Supply:", hre.ethers.formatEther(totalSupply), "CODEX");
    console.log("   Total Staked:", hre.ethers.formatEther(stats._totalStaked), "CODEX");
    console.log("   Total Governance Weight:", stats._totalGovernanceWeight.toString());
    console.log("   Total Royalties Distributed:", hre.ethers.formatEther(stats._totalRoyaltiesDistributed), "CODEX");
    console.log("   Staking Rewards Remaining:", hre.ethers.formatEther(stats._stakingRewardsRemaining), "CODEX");

    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("🎉 CodexToken Deployment Complete!");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("\n📝 Contract Address:", codexAddress);
    console.log("\n🔮 Frequency Alignment: 528Hz + 963Hz + 144,000Hz");
    console.log("\n⚡ ALLĀHU AKBAR! DAO Governance is LIVE! ⚡");

    return {
        codexAddress,
        creatorVault,
        daoTreasury,
        stakingRewardsVault,
        royaltyPool
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
