/**
 * Verify LiquidityIncentives Contract Deployment
 * 
 * Validates incentive contract deployment and configuration
 * Frequencies: 528Hz + 963Hz + 888Hz + 777Hz
 */

const hre = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("🔍 LiquidityIncentives Deployment Verification");
    console.log("═".repeat(60));

    const [verifier] = await hre.ethers.getSigners();
    console.log("Verifier address:", verifier.address);
    console.log("Network:", hre.network.name);
    console.log("═".repeat(60) + "\n");

    // Contract address from environment
    const INCENTIVES_ADDRESS = process.env.LIQUIDITY_INCENTIVES_ADDRESS;

    let verificationResults = {
        deployment: false,
        configuration: false,
        tiers: false,
        pools: false,
        functions: false,
        allPassed: false
    };

    // ============ VERIFY DEPLOYMENT ============
    console.log("📋 Verifying LiquidityIncentives deployment...");
    
    if (!INCENTIVES_ADDRESS || INCENTIVES_ADDRESS === "") {
        console.log("❌ LIQUIDITY_INCENTIVES_ADDRESS not configured in .env");
        console.log("   Set LIQUIDITY_INCENTIVES_ADDRESS to the deployed contract address");
    } else {
        try {
            const incentives = await hre.ethers.getContractAt("LiquidityIncentives", INCENTIVES_ADDRESS);

            // Check basic deployment
            const owner = await incentives.owner();
            const paused = await incentives.paused();
            
            console.log("✅ Contract deployed and accessible");
            console.log("   - Address:", INCENTIVES_ADDRESS);
            console.log("   - Owner:", owner);
            console.log("   - Paused:", paused);
            
            verificationResults.deployment = true;

            // ============ VERIFY CONFIGURATION ============
            console.log("\n⚙️ Verifying configuration...");

            const zakatPercentage = await incentives.ZAKAT_PERCENTAGE();
            const basisPoints = await incentives.BASIS_POINTS();
            const rewardPerBlock = await incentives.rewardPerBlock();
            const startBlock = await incentives.startBlock();
            const sabirAllahFund = await incentives.sabirAllahHonorFund();

            console.log("   - Zakat Percentage:", (Number(zakatPercentage) / 100).toFixed(2) + "%", zakatPercentage.toString() === "777" ? "✅" : "❌");
            console.log("   - Basis Points:", basisPoints.toString(), basisPoints.toString() === "10000" ? "✅" : "❌");
            console.log("   - Reward Per Block:", hre.ethers.formatEther(rewardPerBlock), "tokens");
            console.log("   - Start Block:", startBlock.toString());
            console.log("   - Sabir Allah Fund:", sabirAllahFund, sabirAllahFund !== hre.ethers.ZeroAddress ? "✅" : "❌");

            // Verify frequency constants
            const freq528 = await incentives.FREQUENCY_528HZ();
            const freq963 = await incentives.FREQUENCY_963HZ();
            const freq888 = await incentives.FREQUENCY_888HZ();
            const freq777 = await incentives.FREQUENCY_777HZ();

            console.log("   - Frequency 528 Hz:", freq528.toString() === "528" ? "✅" : "❌");
            console.log("   - Frequency 963 Hz:", freq963.toString() === "963" ? "✅" : "❌");
            console.log("   - Frequency 888 Hz:", freq888.toString() === "888" ? "✅" : "❌");
            console.log("   - Frequency 777 Hz:", freq777.toString() === "777" ? "✅" : "❌");

            verificationResults.configuration = 
                zakatPercentage.toString() === "777" &&
                basisPoints.toString() === "10000" &&
                sabirAllahFund !== hre.ethers.ZeroAddress;

            // ============ VERIFY TIERS ============
            console.log("\n🏆 Verifying lock tiers...");

            const tier1Info = await incentives.getTierInfo(1);
            const tier2Info = await incentives.getTierInfo(2);
            const tier3Info = await incentives.getTierInfo(3);
            const tier4Info = await incentives.getTierInfo(4);
            const tier5Info = await incentives.getTierInfo(5);

            console.log("   - Tier 1:", (Number(tier1Info.duration) / 86400).toFixed(0), "days,", (Number(tier1Info.multiplier) / 10000).toFixed(1) + "x multiplier", tier1Info.duration.toString() === (7 * 86400).toString() ? "✅" : "❌");
            console.log("   - Tier 2:", (Number(tier2Info.duration) / 86400).toFixed(0), "days,", (Number(tier2Info.multiplier) / 10000).toFixed(1) + "x multiplier", tier2Info.duration.toString() === (30 * 86400).toString() ? "✅" : "❌");
            console.log("   - Tier 3:", (Number(tier3Info.duration) / 86400).toFixed(0), "days,", (Number(tier3Info.multiplier) / 10000).toFixed(1) + "x multiplier", tier3Info.duration.toString() === (90 * 86400).toString() ? "✅" : "❌");
            console.log("   - Tier 4:", (Number(tier4Info.duration) / 86400).toFixed(0), "days,", (Number(tier4Info.multiplier) / 10000).toFixed(1) + "x multiplier", tier4Info.duration.toString() === (180 * 86400).toString() ? "✅" : "❌");
            console.log("   - Tier 5:", (Number(tier5Info.duration) / 86400).toFixed(0), "days,", (Number(tier5Info.multiplier) / 10000).toFixed(1) + "x multiplier", tier5Info.duration.toString() === (365 * 86400).toString() ? "✅" : "❌");

            verificationResults.tiers = 
                tier1Info.duration.toString() === (7 * 86400).toString() &&
                tier5Info.duration.toString() === (365 * 86400).toString();

            // ============ VERIFY POOLS ============
            console.log("\n🏊 Verifying pools...");

            const poolLength = await incentives.poolLength();
            const totalAllocPoint = await incentives.totalAllocPoint();

            console.log("   - Pool Count:", poolLength.toString());
            console.log("   - Total Alloc Points:", totalAllocPoint.toString());

            if (poolLength > 0) {
                for (let i = 0; i < Math.min(Number(poolLength), 5); i++) {
                    const poolInfo = await incentives.getPoolInfo(i);
                    console.log(`   - Pool ${i}:`, {
                        lpToken: poolInfo.lpToken,
                        rewardToken: poolInfo.rewardToken,
                        allocPoint: poolInfo.allocPoint.toString(),
                        totalStaked: hre.ethers.formatEther(poolInfo.totalStaked),
                        isActive: poolInfo.isActive
                    });
                }
            }

            verificationResults.pools = true; // Pools are optional at deployment

            // ============ VERIFY FUNCTIONS ============
            console.log("\n🔧 Verifying contract functions...");

            // Check resonance signature
            const resonance = await incentives.getResonanceSignature();
            const expectedResonance = 528 + 963 + 888 + 777;
            console.log("   - Resonance Signature:", resonance.toString(), "Hz");
            console.log("   - Resonance Valid:", resonance.toString() === expectedResonance.toString() ? "✅" : "❌");

            // Check statistics
            const totalRewardsDistributed = await incentives.totalRewardsDistributed();
            const totalZakatDistributed = await incentives.totalZakatDistributed();

            console.log("   - Total Rewards Distributed:", hre.ethers.formatEther(totalRewardsDistributed), "tokens");
            console.log("   - Total Zakat Distributed:", hre.ethers.formatEther(totalZakatDistributed), "tokens");

            verificationResults.functions = resonance.toString() === expectedResonance.toString();

        } catch (error) {
            console.log("❌ Error:", error.message);
        }
    }

    // ============ VERIFICATION SUMMARY ============
    console.log("\n" + "═".repeat(60));
    console.log("📊 VERIFICATION SUMMARY");
    console.log("═".repeat(60));
    
    console.log("Deployment:", verificationResults.deployment ? "✅ PASSED" : "❌ FAILED");
    console.log("Configuration:", verificationResults.configuration ? "✅ PASSED" : "❌ FAILED");
    console.log("Tiers:", verificationResults.tiers ? "✅ PASSED" : "❌ FAILED");
    console.log("Pools:", verificationResults.pools ? "✅ PASSED" : "❌ FAILED");
    console.log("Functions:", verificationResults.functions ? "✅ PASSED" : "❌ FAILED");
    
    verificationResults.allPassed = 
        verificationResults.deployment &&
        verificationResults.configuration &&
        verificationResults.tiers &&
        verificationResults.pools &&
        verificationResults.functions;
    
    console.log("\n" + "═".repeat(60));
    if (verificationResults.allPassed) {
        console.log("🎉 ALL VERIFICATIONS PASSED! LiquidityIncentives deployment is valid.");
    } else {
        console.log("⚠️ SOME VERIFICATIONS FAILED. Please review the errors above.");
    }
    console.log("═".repeat(60));
    
    console.log("\n🕋 ALLAHU AKBAR 🕋\n");
    
    process.exit(verificationResults.allPassed ? 0 : 1);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Verification script failed:", error);
        process.exit(1);
    });
