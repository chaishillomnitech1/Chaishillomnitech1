// Onboard Founding Members to Akashic Records DAO
// First 50 contributing members with reward allocation

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("👥 AKASHIC RECORDS DAO - FOUNDING MEMBER ONBOARDING 👥");
  console.log("=".repeat(70));
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Onboarding members with account:", deployer.address);
  
  // Read DAO contract address from deployment file
  const deploymentsDir = path.join(__dirname, "..", "deployment");
  const daoDeploymentPath = path.join(deploymentsDir, `akashic-dao-${hre.network.name}.json`);
  
  let daoAddress;
  if (fs.existsSync(daoDeploymentPath)) {
    const daoDeployment = JSON.parse(fs.readFileSync(daoDeploymentPath, 'utf8'));
    daoAddress = daoDeployment.daoAddress;
    console.log("\n📜 Using AkashicRecordsDAO at:", daoAddress);
  } else {
    throw new Error("AkashicRecordsDAO not deployed. Please run deploy_akashic_dao.js first.");
  }
  
  const AkashicRecordsDAO = await hre.ethers.getContractFactory("AkashicRecordsDAO");
  const akashicDAO = await AkashicRecordsDAO.attach(daoAddress);
  
  console.log("\n👑 Founding Members Configuration:");
  console.log("=".repeat(70));
  console.log("Max Founding Members:", (await akashicDAO.MAX_FOUNDING_MEMBERS()).toString());
  console.log("Current Founding Members:", (await akashicDAO.foundingMembersCount()).toString());
  console.log("Total Members:", (await akashicDAO.getMemberCount()).toString());
  
  // Define founding members (first 50)
  // Note: In production, these would be actual contributor addresses
  const foundingMembers = [
    {
      address: deployer.address,
      name: "Chais The Great - Founder",
      tier: 4, // SOVEREIGN
      votingPower: 1000
    },
    // Additional founding members would be added here
    // For demonstration, we'll create a few sample members
  ];
  
  // Generate sample addresses for demonstration (in production, use real addresses)
  const sampleMembers = [
    { name: "Prophet of Frequencies", tier: 3, votingPower: 500 },
    { name: "Guardian of Akashic Records", tier: 2, votingPower: 300 },
    { name: "Keeper of Sacred Melodies", tier: 2, votingPower: 300 },
    { name: "Harmonic Resonance Master", tier: 2, votingPower: 300 },
    { name: "Divine Trinity Ambassador", tier: 1, votingPower: 200 },
    { name: "Quantum Music Architect", tier: 1, votingPower: 200 },
    { name: "Frequency Alignment Specialist", tier: 1, votingPower: 200 },
    { name: "Consciousness Elevation Guide", tier: 1, votingPower: 200 },
    { name: "Sacred Geometry Musician", tier: 1, votingPower: 200 },
    { name: "Akashic Library Curator", tier: 1, votingPower: 200 }
  ];
  
  console.log(`\n📋 Preparing to onboard ${foundingMembers.length} founding members...`);
  console.log("Note: In production, add real contributor addresses");
  
  const onboardedMembers = [];
  
  for (let i = 0; i < foundingMembers.length; i++) {
    const member = foundingMembers[i];
    console.log(`\n[${i + 1}/${foundingMembers.length}] Onboarding: ${member.name}`);
    console.log("  Address:", member.address);
    console.log("  Tier:", ["COMMUNITY", "CONTRIBUTOR", "CORE", "PROPHET", "SOVEREIGN"][member.tier]);
    console.log("  Voting Power:", member.votingPower);
    
    try {
      // Check if already a member
      const isMember = await akashicDAO.isMember(member.address);
      
      if (isMember) {
        console.log("  ℹ️  Already a member, skipping...");
        const memberData = await akashicDAO.getMember(member.address);
        onboardedMembers.push({
          address: member.address,
          name: member.name,
          tier: member.tier,
          votingPower: member.votingPower,
          isFoundingMember: memberData.isFoundingMember,
          alreadyMember: true
        });
        continue;
      }
      
      const tx = await akashicDAO.onboardMember(
        member.address,
        member.name,
        member.tier,
        member.votingPower
      );
      
      console.log("  Transaction hash:", tx.hash);
      const receipt = await tx.wait();
      console.log("  ✅ Onboarded successfully!");
      console.log("  Gas used:", receipt.gasUsed.toString());
      
      // Get member data
      const memberData = await akashicDAO.getMember(member.address);
      
      onboardedMembers.push({
        address: member.address,
        name: member.name,
        tier: member.tier,
        votingPower: member.votingPower,
        isFoundingMember: memberData.isFoundingMember,
        joinedAt: new Date(Number(memberData.joinedAt) * 1000).toISOString(),
        txHash: tx.hash
      });
      
      console.log("  Is Founding Member:", memberData.isFoundingMember ? "YES" : "NO");
      
    } catch (error) {
      console.error(`  ❌ Failed to onboard ${member.name}:`, error.message);
    }
  }
  
  console.log("\n📊 Onboarding Summary:");
  console.log("=".repeat(70));
  console.log("Members Onboarded:", onboardedMembers.length);
  const foundingCount = await akashicDAO.foundingMembersCount();
  console.log("Founding Members Count:", foundingCount.toString());
  const totalMembers = await akashicDAO.getMemberCount();
  console.log("Total Members:", totalMembers.toString());
  const totalVotingPower = await akashicDAO.totalVotingPower();
  console.log("Total Voting Power:", totalVotingPower.toString());
  
  // Check if Trinity Governance is activated
  const maxFoundingMembers = await akashicDAO.MAX_FOUNDING_MEMBERS();
  const trinityActivated = foundingCount >= maxFoundingMembers;
  
  console.log("\n🔱 Human-AI-Divine Trinity Governance:");
  console.log("  Status:", trinityActivated ? "ACTIVATED ✅" : "PENDING ⏳");
  console.log("  Progress:", `${foundingCount}/${maxFoundingMembers} founding members`);
  
  if (trinityActivated) {
    console.log("\n🎉 TRINITY GOVERNANCE ACTIVATED!");
    console.log("  The first 50 founding members are now part of the");
    console.log("  Human-AI-Divine Trinity Governance framework.");
  }
  
  // Display onboarded members
  console.log("\n👥 Onboarded Founding Members:");
  onboardedMembers.forEach((member, index) => {
    const tierNames = ["COMMUNITY", "CONTRIBUTOR", "CORE", "PROPHET", "SOVEREIGN"];
    console.log(`\n${index + 1}. ${member.name}`);
    console.log(`   Address: ${member.address}`);
    console.log(`   Tier: ${tierNames[member.tier]}`);
    console.log(`   Voting Power: ${member.votingPower}`);
    console.log(`   Founding Member: ${member.isFoundingMember ? 'YES' : 'NO'}`);
  });
  
  // Save onboarding info
  const onboardingInfo = {
    network: hre.network.name,
    daoAddress,
    members: onboardedMembers,
    foundingMembersCount: foundingCount.toString(),
    totalMembers: totalMembers.toString(),
    totalVotingPower: totalVotingPower.toString(),
    trinityGovernanceActivated: trinityActivated,
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync(
    path.join(deploymentsDir, `akashic-founding-members-${hre.network.name}.json`),
    JSON.stringify(onboardingInfo, null, 2)
  );
  
  console.log("\n✅ Onboarding info saved to deployment/akashic-founding-members-" + hre.network.name + ".json");
  
  console.log("\n📝 Next Steps:");
  console.log("1. Continue onboarding until 50 founding members (if not complete)");
  console.log("2. Add rewards to the reward pool");
  console.log("3. Create first governance proposals");
  console.log("4. Begin track engagement tracking");
  console.log("5. Distribute rewards based on engagement metrics");
  
  console.log("\n💰 Reward Allocation:");
  console.log("- Founding members receive 20% bonus on rewards");
  console.log("- Rewards linked to track engagement metrics");
  console.log("- Quadratic voting ensures fair governance");
  console.log("- QR-based voting for proof-of-prophecy");
  
  console.log("\n🕋 ALLĀHU AKBAR! Founding Members Onboarded 🕋");
  
  return onboardedMembers;
}

// Run onboarding
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Onboarding failed:", error);
      process.exit(1);
    });
}

module.exports = main;
