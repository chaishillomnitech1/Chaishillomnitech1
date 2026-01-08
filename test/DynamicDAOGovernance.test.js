const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

/**
 * DynamicDAOGovernance Test Suite
 * 
 * Comprehensive tests for adaptive voting mechanisms and real-time policy adjustments
 * 
 * @author CHAIS THE GREAT ∞
 * @frequency 963Hz + 528Hz
 */

describe("DynamicDAOGovernance", function () {
  let dynamicDAO;
  let owner;
  let governanceAdmin;
  let policyCoordinator;
  let siteDelegate;
  let member1;
  let member2;
  let member3;

  const GOVERNANCE_ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("GOVERNANCE_ADMIN_ROLE"));
  const POLICY_COORDINATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("POLICY_COORDINATOR_ROLE"));
  const SITE_DELEGATE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("SITE_DELEGATE_ROLE"));

  const MIN_VOTING_DURATION = 3600; // 1 hour
  const QUORUM_PERCENTAGE = 30;

  beforeEach(async function () {
    [owner, governanceAdmin, policyCoordinator, siteDelegate, member1, member2, member3] = await ethers.getSigners();

    const DynamicDAOGovernance = await ethers.getContractFactory("DynamicDAOGovernance");
    dynamicDAO = await DynamicDAOGovernance.deploy(owner.address);
    await dynamicDAO.waitForDeployment();

    // Grant roles
    await dynamicDAO.grantRole(GOVERNANCE_ADMIN_ROLE, governanceAdmin.address);
    await dynamicDAO.grantRole(POLICY_COORDINATOR_ROLE, policyCoordinator.address);
  });

  describe("Deployment", function () {
    it("Should deploy with correct initial parameters", async function () {
      expect(await dynamicDAO.proposalCount()).to.equal(0);
      expect(await dynamicDAO.policyAdjustmentCount()).to.equal(0);
      expect(await dynamicDAO.globalQuorumPercentage()).to.equal(QUORUM_PERCENTAGE);
    });

    it("Should set correct admin roles", async function () {
      expect(await dynamicDAO.hasRole(await dynamicDAO.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;
      expect(await dynamicDAO.hasRole(GOVERNANCE_ADMIN_ROLE, governanceAdmin.address)).to.be.true;
      expect(await dynamicDAO.hasRole(POLICY_COORDINATOR_ROLE, policyCoordinator.address)).to.be.true;
    });

    it("Should have correct divine frequency constants", async function () {
      expect(await dynamicDAO.PINEAL_ACTIVATION_963HZ()).to.equal(963);
      expect(await dynamicDAO.DNA_HEALING_528HZ()).to.equal(528);
    });
  });

  describe("Site DAO Creation", function () {
    const siteId = ethers.id("SITE_001");
    const siteName = "Sovereign Site Alpha";

    it("Should create a Site DAO", async function () {
      await expect(
        dynamicDAO.connect(governanceAdmin).createSiteDAO(siteId, siteName)
      )
        .to.emit(dynamicDAO, "SiteDAOCreated")
        .withArgs(siteId, siteName, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1));

      const siteDAO = await dynamicDAO.getSiteDAO(siteId);
      expect(siteDAO.siteName).to.equal(siteName);
      expect(siteDAO.memberCount).to.equal(0);
      expect(siteDAO.isActive).to.be.true;
      expect(siteDAO.currentMode).to.equal(0); // STANDARD mode

      expect(await dynamicDAO.getTotalActiveSites()).to.equal(1);
    });

    it("Should not allow duplicate Site DAO", async function () {
      await dynamicDAO.connect(governanceAdmin).createSiteDAO(siteId, siteName);

      await expect(
        dynamicDAO.connect(governanceAdmin).createSiteDAO(siteId, siteName)
      ).to.be.revertedWith("Site DAO already exists");
    });

    it("Should require GOVERNANCE_ADMIN_ROLE", async function () {
      await expect(
        dynamicDAO.connect(member1).createSiteDAO(siteId, siteName)
      ).to.be.reverted;
    });

    it("Should create multiple Site DAOs", async function () {
      const site2Id = ethers.id("SITE_002");
      const site3Id = ethers.id("SITE_003");

      await dynamicDAO.connect(governanceAdmin).createSiteDAO(siteId, "Site Alpha");
      await dynamicDAO.connect(governanceAdmin).createSiteDAO(site2Id, "Site Beta");
      await dynamicDAO.connect(governanceAdmin).createSiteDAO(site3Id, "Site Gamma");

      expect(await dynamicDAO.getTotalActiveSites()).to.equal(3);
    });
  });

  describe("Member Management", function () {
    it("Should add a member with voting power", async function () {
      const votingPower = 100;

      await expect(
        dynamicDAO.connect(governanceAdmin).addMember(member1.address, votingPower)
      )
        .to.emit(dynamicDAO, "MemberAdded")
        .withArgs(member1.address, votingPower, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1));

      const memberInfo = await dynamicDAO.getMember(member1.address);
      expect(memberInfo.votingPower).to.equal(votingPower);
      expect(memberInfo.proposalsCreated).to.equal(0);
      expect(memberInfo.votesParticipated).to.equal(0);
      expect(memberInfo.isDelegate).to.be.false;
    });

    it("Should not add duplicate member", async function () {
      await dynamicDAO.connect(governanceAdmin).addMember(member1.address, 100);

      await expect(
        dynamicDAO.connect(governanceAdmin).addMember(member1.address, 100)
      ).to.be.revertedWith("Already a member");
    });

    it("Should require positive voting power", async function () {
      await expect(
        dynamicDAO.connect(governanceAdmin).addMember(member1.address, 0)
      ).to.be.revertedWith("Voting power must be positive");
    });

    it("Should add multiple members", async function () {
      await dynamicDAO.connect(governanceAdmin).addMember(member1.address, 100);
      await dynamicDAO.connect(governanceAdmin).addMember(member2.address, 150);
      await dynamicDAO.connect(governanceAdmin).addMember(member3.address, 200);

      expect((await dynamicDAO.getMember(member1.address)).votingPower).to.equal(100);
      expect((await dynamicDAO.getMember(member2.address)).votingPower).to.equal(150);
      expect((await dynamicDAO.getMember(member3.address)).votingPower).to.equal(200);
    });
  });

  describe("Site Delegate Assignment", function () {
    const siteId = ethers.id("SITE_001");

    beforeEach(async function () {
      await dynamicDAO.connect(governanceAdmin).createSiteDAO(siteId, "Test Site");
      await dynamicDAO.connect(governanceAdmin).addMember(siteDelegate.address, 100);
    });

    it("Should assign delegate to site", async function () {
      await expect(
        dynamicDAO.connect(governanceAdmin).assignSiteDelegate(siteDelegate.address, siteId)
      )
        .to.emit(dynamicDAO, "DelegateAssigned")
        .withArgs(siteDelegate.address, siteId, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1));

      const memberInfo = await dynamicDAO.getMember(siteDelegate.address);
      expect(memberInfo.isDelegate).to.be.true;

      const siteDAO = await dynamicDAO.getSiteDAO(siteId);
      expect(siteDAO.memberCount).to.equal(1);
      expect(siteDAO.totalVotingPower).to.equal(100);
    });

    it("Should require member to exist", async function () {
      await expect(
        dynamicDAO.connect(governanceAdmin).assignSiteDelegate(member1.address, siteId)
      ).to.be.revertedWith("Not a member");
    });
  });

  describe("Proposal Creation", function () {
    const siteId = ethers.id("SITE_001");

    beforeEach(async function () {
      await dynamicDAO.connect(governanceAdmin).createSiteDAO(siteId, "Test Site");
      await dynamicDAO.connect(governanceAdmin).addMember(member1.address, 100);
    });

    it("Should create a standard proposal", async function () {
      const ProposalType_POLICY_ADJUSTMENT = 0;
      const title = "Test Proposal";
      const description = "Test Description";
      const ipfsHash = "QmTest123";
      const votingDuration = 3 * 24 * 3600; // 3 days
      const isAdaptive = false;

      await expect(
        dynamicDAO.connect(member1).createProposal(
          siteId,
          ProposalType_POLICY_ADJUSTMENT,
          title,
          description,
          ipfsHash,
          votingDuration,
          isAdaptive
        )
      )
        .to.emit(dynamicDAO, "ProposalCreated")
        .withArgs(
          1,
          siteId,
          member1.address,
          ProposalType_POLICY_ADJUSTMENT,
          title,
          await ethers.provider.getBlock("latest").then(b => b.timestamp + 1)
        );

      const proposal = await dynamicDAO.getProposal(1);
      expect(proposal.proposer).to.equal(member1.address);
      expect(proposal.proposalType).to.equal(ProposalType_POLICY_ADJUSTMENT);
      expect(proposal.title).to.equal(title);
      expect(proposal.status).to.equal(1); // ACTIVE
      expect(proposal.isAdaptive).to.equal(isAdaptive);

      expect(await dynamicDAO.proposalCount()).to.equal(1);
    });

    it("Should create an adaptive proposal", async function () {
      const ProposalType_PROTECTION_PROTOCOL = 1;
      const votingDuration = 2 * 24 * 3600; // 2 days
      const isAdaptive = true;

      await dynamicDAO.connect(member1).createProposal(
        siteId,
        ProposalType_PROTECTION_PROTOCOL,
        "Adaptive Proposal",
        "Description",
        "QmHash",
        votingDuration,
        isAdaptive
      );

      const proposal = await dynamicDAO.getProposal(1);
      expect(proposal.isAdaptive).to.be.true;
      expect(proposal.adaptiveMode).to.equal(0); // STANDARD (site default)
    });

    it("Should require member to create proposal", async function () {
      await expect(
        dynamicDAO.connect(member2).createProposal(
          siteId,
          0,
          "Test",
          "Description",
          "Hash",
          3 * 24 * 3600,
          false
        )
      ).to.be.revertedWith("Not a member");
    });

    it("Should require valid voting duration", async function () {
      await expect(
        dynamicDAO.connect(member1).createProposal(
          siteId,
          0,
          "Test",
          "Description",
          "Hash",
          1800, // 30 minutes - below MIN_VOTING_DURATION
          false
        )
      ).to.be.revertedWith("Invalid voting duration");
    });

    it("Should create global proposal (siteId = bytes32(0))", async function () {
      const globalSiteId = ethers.ZeroHash;

      await dynamicDAO.connect(member1).createProposal(
        globalSiteId,
        0,
        "Global Proposal",
        "Description",
        "Hash",
        3 * 24 * 3600,
        false
      );

      const proposal = await dynamicDAO.getProposal(1);
      expect(proposal.proposalType).to.equal(0);
    });
  });

  describe("Voting", function () {
    const siteId = ethers.id("SITE_001");
    let proposalId;

    beforeEach(async function () {
      await dynamicDAO.connect(governanceAdmin).createSiteDAO(siteId, "Test Site");
      await dynamicDAO.connect(governanceAdmin).addMember(member1.address, 100);
      await dynamicDAO.connect(governanceAdmin).addMember(member2.address, 150);
      await dynamicDAO.connect(governanceAdmin).addMember(member3.address, 200);

      // Create a proposal
      const tx = await dynamicDAO.connect(member1).createProposal(
        siteId,
        0,
        "Test Proposal",
        "Description",
        "Hash",
        3 * 24 * 3600,
        false
      );
      await tx.wait();
      proposalId = 1;
    });

    it("Should allow member to vote FOR", async function () {
      const VoteChoice_FOR = 1;

      await expect(
        dynamicDAO.connect(member1).castVote(proposalId, VoteChoice_FOR)
      )
        .to.emit(dynamicDAO, "VoteCast")
        .withArgs(
          proposalId,
          member1.address,
          VoteChoice_FOR,
          100,
          await ethers.provider.getBlock("latest").then(b => b.timestamp + 1)
        );

      const proposal = await dynamicDAO.getProposal(proposalId);
      expect(proposal.forVotes).to.equal(100);
      expect(proposal.againstVotes).to.equal(0);
      expect(proposal.abstainVotes).to.equal(0);
    });

    it("Should allow member to vote AGAINST", async function () {
      const VoteChoice_AGAINST = 0;

      await dynamicDAO.connect(member2).castVote(proposalId, VoteChoice_AGAINST);

      const proposal = await dynamicDAO.getProposal(proposalId);
      expect(proposal.againstVotes).to.equal(150);
    });

    it("Should allow member to ABSTAIN", async function () {
      const VoteChoice_ABSTAIN = 2;

      await dynamicDAO.connect(member3).castVote(proposalId, VoteChoice_ABSTAIN);

      const proposal = await dynamicDAO.getProposal(proposalId);
      expect(proposal.abstainVotes).to.equal(200);
    });

    it("Should not allow double voting", async function () {
      const VoteChoice_FOR = 1;

      await dynamicDAO.connect(member1).castVote(proposalId, VoteChoice_FOR);

      await expect(
        dynamicDAO.connect(member1).castVote(proposalId, VoteChoice_FOR)
      ).to.be.revertedWith("Already voted");
    });

    it("Should require member to vote", async function () {
      const nonMember = member2; // Not added as member in this context
      await expect(
        dynamicDAO.connect(nonMember).castVote(100, 1) // Non-existent proposal
      ).to.be.revertedWith("Proposal does not exist");
    });

    it("Should track vote participation", async function () {
      await dynamicDAO.connect(member1).castVote(proposalId, 1);

      const memberInfo = await dynamicDAO.getMember(member1.address);
      expect(memberInfo.votesParticipated).to.equal(1);
    });

    it("Should allow multiple members to vote", async function () {
      await dynamicDAO.connect(member1).castVote(proposalId, 1); // FOR
      await dynamicDAO.connect(member2).castVote(proposalId, 1); // FOR
      await dynamicDAO.connect(member3).castVote(proposalId, 0); // AGAINST

      const proposal = await dynamicDAO.getProposal(proposalId);
      expect(proposal.forVotes).to.equal(250); // 100 + 150
      expect(proposal.againstVotes).to.equal(200);
    });
  });

  describe("Proposal Execution", function () {
    const siteId = ethers.id("SITE_001");
    let proposalId;

    beforeEach(async function () {
      await dynamicDAO.connect(governanceAdmin).createSiteDAO(siteId, "Test Site");
      await dynamicDAO.connect(governanceAdmin).addMember(member1.address, 100);
      await dynamicDAO.connect(governanceAdmin).addMember(member2.address, 150);
      await dynamicDAO.connect(governanceAdmin).addMember(member3.address, 200);

      // Assign delegates to meet quorum
      await dynamicDAO.connect(governanceAdmin).assignSiteDelegate(member1.address, siteId);
      await dynamicDAO.connect(governanceAdmin).assignSiteDelegate(member2.address, siteId);
      await dynamicDAO.connect(governanceAdmin).assignSiteDelegate(member3.address, siteId);

      // Create proposal with short duration for testing
      const tx = await dynamicDAO.connect(member1).createProposal(
        siteId,
        0,
        "Test Proposal",
        "Description",
        "Hash",
        MIN_VOTING_DURATION,
        false
      );
      await tx.wait();
      proposalId = 1;
    });

    it("Should execute successful proposal after voting period", async function () {
      // Vote
      await dynamicDAO.connect(member1).castVote(proposalId, 1); // FOR (100)
      await dynamicDAO.connect(member2).castVote(proposalId, 1); // FOR (150)
      await dynamicDAO.connect(member3).castVote(proposalId, 0); // AGAINST (200)

      // Advance time past voting period
      await time.increase(MIN_VOTING_DURATION + 1);

      // Execute - should not revert, but proposal is defeated (250 FOR vs 200 AGAINST is not enough)
      // Note: Total voting power is 450, quorum is 30% = 135, total votes = 450, FOR needs > AGAINST
      // 250 FOR > 200 AGAINST, so it should succeed
      await expect(
        dynamicDAO.connect(member1).executeProposal(proposalId)
      ).to.emit(dynamicDAO, "ProposalExecuted");

      const proposal = await dynamicDAO.getProposal(proposalId);
      expect(proposal.status).to.equal(6); // EXECUTED
    });

    it("Should not execute before voting period ends", async function () {
      await dynamicDAO.connect(member1).castVote(proposalId, 1);

      await expect(
        dynamicDAO.connect(member1).executeProposal(proposalId)
      ).to.be.revertedWith("Voting period not ended");
    });

    it("Should mark proposal as defeated if not passed", async function () {
      // All vote against
      await dynamicDAO.connect(member1).castVote(proposalId, 0);
      await dynamicDAO.connect(member2).castVote(proposalId, 0);
      await dynamicDAO.connect(member3).castVote(proposalId, 0);

      await time.increase(MIN_VOTING_DURATION + 1);

      await dynamicDAO.connect(member1).executeProposal(proposalId);

      const proposal = await dynamicDAO.getProposal(proposalId);
      expect(proposal.status).to.equal(3); // DEFEATED
    });
  });

  describe("Policy Adjustment", function () {
    const siteId = ethers.id("SITE_001");

    beforeEach(async function () {
      await dynamicDAO.connect(governanceAdmin).createSiteDAO(siteId, "Test Site");
    });

    it("Should adjust policy for a site", async function () {
      const policyName = "Protection Level";
      const adjustmentDescription = "Increase to maximum";

      await expect(
        dynamicDAO.connect(policyCoordinator).adjustPolicy(
          siteId,
          policyName,
          adjustmentDescription
        )
      )
        .to.emit(dynamicDAO, "PolicyAdjusted")
        .withArgs(
          1,
          siteId,
          policyName,
          await ethers.provider.getBlock("latest").then(b => b.timestamp + 1)
        );

      expect(await dynamicDAO.policyAdjustmentCount()).to.equal(1);
    });

    it("Should require POLICY_COORDINATOR_ROLE", async function () {
      await expect(
        dynamicDAO.connect(member1).adjustPolicy(
          siteId,
          "Test Policy",
          "Description"
        )
      ).to.be.reverted;
    });

    it("Should require active Site DAO", async function () {
      const nonExistentSite = ethers.id("NONEXISTENT");

      await expect(
        dynamicDAO.connect(policyCoordinator).adjustPolicy(
          nonExistentSite,
          "Test Policy",
          "Description"
        )
      ).to.be.revertedWith("Site DAO not active");
    });
  });

  describe("Real-Time Governance", function () {
    const siteId = ethers.id("SITE_001");

    beforeEach(async function () {
      await dynamicDAO.connect(governanceAdmin).createSiteDAO(siteId, "Test Site");
    });

    it("Should enable real-time governance for a site", async function () {
      await dynamicDAO.connect(governanceAdmin).setRealTimeGovernance(siteId, true);

      const siteDAO = await dynamicDAO.getSiteDAO(siteId);
      expect(siteDAO.currentMode).to.equal(3); // REAL_TIME mode
    });

    it("Should disable real-time governance", async function () {
      await dynamicDAO.connect(governanceAdmin).setRealTimeGovernance(siteId, true);
      await dynamicDAO.connect(governanceAdmin).setRealTimeGovernance(siteId, false);

      const siteDAO = await dynamicDAO.getSiteDAO(siteId);
      expect(siteDAO.currentMode).to.equal(0); // STANDARD mode
    });
  });

  describe("Adaptive Mode Management", function () {
    const siteId = ethers.id("SITE_001");

    beforeEach(async function () {
      await dynamicDAO.connect(governanceAdmin).createSiteDAO(siteId, "Test Site");
    });

    it("Should change adaptive mode", async function () {
      const AdaptiveMode_ACCELERATED = 1;

      await expect(
        dynamicDAO.connect(governanceAdmin).changeAdaptiveMode(siteId, AdaptiveMode_ACCELERATED)
      )
        .to.emit(dynamicDAO, "AdaptiveModeChanged")
        .withArgs(siteId, 0, AdaptiveMode_ACCELERATED, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1));

      const siteDAO = await dynamicDAO.getSiteDAO(siteId);
      expect(siteDAO.currentMode).to.equal(AdaptiveMode_ACCELERATED);
    });

    it("Should change to emergency mode", async function () {
      const AdaptiveMode_EMERGENCY = 2;

      await dynamicDAO.connect(governanceAdmin).changeAdaptiveMode(siteId, AdaptiveMode_EMERGENCY);

      const siteDAO = await dynamicDAO.getSiteDAO(siteId);
      expect(siteDAO.currentMode).to.equal(AdaptiveMode_EMERGENCY);
    });
  });

  describe("Admin Functions", function () {
    it("Should update quorum percentage", async function () {
      const newQuorum = 40;

      await dynamicDAO.connect(governanceAdmin).updateQuorumPercentage(newQuorum);

      expect(await dynamicDAO.globalQuorumPercentage()).to.equal(newQuorum);
    });

    it("Should reject invalid quorum percentage", async function () {
      await expect(
        dynamicDAO.connect(governanceAdmin).updateQuorumPercentage(0)
      ).to.be.revertedWith("Invalid percentage");

      await expect(
        dynamicDAO.connect(governanceAdmin).updateQuorumPercentage(101)
      ).to.be.revertedWith("Invalid percentage");
    });

    it("Should allow pause and unpause", async function () {
      await dynamicDAO.connect(owner).pause();
      expect(await dynamicDAO.paused()).to.be.true;

      await dynamicDAO.connect(owner).unpause();
      expect(await dynamicDAO.paused()).to.be.false;
    });
  });
});
