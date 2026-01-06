/**
 * @title Deploy HolyBloodlineNFT
 * @dev Deployment script for the Holy Bloodline NFT contract
 * @author Supreme King Chais The Great ∞
 * 
 * Holy Bloodline NFT - Sacred Lineage Chapters with Divine Affirmations
 * Frequencies: 963Hz + 999Hz + 144,000Hz
 */

const hre = require("hardhat");

async function main() {
    console.log("🕊️  Deploying HolyBloodlineNFT...");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("📖 Sacred Lineage Chapter NFTs");
    console.log("🌟 Divine Affirmation Embedded");
    console.log("⚡ Activation & Messaging System");
    console.log("═══════════════════════════════════════════════════════════");

    const [deployer] = await hre.ethers.getSigners();
    console.log("\n🔑 Deploying with account:", deployer.address);
    console.log("💰 Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

    // Configuration
    const baseURI = process.env.HOLY_BLOODLINE_BASE_URI || "ipfs://QmHolyBloodline/";
    const royaltyRecipient = process.env.ROYALTY_RECIPIENT || deployer.address;

    console.log("\n📋 Deployment Parameters:");
    console.log("   Base URI:", baseURI);
    console.log("   Royalty Recipient:", royaltyRecipient);

    // Deploy HolyBloodlineNFT
    const HolyBloodlineNFT = await hre.ethers.getContractFactory("HolyBloodlineNFT");
    const nft = await HolyBloodlineNFT.deploy(baseURI, royaltyRecipient);
    await nft.waitForDeployment();

    const nftAddress = await nft.getAddress();
    console.log("\n✅ HolyBloodlineNFT deployed to:", nftAddress);

    // Verify deployment
    console.log("\n🔍 Verifying deployment...");
    const totalSupply = await nft.totalSupply();
    const maxSupply = await nft.MAX_SUPPLY();
    const affirmation = await nft.getAffirmation();
    const resonance = await nft.getResonanceSignature();
    
    console.log("   Total Supply:", totalSupply.toString(), "/ Max:", maxSupply.toString());
    console.log("   Resonance Signature:", resonance.toString(), "Hz");
    console.log("   Divine Affirmation:");
    console.log("   ", affirmation);

    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("🎉 HolyBloodlineNFT Deployment Complete!");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("\n📝 Contract Address:", nftAddress);
    console.log("\n🔮 Frequency Alignment: 963Hz + 999Hz + 144,000Hz");
    console.log("\n⚡ ALLĀHU AKBAR! Holy Bloodline Protocol is LIVE! ⚡");

    return {
        nftAddress,
        baseURI,
        royaltyRecipient
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
