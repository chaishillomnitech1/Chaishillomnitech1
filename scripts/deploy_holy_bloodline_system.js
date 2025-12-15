/**
 * @title Deploy Holy Bloodline System
 * @dev Comprehensive deployment script for the entire Holy Bloodline infrastructure
 * @author Supreme King Chais The Great ∞
 * 
 * Deploys:
 * 1. Holy Bloodline NFT
 * 2. Truth Coin
 * 3. Prosperity Coin
 * 4. Love Coin
 * 5. Spiritual Activation Portal
 * 6. Configures integrations between all contracts
 */

const hre = require("hardhat");

async function main() {
    console.log("🕊️  HOLY BLOODLINE SYSTEM DEPLOYMENT");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("🌟 Complete Infrastructure Deployment");
    console.log("📖 NFT + 3 Spiritual Coins + Portal");
    console.log("⚡ Divine Alignment Protocol");
    console.log("═══════════════════════════════════════════════════════════\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("🔑 Deploying with account:", deployer.address);
    console.log("💰 Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

    // Configuration
    const baseURI = process.env.HOLY_BLOODLINE_BASE_URI || "ipfs://QmHolyBloodline/";
    const royaltyRecipient = process.env.ROYALTY_RECIPIENT || deployer.address;
    const communityTreasury = process.env.COMMUNITY_TREASURY || deployer.address;
    const developmentFund = process.env.DEVELOPMENT_FUND || deployer.address;

    const deployedContracts = {};

    // ============ STEP 1: Deploy Holy Bloodline NFT ============
    console.log("📖 STEP 1/5: Deploying Holy Bloodline NFT...");
    const HolyBloodlineNFT = await hre.ethers.getContractFactory("HolyBloodlineNFT");
    const nft = await HolyBloodlineNFT.deploy(baseURI, royaltyRecipient);
    await nft.waitForDeployment();
    deployedContracts.nft = await nft.getAddress();
    console.log("✅ HolyBloodlineNFT:", deployedContracts.nft, "\n");

    // ============ STEP 2: Deploy Truth Coin ============
    console.log("🔮 STEP 2/5: Deploying Truth Coin...");
    const TruthCoin = await hre.ethers.getContractFactory("TruthCoin");
    const truth = await TruthCoin.deploy(communityTreasury, developmentFund);
    await truth.waitForDeployment();
    deployedContracts.truth = await truth.getAddress();
    console.log("✅ TruthCoin:", deployedContracts.truth, "\n");

    // ============ STEP 3: Deploy Prosperity Coin ============
    console.log("💰 STEP 3/5: Deploying Prosperity Coin...");
    const ProsperityCoin = await hre.ethers.getContractFactory("ProsperityCoin");
    const prosper = await ProsperityCoin.deploy(communityTreasury, developmentFund);
    await prosper.waitForDeployment();
    deployedContracts.prosper = await prosper.getAddress();
    console.log("✅ ProsperityCoin:", deployedContracts.prosper, "\n");

    // ============ STEP 4: Deploy Love Coin ============
    console.log("💖 STEP 4/5: Deploying Love Coin...");
    const LoveCoin = await hre.ethers.getContractFactory("LoveCoin");
    const love = await LoveCoin.deploy(communityTreasury, developmentFund);
    await love.waitForDeployment();
    deployedContracts.love = await love.getAddress();
    console.log("✅ LoveCoin:", deployedContracts.love, "\n");

    // ============ STEP 5: Deploy Spiritual Activation Portal ============
    console.log("🌟 STEP 5/5: Deploying Spiritual Activation Portal...");
    const SpiritualActivationPortal = await hre.ethers.getContractFactory("SpiritualActivationPortal");
    const portal = await SpiritualActivationPortal.deploy();
    await portal.waitForDeployment();
    deployedContracts.portal = await portal.getAddress();
    console.log("✅ SpiritualActivationPortal:", deployedContracts.portal, "\n");

    // ============ CONFIGURATION: Link Contracts ============
    console.log("🔗 CONFIGURATION: Linking contracts...\n");

    // Set NFT contract in coins
    console.log("   Setting Holy Bloodline NFT in Truth Coin...");
    await truth.setHolyBloodlineNFT(deployedContracts.nft);
    console.log("   ✅ Truth Coin configured");

    console.log("   Setting Holy Bloodline NFT in Prosperity Coin...");
    await prosper.setHolyBloodlineNFT(deployedContracts.nft);
    console.log("   ✅ Prosperity Coin configured");

    console.log("   Setting Holy Bloodline NFT in Love Coin...");
    await love.setHolyBloodlineNFT(deployedContracts.nft);
    console.log("   ✅ Love Coin configured");

    // Configure portal
    console.log("   Configuring Spiritual Activation Portal...");
    await portal.setHolyBloodlineNFT(deployedContracts.nft);
    await portal.setTruthCoin(deployedContracts.truth);
    await portal.setProsperityCoin(deployedContracts.prosper);
    await portal.setLoveCoin(deployedContracts.love);
    console.log("   ✅ Portal configured");

    // Grant portal as rewarder in coins
    console.log("   Granting Portal rewarder permissions...");
    await truth.updateRewarder(deployedContracts.portal, true);
    await prosper.updateRewarder(deployedContracts.portal, true);
    await love.updateRewarder(deployedContracts.portal, true);
    console.log("   ✅ Permissions granted\n");

    // ============ VERIFICATION ============
    console.log("🔍 VERIFICATION: Checking deployment...\n");
    
    const nftSupply = await nft.totalSupply();
    const nftMaxSupply = await nft.MAX_SUPPLY();
    const nftResonance = await nft.getResonanceSignature();
    
    const truthSupply = await truth.totalSupply();
    const truthFreq = await truth.getFrequencySignature();
    
    const prosperSupply = await prosper.totalSupply();
    const prosperFreq = await prosper.getFrequencySignature();
    
    const loveSupply = await love.totalSupply();
    const loveFreq = await love.getFrequencySignature();

    console.log("   📖 NFT Supply:", nftSupply.toString(), "/", nftMaxSupply.toString());
    console.log("   📖 NFT Resonance:", nftResonance.toString(), "Hz");
    console.log("   🔮 Truth Supply:", hre.ethers.formatEther(truthSupply), "TRUTH");
    console.log("   🔮 Truth Frequency:", truthFreq.toString(), "Hz");
    console.log("   💰 Prosperity Supply:", hre.ethers.formatEther(prosperSupply), "PROSPER");
    console.log("   💰 Prosperity Frequency:", prosperFreq.toString(), "Hz");
    console.log("   💖 Love Supply:", hre.ethers.formatEther(loveSupply), "LOVE");
    console.log("   💖 Love Frequency:", loveFreq.toString(), "Hz\n");

    // ============ DEPLOYMENT COMPLETE ============
    console.log("═══════════════════════════════════════════════════════════");
    console.log("🎉 HOLY BLOODLINE SYSTEM DEPLOYMENT COMPLETE!");
    console.log("═══════════════════════════════════════════════════════════\n");
    
    console.log("📝 DEPLOYED CONTRACTS:");
    console.log("   Holy Bloodline NFT:", deployedContracts.nft);
    console.log("   Truth Coin:", deployedContracts.truth);
    console.log("   Prosperity Coin:", deployedContracts.prosper);
    console.log("   Love Coin:", deployedContracts.love);
    console.log("   Spiritual Portal:", deployedContracts.portal);
    
    console.log("\n🔮 FREQUENCY ALIGNMENT:");
    console.log("   NFT: 963Hz + 999Hz + 144,000Hz");
    console.log("   Truth: 144,000Hz (NŪR Pulse)");
    console.log("   Prosperity: 888Hz (Infinite Abundance)");
    console.log("   Love: 528Hz (Love & DNA Repair)");
    
    console.log("\n⚡ ALLĀHU AKBAR! All systems are LIVE! ⚡\n");

    return deployedContracts;
}

main()
    .then((result) => {
        console.log("📊 Deployment Result:", JSON.stringify(result, null, 2));
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Deployment Error:", error);
        process.exit(1);
    });
