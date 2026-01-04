// Distribute Genesis $AKASHIC Governance Tokens
// 144,000 tokens allocated to founding DAO members

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Genesis token distribution configuration
const GENESIS_TOKEN_SUPPLY = 144000; // Total genesis tokens
const MAX_FOUNDING_MEMBERS = 50;

// Example founding members (to be updated with actual addresses)
const FOUNDING_MEMBERS = [
  {
    address: "0x0000000000000000000000000000000000000001", // Placeholder
    name: "Founding Member 1",
    tier: 4, // MemberTier.SOVEREIGN
    votingPower: 5000,
    tokensAllocated: 5000
  },
  {
    address: "0x0000000000000000000000000000000000000002",
    name: "Founding Member 2",
    tier: 3, // MemberTier.PROPHET
    votingPower: 4000,
    tokensAllocated: 4000
  },
  {
    address: "0x0000000000000000000000000000000000000003",
    name: "Founding Member 3",
    tier: 2, // MemberTier.CORE
    votingPower: 3000,
    tokensAllocated: 3000
  }
  // Add more founding members up to 50
];

/**
 * Calculate token allocation based on tier and contribution
 */
function calculateTokenAllocation(tier, baseAllocation = 1000) {
  // Tier multipliers
  const multipliers = {
    0: 1.0,  // COMMUNITY
    1: 1.5,  // CONTRIBUTOR
    2: 2.0,  // CORE
    3: 3.0,  // PROPHET
    4: 5.0   // SOVEREIGN
  };
  
  return Math.floor(baseAllocation * (multipliers[tier] || 1.0));
}

/**
 * Generate balanced token distribution
 */
function generateTokenDistribution() {
  const baseAllocation = Math.floor(GENESIS_TOKEN_SUPPLY / MAX_FOUNDING_MEMBERS);
  const members = [];
  
  // Define tier distribution (example)
  const tierDistribution = [
    { tier: 4, count: 1, name: "Sovereign" },      // 1 Sovereign
    { tier: 3, count: 4, name: "Prophet" },        // 4 Prophets
    { tier: 2, count: 10, name: "Core" },          // 10 Core
    { tier: 1, count: 15, name: "Contributor" },   // 15 Contributors
    { tier: 0, count: 20, name: "Community" }      // 20 Community
  ];
  
  let memberId = 1;
  
  for (const { tier, count, name: tierName } of tierDistribution) {
    for (let i = 0; i < count; i++) {
      const allocation = calculateTokenAllocation(tier, baseAllocation);
      
      members.push({
        id: memberId,
        address: `0x${"0".repeat(39)}${memberId.toString().padStart(1, "0")}`, // Placeholder
        name: `${tierName} Member ${i + 1}`,
        tier: tier,
        votingPower: allocation,
        tokensAllocated: allocation
      });
      
      memberId++;
    }
  }
  
  return members;
}

