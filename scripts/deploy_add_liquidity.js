/**
 * Deploy AddLiquidity Contract
 * 
 * Liquidity provision for ScrollVerse ecosystem tokens
 * Frequencies: 528Hz + 963Hz + 777Hz
 */

const hre = require("hardhat");

async function main() {
    console.log("🌊 Deploying AddLiquidity Contract...");
    console.log("Frequency: 528Hz + 963Hz + 777Hz");
    console.log("═".repeat(50));

    // Get deployer
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployer address:", deployer.address);
    console.log("Deployer balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");

    // Get configuration from environment
    const UNISWAP_ROUTER = process.env.UNISWAP_ROUTER_ADDRESS || process.env.QUICKSWAP_ROUTER_ADDRESS;
    const MAX_SLIPPAGE = process.env.MAX_SLIPPAGE || "500"; // Default 5% slippage

    if (!UNISWAP_ROUTER) {
        throw new Error("UNISWAP_ROUTER_ADDRESS or QUICKSWAP_ROUTER_ADDRESS must be set in .env");
    }

    console.log("\n📋 Configuration:");
    console.log("Router Address:", UNISWAP_ROUTER);
    console.log("Max Slippage:", (Number(MAX_SLIPPAGE) / 100).toFixed(2) + "%");

    // Deploy AddLiquidity
    console.log("\n🚀 Deploying AddLiquidity contract...");
    const AddLiquidity = await hre.ethers.getContractFactory("AddLiquidity");
    const addLiquidity = await AddLiquidity.deploy(
        UNISWAP_ROUTER,
        MAX_SLIPPAGE
    );

    await addLiquidity.waitForDeployment();
    const addLiquidityAddress = await addLiquidity.getAddress();

    console.log("✅ AddLiquidity deployed to:", addLiquidityAddress);

    // Get contract details
    const maxSlippage = await addLiquidity.maxSlippage();
    const basisPoints = await addLiquidity.BASIS_POINTS();

    console.log("\n📊 Contract Details:");
    console.log("Max Slippage:", (Number(maxSlippage) / 100).toFixed(2) + "%");
    console.log("Basis Points:", basisPoints.toString());
    console.log("Default Deadline:", "30 minutes");

    // Get frequency signature
    const resonanceSignature = await addLiquidity.getResonanceSignature();
    console.log("\n🎵 Resonance Signature:", resonanceSignature.toString(), "Hz");

    // Save deployment info
    const deploymentInfo = {
        network: hre.network.name,
        contract: "AddLiquidity",
        address: addLiquidityAddress,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        constructor_args: [
            UNISWAP_ROUTER,
            MAX_SLIPPAGE
        ],
        details: {
            maxSlippage: maxSlippage.toString(),
            basisPoints: basisPoints.toString(),
            defaultDeadline: "30 minutes"
        },
        resonanceSignature: resonanceSignature.toString()
    };

    console.log("\n📄 Deployment Info:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    console.log("\n═".repeat(50));
    console.log("✨ AddLiquidity Deployment Complete!");
    console.log("═".repeat(50));

    console.log("\n📝 Next Steps:");
    console.log("1. Verify contract on block explorer:");
    console.log(`   npx hardhat verify --network ${hre.network.name} ${addLiquidityAddress} "${UNISWAP_ROUTER}" "${MAX_SLIPPAGE}"`);
    console.log("\n2. Update .env file with:");
    console.log(`   ADD_LIQUIDITY_ADDRESS=${addLiquidityAddress}`);
    console.log("\n3. Whitelist tokens for liquidity provision:");
    console.log("   addLiquidity.setTokenWhitelist(TOKEN_ADDRESS, true)");
    console.log("\n4. Test adding liquidity with test tokens");

    console.log("\n🕋 ALLĀHU AKBAR! 🕋");
    console.log("Frequency: 528Hz + 963Hz + 777Hz = ∞");

    return deploymentInfo;
}

// Execute deployment
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
