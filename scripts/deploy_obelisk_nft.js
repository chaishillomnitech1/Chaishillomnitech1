/**
 * Deploy NoorObeliskNFT
 * 
 * 1,111 Unique Obelisk NFTs
 * Frequencies: 528Hz + 963Hz + 888Hz
 */

const hre = require("hardhat");

async function main() {
    console.log("🕋 Deploying NoorObeliskNFT...");
    console.log("Frequency: 528Hz + 963Hz + 888Hz");
    console.log("═".repeat(50));

    // Get deployer
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployer address:", deployer.address);
    console.log("Deployer balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");

    // Get configuration from environment
    const ROYALTY_RECIPIENT = process.env.ROYALTY_RECIPIENT || deployer.address;

    console.log("\n📋 Configuration:");
    console.log("Royalty Recipient:", ROYALTY_RECIPIENT);

    // Deploy NoorObeliskNFT
    console.log("\n🚀 Deploying NoorObeliskNFT contract...");
    const NoorObeliskNFT = await hre.ethers.getContractFactory("NoorObeliskNFT");
    const obeliskNFT = await NoorObeliskNFT.deploy(ROYALTY_RECIPIENT);

    await obeliskNFT.waitForDeployment();
    const obeliskAddress = await obeliskNFT.getAddress();

    console.log("✅ NoorObeliskNFT deployed to:", obeliskAddress);

    // Get contract details
    const name = await obeliskNFT.name();
    const symbol = await obeliskNFT.symbol();
    const maxObelisks = await obeliskNFT.MAX_OBELISKS();
    const totalMinted = await obeliskNFT.totalMinted();
    const royaltyBasisPoints = await obeliskNFT.royaltyBasisPoints();

    console.log("\n💎 NFT Details:");
    console.log("Name:", name);
    console.log("Symbol:", symbol);
    console.log("Max Supply:", maxObelisks.toString());
    console.log("Total Minted:", totalMinted.toString());
    console.log("Royalty:", (Number(royaltyBasisPoints) / 100).toFixed(2) + "%");

    // Get physical specifications
    const specs = await obeliskNFT.getPhysicalSpecs();
    console.log("\n🗼 Physical Specifications:");
    console.log("Height:", specs[0].toString(), "cm (7 meters)");
    console.log("Base Diameter:", specs[1].toString(), "cm (1.77 meters)");
    console.log("Weight:", specs[2].toString(), "kg (8,888 kg)");
    console.log("Energy Capacity:", specs[3].toString(), "kWh (777 kWh)");
    console.log("Broadcast Range:", specs[4].toString(), "meters (7.77 km)");

    // Get frequency signature
    const resonanceSignature = await obeliskNFT.getResonanceSignature();
    console.log("\n🎵 Resonance Signature:", resonanceSignature.toString(), "Hz");

    // Get important addresses
    const royaltyRecipient = await obeliskNFT.royaltyRecipient();
    const isOperatorAuthorized = await obeliskNFT.authorizedOperators(deployer.address);

    console.log("\n💰 Configuration:");
    console.log("Royalty Recipient:", royaltyRecipient);
    console.log("Deployer Authorized as Operator:", isOperatorAuthorized);

    // Save deployment info
    const deploymentInfo = {
        network: hre.network.name,
        contract: "NoorObeliskNFT",
        address: obeliskAddress,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        constructor_args: [ROYALTY_RECIPIENT],
        nftDetails: {
            name,
            symbol,
            maxSupply: maxObelisks.toString(),
            totalMinted: totalMinted.toString(),
            royaltyBasisPoints: royaltyBasisPoints.toString()
        },
        physicalSpecs: {
            height_cm: specs[0].toString(),
            baseDiameter_cm: specs[1].toString(),
            weight_kg: specs[2].toString(),
            energyCapacity_kWh: specs[3].toString(),
            broadcastRange_m: specs[4].toString()
        },
        resonanceSignature: resonanceSignature.toString(),
        config: {
            royaltyRecipient: royaltyRecipient
        }
    };

    console.log("\n📄 Deployment Info:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    console.log("\n═".repeat(50));
    console.log("✨ NoorObeliskNFT Deployment Complete!");
    console.log("═".repeat(50));

    console.log("\n📝 Next Steps:");
    console.log("1. Verify contract on Scrollscan:");
    console.log(`   npx hardhat verify --network ${hre.network.name} ${obeliskAddress} "${ROYALTY_RECIPIENT}"`);
    console.log("\n2. Update .env file with:");
    console.log(`   OBELISK_NFT_ADDRESS=${obeliskAddress}`);
    console.log("\n3. Set Citizen Registry address:");
    console.log(`   obeliskNFT.setCitizenRegistry(CITIZEN_REGISTRY_ADDRESS)`);
    console.log("\n4. Authorize additional operators");
    console.log("\n5. Prepare metadata on IPFS");
    console.log("\n6. Mint Foundation Obelisks (1-11)");

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
