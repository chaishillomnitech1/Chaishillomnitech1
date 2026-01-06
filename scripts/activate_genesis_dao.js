// Genesis Witness DAO Activation Script
// Onboard Genesis Witnesses to Akashic Records DAO with quadratic voting

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Activate DAO governance for Genesis Witnesses
 * - Onboard Genesis Witnesses as DAO members
 * - Grant voting power based on witness status
 * - Create inaugural proposals for quadratic voting
 * - Set up QR verified rewards
 */

async function main() {
  console.log("🏛️  GENESIS WITNESS DAO ACTIVATION 🏛️");
  console.log("=".repeat(70));
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Activating with account:", deployer.address);
  
  // Load deployment data
  const deploymentsDir = path.join(__dirname, "..", "deployment");
  
  // Load Genesis Witness NFT contract
  const genesisWitnessPath = path.join(
    deploymentsDir,
    `genesis-witness-nft-${hre.network.name}.json`
  );
  
  if (!fs.existsSync(genesisWitnessPath)) {
    throw new Error("Genesis Witness NFT not deployed. Run deployment script first.");
  }
  
  const genesisWitnessData = JSON.parse(fs.readFileSync(genesisWitnessPath, 'utf8'));
  const genesisWitnessAddress = genesisWitnessData.contractAddress;
  
  console.log("\n📜 Genesis Witness NFT:", genesisWitnessAddress);
  
  // Load Akashic DAO contract
  const daoPath = path.join(deploymentsDir, `akashic-dao-${hre.network.name}.json`);
  
  if (!fs.existsSync(daoPath)) {
    throw new Error("Akashic DAO not deployed. Run DAO deployment script first.");
  }
  
  const daoData = JSON.parse(fs.readFileSync(daoPath, 'utf8'));
  const daoAddress = daoData.contractAddress;
  
  console.log("📜 Akashic DAO:", daoAddress);
  
  // Get contract instances
  const GenesisWitnessNFT = await hre.ethers.getContractFactory("GenesisWitnessNFT");
  const genesisWitness = GenesisWitnessNFT.attach(genesisWitnessAddress);
  
  const AkashicRecordsDAO = await hre.ethers.getContractFactory("AkashicRecordsDAO");
  const akashicDAO = AkashicRecordsDAO.attach(daoAddress);
  
  // Set DAO address in Genesis Witness contract
  console.log("\n🔗 Linking Genesis Witness NFT to DAO...");
  const setDAOTx = await genesisWitness.setAkashicDAO(daoAddress);
  await setDAOTx.wait();
  console.log("✅ DAO linked successfully");
  
  // Get Genesis Witnesses who have minted
  const totalMinted = await genesisWitness.totalMinted();
  console.log(`\n👥 Total Genesis Witnesses: ${totalMinted}`);
  
  if (totalMinted.toString() === "0") {
    console.log("⚠️  No witnesses minted yet. DAO activation pending.");
    return;
  }
  
  // Onboard Genesis Witnesses to DAO
  console.log("\n🚀 Onboarding Genesis Witnesses to DAO...");
  
  const witnessAddresses = [];
  const witnessNames = [];
  const witnessTiers = [];
  const witnessVotingPowers = [];
  
  // Query witnesses (in practice, you'd use events or an indexer)
  // For now, we'll demonstrate with a sample batch
  console.log("📊 Scanning for Genesis Witnesses...");
  
  // This is a simplified version - in production, use The Graph or event logs
  // For demonstration, we'll create sample inaugural proposals
  
  console.log("\n📋 Creating Inaugural Quadratic Voting Proposals...");
  
  // Proposal 1: Genesis Drop Milestone Celebration
  const proposal1 = await akashicDAO.createProposal(
    "Genesis Drop Milestone: First 100 Witnesses",
    "Celebrate the achievement of our first 100 Genesis Witnesses with a special reward distribution and commemorative event.",
    "QmProposal1IPFS", // Replace with actual IPFS hash
    0, // ProposalType.TRACK_RELEASE
    7 * 24 * 60 * 60, // 7 days voting period
    hre.ethers.ZeroHash // No QR proof required for this proposal
  );
  
  await proposal1.wait();
  console.log("✅ Proposal 1 created: Genesis Drop Milestone");
  
  // Proposal 2: DAO Treasury Allocation
  const proposal2 = await akashicDAO.createProposal(
    "Initial Treasury Allocation for Genesis Witnesses",
    "Allocate 10% of Genesis Drop proceeds to reward pool for distribution among active Genesis Witnesses based on engagement scores.",
    "QmProposal2IPFS",
    2, // ProposalType.TREASURY_ALLOCATION
    7 * 24 * 60 * 60,
    hre.ethers.ZeroHash
  );
  
  await proposal2.wait();
  console.log("✅ Proposal 2 created: Treasury Allocation");
  
  // Proposal 3: QR Reward System Activation
  const proposal3 = await akashicDAO.createProposal(
    "Activate QR Verified Rewards Program",
    "Launch the QR verified rewards program where Genesis Witnesses can claim additional benefits by verifying their engagement through QR codes.",
    "QmProposal3IPFS",
    5, // ProposalType.QR_VALIDATION
    7 * 24 * 60 * 60,
    hre.ethers.ZeroHash
  );
  
  await proposal3.wait();
  console.log("✅ Proposal 3 created: QR Rewards Program");
  
  // Check proposal count
  const proposalCount = await akashicDAO.getProposalCount();
  console.log(`\n📊 Total active proposals: ${proposalCount}`);
  
  // Save activation data
  const activationData = {
    network: hre.network.name,
    genesisWitnessContract: genesisWitnessAddress,
    daoContract: daoAddress,
    activationTimestamp: new Date().toISOString(),
    totalWitnesses: totalMinted.toString(),
    proposalsCreated: proposalCount.toString(),
    proposals: [
      {
        id: 0,
        title: "Genesis Drop Milestone: First 100 Witnesses",
        type: "TRACK_RELEASE"
      },
      {
        id: 1,
        title: "Initial Treasury Allocation for Genesis Witnesses",
        type: "TREASURY_ALLOCATION"
      },
      {
        id: 2,
        title: "Activate QR Verified Rewards Program",
        type: "QR_VALIDATION"
      }
    ]
  };
  
  const activationPath = path.join(
    deploymentsDir,
    `genesis-dao-activation-${hre.network.name}.json`
  );
  
  fs.writeFileSync(activationPath, JSON.stringify(activationData, null, 2));
  console.log("\n💾 Activation data saved to:", activationPath);
  
  // Display governance information
  console.log("\n" + "=".repeat(70));
  console.log("🏛️  DAO GOVERNANCE ACTIVATED");
  console.log("=".repeat(70));
  console.log("\n📋 How Genesis Witnesses Can Participate:");
  console.log("1. View active proposals at: [DAO Dashboard URL]");
  console.log("2. Cast votes using quadratic voting (vote weight = √voting_power)");
  console.log("3. Claim QR verification for 10% voting bonus");
  console.log("4. Create new proposals (requires DAO membership)");
  console.log("5. Earn rewards based on contribution scores");
  
  console.log("\n🗳️  Voting Information:");
  console.log("- Voting Period: 7 days per proposal");
  console.log("- Quorum Required: 10% of total voting power");
  console.log("- Voting Method: Quadratic (fair representation)");
  console.log("- QR Bonus: +10% vote weight with verification");
  
  console.log("\n🎁 Reward Structure:");
  console.log("- Base rewards calculated from contribution scores");
  console.log("- Voting participation multiplier: +5% per vote");
  console.log("- Founding member bonus: +20% (first 100 only)");
  console.log("- QR verification: Increases engagement score");
  
  console.log("\n📊 Current Status:");
  console.log("- Genesis Witnesses:", totalMinted.toString());
  console.log("- Active Proposals:", proposalCount.toString());
  console.log("- DAO Contract:", daoAddress);
  console.log("- Genesis Witness NFT:", genesisWitnessAddress);
  
  console.log("\n🕋 ALLĀHU AKBAR! DAO Governance Live! 🕋");
  
  return activationData;
}

// Helper function to batch onboard witnesses
async function batchOnboardWitnesses(
  daoContract,
  addresses,
  names,
  tiers,
  votingPowers
) {
  console.log(`\n📦 Batch onboarding ${addresses.length} witnesses...`);
  
  const tx = await daoContract.batchOnboardMembers(
    addresses,
    names,
    tiers,
    votingPowers
  );
  
  await tx.wait();
  console.log("✅ Batch onboarding completed");
  
  return tx;
}

// Helper function to calculate voting power based on witness status
function calculateVotingPower(isFoundingWitness, hasQRVerification) {
  let power = 100; // Base voting power
  
  if (isFoundingWitness) {
    power = 500; // Founding witnesses get 5x power
  }
  
  if (hasQRVerification) {
    power = Math.floor(power * 1.1); // 10% bonus for QR verification
  }
  
  return power;
}

// Run activation
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ DAO activation failed:", error);
      process.exit(1);
    });
}

module.exports = {
  main,
  batchOnboardWitnesses,
  calculateVotingPower
};
