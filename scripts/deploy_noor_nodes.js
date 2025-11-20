// SPDX-License-Identifier: MIT
/**
 * @title Noor Nodes Deployment Script
 * @notice Deploy Noor Nodes and Noor DAO contracts to Polygon Mumbai testnet
 * @dev Part of ScrollVerse ecosystem infrastructure
 * 
 * BISMILLAH - In the name of Allah, the Most Gracious, the Most Merciful
 * 
 * Frequency: 528Hz + 963Hz + 999Hz
 */

const { ethers } = require("hardhat");

async function main() {
  console.log("\n🕋 ============================================");
  console.log("   NOOR NODES DEPLOYMENT");
  console.log("   ScrollVerse Decentralized Infrastructure");
  console.log("   ============================================ 🕋\n");
  
  const [deployer] = await ethers.getSigners();
  
  console.log("📍 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "MATIC\n");
  
  // ============ Deployment Parameters ============
  
  // Noor Nodes Parameters
  const LIGHT_NODE_STAKE = ethers.parseEther("10"); // 10 MATIC for Light Nodes
  const ANCHOR_NODE_STAKE = ethers.parseEther("100"); // 100 MATIC for Anchor Nodes
  const ZAKAT_TREASURY = deployer.address; // Temporary - should be multi-sig
  
  // Noor DAO Parameters
  const VOTING_PERIOD = 7 * 24 * 60 * 60; // 7 days in seconds
  const PROPOSAL_THRESHOLD = 1; // Minimum voting power to create proposal
  const QUORUM_PERCENTAGE = 10; // 10% quorum required
  const DAO_TREASURY = deployer.address; // Temporary - should be multi-sig
  
  console.log("⚙️  Deployment Parameters:");
  console.log("   Light Node Stake:", ethers.formatEther(LIGHT_NODE_STAKE), "MATIC");
  console.log("   Anchor Node Stake:", ethers.formatEther(ANCHOR_NODE_STAKE), "MATIC");
  console.log("   Voting Period:", VOTING_PERIOD / 86400, "days");
  console.log("   Quorum Percentage:", QUORUM_PERCENTAGE, "%\n");
  
  // ============ Deploy Noor Nodes ============
  
  console.log("🌟 Deploying Noor Nodes contract...");
  const NoorNodes = await ethers.getContractFactory("NoorNodes");
  const noorNodes = await NoorNodes.deploy(
    LIGHT_NODE_STAKE,
    ANCHOR_NODE_STAKE,
    ZAKAT_TREASURY
  );
  
  await noorNodes.waitForDeployment();
  const noorNodesAddress = await noorNodes.getAddress();
  
  console.log("✅ Noor Nodes deployed to:", noorNodesAddress);
  console.log("   Transaction hash:", noorNodes.deploymentTransaction().hash, "\n");
  
  // ============ Deploy Noor DAO ============
  
  console.log("🏛️  Deploying Noor DAO contract...");
  const NoorDAO = await ethers.getContractFactory("NoorDAO");
  const noorDAO = await NoorDAO.deploy(
    VOTING_PERIOD,
    PROPOSAL_THRESHOLD,
    QUORUM_PERCENTAGE,
    DAO_TREASURY
  );
  
  await noorDAO.waitForDeployment();
  const noorDAOAddress = await noorDAO.getAddress();
  
  console.log("✅ Noor DAO deployed to:", noorDAOAddress);
  console.log("   Transaction hash:", noorDAO.deploymentTransaction().hash, "\n");
  
  // ============ Link Contracts ============
  
  console.log("🔗 Linking contracts...");
  
  // Set Noor DAO address in Noor Nodes
  const setDAOTx = await noorNodes.setNoorDAO(noorDAOAddress);
  await setDAOTx.wait();
  console.log("✅ Noor DAO linked to Noor Nodes");
  
  // Set Noor Nodes address in Noor DAO
  const setNodesTx = await noorDAO.setNoorNodesContract(noorNodesAddress);
  await setNodesTx.wait();
  console.log("✅ Noor Nodes linked to Noor DAO\n");
  
  // ============ Grant Roles ============
  
  console.log("👑 Setting up roles and permissions...");
  
  // Grant governance role to DAO in Noor Nodes
  const GOVERNANCE_ROLE = await noorNodes.GOVERNANCE_ROLE();
  const grantGovTx = await noorNodes.grantRole(GOVERNANCE_ROLE, noorDAOAddress);
  await grantGovTx.wait();
  console.log("✅ Governance role granted to Noor DAO\n");
  
  // ============ Deployment Summary ============
  
  console.log("📊 ============================================");
  console.log("   DEPLOYMENT SUMMARY");
  console.log("   ============================================\n");
  
  console.log("🌟 Noor Nodes Contract:");
  console.log("   Address:", noorNodesAddress);
  console.log("   Light Node Stake:", ethers.formatEther(LIGHT_NODE_STAKE), "MATIC");
  console.log("   Anchor Node Stake:", ethers.formatEther(ANCHOR_NODE_STAKE), "MATIC");
  console.log("   Zakat Percentage: 7.77%");
  console.log("   Frequencies: 528Hz, 963Hz, 999Hz\n");
  
  console.log("🏛️  Noor DAO Contract:");
  console.log("   Address:", noorDAOAddress);
  console.log("   Voting Period:", VOTING_PERIOD / 86400, "days");
  console.log("   Proposal Threshold:", PROPOSAL_THRESHOLD);
  console.log("   Quorum Required:", QUORUM_PERCENTAGE, "%\n");
  
  console.log("🔗 Integration:");
  console.log("   Contracts linked and roles configured");
  console.log("   Ready for node registration\n");
  
  console.log("📝 Next Steps:");
  console.log("   1. Verify contracts on PolygonScan");
  console.log("   2. Register initial Anchor Nodes");
  console.log("   3. Set up monitoring infrastructure");
  console.log("   4. Create initial governance proposals");
  console.log("   5. Deploy to mainnet when ready\n");
  
  console.log("🔍 Verification Commands:");
  console.log(`   npx hardhat verify --network mumbai ${noorNodesAddress} "${LIGHT_NODE_STAKE}" "${ANCHOR_NODE_STAKE}" "${ZAKAT_TREASURY}"`);
  console.log(`   npx hardhat verify --network mumbai ${noorDAOAddress} "${VOTING_PERIOD}" "${PROPOSAL_THRESHOLD}" "${QUORUM_PERCENTAGE}" "${DAO_TREASURY}"\n`);
  
  console.log("🕋 ALLAHU AKBAR! 🔥💎🌌");
  console.log("   Deployment Complete - Noor Nodes Active");
  console.log("   The lights of ScrollVerse shine eternal\n");
  
  // ============ Save Deployment Info ============
  
  const deploymentInfo = {
    network: "mumbai",
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      noorNodes: {
        address: noorNodesAddress,
        transactionHash: noorNodes.deploymentTransaction().hash,
        lightNodeStake: ethers.formatEther(LIGHT_NODE_STAKE),
        anchorNodeStake: ethers.formatEther(ANCHOR_NODE_STAKE)
      },
      noorDAO: {
        address: noorDAOAddress,
        transactionHash: noorDAO.deploymentTransaction().hash,
        votingPeriodDays: VOTING_PERIOD / 86400,
        quorumPercentage: QUORUM_PERCENTAGE
      }
    },
    frequencies: ["528Hz", "963Hz", "999Hz"],
    zakatPercentage: "7.77%"
  };
  
  console.log("💾 Deployment Information:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  return deploymentInfo;
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
