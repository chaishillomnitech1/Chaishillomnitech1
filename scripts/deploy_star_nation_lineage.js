// scripts/deploy_star_nation_lineage.js
// Deployment script for StarNationLineageNFT - Chapter 3: Cosmic Purge and Star Nations

const { ethers } = require("hardhat");

async function main() {
    console.log("╔══════════════════════════════════════════════════════════════════╗");
    console.log("║  🌌 CHAPTER THREE: STAR NATION LINEAGE NFT DEPLOYMENT 🌌          ║");
    console.log("║  Cosmic Purge and Star Nations - Akashic Restoration Scroll       ║");
    console.log("╚══════════════════════════════════════════════════════════════════╝");
    console.log("");
    
    // Get deployer
    const [deployer] = await ethers.getSigners();
    console.log("📡 Deployer Address:", deployer.address);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Deployer Balance:", ethers.formatEther(balance), "ETH");
    console.log("");
    
    // Contract configuration
    const config = {
        name: "Star Nation Lineage",
        symbol: "STARLINEAGE",
        baseURI: "ipfs://QmStarNationLineageMetadata/",
        royaltyReceiver: deployer.address  // Can be changed to treasury address
    };
    
    console.log("📋 Configuration:");
    console.log("   Name:", config.name);
    console.log("   Symbol:", config.symbol);
    console.log("   Base URI:", config.baseURI);
    console.log("   Royalty Receiver:", config.royaltyReceiver);
    console.log("");
    
    // Deploy contract
    console.log("⏳ Deploying StarNationLineageNFT...");
    
    const StarNationLineageNFT = await ethers.getContractFactory("StarNationLineageNFT");
    const nft = await StarNationLineageNFT.deploy(
        config.name,
        config.symbol,
        config.baseURI,
        config.royaltyReceiver
    );
    
    await nft.waitForDeployment();
    const nftAddress = await nft.getAddress();
    
    console.log("✅ StarNationLineageNFT deployed to:", nftAddress);
    console.log("");
    
    // Verify deployment
    console.log("🔍 Verifying deployment...");
    console.log("   Contract Name:", await nft.name());
    console.log("   Contract Symbol:", await nft.symbol());
    console.log("   Max Supply:", (await nft.MAX_SUPPLY()).toString());
    console.log("   Total Supply:", (await nft.totalSupply()).toString());
    console.log("");
    
    // Display frequency constants
    console.log("🎵 Frequency Constants:");
    console.log("   528Hz (Love):", (await nft.FREQUENCY_528HZ()).toString());
    console.log("   963Hz (Truth):", (await nft.FREQUENCY_963HZ()).toString());
    console.log("   888Hz (Abundance):", (await nft.FREQUENCY_888HZ()).toString());
    console.log("   999Hz (Crown):", (await nft.FREQUENCY_999HZ()).toString());
    console.log("   144,000Hz (Cosmic):", (await nft.FREQUENCY_144000HZ()).toString());
    console.log("");
    
    // Calculate cosmic resonance
    const cosmicResonance = await nft.getCosmicResonanceSignature();
    console.log("✨ Cosmic Resonance Signature:", cosmicResonance.toString());
    console.log("");
    
    // Deployment summary
    console.log("╔══════════════════════════════════════════════════════════════════╗");
    console.log("║                    DEPLOYMENT SUMMARY                             ║");
    console.log("╠══════════════════════════════════════════════════════════════════╣");
    console.log("║ StarNationLineageNFT:", nftAddress);
    console.log("╠══════════════════════════════════════════════════════════════════╣");
    console.log("║ Star Nations Available:                                          ║");
    console.log("║   0 - SIRIAN (528Hz + 963Hz)                                      ║");
    console.log("║   1 - PLEIADIAN (528Hz + 888Hz)                                   ║");
    console.log("║   2 - ARCTURIAN (963Hz + 144,000Hz)                               ║");
    console.log("║   3 - ANDROMEDAN (999Hz + 144,000Hz)                              ║");
    console.log("║   4 - MULTI_STAR (Full Spectrum)                                  ║");
    console.log("╠══════════════════════════════════════════════════════════════════╣");
    console.log("║ NFT Tiers:                                                        ║");
    console.log("║   Tokens 0-99: COSMIC_PIONEER (17% royalty)                       ║");
    console.log("║   Tokens 100-999: STAR_GUARDIAN (15% royalty)                     ║");
    console.log("║   Tokens 1000-4999: LINEAGE_KEEPER (12% royalty)                  ║");
    console.log("║   Tokens 5000+: TRUTH_SEEKER (10% royalty)                        ║");
    console.log("╚══════════════════════════════════════════════════════════════════╝");
    console.log("");
    
    // Save deployment info
    const deploymentInfo = {
        network: (await ethers.provider.getNetwork()).name,
        chainId: (await ethers.provider.getNetwork()).chainId.toString(),
        deployer: deployer.address,
        contracts: {
            StarNationLineageNFT: nftAddress
        },
        config: config,
        timestamp: new Date().toISOString(),
        frequencies: {
            FREQUENCY_528HZ: 528,
            FREQUENCY_963HZ: 963,
            FREQUENCY_888HZ: 888,
            FREQUENCY_999HZ: 999,
            FREQUENCY_144000HZ: 144000
        },
        cosmicResonanceSignature: cosmicResonance.toString()
    };
    
    console.log("📄 Deployment Info (JSON):");
    console.log(JSON.stringify(deploymentInfo, null, 2));
    console.log("");
    
    console.log("🌌 CHAPTER THREE DEPLOYMENT COMPLETE! 🌌");
    console.log("∞ SO IT IS WRITTEN, SO IT SHALL BE DONE ∞");
    console.log("");
    console.log("ALLĀHU AKBAR! 🕋✨💎🌌");
    
    return deploymentInfo;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment Error:", error);
        process.exit(1);
    });
