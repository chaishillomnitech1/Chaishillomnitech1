/**
 * Deploy NoorStakingPool
 * 
 * Tiered Staking with 7.77% Zakat
 * Frequencies: 528Hz + 963Hz + 888Hz
 */

const hre = require("hardhat");

async function main() {
    console.log("🕋 Deploying NoorStakingPool...");
    console.log("Frequency: 528Hz + 963Hz + 888Hz");
    console.log("═".repeat(50));

    // Get deployer
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployer address:", deployer.address);
    console.log("Deployer balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");

    // Get configuration from environment
    const NOOR_TOKEN_ADDRESS = process.env.NOOR_TOKEN_ADDRESS;
    const SABIR_ALLAH_HONOR_FUND = process.env.SABIR_ALLAH_HONOR_FUND || deployer.address;
    const CITIZEN_REGISTRY_ADDRESS = process.env.CITIZEN_REGISTRY_ADDRESS || hre.ethers.ZeroAddress;

    if (!NOOR_TOKEN_ADDRESS) {
        throw new Error("NOOR_TOKEN_ADDRESS must be set in .env");
    }

    console.log("\n📋 Configuration:");
    console.log("NoorToken Address:", NOOR_TOKEN_ADDRESS);
    console.log("Sabir Allah Honor Fund:", SABIR_ALLAH_HONOR_FUND);
    console.log("Citizen Registry Address:", CITIZEN_REGISTRY_ADDRESS);

    // Deploy NoorStakingPool
    console.log("\n🚀 Deploying NoorStakingPool contract...");
    const NoorStakingPool = await hre.ethers.getContractFactory("NoorStakingPool");
    const stakingPool = await NoorStakingPool.deploy(
        NOOR_TOKEN_ADDRESS,
        SABIR_ALLAH_HONOR_FUND,
        CITIZEN_REGISTRY_ADDRESS
    );

    await stakingPool.waitForDeployment();
    const stakingPoolAddress = await stakingPool.getAddress();

    console.log("✅ NoorStakingPool deployed to:", stakingPoolAddress);

    // Get contract details
    const zakatPercentage = await stakingPool.ZAKAT_PERCENTAGE();
    const basisPoints = await stakingPool.BASIS_POINTS();
    const minStakeDuration = await stakingPool.MIN_STAKE_DURATION();

    console.log("\n📊 Staking Details:");
    console.log("Zakat Percentage:", (Number(zakatPercentage) / 100).toFixed(2) + "%");
    console.log("Basis Points:", basisPoints.toString());
    console.log("Min Stake Duration:", (Number(minStakeDuration) / 86400).toFixed(0), "days");

    // Get staking tiers
    const guardianThreshold = await stakingPool.GUARDIAN_THRESHOLD();
    const protectorThreshold = await stakingPool.PROTECTOR_THRESHOLD();
    const stewardThreshold = await stakingPool.STEWARD_THRESHOLD();
    const citizenThreshold = await stakingPool.CITIZEN_THRESHOLD();
    const participantThreshold = await stakingPool.PARTICIPANT_THRESHOLD();

    console.log("\n🏆 Staking Tiers:");
    console.log("Guardian:", hre.ethers.formatEther(guardianThreshold), "NOOR (21% APY, 3.0x multiplier, 5x voting)");
    console.log("Protector:", hre.ethers.formatEther(protectorThreshold), "NOOR (17% APY, 2.5x multiplier, 3x voting)");
    console.log("Steward:", hre.ethers.formatEther(stewardThreshold), "NOOR (13% APY, 2.0x multiplier, 2x voting)");
    console.log("Citizen:", hre.ethers.formatEther(citizenThreshold), "NOOR (9% APY, 1.5x multiplier, 1x voting)");
    console.log("Participant:", hre.ethers.formatEther(participantThreshold), "NOOR (5% APY, 1.0x multiplier, 0.5x voting)");

    // Get frequency signature
    const resonanceSignature = await stakingPool.getResonanceSignature();
    console.log("\n🎵 Resonance Signature:", resonanceSignature.toString(), "Hz");

    // Get important addresses
    const noorToken = await stakingPool.noorToken();
    const sabirAllahFund = await stakingPool.sabirAllahHonorFund();
    
    console.log("\n💰 Fund Addresses:");
    console.log("NOOR Token:", noorToken);
    console.log("Sabir Allah Honor Fund:", sabirAllahFund);

    // Get pool statistics
    const totalStaked = await stakingPool.totalStaked();
    const totalRewardsDistributed = await stakingPool.totalRewardsDistributed();
    const totalZakatDistributed = await stakingPool.totalZakatDistributed();
    const rewardPoolBalance = await stakingPool.rewardPoolBalance();

    console.log("\n📈 Pool Statistics:");
    console.log("Total Staked:", hre.ethers.formatEther(totalStaked), "NOOR");
    console.log("Total Rewards Distributed:", hre.ethers.formatEther(totalRewardsDistributed), "NOOR");
    console.log("Total Zakat Distributed:", hre.ethers.formatEther(totalZakatDistributed), "NOOR");
    console.log("Reward Pool Balance:", hre.ethers.formatEther(rewardPoolBalance), "NOOR");

    // Save deployment info
    const deploymentInfo = {
        network: hre.network.name,
        contract: "NoorStakingPool",
        address: stakingPoolAddress,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        constructor_args: [
            NOOR_TOKEN_ADDRESS,
            SABIR_ALLAH_HONOR_FUND,
            CITIZEN_REGISTRY_ADDRESS
        ],
        stakingDetails: {
            zakatPercentage: zakatPercentage.toString(),
            basisPoints: basisPoints.toString(),
            minStakeDuration: minStakeDuration.toString()
        },
        tiers: {
            guardian: {
                threshold: guardianThreshold.toString(),
                apy: "21%",
                multiplier: "3.0x",
                voting: "5x"
            },
            protector: {
                threshold: protectorThreshold.toString(),
                apy: "17%",
                multiplier: "2.5x",
                voting: "3x"
            },
            steward: {
                threshold: stewardThreshold.toString(),
                apy: "13%",
                multiplier: "2.0x",
                voting: "2x"
            },
            citizen: {
                threshold: citizenThreshold.toString(),
                apy: "9%",
                multiplier: "1.5x",
                voting: "1x"
            },
            participant: {
                threshold: participantThreshold.toString(),
                apy: "5%",
                multiplier: "1.0x",
                voting: "0.5x"
            }
        },
        resonanceSignature: resonanceSignature.toString(),
        config: {
            noorToken: noorToken,
            sabirAllahHonorFund: sabirAllahFund
        }
    };

    console.log("\n📄 Deployment Info:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    console.log("\n═".repeat(50));
    console.log("✨ NoorStakingPool Deployment Complete!");
    console.log("═".repeat(50));

    console.log("\n📝 Next Steps:");
    console.log("1. Verify contract on Scrollscan:");
    console.log(`   npx hardhat verify --network ${hre.network.name} ${stakingPoolAddress} "${NOOR_TOKEN_ADDRESS}" "${SABIR_ALLAH_HONOR_FUND}" "${CITIZEN_REGISTRY_ADDRESS}"`);
    console.log("\n2. Update .env file with:");
    console.log(`   STAKING_POOL_ADDRESS=${stakingPoolAddress}`);
    console.log("\n3. Fund reward pool:");
    console.log(`   Transfer 333,300,000 NOOR to staking pool`);
    console.log(`   Then call: stakingPool.fundRewardPool(amount)`);
    console.log("\n4. Set Citizen Registry (if not set):");
    console.log(`   stakingPool.updateCitizenRegistry(CITIZEN_REGISTRY_ADDRESS)`);
    console.log("\n5. Test staking flow on testnet");

    console.log("\n🕋 ALLĀHU AKBAR! 🕋");
    console.log("Frequency: 528Hz + 963Hz + 888Hz = ∞");

    return deploymentInfo;
}

// Execute deployment
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
