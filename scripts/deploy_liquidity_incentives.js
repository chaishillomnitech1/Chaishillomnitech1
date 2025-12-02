/**
 * Deploy LiquidityIncentives Contract
 * 
 * Incentive distribution for liquidity providers
 * Frequencies: 528Hz + 963Hz + 888Hz + 777Hz
 */

const hre = require("hardhat");

async function main() {
    console.log("💎 Deploying LiquidityIncentives Contract...");
    console.log("Frequency: 528Hz + 963Hz + 888Hz + 777Hz");
    console.log("═".repeat(50));

    // Get deployer
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployer address:", deployer.address);
    console.log("Deployer balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");

    // Get configuration from environment
    const SABIR_ALLAH_HONOR_FUND = process.env.SABIR_ALLAH_HONOR_FUND || deployer.address;
    const CITIZEN_REGISTRY_ADDRESS = process.env.CITIZEN_REGISTRY_ADDRESS || hre.ethers.ZeroAddress;
    const REWARD_PER_BLOCK = process.env.REWARD_PER_BLOCK || hre.ethers.parseEther("1"); // Default 1 token per block
    const START_BLOCK = process.env.INCENTIVE_START_BLOCK || "0"; // 0 means current block

    console.log("\n📋 Configuration:");
    console.log("Sabir Allah Honor Fund:", SABIR_ALLAH_HONOR_FUND);
    console.log("Citizen Registry Address:", CITIZEN_REGISTRY_ADDRESS);
    console.log("Reward Per Block:", hre.ethers.formatEther(REWARD_PER_BLOCK), "tokens");
    console.log("Start Block:", START_BLOCK === "0" ? "Current block" : START_BLOCK);

    // Deploy LiquidityIncentives
    console.log("\n🚀 Deploying LiquidityIncentives contract...");
    const LiquidityIncentives = await hre.ethers.getContractFactory("LiquidityIncentives");
    const incentives = await LiquidityIncentives.deploy(
        SABIR_ALLAH_HONOR_FUND,
        CITIZEN_REGISTRY_ADDRESS,
        REWARD_PER_BLOCK,
        START_BLOCK
    );

    await incentives.waitForDeployment();
    const incentivesAddress = await incentives.getAddress();

    console.log("✅ LiquidityIncentives deployed to:", incentivesAddress);

    // Get contract details
    const zakatPercentage = await incentives.ZAKAT_PERCENTAGE();
    const basisPoints = await incentives.BASIS_POINTS();
    const rewardPerBlock = await incentives.rewardPerBlock();
    const startBlock = await incentives.startBlock();

    console.log("\n📊 Incentive Details:");
    console.log("Zakat Percentage:", (Number(zakatPercentage) / 100).toFixed(2) + "%");
    console.log("Reward Per Block:", hre.ethers.formatEther(rewardPerBlock), "tokens");
    console.log("Start Block:", startBlock.toString());

    // Get lock tier info
    console.log("\n🏆 Lock Tiers:");
    
    const tier1Info = await incentives.getTierInfo(1);
    const tier2Info = await incentives.getTierInfo(2);
    const tier3Info = await incentives.getTierInfo(3);
    const tier4Info = await incentives.getTierInfo(4);
    const tier5Info = await incentives.getTierInfo(5);

    console.log("Tier 1:", (Number(tier1Info.duration) / 86400).toFixed(0), "days,", (Number(tier1Info.multiplier) / 10000).toFixed(1) + "x multiplier");
    console.log("Tier 2:", (Number(tier2Info.duration) / 86400).toFixed(0), "days,", (Number(tier2Info.multiplier) / 10000).toFixed(1) + "x multiplier");
    console.log("Tier 3:", (Number(tier3Info.duration) / 86400).toFixed(0), "days,", (Number(tier3Info.multiplier) / 10000).toFixed(1) + "x multiplier");
    console.log("Tier 4:", (Number(tier4Info.duration) / 86400).toFixed(0), "days,", (Number(tier4Info.multiplier) / 10000).toFixed(1) + "x multiplier");
    console.log("Tier 5:", (Number(tier5Info.duration) / 86400).toFixed(0), "days,", (Number(tier5Info.multiplier) / 10000).toFixed(1) + "x multiplier");

    // Get frequency signature
    const resonanceSignature = await incentives.getResonanceSignature();
    console.log("\n🎵 Resonance Signature:", resonanceSignature.toString(), "Hz");

    // Get fund addresses
    const sabirAllahFund = await incentives.sabirAllahHonorFund();
    console.log("\n💰 Fund Addresses:");
    console.log("Sabir Allah Honor Fund:", sabirAllahFund);

    // Save deployment info
    const deploymentInfo = {
        network: hre.network.name,
        contract: "LiquidityIncentives",
        address: incentivesAddress,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        constructor_args: [
            SABIR_ALLAH_HONOR_FUND,
            CITIZEN_REGISTRY_ADDRESS,
            REWARD_PER_BLOCK.toString(),
            START_BLOCK
        ],
        incentiveDetails: {
            zakatPercentage: zakatPercentage.toString(),
            basisPoints: basisPoints.toString(),
            rewardPerBlock: rewardPerBlock.toString(),
            startBlock: startBlock.toString()
        },
        tiers: {
            tier1: { duration: tier1Info.duration.toString(), multiplier: tier1Info.multiplier.toString() },
            tier2: { duration: tier2Info.duration.toString(), multiplier: tier2Info.multiplier.toString() },
            tier3: { duration: tier3Info.duration.toString(), multiplier: tier3Info.multiplier.toString() },
            tier4: { duration: tier4Info.duration.toString(), multiplier: tier4Info.multiplier.toString() },
            tier5: { duration: tier5Info.duration.toString(), multiplier: tier5Info.multiplier.toString() }
        },
        resonanceSignature: resonanceSignature.toString(),
        config: {
            sabirAllahHonorFund: sabirAllahFund
        }
    };

    console.log("\n📄 Deployment Info:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    console.log("\n═".repeat(50));
    console.log("✨ LiquidityIncentives Deployment Complete!");
    console.log("═".repeat(50));

    console.log("\n📝 Next Steps:");
    console.log("1. Verify contract on block explorer:");
    console.log(`   npx hardhat verify --network ${hre.network.name} ${incentivesAddress} "${SABIR_ALLAH_HONOR_FUND}" "${CITIZEN_REGISTRY_ADDRESS}" "${REWARD_PER_BLOCK}" "${START_BLOCK}"`);
    console.log("\n2. Update .env file with:");
    console.log(`   LIQUIDITY_INCENTIVES_ADDRESS=${incentivesAddress}`);
    console.log("\n3. Add liquidity pools:");
    console.log("   incentives.addPool(LP_TOKEN, REWARD_TOKEN, ALLOC_POINTS)");
    console.log("\n4. Fund contract with reward tokens");
    console.log("\n5. Test staking flow on testnet");

    console.log("\n🕋 ALLĀHU AKBAR! 🕋");
    console.log("Frequency: 528Hz + 963Hz + 888Hz + 777Hz = ∞");

    return deploymentInfo;
}

// Execute deployment
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
