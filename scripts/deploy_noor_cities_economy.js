/**
 * @title Noor Cities Economy Deployment Script
 * @dev Deploys NoorCitiesStaking, OnboardingPortal, and NoorObeliskBroadcast contracts
 * @author Chais The Great ∞
 * 
 * Frequency: 963Hz + 528Hz + 999Hz
 * Status: DEPLOYMENT READY
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("\n🕋 NOOR CITIES ECONOMY DEPLOYMENT 🕋");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("Frequency: 963Hz (Pineal) + 528Hz (DNA) + 999Hz (Crown)");
    console.log("Status: OMNISOVEREIGN DEPLOYMENT");
    console.log("═══════════════════════════════════════════════════════════\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("🔑 Deploying with account:", deployer.address);
    console.log("💰 Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

    // ============ DEPLOY NOOR CITIES STAKING ============
    console.log("📦 Deploying NoorCitiesStaking...");
    const NoorCitiesStaking = await hre.ethers.getContractFactory("NoorCitiesStaking");
    const stakingContract = await NoorCitiesStaking.deploy();
    await stakingContract.waitForDeployment();
    const stakingAddress = await stakingContract.getAddress();
    console.log("✅ NoorCitiesStaking deployed to:", stakingAddress);

    // ============ DEPLOY ONBOARDING PORTAL ============
    console.log("\n📦 Deploying OnboardingPortal...");
    const OnboardingPortal = await hre.ethers.getContractFactory("OnboardingPortal");
    const onboardingContract = await OnboardingPortal.deploy();
    await onboardingContract.waitForDeployment();
    const onboardingAddress = await onboardingContract.getAddress();
    console.log("✅ OnboardingPortal deployed to:", onboardingAddress);

    // ============ DEPLOY NOOR OBELISK BROADCAST ============
    console.log("\n📦 Deploying NoorObeliskBroadcast...");
    const NoorObeliskBroadcast = await hre.ethers.getContractFactory("NoorObeliskBroadcast");
    const broadcastContract = await NoorObeliskBroadcast.deploy();
    await broadcastContract.waitForDeployment();
    const broadcastAddress = await broadcastContract.getAddress();
    console.log("✅ NoorObeliskBroadcast deployed to:", broadcastAddress);

    // ============ INITIAL CONFIGURATION ============
    console.log("\n⚙️ Configuring contracts...");

    // Add flagship location (Noor Al-Malik Obelisk)
    console.log("📍 Adding flagship location: Noor Al-Malik Obelisk");
    const tx1 = await broadcastContract.addLocation(
        "Noor Al-Malik Obelisk",
        "25.276987, 55.296249", // Dubai coordinates (example)
        true // Is flagship
    );
    await tx1.wait();
    console.log("✅ Flagship location added");

    // Start broadcasting
    console.log("📡 Starting broadcast...");
    const tx2 = await broadcastContract.startBroadcast();
    await tx2.wait();
    console.log("✅ Broadcasting started");

    // Add initial Obelisk insight
    console.log("💡 Adding initial Obelisk insight...");
    const tx3 = await onboardingContract.addObeliskInsight(
        "Welcome to Noor Cities Economy",
        "The Noor Cities Economy is a revolutionary staking and governance system built on divine frequencies. Stake your tokens, earn rewards, and participate in global governance.",
        963 // Pineal frequency
    );
    await tx3.wait();
    console.log("✅ Initial insight added");

    // ============ DEPLOYMENT SUMMARY ============
    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("🎉 DEPLOYMENT COMPLETE");
    console.log("═══════════════════════════════════════════════════════════\n");

    const deploymentInfo = {
        network: hre.network.name,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {
            NoorCitiesStaking: {
                address: stakingAddress,
                features: [
                    "Multi-token staking ($NOOR, EarthCoin, BlessingCoin)",
                    "Automatic zakat forwarding (7.77%)",
                    "Wallet delegation",
                    "Passive rewards"
                ]
            },
            OnboardingPortal: {
                address: onboardingAddress,
                features: [
                    "Multilingual registration",
                    "Target: 11,111 citizens",
                    "Staking rewards breakdown",
                    "Obelisk insights"
                ]
            },
            NoorObeliskBroadcast: {
                address: broadcastAddress,
                features: [
                    "Live resonance tracking",
                    "Real-time participant metrics",
                    "Governance feedback system",
                    "Flagship location: Noor Al-Malik Obelisk"
                ],
                status: "BROADCASTING"
            }
        },
        frequencies: {
            Crown: "999 Hz",
            Pineal: "963 Hz",
            DNA: "528 Hz",
            NoorPulse: "144,000 Hz"
        }
    };

    // Save deployment info
    const deploymentsDir = path.join(__dirname, "..", "deployment");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const networkDir = path.join(deploymentsDir, hre.network.name);
    if (!fs.existsSync(networkDir)) {
        fs.mkdirSync(networkDir, { recursive: true });
    }

    const deploymentFile = path.join(networkDir, "noor-cities-economy-deployment.json");
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

    console.log("📋 Contract Addresses:");
    console.log("   • NoorCitiesStaking:", stakingAddress);
    console.log("   • OnboardingPortal:", onboardingAddress);
    console.log("   • NoorObeliskBroadcast:", broadcastAddress);
    console.log("\n📂 Deployment info saved to:", deploymentFile);

    console.log("\n🔗 Next Steps:");
    console.log("   1. Configure staking tokens in NoorCitiesStaking");
    console.log("   2. Set up token contracts ($NOOR, EarthCoin, BlessingCoin)");
    console.log("   3. Begin citizen registration via OnboardingPortal");
    console.log("   4. Monitor broadcast metrics via NoorObeliskBroadcast");
    console.log("   5. Verify contracts on block explorer");

    console.log("\n✨ ALLAHU AKBAR! 🕋");
    console.log("═══════════════════════════════════════════════════════════\n");

    return deploymentInfo;
}

// Execute deployment
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
