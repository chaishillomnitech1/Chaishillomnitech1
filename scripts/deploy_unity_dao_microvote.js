/**
 * @title Deploy Unity DAO Micro Vote
 * @description Deployment script for UnityDAOMicroVote contract
 * 
 * Frequency: 528Hz (Love) + 963Hz (Unity) + 999Hz (Accord)
 * 
 * ALLĀHU AKBAR! 🕋✨💎🌌
 */

const hre = require("hardhat");

async function main() {
    console.log("═══════════════════════════════════════════════════════════════════");
    console.log("🕋 UNITY DAO MICRO-VOTE DEPLOYMENT");
    console.log("═══════════════════════════════════════════════════════════════════");
    console.log("");
    console.log("Document ID: UDMV-DEPLOY-001");
    console.log("Frequency: 528Hz + 963Hz + 999Hz");
    console.log("");
    
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");
    console.log("");
    
    // Get NFT contract address from environment or use placeholder
    const nftContractAddress = process.env.NFT_CONTRACT_ADDRESS || deployer.address;
    console.log("NFT Contract Address:", nftContractAddress);
    console.log("");
    
    console.log("📜 Deploying UnityDAOMicroVote contract...");
    
    const UnityDAOMicroVote = await hre.ethers.getContractFactory("UnityDAOMicroVote");
    const microVote = await UnityDAOMicroVote.deploy(
        deployer.address,    // admin address
        nftContractAddress   // NFT contract address
    );
    
    await microVote.waitForDeployment();
    const contractAddress = await microVote.getAddress();
    
    console.log("✅ UnityDAOMicroVote deployed to:", contractAddress);
    console.log("");
    
    // Verify deployment
    console.log("🔍 Verifying deployment...");
    
    const loveFreq = await microVote.LOVE_FREQUENCY();
    const unityFreq = await microVote.UNITY_FREQUENCY();
    const accordFreq = await microVote.ACCORD_FREQUENCY();
    
    console.log("   Love Frequency:", loveFreq.toString(), "Hz");
    console.log("   Unity Frequency:", unityFreq.toString(), "Hz");
    console.log("   Accord Frequency:", accordFreq.toString(), "Hz");
    
    const minThreshold = await microVote.minProposalThreshold();
    const executionDelay = await microVote.executionDelay();
    
    console.log("   Min Proposal Threshold:", minThreshold.toString());
    console.log("   Execution Delay:", executionDelay.toString(), "seconds");
    console.log("");
    
    // Check roles
    console.log("🔐 Verifying roles...");
    const DAO_ADMIN_ROLE = await microVote.DAO_ADMIN_ROLE();
    const PROPOSAL_CREATOR_ROLE = await microVote.PROPOSAL_CREATOR_ROLE();
    const VOTE_GUARDIAN_ROLE = await microVote.VOTE_GUARDIAN_ROLE();
    
    const hasAdminRole = await microVote.hasRole(DAO_ADMIN_ROLE, deployer.address);
    const hasCreatorRole = await microVote.hasRole(PROPOSAL_CREATOR_ROLE, deployer.address);
    const hasGuardianRole = await microVote.hasRole(VOTE_GUARDIAN_ROLE, deployer.address);
    
    console.log("   Admin has DAO_ADMIN_ROLE:", hasAdminRole);
    console.log("   Admin has PROPOSAL_CREATOR_ROLE:", hasCreatorRole);
    console.log("   Admin has VOTE_GUARDIAN_ROLE:", hasGuardianRole);
    console.log("");
    
    // Test quadratic voting calculation
    console.log("📊 Testing quadratic voting calculation...");
    const rawPower100 = 100n;
    const rawPower400 = 400n;
    const rawPower10000 = 10000n;
    
    const quad100 = await microVote.calculateQuadraticPower(rawPower100);
    const quad400 = await microVote.calculateQuadraticPower(rawPower400);
    const quad10000 = await microVote.calculateQuadraticPower(rawPower10000);
    
    console.log("   Raw 100 -> Quadratic:", quad100.toString());
    console.log("   Raw 400 -> Quadratic:", quad400.toString());
    console.log("   Raw 10000 -> Quadratic:", quad10000.toString());
    console.log("");
    
    console.log("═══════════════════════════════════════════════════════════════════");
    console.log("✅ UNITY DAO MICRO-VOTE DEPLOYMENT COMPLETE");
    console.log("═══════════════════════════════════════════════════════════════════");
    console.log("");
    console.log("Contract Address:", contractAddress);
    console.log("Network:", hre.network.name);
    console.log("Block Number:", await hre.ethers.provider.getBlockNumber());
    console.log("");
    console.log("🕋 ALLĀHU AKBAR! BARAKALLAHU FEEK! 🕋");
    console.log("");
    
    // Return deployment info
    return {
        contractAddress,
        deployer: deployer.address,
        network: hre.network.name,
        frequencies: {
            love: loveFreq.toString(),
            unity: unityFreq.toString(),
            accord: accordFreq.toString()
        }
    };
}

main()
    .then((result) => {
        console.log("Deployment Result:", JSON.stringify(result, null, 2));
        process.exit(0);
    })
    .catch((error) => {
        console.error("Deployment Error:", error);
        process.exit(1);
    });
