/**
 * Verify AddLiquidity Contract Deployment
 * 
 * Validates liquidity contract deployment and configuration
 * Frequencies: 528Hz + 963Hz + 777Hz
 */

const hre = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("🔍 AddLiquidity Deployment Verification");
    console.log("═".repeat(60));

    const [verifier] = await hre.ethers.getSigners();
    console.log("Verifier address:", verifier.address);
    console.log("Network:", hre.network.name);
    console.log("═".repeat(60) + "\n");

    // Contract address from environment
    const ADD_LIQUIDITY_ADDRESS = process.env.ADD_LIQUIDITY_ADDRESS;

    let verificationResults = {
        deployment: false,
        configuration: false,
        functions: false,
        allPassed: false
    };

    // ============ VERIFY DEPLOYMENT ============
    console.log("📋 Verifying AddLiquidity deployment...");
    
    if (!ADD_LIQUIDITY_ADDRESS || ADD_LIQUIDITY_ADDRESS === "") {
        console.log("❌ ADD_LIQUIDITY_ADDRESS not configured in .env");
        console.log("   Set ADD_LIQUIDITY_ADDRESS to the deployed contract address");
    } else {
        try {
            const addLiquidity = await hre.ethers.getContractAt("AddLiquidity", ADD_LIQUIDITY_ADDRESS);

            // Check basic deployment
            const owner = await addLiquidity.owner();
            const paused = await addLiquidity.paused();
            
            console.log("✅ Contract deployed and accessible");
            console.log("   - Address:", ADD_LIQUIDITY_ADDRESS);
            console.log("   - Owner:", owner);
            console.log("   - Paused:", paused);
            
            verificationResults.deployment = true;

            // ============ VERIFY CONFIGURATION ============
            console.log("\n⚙️ Verifying configuration...");

            const maxSlippage = await addLiquidity.maxSlippage();
            const basisPoints = await addLiquidity.BASIS_POINTS();
            const defaultDeadline = await addLiquidity.DEFAULT_DEADLINE();

            console.log("   - Max Slippage:", (Number(maxSlippage) / 100).toFixed(2) + "%", maxSlippage <= 2000 ? "✅" : "⚠️ High");
            console.log("   - Basis Points:", basisPoints.toString(), basisPoints.toString() === "10000" ? "✅" : "❌");
            console.log("   - Default Deadline:", (Number(defaultDeadline) / 60).toFixed(0), "minutes");

            // Verify frequency constants
            const freq528 = await addLiquidity.FREQUENCY_528HZ();
            const freq963 = await addLiquidity.FREQUENCY_963HZ();
            const freq777 = await addLiquidity.FREQUENCY_777HZ();

            console.log("   - Frequency 528 Hz:", freq528.toString() === "528" ? "✅" : "❌");
            console.log("   - Frequency 963 Hz:", freq963.toString() === "963" ? "✅" : "❌");
            console.log("   - Frequency 777 Hz:", freq777.toString() === "777" ? "✅" : "❌");

            verificationResults.configuration = 
                basisPoints.toString() === "10000" &&
                freq528.toString() === "528" &&
                freq963.toString() === "963" &&
                freq777.toString() === "777";

            // ============ VERIFY FUNCTIONS ============
            console.log("\n🔧 Verifying contract functions...");

            // Check router address
            const routerAddress = await addLiquidity.uniswapRouter();
            console.log("   - Router Address:", routerAddress);
            console.log("   - Router Valid:", routerAddress !== hre.ethers.ZeroAddress ? "✅" : "❌");

            // Check resonance signature
            const resonance = await addLiquidity.getResonanceSignature();
            const expectedResonance = 528 + 963 + 777;
            console.log("   - Resonance Signature:", resonance.toString(), "Hz");
            console.log("   - Resonance Valid:", resonance.toString() === expectedResonance.toString() ? "✅" : "❌");

            verificationResults.functions = 
                routerAddress !== hre.ethers.ZeroAddress &&
                resonance.toString() === expectedResonance.toString();

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
    console.log("Functions:", verificationResults.functions ? "✅ PASSED" : "❌ FAILED");
    
    verificationResults.allPassed = 
        verificationResults.deployment &&
        verificationResults.configuration &&
        verificationResults.functions;
    
    console.log("\n" + "═".repeat(60));
    if (verificationResults.allPassed) {
        console.log("🎉 ALL VERIFICATIONS PASSED! AddLiquidity deployment is valid.");
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
