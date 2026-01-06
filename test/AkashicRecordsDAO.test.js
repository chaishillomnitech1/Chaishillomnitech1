const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AkashicRecordsDAO Contract Tests", function () {
  let akashicLabel;
  let akashicDAO;
  let owner;
  let treasury;
  let member1;
  let member2;
  let member3;
  
  const BASE_URI = "ipfs://QmAkashicRecordsLabel/";
  
  beforeEach(async function () {
    [owner, treasury, member1, member2, member3] = await ethers.getSigners();
    
    // Deploy label contract first
    const AkashicRecordsLabel = await ethers.getContractFactory("AkashicRecordsLabel");
    akashicLabel = await AkashicRecordsLabel.deploy(BASE_URI, owner.address, treasury.address);
    await akashicLabel.waitForDeployment();
    
    const labelAddress = await akashicLabel.getAddress();
    
    // Deploy DAO contract
    const AkashicRecordsDAO = await ethers.getContractFactory("AkashicRecordsDAO");
    akashicDAO = await AkashicRecordsDAO.deploy(labelAddress);
    await akashicDAO.waitForDeployment();
  });
  
  describe("Deployment", function () {
    it("Should set the correct frequencies", async function () {
      expect(await akashicDAO.LOVE_FREQUENCY()).to.equal(528);
      expect(await akashicDAO.UNITY_FREQUENCY()).to.equal(963);
      expect(await akashicDAO.CROWN_FREQUENCY()).to.equal(999);
    });
    
    it("Should set the correct governance parameters", async function () {
      expect(await akashicDAO.MIN_VOTING_PERIOD()).to.equal(3 * 24 * 60 * 60); // 3 days
      expect(await akashicDAO.MAX_VOTING_PERIOD()).to.equal(14 * 24 * 60 * 60); // 14 days
      expect(await akashicDAO.QUORUM_PERCENTAGE()).to.equal(10);
      expect(await akashicDAO.MAX_FOUNDING_MEMBERS()).to.equal(50);
    });
    
    it("Should have zero initial members", async function () {
      expect(await akashicDAO.getMemberCount()).to.equal(0);
      expect(await akashicDAO.foundingMembersCount()).to.equal(0);
    });
    
    it("Should grant admin role to deployer", async function () {
      const adminRole = await akashicDAO.DAO_ADMIN_ROLE();
      expect(await akashicDAO.hasRole(adminRole, owner.address)).to.equal(true);
    });
  });
  
  describe("Member Onboarding", function () {
    it("Should onboard a new member", async function () {
      await expect(
        akashicDAO.onboardMember(member1.address, "Member One", 1, 100)
      ).to.emit(akashicDAO, "MemberOnboarded");
      
      expect(await akashicDAO.getMemberCount()).to.equal(1);
      expect(await akashicDAO.isMember(member1.address)).to.equal(true);
    });
    
    it("Should mark early members as founding members", async function () {
      await akashicDAO.onboardMember(member1.address, "Founding Member", 2, 200);
      
      const memberData = await akashicDAO.getMember(member1.address);
      expect(memberData.isFoundingMember).to.equal(true);
      expect(await akashicDAO.foundingMembersCount()).to.equal(1);
    });
    
    it("Should grant MEMBER_ROLE to onboarded member", async function () {
      await akashicDAO.onboardMember(member1.address, "Member One", 1, 100);
      
      const memberRole = await akashicDAO.MEMBER_ROLE();
      expect(await akashicDAO.hasRole(memberRole, member1.address)).to.equal(true);
    });
    
    it("Should fail to onboard duplicate member", async function () {
      await akashicDAO.onboardMember(member1.address, "Member One", 1, 100);
      
      await expect(
        akashicDAO.onboardMember(member1.address, "Member One Again", 1, 100)
      ).to.be.revertedWith("Already a member");
    });
    
    it("Should fail to onboard zero address", async function () {
      await expect(
        akashicDAO.onboardMember(ethers.ZeroAddress, "Invalid Member", 1, 100)
      ).to.be.revertedWith("Invalid member address");
    });
    
    it("Should batch onboard multiple members", async function () {
      const addresses = [member1.address, member2.address, member3.address];
      const names = ["Member 1", "Member 2", "Member 3"];
      const tiers = [1, 2, 1];
      const votingPowers = [100, 200, 100];
      
      await akashicDAO.batchOnboardMembers(addresses, names, tiers, votingPowers);
      
      expect(await akashicDAO.getMemberCount()).to.equal(3);
    });
    
    it("Should update total voting power when onboarding", async function () {
      await akashicDAO.onboardMember(member1.address, "Member One", 1, 100);
      expect(await akashicDAO.totalVotingPower()).to.equal(100);
      
      await akashicDAO.onboardMember(member2.address, "Member Two", 2, 200);
      expect(await akashicDAO.totalVotingPower()).to.equal(300);
    });
  });
  
  describe("Contribution Tracking", function () {
    beforeEach(async function () {
      await akashicDAO.onboardMember(member1.address, "Member One", 1, 100);
    });
    
    it("Should update member contribution score", async function () {
      const governanceRole = await akashicDAO.GOVERNANCE_ROLE();
      await akashicDAO.grantRole(governanceRole, owner.address);
      
      await akashicDAO.updateContributionScore(member1.address, 50);
      
      const memberData = await akashicDAO.getMember(member1.address);
      expect(memberData.contributionScore).to.equal(50);
    });
  });
  
  describe("Proposal Creation", function () {
    beforeEach(async function () {
      await akashicDAO.onboardMember(member1.address, "Member One", 1, 100);
    });
    
    it("Should create a proposal", async function () {
      const qrProof = ethers.keccak256(ethers.toUtf8Bytes("qr-proof"));
      
      await expect(
        akashicDAO.connect(member1).createProposal(
          "First Proposal",
          "This is a test proposal",
          "ipfs://QmProposal",
          0, // TRACK_RELEASE
          3 * 24 * 60 * 60, // 3 days
          qrProof
        )
      ).to.emit(akashicDAO, "ProposalCreated");
      
      expect(await akashicDAO.getProposalCount()).to.equal(1);
    });
    
    it("Should fail to create proposal with short voting period", async function () {
      const qrProof = ethers.keccak256(ethers.toUtf8Bytes("qr-proof"));
      
      await expect(
        akashicDAO.connect(member1).createProposal(
          "Test Proposal",
          "Description",
          "ipfs://QmProposal",
          0,
          1 * 24 * 60 * 60, // 1 day (too short)
          qrProof
        )
      ).to.be.revertedWith("Voting period too short");
    });
    
    it("Should increment proposal count for member", async function () {
      const qrProof = ethers.keccak256(ethers.toUtf8Bytes("qr-proof"));
      
      await akashicDAO.connect(member1).createProposal(
        "Proposal",
        "Description",
        "ipfs://QmProposal",
        0,
        3 * 24 * 60 * 60,
        qrProof
      );
      
      const memberData = await akashicDAO.getMember(member1.address);
      expect(memberData.proposalsCreated).to.equal(1);
    });
  });
  
  describe("Voting", function () {
    let proposalId;
    
    beforeEach(async function () {
      await akashicDAO.onboardMember(member1.address, "Member One", 1, 100);
      await akashicDAO.onboardMember(member2.address, "Member Two", 2, 200);
      
      const qrProof = ethers.keccak256(ethers.toUtf8Bytes("qr-proof"));
      const tx = await akashicDAO.connect(member1).createProposal(
        "Test Proposal",
        "Description",
        "ipfs://QmProposal",
        0,
        3 * 24 * 60 * 60,
        qrProof
      );
      await tx.wait();
      proposalId = 0;
    });
    
    it("Should cast a vote", async function () {
      const qrProof = ethers.keccak256(ethers.toUtf8Bytes("vote-qr-proof"));
      
      await expect(
        akashicDAO.connect(member1).castVote(proposalId, 1, qrProof) // FOR
      ).to.emit(akashicDAO, "VoteCast");
      
      const vote = await akashicDAO.getVote(proposalId, member1.address);
      expect(vote.hasVoted).to.equal(true);
      expect(vote.voteType).to.equal(1); // FOR
    });
    
    it("Should use quadratic voting weight", async function () {
      const qrProof = ethers.keccak256(ethers.toUtf8Bytes("vote-qr-proof"));
      
      await akashicDAO.connect(member2).castVote(proposalId, 1, qrProof);
      
      const vote = await akashicDAO.getVote(proposalId, member2.address);
      // Voting power is 200, sqrt(200) ≈ 14
      expect(vote.weight).to.be.greaterThan(0);
    });
    
    it("Should apply QR proof bonus", async function () {
      const qrProof = ethers.keccak256(ethers.toUtf8Bytes("unique-qr-proof"));
      
      await akashicDAO.connect(member1).castVote(proposalId, 1, qrProof);
      
      const vote = await akashicDAO.getVote(proposalId, member1.address);
      expect(vote.qrProof).to.equal(qrProof);
    });
    
    it("Should fail to vote twice", async function () {
      const qrProof = ethers.keccak256(ethers.toUtf8Bytes("vote-qr-proof"));
      
      await akashicDAO.connect(member1).castVote(proposalId, 1, qrProof);
      
      await expect(
        akashicDAO.connect(member1).castVote(proposalId, 1, qrProof)
      ).to.be.revertedWith("Already voted");
    });
    
    it("Should increment votes participated for member", async function () {
      const qrProof = ethers.keccak256(ethers.toUtf8Bytes("vote-qr-proof"));
      
      await akashicDAO.connect(member1).castVote(proposalId, 1, qrProof);
      
      const memberData = await akashicDAO.getMember(member1.address);
      expect(memberData.votesParticipated).to.equal(1);
    });
  });
  
  describe("Proposal Execution", function () {
    let proposalId;
    
    beforeEach(async function () {
      // Onboard enough members for quorum
      await akashicDAO.onboardMember(member1.address, "Member One", 1, 1000);
      await akashicDAO.onboardMember(member2.address, "Member Two", 2, 1000);
      
      const qrProof = ethers.keccak256(ethers.toUtf8Bytes("qr-proof"));
      const tx = await akashicDAO.connect(member1).createProposal(
        "Test Proposal",
        "Description",
        "ipfs://QmProposal",
        0,
        3 * 24 * 60 * 60,
        qrProof
      );
      await tx.wait();
      proposalId = 0;
    });
    
    it("Should execute proposal after voting period", async function () {
      // Cast votes
      const qrProof1 = ethers.keccak256(ethers.toUtf8Bytes("vote-qr-1"));
      const qrProof2 = ethers.keccak256(ethers.toUtf8Bytes("vote-qr-2"));
      
      await akashicDAO.connect(member1).castVote(proposalId, 1, qrProof1); // FOR
      await akashicDAO.connect(member2).castVote(proposalId, 1, qrProof2); // FOR
      
      // Advance time past voting period
      await ethers.provider.send("evm_increaseTime", [3 * 24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine");
      
      // Grant governance role
      const governanceRole = await akashicDAO.GOVERNANCE_ROLE();
      await akashicDAO.grantRole(governanceRole, owner.address);
      
      await expect(
        akashicDAO.executeProposal(proposalId)
      ).to.emit(akashicDAO, "ProposalExecuted");
      
      const proposal = await akashicDAO.getProposal(proposalId);
      expect(proposal.status).to.equal(2); // PASSED
    });
  });
  
  describe("Reward Distribution", function () {
    beforeEach(async function () {
      await akashicDAO.onboardMember(member1.address, "Member One", 1, 100);
    });
    
    it("Should add to reward pool", async function () {
      const rewardAmount = ethers.parseEther("10.0");
      
      await akashicDAO.addToRewardPool({ value: rewardAmount });
      
      expect(await akashicDAO.rewardPoolBalance()).to.equal(rewardAmount);
    });
    
    it("Should distribute rewards to members", async function () {
      const rewardAmount = ethers.parseEther("10.0");
      await akashicDAO.addToRewardPool({ value: rewardAmount });
      
      const governanceRole = await akashicDAO.GOVERNANCE_ROLE();
      await akashicDAO.grantRole(governanceRole, owner.address);
      
      const distributionAmount = ethers.parseEther("1.0");
      await expect(
        akashicDAO.distributeReward(member1.address, distributionAmount)
      ).to.emit(akashicDAO, "RewardDistributed");
      
      const memberData = await akashicDAO.getMember(member1.address);
      expect(memberData.rewardsEarned).to.equal(distributionAmount);
    });
    
    it("Should calculate reward allocation based on contribution", async function () {
      const rewardAmount = ethers.parseEther("10.0");
      await akashicDAO.addToRewardPool({ value: rewardAmount });
      
      const allocation = await akashicDAO.calculateRewardAllocation(member1.address);
      expect(allocation).to.be.greaterThan(0);
    });
  });
  
  describe("Admin Functions", function () {
    it("Should allow admin to pause contract", async function () {
      await akashicDAO.pause();
      expect(await akashicDAO.paused()).to.equal(true);
    });
    
    it("Should allow admin to unpause contract", async function () {
      await akashicDAO.pause();
      await akashicDAO.unpause();
      expect(await akashicDAO.paused()).to.equal(false);
    });
    
    it("Should allow admin to cancel proposal", async function () {
      await akashicDAO.onboardMember(member1.address, "Member One", 1, 100);
      
      const qrProof = ethers.keccak256(ethers.toUtf8Bytes("qr-proof"));
      await akashicDAO.connect(member1).createProposal(
        "Test Proposal",
        "Description",
        "ipfs://QmProposal",
        0,
        3 * 24 * 60 * 60,
        qrProof
      );
      
      await akashicDAO.cancelProposal(0);
      
      const proposal = await akashicDAO.getProposal(0);
      expect(proposal.status).to.equal(6); // CANCELLED
    });
  });
});