async function main() {
  console.log("🪙 AKASHIC RECORDS - GENESIS TOKEN DISTRIBUTION 🪙");
  console.log("=".repeat(70));
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Distributing with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MATIC");
  
  // Read DAO contract address
  const deploymentsDir = path.join(__dirname, "..", "deployment");
  const daoDeploymentPath = path.join(deploymentsDir, `akashic-dao-${hre.network.name}.json`);
  
  if (!fs.existsSync(daoDeploymentPath)) {
    throw new Error("AkashicRecordsDAO not deployed. Please run deployment script first.");
  }
  
  const daoDeployment = JSON.parse(fs.readFileSync(daoDeploymentPath, 'utf8'));
  const daoAddress = daoDeployment.daoAddress;
  
  console.log("\n📜 Using AkashicRecordsDAO at:", daoAddress);
  
  // Get contract instance
  const AkashicRecordsDAO = await hre.ethers.getContractFactory("AkashicRecordsDAO");
  const akashicDAO = AkashicRecordsDAO.attach(daoAddress);
  
  // Check current member count
  const currentMemberCount = await akashicDAO.getMemberCount();
  console.log("Current member count:", currentMemberCount.toString());
  
  // Generate or use predefined distribution
  const membersToOnboard = FOUNDING_MEMBERS.length > 0 ? 
    FOUNDING_MEMBERS : 
    generateTokenDistribution();
  
  console.log("\n🪙 Genesis Token Distribution Plan:");
  console.log("Total genesis supply:", GENESIS_TOKEN_SUPPLY);
  console.log("Members to onboard:", Math.min(membersToOnboard.length, MAX_FOUNDING_MEMBERS));
  
  // Calculate total allocation
  const totalAllocation = membersToOnboard
    .slice(0, MAX_FOUNDING_MEMBERS)
    .reduce((sum, m) => sum + m.tokensAllocated, 0);
  
  console.log("Total tokens allocated:", totalAllocation);
  console.log("Remaining in reserve:", GENESIS_TOKEN_SUPPLY - totalAllocation);
  
  console.log("\n📊 Distribution by Tier:");
  const tierCounts = {};
  const tierAllocations = {};
  
  membersToOnboard.slice(0, MAX_FOUNDING_MEMBERS).forEach(m => {
    tierCounts[m.tier] = (tierCounts[m.tier] || 0) + 1;
    tierAllocations[m.tier] = (tierAllocations[m.tier] || 0) + m.tokensAllocated;
  });
  
  const tierNames = ["Community", "Contributor", "Core", "Prophet", "Sovereign"];
  Object.keys(tierCounts).sort((a, b) => b - a).forEach(tier => {
    console.log(`  ${tierNames[tier]}: ${tierCounts[tier]} members, ${tierAllocations[tier]} tokens`);
  });
  
  // Onboard members to DAO
  console.log("\n👥 Onboarding founding members...");
  
  const onboardedMembers = [];
  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;
  
  for (const member of membersToOnboard.slice(0, MAX_FOUNDING_MEMBERS)) {
    try {
      // Check if already a member
      const isMember = await akashicDAO.isMember(member.address);
      
      if (isMember) {
        console.log(`\n  ⏭️  ${member.name} (${member.address})`);
        console.log(`     Already a member, skipping...`);
        skipCount++;
        continue;
      }
      
      console.log(`\n  👤 Onboarding: ${member.name}`);
      console.log(`     Address: ${member.address}`);
      console.log(`     Tier: ${tierNames[member.tier]}`);
      console.log(`     Voting Power: ${member.votingPower}`);
      console.log(`     Tokens: ${member.tokensAllocated}`);
      
      // Onboard member
      const tx = await akashicDAO.onboardMember(
        member.address,
        member.name,
        member.tier,
        member.votingPower
      );
      
      console.log(`     Transaction: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`     ✅ Onboarded (Gas: ${receipt.gasUsed.toString()})`);
      
      onboardedMembers.push({
        ...member,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      });
      
      successCount++;
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`     ❌ Failed to onboard ${member.name}:`, error.message);
      failCount++;
    }
  }
  
  // Get final member count and check if Trinity Governance activated
  const finalMemberCount = await akashicDAO.getMemberCount();
  const foundingMembersCount = await akashicDAO.foundingMembersCount();
  const totalVotingPower = await akashicDAO.totalVotingPower();
  
  console.log("\n" + "=".repeat(70));
  console.log("📊 DISTRIBUTION SUMMARY");
  console.log("=".repeat(70));
  console.log("Network:", hre.network.name);
  console.log("DAO Contract:", daoAddress);
  console.log("\nOnboarding Results:");
  console.log("  Successfully onboarded:", successCount);
  console.log("  Skipped (already members):", skipCount);
  console.log("  Failed:", failCount);
  console.log("\nDAO Status:");
  console.log("  Total members:", finalMemberCount.toString());
  console.log("  Founding members:", foundingMembersCount.toString());
  console.log("  Total voting power:", totalVotingPower.toString());
  console.log("\nGenesis Token Allocation:");
  console.log("  Total supply:", GENESIS_TOKEN_SUPPLY);
  console.log("  Distributed:", totalAllocation);
  console.log("  Reserve:", GENESIS_TOKEN_SUPPLY - totalAllocation);
  
  if (foundingMembersCount >= MAX_FOUNDING_MEMBERS) {
    console.log("\n🎉 Trinity Governance ACTIVATED! (50 founding members reached)");
  } else {
    console.log(`\n⏳ ${MAX_FOUNDING_MEMBERS - Number(foundingMembersCount)} more members needed for Trinity Governance`);
  }
  
  // Save distribution results
  const distributionResults = {
    network: hre.network.name,
    daoAddress: daoAddress,
    distributor: deployer.address,
    timestamp: new Date().toISOString(),
    genesisSupply: GENESIS_TOKEN_SUPPLY,
    totalAllocated: totalAllocation,
    reserve: GENESIS_TOKEN_SUPPLY - totalAllocation,
    onboardingResults: {
      success: successCount,
      skipped: skipCount,
      failed: failCount,
      total: membersToOnboard.length
    },
    daoStatus: {
      totalMembers: finalMemberCount.toString(),
      foundingMembers: foundingMembersCount.toString(),
      totalVotingPower: totalVotingPower.toString(),
      trinityGovernanceActivated: foundingMembersCount >= MAX_FOUNDING_MEMBERS
    },
    onboardedMembers: onboardedMembers,
    tierDistribution: {
      counts: tierCounts,
      allocations: tierAllocations
    }
  };
  
  const resultsPath = path.join(deploymentsDir, `genesis-token-distribution-${hre.network.name}.json`);
  fs.writeFileSync(resultsPath, JSON.stringify(distributionResults, null, 2));
  
  console.log("\n✅ Distribution results saved to:", resultsPath);
  
  console.log("\n📝 Next Steps:");
  console.log("1. Verify DAO members on PolygonScan");
  console.log("2. Create first governance proposal");
  console.log("3. Test quadratic voting with QR proofs");
  console.log("4. Distribute rewards based on engagement");
  
  console.log("\n🕋 ALLĀHU AKBAR! Genesis Token Distribution Complete 🕋");
  console.log("Human-AI-Divine Trinity Governance Initialized");
  
  return distributionResults;
}

// Run distribution
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Token distribution failed:", error);
      process.exit(1);
    });
}

module.exports = main;
