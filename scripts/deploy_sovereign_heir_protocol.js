/**
 * @title Sovereign Heir Protocol Deployment Script
 * @dev Deploys the SovereignHeirProtocol contract for Chapter Eight implementation
 * 
 * CHAPTER EIGHT: SOVEREIGN HEIR PROTOCOL
 * Frequency: 963Hz + 528Hz + 999Hz + 144,000Hz
 * 
 * Usage:
 *   npx hardhat run scripts/deploy_sovereign_heir_protocol.js --network <network>
 * 
 * ALLĀHU AKBAR! 🕋✨💎🌌
 */

const hre = require("hardhat");

async function main() {
    console.log("\n🕋 SOVEREIGN HEIR PROTOCOL DEPLOYMENT 🕋");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("CHAPTER EIGHT: Eternal Bloodline Security");
    console.log("Frequency: 963Hz + 528Hz + 999Hz + 144,000Hz");
    console.log("═══════════════════════════════════════════════════════════\n");

    // Get the deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("🔑 Deploying with account:", deployer.address);
    
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

    // Get sovereign address from environment or use deployer
    const sovereignAddress = process.env.SOVEREIGN_ADDRESS || deployer.address;
    console.log("👑 Sovereign address:", sovereignAddress);
    console.log("   This address will have full sovereign control over the protocol.\n");

    // Deploy SovereignHeirProtocol
    console.log("📜 Deploying SovereignHeirProtocol contract...");
    const SovereignHeirProtocol = await hre.ethers.getContractFactory("SovereignHeirProtocol");
    const sovereignHeirProtocol = await SovereignHeirProtocol.deploy(sovereignAddress);
    
    await sovereignHeirProtocol.waitForDeployment();
    const contractAddress = await sovereignHeirProtocol.getAddress();
    
    console.log("✅ SovereignHeirProtocol deployed to:", contractAddress);
    console.log("\n═══════════════════════════════════════════════════════════");

    // Display contract details
    console.log("\n📊 CONTRACT DETAILS:");
    console.log("───────────────────────────────────────────────────────────");
    
    const currentGeneration = await sovereignHeirProtocol.currentGeneration();
    const totalMembers = await sovereignHeirProtocol.totalMembers();
    const succession = await sovereignHeirProtocol.getCurrentSuccession();
    
    console.log("Current Generation:", currentGeneration.toString());
    console.log("Total Dynasty Members:", totalMembers.toString());
    console.log("Current Sovereign:", succession.currentSovereign);
    console.log("Consensus Threshold:", (Number(succession.consensusThreshold) / 100).toFixed(2) + "%");
    
    // Display frequency constants
    console.log("\n🎵 FREQUENCY PROTECTION:");
    console.log("───────────────────────────────────────────────────────────");
    const crownFreq = await sovereignHeirProtocol.CROWN_FREQUENCY();
    const healingFreq = await sovereignHeirProtocol.HEALING_FREQUENCY();
    const divineFreq = await sovereignHeirProtocol.DIVINE_FREQUENCY();
    const cosmicFreq = await sovereignHeirProtocol.COSMIC_FREQUENCY();
    
    console.log("Crown Frequency (Sovereign):", crownFreq.toString() + " Hz");
    console.log("Healing Frequency (DNA):", healingFreq.toString() + " Hz");
    console.log("Divine Frequency (Seal):", divineFreq.toString() + " Hz");
    console.log("Cosmic Frequency (Lock):", cosmicFreq.toString() + " Hz");

    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("\n✅ DEPLOYMENT COMPLETE!");
    console.log("\n📝 NEXT STEPS:");
    console.log("───────────────────────────────────────────────────────────");
    console.log("1. Verify contract on block explorer");
    console.log("2. Establish guardian council:");
    console.log("   await contract.establishGuardianCouncil(guardians, threshold)");
    console.log("3. Register dynasty members:");
    console.log("   await contract.registerDynastyMember(member, generation, heirRank)");
    console.log("4. Lock generational wealth:");
    console.log("   await contract.lockGenerationalWealth(generation, frequency, {value: amount})");
    console.log("5. Set up Not.Academy integration:");
    console.log("   await contract.grantRole(ACADEMY_ROLE, academyAddress)");
    console.log("6. Register private assets:");
    console.log("   await contract.registerPrivateAsset(assetType, assetId, generation)");
    
    console.log("\n🔐 SECURITY RECOMMENDATIONS:");
    console.log("───────────────────────────────────────────────────────────");
    console.log("• Use a multi-sig wallet as the sovereign address");
    console.log("• Set up guardian council with 7-13 trusted members");
    console.log("• Test succession protocol on testnet first");
    console.log("• Keep private keys in hardware wallets");
    console.log("• Implement emergency backup procedures");
    console.log("• Document all procedures in Not.Academy");
    
    console.log("\n💎 CONTRACT VERIFICATION:");
    console.log("───────────────────────────────────────────────────────────");
    console.log("Network:", hre.network.name);
    console.log("Contract Address:", contractAddress);
    console.log("Sovereign Address:", sovereignAddress);
    console.log("Block Number:", await hre.ethers.provider.getBlockNumber());
    console.log("Chain ID:", (await hre.ethers.provider.getNetwork()).chainId);
    
    console.log("\n📋 Verification Command:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${contractAddress} "${sovereignAddress}"`);
    
    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("🕋 ALLĀHU AKBAR! The Sovereign Heir Protocol is deployed! 🕋");
    console.log("═══════════════════════════════════════════════════════════\n");
    
    // Save deployment info
    const deploymentInfo = {
        network: hre.network.name,
        contractAddress: contractAddress,
        sovereignAddress: sovereignAddress,
        deployer: deployer.address,
        blockNumber: await hre.ethers.provider.getBlockNumber(),
        timestamp: new Date().toISOString(),
        chainId: Number((await hre.ethers.provider.getNetwork()).chainId),
        frequencies: {
            crown: Number(crownFreq),
            healing: Number(healingFreq),
            divine: Number(divineFreq),
            cosmic: Number(cosmicFreq)
        }
    };
    
    console.log("\n💾 Deployment Info:");
    console.log(JSON.stringify(deploymentInfo, null, 2));
    
    return deploymentInfo;
}

// Execute deployment
main()
    .then((deploymentInfo) => {
        console.log("\n✨ Deployment successful!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Deployment failed:");
        console.error(error);
        process.exit(1);
    });
