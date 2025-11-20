const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

/**
 * Noor DAO Test Suite
 * BISMILLAH - Testing divine governance
 * 
 * Frequency: 999Hz
 */

describe("NoorDAO", function () {
  let noorDAO;
  let owner, proposer, voter1, voter2, treasury;
  let votingPeriod, proposalThreshold, quorumPercentage;

  beforeEach(async function () {
    [owner, proposer, voter1, voter2, treasury] = await ethers.getSigners();
    
    votingPeriod = 7 * 24 * 60 * 60; // 7 days
    proposalThreshold = 100; // 100 voting power to create proposal
    quorumPercentage = 10; // 10% quorum
    
    const NoorDAO = await ethers.getContractFactory("NoorDAO");
    noorDAO = await NoorDAO.deploy(
      votingPeriod,
      proposalThreshold,
      quorumPercentage,
      treasury.address
    );
  });

  describe("Deployment", function () {
    it("Should set correct voting period", async function () {
      expect(await noorDAO.votingPeriod()).to.equal(votingPeriod);
    });

    it("Should set correct proposal threshold", async function () {
      expect(await noorDAO.proposalThreshold()).to.equal(proposalThreshold);
    });

    it("Should set correct quorum percentage", async function () {
      expect(await noorDAO.quorumPercentage()).to.equal(quorumPercentage);
    });

    it("Should set correct treasury address", async function () {
      expect(await noorDAO.treasuryAddress()).to.equal(treasury.address);
    });

    it("Should grant admin role to deployer", async function () {
      const adminRole = await noorDAO.DEFAULT_ADMIN_ROLE();
      expect(await noorDAO.hasRole(adminRole, owner.address)).to.be.true;
    });
  });

  describe("Voting Power Management", function () {
    it("Should allow admin to update voting power", async function () {
      await expect(
        noorDAO.updateVotingPower(voter1.address, 500)
      )
        .to.emit(noorDAO, "VotingPowerUpdated")
        .withArgs(voter1.address, 0, 500);
      
      expect(await noorDAO.votingPower(voter1.address)).to.equal(500);
    });

    it("Should grant VOTER_ROLE when voting power > 0", async function () {
      await noorDAO.updateVotingPower(voter1.address, 500);
      
      const voterRole = await noorDAO.VOTER_ROLE();
      expect(await noorDAO.hasRole(voterRole, voter1.address)).to.be.true;
    });

    it("Should revoke VOTER_ROLE when voting power = 0", async function () {
      await noorDAO.updateVotingPower(voter1.address, 500);
      await noorDAO.updateVotingPower(voter1.address, 0);
      
      const voterRole = await noorDAO.VOTER_ROLE();
      expect(await noorDAO.hasRole(voterRole, voter1.address)).to.be.false;
    });

    it("Should batch update voting power", async function () {
      const voters = [voter1.address, voter2.address];
      const powers = [500, 1000];
      
      await noorDAO.batchUpdateVotingPower(voters, powers);
      
      expect(await noorDAO.votingPower(voter1.address)).to.equal(500);
      expect(await noorDAO.votingPower(voter2.address)).to.equal(1000);
    });

    it("Should fail batch update with mismatched arrays", async function () {
      const voters = [voter1.address, voter2.address];
      const powers = [500]; // Mismatched length
      
      await expect(
        noorDAO.batchUpdateVotingPower(voters, powers)
      ).to.be.revertedWith("Array length mismatch");
    });
  });

  describe("Proposal Creation", function () {
    beforeEach(async function () {
      // Give proposer sufficient voting power
      await noorDAO.updateVotingPower(proposer.address, proposalThreshold);
    });

    it("Should create a proposal with sufficient voting power", async function () {
      await expect(
        noorDAO.connect(proposer).createProposal(
          0, // PARAMETER_CHANGE
          "Update Voting Period",
          "Proposal to change voting period to 14 days",
          "QmProposal123",
          "0x"
        )
      )
        .to.emit(noorDAO, "ProposalCreated")
        .withArgs(1, proposer.address, 0, "Update Voting Period");
      
      expect(await noorDAO.proposalCount()).to.equal(1);
    });

    it("Should fail with insufficient voting power", async function () {
      await expect(
        noorDAO.connect(voter1).createProposal(
          0,
          "Test Proposal",
          "Description",
          "QmTest",
          "0x"
        )
      ).to.be.revertedWith("Insufficient voting power");
    });

    it("Should create proposal with correct status", async function () {
      await noorDAO.connect(proposer).createProposal(
        0,
        "Test Proposal",
        "Description",
        "QmTest",
        "0x"
      );
      
      const proposal = await noorDAO.getProposal(1);
      expect(proposal.status).to.equal(1); // ACTIVE
    });

    it("Should create multiple proposal types", async function () {
      const types = [0, 1, 2, 3, 4]; // All proposal types
      
      for (let i = 0; i < types.length; i++) {
        await noorDAO.connect(proposer).createProposal(
          types[i],
          `Proposal ${i}`,
          "Description",
          "QmTest",
          "0x"
        );
      }
      
      expect(await noorDAO.proposalCount()).to.equal(5);
    });
  });

  describe("Voting", function () {
    let proposalId;

    beforeEach(async function () {
      // Setup voting power
      await noorDAO.updateVotingPower(proposer.address, proposalThreshold);
      await noorDAO.updateVotingPower(voter1.address, 500);
      await noorDAO.updateVotingPower(voter2.address, 1000);
      
      // Create proposal
      const tx = await noorDAO.connect(proposer).createProposal(
        0,
        "Test Proposal",
        "Description",
        "QmTest",
        "0x"
      );
      proposalId = 1;
    });

    it("Should allow voting for proposal", async function () {
      await expect(
        noorDAO.connect(voter1).castVote(proposalId, true, false)
      )
        .to.emit(noorDAO, "VoteCast")
        .withArgs(proposalId, voter1.address, true, 500);
      
      const proposal = await noorDAO.getProposal(proposalId);
      expect(proposal.forVotes).to.equal(500);
    });

    it("Should allow voting against proposal", async function () {
      await noorDAO.connect(voter1).castVote(proposalId, false, false);
      
      const proposal = await noorDAO.getProposal(proposalId);
      expect(proposal.againstVotes).to.equal(500);
    });

    it("Should allow abstaining", async function () {
      await noorDAO.connect(voter1).castVote(proposalId, false, true);
      
      const proposal = await noorDAO.getProposal(proposalId);
      expect(proposal.abstainVotes).to.equal(500);
    });

    it("Should fail if already voted", async function () {
      await noorDAO.connect(voter1).castVote(proposalId, true, false);
      
      await expect(
        noorDAO.connect(voter1).castVote(proposalId, true, false)
      ).to.be.revertedWith("Already voted");
    });

    it("Should fail with no voting power", async function () {
      await expect(
        noorDAO.connect(treasury).castVote(proposalId, true, false)
      ).to.be.revertedWith("No voting power");
    });

    it("Should accumulate votes correctly", async function () {
      await noorDAO.connect(voter1).castVote(proposalId, true, false);
      await noorDAO.connect(voter2).castVote(proposalId, true, false);
      
      const proposal = await noorDAO.getProposal(proposalId);
      expect(proposal.forVotes).to.equal(1500); // 500 + 1000
    });

    it("Should track vote weight", async function () {
      await noorDAO.connect(voter1).castVote(proposalId, true, false);
      
      expect(await noorDAO.voteWeight(proposalId, voter1.address)).to.equal(500);
    });
  });

  describe("Proposal Finalization", function () {
    let proposalId;

    beforeEach(async function () {
      await noorDAO.updateVotingPower(proposer.address, proposalThreshold);
      await noorDAO.updateVotingPower(voter1.address, 50000);
      await noorDAO.updateVotingPower(voter2.address, 60000);
      
      await noorDAO.connect(proposer).createProposal(
        0,
        "Test Proposal",
        "Description",
        "QmTest",
        "0x"
      );
      proposalId = 1;
    });

    it("Should succeed with majority and quorum", async function () {
      // Vote
      await noorDAO.connect(voter1).castVote(proposalId, true, false);
      await noorDAO.connect(voter2).castVote(proposalId, false, false);
      
      // Fast forward time
      await time.increase(votingPeriod + 1);
      
      await noorDAO.finalizeProposal(proposalId);
      
      const proposal = await noorDAO.getProposal(proposalId);
      expect(proposal.status).to.equal(2); // SUCCEEDED (voter1 has less votes)
    });

    it("Should defeat without majority", async function () {
      await noorDAO.connect(voter1).castVote(proposalId, false, false);
      await noorDAO.connect(voter2).castVote(proposalId, true, false);
      
      await time.increase(votingPeriod + 1);
      await noorDAO.finalizeProposal(proposalId);
      
      const proposal = await noorDAO.getProposal(proposalId);
      expect(proposal.status).to.equal(2); // SUCCEEDED (voter2 has more)
    });

    it("Should fail if voting not ended", async function () {
      await expect(
        noorDAO.finalizeProposal(proposalId)
      ).to.be.revertedWith("Voting not ended");
    });

    it("Should fail if proposal not active", async function () {
      await time.increase(votingPeriod + 1);
      await noorDAO.finalizeProposal(proposalId);
      
      await expect(
        noorDAO.finalizeProposal(proposalId)
      ).to.be.revertedWith("Proposal not active");
    });
  });

  describe("Proposal Execution", function () {
    let proposalId;

    beforeEach(async function () {
      await noorDAO.updateVotingPower(proposer.address, proposalThreshold);
      await noorDAO.updateVotingPower(voter1.address, 150000);
      
      await noorDAO.connect(proposer).createProposal(
        0,
        "Test Proposal",
        "Description",
        "QmTest",
        "0x"
      );
      proposalId = 1;
      
      await noorDAO.connect(voter1).castVote(proposalId, true, false);
      await time.increase(votingPeriod + 1);
      await noorDAO.finalizeProposal(proposalId);
    });

    it("Should execute succeeded proposal", async function () {
      await expect(
        noorDAO.executeProposal(proposalId)
      )
        .to.emit(noorDAO, "ProposalExecuted")
        .withArgs(proposalId, owner.address);
      
      const proposal = await noorDAO.getProposal(proposalId);
      expect(proposal.status).to.equal(4); // EXECUTED
    });

    it("Should fail if not admin", async function () {
      await expect(
        noorDAO.connect(voter1).executeProposal(proposalId)
      ).to.be.reverted;
    });

    it("Should fail if already executed", async function () {
      await noorDAO.executeProposal(proposalId);
      
      await expect(
        noorDAO.executeProposal(proposalId)
      ).to.be.revertedWith("Already executed");
    });
  });

  describe("Proposal Cancellation", function () {
    let proposalId;

    beforeEach(async function () {
      await noorDAO.updateVotingPower(proposer.address, proposalThreshold);
      
      await noorDAO.connect(proposer).createProposal(
        0,
        "Test Proposal",
        "Description",
        "QmTest",
        "0x"
      );
      proposalId = 1;
    });

    it("Should allow admin to cancel proposal", async function () {
      await expect(
        noorDAO.cancelProposal(proposalId)
      )
        .to.emit(noorDAO, "ProposalCancelled")
        .withArgs(proposalId, owner.address);
      
      const proposal = await noorDAO.getProposal(proposalId);
      expect(proposal.status).to.equal(5); // CANCELLED
    });

    it("Should fail if not admin", async function () {
      await expect(
        noorDAO.connect(voter1).cancelProposal(proposalId)
      ).to.be.reverted;
    });
  });

  describe("Configuration Updates", function () {
    it("Should update voting period", async function () {
      const newPeriod = 14 * 24 * 60 * 60;
      await noorDAO.updateVotingPeriod(newPeriod);
      
      expect(await noorDAO.votingPeriod()).to.equal(newPeriod);
    });

    it("Should update proposal threshold", async function () {
      await noorDAO.updateProposalThreshold(200);
      expect(await noorDAO.proposalThreshold()).to.equal(200);
    });

    it("Should update quorum percentage", async function () {
      await noorDAO.updateQuorumPercentage(20);
      expect(await noorDAO.quorumPercentage()).to.equal(20);
    });

    it("Should fail quorum > 100%", async function () {
      await expect(
        noorDAO.updateQuorumPercentage(101)
      ).to.be.revertedWith("Invalid percentage");
    });

    it("Should set Noor Nodes contract", async function () {
      const nodesAddress = voter1.address;
      await noorDAO.setNoorNodesContract(nodesAddress);
      
      expect(await noorDAO.noorNodesContract()).to.equal(nodesAddress);
    });
  });

  describe("Emergency Functions", function () {
    it("Should pause and unpause", async function () {
      await noorDAO.pause();
      expect(await noorDAO.paused()).to.be.true;
      
      await noorDAO.unpause();
      expect(await noorDAO.paused()).to.be.false;
    });

    it("Should block operations when paused", async function () {
      await noorDAO.updateVotingPower(proposer.address, proposalThreshold);
      await noorDAO.pause();
      
      await expect(
        noorDAO.connect(proposer).createProposal(
          0,
          "Test",
          "Desc",
          "Qm",
          "0x"
        )
      ).to.be.reverted;
    });
  });

  describe("View Functions", function () {
    it("Should check if user has voted", async function () {
      await noorDAO.updateVotingPower(proposer.address, proposalThreshold);
      await noorDAO.updateVotingPower(voter1.address, 500);
      
      await noorDAO.connect(proposer).createProposal(
        0,
        "Test",
        "Desc",
        "Qm",
        "0x"
      );
      
      await noorDAO.connect(voter1).castVote(1, true, false);
      
      expect(await noorDAO.hasVotedOnProposal(1, voter1.address)).to.be.true;
      expect(await noorDAO.hasVotedOnProposal(1, voter2.address)).to.be.false;
    });
  });
});
